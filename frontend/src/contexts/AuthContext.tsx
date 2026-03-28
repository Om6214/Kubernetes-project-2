import React, { createContext, useContext, useMemo, useState } from 'react';

import { login as loginApi, signup as signupApi } from '../api/auth';
import type { AuthResponse } from '../types/auth';

type AuthContextValue = {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const tokenStorageKey = import.meta.env.VITE_TOKEN_STORAGE_KEY ?? 'event_app_token';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(tokenStorageKey);
    } catch {
      return null;
    }
  });

  async function applyAuth(response: AuthResponse) {
    const nextToken = response?.token ?? null;
    setToken(nextToken);
    try {
      if (nextToken) localStorage.setItem(tokenStorageKey, nextToken);
      else localStorage.removeItem(tokenStorageKey);
    } catch {
      // ignore
    }
  }

  async function login(email: string, password: string) {
    const response = await loginApi({ email, password });
    await applyAuth(response);
  }

  async function signup(name: string, email: string, password: string) {
    const response = await signupApi({ name, email, password });
    await applyAuth(response);
  }

  function logout() {
    setToken(null);
    try {
      localStorage.removeItem(tokenStorageKey);
    } catch {
      // ignore
    }
  }

  const value = useMemo<AuthContextValue>(
    () => ({ token, login, signup, logout }),
    [token],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
