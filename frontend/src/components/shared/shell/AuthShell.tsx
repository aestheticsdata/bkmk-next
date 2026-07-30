import { Led } from "@components/ds/Led";
import { Overline } from "@components/ds/Overline";
import { AUTH_TEXT } from "@text/auth";

import type * as React from "react";

/* The frame of the two public auth screens (COS-297): **reduced chrome → centred block →
 * status bar**. `app/(public)/login` and `app/(public)/signup` render into it.
 *
 * It is a sibling of `AppShell`, not a variant of it, and the strip below is deliberately not
 * `TopChrome`. The application chrome exists to carry the four modules, the index counters and
 * the account email — every one of which needs a session, which is precisely what this screen
 * does not have. Sharing one component would mean a prop turning three quarters of it off.
 *
 * What it does share, because these are system decisions rather than screen decisions: the
 * `@container` declaration that every `@max-3xl:` variant in the design system resolves
 * against, the 38px strip height, the grey field, and `h-dvh` so the bars stay pinned.
 *
 * The block is centred with `place-items-center` on a grid rather than `justify-center` on a
 * flex column: at a height where the card no longer fits, grid centring still lets the
 * overflow scroll in both directions, where a centred flex child would be clipped at the top.
 */
function AuthShell({ hints, children }: { hints: readonly string[]; children: React.ReactNode }) {
  return (
    <div className="@container flex h-dvh flex-col bg-gr-bg font-mono text-xs text-gr-fg">
      <header className="relative z-10 flex h-9.5 shrink-0 items-center gap-4.5 border-b border-gr-border-2 bg-gr-panel-2 px-4 shadow-gr-chrome inset-shadow-gr-hair @max-3xl:h-12 @max-3xl:gap-3 @max-3xl:px-3.5">
        <span className="text-xs font-semibold tracking-caps text-gr-fg-2">{AUTH_TEXT.wordmark}</span>
        <Overline>{AUTH_TEXT.screen}</Overline>
        <Overline className="ml-auto @max-3xl:hidden">{AUTH_TEXT.build}</Overline>
        <Led />
      </header>

      <main className="grid min-h-0 flex-1 animate-gr-screen place-items-center overflow-auto p-3.5 @max-3xl:p-2">
        {children}
      </main>

      <div className="flex h-6.5 shrink-0 items-center gap-4 px-4.5 pb-1 text-3xs uppercase tracking-widest text-gr-fg-4 @max-3xl:h-5 @max-3xl:px-3.5 @max-3xl:pb-0.5">
        <span className="text-gr-accent">{AUTH_TEXT.state}</span>
        {/* Below the fold the hints go, exactly as in the application shell: they name keys,
            and a phone has no keyboard to name them for. */}
        <div className="flex gap-4 @max-3xl:hidden">
          {hints.map((hint) => (
            <span key={hint}>{hint}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

export { AuthShell };
