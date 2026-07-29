"use client";

import { useAuthStore } from "@auth/store/authStore";
import { useUserStore } from "@auth/store/userStore";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * **Transitional** logout screen. Once auth moves to sessions (AUTH 04, COS-296),
 * logging out becomes a `POST /users/logout` fired from the `sign out` button on the
 * About screen, and that ticket is the one that removes this route.
 */
export default function LogoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useUserStore((state) => state.setUser);

  useEffect(() => {
    queryClient.clear();
    setToken(null);
    setUser(null);
    router.push("/login");
  }, [queryClient, setToken, setUser, router]);

  return null;
}
