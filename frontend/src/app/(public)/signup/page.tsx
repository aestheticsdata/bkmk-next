"use client";

import useCredentials from "@auth/helpers/useCredentials";
import useSignupService from "@auth/useSignupService";
import { BlinkCursor } from "@components/ds/BlinkCursor";
import { Overline } from "@components/ds/Overline";
import { SignUpForm } from "@components/shared/authForms/SignUpForm";
import { ROUTES } from "@components/shared/config/constants";
import { AuthShell } from "@components/shared/shell/AuthShell";
import { readApiError } from "@helpers/apiError";
import { AUTH_TEXT } from "@text/auth";
import Link from "next/link";
import { useState } from "react";

import type { SignUpFormValues } from "@src/schemas/auth";

/* `Signup_Graphite` — the sign-up screen (COS-298).
 *
 * UI 01 had already given this route the frame and the two-field card, because both were shared
 * and a lime form beside its GRAPHITE twin would have been worse than either. This is the rest:
 * the two-column key pair, the strength gauge, the import checkbox — and the recovery passphrase,
 * which the handoff has no field for because the decision came later.
 *
 * **The import checkbox actually goes somewhere.** Ticked, registration lands on
 * `/bookmarks/upload` instead of the index. That screen is still the legacy one and UI 07 (COS-303)
 * will rebuild it, but the sequence is real from here on, which is what the ticket asked for.
 *
 * The refusal lives in `useState` rather than in the form: the form owns field validity, the screen
 * owns what the server said. Different failures with different lifetimes — one clears when you fix
 * the field, the other when you try again. */
export default function SignUpPage() {
  const { signupService } = useSignupService();
  const { setCredentials } = useCredentials();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: SignUpFormValues) => {
    setError(null);
    try {
      const auth = await signupService(values);
      setCredentials(auth, values.importAfterSignup ? ROUTES.bookmarksBatchUpload.path : undefined);
    } catch (failure) {
      setError(readApiError(failure) ?? AUTH_TEXT.signup.failed);
    }
  };

  return (
    <AuthShell hints={AUTH_TEXT.signup.hints}>
      <div className="w-120 max-w-full">
        <Overline className="mb-1.5 block">{AUTH_TEXT.signup.overline}</Overline>
        <h1 className="mb-5 text-2xl font-semibold tracking-snug text-gr-fg-2">
          {AUTH_TEXT.signup.title}
          <BlinkCursor className="text-gr-accent" />
        </h1>

        <SignUpForm
          copy={AUTH_TEXT.signup}
          switchHref={ROUTES.login.path}
          onSubmit={onSubmit}
          error={error}
        />

        {/* Aligned with spaces in the copy, so the whitespace has to survive. */}
        <div className="mt-4 grid gap-0.75 text-2xs text-gr-fg-4">
          {AUTH_TEXT.facts.map((fact) => (
            <div
              key={fact}
              className="whitespace-pre"
            >
              {fact}
            </div>
          ))}
        </div>

        <Link
          href={ROUTES.about.path}
          className="mt-3.5 inline-block"
        >
          <Overline className="text-gr-accent hover:text-gr-fg-2">{AUTH_TEXT.about}</Overline>
        </Link>
      </div>
    </AuthShell>
  );
}
