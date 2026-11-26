import { useCallback, useSyncExternalStore } from 'react';
import {
  readDraftRescueSnapshot,
  subscribeDraftRescue,
  setDraftRescueEnabled,
  clearContributionDraft,
  clearContributionDraftIfUnchanged,
  saveContributionDraft,
} from '../lib/draftRescue';

// Callers pass null until authentication initialization resolves. The store never
// accesses browser storage for a guest or unresolved account.
export function useDraftRescue(userId) {
  const getSnapshot = useCallback(() => readDraftRescueSnapshot(userId), [userId]);
  const snapshot = useSyncExternalStore(subscribeDraftRescue, getSnapshot, getSnapshot);
  const toggleEnabled = useCallback((enabled) => setDraftRescueEnabled(userId, enabled), [userId]);
  const clear = useCallback(() => clearContributionDraft(userId), [userId]);
  const clearIfUnchanged = useCallback(
    (expectedDraft) => clearContributionDraftIfUnchanged(userId, expectedDraft),
    [userId],
  );
  const save = useCallback((form) => saveContributionDraft(userId, form), [userId]);
  return { ...snapshot, toggleEnabled, clear, clearIfUnchanged, save };
}
