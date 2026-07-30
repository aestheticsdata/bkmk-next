"use client";

import { createContext, useContext, useState } from "react";

import type { AuthUser } from "@src/schemas/auth";

/* Who is signed in, and the CSRF token that goes with it (COS-296). Port of
 * `~/dev/pfa/front/src/auth/context/AuthContext.tsx`.
 *
 * It replaces two zustand stores that persisted to `localStorage` — `bkmk-token` and
 * `bkmk-user`. **Nothing here is persisted, and that is the point of the whole lot.** The
 * identity lives in an `httpOnly` cookie the client cannot read, and the CSRF token lives
 * here in memory: a token in storage is a token any script on the page can steal, which is
 * exactly what made the JWT worth removing.
 *
 * Losing this state on reload is therefore normal, not a bug to work around. The layouts seed
 * it from the server — `getServerSession` asks `GET /users/me` with the request's cookie — so
 * the first paint already knows the answer and no screen ever renders in an "unknown" state.
 *
 * `AuthUser` comes from the zod schema rather than a hand-written interface: COS-318's rule
 * is that types are inferred from the schemas, so the shape cannot drift from what the API
 * actually returns. */

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: AuthUser | null;
  initialCsrfToken?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  csrfToken: string | null;
  setUser: (user: AuthUser | null) => void;
  setCsrfToken: (csrfToken: string | null) => void;
  setAuthState: (user: AuthUser, csrfToken: string | null) => void;
  clearAuth: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const AuthProvider = ({ children, initialUser = null, initialCsrfToken = null }: AuthProviderProps) => {
  const [user, setUser] = useState<AuthUser | null>(initialUser);
  const [csrfToken, setCsrfToken] = useState<string | null>(initialCsrfToken);

  const setAuthState = (nextUser: AuthUser, nextCsrfToken: string | null) => {
    setUser(nextUser);
    setCsrfToken(nextCsrfToken);
  };

  const clearAuth = () => {
    setUser(null);
    setCsrfToken(null);
  };

  const value: AuthContextValue = {
    user,
    csrfToken,
    setUser,
    setCsrfToken,
    setAuthState,
    clearAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/** Throws outside a provider rather than returning a null user: a screen that cannot tell
 *  "signed out" from "no provider" would render the wrong thing silently. */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export { AuthProvider, useAuth };
