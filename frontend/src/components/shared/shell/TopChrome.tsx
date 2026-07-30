"use client";

import { useAuth } from "@auth/context/AuthContext";
import { Led } from "@components/ds/Led";
import { Overline } from "@components/ds/Overline";
import { ROUTES } from "@components/shared/config/constants";
import { COUNTER_DIGITS, SHELL_TABS } from "@components/shared/shell/config/constants";
import useShellRoute from "@components/shared/shell/helpers/useShellRoute";
import useShellCounts from "@components/shared/shell/services/useShellCounts";
import { cn } from "@lib/utils";
import { SHELL_TEXT } from "@text/shell";
import Link from "next/link";

/* `.gr-strip` — the 38px strip along the top of every application screen: wordmark, the
 * four module tabs, and the account meta pushed right.
 *
 * It is the shell's only piece of chrome that never scrolls away, which is why it carries
 * both halves of the system's signature elevation: the hair line along its top edge and a
 * tight drop below it, so the desk reads as being underneath rather than beside it.
 *
 * Below `@3xl` it grows to 48px and loses everything but the wordmark and the LED — the
 * tabs move to `TabBar` and the meta row has nowhere to go on a phone. */
function TopChrome() {
  const { tab } = useShellRoute();
  const counts = useShellCounts();
  const email = useAuth().user?.email;

  return (
    <header
      className={cn(
        "relative z-10 flex h-9.5 shrink-0 items-center gap-4.5 border-b border-gr-border-2 bg-gr-panel-2 px-4",
        "shadow-gr-chrome inset-shadow-gr-hair",
        "@max-3xl:h-12 @max-3xl:gap-3 @max-3xl:px-3.5",
      )}
    >
      <Link
        href={ROUTES.bookmarks.path}
        aria-label={SHELL_TEXT.aria.home}
        className="flex items-baseline gap-2"
      >
        <span className="text-xs font-semibold tracking-caps text-gr-fg-2">{SHELL_TEXT.wordmark}</span>
        <span className="text-3xs tracking-widest text-gr-fg-4">{SHELL_TEXT.build}</span>
      </Link>

      <nav
        aria-label={SHELL_TEXT.aria.modules}
        className="flex gap-1 @max-3xl:hidden"
      >
        {SHELL_TABS.map((item) => {
          const on = item.tab === tab;
          const count = item.count ? counts[item.count] : undefined;

          return (
            <Link
              key={item.tab}
              href={item.path}
              aria-current={on ? "page" : undefined}
              className={cn(
                "flex h-6 items-center gap-2 rounded-md border px-3",
                "text-2xs uppercase tracking-widest transition-colors duration-120",
                // The border is transparent at rest rather than absent: the active state
                // adds one, and without this the lit tab would be 2px taller and wider
                // than its neighbours and nudge the whole row.
                on
                  ? "border-gr-border bg-gr-panel text-gr-fg-2 shadow-gr-1 inset-shadow-gr-hair"
                  : "border-transparent text-gr-fg-3 hover:bg-white/22 hover:text-gr-fg",
              )}
            >
              <i
                aria-hidden
                className={cn(
                  "block size-1.5 shrink-0 rounded-full",
                  on ? "bg-gr-accent ring-3 ring-gr-ring" : "bg-gr-fg-4",
                )}
              />
              {SHELL_TEXT.tabs[item.tab]}
              {/* Nothing while the count is loading — `000` would be a wrong number, not a
                  pending one. */}
              {count !== undefined && (
                <span className="num text-gr-fg-4">{String(count).padStart(COUNTER_DIGITS, "0")}</span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="ml-auto flex items-center gap-3.5">
        <div className="flex items-center gap-3.5 @max-3xl:hidden">
          {/* `asChild`: wrapped, the link would be a 12px flex item around a 10px label and its
              strut would sit it below the `Overline`s beside it. */}
          <Overline
            asChild
            className="hover:text-gr-fg"
          >
            <Link href={ROUTES.about.path}>{SHELL_TEXT.about}</Link>
          </Overline>
          <Overline>{SHELL_TEXT.uptime}</Overline>
          {/* The handoff makes the email the way back out of the session ("l'email du
              chrome → login"), which in real bkmk means /logout — since AUTH 04 (COS-296)
              a `POST /users/logout` that destroys the session server-side, then a redirect.
              Hence the aria-label: the address alone does not say what clicking it does.
              ⚠️ A click is still an immediate sign-out with no menu and no confirmation.
              COS-321 replaces this link with the user menu the handoff draws. */}
          {email && (
            <Link
              href="/logout"
              aria-label={SHELL_TEXT.aria.signOut}
              className="text-3xs text-gr-fg-3 hover:text-gr-fg"
            >
              {email}
            </Link>
          )}
        </div>
        <Led />
      </div>
    </header>
  );
}

export { TopChrome };
