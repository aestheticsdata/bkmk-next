import axios from "axios";
import _ from "lodash";
// import { useRouter } from "next/router";
// import { useAuthStore } from "@auth/store/authStore";


const useRequestHelper = () => {
  // const router = useRouter();
  // const token = useAuthStore((state) => state.token);

  const getRequestURL = (url) =>
    window.location.host.search("bkmk") !== -1
      ? `api${url}`
      : `${process.env.NEXT_PUBLIC_REMOTE_HOST_FROM_LOCALHOST}${url}`;

  // const privateRequest = (url, options, config) => {
  //   const tokenBearer = {
  //     headers: {
  //       Authorization: `Bearer ${token}`,
  //     },
  //   };
  //
  //   const axiosInstance = axios.create({
  //     headers: tokenBearer.headers,
  //     ...config,
  //   });
  //
  //   axiosInstance.interceptors.response.use(
  //     (response) => response,
  //     (err) => {
  //       if (err.response.status && err.response.status === 401) { router.push("/logout") }
  //       // see https://stackoverflow.com/questions/56954527/handling-a-promise-reject-in-axios-interceptor
  //       // see https://stackoverflow.com/questions/49886315/axios-interceptors-response-undefined
  //       // see https://github.com/axios/axios#interceptors
  //       return Promise.reject(err);
  //       // throw err;
  //     }
  //   );

    // const requestURL = getRequestURL(url);
    // return axiosInstance(requestURL, _.merge(options, tokenBearer));
  // };

  const request = (url, options) => {
    const requestURL = getRequestURL(url);
    return axios(requestURL, options);
  };

  return {
    request,
    // privateRequest,
  };
};

export default useRequestHelper;
