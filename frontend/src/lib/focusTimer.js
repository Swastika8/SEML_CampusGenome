const MINUTES = [5, 25, 50];
export const focusStorageKey = (owner) => `campus_focus_v1_${owner}`;

export function newFocusTimer(durationMinutes = 25, goal = '') {
  const minutes = MINUTES.includes(durationMinutes) ? durationMinutes : 25;
  return {
    version: 1,
    durationMinutes: minutes,
    remainingMs: minutes * 60000,
    endAt: null,
    status: 'idle',
    goal: typeof goal === 'string' ? goal.slice(0, 120) : '',
  };
}

export function normalizeFocusTimer(value, now = Date.now()) {
  if (
    !value ||
    value.version !== 1 ||
    !MINUTES.includes(value.durationMinutes) ||
    !['idle', 'running', 'paused', 'complete'].includes(value.status) ||
    typeof value.goal !== 'string' ||
    !Number.isFinite(value.remainingMs) ||
    value.remainingMs < 0 ||
    value.remainingMs > value.durationMinutes * 60000
  )
    return newFocusTimer();
  const timer = { ...newFocusTimer(value.durationMinutes, value.goal), status: value.status };
  if (value.status === 'running') {
    if (
      !Number.isSafeInteger(value.endAt) ||
      value.endAt > now + value.durationMinutes * 60000 + 1000
    )
      return newFocusTimer();
    if (value.endAt <= now) return { ...timer, status: 'complete', remainingMs: 0 };
    // The deadline drives the display. Keep the stored duration stable so two
    // open tabs do not rewrite each other's snapshots on every storage event.
    return { ...timer, endAt: value.endAt, remainingMs: value.remainingMs };
  }
  if (value.status === 'complete') return { ...timer, remainingMs: 0 };
  if (value.status === 'paused') return { ...timer, remainingMs: value.remainingMs };
  return timer;
}

export function remainingFocusMs(timer, now = Date.now()) {
  return timer.status === 'running'
    ? Math.min(timer.durationMinutes * 60000, Math.max(0, timer.endAt - now))
    : timer.remainingMs;
}

export function startFocusTimer(timer, now = Date.now()) {
  const remainingMs =
    timer.status === 'complete' || !timer.remainingMs
      ? timer.durationMinutes * 60000
      : timer.remainingMs;
  return { ...timer, status: 'running', remainingMs, endAt: now + remainingMs };
}

export function pauseFocusTimer(timer, now = Date.now()) {
  const remainingMs = remainingFocusMs(timer, now);
  return { ...timer, status: remainingMs ? 'paused' : 'complete', remainingMs, endAt: null };
}

export function formatFocusTime(milliseconds) {
  const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
  return `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`;
}

export function loadFocusTimer(owner, storage, now = Date.now()) {
  try {
    const raw = (storage ?? window.localStorage).getItem(focusStorageKey(owner));
    return { timer: raw ? normalizeFocusTimer(JSON.parse(raw), now) : newFocusTimer(), error: '' };
  } catch {
    return { timer: newFocusTimer(), error: 'This browser could not restore your focus session.' };
  }
}

export function persistFocusTimer(owner, timer, storage) {
  try {
    (storage ?? window.localStorage).setItem(focusStorageKey(owner), JSON.stringify(timer));
    return '';
  } catch {
    return 'The timer works, but this browser cannot save it for later.';
  }
}
