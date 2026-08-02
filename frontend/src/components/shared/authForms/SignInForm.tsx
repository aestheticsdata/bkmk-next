"use client";

import { AuthCard } from "@components/shared/authForms/AuthCard";
import { AuthField } from "@components/shared/authForms/AuthField";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInPayloadSchema } from "@src/schemas/auth";
import { useForm } from "react-hook-form";

import type { SignInCopy } from "@components/shared/authForms/types";
import type { SignInPayload } from "@src/schemas/auth";

/* The sign-in card: an identity and a key, which is all the handoff draws (COS-297, split out of
 * the shared form by COS-298).
 *
 * Validation comes from `SignInPayloadSchema` — the same object the request is validated against,
 * whose backend twin bounds the same two fields, so the form cannot drift from what the API
 * accepts. `mode: "onTouched"` puts a message next to a field when you leave it, rather than
 * scolding you mid-word.
 *
 * ⚠️ The key field is a plain password field. The reveal control lives on the sign-up screen's
 * recovery passphrase and nowhere else: there, a typo you cannot see costs you the account, while
 * here a wrong key costs you one more attempt. */
function SignInForm({
  copy,
  switchHref,
  recoverHref,
  onSubmit,
  error,
}: {
  copy: SignInCopy;
  switchHref: string;
  /** `/recover` — the live link that replaces the `/forgotPassword` UI 01 removed (COS-324). */
  recoverHref: string;
  onSubmit: (values: SignInPayload) => Promise<void>;
  error?: string | null;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<SignInPayload>({
    resolver: zodResolver(SignInPayloadSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  /* Same rule as the sign-up form: validate on leaving a field, clear on the keystroke that fixes
   * it, and say nothing about a field you have **emptied** until submit — react-hook-form keeps the
   * last verdict otherwise, which leaves a message standing over a blank box. */
  const values = watch();
  const messageFor = (field: keyof SignInPayload) =>
    isSubmitted || values[field] ? errors[field]?.message : undefined;

  return (
    <AuthCard
      action={copy}
      switchHref={switchHref}
      secondary={{ href: recoverHref, label: copy.recoverAccount }}
      error={error}
      busy={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
    >
      <AuthField
        id="auth-identity"
        label={copy.identity}
        type="email"
        autoComplete="email"
        error={messageFor("email")}
        {...register("email")}
      />
      <AuthField
        id="auth-key"
        label={copy.key}
        type="password"
        autoComplete="current-password"
        error={messageFor("password")}
        {...register("password")}
      />
    </AuthCard>
  );
}

export { SignInForm };
