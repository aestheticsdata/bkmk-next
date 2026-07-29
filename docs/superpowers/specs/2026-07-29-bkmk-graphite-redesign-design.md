# bkmk — Refonte GRAPHITE, remise à niveau de la plateforme, auth sécurisée

**Date :** 2026-07-29 (révisée le soir même — v2)
**Statut :** ⚠️ BROUILLON — non validé. Reprendre à §8 (questions ouvertes) demain.
**Projet Linear :** BKMK (`e386be48-060a-4e96-82a0-3a2e8c7bcd30`, équipe Cosmokaat / `COS`)

---

## 0. Où on en est (reprise de session)

Session du 29/07 au soir. Ce qui a été fait :

1. ✅ Lecture du handoff **mis à jour** `design_handoff_graphite 2/README.md`.
2. ✅ Inventaire du codebase bkmk (frontend Next 13 pages router, backend Express JS).
3. ✅ Analyse approfondie de `~/dev/pfa/front` — versions, organisation, conventions, configs.
4. ✅ Spec + 26 tickets Linear.

**Rien n'a été codé.** Le seul ajout versionné est ce document.

### ⚠️ Deux dossiers de handoff coexistent

`design_handoff_graphite/` (obsolète) et **`design_handoff_graphite 2/` (autorité)**. Le second
ajoute la modale d'édition et les flux de suppression. **Supprimer l'ancien** pour éviter toute
ambiguïté — tous les numéros de ligne de ce document et des tickets pointent vers le nouveau.

Le nom contient un espace : penser aux guillemets en shell.

---

## 1. Ce qui a changé dans le handoff (v2)

Trois ajouts, rien d'autre (`diff` vérifié : 2 hunks README, 3 hunks themes.css) :

### §9 — Édition d'un record : **une modale, pas un écran**

Le handoff tranche la question qui était ouverte hier. La fiche record reste l'écran de
*consultation* (log, related, preview) ; l'édition passe par une **modale posée dessus**, ce qui
évite un second écran quasi identique et permet d'éditer **depuis la liste** sans quitter la page.

`min(680px, 100% - 20px)`, `max-height: calc(100% - 24px)`, scrollable. En-tête : `EDIT` +
`record <id>` + `added <date> · unsaved changes` + `×`. Champs préremplis, mêmes contrôles que
l'écran insert : `url`, `title`, `note` (3 lignes), `tags` (chips + `+ add` pointillée),
`priority`/`stars` sur deux colonnes, `alarm`/`screenshot` (`captured` + `re-capture`) sur deux
colonnes. Pied : `save ⌘↵` (primaire), `cancel`, et à droite `delete record` (outline oxyde).

**Conséquence :** `pages/bookmarks/edit/[id]/index.tsx` disparaît. Ce n'est plus une route.

### §10 — Suppression : deux chemins

- **Depuis la liste** — au survol d'une ligne, trois actions à droite de la date : `↗` (ouvrir),
  `✎` (éditer), `⌫` (supprimer, oxyde au survol). Le clic sur `⌫` transforme la fin de ligne en
  **confirmation en place** : `DELETE?` + mini-boutons `CONFIRM` (plein oxyde) / `CANCEL`, hauteur
  20px, 9.5px uppercase. Aucune modale : la ligne se supprime sur `CONFIRM`.
- **Depuis la fiche ou la modale d'édition** — bouton `delete` (outline oxyde) → **modale de
  confirmation** `min(440px, 100% - 20px)` : en-tête `DELETE / record <id>`, titre + url, ligne
  d'avertissement (« note, tags, screenshot and alarm go with it… this cannot be undone »), pied
  `delete record` (plein oxyde) / `cancel` / `esc cancels`.

### §State — trois entrées de plus

`editing` (record en édition ou `null`), `deleting` (record en attente de confirmation ou `null`),
et `confirmId` **local à la liste** (id de la ligne en confirmation en place). Noter la règle
d'exclusion mutuelle du prototype : `openEdit` ferme les filtres, `askDelete` ferme l'édition.

### Styles associés (`themes.css`, lignes 369-379 + responsive 432-446)

`.gr-acts` (conteneur, `opacity:0` → `1` au survol de `.gr-tr`) · `.gr-act` (bouton-glyphe 22px,
rayon 6 ; **26px et toujours visible en mobile**) · `.gr-act.danger:hover` → `--accent-2` ·
`.gr-mini` (20px, 9.5px uppercase) et `.gr-mini.danger` · `.gr-btn.danger` (outline oxyde) et
`.gr-btn.danger.solid` (plein `linear-gradient(180deg,#8d4018,#763512)`, bordure `#5f2a0e`, texte
`#f4ece6`).

---

## 2. Inventaire : écrans du handoff vs. existant

`design_handoff_graphite 2/screens-graphite.jsx` — **les numéros de ligne ont tous bougé en v2** :

| # | Fonction handoff | Ligne | Écran existant bkmk | État |
|---|---|---|---|---|
| 1 | `Login_Graphite` | 385 | `pages/login/index.tsx` | refonte |
| 2 | `Signup_Graphite` | 584 | `pages/signup/index.tsx` | refonte + jauge de force, case import |
| 3 | `List_Graphite` | 82 | `pages/bookmarks/index.tsx` | refonte + **actions au survol, confirm en place** |
| 4 | `Detail_Graphite` | 192 | `pages/bookmarks/[id]/index.tsx` | refonte ; `log`, `related`, `hash` nouveaux |
| 5 | `Create_Graphite` | 257 | `pages/bookmarks/create/index.tsx` | refonte + `record preview`, doublons |
| 6 | `Upload_Graphite` | 506 | `pages/bookmarks/upload/index.tsx` | refonte + staging |
| 7 | `Reminders_Graphite` | 327 | `pages/bookmarks/reminders/index.tsx` | refonte + `next 14 days` |
| 8 | `About_Graphite` | 638 | `pages/about/index.tsx` | refonte + `system`, `changelog` |
| 9 | **`EditModal_Graphite`** | **693** | `pages/bookmarks/edit/[id]/` | **route supprimée → modale** |
| 10 | **`ConfirmDelete_Graphite`** | **771** | — | **entièrement nouveau** |
| 11 | `FilterModal_Graphite` | 429 | `toolsBar/filters/Filters.tsx` | inline → modale |

`themes.css` : bloc `.theme-graphite` toujours à partir de la **ligne 292**.

**Autres écrans existants :** `pages/logout/` → devient `POST /users/logout` + redirection (le
handoff met `sign out` dans About). `pages/index.tsx` → redirection racine, conservée.

---

## 3. Remise à niveau de la plateforme

C'est le **plus gros chantier**, et il passe avant tout le reste : refaire l'UI sur Next 13 +
Tailwind 3 pour migrer ensuite serait du travail jeté.

### Versions cibles — celles de pfa, vérifiées dans `~/dev/pfa/front/package.json`

| | bkmk aujourd'hui | pfa (cible) |
|---|---|---|
| next | 13.4.13 | **16.2.12** |
| react / react-dom | 18.2.0 | **19.2.3** |
| tailwindcss | ^3.2.7 | **^4.3.2** + `@tailwindcss/postcss` |
| typescript | 5.0.2 | 5.9.3 |
| @tanstack/react-query | ^4.29.5 | ^5.101.3 |
| zustand | ^4.3.7 | ^5.0.11 |
| zod | — | **^4.3.6** |
| lint/format | eslint 8 + eslint-config-next | **@biomejs/biome 2.5.3** |
| compilateur React | — | **`babel-plugin-react-compiler` ^1.0.0** |
| tests | — | vitest ^4.1.10 + @playwright/test ^1.61.1 |

**Le compilateur React** s'active par `reactCompiler: true` dans `next.config.js` (Next 16 le lit
nativement) **et** la présence de `babel-plugin-react-compiler` en devDependency. Les deux sont
nécessaires.

### Ruptures attendues, Next 13 → 16

- **`pages/` → `app/`.** pfa est intégralement en App Router avec les groupes de routes
  `(public)` / `(private)`. Adopter son organisation implique cette migration — c'est le point le
  plus risqué du lot (voir §8, question 1).
- `next/font` remplace l'`@import` Google Fonts (IBM Plex Mono).
- `next lint` est retiré → `biome check ./src`.
- Turbopack par défaut ; pfa fixe `turbopack.root: __dirname` pour éviter l'avertissement multi-lockfile.
- React 19 : `useFormState` → `useActionState`, refs en prop, `propTypes`/`defaultProps` retirés
  des composants fonction.
- `next export` disparaît (le script `deploy-kimsufi` de bkmk l'utilise encore) — pfa fait
  `next build` seul.
- Suppression de `formik` (bkmk a `formik` **et** `react-hook-form` — pfa n'a que
  `react-hook-form` + `@hookform/resolvers` pour brancher zod).

### Tailwind 3 → 4, CSS-first

**Plus de `tailwind.config.js`** : le thème vit en CSS via `@theme`. `postcss.config.js` ne charge
plus que `@tailwindcss/postcss`. Structure d'entrée, copiée de `pfa/front/styles/globals.css` :

```css
@import url('…IBM+Plex+Mono…') layer(base);   /* ou next/font */
@import 'tailwindcss';
@import 'tw-animate-css';

/* Design tokens — by type */
@import './tokens/breakpoints.css';
@import './tokens/colors.css';
@import './tokens/radius.css';
@import './tokens/typography.css';
@import './tokens/elevation.css';

@import './base.css';
@import './animations.css';

@import './components/chrome.css';
```

`globals.css` **n'a aucune règle propre** — uniquement les imports ordonnés. C'est la règle pfa.

**Différence assumée avec pfa :** pfa déclare `@custom-variant dark` et est dark-only. GRAPHITE est
un thème unique clair-gris : **pas de variante `dark:`, pas de `next-themes`.**

### Biome — ESLint et Prettier sont retirés partout

Décision explicite : **on vire eslint et prettier.** Cela vaut aussi pour le back — noter que
`pfa/nest-api` est resté en `eslint.config.mjs` + prettier ; on ne reprend donc pas sa config de
lint, on lui préfère Biome, en gardant ses réglages de formatage (double quotes, `printWidth: 120`)
pour que les deux projets restent cohérents à l'œil.

- **Racine** : copie conforme de `pfa/biome.json` — `root: true`, `vcs.useIgnoreFile`, rien d'autre.
- **`frontend/`** : copie conforme de `pfa/front/biome.json` — `root: false`, formatter 2 espaces /
  `lineWidth: 120`, double quotes, `attributePosition: multiline`, `css.parser.tailwindDirectives`,
  `useExhaustiveDependencies: off`, `useImportType` en `separatedType`, et l'assist
  `organizeImports` avec les groupes `[{type:false}, :BLANK_LINE:, {type:true}]` — c'est ce qui
  produit le bloc `import type { … }` séparé en fin d'imports, visible partout dans pfa.
- **`backend/`** : même fichier que le front, moins le bloc `css` (inutile) — le back est du JS
  simple, Biome le gère nativement.
- À désinstaller : `eslint`, `eslint-config-next`. Scripts : `"lint": "biome check ./src"`,
  `"lint:fix": "biome check --write ./src"`.

### shadcn/ui

`components.json` calqué sur pfa : style **new-york**, `rsc: true`, `tsx: true`,
`baseColor: neutral`, `cssVariables: true`, `iconLibrary: lucide`, alias `@components`,
`@components/ui`, `@lib/utils`, `@components/hooks`.

Chaîne : `class-variance-authority` + `clsx` + `tailwind-merge` (le `cn()` de `@lib/utils`) +
`lucide-react` + `tw-animate-css`. Radix à la demande.

Composants attendus pour bkmk : `dialog` (modales filtres/édition), `alert-dialog` (confirmation de
suppression), `checkbox`, `input`, `label`, `select`, `tabs`, `popover`, `progress`, `separator`,
`tooltip`, `scroll-area`, `sonner`.

**Layering pfa, à respecter :** `ui/*` = shadcn restylé sur nos tokens, enveloppant Radix. À
l'intérieur d'un fichier `ui/*`, l'import namespace Radix (`import * as DialogPrimitive`) est
standard — le garder. Au niveau consommateur, les imports restent **plats**
(`import { DialogContent }`), pour que re-lancer `shadcn add` régénère sans casse.

---

## 4. Organisation et conventions — le modèle pfa

Relevé dans `~/dev/pfa/front`. C'est la cible pour bkmk, à l'identique.

```
frontend/
  biome.json            root:false
  components.json       shadcn
  next.config.js        reactCompiler, CSP, turbopack.root
  postcss.config.js     @tailwindcss/postcss seul
  styles/               globals.css + tokens/ + base.css + animations.css + components/
  src/
    app/                App Router
      layout.tsx  providers.tsx  error.tsx
      (public)/         login, signup, about
      (private)/        layout.tsx + page.tsx par module
    auth/               context/  server/  helpers/  interfaces/  use*Service.ts
    components/
      ui/               shadcn — exports plats
      shared/           chrome transverse (navBar, config/constants, sessionWatcher…)
      common/           primitives génériques
      <module>/         view/  services/  helpers/  interfaces/  config/  __tests__/
    schemas/            zod — la frontière d'API
    lib/                utils.ts, query/keys.ts, dataviz/
    helpers/            useRequestHelper.ts, …
    text/               fr/<module>.ts — la copie, hors composants
    i18n/
```

**Conventions relevées :**

- **Alias de chemins uniquement**, jamais `./` ni `../`, même à l'intérieur d'un module. bkmk a
  déjà `@pages/* @src/* @components/* @auth/* @helpers/*` — ajouter `@styles/* @app/* @lib/*
  @text/*` (bkmk n'a pas d'i18n : l'UI GRAPHITE est en anglais, `@i18n/*` est sans objet).
- Composants `PascalCase.tsx`, hooks et helpers `camelCase.ts`, un composant par fichier.
- **Les hooks react-query vivent dans `<module>/services/`** et s'appellent `use<Chose>.ts`. Un
  hook = les queries **et** les mutations du domaine, avec sa fonction `invalidation()` locale.
- **Tous les cache keys passent par `@lib/query/keys.ts`** (`QUERY_KEYS`, objet `as const`). Jamais
  de chaîne magique : c'est ce qui rend l'invalidation croisée fiable.
- Types dans `<module>/interfaces/`, constantes dans `<module>/config/constants.ts`.
- Les imports de type sont **séparés en fin de bloc** (`import type { … }`) — produit
  automatiquement par l'assist Biome.
- La copie textuelle vit dans `src/text/`, pas en dur dans les composants.

---

## 5. zod — la frontière d'API

pfa met zod **exactement à la frontière réseau** : chaque service parse la réponse avant de la
rendre à l'app, et parse le payload avant de l'envoyer.

```ts
const getCategoriesService = async () => {
  const response = await privateRequest(`/categories?userID=${userID}`);
  return CategoryListSchema.parse(response.data);   // ← la frontière
};
```

**Règles reprises (commentaires de `pfa/front/src/schemas/auth.ts`) :**

- Un `z.object` simple, **jamais `.strict()`** : zod retire les clés inconnues par défaut, donc un
  champ ajouté côté serveur reste rétro-compatible. Un schéma strict transformerait tout ajout en
  échec dur.
- Les types viennent des schémas : `export type X = z.infer<typeof XSchema>`. On ne redéclare pas
  d'interface à côté.
- Primitives partagées dans `schemas/primitives.ts` (pfa y met `numberLikeSchema` pour absorber les
  nombres renvoyés en chaîne par MySQL — **bkmk est aussi sur MySQL, le besoin est identique**).
- Limites de champs dans `schemas/fieldLimits.ts`, partagées avec la validation serveur.

Schémas bkmk à créer : `auth.ts` (`AuthUserSchema`, `AuthResponseSchema` avec `csrfToken`),
`bookmarks.ts` (record, liste paginée, payloads create/update), `categories.ts`, `reminders.ts`,
`filters.ts` (l'objet de filtres, réutilisé par la modale et l'url), `import.ts` (entrées
analysées + résumé), `primitives.ts`, `fieldLimits.ts`.

Côté Express, les mêmes schémas servent à valider les entrées — c'est le sens de « qui serviront
aussi de validation de l'api ».

---

## 6. Auth sécurisée — le modèle pfa porté sur Express

Inchangé depuis la v1 de cette spec. Le backend Nest reste explicitement remis à plus tard.

**Backend** : `express-session` + `connect-redis`, store préfixé `bkmk:`, TTL 10 min,
`rolling: true` ; cookie `bkmk.sid` `httpOnly` / `sameSite: lax` / `secure` en prod / `proxy: true`
+ `trust proxy` ; CSRF double-submit porté de `pfa/nest-api/src/users/csrf-token.util.ts`
(`randomBytes(32)`, `timingSafeEqual`, en-têtes `x-csrf-token` / `x-xsrf-token`, méthodes sûres
exemptées, rotation à la connexion) ; `clearSessionsForUser` → **une session active par
utilisateur** ; routes `GET /users/me`, `GET /users/csrf`, `POST /users`, `POST /users/add`,
`POST /users/logout`.

**Frontend** : port de `pfa/front/src/helpers/useRequestHelper.ts` — `request` (public) et
`privateRequest` (ajoute `x-csrf-token` sur les verbes non sûrs, **rejoue une fois** après
`GET /users/csrf` sur 403, et sur 401 redirige vers `/login` en laissant la promesse pendante pour
que le 401 n'atteigne jamais l'error boundary). `AuthContext` hydraté par `GET /users/me`. **Le
token CSRF vit en mémoire, jamais en storage.** Suppression de `authStore.ts` (zustand `persist`,
clé `bkmk-token`).

**Ordre imposé :** l'auth passe avant les écrans login/signup.

**Au passage** : requêtes SQL paramétrées — `signInController.js` concatène aujourd'hui l'email de
`req.body` dans le SQL, sur une route non authentifiée.

---

## 7. Ce que le handoff implique côté données

- `hash`, `log` (événements horodatés), `related · same tags` — absents de `backend/src/db/bkmk.sql`.
- Pagination **serveur** 22 lignes/page (`?page=`) ; aujourd'hui cliente.
- Objet de filtres : `title`, `categories[]`, `stars`, `priority[]`, `reminder`, `contains{shot,notes,url}`.
- File d'import : fichier + entrées analysées + doublons **avant** commit.
- Détection de doublons à la création.
- Agrégats : `next 14 days · load`, `storage` (`shots 84/312`, `db 1.4 mb`), compteurs de catégories.
- **Nouveau v2 :** `DELETE /bookmarks/:id` doit être exercé depuis trois points d'entrée (confirm en
  place, fiche, modale d'édition) et invalider les caches react-query concernés en une seule
  fonction `invalidation()`, façon pfa.

---

## 8. Questions ouvertes — à trancher demain avant de coder

Trois des six questions d'hier sont **résolues** : l'édition est une modale (handoff §9), shadcn
est adopté, Tailwind passe en v4.

1. **App Router.** Adopter l'organisation pfa (`src/app/(public)|(private)`) implique de migrer
   `pages/` → `app/`. C'est le plus gros risque du lot plateforme. Alternative : Next 16 en gardant
   `pages/`, et on s'écarte de pfa sur ce point précis. **Recommandation : migrer** — l'écart
   d'organisation serait permanent, et la refonte réécrit de toute façon chaque écran.
2. **Métadonnées décoratives** — `uptime 04:12`, `sync 12s`, `IDX/2.4.1`, `build 2.4.1 · tls on` :
   vraies valeurs (endpoints à créer) ou chrome statique ?
3. **Champs manquants** (`hash`, `log`, `related`) — migration MySQL maintenant, ou écrans livrés
   avec ces blocs masqués et remplis au lot DATA ?
4. **Ancien dossier de handoff** — je supprime `design_handoff_graphite/` (obsolète) ?
5. **Périmètre visuel** — la refonte remplace intégralement l'UI ; pas de mode « ancien thème ».
   Confirmé ?

---

## 9. Découpage en tickets Linear

**26 tickets dans le projet BKMK.** Ordre d'exécution :

**Lot -1 — plateforme (nouveau, passe avant tout)**
| Ticket | Titre |
|---|---|
| COS-314 | PLAT 01 — Next 13 → 16, React 19.2, compilateur React |
| COS-315 | PLAT 02 — Tailwind 3 → 4 (CSS-first, plus de `tailwind.config.js`) |
| COS-316 | PLAT 03 — Biome partout, retrait d'ESLint et Prettier |
| COS-317 | PLAT 04 — shadcn/ui + chaîne `cn()` |
| COS-318 | PLAT 05 — zod : schémas front + validation API |

**Lot 0 — socle**
| Ticket | Titre |
|---|---|
| COS-290 | DS 01 — Tokens de design system GRAPHITE |
| COS-291 | DS 02 — Primitives de composants |
| COS-292 | DS 03 — Shell applicatif |

**Lot 1 — auth** : COS-293 (session Redis) · COS-294 (CSRF) · COS-295 (SQL paramétré) ·
COS-296 (AuthContext + `useRequestHelper`)

**Lot 2 — écrans** : COS-297 (login) · COS-298 (signup) · COS-299 (index) · COS-300 (filtres) ·
COS-301 (record) · COS-302 (insert) · COS-303 (import) · COS-304 (alarms) · COS-305 (about) ·
**COS-319 (modale d'édition)** · **COS-320 (suppression, 2 flux)**

**Lot 3 — données** : COS-306 (pagination + filtres) · COS-307 (staging d'import) ·
COS-308 (doublons) · COS-309 (hash/log/related) · COS-310 (agrégats)

**Lot 4 — finition** : COS-311 (responsive `@container`) · COS-312 (raccourcis clavier) ·
COS-313 (doc design system)

---

## 10. Fichiers de référence

| Quoi | Où |
|---|---|
| Spec design (autorité) | `design_handoff_graphite 2/README.md` |
| Structure des écrans (autorité) | `design_handoff_graphite 2/screens-graphite.jsx` |
| CSS GRAPHITE | `design_handoff_graphite 2/themes.css`, `.theme-graphite` **ligne 292**, actions/danger **369-379** et **432-446** |
| Maquettes | ouvrir `design_handoff_graphite 2/bkmk redesign.html` |
| State du prototype | `design_handoff_graphite 2/bkmk-context.jsx` |
| Versions & deps | `~/dev/pfa/front/package.json` |
| Organisation & conventions | `~/dev/pfa/front/src/`, `~/dev/pfa/front/docs/design-system.md`, `~/dev/pfa/front/.design-sync/conventions.md` |
| Configs | `~/dev/pfa/biome.json`, `~/dev/pfa/front/biome.json`, `next.config.js`, `postcss.config.js`, `tsconfig.json`, `components.json` |
| Modèle zod | `~/dev/pfa/front/src/schemas/` |
| Modèle auth | `~/dev/pfa/nest-api/src/main.ts`, `users/csrf-token.util.ts`, `users/guards/csrf.guard.ts`, `users/users.controller.ts`, `redis/redis.service.ts` ; côté client `~/dev/pfa/front/src/helpers/useRequestHelper.ts` |

**Hors périmètre :** `*_Phosphor`, `*_Paperwhite`, `*_Neon`, `*_Dusk`, les sélecteurs de thème
correspondants, et l'enveloppe de présentation (`app.jsx`, `design-canvas.jsx`,
`bkmk redesign.html`).
