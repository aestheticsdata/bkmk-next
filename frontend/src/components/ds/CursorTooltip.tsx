"use client";

import { TOOLTIP_SURFACE } from "@components/ui/tooltip";
import { cn } from "@lib/utils";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import type { CursorPoint } from "@helpers/useCursorHover";
import type { ReactNode } from "react";

/* Measure, then position, **before paint** — otherwise the bubble is painted once beside the cursor
 * and again clamped inside the window, which reads as a flinch. `useLayoutEffect` warns on the
 * server, where there is nothing laid out to measure. */
const useIsomorphicLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

/** The fade, at the point of use — `animations.css` keeps durations out of the tokens. 120ms is what
 *  the index row's own transitions run at. */
const FADE_MS = 120;

/** How far the bubble keeps from the pointer, and how close it may come to the window's edge. */
const CURSOR_GAP = 16;
const VIEWPORT_EDGE = 12;

/** What the bubble last showed. Kept so it still has something to paint while it fades out, after
 *  `point` has already gone null. */
interface Snapshot {
  point: CursorPoint;
  children: ReactNode;
}

/* **The tooltip that follows the pointer** (BMK-69) — the second engine under `ui/tooltip`'s bubble,
 * and the one no registry ships, which is why it lives here rather than beside the anchored one.
 *
 * It is driven by a `point` rather than by a trigger: `{x, y}` while it should be shown, `null` to
 * hide it (see `helpers/useCursorHover`). That is what lets a *delegated* container drive it — one
 * hover state for a whole row or a whole chart, resolving per event what the pointer is actually
 * over. The index row needs exactly that: its title link's overlay covers every cell, so no cell can
 * be a trigger of its own.
 *
 * `pointer-events-none` is not a detail. The bubble is placed under the cursor's own gap; without
 * it, it would sit between the pointer and whatever it describes, and hovering would flicker.
 *
 * It portals to `<body>`: inside the table it would be clipped by the row group's `overflow`, and
 * `position: fixed` inside a transformed ancestor stops being fixed to the viewport at all. */
function CursorTooltip({ point, children }: { point: CursorPoint | null; children: ReactNode }) {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const bubble = useRef<HTMLDivElement>(null);

  /* Shown → keep the content and reveal on the next frame, so a bubble that has just mounted has an
   * opacity to transition *from*. Hidden → fade out first, drop the content once it is over. */
  useEffect(() => {
    if (point) {
      setSnapshot({ point, children });
      const frame = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(frame);
    }

    setVisible(false);
    const timer = setTimeout(() => setSnapshot(null), FADE_MS + 40);
    return () => clearTimeout(timer);
  }, [point, children]);

  /* Below and to the right of the pointer, and flipped to the other side of it when that would run
   * past the window. Flipped, not merely pushed back inside: a bubble pinned to the right edge would
   * be under the cursor, which is the one place it may not be. */
  useIsomorphicLayoutEffect(() => {
    const element = bubble.current;
    if (!snapshot || !element) return;

    const { width, height } = element.getBoundingClientRect();

    let left = snapshot.point.x + CURSOR_GAP;
    if (left + width + VIEWPORT_EDGE > window.innerWidth) left = snapshot.point.x - CURSOR_GAP - width;

    let top = snapshot.point.y + CURSOR_GAP;
    if (top + height + VIEWPORT_EDGE > window.innerHeight) top = snapshot.point.y - CURSOR_GAP - height;

    setPosition({ left: Math.max(VIEWPORT_EDGE, left), top: Math.max(VIEWPORT_EDGE, top) });
  }, [snapshot]);

  if (!snapshot) return null;

  return createPortal(
    <div
      ref={bubble}
      data-slot="cursor-tooltip"
      className={cn(
        TOOLTIP_SURFACE,
        "pointer-events-none fixed transition-opacity ease-out",
        visible ? "opacity-100" : "opacity-0",
      )}
      style={{
        // The first frame has nothing measured yet: start beside the cursor, which is where the
        // measurement lands anyway, everywhere but the last stretch of the window.
        left: position ? position.left : snapshot.point.x + CURSOR_GAP,
        top: position ? position.top : snapshot.point.y + CURSOR_GAP,
        // Inline, so the transition and the timer that unmounts the bubble cannot disagree — a
        // duration in a utility and a duration in a constant is one of them going stale.
        transitionDuration: `${FADE_MS}ms`,
      }}
    >
      {snapshot.children}
    </div>,
    document.body,
  );
}

export { CursorTooltip };
