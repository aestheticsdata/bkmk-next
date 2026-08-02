"use client";

import { useAuth } from "@auth/context/AuthContext";
import useSetRecoveryPassphraseService from "@auth/useSetRecoveryPassphraseService";
import { Overline } from "@components/ds/Overline";
import { AuthField } from "@components/shared/authForms/AuthField";
import { RevealToggle } from "@components/shared/authForms/RevealToggle";
import { Button } from "@components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { MISMATCH_MESSAGE, SetRecoveryPassphraseFormSchema } from "@src/schemas/auth";
import { ACCOUNT_TEXT } from "@text/account";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { SetRecoveryPassphraseFormValues } from "@src/schemas/auth";

/* `set/change recovery passphrase` (COS-404) — the entry COS-321 drew and left disabled, and the
 * only place the 11 accounts that predate the `recovery_passphrase` column (COS-298) can ever get
 * one: `/recover` (COS-324) only spends a passphrase, it does not create one.
 *
 * `currentPassword` has no reveal toggle, for the reason `ChangePasswordDialog` gives at length —
 * it is being proved, not chosen. `recoveryPassphrase` and its confirmation share one, like
 * sign-up's pair, and carry `autoComplete="off"` rather than `current-password`/`new-password`:
 * COS-402 found both of those wrong for this exact secret on `RecoverForm` — there is no autofill
 * token for something held out of band, so the field claims none.
 *
 * The dialog touches no session and calls `setUser` rather than `setAuthState` on success: the
 * response carries only `hasRecoveryPassphrase`, and nothing about the session changed. */
function SetRecoveryPassphraseDialog({
  open,
  onOpenChange,
  hasRecoveryPassphrase,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasRecoveryPassphrase: boolean;
}) {
  const { setRecoveryPassphraseService } = useSetRecoveryPassphraseService();
  const { user, setUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<SetRecoveryPassphraseFormValues>({
    resolver: zodResolver(SetRecoveryPassphraseFormSchema),
    mode: "onTouched",
    defaultValues: { currentPassword: "", recoveryPassphrase: "", confirmRecoveryPassphrase: "" },
  });

  const values = watch();
  const messageFor = (field: keyof SetRecoveryPassphraseFormValues) =>
    isSubmitted || values[field] ? errors[field]?.message : undefined;

  const confirmMessage =
    values.confirmRecoveryPassphrase && values.confirmRecoveryPassphrase !== values.recoveryPassphrase
      ? MISMATCH_MESSAGE
      : messageFor("confirmRecoveryPassphrase");

  const onSubmit = async (formValues: SetRecoveryPassphraseFormValues) => {
    setServerError(null);
    try {
      const response = await setRecoveryPassphraseService({
        currentPassword: formValues.currentPassword,
        recoveryPassphrase: formValues.recoveryPassphrase,
      });
      if (user) {
        setUser({ ...user, hasRecoveryPassphrase: response.hasRecoveryPassphrase });
      }
      reset();
      onOpenChange(false);
    } catch {
      setServerError(ACCOUNT_TEXT.passphrase.failed);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset();
          setServerError(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-110">
        <DialogHeader>
          <DialogTitle>
            {hasRecoveryPassphrase ? ACCOUNT_TEXT.passphrase.titleChange : ACCOUNT_TEXT.passphrase.titleSet}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            <AuthField
              id="account-current-password-for-passphrase"
              label={ACCOUNT_TEXT.passphrase.current}
              type="password"
              autoComplete="current-password"
              error={messageFor("currentPassword")}
              {...register("currentPassword")}
            />

            <AuthField
              id="account-recovery-passphrase"
              label={ACCOUNT_TEXT.passphrase.next}
              hint={ACCOUNT_TEXT.passphrase.nextHint}
              type={revealed ? "text" : "password"}
              autoComplete="off"
              error={messageFor("recoveryPassphrase")}
              action={
                <RevealToggle
                  revealed={revealed}
                  reveal={ACCOUNT_TEXT.passphrase.reveal}
                  conceal={ACCOUNT_TEXT.passphrase.conceal}
                  controls="account-recovery-passphrase account-confirm-recovery-passphrase"
                  onToggle={() => setRevealed((shown) => !shown)}
                />
              }
              {...register("recoveryPassphrase")}
            />

            <AuthField
              id="account-confirm-recovery-passphrase"
              label={ACCOUNT_TEXT.passphrase.confirmNext}
              type={revealed ? "text" : "password"}
              autoComplete="off"
              error={confirmMessage}
              {...register("confirmRecoveryPassphrase")}
            />

            <p className="text-2xs text-gr-fg-4">{ACCOUNT_TEXT.passphrase.note}</p>

            {serverError && <Overline className="text-gr-accent-2">{serverError}</Overline>}
          </DialogBody>

          <DialogFooter>
            {/* Primary action first, cancel second, both left — same order as
                `ChangePasswordDialog`, `EditFooter` and `DeleteConfirm`. */}
            <Button
              type="submit"
              variant="primary"
              size="chrome"
              disabled={isSubmitting}
            >
              {ACCOUNT_TEXT.passphrase.submit}
            </Button>
            <Button
              type="button"
              variant="chrome"
              size="chrome"
              onClick={() => onOpenChange(false)}
            >
              {ACCOUNT_TEXT.passphrase.cancel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { SetRecoveryPassphraseDialog };
