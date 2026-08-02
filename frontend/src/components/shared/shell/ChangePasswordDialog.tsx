"use client";

import { useAuth } from "@auth/context/AuthContext";
import useChangePasswordService from "@auth/useChangePasswordService";
import { Overline } from "@components/ds/Overline";
import { AuthField } from "@components/shared/authForms/AuthField";
import { RevealToggle } from "@components/shared/authForms/RevealToggle";
import { Button } from "@components/ui/button";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordFormSchema, MISMATCH_MESSAGE } from "@src/schemas/auth";
import { ACCOUNT_TEXT } from "@text/account";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { ChangePasswordFormValues } from "@src/schemas/auth";

/* `change password` (COS-404) — the entry COS-321 drew and left disabled.
 *
 * Same primitives as the edit modal (`ui/dialog`) and the same field/reveal-toggle pair sign-up
 * and `/recover` use, at the delete confirmation's width (`max-w-110`, COS-320) — three fields is
 * closer to that dialog's shape than to the edit modal's.
 *
 * **`currentPassword` has no reveal toggle.** Same reasoning COS-297 gave for sign-in's own key
 * field: this is a secret you already know and are proving, not one you are choosing and reading
 * back — a wrong attempt costs a retry, not a lost account. `newPassword` and its confirmation
 * share one toggle, exactly like sign-up's pair.
 *
 * On success it calls `setAuthState` with the response's `user`/`csrfToken` directly, rather than
 * re-fetching `GET /users/me` — the backend replays `establishSession` for this exact reason, so
 * the dialog already holds the freshest state without a second round trip. */
function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { changePasswordService } = useChangePasswordService();
  const { setAuthState } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordFormSchema),
    mode: "onTouched",
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const values = watch();
  const messageFor = (field: keyof ChangePasswordFormValues) =>
    isSubmitted || values[field] ? errors[field]?.message : undefined;

  /* Live rather than on blur, like `RecoverForm`'s: you are copying a secret you cannot read on
   * screen, and the field should say the copy has diverged while you are still typing it. */
  const confirmMessage =
    values.confirmNewPassword && values.confirmNewPassword !== values.newPassword
      ? MISMATCH_MESSAGE
      : messageFor("confirmNewPassword");

  const onSubmit = async (formValues: ChangePasswordFormValues) => {
    setServerError(null);
    try {
      const response = await changePasswordService({
        currentPassword: formValues.currentPassword,
        newPassword: formValues.newPassword,
      });
      setAuthState(response.user, response.csrfToken);
      reset();
      onOpenChange(false);
    } catch {
      setServerError(ACCOUNT_TEXT.password.failed);
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
          <DialogTitle>{ACCOUNT_TEXT.password.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            <AuthField
              id="account-current-password"
              label={ACCOUNT_TEXT.password.current}
              type="password"
              autoComplete="current-password"
              error={messageFor("currentPassword")}
              {...register("currentPassword")}
            />

            <AuthField
              id="account-new-password"
              label={ACCOUNT_TEXT.password.next}
              hint={ACCOUNT_TEXT.password.nextHint}
              type={revealed ? "text" : "password"}
              autoComplete="new-password"
              error={messageFor("newPassword")}
              action={
                <RevealToggle
                  revealed={revealed}
                  reveal={ACCOUNT_TEXT.password.reveal}
                  conceal={ACCOUNT_TEXT.password.conceal}
                  controls="account-new-password account-confirm-new-password"
                  onToggle={() => setRevealed((shown) => !shown)}
                />
              }
              {...register("newPassword")}
            />

            <AuthField
              id="account-confirm-new-password"
              label={ACCOUNT_TEXT.password.confirmNext}
              type={revealed ? "text" : "password"}
              autoComplete="new-password"
              error={confirmMessage}
              {...register("confirmNewPassword")}
            />

            {serverError && <Overline className="text-gr-accent-2">{serverError}</Overline>}
          </DialogBody>

          <DialogFooter>
            {/* Primary action first, cancel second, both left — `EditFooter`'s and
                `DeleteConfirm`'s order, not the reverse: this system never puts cancel before the
                button that does the thing. */}
            <Button
              type="submit"
              variant="primary"
              size="chrome"
              disabled={isSubmitting}
            >
              {ACCOUNT_TEXT.password.submit}
            </Button>
            <Button
              type="button"
              variant="chrome"
              size="chrome"
              onClick={() => onOpenChange(false)}
            >
              {ACCOUNT_TEXT.password.cancel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ChangePasswordDialog };
