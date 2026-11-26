import test from 'node:test';
import assert from 'node:assert/strict';
import {
  focusStorageKey,
  formatFocusTime,
  loadFocusTimer,
  newFocusTimer,
  normalizeFocusTimer,
  pauseFocusTimer,
  persistFocusTimer,
  remainingFocusMs,
  startFocusTimer,
} from '../src/lib/focusTimer.js';

test('focus uses a wall-clock deadline and continues accurately after reload', () => {
  const running = startFocusTimer(newFocusTimer(5, 'Practice joins'), 1000000);
  assert.equal(remainingFocusMs(running, 1060000), 240000);
  const restored = normalizeFocusTimer(JSON.parse(JSON.stringify(running)), 1090000);
  assert.equal(restored.status, 'running');
  assert.equal(restored.endAt, 1300000);
  assert.equal(remainingFocusMs(restored, 1090000), 210000);
  assert.equal(restored.goal, 'Practice joins');
});

test('paused time does not elapse and resuming preserves the remaining duration', () => {
  const paused = pauseFocusTimer(startFocusTimer(newFocusTimer(5), 1000000), 1060000);
  assert.equal(paused.status, 'paused');
  assert.equal(remainingFocusMs(paused, 2000000), 240000);
  assert.equal(startFocusTimer(paused, 2000000).endAt, 2240000);
});

test('running snapshots round-trip unchanged across tabs with different read times', () => {
  const running = startFocusTimer(newFocusTimer(5, 'One shared session'), 1000000);
  const firstTab = normalizeFocusTimer(running, 1001000);
  const secondTab = normalizeFocusTimer(firstTab, 1045000);
  assert.deepEqual(secondTab, firstTab);
  assert.equal(remainingFocusMs(secondTab, 1045000), 255000);
});

test('expired running sessions restore as complete and can start a full new session', () => {
  const complete = normalizeFocusTimer(startFocusTimer(newFocusTimer(5), 1000000), 1400000);
  assert.equal(complete.status, 'complete');
  assert.equal(complete.remainingMs, 0);
  assert.equal(startFocusTimer(complete, 2000000).endAt, 2300000);
  assert.equal(
    pauseFocusTimer(startFocusTimer(newFocusTimer(5), 1000000), 1400000).status,
    'complete',
  );
});

test('invalid persisted timers fail safely and goals are bounded', () => {
  for (const value of [
    null,
    [],
    {},
    { ...newFocusTimer(), status: 'other' },
    { ...newFocusTimer(), durationMinutes: 999 },
    { ...newFocusTimer(), remainingMs: -1 },
    { ...newFocusTimer(), goal: {} },
    { ...newFocusTimer(), status: 'running', endAt: 'tomorrow' },
    { ...newFocusTimer(), status: 'running', endAt: 9999999999999 },
  ])
    assert.deepEqual(normalizeFocusTimer(value, 1000000), newFocusTimer());
  assert.equal(newFocusTimer(5, 'a'.repeat(121)).goal.length, 120);
  assert.equal(formatFocusTime(59999), '01:00');
  assert.equal(formatFocusTime(1), '00:01');
  assert.equal(formatFocusTime(0), '00:00');
});

test('focus sessions stay separate by account and guest storage', () => {
  const data = new Map();
  const storage = { getItem: (k) => data.get(k) ?? null, setItem: (k, v) => data.set(k, v) };
  persistFocusTimer(1, startFocusTimer(newFocusTimer(5, 'Private goal'), 1000000), storage);
  assert.equal(loadFocusTimer(1, storage, 1050000).timer.goal, 'Private goal');
  assert.deepEqual(loadFocusTimer(2, storage, 1050000).timer, newFocusTimer());
  assert.deepEqual(loadFocusTimer('guest', storage, 1050000).timer, newFocusTimer());
  assert.notEqual(focusStorageKey(1), focusStorageKey('guest'));
});

test('corrupt and inaccessible storage cannot crash the focus page', () => {
  assert.ok(loadFocusTimer(1, { getItem: () => '{broken' }).error);
  const blocked = {
    getItem() {
      throw new Error('blocked');
    },
    setItem() {
      throw new Error('quota');
    },
  };
  assert.ok(loadFocusTimer(1, blocked).error);
  assert.ok(persistFocusTimer(1, newFocusTimer(), blocked));
});
