"use client";

import { Overline } from "@components/ds/Overline";
import { Button } from "@components/ui/button";
import Link from "next/link";

import type { AuthActionCopy } from "@components/shared/authForms/types";
import type * as React from "react";

/* The handoff's `.gr-card` at `padding: 22`, and the action row that closes its padded body
 * (COS-297, extracted here by COS-298; the band below that body is COS-402). Both auth screens are
 * this card with different contents.
 *
 * The server's refusal renders **inside** the card rather than as a toast: it belongs beside the
 * fields it is about, and a toast that has faded cannot be read again.
 *
 * **It sits at the right end of this row, and costs no height** (COS-298) — the spot the handoff
 * reserves for an aside (`keys stored locally`, `self-hosted · no tracking`), both of which have
 * since been dropped as decoration. A refusal is what that space is actually worth: it appears in
 * place, on the line of the button that caused it, and the card does not grow. Giving it a row of
 * its own — reserved or not — either moves everything below it or costs a permanent line of dead air
 * on a design whose whole character is condensed. Both were tried; both were wrong.
 *
 * Always rendering the element also happens to be the correct way to run a live region:
 * `role="alert"` on a node already in the tree is announced reliably, where inserting the node and
 * its text in the same frame is the case screen readers are known to miss.
 *
 * The submit is disabled only while a request is in flight, never by validity. A button that will
 * not press and does not say why is the worst of both, and assistive technology is told the
 * control is unavailable with no reason given.
 *
 * `disabled` is the exception to that last rule (COS-416): sign-up locked down instance-wide
 * outranks "in flight", and unlike `busy` it is not transient. Only the sign-up screen ever
 * passes it — sign-in stays untouched. */
function AuthCard({
  action,
  switchHref,
  secondary,
  error,
  busy = false,
  disabled = false,
  onSubmit,
  children,
}: {
  action: AuthActionCopy;
  /** Where `action.switchTo` goes — the other auth screen. */
  switchHref: string;
  /** ⚠️ **A second way out, and only the sign-in screen has one** (COS-324): `recover account →`,
   *  pointing at `/recover`.
   *
   *  It rode **in the action row** until COS-402, on the argument that the row had slack between
   *  `register` and the refusal's `ml-auto` and so cost no height. That is still true and no longer
   *  the point: the row is what the card *does* — submit, or go to the other screen — and recovery
   *  is where you go when the card cannot do it. The band separates the two, at the price of its own
   *  height. Still a prop rather than something the screen renders below `AuthCard`, because it is
   *  inside the card's border and its corners. */
  secondary?: { href: string; label: string };
  /** What the server said, if it refused. */
  error?: string | null;
  busy?: boolean;
  /** `NEXT_PUBLIC_SIGNUPS_ENABLED === "false"` (COS-416) — the submit stays inert regardless of
   *  `busy`. */
  disabled?: boolean;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
}) {
  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="overflow-hidden rounded-xl border border-gr-border bg-gr-panel shadow-gr-2 inset-shadow-gr-hair"
    >
      {/* The padding is here rather than on the form (COS-402): the footer band is flush to the
          card's edges, so nothing above it can hold a gutter the band would have to escape.
          `overflow-hidden` on the form is the other half — the band would square off the two bottom
          corners of a `rounded-xl` card otherwise, which is the same note `ds/Card` carries for its
          command bar and its pager. */}
      <div className="grid gap-3.5 p-5.5">
        {children}

        <div className="flex items-center gap-3 @max-3xl:flex-wrap">
          <Button
            type="submit"
            variant="primary"
            size="chrome"
            disabled={busy || disabled}
          >
            {action.submit}
          </Button>
          <Overline>{action.or}</Overline>
          {/* `asChild`, so the link *is* the label. Wrapped, it would be a 12px flex item around 10px
              text and its strut would drop `sign in` a pixel and a half below `or`. */}
          <Overline
            asChild
            className="text-gr-accent hover:text-gr-fg-2"
          >
            <Link href={switchHref}>{action.switchTo}</Link>
          </Overline>
          <Overline
            role="alert"
            className="ml-auto truncate text-gr-accent-2 @max-3xl:ml-0"
          >
            {error}
          </Overline>
        </div>
      </div>

      {/* `ds/CommandBar`'s `PagerBar`, with this card's gutter instead of the index card's: same
          surface, same border on the top edge, same hair line under it. `px-5.5` rather than
          `px-3.5` so the link starts on the same vertical as the fields it sits below. */}
      {secondary && (
        <div className="border-t border-gr-border bg-gr-panel-2 px-5.5 py-2.5 inset-shadow-gr-hair">
          <Overline
            asChild
            className="text-gr-accent hover:text-gr-fg-2"
          >
            <Link href={secondary.href}>{secondary.label}</Link>
          </Overline>
        </div>
      )}
    </form>
  );
}

export { AuthCard };
