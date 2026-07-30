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
  onSubmit,
  error,
}: {
  copy: SignInCopy;
  switchHref: string;
  onSubmit: (values: SignInPayload) => Promise<void>;
  error?: string | null;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInPayload>({
    resolver: zodResolver(SignInPayloadSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  return (
    <AuthCard
      action={copy}
      switchHref={switchHref}
      error={error}
      busy={isSubmitting}
      onSubmit={handleSubmit(onSubmit)}
    >
      <AuthField
        id="auth-identity"
        label={copy.identity}
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register("email")}
      />
      <AuthField
        id="auth-key"
        label={copy.key}
        type="password"
        autoComplete="current-password"
        error={errors.password?.message}
        {...register("password")}
      />
    </AuthCard>
  );
}

export { SignInForm };
