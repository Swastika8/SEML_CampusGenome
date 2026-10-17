import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
const ReadingTrailContext = createContext(null);
function readTrail(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value)
      ? value
          .filter(
            (item) =>
              Number.isInteger(item.id) &&
              item.id > 0 &&
              typeof item.title === 'string' &&
              item.title.length <= 255 &&
              typeof item.category === 'string',
          )
          .slice(0, 6)
      : [];
  } catch {
    return [];
  }
}
export function ReadingTrailProvider({ children }) {
  const { user, loading, token } = useAuth();
  const ready = !loading && (!token || !!user);
  const key = 'campus_reading_trail_' + (user?.id || 'guest');
  const [records, setRecords] = useState({});
  const entries = ready ? records[key] || readTrail(key) : [];
  useEffect(() => {
    if (!Object.hasOwn(records, key)) return;
    try {
      localStorage.setItem(key, JSON.stringify(records[key]));
    } catch {
      /* Keep this visit's trail in memory when storage is unavailable. */
    }
  }, [records, key]);
  const track = useCallback(
    (node) => {
      if (!ready || !Number.isInteger(node.id)) return;
      const item = {
        id: node.id,
        title: node.title,
        category: node.category,
        openedAt: Date.now(),
      };
      setRecords((current) => ({
        ...current,
        [key]: [
          item,
          ...(current[key] || readTrail(key)).filter((previous) => previous.id !== node.id),
        ].slice(0, 6),
      }));
    },
    [key, ready],
  );
  const clear = useCallback(() => setRecords((current) => ({ ...current, [key]: [] })), [key]);
  const discard = useCallback(
    (id) =>
      setRecords((current) => ({
        ...current,
        [key]: (current[key] || readTrail(key)).filter((item) => item.id !== Number(id)),
      })),
    [key],
  );
  return (
    <ReadingTrailContext.Provider value={{ entries, track, clear, discard }}>
      {children}
    </ReadingTrailContext.Provider>
  );
}
export const useReadingTrail = () => useContext(ReadingTrailContext);
