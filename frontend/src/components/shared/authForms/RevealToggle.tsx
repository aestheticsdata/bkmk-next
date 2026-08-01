"use client";

import { MiniButton } from "@components/ds/MiniButton";

/* The show / hide control, in `ds/Field`'s `action` slot — beside the label, outside it, at the end
 * of the row.
 *
 * A `MiniButton`: the handoff's smallest control, and the one COS-297's sign-in comment promised.
 *
 * It is 20px in a 16px header row, and that is safe because `ds/Field` **fixes** that row's height:
 * the button centres itself and overflows two pixels each way, into the 6px gap above the input, and
 * the row cannot grow — so both columns of the key pair keep their labels and their inputs on the
 * same two lines. An earlier version dropped a `MiniButton` into a row that sized itself, which is
 * what put one column six pixels below the other; the fix belonged in the row, not in the control.
 *
 * `aria-pressed` because without it the button announces itself as "show" in both states, and
 * `aria-controls` names both halves of the pair because one toggle unmasks two fields.
 *
 * ⚠️ **Moved out of `SignUpForm` by COS-324, unchanged.** The recovery screen has the same pair of
 * secrets to choose and the same reason to let you read them; a copy of a control whose whole
 * comment is about a two-pixel overflow is a copy that drifts. */
function RevealToggle({
  revealed,
  reveal,
  conceal,
  controls,
  onToggle,
}: {
  revealed: boolean;
  reveal: string;
  conceal: string;
  /** The ids of the fields it unmasks — both halves of a pair. */
  controls: string;
  onToggle: () => void;
}) {
  return (
    <MiniButton
      type="button"
      aria-pressed={revealed}
      aria-controls={controls}
      onClick={onToggle}
      /* `ml-auto` on the control itself, not on a wrapper: a wrapper is a blockified flex item and
       * carries a strut at the card's font size, which is its own way of moving the row.
       *
       * `hover:translate-y-0` **cancels the chrome lift**, and only here. `translateY(-1px)` is the
       * right interaction for a 30px button with room around it; this one sits inside a field's
       * header row, a pixel from the label and two from the input, and it is pressed twice for every
       * secret typed. A control that hops each time the pointer crosses it reads as a layout glitch.
       * The `hover:shadow-gr-2` half of the lift stays — the hover is still answered, without motion.
       *
       * It cancels rather than avoids because `cn` is tailwind-merge: `translate-y` is one group, so
       * the last one written wins and `-translate-y-px` is dropped from the output, not overridden. */
      className="ml-auto hover:translate-y-0"
    >
      {revealed ? conceal : reveal}
    </MiniButton>
  );
}

export { RevealToggle };
