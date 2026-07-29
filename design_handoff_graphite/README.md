# Handoff: bkmk — direction GRAPHITE

## Overview
Refonte complète de bkmk (index de bookmarks auto-hébergé) dans une direction unique appelée **GRAPHITE** : fond gris uni moyen, panneaux flottants (ombres douces, liserés clairs), typographie monospace, densité de données élevée. 8 écrans + une modale de filtres, en desktop (1280×820) et téléphone (390×844).

## About the Design Files
Les fichiers de ce dossier sont des **références de design réalisées en HTML/JSX** : des prototypes qui montrent l'apparence et le comportement voulus, **pas du code de production à copier**. Le travail consiste à **recréer ces écrans dans le codebase cible** (React, Vue, Svelte, template serveur…) avec ses conventions, ses composants et sa façon de styler. Si aucun environnement n'existe encore, choisir le framework le plus adapté et y implémenter les écrans.

⚠️ Les fichiers contiennent **cinq directions visuelles**. Seule `graphite` est retenue. Tout ce qui s'appelle `*_Phosphor`, `*_Paperwhite`, `*_Neon`, `*_Dusk`, ou tout sélecteur `.theme-phosphor` / `.theme-paperwhite` / `.theme-neon` / `.theme-dusk` / `.dusk-override` est **hors périmètre**.

## Fidelity
**High-fidelity.** Couleurs, typographie, dimensions, rayons, ombres et états sont définitifs — les valeurs de ce document sont celles à implémenter. La densité (hauteurs de lignes, hauteurs de barres) fait partie du design : ne pas « aérer ».

---

## Design tokens

### Couleurs
| Token | Valeur | Usage |
|---|---|---|
| `--bg` | `#a3a4a0` | fond de l'écran (aplat, **aucune texture ni dégradé**) |
| `--bg-2` | `#b3b4af` | surfaces claires secondaires |
| `--bg-3` | `#9b9c97` | surfaces enfoncées |
| `--panel` | `#adaea9` | fond des cartes |
| `--panel-2` | `#b4b5b0` | chrome haut, barre de commande, pieds de carte |
| `--sunk` | `#9a9b96` | champs, blocs de code, zone de dépôt, slots image |
| `--fg` | `#161715` | texte courant |
| `--fg-2` | `#0c0d0c` | texte fort (titres, valeurs) |
| `--fg-3` | `#474944` | texte secondaire, micro-labels |
| `--fg-4` | `#6a6c66` | texte tertiaire (compteurs, timestamps) |
| `--accent` | `#1d5b4f` | accent principal (teal sourd) : LED, curseur, action primaire, ligne sélectionnée |
| `--accent-2` | `#7d3714` | accent secondaire (oxyde) : étoiles, alarme imminente |
| `--danger` | `#8a3512` | erreurs |
| `--border` | `rgba(22,23,21,0.16)` | filets internes |
| `--border-2` | `rgba(22,23,21,0.32)` | filets structurants, bordures de boutons |
| `--hair` | `rgba(255,255,255,0.45)` | liseré clair 1px en haut des surfaces (`inset 0 1px 0`) |
| `--ring` | `rgba(29,91,79,0.26)` | anneau de focus (3px) |

Sélection texte : `rgba(29,91,79,0.20)`.

### Élévation
- `--e1` : `0 1px 2px rgba(20,21,19,0.10), 0 3px 8px -2px rgba(20,21,19,0.10)` — cartes, boutons.
- `--e2` : `0 2px 4px rgba(20,21,19,0.12), 0 18px 40px -12px rgba(20,21,19,0.30)` — survol de bouton, carte d'auth.
- Modale : `0 30px 70px -20px rgba(18,19,17,0.55), 0 2px 6px rgba(18,19,17,0.20), inset 0 1px 0 var(--hair)`.
- Bouton primaire : `0 1px 2px rgba(20,21,19,0.22), 0 8px 18px -8px rgba(23,71,64,0.75), inset 0 1px 0 rgba(255,255,255,0.20)`.
- **Toute surface claire porte `inset 0 1px 0 var(--hair)`** : c'est la signature du système.

### Typographie
- Famille unique : `'IBM Plex Mono', monospace`. `font-variant-numeric: tabular-nums` sur toutes les colonnes chiffrées.
- Base : **12.5px**, `line-height 1.45`, `letter-spacing -0.005em`.
- Lignes de table : 12px. Sous-lignes (url) : 11px. Timestamps/compteurs : 11px.
- Micro-label (`.gr-lab`) : **9.5px**, `letter-spacing 0.16em`, `text-transform: uppercase`, `--fg-3`.
- En-tête de colonne : 9.5px, `letter-spacing 0.14em`, uppercase, `--fg-3`.
- Boutons : 10.5px, `letter-spacing 0.10em`, uppercase.
- Onglets du chrome : 11px, `letter-spacing 0.08em`, uppercase.
- Titres : record `21px/600`, about `24px/600`, auth `26px/600`, tous `letter-spacing -0.015em`, couleur `--fg-2`.
- Logo : `BKMK` 13px/600 `letter-spacing 0.14em` + `IDX/2.4.1` 9.5px `--fg-4`.

### Rayons
carte 12 (14 en mobile) · champ & bouton 9 · segment 8 · onglet 7 · chip 6 · slot/zone de dépôt 10 · modale 14 · jauge & LED 999 (pill/cercle).

### Espacements et hauteurs
- Bureau (`.gr-desk`) : padding 14, gap entre cartes 12 (mobile : 8 / 8).
- Chrome haut : 38px (mobile 48), padding 0 16, gap 18.
- Barre de commande : min-height 46 (mobile 54), padding 0 14.
- En-tête de colonnes : 28px. Ligne de table : **30px** (mobile : hauteur auto, padding 12/14).
- Bouton 30px (mobile 34) · segment 24 · chip 18 · champ padding 8/11.
- Barre de statut : 26px, 10px uppercase `--fg-4`.
- Barre d'onglets mobile : boutons 48px, grille 4 colonnes, gap 6.

---

## Écrans

Un même « shell » enveloppe tous les écrans applicatifs : **chrome haut** → **bureau (cartes)** → **barre de statut** → (mobile) **barre d'onglets**.

### Chrome haut
`BKMK IDX/2.4.1` · onglets `index 312` / `new` / `import` / `alarms 004` (onglet actif : fond `--panel`, bordure `--border`, ombre `e1`, point teal 6px avec halo `0 0 0 3px var(--ring)`) · à droite `about`, `uptime 04:12`, l'email du compte, une LED teal 7px. Sous 720px : les onglets et les métadonnées disparaissent (voir Responsive).

### 1. Login
Chrome réduit (`BKMK` + `auth` + `build 2.4.1 · tls on` + LED). Bloc centré 480px : micro-label `session`, titre `sign in to the index` suivi d'un curseur bloc clignotant teal (`▄` 1.05s steps(1)), carte (padding 22, ombre `e2`) avec `identity` (email) et `key` (password), bouton primaire `connect ↵`, `or` + lien `register`, mention `keys stored locally`. Sous la carte : bloc mono `host / index / sync`, puis lien `about bkmk →`. Barre de statut : `idle · ↵ connect · tab next field`.

### 2. Signup
Même gabarit. Champs : `identity · email`, puis `key` et `confirm key` sur deux colonnes, jauge de force (62%), case `[x] import my Session Buddy export after signup`, bouton `register ↵`, lien `sign in`, mention `self-hosted · no tracking`.

### 3. Index (liste)
Deux colonnes : rail 196px + carte table (gap 12).
- **Rail** : `index · cat` puis catégories (`all 312`, `dev 188`, `demoscene 041`… compteurs sur 3 chiffres, alignés à droite, `--fg-4`) ; ligne active : fond `rgba(255,255,255,0.34)`, `--fg-2`, 500. Puis `scopes` avec cases `[x] starred`, `[ ] has alarm`, `[ ] has shot`, `[ ] prio high`. Puis `storage` : `shots 84/312` + jauge 27%, `db 1.4 mb`.
- **Barre de commande** : `query` + champ enfoncé affichant l'expression (`> tag:demoscene stars:>3` + curseur), à droite `sort added ▾`, `rows 312/312`, bouton `filter ⌥F` (ouvre la modale).
- **Table** — colonnes `58px 36px 62px 1fr 216px 122px` : `id` · `pri` (barres `▮▮▮` selon high/med/low) · `stars` (5 étoiles, remplies en `--accent-2`, vides en `--fg-4`) · `title / url` (titre `--fg-2` ellipsé, glyphe `◨` si screenshot, `◔` teal si alarme, url `--fg-3` 11px) · `tags` (3 chips max) · `added` (date ISO + action `↗` révélée au survol, qui ouvre l'url sans ouvrir la fiche).
  - Survol de ligne : `rgba(255,255,255,0.20)`. Ligne sélectionnée : `rgba(255,255,255,0.36)` + `inset 3px 0 0 var(--accent)`.
- **Pied de table (pager)** : `←` `page 00/77` `→`, `rows 001–022 of 312`, `sorted by added ▾`. 22 lignes par page.
- Barre de statut : `ready · j/k move · enter open · f filter · n new` · `idx 312 · sync 12s`.

### 4. Record (détail)
Barre de commande : `‹ index / record 2085` + boutons `edit`, `alarm`, `open url ↗` (primaire).
- Colonne gauche : `title` + titre 21px ; `fields` en table clé/valeur (`grid-template-columns: 104px 1fr`, filet bas par ligne) — `url`, `added`, `priority`, `stars`, `tags`, `alarm`, `shot`, `hash` ; puis `note` (ou `— empty —` en `--fg-4`).
- Colonne droite 372px, fond `rgba(255,255,255,0.10)`, filet à gauche : `preview` (slot pointillé 178px, label `screenshot 1280×800`), `log` (4 lignes `timestamp` + événement), `related · same tags` (4 entrées cliquables `id + titre`).

### 5. Insert (création)
Barre de commande : `insert / record 2088 · draft` + `cancel` et `commit ⌘↵`.
- Gauche (max 640) : `url`, `title` (auto-rempli depuis `<title>`), `note` (textarea 3 lignes), `tags` (chips + chip pointillée `+ add`), `priority` (segments high/med/low, `med` actif), `stars` (4/5), `alarm` (segments `off`/`T-1d`/`T-3d`/`T-7d`/`date…`, `T-7d` actif).
- Droite 340px : `shot · auto capture` (slot 146px `queued · 1280×800`), `record preview` (bloc mono id/host/tags/prio/stars/alarm/shot), avertissement `2 duplicate candidates in index · review before commit`.

### 6. Import (upload)
Barre de commande : `import / session buddy .txt · .csv` + `cancel` et `send ⌘↵`.
- Gauche : zone de dépôt (pointillés, fond enfoncé) `drop a .txt or .csv here` / `or` / bouton `choose file` / `max 5 mb · utf-8`. Puis `staged · <nom de fichier>` : table 3 colonnes (`1fr 190px 74px`) titre / host / état (`NEW` teal, `DUP` oxyde), résumé `77 entries parsed · 4 new · 1 duplicate · 0 malformed`. Puis `on import` : segments `skip duplicates`, `capture shots`, `tag as imported`.
- Droite 380px : `accepted formats` (un .txt exporté par l'extension Chrome **Session Buddy**, ou un .csv `title;url` par ligne), `txt · shape` et `csv · shape` en blocs de code mono, `last import 2026-07-11 · 341 entries · 12 skipped`.

### 7. Alarms (rappels)
Barre de commande : `alarms / clock 2026-01-19 09:12` + `snooze all` et `arm new`.
- Table colonnes `58px 1fr 132px 118px 150px 96px` : `id` · `title` (+ url en 10.5px `--fg-4`) · `countdown` (`T-07d` + jauge 56px ; ≤ 1 jour → oxyde) · `fires` (date + heure) · `added / armed` (`bkmk <date>` / `alarm <date> · Nd`) · `act` (`SNOOZE · DONE`). Lignes de 44px.
- Carte basse `next 14 days · load` : 14 barres (jours avec alarme à 100% teal + ombre portée, autres à 14% en `rgba(22,23,21,0.13)`), rayon 5, légende `jan 19` / `feb 02`.

### 8. About
Barre de commande : `‹ index / about`.
- Gauche : titre `a bookmark index for people who keep everything`, paragraphe de présentation, `keyboard` en table clé/valeur (`j / k`, `↵`, `⌘↵`, `f`, `n`, `u`, `a`, `/`), `credits`.
- Droite 340px : `system` (version, host, storage, records, categories, alarms, backup), `changelog` (4 versions), boutons `import` et `sign out`.

### 9. Édition d'un record (modale)
**Choix de design :** la fiche record reste l'écran de *consultation* (log, related, preview) ; l'édition passe par une **modale** posée dessus, ce qui évite un second écran quasi identique et permet d'éditer directement depuis la liste sans quitter la page courante.

Panneau centré, largeur `min(680px, 100% - 20px)`, `max-height: calc(100% - 24px)`, scrollable. En-tête : `EDIT` + `record <id>` + `added <date> · unsaved changes` + `×`. Champs préremplis, mêmes contrôles que l'écran insert : `url`, `title`, `note` (textarea 3 lignes), `tags` (chips + `+ add` pointillée), `priority` / `stars` sur deux colonnes, `alarm` / `screenshot` (`captured` + `re-capture`) sur deux colonnes. Pied : `save ⌘↵` (primaire), `cancel`, et à droite `delete record` (bouton outline oxyde) qui ouvre la confirmation.

### 10. Suppression (confirmation)
Deux chemins, selon le contexte :
- **Depuis la liste** — au survol d'une ligne, trois actions apparaissent à droite de la date : `↗` (ouvrir l'url), `✎` (éditer), `⌫` (supprimer, en oxyde au survol). Le clic sur `⌫` transforme la fin de ligne en confirmation en place : `DELETE?` + deux mini-boutons `CONFIRM` (plein oxyde) / `CANCEL` — hauteur 20px, 9.5px uppercase. Aucun écran ni modale : la ligne se supprime sur `CONFIRM`.
- **Depuis la fiche ou la modale d'édition** — bouton `delete` (outline oxyde) qui ouvre une **modale de confirmation** de `min(440px, 100% - 20px)` : en-tête `DELETE / record <id>`, titre + url du record, puis la ligne d'avertissement (« note, tags, screenshot and alarm go with it… this cannot be undone »), pied `delete record` (plein oxyde) / `cancel` / `esc cancels`.

Styles associés : `.gr-act` (bouton-glyphe 22px, rayon 6, révélé au survol de ligne — toujours visible en mobile, 26px), `.gr-mini` (mini-bouton de confirmation), `.gr-btn.danger` (outline oxyde) et `.gr-btn.danger.solid` (plein oxyde `linear-gradient(180deg,#8d4018,#763512)`, bordure `#5f2a0e`, texte `#f4ece6`).

### 11. Modale de filtres
Panneau centré, largeur `min(640px, 100% - 20px)`, `max-height: calc(100% - 24px)`, rayon 14, backdrop `rgba(28,30,27,0.40)` + `blur(3px)`, animation `bkmk-pop .18s cubic-bezier(.2,.7,.3,1)`.
Champs, dans l'ordre : `title contains` (input) · `categories` (segments multi-sélection) · `stars` (`any/1+/2+/3+/4+/5`) · `priority` (`high/med/low/—`) · `reminder` (`any/armed/none/≤ 3d`) · `contains` (cases `[x] screenshot`, `[ ] notes`, `[ ] url`) · `resolved expression` (lecture seule, style champ enfoncé). Pied : `filter — 27 results` (primaire), `reset`, `live · 4 ms`.

---

## Interactions & comportement
- Clic sur une ligne → fiche record. Clic sur `↗` → ouvre l'url (ne navigue pas dans l'app ; `stopPropagation`).
- Onglets du chrome / barre d'onglets mobile → changement de module. `about` dans le chrome, `sign out` (about) et l'email du chrome → login. Login ↔ signup ↔ about liés entre eux.
- Bouton `filter ⌥F` et clic sur l'expression de recherche → modale ; clic sur le backdrop ou `×` → fermeture.
- Transitions : apparition d'écran `opacity + translateY(2px)` 220ms ease-out ; boutons `transform/box-shadow` 120ms (survol : `translateY(-1px)` + `e2`) ; champs `border-color/box-shadow` 150ms ; curseur bloc `1.05s steps(1) infinite`.
- Focus champ : `border-color: var(--accent)` + `0 0 0 3px var(--ring)`.
- Pas de glow, pas de scanline, pas de dégradé de fond : le seul dégradé du système est le remplissage vertical discret des boutons.

## Responsive (container queries)
La racine de l'écran porte `container-type: inline-size` ; **la bascule se fait à `@container (max-width: 720px)`**, donc sur la largeur du panneau et non celle de la fenêtre (fonctionne en split view / en embed).

Sous 720px :
- Rail masqué → remplacé par un **scroller horizontal de catégories** en haut de la carte table (segments 32px, pas de scrollbar visible).
- En-têtes de colonnes masqués ; chaque ligne devient une fiche sur 3 rangs : `titre` / `id · stars · date` / `tags`. Colonne `pri` masquée. Le titre passe en `white-space: normal`, l'url suit les glyphes sur le 2e rang.
- Rappels : `titre` / `countdown · fires` ; colonnes `id`, `added / armed`, `act` masquées.
- Écrans à deux volets (record, insert, import, about) : une seule colonne, le volet droit passe sous le gauche avec un filet haut au lieu du filet gauche ; padding 16/14.
- Onglets du chrome et raccourcis clavier masqués → **barre d'onglets basse** 4 colonnes (`index`, `new`, `import`, `alarms`), boutons 48px, actif : fond `--panel` + bordure + `e1`.
- Modale fluide et scrollable ; carte d'auth en pleine largeur ; table d'import réduite à titre + état.

## State
- `view` : `login | signup | list | detail | create | upload | reminders | about`.
- `selected` : le record ouvert (alimente la fiche).
- `filtersOpen` : booléen (modale de filtres).
- `editing` : record en cours d'édition (modale) ou `null`.
- `deleting` : record en attente de confirmation de suppression ou `null`.
- Local à la liste : `confirmId` — id de la ligne en confirmation de suppression en place.
- Côté vrai backend, à prévoir : page courante (`?page=`, 22 lignes/page), objet de filtres (title, categories[], stars, priority[], reminder, contains{shot,notes,url}), file d'import (fichier + entrées parsées + doublons).

## Données
`data.js` fournit un jeu de mock : 28 bookmarks (`id, title, url, stars, notes, priority, tags[], shot, alarm, date, dateLabel`), 4 rappels (`id, days`), et une palette de teintes par tag (`tagPalette[tag].hue`) utilisée pour le point coloré des chips (`hsl(hue, 34%, 32%)`).

## Assets
Aucun. Les screenshots de bookmarks sont des **slots** (cadre pointillé + label mono) à remplacer par les captures réelles. Police : IBM Plex Mono (Google Fonts).

## Files
- `screens-graphite.jsx` — les 8 écrans GRAPHITE + la modale (**source de vérité de la structure**).
- `themes.css` — bloc `.theme-graphite` : tokens, composants `gr-*`, bloc `@container` responsive. Le reste du fichier est hors périmètre.
- `bkmk-context.jsx` — routing/state du prototype (contexte React minimal).
- `data.js` — données de démonstration.
- `bkmk redesign.html`, `app.jsx`, `design-canvas.jsx` — enveloppe de présentation (canvas d'artboards). À ouvrir pour voir les maquettes ; **pas** à porter.
- `PROMPT.md` — prompt prêt à coller dans Claude Code.
