const STORAGE_PREFIX = 'campus.draft-rescue.v1:user:';
const MAX_RECORD_LENGTH = 30000;
const categories = new Set([
  'Discussion',
  'Academics',
  'Career',
  'Communities',
  'Events',
  'Lifestyle',
]);
const fieldLimits = Object.freeze({
  title: 255,
  description: 10000,
  department: 255,
  year: 255,
  subject: 255,
  eventDate: 255,
  eventTime: 255,
  eventLocation: 255,
  location: 255,
  company: 255,
  companyRole: 255,
  applyLink: 2048,
  imageUrl: 2048,
  nextMeeting: 255,
  communitySlug: 40,
  postKind: 20,
  linkUrl: 2048,
});

function accountId(value) {
  if (typeof value !== 'number' && typeof value !== 'string') return null;
  if (!/^[1-9]\d*$/.test(String(value))) return null;
  const id = Number(value);
  return Number.isSafeInteger(id) && id > 0 ? String(id) : null;
}

export function emptyContributionForm(category = 'Academics') {
  return Object.fromEntries([
    ['category', categories.has(category) ? category : 'Academics'],
    ...Object.keys(fieldLimits).map((name) => [name, '']),
  ]);
}

function validateForm(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  if (!categories.has(value.category)) return null;
  const form = emptyContributionForm(value.category);
  for (const [name, limit] of Object.entries(fieldLimits)) {
    if (!Object.hasOwn(value, name)) continue;
    if (typeof value[name] !== 'string' || value[name].length > limit) return null;
    form[name] = value[name];
  }
  return form;
}

const hasContent = (form) =>
  Object.keys(fieldLimits).some(
    (name) => name !== 'communitySlug' && name !== 'postKind' && form[name].trim(),
  );
const unavailable = 'This device could not keep your draft. Your current form is still here.';
const unreadable = 'The saved draft could not be read. Clear it in Campus Labs to start fresh.';
const offSnapshot = Object.freeze({
  enabled: false,
  draft: null,
  hasDraft: false,
  updatedAt: null,
  storageError: '',
});

// One record per account keeps disabling and deleting its private content atomic.
// The factory makes storage failures and account isolation testable without a browser.
export function createDraftRescueStore(storageProvider = () => globalThis.localStorage) {
  const errors = new Map();
  const cache = new Map();
  const listeners = new Set();
  const storage = () => {
    const value = typeof storageProvider === 'function' ? storageProvider() : storageProvider;
    if (!value) throw new Error('Storage unavailable');
    return value;
  };
  const emit = () => listeners.forEach((listener) => listener());
  const key = (id) => STORAGE_PREFIX + id;

  function readSnapshot(userId) {
    const id = accountId(userId);
    if (!id) return offSnapshot;
    let raw = null;
    let readError = '';
    try {
      raw = storage().getItem(key(id));
    } catch {
      readError = unavailable;
    }
    const accessError = readError;
    const operationError = errors.get(id) || '';
    const old = cache.get(id);
    if (
      old?.raw === raw &&
      old?.accessError === accessError &&
      old?.operationError === operationError
    )
      return old.snapshot;
    let enabled = false;
    let draft = null;
    if (raw !== null && !readError) {
      try {
        if (typeof raw !== 'string' || raw.length > MAX_RECORD_LENGTH) throw new Error('Size');
        const record = JSON.parse(raw);
        if (!record || record.version !== 1 || record.enabled !== true) throw new Error('Version');
        enabled = true;
        if (record.draft !== null) {
          const form = validateForm(record.draft?.form);
          const updatedAt = record.draft?.updatedAt;
          if (!form || !hasContent(form) || !Number.isSafeInteger(updatedAt) || updatedAt <= 0)
            throw new Error('Draft');
          draft = Object.freeze({ form: Object.freeze(form), updatedAt });
        }
      } catch {
        enabled = false;
        draft = null;
        readError = unreadable;
      }
    }
    const snapshot = Object.freeze({
      enabled,
      draft,
      hasDraft: !!draft,
      updatedAt: draft?.updatedAt || null,
      storageError: readError || operationError,
    });
    cache.set(id, { raw, accessError, operationError, snapshot });
    return snapshot;
  }

  function write(userId, record) {
    const id = accountId(userId);
    if (!id) return false;
    try {
      if (record === null) storage().removeItem(key(id));
      else {
        const raw = JSON.stringify(record);
        if (raw.length > MAX_RECORD_LENGTH) throw new Error('Size');
        storage().setItem(key(id), raw);
      }
      errors.delete(id);
      cache.delete(id);
      emit();
      return true;
    } catch {
      errors.set(id, unavailable);
      cache.delete(id);
      emit();
      return false;
    }
  }

  function setEnabled(userId, enabled) {
    if (typeof enabled !== 'boolean' || !accountId(userId)) return false;
    if (!enabled) return write(userId, null);
    const previous = readSnapshot(userId);
    return write(userId, { version: 1, enabled: true, draft: previous.draft });
  }

  function clear(userId) {
    const id = accountId(userId);
    if (!id) return false;
    const previous = readSnapshot(id);
    return write(id, previous.enabled ? { version: 1, enabled: true, draft: null } : null);
  }

  function clearIfUnchanged(userId, expectedDraft) {
    const id = accountId(userId);
    if (!id) return 'disabled';
    const current = readSnapshot(id);
    if (!current.enabled) return current.storageError ? 'failed' : 'disabled';
    if (!current.draft) return 'cleared';
    const expectedForm = validateForm(expectedDraft?.form);
    // An API request can outlive another tab's edits. A date alone is not a
    // revision: two distinct forms can be saved within the same millisecond.
    if (
      !expectedForm ||
      current.draft.updatedAt !== expectedDraft.updatedAt ||
      JSON.stringify(current.draft.form) !== JSON.stringify(expectedForm)
    )
      return 'changed';
    return write(id, { version: 1, enabled: true, draft: null }) ? 'cleared' : 'failed';
  }

  function save(userId, value) {
    const id = accountId(userId);
    if (!id || !readSnapshot(id).enabled) return false;
    const form = validateForm(value);
    if (!form) {
      errors.set(id, 'This draft is too large or contains unsupported fields. It was not saved.');
      cache.delete(id);
      emit();
      return false;
    }
    if (!hasContent(form)) return readSnapshot(id).hasDraft ? clear(id) : true;
    return write(id, { version: 1, enabled: true, draft: { form, updatedAt: Date.now() } });
  }

  function subscribe(listener) {
    listeners.add(listener);
    const changed = (event) => {
      if (event.key === null || event.key?.startsWith(STORAGE_PREFIX)) {
        cache.clear();
        emit();
      }
    };
    if (typeof window !== 'undefined') window.addEventListener('storage', changed);
    return () => {
      listeners.delete(listener);
      if (typeof window !== 'undefined') window.removeEventListener('storage', changed);
    };
  }

  return {
    readSnapshot,
    readSettings(userId) {
      const { enabled, hasDraft, updatedAt, storageError } = readSnapshot(userId);
      return { enabled, hasDraft, updatedAt, storageError };
    },
    readDraft: (userId) => readSnapshot(userId).draft,
    setEnabled,
    clear,
    clearIfUnchanged,
    save,
    subscribe,
  };
}

const store = createDraftRescueStore();
export const readDraftSettings = store.readSettings;
export const readContributionDraft = store.readDraft;
export const setDraftRescueEnabled = store.setEnabled;
export const clearContributionDraft = store.clear;
export const clearContributionDraftIfUnchanged = store.clearIfUnchanged;
export const saveContributionDraft = store.save;
export const readDraftRescueSnapshot = store.readSnapshot;
export const subscribeDraftRescue = store.subscribe;
