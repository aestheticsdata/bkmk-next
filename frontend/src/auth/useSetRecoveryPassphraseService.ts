"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { SetRecoveryPassphraseResponseSchema } from "@src/schemas/auth";

import type { SetRecoveryPassphrasePayload, SetRecoveryPassphraseResponse } from "@src/schemas/auth";

/* Setting or changing the recovery passphrase from the menu (COS-404).
 *
 * Unlike sign-in, sign-up and change-password, this route opens no session and its answer is not
 * `AuthResponseSchema` — there is no new CSRF token to carry, because nothing about the session
 * changed. Only the one boolean the menu needs to relabel itself. */
const useSetRecoveryPassphraseService = () => {
  const { privateRequest } = useRequestHelper();

  const setRecoveryPassphraseService = async (
    payload: SetRecoveryPassphrasePayload,
  ): Promise<SetRecoveryPassphraseResponse> => {
    const result = await privateRequest("/users/me/passphrase", {
      method: "PATCH",
      data: payload,
    });
    return SetRecoveryPassphraseResponseSchema.parse(result.data);
  };

  return {
    setRecoveryPassphraseService,
  };
};

export default useSetRecoveryPassphraseService;
