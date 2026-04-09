import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  getProfile,
  login,
  register,
  socialLogin,
} from '../api/rideOffersApi.js';

const STORAGE_KEY = 'neighbourlink.session';
const AuthContext = createContext(null);

function readSessionFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    if (!parsed?.userId) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => readSessionFromStorage());

  function persistSession(nextSession) {
    setSession(nextSession);
    if (nextSession) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  useEffect(() => {
    if (!session?.userId || session.role === 'ADMIN') {
      return undefined;
    }
    let cancelled = false;
    async function validatePersistedSession() {
      try {
        await getProfile(session.userId);
      } catch (error) {
        const status = Number(error?.status);
        if (!cancelled && (status === 401 || status === 403 || status === 404)) {
          persistSession(null);
        }
      }
    }
    validatePersistedSession();
    return () => {
      cancelled = true;
    };
  }, [session?.userId, session?.role]);

  async function loginWithPassword(email, password) {
    const authResponse = await login({ email, password });
    persistSession(authResponse);
    return authResponse;
  }

  async function registerAccount(payload) {
    const authResponse = await register(payload);
    persistSession(authResponse);
    return authResponse;
  }

  async function loginWithSocial(provider, role = 'RIDER') {
    const authResponse = await socialLogin({ provider, role });
    persistSession(authResponse);
    return authResponse;
  }

  function logout() {
    persistSession(null);
  }

  const value = useMemo(() => ({
    session,
    userId: session?.userId || null,
    role: session?.role || null,
    isAuthenticated: Boolean(session?.userId),
    loginWithPassword,
    registerAccount,
    loginWithSocial,
    logout,
  }), [session]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
