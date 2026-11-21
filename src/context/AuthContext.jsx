import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { authApi } from '../services/api.js';

const AuthContext = createContext({
  admin: null,
  loading: true,
  needsSetup: false,
  login: async () => {},
  claimAdmin: async () => {},
  logout: async () => {},
  refreshAuth: async () => {},
});

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshAuth = useCallback(async () => {
    setLoading(true);
    try {
      const [setupRes, meRes] = await Promise.allSettled([
        authApi.getSetupStatus(),
        authApi.me(),
      ]);

      if (setupRes.status === 'fulfilled') {
        setNeedsSetup(Boolean(setupRes.value?.needsSetup));
      }
      if (meRes.status === 'fulfilled' && meRes.value?.admin) {
        setAdmin(meRes.value.admin);
      } else {
        setAdmin(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuth();
  }, [refreshAuth]);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    setAdmin(res.admin);
    setNeedsSetup(false);
    return res;
  };

  const claimAdmin = async (payload) => {
    const res = await authApi.claimAdmin(payload);
    setAdmin(res.admin);
    setNeedsSetup(false);
    return res;
  };

  const logout = async () => {
    await authApi.logout();
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{ admin, loading, needsSetup, login, claimAdmin, logout, refreshAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
