"use client";

import { Overline } from "@components/ds/Overline";
import { ROUTES } from "@components/shared/config/constants";
import { UserMenu } from "@components/shared/shell/UserMenu";
import { cn } from "@lib/utils";
import { SHELL_TEXT } from "@text/shell";
import { MenuIcon, XIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/* The narrow-width stand-in for the chrome's `about` + `UserMenu` pair (COS-414), not an
 * addition to it — that pair is still in `TopChrome`, behind `@max-3xl:hidden`, exactly as
 * before. Below `@3xl` the chrome has no room for it, and `TabBar` only carries the four
 * module tabs, so `log out` had no trigger left anywhere in the fold. This is that trigger.
 *
 * **A plain conditional subtree, not a Radix `Dialog`/`Sheet`/`Portal`.** `AppShell` declares
 * `@container` exactly once, on the shell root, and documents the consequence: anything
 * portalled to `document.body` renders *outside* that element, so any `@max-3xl:` class on it
 * has no container to measure and evaluates false at every width — `ui/dialog.tsx`'s
 * `DialogHeader` carries the same note, and is why a modal in this system has no narrow
 * variant at all. The hamburger trigger below needs `@max-3xl:flex` to stay hidden above that
 * width, which only works if the whole panel stays under the shell's own `@container` rather
 * than escaping it the way a Radix-portalled panel would. `bg-gr-scrim backdrop-blur-[3px]` is
 * still borrowed from `ui/dialog.tsx` — a plain class, not the Radix piece that carries it there.
 *
 * Scope is deliberately narrow: this panel carries only what `@max-3xl:hidden` hides today,
 * `about` and `UserMenu`. The four module tabs already work under `@max-3xl` via `TabBar` and
 * are not duplicated here. */
function MobileMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Every close path routes through here rather than `setOpen(false)` directly: `aria-hidden`
  // lands on the panel the very next render, and if focus is still on one of its descendants
  // (the X button, `about`, the `UserMenu` trigger) that's an aria-hidden subtree holding DOM
  // focus — a WCAG 4.1.2 failure some screen readers (VoiceOver in particular) get stuck on.
  // Focusing the trigger both blurs whatever was focused inside the panel and puts focus back
  // where the user opened it from.
  const close = () => {
    setOpen(false);
    triggerRef.current?.focus();
  };

  // Mirrors pfa's NavBar.tsx: restore whatever the body's overflow already was rather than
  // hard-coding "", so this can't clobber a rule some other panel left behind.
  useEffect(() => {
    if (!open) return;

    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previous;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      {/* Same chrome hover-wash as the `about`/`UserMenu` triggers this replaces (see
          `TopChrome`), just sized as a touch target against the header's own `@max-3xl:h-12`
          rather than the 24px boxes those two use at full width. */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        aria-label={SHELL_TEXT.aria.openMenu}
        className={cn(
          "hidden size-8 shrink-0 items-center justify-center rounded-md text-gr-fg-3",
          "transition-colors duration-120 outline-none hover:bg-white/22 hover:text-gr-fg",
          "focus-visible:ring-3 focus-visible:ring-gr-ring @max-3xl:flex",
        )}
      >
        <MenuIcon className="size-4" />
      </button>

      {/* Stays mounted while closed rather than being conditionally rendered: the panel slides
          in, so it needs to exist in the layout for the transform to animate from. `aria-hidden`
          plus `pointer-events-none` keep it out of the tab order and unclickable at rest. */}
      <div
        aria-hidden
        onClick={close}
        className={cn(
          "fixed inset-0 z-30 bg-gr-scrim backdrop-blur-[3px] transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />

      {/* `inert` (not just `aria-hidden`) while closed: `aria-hidden` alone hides the panel from
          the accessibility tree but does nothing to keyboard focus, so Tab from the trigger would
          otherwise walk straight into the off-screen close button, `about`, and the `UserMenu`
          trigger — three unseen dead stops before the next visible chrome control. `inert` pulls
          the whole subtree out of the tab order to match. */}
      <aside
        aria-label={SHELL_TEXT.aria.drawer}
        aria-hidden={!open}
        inert={!open}
        className={cn(
          "fixed top-0 left-0 z-40 flex h-full w-72 max-w-[85vw] flex-col",
          "border-r border-gr-border-2 bg-gr-panel shadow-gr-modal transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-12 shrink-0 items-center justify-between border-b border-gr-border-2 bg-gr-panel-2 px-3.5 inset-shadow-gr-hair">
          <span className="text-xs font-semibold tracking-caps text-gr-fg-2">{SHELL_TEXT.wordmark}</span>
          <button
            type="button"
            onClick={close}
            aria-label={SHELL_TEXT.aria.closeMenu}
            className="flex size-8 items-center justify-center rounded-md text-gr-fg-3 transition-colors duration-120 outline-none hover:bg-white/22 hover:text-gr-fg focus-visible:ring-3 focus-visible:ring-gr-ring"
          >
            <XIcon className="size-4" />
          </button>
        </div>

        {/* `about` at full panel width rather than the chrome's compact pill — that pill's
            padding was sized to sit beside a second 24px box, and here it is the panel's only
            row above the account block. */}
        <Overline
          asChild
          className="flex items-center rounded-md px-3.5 py-3 text-gr-fg-2 transition-colors duration-120 hover:bg-white/22 hover:text-gr-fg"
        >
          <Link
            href={ROUTES.about.path}
            onClick={() => setOpen(false)}
          >
            {SHELL_TEXT.about}
          </Link>
        </Overline>

        {/* Pinned to the panel's bottom edge — `DrawerAccountSection`'s own technique on pfa,
            `mt-auto` inside a flex column. The same `UserMenu` the desktop chrome renders,
            unchanged, so `log out` behaves identically on both sides of `@max-3xl`. */}
        <div className="mt-auto border-t border-gr-border-2 p-2">
          <UserMenu email={email} />
        </div>
      </aside>
    </>
  );
}

export { MobileMenu };
