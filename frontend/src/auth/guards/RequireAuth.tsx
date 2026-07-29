"use client";

import { useAuthStore } from "@auth/store/authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import type { AuthType } from "@auth/store/authStore";

/**
 * **Temporary** session guard, inherited from the old `pages/_app.tsx`: it reads the JWT
 * the zustand store persists in localStorage.
 *
 * ⚠️ It waits for the store to finish **rehydrating** before deciding anything. Without
 * that wait, a page reload decides on a token that is still `null`: the server can only
 * ever render "no token" (it has no localStorage), so everything running before
 * rehydration believes the session is gone. Two ways that hurts — the redirect to
 * /login, and, more insidiously, children mounting and firing their requests with no
 * `Authorization` header, which returns a 401 that `useRequestHelper` turns into a trip
 * through /logout, which **empties the store**.
 *
 * Server output and the first client render are deliberately identical (`hydrated`
 * starts `false` on both sides), so there is no hydration mismatch.
 *
 * AUTH 04 (COS-296) replaces all of this with a **server-side** check in
 * `app/(private)/layout.tsx`, modelled on `pfa/front/src/auth/server/getServerSession.ts`.
 * The token leaves localStorage with AUTH 01.
 */
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const token = useAuthStore((state: AuthType) => state.token);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Rehydration may already be finished by the time this effect runs — in which case
    // `onFinishHydration` will never fire again.
    if (useAuthStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    return useAuthStore.persist.onFinishHydration(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated && !token) {
      router.push("/login");
    }
  }, [hydrated, token, router]);

  if (!hydrated) {
    return <div>Loading ...</div>;
  }

  return token ? <>{children}</> : <div>Redirecting ...</div>;
};

export default RequireAuth;
