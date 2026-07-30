"use client";

import { useAuth } from "@auth/context/AuthContext";
import { ROUTES } from "@components/shared/config/constants";
import { getRequestUrl } from "@helpers/apiBase";
import axios from "axios";

import type { AxiosRequestConfig, AxiosResponse } from "axios";

/* The only door to the API (COS-296). Port of `~/dev/pfa/front/src/helpers/useRequestHelper.ts`,
 * replacing the `.js` version that put `Authorization: Bearer <jwt>` on every private request.
 *
 * Three things changed, and each closes something the JWT left open:
 *
 * - **`withCredentials: true`** — the identity is now the `bkmk.sid` cookie. axios does not
 *   send cookies cross-origin unless asked, and in development the front (3100) and the API
 *   (3101) *are* cross-origin, so without this nothing is ever authenticated.
 * - **`x-csrf-token` on unsafe verbs only.** Safe methods are exempt server-side, and sending
 *   it on a GET would only mean sending it to `/users/csrf` in order to fetch it.
 * - **One replay on 403.** The token lives in memory, so a reload or a rotation leaves the
 *   client holding a stale one. On a 403 it refetches from `GET /users/csrf` and retries the
 *   request exactly once — never twice, or a genuinely forbidden request would loop.
 *
 * The 401 path deliberately returns a **pending** promise after navigating: the session is
 * gone, the page is already leaving, and letting the rejection through would surface an error
 * boundary or a react-query error state on a screen that is about to be replaced. */

const SAFE_HTTP_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

const isUnsafeMethod = (method?: string): boolean => !SAFE_HTTP_METHODS.has((method ?? "GET").toUpperCase());

/**
 * Sends the visitor to the login screen when the server says the session is gone.
 *
 * Returns `true` when it navigated — the caller then leaves its promise pending. Returns
 * `false` when it cannot or should not (during SSR, or when already on `/login`), and the
 * caller throws normally instead of hanging for ever. The navigation is a hard one: it drops
 * the auth context and the react-query cache, and re-runs the server-side check in
 * `app/(private)/layout.tsx`.
 */
const redirectToLogin = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  if (window.location.pathname.replace(/\/$/, "") === ROUTES.login.path) {
    return false;
  }

  window.location.replace(ROUTES.login.path);
  return true;
};

const useRequestHelper = () => {
  const { user, csrfToken, setCsrfToken } = useAuth();

  /** Public routes: sign in, sign up. No session and no CSRF token to send yet. */
  const request = (url: string, options?: AxiosRequestConfig): Promise<AxiosResponse> =>
    axios(getRequestUrl(url), {
      withCredentials: true,
      ...options,
    });

  const privateRequest = async (
    url: string,
    options?: AxiosRequestConfig,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse> => {
    // Nothing is sent at all without a known user: the request would come back 401 and cost a
    // round trip to learn what the context already knows.
    if (!user) {
      if (redirectToLogin()) {
        return new Promise<never>(() => {});
      }
      throw new Error("User not logged in");
    }

    const method = options?.method ?? "GET";
    const requestHeaders: Record<string, string> = { ...((options?.headers as Record<string, string>) ?? {}) };

    if (csrfToken && isUnsafeMethod(method)) {
      requestHeaders["x-csrf-token"] = csrfToken;
    }

    const axiosInstance = axios.create({
      withCredentials: true,
      ...config,
    });

    const executeRequest = (headers = requestHeaders): Promise<AxiosResponse> =>
      axiosInstance(getRequestUrl(url), {
        ...options,
        method,
        headers,
      });

    try {
      return await executeRequest();
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } })?.response?.status;

      if (status === 403 && isUnsafeMethod(method)) {
        try {
          const csrfResponse = await axiosInstance(getRequestUrl("/users/csrf"), { method: "GET" });
          const refreshedToken = (csrfResponse.data as { csrfToken?: string })?.csrfToken;
          if (refreshedToken) {
            setCsrfToken(refreshedToken);
            return await executeRequest({ ...requestHeaders, "x-csrf-token": refreshedToken });
          }
        } catch {
          // The refresh itself failed — fall through to the 401 / throw path below.
        }
      }

      if (status === 401 && redirectToLogin()) {
        return new Promise<never>(() => {});
      }

      throw error;
    }
  };

  return {
    request,
    privateRequest,
  };
};

export default useRequestHelper;
