# COS-330 — `snooze` / `done` / `snooze all` : plan d'implémentation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Câbler les trois contrôles que UI 08 a livrés désactivés — `snooze` met la récurrence d'une alarme en pause sans la retirer de la liste, `done` désarme le signet, `snooze all` fait le premier sur tout le compte — et donner à la fiche le bouton `alarm` qui ramène à l'écran alarmes sur la ligne du signet.

**Architecture:** Une colonne `alarm.paused_at` (`NULL` = l'alarme tourne). `resume` fait glisser `date_added` de la durée exacte du sommeil, ce qui gèle le compte à rebours au lieu de le décaler. `done` n'ajoute aucune colonne : il désarme, exactement comme la modale d'édition quand on vide le champ `reminder`. Trois routes (`PATCH /reminders/:alarmId`, `PATCH /reminders`, `DELETE /reminders/:alarmId`), trois lectures SQL qui apprennent la colonne, et côté front un état de ligne « endormie » plus une bande de confirmation en place pour `done`.

**Tech Stack:** Express 4 + mysql2 + zod 4 (CommonJS) côté back ; Next 16 App Router + React 19 + react-query 5 + Tailwind 4 + zod 4 côté front. Biome pour le lint.

**Spec :** `docs/superpowers/specs/2026-07-29-bkmk-graphite-redesign-design.md`, section `### COS-330` à la fin du §0. Ticket : COS-330.

## Global Constraints

- **Branche :** `cosmokaat/cos-330-de-mock-de-lecran-alarms-snooze-done-snooze-all` (le `gitBranchName` de Linear). À créer depuis `master` avant la tâche 1.
- **Aucun commit, aucun push, aucune PR.** Règle du propriétaire, écrite aussi au §0 de la spec : rien n'est commité tant que la QA n'a pas été validée **explicitement**. Chaque tâche se termine par un point de QA, pas par un `git commit`. Le travail fini reste dans l'arbre de travail.
- **Ce dépôt n'a aucun harnais de test.** `backend/package.json` a `"test": "echo \"Error: no test specified\" && exit 1"` et le front n'a pas de script de test du tout. **N'en installe pas un** — ce serait un autre ticket, et un gros. La vérification de ce projet est celle que les tickets précédents ont utilisée, et chaque tâche ci-dessous l'écrit en toutes lettres :
  1. `pnpm lint` dans le paquet touché (Biome + `check-require-paths.js` côté back) ;
  2. **le pilotage de la vraie route** contre la base de dev, avec les commandes données ;
  3. **la mesure en Chrome sans tête** pour toute géométrie.
- **Jamais de nombre en dur ni de marge négative pour aligner quoi que ce soit.** Une géométrie s'affirme après mesure (Chrome sans tête, 1440×900, vraie IBM Plex Mono) ou pas du tout. Une illusion d'optique se laisse.
- **Commentaires de code en anglais**, sans exception. Seuls ce plan, la spec et Linear sont en français.
- **Pas de mémoïsation à la main** : le compilateur React est activé (`reactCompiler` dans `next.config.js`). Jamais `useMemo`, `useCallback` ni `memo`.
- **Dépôt public** : aucune adresse e-mail réelle et aucun détail de faille ouverte dans un fichier versionné. Les identifiants de pilotage passent par des variables d'environnement, jamais écrits dans un fichier.
- **Les mots à l'écran vivent dans `frontend/src/text/`**, en anglais, jamais dans un composant.

## Préalable — la session de pilotage

Plusieurs tâches appellent l'API authentifiée. Ouvre-la une fois, garde le pot à cookies, et refais l'étape si tu prends un `401`.

```bash
export API=http://localhost:3101
export JAR=/tmp/bkmk-cos330.jar
# Les identifiants d'un compte de dev — jamais écrits dans un fichier versionné.
export BKMK_EMAIL='...' BKMK_PASSWORD='...'

curl -s -c "$JAR" -X POST "$API/users" \
  -H 'content-type: application/json' \
  -d "{\"email\":\"$BKMK_EMAIL\",\"password\":\"$BKMK_PASSWORD\"}" | head -c 200

export CSRF=$(curl -s -b "$JAR" -c "$JAR" "$API/users/csrf" | node -pe 'JSON.parse(require("fs").readFileSync(0)).csrfToken')
echo "csrf=${CSRF:0:8}…"
```

Un verbe non sûr (`PATCH`, `DELETE`) prend toujours `-b "$JAR" -H "x-csrf-token: $CSRF"`.

Pour lire la base directement, le raccourci utilisé partout dans ce plan — il emprunte la connexion du projet, donc il lit `ecosystem.config.js` comme le serveur :

```bash
cd backend && node -e "require('./src/db/dbinitmysql')().then(async c => { const [r] = await c.execute(process.argv[1]); console.log(JSON.stringify(r, null, 2)); await c.end(); })" "SELECT 1"
```

---

### Task 1 : la colonne

**Files:**
- Create: `backend/src/db/migrations/2026-08-02-add-alarm-paused-at.sql`
- Modify: `backend/src/db/bkmk.sql:44-48`

**Interfaces:**
- Consumes: rien.
- Produces: la colonne `alarm.paused_at` (`DATE NULL`). `NULL` = l'alarme tourne ; une date = elle dort depuis ce jour-là. Toutes les tâches suivantes en dépendent.

- [ ] **Step 1: Créer la branche**

```bash
git checkout -b cosmokaat/cos-330-de-mock-de-lecran-alarms-snooze-done-snooze-all
```

- [ ] **Step 2: Constater que la colonne n'existe pas**

```bash
cd backend && node -e "require('./src/db/dbinitmysql')().then(async c => { const [r] = await c.execute('DESCRIBE alarm'); console.table(r); await c.end(); })"
```

Attendu : trois lignes — `id`, `frequency`, `date_added`. Pas de `paused_at`.

- [ ] **Step 3: Écrire la migration**

Créer `backend/src/db/migrations/2026-08-02-add-alarm-paused-at.sql` :

```sql
-- COS-330 — the alarm that is asleep.
--
-- An alarm is a frequency, not a deadline: it repeats every `frequency` days from `date_added`, so
-- there is no next-fire row to move, and `snooze` cannot push one back. What it does instead is stop
-- the clock -- and stopping a clock needs somewhere to write the day it stopped.
--
-- NULL means the alarm runs. A date means it has slept since that day, and `resume` slides
-- `date_added` forward by exactly that sleep: with `d' = d + (r - p)`, `(r - d') MOD f` equals
-- `(p - d) MOD f`, so the countdown comes back on the number it froze on rather than drifting. The
-- new origin cannot land in the future either -- an alarm is armed before it sleeps and sleeps
-- before it wakes, so `d <= p <= r` gives `d' <= r`.
--
-- DATE and not DATETIME, like every other date in this schema: an alarm has no hour anywhere, and a
-- column able to carry one would be the first place to print a precision nothing can produce.
--
-- `done` needs no column of its own -- it clears `bookmark.alarm_id` and deletes the row, which is
-- the path `editBookmarkController.applyAlarm` already takes when the `reminder` field is emptied.
-- A `status` enum carrying all three states would have given "this record is armed" two answers:
-- `bookmark.alarm_id IS NOT NULL`, which the index filter, the rail, the record, the edit modal, the
-- export and the duplicate check all read, and the enum, which only the alarms screen would.
--
-- Without this migration: `GET /reminders` answers 500 on `Unknown column 'alarm.paused_at'`, and
-- with it the alarms screen and both counters in the chrome.

ALTER TABLE alarm ADD COLUMN paused_at DATE NULL AFTER date_added;
```

- [ ] **Step 4: Vérifier qu'elle est en attente**

```bash
cd backend && pnpm migrate:status
```

Attendu : `2026-08-02-add-alarm-paused-at.sql` listée comme **pending**.

- [ ] **Step 5: L'appliquer**

```bash
cd backend && pnpm migrate
```

Attendu : la migration s'applique, sans erreur.

- [ ] **Step 6: Vérifier la colonne**

```bash
cd backend && node -e "require('./src/db/dbinitmysql')().then(async c => { const [r] = await c.execute('DESCRIBE alarm'); console.table(r); await c.end(); })"
```

Attendu : quatre lignes, la quatrième `paused_at | date | YES | | NULL |`.

- [ ] **Step 7: Porter le changement dans le script de création**

Dans `backend/src/db/bkmk.sql`, remplacer :

```sql
CREATE TABLE alarm (
    id          INT(11) AUTO_INCREMENT PRIMARY KEY,
    frequency   INT(3),
    date_added  DATE NOT NULL
);
```

par :

```sql
CREATE TABLE alarm (
    id          INT(11) AUTO_INCREMENT PRIMARY KEY,
    frequency   INT(3),
    date_added  DATE NOT NULL,
    -- NULL: the alarm runs. A date: it has slept since that day (COS-330). `resume` slides
    -- `date_added` forward by the sleep, which freezes the countdown instead of shifting it.
    -- See migrations/ for the arithmetic and for why `done` needs no column at all.
    paused_at   DATE NULL
);
```

- [ ] **Step 8: Lint**

```bash
cd backend && pnpm lint
```

Attendu : aucune erreur.

- [ ] **Step 9: Point de QA**

Rien n'est commité. Signaler : la colonne existe en base de dev, `bkmk.sql` la porte, et la migration est enregistrée. **Ne pas passer à la tâche 2 avant la validation.**

---

### Task 2 : les trois lectures apprennent la colonne

**Files:**
- Modify: `backend/src/routes/controllers/reminders/getRemindersController.js`
- Modify: `backend/src/routes/controllers/reminders/getAlarmLoadController.js:55`
- Modify: `backend/src/routes/controllers/bookmarks/getBookmarksController.js:193-205`

**Interfaces:**
- Consumes: la colonne `alarm.paused_at` (tâche 1).
- Produces: `GET /reminders` rend un champ de plus, `alarm_paused_at` (`null` ou une date `YYYY-MM-DD`), et rend `alarm_days_until` / `alarm_next_fire` **`null`** sur une alarme endormie. L'ordre est : les alarmes qui tournent d'abord, par imminence, puis les endormies. La tâche 4 consomme ces trois champs.

- [ ] **Step 1: Choisir une alarme de test et l'endormir à la main**

```bash
cd backend && node -e "require('./src/db/dbinitmysql')().then(async c => { const [r] = await c.execute('SELECT alarm.id, alarm.frequency, alarm.date_added, b.title FROM alarm INNER JOIN bookmark b ON b.alarm_id=alarm.id WHERE b.active=1 AND alarm.frequency>0 LIMIT 3'); console.table(r); await c.end(); })"
```

Noter le premier `id` — il sert dans tout ce plan :

```bash
export ALARM_ID=<l'id relevé>
cd backend && node -e "require('./src/db/dbinitmysql')().then(async c => { await c.execute('UPDATE alarm SET paused_at=CURDATE() WHERE id=?', [process.argv[1]]); console.log('asleep'); await c.end(); })" "$ALARM_ID"
```

- [ ] **Step 2: Constater que les trois lectures ne la distinguent pas encore**

```bash
curl -s -b "$JAR" "$API/reminders" | node -pe "JSON.parse(require('fs').readFileSync(0)).map(r => [r.alarm_id, r.alarm_days_until, r.alarm_paused_at]).slice(0,5)"
```

Attendu **avant** le correctif : l'alarme endormie a toujours un `alarm_days_until` numérique, et `alarm_paused_at` est `undefined`. C'est le défaut que les étapes suivantes corrigent.

- [ ] **Step 3: Réécrire la requête des rappels**

Dans `backend/src/routes/controllers/reminders/getRemindersController.js`, ajouter sous la constante `DAYS_UNTIL_NEXT_FIRE` :

```js
/** An alarm that is asleep (COS-330). `paused_at` is `NULL` while it runs, so this is the whole
 *  test — and it is written once here because three places below need it and a fourth spelling is
 *  how they stop agreeing. */
const RUNNING = "alarm.paused_at IS NULL";
```

Puis remplacer le bloc `const sql = ...` par :

```js
  const sql = `
    SELECT b.*,
           alarm.id AS alarm_id,
           alarm.frequency AS alarm_frequency,
           alarm.date_added AS alarm_added,
           alarm.paused_at AS alarm_paused_at,
           CASE WHEN ${RUNNING} THEN ${DAYS_UNTIL_NEXT_FIRE} END AS alarm_days_until,
           CASE WHEN ${RUNNING} THEN DATE_ADD(CURDATE(), INTERVAL ${DAYS_UNTIL_NEXT_FIRE} DAY) END AS alarm_next_fire,
           u.original AS original_url
    FROM bookmark b
    INNER JOIN alarm ON b.alarm_id = alarm.id
    LEFT JOIN url u ON b.url_id = u.id
    WHERE b.user_id = ? AND b.active = 1 AND alarm.frequency > 0
    ORDER BY (alarm.paused_at IS NOT NULL) ASC, alarm_days_until ASC, b.title ASC
  `;
```

Et ajouter, à la fin du commentaire de bloc au-dessus de `module.exports` :

```js
 * ⚠️ **A sleeping alarm keeps its row and loses its two numbers** (COS-330). It stays in the list —
 * that is what `snooze` means here, as against `done`, which disarms the record and takes the row
 * with it — but a stopped clock has no next firing, so `alarm_days_until` and `alarm_next_fire` come
 * back `NULL` rather than carrying a countdown nothing is counting down.
 *
 * ⚠️ **`(alarm.paused_at IS NOT NULL) ASC` leads the `ORDER BY`, and it is a fix, not a preference.**
 * MySQL sorts `NULL` **first** in an ascending order, so without it the alarms that ring soonest
 * would be pushed under the ones that never ring — on a list whose whole order is imminence.
```

- [ ] **Step 4: Vérifier la lecture des rappels**

```bash
curl -s -b "$JAR" "$API/reminders" | node -pe "JSON.parse(require('fs').readFileSync(0)).map(r => [r.alarm_id, r.alarm_days_until, r.alarm_paused_at])"
```

Attendu : l'alarme `$ALARM_ID` porte `alarm_days_until: null`, `alarm_next_fire: null`, `alarm_paused_at: "<aujourd'hui>"`, et elle est **la dernière** du tableau. Les autres sont inchangées et toujours triées par imminence croissante.

- [ ] **Step 5: Sortir les alarmes endormies de la charge des 14 jours**

Dans `backend/src/routes/controllers/reminders/getAlarmLoadController.js`, remplacer :

```js
       WHERE b.user_id = ? AND b.active = 1 AND alarm.frequency > 0
```

par :

```js
       WHERE b.user_id = ? AND b.active = 1 AND alarm.frequency > 0 AND alarm.paused_at IS NULL
```

et ajouter au commentaire de bloc du fichier :

```js
 * ⚠️ **A sleeping alarm draws no bar** (COS-330), for the reason it has no fire date in the list
 * beside it: the fortnight is a forecast of firings, and an alarm whose clock is stopped has none to
 * forecast. It comes back the day it is woken, and its bars land on the slid series rather than the
 * one it had before.
```

- [ ] **Step 6: Vérifier la charge**

```bash
curl -s -b "$JAR" "$API/reminders/load" | node -pe "JSON.parse(require('fs').readFileSync(0)).map(d => d.count).join(' ')"
```

Attendu : quatorze nombres, dont la somme a baissé par rapport à l'étape 2 (l'alarme endormie ne compte plus). Réveiller l'alarme, rappeler la route, et retrouver les nombres d'avant :

```bash
cd backend && node -e "require('./src/db/dbinitmysql')().then(async c => { await c.execute('UPDATE alarm SET paused_at=NULL WHERE id=?', [process.argv[1]]); await c.end(); })" "$ALARM_ID"
curl -s -b "$JAR" "$API/reminders/load" | node -pe "JSON.parse(require('fs').readFileSync(0)).map(d => d.count).join(' ')"
```

- [ ] **Step 7: Sortir les alarmes endormies du filtre `alarm=due`**

Dans `backend/src/routes/controllers/bookmarks/getBookmarksController.js`, remplacer le corps du `case "due"` :

```js
    case "due":
      conditions.push(
        "a.frequency > 0 AND MOD(a.frequency - MOD(DATEDIFF(CURDATE(), a.date_added), a.frequency), a.frequency) <= ?",
      );
      conditionParams.push(REMINDER_DUE_DAYS);
      break;
```

par :

```js
    case "due":
      /* `a.paused_at IS NULL` is the third copy of one guard (COS-330), beside `getRemindersController`
         and `getAlarmLoadController`: an alarm whose clock is stopped is never imminent, and a filter
         answering `≤ 3d` on a row the alarms screen shows as `paused` would be the two screens
         disagreeing about the same alarm. */
      conditions.push(
        "a.frequency > 0 AND a.paused_at IS NULL AND MOD(a.frequency - MOD(DATEDIFF(CURDATE(), a.date_added), a.frequency), a.frequency) <= ?",
      );
      conditionParams.push(REMINDER_DUE_DAYS);
      break;
```

- [ ] **Step 8: Vérifier le filtre**

Endormir une alarme **imminente** et vérifier qu'elle quitte le filtre :

```bash
cd backend && node -e "require('./src/db/dbinitmysql')().then(async c => { const [r] = await c.execute(\"SELECT alarm.id, b.id AS bid FROM alarm INNER JOIN bookmark b ON b.alarm_id=alarm.id WHERE b.active=1 AND alarm.frequency>0 AND MOD(alarm.frequency - MOD(DATEDIFF(CURDATE(), alarm.date_added), alarm.frequency), alarm.frequency) <= 3 LIMIT 1\"); console.log(JSON.stringify(r)); await c.end(); })"
```

Si la requête ne rend rien, aucune alarme n'est imminente sur cette base — armer un signet à `1` jour depuis l'écran d'insertion, ou en dater une à la main, puis reprendre. Sinon, avec l'`id` relevé (`export DUE_ID=<id>`) :

```bash
curl -s -b "$JAR" "$API/bookmarks?rows=500&page=0&alarm=due" | node -pe "JSON.parse(require('fs').readFileSync(0)).total"
cd backend && node -e "require('./src/db/dbinitmysql')().then(async c => { await c.execute('UPDATE alarm SET paused_at=CURDATE() WHERE id=?', [process.argv[1]]); await c.end(); })" "$DUE_ID"
curl -s -b "$JAR" "$API/bookmarks?rows=500&page=0&alarm=due" | node -pe "JSON.parse(require('fs').readFileSync(0)).total"
```

Attendu : le second total vaut le premier moins un. Puis remettre la base en état :

```bash
cd backend && node -e "require('./src/db/dbinitmysql')().then(async c => { await c.execute('UPDATE alarm SET paused_at=NULL WHERE id=?', [process.argv[1]]); await c.end(); })" "$DUE_ID"
```

Vérifier au passage que `alarm=armed` **n'a pas** bougé — il porte sur la présence du lien, pas sur l'état de l'alarme :

```bash
curl -s -b "$JAR" "$API/bookmarks?rows=500&page=0&alarm=armed" | node -pe "JSON.parse(require('fs').readFileSync(0)).total"
```

- [ ] **Step 9: Lint**

```bash
cd backend && pnpm lint
```

- [ ] **Step 10: Point de QA**

Signaler : les trois lectures distinguent une alarme endormie, et l'écran alarmes du navigateur affiche encore tout comme avant (le front ignore le nouveau champ jusqu'à la tâche 4). Rien n'est commité.

---

### Task 3 : les trois routes

**Files:**
- Create: `backend/src/schemas/reminders.js`
- Create: `backend/src/routes/controllers/reminders/helpers/pauseAlarms.js`
- Create: `backend/src/routes/controllers/reminders/patchAlarmController.js`
- Create: `backend/src/routes/controllers/reminders/patchAlarmsController.js`
- Create: `backend/src/routes/controllers/reminders/deleteAlarmController.js`
- Modify: `backend/src/routes/api/reminders.js`

**Interfaces:**
- Consumes: `alarm.paused_at` (tâche 1).
- Produces: trois routes, que la tâche 5 et la tâche 6 appellent depuis le front.
  - `PATCH /reminders/:alarmId` avec `{ paused: boolean }` → `200 { msg }`, `404` si l'alarme n'est pas au compte.
  - `PATCH /reminders` avec `{ paused: boolean }` → `200 { msg, moved: number }`.
  - `DELETE /reminders/:alarmId` → `200 { msg }`, `404` idem.
  - Helper `pauseAlarms(conn, { userId, paused, alarmId? }) → Promise<number>` (le nombre d'alarmes déplacées).

- [ ] **Step 1: Constater que les routes n'existent pas**

```bash
curl -s -o /dev/null -w '%{http_code}\n' -b "$JAR" -H "x-csrf-token: $CSRF" -X PATCH "$API/reminders/$ALARM_ID" -H 'content-type: application/json' -d '{"paused":true}'
curl -s -o /dev/null -w '%{http_code}\n' -b "$JAR" -H "x-csrf-token: $CSRF" -X DELETE "$API/reminders/$ALARM_ID"
```

Attendu : `404` sur les deux, produit par Express faute de route (et non par un contrôleur).

- [ ] **Step 2: Écrire les schémas d'entrée**

Créer `backend/src/schemas/reminders.js` :

```js
const { z } = require("zod");
const { idSchema } = require("./primitives");

/* Inputs of the reminders routes (COS-330).
 *
 * Unlike `bookmarks.js`, these bodies are JSON rather than multipart — nothing here carries a file —
 * so a boolean arrives as a boolean and needs no coercion. `idSchema` still coerces, because the
 * identifier comes from the path and a path segment is always a string. */

/** `PATCH /reminders/:alarmId` and `DELETE /reminders/:alarmId` — which alarm. */
const alarmIdParamsSchema = z.object({
  alarmId: idSchema,
});

/** The body of both `PATCH`es: the state the caller wants, not the change it wants applied.
 *
 * ⚠️ **A boolean and not a verb that toggles.** The screen reads a list fetched some time ago, so a
 * toggle can be aimed at a state that has already moved: you see `snooze`, another tab woke the
 * alarm, and the click puts it back to sleep. Asked twice, `{ paused: true }` gives the same answer
 * twice — which is also what makes `snooze all` safe over a list where some rows already sleep. */
const pauseBodySchema = z.object({
  paused: z.boolean(),
});

module.exports = { alarmIdParamsSchema, pauseBodySchema };
```

- [ ] **Step 3: Écrire le helper des deux écritures**

Créer `backend/src/routes/controllers/reminders/helpers/pauseAlarms.js` :

```js
/* The two writes behind `snooze` and `resume` (COS-330), in one file because two routes make them:
 * one alarm from `PATCH /reminders/:alarmId`, every alarm of the account from `PATCH /reminders`.
 *
 * ⚠️ **The `paused_at` test in each `WHERE` is the promise of idempotence, not decoration.** Without
 * `IS NULL` on the sleep, putting an already-sleeping alarm to sleep rewrites `paused_at` to today
 * and loses every day it had already slept: waking would then slide `date_added` by less than the
 * real sleep, and the countdown would come back earlier than it stopped. `snooze all` over a list
 * where two rows already sleep is the common case, not the contrived one.
 *
 * **Waking slides the whole series by exactly the sleep**, which freezes the countdown rather than
 * shifting it: with `d' = d + (r - p)`, `(r - d') MOD f` equals `(p - d) MOD f`. `T-15d` when it goes
 * to sleep, `T-15d` when it wakes, forty days later. And `date_added` cannot land in the future — an
 * alarm is armed before it sleeps and sleeps before it wakes, so `d <= p <= r` gives `d' <= r`.
 *
 * **The scope is the session's, never the path's** (COS-322): `alarm` carries no owner, the bookmark
 * pointing at it does, so both statements join through `bookmark`. `b.active = 1` keeps a
 * soft-deleted record's alarm out of reach, exactly as the list does. */
const SLEEP = `
  UPDATE alarm
    INNER JOIN bookmark b ON b.alarm_id = alarm.id
     SET alarm.paused_at = CURDATE()
   WHERE b.user_id = ? AND b.active = 1 AND alarm.paused_at IS NULL`;

const WAKE = `
  UPDATE alarm
    INNER JOIN bookmark b ON b.alarm_id = alarm.id
     SET alarm.date_added = DATE_ADD(alarm.date_added, INTERVAL DATEDIFF(CURDATE(), alarm.paused_at) DAY),
         alarm.paused_at  = NULL
   WHERE b.user_id = ? AND b.active = 1 AND alarm.paused_at IS NOT NULL`;

/**
 * Puts the account's alarms to sleep, or wakes them. `alarmId` narrows the write to one; without it
 * the whole account moves, which is `snooze all`.
 *
 * Returns how many alarms actually moved — `0` when they were already in the asked-for state. The
 * single-alarm route tells that apart from "no such alarm" with a read of its own, because this
 * count cannot: the guard makes both cases report zero.
 *
 * @param {import("mysql2/promise").Connection} conn
 * @param {{ userId: number, paused: boolean, alarmId?: number }} options
 * @returns {Promise<number>}
 */
const pauseAlarms = async (conn, { userId, paused, alarmId }) => {
  const sql = (paused ? SLEEP : WAKE) + (alarmId ? " AND alarm.id = ?" : "");
  const params = alarmId ? [userId, alarmId] : [userId];

  const [result] = await conn.execute(sql, params);
  return result.affectedRows;
};

module.exports = pauseAlarms;
```

- [ ] **Step 4: Écrire le contrôleur d'une alarme**

Créer `backend/src/routes/controllers/reminders/patchAlarmController.js` :

```js
const dbConnection = require("../../../db/dbinitmysql");
const pauseAlarms = require("./helpers/pauseAlarms");

/* `PATCH /reminders/:alarmId` — `snooze` and `resume` on one row (COS-330).
 *
 * ⚠️ **The ownership check is a read of its own, not an extra `AND` on the write** — the arrangement
 * `deleteBookmarkController` explains at length. Both refuse the write; only the read tells "not
 * yours" from "already in that state", because the guarded `UPDATE` reports zero rows either way. So
 * `404` means the alarm is not the caller's, and `200` covers a change and a no-op alike, which is
 * what makes the route idempotent from the client's side as well as the database's.
 *
 * An alarm that is not yours and an alarm that does not exist get the same `404`: two answers would
 * still say which identifiers are real. */
module.exports = async (req, res) => {
  const { alarmId } = req.validated.params;
  const { paused } = req.validated.body;

  const conn = await dbConnection();

  try {
    const [[alarm]] = await conn.execute(
      `SELECT alarm.id FROM alarm
         INNER JOIN bookmark b ON b.alarm_id = alarm.id
        WHERE alarm.id = ? AND b.user_id = ? AND b.active = 1`,
      [alarmId, req.user.id],
    );

    if (!alarm) {
      return res.status(404).json({ msg: "alarm not found" });
    }

    await pauseAlarms(conn, { userId: req.user.id, paused, alarmId });

    return res.status(200).json({ msg: paused ? "alarm paused" : "alarm resumed" });
  } catch (e) {
    return res.status(500).json({ msg: "error updating alarm : " + e });
  } finally {
    await conn.end();
  }
};
```

- [ ] **Step 5: Écrire le contrôleur de toute la liste**

Créer `backend/src/routes/controllers/reminders/patchAlarmsController.js` :

```js
const dbConnection = require("../../../db/dbinitmysql");
const pauseAlarms = require("./helpers/pauseAlarms");

/* `PATCH /reminders` — `snooze all` and `resume all` (COS-330).
 *
 * **No `404` to give, and no read to give it with.** The row-level route needs one because an
 * identifier can name someone else's alarm; this one names none, so its scope *is* the session and
 * an account with nothing to move is a request that succeeded and moved nothing. `moved` says which
 * of the two happened, and it is the count the guard in `pauseAlarms` makes meaningful: alarms
 * already asleep are not counted, and not rewritten.
 *
 * One statement rather than a loop over the list: the browser holds the alarms, but sending them
 * back to be named one by one would make the sleep of the first and the sleep of the last two
 * different days on a slow connection — and `CURDATE()` is what the wake subtracts. */
module.exports = async (req, res) => {
  const { paused } = req.validated.body;

  const conn = await dbConnection();

  try {
    const moved = await pauseAlarms(conn, { userId: req.user.id, paused });

    return res.status(200).json({ msg: paused ? "alarms paused" : "alarms resumed", moved });
  } catch (e) {
    return res.status(500).json({ msg: "error updating alarms : " + e });
  } finally {
    await conn.end();
  }
};
```

- [ ] **Step 6: Écrire le contrôleur de `done`**

Créer `backend/src/routes/controllers/reminders/deleteAlarmController.js` :

```js
const dbConnection = require("../../../db/dbinitmysql");

/* `DELETE /reminders/:alarmId` — `done` (COS-330).
 *
 * ⚠️ **It disarms the record; it does not hide a row.** That is the owner's reading of the word: the
 * bookmark leaves the alarms list, and leaves it because it no longer has an alarm — the record's
 * `alarm` field reads `none`, the edit modal's segment goes back to `off`, and the index's `has
 * alarm` filter loses it. Keeping a `done` row and filtering it out of one screen would have given
 * "this record is armed" two answers, and six readers to keep in step. It is also what makes the
 * screen ask before doing it: the frequency and the arming date leave with the row.
 *
 * ⚠️ **`UPDATE` before `DELETE`, and both inside one transaction.** `bookmark.alarm_id` is a foreign
 * key, so deleting the alarm first is refused outright; and a failure between the two would leave a
 * bookmark pointing at a row that is gone. It is the same pair, in the same order,
 * `editBookmarkController.applyAlarm` writes when the `reminder` field is emptied — the only other
 * way an alarm leaves.
 *
 * The ownership read is the one `patchAlarmController` does, for the reason it does it there. */
module.exports = async (req, res) => {
  const { alarmId } = req.validated.params;

  const conn = await dbConnection();

  try {
    const [[alarm]] = await conn.execute(
      `SELECT alarm.id, b.id AS bookmark_id FROM alarm
         INNER JOIN bookmark b ON b.alarm_id = alarm.id
        WHERE alarm.id = ? AND b.user_id = ? AND b.active = 1`,
      [alarmId, req.user.id],
    );

    if (!alarm) {
      return res.status(404).json({ msg: "alarm not found" });
    }

    await conn.beginTransaction();
    await conn.execute("UPDATE bookmark SET alarm_id=NULL WHERE id=?", [alarm.bookmark_id]);
    await conn.execute("DELETE FROM alarm WHERE id=?", [alarm.id]);
    await conn.commit();

    return res.status(200).json({ msg: "alarm disarmed" });
  } catch (e) {
    await conn.rollback().catch(() => {});
    return res.status(500).json({ msg: "error disarming alarm : " + e });
  } finally {
    await conn.end();
  }
};
```

- [ ] **Step 7: Déclarer les routes**

Dans `backend/src/routes/api/reminders.js`, ajouter les `require` en tête (après `getAlarmLoadController`) :

```js
const patchAlarmController = require("../controllers/reminders/patchAlarmController");
const patchAlarmsController = require("../controllers/reminders/patchAlarmsController");
const deleteAlarmController = require("../controllers/reminders/deleteAlarmController");
const validate = require("../../middlewares/validate");
const { alarmIdParamsSchema, pauseBodySchema } = require("../../schemas/reminders");
```

et, sous la ligne `router.get("/load", ...)` :

```js
/* The three writes (COS-330). `snooze` and `done` on a row, `snooze all` on the account.
 *
 * ⚠️ **The collection `PATCH` is declared before the row one.** Express matches in declaration order
 * and `/` cannot be swallowed by `/:alarmId`, so this is not load-bearing the way `/import/parse` is
 * next door — but reading the wide one first is how it stays that way if a segment is ever added.
 *
 * `done` is a `DELETE` on the alarm rather than a `PATCH` on the bookmark, because what it removes
 * *is* the alarm: the row goes and `bookmark.alarm_id` goes with it. See the controller. */
router.patch("/", validate({ body: pauseBodySchema }), catchAsync(patchAlarmsController));

router.patch(
  "/:alarmId",
  validate({ params: alarmIdParamsSchema, body: pauseBodySchema }),
  catchAsync(patchAlarmController),
);

router.delete("/:alarmId", validate({ params: alarmIdParamsSchema }), catchAsync(deleteAlarmController));
```

- [ ] **Step 8: Piloter `snooze`, et vérifier le gel du compte à rebours**

```bash
# L'état de départ.
curl -s -b "$JAR" "$API/reminders" | node -pe "JSON.parse(require('fs').readFileSync(0)).filter(r => String(r.alarm_id) === process.env.ALARM_ID).map(r => [r.alarm_days_until, r.alarm_paused_at])"

# Endormir.
curl -s -b "$JAR" -H "x-csrf-token: $CSRF" -H 'content-type: application/json' -X PATCH "$API/reminders/$ALARM_ID" -d '{"paused":true}'
curl -s -b "$JAR" "$API/reminders" | node -pe "JSON.parse(require('fs').readFileSync(0)).filter(r => String(r.alarm_id) === process.env.ALARM_ID).map(r => [r.alarm_days_until, r.alarm_paused_at])"
```

Attendu : `alarm_days_until` passe du nombre relevé à `null`, `alarm_paused_at` porte la date du jour. **Noter le nombre d'avant** — l'étape 10 le rejoue.

- [ ] **Step 9: Vérifier l'idempotence, celle qui protège le sommeil**

Simuler un sommeil déjà entamé, puis rendormir l'alarme :

```bash
cd backend && node -e "require('./src/db/dbinitmysql')().then(async c => { await c.execute('UPDATE alarm SET paused_at=DATE_SUB(CURDATE(), INTERVAL 10 DAY) WHERE id=?', [process.argv[1]]); const [r] = await c.execute('SELECT paused_at FROM alarm WHERE id=?', [process.argv[1]]); console.log(JSON.stringify(r)); await c.end(); })" "$ALARM_ID"

curl -s -b "$JAR" -H "x-csrf-token: $CSRF" -H 'content-type: application/json' -X PATCH "$API/reminders/$ALARM_ID" -d '{"paused":true}'

cd backend && node -e "require('./src/db/dbinitmysql')().then(async c => { const [r] = await c.execute('SELECT paused_at FROM alarm WHERE id=?', [process.argv[1]]); console.log(JSON.stringify(r)); await c.end(); })" "$ALARM_ID"
```

Attendu : `200`, et `paused_at` **toujours à J-10**, pas ramené à aujourd'hui. C'est le défaut que la garde du `WHERE` empêche ; s'il revient à aujourd'hui, la garde manque.

- [ ] **Step 10: Piloter `resume`, et vérifier que le compte à rebours reprend là où il s'était arrêté**

⚠️ **Poser les deux dates ensemble, pas seulement `paused_at`.** Une alarme s'arme avant de s'endormir, donc `date_added ≤ paused_at` ; écrire un `paused_at` antérieur à `date_added` fabrique un état que rien ne peut produire, et le `DATEDIFF` du gel y devient négatif. 37 et 10 sont choisis pour que le compte à rebours gelé ne tombe ni sur `0` ni sur la fréquence entière — un gel qui vaut zéro se vérifie tout seul et ne prouve rien.

```bash
# Un sommeil propre : armée il y a 37 jours, endormie il y a 10.
cd backend && node -e "require('./src/db/dbinitmysql')().then(async c => { await c.execute('UPDATE alarm SET date_added=DATE_SUB(CURDATE(), INTERVAL 37 DAY), paused_at=DATE_SUB(CURDATE(), INTERVAL 10 DAY) WHERE id=?', [process.argv[1]]); await c.end(); })" "$ALARM_ID"

# Ce que le compte à rebours valait le jour de l'endormissement.
cd backend && node -e "require('./src/db/dbinitmysql')().then(async c => { const [r] = await c.execute('SELECT MOD(frequency - MOD(DATEDIFF(paused_at, date_added), frequency), frequency) AS frozen FROM alarm WHERE id=?', [process.argv[1]]); console.log('frozen at T-' + r[0].frozen + 'd'); await c.end(); })" "$ALARM_ID"

# Réveiller.
curl -s -b "$JAR" -H "x-csrf-token: $CSRF" -H 'content-type: application/json' -X PATCH "$API/reminders/$ALARM_ID" -d '{"paused":false}'
curl -s -b "$JAR" "$API/reminders" | node -pe "JSON.parse(require('fs').readFileSync(0)).filter(r => String(r.alarm_id) === process.env.ALARM_ID).map(r => ['T-' + r.alarm_days_until + 'd', r.alarm_paused_at])"
```

Attendu : les deux nombres sont **égaux**. Le compte à rebours reprend sur celui où il s'est arrêté, dix jours plus tard. `alarm_paused_at` est revenu à `null`.

- [ ] **Step 11: Piloter `snooze all` et `resume all`**

```bash
curl -s -b "$JAR" -H "x-csrf-token: $CSRF" -H 'content-type: application/json' -X PATCH "$API/reminders" -d '{"paused":true}'
curl -s -b "$JAR" -H "x-csrf-token: $CSRF" -H 'content-type: application/json' -X PATCH "$API/reminders" -d '{"paused":true}'
curl -s -b "$JAR" "$API/reminders" | node -pe "const l = JSON.parse(require('fs').readFileSync(0)); l.filter(r => r.alarm_paused_at).length + '/' + l.length + ' asleep'"
curl -s -b "$JAR" -H "x-csrf-token: $CSRF" -H 'content-type: application/json' -X PATCH "$API/reminders" -d '{"paused":false}'
curl -s -b "$JAR" "$API/reminders" | node -pe "const l = JSON.parse(require('fs').readFileSync(0)); l.filter(r => r.alarm_paused_at).length + '/' + l.length + ' asleep'"
```

Attendu : le premier appel rend `moved` égal au nombre d'alarmes, **le second rend `moved: 0`** — c'est la garde qui protège le sommeil déjà accumulé. Puis `N/N asleep`, et après le réveil `0/N asleep`.

- [ ] **Step 12: Piloter le refus**

Relever l'identifiant du compte piloté, puis une alarme qui n'est **pas** à lui :

```bash
export ME=$(curl -s -b "$JAR" "$API/users/me" | node -pe 'JSON.parse(require("fs").readFileSync(0)).id ?? JSON.parse(require("fs").readFileSync(0)).user?.id')
echo "me=$ME"

cd backend && node -e "require('./src/db/dbinitmysql')().then(async c => { const [r] = await c.execute('SELECT alarm.id FROM alarm INNER JOIN bookmark b ON b.alarm_id=alarm.id WHERE b.user_id <> ? LIMIT 1', [process.argv[1]]); console.log(JSON.stringify(r)); await c.end(); })" "$ME"
```

Si la base de dev n'a qu'un compte, la requête ne rend rien : créer un second compte depuis `/signup`, lui armer un signet, et reprendre. Avec l'identifiant relevé (`export FOREIGN_ID=<id>`) :

```bash
curl -s -o /dev/null -w '%{http_code}\n' -b "$JAR" -H "x-csrf-token: $CSRF" -H 'content-type: application/json' -X PATCH "$API/reminders/$FOREIGN_ID" -d '{"paused":true}'
curl -s -o /dev/null -w '%{http_code}\n' -b "$JAR" -H "x-csrf-token: $CSRF" -X DELETE "$API/reminders/$FOREIGN_ID"
curl -s -o /dev/null -w '%{http_code}\n' -b "$JAR" -H "x-csrf-token: $CSRF" -H 'content-type: application/json' -X PATCH "$API/reminders/999999999" -d '{"paused":true}'
curl -s -b "$JAR" -H "x-csrf-token: $CSRF" -H 'content-type: application/json' -X PATCH "$API/reminders/$ALARM_ID" -d '{"paused":"yes"}'
```

Attendu : `404`, `404`, `404`, puis un `400` portant `details[0].field === "body.paused"`. Vérifier enfin que l'alarme étrangère **n'a pas bougé** :

```bash
cd backend && node -e "require('./src/db/dbinitmysql')().then(async c => { const [r] = await c.execute('SELECT id, paused_at FROM alarm WHERE id=?', [process.argv[1]]); console.log(JSON.stringify(r)); await c.end(); })" "$FOREIGN_ID"
```

Attendu : la ligne existe toujours, `paused_at` à `null`.

- [ ] **Step 13: Piloter `done` sur un signet jetable**

Créer un signet **jetable** avec une alarme depuis l'écran d'insertion du navigateur (`/bookmarks/create`, titre reconnaissable, champ `alarm` renseigné), puis relever ses deux identifiants d'un coup :

```bash
curl -s -b "$JAR" "$API/reminders" | node -pe "const r = JSON.parse(require('fs').readFileSync(0)).find(x => x.title.includes('<le titre jetable>')); 'export DOOMED_ID=' + r.alarm_id + ' DOOMED_BOOKMARK=' + r.id"
```

Exécuter la ligne `export` que la commande imprime, puis :

```bash
curl -s -b "$JAR" -H "x-csrf-token: $CSRF" -X DELETE "$API/reminders/$DOOMED_ID"

cd backend && node -e "require('./src/db/dbinitmysql')().then(async c => { const [a] = await c.execute('SELECT id FROM alarm WHERE id=?', [process.argv[1]]); const [b] = await c.execute('SELECT id, alarm_id, title FROM bookmark WHERE id=?', [process.argv[2]]); console.log('alarm rows:', a.length, '| bookmark:', JSON.stringify(b)); await c.end(); })" "$DOOMED_ID" "$DOOMED_BOOKMARK"
```

Attendu : `alarm rows: 0`, le signet existe toujours avec son titre et `alarm_id: null`. Il a quitté `GET /reminders` :

```bash
curl -s -b "$JAR" "$API/reminders" | node -pe "JSON.parse(require('fs').readFileSync(0)).filter(r => String(r.alarm_id) === process.env.DOOMED_ID).length + ' rows'"
```

Attendu : `0 rows`. Un second `DELETE` sur la même alarme rend `404`.

- [ ] **Step 14: Lint**

```bash
cd backend && pnpm lint
```

Attendu : aucune erreur — y compris de `check-require-paths.js`, qui vérifie que les cinq nouveaux `require` relatifs résolvent avec l'orthographe exacte des fichiers.

- [ ] **Step 15: Point de QA**

Signaler : les trois routes répondent, le compte à rebours gèle et reprend au même nombre, l'idempotence tient sur les deux `PATCH`, et le refus est un `404` sur une alarme étrangère. Rien n'est commité.

---

### Task 4 : la ligne endormie

**Files:**
- Modify: `frontend/src/schemas/reminders.ts`
- Modify: `frontend/src/text/alarms.ts`
- Modify: `frontend/src/components/reminders/AlarmsRow.tsx`

**Interfaces:**
- Consumes: `alarm_paused_at`, `alarm_days_until` et `alarm_next_fire` nullables (tâche 2).
- Produces: le type `Reminder` porte `alarm_paused_at: Date | null` et rend les deux autres `number | null` / `Date | null`. `ALARMS_TEXT.row` gagne `paused`, `noFire`, `resume`, `askDone`, `confirm`, `cancel` et perd `pending`. La tâche 5 branche les boutons sur cet état.

- [ ] **Step 1: Constater le défaut**

Endormir l'alarme de test, ouvrir `/bookmarks/reminders` dans le navigateur :

```bash
curl -s -b "$JAR" -H "x-csrf-token: $CSRF" -H 'content-type: application/json' -X PATCH "$API/reminders/$ALARM_ID" -d '{"paused":true}'
```

Attendu **avant** le correctif : la page tombe en erreur (`could not load alarms`), parce que `ReminderSchema` exige un nombre là où le serveur envoie `null`. C'est le défaut que cette tâche corrige.

- [ ] **Step 2: Élargir le schéma**

Dans `frontend/src/schemas/reminders.ts`, remplacer les trois champs concernés de `ReminderSchema` par :

```ts
  alarm_added: dateLikeSchema,
  /** The day the alarm was put to sleep, `null` while it runs (COS-330). It is what tells a row that
   *  stays in the list without ringing from one that is counting down — `snooze` keeps the row,
   *  `done` takes it away. */
  alarm_paused_at: dateLikeSchema.nullable(),
  /** Days until the next firing, `0` on the day itself. Computed by MySQL from the two fields above
   *  — see `getRemindersController` for the expression and for why it is not derived here.
   *
   *  ⚠️ **`null` on a sleeping alarm** (COS-330): a stopped clock has no next firing, and a number
   *  here would be a countdown counting down to nothing. */
  alarm_days_until: numberLikeSchema.nullable(),
  /** The date of that next firing. **A day, not a moment**: an alarm has no time of day anywhere in
   *  the schema, so nothing downstream may print one. `null` on a sleeping alarm, with the field
   *  above and for its reason. */
  alarm_next_fire: dateLikeSchema.nullable(),
```

- [ ] **Step 3: Écrire les mots**

Dans `frontend/src/text/alarms.ts`, remplacer le bloc `row` par :

```ts
  row: {
    /** `T-07d`, the handoff's own format. `T-00d` is an alarm ringing today, which is what the
     *  endpoint used to return and nothing else. */
    countdown: (days: number) => `T-${String(days).padStart(2, "0")}d`,
    /** The countdown cell of an alarm that is asleep (COS-330). A word rather than a number, because
     *  there is no next firing to count down to — and no gauge beside it for the same reason. */
    paused: "paused",
    /** Its `fires` cell. The dash is the fields table's own way of saying a row exists with no value
     *  in it. */
    noFire: "—",
    /** The day the record was filed. */
    added: (date: string) => `bkmk ${date}`,
    /** The day the alarm was armed, and how often it repeats from there. */
    armed: (date: string, frequency: number) => `alarm ${date} · ${frequency}d`,
    snooze: "snooze",
    /** The same control on a sleeping alarm: the pause is undone by pressing it again, and the
     *  countdown comes back on the number it froze on. */
    resume: "resume",
    done: "done",
    /** `done` disarms the record — the frequency and the arming date leave with the alarm — so it
     *  asks first, in place, the way a row asks before a delete on the index. */
    askDone: "done?",
    confirm: "confirm",
    cancel: "cancel",
  },
```

⚠️ `pending: "not wired yet"` disparaît : il annonçait des contrôles inertes, et ils ne le sont plus.

Dans le même fichier, remplacer le dernier paragraphe du commentaire de tête :

```ts
 * ⚠️ **What *is* drawn and inert: `snooze`, `done`, `snooze all`.** No route pushes an alarm back or
 * acknowledges one, so all three are disabled, and `pending` says so once rather than three times.
 * The account menu's three unbuilt entries set that precedent (COS-321): shown, so you learn what
 * the screen will do, and greyed, because the one thing worse than a missing control is one that
 * does nothing when pressed. **COS-330** is the ticket that wires them. */
```

par :

```ts
 * ✅ **The three controls work since COS-330, and they do not mean what the mockup's words suggest.**
 * `snooze` stops the alarm's clock and **keeps** the row — the list is the inventory of what is
 * armed, and something you have chosen to silence is still armed. `done` is the one that empties the
 * row out of the screen, by disarming the record, which is why it asks first. `snooze all` is the
 * first of the two, over the account. `arm new` was never in that list: arming an alarm means giving
 * a reminder to a record, and the creation form is where that field lives. */
```

- [ ] **Step 4: Dessiner la ligne endormie**

Dans `frontend/src/components/reminders/AlarmsRow.tsx`, remplacer le corps de calcul :

```tsx
  const title = alarm.title;
  const url = alarm.original_url ?? undefined;
  const days = alarm.alarm_days_until;
  const imminent = days <= IMMINENT_DAYS;
  const elapsed = ((alarm.alarm_frequency - days) / alarm.alarm_frequency) * 100;
```

par :

```tsx
  const title = alarm.title;
  const url = alarm.original_url ?? undefined;
  /* `alarm_days_until` and `alarm_paused_at` are the two halves of one state and the server writes
     them together, but the test is on the countdown: it is the value this cell needs, and narrowing
     on it is what lets the branch below read it without a fallback that would never be taken. */
  const days = alarm.alarm_days_until;
  const asleep = alarm.alarm_paused_at !== null || days === null;
  const imminent = !asleep && days !== null && days <= IMMINENT_DAYS;
```

puis la cellule `countdown` :

```tsx
      <div
        role="cell"
        className="flex items-center gap-2"
      >
        {asleep || days === null ? (
          /* No gauge beside it: the bar shows how far through its period an alarm is, and an alarm
             that is not advancing through one has no reading to give. */
          <span className="shrink-0 text-gr-fg-4">{ALARMS_TEXT.row.paused}</span>
        ) : (
          <>
            <span className={cn("num shrink-0", imminent ? "text-gr-accent-2" : "text-gr-fg-2")}>
              {ALARMS_TEXT.row.countdown(days)}
            </span>
            {/* 56px, the handoff's width. Gone below the fold, where the number carries the column on
                its own and 56px of bar is the difference between the title fitting and not. */}
            <Progress
              value={((alarm.alarm_frequency - days) / alarm.alarm_frequency) * 100}
              aria-label={ALARMS_TEXT.columns.countdown}
              className={cn("w-14 @max-3xl:hidden", imminent && "[&_[data-slot=progress-indicator]]:bg-gr-accent-2")}
            />
          </>
        )}
      </div>
```

et la cellule `fires` :

```tsx
      <div
        role="cell"
        className="num text-2xs text-gr-fg-3"
      >
        {alarm.alarm_next_fire ? format(alarm.alarm_next_fire, "yyyy-MM-dd") : ALARMS_TEXT.row.noFire}
      </div>
```

Enfin, remplacer le dernier paragraphe du commentaire de bloc du composant :

```tsx
 * ⚠️ **`snooze` and `done` are drawn and disabled — COS-330.** No route pushes an alarm back or
 * acknowledges one. The `title` sits on the wrapper rather than on the buttons because a disabled
 * button receives no pointer events and would never show it. */
```

par :

```tsx
 * ⚠️ **A sleeping alarm keeps its row and loses its two readings** (COS-330). `countdown` reads
 * `paused` with no gauge and `fires` reads a dash, because the server sends `null` for both: an
 * alarm whose clock is stopped has no next firing, and printing the number it had would be a
 * countdown counting down to nothing. The row stays because that is the difference between `snooze`
 * and `done` — one silences an alarm you still have, the other says you are finished with it. */
```

- [ ] **Step 5: Vérifier dans le navigateur**

L'alarme de test est endormie depuis l'étape 1. Ouvrir `http://localhost:3100/bookmarks/reminders`.

Attendu : la page charge ; la ligne endormie est **en bas**, sa colonne `countdown` lit `paused` en gris sans jauge, sa colonne `fires` lit `—`, et les colonnes `title` et `added / armed` sont inchangées. Les autres lignes sont exactement comme avant.

- [ ] **Step 6: Vérifier l'état réveillé**

```bash
curl -s -b "$JAR" -H "x-csrf-token: $CSRF" -H 'content-type: application/json' -X PATCH "$API/reminders/$ALARM_ID" -d '{"paused":false}'
```

Rafraîchir la page. Attendu : la ligne retrouve sa place dans l'ordre d'imminence, son `T-NNd` et sa jauge.

- [ ] **Step 7: Lint**

```bash
cd frontend && pnpm lint
```

- [ ] **Step 8: Point de QA**

Signaler : la ligne sait se dessiner endormie, et les deux boutons sont toujours désactivés — c'est la tâche suivante. Rien n'est commité.

---

### Task 5 : les actions de la ligne

**Files:**
- Create: `frontend/src/services/useAlarmPause.ts`
- Create: `frontend/src/services/useAlarmDisarm.ts`
- Modify: `frontend/src/components/reminders/AlarmsTable.tsx`
- Modify: `frontend/src/components/reminders/AlarmsRow.tsx`

**Interfaces:**
- Consumes: `PATCH /reminders/:alarmId` et `DELETE /reminders/:alarmId` (tâche 3) ; `ALARMS_TEXT.row.{resume,askDone,confirm,cancel}` (tâche 4).
- Produces: `useAlarmPause()` → mutation sur `{ alarmId: number; paused: boolean }`. `useAlarmDisarm()` → mutation sur `{ alarmId: number; bookmarkId: number }`. `AlarmsRow` prend en plus `asleep`, `busy`, `confirming`, `onPause`, `onAskDone`, `onCancelDone`, `onConfirmDone`. La tâche 6 réutilise `useAlarmPause` pour la barre.

- [ ] **Step 1: Constater le défaut**

Ouvrir `/bookmarks/reminders`. Attendu : `snooze` et `done` sont grisés et ne répondent pas au clic.

- [ ] **Step 2: Écrire la mutation de pause**

Créer `frontend/src/services/useAlarmPause.ts` :

```ts
"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/* Putting an alarm to sleep and waking it (COS-330) — the row's `snooze` / `resume`, and the command
 * bar's `snooze all` / `resume all`.
 *
 * ⚠️ **The wanted state is sent, it is not toggled.** The screen reads a list fetched some time ago,
 * so a toggle can be aimed at a state that has already moved — you see `snooze`, another tab woke the
 * alarm, and the click puts it back to sleep. Both hooks therefore take `paused` and the caller reads
 * it off the row it is looking at.
 *
 * ⚠️ **One invalidation covers both entries.** `queryKeys.reminders.load()` is a child of
 * `queryKeys.reminders.all` and react-query matches keys by prefix, so invalidating the root
 * refreshes the list, the fortnight chart and the chrome's counter in one call. The bookmarks root
 * is deliberately left alone: a sleeping alarm is still an alarm as far as `bookmark.alarm_id` is
 * concerned, so nothing the index or the record reads has moved. `done` is the one that touches it —
 * see `useAlarmDisarm`. */
function useAlarmPause() {
  const queryClient = useQueryClient();
  const { privateRequest } = useRequestHelper();

  return useMutation({
    mutationFn: async ({ alarmId, paused }: { alarmId: number; paused: boolean }) => {
      await privateRequest(`/reminders/${alarmId}`, { method: "PATCH", data: { paused } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.reminders.all }),
  });
}

/** `snooze all` / `resume all` — the same write with no identifier, so the server moves the account
 *  in one statement. **Not a loop over the list**: `resume` subtracts `CURDATE()` from the day an
 *  alarm went to sleep, and alarms sent one by one over a slow connection could fall asleep on two
 *  different days. */
function useAlarmsPause() {
  const queryClient = useQueryClient();
  const { privateRequest } = useRequestHelper();

  return useMutation({
    mutationFn: async ({ paused }: { paused: boolean }) => {
      await privateRequest("/reminders", { method: "PATCH", data: { paused } });
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.reminders.all }),
  });
}

export { useAlarmPause, useAlarmsPause };
```

- [ ] **Step 3: Écrire la mutation de désarmement**

Créer `frontend/src/services/useAlarmDisarm.ts` :

```ts
"use client";

import useRequestHelper from "@helpers/useRequestHelper";
import { queryKeys } from "@lib/query/keys";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/* `done` (COS-330) — the record stops having an alarm at all.
 *
 * ⚠️ **Three invalidations, where `snooze` needs one, and the extra two are the point.** `done` is
 * not a state on the alarm, it is the alarm's removal: `bookmark.alarm_id` goes back to `NULL`, so
 * the record screen's `alarm` field, the edit modal's segment, the index's `has alarm` filter and the
 * rail's counters all change with it. The reminders root refreshes the list and the chart; the
 * bookmarks root refreshes the index and its counters; `bookmark.detail` refreshes the record itself,
 * which is very likely the screen the user came from.
 *
 * `bookmarkId` travels beside `alarmId` for that last key alone — the route needs only the alarm,
 * and the row already holds both. */
function useAlarmDisarm() {
  const queryClient = useQueryClient();
  const { privateRequest } = useRequestHelper();

  return useMutation({
    mutationFn: async ({ alarmId }: { alarmId: number; bookmarkId: number }) => {
      await privateRequest(`/reminders/${alarmId}`, { method: "DELETE" });
    },
    onSuccess: (_data, { bookmarkId }) =>
      Promise.all([
        queryClient.invalidateQueries({ queryKey: queryKeys.reminders.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmarks.all }),
        queryClient.invalidateQueries({ queryKey: queryKeys.bookmark.detail(bookmarkId) }),
      ]),
  });
}

export { useAlarmDisarm };
```

- [ ] **Step 4: Tenir l'état dans la table**

Dans `frontend/src/components/reminders/AlarmsTable.tsx`, ajouter les imports :

```tsx
import { useAlarmDisarm } from "@src/services/useAlarmDisarm";
import { useAlarmPause } from "@src/services/useAlarmPause";
import { useState } from "react";
```

et, en tête du corps de `AlarmsTable` :

```tsx
  /* ⚠️ **One row at a time**, which is the index table's own rule and for its reason: a second row
     asked to confirm cancels the first, so there is never a trail of half-armed confirmations down
     the list. The identifier is the alarm's, which is also what keys the rows. */
  const [confirming, setConfirming] = useState<number>();
  const pause = useAlarmPause();
  const disarm = useAlarmDisarm();
```

et remplacer le `map` :

```tsx
          alarms.map((alarm) => (
            <AlarmsRow
              key={alarm.alarm_id}
              alarm={alarm}
            />
          ))
```

par :

```tsx
          alarms.map((alarm) => (
            <AlarmsRow
              key={alarm.alarm_id}
              alarm={alarm}
              busy={pause.isPending || disarm.isPending}
              confirming={confirming === alarm.alarm_id}
              onPause={(paused) => pause.mutate({ alarmId: alarm.alarm_id, paused })}
              onAskDone={() => setConfirming(alarm.alarm_id)}
              onCancelDone={() => setConfirming(undefined)}
              onConfirmDone={() =>
                disarm.mutate(
                  { alarmId: alarm.alarm_id, bookmarkId: alarm.id },
                  { onSettled: () => setConfirming(undefined) },
                )
              }
            />
          ))
```

- [ ] **Step 5: Brancher les contrôles de la ligne**

Dans `frontend/src/components/reminders/AlarmsRow.tsx`, remplacer la signature :

```tsx
function AlarmsRow({ alarm }: { alarm: Reminder }) {
```

par :

```tsx
function AlarmsRow({
  alarm,
  busy,
  confirming,
  onPause,
  onAskDone,
  onCancelDone,
  onConfirmDone,
}: {
  alarm: Reminder;
  busy: boolean;
  confirming: boolean;
  onPause: (paused: boolean) => void;
  onAskDone: () => void;
  onCancelDone: () => void;
  onConfirmDone: () => void;
}) {
```

et remplacer la cellule `act` :

```tsx
      {/* `z-1` puts the pair above the title link's overlay, which is what lets the wrapper's tooltip
          appear at all. */}
      <div
        role="cell"
        className="flex justify-end gap-2 pr-4 @max-3xl:hidden"
      >
        <span
          title={ALARMS_TEXT.row.pending}
          className="relative z-1 flex gap-2"
        >
          <MiniButton disabled>{ALARMS_TEXT.row.snooze}</MiniButton>
          <MiniButton disabled>{ALARMS_TEXT.row.done}</MiniButton>
        </span>
      </div>
```

par :

```tsx
      {/* `z-1` puts the controls above the title link's overlay, which is what lets them be clicked
          at all — without it the anchor's `::after` swallows every press, and none of these handlers
          would need `stopPropagation` because none of them would ever run.

          ⚠️ **The confirm strip is wider than this column and leaves the flow to say so.** `act` is
          136px, measured for the `SNOOZE` / `DONE` pair; `done? · confirm · cancel` does not fit, so
          it is pinned to the row's right edge instead — the arrangement `IndexRow` uses, for exactly
          this reason. Its own width is measured, never assumed. */}
      <div
        role="cell"
        className="relative flex justify-end gap-2 pr-4 @max-3xl:hidden"
      >
        {confirming ? (
          <span className="absolute inset-y-0 right-4 z-1 flex items-center gap-2">
            <Overline className="text-gr-accent-2">{ALARMS_TEXT.row.askDone}</Overline>
            <MiniButton
              danger
              disabled={busy}
              onClick={onConfirmDone}
              className="hover:translate-y-0"
            >
              {ALARMS_TEXT.row.confirm}
            </MiniButton>
            <MiniButton
              onClick={onCancelDone}
              className="hover:translate-y-0"
            >
              {ALARMS_TEXT.row.cancel}
            </MiniButton>
          </span>
        ) : (
          <span className="relative z-1 flex gap-2">
            <MiniButton
              disabled={busy}
              onClick={() => onPause(!asleep)}
            >
              {asleep ? ALARMS_TEXT.row.resume : ALARMS_TEXT.row.snooze}
            </MiniButton>
            <MiniButton
              disabled={busy}
              onClick={onAskDone}
            >
              {ALARMS_TEXT.row.done}
            </MiniButton>
          </span>
        )}
      </div>
```

Ajouter l'import de `Overline` en tête du fichier :

```tsx
import { Overline } from "@components/ds/Overline";
```

- [ ] **Step 6: Mesurer la bande de confirmation**

⚠️ **Ne pas écrire de nombre avant cette étape.** Le dépôt n'embarque aucun outil de mesure ; la mesure se fait dans un vrai navigateur à 1440×900, avec la vraie IBM Plex Mono chargée — pas depuis la maquette, pas d'après une estimation de la largeur d'une chaîne.

Ouvrir `http://localhost:3100/bookmarks/reminders` dans une fenêtre de 1440×900, cliquer `done` sur la **deuxième** ligne (pour qu'il y en ait une au-dessus et une en dessous à comparer), puis évaluer dans la console — ou avec l'outil navigateur de la session :

```js
(() => {
  const strip = document.querySelector('[role="row"] [role="cell"] .text-gr-accent-2')?.parentElement;
  const cell = strip?.closest('[role="cell"]');
  const row = cell?.closest('[role="row"]');
  const quiet = [...document.querySelectorAll('[role="row"]')].find((r) => r !== row && r.querySelector('[role="cell"]'));
  const quietAct = quiet && [...quiet.querySelectorAll('[role="cell"]')].pop();
  return {
    strip: strip?.getBoundingClientRect().width,
    actColumn: cell?.getBoundingClientRect().width,
    stripRight: strip?.getBoundingClientRect().right,
    pairRight: quietAct?.querySelector("span")?.getBoundingClientRect().right,
  };
})();
```

Ce qu'il faut lire :
1. `strip` — la largeur réelle de `done? · confirm · cancel` ;
2. `actColumn` — la largeur de la colonne `act`, attendue à 136 ;
3. `stripRight` **égal** à `pairRight` — le bord droit de la bande tombe sur celui de la paire `snooze` / `done` d'une ligne au repos.

Attendu : `strip > actColumn`, ce qui est ce qui justifie de sortir la bande du flux ; et les deux bords droits égaux à moins d'un pixel de sous-pixel. Si la bande recouvre la colonne `added / armed`, **c'est acceptable** — la cellule est masquée derrière une bande opaque le temps d'une question, comme sur l'index. Si les deux bords ne coïncident pas, corriger l'ancrage (`right-4` est le `pr-4` de la cellule), **jamais avec une marge négative ni un décalage en dur**.

Reporter les trois nombres mesurés dans le commentaire de la cellule, à la place de la phrase qui annonce la mesure.

- [ ] **Step 7: Vérifier les trois actions dans le navigateur**

Sur `/bookmarks/reminders` :
1. cliquer `snooze` sur une ligne → la ligne devient `paused`, descend en bas de la liste, le bouton lit `resume`, et le graphe des 14 jours perd les barres de cette alarme ;
2. cliquer `resume` → elle remonte à sa place avec son `T-NNd` d'avant ;
3. cliquer `done` sur un signet jetable → la bande `done? · confirm · cancel` remplace la paire ; `cancel` la referme sans rien changer ; `confirm` fait disparaître la ligne, et le compteur `alarms NNN` du chrome baisse de un ;
4. ouvrir la fiche de ce signet → le champ `alarm` lit `none`.

- [ ] **Step 8: Vérifier qu'une seule ligne confirme à la fois**

Cliquer `done` sur une ligne, puis `done` sur une autre sans annuler la première.

Attendu : la première bande se referme, seule la seconde reste ouverte.

- [ ] **Step 9: Lint**

```bash
cd frontend && pnpm lint
```

- [ ] **Step 10: Point de QA**

Signaler : les trois actions de ligne marchent, la mesure de la bande, et ce qui a été piloté. Rien n'est commité.

---

### Task 6 : `snooze all`, le graphe et la barre de statut

**Files:**
- Modify: `frontend/src/text/alarms.ts`
- Modify: `frontend/src/text/shell.ts`
- Modify: `frontend/src/components/reminders/AlarmsCommandBar.tsx`
- Modify: `frontend/src/components/reminders/Alarms.tsx`
- Modify: `frontend/src/components/shared/shell/services/useShellCounts.ts`
- Modify: `frontend/src/components/shared/shell/StatusBar.tsx`

**Interfaces:**
- Consumes: `useAlarmsPause()` (tâche 5), `alarm_paused_at` (tâche 4).
- Produces: `AlarmsCommandBar` prend `running: number` et `total: number`. `useShellCounts` rend en plus `remindersPaused?: number`. `SHELL_TEXT.status` gagne `armedWithPaused`.

- [ ] **Step 1: Constater le défaut**

Endormir toutes les alarmes du compte, puis ouvrir `/bookmarks/reminders` :

```bash
curl -s -b "$JAR" -H "x-csrf-token: $CSRF" -H 'content-type: application/json' -X PATCH "$API/reminders" -d '{"paused":true}'
```

Attendu **avant** le correctif : `snooze all` est grisé ; le graphe des 14 jours est dessiné avec quatorze barres plates alors qu'aucune alarme ne sonne ; et la barre de statut annonce `N armed` alors que zéro l'est.

- [ ] **Step 2: Écrire les mots**

Dans `frontend/src/text/alarms.ts`, bloc `command`, ajouter sous `snoozeAll` :

```ts
    snoozeAll: "snooze all",
    /** The same control once every alarm is asleep (COS-330). One button and not two: `snooze all`
     *  on a list that is already silent has nothing to do, and a disabled control beside an enabled
     *  one is a way of hiding which one is live. */
    resumeAll: "resume all",
    /** The same control on a screen with no alarm at all. */
    noAlarms: "no alarm to snooze",
```

Dans `frontend/src/text/shell.ts`, bloc `status`, remplacer `armed` par :

```ts
    /** The reminders screen's right-hand slot: how many alarms will actually ring. */
    armed: (count: string) => `${count} armed`,
    /** The same slot once something is asleep (COS-330). ⚠️ **`armed` alone would be a false
     *  reading**: a paused alarm sits in the list, and the tab above counts it under `alarms NNN`
     *  because the list is the screen's inventory — but it is not armed, and this is the word that
     *  says so. The second half appears only when there is something to say. */
    armedWithPaused: (armed: string, paused: string) => `${armed} armed · ${paused} paused`,
```

- [ ] **Step 3: Brancher la barre de commande**

Dans `frontend/src/components/reminders/AlarmsCommandBar.tsx`, ajouter l'import :

```tsx
import { useAlarmsPause } from "@src/services/useAlarmPause";
```

remplacer la signature :

```tsx
function AlarmsCommandBar() {
  const [now, setNow] = useState<Date>();
```

par :

```tsx
function AlarmsCommandBar({ running, total }: { running: number; total: number }) {
  const [now, setNow] = useState<Date>();
  const pauseAll = useAlarmsPause();
  /* Which of the two words the button carries. `running === 0` on a non-empty list means everything
     is asleep, and the only thing left to offer is waking it. */
  const asleep = total > 0 && running === 0;
```

et remplacer le bloc du bouton :

```tsx
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
```

par :

```tsx
        {/* The title rides the wrapper: a disabled button receives no pointer events and would never
            show one of its own. It is disabled on an empty list only — there is no third state, and
            no confirmation either: unlike `done`, a second press undoes this one. */}
        <span title={total === 0 ? ALARMS_TEXT.command.noAlarms : undefined}>
          <Button
            variant="chrome"
            size="chrome"
            disabled={total === 0 || pauseAll.isPending}
            onClick={() => pauseAll.mutate({ paused: !asleep })}
          >
            {asleep ? ALARMS_TEXT.command.resumeAll : ALARMS_TEXT.command.snoozeAll}
          </Button>
        </span>
```

Enfin, remplacer le paragraphe du commentaire de bloc :

```tsx
 * ⚠️ **`snooze all` is drawn and disabled — COS-330**, with the row-level pair it belongs to. `arm
 * new` is not: arming an alarm means giving a record a reminder, and the insert screen is where that
 * field lives, so the primary action goes there and works. */
```

par :

```tsx
 * ⚠️ **`snooze all` works since COS-330, and it stops the clocks — it does not empty the screen.**
 * Every alarm keeps its row and loses its countdown, which is what makes the button reversible: once
 * they are all asleep it reads `resume all`, and pressing it slides each series forward by exactly
 * the sleep, so every countdown comes back on the number it froze on. `arm new` was never in that
 * list: arming an alarm means giving a record a reminder, and the insert screen is where that field
 * lives, so the primary action goes there and works. */
```

- [ ] **Step 4: Compter les alarmes qui tournent, sur l'écran**

Dans `frontend/src/components/reminders/Alarms.tsx`, remplacer le corps du composant :

```tsx
function Alarms() {
  const { alarms, isLoading, isError } = useAlarms();
```

par :

```tsx
function Alarms() {
  const { alarms, isLoading, isError } = useAlarms();
  /* What is actually going to ring (COS-330). Both consumers below need this number rather than the
     length of the list: a sleeping alarm is on the screen but is not counted anywhere as armed. */
  const running = alarms.filter((alarm) => alarm.alarm_paused_at === null).length;
```

remplacer `<AlarmsCommandBar />` par :

```tsx
        <AlarmsCommandBar
          running={running}
          total={alarms.length}
        />
```

et `<AlarmsLoad armed={alarms.length} />` par :

```tsx
      <AlarmsLoad armed={running} />
```

Ajouter au commentaire de bloc du composant :

```tsx
 * ⚠️ **The chart is told how many alarms *run*, not how many are listed** (COS-330). Its `armed` prop
 * exists to tell "nothing is armed at all" from "a fortnight with no firing in it", and a screen
 * where everything has been snoozed is the first: fourteen flat bars under a caption about a quiet
 * fortnight would be blaming the calendar for a decision the user made.
```

- [ ] **Step 5: Compter les endormies dans le chrome**

Dans `frontend/src/components/shared/shell/services/useShellCounts.ts`, remplacer la signature et le `return` :

```ts
const useShellCounts = (): { bookmarks?: number; reminders?: number } => {
```

par :

```ts
const useShellCounts = (): { bookmarks?: number; reminders?: number; remindersPaused?: number } => {
```

et :

```ts
  return { bookmarks: bookmarks.data, reminders: reminders.data?.length };
```

par :

```ts
  /* Two readings off one list (COS-330). The tab's `alarms NNN` is the length — the screen's whole
     inventory, sleeping rows included, because they are still alarms the account holds. The status
     bar needs the other half: `N armed` said of an alarm whose clock is stopped is false, so it is
     told how many are asleep and subtracts them itself. */
  return {
    bookmarks: bookmarks.data,
    reminders: reminders.data?.length,
    remindersPaused: reminders.data?.filter((reminder) => reminder.alarm_paused_at !== null).length,
  };
```

- [ ] **Step 6: Dire la vérité dans la barre de statut**

Dans `frontend/src/components/shared/shell/StatusBar.tsx`, remplacer :

```tsx
  const armed = screen === "reminders";
  const count = armed ? counts.reminders : counts.bookmarks;
  const format = armed ? SHELL_TEXT.status.armed : SHELL_TEXT.status.index;
```

par :

```tsx
  /* ⚠️ **`armed` used to name the screen and now names the number**, which is the change: the slot
     said `N armed` about the length of the alarms list, and since COS-330 a row can be in that list
     with its clock stopped. So the count is the list minus what is asleep, and the sleeping ones get
     a word of their own rather than being quietly counted as armed. */
  const onAlarms = screen === "reminders";
  const paused = counts.remindersPaused ?? 0;
  const count = onAlarms
    ? counts.reminders === undefined
      ? undefined
      : counts.reminders - paused
    : counts.bookmarks;
  const format = onAlarms
    ? (value: string) =>
        paused > 0 ? SHELL_TEXT.status.armedWithPaused(value, String(paused)) : SHELL_TEXT.status.armed(value)
    : SHELL_TEXT.status.index;
```

- [ ] **Step 7: Vérifier dans le navigateur**

Toutes les alarmes sont endormies depuis l'étape 1. Ouvrir `/bookmarks/reminders`.

Attendu :
1. la barre de commande lit **`resume all`** ;
2. le graphe des 14 jours **n'est pas rendu du tout** ;
3. la barre de statut lit `0 armed · N paused`, et l'onglet du chrome lit toujours `alarms NNN` avec le total ;
4. cliquer `resume all` → toutes les lignes retrouvent leur compte à rebours, le graphe revient, la barre lit `N armed` sans second segment, et le bouton lit de nouveau `snooze all` ;
5. cliquer `snooze all` → l'inverse, et un second clic ne change rien ;
6. endormir **une seule** ligne → la barre lit `N-1 armed · 1 paused`, et le bouton lit toujours `snooze all` (tout n'est pas endormi).

- [ ] **Step 8: Vérifier l'écran vide**

Sur un compte sans aucune alarme (ou après avoir désarmé les alarmes de test), attendu : la table lit `no alarm armed`, `snooze all` est grisé avec l'infobulle `no alarm to snooze`, le graphe est absent, et la barre de statut lit `0 armed`.

- [ ] **Step 9: Lint**

```bash
cd frontend && pnpm lint
```

- [ ] **Step 10: Point de QA**

Signaler : `snooze all` / `resume all`, le graphe qui se retire quand plus rien ne sonne, et la barre de statut qui distingue armé et endormi. Rien n'est commité.

---

### Task 7 : la fiche ramène à l'écran

**Files:**
- Modify: `frontend/src/components/shared/config/constants.ts`
- Modify: `frontend/src/text/record.ts`
- Modify: `frontend/src/components/bookmark/RecordCommandBar.tsx`
- Modify: `frontend/src/components/bookmark/BookmarkRecord.tsx`
- Modify: `frontend/src/components/reminders/AlarmsRow.tsx`
- Modify: `frontend/src/components/reminders/AlarmsTable.tsx`
- Modify: `frontend/src/components/reminders/Alarms.tsx`

**Interfaces:**
- Consumes: `record.alarm_frequency` de `BookmarkDetail` ; `alarms` de `useAlarms` (tâche 4).
- Produces: `alarmHref(id)` et `alarmRowId(id)` exportés depuis `constants.ts`, les deux seules façons d'écrire l'ancre. `AlarmsRow` prend en plus `flashing: boolean`.

- [ ] **Step 1: Constater le défaut**

Ouvrir la fiche d'un signet qui a une alarme. Attendu : la barre de commande porte `edit`, `delete`, `open url ↗` — le quatrième bouton de la maquette n'est pas là, et rien ne mène à l'écran alarmes.

- [ ] **Step 2: Écrire les deux constructeurs d'ancre**

Dans `frontend/src/components/shared/config/constants.ts`, ajouter sous `editHref` :

```ts
/** `/bookmarks/reminders#alarm-<id>` — the alarms screen, landing on this record's row (COS-330).
 *
 *  ⚠️ **A fragment rather than `?focus=`.** It never reaches the server, and `useSearchParams` would
 *  put the alarms screen behind a `Suspense` boundary it does not have — the arrangement the record
 *  route explains, reading its id from `params` so that nothing in its subtree opts out of
 *  prerendering.
 *
 *  ⚠️ **The fragment cannot scroll on its own.** The list arrives from react-query, so at first paint
 *  nothing carries the id and the browser finds nothing to aim at. `Alarms` waits for the data and
 *  scrolls itself; this pair exists so the address and the element cannot drift apart. */
export const alarmHref = (id: number | string): string => `${ROUTES.bookmarksReminders.path}#alarm-${id}`;

/** The `id` an alarms row carries — the other half of `alarmHref`. */
export const alarmRowId = (id: number | string): string => `alarm-${id}`;
```

- [ ] **Step 3: Écrire les mots de la fiche**

Dans `frontend/src/text/record.ts`, ajouter dans `actions` :

```ts
    /** The handoff's fourth button, and the one COS-330 finally gave something to do: it opens the
     *  alarms screen and lands on this record's row. */
    alarm: "alarm",
    /** Same slot on a record with no reminder, so the bar keeps its shape whichever record is open —
     *  the arrangement `open url ↗` uses on a record with no url. */
    noAlarm: "no alarm on this record",
```

et remplacer le paragraphe du commentaire de tête :

```ts
 * ⚠️ **No `alarm` button either**, though the handoff's command bar draws one. It is the one control
 * of the four with nothing to do: arming a reminder means writing `reminder` on the record, which is
 * the edit form's field, and the legacy screen this replaces had `back / edit / delete` and no alarm
 * control at all. The value is on the screen — `fields.alarm` — and `edit` is how it changes. */
```

par :

```ts
 * ✅ **The handoff's fourth button is here since COS-330, and it is not what it looked like.** It was
 * left out because arming a reminder is the edit form's field, so a button called `alarm` had nothing
 * to do; what it does now is the other direction — it opens the alarms screen and lands on this
 * record's row, which is where the reminder can be silenced or finished. Arming still happens in
 * `edit`, and the value is still read in `fields.alarm`. */
```

- [ ] **Step 4: Poser le bouton**

Dans `frontend/src/components/bookmark/RecordCommandBar.tsx`, remplacer l'import de constantes :

```tsx
import { editHref, ROUTES } from "@components/shared/config/constants";
```

par :

```tsx
import { alarmHref, editHref, ROUTES } from "@components/shared/config/constants";
```

ajouter `hasAlarm` à la signature :

```tsx
function RecordCommandBar({
  id,
  title,
  url,
  hasAlarm,
  busy,
  onRemove,
}: {
  id: string;
  title: string;
  url?: string;
  hasAlarm: boolean;
  busy: boolean;
  onRemove: () => void;
}) {
```

et insérer, entre le bouton `edit` et le bouton `delete` :

```tsx
        {/* The handoff's order — `edit`, `alarm`, then the primary. Disabled rather than absent on a
            record with no reminder, as `open url ↗` is on a record with no url: the bar keeps the
            same shape whichever record is open. */}
        {hasAlarm ? (
          <Button
            asChild
            variant="chrome"
            size="chrome"
          >
            <Link href={alarmHref(id)}>{RECORD_TEXT.actions.alarm}</Link>
          </Button>
        ) : (
          <Button
            variant="chrome"
            size="chrome"
            disabled
            title={RECORD_TEXT.actions.noAlarm}
          >
            {RECORD_TEXT.actions.alarm}
          </Button>
        )}
```

Enfin, remplacer la ligne du commentaire de bloc :

```tsx
 * ⚠️ **The handoff's fourth button, `alarm`, is not here** — see the note in `@text/record.ts`.
```

par :

```tsx
 * **`alarm` goes the other way round from what its name suggests** (COS-330): it does not arm one —
 * that is `edit`, and it always was — it opens the alarms screen on this record's row, which is where
 * a reminder is silenced or finished. See `alarmHref`.
```

- [ ] **Step 5: Passer l'information depuis la fiche**

Dans `frontend/src/components/bookmark/BookmarkRecord.tsx:55-61`, remplacer :

```tsx
      <RecordCommandBar
        id={id}
        title={record.title}
        url={record.original_url ?? undefined}
        busy={remove.isPending}
        onRemove={() => remove.mutate(undefined, { onSuccess: () => router.replace(ROUTES.bookmarks.path) })}
      />
```

par :

```tsx
      <RecordCommandBar
        id={id}
        title={record.title}
        url={record.original_url ?? undefined}
        /* `alarm_frequency` and not an alarm id: it is the field `getBookmarkController` returns, and
           the one `RecordFields` already reads to choose between `armed · every Nd` and `none`. Two
           places on one screen deciding "is this armed" differently is the thing to avoid. */
        hasAlarm={Boolean(record.alarm_frequency)}
        busy={remove.isPending}
        onRemove={() => remove.mutate(undefined, { onSuccess: () => router.replace(ROUTES.bookmarks.path) })}
      />
```

- [ ] **Step 6: Donner son ancre à la ligne**

Dans `frontend/src/components/reminders/AlarmsRow.tsx`, ajouter l'import :

```tsx
import { alarmRowId, ROUTES } from "@components/shared/config/constants";
```

ajouter `flashing: boolean` à la signature (à la suite de `confirming`), et remplacer l'ouverture du `div` de ligne :

```tsx
    <div
      role="row"
      className={cn(
        "relative grid h-11 items-center border-b border-gr-border text-2xs transition-colors duration-120 hover:bg-white/20",
        ALARM_COLUMNS,
        "@max-3xl:h-auto @max-3xl:px-3 @max-3xl:py-2",
      )}
    >
```

par :

```tsx
    /* The `id` is what the record's `alarm` button aims at (COS-330), built by the same helper that
       builds the address so the two cannot drift. The flash rides the row's existing
       `transition-colors`, which is why there is no animation here: turning the tint off is already
       a 120ms fade. */
    <div
      role="row"
      id={alarmRowId(alarm.id)}
      className={cn(
        "relative grid h-11 items-center border-b border-gr-border text-2xs transition-colors duration-120 hover:bg-white/20",
        ALARM_COLUMNS,
        "@max-3xl:h-auto @max-3xl:px-3 @max-3xl:py-2",
        flashing && "bg-gr-accent/12",
      )}
    >
```

- [ ] **Step 7: Faire descendre le repère**

Dans `frontend/src/components/reminders/AlarmsTable.tsx`, ajouter `flashing` aux props :

```tsx
function AlarmsTable({
  alarms,
  isLoading,
  isError,
  flashing,
}: {
  alarms: Reminder[];
  isLoading: boolean;
  isError: boolean;
  /** The `id` of the row the record screen sent us to, if any — see `Alarms`. */
  flashing?: string;
}) {
```

ajouter l'import :

```tsx
import { alarmRowId } from "@components/shared/config/constants";
```

et passer la prop dans le `map` :

```tsx
              flashing={flashing === alarmRowId(alarm.id)}
```

- [ ] **Step 8: Viser la ligne**

Dans `frontend/src/components/reminders/Alarms.tsx`, ajouter les imports :

```tsx
import { useEffect, useState } from "react";
```

ajouter, sous la constante `running` :

```tsx
  const [flashing, setFlashing] = useState<string>();

  /* Landing on a row (COS-330). The address carries `#alarm-<id>` and the browser cannot follow it:
     the list arrives from react-query, so at first paint no element has that id and the native
     fragment scroll finds nothing. This runs once the rows are in.

     The dependency is `alarms.length` rather than `alarms`: the array is a new reference on every
     refetch, and re-flashing the row each time an alarm is snoozed elsewhere on the screen would be
     a light going on for no reason. */
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash || alarms.length === 0) return;

    const row = document.getElementById(hash);
    if (!row) return;

    row.scrollIntoView({ block: "center" });
    setFlashing(hash);

    const settle = setTimeout(() => setFlashing(undefined), FLASH_MS);
    return () => clearTimeout(settle);
  }, [alarms.length]);
```

et, au-dessus du composant :

```tsx
/** How long the row we were sent to stays lit. Long enough to catch the eye on a list that scrolled
 *  under it, short enough to be gone before the row has been read. */
const FLASH_MS = 1200;
```

Enfin, passer la prop à la table :

```tsx
        <AlarmsTable
          alarms={alarms}
          isLoading={isLoading}
          isError={isError}
          flashing={flashing}
        />
```

- [ ] **Step 9: Vérifier le trajet**

1. Ouvrir la fiche d'un signet **avec** alarme → le bouton `alarm` est actif, entre `edit` et `delete`.
2. Cliquer dessus → l'écran alarmes s'ouvre, la liste défile jusqu'à la ligne de ce signet, qui est centrée et brièvement teintée, puis retrouve sa couleur.
3. Ouvrir la fiche d'un signet **sans** alarme → le bouton est grisé et son infobulle lit `no alarm on this record`.
4. Depuis l'écran alarmes, cliquer une ligne → la fiche s'ouvre ; en revenir par `alarm` → retour sur la ligne. Le trajet boucle.

Vérifier le cas qui compte : avec assez d'alarmes pour que la liste défile, viser une ligne du bas et confirmer qu'elle est **centrée** et non simplement à l'écran.

- [ ] **Step 10: Vérifier que le repère ne se rallume pas**

Après avoir atterri sur une ligne, cliquer `snooze` sur une autre ligne.

Attendu : la liste se rafraîchit et **aucune ligne ne se rallume**.

- [ ] **Step 11: Lint**

```bash
cd frontend && pnpm lint
```

- [ ] **Step 12: Vérifier la compilation**

```bash
cd frontend && pnpm build
```

Attendu : la compilation passe. C'est aussi le seul contrôle du projet sur la casse des chemins d'import côté front, et il n'a pas tourné depuis la tâche 4.

- [ ] **Step 13: Point de QA finale**

Signaler l'ensemble : la migration, les trois routes, la ligne endormie, les trois actions, la barre, le graphe, la barre de statut, et le trajet fiche ↔ alarme. Rappeler ce qui est **délibérément hors périmètre** : les hints `s snooze` / `d done` de la barre de statut ne sont pas rétablis, faute d'écouteur clavier (COS-312). Rien n'est commité — le commit, la PR et le passage du ticket en Done sont la décision du propriétaire.

---

## Ce que ce plan ne fait pas

- **Il ne rétablit pas `s snooze` / `d done`** dans `SHELL_STATUS.reminders`, contrairement à ce que le ticket demandait à l'origine. `@text/shell.ts` écrit la raison : un hint qui nomme une touche que rien n'écoute est le défaut qui les a fait retirer, et aucun écran ne lie de touche avant COS-312.
- **Il ne pagine pas l'écran alarmes.** La table est un seul défilement qui porte toute la liste ; viser la ligne est ce que « la page où se trouve ce signet » veut dire tant qu'il n'y a qu'une page.
- **Il n'installe pas de harnais de test.** Ce dépôt n'en a aucun, et en poser un est un ticket à part entière.
- **Il ne touche pas `editBookmarkController.applyAlarm`.** Réarmer une alarme depuis la modale d'édition remet `date_added` à aujourd'hui, ce qui remet aussi `paused_at` à `NULL` par la recréation de la ligne — le comportement voulu, obtenu sans changement.
