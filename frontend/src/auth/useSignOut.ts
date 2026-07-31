"use client";

import { useAuth } from "@auth/context/AuthContext";
import { ROUTES } from "@components/shared/config/constants";
import useRequestHelper from "@helpers/useRequestHelper";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

/* Signing out (COS-321). It was the whole of `app/(public)/logout/page.tsx`, which this ticket
 * deletes: the menu is a control, and a control that navigates to a screen whose only job is to
 * run an effect and leave is a redirect pretending to be a page.
 *
 * **The order is the part that matters, and it is the one COS-296 established.** The request goes
 * first, because it needs the CSRF token the context is about to drop; only then are the context
 * and the react-query cache emptied, and only then do we leave. Clearing client state is not
 * signing out on its own — an `httpOnly` cookie cannot be deleted by script, so a session left in
 * Redis stays valid for whoever holds it.
 *
 * **A failed request still signs out locally.** The session expires on its own within ten minutes,
 * and stranding someone on a screen they asked to leave is worse than a session that outlives the
 * click by a few minutes.
 *
 * `replace`, not `push`: the private screen behind is gone, and the back button should not offer
 * to return to it. */
function useSignOut() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { privateRequest } = useRequestHelper();
  const { user, clearAuth } = useAuth();

  return async () => {
    if (user) {
      try {
        await privateRequest("/users/logout", { method: "POST" });
      } catch {
        // Already gone server-side, or unreachable. Either way, leave.
      }
    }

    clearAuth();
    queryClient.clear();
    router.replace(ROUTES.login.path);
  };
}

export default useSignOut;
