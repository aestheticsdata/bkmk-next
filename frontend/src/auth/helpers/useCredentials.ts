import { useRouter } from "next/router";
import { useAuthStore } from "@auth/store/authStore";
import { useUserStore } from "@auth/store/userStore";

const useCredentials = () => {
  const router = useRouter();
  const authStore = useAuthStore();
  const userStore = useUserStore();

  const setCredentials = async (token: any, user: any) => {
    await authStore.setToken(token);
    await userStore.setUser(user);
    await router.push("/");
  };

  return {
    setCredentials,
  };
}

export default useCredentials;
