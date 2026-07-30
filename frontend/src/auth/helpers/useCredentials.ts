"use client";

import { useAuth } from "@auth/context/AuthContext";
import { ROUTES } from "@components/shared/config/constants";
import { useRouter } from "next/navigation";

import type { AuthResponse } from "@src/schemas/auth";

/* What a successful sign-in or sign-up does with its answer (COS-296). Port of
 * `~/dev/pfa/front/src/auth/helpers/useCredentials.ts`.
 *
 * It used to take `(token, user)` and hand the token to a persisted zustand store. It now
 * takes the whole response and puts the user **and the CSRF token** into the context, in
 * memory. The session itself needs nothing done to it: the server set an `httpOnly` cookie on
 * the response that carried this payload.
 *
 * `router.replace`, not `push`: the login screen has no business sitting in the history of a
 * signed-in visitor, where Back would land on a form that immediately bounces them forward
 * again. */
const useCredentials = () => {
  const router = useRouter();
  const { setAuthState } = useAuth();

  const setCredentials = (auth: AuthResponse) => {
    setAuthState(auth.user, auth.csrfToken);
    router.replace(ROUTES.bookmarks.path);
  };

  return {
    setCredentials,
  };
};

export default useCredentials;
