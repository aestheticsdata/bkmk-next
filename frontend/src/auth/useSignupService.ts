"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { AuthResponseSchema } from "@src/schemas/auth";
import { FIELD_LIMITS } from "@src/schemas/fieldLimits";

import type { AuthResponse, SignUpFormValues } from "@src/schemas/auth";

/* Registering. Same treatment as `useLoginService` (COS-297): it **rejects** rather than showing a
 * toast, so the screen can put the refusal — "Email already exists" being the one that matters —
 * inside the card.
 *
 * **This is where the form stops being the payload** (COS-298). `confirmPassword` and
 * `importAfterSignup` are dropped here rather than in the screen: the first is a typo check, the
 * second only decides where to go next, and neither is the server's business.
 * `recoveryPassphrase` does travel — it is hashed on arrival, exactly like the password.
 *
 * `name` is still derived from the address. The handoff's sign-up screen asks for an identity and a
 * key, nothing else, so there is no field to take a display name from, and UI 02 kept it that way
 * rather than inventing one the design does not have.
 *
 * ⚠️ **Truncated to `FIELD_LIMITS.userName`**, which is 20 — the real width of `user.name`, read
 * from `bkmk.sql` under COS-298. That number was 50 here, so an address whose local part ran past
 * twenty characters passed the form and came back as a raw SQL error from the insert. `.slice`
 * rather than a validation message: the account name is derived, not typed, and refusing a
 * perfectly good address over a field the visitor cannot see would be absurd. */
const useSignupService = () => {
  const { request } = useRequestHelper();

  const signupService = async ({ email, password, recoveryPassphrase }: SignUpFormValues): Promise<AuthResponse> => {
    const res = await request("/users/add", {
      method: "POST",
      data: {
        name: email.split("@")[0].slice(0, FIELD_LIMITS.userName),
        email,
        password,
        recoveryPassphrase,
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
