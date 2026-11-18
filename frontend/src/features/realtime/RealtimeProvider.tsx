import { useEffect, useRef, type PropsWithChildren } from 'react';
import { AppState } from 'react-native';
import { io, type Socket } from 'socket.io-client';

import { getAuthToken } from '@/data/api/client';
import { useAuth } from '@/features/auth/AuthContext';

type EventData = {
  'venue.application_submitted': { venueId: number; status: 'pending' };
  'venue.review_changed': { venueId: number; status: 'approved' | 'rejected' | 'suspended' };
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

export type RealtimeEventName = keyof EventData;
export type RealtimeEnvelope<K extends RealtimeEventName = RealtimeEventName> = {
  eventId: string;
  event: K;
  schemaVersion: 1;
  occurredAt: string;
  data: EventData[K];
};

type ServerEvents = {
  [K in RealtimeEventName]: (envelope: RealtimeEnvelope<K>) => void;
};
type Subscription = { venueId: number; date: string };
type SubscriptionAck = (result: { ok: boolean; message?: string }) => void;
type ClientEvents = {
  'schedule.subscribe': (input: Subscription, ack?: SubscriptionAck) => void;
  'schedule.unsubscribe': (input: Subscription, ack?: SubscriptionAck) => void;
};

let socket: Socket<ServerEvents, ClientEvents> | null = null;
let socketToken: string | null = null;

function realtimeUrl() {
  const apiUrl = process.env.EXPO_PUBLIC_API_URL;
  if (!apiUrl) throw new Error('Chưa cấu hình EXPO_PUBLIC_API_URL.');
  return `${apiUrl.replace(/\/+$/, '').replace(/\/api$/, '')}/realtime`;
}

function getSocket() {
  socket ??= io(realtimeUrl(), { autoConnect: false });
  return socket;
}

function connect(token: string) {
  const current = getSocket();
  if (socketToken !== token) {
    socketToken = token;
    current.auth = { token };
    if (current.connected) current.disconnect();
  }
  if (!current.connected) current.connect();
}

function disconnect() {
  socketToken = null;
  if (socket) {
    socket.auth = {};
    socket.disconnect();
  }
}

export function RealtimeProvider({ children }: PropsWithChildren) {
  const { refreshMe, status, user } = useAuth();
  const userId = user?.id;

  useEffect(() => {
    const token = getAuthToken();
    if (status !== 'signedIn' || !userId || !token) {
      disconnect();
      return;
    }
    connect(token);
    const current = getSocket();
    const handleAuthError = (error: Error) => {
      if (error.message === 'unauthorized') void refreshMe().catch(() => undefined);
    };
    current.on('connect_error', handleAuthError);
    return () => {
      current.off('connect_error', handleAuthError);
      disconnect();
    };
  }, [refreshMe, status, userId]);

  return children;
}

export function useRealtimeRefresh(
  events: readonly RealtimeEventName[],
  refresh: () => void,
  enabled = true,
  foreground = true,
) {
  const refreshRef = useRef(refresh);
  const eventKey = events.join('|');

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!enabled) return;
    const current = getSocket();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = () => {
      clearTimeout(timer);
      timer = setTimeout(() => refreshRef.current(), 150);
    };
    const selectedEvents = eventKey.split('|').filter(Boolean) as RealtimeEventName[];
    for (const event of selectedEvents) current.on(event, scheduleRefresh);
    current.on('connect', scheduleRefresh);
    const appStateSubscription = foreground
      ? AppState.addEventListener('change', (nextState) => {
          if (nextState !== 'active') return;
          if (!current.connected && socketToken) current.connect();
          scheduleRefresh();
        })
      : null;
    return () => {
      clearTimeout(timer);
      for (const event of selectedEvents) current.off(event, scheduleRefresh);
      current.off('connect', scheduleRefresh);
      appStateSubscription?.remove();
    };
  }, [enabled, eventKey, foreground]);
}

const scheduleEvents: RealtimeEventName[] = [
  'slot.hold_changed',
  'booking.checkout_created',
  'booking.status_changed',
  'schedule.changed',
];

export function useScheduleSubscription(
  venueId: number | undefined,
  date: string,
  refresh: () => void,
  enabled = true,
) {
  const refreshRef = useRef(refresh);

  useEffect(() => {
    refreshRef.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!enabled || !venueId || !date) return;
    const current = getSocket();
    const subscription = { venueId, date };
    let timer: ReturnType<typeof setTimeout> | undefined;
    const scheduleRefresh = (envelope?: RealtimeEnvelope) => {
      if (
        envelope &&
        ('venueId' in envelope.data && envelope.data.venueId !== venueId ||
          'bookingDate' in envelope.data && envelope.data.bookingDate !== date)
      ) return;
      clearTimeout(timer);
      timer = setTimeout(() => refreshRef.current(), 150);
    };
    const subscribe = () => {
      current.emit('schedule.subscribe', subscription);
      scheduleRefresh();
    };
    for (const event of scheduleEvents) current.on(event, scheduleRefresh);
    current.on('connect', subscribe);
    if (current.connected) subscribe();
    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (nextState !== 'active') return;
      if (current.connected) subscribe();
      else if (socketToken) current.connect();
      scheduleRefresh();
    });
    return () => {
      clearTimeout(timer);
      if (current.connected) current.emit('schedule.unsubscribe', subscription);
      for (const event of scheduleEvents) current.off(event, scheduleRefresh);
      current.off('connect', subscribe);
      appStateSubscription.remove();
    };
  }, [date, enabled, venueId]);
}
