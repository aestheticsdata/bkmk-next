"use client";

import { Field } from "@components/ds/Field";
import { Overline } from "@components/ds/Overline";
import { Button } from "@components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignInPayloadSchema } from "@src/schemas/auth";
import Link from "next/link";
import { useForm } from "react-hook-form";

import type { LoginValues, SharedLoginFormProps } from "@src/components/shared/sharedLoginForm/interfaces";

/* The auth card, shared by sign-in and sign-up (COS-297) — the handoff's `.gr-card` at
 * `padding: 22`, carrying the two fields and the action row.
 *
 * **Validation comes from the zod schema, not from hand-written rules.** `SignInPayloadSchema`
 * is the same object the sign-in request is validated against, and its backend twin bounds the
 * same two fields — so the form cannot drift from what the API accepts. That is what PLAT 05
 * put the schemas there for; the previous version carried `required: true` and its own error
 * strings instead.
 *
 * **`mode: "onTouched"`, and the button is never disabled by validity.** The old form kept the
 * submit disabled until `isValid`, which is the worst of both: nothing explains why it will not
 * press, and assistive technology is told the control is unavailable with no reason given.
 * Validating a field when it is left instead puts the message next to what caused it, and the
 * button only greys out while a request is in flight.
 *
 * The ids are passed in rather than left to `Field`'s `useId`, because each error has to be
 * wired to its input through `aria-describedby` — an error nobody is told about is decoration.
 *
 * ⚠️ The password field is a plain one. The show/hide eye of the old form is gone along with
 * its two FontAwesome icons, and the handoff draws no such control; if it comes back it should
 * be a `MiniButton` inside the field rather than an icon set imported for one screen. */
const SharedLoginForm = ({ copy, switchHref, onSubmit, error }: SharedLoginFormProps) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(SignInPayloadSchema),
    mode: "onTouched",
    defaultValues: { email: "", password: "" },
  });

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="grid gap-3.5 rounded-xl border border-gr-border bg-gr-panel p-5.5 shadow-gr-2 inset-shadow-gr-hair"
    >
      <div>
        <Field
          id="auth-identity"
          label={copy.identity}
          type="email"
          autoComplete="email"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? "auth-identity-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <Overline
            id="auth-identity-error"
            className="mt-1.5 block text-gr-accent-2"
          >
            {errors.email.message}
          </Overline>
        )}
      </div>

      <div>
        <Field
          id="auth-key"
          label={copy.key}
          type="password"
          autoComplete="current-password"
          aria-invalid={errors.password ? true : undefined}
          aria-describedby={errors.password ? "auth-key-error" : undefined}
          {...register("password")}
        />
        {errors.password && (
          <Overline
            id="auth-key-error"
            className="mt-1.5 block text-gr-accent-2"
          >
            {errors.password.message}
          </Overline>
        )}
      </div>

      {/* The server's refusal, inside the card rather than in a toast: it belongs beside the
          fields it is about, and a toast that has faded cannot be read again. `role="alert"`
          because it arrives after the page has settled. */}
      {error && (
        <div
          role="alert"
          className="text-2xs text-gr-accent-2"
        >
          {error}
        </div>
      )}

      <div className="flex items-center gap-3 @max-3xl:flex-wrap">
        <Button
          type="submit"
          variant="primary"
          size="chrome"
          disabled={isSubmitting}
        >
          {copy.submit}
        </Button>
        <Overline>{copy.or}</Overline>
        <Link href={switchHref}>
          <Overline className="text-gr-accent hover:text-gr-fg-2">{copy.switchTo}</Overline>
        </Link>
        <Overline className="ml-auto text-gr-fg-4 @max-3xl:ml-0">{copy.note}</Overline>
      </div>
    </form>
  );
};

export default SharedLoginForm;
