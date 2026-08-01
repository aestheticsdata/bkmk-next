"use client";

import useRequestHelper from "@helpers/useRequestHelper";

import type { RecoverFormValues } from "@src/schemas/auth";

/* Resetting a key with the recovery passphrase (COS-324).
 *
 * Same contract as `useLoginService` and `useSignupService`: it **rejects** rather than swallowing
 * the failure, so the screen can render the refusal inside the card beside the fields it is about.
 *
 * ⚠️ **Nothing is parsed on the way back, because nothing comes back.** The other two auth calls end
 * in `AuthResponseSchema.parse` — they open a session and the boundary rule of PLAT 05 applies to
 * the identity they return. This route opens none on purpose: recovering a key does not prove you
 * hold it, so the answer is a bare acknowledgement and the proof happens at `/login`. There is no
 * shape to guard, and inventing one to parse would be ceremony.
 *
 * `confirmPassword` is dropped here rather than in the screen, exactly as the sign-up service drops
 * its two: a typo check is not the server's business. */
const useRecoverService = () => {
  const { request } = useRequestHelper();

  const recoverService = async ({ email, recoveryPassphrase, password }: RecoverFormValues): Promise<void> => {
    await request("/users/recover", {
      method: "POST",
      data: { email, recoveryPassphrase, password },
    });
  };

  return {
    recoverService,
  };
};

export default useRecoverService;
