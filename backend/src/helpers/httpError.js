/** A refusal that has to travel out through a transaction (COS-345, COS-353).
 *
 * A controller that opens a transaction cannot answer a 404 by returning: the statements above the
 * refusal are already written, and only a throw reaches the `catch` that rolls them back. A plain
 * `throw` would then be flattened into the 500 that same `catch` writes for anything unexpected —
 * the right rollback with the wrong status. Carrying `status` is what lets the `catch` tell a
 * decision from an accident.
 *
 * The key is not invented here: `utils/errorHandlerMiddleware` already answers `err.status ?? 500`.
 * The routes that use this never reach it — they catch their own errors, because they have a
 * transaction to close first — so the same convention is read locally rather than a second one
 * introduced.
 *
 * Written for `editBookmarkController` and shared the day `postBookmarkController` got a transaction
 * of its own and the same category refusal to carry out of it. */
const httpError = (status, msg) => Object.assign(new Error(msg), { status });

module.exports = { httpError };
