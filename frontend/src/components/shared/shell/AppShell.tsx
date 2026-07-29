import { Desk } from "@components/shared/shell/Desk";
import { StatusBar } from "@components/shared/shell/StatusBar";
import { TabBar } from "@components/shared/shell/TabBar";
import { TopChrome } from "@components/shared/shell/TopChrome";

import type * as React from "react";

/* The application shell: **top chrome → desk → status bar → (narrow) tab bar**. It wraps
 * every private screen, from `app/(private)/layout.tsx`, and replaces the old
 * `shared/Layout.tsx` + `navBar/NavBar.tsx` pair.
 *
 * `@container` is the load-bearing class in this file. Every `@max-3xl:` variant in the
 * design system — here, in `ds/`, in the restyled `ui/` — resolves against this element,
 * so the interface folds on the width of the app screen rather than the width of the
 * window, and keeps working in a split view or an embed. The screen root is the only
 * container the system declares.
 *
 * ⚠️ One consequence worth knowing: `container-type` makes this element the containing
 * block for `position: fixed` descendants. It spans the viewport exactly, so nothing
 * inside notices — but anything portalled to `document.body` (a Radix dialog, a toast)
 * lands *outside* the container and gets no `@max-3xl` at all.
 *
 * The surface and the typeface are set here rather than on `body`: the shell paints its own
 * subtree, and the global resets in `base.css` still belong to UI 01 (COS-297), which flips
 * them once the last legacy screen is gone.
 *
 * `h-dvh`, a fixed height rather than a minimum: the chrome and the two bars are pinned, the
 * desk is the only thing that scrolls, and the dynamic viewport unit keeps that true while a
 * mobile browser's toolbar collapses. */
function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="@container flex h-dvh flex-col bg-gr-bg font-mono text-xs text-gr-fg">
      <TopChrome />
      <Desk>{children}</Desk>
      <StatusBar />
      <TabBar />
    </div>
  );
}

export { AppShell };
