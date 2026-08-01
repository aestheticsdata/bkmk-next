"use client";

import useRecoverService from "@auth/useRecoverService";
import { BlinkCursor } from "@components/ds/BlinkCursor";
import { Overline } from "@components/ds/Overline";
import { RecoverForm } from "@components/shared/authForms/RecoverForm";
import { ROUTES } from "@components/shared/config/constants";
import { AuthShell } from "@components/shared/shell/AuthShell";
import { readApiError } from "@helpers/apiError";
import { AUTH_TEXT } from "@text/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import type { RecoverFormValues } from "@src/schemas/auth";

/* `/recover` — spending the recovery passphrase (COS-324, AUTH 05).
 *
 * The third screen on `AuthShell`, built to sign-in's proportions: the same 480px block, the same
 * overline, the same caret closing the title. The handoff draws neither this screen nor a link to
 * it — recovery by email was still the plan when it was written — so nothing here is a departure
 * from it; it is the shape the other two established, applied to a card the design never had.
 *
 * ⚠️ **The success path leaves through `/login`, and opens nothing on the way.** The API answers a
 * bare 200: no cookie, no CSRF token, no identity. Signing someone in on the strength of the secret
 * they just said they had lost is the shortcut this feature exists *not* to take, so the reset ends
 * where every other session starts, with the new key proved once. `?reset=1` is what lets that
 * screen say why you are there rather than look like a redirect that lost something.
 *
 * `replace`, not `push`: the back button should not return to a form whose passphrase has just been
 * spent and whose fields are still filled in.
 *
 * The refusal lives in `useState` rather than in the form, the same split sign-in makes — the form
 * owns field validity, the screen owns what the server said. Here that covers two answers with one
 * sentence: the 401 that every failure shares by design, and the 429 the rate limiter returns, whose
 * own message comes through `readApiError` and is the more useful of the two. */
export default function RecoverPage() {
  const { recoverService } = useRecoverService();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (values: RecoverFormValues) => {
    setError(null);
    try {
      await recoverService(values);
      router.replace(`${ROUTES.login.path}?reset=1`);
    } catch (failure) {
      setError(readApiError(failure) ?? AUTH_TEXT.recover.failed);
    }
  };

  return (
    <AuthShell hints={AUTH_TEXT.recover.hints}>
      <div className="w-120 max-w-full">
        <Overline className="mb-1.5 block">{AUTH_TEXT.recover.overline}</Overline>
        <h1 className="mb-5 text-2xl font-semibold tracking-snug text-gr-fg-2">
          {AUTH_TEXT.recover.title}
          <BlinkCursor className="text-gr-accent" />
        </h1>

        <RecoverForm
          copy={AUTH_TEXT.recover}
          switchHref={ROUTES.login.path}
          onSubmit={onSubmit}
          error={error}
        />

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
