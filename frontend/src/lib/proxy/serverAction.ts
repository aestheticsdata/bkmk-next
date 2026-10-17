/** The header a Server Action call carries its id in. */
const ACTION_HEADER = "next-action";

/**
 * Whether a request claims to call a Server Action (BMK-76).
 *
 * This front has none, so every such request is a scanner's probe, never a stale tab. Next would
 * turn each one away on its own, but logs it as an error with its stack — several rows in Iknos
 * per probe, an alert after a few dozen. Turned away in the proxy instead, they never reach Next
 * and leave nothing behind. No shape check on the id: a well-formed one is a probe too.
 */
export const isServerActionRequest = (headers: Headers): boolean => headers.has(ACTION_HEADER);
