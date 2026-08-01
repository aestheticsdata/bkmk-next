"use client";

import { Overline } from "@components/ds/Overline";
import { AuthCard } from "@components/shared/authForms/AuthCard";
import { AuthField } from "@components/shared/authForms/AuthField";
import { RevealToggle } from "@components/shared/authForms/RevealToggle";
import { Progress } from "@components/ui/progress";
import { measurePassword } from "@helpers/passwordStrength";
import { zodResolver } from "@hookform/resolvers/zod";
import { MISMATCH_MESSAGE, SignUpFormSchema } from "@src/schemas/auth";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { SignUpCopy } from "@components/shared/authForms/types";
import type { SignUpFormValues } from "@src/schemas/auth";

/* The sign-up card (COS-298): the handoff's identity, the two-column key pair and the strength
 * gauge, plus the field the handoff has no way of knowing about — the recovery passphrase that
 * replaces password recovery by email.
 *
 * **`SignUpFormSchema`, not `SignUpPayloadSchema`.** The form holds two confirmations the request
 * must never carry. The schema is also where each pair is compared, so "keys do not match" arrives
 * through the same channel as every other message instead of being special-cased in the component.
 *
 * **Both secrets are revealed and confirmed, and neither confirmation is revealable.** A field you
 * cannot read is a typo you cannot see, so the eye COS-297 took off the sign-in form is back on the
 * two fields where you are *choosing* a secret rather than proving one. The confirmations stay
 * masked whatever the toggles say: revealing a pair would make it one field read twice instead of an
 * independent check. That check matters most on the passphrase — a mistyped key is found the next
 * time you sign in, at the cost of one attempt, while a mistyped passphrase is found the day it is
 * needed, which is the day nothing can repair it.
 *
 * **The gauge is `aria-hidden` and the word beside it is not.** A bar and a label carrying the same
 * judgement is one signal twice; the word is the one that survives being read aloud.
 *
 * ⚠️ **No import checkbox.** The handoff draws `[x] import my Session Buddy export after signup`;
 * it was built, then dropped on the owner's call. Registering and importing are two decisions, and
 * tying the second to a checkbox on the first only buys a redirect — the import screen is reachable
 * from the chrome as soon as you are in. */
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
    watch,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<SignUpFormValues>({
    resolver: zodResolver(SignUpFormSchema),
    mode: "onTouched",
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      recoveryPassphrase: "",
      confirmRecoveryPassphrase: "",
    },
  });

  const [keyRevealed, setKeyRevealed] = useState(false);
  const [passphraseRevealed, setPassphraseRevealed] = useState(false);
  const values = watch();
  const strength = measurePassword(values.password);

  /* **Validate late, clear early, and say nothing about an empty field until submit.**
   *
   * `mode: "onTouched"` covers the first two: no message while you are still typing a field for the
   * first time, then re-checked on every keystroke so it clears the moment you fix it. What it does
   * not cover is the field you **empty**: react-hook-form keeps the last verdict, so clearing a bad
   * key left "min 12 chars" sitting over a blank box — being told you are wrong before you have
   * written anything.
   *
   * An empty field is still invalid, so the message cannot simply be dropped: it comes back on
   * submit, which is when an empty required field genuinely needs naming, and `isSubmitted` is what
   * distinguishes the two moments. */
  const messageFor = (field: keyof SignUpFormValues) =>
    isSubmitted || values[field] ? errors[field]?.message : undefined;

  /* **The one exception, for both confirm fields: the mismatch is live.**
   *
   * `onTouched` surfaces a field's error only once it has lost focus, which is the right moment for
   * "min 12 chars" — you have not finished typing — and the wrong one for a confirmation. You are
   * copying a secret you cannot read; the whole value of the field is being told *while you type*
   * that the copy has diverged, not after you tab away. So this compares the pair itself and does
   * not wait for a blur.
   *
   * `MISMATCH_MESSAGE` comes from the schema, which still enforces the same rule on submit — two
   * places can say it, and neither can say it differently. Empty means "nothing typed yet", not
   * "different", so it falls through to the gated message and its "required" on submit. */
  const confirmMessageFor = (field: "confirmPassword" | "confirmRecoveryPassphrase", against: string) => {
    const value = values[field];
    return value && value !== against ? MISMATCH_MESSAGE : messageFor(field);
  };

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

      {/* The toggle rides the **second** column, at the end of the pair's line: it belongs to the
          pair, and the row it sits in is the row both labels share. */}
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
          error={confirmMessageFor("confirmPassword", values.password)}
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

      <div>
        {/* The same 16px header a field has, so the gauge sits on the fields' rhythm and the word
            appearing beside `strength` cannot nudge it. */}
        <div className="flex h-4 items-center gap-2 leading-4">
          <Overline>{copy.strength}</Overline>
          {strength.label && <Overline className="ml-auto text-gr-fg-4">{strength.label}</Overline>}
        </div>
        <Progress
          aria-hidden="true"
          value={strength.percent}
          className="mt-1.5"
        />
      </div>

      {/* Stacked, where `key` / `confirm key` are side by side: a passphrase is a phrase, and two
          half-width columns would wrap it mid-sentence — which is exactly the field where you need
          to be able to read what you typed. */}
      <div className="grid gap-3.5">
        <AuthField
          id="auth-passphrase"
          label={copy.passphrase}
          hint={copy.passphraseHint}
          type={passphraseRevealed ? "text" : "password"}
          autoComplete="new-password"
          error={messageFor("recoveryPassphrase")}
          action={
            <RevealToggle
              revealed={passphraseRevealed}
              reveal={copy.reveal}
              conceal={copy.conceal}
              controls="auth-passphrase auth-confirm-passphrase"
              onToggle={() => setPassphraseRevealed((shown) => !shown)}
            />
          }
          {...register("recoveryPassphrase")}
        />
        <AuthField
          id="auth-confirm-passphrase"
          label={copy.confirmPassphrase}
          type={passphraseRevealed ? "text" : "password"}
          autoComplete="new-password"
          error={confirmMessageFor("confirmRecoveryPassphrase", values.recoveryPassphrase)}
          {...register("confirmRecoveryPassphrase")}
        />
        <p className="text-2xs text-gr-fg-4">{copy.passphraseNote}</p>
      </div>
    </AuthCard>
  );
}

export { SignUpForm };
