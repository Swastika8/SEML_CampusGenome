import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, readStored } from '../lib/api';
const AuthContext = createContext();
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => readStored('campus_token'));
  const [loading, setLoading] = useState(true);
  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    for (const storage of [localStorage, sessionStorage]) {
      storage.removeItem('campus_token');
      storage.removeItem('campus_user');
    }
  }, []);
  const refreshUser = useCallback(async () => {
    if (!readStored('campus_token')) return;
    try {
      const data = await api('/auth/me');
      setUser(data.user);
    } catch (error) {
      if (error.status === 401) logout();
    }
  }, [logout]);
  useEffect(() => {
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);
  async function authenticate(path, body, remember = false) {
    const data = await api(path, { method: 'POST', body, token: null });
    logout();
    (remember ? localStorage : sessionStorage).setItem('campus_token', data.token);
    setToken(data.token);
    setUser(data.user);
    return data.user;
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user,
        logout,
        refreshUser,
        login: (identifier, password, remember) =>
          authenticate('/auth/login', { loginIdentifier: identifier, password }, remember),
        register: (body) => authenticate('/auth/register', body),
        demoLogin: () => authenticate('/auth/demo', {}),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
