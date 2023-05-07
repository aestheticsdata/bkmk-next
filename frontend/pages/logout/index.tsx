import { useRouter } from "next/router";
import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@auth/store/authStore";
import { useUserStore } from "@auth/store/userStore";

const Logout = () => {
  const userStore = useUserStore();
  const authStore = useAuthStore();
  const router = useRouter();

  const queryClient = useQueryClient();
  queryClient.clear();

  useEffect(() => {
    authStore.setToken(null);
    userStore.setUser(null);
    router.push("/login");
  }, []);

  return <></>;
};

Logout.auth = false;

export default Logout;
