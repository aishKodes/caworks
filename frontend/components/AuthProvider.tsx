"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  getCurrentUser,
  login as apiLogin,
  logout as apiLogout,
  signup as apiSignup,
  type ApiResult,
  type LoginPayload,
  type SignupPayload,
  type UserSummary
} from "@/lib/api";

type AuthStatus = "loading" | "authenticated" | "guest" | "unknown";

type AuthContextValue = {
  user: UserSummary | null;
  status: AuthStatus;
  isLoading: boolean;
  isAuthenticated: boolean;
  connectionMessage: string;
  refreshUser: () => Promise<ApiResult<UserSummary>>;
  login: (payload: LoginPayload) => ReturnType<typeof apiLogin>;
  signup: (payload: SignupPayload) => ReturnType<typeof apiSignup>;
  logout: () => Promise<ApiResult>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [connectionMessage, setConnectionMessage] = useState("");

  const applyCurrentUser = useCallback((result: ApiResult<UserSummary>) => {
    if (result.ok && result.data) {
      setUser(result.data);
      setStatus("authenticated");
      setConnectionMessage("");
    } else if (result.status === 401) {
      setUser(null);
      setStatus("guest");
      setConnectionMessage("");
    } else {
      setStatus("unknown");
      setConnectionMessage(result.message || "We could not confirm your login. Please try again.");
    }
    return result;
  }, []);

  const refresh = useCallback(async () => applyCurrentUser(await getCurrentUser()), [applyCurrentUser]);

  useEffect(() => {
    void getCurrentUser().then(applyCurrentUser);
  }, [applyCurrentUser]);

  const login = useCallback(async (payload: LoginPayload) => {
    const result = await apiLogin(payload);
    if (result.ok && result.data?.user) {
      setUser(result.data.user);
      setStatus("authenticated");
      setConnectionMessage("");
    }
    return result;
  }, []);

  const signup = useCallback(async (payload: SignupPayload) => {
    const result = await apiSignup(payload);
    if (result.ok && result.data?.user) {
      setUser(result.data.user);
      setStatus("authenticated");
      setConnectionMessage("");
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    const result = await apiLogout();
    setUser(null);
    setStatus("guest");
    setConnectionMessage("");
    return result;
  }, []);

  const value = useMemo<AuthContextValue>(() => ({
    user,
    status,
    isLoading: status === "loading",
    isAuthenticated: status === "authenticated",
    connectionMessage,
    refreshUser: refresh,
    login,
    signup,
    logout
  }), [user, status, connectionMessage, refresh, login, signup, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }
  return value;
}
