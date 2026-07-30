"use client";

import useCredentials from "@auth/helpers/useCredentials";
import useSignupService from "@auth/useSignupService";
import { BlinkCursor } from "@components/ds/BlinkCursor";
import { Overline } from "@components/ds/Overline";
import { ROUTES } from "@components/shared/config/constants";
import SharedLoginForm from "@components/shared/sharedLoginForm/sharedLoginForm";
import { AuthShell } from "@components/shared/shell/AuthShell";
import { readApiError } from "@helpers/apiError";
import { AUTH_TEXT } from "@text/auth";
import { useState } from "react";

import type { LoginValues } from "@components/shared/sharedLoginForm/interfaces";

/* The sign-up screen, on the sign-in screen's frame (COS-297).
 *
 * ⚠️ **This is the gabarit only, not UI 02.** The screen is here because the form and the shell
 * are shared, and leaving it on the old lime card while its twin is GRAPHITE would have been
 * worse than either. What COS-298 still owns: `key` and `confirm key` **on two columns**, the
 * password strength gauge, and the `import my Session Buddy export after signup` checkbox that
 * has to actually lead to the import screen. */
export default function SignUpPage() {
  const { signupService } = useSignupService();
  const { setCredentials } = useCredentials();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: LoginValues) => {
    setError(null);
    try {
      setCredentials(await signupService(values));
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

        <SharedLoginForm
          copy={AUTH_TEXT.signup}
          switchHref={ROUTES.login.path}
          onSubmit={onSubmit}
          error={error}
        />

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
      </div>
    </AuthShell>
  );
}
