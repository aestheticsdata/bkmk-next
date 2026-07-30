"use client";

import { Overline } from "@components/ds/Overline";
import { Button } from "@components/ui/button";
import Link from "next/link";

import type { AuthActionCopy } from "@components/shared/authForms/types";
import type * as React from "react";

/* The handoff's `.gr-card` at `padding: 22`, and the action row along its bottom (COS-297,
 * extracted here by COS-298). Both auth screens are this card with different contents.
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
 * control is unavailable with no reason given. */
function AuthCard({
  action,
  switchHref,
  error,
  busy = false,
  onSubmit,
  children,
}: {
  action: AuthActionCopy;
  /** Where `action.switchTo` goes — the other auth screen. */
  switchHref: string;
  /** What the server said, if it refused. */
  error?: string | null;
  busy?: boolean;
  onSubmit: React.FormEventHandler<HTMLFormElement>;
  children: React.ReactNode;
}) {
  return (
    <form
      noValidate
      onSubmit={onSubmit}
      className="grid gap-3.5 rounded-xl border border-gr-border bg-gr-panel p-5.5 shadow-gr-2 inset-shadow-gr-hair"
    >
      {children}

      <div className="flex items-center gap-3 @max-3xl:flex-wrap">
        <Button
          type="submit"
          variant="primary"
          size="chrome"
          disabled={busy}
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
    </form>
  );
}

export { AuthCard };
