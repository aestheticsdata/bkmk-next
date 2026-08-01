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
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

import type { SignInPayload } from "@src/schemas/auth";

/* What `/recover` leaves behind when it sends you here (COS-324).
 *
 * The reset opens no session on purpose, so the screen it lands on would otherwise be a redirect
 * that lost something: you typed a new key and arrived at a form asking for one, with nothing saying
 * the first part worked.
 *
 * ⚠️ **Its own component, inside `Suspense`, because `useSearchParams` needs it.** Reading the query
 * string opts a route out of static rendering, and Next requires the boundary rather than inferring
 * it — without one the build fails on this page. Isolating the hook keeps that cost to the one line
 * that pays it instead of putting the whole screen behind a fallback. */
function ResetNotice() {
  const done = useSearchParams().get("reset") === "1";
  if (!done) return null;

  return <Overline className="mb-1.5 block text-gr-accent">{AUTH_TEXT.recover.done}</Overline>;
}

/* `Login_Graphite` — the sign-in screen (COS-297).
 *
 * A 480px block centred on the grey field: the `BKMK` overline, the title closed by the blinking
 * caret, the auth card, then the product line and the way out to About. The frame is `AuthShell`,
 * shared with sign-up.
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
        <Suspense fallback={null}>
          <ResetNotice />
        </Suspense>
        <Overline className="mb-1.5 block">{AUTH_TEXT.login.overline}</Overline>
        {/* No nudge on this header either, and the sign-up screen's note says why. */}
        <h1 className="mb-5 text-2xl font-semibold tracking-snug text-gr-fg-2">
          {AUTH_TEXT.login.title}
          <BlinkCursor className="text-gr-accent" />
        </h1>

        <SignInForm
          copy={AUTH_TEXT.login}
          switchHref={ROUTES.signup.path}
          recoverHref={ROUTES.recover.path}
          onSubmit={onSubmit}
          error={error}
        />

        {/* One paragraph, not the three space-aligned lines it replaces (COS-328) — so no
            `whitespace-pre` here, and the wrap is the browser's to make. */}
        <p className="mt-4 text-pretty text-2xs leading-relaxed text-gr-fg-4">{AUTH_TEXT.pitch}</p>

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
