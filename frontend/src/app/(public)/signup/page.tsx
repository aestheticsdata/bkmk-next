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
 * the two-column key pair, the strength gauge — and the recovery passphrase, which the handoff has
 * no field for because the decision came later.
 *
 * ⚠️ **No import checkbox**, though the handoff draws one. It was built, and dropped on the owner's
 * call: registering and importing are two decisions, and tying the second to a checkbox on the first
 * only buys a redirect to a screen the chrome already reaches.
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
      setCredentials(await signupService(values));
    } catch (failure) {
      setError(readApiError(failure) ?? AUTH_TEXT.signup.failed);
    }
  };

  return (
    <AuthShell hints={AUTH_TEXT.signup.hints}>
      {/* 576px, where sign-in keeps the handoff's 480 (COS-298). This card carries four secret
          fields to sign-in's one, and at 480 the two-column pair had no room left for a validation
          message beside `confirm key` — the label wrapped and the message landed on top of it. 576
          is `36rem`, Tailwind's `xl` step, rather than "480 plus about a hundred". Below the fold
          the pair stacks and the width is moot, so `max-w-full` is the whole mobile story. */}
      <div className="w-144 max-w-full">
        <Overline className="mb-1.5 block">{AUTH_TEXT.signup.overline}</Overline>
        {/* ⚠️ **The overline, the title and the card all start at exactly the same x — 432 measured
            in a headless 1440px window — and no offset belongs here.** What is left is the font's own
            left side bearing, the empty room IBM Plex Mono leaves before the ink: 0.45px at the
            overline's 10px, 1.61px at this title's 24px. It is not one number to subtract, either —
            the same title on the sign-in screen measures 1.30px, because the bearing belongs to the
            first glyph (`c` here, `s` there). Any correction would be a constant per screen per
            string, wrong the day the copy changes. The handoff has the same property. */}
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

        {/* The sign-in screen's paragraph, verbatim (COS-328): the two screens share the frame and
            the block, and the sentence is about the product, not about the act. */}
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
