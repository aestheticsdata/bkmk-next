"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { AuthResponseSchema } from "@src/schemas/auth";

import type { AuthResponse, ChangePasswordPayload } from "@src/schemas/auth";

/* Changing the account password from the menu (COS-404).
 *
 * Same contract as the other auth services: it rejects on failure so the dialog can render the
 * refusal beside the fields, and the response is parsed through the same `AuthResponseSchema`
 * sign-in and sign-up use — the backend answers through `establishSession`, so the shape is
 * identical, `hasRecoveryPassphrase` included. `privateRequest`, not `request`: this is an
 * authenticated mutation and needs the CSRF header and the 401 handling `useRequestHelper`
 * already does for every other private route. */
const useChangePasswordService = () => {
  const { privateRequest } = useRequestHelper();

  const changePasswordService = async (payload: ChangePasswordPayload): Promise<AuthResponse> => {
    const result = await privateRequest("/users/me/password", {
      method: "PATCH",
      data: payload,
    });
    return AuthResponseSchema.parse(result.data);
  };

  return {
    changePasswordService,
  };
};

export default useChangePasswordService;
