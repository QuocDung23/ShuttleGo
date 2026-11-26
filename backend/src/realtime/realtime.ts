import { randomUUID } from 'node:crypto';
import type { Server as HttpServer } from 'node:http';
import { Server, type Namespace, type Socket } from 'socket.io';
import { z } from 'zod';
import { JWT_SECRET } from '@/config/auth.js';
import { NotificationType, UserRole, UserStatus, VenueStatus } from '@/common/enums.js';
import { verifyAuthToken } from '@/common/jwt.js';
import { AppDataSource } from '@/database/data-source.js';
import { User } from '@/modules/users/user.entity.js';
import { Venue } from '@/modules/venues/venue.entity.js';

export type RealtimeEventData = {
  'notification.created': {
    id: number;
    type: NotificationType;
    title: string;
    body: string;
    bookingId: number | null;
    isRead: boolean;
    createdAt: string;
  };
  'venue.application_submitted': { venueId: number; status: 'pending' };
  'venue.review_changed': {
    venueId: number;
    status: 'approved' | 'rejected' | 'suspended';
  };
  'owner.venue_approved': { venueId: number; status: 'approved' };
  'owner.venue_reviewed': { venueId: number; status: 'rejected' | 'suspended' };
  'slot.hold_changed': {
    venueId: number;
    courtId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    action: 'held' | 'moved' | 'released' | 'expired';
    expiresAt?: string;
  };
  'booking.checkout_created': {
    bookingId: number;
    venueId: number;
    courtId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
  };
  'booking.payment_reported': {
    bookingId: number;
    venueId: number;
    bookingDate: string;
    status: 'pending';
    paymentStatus: 'pending_verification';
  };
  'booking.status_changed': {
    bookingId: number;
    venueId: number;
    courtId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    status: 'confirmed' | 'cancelled';
  };
  'schedule.changed': {
    venueId: number;
    courtId: number;
    bookingDate: string;
    startTime: string;
    endTime: string;
    reason: 'checkout_created' | 'booking_cancelled' | 'hold_expired';
  };
};

export type RealtimeEventName = keyof RealtimeEventData;

export type RealtimeEnvelope<K extends RealtimeEventName = RealtimeEventName> = {
  eventId: string;
  event: K;
  schemaVersion: 1;
  occurredAt: string;
  data: RealtimeEventData[K];
};

type SocketUser = { userId: number; role: UserRole };
type RealtimeSocket = Socket & { data: SocketUser & { subscribeWindow?: number; subscribeCount?: number } };

const scheduleSubscriptionSchema = z.object({
  venueId: z.number().int().positive(),
  date: z.iso.date(),
});

let namespace: Namespace | null = null;

export const userRoom = (userId: number) => `user:${userId}`;
export const scheduleRoom = (venueId: number, date: string) =>
  `venue:${venueId}:date:${date}`;

export function createEnvelope<K extends RealtimeEventName>(
  event: K,
  data: RealtimeEventData[K],
): RealtimeEnvelope<K> {
  return {
    eventId: randomUUID(),
    event,
    schemaVersion: 1,
    occurredAt: new Date().toISOString(),
    data,
  };
}

function publish<K extends RealtimeEventName>(
  rooms: string | string[],
  event: K,
  data: RealtimeEventData[K],
) {
  if (!namespace) return;
  const targets = [...new Set(Array.isArray(rooms) ? rooms : [rooms])];
  if (targets.length === 0) return;
  const envelope = createEnvelope(event, data);
  const published = namespace.to(targets).emit(event, envelope);
  console.info(
    `Realtime published eventId=${envelope.eventId} event=${event} rooms=${targets.join(',')} ok=${published}`,
  );
}

export const realtime = {
  targets<K extends RealtimeEventName>(rooms: string[], event: K, data: RealtimeEventData[K]) {
    publish(rooms, event, data);
  },
  admins<K extends RealtimeEventName>(event: K, data: RealtimeEventData[K]) {
    publish('role:admin', event, data);
  },
  users<K extends RealtimeEventName>(userIds: number[], event: K, data: RealtimeEventData[K]) {
    publish(userIds.map(userRoom), event, data);
  },
  schedule<K extends RealtimeEventName>(
    venueId: number,
    date: string,
    event: K,
    data: RealtimeEventData[K],
  ) {
    publish(scheduleRoom(venueId, date), event, data);
  },
};

async function authorizeSchedule(socket: RealtimeSocket, venueId: number) {
  const venue = await AppDataSource.getRepository(Venue).findOneBy({ id: venueId });
  if (!venue) return false;
  if (socket.data.role === UserRole.ADMIN) return true;
  if (socket.data.role === UserRole.OWNER) return venue.ownerId === socket.data.userId;
  return venue.status === VenueStatus.APPROVED;
}

function acknowledge(callback: unknown, ok: boolean, message?: string) {
  if (typeof callback === 'function') callback({ ok, ...(message ? { message } : {}) });
}

function withinSubscribeLimit(socket: RealtimeSocket) {
  const now = Date.now();
  if (!socket.data.subscribeWindow || now - socket.data.subscribeWindow >= 10_000) {
    socket.data.subscribeWindow = now;
    socket.data.subscribeCount = 0;
  }
  socket.data.subscribeCount = (socket.data.subscribeCount ?? 0) + 1;
  return socket.data.subscribeCount <= 20;
}

export function attachRealtimeServer(server: HttpServer) {
  const allowedOrigins = process.env.CORS_ORIGIN?.split(',').map((origin) => origin.trim());
  const io = new Server(server, {
    cors: { origin: allowedOrigins ?? true },
  });
  namespace = io.of('/realtime');

  namespace.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      if (typeof token !== 'string') return next(new Error('unauthorized'));
      const payload = verifyAuthToken(token, JWT_SECRET);
      if (!payload) return next(new Error('unauthorized'));
      const user = await AppDataSource.getRepository(User).findOneBy({ id: payload.sub });
      if (!user || user.status !== UserStatus.ACTIVE) return next(new Error('unauthorized'));
      socket.data.userId = user.id;
      socket.data.role = user.role;
      next();
    } catch {
      next(new Error('unauthorized'));
    }
  });

  namespace.on('connection', (rawSocket) => {
    const socket = rawSocket as RealtimeSocket;
    void socket.join(userRoom(socket.data.userId));
    if (socket.data.role === UserRole.ADMIN) void socket.join('role:admin');
    console.info(`Realtime connected user=${socket.data.userId} role=${socket.data.role}`);

    socket.on('schedule.subscribe', async (input, callback) => {
      if (!withinSubscribeLimit(socket)) {
        acknowledge(callback, false, 'Too many subscription attempts');
        return;
      }
      const parsed = scheduleSubscriptionSchema.safeParse(input);
      if (!parsed.success || !(await authorizeSchedule(socket, parsed.data.venueId))) {
        acknowledge(callback, false, 'Schedule access denied');
        return;
      }
      const room = scheduleRoom(parsed.data.venueId, parsed.data.date);
      if (socket.rooms.has(room)) {
        acknowledge(callback, true);
        return;
      }
      const scheduleRooms = [...socket.rooms].filter((room) => room.startsWith('venue:'));
      if (scheduleRooms.length >= 8) {
        acknowledge(callback, false, 'Schedule subscription limit reached');
        return;
      }
      await socket.join(room);
      acknowledge(callback, true);
    });

    socket.on('schedule.unsubscribe', (input, callback) => {
      const parsed = scheduleSubscriptionSchema.safeParse(input);
      if (!parsed.success) {
        acknowledge(callback, false, 'Invalid schedule subscription');
        return;
      }
      void socket.leave(scheduleRoom(parsed.data.venueId, parsed.data.date));
      acknowledge(callback, true);
    });

    socket.on('disconnect', (reason) => {
      console.info(`Realtime disconnected user=${socket.data.userId} reason=${reason}`);
    });
  });

  return io;
}
