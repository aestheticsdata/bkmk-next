"use client";

import { useAuth } from "@auth/context/AuthContext";
import useRequestHelper from "@helpers/useRequestHelper";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

/* Signing out is now a server call (COS-296): `POST /users/logout` destroys the session in
 * Redis and clears the cookie. Clearing state client-side is not enough and never was —
 * an `httpOnly` cookie cannot be deleted by script, so a session left in the store stays
 * valid for whoever holds it.
 *
 * The order matters. The request goes first, because it needs the CSRF token that the context
 * is about to drop; only then are the context and the react-query cache emptied, and only then
 * do we leave. A failed request still logs out locally: the session will expire on its own
 * within ten minutes, and stranding someone on a screen they asked to leave is worse.
 *
 * The `useRef` guard is not ceremony: React 19 runs effects twice in development, and the
 * second POST would arrive after the token had been cleared and come back 403.
 *
 * ⚠️ Still a route rather than a button. The handoff puts `sign out` in the user menu — that
 * is COS-321, which also replaces the chrome's e-mail link that leads here. */
export default function LogoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { privateRequest } = useRequestHelper();
  const { user, clearAuth } = useAuth();
  const done = useRef(false);

  useEffect(() => {
    if (done.current) return;
    done.current = true;

    const signOut = async () => {
      if (user) {
        try {
          await privateRequest("/users/logout", { method: "POST" });
        } catch {
          // Already gone server-side, or unreachable. Either way, leave.
        }
      }

      clearAuth();
      queryClient.clear();
      router.replace("/login");
    };

    void signOut();
  }, [privateRequest, clearAuth, queryClient, router, user]);

  return null;
}
