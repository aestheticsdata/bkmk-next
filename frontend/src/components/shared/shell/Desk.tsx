"use client";

import { usePathname } from "next/navigation";

import type * as React from "react";

/* `.gr-desk` — the flat grey field the cards float on, and the screen's scroll container.
 *
 * **`key={pathname}` is what makes the entrance animation work.** The shell lives in the
 * layout so the chrome never remounts between screens, which is also why a CSS animation
 * declared here would play once in a session and never again. Keying the element on the
 * path remounts it — and only it — on every route change, replaying the 220ms fade the
 * handoff asks for. The query string is deliberately not part of the key: paging through
 * the index must not flash the table.
 *
 * `overflow-auto` is a deviation from the handoff, which lets the desk stay fixed and has
 * each card scroll its own body. GRAPHITE screens still behave that way — their cards are
 * `flex-1 min-h-0` inside a parent whose height is definite either way. It is here for the
 * legacy screens that have not been rebuilt yet and are taller than the viewport: without
 * it they would simply be cut off. */
function Desk({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <main
      key={pathname}
      className="flex min-h-0 flex-1 animate-gr-screen flex-col gap-3 overflow-auto p-3.5 @max-3xl:gap-2 @max-3xl:p-2"
    >
      {children}
    </main>
  );
}

export { Desk };
