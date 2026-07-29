# bkmk — Refonte GRAPHITE, remise à niveau de la plateforme, auth sécurisée

**Date :** 2026-07-29 (révisée le soir même — v2)
**Statut :** ✅ VALIDÉ — les trois dernières questions de §8 sont tranchées, l'exécution commence
par COS-314 (PLAT 01).
**Projet Linear :** BKMK (`e386be48-060a-4e96-82a0-3a2e8c7bcd30`, équipe Cosmokaat / `COS`)

---

## 0. Où on en est (reprise de session)

Session du 29/07 au soir. Ce qui a été fait :

1. ✅ Lecture du handoff **mis à jour** `design_handoff_graphite/README.md`.
2. ✅ Inventaire du codebase bkmk (frontend Next 13 pages router, backend Express JS).
3. ✅ Analyse approfondie de `~/dev/pfa/front` — versions, organisation, conventions, configs.
4. ✅ Spec + 26 tickets Linear.

**Rien n'a été codé.** Le seul ajout versionné est ce document.

### Ménage fait

L'ancien dossier de handoff et `bkmk-redesign-2.zip` ont été supprimés ; le dossier v2 a été
renommé `design_handoff_graphite/` (le zip livré par Claude Design le nommait déjà ainsi — le
suffixe « 2 » n'était qu'un artefact de collision macOS). Avant suppression, `diff -rq` a confirmé
que la v2 est un sur-ensemble strict de la v1 : 4 fichiers modifiés, 10 identiques, aucune perte.

**Il n'y a donc plus qu'un seul chemin de handoff, sans espace.**

### Avancement

| Lot | Ticket | État |
|---|---|---|
| PLAT 01 | COS-314 — Next 16 + App Router | ✅ mergé (PR #2) |
| PLAT 02 | COS-315 — Tailwind 4 | ✅ mergé (PR #3) |
| PLAT 03 | COS-316 — Biome | ✅ mergé (PR #5) |
| PLAT 04 | COS-317 — shadcn/ui | ✅ mergé (PR #6) |
| PLAT 05 | COS-318 — zod | ✅ mergé (PR #7) |
| DS 01 | COS-290 — tokens GRAPHITE | ✅ mergé (PR #8) |
| DS 02 | COS-291 — primitives de composants | ✅ mergé (PR #9) |
| DS 03 | COS-292 — shell applicatif | ✅ mergé (PR #10) |
| AUTH 01 | COS-293 — session Redis + cookie httpOnly | en cours |

**Règle de travail, sans exception :** rien n'est commité ni poussé tant que la QA n'a pas été
validée **explicitement**. Une branche par ticket, `cosmokaat/cos-<n>-<slug-anglais>`, commits
conventionnels en anglais avec `(COS-XXX)`, PR en squash.

### COS-314 (PLAT 01) — ce qui a été fait
- `package.json` : next 16.2.12, react/react-dom 19.2.3, ts 5.9.3, react-query ^5, zustand ^5,
  `babel-plugin-react-compiler`. Retirés : eslint, eslint-config-next, formik (mort), immer (mort).
  `@types/*` et `typescript` passés en devDependencies. `pnpm install` OK
  (`CI=true` nécessaire — le vieux `node_modules` a été purgé).
- `next.config.js` réécrit sur le modèle pfa : `reactCompiler`, `trailingSlash`, `turbopack.root`,
  en-têtes CSP. **Volontairement pas repris de pfa :** `typescript.ignoreBuildErrors` — on veut
  voir les erreurs de types pendant la migration.
- `tsconfig.json` : es2022, `moduleResolution: bundler`, `jsx: react-jsx`, plugin next,
  alias `@styles` et `@app` ajoutés, `@pages` supprimé, **`baseUrl` retiré** (obsolète : les
  chemins des alias sont écrits en relatif, comme chez pfa).
- `src/app/` : `layout.tsx` (next/font pour Poppins/Smooch/Ubuntu, metadata + favicon),
  `providers.tsx` (react-query + réglage FontAwesome), `error.tsx`, les deux layouts de groupe,
  et les 11 routes. `pages/` supprimé.
- `src/auth/guards/RequireAuth.tsx` : garde **client** temporaire, reprise de `_app.tsx`.
  AUTH 04 (COS-296) la remplacera par un contrôle serveur.
- `next/router` → `next/navigation` dans les 12 fichiers concernés. `router.push({ query })`
  n'existe plus : `Pagination`, `SortBar` et `Filters` construisent la query string et poussent
  une URL relative.
- react-query v4 → v5 (forme objet partout) et zustand v5 (forme curryfiée `create<T>()(...)`,
  ce qui permet enfin de typer les trois stores au lieu de les passer en `any`).
- React 19 : `JSX.Element` → `React.JSX.Element`, et `ReactElement` par défaut porte des props
  `unknown` (cassait le `cloneElement` du Dropdown).

**Pièges rencontrés, à ne pas re-découvrir**
- `pnpm install` exige `CI=true` la première fois (purge du vieux `node_modules`), et
  `pnpm-workspace.yaml` doit trancher `allowBuilds: sharp`.
- `// @ts-nocheck` doit rester le **tout premier** commentaire du fichier, donc **avant**
  `"use client"` — sinon il ne s'applique plus (cas de `CreateBookmark.tsx`).
- zustand v5 fait **boucler** un composant si le sélecteur renvoie un objet littéral
  (`s => ({ a: s.a })`) : sélectionner une valeur, ou passer par `useShallow`.
- `use-onclickoutside` s'arrête à React 18 ; ses types ignorent le `| null` des refs React 19.
  Un cast suffit, et la dépendance part avec le Dropdown à DS 02.

**Décision de séquencement :** les deux routes que COS-314 annonçait supprimer sont **portées**
plutôt que supprimées tout de suite — sinon l'ancienne UI perd l'édition et la déconnexion
pendant plusieurs lots. Leurs destins diffèrent :

- `logout` **disparaît** avec AUTH 04 (COS-296), remplacée par un `POST /users/logout`.
- `bookmarks/edit/[id]` **reste** — voir ci-dessous.

### La modale d'édition passe par les routes parallèles (décidé le 2026-07-29)

La modale d'édition est **portée par une route** : slot `@modal` + route d'interception `(.)` +
`default.tsx`, le motif Next 16 documenté pour les modales. Détail complet dans COS-319.

Conséquence sur PLAT 01 : **la route d'édition ne meurt pas**, elle devient le **repli plein
écran** rendu sur visite directe ou rechargement. Elle change seulement de forme —
`/bookmarks/edit/42` → `/bookmarks/42/edit` — et ce déplacement appartient à COS-319.

Ce qu'on y gagne : une URL partageable, le bouton retour qui ferme la modale au lieu de quitter
l'index, et l'index qui garde ses filtres et sa page (ils vivent déjà dans la query string).

Deux pièges notés dans COS-319 : la **profondeur du marqueur** (`(private)` et `@modal` ne
comptent pas comme segments) et le `[...catchAll]/page.tsx` renvoyant `null`, sans lequel la
modale reste collée à l'écran lors d'une navigation par `Link`.

Les deux autres surfaces restent en état client : la confirmation de suppression est éphémère,
et la modale de filtres n'a que son ouverture à porter.

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

### ⚠️ Deux pièges relevés en lisant le JSX v2

**La grille de la table change.** `GCOLS` passe de `58px 36px 62px 1fr 216px 122px` (v1) à
**`58px 36px 62px 1fr 188px 168px`** (v2) : la colonne `tags` rétrécit de 28px et la colonne
`added` s'élargit d'autant pour loger les trois boutons d'action. `paddingRight` passe de 14 à 12,
`gap` de 10 à 8. Reprendre la v1 casserait l'alignement.

**Le glyphe de suppression est `⌧`, pas `⌫`.** Le README §10 écrit `⌫`, le JSX utilise `⌧`. Le
README désigne lui-même `screens-graphite.jsx` comme « source de vérité de la structure » : c'est
donc `⌧` qui gagne.

### Styles associés (`themes.css`, lignes 369-379 + responsive 432-446)

`.gr-acts` (conteneur, `opacity:0` → `1` au survol de `.gr-tr`) · `.gr-act` (bouton-glyphe 22px,
rayon 6 ; **26px et toujours visible en mobile**) · `.gr-act.danger:hover` → `--accent-2` ·
`.gr-mini` (20px, 9.5px uppercase) et `.gr-mini.danger` · `.gr-btn.danger` (outline oxyde) et
`.gr-btn.danger.solid` (plein `linear-gradient(180deg,#8d4018,#763512)`, bordure `#5f2a0e`, texte
`#f4ece6`).

---

## 2. Inventaire : écrans du handoff vs. existant

`design_handoff_graphite/screens-graphite.jsx` — **les numéros de ligne ont tous bougé en v2** :

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

- **`pages/` → `app/` — ✅ décidé, on migre.** pfa est intégralement en App Router avec les groupes
  de routes `(public)` / `(private)` ; adopter son organisation impliquait cette migration. C'est le
  point le plus risqué du lot : `_app.tsx` devient `app/layout.tsx` + `app/providers.tsx`, les
  providers (react-query, AuthContext) passent en composant client explicite, `useRouter` vient de
  `next/navigation`, `getServerSideProps` disparaît, et le garde de session `(private)` se joue côté
  serveur (`auth/server/getServerSession.ts` chez pfa). Les 12 routes existantes sont remappées :
  `(public)` → login, signup, about ; `(private)` → index, bookmarks/[id], create, upload,
  reminders. `pages/logout/` et `pages/bookmarks/edit/[id]/` disparaissent.
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

⚠️ **`pnpm lint` du front sort en erreur, et c'est assumé** (décidé le 2026-07-29). Après les
corrections sûres, il reste **57 erreurs**, toutes dans les composants hérités : pour l'essentiel
des `div` cliquables sans équivalent clavier (`useKeyWithClickEvents`, `noStaticElementInteractions`),
plus quelques `useButtonType` et `useAltText`. Aucune n'est corrigée : ces fichiers sont supprimés
par le lot UI, les rendre accessibles serait du travail jeté.

Deux conséquences à garder en tête. D'ici la fin du lot UI, `pnpm lint` ne dit rien d'utile sur le
code neuf — il faut lire la sortie, pas le code de retour. Et la règle est vraie pour GRAPHITE
aussi : la table de l'index a des **lignes cliquables**, elles devront porter leur gestion clavier
dès UI 03, sans quoi on recréera la même dette.

Le **back**, lui, est propre : `pnpm lint` y sort en 0 après reformatage. Il ne reste que des
suggestions non sûres que Biome refuse d'appliquer seul (28 concaténations à passer en gabarits,
`node:` sur les imports internes, quelques `parseInt` sans base).

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

**Cinq écarts constatés à l'installation** (COS-317, le 2026-07-29) :

- **Radix arrive par le paquet unifié `radix-ui`**, pas par les `@radix-ui/react-*` individuels de
  pfa : c'est ce que génère le CLI aujourd'hui (`import { Dialog as DialogPrimitive } from
  "radix-ui"`). L'écart est assumé — s'en écarter casserait la régénération, qui est justement la
  raison d'être du layering ci-dessus. pfa migrera quand il repassera le CLI.
- **`button` s'ajoute tout seul**, tiré par `alert-dialog` : 14 composants, pas 13.
- **Les tokens sémantiques sont posés à la main**, dans `tokens/colors.css` (`:root` / `.dark` /
  `@theme inline`) et `tokens/radius.css`. Le CLI ne les écrit que pendant `shadcn init`, qu'on ne
  lance pas puisque `components.json` est recopié de pfa. Valeurs du registre `neutral`, telles
  quelles — DS 01 (COS-290) les repeint. `tokens/radius.css` est donc créé ici et non en DS 01,
  contrairement à ce que disait l'en-tête de `globals.css`.
- **Pas de règle `body { @apply bg-background text-foreground }`**, que `shadcn init` ajoute
  d'ordinaire : elle repeindrait d'un coup toute l'ancienne UI, qui tient encore son fond de
  `base.css`. C'est UI 01 (COS-297) qui bascule le fond de page.
- **La chaîne de calc des rayons n'est pas reprise** — application directe de la règle de snapping.
  shadcn dérive `rounded-sm/md/lg/xl` d'un `--radius` unique et sort 6/8/10/14px, quatre valeurs
  qui n'existent nulle part dans Tailwind (4/6/8/12px) : elle invente des pas entre les pas natifs
  et leur reprend leurs noms, si bien que `rounded-lg` ne vaut plus ce que la doc Tailwind annonce.
  Le bloc `@theme inline` de `tokens/radius.css` est donc supprimé, l'échelle native reste intacte.
  Il ne reste que `--radius`, calé sur `rounded-lg` (`0.5rem`) au lieu du 10px hors grille du
  registre, parce que `ui/sonner.tsx` le lit dans un style inline où `rounded-*` ne peut pas
  atteindre. C'est le piège que pfa a fini par documenter (§5 de son `docs/design-system.md`,
  « Radius — read this, it has a trap ») ; bkmk ne l'hérite pas.

`TooltipProvider` est monté dans `providers.tsx` : le `Tooltip` de shadcn lève à l'usage sans lui.
Le `<Toaster />` de sonner, lui, n'est pas monté — aucun toast n'existe encore, c'est au lot UI de
le câbler.

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
  La règle vaut **pour le code neuf**. Les fichiers hérités gardent leurs imports relatifs et les
  perdent au moment où le lot UI les réécrit : les convertir maintenant serait un diff massif sur
  des fichiers voués à disparaître, exactement le travail jeté qu'on a refusé pour l'a11y.
- Composants `PascalCase.tsx`, hooks et helpers `camelCase.ts`, un composant par fichier.
- **Les hooks react-query vivent dans `<module>/services/`** et s'appellent `use<Chose>.ts`. Un
  hook = les queries **et** les mutations du domaine, avec sa fonction `invalidation()` locale.
- **Tous les cache keys passent par `@lib/query/keys.ts`** (`QUERY_KEYS`, objet `as const`). Jamais
  de chaîne magique : c'est ce qui rend l'invalidation croisée fiable.
- Types dans `<module>/interfaces/`, constantes dans `<module>/config/constants.ts`.
- Les imports de type sont **séparés en fin de bloc** (`import type { … }`) — produit
  automatiquement par l'assist Biome.
- La copie textuelle vit dans `src/text/`, pas en dur dans les composants.
- **Aucune mémoïsation à la main : ni `useMemo`, ni `useCallback`, ni `React.memo`.** Le
  compilateur React s'en charge, et mieux. Si un rendu coûte trop cher, chercher la vraie cause
  (clé react-query instable, sélecteur zustand qui renvoie un objet littéral, état mal placé).
- **Normaliser puis snapper sur l'échelle Tailwind** — voir ci-dessous.

### Normalisation et snapping des tokens

Règle du DS de pfa, à appliquer à GRAPHITE. Le handoff est une maquette dessinée à l'œil : six
graduations de texte réparties sur 3px, huit rayons dont trois séparés d'un pixel. **On ne recopie
pas ces valeurs.** Deux temps, dans cet ordre :

1. **Normaliser** — fusionner ce qui ne se distingue pas à l'œil. Une différence d'un pixel entre
   deux rayons n'est pas une décision de design, c'est du bruit.
2. **Snapper** — si l'échelle Tailwind native a le pas, **on prend le pas natif et on ne crée
   aucun token**. Un token ne s'ajoute que là où le natif n'a réellement rien. pfa part de
   l'échelle native et ne l'étend que de quatre tokens.

Corollaire, déjà la règle chez pfa : **un token, jamais une valeur brute** — pas de
`text-[12.5px]`, pas de `rounded-[7px]`, pas de `p-[14px]`.

**L'espacement, les hauteurs et les gaps restent sur l'échelle numérotée**, demi-pas compris
(`p-3.5` = 14px, `py-4.5` = 18px, `px-5.5` = 22px). Tout le chrome de GRAPHITE y tombe déjà :
ligne de table 30px = `7.5`, chrome 38px = `9.5`, barre de statut 26px = `6.5`, barre de commande
46px = `11.5`. **Aucun token d'espacement nommé** — pfa l'interdit explicitement.

Les **couleurs** échappent à la règle : ce sont des teintes choisies, jamais la palette Tailwind
stock (`gray-400`, `emerald-700`…).

⚠️ **Piège à ne pas reproduire.** pfa a fini avec deux échelles de rayon aux noms identiques et
aux valeurs différentes (`--r-lg` = 14px en CSS, `rounded-lg` = 10px en utilitaire) ; c'est dans
ses « known rough edges ». Ici : **une seule échelle**, celle de `@theme`.

Le détail, avec les premiers tableaux de correspondance et les arbitrages restants, est dans
COS-290.

### Ce qui a été posé (COS-290, le 2026-07-29)

Les tableaux de correspondance complets sont dans **`frontend/docs/design-system.md`** (en anglais,
sur le modèle de `pfa/front/docs/design-system.md`). C'est ce fichier qui fait autorité ; ce qui
suit n'en garde que les arbitrages.

**Le snapping a mordu beaucoup plus fort que prévu.** Sur les cinq familles du handoff, deux ne
produisent **aucun token** :

| Famille | Tokens créés | Pourquoi |
|---|---|---|
| Couleur | 22 (`gr-*`) | teintes choisies, hors règle de snapping |
| Typo | 2 (`text-3xs`, `text-2xs`) | les 9 pas du handoff tombent sur 2 tokens + le natif |
| Tracking | 2 (`tracking-caps`, `tracking-snug`) | 0.08/0.10em → `tracking-widest`, 0.04em → `tracking-wider` |
| Élévation | 4 (`shadow-gr-*`) | ombres composées, le natif n'a rien d'équivalent |
| Rayon | **0** | les 8 valeurs tombent sur l'échelle native |
| Point de rupture | **0** | 720 → 768 = `@max-3xl` natif |

**Les quatre arbitrages qui changent quelque chose :**

- **Six pas de typo entre 9.5 et 12.5px, ce ne sont pas six décisions.** Le micro-label (9.5) et
  le bouton (10.5) se rejoignent à **10** : à cette taille la hiérarchie est portée par la couleur
  et le tracking, pas par un pixel. Les trois titres (21 / 24 / 26) tombent sur `text-xl` et
  `text-2xl` — **aucun token de titre**.
- **Le slot descend de 10 à 8.** Il est imbriqué dans une carte à 12 ; un rayon intérieur égal à
  celui du conteneur fait déborder la courbe.
- **La modale monte de 14 à 16.** À 12 elle porterait exactement le rayon d'une carte et perdrait
  son indice de surface posée au-dessus du reste.
- **720px → 768.** Le pas est pile entre `--container-2xl` (672) et `--container-3xl` (768). Choix
  décidé sur l'iPad en portrait, exactement 768 : à 672 il garderait la table dense sur une largeur
  qui ne la tient pas.

**Trois pièges rencontrés, à ne pas réintroduire :**

- **La doc polluait le build.** Tailwind scanne les noms de classes ; il a trouvé ceux des tableaux
  de correspondance et les a émis — y compris `text-[12.5px]`, que la doc cite comme contre-exemple.
  `@source not "../docs";` dans `globals.css` referme ça.
- **`radius.css` ne déclare plus aucun token**, seulement `:root { --radius: 0.5rem }`, que
  `ui/sonner.tsx` lit dans un style inline.
- **`breakpoints.css` existe et ne déclare rien** : il documente le 720 → 768 pour que personne ne
  recrée le token.

**Ce qui reste volontairement legacy** : 15 couleurs, 2 ombres, 3 tailles et 3 familles de police,
plus le fond de page de `base.css` et la police du `body`. Ils tiennent en vie les écrans que le
lot UI n'a pas encore refaits et partent avec eux, écran par écran. (`components/chrome.css` était
annoncé ici pour DS 03 ; COS-292 a décidé de ne pas le créer — voir plus bas.)

> Le filet clair, lui, n'attend pas DS 03 : DS 02 en a fait un token, `inset-shadow-gr-hair`.
> Tailwind v4 garde `inset-shadow-*` sur une couche distincte de `shadow-*`, donc les deux se
> composent — `shadow-gr-1 inset-shadow-gr-hair` — et aucune classe écrite à la main n'est
> nécessaire.

Ajouté au passage : `styles/animations.css` (`bkmk-blink`, `bkmk-pop`, `bkmk-fade` + un bloc
`prefers-reduced-motion`) et **IBM Plex Mono** chargée par `next/font` sous
`--font-plex-mono-face`.

### Ce qui a été posé (COS-291, le 2026-07-29)

Le détail est dans **`frontend/docs/design-system.md` §8**, qui fait autorité. Ici, seulement les
décisions.

**La question qui range chaque composant : shadcn le fournit-il déjà ?** Le ticket liste `Button`,
`Field`, `Modal` et `Meter` parmi les primitives *et* interdit de réimplémenter ce que shadcn
donne. Les deux se contredisent sur ces quatre-là, et c'est la règle qui gagne :

- **`ui/` restylé** : `button` (4 variantes GRAPHITE + 3 tailles), `input`, `textarea`, `progress`,
  `dialog`, `alert-dialog`.
- **`ds/` créé** : les 14 primitives que GRAPHITE a et qu'aucun registre ne livre.

Le restyle de `ui/` est **additif là où ça compte** : les six variantes shadcn du bouton restent en
place, inutilisées. C'est ce qui garde `shadcn add button` régénérable — la raison d'être du
layering de PLAT 04.

**Deux composites dans `ds/`, qui ne sont pas des réimplémentations.** `Field` lie un `Overline` à
un `ui/input` par un `htmlFor` — le handoff écrit la légende et le champ en frères sans relation,
ce qui donne un champ sans nom accessible. `MiniButton` est un préréglage nommé sur `ui/button`.

**Trois écarts assumés par rapport au handoff :**

- **La priorité a quatre niveaux, pas trois.** La maquette montre `high / med / low` ; `schemas/`
  valide `low / medium / high / highest`, et c'est ce que la base stocke. Le schéma gagne : trois
  barres ne sauraient pas distinguer `high` de `highest`. La chaîne vide est un état réel, rendu
  en quatre barres éteintes.
- **`Segment` n'est pas `Tabs`.** Un onglet choisit une vue et une seule ; un segment est une case
  à cocher déguisée en pilule, plusieurs sont actifs à la fois, et il change une requête. Radix
  Tabs lui donnerait le mauvais modèle clavier et le mauvais rôle ARIA. C'est un
  `<button aria-pressed>`.
- **La zone de dépôt est à 12, pas à 10.** Le résumé du ticket regroupe « slot/dropzone 10 » ;
  `themes.css` dit `.gr-slot` 10 et `.gr-drop` 12. Le CSS fait foi : le slot descend à 8 (arbitrage
  DS 01), la dropzone reste à 12, native.

**Deux trous de DS 01 refermés :** DS 01 avait tokenisé les quatre teintes d'oxyde et oublié leur
miroir teal (`gr-teal-from/to/border/fg`), sans lequel le bouton primaire inline quatre littéraux ;
et le voile des modales (`gr-scrim`) n'existait pas.

**Le filet clair n'attend plus DS 03.** Trois tokens `inset-shadow-*` — `hair`, `sunk`, `mark` —
sur la couche que Tailwind v4 tient séparée de `shadow-*`. (Il ne restait donc plus rien à mettre
dans `chrome.css`, ce que COS-292 a constaté en refusant de le créer.)

**Ce qui n'est volontairement pas fait :** `alert-dialog` n'est restylé qu'en surface (voile, coque,
titre, description). Sa mise en page shadcn — slot média, variantes de taille — est réécrite par
UI 11 (COS-320), qui décide de la composition réelle de la confirmation de suppression. La toucher
ici serait deviner à sa place.

### Ce qui a été posé (COS-292, le 2026-07-29)

Le détail est dans **`frontend/docs/design-system.md` §9**, qui fait autorité. Ici, seulement les
décisions.

Le shell vit dans `components/shared/shell/` et est monté **une fois**, dans
`app/(private)/layout.tsx` : `AppShell` (racine d'écran, `@container`, `h-dvh`) → `TopChrome` →
`Desk` → `StatusBar` → `TabBar`.

**`chrome.css` n'existe pas, et c'est un choix contre la recommandation du ticket.** Le `chrome.css`
de pfa existe pour ce que les utilitaires ne savent pas dire : bordures en dégradé sur deux
`background-clip`, `::-webkit-scrollbar`, voiles en `:has()`. Le shell GRAPHITE n'a rien de tout ça,
DS 02 avait déjà mis ses propres surcharges `@max-3xl:` en ligne (`Card`, `CommandBar`), et un second
idiome pour quatre composants coûterait plus que ne fait gagner le bloc responsive groupé.
**Il n'y a donc pas de `styles/components/`**, et le commentaire d'en-tête de `globals.css` le dit.

**La racine d'écran est le seul conteneur du système.** Toutes les variantes `@max-3xl:` du DS —
celles du shell, celles de `ds/`, celles de `ui/` — se résolvent contre elle.

⚠️ **Conséquence relevée au passage, et corrigée : ce qui est portalisé dans `document.body` sort du
conteneur.** Une requête de conteneur sans conteneur ne retombe pas sur la fenêtre, elle est fausse à
toutes les largeurs. Les variantes `@max-3xl:` que DS 02 avait posées sur l'en-tête et le pied de
`ui/dialog` étaient donc mortes. Elles sont retirées :

- **Le pied garde le comportement visé sans seuil du tout** : `flex-wrap` inconditionnel. Le retour à
  la ligne est déjà conditionné par le fait que le contenu ne tient pas — la variante n'apportait
  rien, et l'inconditionnel couvre en plus les largeurs qu'un seuil unique manquait.
- **L'en-tête attend le lot UI.** Sa croissance 46 → 54px n'avait de raison que par partage de la
  classe `.gr-cmd` avec la barre de commande d'une carte, qui grandit parce qu'elle porte le champ de
  recherche ; un en-tête de modale porte un titre et une croix. Et le resserrement de 2-4px devrait se
  déclencher sur la largeur de la modale, qui est encore le `sm:max-w-lg` de shadcn : le
  `min(680px, 100% - 20px)` de GRAPHITE arrive avec la composition (UI 10 / UI 11). Auto-conteneuriser
  ne sauverait rien — une modale plafonnée sous 768px rend `@max-3xl` vrai en permanence, ce qui est
  pire que jamais.

Reste su et assumé : `size="chrome"` d'un bouton porte `@max-3xl:h-8.5`, qui marche sur les écrans et
ne s'appliquera pas dans une modale. Le détail est au §7 de `frontend/docs/design-system.md`.

**Cinq écarts assumés, tous documentés dans le DS :**

- **La barre de statut reste à 10px en mobile** (le handoff descend à 9). Un pixel sous le plus petit
  label du système, payé par un token que rien d'autre n'utiliserait : même arbitrage que DS 01 sur
  9.5 / 10.5.
- **Les onglets portent une bordure transparente au repos.** Le handoff n'en met qu'à l'onglet actif,
  qui devient alors 2px plus grand que ses voisins et décale la rangée.
- **Le bureau défile** (`overflow-auto`). Le handoff le laisse fixe et fait défiler chaque carte ; les
  écrans GRAPHITE se comportent pareil dans les deux cas, mais les écrans hérités plus hauts que la
  fenêtre seraient tronqués.
- **`bkmk-fade` passe de 4px à 2px**, la valeur du handoff. DS 01 avait écrit 4px avant que quoi que
  ce soit ne consomme la keyframe ; le bureau est son premier consommateur.
- **La copie est en anglais dans `src/text/shell.ts`, sans segment de locale.** Le ticket disait
  `src/text/fr/` ; §4 de cette spec avait déjà tranché que bkmk n'a pas d'i18n et que l'UI GRAPHITE
  est en anglais.

**Le contenu de la barre de statut est de la copie, indexée par écran** (`SHELL_STATUS`). Un layout ne
peut pas recevoir de props de la page qu'il rend, et l'alternative — un store que chaque écran remplit
au montage — achète un flash de contenu faux et un effet par écran contre une table de constantes.
Deux écrans calculent leur valeur de droite depuis les compteurs ; le `record <id>` de la fiche
appartient à COS-301.

**Un seul token ajouté :** `--shadow-gr-chrome` (`0 1px 3px`). Le `shadow-gr-1` d'une carte
projetterait une bande de 8px en travers du bureau, et le `shadow-sm` natif est la même forme en noir
pur alors que toutes les ombres GRAPHITE sont teintées gris chaud.

**Les compteurs sont réels, et pour rien de plus qu'une requête.** `useShellCounts` interroge
`?rows=1&page=0` — la page la moins chère qui rapporte quand même `total_count`, que le contrôleur
calcule dans un `COUNT(DISTINCT b.id)` séparé — sous la clé `[bookmarks, "count"]`. Comme toutes les
mutations existantes invalident le préfixe `[bookmarks]`, le compteur se rafraîchit tout seul après
une création ou une suppression. Les rappels réutilisent la clé exacte de leur écran. Aucun compteur
n'affiche `000` en attendant : il n'affiche rien.

**Ce qui a été supprimé :** `shared/navBar/` (NavBar, UserMenu et leurs deux composants de contenu) et
`useIsWindowResponsive.ts`. La suppression du menu utilisateur a orphelin `common/dropdown/`, parti
avec lui, et avec lui la dépendance `use-onclickoutside` qui s'arrêtait à React 18 — celle que DS 02
devait emporter.

⚠️ **`shared/Layout.tsx` survit, amputé.** Il perd sa barre de navigation mais garde `ToolsBar` et
`SortBar` : rien ne les remplace encore, et les retirer coûterait aux écrans hérités leur pagination,
leurs filtres et leurs actions de fiche plusieurs tickets avant que la barre de commande GRAPHITE
n'arrive. Conséquence visible pendant la transition : les `mt-*` des écrans hérités dégagent encore
une barre de navigation qui n'existe plus, donc leur contenu s'affiche trop bas dans le bureau. Ça ne
se corrige pas — ces fichiers sont supprimés par le lot UI.

**L'email du chrome est la seule sortie de session** jusqu'à ce que UI 09 (COS-305) en mette une dans
About. Il pointe sur `/logout`, ce qui est la traduction fidèle du prototype (« l'email du chrome →
login »), avec un `aria-label` explicite parce que l'adresse seule ne dit pas ce que le clic fait.
AUTH 04 (COS-296) remplacera la cible par un `POST /users/logout`.

**Le chrome d'auth réduit n'est pas fait** (`BKMK` + `auth` + `build 2.4.1 · tls on` + LED, README
§1). Le ticket porte sur les écrans **applicatifs** ; login et signup appartiennent à UI 01 / UI 02.
Idem pour About, qui est aujourd'hui dans `(public)` et n'a donc pas le shell : c'est COS-305 qui
décidera de son groupe de routes.

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

### Ce qui a été posé (COS-318, le 2026-07-29)

Les huit schémas existent dans `frontend/src/schemas/`, et **cinq services parsent désormais à la
frontière** : connexion, inscription, liste des bookmarks, fiche, catégories, rappels. Les services
ne rendent plus une réponse axios mais la donnée validée, ce qui a fait tomber les `data.data` chez
leurs consommateurs.

**Quatre points à connaître avant de toucher à ces fichiers :**

- **`csrfToken` est optionnel, volontairement.** Le back ne l'émet pas encore ; le rendre
  obligatoire maintenant casserait la connexion. AUTH 02 (COS-294) l'émet et le rend obligatoire
  dans le même mouvement.
- **La nullabilité est volontairement large.** bkmk n'a ni migrations ni DDL versionné —
  `dbinitmysql.js` ouvre juste une connexion — donc rien ne dit quelle colonne est `NOT NULL`.
  Tout ce que le code ne prouve pas est `.nullish()`. Resserrer se fera sur des fixtures réelles,
  au lot DATA. Même réserve pour `fieldLimits.ts`, dont les valeurs sont **déduites, pas lues** :
  seule la troncature à 120 de l'import est écrite quelque part.
- **Les catégories traversent l'API sous deux formes.** `GET /categories` rend les lignes de la
  table (`id` entier) ; celles embarquées dans un bookmark sortent d'un `GROUP_CONCAT` recomposé
  par `marshallCategories` (`id` en chaîne, pas de `user_id`). D'où deux schémas, et
  `numberLikeSchema` pour absorber l'écart.
- **Les rappels n'ont pas de catégories** et aliasent la date d'alarme en `alarm_added` là où la
  fiche l'appelle `alarm_date_added`. Ce n'est pas une coquille des schémas, c'est ce qu'écrivent
  les deux requêtes SQL. DATA 03 (COS-308) les alignera.

`filters.ts` et la partie « entrées analysées / résumé » de `import.ts` ne sont branchés nulle
part : ils décrivent ce que UI 08 (COS-304) et la modale de filtres devront produire. Les payloads
d'écriture non plus — le formulaire part en multipart, où `categories` est déjà une chaîne JSON ;
le décrire vraiment appartient au lot DATA, avec le formulaire qui l'émet.

### Validation côté Express

`backend/src/middlewares/validate.js`, utilisé en nommant les parties à valider :

```js
router.get("/", checkToken, validate({ query: listBookmarksQuerySchema }), catchAsync(controller));
```

Deux décisions qui méritent d'être connues :

- **Les schémas du back sont un miroir, pas un partage.** Il y a deux copies : le front est en
  TypeScript, le back en CommonJS, sans paquet commun. Et elles ne peuvent pas être identiques —
  le formulaire envoie `stars: 3`, multipart le transforme en `"3"`, donc le back a besoin de
  `z.coerce` là où le front n'en a pas. Coût : changer une borne dans l'un oblige à la changer à
  la main dans l'autre, et rien ne le vérifie.

  ⚠️ **Cette duplication est un pis-aller, pas un choix.** Elle disparaît quand le back passe à
  Nest : même langage des deux côtés, un paquet partagé, un seul schéma. Ne pas la consolider en
  bâtissant dessus.
- **Le middleware ne remplace pas `req.body` ni `req.query`.** Le résultat validé va dans
  `req.validated`, et les contrôleurs continuent de lire les objets d'origine. `z.object` retire
  les clés inconnues : écraser `req.body` ferait disparaître sans bruit un champ qu'un contrôleur
  hérité lit encore. La migration vers `req.validated` se fait contrôleur par contrôleur.

⚠️ **Ça ne ferme pas l'injection SQL.** Contraindre `userID` à un entier retire le vecteur le plus
direct de la liste, mais les autres filtres restent interpolés. Les requêtes préparées restent le
travail de COS-295.

Effet de bord assumé : un `sort` inconnu répond maintenant **400** au lieu de tomber
silencieusement dans le `default` du contrôleur et de ne rien trier.

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

### Ce qui a été posé (COS-293, le 2026-07-30)

Deux fichiers : `backend/src/redisService.js` (nouveau) et `backend/src/server.js` (réécrit).

**Ce ticket ne change aucun comportement, et c'est voulu.** `saveUninitialized: false` n'écrit une
session que lorsqu'une route pose quelque chose sur `req.session`, et aucune ne le fait encore :
aucun cookie n'est émis, le chemin JWT est intact. AUTH 02 (COS-294) est ce qui fait créer la session
à la connexion. Les quatre tickets AUTH arrivent un par un et l'application doit marcher entre chaque
— même règle que le `/logout` et la barre d'outils du shell.

**`server.js` devient un `bootstrap()` async.** Le client Redis doit être connecté avant que le store
ne voie une requête — node-redis rejette toute commande émise sur un client non connecté — et un
module CommonJS n'a pas de `await` au niveau racine. Même forme que le `main.ts` de pfa, sans Nest.
L'échec sort en `process.exit(1)` : un Redis injoignable doit faire remonter l'app en `errored` chez
pm2, pas laisser tourner un serveur incapable d'authentifier.

**L'environnement vit dans `ecosystem.config.js` / `ecosystem.config.prod.js`, pas dans `.env` — écart
à la lettre du ticket.** Ces deux fichiers sont **ignorés par git** (`.gitignore`) et portent déjà
tous les secrets du back ; c'est aussi là que pfa met exactement ces variables. `SESSION_SECRET`
(32 octets base64, **valeur différente en dev et en prod** pour qu'un secret de dev qui fuite ne
forge pas de session de prod), `REDIS_URL`, `FRONTEND_URL` (`http://localhost:3100` en dev,
`https://bkmk.1991computer.com` en prod). `COOKIE_SECURE` n'est pas posée : elle ne sert qu'à
*renoncer* au `Secure` sur un hôte de prod sans HTTPS, et bkmk est derrière HTTPS.
⚠️ Corollaire : ces fichiers n'étant pas suivis, **la liste des variables requises n'existe nulle part
ailleurs que dans ce paragraphe**. Un `pm2 restart ecosystem.config.js --env dev` est nécessaire pour
qu'elles soient relues — pm2 garde l'environnement du démarrage à travers les redémarrages de `watch`.
Au passage : `backend/.env` (`PORT`, `CORS_ORIGIN`) est mort — pas de `dotenv` dans les dépendances,
rien ne le lit.

**`cors()` grand ouvert devient une origine nommée avec `credentials: true`.** Le joker et les
requêtes créditées s'excluent d'après la spec CORS : c'est le prix du cookie de session. En prod le
front et l'API partagent `bkmk.1991computer.com` (le proxy mappe `/api`), donc en pratique cette
option ne porte que la paire de dev, front 3100 / API 3101.

**`clearSessionsForUser` : port fidèle, à un écart nécessaire près.** `KEYS` est conservé bien qu'il
balaie tout l'espace de clés en bloquant le serveur — il tourne une fois par connexion sur une
poignée de sessions de dix minutes, et le Redis de la box est partagé, d'où le préfixe `bkmk:`.
**En revanche les identifiants sont comparés en chaînes** : celui de pfa est une chaîne, celui de bkmk
est un `INT(11)` MySQL, et un nombre d'un côté du `===` ferait échouer la comparaison en silence —
aucune erreur, aucune suppression, et la garantie « une seule session active par utilisateur »
disparue sans bruit.

**Un garde-fou ajouté :** `SESSION_SECRET` absente lève une erreur qui nomme la variable et le fichier
où la poser, au lieu de la trace d'express-session — l'environnement de bkmk étant dans un fichier non
suivi, une trace ne dirait pas où aller.

**QA faite en local** (Redis 6379, API 3101, sonde temporaire montée puis retirée) : cookie
`bkmk.sid; Path=/; HttpOnly; SameSite=Lax`, sans `Secure` en dev ; clé `bkmk:<sid>` avec un TTL de
600 s ; `rolling` vérifié en forçant le TTL à 100 puis en rejouant une requête (retour à 600) ;
deux sessions du même utilisateur effacées par `clearSessionsForUser(1)` ; en-têtes CORS crédités sur
`http://localhost:3100`, préflight 204 ; route JWT existante toujours servie ; **aucun `Set-Cookie` ni
aucune clé `bkmk:*` en fonctionnement normal.**

**Relevé au passage, pour AUTH 02 :** `checkToken` répond aujourd'hui **200** avec
`{ success: false }` quand le jeton manque, au lieu de 401. Le `sessionAuthMiddleware` qui le remplace
doit renvoyer 401 — l'intercepteur de `useRequestHelper` en dépend.

---

## 7. Ce que le handoff implique côté données

- `hash`, `log` (événements horodatés), `related · same tags` — absents de `backend/src/db/bkmk.sql`.
  **Reportés** (§8.2) : blocs masqués dans la fiche, aucune migration MySQL dans ce chantier.
- Pagination **serveur** 22 lignes/page (`?page=`) ; aujourd'hui cliente.
- Objet de filtres : `title`, `categories[]`, `stars`, `priority[]`, `reminder`, `contains{shot,notes,url}`.
- File d'import : fichier + entrées analysées + doublons **avant** commit.
- Détection de doublons à la création.
- Agrégats : `next 14 days · load`, `storage` (`shots 84/312`, `db 1.4 mb`), compteurs de catégories.
- **Nouveau v2 :** `DELETE /bookmarks/:id` doit être exercé depuis trois points d'entrée (confirm en
  place, fiche, modale d'édition) et invalider les caches react-query concernés en une seule
  fonction `invalidation()`, façon pfa.

---

## 8. Questions tranchées

**Tranché :** édition en modale (handoff §9) · shadcn adopté · Tailwind v4 · **App Router** ·
Biome partout, eslint et prettier retirés (front **et** back) · ancien dossier de handoff et zip
supprimés.

Tranché le 2026-07-29, plus rien ne bloque :

1. **Métadonnées décoratives** — `uptime 04:12`, `sync 12s`, `IDX/2.4.1`, `build 2.4.1 · tls on`
   sont du **chrome statique**. Aucun endpoint à créer, aucun état à câbler. Elles vivent en
   constantes dans `src/text/fr/` (la copie ne se met pas en dur, cf. §4) et se rendent telles
   quelles. Corollaire : elles ne doivent **jamais** donner l'impression d'être vivantes —
   pas d'`setInterval` qui incrémente `uptime`, pas de pastille « sync » qui clignote.
2. **Champs manquants** (`hash`, `log`, `related`) — **plus tard**. Aucune migration MySQL dans
   ce chantier. Les écrans sont livrés avec ces trois blocs **masqués** (pas de faux contenu,
   pas de squelette permanent), et COS-309 les rallume au lot DATA quand le schéma les portera.
   Concerne la fiche record (COS-301) : `hash`, `log`, `related · same tags`.
3. **Périmètre visuel** — la refonte **remplace intégralement** l'UI. Pas de mode « ancien
   thème », pas de sélecteur, pas de bascule : `.theme-graphite` est le seul thème et l'ancien
   CSS part avec les écrans qu'il habillait.

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
| Spec design (autorité) | `design_handoff_graphite/README.md` |
| Structure des écrans (autorité) | `design_handoff_graphite/screens-graphite.jsx` |
| CSS GRAPHITE | `design_handoff_graphite/themes.css`, `.theme-graphite` **ligne 292**, actions/danger **369-379** et **432-446** |
| Maquettes | ouvrir `design_handoff_graphite/bkmk redesign.html` |
| State du prototype | `design_handoff_graphite/bkmk-context.jsx` |
| Versions & deps | `~/dev/pfa/front/package.json` |
| Organisation & conventions | `~/dev/pfa/front/src/`, `~/dev/pfa/front/docs/design-system.md`, `~/dev/pfa/front/.design-sync/conventions.md` |
| Configs | `~/dev/pfa/biome.json`, `~/dev/pfa/front/biome.json`, `next.config.js`, `postcss.config.js`, `tsconfig.json`, `components.json` |
| Modèle zod | `~/dev/pfa/front/src/schemas/` |
| Modèle auth | `~/dev/pfa/nest-api/src/main.ts`, `users/csrf-token.util.ts`, `users/guards/csrf.guard.ts`, `users/users.controller.ts`, `redis/redis.service.ts` ; côté client `~/dev/pfa/front/src/helpers/useRequestHelper.ts` |

**Hors périmètre :** `*_Phosphor`, `*_Paperwhite`, `*_Neon`, `*_Dusk`, les sélecteurs de thème
correspondants, et l'enveloppe de présentation (`app.jsx`, `design-canvas.jsx`,
`bkmk redesign.html`).
