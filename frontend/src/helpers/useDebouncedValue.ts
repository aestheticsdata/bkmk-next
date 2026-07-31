"use client";

import { useEffect, useState } from "react";

/* A value that lags behind, on purpose (COS-300).
 *
 * The filter modal counts its own draft as you edit it, and one of the controls is a text field.
 * Every other control is a click, so it can fire immediately; typing `demoscene` would fire nine
 * requests of which only the last is read.
 *
 * ⚠️ **Not `useDeferredValue`, which looks like this and is not.** That one defers *rendering* under
 * concurrent pressure — it will happily give you every intermediate value on an idle machine, which
 * is exactly the case here. Delaying a network request is a timer, and a timer is what this is.
 *
 * The effect re-runs on every change and clears the previous timer, so the value only lands once the
 * caller has been quiet for `delay`. On unmount the timer goes with it. */
function useDebouncedValue<T>(value: T, delay: number): T {
  const [settled, setSettled] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setSettled(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return settled;
}

export { useDebouncedValue };
