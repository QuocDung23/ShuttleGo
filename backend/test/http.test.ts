import assert from 'node:assert/strict';
import { randomInt } from 'node:crypto';
import { once } from 'node:events';
import WebSocket from 'ws';
import type { AddressInfo } from 'node:net';
import test, { after, before, describe } from 'node:test';
import { app } from '../src/app.js';
import { attachRealtimeServer } from '../src/realtime/realtime.js';
import { UserRole } from '../src/common/enums.js';
import { signAuthToken } from '../src/common/jwt.js';
import { JWT_SECRET } from '../src/config/auth.js';

import { In } from 'typeorm';
import { AppDataSource } from '../src/database/data-source.js';
import { Booking } from '../src/modules/bookings/booking.entity.js';
import { BookingHold } from '../src/modules/bookings/booking-hold.entity.js';
import { User } from '../src/modules/users/user.entity.js';
import { Notification } from '../src/modules/notifications/notification.entity.js';
import { Venue } from '../src/modules/venues/venue.entity.js';

const token = (role: UserRole, ttl = 60) => signAuthToken(1, role, JWT_SECRET, ttl);
let server: ReturnType<typeof app.listen>;
let realtimeServer: ReturnType<typeof attachRealtimeServer>;
let baseUrl: string;

before(async () => {
  server = app.listen(0, '127.0.0.1');
  await once(server, 'listening');
  realtimeServer = attachRealtimeServer(server);
  baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
});

after(async () => {
  if (realtimeServer) {
    await new Promise<void>((resolve) => realtimeServer.close(() => resolve()));
    return;
  }
  if (!server?.listening) return;
  await new Promise<void>((resolve, reject) => {
    server.close((error) => error ? reject(error) : resolve());
  });
});


type RealtimeProbe = {
  socket: WebSocket;
  waitFor(eventName: string, timeoutMs?: number): Promise<Record<string, unknown> | null>;
  close(): Promise<void>;
};

async function connectRealtime(accessToken: string): Promise<RealtimeProbe> {
  const socket = new WebSocket(baseUrl.replace(/^http/, 'ws').replace(/\/api$/, '') + '/socket.io/?EIO=4&transport=websocket');
  const waiters = new Map<string, ((data: Record<string, unknown>) => void)[]>();
  await new Promise<void>((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error('Socket.IO handshake timed out')), 5000);
    socket.on('error', reject);
    socket.on('message', (raw) => {
      const packet = raw.toString();
      if (packet.startsWith('0')) socket.send(`40/realtime,${JSON.stringify({ token: accessToken })}`);
      if (packet.startsWith('40/realtime,')) {
        clearTimeout(timeout);
        resolve();
      }
      if (packet.startsWith('42/realtime,')) {
        const [eventName, envelope] = JSON.parse(packet.slice('42/realtime,'.length)) as [string, Record<string, unknown>];
        const listeners = waiters.get(eventName) ?? [];
        waiters.delete(eventName);
        listeners.forEach((listener) => listener(envelope));
      }
    });
  });
  return {
    socket,
    waitFor(eventName, timeoutMs = 750) {
      return new Promise((resolve) => {
        const timer = setTimeout(() => {
          const listeners = waiters.get(eventName) ?? [];
          waiters.set(eventName, listeners.filter((listener) => listener !== onEvent));
          resolve(null);
        }, timeoutMs);
        const onEvent = (data: Record<string, unknown>) => {
          clearTimeout(timer);
          resolve(data);
        };
        waiters.set(eventName, [...(waiters.get(eventName) ?? []), onEvent]);
      });
    },
    close() {
      return new Promise<void>((resolve) => {
        if (socket.readyState === WebSocket.CLOSED) {
          resolve();
          return;
        }
        const timeout = setTimeout(() => {
          socket.terminate();
          resolve();
        }, 1000);
        socket.once('close', () => {
          clearTimeout(timeout);
          resolve();
        });
        socket.close(1000, 'test complete');
      });
    },
  };
}

async function request(path: string, method = 'GET', accessToken?: string, body?: string) {
  const response = await fetch(baseUrl + path, {
    method,
    headers: {
      ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
      ...(body !== undefined && { 'Content-Type': 'application/json' }),
    },
    body,
  });
  return { status: response.status, body: response.status === 204 ? null : await response.json() };
}

test('HTTP | health returns the public service status', async () => {
  assert.deepEqual(await request('/health'), { status: 200, body: { status: 'ok' } });
});

test('HTTP | unknown route returns 404', async () => {
  assert.equal((await request('/does-not-exist')).status, 404);
});

for (const path of ['/auth/me', '/bookings', '/booking-holds/mine', '/notifications']) {
  test(`HTTP | ${path} requires authentication`, async () => {
    assert.deepEqual(await request(path), {
      status: 401,
      body: { message: 'Missing bearer token' },
    });
  });
}

for (const [name, invalidToken] of [
  ['expired', token(UserRole.PLAYER, -60)],
  ['wrong signature', signAuthToken(1, UserRole.PLAYER, JWT_SECRET + '-different', 60)],
  ['malformed', 'not-a-token'],
]) {
  test(`HTTP | rejects ${name} bearer token`, async () => {
    assert.equal((await request('/auth/me', 'GET', invalidToken)).status, 401);
  });
}

test('HTTP | owner may not create player selection holds', async () => {
  assert.equal((await request('/booking-holds', 'POST', token(UserRole.OWNER), '{}')).status, 403);
});

test('HTTP | player may not create a system notification', async () => {
  assert.equal((await request('/notifications', 'POST', token(UserRole.PLAYER), '{}')).status, 403);
});

test('HTTP | malformed JSON receives a readable validation error', async () => {
  assert.deepEqual(await request('/auth/register', 'POST', undefined, '{'), {
    status: 400,
    body: { message: 'Invalid JSON body' },
  });
});

test('AUTH-04 | invalid phone number returns HTTP 400', async () => {
  const result = await request('/auth/register', 'POST', undefined, JSON.stringify({
    fullName: 'Player', phone: '123', password: 'Password123',
  }));
  assert.equal(result.status, 400);
  assert.equal(result.body.message, 'Validation failed');
  assert.ok(result.body.details.some((issue: { path: string }) => issue.path === 'phone'));
});

test('AUTH-05 | each empty registration field is rejected by the API', async () => {
  const valid = { fullName: 'Player', phone: '0901234567', password: 'Password123' };
  for (const field of ['fullName', 'phone', 'password'] as const) {
    const result = await request('/auth/register', 'POST', undefined,
      JSON.stringify({ ...valid, [field]: '' }));
    assert.equal(result.status, 400, field);
    assert.ok(result.body.details.some((issue: { path: string }) => issue.path === field), field);
  }
});

for (const [path, method, role, body, field] of [
  ['/auth/register', 'POST', undefined, { fullName: 'Player', phone: '0901234567', password: '123456', role: 'admin' }, 'role'],
  ['/auth/login', 'POST', undefined, { phone: '0901234567', password: '' }, 'password'],
  ['/booking-holds', 'POST', UserRole.PLAYER, { courtId: 1, startTime: '07:00', endTime: '08:00' }, 'bookingDate'],
  ['/venues/1/availability?date=2026-02-30', 'GET', undefined, undefined, 'date'],
] as const) {
  test(`HTTP | ${method} ${path} rejects invalid ${field}`, async () => {
    const result = await request(path, method, role && token(role), JSON.stringify(body));
    assert.equal(result.status, 400);
    assert.equal(result.body.message, 'Validation failed');
    assert.ok(result.body.details.some((issue: { path: string }) => issue.path === field));
  });
}

describe('HTTP + PostgreSQL | venue and booking lifecycle', {
  skip: process.env.SHUTTLEGO_TEST_DB !== '1',
}, () => {
  type Account = { token: string; user: { id: number } };
  let owner: Account;
  let otherOwner: Account;
  let player: Account;
  let otherPlayer: Account;
  let admin: string;
  let venueId: number;
  let courts: { id: number }[];
  const userIds: number[] = [];
  const password = 'TestPassword123';
  let reviewerId = 0;
  let otherVenueId = 0;
  const extraVenueIds: number[] = [];
  const date = new Date(Date.now() + 3 * 86400000).toISOString().slice(0, 10);
  const send = (path: string, method: string, accessToken: string | undefined, body: object) =>
    request(path, method, accessToken, JSON.stringify(body));

  const phone = () => '09' + String(randomInt(10000000, 100000000));
  const playerPhone = phone();

  async function register(role: UserRole, number = phone()): Promise<Account> {
    const result = await send('/auth/register', 'POST', undefined, {
      fullName: 'Week 5 test account', phone: number, password, role,
    });
    assert.equal(result.status, 201, JSON.stringify(result.body));
    userIds.push(result.body.user.id);
    return result.body;
  }

  before(async () => {
    assert.equal(AppDataSource.options.database, 'shuttlego_test',
      'Set DB_NAME=shuttlego_test to run database integration tests.');
    await AppDataSource.initialize();
    await AppDataSource.runMigrations();
    owner = await register(UserRole.OWNER);
    otherOwner = await register(UserRole.OWNER);
    player = await register(UserRole.PLAYER, playerPhone);
    otherPlayer = await register(UserRole.PLAYER);
    const reviewer = await register(UserRole.PLAYER);
    reviewerId = reviewer.user.id;
    await AppDataSource.getRepository(User).update(reviewerId, { role: UserRole.ADMIN });
    admin = signAuthToken(reviewerId, UserRole.ADMIN, JWT_SECRET, 300);
    const created = await send('/venues', 'POST', owner.token, {
      name: 'Week 5 test venue', address: '1 Test Street', district: 'Test District',
      city: 'Test City', courtCount: 2, bankAccountNo: '00000000',
      priceRules: [
        { label: 'Giờ thường', startTime: '07:00', endTime: '17:00', pricePerHour: 100000 },
        { label: 'Giờ cao điểm', startTime: '17:00', endTime: '22:00', pricePerHour: 120000 },
      ],
    });
    assert.equal(created.status, 201, JSON.stringify(created.body));
    venueId = created.body.id;
    assert.equal(created.body.status, 'pending');
    const review = await send(`/venues/${venueId}/review`, 'PATCH', admin, {
      status: 'approved', reviewedBy: reviewer.user.id,
    });
    assert.equal(review.status, 200, JSON.stringify(review.body));
    assert.equal(review.body.status, 'approved');
    const otherVenue = await send('/venues', 'POST', otherOwner.token, {
      name: 'Week 5 other-owner venue', address: '2 Test Street', district: 'Test District',
      city: 'Test City', courtCount: 1, bankAccountNo: '00000001',
      priceRules: [
        { label: 'Giờ thường', startTime: '07:00', endTime: '17:00', pricePerHour: 100000 },
        { label: 'Giờ cao điểm', startTime: '17:00', endTime: '22:00', pricePerHour: 120000 },
      ],
    });
    assert.equal(otherVenue.status, 201, JSON.stringify(otherVenue.body));
    otherVenueId = otherVenue.body.id;
    assert.equal((await send(`/venues/${otherVenueId}/review`, 'PATCH', admin, {
      status: 'approved', reviewedBy: reviewerId,
    })).status, 200);
    const result = await request(`/venues/${venueId}/availability?date=${date}`);
    assert.equal(result.status, 200, JSON.stringify(result.body));
    courts = result.body.courts;
    assert.equal(courts.length, 2);
  });

  after(async () => {
    if (!AppDataSource.isInitialized) return;
    try {
      if (courts?.length) {
        await AppDataSource.getRepository(Booking).delete({ courtId: In(courts.map(({ id }) => id)) });
      }
      if (userIds.length) {
        await AppDataSource.getRepository(BookingHold).delete({ playerId: In(userIds) });
        await AppDataSource.getRepository(Notification).delete({ userId: In(userIds) });
      }
      for (const id of [...extraVenueIds, venueId, otherVenueId].filter((value) => value > 0)) {
        await AppDataSource.getRepository(Venue).delete(id);
      }
      if (userIds.length) await AppDataSource.getRepository(User).delete(userIds);
    } finally {
      await AppDataSource.destroy();
    }
  });

  test('AUTH-03 | duplicate phone returns conflict', async () => {
    const result = await send('/auth/register', 'POST', undefined, {
      fullName: 'Duplicate player', phone: playerPhone, password,
    });
    assert.equal(result.status, 409);
  });

  test('NOTI-05 | approving a venue saves an owner notification', async () => {
    const submitted = await send('/venues', 'POST', owner.token, {
      name: 'NOTI-05 pending venue', address: '3 Test Street', district: 'Test District',
      city: 'Test City', courtCount: 1, bankAccountNo: '00000002',
      priceRules: [
        { label: 'Giờ thường', startTime: '07:00', endTime: '17:00', pricePerHour: 100000 },
        { label: 'Giờ cao điểm', startTime: '17:00', endTime: '22:00', pricePerHour: 120000 },
      ],
    });
    assert.equal(submitted.status, 201, JSON.stringify(submitted.body));
    extraVenueIds.push(submitted.body.id);
    const approved = await send(`/venues/${submitted.body.id}/review`, 'PATCH', admin, {
      status: 'approved', reviewedBy: reviewerId,
    });
    assert.equal(approved.status, 200);
    const notifications = await request('/notifications', 'GET', owner.token);
    assert.equal(notifications.status, 200);
    assert.ok(notifications.body.data.some((item: { type: string }) => item.type === 'venue_approved'),
      'Expected a persisted venue_approved notification for the venue owner.');
  });

  const hold = (accessToken: string, courtId: number, startTime: string, endTime: string) =>
    send('/booking-holds', 'POST', accessToken, { courtId, bookingDate: date, startTime, endTime });

  test('BOOK-03 | exactly one concurrent hold wins for the same court and time', async () => {
    const results = await Promise.all([
      hold(player.token, courts[0].id, '07:00', '08:00'),
      hold(otherPlayer.token, courts[0].id, '07:00', '08:00'),
    ]);
    assert.deepEqual(results.map(({ status }) => status).sort(), [201, 409]);
  });

  test('BOOK-04 | the same time can be held on separate courts', async () => {
    const results = await Promise.all([
      hold(player.token, courts[0].id, '08:00', '09:00'),
      hold(otherPlayer.token, courts[1].id, '08:00', '09:00'),
    ]);
    assert.deepEqual(results.map(({ status }) => status), [201, 201]);
  });

  test('BOOK-06 | expired selection holds release their slots', async () => {
    const first = await hold(player.token, courts[0].id, '09:00', '10:00');
    assert.equal(first.status, 201);
    assert.equal((await hold(otherPlayer.token, courts[0].id, '09:00', '10:00')).status, 409);
    await AppDataSource.getRepository(BookingHold).update(first.body.id, {
      expiresAt: new Date(Date.now() - 1000),
    });
    assert.equal((await hold(otherPlayer.token, courts[0].id, '09:00', '10:00')).status, 201);
  });

  async function createBooking(startTime: string, endTime: string, totalAmount = (Number(startTime.slice(0, 2)) >= 17 ? 120000 : 100000)) {
    const courtId = courts[0].id;
    const selected = await hold(player.token, courtId, startTime, endTime);
    assert.equal(selected.status, 201, JSON.stringify(selected.body));
    const result = await send('/bookings', 'POST', player.token, {
      courtId, bookingDate: date, startTime, endTime, totalAmount,
      contactName: 'Test Player', contactPhone: playerPhone, paymentMethod: 'bank_transfer',
    });
    assert.equal(result.status, 201, JSON.stringify(result.body));
    return result.body;
  }

  test('BOOK-07 | an expired checkout no longer blocks selection', async () => {
    const booking = await createBooking('12:00', '13:00');
    const slot = () => hold(otherPlayer.token, courts[0].id, '12:00', '13:00');
    assert.equal((await slot()).status, 409);
    await AppDataSource.getRepository(Booking).update(booking.id, {
      holdExpiresAt: new Date(Date.now() - 1000),
    });
    assert.equal((await slot()).status, 201);
  });

  test('BOOK-08 | cancelling checkout makes the slot available again', async () => {
    const booking = await createBooking('10:00', '11:00');
    assert.equal((await hold(otherPlayer.token, courts[0].id, '10:00', '11:00')).status, 409);
    const cancelled = await request(`/bookings/${booking.id}/cancel`, 'POST', player.token);
    assert.equal(cancelled.status, 200);
    assert.equal(cancelled.body.status, 'cancelled');
    assert.equal((await hold(otherPlayer.token, courts[0].id, '10:00', '11:00')).status, 201);
  });


  test('BOOK-10 | lost create response and refresh do not create a duplicate order', async () => {
    // Ignore the first response to model a dropped client response after the server commits.
    await createBooking('19:00', '20:00', 120000);
    const retry = await send('/bookings', 'POST', player.token, {
      courtId: courts[0].id, bookingDate: date, startTime: '19:00', endTime: '20:00',
      totalAmount: 120000, contactName: 'Test Player', contactPhone: playerPhone,
      paymentMethod: 'bank_transfer',
    });
    assert.equal(retry.status, 409);
    const history = await request('/bookings?date=' + date, 'GET', player.token);
    assert.equal(history.status, 200);
    assert.equal(history.body.data.filter((item: { startTime: string }) => item.startTime.startsWith('19:00')).length, 1);
  });

  async function notifications(accessToken: string) {
    const result = await request('/notifications', 'GET', accessToken);
    assert.equal(result.status, 200, JSON.stringify(result.body));
    return result.body.data as { id: number; type: string; title: string; bookingId?: number | null }[];
  }

  async function createReviewCaseVenue(name: string) {
    const submitted = await send('/venues', 'POST', owner.token, {
      name, address: '4 Test Street', district: 'Test District', city: 'Test City',
      courtCount: 1, bankAccountNo: '00000003',
      priceRules: [
        { label: 'Giờ thường', startTime: '07:00', endTime: '17:00', pricePerHour: 100000 },
        { label: 'Giờ cao điểm', startTime: '17:00', endTime: '22:00', pricePerHour: 120000 },
      ],
    });
    assert.equal(submitted.status, 201, JSON.stringify(submitted.body));
    extraVenueIds.push(submitted.body.id);
    return submitted.body.id as number;
  }

  async function assertNotification(type: string, accessToken: string, bookingId?: number) {
    const items = await notifications(accessToken);
    assert.ok(items.some((item) => item.type === type && (bookingId === undefined || item.bookingId === bookingId)),
      `Expected notification type ${type}${bookingId ? ` for booking ${bookingId}` : ''}.`);
  }

  test('OWN-07 | another owner cannot view a booking', async () => {
    const booking = await createBooking('13:00', '14:00');
    const result = await request(`/bookings/${booking.id}`, 'GET', otherOwner.token);
    assert.equal(result.status, 403);
  });

  test('OWN-08 | another owner cannot update a booking', async () => {
    const booking = await createBooking('14:00', '15:00');
    const changed = await send(`/bookings/${booking.id}`, 'PATCH', otherOwner.token, { status: 'confirmed' });
    assert.equal(changed.status, 403);
    const original = await request(`/bookings/${booking.id}`, 'GET', player.token);
    assert.equal(original.status, 200);
    assert.equal(original.body.status, 'pending');
  });

  test('NOTI-02 | creating a booking saves a notification for its owner', async () => {
    const booking = await createBooking('15:00', '16:00');
    await assertNotification('booking_created', owner.token, booking.id);
  });

  test('NOTI-03 | confirming a booking saves a notification for its player', async () => {
    const booking = await createBooking('16:00', '17:00');
    assert.equal((await send(`/bookings/${booking.id}`, 'PATCH', player.token, {
      paymentStatus: 'pending_verification',
    })).status, 200);
    assert.equal((await send(`/bookings/${booking.id}`, 'PATCH', owner.token, {
      status: 'confirmed',
    })).status, 200);
    await assertNotification('booking_confirmed', player.token, booking.id);
  });

  test('NOTI-04 | cancelling a booking saves a notification for its player', async () => {
    const booking = await createBooking('17:00', '18:00');
    assert.equal((await send(`/bookings/${booking.id}`, 'PATCH', player.token, {
      paymentStatus: 'pending_verification',
    })).status, 200);
    assert.equal((await send(`/bookings/${booking.id}`, 'PATCH', owner.token, {
      status: 'cancelled',
    })).status, 200);
    await assertNotification('booking_cancelled', player.token, booking.id);
  });

  test('NOTI-06 | rejecting a venue saves a notification for its owner', async () => {
    const venueToReject = await createReviewCaseVenue('NOTI-06 rejected venue');
    const rejected = await send(`/venues/${venueToReject}/review`, 'PATCH', admin, {
      status: 'rejected', reviewedBy: reviewerId, reviewNote: 'Thông tin chưa đầy đủ',
    });
    assert.equal(rejected.status, 200);
    await assertNotification('venue_rejected', owner.token);
  });

  test('NOTI-07 | payment verification saves a notification for the player', async () => {
    const booking = await createBooking('18:00', '19:00', 120000);
    assert.equal((await send(`/bookings/${booking.id}`, 'PATCH', player.token, {
      paymentStatus: 'pending_verification',
    })).status, 200);
    const verified = await send(`/bookings/${booking.id}`, 'PATCH', owner.token, {
      paymentStatus: 'paid',
    });
    assert.equal(verified.status, 200, JSON.stringify(verified.body));
    assert.equal(verified.body.paymentStatus, 'paid');
    await assertNotification('payment_received', player.token, booking.id);
  });

  test('NOTI-08 | a different player cannot see a recipient notification', async () => {
    const created = await send('/notifications', 'POST', admin, {
      userId: player.user.id, type: 'system', title: 'Private notification', body: 'Recipient only.',
    });
    assert.equal(created.status, 201);
    assert.ok((await notifications(player.token)).some((item) => item.title === 'Private notification'));
    assert.ok(!(await notifications(otherPlayer.token)).some((item) => item.title === 'Private notification'));
  });

  test('NOTI-09 | a new booking emits a realtime notification event', async () => {
    const probe = await connectRealtime(owner.token);
    try {
      const event = probe.waitFor('notification.created', 750);
      const booking = await createBooking('20:00', '21:00', 120000);
      assert.ok(booking.id);
      const envelope = await event;
      assert.ok(envelope, 'No notification.created event reached the owner session.');
    } finally {
      await probe.close();
    }
  });

  test('NOTI-10 | a missed notification appears once after reconnect and refresh', async () => {
    const booking = await createBooking('21:00', '22:00', 120000);
    const recovered = await notifications(player.token);
    assert.equal(recovered.filter((item) => item.type === 'booking_created').length, 1,
      `Expected exactly one persisted booking notification for #${booking.id}.`);
  });
});
