-- COS-298 — the recovery passphrase.
--
-- Password recovery by email is abandoned: bkmk is self-hosted, there is no mail server, and
-- the controller that pretended otherwise aimed at Sendinblue with another project's sender.
-- What replaces it is a passphrase the account holder chooses, hashed here exactly like the
-- password: same bcrypt, same 60-character column.
--
-- NULL is a real state, not a placeholder. Every account created before this migration has no
-- passphrase, so it has **no way to recover its password** until it sets one from the user menu
-- (COS-321). Making the column NOT NULL would have meant inventing a passphrase for those
-- accounts, and an invented recovery secret is worse than none: it is a second password nobody
-- chose and everybody could look up.
--
-- Without this migration: sign-up answers 500 on `Unknown column 'recovery_passphrase'`, since
-- the controller inserts it. Sign-in is unaffected.

ALTER TABLE user
  ADD COLUMN recovery_passphrase VARCHAR(60) NULL AFTER password;
