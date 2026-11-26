import assert from 'node:assert/strict';
import test from 'node:test';
import { createEnvelope, scheduleRoom, userRoom } from '../src/realtime/realtime.js';

test('realtime events use v1 envelopes and server-owned room names', () => {
  const envelope = createEnvelope('venue.application_submitted', {
    venueId: 12,
    status: 'pending',
  });

  assert.equal(envelope.event, 'venue.application_submitted');
  assert.equal(envelope.schemaVersion, 1);
  assert.deepEqual(envelope.data, { venueId: 12, status: 'pending' });
  assert.match(envelope.eventId, /^[0-9a-f-]{36}$/);
  assert.equal(userRoom(7), 'user:7');
  assert.equal(scheduleRoom(12, '2026-11-19'), 'venue:12:date:2026-11-19');
});
