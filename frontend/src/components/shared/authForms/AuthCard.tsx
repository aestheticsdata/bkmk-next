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
 * fields it is about, and a toast that has faded cannot be read again. `role="alert"` because it
 * arrives after the page has settled.
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
          disabled={busy}
        >
          {action.submit}
        </Button>
        <Overline>{action.or}</Overline>
        <Link href={switchHref}>
          <Overline className="text-gr-accent hover:text-gr-fg-2">{action.switchTo}</Overline>
        </Link>
        <Overline className="ml-auto text-gr-fg-4 @max-3xl:ml-0">{action.note}</Overline>
      </div>
    </form>
  );
}

export { AuthCard };
