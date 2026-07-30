"use client";

import { MiniButton } from "@components/ds/MiniButton";
import { Overline } from "@components/ds/Overline";
import { AuthCard } from "@components/shared/authForms/AuthCard";
import { AuthField } from "@components/shared/authForms/AuthField";
import { Checkbox } from "@components/ui/checkbox";
import { Progress } from "@components/ui/progress";
import { measurePassword } from "@helpers/passwordStrength";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignUpFormSchema } from "@src/schemas/auth";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";

import type { SignUpCopy } from "@components/shared/authForms/types";
import type { SignUpFormValues } from "@src/schemas/auth";

/* The sign-up card (COS-298): the handoff's identity, the two-column key pair, the strength gauge
 * and the import checkbox — plus the one field the handoff has no way of knowing about, the
 * recovery passphrase that replaces password recovery by email.
 *
 * **`SignUpFormSchema`, not `SignUpPayloadSchema`.** The form holds two values the request must
 * never carry: `confirmPassword`, which is a typo check, and `importAfterSignup`, which decides
 * where the screen goes next. The schema is also where the two keys are compared, so "keys do not
 * match" arrives through the same channel as every other message instead of being special-cased
 * in the component.
 *
 * **The passphrase can be revealed, and only it.** A mistyped key costs one more attempt; a
 * mistyped passphrase silently removes the only way back into the account, and nothing will ever
 * tell its owner. So the eye that COS-297 took off the sign-in form comes back here as the
 * `MiniButton` that comment promised — in the field's header, outside the `<label>`, which is what
 * `ds/Field`'s `action` slot is for.
 *
 * **The gauge is `aria-hidden` and the word beside it is not.** A bar and a label carrying the same
 * judgement is one signal twice; the word is the one that survives being read aloud. */
function SignUpForm({
  copy,
  switchHref,
  onSubmit,
  error,
}: {
  copy: SignUpCopy;
  switchHref: string;
  onSubmit: (values: SignUpFormValues) => Promise<void>;
  error?: string | null;
}) {
  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpFormSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      recoveryPassphrase: "",
      importAfterSignup: false,
    },
  });

  const [revealed, setRevealed] = useState(false);
  const strength = measurePassword(watch("password"));

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
        placeholder={copy.identityPlaceholder}
        error={errors.email?.message}
        {...register("email")}
      />

      <div className="grid grid-cols-2 gap-3 @max-3xl:grid-cols-1">
        <AuthField
          id="auth-key"
          label={copy.key}
          type="password"
          autoComplete="new-password"
          placeholder={copy.keyPlaceholder}
          error={errors.password?.message}
          {...register("password")}
        />
        <AuthField
          id="auth-confirm-key"
          label={copy.confirmKey}
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register("confirmPassword")}
        />
      </div>

      <div>
        <div className="flex items-baseline gap-2">
          <Overline>{copy.strength}</Overline>
          {strength.label && <Overline className="ml-auto text-gr-fg-4">{strength.label}</Overline>}
        </div>
        <Progress
          aria-hidden="true"
          value={strength.percent}
          className="mt-1.5"
        />
      </div>

      <div>
        <AuthField
          id="auth-passphrase"
          label={copy.passphrase}
          hint={copy.passphraseHint}
          type={revealed ? "text" : "password"}
          autoComplete="new-password"
          error={errors.recoveryPassphrase?.message}
          action={
            <MiniButton
              type="button"
              aria-pressed={revealed}
              onClick={() => setRevealed((shown) => !shown)}
            >
              {revealed ? copy.conceal : copy.reveal}
            </MiniButton>
          }
          {...register("recoveryPassphrase")}
        />
        <p className="mt-1.5 text-2xs text-gr-fg-4">{copy.passphraseNote}</p>
      </div>

      <div className="flex items-center gap-2">
        <Controller
          name="importAfterSignup"
          control={control}
          render={({ field }) => (
            <Checkbox
              id="auth-import"
              checked={field.value}
              onBlur={field.onBlur}
              onCheckedChange={(checked) => field.onChange(checked === true)}
            />
          )}
        />
        <label
          htmlFor="auth-import"
          className="text-2xs text-gr-fg-3"
        >
          {copy.importLabel}
        </label>
      </div>
    </AuthCard>
  );
}

export { SignUpForm };
