"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { AuthResponseSchema } from "@src/schemas/auth";

import type { AuthResponse } from "@src/schemas/auth";

/* Signing in. Port of `~/dev/pfa/front/src/auth/useLoginService.ts`.
 *
 * **It rejects on failure instead of swallowing the error into a toast** (COS-297). The previous
 * version caught everything, showed a `Swal` reading `login error: AxiosError…` and returned
 * `undefined` — which left the caller unable to tell a wrong password from an unreachable API,
 * and put the message in a box that has to be dismissed before you can try again. The screen now
 * renders the refusal inside the card, beside the fields it is about.
 *
 * The response still goes through the schema: the boundary rule from PLAT 05 does not bend for
 * the auth routes. */
const useLoginService = () => {
  const { request } = useRequestHelper();

  const loginService = async (email: string, password: string): Promise<AuthResponse> => {
    const result = await request("/users", {
      method: "POST",
      data: { email, password },
    });
    return AuthResponseSchema.parse(result.data);
  };

  return {
    loginService,
  };
};

export default useLoginService;
