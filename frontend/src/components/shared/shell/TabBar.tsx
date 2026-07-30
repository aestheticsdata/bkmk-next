"use client";

import { SHELL_TABS } from "@components/shared/shell/config/constants";
import useShellRoute from "@components/shared/shell/helpers/useShellRoute";
import { cn } from "@lib/utils";
import { SHELL_TEXT } from "@text/shell";
import Link from "next/link";

/* `.gr-tabbar` — the four-column bar at the bottom of the screen, and where the chrome's
 * tabs go when there is no room for them.
 *
 * **Not "mobile", narrow.** The switch is a container query on the app screen, so this
 * appears in a 700px split view on a 27-inch display just as it does on a phone — which is
 * the whole point of the DS choosing `@max-3xl` over a media query.
 *
 * It carries no counters, unlike the chrome's tabs: the handoff gives each button a glyph
 * and a word, and a three-digit number under a 48px target would crowd it. The counts are
 * still one screen away, on the index itself. */
function TabBar() {
  const { tab } = useShellRoute();

  return (
    <nav
      aria-label={SHELL_TEXT.aria.modules}
      className="hidden shrink-0 grid-cols-4 gap-1.5 border-t border-gr-border-2 bg-gr-panel-2 px-2 pt-1.5 pb-2.5 inset-shadow-gr-hair @max-3xl:grid"
    >
      {SHELL_TABS.map((item) => {
        const on = item.tab === tab;

        return (
          <Link
            key={item.tab}
            href={item.path}
            aria-current={on ? "page" : undefined}
            className={cn(
              "flex h-12 flex-col items-center justify-center gap-1 rounded-xl border",
              "text-3xs uppercase tracking-widest transition-colors duration-120",
              // Transparent at rest for the same reason as the chrome's tabs: the lit
              // button must not be a pixel bigger than the other three.
              on
                ? "border-gr-border bg-gr-panel text-gr-fg-2 shadow-gr-1 inset-shadow-gr-hair"
                : "border-transparent text-gr-fg-3",
            )}
          >
            <span
              aria-hidden
              className="text-sm leading-none"
            >
              {item.glyph}
            </span>
            {SHELL_TEXT.tabs[item.tab]}
          </Link>
        );
      })}
    </nav>
  );
}

export { TabBar };
