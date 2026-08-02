const { z } = require("zod");
const { idSchema } = require("./primitives");

/* Inputs of the reminders routes (COS-330).
 *
 * Unlike `bookmarks.js`, these bodies are JSON rather than multipart — nothing here carries a file —
 * so a boolean arrives as a boolean and needs no coercion. `idSchema` still coerces, because its
 * value comes from the path and a path segment is always a string. */

/** `PATCH /reminders/:alarmId` and `DELETE /reminders/:alarmId` — which alarm. */
const alarmIdParamsSchema = z.object({
  alarmId: idSchema,
});

/** The body of both `PATCH`es: the state the caller wants, not the change it wants applied.
 *
 * ⚠️ **A boolean and not a verb that toggles.** The screen reads a list fetched some time ago, so a
 * toggle can be aimed at a state that has already moved — you see `snooze`, another tab woke the
 * alarm, and the click puts it back to sleep. Asked twice, `{ paused: true }` gives the same answer
 * twice, which is also what makes `snooze all` safe over a list where some rows already sleep. */
const pauseBodySchema = z.object({
  paused: z.boolean(),
});

module.exports = { alarmIdParamsSchema, pauseBodySchema };
