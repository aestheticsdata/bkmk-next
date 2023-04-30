import useRequestHelper from "@helpers/useRequestHelper";
import Swal from "sweetalert2";

import type { LoginValues } from "@components/shared/sharedLoginForm/interfaces";


const useSignupService = () => {
  const { request } = useRequestHelper();

  const signupService = async (user: LoginValues) => {
    const { email, password } = user;
    try {
      const res = await request('/users/add', {
        method: 'POST',
        data: {
          name: email!.split('@')[0],
          email,
          password,
          registerDate: new Date(),
          baseCurrency: "EUR",
          language: "fr",
        }
      });
      return res.data;
    } catch (err) {
      await Swal.fire({
        title: "Erreur lors de la création de compte",
        icon: "warning",
        confirmButtonText: "fermer",
      });
    }
  }

  return {
    signupService,
  }
}

export default useSignupService;
