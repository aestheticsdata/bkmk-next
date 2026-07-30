import { SECRET_RULES } from "@src/schemas/fieldLimits";

/* The sign-up screen's strength gauge (COS-298) — the handoff's `.gr-meter` at 62%.
 *
 * **A heuristic, and it says so.** This is not an entropy estimate and it is not zxcvbn: a
 * dictionary-and-pattern library is 400kb of dependency shipped to one field on one screen of a
 * self-hosted index, and it would still not know whether the phrase came off a leak list. What
 * this does know is the two things that actually decide an online guessing attempt — how long the
 * secret is, and how many kinds of character it draws from — and it is honest about the rest:
 * `hunter2hunter2` scores well here and is a bad password. The gauge is a nudge next to the rule,
 * not a verdict; the rule is `SECRET_RULES.passwordMin`, and the form is what enforces it.
 *
 * Length dominates deliberately. Character variety adds one step, no more: `P@ssw0rd!` draws on
 * four classes in nine characters and is weaker than four plain words, so a formula that rewarded
 * variety as much as length would rank them the wrong way round. */

export type PasswordStrength = {
  /** 0–4. 0 is anything below the form's own minimum. */
  score: 0 | 1 | 2 | 3 | 4;
  /** Meter width, and the `aria-valuenow` Radix reads from it. */
  percent: number;
  /** One word, shown beside the `strength` label and given to the meter as its value text. */
  label: string;
};

const LABELS = ["too short", "weak", "fair", "good", "strong"] as const;

/** Character classes, counted by presence rather than by count: one digit and six digits say the
 *  same thing about the alphabet a guesser has to cover. */
const CLASSES = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/];

export const measurePassword = (value: string): PasswordStrength => {
  const length = value.length;

  if (length === 0) return { score: 0, percent: 0, label: "" };
  if (length < SECRET_RULES.passwordMin) {
    /* Below the minimum the bar still moves, so typing feels like progress towards something —
     * but it stays in the first third, where it reads as "not yet" rather than "nearly". */
    return { score: 0, percent: Math.round((length / SECRET_RULES.passwordMin) * 30), label: LABELS[0] };
  }

  const fromLength = length >= 24 ? 3 : length >= 18 ? 2 : 1;
  const variety = CLASSES.filter((pattern) => pattern.test(value)).length;
  const score = Math.min(4, fromLength + (variety >= 3 ? 1 : 0)) as 1 | 2 | 3 | 4;

  return { score, percent: score * 25, label: LABELS[score] };
};
