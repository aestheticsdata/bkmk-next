"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { AuthResponseSchema } from "@src/schemas/auth";

import type { LoginValues } from "@components/shared/sharedLoginForm/interfaces";
import type { AuthResponse } from "@src/schemas/auth";

/* Registering. Same treatment as `useLoginService` (COS-297): it **rejects** rather than showing a
 * toast, so the screen can put the refusal — "Email already exists" being the one that matters —
 * inside the card.
 *
 * `baseCurrency` and `language` are gone from the payload. They were pfa's fields, copied over
 * with the file; bkmk's `signUpBodySchema` does not declare them and zod strips unknown keys, so
 * they were travelling across the network to be thrown away on arrival.
 *
 * ⚠️ `name` is still derived from the address. The handoff's sign-up screen asks for an identity
 * and a key, nothing else, so there is no field to take a display name from — UI 02 (COS-298) owns
 * that screen and can decide whether one appears. */
const useSignupService = () => {
  const { request } = useRequestHelper();

  const signupService = async ({ email, password }: LoginValues): Promise<AuthResponse> => {
    const res = await request("/users/add", {
      method: "POST",
      data: {
        name: email.split("@")[0],
        email,
        password,
        registerDate: new Date(),
      },
    });
    return AuthResponseSchema.parse(res.data);
  };

  return {
    signupService,
  };
};

export default useSignupService;
