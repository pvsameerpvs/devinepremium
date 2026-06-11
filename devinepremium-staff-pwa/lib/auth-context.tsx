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
import { useSWRConfig } from "swr";
import {
  clearStaffSession as clearStoredSession,
  getStoredStaffSession,
  type StaffSession,
} from "./auth";

interface AuthContextType {
  session: StaffSession | null;
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
  const [session, setSession] = useState<StaffSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { mutate } = useSWRConfig();

  const refreshSession = useCallback(() => {
    const current = getStoredStaffSession();
    setSession(current);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const logout = useCallback(() => {
    clearStoredSession();
    setSession(null);
    mutate(() => true, undefined, { revalidate: false });
    router.replace("/login");
  }, [router, mutate]);

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
