"use client";

import { useState } from "react";

/** Where the pointer is, in viewport coordinates — what `ds/CursorTooltip` positions against. */
interface CursorPoint {
  x: number;
  y: number;
}

interface CursorHover<T> extends CursorPoint {
  data: T;
}

/* The hover state behind a cursor tooltip (BMK-69): where the pointer is, and optionally what it is
 * over. Ported from pfa's `lib/dataviz/useCursorHover.ts`, which drives the same bubble there.
 *
 * `T` defaults to `void`, for a bubble whose content the consumer already holds — the index row
 * knows its own categories, so it calls `show(x, y)` and reads nothing back. Pass a datum type where
 * one hover state serves several items and the bubble has to be told which one.
 *
 * **Two setters, because there are two shapes of consumer.** `move` binds a datum once and returns
 * an `onMouseMove` handler, for an element that is itself the trigger. `show` is imperative, for a
 * **delegated** container that resolves per event which item — or whether any — is under the
 * pointer. The index row is the second kind, and not by choice: its title link's overlay covers
 * every cell, so the row is the only element the pointer's events ever reach. */
function useCursorHover<T = void>() {
  const [hover, setHover] = useState<CursorHover<T> | null>(null);

  const move = (data: T) => (event: { clientX: number; clientY: number }) =>
    setHover({ x: event.clientX, y: event.clientY, data });
  const show = (x: number, y: number, data: T) => setHover({ x, y, data });
  const clear = () => setHover(null);

  return { hover, move, show, clear };
}

export { useCursorHover };

export type { CursorHover, CursorPoint };
