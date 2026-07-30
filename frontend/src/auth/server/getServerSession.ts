import { DEV_API_BASE } from "@helpers/apiBase";
import { AuthResponseSchema } from "@src/schemas/auth";
import { cookies, headers } from "next/headers";

import type { AuthResponse } from "@src/schemas/auth";

/* The session, resolved on the server (COS-296). Port of
 * `~/dev/pfa/front/src/auth/server/getServerSession.ts`.
 *
 * This is what replaces `RequireAuth`. That guard read a JWT out of `localStorage`, which the
 * server cannot see, so it had to render a "Loading …" state first and decide afterwards —
 * and every child that mounted in the meantime fired unauthenticated requests. Asking the API
 * with the request's own cookie moves the decision **before** the first paint: the layout
 * either redirects or renders a tree that already knows who is signed in.
 *
 * `GET /users/me` returns the CSRF token alongside the user, which is what lets the client
 * hold it in memory only — the page is served with a fresh one on every load.
 *
 * A 401 is not an error here, it is the answer "nobody". Anything else throws: a broken API
 * must not look like a signed-out visitor, or the app would bounce to `/login` on an outage
 * and lose the reason. */

const trimTrailingSlash = (value: string): string => value.replace(/\/+$/, "");

/** In production the front and the API share a host, so the absolute URL is built from the
 *  incoming request — there is no origin to hard-code and none to configure. */
const getApiBaseUrlFromHeaders = async (): Promise<string> => {
  const requestHeaders = await headers();
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "http";
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host");

  if (!host) {
    throw new Error("Unable to build API base URL: host header is missing.");
  }

  return `${protocol}://${host}/api`;
};

const getApiBaseUrlForServer = async (): Promise<string> => {
  if (process.env.NODE_ENV !== "production" && DEV_API_BASE) {
    return trimTrailingSlash(DEV_API_BASE);
  }

  return getApiBaseUrlFromHeaders();
};

const getServerSession = async (): Promise<AuthResponse | null> => {
  const cookieStore = await cookies();
  const cookieHeader = cookieStore.toString();

  // No cookie at all: skip the round trip, the answer cannot be anything but "nobody".
  if (!cookieHeader) {
    return null;
  }

  const apiBaseUrl = await getApiBaseUrlForServer();
  const response = await fetch(`${apiBaseUrl}/users/me`, {
    method: "GET",
    cache: "no-store",
    headers: {
      cookie: cookieHeader,
    },
  });

  if (response.status === 401) {
    return null;
  }

  if (!response.ok) {
    throw new Error(`users/me failed with status ${response.status}`);
  }

  return AuthResponseSchema.parse(await response.json());
};

export { getServerSession };
