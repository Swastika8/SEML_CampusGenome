import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';
const DataContext = createContext();
export function DataProvider({ children }) {
  const { token, user } = useAuth();
  const [data, setData] = useState({
    nodes: [],
    buildings: [],
    courses: [],
    users: [],
    stats: {},
    health: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const refreshData = useCallback(async () => {
    try {
      const [nodes, buildings, courses, users, stats, health, lifestyle] = await Promise.all([
        api('/nodes?limit=100', { token }),
        api('/buildings'),
        api('/courses'),
        api('/users/leaderboard'),
        api('/stats'),
        api('/health'),
        api('/lifestyle'),
      ]);
      setData({
        nodes: nodes.data,
        buildings: buildings.data,
        courses: courses.data,
        users: users.data,
        stats: stats.data,
        health,
        lifestyle: lifestyle.data,
      });
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [token]);
  useEffect(() => {
    refreshData();
  }, [refreshData]);
  return (
    <DataContext.Provider
      value={{
        ...data,
        loading,
        error,
        refreshData,
        currentUser: user,
        events: data.nodes.filter((n) => n.category === 'Events'),
        career: data.nodes.filter((n) => n.category === 'Career'),
        communities: data.nodes.filter((n) => n.category === 'Communities'),
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
export const useData = () => useContext(DataContext);
