# Prompt à coller dans Claude Code

> Copie tout le bloc ci-dessous dans Claude Code, à la racine du dépôt `bkmk`.

---

Je te donne un dossier de handoff design : `design_handoff_graphite/`. Il contient une maquette HTML interactive de la refonte de bkmk. **Une seule direction visuelle m'intéresse : GRAPHITE.** Ignore complètement les autres (PHOSPHOR, PAPERWHITE, NEON, DUSK) — elles sont dans les mêmes fichiers mais ne servent pas.

**Où sont les écrans GRAPHITE :**
- `design_handoff_graphite/screens-graphite.jsx` — les 8 écrans + la modale de filtres. Chaque écran est une fonction `*_Graphite` : `Login_Graphite`, `Signup_Graphite`, `List_Graphite` (index), `Detail_Graphite` (record), `Create_Graphite` (insert), `Upload_Graphite` (import), `Reminders_Graphite` (alarms), `About_Graphite`, `FilterModal_Graphite`.
- `design_handoff_graphite/themes.css` — **uniquement** le bloc `.theme-graphite` (tokens, composants `gr-*`, et le bloc `@container (max-width:720px)` pour le responsive). Le reste du fichier concerne les autres directions : ne le lis pas.
- `design_handoff_graphite/README.md` — spec complète : tokens exacts, dimensions, colonnes de tables, états, comportement responsive, écran par écran.
- `design_handoff_graphite/bkmk redesign.html` — ouvre ce fichier dans un navigateur pour voir les maquettes en vrai (section « 05 · GRAPHITE » : desktop, login, signup, about, import, et 4 artboards téléphone 390×844).

**Ce que j'attends :**
1. Commence par lire `README.md`, puis les composants `*_Graphite` et le bloc `.theme-graphite`.
2. Explore mon code existant et dis-moi comment tu comptes intégrer ce design : mes composants, mon routing, ma gestion de state, ma façon de styler. **Ne code rien avant d'avoir proposé un plan.**
3. Le HTML/JSX du handoff est une **référence de design, pas du code à copier** : recrée les écrans dans mon stack existant avec mes conventions, en gardant la fidélité visuelle (couleurs, tailles, rayons, ombres, densité exactes).
4. Respecte le périmètre fonctionnel réel de l'app : liste paginée, filtres (title contains, catégories, stars, reminder, contains screenshot/notes/url), création, import Session Buddy .txt / .csv, rappels, login, signup, about.
5. Le responsive passe par des **container queries** (`container-type: inline-size` sur la racine de l'écran, bascule à 720px), pas par des media queries — respecte ça si mon stack le permet.

Commence par un inventaire : liste les écrans GRAPHITE que tu as trouvés, ce qui existe déjà dans mon code, et ce qui manque.
