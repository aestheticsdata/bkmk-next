"use client";

import { useAuthStore } from "@auth/store/authStore";
import { useUserStore } from "@auth/store/userStore";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Écran de déconnexion **transitoire**. Avec l'auth par session (AUTH 04, COS-296)
 * la déconnexion devient un `POST /users/logout` déclenché depuis le bouton
 * `sign out` de l'écran About : c'est ce ticket-là qui supprimera cette route.
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
