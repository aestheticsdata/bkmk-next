"use client";

import { AuthCard } from "@components/shared/authForms/AuthCard";
import { AuthField } from "@components/shared/authForms/AuthField";
import { RevealToggle } from "@components/shared/authForms/RevealToggle";
import { zodResolver } from "@hookform/resolvers/zod";
import { MISMATCH_MESSAGE, RecoverFormSchema } from "@src/schemas/auth";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { RecoverCopy } from "@components/shared/authForms/types";
import type { RecoverFormValues } from "@src/schemas/auth";

/* The recovery card (COS-324, AUTH 05): the address, the passphrase being spent, and the new key
 * with its confirmation.
 *
 * It is sign-up's card with the halves swapped. There, both secrets are being chosen and both are
 * confirmed; here the passphrase is being **proved** — you either have it or you do not, and a
 * second box for it would be a copy of a value you are reading off paper rather than a check on one
 * you invented. The new key keeps its confirmation for the reason it has one at sign-up: a mistyped
 * key you cannot see costs you the account you just recovered.
 *
 * ⚠️ **The passphrase is revealable, which sign-in's key deliberately is not.** COS-297 took the eye
 * off the sign-in form on the grounds that a wrong key costs one more attempt. That reasoning does
 * not carry here on either half. The phrase is twenty characters minimum, transcribed by hand from
 * wherever it was written down, and a wrong attempt costs one of the **five** the route allows per
 * address in a quarter of an hour — so being unable to read what you typed is how you lock yourself
 * out of your own recovery.
 *
 * The two toggles are separate, as they are on sign-up: unmasking the key pair and unmasking the
 * passphrase are different decisions, and the confirmation follows the key's toggle so the pair
 * stays readable together. */
function RecoverForm({
  copy,
  switchHref,
  onSubmit,
  error,
}: {
  copy: RecoverCopy;
  switchHref: string;
  onSubmit: (values: RecoverFormValues) => Promise<void>;
  error?: string | null;
}) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<RecoverFormValues>({
    resolver: zodResolver(RecoverFormSchema),
    mode: "onTouched",
    defaultValues: { email: "", recoveryPassphrase: "", password: "", confirmPassword: "" },
  });

  const [passphraseRevealed, setPassphraseRevealed] = useState(false);
  const [keyRevealed, setKeyRevealed] = useState(false);
  const values = watch();

  /* Validate on leaving a field, clear on the keystroke that fixes it, and say nothing about a field
   * you have **emptied** until submit — the rule both other forms use, and the note on `SignUpForm`
   * explains what `mode: "onTouched"` alone leaves standing over a blank box. */
  const messageFor = (field: keyof RecoverFormValues) =>
    isSubmitted || values[field] ? errors[field]?.message : undefined;

  /* The mismatch is live rather than on blur: you are copying a secret you cannot read, and the
   * value of the field is being told *while* you type that the copy has diverged. Empty means
   * "nothing yet", not "different", so it falls through to the gated message. */
  const confirmMessage =
    values.confirmPassword && values.confirmPassword !== values.password
      ? MISMATCH_MESSAGE
      : messageFor("confirmPassword");

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
        error={messageFor("email")}
        {...register("email")}
      />

      {/* Stacked and full width, like sign-up's: a passphrase is a phrase, and half a column wraps
          it mid-sentence — on the one screen where reading back what you typed is the whole point. */}
      <AuthField
        id="auth-passphrase"
        label={copy.passphrase}
        hint={copy.passphraseHint}
        type={passphraseRevealed ? "text" : "password"}
        /* `current-password`, not `new-password`: this is a secret the browser may already hold from
           sign-up, and offering to fill it is the correct behaviour for a field being proved. */
        autoComplete="current-password"
        error={messageFor("recoveryPassphrase")}
        action={
          <RevealToggle
            revealed={passphraseRevealed}
            reveal={copy.reveal}
            conceal={copy.conceal}
            controls="auth-passphrase"
            onToggle={() => setPassphraseRevealed((shown) => !shown)}
          />
        }
        {...register("recoveryPassphrase")}
      />

      {/* The toggle rides the second column, at the end of the row both labels share — sign-up's
          arrangement, for the same reason: it belongs to the pair rather than to either field. */}
      <div className="grid grid-cols-2 gap-3 @max-3xl:grid-cols-1">
        <AuthField
          id="auth-key"
          label={copy.key}
          type={keyRevealed ? "text" : "password"}
          autoComplete="new-password"
          placeholder={copy.keyPlaceholder}
          error={messageFor("password")}
          {...register("password")}
        />
        <AuthField
          id="auth-confirm-key"
          label={copy.confirmKey}
          type={keyRevealed ? "text" : "password"}
          autoComplete="new-password"
          error={confirmMessage}
          action={
            <RevealToggle
              revealed={keyRevealed}
              reveal={copy.reveal}
              conceal={copy.conceal}
              controls="auth-key auth-confirm-key"
              onToggle={() => setKeyRevealed((shown) => !shown)}
            />
          }
          {...register("confirmPassword")}
        />
      </div>

      <p className="text-2xs text-gr-fg-4">{copy.note}</p>
    </AuthCard>
  );
}

export { RecoverForm };
