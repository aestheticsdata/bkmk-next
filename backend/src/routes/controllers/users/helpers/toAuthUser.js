/**
 * The shape `GET /users/me`, `POST /users` and `POST /users/add` all answer with (COS-404).
 *
 * Three call sites built this object by hand before this ticket — `getMeController` selected
 * `id, name, email` and stopped there, and `signInHelper` did the same from whatever row its two
 * callers handed it. Adding `hasRecoveryPassphrase` to only one of them would have made the shape
 * depend on which route answered, which is exactly what `AuthUserSchema` being shared between the
 * three is supposed to rule out.
 *
 * `row.recovery_passphrase` is a bcrypt hash or `NULL` — this is the one place it is read on any
 * authenticated response, and it never leaves this function: what goes out is `Boolean(...)`,
 * never the value.
 */
module.exports = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  hasRecoveryPassphrase: Boolean(row.recovery_passphrase),
});
