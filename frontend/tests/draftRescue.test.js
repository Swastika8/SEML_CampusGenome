import test from 'node:test';
import assert from 'node:assert/strict';
import { createDraftRescueStore, emptyContributionForm } from '../src/lib/draftRescue.js';

function memoryStorage() {
  const values = new Map();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
    values,
  };
}
const form = (category = 'Academics') => ({
  ...emptyContributionForm(category),
  title: 'A useful unfinished contribution',
  description: 'A draft stays private until I choose to publish it.',
});

test('draft rescue is opt-in and never reads or writes for unresolved/guest IDs', () => {
  let accesses = 0;
  const store = createDraftRescueStore(() => {
    accesses++;
    throw new Error('Storage access');
  });
  for (const id of [null, undefined, '', 0, -1, 'guest', '01', {}, NaN]) {
    assert.equal(store.readSnapshot(id).enabled, false);
    assert.equal(store.save(id, form()), false);
    assert.equal(store.setEnabled(id, true), false);
    assert.equal(store.clear(id), false);
  }
  assert.equal(accesses, 0);
});

test('off mode does not save; explicit opt-in keeps one bounded draft per account', () => {
  const storage = memoryStorage();
  const store = createDraftRescueStore(storage);
  assert.deepEqual(store.readSettings(1), {
    enabled: false,
    hasDraft: false,
    updatedAt: null,
    storageError: '',
  });
  assert.equal(store.save(1, form()), false);
  assert.equal(storage.values.size, 0);
  assert.equal(store.setEnabled(1, true), true);
  assert.equal(store.save(1, form('Career')), true);
  assert.equal(store.save(1, { ...form('Events'), eventDate: '2026-12-10' }), true);
  assert.equal(storage.values.size, 1);
  assert.equal(store.readDraft(1).form.category, 'Events');
  assert.equal(store.readDraft(1).form.eventDate, '2026-12-10');
  assert.equal(store.readDraft(2), null);
  assert.equal(store.readSettings(2).enabled, false);
});

test('all contribution category fields round-trip and blank/category-only forms do not create drafts', () => {
  const storage = memoryStorage();
  const store = createDraftRescueStore(storage);
  store.setEnabled(1, true);
  assert.equal(store.save(1, emptyContributionForm('Events')), true);
  assert.equal(store.readDraft(1), null);
  const full = Object.fromEntries(
    Object.entries(form('Lifestyle')).map(([name, value]) => [
      name,
      name === 'category' ? value : 'Unfinished ' + name,
    ]),
  );
  store.save(1, full);
  assert.deepEqual(store.readDraft(1).form, full);
  store.save(1, emptyContributionForm());
  assert.equal(store.readDraft(1), null);
  assert.equal(store.readSettings(1).enabled, true);
});

test('clearing and disabling affect only the selected account; disabling erases the private draft', () => {
  const storage = memoryStorage();
  const store = createDraftRescueStore(storage);
  for (const id of [1, 2]) {
    store.setEnabled(id, true);
    store.save(id, form());
  }
  assert.equal(store.clear(1), true);
  assert.equal(store.readDraft(1), null);
  assert.equal(store.readSettings(1).enabled, true);
  assert.notEqual(store.readDraft(2), null);
  store.save(1, form());
  assert.equal(store.setEnabled(1, false), true);
  assert.equal(storage.values.has('campus.draft-rescue.v1:user:1'), false);
  assert.notEqual(store.readDraft(2), null);
  assert.equal(store.setEnabled(1, true), true);
  assert.equal(store.readDraft(1), null);
});

test('corrupt, unsupported and oversized stored drafts fail closed without revealing their contents', () => {
  const storage = memoryStorage();
  const store = createDraftRescueStore(storage);
  const key = 'campus.draft-rescue.v1:user:1';
  for (const value of [
    '{not json',
    'x'.repeat(30001),
    JSON.stringify({ version: 2, enabled: true, draft: null }),
    JSON.stringify({
      version: 1,
      enabled: true,
      draft: { form: { category: 'Unknown' }, updatedAt: 1 },
    }),
    JSON.stringify({
      version: 1,
      enabled: true,
      draft: { form: { ...form(), title: {} }, updatedAt: 1 },
    }),
    JSON.stringify({ version: 1, enabled: true, draft: { form: form(), updatedAt: 'yesterday' } }),
  ]) {
    storage.setItem(key, value);
    assert.equal(store.readSnapshot(1).enabled, false);
    assert.equal(store.readDraft(1), null);
    assert.match(store.readSnapshot(1).storageError, /could not be read/);
    assert.equal(store.readSnapshot(1), store.readSnapshot(1));
  }
  assert.equal(store.clear(1), true);
  assert.equal(store.readSnapshot(1).storageError, '');
});

test('blocked storage and quota errors are truthful and do not destroy the last saved draft', () => {
  const storage = memoryStorage();
  const store = createDraftRescueStore(storage);
  store.setEnabled(1, true);
  store.save(1, form());
  const previous = store.readDraft(1);
  const savedSet = storage.setItem;
  storage.setItem = () => {
    throw new Error('QuotaExceededError');
  };
  assert.equal(store.save(1, { ...form(), title: 'New unsaved text' }), false);
  assert.equal(store.readDraft(1).form.title, previous.form.title);
  assert.match(store.readSnapshot(1).storageError, /could not keep/);
  storage.setItem = savedSet;
  assert.equal(store.save(1, form()), true);
  assert.equal(store.readSnapshot(1).storageError, '');
  const blocked = createDraftRescueStore(() => {
    throw new Error('SecurityError');
  });
  assert.equal(blocked.setEnabled(1, true), false);
  assert.equal(blocked.readSettings(1).enabled, false);
  assert.match(blocked.readSettings(1).storageError, /could not keep/);
});

test('external-store snapshots are stable, subscribers observe changes, and saving rejects oversized input', () => {
  const storage = memoryStorage();
  const store = createDraftRescueStore(storage);
  assert.equal(store.readSnapshot(1), store.readSnapshot(1));
  let changes = 0;
  const stop = store.subscribe(() => {
    changes++;
  });
  store.setEnabled(1, true);
  store.save(1, { ...form(), title: 'x'.repeat(256) });
  assert.equal(store.readDraft(1), null);
  assert.match(store.readSnapshot(1).storageError, /too large/);
  assert.equal(changes, 2);
  stop();
  store.save(1, form());
  assert.equal(changes, 2);
  assert.equal(store.readSnapshot(1), store.readSnapshot(1));
});

test('publication cleanup preserves a newer same-account draft even with an identical timestamp', (t) => {
  t.mock.method(Date, 'now', () => 123456789);
  const storage = memoryStorage();
  const firstTab = createDraftRescueStore(storage);
  const secondTab = createDraftRescueStore(storage);
  firstTab.setEnabled(1, true);
  firstTab.save(1, form());
  const submitted = firstTab.readDraft(1);
  secondTab.save(1, { ...form('Events'), title: 'A newer unpublished idea' });
  assert.equal(secondTab.readDraft(1).updatedAt, submitted.updatedAt);
  assert.equal(firstTab.clearIfUnchanged(1, submitted), 'changed');
  assert.equal(firstTab.readDraft(1).form.title, 'A newer unpublished idea');
  const current = firstTab.readDraft(1);
  assert.equal(firstTab.clearIfUnchanged(1, current), 'cleared');
  assert.equal(firstTab.readDraft(1), null);
  assert.equal(firstTab.readSettings(1).enabled, true);
});

test('conditional cleanup never resurrects disabled rescue or erases another account and reports failures', () => {
  const storage = memoryStorage();
  const store = createDraftRescueStore(storage);
  for (const id of [1, 2]) {
    store.setEnabled(id, true);
    store.save(id, form());
  }
  const submitted = store.readDraft(1);
  store.setEnabled(1, false);
  assert.equal(store.clearIfUnchanged(1, submitted), 'disabled');
  assert.equal(storage.values.has('campus.draft-rescue.v1:user:1'), false);
  assert.notEqual(store.readDraft(2), null);
  store.setEnabled(1, true);
  store.save(1, form());
  assert.equal(store.clearIfUnchanged(1, null), 'changed');
  const current = store.readDraft(1);
  storage.setItem = () => {
    throw new Error('QuotaExceededError');
  };
  assert.equal(store.clearIfUnchanged(1, current), 'failed');
  assert.deepEqual(store.readDraft(1), current);
  assert.match(store.readSettings(1).storageError, /could not keep/);
});
