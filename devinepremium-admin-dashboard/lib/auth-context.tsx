"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  clearAdminSession as clearStoredSession,
  getStoredAdminSession,
  type AdminSession,
} from "./auth";

interface AuthContextType {
  session: AdminSession | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  logout: () => void;
  refreshSession: () => void;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
AuthContext.displayName = "AuthContext";

export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<AdminSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshSession = useCallback(() => {
    const current = getStoredAdminSession();
    setSession(current);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
    router.replace("/login");
  }, [router]);

  const value = useMemo<AuthContextType>(
    () => ({
      session,
      isAuthenticated: Boolean(session?.token),
      isLoading,
      logout,
      refreshSession,
    }),
    [session, isLoading, logout, refreshSession],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
