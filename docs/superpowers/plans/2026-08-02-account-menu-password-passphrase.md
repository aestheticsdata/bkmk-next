# Account menu — change password & recovery passphrase Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Ticket:** [COS-404](https://linear.app/cosmokaat/issue/COS-404/menu-utilisateur-cabler-le-changement-de-mot-de-passe-et-la-passphrase) — Menu utilisateur : câbler le changement de mot de passe et la passphrase de récupération.

**Goal:** Wire the two account-menu entries COS-321 shipped disabled — `change password` and `set/change recovery passphrase` — into working, authenticated flows.

**Architecture:** Two new protected Express routes (`PATCH /users/me/password`, `PATCH /users/me/passphrase`), both gated on the current password. Password change replays the existing `establishSession` helper so the session survives; passphrase change touches no session at all. Frontend adds two small `ui/dialog` forms opened from `UserMenu`, and `hasRecoveryPassphrase` becomes part of every auth response so the menu can relabel itself.

**Tech Stack:** Express 4 + `mysql2` + `bcryptjs` + `zod` (backend); Next.js App Router + `react-hook-form` + `zod` + Radix `ui/dialog` / `ui/dropdown-menu` (frontend). No test runner exists in either package today.

## Global Constraints

- No automated tests exist in this repo (`backend`'s `test` script is a stub; `frontend` has none). Verification is **manual**, via curl for the backend and the dev server for the frontend — matching how every other AUTH-lot ticket in this project was QA'd. Do not add a test framework as part of this ticket.
- **No commits.** This project's convention is one commit per ticket, written only once QA passes, and this session's standing instruction is to never run `git commit`/`git push` without being explicitly told to. Every task below ends in a manual verification step, not a commit — the very last section of this plan describes what to hand back for review instead.
- `currentPassword` is validated as `z.string().min(1)` only, **never** bounded by `SECRET_RULES` — some of the 11 existing accounts predate the 12-character minimum (COS-298) and must still be able to prove a shorter password. Only the *new* secret being chosen gets the real bounds (password 12–72, passphrase 20–72).
- A wrong `currentPassword` answers **400**, never 401 — `useRequestHelper`'s interceptor treats 401 as "session is gone, redirect to `/login`" (COS-296), which would be wrong for a valid session that just mistyped a field.
- `hasRecoveryPassphrase` is the only thing ever returned about the passphrase column — never the hash, never a "true/false-but-actually-tells-you-more" shape.
- Copy is English, lives in `@text/*`, no locale segment (project-wide convention, `@text/shell.ts` / `@text/auth.ts`).
- Path aliases only (`@auth/*`, `@components/*`, `@src/*`, `@text/*`, `@helpers/*`) — never relative `./`/`../` imports in the frontend.

---

### Task 1: Backend — `hasRecoveryPassphrase` on every auth response

**Files:**
- Create: `backend/src/routes/controllers/users/helpers/toAuthUser.js`
- Modify: `backend/src/routes/controllers/users/helpers/signInHelper.js`
- Modify: `backend/src/routes/controllers/users/getMeController.js`
- Modify: `backend/src/routes/controllers/users/addUserController.js`

**Interfaces:**
- Produces: `toAuthUser(row)` → `{id, name, email, hasRecoveryPassphrase}`, where `row` has at least `id`, `name`, `email`, `recovery_passphrase`. Used by Task 1's own files and by Task 2 (`changePasswordController` calls `establishSession`, which calls `toAuthUser` internally).

This is foundational: `signInController.js` and `recoverController.js` need **no changes** — `signInController.js` already does `SELECT * FROM user WHERE email = ?`, so `users[0]` already carries `recovery_passphrase` through to `establishSession`.

- [ ] **Step 1: Create the shared response-shaping helper**

Create `backend/src/routes/controllers/users/helpers/toAuthUser.js`:

```js
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
```

- [ ] **Step 2: Use it in `signInHelper`**

Modify `backend/src/routes/controllers/users/helpers/signInHelper.js` — add the require, and replace the hand-built `user` object in the response:

```js
const redisService = require("../../../../redisService");
const { rotateCsrfToken } = require("../../../../auth/csrfToken");
const toAuthUser = require("./toAuthUser");
```

Replace:

```js
  return res.status(status).json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
    },
    csrfToken: rotateCsrfToken(req),
  });
```

with:

```js
  return res.status(status).json({
    user: toAuthUser(user),
    csrfToken: rotateCsrfToken(req),
  });
```

Add one line to the file's top JSDoc (right after the existing numbered list), noting the new expectation on callers:

```
 * `user` must now carry `recovery_passphrase` (the hash or `NULL`), not just `id`/`name`/`email` —
 * `toAuthUser` reads it to derive `hasRecoveryPassphrase`. `signInController` already selects
 * `SELECT *`, so it needs no change; `addUserController` is updated by this same ticket to add it.
```

- [ ] **Step 3: Select the column in `getMeController` and use the helper**

Modify `backend/src/routes/controllers/users/getMeController.js` in full:

```js
/**
 * `GET /users/me` (COS-294) — who the cookie says you are, plus the CSRF token.
 *
 * This is what hydrates the client on load: the session cookie is `httpOnly`, so the front
 * has no way to know it is signed in other than asking. It also re-hands the CSRF token,
 * which the client keeps in memory only and therefore loses on every reload.
 *
 * The query is parameterised. Nothing here is client-supplied — the id comes from our own
 * session — but COS-295 is about to convert the rest of the API, and new SQL has no reason
 * to be written the old way.
 *
 * `recovery_passphrase` is selected only so `toAuthUser` can turn it into `hasRecoveryPassphrase`
 * (COS-404) — the hash itself never reaches `res.json`.
 */
const dbConnection = require("../../../db/dbinitmysql");
const { getOrCreateCsrfToken } = require("../../../auth/csrfToken");
const toAuthUser = require("./helpers/toAuthUser");

module.exports = async (req, res) => {
  const conn = await dbConnection();
  const [users] = await conn.execute(
    "SELECT id, name, email, recovery_passphrase FROM user WHERE id = ?;",
    [req.user.id],
  );
  await conn.end();

  // The session outlived the account. Ten-minute sessions make this unlikely rather than
  // impossible, and answering 200 with no user would leave the client signed in to nothing.
  if (users.length === 0) {
    return req.session.destroy(() => res.status(401).json({ error: "Session required" }));
  }

  return res.json({
    user: toAuthUser(users[0]),
    csrfToken: getOrCreateCsrfToken(req),
  });
};
```

- [ ] **Step 4: `addUserController` hands its passphrase hash through**

Modify `backend/src/routes/controllers/users/addUserController.js` — sign-up always sets a passphrase, so `hasRecoveryPassphrase` must come back `true`. Replace the final call:

```js
    return await establishSession(req, res, { id: created.insertId, name, email }, 201);
```

with:

```js
    // `recovery_passphrase` here is only so `toAuthUser` can derive `hasRecoveryPassphrase` — sign-up
    // always sets one, so this is always true. The hash itself never reaches the response; only
    // `Boolean(...)` does, inside `toAuthUser`.
    return await establishSession(
      req,
      res,
      { id: created.insertId, name, email, recovery_passphrase: passphraseHash },
      201,
    );
```

- [ ] **Step 5: Verify manually**

Start the backend dev server (`cd backend && pnpm dev` or however it's normally run), then from another shell:

```bash
curl -i -c /tmp/cos404-cookies.txt -X POST http://localhost:3101/users \
  -H "Content-Type: application/json" \
  -d '{"email":"<an existing dev account email>","password":"<its password>"}'
```

Expected: `200`, and the JSON body's `user` object now includes `"hasRecoveryPassphrase"` (`true` if that account has one, `false`/absent-column-safe otherwise — check against what you know of that row).

```bash
curl -s -b /tmp/cos404-cookies.txt http://localhost:3101/users/me | python3 -m json.tool
```

Expected: same `hasRecoveryPassphrase` field, same value, on `/me` too.

If you don't have dev credentials handy, sign up a throwaway account first (`POST /users/add` with `email`, `password` ≥12 chars, `recoveryPassphrase` ≥20 chars, `registerDate`) and confirm its `hasRecoveryPassphrase` comes back `true`, then delete it from the `user` table directly when done — the same trial-account-then-delete pattern COS-297's own QA used.

---

### Task 2: Backend — `PATCH /users/me/password`

**Files:**
- Modify: `backend/src/schemas/auth.js`
- Create: `backend/src/routes/controllers/users/changePasswordController.js`
- Modify: `backend/src/routes/api/users.js`

**Interfaces:**
- Consumes: `toAuthUser` indirectly via `establishSession` (Task 1).
- Produces: route `PATCH /users/me/password`, body `{currentPassword, newPassword}`, success `200 {user, csrfToken}` (via `establishSession`), failure `400 {error: "current password is incorrect"}`.

- [ ] **Step 1: Add the body schema**

Modify `backend/src/schemas/auth.js` — add after `recoverBodySchema` and before `module.exports`:

```js
/* Changing a password from the account menu (COS-404) — the counterpart `/recover` never needed:
 * that route resets a password you cannot prove, this one changes a password you can.
 * `currentPassword` therefore carries no minimum, exactly like `signInBodySchema.password` — some
 * of the 11 accounts predate `SECRET_RULES.passwordMin`, and a bound here would lock them out of
 * proving a password that is, by definition, already correct. `newPassword` is the secret being
 * chosen, so it takes the real bounds. */
const changePasswordBodySchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(SECRET_RULES.passwordMin).max(SECRET_RULES.max),
});
```

And update the final export line:

```js
module.exports = { signInBodySchema, signUpBodySchema, recoverBodySchema, changePasswordBodySchema };
```

(Task 3 adds a second name to this same line.)

- [ ] **Step 2: Write the controller**

Create `backend/src/routes/controllers/users/changePasswordController.js`:

```js
const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const dbConnection = require("../../../db/dbinitmysql");
const establishSession = require("./helpers/signInHelper");

/**
 * `PATCH /users/me/password` (COS-404) — the `change password` entry COS-321 drew and left
 * disabled, because the route did not exist yet.
 *
 * ⚠️ **A wrong current password answers 400, not 401.** `sessionAuthMiddleware` has already let
 * this request through — there is a valid session — and `useRequestHelper`'s interceptor treats
 * 401 as "the session is gone, go to `/login`" (COS-296). Answering 401 here would bounce someone
 * who just mistyped a field they are looking at straight out of the app they are still signed
 * into. 400 says "the request was wrong", which is what a bad current password is.
 *
 * Success **replays `establishSession`**, the exact helper sign-in and sign-up already share: the
 * session is regenerated, every other session this account holds is dropped, a fresh CSRF token
 * is issued, and the response is the same `{user, csrfToken}` shape those two routes answer. That
 * is what keeps the person who just changed their password signed in on this device while ending
 * the old password's usefulness anywhere else it might have been used — the same "one active
 * session per user" guarantee sign-in gives, applied to the moment the credential itself changes.
 */
const WRONG_PASSWORD = "current password is incorrect";

module.exports = async (req, res, next) => {
  const { currentPassword, newPassword } = req.validated.body;

  const conn = await dbConnection();

  try {
    const [rows] = await conn.execute(
      "SELECT id, name, email, password, recovery_passphrase FROM user WHERE id = ?;",
      [req.user.id],
    );
    const user = rows[0];

    // The session outlived the account — same guard `getMeController` uses, for the same reason.
    if (!user) {
      return req.session.destroy(() => res.status(401).json({ error: "Session required" }));
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return next(createError(400, WRONG_PASSWORD));
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await conn.execute("UPDATE user SET password = ? WHERE id = ?;", [passwordHash, user.id]);

    return await establishSession(req, res, user, 200);
  } finally {
    await conn.end();
  }
};
```

- [ ] **Step 3: Register the route**

Modify `backend/src/routes/api/users.js`. Update the import line for schemas:

```js
const { signInBodySchema, signUpBodySchema, recoverBodySchema, changePasswordBodySchema } = require("../../schemas/auth");
```

Add a new controller import beside the others:

```js
const changePasswordController = require("../controllers/users/changePasswordController");
```

Add the route after `router.get("/csrf", ...)` and before `router.post("/logout", ...)`:

```js
/* `PATCH /me/password` (COS-404) needs both a session and the CSRF check — it mutates an
 * authenticated account. `sessionAuthMiddleware` first, so an anonymous caller is refused before
 * CSRF or the body is even looked at; `validate` last, so a malformed body is still refused with
 * the specific shape error rather than a generic 401/403. */
router.patch(
  "/me/password",
  sessionAuthMiddleware,
  csrfMiddleware,
  validate({ body: changePasswordBodySchema }),
  catchAsync(changePasswordController),
);
```

- [ ] **Step 4: Verify manually**

Using the cookie jar from Task 1's verification (or a fresh login):

```bash
# Wrong current password → 400, and the session must still be valid afterwards.
curl -i -b /tmp/cos404-cookies.txt -X PATCH http://localhost:3101/users/me/password \
  -H "Content-Type: application/json" -H "x-csrf-token: <csrfToken from the login response>" \
  -d '{"currentPassword":"definitely-wrong","newPassword":"a-new-12-char-password"}'
# Expected: 400 {"error":"current password is incorrect"}

curl -s -b /tmp/cos404-cookies.txt http://localhost:3101/users/me
# Expected: still 200 — the wrong attempt above did not destroy the session.

# Right current password → 200, new csrfToken, and the account's OTHER sessions (if any) are gone.
curl -i -b /tmp/cos404-cookies.txt -X PATCH http://localhost:3101/users/me/password \
  -H "Content-Type: application/json" -H "x-csrf-token: <csrfToken>" \
  -d '{"currentPassword":"<the real current password>","newPassword":"a-new-12-char-password"}'
# Expected: 200 {"user": {...,"hasRecoveryPassphrase":...}, "csrfToken": "<a new one>"}

# The OLD password no longer works, the new one does.
curl -i -X POST http://localhost:3101/users -H "Content-Type: application/json" \
  -d '{"email":"<that account email>","password":"<the OLD password>"}'
# Expected: 401 invalid credentials
curl -i -X POST http://localhost:3101/users -H "Content-Type: application/json" \
  -d '{"email":"<that account email>","password":"a-new-12-char-password"}'
# Expected: 200
```

Use a throwaway dev account for this (sign one up via `POST /users/add`, as in Task 1) rather than a real one, since its password ends up changed.

---

### Task 3: Backend — `PATCH /users/me/passphrase`

**Files:**
- Modify: `backend/src/schemas/auth.js`
- Create: `backend/src/routes/controllers/users/setRecoveryPassphraseController.js`
- Modify: `backend/src/routes/api/users.js`

**Interfaces:**
- Produces: route `PATCH /users/me/passphrase`, body `{currentPassword, recoveryPassphrase}`, success `200 {hasRecoveryPassphrase: true}`, failure `400 {error: "current password is incorrect"}`.

- [ ] **Step 1: Add the body schema**

Modify `backend/src/schemas/auth.js` again — add after `changePasswordBodySchema`:

```js
/* Setting or changing the recovery passphrase from the account menu (COS-404) — what the 11
 * accounts that predate the column (COS-298), and anyone who wants to change theirs, both go
 * through. `POST /users/recover` (COS-324) only *spends* a passphrase; nothing before this ticket
 * could create or replace one. Same asymmetry as `changePasswordBodySchema`: `currentPassword`
 * proves an existing secret, `recoveryPassphrase` is the one being chosen. */
const setRecoveryPassphraseBodySchema = z.object({
  currentPassword: z.string().min(1),
  recoveryPassphrase: z.string().min(SECRET_RULES.passphraseMin).max(SECRET_RULES.max),
});
```

Update the export line one more time:

```js
module.exports = {
  signInBodySchema,
  signUpBodySchema,
  recoverBodySchema,
  changePasswordBodySchema,
  setRecoveryPassphraseBodySchema,
};
```

- [ ] **Step 2: Write the controller**

Create `backend/src/routes/controllers/users/setRecoveryPassphraseController.js`:

```js
const bcrypt = require("bcryptjs");
const createError = require("http-errors");
const dbConnection = require("../../../db/dbinitmysql");

/**
 * `PATCH /users/me/passphrase` (COS-404) — the `set recovery passphrase` entry COS-321 drew and
 * left disabled, and the only way the 11 accounts that predate the column (COS-298) can ever get
 * one: `POST /users/recover` (COS-324) only spends a passphrase, it does not create one.
 *
 * Unlike `changePasswordController`, nothing here touches the session: the recovery passphrase is
 * never a login credential, so there is no session to regenerate and no other device to sign out.
 * The response says only whether one exists now, never the value — the same rule `getMeController`
 * follows for `GET /users/me`.
 *
 * Same 400-not-401 reasoning as `changePasswordController` for a wrong current password: the
 * session in front of this request is genuinely valid, and 401 would send `useRequestHelper` to
 * `/login` over what is really just a mistyped field.
 */
const WRONG_PASSWORD = "current password is incorrect";

module.exports = async (req, res, next) => {
  const { currentPassword, recoveryPassphrase } = req.validated.body;

  const conn = await dbConnection();

  try {
    const [rows] = await conn.execute("SELECT id, password FROM user WHERE id = ?;", [req.user.id]);
    const user = rows[0];

    if (!user) {
      return req.session.destroy(() => res.status(401).json({ error: "Session required" }));
    }

    const matches = await bcrypt.compare(currentPassword, user.password);
    if (!matches) {
      return next(createError(400, WRONG_PASSWORD));
    }

    const passphraseHash = await bcrypt.hash(recoveryPassphrase, 10);
    await conn.execute("UPDATE user SET recovery_passphrase = ? WHERE id = ?;", [passphraseHash, user.id]);

    return res.status(200).json({ hasRecoveryPassphrase: true });
  } finally {
    await conn.end();
  }
};
```

- [ ] **Step 3: Register the route**

Modify `backend/src/routes/api/users.js` once more. Update the schema import to include the new name:

```js
const {
  signInBodySchema,
  signUpBodySchema,
  recoverBodySchema,
  changePasswordBodySchema,
  setRecoveryPassphraseBodySchema,
} = require("../../schemas/auth");
```

Add the controller import:

```js
const setRecoveryPassphraseController = require("../controllers/users/setRecoveryPassphraseController");
```

Add the route right after the `/me/password` route from Task 2:

```js
router.patch(
  "/me/passphrase",
  sessionAuthMiddleware,
  csrfMiddleware,
  validate({ body: setRecoveryPassphraseBodySchema }),
  catchAsync(setRecoveryPassphraseController),
);
```

- [ ] **Step 4: Verify manually**

Against a throwaway account with **no** passphrase yet (or one you know the passphrase of):

```bash
curl -i -b /tmp/cos404-cookies.txt -X PATCH http://localhost:3101/users/me/passphrase \
  -H "Content-Type: application/json" -H "x-csrf-token: <csrfToken>" \
  -d '{"currentPassword":"wrong","recoveryPassphrase":"a brand new recovery phrase 20+"}'
# Expected: 400 {"error":"current password is incorrect"}

curl -i -b /tmp/cos404-cookies.txt -X PATCH http://localhost:3101/users/me/passphrase \
  -H "Content-Type: application/json" -H "x-csrf-token: <csrfToken>" \
  -d '{"currentPassword":"<the real current password>","recoveryPassphrase":"a brand new recovery phrase 20+"}'
# Expected: 200 {"hasRecoveryPassphrase": true}

curl -s -b /tmp/cos404-cookies.txt http://localhost:3101/users/me
# Expected: "hasRecoveryPassphrase": true now, even if it was false before.
```

Then confirm the new passphrase actually recovers the account through the existing `/recover` flow (`POST /users/recover` with that email, the new passphrase, and a new password) — the two routes must agree on the same column.

---

### Task 4: Frontend — schemas

**Files:**
- Modify: `frontend/src/schemas/auth.ts`

**Interfaces:**
- Produces: `AuthUserSchema` (now includes `hasRecoveryPassphrase: boolean`), `ChangePasswordPayloadSchema` / `ChangePasswordPayload`, `ChangePasswordFormSchema` / `ChangePasswordFormValues`, `SetRecoveryPassphrasePayloadSchema` / `SetRecoveryPassphrasePayload`, `SetRecoveryPassphraseFormSchema` / `SetRecoveryPassphraseFormValues`, `SetRecoveryPassphraseResponseSchema` / `SetRecoveryPassphraseResponse`. Consumed by Task 5 (services) and Tasks 6–7 (dialogs).

- [ ] **Step 1: Add the field to `AuthUserSchema`**

Modify `frontend/src/schemas/auth.ts`. Replace:

```ts
export const AuthUserSchema = z.object({
  /** `user.id` is an `INT`, so it arrives as a number — while the store typed it as a
   *  string. The store was wrong: it only feeds `?userID=`, where either passed
   *  unnoticed. */
  id: numberLikeSchema,
  name: z.string(),
  email: z.string(),
});
```

with:

```ts
export const AuthUserSchema = z.object({
  /** `user.id` is an `INT`, so it arrives as a number — while the store typed it as a
   *  string. The store was wrong: it only feeds `?userID=`, where either passed
   *  unnoticed. */
  id: numberLikeSchema,
  name: z.string(),
  email: z.string(),
  /** Whether the account has a recovery passphrase set — never the passphrase itself (COS-404).
   *  Lets the account menu tell `set recovery passphrase` from `change recovery passphrase`
   *  without a second round trip, and is what the two new dialogs read to know which mode they
   *  are in. */
  hasRecoveryPassphrase: z.boolean(),
});
```

- [ ] **Step 2: Add the change-password schemas**

Add after `RecoverFormSchema` / `RecoverFormValues`, at the end of the file:

```ts
/** `PATCH /users/me/password` (COS-404). `currentPassword` carries no minimum, mirroring
 *  `SignInPayloadSchema.password` — it is proved, not chosen, and some of the 11 accounts predate
 *  `SECRET_RULES.passwordMin`. */
export const ChangePasswordPayloadSchema = z.object({
  currentPassword: z.string().min(1, "required"),
  newPassword: z.string().min(SECRET_RULES.passwordMin).max(SECRET_RULES.max),
});

export type ChangePasswordPayload = z.infer<typeof ChangePasswordPayloadSchema>;

/** What the change-password **form** holds — one `superRefine` over three plain strings, for the
 *  reason `SignUpFormSchema`'s comment gives at length: an object that always parses is one whose
 *  cross-field check always runs. */
export const ChangePasswordFormSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: z.string(),
    confirmNewPassword: z.string(),
  })
  .superRefine((values, ctx) => {
    const problem = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });

    if (!values.currentPassword) {
      problem("currentPassword", "required");
    }

    if (values.newPassword.length < SECRET_RULES.passwordMin) {
      problem("newPassword", `min ${SECRET_RULES.passwordMin} chars`);
    } else if (values.newPassword.length > SECRET_RULES.max) {
      problem("newPassword", `max ${SECRET_RULES.max} chars`);
    }

    if (!values.confirmNewPassword) {
      problem("confirmNewPassword", "required");
    } else if (values.confirmNewPassword !== values.newPassword) {
      problem("confirmNewPassword", MISMATCH_MESSAGE);
    }
  });

export type ChangePasswordFormValues = z.infer<typeof ChangePasswordFormSchema>;

/** `PATCH /users/me/passphrase` (COS-404) — same asymmetry as `ChangePasswordPayloadSchema`:
 *  `currentPassword` proves, `recoveryPassphrase` is chosen. */
export const SetRecoveryPassphrasePayloadSchema = z.object({
  currentPassword: z.string().min(1, "required"),
  recoveryPassphrase: z.string().min(SECRET_RULES.passphraseMin).max(SECRET_RULES.max),
});

export type SetRecoveryPassphrasePayload = z.infer<typeof SetRecoveryPassphrasePayloadSchema>;

export const SetRecoveryPassphraseFormSchema = z
  .object({
    currentPassword: z.string(),
    recoveryPassphrase: z.string(),
    confirmRecoveryPassphrase: z.string(),
  })
  .superRefine((values, ctx) => {
    const problem = (path: string, message: string) => ctx.addIssue({ code: "custom", path: [path], message });

    if (!values.currentPassword) {
      problem("currentPassword", "required");
    }

    if (values.recoveryPassphrase.length < SECRET_RULES.passphraseMin) {
      problem("recoveryPassphrase", `min ${SECRET_RULES.passphraseMin} chars`);
    } else if (values.recoveryPassphrase.length > SECRET_RULES.max) {
      problem("recoveryPassphrase", `max ${SECRET_RULES.max} chars`);
    }

    if (!values.confirmRecoveryPassphrase) {
      problem("confirmRecoveryPassphrase", "required");
    } else if (values.confirmRecoveryPassphrase !== values.recoveryPassphrase) {
      problem("confirmRecoveryPassphrase", MISMATCH_MESSAGE);
    }
  });

export type SetRecoveryPassphraseFormValues = z.infer<typeof SetRecoveryPassphraseFormSchema>;

/** `PATCH /users/me/passphrase`'s answer — never the passphrase itself. */
export const SetRecoveryPassphraseResponseSchema = z.object({
  hasRecoveryPassphrase: z.boolean(),
});

export type SetRecoveryPassphraseResponse = z.infer<typeof SetRecoveryPassphraseResponseSchema>;
```

(`AuthResponseSchema` is reused as-is for the change-password response — it already wraps
`AuthUserSchema`, which now carries `hasRecoveryPassphrase`.)

- [ ] **Step 2: Verify manually**

```bash
cd frontend && pnpm exec tsc --noEmit
```

Expected: no new type errors. (This will show existing errors if any predate this change — only new ones from this file matter.)

---

### Task 5: Frontend — copy module and service hooks

**Files:**
- Create: `frontend/src/text/account.ts`
- Create: `frontend/src/auth/useChangePasswordService.ts`
- Create: `frontend/src/auth/useSetRecoveryPassphraseService.ts`

**Interfaces:**
- Consumes: `ChangePasswordPayload`, `SetRecoveryPassphrasePayload`, `SetRecoveryPassphraseResponse`, `AuthResponseSchema`, `SetRecoveryPassphraseResponseSchema` (Task 4).
- Produces: `ACCOUNT_TEXT`, `useChangePasswordService()` → `{changePasswordService}`, `useSetRecoveryPassphraseService()` → `{setRecoveryPassphraseService}`. Consumed by Tasks 6–7.

- [ ] **Step 1: Write the copy module**

Create `frontend/src/text/account.ts`:

```ts
/* The two dialogs the account menu opens (COS-404) — `change password` and `set/change recovery
 * passphrase`, the two entries COS-321 drew and left disabled. Same convention as the rest of
 * `@text/*`: English, no locale segment, copy lives here rather than inside the components.
 *
 * Field-length messages live beside `SECRET_RULES` in `@src/schemas/auth.ts`, not here — COS-298's
 * rule, so a bound and the sentence that states it can never drift apart. What is here is
 * everything that is not a validation message: titles, labels, hints, button labels, and the one
 * server refusal both routes can answer. */

export const ACCOUNT_TEXT = {
  password: {
    title: "change password",
    current: "current password",
    next: "new password",
    nextHint: "12+ chars",
    confirmNext: "confirm new password",
    submit: "save ↵",
    cancel: "cancel",
    reveal: "show",
    conceal: "hide",
    /** A wrong current password (400) — the one refusal this form can get back that is not a
     *  field-level validation message. */
    failed: "current password is incorrect",
  },

  passphrase: {
    /** The dialog title switches on `hasRecoveryPassphrase` — there is no third state. */
    titleSet: "set recovery passphrase",
    titleChange: "change recovery passphrase",
    current: "current password",
    next: "recovery passphrase",
    nextHint: "20+ chars",
    confirmNext: "confirm recovery passphrase",
    /** Same warning sign-up gives the same secret (`@text/auth.ts` `signup.passphraseNote`) —
     *  whoever is setting this from the menu needs the same fact. */
    note: "the only way back in if you lose your key — there is no recovery email. write it down.",
    submit: "save ↵",
    cancel: "cancel",
    reveal: "show",
    conceal: "hide",
    failed: "current password is incorrect",
  },
} as const;
```

- [ ] **Step 2: Write the change-password service**

Create `frontend/src/auth/useChangePasswordService.ts`:

```ts
"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { AuthResponseSchema } from "@src/schemas/auth";

import type { AuthResponse, ChangePasswordPayload } from "@src/schemas/auth";

/* Changing the account password from the menu (COS-404).
 *
 * Same contract as the other auth services: it rejects on failure so the dialog can render the
 * refusal beside the fields, and the response is parsed through the same `AuthResponseSchema`
 * sign-in and sign-up use — the backend answers through `establishSession`, so the shape is
 * identical, `hasRecoveryPassphrase` included. `privateRequest`, not `request`: this is an
 * authenticated mutation and needs the CSRF header and the 401 handling `useRequestHelper`
 * already does for every other private route. */
const useChangePasswordService = () => {
  const { privateRequest } = useRequestHelper();

  const changePasswordService = async (payload: ChangePasswordPayload): Promise<AuthResponse> => {
    const result = await privateRequest("/users/me/password", {
      method: "PATCH",
      data: payload,
    });
    return AuthResponseSchema.parse(result.data);
  };

  return {
    changePasswordService,
  };
};

export default useChangePasswordService;
```

- [ ] **Step 3: Write the set-passphrase service**

Create `frontend/src/auth/useSetRecoveryPassphraseService.ts`:

```ts
"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { SetRecoveryPassphraseResponseSchema } from "@src/schemas/auth";

import type { SetRecoveryPassphrasePayload, SetRecoveryPassphraseResponse } from "@src/schemas/auth";

/* Setting or changing the recovery passphrase from the menu (COS-404).
 *
 * Unlike sign-in, sign-up and change-password, this route opens no session and its answer is not
 * `AuthResponseSchema` — there is no new CSRF token to carry, because nothing about the session
 * changed. Only the one boolean the menu needs to relabel itself. */
const useSetRecoveryPassphraseService = () => {
  const { privateRequest } = useRequestHelper();

  const setRecoveryPassphraseService = async (
    payload: SetRecoveryPassphrasePayload,
  ): Promise<SetRecoveryPassphraseResponse> => {
    const result = await privateRequest("/users/me/passphrase", {
      method: "PATCH",
      data: payload,
    });
    return SetRecoveryPassphraseResponseSchema.parse(result.data);
  };

  return {
    setRecoveryPassphraseService,
  };
};

export default useSetRecoveryPassphraseService;
```

- [ ] **Step 4: Verify manually**

```bash
cd frontend && pnpm exec tsc --noEmit
```

Expected: no new type errors — both files compile against Task 4's schemas.

---

### Task 6: Frontend — `ChangePasswordDialog`

**Files:**
- Create: `frontend/src/components/shared/shell/ChangePasswordDialog.tsx`

**Interfaces:**
- Consumes: `useChangePasswordService` (Task 5), `ChangePasswordFormSchema`/`ChangePasswordFormValues`/`MISMATCH_MESSAGE` (Task 4), `ACCOUNT_TEXT.password` (Task 5), `useAuth` (existing `AuthContext`).
- Produces: `ChangePasswordDialog({open, onOpenChange}: {open: boolean; onOpenChange: (open: boolean) => void})`. Consumed by Task 8.

- [ ] **Step 1: Write the component**

Create `frontend/src/components/shared/shell/ChangePasswordDialog.tsx`:

```tsx
"use client";

import { useAuth } from "@auth/context/AuthContext";
import useChangePasswordService from "@auth/useChangePasswordService";
import { AuthField } from "@components/shared/authForms/AuthField";
import { RevealToggle } from "@components/shared/authForms/RevealToggle";
import { Button } from "@components/ui/button";
import { Overline } from "@components/ds/Overline";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordFormSchema, MISMATCH_MESSAGE } from "@src/schemas/auth";
import { ACCOUNT_TEXT } from "@text/account";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { ChangePasswordFormValues } from "@src/schemas/auth";

/* `change password` (COS-404) — the entry COS-321 drew and left disabled.
 *
 * Same primitives as the edit modal (`ui/dialog`) and the same field/reveal-toggle pair sign-up
 * and `/recover` use, at the delete confirmation's width (`max-w-110`, COS-320) — three fields is
 * closer to that dialog's shape than to the edit modal's.
 *
 * **`currentPassword` has no reveal toggle.** Same reasoning COS-297 gave for sign-in's own key
 * field: this is a secret you already know and are proving, not one you are choosing and reading
 * back — a wrong attempt costs a retry, not a lost account. `newPassword` and its confirmation
 * share one toggle, exactly like sign-up's pair.
 *
 * On success it calls `setAuthState` with the response's `user`/`csrfToken` directly, rather than
 * re-fetching `GET /users/me` — the backend replays `establishSession` for this exact reason, so
 * the dialog already holds the freshest state without a second round trip. */
function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { changePasswordService } = useChangePasswordService();
  const { setAuthState } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(ChangePasswordFormSchema),
    mode: "onTouched",
    defaultValues: { currentPassword: "", newPassword: "", confirmNewPassword: "" },
  });

  const values = watch();
  const messageFor = (field: keyof ChangePasswordFormValues) =>
    isSubmitted || values[field] ? errors[field]?.message : undefined;

  /* Live rather than on blur, like `RecoverForm`'s: you are copying a secret you cannot read on
   * screen, and the field should say the copy has diverged while you are still typing it. */
  const confirmMessage =
    values.confirmNewPassword && values.confirmNewPassword !== values.newPassword
      ? MISMATCH_MESSAGE
      : messageFor("confirmNewPassword");

  const onSubmit = async (formValues: ChangePasswordFormValues) => {
    setServerError(null);
    try {
      const response = await changePasswordService({
        currentPassword: formValues.currentPassword,
        newPassword: formValues.newPassword,
      });
      setAuthState(response.user, response.csrfToken);
      reset();
      onOpenChange(false);
    } catch {
      setServerError(ACCOUNT_TEXT.password.failed);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset();
          setServerError(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-110">
        <DialogHeader>
          <DialogTitle>{ACCOUNT_TEXT.password.title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            <AuthField
              id="account-current-password"
              label={ACCOUNT_TEXT.password.current}
              type="password"
              autoComplete="current-password"
              error={messageFor("currentPassword")}
              {...register("currentPassword")}
            />

            <AuthField
              id="account-new-password"
              label={ACCOUNT_TEXT.password.next}
              hint={ACCOUNT_TEXT.password.nextHint}
              type={revealed ? "text" : "password"}
              autoComplete="new-password"
              error={messageFor("newPassword")}
              action={
                <RevealToggle
                  revealed={revealed}
                  reveal={ACCOUNT_TEXT.password.reveal}
                  conceal={ACCOUNT_TEXT.password.conceal}
                  controls="account-new-password account-confirm-new-password"
                  onToggle={() => setRevealed((shown) => !shown)}
                />
              }
              {...register("newPassword")}
            />

            <AuthField
              id="account-confirm-new-password"
              label={ACCOUNT_TEXT.password.confirmNext}
              type={revealed ? "text" : "password"}
              autoComplete="new-password"
              error={confirmMessage}
              {...register("confirmNewPassword")}
            />

            {serverError && <Overline className="text-gr-accent-2">{serverError}</Overline>}
          </DialogBody>

          <DialogFooter>
            {/* Primary action first, cancel second, both left — `EditFooter`'s and
                `DeleteConfirm`'s order, not the reverse: this system never puts cancel before the
                button that does the thing. */}
            <Button
              type="submit"
              variant="primary"
              size="chrome"
              disabled={isSubmitting}
            >
              {ACCOUNT_TEXT.password.submit}
            </Button>
            <Button
              type="button"
              variant="chrome"
              size="chrome"
              onClick={() => onOpenChange(false)}
            >
              {ACCOUNT_TEXT.password.cancel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { ChangePasswordDialog };
```

- [ ] **Step 2: Verify manually**

```bash
cd frontend && pnpm exec tsc --noEmit
```

Expected: no new type errors. Full interactive verification happens in Task 8, once this is wired into `UserMenu`.

---

### Task 7: Frontend — `SetRecoveryPassphraseDialog`

**Files:**
- Create: `frontend/src/components/shared/shell/SetRecoveryPassphraseDialog.tsx`

**Interfaces:**
- Consumes: `useSetRecoveryPassphraseService` (Task 5), `SetRecoveryPassphraseFormSchema`/`Values`/`MISMATCH_MESSAGE` (Task 4), `ACCOUNT_TEXT.passphrase` (Task 5), `useAuth`.
- Produces: `SetRecoveryPassphraseDialog({open, onOpenChange, hasRecoveryPassphrase}: {open: boolean; onOpenChange: (open: boolean) => void; hasRecoveryPassphrase: boolean})`. Consumed by Task 8.

- [ ] **Step 1: Write the component**

Create `frontend/src/components/shared/shell/SetRecoveryPassphraseDialog.tsx`:

```tsx
"use client";

import { useAuth } from "@auth/context/AuthContext";
import useSetRecoveryPassphraseService from "@auth/useSetRecoveryPassphraseService";
import { AuthField } from "@components/shared/authForms/AuthField";
import { RevealToggle } from "@components/shared/authForms/RevealToggle";
import { Button } from "@components/ui/button";
import { Overline } from "@components/ds/Overline";
import { Dialog, DialogBody, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@components/ui/dialog";
import { zodResolver } from "@hookform/resolvers/zod";
import { MISMATCH_MESSAGE, SetRecoveryPassphraseFormSchema } from "@src/schemas/auth";
import { ACCOUNT_TEXT } from "@text/account";
import { useState } from "react";
import { useForm } from "react-hook-form";

import type { SetRecoveryPassphraseFormValues } from "@src/schemas/auth";

/* `set/change recovery passphrase` (COS-404) — the entry COS-321 drew and left disabled, and the
 * only place the 11 accounts that predate the `recovery_passphrase` column (COS-298) can ever get
 * one: `/recover` (COS-324) only spends a passphrase, it does not create one.
 *
 * `currentPassword` has no reveal toggle, for the reason `ChangePasswordDialog` gives at length —
 * it is being proved, not chosen. `recoveryPassphrase` and its confirmation share one, like
 * sign-up's pair, and carry `autoComplete="off"` rather than `current-password`/`new-password`:
 * COS-402 found both of those wrong for this exact secret on `RecoverForm` — there is no autofill
 * token for something held out of band, so the field claims none.
 *
 * The dialog touches no session and calls `setUser` rather than `setAuthState` on success: the
 * response carries only `hasRecoveryPassphrase`, and nothing about the session changed. */
function SetRecoveryPassphraseDialog({
  open,
  onOpenChange,
  hasRecoveryPassphrase,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  hasRecoveryPassphrase: boolean;
}) {
  const { setRecoveryPassphraseService } = useSetRecoveryPassphraseService();
  const { user, setUser } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [revealed, setRevealed] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isSubmitted },
  } = useForm<SetRecoveryPassphraseFormValues>({
    resolver: zodResolver(SetRecoveryPassphraseFormSchema),
    mode: "onTouched",
    defaultValues: { currentPassword: "", recoveryPassphrase: "", confirmRecoveryPassphrase: "" },
  });

  const values = watch();
  const messageFor = (field: keyof SetRecoveryPassphraseFormValues) =>
    isSubmitted || values[field] ? errors[field]?.message : undefined;

  const confirmMessage =
    values.confirmRecoveryPassphrase && values.confirmRecoveryPassphrase !== values.recoveryPassphrase
      ? MISMATCH_MESSAGE
      : messageFor("confirmRecoveryPassphrase");

  const onSubmit = async (formValues: SetRecoveryPassphraseFormValues) => {
    setServerError(null);
    try {
      const response = await setRecoveryPassphraseService({
        currentPassword: formValues.currentPassword,
        recoveryPassphrase: formValues.recoveryPassphrase,
      });
      if (user) {
        setUser({ ...user, hasRecoveryPassphrase: response.hasRecoveryPassphrase });
      }
      reset();
      onOpenChange(false);
    } catch {
      setServerError(ACCOUNT_TEXT.passphrase.failed);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          reset();
          setServerError(null);
        }
        onOpenChange(next);
      }}
    >
      <DialogContent className="max-w-110">
        <DialogHeader>
          <DialogTitle>
            {hasRecoveryPassphrase ? ACCOUNT_TEXT.passphrase.titleChange : ACCOUNT_TEXT.passphrase.titleSet}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogBody>
            <AuthField
              id="account-current-password-for-passphrase"
              label={ACCOUNT_TEXT.passphrase.current}
              type="password"
              autoComplete="current-password"
              error={messageFor("currentPassword")}
              {...register("currentPassword")}
            />

            <AuthField
              id="account-recovery-passphrase"
              label={ACCOUNT_TEXT.passphrase.next}
              hint={ACCOUNT_TEXT.passphrase.nextHint}
              type={revealed ? "text" : "password"}
              autoComplete="off"
              error={messageFor("recoveryPassphrase")}
              action={
                <RevealToggle
                  revealed={revealed}
                  reveal={ACCOUNT_TEXT.passphrase.reveal}
                  conceal={ACCOUNT_TEXT.passphrase.conceal}
                  controls="account-recovery-passphrase account-confirm-recovery-passphrase"
                  onToggle={() => setRevealed((shown) => !shown)}
                />
              }
              {...register("recoveryPassphrase")}
            />

            <AuthField
              id="account-confirm-recovery-passphrase"
              label={ACCOUNT_TEXT.passphrase.confirmNext}
              type={revealed ? "text" : "password"}
              autoComplete="off"
              error={confirmMessage}
              {...register("confirmRecoveryPassphrase")}
            />

            <p className="text-2xs text-gr-fg-4">{ACCOUNT_TEXT.passphrase.note}</p>

            {serverError && <Overline className="text-gr-accent-2">{serverError}</Overline>}
          </DialogBody>

          <DialogFooter>
            {/* Primary action first, cancel second, both left — same order as
                `ChangePasswordDialog`, `EditFooter` and `DeleteConfirm`. */}
            <Button
              type="submit"
              variant="primary"
              size="chrome"
              disabled={isSubmitting}
            >
              {ACCOUNT_TEXT.passphrase.submit}
            </Button>
            <Button
              type="button"
              variant="chrome"
              size="chrome"
              onClick={() => onOpenChange(false)}
            >
              {ACCOUNT_TEXT.passphrase.cancel}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export { SetRecoveryPassphraseDialog };
```

- [ ] **Step 2: Verify manually**

```bash
cd frontend && pnpm exec tsc --noEmit
```

Expected: no new type errors.

---

### Task 8: Frontend — wire both dialogs into `UserMenu`

**Files:**
- Modify: `frontend/src/text/shell.ts`
- Modify: `frontend/src/components/shared/shell/UserMenu.tsx`

**Interfaces:**
- Consumes: `ChangePasswordDialog` (Task 6), `SetRecoveryPassphraseDialog` (Task 7), `useAuth().user?.hasRecoveryPassphrase` (Task 4).

- [ ] **Step 1: Update the menu copy**

Modify `frontend/src/text/shell.ts`. Replace the comment block above `menu` and the `menu` object itself:

```ts
/* The account menu (COS-321, wired further by COS-404). `change password` and
 * `set/change recovery passphrase` now open real dialogs; `language` is still drawn and
 * **disabled** — it needs a translation layer bkmk has none of, out of scope for COS-404. It stays
 * shown rather than hidden for the same reason it always was: the menu is also how you learn what
 * an account has. `log out` remains the entry that works unconditionally. */
menu: {
  caption: "signed in",
  password: "change password",
  /** Shown when the account has no recovery passphrase yet. */
  passphrase: "set recovery passphrase",
  /** Shown once it does (COS-404) — the label is the only thing that tells the two states apart,
   *  there is no third. */
  passphraseChange: "change recovery passphrase",
  language: "language",
  languageValue: "english",
  signOut: "log out",
},
```

- [ ] **Step 2: Rewrite `UserMenu`**

Modify `frontend/src/components/shared/shell/UserMenu.tsx` in full:

```tsx
"use client";

import { useAuth } from "@auth/context/AuthContext";
import useSignOut from "@auth/useSignOut";
import { ChangePasswordDialog } from "@components/shared/shell/ChangePasswordDialog";
import { SetRecoveryPassphraseDialog } from "@components/shared/shell/SetRecoveryPassphraseDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/dropdown-menu";
import { SHELL_TEXT } from "@text/shell";
import { GlobeIcon, KeyRoundIcon, LogOutIcon, ShieldIcon } from "lucide-react";
import { useState } from "react";

/* The account menu (COS-321): what the chrome's e-mail opens.
 *
 * **It exists because that e-mail used to sign you out on the first click** — a link to `/logout`,
 * no menu, no confirmation, one pixel away from the module tabs. DS 03 left it deliberately: the
 * legacy menu it deleted was the only way out of a session, and a link kept that way open for a
 * ticket. This is the ticket.
 *
 * **The e-mail is the trigger's accessible name, and nothing overrides it.** Radix marks the button
 * `aria-haspopup="menu"`, which is what says a menu opens; an `aria-label` here would replace the
 * address with a phrase and take the one piece of information the row carries — *which* account is
 * signed in — away from anyone not reading the screen.
 *
 * **`change password` and `set/change recovery passphrase` open dialogs (COS-404).** Both are
 * rendered as siblings of `DropdownMenu`, not inside `DropdownMenuContent` — a dialog mounted
 * inside a closing menu fights that menu's own focus-return-to-trigger for the same tick. Each
 * item's `onSelect` calls `event.preventDefault()` for the same reason: it stops Radix's default
 * dismissal behaviour from racing the dialog it just opened, and leaves closing the menu to the
 * click that is already driving `setOpenDialog`. `language` is still drawn disabled — it needs a
 * translation layer that does not exist yet.
 *
 * The lit row is `focus:`, never `hover:` — see `ui/dropdown-menu`, where Radix's pointer-follows-
 * focus behaviour makes one rule cover both. */
function UserMenu({ email }: { email: string }) {
  const signOut = useSignOut();
  const hasRecoveryPassphrase = useAuth().user?.hasRecoveryPassphrase ?? false;
  const [openDialog, setOpenDialog] = useState<"password" | "passphrase" | null>(null);

  return (
    <>
      <DropdownMenu>
        {/* **The hover is the chrome's own, not a shade of ink.** A 10px label going from `fg-3` to
            `fg` is a change you find after you have already clicked; the module tabs light a
            `white/22` wash inside a 24px box, and the two controls in the meta row — this one and
            `about` — are spaced to match (see `TopChrome`). The wash stays while the menu is open: the
            trigger of an open surface should read as held down. */}
        <DropdownMenuTrigger className="flex h-6 items-center rounded-md px-2 text-3xs text-gr-fg-3 transition-colors duration-120 outline-none hover:bg-white/22 hover:text-gr-fg focus-visible:ring-3 focus-visible:ring-gr-ring data-[state=open]:bg-white/22 data-[state=open]:text-gr-fg-2">
          {email}
        </DropdownMenuTrigger>

        {/* Anchored to the right edge of the trigger, which is the right edge of the chrome: the menu
            grows leftwards into the desk instead of off the screen. */}
        <DropdownMenuContent
          align="end"
          sideOffset={8}
        >
          <DropdownMenuLabel>{SHELL_TEXT.menu.caption}</DropdownMenuLabel>

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setOpenDialog("password");
            }}
          >
            <KeyRoundIcon />
            {SHELL_TEXT.menu.password}
          </DropdownMenuItem>

          <DropdownMenuItem
            onSelect={(event) => {
              event.preventDefault();
              setOpenDialog("passphrase");
            }}
          >
            <ShieldIcon />
            {hasRecoveryPassphrase ? SHELL_TEXT.menu.passphraseChange : SHELL_TEXT.menu.passphrase}
            {/* The minimum honest signal COS-321 asked for: an account with no recovery passphrase
                cannot recover its password, and has no other way to learn that. */}
            {!hasRecoveryPassphrase && (
              <i
                aria-hidden
                className="ml-auto block size-1.5 shrink-0 rounded-full bg-gr-accent-2"
              />
            )}
          </DropdownMenuItem>

          <DropdownMenuItem disabled>
            <GlobeIcon />
            {SHELL_TEXT.menu.language}
            <span className="ml-auto text-gr-fg-4">{SHELL_TEXT.menu.languageValue}</span>
          </DropdownMenuItem>

          <DropdownMenuSeparator />

          {/* `onSelect` rather than `onClick`: Radix fires it for the pointer and for `↵` alike, and
              closes the menu itself. The oxide ink is the `destructive` variant — this is the one
              control in the chrome that ends something. */}
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => void signOut()}
          >
            <LogOutIcon />
            {SHELL_TEXT.menu.signOut}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ChangePasswordDialog
        open={openDialog === "password"}
        onOpenChange={(next) => setOpenDialog(next ? "password" : null)}
      />
      <SetRecoveryPassphraseDialog
        open={openDialog === "passphrase"}
        onOpenChange={(next) => setOpenDialog(next ? "passphrase" : null)}
        hasRecoveryPassphrase={hasRecoveryPassphrase}
      />
    </>
  );
}

export { UserMenu };
```

- [ ] **Step 3: Verify manually — the full interactive flow**

```bash
cd frontend && pnpm exec tsc --noEmit
```

Expected: no new type errors.

Then, with both dev servers running (backend on 3101, frontend on 3100) and signed in as a throwaway account:

1. Click the account e-mail in the top chrome. **Expected:** the menu opens, `change password` and `set recovery passphrase` are no longer greyed out.
2. Click `change password`. **Expected:** the menu closes, the dialog opens cleanly — no stuck overlay, no unresponsive page (this is the Radix menu-item-opens-dialog interaction called out in `UserMenu`'s comment; if it misbehaves, that comment is the first place to check). Submit with a wrong current password. **Expected:** inline `current password is incorrect`, dialog stays open, you are still signed in (check the tab bar is still there, no bounce to `/login`).
3. Submit with the right current password and a valid new one. **Expected:** dialog closes; reload the page — still signed in (the replayed session survived the reload).
4. Open the menu again, click `set recovery passphrase` (label should say "set" if this account had none). Submit. **Expected:** dialog closes; reopen the menu — the entry now reads `change recovery passphrase` and its oxide dot is gone.
5. Log out and log back in with the **new** password from step 3, to confirm the account-side change actually stuck end to end.

---

## What to hand back

No commits are made as part of this plan. Once all eight tasks are verified, the working tree holds:

- `backend/src/schemas/auth.js`, `backend/src/routes/api/users.js`, four backend controller/helper files (three new, one modified via Task 1's edits spread across the three files listed there).
- `frontend/src/schemas/auth.ts`, `frontend/src/text/shell.ts`, one new text module, two new service hooks, two new dialog components, `UserMenu.tsx`.
- The spec update already made to `docs/superpowers/specs/2026-07-29-bkmk-graphite-redesign-design.md` (progress table row + amendment note), which should grow a `### Ce qui a été posé (COS-404, …)` subsection once QA is done, per this project's own convention of documenting a ticket's actual shipped behavior once it has one.

Report the manual QA results (which curl calls were run, what came back, what the browser walkthrough showed) so the ticket's Linear description and the spec's new subsection can cite real numbers rather than intentions — the same way COS-297's "44 assertions" and COS-311's measurements are cited elsewhere in this spec. Branch name and commit message are the user's call once they've reviewed the diff, per this session's standing instruction never to commit or push without being told to.
