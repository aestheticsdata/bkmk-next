import useRequestHelper from "@helpers/useRequestHelper";
import Swal from "sweetalert2";

const useLoginService = () => {
  const { request } = useRequestHelper();

  const loginService = async (email: string, password: string) => {
    try {
      const result = await request("/users", {
        method: "POST",
        data: {
          email,
          password,
        },
      });
      return result.data;
    } catch (e) {
      await Swal.fire({
        title: `login error: ${e}`,
        icon: "warning",
        confirmButtonText: "fermer",
      });
    }
  };

  return {
    loginService,
  };
};

export default useLoginService;
