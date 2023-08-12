import { useRouter } from "next/router";
import Swal from "sweetalert2";
import useRequestHelper from "@helpers/useRequestHelper";
import { useAuthStore } from "@auth/store/authStore";
import { useUserStore } from "@auth/store/userStore";

import type { AxiosError } from "axios";

const useResetPasswordService = () => {
  const { request } = useRequestHelper();
  const router = useRouter();
  const userStore = useUserStore();
  const authStore = useAuthStore();

  const resetPasswordService = async (email: string) => {
    try {
      await request("/users/resetpassword", {
        method: "POST",
        data: {
          email,
          subject: "BKMK - changement de mot de passe",
        }
      });
      // @ts-ignore
      Swal.fire({
        title: "Succès",
        text: "un nouveau mot de passe vous a été envoyé",
        type: "success",
        icon: "success",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        didClose: () => {
          authStore.setToken(null);
          userStore.setUser(null);
          router.push("/login");
        },
      })
    } catch (err: unknown) {
      // @ts-ignore
      await Swal.fire({
        title: "le mot de passe n'a pas pu être ré-initialisé",
        text: (err as any).response?.data.error ?? "",
        type: "error",
        icon: "warning",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
      });
    }
  }

  return {
    resetPasswordService,
  }
};

export default useResetPasswordService;
