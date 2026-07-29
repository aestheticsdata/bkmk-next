# bkmk — Refonte GRAPHITE + auth sécurisée

**Date :** 2026-07-29
**Statut :** ⚠️ BROUILLON — non validé par l'utilisateur. Reprendre à l'étape « Questions ouvertes » demain.
**Projet Linear :** BKMK (`e386be48-060a-4e96-82a0-3a2e8c7bcd30`, équipe Cosmokaat / `COS`)

---

## 0. Où on en est (reprise de session)

Session du 29/07 au soir, ~10 min. Ce qui a été fait :

1. ✅ Lecture intégrale de `design_handoff_graphite/README.md` (spec design complète et définitive).
2. ✅ Inventaire du codebase bkmk (frontend Next 13 pages router, backend Express).
3. ✅ Étude du projet de référence `~/dev/pfa` (design system + auth session/CSRF/Redis).
4. ✅ Rédaction de ce document.
5. ✅ Création des tickets Linear dans le projet BKMK.

**Rien n'a été codé.** Aucun fichier applicatif modifié. Le seul ajout au repo est ce document
(+ `design_handoff_graphite/` déjà présent, non versionné).

**Demain, commencer par :** lire §7 (questions ouvertes), trancher, puis attaquer COS-xxx dans
l'ordre indiqué en §6.

---

## 1. Inventaire : écrans du handoff vs. existant

Les 9 écrans GRAPHITE vivent dans `design_handoff_graphite/screens-graphite.jsx` :

| # | Fonction handoff | Ligne | Écran existant bkmk | État |
|---|---|---|---|---|
| 1 | `Login_Graphite` | 369 | `pages/login/index.tsx` + `src/components/shared/sharedLoginForm/` | existe, refonte totale |
| 2 | `Signup_Graphite` | 568 | `pages/signup/index.tsx` (même form partagé) | existe, refonte + **jauge de force** et **case import Session Buddy** à créer |
| 3 | `List_Graphite` | 82 | `pages/bookmarks/index.tsx` + `src/components/bookmarks/Bookmarks.tsx` | existe, refonte totale (rail catégories + table dense + pager) |
| 4 | `Detail_Graphite` | 177 | `pages/bookmarks/[id]/index.tsx` + `src/components/bookmark/BookmarkDetail.tsx` | existe, refonte ; **`log`, `related · same tags`, `hash` sont nouveaux** |
| 5 | `Create_Graphite` | 241 | `pages/bookmarks/create/index.tsx` + `create/CreateBookmark.tsx` | existe, refonte ; **`record preview` et détection de doublons nouveaux** |
| 6 | `Upload_Graphite` | 490 | `pages/bookmarks/upload/index.tsx` + `upload/UploadBookmarks.tsx` | existe, refonte ; **staging/parse avant envoi, options `on import`, `last import` nouveaux** |
| 7 | `Reminders_Graphite` | 311 | `pages/bookmarks/reminders/index.tsx` + `reminders/Reminders.tsx` | existe, refonte ; **carte `next 14 days · load` nouvelle** |
| 8 | `About_Graphite` | 622 | `pages/about/index.tsx` | existe, refonte ; **`system`, `changelog`, `credits` nouveaux** |
| 9 | `FilterModal_Graphite` | 413 | `src/components/shared/toolsBar/filters/Filters.tsx` | existe (filtres inline), devient **modale** |

**Écrans existants sans équivalent dans le handoff** — à décider (voir §7) :

- `pages/bookmarks/edit/[id]/index.tsx` — édition. Le handoff a un bouton `edit` sur le détail mais
  ne dessine pas l'écran. Proposition : réutiliser le gabarit `Create_Graphite` en mode « edit ».
- `pages/logout/index.tsx` — page de déconnexion. Devient un appel `POST /users/logout` + redirection ;
  plus d'écran dédié (le handoff met `sign out` dans About).
- `pages/index.tsx` — redirection racine, à conserver tel quel.

**Chrome / shell commun** (nouveau, transverse) : barre haute `BKMK IDX/2.4.1` + onglets + LED,
barre de statut basse, barre d'onglets mobile. Remplace
`src/components/shared/navBar/NavBar.tsx` et `src/components/shared/Layout.tsx`.

---

## 2. Le codebase actuel

### Frontend — `frontend/`

- **Next.js 13.4.13, pages router**, TypeScript, React 18.
- **Tailwind 3** avec `tailwind.config.js` JS classique : ~45 couleurs nommées en `rgb()` littéral
  (`grey1`, `blueNavy`, `addSpendingHover`…), héritées de pfa **avant** sa refonte. Aucun token
  sémantique.
- État : **zustand** (`authStore`, `userStore`, `globalStore`, `pageStore`), données serveur :
  **@tanstack/react-query v4**, HTTP : **axios** via `src/helpers/useRequestHelper.js`.
- Formulaires : `react-hook-form` **et** `formik` (les deux installés — dette).
- Icônes : FontAwesome. Alertes : SweetAlert2.
- Alias de chemins déjà en place : `@pages/*`, `@src/*`, `@components/*`, `@auth/*`, `@helpers/*`.
- Polices : Poppins / Smooch Sans / Ubuntu via Google Fonts. **GRAPHITE impose IBM Plex Mono, unique.**

### Backend — `backend/` (Express, JS)

- Express 4 + helmet + cors, MySQL brut (`mysql2`, requêtes SQL **concaténées en clair** —
  injection SQL dans `signInController.js`), `bcryptjs`, `jsonwebtoken`.
- Routes : `users`, `bookmarks`, `categories`, `reminders`. Screenshots via `jimp` + backup `ssh2`, cron.
- **Auth actuelle : JWT en header `Authorization: Bearer`, token persisté côté client dans
  `localStorage` (`zustand/persist`, clé `bkmk-token`).** C'est exactement ce qu'on remplace.

### Référence — `~/dev/pfa`

- `pfa/front` : Next + **Tailwind v4 CSS-first** (`@theme` en CSS, pas de `tailwind.config.js`),
  shadcn/ui (style new-york, lucide), tokens en oklch dans `styles/tokens/{colors,radius,typography,elevation}.css`,
  doc faisant autorité dans `front/docs/design-system.md`, conventions Claude Design dans `front/.design-sync/`.
- `pfa/nest-api` : **le modèle d'auth à copier** — `express-session` + `connect-redis`
  (`main.ts`), cookie `httpOnly` / `sameSite: lax` / `secure` en prod / `rolling` / TTL 10 min,
  CSRF double-submit à comparaison temps-constant (`users/csrf-token.util.ts` + `users/guards/csrf.guard.ts`),
  rotation du token CSRF à la connexion, `redis.service.ts` avec `clearSessionsForUser` (session unique par
  utilisateur), routes `GET /users/me`, `GET /users/csrf`, `POST /users`, `POST /users/add`, `POST /users/logout`.

---

## 3. Approche retenue — design system

**Recommandation : refaire le socle CSS de bkmk sur le modèle pfa, mais en gardant Tailwind 3.**

Trois options ont été pesées :

| Option | Pour | Contre |
|---|---|---|
| **A. Tokens CSS custom properties + Tailwind 3 lisant les tokens** (recommandée) | Pas de migration Tailwind risquée maintenant ; le fichier de tokens est déjà l'unité de vérité ; la migration v4 devient un simple changement de plomberie plus tard | `tailwind.config.js` reste, duplication légère nom-de-token → nom-d'utilitaire |
| B. Migrer d'abord Tailwind 4 CSS-first (comme pfa) | Aligne bkmk sur pfa immédiatement | Migration Next 13 + Tailwind 4 + PostCSS = chantier à part, bloque la refonte UI |
| C. CSS modules / vanilla, en portant `themes.css` | Fidélité maximale au handoff | S'écarte du reste de l'écosystème, on perd Tailwind |

**Décision A.** Structure cible, calquée sur pfa :

```
frontend/styles/
  globals.css              entrée : imports ordonnés + polices, aucune règle propre
  tokens/
    colors.css             les 17 couleurs GRAPHITE (§Design tokens du README)
    typography.css         échelle 9.5 / 10.5 / 11 / 11.5 / 12 / 12.5 / 21 / 24 / 26, tracking, .num
    radius.css             6 / 7 / 8 / 9 / 10 / 12 / 14 / 999
    elevation.css          --e1, --e2, ombre modale, ombre bouton primaire, --hair
  base.css                 resets (border-color, body, autofill, ::selection, ::placeholder)
  animations.css           bkmk-pop, curseur bloc, apparition d'écran
```

**Règles reprises de pfa (non négociables) :**

- Un token, jamais une valeur brute. Pas de `text-[12.5px]`, pas de `bg-[#a3a4a0]`, pas de palette
  Tailwind stock (`gray-400`).
- Toute surface claire porte `inset 0 1px 0 var(--hair)` — c'est **la signature du système**.
- `font-variant-numeric: tabular-nums` (classe `.num`) sur toute colonne chiffrée.
- Pas de variantes `dark:` — GRAPHITE est un thème unique, clair-gris.
- Alias de chemins uniquement, jamais `./` ni `../`.
- **La densité fait partie du design** : ligne de table 30px, chrome 38px. Ne pas « aérer ».

**Composants primitifs à extraire** (`src/components/ds/`), dérivés des classes `gr-*` de
`themes.css` : `Chrome`, `StatusBar`, `TabBar`, `Card`, `CommandBar`, `Field`, `Button`,
`Segment`, `Chip`, `Overline` (`.gr-lab`), `Stars`, `PriorityBars`, `Meter`, `Led`, `KeyValueTable`,
`DropZone`, `ShotSlot`, `Modal`, `BlinkCursor`.

**Responsive : `@container (max-width: 720px)`**, pas de media query. La racine d'écran porte
`container-type: inline-size`. Tailwind 3 gère mal les container queries → le bloc responsive
GRAPHITE est porté **en CSS brut** dans `styles/components/`, comme `chrome.css` chez pfa.
Le hook existant `useIsWindowResponsive.ts` devient inutile pour la mise en page.

---

## 4. Approche retenue — auth sécurisée

Port de l'auth pfa **sur l'Express actuel** (Nest est explicitement remis à plus tard) :

**Backend (`backend/`)**
- `express-session` + `connect-redis` + `redis`, store préfixé `bkmk:`, TTL 10 min, `rolling: true`.
- Cookie : `name: "bkmk.sid"`, `httpOnly`, `sameSite: "lax"`, `secure` en prod (`COOKIE_SECURE`),
  `proxy: true` (reverse proxy Kimsufi), `app.set("trust proxy", 1)`.
- `src/auth/csrfToken.js` — port direct de `csrf-token.util.ts` : `randomBytes(32)`,
  `timingSafeEqual`, en-têtes `x-csrf-token` / `x-xsrf-token`, méthodes sûres exemptées,
  `rotateCsrfToken` à la connexion/inscription, `clearCsrfToken` au logout.
- `src/auth/csrfMiddleware.js` + `src/auth/sessionAuthMiddleware.js` remplacent `checkToken.js`.
- `redisService.js` avec `clearSessionsForUser` → une seule session active par utilisateur.
- Routes : `GET /users/me`, `GET /users/csrf`, `POST /users` (signin), `POST /users/add`,
  `POST /users/logout`. `cors({ credentials: true, origin: FRONTEND_URL })`.
- **Au passage :** requêtes SQL paramétrées dans `signInController.js` et partout ailleurs
  (injection SQL présente aujourd'hui).

**Frontend**
- Suppression de `authStore.ts` et de la persistance `localStorage` du token. `useCredentials.ts` réécrit.
- `axios` en `withCredentials: true` ; intercepteur qui ajoute `x-csrf-token` sur les verbes non sûrs
  et rejoue une fois après `GET /users/csrf` sur 403 CSRF.
- Le token CSRF vit **en mémoire** (contexte React), jamais en storage.
- `AuthContext` sur le modèle `pfa/front/src/auth/context/AuthContext.tsx`, hydraté par `GET /users/me`.

**Ordre imposé :** l'auth passe **avant** la refonte des écrans login/signup, sinon on redessine
deux fois les mêmes formulaires.

---

## 5. Ce que le handoff implique côté données

Champs affichés par GRAPHITE qui n'existent pas forcément en base — à vérifier contre `backend/src/db/bkmk.sql` :

- `hash` (fiche record), `log` (4 événements horodatés par bookmark), `related · same tags`.
- Pagination serveur **22 lignes/page** (`?page=`), aujourd'hui la pagination est cliente.
- Objet de filtres : `title`, `categories[]`, `stars`, `priority[]`, `reminder`, `contains{shot,notes,url}`.
- File d'import : fichier + entrées parsées + doublons, **avant** commit (aujourd'hui l'upload est direct).
- Détection de doublons à la création (`2 duplicate candidates in index`).
- `next 14 days · load` : agrégat de rappels par jour.
- Compteurs de catégories sur 3 chiffres, `storage` (`shots 84/312`, `db 1.4 mb`).

Ces manques sont des tickets à part entière (voir §6), pas du décor.

---

## 6. Découpage en tickets Linear

**24 tickets créés dans le projet BKMK (COS-290 → COS-313).** Ordre d'exécution recommandé :

**Lot 0 — socle**
| Ticket | Titre |
|---|---|
| COS-290 | DS 01 — Tokens de design system GRAPHITE |
| COS-291 | DS 02 — Primitives de composants (`src/components/ds`) |
| COS-292 | DS 03 — Shell applicatif : chrome haut, barre de statut, tab bar mobile |

**Lot 1 — auth (avant les écrans d'auth)**
| Ticket | Titre |
|---|---|
| COS-293 | AUTH 01 — Backend : session Redis + cookie httpOnly |
| COS-294 | AUTH 02 — Backend : CSRF double-submit, retrait du JWT |
| COS-295 | AUTH 03 — Backend : requêtes SQL paramétrées (injection SQL) |
| COS-296 | AUTH 04 — Frontend : AuthContext, axios withCredentials, intercepteur CSRF |

**Lot 2 — écrans**
| Ticket | Titre |
|---|---|
| COS-297 | UI 01 — Login |
| COS-298 | UI 02 — Signup (+ jauge de force, case import) |
| COS-299 | UI 03 — Index (rail, table dense, pager) |
| COS-300 | UI 04 — Modale de filtres |
| COS-301 | UI 05 — Record (détail) |
| COS-302 | UI 06 — Insert (création) + mode édition |
| COS-303 | UI 07 — Import (upload) |
| COS-304 | UI 08 — Alarms (rappels) |
| COS-305 | UI 09 — About |

**Lot 3 — données**
| Ticket | Titre |
|---|---|
| COS-306 | DATA 01 — Pagination serveur 22/page + objet de filtres |
| COS-307 | DATA 02 — Staging d'import (parse, doublons, options) |
| COS-308 | DATA 03 — Détection de doublons à la création |
| COS-309 | DATA 04 — Champs `hash` / `log` / `related` |
| COS-310 | DATA 05 — Agrégats : `next 14 days`, `storage`, compteurs de catégories |

**Lot 4 — finition**
| Ticket | Titre |
|---|---|
| COS-311 | FIN 01 — Passe responsive `@container` sur les 9 écrans |
| COS-312 | FIN 02 — Raccourcis clavier |
| COS-313 | FIN 03 — Documenter le design system |

---

## 7. Questions ouvertes — à trancher demain avant de coder

1. **Écran d'édition** — réutiliser le gabarit `Create_Graphite` en mode edit, ou ouvrir la fiche
   record en édition inline ? (Le handoff ne le dessine pas.)
2. **Métadonnées décoratives** — `uptime 04:12`, `sync 12s`, `IDX/2.4.1`, `build 2.4.1 · tls on` :
   vraies valeurs (donc endpoints à créer) ou chrome statique ?
3. **Champs manquants** (`hash`, `log`, `related`) — migration MySQL maintenant, ou écrans livrés
   avec ces blocs masqués et remplis au Lot 3 ?
4. **shadcn/ui** — pfa s'appuie dessus (dialog, checkbox, tabs, select…). On l'installe sur bkmk
   pour la modale de filtres et les selects, ou tout en primitives maison ?
5. **Tailwind 3 vs 4** — l'option A garde v3. Confirmé, ou on migre v4 tout de suite pour aligner
   sur pfa ?
6. **Périmètre visuel** — la refonte remplace intégralement l'UI actuelle ; il n'y a pas de mode
   « ancien thème ». Confirmé ?

---

## 8. Fichiers de référence

| Quoi | Où |
|---|---|
| Spec design (autorité) | `design_handoff_graphite/README.md` |
| Structure des écrans (autorité) | `design_handoff_graphite/screens-graphite.jsx` (fonctions `*_Graphite`) |
| CSS GRAPHITE | `design_handoff_graphite/themes.css`, bloc `.theme-graphite` à partir de la **ligne 292** + son `@container (max-width:720px)` |
| Maquettes visuelles | ouvrir `design_handoff_graphite/bkmk redesign.html` |
| Données de démo | `design_handoff_graphite/data.js` |
| Modèle design system | `~/dev/pfa/front/docs/design-system.md`, `~/dev/pfa/front/styles/`, `~/dev/pfa/front/.design-sync/conventions.md` |
| Modèle auth | `~/dev/pfa/nest-api/src/main.ts`, `users/csrf-token.util.ts`, `users/guards/csrf.guard.ts`, `users/users.controller.ts`, `redis/redis.service.ts` |

**Hors périmètre, à ignorer partout :** `*_Phosphor`, `*_Paperwhite`, `*_Neon`, `*_Dusk`,
`.theme-phosphor`, `.theme-paperwhite`, `.theme-neon`, `.theme-dusk`, `.dusk-override`,
et l'enveloppe de présentation (`app.jsx`, `design-canvas.jsx`, `bkmk redesign.html`).
