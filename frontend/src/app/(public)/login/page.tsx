"use client";

import useCredentials from "@auth/helpers/useCredentials";
import useLoginService from "@auth/useLoginService";
import { BlinkCursor } from "@components/ds/BlinkCursor";
import { Overline } from "@components/ds/Overline";
import { SignInForm } from "@components/shared/authForms/SignInForm";
import { ROUTES } from "@components/shared/config/constants";
import { AuthShell } from "@components/shared/shell/AuthShell";
import { readApiError } from "@helpers/apiError";
import { AUTH_TEXT } from "@text/auth";
import Link from "next/link";
import { useState } from "react";

import type { SignInPayload } from "@src/schemas/auth";

/* `Login_Graphite` — the sign-in screen (COS-297).
 *
 * A 480px block centred on the grey field: the `session` overline, the title closed by the
 * blinking caret, the auth card, then the three mono facts and the way out to About. The frame
 * is `AuthShell`, shared with sign-up.
 *
 * The width is `w-120` with `max-w-full`, not a media query: 480px is the handoff's figure, and
 * below it the block simply takes the room it has. Nothing here needs to fold — two fields and a
 * button are the same shape at every width.
 *
 * The refusal lives in `useState` rather than in the form: the form owns field validity, the
 * screen owns what the server said. They are different failures with different lifetimes — one
 * clears when you fix the field, the other when you try again. */
export default function LoginPage() {
  const { loginService } = useLoginService();
  const { setCredentials } = useCredentials();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: SignInPayload) => {
    setError(null);
    try {
      setCredentials(await loginService(values.email, values.password));
    } catch (failure) {
      setError(readApiError(failure) ?? AUTH_TEXT.login.failed);
    }
  };

  return (
    <AuthShell hints={AUTH_TEXT.login.hints}>
      <div className="w-120 max-w-full">
        <Overline className="mb-1.5 block">{AUTH_TEXT.login.overline}</Overline>
        {/* No nudge on this header either, and the sign-up screen's note says why. */}
        <h1 className="mb-5 text-2xl font-semibold tracking-snug text-gr-fg-2">
          {AUTH_TEXT.login.title}
          <BlinkCursor className="text-gr-accent" />
        </h1>

        <SignInForm
          copy={AUTH_TEXT.login}
          switchHref={ROUTES.signup.path}
          onSubmit={onSubmit}
          error={error}
        />

        {/* Aligned with spaces in the copy, so the whitespace has to survive. */}
        <div className="mt-4 grid gap-1 text-2xs text-gr-fg-4">
          {AUTH_TEXT.facts.map((fact) => (
            <div
              key={fact}
              className="whitespace-pre"
            >
              {fact}
            </div>
          ))}
        </div>

        <Overline
          asChild
          className="mt-3.5 inline-block text-gr-accent hover:text-gr-fg-2"
        >
          <Link href={ROUTES.about.path}>{AUTH_TEXT.about}</Link>
        </Overline>
      </div>
    </AuthShell>
  );
}
