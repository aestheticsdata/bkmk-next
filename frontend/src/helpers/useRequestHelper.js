import axios from "axios";
import { useRouter } from "next/router";
import { useAuthStore } from "@auth/store/authStore";

axios.defaults.baseURL = (typeof window !== "undefined") &&
  window.location.host.search("bkmk") !== -1
    // ? `api${url}`
    ? "https://bkmk.1991computer.com/api/"
    : `${process.env.NEXT_PUBLIC_REMOTE_HOST_FROM_LOCALHOST}`;

const useRequestHelper = () => {
  const router = useRouter();
  const token = useAuthStore((state) => state.token);

  const privateRequest = (url, options, config) => {
    const tokenBearer = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    const axiosInstance = axios.create({
      headers: {
        ...tokenBearer.headers,
        ...(options?.headers ?? {}),
      },
      ...config,
    });

    axiosInstance.interceptors.response.use(
      (response) => response,
      (err) => {
        if (err.response.status && err.response.status === 401) { router.push("/logout") }
        // see https://stackoverflow.com/questions/56954527/handling-a-promise-reject-in-axios-interceptor
        // see https://stackoverflow.com/questions/49886315/axios-interceptors-response-undefined
        // see https://github.com/axios/axios#interceptors
        return Promise.reject(err);
        // throw err;
      }
    );

    return axiosInstance(url, {...options, tokenBearer});
  };

  const request = (url, options) => {
    return axios(url, options);
  };

  return {
    request,
    privateRequest,
  };
};

export default useRequestHelper;
