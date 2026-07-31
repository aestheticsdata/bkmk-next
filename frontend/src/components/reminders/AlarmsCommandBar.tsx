"use client";

import { CommandBar } from "@components/ds/CommandBar";
import { Overline } from "@components/ds/Overline";
import { ROUTES } from "@components/shared/config/constants";
import { Button } from "@components/ui/button";
import { ALARMS_TEXT } from "@text/alarms";
import { format } from "date-fns";
import Link from "next/link";
import { useEffect, useState } from "react";

/** Half a minute. The bar prints minutes, so this is the coarsest interval that never shows a stale
 *  one — and the finest that is worth a timer at all. */
const TICK_MS = 30_000;

/* The alarms screen's command bar (COS-304): the clock the table is read against, and the two
 * actions the handoff puts beside it.
 *
 * ⚠️ **A running clock, which §8.1 of the spec appears to forbid — and does not.** What that rule
 * banned was `uptime 04:12`, a counter that counted nothing, and `IDX/2.4.1`, a build number the
 * project does not produce: *invented* readings, rendered exactly as written or not at all. This is
 * the browser's own time, and it is the one thing on the screen that makes the column beside it
 * legible — `T-00d` means nothing without saying when now is.
 *
 * It is set in an effect rather than during render because the server has a different "now" than the
 * browser and React would call that a hydration mismatch. So the slot is empty for one frame, which
 * is also why there is no placeholder in it: a dash that turns into a time reads as a value that
 * failed to load.
 *
 * ⚠️ **`snooze all` is drawn and disabled — COS-330**, with the row-level pair it belongs to. `arm
 * new` is not: arming an alarm means giving a record a reminder, and the insert screen is where that
 * field lives, so the primary action goes there and works. */
function AlarmsCommandBar() {
  const [now, setNow] = useState<Date>();

  useEffect(() => {
    setNow(new Date());
    const tick = setInterval(() => setNow(new Date()), TICK_MS);
    return () => clearInterval(tick);
  }, []);

  return (
    <CommandBar className="@max-3xl:flex-wrap @max-3xl:py-2">
      {/* ⚠️ **A line of its own below the fold**, rather than the truncation `min-w-0` would otherwise
          give it: `alarms / clock 2026-07-31 17:26` needs 231px and the two buttons leave 151 at
          390, so the bar wrapped the clock onto three lines and then ellipsised it. A half-printed
          timestamp is worse than a second row. */}
      <div className="flex min-w-0 items-center gap-2 @max-3xl:basis-full">
        <Overline className="text-gr-accent">{ALARMS_TEXT.command.screen}</Overline>
        <Overline className="text-gr-fg-4">{ALARMS_TEXT.command.separator}</Overline>
        {now && (
          <Overline className="num truncate text-gr-fg-2">
            {ALARMS_TEXT.command.clock(format(now, "yyyy-MM-dd HH:mm"))}
          </Overline>
        )}
      </div>

      <div className="ml-auto flex shrink-0 items-center gap-2">
        {/* The title rides the wrapper: a disabled button receives no pointer events and would never
            show one of its own. */}
        <span title={ALARMS_TEXT.row.pending}>
          <Button
            variant="chrome"
            size="chrome"
            disabled
          >
            {ALARMS_TEXT.command.snoozeAll}
          </Button>
        </span>
        <Button
          variant="primary"
          size="chrome"
          asChild
        >
          <Link href={ROUTES.bookmarksCreation.path}>{ALARMS_TEXT.command.armNew}</Link>
        </Button>
      </div>
    </CommandBar>
  );
}

export { AlarmsCommandBar };
