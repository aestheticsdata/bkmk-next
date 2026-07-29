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
| PLAT 04 | COS-317 — shadcn/ui | en cours |

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
