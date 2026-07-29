/* The GRAPHITE primitives (COS-291) — the vocabulary the screens are written in.
 *
 * **What lives here and what does not.** `ui/` holds shadcn components restyled onto our
 * tokens; `ds/` holds what GRAPHITE has and shadcn does not. So the field is `ui/input`,
 * the modal is `ui/dialog`, the meter is `ui/progress` — and `Stars`, `PriorityBars`,
 * `Led`, `ShotSlot`, `RowActions` are here, because no registry ships them.
 *
 * The two exceptions are composites, not reimplementations: `Field` binds an `Overline`
 * to a `ui/input`, and `MiniButton` is a named preset over `ui/button`. Both exist so a
 * screen can write the handoff's word instead of assembling it again.
 *
 * Import from the modules, not from this barrel, in application code — this file is here
 * so the set is discoverable and documented in one place. */

export { BlinkCursor } from "@components/ds/BlinkCursor";
export { Card } from "@components/ds/Card";
export { Chip } from "@components/ds/Chip";
export { CommandBar, PagerBar } from "@components/ds/CommandBar";
export { DropZone } from "@components/ds/DropZone";
export { Field } from "@components/ds/Field";
export { KeyValueTable } from "@components/ds/KeyValueTable";
export { Led } from "@components/ds/Led";
export { MiniButton } from "@components/ds/MiniButton";
export { Overline } from "@components/ds/Overline";
export { PRIORITY_LEVELS, PriorityBars } from "@components/ds/PriorityBars";
export { RowAction, RowActions } from "@components/ds/RowActions";
export { Segment } from "@components/ds/Segment";
export { ShotSlot } from "@components/ds/ShotSlot";
export { MAX_STARS, Stars } from "@components/ds/Stars";

export type { KeyValueRow } from "@components/ds/KeyValueTable";
export type { Priority } from "@components/ds/PriorityBars";
