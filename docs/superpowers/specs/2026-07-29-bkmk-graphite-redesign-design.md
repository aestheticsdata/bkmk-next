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
| AUTH 01 | COS-293 — session Redis + cookie httpOnly | ✅ mergé (PR #11) |
| AUTH 02 | COS-294 — CSRF double-submit, retrait du JWT | ✅ mergé (PR #12) |
| AUTH 03 | COS-295 — requêtes SQL paramétrées | ✅ mergé (PR #12) |
| AUTH 04 | COS-296 — AuthContext, cookie, intercepteur CSRF | ✅ mergé (PR #12) |
| UI 01 | COS-297 — écran Login | ✅ mergé (PR #14) |
| UI 02 | COS-298 — écran Signup + passphrase de récupération | ✅ mergé (PR #15) |
| UI 03 | COS-299 — écran Index : rail, table dense, pager | ✅ mergé (PR #16) |
| UI 04 | COS-300 — modale de filtres | ✅ mergé (PR #17) |
| FIN 04 | COS-327 — favicon GRAPHITE | ✅ mergé (PR #18) |
| hors lot | COS-326 — index : la bande d'actions sous le pli | ✅ mergé (PR #19) |
| UI 13 | COS-328 — login : sur-titre `BKMK` + pitch | ✅ mergé (PR #20) |
| UI 09 | COS-305 — écran About : les mentions légales en GRAPHITE | ✅ mergé (PR #21) |
| hors lot | COS-321 — le menu de compte dans le chrome | ✅ mergé (PR #22) |
| UI 05 | COS-301 — écran Record : la fiche en consultation | ✅ mergé (PR #23) |
| UI 06 | COS-302 — écran Insert : le formulaire de création | ✅ mergé (PR #25) |
| hors lot | COS-329 — de-mock de l'écran Insert : le titre automatique | ✅ mergé (PR #42) |
| hors lot | COS-393 — capture auto depuis l'url, détachée de COS-329 | ❌ annulé — la capture reste manuelle |
| hors lot | COS-394 — retrait de la capture auto de l'écran et de l'import | ✅ mergé (PR #43) |
| UI 07 | COS-303 — écran Import : dépôt, staging, formats | ✅ mergé (PR #26) |
| UI 08 | COS-304 — écran Alarms : inventaire, compte à rebours, charge 14 jours | ✅ mergé (PR #27) |
| hors lot | COS-330 — de-mock de l'écran Alarms (snooze / done) | ⏳ ouvert par UI 08 |
| hors lot | COS-331 — SEC : secrets en clair dans l'historique git | ⏳ trouvé pendant UI 08 |
| UI 10 | COS-319 — modale d'édition d'un record, portée par une route | ✅ mergé (PR #28) |
| hors lot | COS-341 — dialog : le corps défile, plus le panneau autour | ✅ mergé (PR #29) |
| hors lot | COS-342 — dialog : la taille de base franchit le portail | ✅ mergé (PR #29) |
| hors lot | COS-344 — index : glyphes dimensionnés à leur encre, bande alignée sur `added` | ✅ mergé (PR #29) |
| UI 11 | COS-320 — suppression : confirmation en place + modale | ✅ mergé (PR #30) |
| hors lot | COS-322 — le périmètre d'un contrôleur vient de la session, plus de la requête | ✅ mergé (PR #30) |
| hors lot | COS-345 — une catégorie appartient à un compte, et les jointures le disent | ✅ mergé (PR #39) |
| hors lot | COS-346 — plateforme, ouvert par l'audit de COS-322 | ✅ mergé (PR #38) |
| DATA 01 | COS-306 — la page se décrit elle-même, et `?userID=` quitte le fil | ✅ mergé (PR #31) |
| DATA 02 | COS-307 — staging d'import : parse, commit, options, `last import` | ✅ mergé (PR #32) |
| hors lot | COS-338 — DATA 09 : forme normale d'url, colonne `host`, backfill | ✅ mergé (PR #34) |
| DATA 03 | COS-308 — détection de doublons à la création | ✅ mergé (PR #35) |
| AUTH 05 | COS-324 — récupération par passphrase : écran `/recover` et route | ✅ mergé (PR #40) |
| DATA 05 | COS-310 — compteurs du rail, bloc `storage`, charge des 14 jours | ✅ mergé (PR #41) |

⚠️ **DATA 03 n'a qu'un étage sur les deux que son ticket décrit, et c'est une mesure qui l'a
tranché.** Le premier — même url normalisée — trouve 17 groupes et 56 fiches sur l'index réel. Le
second — même host, titre proche — en trouve **7 paires, et les 7 sont fausses** : deux vidéos
YouTube distinctes qui partagent un titre, une recherche Google à côté de son propre résultat
d'images, `Software Engineering Anxiety | Prime Reacts` contre `Software Engineering Anxiety`. Un
index à 78 % d'un seul hôte est exactement l'endroit où « même host » cesse de vouloir dire quelque
chose. Et il ne *peut* pas être honnête aujourd'hui : les titres sont encore stockés
percent-encodés pour toute ligne importée ou héritée, donc la comparaison tournerait contre
`Solving%20Distributed%20Systems…`. Arbitrage du propriétaire : livrer cet étage-ci, rouvrir l'autre
après DATA 07 (COS-334), qui décode la colonne. Détail en §6 ter.

⚠️ **UI 09 est parti bien plus étroit que son ticket.** About ne porte que les mentions légales —
c'est tout ce que la page contenait — repeintes dans le bloc 480px de l'écran de connexion, avec le
lien de retour. Le `About_Graphite` du handoff (pitch, table de raccourcis, panneau `system`,
`changelog`, `sign out`) n'a pas été construit : ce n'est pas le travail de cette page, et la moitié
n'aurait rien pu dire de vrai sur une page servie sans session. Le §2 ci-dessous, qui annonce
« refonte + `system`, `changelog` », est périmé sur cette ligne.

⚠️ **COS-321 n'a livré que le menu et `log out`.** `change password`, `set recovery passphrase` et
`language` sont **dessinées et désactivées** : les deux premières attendent leurs routes (COS-324
porte la passphrase), la troisième attend une couche de traduction que bkmk n'a pas. Elles sont
montrées plutôt que cachées parce que le menu est aussi la façon d'apprendre ce qu'un compte a — et
grisées plutôt que promises. Le même passage a **retiré les trois lectures inventées du chrome** sur
demande du propriétaire : `IDX/2.4.1` et `uptime 04:12` côté application, `build 2.4.1 · tls on` côté
auth (remplacé par le domaine de l'hôte). Voir le §8.1 plus bas, dont le point 1 est amendé.

⚠️ **UI 05 a livré trois boutons sur les quatre, et corrigé deux défauts trouvés en route.** Le
`alarm` de la maquette est le seul des quatre qui n'a rien à faire — armer un rappel écrit `reminder`
sur le record, donc c'est le champ du formulaire d'édition, et l'écran legacy remplacé avait
`back / edit / delete`. Les deux défauts : **aucune ligne de l'index ne pouvait être ouverte depuis
UI 03** (le lien était construit sur `ROUTES.bookmarks.path`, qui porte `?page=0`, donc l'id
atterrissait dans la query string), et **la note passait par `dangerouslySetInnerHTML`** avec une
substitution d'URL par concaténation de chaînes, sans échappement, sur du texte saisi par le
propriétaire du compte. Le volet droit, réduit à `preview`, garde la carte à la hauteur du record :
mesuré en 1440×900, une carte pleine hauteur laissait 511px de volet vide sous la vignette, contre
262 en épousant le contenu.

⚠️ **UI 06 est le premier écran où ce qui manque est MOCKÉ au lieu d'être retiré, et c'est une règle
générale du chantier, pas une exception.** Arbitrage du propriétaire, en cours de ticket : « tout ce
qui n'existe pas encore côté back ou front, on mock pour l'instant, et il faut un ticket pour
de-mock ». Elle **remplace** ce qui avait été fait sur UI 05 et UI 09, où les blocs sans donnée
étaient simplement absents ; à partir d'ici la maquette est tenue telle qu'elle est écrite, chaque
valeur en dur est marquée sur place, et un ticket `de-mock` la reprend. Pour cet écran c'est
**COS-329** : `shot · auto capture` et son `queued · 1280×800`, la ligne `2 duplicate candidates in
index`, et le titre récupéré depuis le `<title>` de la page. Le `record preview`, lui, n'est pas
mocké — chaque ligne est calculée depuis le brouillon, et son `id` affiche `—` parce que
l'identifiant est ce que l'insertion retourne.

✅ **Soldé depuis, et les trois lectures ont fini de trois façons différentes** : les doublons sont
devenus réels avec COS-308, le titre avec COS-329, et la capture automatique a été **abandonnée**.
Détachée d'abord en COS-393, celui-ci a été annulé — « je ne veux pas du ticket 393, c'est trop
lourd, je continue à faire les screenshots à la main » — et **COS-394** a retiré de l'écran les deux
lectures qui l'annonçaient.

⚠️ **Ce troisième cas est la sortie de la règle, pas une exception à celle-ci, et c'est ce qui la rend
sûre.** « Ce qui n'existe pas se mocke, et un ticket de-mock le reprend » ne tient que parce que la
donnée finit par arriver. Une fois acté qu'elle n'arrivera jamais, la valeur en dur n'est plus un
emplacement réservé, ce sont des mots faux : ils partent avec la fonctionnalité. Le regroupement sous
`CREATE_TEXT.mock` est précisément ce qui a rendu ce retrait mécanique — un seul endroit où chercher
tout ce qui devait suivre. Rien, sur aucun de ces trois chemins, n'a été retiré en silence.

⚠️ **Le périmètre de contenu, lui, reste celui de l'écran existant** — les deux règles ne se
contredisent pas. UI 06 livre les huit champs que le formulaire portait déjà et rien de plus ; `group`
disparaît (le contrôleur le lit dans un `if` vide et ne l'écrit nulle part), et l'édition part avec le
composant, qui servait `create` et `edit/[id]` sur un seul `id`. Mocker comble un **trou de donnée**
dans un bloc que la maquette dessine ; ça n'autorise pas à inventer des blocs que l'écran n'a pas.

⚠️ **Là où la maquette et la donnée divergent, la donnée gagne** — l'arbitrage de `ds/PriorityBars`,
étendu aux contrôles de saisie. `priority` a quatre segments et non trois (un contrôle à trois ne peut
pas exprimer `highest` sur des records qui le portent), `alarm` en a six et non quatre parce que
l'alarme est une **fréquence** et pas un compte à rebours, et rien n'est coché sur un formulaire
vierge : le `med` + 4 étoiles de la maquette sont les valeurs de son record d'exemple. Deux
correctifs de frontière sont venus avec : le champ tags s'arrête à 20 caractères (`category.name`, le
21e revenait en erreur SQL brute) et une capture est vérifiée type + taille **avant** de devenir celle
du brouillon, au lieu d'après que multer a interrompu la requête.

**Ce qui est mutualisé pour UI 10** : les cinq contrôles non-texte sont dans
`components/bookmarks/fields/`, le `Group` local de la modale de filtres est devenu `ds/FieldGroup`,
et `ds/Segment` a gagné un troisième mode (`action`) pour les segments qui agissent et disparaissent
au lieu de basculer. `CreateBookmarkPayloadSchema`, écrit par PLAT 05 et resté inutilisé, est branché.

⚠️ **UI 07 n'a pas eu besoin d'un ticket de de-mock neuf : DATA 02 (COS-307) l'était déjà.** Il
décrivait exactement les trois choses mockées ici — l'état `NEW`/`DUP` avec les moitiés `new` /
`duplicate` du résumé, les trois options `on import`, et la ligne `last import`. Il porte maintenant
le label `de-mock` et la liste de ce qui est en dur et où. **La règle est donc : chercher le ticket
existant avant d'en créer un** ; sur ce chantier le lot DATA est très souvent déjà le de-mock du lot
UI qui le précède.

⚠️ **Le staging d'UI 07 est réel, et il duplique volontairement le parser du back.** Le fichier est lu
et analysé dans le navigateur avant l'envoi, donc `title`, `host`, le nombre d'entrées et le nombre de
lignes illisibles sont mesurés. Il n'existe aucun endpoint qui analyse sans écrire — c'est précisément
COS-307 — et l'alternative était une table de cinq bookmarks inventés sous le nom du fichier qu'on
vient de déposer. `parseImport.ts` part avec COS-307 ; d'ici là un changement dans l'un des deux
parsers doit être fait dans les deux.

⚠️ **Deux bugs d'import corrigés en route, tous les deux sur le chemin `.csv`.** Le format était
décidé par `originalname.split(".")[1]` — le **deuxième** segment du nom, pas l'extension : un fichier
`session_buddy.2026_07_11.csv` partait dans la branche Session Buddy et importait n'importe quoi sans
échouer. Et la branche csv déstructurait chaque ligne puis appelait `.trim()` sur la seconde moitié,
donc la chaîne vide que `split("\n")` laisse après un saut de ligne final produisait un `TypeError`
→ **500**, après avoir déjà inséré les lignes précédentes. Quasiment tous les imports csv étaient
concernés.

⚠️ **UI 08 a élargi son périmètre, et c'est le propriétaire qui l'a tranché en cours de ticket.**
L'écran ne listait que les alarmes qui sonnent **le jour même**, parce que c'est tout ce que
`GET /reminders` renvoyait : le contrôleur bouclait sur le résultat complet et ne gardait que les
lignes où `differenceInDays(now, alarm_added) % frequency === 0`. Or la colonne `countdown` de la
maquette et la carte `next 14 days` ne peuvent pas être dessinées sur une liste où chaque ligne sonne
dans zéro jour. Deux options lui ont été posées ; il a pris la première. Le contrôleur cesse donc de
filtrer et se met à **calculer** : `alarm_days_until` (la même expression MySQL que le filtre
`alarm=due` de l'index, écrite pareil pour qu'ils ne puissent pas diverger sur ce qui est imminent) et
`alarm_next_fire`. La liste « ça sonne aujourd'hui » n'est pas perdue, c'est `alarm_days_until = 0`.
**Les deux compteurs du chrome bougent avec** — `alarms NNN` et `N armed` comptent enfin ce que leur
mot dit, ils comptaient les sonneries du jour sous le mot « armées ».

⚠️ **Rien n'est mocké sur cet écran, et ce n'est pas une exception à la règle de UI 06** — c'est la
donnée qui était là dès que l'endpoint a cessé de la jeter. Le compte à rebours, la date de sonnerie
et les quatorze barres sont calculés. La charge sur 14 jours est comptée **côté client** depuis les
alarmes que la table affiche déjà : la liste n'est pas paginée, donc compter dans le navigateur donne
exactement ce que donnerait un `GROUP BY`, et une alarme étant une répétition elle peut tomber
plusieurs fois dans la fenêtre. DATA 05 (COS-310) n'est donc plus le de-mock de ce bloc mais son
déplacement côté serveur — obligatoire dès que la liste sera paginée — et son ticket le dit.

⚠️ **Ce qui est dessiné-mais-inerte : `snooze`, `done`, `snooze all`.** Aucune route ne repousse ni
n'acquitte une alarme. Même choix que le menu de compte : montrés, grisés, et **COS-330** les câble.
Les hints `s snooze` / `d done` de la barre de statut sont retirés en attendant, pour la raison qui
laisse l'écran Record sans aucun hint — le tableau de COS-312 ne les porte pas non plus, donc c'est
COS-330 qui les rétablira. `arm new`, lui, n'est pas dans cette liste : armer une alarme, c'est donner
un rappel à un signet, et le formulaire de création est l'écran où ce champ vit.

⚠️ **Deux correctifs sont venus avec la requête.** La suppression est douce et laisse la ligne
`alarm` en place, donc **un signet supprimé continuait de sonner ici et d'être compté dans le chrome**,
sans qu'aucun écran puisse l'atteindre — `b.active = 1` y met fin. Et `frequency > 0` garde le modulo,
que rien ne contraint en base.

⚠️ **Trois écarts à la maquette, tous mesurés** (Chrome sans tête, 1440×900, vraie IBM Plex Mono) : la
colonne `id` part, pour la raison qui l'a fait partir de l'index ; `fires` porte une date **et pas
d'heure**, parce qu'une alarme n'a d'heure nulle part dans le schéma et que le `09:00` de la maquette
est une précision que rien ne peut produire ; et les colonnes sont dimensionnées à leur contenu — les
96px de `act` coupaient la paire de boutons de 34. La jauge suit le **cycle** de l'alarme,
`(frequency - days) / frequency`, et non le `100 - days * 12` de la maquette, qui est une pente sans
source. Deux défauts trouvés dans la même passe : sous le pli l'en-tête était collé aux deux bords de
la carte alors que les lignes sont rentrées de 12, et la barre de commande repliait l'horloge sur
trois lignes avant de l'élider.

⚠️ **Une horloge qui tourne, et le §8.1 ne l'interdit pas.** Ce qu'il interdit, ce sont les lectures
**inventées** — `uptime 04:12`, `IDX/2.4.1`. Celle-ci est l'heure du navigateur, et c'est ce qui rend
`T-00d` lisible. Posée dans un effet, donc pas de désaccord d'hydratation.

⚠️ **Trouvé en marge, sans rapport avec GRAPHITE : COS-331.** En cherchant de quoi vérifier la requête
SQL contre la base de dev, on tombe sur des secrets en clair restés dans l'**historique git** d'un
dépôt public. Le fichier a été retiré du suivi, ce qui ne retire pas ce qu'il contenait. Rien de plus
n'est écrit ici : la spec est commitée sur ce dépôt.

⚠️ **UI 10 a emporté le dernier écran legacy, et l'arbre qui ne tenait que par lui.** L'édition était
un écran construit sur le formulaire de création avec un `id` en prop et une demi-douzaine d'effets ;
c'est une modale portée par une route, et la route d'édition n'a pas disparu, elle est devenue le
repli plein écran. Le marqueur d'interception a été **vérifié** avant d'écrire le reste, avec une
paire de routes jetables et un vrai lien client : `(.)` matche. Le `[...catchAll]` qui vide le slot
n'est pas optionnel, comme le ticket l'annonçait. Sont partis avec : l'ancien layout, ses barres
d'outils et de tri, `components/common`, les deux stores zustand et deux hooks. Le contrôleur d'édition
est réécrit — deux cents lignes de branches imbriquées deviennent une transaction et quatre fonctions
— et trois défauts avec lui : la comparaison d'alarme opposait un objet à une chaîne, donc chaque
sauvegarde recréait l'alarme et remettait son compte à rebours à zéro ; celle des catégories était
stricte entre un nombre et une chaîne, donc chaque sauvegarde supprimait puis réinsérait tous les
tags ; et le record était chargé **par id seul**, il est porté par la session et un manque est un 404.

⚠️ **Trois écarts au handoff sur UI 10**, tous mesurés : la capture est `compact` dans le formulaire
— le bloc de 146px rendu en entier dans une modale de 680 remplissait le viewport en 1440×900 et
mettait le pied hors d'atteinte ; l'en-tête **passe à la ligne** au lieu de masquer son groupe droit,
puisque `gr-hide-sm` vit dans une requête de conteneur et qu'une modale portalisée est hors du
conteneur ; et le repli plein écran est ce même panneau de 680px centré, plutôt qu'une carte large
comme le bureau avec 760px de gris vide à côté d'une colonne de 640.

⚠️ **La relecture d'UI 10 a trouvé deux défauts dans `ui/dialog`, donc dans les trois modales.** Ils
sont écrits au §7 et au §11 du DS ; l'essentiel ici est ce que chacun laisse comme règle.
**COS-341** : le panneau était le conteneur de défilement et l'en-tête et les pieds se réépinglaient
pour compenser — le panneau est une colonne, le corps est le scroller. La règle : *un conteneur de
défilement doit être le bloc contenant de ce qu'il fait défiler*. Sans `relative` sur le corps, un
descendant en `sr-only` — qui est du positionnement absolu — échappait à sa découpe, et le clavier,
qui fait défiler n'importe quel ancêtre y compris un `overflow` caché, tirait l'en-tête 238px au-dessus
du haut de la fenêtre sans retour possible. Rien ne le dessinait ; c'est une passe sur les 23 arrêts
de tabulation du formulaire qui l'a sorti. **COS-342** : la racine du screen porte la famille *et* la
taille, le portail n'avait rattrapé que la famille en COS-321. La règle : *ce qui portalise a besoin
des deux*, et un composant de champ déclare sa propre taille au lieu de l'hériter — corrigé par le
haut et par le bas, exprès.

⚠️ **Et une règle de typographie que rien n'avait écrite : un glyphe se dimensionne à son encre, une
lettre à son em.** Les actions de la ligne d'index étaient à la taille que le handoff leur donne et
sortaient plus petites que le texte à côté. Aucun de ces glyphes ne vient de Plex Mono : `next/font`
charge le sous-ensemble `latin`, qui s'arrête à U+00FF, donc **toute flèche et tout symbole de l'app
sont dessinés par la police système**, dont l'encre est une fraction de l'em — à 12px, `↗` encre
5,07px, sous la hauteur d'x de la ligne de 11px qu'il accompagne. Ce n'est pas le repli en soi : les
`◔` et `◨` de la même ligne en viennent aussi et encrent 7,2px. Les deux nombres ne coïncident que
dans le sous-ensemble chargé, et aucun glyphe de ce design n'y est. Dans la même passe, `⌧` devient
`✕` — U+2327 dessine un X dans un rectangle, indiscernable à cette taille du carré qu'un navigateur
peint pour un glyphe absent — et la bande d'actions part du bord gauche de la colonne `added`, si bien
que le survol **échange** au lieu de déplacer. **COS-344**, ouvert après le merge : la passe est
sortie d'une relecture de la ligne et non d'un rapport, et le ticket existe pour la règle, qui vaut
pour toute l'app. Deux choses qu'il écarte explicitement — élargir le sous-ensemble de police, qui est
une décision de chargement touchant chaque page, et généraliser la taille aux autres glyphes sans les
mesurer, ce qui casserait les `◔` et `◨` qui sortent justes.

⚠️ **UI 11 était à moitié livré avant d'être pris, et la moitié qui restait n'était pas celle que le
ticket met en avant.** Le chemin 1 — les trois actions au survol et la confirmation en place — est
arrivé avec l'index (COS-299), puis a été replacé et redimensionné par COS-326 et COS-344. Ce que ce
ticket a écrit, c'est le chemin 2 : la modale, et son remplacement des **deux** paires en place que
la fiche et le formulaire d'édition portaient comme passerelles annoncées. Le partage tient toujours
au même arbitrage : on confirme en place quand la ligne qui va disparaître est sous le curseur, et
dans un panneau quand ce qui disparaît *est* l'écran derrière la question. La ligne d'index n'appelle
donc pas `DeleteConfirm`, exprès.

⚠️ **`ui/alert-dialog` a été réécrit, pas habillé.** Il était resté en shadcn de série — texte centré,
boîte `p-5`, emplacement d'icône au-dessus du titre — alors que la confirmation du handoff a
l'anatomie de `ui/dialog` : en-tête `.gr-cmd`, corps, pied sur `--panel-2`. UI 11 en est le premier
consommateur, donc rien à migrer : le fichier est devenu `ui/dialog` à 440px au lieu d'un second
langage de modale à côté du premier. Les tokens oxyde que DS 01 avait posés « pour UI 11 » servent
enfin, et une seule fois — la variante `danger-solid` du bouton.

⚠️ **Une règle générale sortie d'une mesure, et elle ne parle pas de suppression : un garde qui lit
l'état de rendu doit s'exécuter avant ce qui va changer cet état dans le même événement.** Les deux
coques du formulaire d'édition taisent leurs raccourcis `window` pendant la confirmation — `⌘↵` pour
ne pas sauvegarder l'enregistrement qu'on demande de détruire, et `esc` sur la coque plein écran, qui
est celui qui l'a rendu nécessaire. Écrit d'abord en phase de bouillonnement, **mesuré en échec** :
Radix écoute `esc` sur `document` en phase de capture, et React 19 vide une mise à jour discrète *et*
rejoue l'effet **de façon synchrone, dans le même événement**. L'écouteur atteint au bouillonnement
était donc une fermeture neuve portant `confirm === "none"`, et laissait passer la touche — une seule
pression fermait la modale *et* quittait l'écran derrière. Sondé au CDP en imprimant l'état aux quatre
phases : `window-capture` et `document-capture` lisent encore `remove`, `window-bubble` lit `none`
alors que le panneau est toujours à l'écran. Interroger le DOM à la place — l'astuce de l'index pour
`⌥F` — échoue pareil et pire : au bouillonnement le nœud n'est encore là que parce que son animation
de sortie joue. `capture: true` est le correctif.

⚠️ **La suppression est douce et la copie dit « cannot be undone ».** Le contrôleur bascule
`active=0` ; les deux requêtes de liste qui doivent le savoir filtrent bien sur `b.active = 1`
(COS-304 avait corrigé celle des alarmes pour cette raison exacte). La phrase reste vraie de
l'application — rien ne liste ni ne restaure une ligne inactive — et c'est la copie du handoff.
La lecture de la fiche, elle, ne filtre toujours pas, et la question d'autorisation que le même
fichier posait est tranchée juste après, par **COS-322** ci-dessous.

⚠️ **COS-322 s'appelle « les contrôleurs de liste » et ce n'est pas là qu'était le pire.** Les trois
listes cadraient bien leurs lignes — sur `?userID=`, c'est-à-dire sur la parole du client, ce qui est
le titre du ticket. Les deux contrôleurs que le ticket demandait seulement de « vérifier au passage »,
la fiche et la suppression, ne cadraient **rien du tout** : un identifiant suffisait, et ce sont des
petits entiers. Le correctif n'y est donc pas « lire l'identité au bon endroit » mais « lire
l'identité ». Un sixième site que le ticket ne nommait pas est venu avec : sur la route du
screenshot, le paramètre ne choisissait pas des lignes mais **un dossier sur le disque**, moitié que
le `basename` de COS-295 ne pouvait pas couvrir.

⚠️ **Le paramètre reste sur le fil, validé et ignoré — et c'est ce qui fait tenir le correctif d'un
seul côté.** Le front continue d'envoyer ce qu'il a toujours envoyé, donc aucune clé react-query ne
change de forme et le diff côté client est **entièrement en commentaires**. Le retirer est un
changement de contrat, et il revient à DATA 01 (COS-306), qui réécrit déjà ces chaînes de requête en
objet de filtres — **fait, voir plus bas**. Même arbitrage sur la fiche : elle répond `200` avec `[]` là où l'édition et la
suppression répondent `404`. Les deux sont également muettes — un enregistrement d'un autre compte et
un identifiant que personne n'a utilisé partagent la réponse dans les deux cas — mais `[]` est ce que
cette route a toujours dit, et `useBookmarkRecord` l'affiche déjà comme `missing`. Aligner les trois
routes sur un seul code se fera avec le ticket qui touche déjà au client.

⚠️ **Vérifié en exécutant les deux versions, pas en relisant le diff.** Deux comptes jetables créés
par l'API, un enregistrement chacun avec catégorie, alarme et screenshot, puis la matrice complète :
sur `HEAD`, A lit la fiche de B, supprime la ligne de B et récupère l'image de B ; avec le correctif,
les sept contrôles basculent et les neuf contrôles de non-régression tiennent. Les comptes ont été
effacés ensuite — la base est revenue à ses 11 utilisateurs et 1 331 enregistrements. Un test qui
passe des deux côtés ne prouve rien : c'est la passe sur `HEAD` qui dit que celui-ci mesure quelque
chose.

**Deux tickets ouverts en route**, référencés par leur numéro seul — ils sont ouverts, et le dépôt
est public (règle en tête du §6) : **COS-345** et **COS-346**. Le premier est un axe de la même
famille que ce ticket, trouvé par l'audit qui l'accompagnait, et il a de la donnée déjà en base ;
le second est une bombe à retardement de déploiement, sans rapport avec la sécurité.

✅ **COS-346 est fait, et sa description était écrite au mauvais temps.** Le fichier
`getScreenshotcontroller.js` est requis en `getScreenshotController` depuis le commit qui a créé les
deux (20/08/2023) : APFS résout, ext4 non, et le `require` étant en tête du routeur des bookmarks,
c'est le démarrage du serveur qui tombe. Le ticket disait « le serveur ne démarre pas », au présent,
ce qui se lit comme une panne en cours — **il n'y en a pas eu** : le premier déploiement de la refonte
n'a pas encore eu lieu, donc cette ligne n'a jamais tourné ailleurs que sur des machines qui ne
peuvent pas la voir échouer. Elle mordrait à ce déploiement-là, et c'est tout ce qu'elle a jamais
menacé de faire.

**Vérifié plutôt que déduit**, parce que c'est précisément le genre de défaut qu'une machine de dev ne
sait pas montrer : un volume APFS **sensible à la casse** a été monté, le code y a été copié, le
routeur chargé dessus. Avec le nom d'avant, `Cannot find module` ; après le renommage, les quatre
routeurs chargent.

**Et le garde-fou qui manquait, en une trentaine de lignes.** `backend/scripts/check-require-paths.js`
relit les 97 `require` relatifs du back et refuse celui dont la casse ne correspond pas au fichier ;
il tourne dans `pnpm lint`. Le front avait déjà ce filet **gratuitement** — une casse fausse fait
échouer `next build`, qui est sur le chemin de la production — là où le back est déployé en source et
démarré par pm2, sans une seule étape qui relise ces chemins entre le poste de dev et le serveur.
C'est ce qui explique qu'un écart d'un caractère ait tenu trois ans, et ce qui fait que le renommage
seul n'aurait rien appris.

✅ **COS-345 est fait, et il se décrit maintenant qu'il est fermé** — la règle du §6 vise les tickets
de sécurité **ouverts**, comme COS-295 et COS-322 se décrivent depuis qu'ils sont livrés. Le ticket
est l'angle mort de COS-322, énoncé en une phrase : **le cadrage arrête les lignes, la jointure
ramène des colonnes à côté d'elles.** `bookmark_category` ne porte pas de propriétaire, donc un lien
vers la catégorie d'un autre compte concaténait son nom *et sa couleur* dans la réponse, et gonflait
au passage le compteur d'enregistrements de son propriétaire légitime.

**Quatre jointures cadrées, là où le ticket en listait trois.** L'index, la fiche et les catégories
sont celles qu'il nomme ; la quatrième est l'**export**, livré par COS-333 le lendemain de l'écriture
du ticket, qui a hérité de la jointure entière, prédicat manquant compris. C'est le pire endroit pour
elle : un export est un fichier qu'on garde, donc le nom d'un inconnu y aurait été *recopié* plutôt
que montré une fois. Le prédicat est dans la condition de jointure et non au `WHERE`, pour la raison
que `getCategoriesController` écrit déjà en tête : au `WHERE`, la jointure externe devient interne et
les catégories vides — huit en base — disparaissent avec les fiches sans étiquette.

**Côté écriture, l'identifiant était une parole.** La clé étrangère demande que la catégorie existe,
jamais qu'elle soit à vous, et l'entier arrivait du formulaire par deux portes, `id` et `value`,
vérifiées sur le seul fait d'être des nombres. Les deux sont maintenant confrontées au propriétaire
de la fiche, qui vient de la session. Deux détails de placement portent tout le correctif : au `POST`
la vérification passe **avant le premier `INSERT`** et non à côté du lien qu'elle garde, parce que ce
chemin n'a pas de transaction — c'est COS-353 — et qu'un refus levé plus bas aurait répondu 404 en
laissant derrière lui une alarme, une url et une fiche ; au `PUT` elle est levée **dans** la
transaction, pour que le titre et les notes écrits au-dessus repartent avec, et le `catch` lit
`err.status`, la convention qu'`errorHandlerMiddleware` utilise déjà, au lieu d'aplatir la décision
en 500.

**Mesuré sur la base de dev, et les six liens du ticket se décomposent.** Ils sont 4 sur deux fiches
actives et 2 sur une fiche en corbeille — ce qui explique que le compteur de catégories du compte
visé passe de 1 961 à 1 957, exactement les quatre liens actifs, `COUNT(DISTINCT)` et `b.active = 1`
absorbant les deux autres. Les 1 957 étiquettes du plus gros compte ne bougent pas d'une, les deux
comptes concernés perdent exactement les étrangères, et les huit catégories vides sont toujours
listées à `0` : la jointure externe est restée externe, ce qui était le seul risque de régression.
Les deux contrôleurs d'écriture ont ensuite été **pilotés de bout en bout** sur une fiche jetable
créée et supprimée dans la même passe — 13 contrôles, tous verts : 404 par chacune des deux portes,
titre et notes intacts après le rollback, aucun lien écrit, le contrôle positif qui sauve et lie
comme avant, et le `POST` refusé qui ne crée ni fiche, ni url, ni alarme.

**Deux choses laissées en place, et les deux par arbitrage.** Les six liens cessent d'afficher leur
catégorie mais restent pendants : ce que l'on en fait est la décision de donnée que le ticket renvoie
à **COS-336**, qui touche déjà cette table. Et le filtre par catégorie accepte encore l'identifiant
d'une catégorie étrangère — il ne rend que les fiches de l'appelant, donc il ne divulgue rien, et le
resserrer sans motif aurait été élargir le ticket.

✅ **AUTH 05 est fait, et la passphrase a enfin où être dépensée.** UI 02 la collecte depuis COS-298
et rien ne la consommait ; `/recover` et `POST /users/recover` sont ce qui rend le champ utile. Sur
la route, **l'ordre des trois middlewares est la posture** et non un détail : `validate` d'abord,
pour que le compteur soit indexé sur une adresse déjà bornée par zod ; `rateLimit` ensuite, pour
qu'une tentative soit comptée avant qu'un seul `bcrypt` ne soit payé ; le contrôleur en dernier.

⚠️ **Une seule réponse pour trois échecs, et c'est la moitié chronométrée qui se rate.** Adresse
inconnue, passphrase fausse, colonne encore à `NULL` : même 401, même phrase — et **même durée**.
Sortir tôt sur une adresse qui n'existe pas répondrait en une milliseconde là où une vraie coûte les
~100 ms d'un `bcrypt` au coût 10, ce qui est un oracle de comptes qui se lit au chronomètre. La
comparaison tourne donc toujours, contre un hash leurre fabriqué au chargement — et il doit être
**valide**, parce que `bcrypt.compare` refuse un hash malformé immédiatement et rend l'écart tel
quel. Mesuré : 118 ms pour une adresse connue, 123 ms pour une inconnue.

**Aucune session n'est ouverte, et les sessions du compte tombent après l'`UPDATE`.** Connecter
quelqu'un sur la foi du secret qu'il vient de déclarer perdu est le raccourci que cette
fonctionnalité existe pour ne pas prendre : la réponse est un 200 nu et l'écran ressort par
`/login`. L'ordre compte dans l'autre sens aussi — tombées d'abord, un `UPDATE` qui échouait ensuite
aurait déconnecté le propriétaire d'un compte dont le mot de passe n'a pas changé.

**Le limiteur de débit est neuf, parce qu'il n'y en avait aucun** — et pfa n'en a pas non plus à
reporter. Écrit sur le Redis qui porte déjà les sessions plutôt que sur deux dépendances : `INCR` +
`EXPIRE`, fenêtre fixe, **cinq tentatives par adresse et vingt par source sur un quart d'heure**.
Deux quotas parce que l'un seul se contourne en faisant tourner l'autre. Ses clés sont sous
`bkmk-rl:` et non `bkmk:` : `clearSessionsForUser` balaye le second et `JSON.parse` tout ce qu'il y
trouve.

**Côté écran, le handoff ne dessine ni cette page ni le lien qui y mène** — il est antérieur à la
décision d'abandonner l'email — donc il n'y a rien ici dont s'écarter : `/recover` reprend les
proportions de la connexion. `forgot key?` va **dans la barre d'action** de la carte de connexion,
là où UI 01 avait retiré un `/forgotPassword` sans page derrière, et c'est une mesure qui le place :
la carte fait **216 px avec le lien et 216 px sans**, sur une barre de 30 px qui reste sur une
ligne. `/recover` fait 480 × 329, sans débordement horizontal, et sa paire de clés replie sur une
colonne à 480.

**Vérifié en lançant le serveur** : 15 contrôles en HTTP sur des comptes jetables créés et supprimés
dans la même passe — les trois refus identiques, une passphrase de moins de 20 caractères refusée
par `validate` *sans* être comptée, la colonne réellement réécrite, aucun `csrfToken` dans le corps,
la session effacée de Redis, et `401 401 401 401 401 429` avec 900 s de TTL derrière.

✅ **DATA 05 est fait, et deux de ses trois parties étaient des soustractions.**

**Les compteurs du rail n'ont rien demandé au back.** `bookmarks_count` est sur chaque ligne depuis
COS-300 — la modale de filtres classe son sélecteur avec — et le rail ne le lisait simplement pas.
Ce qui manquait vraiment, c'est le nombre de la ligne `all` : le `total` de l'index est celui de la
**requête en cours**, donc affiché sur `all` il aurait dit 188 dès qu'une catégorie est choisie.
D'où `GET /bookmarks/stats`, et le départ de `countedRow`, qui n'existait que pour décider à quelle
ligne unique le seul nombre disponible appartenait.

**Le bloc `storage` arrive sans sa troisième ligne.** `shots 24/1278` et sa jauge sont deux comptes
sur l'index entier — même raison qu'au-dessus : un ratio de captures dont le dénominateur suit le
filtre mesure le filtre. `db 1.4 mb` est de la déco et part comme `uptime` et `IDX/2.4.1` au §8.1,
sur arbitrage du propriétaire ; le contrôleur consigne les trois choses que ce nombre aurait pu
vouloir dire et pourquoi aucune ne vaut une ligne dans un rail aussi dense.

⚠️ **La charge des 14 jours est un déplacement, pas un dé-mock, et le ticket le disait.** UI 08
comptait déjà de vraies alarmes, correctement, dans le navigateur — `GET /reminders` renvoie tout
sans pagination, donc le client tenait l'ensemble complet. Ce qu'il ne survit pas, c'est que cela
cesse d'être vrai : la liste paginée, le graphique aurait continué à dessiner quatorze barres en
n'en comptant qu'une page. La règle est inchangée et devient du SQL — une alarme est une répétition,
donc `MOD(offset - days_until, frequency) = 0` en est la totalité — et les offsets viennent d'une
CTE récursive, ce qui garantit quatorze lignes quelle que soit la donnée, y compris un compte sans
rien d'armé. `alarmLoad.ts` et `alarmsToday` partent avec ; le second ne servait qu'à retrouver le
`CURDATE()` du serveur par soustraction.

**Deux choses demandées par le ticket ne sont pas là**, les deux parce qu'il a été dépassé : le bloc
`system` de l'About a été retiré par UI 09 (COS-305) **après** son écriture — « none of that is this
page's job » — donc il n'est pas ressuscité, et la ligne `db` ci-dessus.

**Mesuré, et le contrôle qui compte est une égalité :** sur le vrai index, les quatorze barres
calculées par le serveur sont identiques **barre pour barre** à l'algorithme client supprimé —
`3,4,4,3,3,3,4,3,3,5,3,4,3,4`. Avec : `records` ignore la corbeille, `shots` ignore la capture d'une
fiche supprimée, un compte sans alarme garde ses quatorze lignes à zéro, et la première barre est
bien le `CURDATE()` du serveur.

⚠️ **Le rendu n'a pas été vérifié, et c'est écrit ici parce que ça ne se voit pas dans le diff.**
Chrome 150 refuse en headless qu'une page sur un port localhost en appelle un autre ; ni les
drapeaux ni un proxy même-origine n'en sont venus à bout, donc les écrans privés n'ont pas été
regardés. Le risque est nommé : le rail est une colonne flex dont seul le milieu défile, ce ticket y
ajoute un troisième bloc, et le `shrink-0` qui doit tenir la liste de catégories est **raisonné et
non mesuré**.

**Relevé au passage, pour COS-336 :** `category.name` porte une clé unique **globale**, pas
`(user_id, name)` — deux comptes ne peuvent pas avoir une catégorie du même nom. La description du
ticket parle de doublons à l'intérieur d'un compte ; le problème mord aussi entre eux.

✅ **COS-329 est fait, et il s'est réduit à un tiers de lui-même — deux fois, et jamais par
manque de temps.**

Le ticket portait trois dé-mocks d'ampleurs très inégales. Les doublons étaient déjà soldés par
COS-308. La capture automatique est un navigateur sans tête, une file et un worker : elle est partie
en **COS-393** — ⚠️ **annulé depuis, et retiré de l'écran par COS-394** : le propriétaire continue de
faire les captures à la main. Reste ce qui est livré : le titre lu dans le `<title>` de la page, sur
`GET /bookmarks/page-title`. Le
placeholder du champ redevient les mots du handoff, `auto-fetched from <title>`, que UI 06 avait
refusés faute de pouvoir les tenir.

⚠️ **C'est la seule route de bkmk qui fait ouvrir au serveur une connexion vers une adresse choisie
par l'appelant**, donc elle est bornée des deux côtés. `http`/`https` seuls ; l'adresse est résolue et
vérifiée **avant chaque requête** et non seulement la première, les redirections étant suivies à la
main sur trois sauts au plus — un hôte public a tout loisir de répondre 302 vers l'autre côté du
pare-feu, et `fetch` l'aurait suivi sans que personne regarde. Loopback, privées, lien-local, CGNAT et
multicast sont refusées. Cinq secondes, un mégaoctet, lecture arrêtée à `</head>`, et un quota de
soixante par cinq minutes **par session** plutôt que par adresse : un foyer, c'est une adresse et
plusieurs personnes. La course DNS résiduelle est écrite dans l'en-tête du helper plutôt que passée
sous silence.

**Deux mesures ont changé le code avant qu'il soit figé.** Le plafond de lecture était 256 Ko : le
`<title>` d'une page YouTube est à l'octet **685 990**, derrière 696 Ko de configuration en ligne.
À l'ancien chiffre, l'hôte qui représente 963 des 1 331 fiches de l'index — celui pour qui ça compte
le plus — revenait sans titre. Et une réponse qui n'est pas `ok` ne rend **jamais** son titre :
`stackoverflow.com` et `etsy.com` répondent 403 à ce fetcher avec un corps titré `Just a moment...`,
soit précisément la chaîne qui ne doit atterrir dans aucune fiche. Le champ vide est la meilleure
réponse, et l'écran écrit `no title found` pour qu'un hôte qui refuse ne se confonde pas avec une
fonctionnalité cassée.

⚠️ **Un `useMutation` et pas un `useQuery`, et c'est la décision de façade la plus importante.** Une
query se relance seule au remontage, au retour sur l'onglet et à la reconnexion — c'est la forme la
plus proche d'un fetch automatique qui pouvait se glisser sur cet écran, et le propriétaire a demandé
explicitement qu'il n'y en ait aucun. Trois gardes en plus : le titre est vide, l'url parse, et cette
url n'a pas déjà été demandée. La réponse est **re-confrontée au champ quand elle arrive**, parce que
le geste naturel est de tabuler dans le titre et de taper : un fetch qui arrive second ne doit pas
reprendre le champ.

⚠️ **La favicon a été construite sur ce fetcher, puis retirée — et c'est la partie à ne pas rouvrir
sans relire ce paragraphe.** Le ticket la repliait ici, à bon droit sur la forme : le `<head>` qui
donne le titre est celui qui nomme l'icône, donc un ticket séparé aurait voulu dire deux fetchers.
Ce qui l'a tuée est une mesure. Le ticket affirme qu'« une favicon de 16 px par ligne est l'aide au
balayage la plus forte disponible sur une table mono de 22 lignes » ; l'index dit **1 331 fiches,
1 241 avec un hôte, 160 hôtes distincts, dont `youtube.com` 963 — 78 %**. La colonne aurait dessiné la
même marque sur ~17 lignes sur 22. Le chiffre se lit dans les deux sens — un champ uniforme fait
ressortir l'exception — d'où un arbitrage plutôt qu'une décision unilatérale ; la réponse a été de
jeter. Ce qui a été écrit puis supprimé, pour qui reprendrait : un store à clé d'**hôte** (160
téléchargements et non 1 331), sa table, un décodeur de conteneur ICO — quatre hôtes sur dix mesurés
servent un PNG nu sous `image/x-icon`, quatre servent du DIB 32bpp à 5–17 Ko contre ~700 o une fois
décodé — un backfill des 160 hôtes, et une carte de favicons sur chaque réponse d'index. Le compte est
gardé en tête de `helpers/fetchPageTitle.js`.

**Vérifié :** dix hôtes réels (huit titres corrects dont YouTube et un repli `og:title`, deux `null`
sur les 403) ; quatorze cas de garde d'adresse, toutes les plages privées refusées **en 0 ms sans
requête sortante**, `172.32.0.1` et les adresses publiques passant ; la route en session à 200 / `null`
/ 400 ; le quota à 60 puis 429 au compte exact ; et l'écran piloté en Chrome sans tête (remplissage au
blur, `no title found`, non-écrasement d'un titre déjà tapé).

⚠️ **La QA visuelle n'est pas faite**, même empêchement que d'habitude : le jugement sur les deux
nouvelles lectures à côté du libellé `title` revient au propriétaire.

⚠️ **Aucun cron, aucun lot, aucune tâche de fond**, vérifié à la demande : le fetch sortant a une
seule entrée et c'est un `onBlur`. Le seul ordonnanceur du dépôt reste `cron/cron-mysql.js`, le dump
MySQL, antérieur et non touché.

⚠️ **DATA 01 était déjà livré à 90 %, et le reliquat ne ressemblait pas à son titre.** La pagination
serveur, l'objet de filtres à six champs et la sérialisation vers l'expression de la barre de commande
sont arrivés avec UI 03 et UI 04 ; ce que le ticket gardait vraiment, c'était le compte de pages fait
côté client (`Math.ceil(total / ROWS_BY_PAGE)`) et le retrait de `?userID=` que COS-322 lui avait
laissé. Deux petits chantiers, un seul ticket, et le titre de Linear ne le disait plus.

⚠️ **La taille de page existait deux fois : dans la requête et dans la division.** Seule la requête
décide combien de lignes reviennent, donc le pager affichait le bon nombre par accord et non par
construction — un client demandant 50 lignes aurait été paginé comme s'il en avait demandé 22, avec un
nombre faux plutôt qu'absent. La réponse est maintenant `{ rows, total, page, pageCount }` : `total`
remplace `total_count`, `pageCount` est compté sur le `rows` que la requête a effectivement demandé,
et `page` est l'écho de la valeur **validée**, pas de la chaîne reçue. `Math.max(1, …)` tient l'index
vide à une page — zéro enregistrement, c'est une page qui ne montre rien, pas zéro page, et
`page 00/00` se lit comme un pager cassé. `ROWS_BY_PAGE` reste côté client pour le compteur
`rows 001–022 of 312`, qui est de l'arithmétique sur la page demandée et non un second avis.

⚠️ **Retirer `?userID=` n'est pas le rejeter, et c'est ce qui permet aux deux côtés de partir
ensemble sans se tenir la main.** `z.object` ignore les clés inconnues : un onglet resté ouvert qui
envoie encore le paramètre est servi exactement comme avant. Vérifié dans les deux sens. Deux routes y
ont perdu leur `validate()` — `/categories` et `/reminders` ne prennent plus **aucune entrée**, et un
`z.object({})` est un middleware qui n'a plus que l'apparence d'un contrôle. Le schéma du screenshot,
lui, garde ce qui compte : sans nom de fichier ou avec un `../`, c'est toujours 400.

⚠️ **Un seul changement de comportement, et il était déjà connu :** `getBookmarksController` lit
maintenant *tous* ses champs dans `req.validated.query`, ce que le commentaire de COS-318 annonçait
comme le travail du lot DATA. Les valeurs sont les mêmes sauf `stars`, qui arrive en nombre au lieu de
la chaîne `"0"` — et `if ("0")` est vrai, donc `?stars=0` ajoutait un `b.stars >= 0` inoffensif. Même
famille que le bug que `queryFlagSchema` avait été écrit pour fermer.

⚠️ **Vérifié en exécutant les deux versions, là encore.** Un compte jetable, sept enregistrements,
33 contrôles : la forme de la réponse, `pageCount` sur cinq tailles de page, la dernière page courte,
un index filtré, les trois routes sans `?userID=`, le client périmé, et ce que le schéma refuse
toujours. Sur `HEAD` le premier appel répond **400** — le paramètre y était *requis*, ce qui est la
moitié intéressante de la mesure. Compte effacé ensuite, base revenue à ses 11 utilisateurs et
1 331 enregistrements. Le rendu du pager n'a pas été regardé dans un navigateur : l'extension Chrome
n'était pas connectée. `tsc`, Biome et `next build` passent, et `pageCount` est une prop typée.

⚠️ **DATA 02 avait deux fourches, et c'est le propriétaire qui les a tranchées avant qu'une ligne
soit écrite.** Le ticket lui-même le demandait pour la première : compter des doublons suppose une
définition de « même url », et `url.original` n'a aucune forme normale — `https://x.com/a`,
`http://x.com/a/` et la même adresse avec un `?utm_source=` sont trois lignes. **Dédupe sur chaîne
exacte, assumée**, plutôt que prendre COS-332 puis COS-338 avant ; le helper `markImportDuplicates`
est le seul endroit qui répond à la question, donc DATA 09 changera un fichier. ✅ **Vérifié depuis** :
COS-338 a bien changé ce seul fichier — deux lignes, la colonne lue et la clé comparée. Seconde fourche :
`last import` n'a aucun stockage et `N skipped` ne se déduit d'aucune colonne — **une table
`import_run` et sa migration**, plutôt que laisser la ligne mockée dans un ticket de-mock à part.

⚠️ **Le staging tient sans état côté serveur : le fichier repart avec le commit.** Le ticket décrit
un commit « prenant les entrées retenues » ; il prend le fichier et les deux options qui décident ce
qui est retenu, ce qui est le même ensemble — l'écran n'a pas de sélection par ligne, donc les
options *sont* la sélection. Renvoyer les entrées voulait dire un corps JSON de quelques centaines de
ko contre les 100 ko par défaut d'`express.json()`, relevés pour toute l'application afin de
transporter une donnée que le serveur vient de produire et qu'il devrait revérifier de toute façon —
un `state` envoyé par le client est un `state` que le client a pu écrire. Le parse est déterministe :
la seconde lecture du même fichier redonne ce que l'aperçu montrait.

⚠️ **Le parser existait deux fois et c'est ce ticket qui l'a promis puis fait.** `parseImport.ts`
mirait `uploadBookmarksController` ligne à ligne depuis UI 07, avec un en-tête disant que DATA 02 le
supprimerait. Les deux sont partis : il reste
`controllers/bookmarks/helpers/parseImportFile.js`, appelé par le parse **et** par le commit.
`POST /bookmarks/upload` disparaît avec eux, et `anyascii.js` — 1 238 lignes de table de
translittération — tombe avec son unique appelant.

⚠️ **Le titre est stocké tel qu'il se lit dans le fichier, et c'est un changement de comportement
assumé.** L'ancien contrôleur écrivait `encodeURIComponent(anyASCII(title))` : c'est le premier des
trois constats du §10.1, celui qui fait que toute recherche contenant une espace rate les lignes
importées, lesquelles sont l'essentiel de l'index. L'écran de création GRAPHITE stocke le titre brut
depuis COS-302, donc les deux chemins d'écriture sont alignés sur celui qui marche. Les 1 280 lignes
déjà en base ne sont pas touchées — c'est DATA 07 (COS-334) — mais son backfill n'a plus de source
neuve à rattraper.

⚠️ **Une transaction, là où il n'y en avait aucune.** L'ancien import répondait 500 à la première
ligne en échec, après avoir inséré toutes celles d'avant et sans dire lesquelles ; un import à moitié
fait ne peut pas être rejoué sans dupliquer la moitié atterrie. La ligne d'`import_run` est écrite
dans la même transaction, donc `last import` ne peut pas décrire un import annulé.

⚠️ **`capture shots` reste dessinée et désactivée, et son de-mock est COS-393** — c'était COS-329
jusqu'à ce que celui-ci se scinde, et ce n'est toujours pas un ticket neuf.
Rien nulle part ne capture une image depuis une url — le seul chemin vers la colonne `screenshot`
est un fichier déposé à la main — et l'API n'accepte pas le drapeau, exprès, pour qu'aucun appelant
ne croie l'inverse. Les deux autres options sont vivantes : `skip duplicates` filtre sur le `DUP`
recalculé au commit, `tag as imported` range les nouvelles lignes sous une catégorie `imported`
créée à la première utilisation. Règle du §0 appliquée : chercher le ticket existant avant d'en
ouvrir un.

❌ **Périmé depuis (COS-394) : la case n'est plus dessinée du tout.** COS-393 annulé, il n'y avait
plus de « un jour » pour la justifier — et l'argument qui la faisait montrer, celui du menu de compte
(COS-321 : montrer la ligne pour apprendre ce que l'écran fera, la griser plutôt que la laisser sans
effet), repose entièrement sur ce « un jour ». Un contrôle qui ne s'allumera jamais se lit comme
cassé, pas comme non construit. La ligne `capture not wired yet` part avec. **Le back n'a pas bougé** :
avoir refusé le drapeau plutôt que l'accepter en l'ignorant est exactement ce qui a rendu ce retrait
purement client.

⚠️ **Un fichier qui se répète est compté comme se répétant.** L'ensemble des urls connues grandit
pendant qu'on parcourt les entrées, donc la seconde occurrence d'une url *dans le même fichier* est
un doublon de la première. Un export pris deux fois et concaténé est le cas courant, et appeler les
deux copies « new » serait une promesse que `skip duplicates` ne peut pas tenir.

⚠️ **Vérifié en exécutant, deux fois plutôt qu'une.** Côté API, un compte jetable et 27 contrôles :
la branche csv prise sur un nom à points (le défaut de COS-303), les lignes illisibles comptées, les
états `NEW`/`DUP`, le fait que le parse **n'écrit rien**, l'import complet, le second parse où tout
est doublon, `skip duplicates` qui n'importe rien, la forme `.txt`, la catégorie `imported`, la ligne
`last import`, le fichier vide, l'absence de fichier, et `POST /bookmarks/upload` qui répond 404.
Puis l'écran lui-même, dans un Chrome sans tête en 1440×900 : fichier déposé par `DOM.setFileInputFiles`,
table lue dans le DOM (`4 entries parsed · 3 new · 1 duplicate · 1 malformed`, le `DUP` en oxyde),
option basculée, `send` cliqué, retour sur l'index à trois lignes toutes étiquetées `imported`, et la
ligne `last import 2026-08-01 · 3 entries · 1 skipped` au retour sur l'écran. Comptes effacés
ensuite : la base est revenue à ses 11 utilisateurs et 1 331 enregistrements, et `import_run` à zéro
ligne. `tsc`, Biome et `next build` passent.

**AUTH 02-03-04 ont partagé une seule branche**, trois commits, une PR : AUTH 02 coupe le JWT et
laisse l'application inutilisable jusqu'à ce qu'AUTH 04 bascule le client, donc la QA n'avait de sens
qu'à la fin du lot.

**Trois tickets ouverts en route**, qui n'étaient pas dans le découpage initial :

| Ticket | Pourquoi |
|---|---|
| COS-324 — AUTH 05, récupération par passphrase | L'écran et la route qui consomment ce que UI 02 collecte. Sans lui la passphrase ne sert à rien. |
| COS-325 — SEC, détail dans le ticket | Trouvé par une assertion de la QA d'UI 02, sur une ligne héritée. Pas un bug du code. |
| COS-321 — périmètre étendu | Le menu utilisateur devient la seule porte par laquelle les 11 comptes existants peuvent se donner une passphrase. |

⚠️ **Le déploiement n'a pas suivi le merge.** La box Kimsufi tourne encore le code d'avant le lot
AUTH : tant qu'elle n'est pas redéployée, la production garde le JWT en `localStorage` et le SQL
concaténé. Rien de ce lot n'est acquis en prod avant ce déploiement.

⚠️ **Et ce déploiement a maintenant deux étapes de base de données.** UI 02 ajoute une colonne
(`src/db/migrations/2026-07-30-add-user-recovery-passphrase.sql`) et DATA 02 une table
(`2026-08-01-add-import-run.sql`), toutes deux passées en dev seulement. Sans la première,
l'inscription répond 500 en production ; sans la seconde, un import répond 500 et **s'annule
entièrement** — la ligne d'historique est écrite dans la transaction qui insère les enregistrements.
⚠️ **Depuis COS-332, l'état ne se lit plus dans un tableau markdown mais dans la base** : au déploiement,
`pnpm migrate:status` puis `pnpm migrate` côté `backend/`, avant de redémarrer le process.

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

⚠️ **C'est COS-321 qui l'a remplacée, pas UI 09.** L'email n'est plus un lien mais le déclencheur du
menu de compte, dont `log out` poste `/users/logout` pendant que le jeton CSRF est encore en mémoire.
La page `(public)/logout` est supprimée. About n'a jamais porté de sortie de session : elle ne porte
que les mentions légales (voir UI 09 dans l'avancement).

**Le chrome d'auth réduit n'est pas fait** (`BKMK` + `auth` + `build 2.4.1 · tls on` + LED, README
§1). Le ticket porte sur les écrans **applicatifs** ; login et signup appartiennent à UI 01 / UI 02.
Idem pour About, qui est aujourd'hui dans `(public)` et n'a donc pas le shell : c'est COS-305 qui
décidera de son groupe de routes.

### Ce qui a été posé (COS-327 — le favicon, le 2026-07-31)

La marque vient du projet Claude Design « Favicon GRAPHITE », importée par le MCP `claude_design` :
trois lignes d'index sur le gris uni avec le marqueur teal de la ligne sélectionnée, soit la
signature de la table, aux tokens du thème (`#a3a4a0`, `#161715`, `#1d5b4f`).

**Trois fichiers, dans `src/app/`, par la convention de fichiers de l'App Router** — pas de
`metadata.icons` écrit à la main : Next lit `icon.svg`, `favicon.ico` et `apple-icon.png` posés à
côté de `layout.tsx`, émet les `<link>` avec le bon `type` et les bonnes `sizes`, et sert les
fichiers hashés. Le bloc `icons` de `layout.tsx` est donc **retiré** : le laisser aurait écrasé la
convention. Les six fichiers hérités de `public/images/` partent avec — les deux `android-chrome-*`
et les deux `favicon-{16,32}x{16,32}.png` n'étaient référencés nulle part (pas de `site.webmanifest`
dans le dépôt), seuls `favicon.ico` et `apple-touch-icon.png` étaient câblés.

**Le `.ico` est fabriqué, la source n'en fournit pas.** Il emballe les PNG **16, 32 et 48 du
designer tels quels** (conteneur ICO à charges PNG, format Vista+) plutôt que de re-rastériser le
SVG : le 16 est *retracé à la main* — barres sur pixels entiers, liseré retiré — et une
rastérisation l'aurait perdu. Charges vérifiées par CRC de chaque bloc PNG avant emballage, les
octets ayant transité par une transcription base64.

**Vérifié sur le serveur de dev** : les trois `<link>` sont émis (`favicon.ico` en `image/x-icon`,
`icon.svg` en `image/svg+xml` `sizes="any"`, `apple-icon.png` en 180×180) · les trois répondent 200,
**y compris `/favicon.ico` sans hash**, celui que les robots demandent en dur · les anciens chemins
`/images/*` répondent 404 et plus rien ne les demande · `tsc --noEmit` propre, lint front à 36 sans
occurrence de `layout.tsx`.

⚠️ **Pas de manifest, pas de PWA** : les `android-chrome-*` sont partis sans remplaçants. Et le SVG
ne porte **pas** de variante `prefers-color-scheme` — le gris moyen est prévu pour tenir sur un
onglet clair comme sombre, ce que la maquette du projet Claude Design montre côte à côte.

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

> ⚠️ **Règle d'écriture de cette section — le dépôt est public.** Ce qui est corrigé se documente
> ici, avec son correctif sous les yeux. **Ce qui est encore ouvert ne se décrit pas** : ni le
> mécanisme, ni le paramètre à modifier, ni la formulation « n'importe quel utilisateur peut… ».
> Une référence de ticket suffit, Linear étant privé. Idem pour toute adresse email réelle et tout
> compte de la base : jamais dans un fichier suivi, un message de commit ou un corps de PR.

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

**Au passage** : requêtes SQL paramétrées, sur l'ensemble du back et pas seulement la couche auth.
Fait en COS-295.

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

### Ce qui a été posé (COS-294, le 2026-07-30)

`backend/src/auth/` : `csrfToken.js` (port fonction pour fonction de
`pfa/nest-api/src/users/csrf-token.util.ts`), `csrfMiddleware.js` (port de `csrf.guard.ts`),
`sessionAuthMiddleware.js` (port de `session-auth.guard.ts`), `constants.js` (nom du cookie + TTL,
partagés entre `server.js` et le logout). Trois contrôleurs `users` de plus (`getMeController`,
`getCsrfController`, `logoutController`), `signInHelper.js` réécrit. **Les deux copies de
`checkToken.js` sont supprimées et `jsonwebtoken` retiré des dépendances.**

⚠️ **L'application front ne fonctionne plus jusqu'à AUTH 04 (COS-296), et c'est le ticket qui le
demande.** Elle envoie encore `Authorization: Bearer` depuis `localStorage` et n'envoie pas le cookie
(`withCredentials` manque), donc toute route protégée répond 401. C'est le prix du « retrait du JWT »
inscrit au titre de COS-294 : contrairement à AUTH 01, ce ticket n'est pas neutre. Le lot doit être
terminé avant de reprendre la QA visuelle.

**La politique d'auth est déclarée par routeur, pas globalement.** `router.use(sessionAuthMiddleware,
csrfMiddleware)` en tête de `bookmarks.js`, `categories.js` et `reminders.js` — la traduction du
`UseGuards(SessionAuthGuard, CsrfGuard)` que pfa pose sur chaque contrôleur. Une route ajoutée plus
tard en hérite et ne peut plus l'oublier, ce que le `checkToken` répété ligne par ligne ne promettait
pas. **Un montage global aurait été un piège** : il couvrirait aussi les deux routes publiques, et
demanderait alors un jeton CSRF à un visiteur déjà connecté qui resoumet le formulaire de connexion —
exactement le cas que la seconde exemption du middleware existe pour laisser passer. `users.js` garde
donc ses middlewares route par route, comme pfa.

**Les non-authentifiés reçoivent 401**, là où `checkToken` renvoyait 200 avec `{ success: false }`.

**`req.user` remplace `req.decoded`**, dont le nom ne voulait dire quelque chose que pour un JWT
décodé. Les trois contrôleurs qui le lisaient (`postBookmark`, `editBookmark`, `uploadBookmarks`) sont
mis à jour.

**L'identifiant de session est stocké en chaîne** (`String(user.id)`). Les helpers portés de pfa
testent `typeof userId === "string"` ; avec le `INT(11)` de MySQL, toute session aurait été lue comme
anonyme — le middleware CSRF ne se serait jamais déclenché. Une chaîne s'aligne en plus sur ce que le
reste de l'API manipule déjà (`?userID=` en arrive toujours une) et sur ce que `clearSessionsForUser`
compare.

**`req.session.regenerate()` à la connexion**, contre la fixation de session. L'ordre compte :
régénérer, *puis* `clearSessionsForUser` — la nouvelle session n'est pas encore au store et ne peut
donc pas se supprimer elle-même — puis poser le `userId`, puis roter le jeton CSRF. C'est un écart en
avance sur la référence ; le report côté pfa est suivi en COS-323.

**`POST /users/add` renvoie 201** au lieu de 200, comme pfa. Le front traite tout 2xx de la même
façon.

**Le SQL de `getMeController` est paramétré.** Rien n'y est fourni par le client — l'id vient de notre
propre session — mais COS-295 est sur le point de convertir le reste et du SQL neuf n'a aucune raison
de s'écrire à l'ancienne. Il gère aussi le cas « la session survit au compte » : session détruite,
401, plutôt qu'un 200 sans utilisateur.

**Côté front, un seul fichier bouge** : `schemas/auth.ts` rend `csrfToken` **requis** et `token`
optionnel — ce que le commentaire posé par COS-318 annonçait pour ce ticket. Le champ `token` n'est
pas supprimé pour son unique lecteur restant (`login/page.tsx`, qui le passe à `authStore`) ; les deux
partent avec COS-296.

**QA faite en local, 41 assertions** (script jetable, un utilisateur d'essai créé puis supprimé —
11 comptes avant, 11 après) : signup 201 avec `csrfToken` et **sans** `token` · session unique en
Redis, `userId` en chaîne · `GET /users/me` et `/users/csrf` rendant le même jeton, 401 sans session ·
403 sur un verbe non sûr sans en-tête, avec un jeton faux de même longueur, et avec un jeton faux
d'une autre longueur · passage à 400 (validation) avec le bon jeton, donc au-delà du contrôle CSRF ·
401 sur `bookmarks`, `categories`, `reminders` sans session · reconnexion : **nouveau** sid, jeton
**roté**, toujours une seule session, ancien cookie mort · mauvais mot de passe refusé sans 403 (les
routes publiques restent exemptées) · logout 403 sans en-tête puis 200, cookie vidé, session absente
de Redis, cookie devenu inopérant, logout sans session toujours 200.

**Relevé au passage, non corrigé.** Deux points ouverts, décrits dans leurs tickets et **pas ici** —
ce dépôt est public et le détail d'une faille non corrigée n'a rien à y faire (cf. la règle en tête de
§6) :

- le code de réponse d'un échec de connexion, à traiter avec l'écran Login → **COS-297** ;
- le périmètre utilisateur des contrôleurs de liste → **COS-322**, corrigé depuis (voir le §0).

### Ce qui a été posé (COS-295, le 2026-07-30)

**Toutes les requêtes du back sont préparées**, pas seulement celles de la connexion : 11 fichiers,
une soixantaine d'instructions passées en `conn.execute(sql, [params])`. Le ticket demandait
`signInController` puis un audit du reste ; l'audit a conclu qu'il n'y avait aucune raison de laisser
des interpolations derrière, `req.body.title`, `notes`, `url` et `id` en étant tout autant.

**Deux interpolations restent, et les deux sont irréductibles :**

- **`sort`** dans `getBookmarksController` : un nom de colonne et un sens de tri ne sont pas des
  valeurs, aucun paramètre ne peut les porter. Ce n'est jamais du texte client — le `switch` ne produit
  que des littéraux écrits dans le fichier, et l'`enum` de COS-318 rejette le reste en amont.
- **`LIMIT`** : ⚠️ **MySQL refuse le paramètre**, vérifié sur le 8.4.5 local — `LIMIT ?` en requête
  préparée échoue en `ER_WRONG_ARGUMENTS` quel que soit le type envoyé. Les deux nombres sont donc
  interpolés, **lus depuis `req.validated.query`** où zod les a déjà coercés en entiers bornés
  (`rows` ≤ 500 et positif, `page` ≥ 0). C'est **le premier usage de `req.validated`** dans un
  contrôleur — la migration décrite par `middlewares/validate.js` — et ici il porte la sécurité, pas
  la propreté.

**Un `GROUP BY` ajouté à `getBookmarkController`, et c'est le prix du paramètre.** La requête agrège
(`GROUP_CONCAT`) tout en sélectionnant `b.*`, ce qu'`only_full_group_by` refuse normalement ; elle
passait parce que le `WHERE b.id = 12` interpolé laissait MySQL 8 voir une égalité sur la clé primaire
et en déduire la dépendance fonctionnelle. Le paramètre masque le littéral au moment du *prepare*, la
déduction disparaît, le serveur refuse. Le `GROUP BY b.id` dit tout haut ce que le `WHERE` garantissait
déjà.

**Une traversée de chemin fermée au passage** — même motif, autre puits. `getImage` concaténait
`req.query.screenshotFilename` dans un chemin de fichier, ce qui laissait un segment relatif sortir du
dossier des captures, sur une route authentifiée. `basename()` dans le helper, et une contrainte de
forme dans `screenshotQuerySchema` (mot, point, tiret — ni `/` ni `..`).

**`resetPasswordController.js` n'est pas converti, délibérément.** Il est mort et ne *peut pas* tourner :
route commentée, `generate-password` et `sib-api-v3-sdk` absents de `package.json`, et un
`dbConnection.query(...)` alors que `dbinitmysql` exporte une fonction. Rendre du code mort et cassé
étanche à l'injection ne ferait que le faire passer pour maintenu ; un commentaire d'en-tête le dit, et
sa réécriture appartient à `change password` (COS-321).

> **Suite, le 2026-07-30 :** il n'a pas été réécrit, il a été **supprimé** par COS-298. La
> récupération par email est abandonnée — pas de serveur de mail — et ce qui la remplace est la
> passphrase de récupération, consommée par COS-324.

**QA faite en local, 54 assertions, données réelles intactes** (comptes de lignes identiques avant et
après sur les six tables) : passe **en lecture** sur les 1278 signets réels via une session forgée
(pagination, tri décroissant, filtres `IS NOT NULL`, `stars`, `EXISTS` de catégories, fiche unique,
catégories, rappels) · **sondes d'injection** sur le seul filtre en texte libre — une apostrophe ne
casse plus la requête (elle la cassait avant), `' OR 1=1 -- ` et `'; SELECT SLEEP(0) -- ` renvoient
**0 ligne**, donc traités comme du texte · traversée de chemin refusée en 400 · passe **en écriture**
sur un compte jetable : création avec apostrophes et guillemets dans tous les champs, relecture
verbatim, édition (titre, notes, étoiles, priorité, url, catégories échangées), édition qui **vide**
tous les champs optionnels, import CSV, suppression douce.

**Relevé au passage, non corrigé :** dans `editBookmarkController`, la comparaison
`frequency !== req.body.reminder` compare un **objet** (`[[frequency]]` sur un `SELECT frequency`) à
une chaîne. Elle est donc toujours vraie : éditer un signet recrée son alarme et remet son
`date_added` à aujourd'hui, ce que la branche « inchangé : ne rien faire » voulait précisément éviter.
À traiter avec UI 10 (COS-319), qui réécrit ce contrôleur.

### Ce qui a été posé (COS-296, le 2026-07-30)

**Le JWT a disparu du client, et avec lui les deux stores persistés.** `authStore.ts` (clé
`bkmk-token`) **et** `userStore.ts` (clé `bkmk-user`) sont supprimés — le ticket ne nommait que le
premier, mais le second est le même anti-patron et pfa n'en a aucun : c'est le contexte qui porte
l'utilisateur.

**`src/auth/context/AuthContext.tsx`** porte l'utilisateur et le jeton CSRF, **en mémoire, jamais en
storage**. Perdre cet état au rechargement est normal, pas un défaut à contourner : les layouts le
réamorcent depuis le serveur.

**`RequireAuth` est remplacé par un contrôle serveur**, comme la spec l'annonçait :
`auth/server/getServerSession.ts` (port de pfa) interroge `GET /users/me` avec le cookie de la requête,
et `app/(private)/layout.tsx` redirige avant le premier octet envoyé au navigateur. L'ancien garde
lisait un JWT dans `localStorage`, invisible du serveur : il devait afficher « Loading … », décider
après, et laissait ses enfants monter et tirer des requêtes non authentifiées pendant l'attente.

**Le layout `(public)` a aussi un provider**, non amorcé s'il n'y a pas de session : `/login` et
`/signup` y écrivent le jeton CSRF, `/logout` doit le lire pour envoyer son `POST`. Il **avale** en
revanche une erreur de session — quelqu'un qui arrive sur `/login` pendant une panne d'API doit quand
même voir un formulaire.

**`useRequestHelper` devient du TypeScript** et fait trois choses de plus : `withCredentials: true`
(sans quoi rien n'est authentifié, la paire 3100/3101 étant cross-origin en dev), `x-csrf-token` sur
les verbes non sûrs seulement, et **un seul rejeu** après `GET /users/csrf` sur 403. Sur 401 il
redirige et laisse la promesse **pendante**, pour que le 401 n'atteigne jamais l'error boundary ni un
état d'erreur react-query sur un écran qui s'en va.

**L'URL de l'API est centralisée dans `helpers/apiBase.ts`**, et la constante `https://bkmk.1991computer.com/api/`
disparaît : en production le front et l'API partagent l'hôte, donc la base est le **relatif** `/api`.
⚠️ Le préfixe est asymétrique et doit l'être — en dev Express sert ses routes à la racine sur 3101,
c'est le proxy de production qui ajoute `/api`.

**`/logout` devient un vrai appel serveur.** Vider l'état côté client ne suffisait pas et n'a jamais
suffi : un cookie `httpOnly` ne s'efface pas au script, donc une session laissée dans le store reste
valable pour qui détient le cookie. La requête part d'abord (elle a besoin du jeton CSRF que le
contexte va perdre), puis le contexte et le cache react-query sont vidés. Un garde `useRef` évite le
second POST du double effet de React 19 en dev, qui arriverait après l'effacement du jeton et
prendrait un 403.

**`useResetPasswordService.ts` est supprimé** : aucun consommateur, et il visait un
`/users/resetpassword` qui n'existe pas côté serveur. Le lien `/forgotPassword` de l'écran de connexion
reste mort — il appartient à UI 01 (COS-297).

**QA faite en local, 16 assertions** : un écran privé sans session **redirige** (307 vers `/login`) au
lieu de rendre · l'écran de connexion se rend sans session · après une inscription par l'API, la page
privée se rend, **l'email du compte et le jeton CSRF sont dans le HTML rendu par le serveur**, et
**aucun JWT n'apparaît dans le markup** · un cookie forgé est refusé · `POST /users/logout` puis le
même cookie ne rouvre plus l'application, session absente de Redis. `next build` passe, `tsc --noEmit`
propre, lint front inchangé (53 erreurs avant et après, la ligne de base héritée).

### Ce qui a été posé (COS-297, le 2026-07-30)

Le détail visuel est dans **`frontend/docs/design-system.md` §9**, qui fait autorité. Ici, les
décisions.

**`AuthShell` est un frère d'`AppShell`, pas une variante.** Le chrome applicatif existe pour porter
les quatre modules, les compteurs et l'email du compte — tout ce qui demande une session, c'est-à-dire
exactement ce que ces écrans n'ont pas. Partager un composant voudrait dire un drapeau qui éteint les
trois quarts. Ce qui est partagé est ce qui appartient au système et non à l'écran : la déclaration
`@container`, la bande de 38px, la couleur du champ, `h-dvh`.

**Un seul formulaire rend les deux écrans.** `AuthFormCopy` est la poignée de mots qui changent. Sa
validation est `SignInPayloadSchema`, l'objet même contre lequel la requête est validée : le
formulaire ne peut pas dériver de ce que l'API accepte. Les messages français écrits à la main et les
`required: true` disparaissent avec lui, ainsi que les deux icônes FontAwesome de l'œil montrer/cacher
— le handoff ne dessine pas ce contrôle.

**Le bouton n'est plus désactivé par la validité**, seulement pendant la requête. L'ancien formulaire
le grisait jusqu'à `isValid` : rien n'expliquait pourquoi il ne s'enfonçait pas, et une technologie
d'assistance annonçait un contrôle indisponible sans dire pourquoi. La validation se déclenche à la
sortie du champ et le message s'affiche sous le champ fautif, relié par `aria-describedby`.

**Le refus du serveur s'affiche dans la carte, plus dans un `Swal`.** C'est ce qui a rendu nécessaire
la moitié backend de ce ticket :

- **`errorHandlerMiddleware` est enfin monté.** Il était écrit et jamais branché, donc chaque
  `next(createError(…))` tombait sur le gestionnaire par défaut d'Express et répondait **une page
  HTML** — illisible pour axios, et c'est pourquoi l'écran ne pouvait rien afficher. Toute l'API
  répond désormais `{ error: "…" }` au statut demandé.
- **Un échec de connexion est un 401, et un seul message.** C'étaient deux 500 distincts, « User does
  not exist » ou « Invalid credentials ». Le 500 dit « l'API est cassée » quand la réponse est « ces
  identifiants sont refusés » ; et les deux messages **énuméraient les comptes** sur une route
  anonyme et sans limitation de débit. Même 401, même phrase, dans les deux cas.
- **Une inscription en doublon est un 409**, avec le message que l'écran affiche. Le dire ici n'est
  pas un oracle : celui qui s'inscrit apprend quelque chose sur une adresse qu'il vient de saisir.

**Écart assumé : le fond de page global n'est pas basculé**, contrairement à ce que cette spec prévoyait
pour UI 01. Les deux cadres peignent leur propre sous-arbre, donc le reset global n'aurait plus rien à
faire sinon repeindre les deux écrans encore hérités (About, les barres d'outils dans le bureau) — ce
qui les ferait passer de datés à cassés, sans rien gagner sur une surface GRAPHITE. Il partira avec le
dernier écran hérité, comme `base.css` le disait.

**Écart de périmètre, dans l'autre sens : l'écran d'inscription reçoit le gabarit.** Le formulaire et
le cadre étant partagés, le laisser sur sa carte vert citron à côté de son jumeau aurait été pire que
tout. UI 02 (COS-298) garde ce qui lui appartient vraiment : `key` et `confirm key` sur deux colonnes,
la jauge de force, et la case d'import Session Buddy qui doit enchaîner sur l'écran Import.

**Le lien mort `/forgotPassword` disparaît** — il n'y a ni page ni route derrière, et
`useResetPasswordService` avait déjà été supprimé en COS-296.

**Les valeurs statiques suivent la règle de §8.1.** Les trois lignes mono sous la carte
(`host` / `index` / `sync`) et le `build 2.4.1 · tls on` du chrome sont de la copie, rendues telles
quelles. Deux d'entre elles *pourraient* être réelles, mais pas ici : la page est servie à quelqu'un
qui n'a pas de session, donc le nombre d'enregistrements est inconnaissable, et un hôte réel à côté de
deux nombres inventés se lirait comme un accident plutôt qu'une décision.

⚠️ **Les trois lignes mono ne sont plus là depuis COS-328** (et le sur-titre `session` non plus) —
voir la section de ce ticket plus bas. Le raisonnement ci-dessus tient toujours, il a seulement cessé
de conclure « donc on les rend telles quelles » : sur la porte d'entrée, cette place valait mieux
qu'un instrument qui ne mesure rien. Le `build 2.4.1 · tls on` du chrome est parti au coup suivant
(COS-321), remplacé par le domaine de l'hôte : un numéro de version que le visiteur ne peut pas
vérifier disait moins, sur le seul écran servi à des gens pas encore connectés, que qui fait tourner
la chose.

**QA faite en local, 44 assertions** (données réelles intactes, compte d'essai créé puis supprimé) :
les quatre réponses d'erreur — 401 en JSON sur mauvais mot de passe, **401 identique octet pour octet
sur une adresse inconnue**, 400 du schéma sur une adresse malformée, 409 sur un doublon · l'écran de
connexion rend les dix-sept éléments du handoff (chrome réduit, sur-titre, titre, les deux champs,
action primaire, bascule, mention, les trois lignes mono, lien About, barre de statut) · le curseur est
`aria-hidden`, le champ mot de passe est un `type="password"`, l'email est étiqueté par `for=` · plus
aucune trace de l'ancien formulaire · l'écran d'inscription partage le cadre avec ses propres mots · le
chemin heureux marche encore de bout en bout. En plus : **les 19 utilitaires de l'écran résolvent dans
le CSS compilé** — `w-120` vaut bien 480px et `p-5.5` 22px, les chiffres du handoff — `tsc --noEmit`
propre, lint front en baisse (53 → 50 erreurs, l'ancien formulaire en emportant trois).

⚠️ **Non vérifié : le rendu.** Aucun navigateur n'est connecté à cette session, donc tout ce qui
précède est du markup et du CSS, pas une capture. La QA visuelle reste à faire.

### Ce qui a été posé (COS-298, le 2026-07-30)

Le détail visuel est dans **`frontend/docs/design-system.md` §9**, qui fait autorité. Ici, les
décisions — dont une qui n'était pas dans le ticket d'origine.

**La récupération de mot de passe par email est abandonnée.** Décision du 2026-07-30, prise en
ouvrant ce ticket. bkmk est auto-hébergé et n'a pas de serveur de mail ; l'`resetPasswordController`
qui prétendait le contraire visait Sendinblue avec l'expéditeur de pfa, était mort, et ne *pouvait
pas* tourner (deux paquets absents de `package.json`). Ce que COS-295 avait laissé en attente est
donc tranché : le fichier est supprimé, et ce qui le remplace est une **passphrase de récupération**
que l'utilisateur choisit à l'inscription.

Le découpage qui en découle, parce qu'un seul ticket ne pouvait pas tout porter :

- **ici** : le champ, sa validation, la colonne, le hachage ;
- **COS-324** (AUTH 05, nouveau) : l'écran `/recover` et `POST /users/recover` qui la consomment,
  avec la limitation de débit et la réponse indifférenciée qu'une route publique non authentifiée
  exige — c'est un second mot de passe, qui le devine prend le compte ;
- **COS-321** (le menu utilisateur, périmètre étendu) : la seule porte par laquelle les **11 comptes
  déjà en base**, tous à `NULL`, pourront en poser une. Jusque-là, ils n'ont aucune voie de
  récupération. C'est assumé et écrit dans les deux tickets.

**Il existe un DDL de référence, et il est juste.** `backend/src/db/bkmk.sql` — que `fieldLimits`
déclarait inexistant — décrit la base exactement : chaque colonne vérifiée contre le serveur en
ajoutant `recovery_passphrase`. La table de bornes est donc passée de « inférée » à lue, et **deux de
ses valeurs étaient fausses du mauvais côté** : `user.name` et `category.name` sont des `VARCHAR(20)`,
pas 50. L'inscription tombait dessus, puisqu'elle dérive le nom du compte de l'adresse — une partie
locale de plus de vingt caractères passait le formulaire et revenait en erreur SQL brute. Ce qui reste
à COS-306 est plus petit d'autant.

**Pas de runner de migration, mais une trace.** `bkmk.sql` est un script de *création* : il ne sait
rien de la base qui tourne. Chaque changement de schéma va donc dans les deux endroits, et
`src/db/migrations/` porte le fichier daté à passer à la main, avec un README qui dit sur quelles
bases il a déjà été passé. ⚠️ **L'`ALTER` n'a été passé qu'en dev.** Sans lui, l'inscription répond
500 en production.

**72, et c'est bcrypt qui le dit.** Les deux secrets sont bornés à 72 caractères parce que bcrypt
hache les 72 premiers octets et **ignore silencieusement le reste** : accepter une passphrase plus
longue, c'est en vérifier une partie en laissant croire que la phrase entière protège le compte. Le
minimum, lui, est asymétrique — 12 pour le mot de passe (le `12+ chars` de la maquette), 20 pour la
passphrase, qui ne doit pas être le maillon faible de ce qu'elle autorise. Et il n'y a **aucun**
minimum à la connexion : il enfermerait dehors tout compte dont le mot de passe est antérieur à la
règle.

**Les deux secrets sont révélables et confirmés** — deux gardes, deux fautes différentes. Un mot de
passe mal tapé se découvre à la prochaine connexion, au prix d'un essai ; une passphrase mal tapée se
découvre le jour où elle sert, c'est-à-dire le jour où plus rien ne peut la réparer. Le révélateur
attrape la faute qu'on va chercher, la confirmation celle qu'on ne cherche pas. **Un révélateur par
paire**, au bout de la ligne de libellés de la paire, et il démasque les deux moitiés : un seul
contrôle posé au-dessus d'une paire ne peut pas vouloir dire autre chose. La paire de passphrase est
**empilée**, là où `key` / `confirm key` partagent une ligne comme dans la maquette : une passphrase
est une phrase, et à mi-largeur elle se coupe au milieu.

**Quatre écarts au handoff**, dont trois de la même nature — la maquette dessine l'apparence d'une
chose et pas la chose. La jauge nue gagne un mot et devient `aria-hidden` ; le champ de passphrase
n'est pas dans la maquette du tout ; et **deux éléments dessinés ont été retirés** sur décision du
propriétaire : la case d'import Session Buddy (s'inscrire et importer sont deux décisions, et
accrocher la seconde à une case sur la première n'achète qu'une redirection vers un écran que le
chrome atteint déjà) et les mentions décoratives des deux écrans — `keys stored locally`,
`self-hosted · no tracking`, `tab next field`. La première était en plus fausse au premier degré :
elle se lit comme une affirmation sur le stockage du navigateur, qui depuis AUTH 04 ne contient rien.
`ui/checkbox` est reparti à la version du registre avec la case : plus rien ne le rend, et repeindre
un composant qu'aucun écran n'utilise est du terrassement déguisé en travail. Tableau complet au §9
du DS.

**Les messages de validation ne coûtent aucune hauteur**, et c'est le résultat de deux erreurs. Sous
le champ, ils font grandir la carte au fur et à mesure qu'on tabule ; en leur réservant une ligne, ils
la font grandir une fois pour toutes, d'environ 22px par champ. Sur un design condensé, les deux se
lisent comme un bug — la capture l'a montré sans discussion. Ils sont donc **au bout de la ligne de
libellé**, à la place du `hint` tant qu'ils s'affichent, et le refus du serveur au bout de la ligne
d'action, à la place de la mention qui vient d'en partir. Le prix : deux ou trois mots maximum, borné
là où ils sont écrits (`schemas/auth.ts`).

⚠️ **La ligne de libellé est en `flex h-4 items-center leading-4`, et il a fallu trois essais.** Deux
champs côte à côte doivent poser leurs libellés *et* leurs inputs à la même hauteur, et l'alignement
sur la ligne de base ne peut garantir ni l'un ni l'autre : chaque en-tête est son propre conteneur
flex, donc la ligne de base commune est fixée par l'enfant à la plus grande ascendante. Les trois
essais, notés pour que personne n'y repasse l'après-midi : (1) un `MiniButton` de 20px dans une ligne
qui se dimensionnait toute seule fait grandir cette colonne — son input tombe 6px trop bas ; (2) le
même contrôle en texte mais dans un `<span>` enveloppant décale l'autre colonne de 3, parce qu'un
élément flex blockifié porte un *strut* à la taille de police de **la carte** (12px) et non du
libellé (10px) ; (3) fixer la hauteur immobilise l'input mais pas le texte à l'intérieur, les lignes
de base se résolvant toujours différemment. Ce qui tient : hauteur d'une ligne, `leading-4` qui force
toutes les boîtes de ligne à ces mêmes 16px, et `items-center` — des boîtes de 16px centrées dans une
ligne de 16px tombent au même endroit quoi que la ligne contienne. Libellés et messages en
`whitespace-nowrap`, et le contrôle porte lui-même son `ml-auto`, sans enveloppe.

**Le contrôle est redevenu un `MiniButton`, et c'est l'essai 1 qui explique pourquoi c'est possible.**
Une fois la hauteur de la ligne fixée, un contrôle de 20px se centre et débord de deux pixels de
chaque côté dans les 6px qui le séparent de l'input : il ne peut plus étirer une ligne à qui on a dit
sa hauteur. Écrire la bascule en texte corrigeait un problème qui appartenait à la ligne, pas au
bouton — la ligne garde donc le correctif, et l'écran garde le plus petit contrôle du handoff.

**Le moment de la validation est une règle du système, pas d'un écran** : valider en quittant le
champ, effacer au caractère qui corrige, et **ne rien dire d'un champ qu'on a vidé** jusqu'à
l'envoi. `mode: "onTouched"` donne les deux premiers ; le troisième demande `isSubmitted`, parce que
react-hook-form conserve le dernier verdict — effacer une clé trop courte laissait « min 12 chars »
posé au-dessus d'une boîte vide, c'est-à-dire reprocher une faute avant qu'on ait écrit quoi que ce
soit. Un champ vide reste invalide, donc le message revient à l'envoi, qui est le moment où il sert
vraiment.

**Une exception : un champ de confirmation signale son désaccord en direct**, sans attendre le blur.
Attendre est juste pour « min 12 chars » — on n'a pas fini de taper — et faux pour une confirmation,
où l'on recopie un secret qu'on ne peut pas lire et où tout l'intérêt du champ est d'être averti
**pendant** la frappe que la copie a divergé. Le formulaire compare la paire lui-même et lève
`MISMATCH_MESSAGE`, exporté depuis `schemas/auth.ts` où la même règle est appliquée à l'envoi : deux
endroits peuvent le dire, aucun ne peut le dire autrement.

**Le formulaire d'inscription fait 576px**, là où la connexion garde les 480 de la maquette : quatre
champs de secret contre un, et à 480 la paire à deux colonnes n'avait plus la place d'un message à
côté de `confirm key` — le libellé passait à la ligne et emmenait son input avec lui. 576 vaut
`36rem`, le pas `xl` de Tailwind, pas « 480 plus une centaine ».

⚠️ **Un `superRefine` unique, et c'est un bug à retenir.** La première version validait champ par
champ puis comparait les paires avec deux `.refine`. Or zod n'exécute les raffinements d'un objet
**que si l'objet lui-même a parsé** : tant que `password` échouait sur son propre `min(12)`, aucune
des deux comparaisons ne tournait. `no match` était inatteignable exactement pour qui en avait
besoin — celui qui est encore en train de taper une clé trop courte. N'importe quel échec de champ
masquait de la même façon toutes les règles inter-champs. La forme est maintenant cinq chaînes nues,
donc elle parse toujours, et chaque contrôle tourne toujours.

**Les pas quart de scale ont été balayés.** DS 01 écrit « tout tombe sur l'échelle numérotée,
demi-pas compris » — vingt occurrences de quarts de pas s'y étaient glissées depuis, dont une listée
dans le tableau du §6 lui-même (`px-2.75`). Toutes arrondies au demi-pas le plus proche, rien ne
bouge de plus d'un pixel, et plus aucune surface ne porte deux espacements à un pixel l'un de
l'autre. Tableau des vingt au §6 du DS.

**Le fond blanc des champs de connexion était l'autofill de Chrome.** Les deux écrans rendent le même
composant, aux mêmes classes, à l'octet près : la connexion déclare `autocomplete="email"` et
`current-password`, donc Chrome remplit et repeint ; l'inscription déclare `new-password`, donc non.
Le hack `transition-delay: 9999s` qui traînait dans `base.css` ne *pouvait* pas marcher — il suppose
que la peinture passe par une transition sur `background-color`, alors que `ui/input` ne transitionne
que `border-color` et `box-shadow`. `background-clip: text` empêche la peinture, une ombre interne
repeint le champ, et le liseré pâle qui restait autour (le `border` à 16% laissait voir le blanc à
travers) disparaît avec.

**La passe de QA visuelle du propriétaire, en six points.** Aucun navigateur n'est attaché à la
session : ce sont ses captures qui ont trouvé tout ce qui suit.

1. **La bascule show / hide est redevenue le `MiniButton` de la maquette.** Je l'avais réécrite en
   texte pour régler le désalignement de la ligne de libellé — alors que le correctif appartenait à la
   ligne, pas au contrôle. Hauteur de ligne fixée, un contrôle de 20px se centre et débord de deux
   pixels dans les 6px qui le séparent de l'input, sans rien étirer.
2. **Et elle ne bouge plus au survol.** Le `chrome` de `ui/button` lève le bouton d'un pixel ; juste,
   pour un bouton de 30px qui a de l'air autour, faux pour celui-ci, coincé dans un en-tête de champ
   et pressé deux fois par secret tapé. L'ombre du survol reste, le déplacement part.
3. **`cursor: pointer` est rétabli pour tout ce qui est cliquable**, dans `base.css` et une fois pour
   toutes : Tailwind v4 a changé le curseur par défaut des `<button>` de `pointer` à `default`, ce qui
   avait donné une flèche à tous les contrôles de l'app. Détail du §1 du DS.
4. **Les champs ne portent plus qu'un seul anneau.** La maquette bascule *en plus* la couleur du
   `border` vers l'accent à pleine intensité ; à l'écran cela fait deux bords pour un état — une bande
   douce, puis un filet dur qui mord le bord de la boîte, et sur un champ invalide ce filet est la
   seule couleur saturée d'un panneau de gris. Départ assumé de la maquette, sur `ui/input` et
   `ui/textarea`.
5. **Les titres ne sont plus ceux de la maquette** : `sign in` et `create an account` au lieu de
   `sign in to the index` et `create an index`. Les écrans nomment l'acte, pas ce qu'il y a derrière —
   et qui n'a pas encore de compte n'a pas d'index à créer.
6. **Un libellé qui est aussi un lien s'écrit `<Overline asChild><Link/></Overline>`**, jamais un
   `<Link>` autour d'un `Overline` : l'enveloppe est l'élément flex, sa boîte de ligne porte un *strut*
   à la taille de police héritée, et le libellé tombait un pixel et demi sous l'`Overline` d'à côté.
   Corrigé aux quatre endroits qui avaient ce motif, dont la ligne de méta du chrome.

⚠️ **Et un défaut qui n'en est pas un, mesuré plutôt que discuté.** Le sur-titre, le titre et la carte
partent tous exactement du même x — 432 mesurés dans une fenêtre sans tête de 1440px. Ce qui reste est
l'*approche* du glyphe propre à IBM Plex Mono, le vide avant l'encre : 0.45px aux 10px du sur-titre,
1.61px aux 24px du titre. Ce n'est même pas un nombre à retrancher : le même titre côté connexion
mesure 1.30px, l'approche appartenant au premier glyphe (`c` ici, `s` là). Toute correction serait une
constante par écran et par chaîne, fausse le jour où la copie change. Laissé tel quel, sur décision du
propriétaire — la maquette a la même propriété.

**Écart de périmètre côté serveur, comme en UI 01.** Un champ sans persistance est décoratif, donc
`addUserController` a été réécrit : `bcrypt` attendu au lieu de deux rappels imbriqués (ajouter un
second hachage en aurait fait quatre niveaux, avec la seule gestion d'erreur trois fermetures plus
bas), lecture de `req.validated.body`, et le garde `Please enter all fields` retiré — `validate`
répond 400 avant le contrôleur, ce qui est le bon statut au bon endroit.

**Une assertion a trouvé autre chose, sur une ligne héritée de 2023.** Rien que le code puisse
produire, rien que ce chantier ait cassé, et rien de plus ici : le détail et les issues possibles sont
dans **COS-325** (§6, règle d'en-tête — un ticket privé, pas un dépôt public).

**QA faite en local, 84 assertions** (données réelles intactes, trois comptes d'essai créés puis
supprimés, compte final identique) : la colonne est bien un `varchar(60)` nullable et **les 11 comptes
existants sont restés à `NULL`**, rien n'a été inventé pour eux · ce que la route refuse — pas de
passphrase, 19 caractères, 73 caractères, mot de passe de 11, de 73, et un 400 qui **nomme le champ**
· le chemin heureux : 201, cookie de session, jeton CSRF, et en base un hash bcrypt qui n'est ni le
secret en clair ni le même que celui du mot de passe, que `bcrypt.compare` accepte et refuse comme il
faut · une partie locale de 26 caractères s'inscrit sans erreur SQL et atterrit tronquée à 20 · le
doublon répond toujours 409 · **la jauge testée sur le vrai helper compilé** (sept cas, dont la borne
sous le minimum) · les 21 éléments du handoff dans le markup rendu, plus la note qui dit qu'il n'y a
pas de mail de réinitialisation · cinq champs étiquetés par `for=`, le révélateur annonce son état en
`aria-pressed`, la jauge est `aria-hidden`, trois `type="password"` et le champ de passphrase n'est
pas révélé par défaut · **l'écran de connexion n'a pas bougé** (ni jauge, ni révélateur, un seul champ
mot de passe) · le reste de l'auth tient (401 identique octet pour octet, 401 sans session, 403 sans
jeton CSRF, 400 passé le jeton, logout, cookie mort ensuite). `next build` passe, `tsc --noEmit`
propre, lint front stable (50 erreurs, la ligne de base héritée), lint back à 0.

**Le rendu, lui, a été vérifié par le propriétaire** — six points, listés plus haut, et c'est ce qui a
fait la différence entre « le markup est correct » et « l'écran est juste ». Aucun navigateur n'est
attaché à la session : ce sont ses captures qui ont trouvé la bascule réécrite en texte, le survol qui
déplaçait le bouton, la flèche à la place du curseur main, le double bord des champs, et le
désalignement du haut de page.

💡 **Ce qui manquait de mon côté était mesurable, et l'est maintenant.** Chrome se lance en mode sans
tête avec `--remote-debugging-port`, et Node parle CDP tout seul (`WebSocket` est global depuis Node
21) : une trentaine de lignes suffisent à demander à la page les `getBoundingClientRect` réels. C'est
ce qui a tranché le dernier point — les boîtes du sur-titre, du titre et de la carte partent du même
pixel, seule l'approche du glyphe diffère — au lieu d'une troisième correction à l'aveugle. À refaire
avant d'affirmer quoi que ce soit sur une géométrie.

### Ce qui a été posé (COS-328 — le sur-titre et le pitch, le 2026-07-31)

Deux lignes de copie sur les écrans d'auth, décidées par le propriétaire. Le détail est dans
**`frontend/docs/design-system.md` §9**, septième ligne du tableau des écarts.

**Le sur-titre du login passe de `session` à `BKMK`.** `session` nommait un mécanisme que le visiteur
n'a aucune raison de reconnaître ; la porte d'entrée porte le nom du produit. Le mot est donc à
l'écran deux fois, ici et dans la marque du chrome — assumé, et **sans partager la constante de**
`wordmark` : la marque identifie l'application, ce sur-titre étiquette l'écran, et leur chaîne
identique est une coïncidence d'aujourd'hui. Le sur-titre de l'inscription (`new account`) ne bouge
pas : il nomme la section, pas le produit.

**Les trois lignes mono deviennent une phrase qui dit ce qu'est l'app.** `AUTH_TEXT.facts` est
supprimé, `AUTH_TEXT.pitch` prend sa place et son emplacement (`mt-4`, `text-2xs`, `text-gr-fg-4`,
entre la carte et le lien About). Ce n'est plus une grille de trois `<div>` en `whitespace-pre` mais
un `<p>` : l'alignement à l'espace n'avait de sens que pour des lignes clé/valeur, et le retour à la
ligne appartient maintenant au navigateur.

**L'écran d'inscription suit, et rend la même constante.** Il partageait le bloc `facts` ; laisser
trois nombres inventés sur le seul signup, à côté d'un jumeau qui n'en a plus, aurait été le pire des
trois états possibles. Une constante, deux rendus.

**Vérifié :** `tsc --noEmit` propre · `biome check` propre sur les trois fichiers touchés (les 36
erreurs du front sont la ligne de base héritée, aucune ici) · plus aucun rendu de `facts` dans `src/`,
la seule occurrence restante étant un commentaire qui dit où le tableau se trouvait.

⚠️ **Non vérifié : le rendu.** Aucune mesure n'a été prise — ni capture, ni `getBoundingClientRect`
en CDP. La contrainte que la copie doit tenir (**deux lignes à 480px**, sinon le lien About descend)
est un raisonnement sur la largeur de glyphe du mono à 11px, pas une mesure. C'est le premier point à
regarder à la QA visuelle, sur les deux écrans.

### Ce qui a été posé (COS-299 — l'index)

L'écran le plus lourd du lot, et celui qui a fixé les conventions des suivants. Deux cartes : rail
196px + carte table, `gap-3`. La grille v2 est respectée au pixel — `58 36 62 1fr 188 168`, écrite en
pas de 4px (`--spacing(14.5)` …), lignes de **30px**.

**L'URL est tout l'état.** `readIndexQuery` lit la barre d'adresse et tout le reste en découle : les
lignes demandées, la rangée allumée du rail, l'expression de la barre de commande, la page du pager.
Aucun store, donc deux composants ne peuvent pas se contredire ; le bouton retour annule un filtre ; un index
filtré est un lien qu'on envoie. Chaque contrôle est un `<Link>`, ce qui fait marcher clic milieu et
⌘-clic sans une ligne de plus. `helpers/indexQuery.ts` est le seul endroit qui convertit entre les
trois formes de cet état (URL, requête d'API, expression lisible), avec deux règles porteuses : les
clés de la requête d'API sont **triées** (cette chaîne est la clé de cache — `?starred=1&page=0` et
`?page=0&starred=1` sont une seule page), et changer un filtre **remet la page à 0** (la page 3 d'une
requête qui ne rend plus que 12 lignes est un tableau vide sans explication).

⚠️ **Un flag de query string ne se lit pas avec `z.coerce.boolean()`.** La coercition est
`Boolean(valeur)` : toute chaîne non vide est vraie, donc `?screenshot=0` **activait** le filtre.
Trouvé par la QA, et le défaut existait déjà sur les trois flags antérieurs, des deux côtés du réseau.
Corrigé des deux côtés (`queryFlagSchema`), et le contrôleur lit désormais ses flags dans
`req.validated.query` — un schéma ne sert à rien si la valeur lue est la brute.

**Une ligne de 30px cliquable sans être un contrôle.** Le titre est un vrai `<Link>` dont le `::after`
couvre la ligne : la cible du clic est la ligne entière, l'élément cliqué reste une ancre (Entrée
ouvre, la barre d'état montre la destination), et aucun `div` ne reçoit de gestionnaire clavier
rapporté. Les actions sont **au-dessus** de cette couverture (`relative z-1`), et c'est pourquoi
aucune n'a besoin de `stopPropagation` — elles sont devant le lien, pas dedans. La solution de la
maquette (`onClick` sur un `div` + `stopPropagation` partout) est le même effet construit de la façon
qui échoue au clavier, et c'est la source de la plupart des erreurs de lint héritées.

**Sémantique de tableau posée à la main.** Six colonnes alignées à travers un conteneur qui défile,
à 30px la ligne, c'est ce qu'un `<table>` ne fait pas sans se battre : la structure reste des `div` et
les rôles ARIA sont remis explicitement (`table` → `row` / `rowgroup` → `row` → `cell`, `aria-sort` sur
les en-têtes triables). Biome proteste (`useSemanticElements`, `useFocusableInteractive`) : les deux
règles sont désactivées pour `components/bookmarks/Index*.tsx` dans `biome.json`, une fois, plutôt que
douze suppressions en ligne.

**`asChild` est devenu la réponse du DS à « ce contrôle navigue »** : `Overline`, `Segment` et
`RowAction` le prennent tous les trois. Un filtre, une catégorie et `↗` sont des adresses.

**Ce qui n'est délibérément pas là**, avec le ticket qui l'apporte : les compteurs par catégorie et le
bloc `storage` (DATA 05 / COS-310 — `all` porte le vrai total, le reste ne porte rien plutôt qu'un
`0/0` permanent) · le bouton `filter ⌥F` et le champ de requête cliquable (UI 04 / COS-300 — un bouton
qui n'ouvre rien est pire qu'un bouton pas encore arrivé ; arrivés depuis, cf. §6 bis) · le langage de
requête `tag:demoscene stars:>3` de la maquette, remplacé par l'objet de filtres imprimé dans la même
forme.

**Trois scopes ont demandé du serveur.** `has shot` était exprimable, les trois autres non (`stars`
compare à l'égalité, `reminder` à une fréquence exacte). Quatre cases dont une seule filtre est pire
que zéro : `getBookmarksController` gagne trois conditions paramétrées, dans la forme que DATA 01
(COS-306) formalisera. `prio high` envoie `high,highest` — un raccourci nommé d'après le niveau
juste sous le sommet cacherait les enregistrements qui comptent le plus.

**Le tri par défaut est `-date` et reste hors de l'URL.** Le défaut du backend est *aucun* `ORDER BY`,
c'est-à-dire l'ordre que le moteur veut bien rendre. Un index veut la dernière chose enregistrée en
haut, et le pager de la maquette le dit déjà (`sorted by added ▾`).

**Les couleurs de chips viennent de la base, pas d'un fixture.** La maquette colore par `tagPalette` ;
`category.color` existe et appartient à l'utilisateur. On garde sa teinte et le traitement GRAPHITE
(`hsl(teinte 34% 32%)`), sinon dix-huit couleurs choisies transforment un écran de gris en tableau de
punaises. Un gris ou une valeur illisible retombe sur un hachage du nom, pas sur un défaut partagé.

**QA locale, 78 assertions** (compte d'essai créé puis supprimé, cinq enregistrements de fixture) :
lecture d'URL trafiquée (page négative, `stars=99`, tri inconnu, niveau de priorité inventé) · requête
d'API triée, deux ordres donnant la même chaîne, flag faux absent, priorité normalisée · ce que
construit un clic (retour page 0, filtres conservés, chemin propre quand tout est vidé) · le tri
(défaut, nouvelle colonne descendante, bascule) · l'expression lisible (catégories nommées, ordre fixe,
page jamais affichée) · les teintes de chips sur le vrai helper compilé · **les scopes sur HTTP** :
`starred=1` garde 3 des 5, `stars=3` en garde 1 (inchangé), `alarm=1` la bonne ligne, `high,highest`
en garde 2, `screenshot=1` toujours bon, combinaison en ET, `priority=urgent` → 400, tentative
d'injection → 400 et la table `bookmark` toujours debout, `starred=0` ne filtre rien et `starred=true`
filtre · la route rendue (rail, scopes, barre de commande, six en-têtes, pager, grille v2 au pixel,
`role="table"`, redirection sans session) et l'absence des mocks (`1.4 mb`, `188`, `tag:demoscene`,
l'ancienne liste lime). `next build` passe, `tsc --noEmit` propre, lint front **à 45** — trois de moins
que la ligne de base, l'ancienne liste étant partie avec ses erreurs.

**La passe visuelle du propriétaire sur l'index, en huit points.** Ses captures, encore une fois, ont
trouvé ce qu'aucune assertion de markup ne voit :

1. **La colonne `id` est retirée** — une clé de base au milieu de titres et de dates, non triable, et
   absente de l'ancienne liste. Sa place va à une **colonne `shot`** (44px, triable), reprise de
   l'ancienne liste : la maquette n'en fait qu'un glyphe à côté du titre, une colonne se lit de haut en
   bas. Grille : `36 · 62 · 1fr · 188 · 44 · 168`.
2. **Toutes les colonnes trient**, comme dans l'ancienne liste. `tags` n'en avait pas les moyens : le
   contrôleur gagne un ordre sur les noms agrégés (`categories_names`), et les trois `GROUP_CONCAT`
   partagent désormais un `ORDER BY c.name` — ils sont recollés position par position par
   `marshallCategories`, donc ils doivent s'accorder, et l'effet de bord est que les chips sortent dans
   l'ordre alphabétique.
3. **Les dates ne s'alignaient pas.** La bande d'actions partage la cellule de la date, et `↗`
   n'existait pas sur un enregistrement sans url : la bande faisait un bouton de moins et poussait ces
   dates de 22px. `↗` est maintenant rendu `disabled` dans ce cas — trois actions toujours. Mesuré
   après correction : 22 dates, **un seul bord droit**.
4. **Les flèches du pager ne doivent rien déplacer.** Elles étaient absentes aux extrémités, avec un
   cache-trou carré alors que le bouton est plus large que haut : arriver page 1 décalait `page 01`. Les
   deux flèches sont désormais toujours là, désactivée à l'extrémité. Mesuré : `page` au même pixel
   (283.16) sur les pages 0 et 1.
5. **Le dernier numéro de page est cliquable**, comme dans l'ancien pager : `/57` saute à la fin.
6. **Le rail ne défile plus horizontalement**, et sa barre verticale est celle du DS. Un compteur figé à
   `3ch` tronquait un total de 1290 en un `127` parfaitement crédible et élargissait la ligne — d'où la
   barre horizontale. `min-w` au lieu de `w` : trois chiffres sont le remplissage de la maquette, pas un
   plafond.
7. **Le compteur `all` affichait le total de la requête courante**, donc le compte de la catégorie
   sélectionnée : « all 002 » sur un index de 1290. Il n'existe qu'**un** nombre, `total_count`, et
   `countedRow` le pose sur la ligne qui *est* la requête — `all` si rien n'est filtré, une catégorie si
   elle est le seul filtre, rien sinon (les comptes par catégorie restent DATA 05).
8. **La barre de défilement est devenue un composant du DS** (`gr-scroll`, dans `styles/utilities.css` —
   la première chose que ce système ne sait pas écrire en classe Tailwind) : 6px, pas de rail peint, un
   pouce dans l'encre de bordure du panneau. ⚠️ `scrollbar-width` n'est posé **que** là où
   `::-webkit-scrollbar` n'existe pas : Chrome et Safari gèrent les deux et **ignorent** les
   pseudo-éléments dès que les propriétés standard sont présentes — avec `thin` posé partout, le rail
   gardait la barre de Chrome, mesurée à 11px. D'où `@supports not selector(::-webkit-scrollbar)`.

💡 **Et un piège de JS à retenir** : un commentaire SQL `--` écrit *dans* un littéral de gabarit et
citant un identifiant entre accents graves **termine le gabarit**. La requête de l'index a été cassée
comme ça pendant deux minutes. Les notes de ce genre vivent au-dessus du littéral, en commentaire JS.

⚠️ **Non vérifié : rien, cette fois-ci, sur la géométrie.** Les mesures ci-dessus viennent d'un Chrome
sans tête piloté en CDP, avec un compte d'essai de 1290 enregistrements et 40 catégories créés puis
supprimés — la recette est au §6. Ce qui reste hors de portée est le jugement : les couleurs, la
densité, ce qui se lit bien.

⚠️ **Un défaut rouvert depuis, sous le pli : COS-326.** Toutes les mesures ci-dessus sont prises au
large. Sous `@max-3xl`, `IndexRow` se replie sur une seule ligne — `pri`, `stars`, `tags`, `shot` et
`added` passent tous en `hidden` — mais la bande d'actions du point 3 reste **hors flux** et n'est
plus révélée au survol : elle est peinte en permanence par-dessus l'url, que rien n'écarte. Le
hors-flux reste juste au-dessus du pli (c'est lui qui donne le bord droit unique du point 3) ; ce
qui manque est le pendant replié. Recoupe FIN 01 (COS-311), qui passera sur les 9 écrans.

---

## 6 bis. UI 04 — la modale de filtres (COS-300)

Le premier vrai modal du système, et le seul état de l'écran d'index qui **n'est pas dans l'URL**.

**Un brouillon, pas sept navigations.** Partout ailleurs sur l'index un contrôle est un `<Link>` et un
clic est une navigation, parce que la requête vit dans la barre d'adresse. Ici sept contrôles décrivent
**un** filtre : appliquer chacun au clic ferait sept navigations et sept allers-retours pour atteindre
une seule liste. La modale édite donc un brouillon en `useState`, le compte en direct, et l'applique
d'un seul coup — ce que le pied de la maquette dit déjà, `filter — 27 results` étant un bouton et pas
une ligne d'état. Le brouillon se résout quand même en **adresse** : l'action primaire est un `<Link>`,
donc ⌘-clic ouvre l'index filtré dans un onglet et le retour arrière défait les sept filtres d'un pas.

⚠️ **Le brouillon est semé à l'ouverture, et seulement là.** Radix démonte le contenu quand la modale
est fermée, donc `useState(query)` dans `FilterForm` se réinitialise à chaque ouverture — c'est la seule
raison pour laquelle le formulaire est un composant à part. Sans cette coupure, un brouillon modifié
puis abandonné revient à l'ouverture suivante au lieu de la requête réellement à l'écran. Vérifié :
`esc` après un changement, réouverture, les segments sont de nouveau ceux de l'URL.

**`live · 14 ms` est mesuré, et tout sur cet écran doit l'être.** `useFilterCount` demande `rows=1` — la
page la moins chère qui porte encore le `COUNT(DISTINCT b.id)` séparé du contrôleur — avec un debounce
de 300ms sur *toute* la chaîne de requête, donc un mot tapé coûte une requête et un clic coûte la
sienne tout de suite. Le chiffre du pied est le vrai aller-retour de cette requête. La maquette écrit un
`4 ms` figé : une latence en dur est une affirmation de performance que personne n'a mesurée, et c'est
le seul genre de décoration qui, en plus, trompe. Il reste vide jusqu'à avoir quelque chose à dire,
plutôt que d'afficher `0`.

**L'objet de filtres a perdu deux paramètres, et chaque contrôle possède exactement un champ.** COS-299
avait donné au rail quatre scopes et au backend trois conditions. Construire les contrôles de la modale
avec ça ne marchait pas, et la correction a été *moins* de paramètres, pas plus :

| COS-299 | COS-300 | Pourquoi |
|---|---|---|
| `stars` comparé avec `=` | **`>=`** | Le groupe de la maquette est `any · 1+ · 2+ · 3+ · 4+ · 5`. Un minimum est ce que veut dire un filtre de note, et l'égalité ne pouvait pas l'exprimer : demander `3+` rendait les enregistrements à trois étoiles et cachait ceux à quatre et cinq. |
| `starred`, un flag pour `stars > 0` | **supprimé** | Avec un minimum, « noté du tout » c'est `stars=1`. La ligne du rail et le segment `1+` de la modale écrivent le même filtre au lieu de deux orthographes d'un seul. |
| `alarm`, un flag de présence | **une énumération**, `armed \| none \| due` | Le groupe rappel est un choix unique à quatre branches. Trois booléens peuvent se contredire — `?alarm=1&no_alarm=1` est une requête sans réponse — donc c'est un champ à trois valeurs, `any` étant son absence. |
| `reminder`, une fréquence exacte | **supprimé** | Seul le menu déroulant de l'ancien panneau de filtres l'envoyait, et ce panneau est parti avec ce ticket. `alarm=due` répond à la question pour laquelle on l'ouvrait. |
| `priority`, quatre niveaux | **cinq**, `none` compris | La modale dessine `—` pour un enregistrement sans niveau. `NULL` n'est pas une valeur que `IN` peut apparier, donc le contrôleur ressort `none` en **alternative** `IS NULL` — une condition avec un `OR`, pas deux qui se croiseraient en `AND` jusqu'au vide. |

`alarm=due` est la seule condition de `getBookmarksController` qui calcule quelque chose. Une alarme n'a
pas de colonne « prochaine sonnerie » : elle se répète tous les `frequency` jours depuis `date_added`,
ce qui est la façon dont le contrôleur des rappels décide qu'une alarme sonne aujourd'hui. Le nombre de
jours avant la prochaine est donc
`MOD(frequency - MOD(DATEDIFF(CURDATE(), date_added), frequency), frequency)` — le `MOD` extérieur est ce
qui fait sortir 0 pour une alarme qui sonne *aujourd'hui* plutôt qu'une période entière — et
`frequency > 0` garde le modulo, parce que la colonne n'a aucune contrainte et que `MOD(x, 0)` vaut
`NULL`, ce qui écarterait des lignes en silence au lieu d'échouer. La fenêtre est de 3 jours, et **ce
nombre est écrit deux fois** : `REMINDER_DUE_DAYS` dans le contrôleur et le libellé `≤ 3d` dans
`@text/index.ts`. Même arrangement recopié à la main que `FIELD_LIMITS`, signalé dans les deux fichiers.

Un lien écrit avant tout ça — `?alarm=1`, `?starred=1` — dégrade vers *aucun filtre* et non vers une
erreur : `catch(undefined)` sur l'énumération, et une clé inconnue est retirée.

**Les deux nombres qui décident de la mise en page**, tous les deux mesurés, aucun des deux choisi :

1. **6px entre les segments, pas 14.** La maquette donne `gap: 6` à une rangée de segments et `gap: 14`
   aux cases `contains` ; c'est parti avec 14 partout, et les 8px d'écart suffisaient à faire passer
   deux rangées à la ligne — `stars` a besoin de 272px sur une ligne et disposait de 291, mais à 14px
   il en voulait 312, donc le `5` se retrouvait seul sous la rangée d'étoiles et le `low` sous celle des
   priorités. Le bon écart est à la fois le fidèle et celui qui rentre. Les 14px survivent pour les
   cases, et pour une raison : une pilule porte son propre bord, donc 6px se lisent comme une
   séparation ; trois `[x] libellé` nus à 6px se lisent comme une seule chaîne.
2. **`min-w-72` sur chaque moitié d'une paire.** 288px, le pas juste au-dessus des 272 dont la plus
   large de ces rangées a besoin. La bascule devient binaire : soit les deux moitiés font au moins 288
   et aucune ne se replie sur elle-même, soit elles s'empilent et chacune prend toute la largeur de la
   modale. L'entre-deux — une colonne assez large pour tenir à côté de sa voisine mais trop étroite
   pour son propre contenu — est exactement l'état qui imprimait le `5` tout seul. Mesuré après : deux
   colonnes à 291px sur une modale de 640, les quatre rangées sur une ligne ; empilées à 358px sur un
   viewport de 420, toujours une ligne chacune, 10px de gouttière des deux côtés.

**La question laissée en suspens par le §7 du DS est tranchée, et la réponse était « ni l'un ni
l'autre ».** On attendait soit un `@container` sur le contenu avec un seuil à l'échelle de la modale,
soit la bascule dans le composant composé. C'est `flex-wrap` plus un `min-w-*` mesuré, sans aucune
requête : le passage à la ligne est *déjà* conditionné au fait que le contenu ne rentre pas, ce qu'un
seuil ne fait qu'approximer. Et un conteneur sur la modale elle-même aurait rendu `@max-3xl`
**toujours vrai** — 640px est toujours sous 768 — donc pire que jamais.

**Le sélecteur de catégories, après que le nuage a été jeté.** Le contrôle a été livré deux fois. La
première version dessinait les **cinquante-trois** catégories en chips : sept rangées, 204px, plafonnées
et défilantes. Verdict du propriétaire : « un gros pavé indigeste » — et c'était juste, personne ne lit
cinquante-trois pilules pour trouver `dev`, et le simple multi-select de l'app legacy faisait mieux.
`CategoryPicker` le remplace par **un champ à jetons dans lequel on tape, et une rangée de
suggestions** : rien de tapé → les **dix plus utilisées**, classées par `bookmarks_count` (sur le vrai
index : `dev 960`, `youtube 916`, puis une longue traîne, donc les deux catégories qui portent l'archive
sont à un clic) ; en train de taper → les **dix meilleures correspondances**, alphabétiques, avec
`+N more` au-delà. Ce qui est sélectionné reste dans le champ sous forme de jetons amovibles dans les
deux cas, donc une catégorie hors du top dix ne peut pas être sélectionnée-mais-invisible. `↵` ajoute la
première suggestion, `⌫` sur un champ vide retire le dernier jeton, et un jeton est **un seul bouton qui
se supprime** — un bouton dans un bouton est du markup invalide, et le jeton entier est une cible plus
grande qu'un glyphe de 10px.

**« Most used » a demandé du serveur.** `GET /categories` rendait les lignes brutes de la table ; il
porte maintenant un `COUNT(DISTINCT b.id)` par catégorie, avec `b.active = 1` dans la **condition de
jointure** pour que les huit catégories que rien n'utilise reviennent à `0` au lieu de disparaître. Cela
n'allume **pas** les compteurs du rail — ils restent vides et restent DATA 05 (COS-310) ; le nombre
existe, simplement.

⚠️ **`esc` vide la recherche sans fermer la modale, et l'état est remonté pour cette seule raison.**
L'écouteur de fermeture de Radix est sur `document` en phase de **capture**, donc il passe avant que
l'événement n'atteigne l'input : un `stopPropagation` dans le champ arrive trop tard — c'était la
première tentative, et la modale se fermait quand même en emportant le brouillon. Le point d'accroche
supporté est `onEscapeKeyDown` sur `DialogContent`, une prop deux niveaux au-dessus, donc la chaîne de
recherche vit là. Sur un champ vide, `esc` ferme comme d'habitude.

**Le rail est une colonne en trois parties et seule celle du milieu défile** (demande du propriétaire).
La carte était le conteneur de défilement, ce qui faisait défiler tout : `INDEX · CAT` glissait sous le
bord haut, et sur un vrai index de cinquante-trois catégories les quatre scopes se retrouvaient 1500px
sous la ligne de flottaison — quatre filtres qui marchent, hors d'atteinte. Le libellé et le bloc de
scopes sont maintenant `shrink-0`, la liste prend `min-h-0 flex-1 overflow-y-auto`. Mesuré : libellé et
scopes au même y après avoir fait défiler la liste de 811px, et le `scrollHeight` de la carte égal à son
`clientHeight`.

**Et la place de la scrollbar, corrigée deux fois dans les deux sens** (demande du propriétaire).
Un pouce en superposition — le défaut de Chrome sur macOS — est peint *par-dessus* le contenu au lieu de
tenir un couloir réservé, donc ce sont les bords du conteneur de défilement qui décident s'il tombe sur
une ligne ou à côté : le padding est passé de la carte au scroller (sur la carte, le bord droit de la
liste tombait 14px à l'intérieur du panneau, c'est-à-dire sur les lignes, et la barre couvrait l'angle
arrondi de la ligne survolée), puis le scroller a gagné `mr-1.5` parce que sans marge la barre venait se
coller au bord du panneau, ce qui est aussi mauvais vu de l'autre côté. Mesuré : **8px** entre le bord
droit d'une ligne et la barre, **7px** entre la barre et la bordure du panneau.

⚠️ **Et `min-w-0` sur la ligne, qui est un tout autre bug déguisé en celui-là.** La taille minimale
automatique d'un élément de grille est son `min-content` : une ligne du rail refusait donc d'être plus
étroite que son libellé le plus long non tronqué — mesurée à **175,8px dans une piste de 166px**, avec
9,8px de débordement à droite que `overflow-hidden` coupait. *C'est* ce qui transformait `all 1278` en
`all 127` : la barre n'y était pour rien, elle rendait seulement le débordement visible. Le
`min-w-0 flex-1 truncate` du libellé ne pouvait pas s'appliquer, puisqu'on ne demandait jamais à la ligne
qui le contient de rentrer. La moitié « piste » du correctif est `grid-cols-1`, que Tailwind écrit
`repeat(1, minmax(0, 1fr))` précisément pour ça.

**Ce qui a été décidé au passage.** `⌥F` **ouvre et ne ferme jamais** :
`event.code === "KeyF"` et non `event.key`, parce que sur macOS `Alt` est une touche de composition et
`⌥F` produit `ƒ` ; la maquette fait basculer, mais la modale contient un champ texte et `⌥F` tapé dedans
jetterait un brouillon. `esc`, le fond et le `×` ferment, ce qui fait déjà trois manières. Le hint de la
barre d'état passe de `f filter` à `⌥f filter` — un hint qui nomme un raccourci inexistant est pire que
pas de hint. `ui/dialog` porte désormais la géométrie GRAPHITE, `w-[calc(100%-1.25rem)] max-w-160`, à la
place du `sm:max-w-lg` de shadcn : la gouttière est la moitié fluide et reste, une modale d'une autre
taille change le plafond (`max-w-110` pour la confirmation de suppression, `max-w-170` pour l'édition).

**Et `nuqs` n'entre pas**, alors que le ticket demandait de l'envisager. L'URL est déjà l'état et
`helpers/indexQuery.ts` possède déjà toutes les conversions ; la bibliothèque remplacerait un fichier
que ce système documente par une dépendance, et le brouillon de la modale est justement le seul état
délibérément *hors* de l'URL.

**QA locale, 53 assertions de fonctions pures + une passe navigateur.** Les assertions : lecture d'URL
(`alarm` dans ses trois états, `alarm=1` d'avant qui dégrade, `priority` partiellement invalide qui
garde le reste, `stars=9` écarté) · requête d'API (ordre stable des clés, flag faux absent, niveaux
normalisés avec `none` en dernier) · l'expression (`stars:3+` et non `stars:3`, ordre fixe indépendant
de l'ordre des clics) · les deux `href` (remplacement complet contre correctif partiel, filtre vidé qui
disparaît, tri conservé, `reset` qui ne garde que le tri) · l'égalité entre le scope `starred` du rail
et le segment `1+` de la modale · les libellés (singulier/pluriel de `N results`, `5` sans `+`).
Les conditions SQL nouvelles sont prouvées **directement sur la vraie base** : `stars>=1` → 22,
`stars>=3` → 21, `stars>=5` → 8 (monotone), `armed` 11 + `none` 1267 = 1278 (le total), `due<=3` → 8,
`prio none` → 1266 et `low+none` → 1269 = 1266 + 3. La passe navigateur, en Chrome sans tête piloté en
CDP sur un compte d'essai de 40 enregistrements créé puis supprimé : les deux ouvertures (bouton et
champ de requête), les trois fermetures (`esc`, fond, `×`), `⌥F`, le focus qui tombe sur le champ titre,
la frappe qui met à jour l'expression et le compte (`amiga` → 14 résultats), l'application qui navigue
et ferme (`?title=amiga`, 14 lignes), la réouverture qui sème depuis l'URL, le brouillon abandonné qui
ne revient pas, `reset` qui ramène 22 lignes, et la géométrie à 1440, 1100×460 (la modale à 436px =
460 − 24, en-tête et pied collés, défilement interne) et 420px. `next build` passe, `tsc --noEmit`
propre, lint front inchangé sur les fichiers touchés.

⚠️ **Non vérifié : le jugement.** Les couleurs, la densité, le confort de lecture — la passe visuelle du
propriétaire reste à faire, comme sur UI 01, UI 02 et UI 03.

---

## 6 ter. DATA 03 — les doublons avant le commit (COS-308)

Ce que ça pose : **`GET /bookmarks/duplicates?url=…`**, le hook `useDuplicateCandidates`, et le bloc
`InsertDuplicates` sous le récapitulatif de l'écran de création. C'est aussi le **de-mock du point 2
de COS-329** — la ligne `2 duplicate candidates in index` était le `2` de la maquette, en dur dans
`CREATE_TEXT.mock`, parce que rien ne cherchait. COS-329 se réduit à deux points : la capture
automatique et le titre récupéré depuis le `<title>`.

✅ **Et depuis, à zéro** : COS-329 a livré le titre, et la capture automatique est partie en COS-393,
annulé — le retrait de ses lectures est COS-394. Plus rien n'est mocké sur cet écran. Voir le §0.

La question est posée sur `url.normalised`, c'est-à-dire sur le helper de COS-338, celui-là même
qu'appelle le staging d'import. C'est tout l'intérêt d'avoir pris DATA 09 avant : les deux écrans ne
peuvent pas être en désaccord sur ce qu'est un doublon.

⚠️ **Le second étage est refusé, pas oublié** — la mesure et l'arbitrage sont au §0. Le refus est
écrit dans l'en-tête du contrôleur, avec les chiffres, pour que personne ne le rouvre sans les
relire.

⚠️ **Les candidats sont listés, ce que la maquette ne fait pas, et la raison est dans ses trois
derniers mots.** « Review before commit » est une consigne qu'on ne peut pas suivre depuis un
nombre : il faut voir ce qu'il a compté. Une ligne par candidat, le titre et le jour où il a été
enregistré — le plus petit ajout qui rend la ligne actionnable. **Chaque lien s'ouvre dans un
onglet** : réviser un doublon veut dire quitter un formulaire rempli, et rien ici ne sauve un
brouillon qui part.

⚠️ **`no duplicate in index` est dessiné aussi, plutôt que rien.** Un bloc absent ne se distingue pas
d'une vérification qui n'a pas tourné, et « l'index ne l'a pas encore » est précisément ce que veut
savoir quelqu'un en train de remplir ce formulaire. Le seul cas où le bloc disparaît est le champ
vide, où il n'y a effectivement rien à dire.

**Trois bornes qui se lisent dans le code :** l'endpoint renvoie **cinq** candidats au plus et le
compte entier à côté (le volet fait 340px, l'écran est un formulaire, et il n'existe pas encore
d'écran qui les liste tous — ce sera COS-335) ; il répond **200 avec zéro** à une url vide, absente
ou illisible, parce que l'écran demande à chaque frappe stabilisée et qu'un 400 mettrait une erreur
sous un formulaire simplement pas fini ; et `b.active = 1`, donc une fiche supprimée n'est pas une
raison d'en refuser une nouvelle — la même lecture que l'index, les alarmes, la fiche et l'import.

**QA faite en local, 39 assertions sur l'API réelle**, **deux** comptes jetables créés puis
supprimés, index retrouvé à ses 1 243 urls et 1 331 fiches : la même page reconnue par cinq écritures
différentes (chaîne identique, sans `www.`, avec barre finale, en `http`, avec un autre paramètre de
tracking), un vrai paramètre de requête qui en fait une autre page, le second compte qui ne voit pas
les fiches du premier ni l'inverse, sept copies comptées et cinq renvoyées, l'ordre du plus récent,
une fiche retirée qui sort du compte, `/duplicates` qui n'est pas lu comme un identifiant de fiche,
une url plus longue que la colonne refusée en 400, et une requête sans session refusée en 401.

⚠️ **La QA visuelle n'a pas été faite, et pas faute d'avoir essayé.** L'extension Chrome n'est pas
connectée ; en Chrome sans tête piloté par CDP, le bac à sable de cette session laisse le rendu
joindre l'origine qu'il a chargée et **rien d'autre**, donc tout XHR de 3100 vers 3101 meurt en
`Failed to fetch`. Un proxy d'une seule origine (`/api` vers 3101, le reste vers 3100 — la forme
qu'a la production) rend bien l'API joignable depuis la page, et `curl` à travers lui se connecte en
200 ; la même requête émise par le navigateur répond 500, ce qui n'a pas été reproduit ailleurs et
n'a pas été poursuivi. **Ce qui précède est du markup et du CSS, pas une capture** — même formule
qu'UI 01.

---

## 7. Ce que le handoff implique côté données

- `hash`, `log` (événements horodatés), `related · same tags` — absents de `backend/src/db/bkmk.sql`.
  **Reportés** (§8.2) : blocs masqués dans la fiche, aucune migration MySQL dans ce chantier.
- Pagination **serveur** 22 lignes/page (`?page=`) ; aujourd'hui cliente.
- Objet de filtres : `title`, `categories[]`, `stars`, `priority[]`, `reminder`, `contains{shot,notes,url}`.
  **Arrêté par COS-300** (§6 bis) : `stars` est un *minimum*, `reminder` devient `alarm` à trois états
  (`armed | none | due`), `priority[]` accepte `none`, et le flag `starred` disparaît — six champs, un
  par contrôle de la modale.
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

   ⚠️ **Trois des quatre ont été retirées depuis** (COS-328 pour la copie d'auth, COS-321 pour le
   chrome, sur demande du propriétaire) : `IDX/2.4.1`, `uptime 04:12` et `build 2.4.1 · tls on`.
   La règle n'a pas changé — une valeur statique se rend telle quelle — mais elle disait comment
   rendre ces lectures, pas qu'il fallait remplir chaque emplacement que la maquette dessine. Un
   numéro de build que rien dans le projet ne produit et une horloge qui n'avance jamais ne
   valaient pas leur place. Il reste `sync 12s`, dans `status.index`.
2. **Champs manquants** (`hash`, `log`, `related`) — **plus tard**. Aucune migration MySQL dans
   ce chantier. Les écrans sont livrés avec ces trois blocs **masqués** (pas de faux contenu,
   pas de squelette permanent), et COS-309 les rallume au lot DATA quand le schéma les portera.
   Concerne la fiche record (COS-301) : `hash`, `log`, `related · same tags`.
3. **Périmètre visuel** — la refonte **remplace intégralement** l'UI. Pas de mode « ancien
   thème », pas de sélecteur, pas de bascule : `.theme-graphite` est le seul thème et l'ancien
   CSS part avec les écrans qu'il habillait.

---

## 9. Découpage en tickets Linear

**38 tickets dans le projet BKMK** — le compte inclut ceux ouverts en cours de route, listés en
bas de section. Ordre d'exécution :

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
COS-313 (doc design system) · **COS-327 (FIN 04 — favicon GRAPHITE, ouvert en cours de route)**

**Hors découpage initial**, ouverts en cours de route : COS-321 (menu utilisateur) ·
COS-322 · COS-323 (report vers pfa) · **COS-324 (AUTH 05 — récupération par passphrase)** ·
**COS-325** · COS-326 (bug d'UI 03 : la bande d'actions recouvre l'url sous le pli)

> Les tickets de sécurité encore ouverts sont référencés par leur numéro seul, sans leur contenu :
> le dépôt est public, Linear ne l'est pas. Règle en tête du §6.

---

## 10. Après GRAPHITE — axes d'amélioration (hors périmètre de la refonte)

> **Ce lot ne fait pas partie de la refonte.** Il a été ouvert le 2026-07-31, une fois la question
> posée autrement : quand GRAPHITE sera terminé, qu'est-ce que bkmk ne sait toujours pas faire ?
> Aucun de ces tickets ne bloque un ticket de la refonte, aucun ne change son périmètre, et le §0
> continue de ne suivre qu'elle. Ils se prennent quand elle est finie — ou entre deux, s'ils
> tombent bien.

### 10.1 Trois constats qui ont recadré la question

Vérifiés dans le code, pas déduits.

1. **La recherche ne marche pas sur la majeure partie de l'index.**
   `uploadBookmarksController.js:63` stocke les titres importés en
   `encodeURIComponent(anyASCII(title))`, le formulaire legacy (`CreateBookmark.tsx:122`) encode
   tous les champs, et l'écran insert GRAPHITE stocke le titre brut en n'encodant que les notes
   (`useBookmarkCreate.ts:52`). `getBookmarksController.js:125` compare la saisie **décodée** à cette
   colonne : toute recherche contenant une espace rate donc toutes les lignes importées, qui sont
   l'essentiel de l'index. Six sites de rendu appellent `decodeURIComponent` pour défaire ça, dont un
   dans un `try/catch` parce qu'un `%` littéral lève (`RecordNote.tsx:41`).
   ⚠️ **Trois inexactitudes relevées en faisant le ticket** (COS-334), gardées ici parce que le
   constat, lui, était juste. Le formulaire legacy n'encodait **que** les notes — le
   `encodeURIComponent` de `CreateBookmark.tsx:122` était dans la branche `else if (name === "notes")`,
   tout le reste passait par un `append` nu (relu dans `b4bd2005^`). Les sites de rendu sont **neuf
   appels dans huit fichiers**, pas six : « six » est ce que compte un `grep decodeURIComponent`, qui
   rate les sept appels passant par le helper `decodeNote` et compte deux fois le contrôleur. Et
   `uploadBookmarksController.js` n'existait déjà plus : COS-307 l'a remplacé par le staging, qui
   stocke le titre brut — deux des trois « retirer les `encodeURIComponent` » du ticket étaient déjà
   faits avant qu'il ne soit pris.
2. **Il n'y a pas de champ de recherche.** Le champ `query` de la barre de commande est un
   `<button>` qui ouvre la modale de filtres (`IndexCommandBar.tsx:55`), et le filtre derrière ne
   regarde que `b.title` — ni les notes, ni l'url. Or l'url est le seul texte que possède la plupart
   des lignes : un import n'apporte que `title` + `url`.
3. **L'index fait ~1 280 lignes et 53 catégories**, pas les 312 de la maquette (mesures reportées
   dans `IndexRail.tsx:152` et `IndexPager.tsx:15`). À cette taille, « je corrigerai à la main en
   SQL » cesse d'être vrai, et les catégories créées par un `if (!category.id) INSERT` présent dans
   deux contrôleurs produisent des doublons de nom par construction.

### 10.2 Les huit tickets

Dans l'ordre des dépendances. Chaque description s'ouvre sur la mention « axe d'amélioration, en
plus de la refonte GRAPHITE ».

| Ticket | Titre | Dépend de |
|---|---|---|
| COS-332 | PLAT 06 — Runner de migrations et table `schema_migrations` | — |
| COS-333 | DATA 06 — Export de l'index (json · csv · netscape html) ✅ | — |
| COS-334 | DATA 07 — Normaliser le texte en base (titres et notes décodés) ✅ | COS-332 |
| COS-335 | UI 14 — La barre de commande devient un champ de recherche (titre, notes, url) | COS-334 |
| COS-336 | DATA 08 — Catégories : dédupe des noms et contrainte d'unicité | COS-332 |
| COS-337 | UI 15 — Gestion des tags : renommer, fusionner, recolorer, purger | COS-336 |
| COS-338 | DATA 09 — `url` : forme normale, colonne `host`, backfill ✅ | COS-332 |
| COS-339 | UI 16 — Axe `host` dans le rail | COS-338 |

Trois choses à retenir de ce découpage :

- **Le runner passe avant.** `backend/src/db/migrations/` contient un fichier, aucun runner, aucune
  trace de ce qui est appliqué où, et `bkmk.sql` est un `CREATE DATABASE`, pas un schéma de
  référence. Quatre de ces tickets veulent une migration. `schemas/bookmarks.ts:12` le dit déjà :
  *« with no versioned DDL, `.nullish()` is the only honest assumption »*.
  ✅ **Fait (COS-332)** — `backend/src/db/migrate.js`, table `schema_migrations`, quatre commandes.
  Détail en 10.2 bis ci-dessous.
- **L'export passe avant la normalisation du texte** : c'est le diagnostic en lecture seule qui
  montre l'ampleur des dégâts avant que quoi que ce soit ne réécrive 1 280 lignes.
- **DATA 07 ne peut pas être un `.sql`** — MySQL n'a pas de fonction de décodage d'URL. C'est un
  script Node, premier écart à la convention des migrations à la main, et la raison d'être du runner.
  ✅ **Fait (COS-334)** — `2026-08-01-decode-text.js`, 1 177 valeurs réécrites en une transaction.
  Détail en 10.2 quinquies. L'écart n'était déjà plus le premier : COS-338 avait pris la même sortie
  deux tickets plus tôt, pour la même raison, MySQL ne sachant pas non plus lire une url.

Deux pièges de migration, identiques dans leur forme : l'`UNIQUE (user_id, name)` de COS-336 et
l'éventuel index unique sur l'url normalisée de COS-338 **échouent tant que les doublons existent**.
La passe de nettoyage précède la contrainte, dans le même ticket.

⚠️ **Le second des deux n'existe plus : COS-338 a refusé l'index unique**, et pas parce que les
doublons gênaient — parce que la table `url` n'a pas de `user_id`. Détail en 10.2 ter. Le piège reste
entier pour COS-336, dont la table en a un.

### 10.2 bis PLAT 06 (COS-332) — le runner, fait le 2026-08-01

Pris hors ordre du lot GRAPHITE, parce que DATA 03 le demandait par la bande : la détection de
doublons de COS-308 n'a de sens qu'avec la normalisation d'url de COS-338, et COS-338 est bloquée
par le runner. C'est le propriétaire qui a tranché entre « COS-308 au caractère près maintenant » et
« la chaîne 332 → 338 → 308 » ; il a pris la chaîne.

**`backend/src/db/migrate.js`, table `schema_migrations`, quatre commandes.** `status` dit ce qui a
tourné, `up` applique les fichiers en attente dans l'ordre du nom, et les deux autres existent parce
qu'une base peut être dans trois situations différentes :

| Situation | Commande | Pourquoi |
|---|---|---|
| Une migration passée à la main (le dev, pour les deux d'avant le runner) | `mark <fichier>` | La rejouer échouerait sur une colonne en double ; ne rien enregistrer ferait réessayer `up` |
| Une base neuve créée depuis `bkmk.sql` | `baseline` | Le script de création porte déjà tout ce que les fichiers décrivent |
| La production, qui n'a ni l'un ni l'autre | `up` | Les deux migrations s'appliquent |

⚠️ **Le tableau `Applied` du README est supprimé** — c'était le seul état, et il n'était juste que
tant que quelqu'un pensait à l'éditer. `pnpm migrate:status` le remplace. Le §0 continue de citer les
migrations en attente côté production, mais c'est la base qui répond maintenant.

⚠️ **Pas de transaction autour d'une migration, parce que MySQL n'en donne pas** : le DDL commite
implicitement et un `ALTER TABLE` termine la transaction qui l'entoure. Le runner s'arrête au premier
échec et n'enregistre rien pour lui — `status` montre alors exactement où il en est. **Et pas de
runner au démarrage** : `server.js` tourne sous pm2 avec `watch: true` en dev, donc une migration
partirait sur une sauvegarde de fichier.

⚠️ **Le runner ouvre sa propre connexion**, avec `multipleStatements` — que `dbinitmysql` n'a pas et
ne doit pas avoir : c'est ce qui élargit une injection qui passerait. Les réglages viennent de
`process.env`, et à défaut d'`ecosystem.config.js`, en choisissant `env_dev` sauf si `NODE_ENV` dit
production. Une commande qui vise la prod parce qu'une variable manquait n'est pas une erreur à
faire une fois.

⚠️ **Vérifié sur quatre chemins, dont celui de la production.** Le dev a été enregistré (`mark` ×2,
puis `up` répond « nothing to apply », et un second `mark` ne double pas la ligne). Une migration
`.js` jetable a été appliquée pour de vrai et une `.sql` volontairement fautive juste après : la
première est enregistrée, la seconde sort en code 1 sans laisser de ligne, et `status` le montre.
Une base jetable créée depuis `bkmk.sql` a validé le script de création à neuf tables et la commande
`baseline`. Enfin cette même base a été ramenée à la forme qu'a la production — colonne et table
retirées, journal vidé — et `up` a rejoué les deux migrations : colonne et table sont revenues. Base
jetable supprimée ensuite.

### 10.2 ter DATA 09 (COS-338) — la forme normale, fait le 2026-08-01

Pris juste après le runner, qui était son seul blocage. Ce que ça pose : **`backend/src/helpers/normaliseUrl.js`**,
deux colonnes `url.normalised` et `url.host`, la migration `.js` qui les remplit, et le balayage des
lignes que personne ne pointait.

**La forme normale est une colonne, pas un calcul à la volée** — la question ouverte du ticket. Une
colonne, parce que la comparaison doit pouvoir être un index plutôt que 1 280 parsings d'`URL` par
question posée. C'est une **clé**, pas une url : le schéma tombe, donc elle ne se parse pas et ne
doit jamais être affichée ni ouverte. Le faire tomber est ce qui fait marcher l'exemple du ticket —
`http://x.com/a/` et `https://x.com/a` sont la même page, et tout hôte sérieux répond aux deux depuis
dix ans.

⚠️ **Pas d'`UNIQUE` sur `normalised`, et c'est une décision, pas un oubli.** Le ticket pose la
question, la table répond : `url` n'a **pas de `user_id`**. Une clé unique forcerait deux comptes qui
marquent la même page sur une seule ligne, et `editBookmarkController` met cette ligne à jour *en
place* — enregistrer votre fiche réécrirait le lien d'un inconnu. « Même url » est une question qui
ne se pose jamais qu'à l'intérieur d'un compte (`markImportDuplicates` la cadre déjà, COS-308 fera
pareil), donc l'index est un index ordinaire : il rend la recherche rapide, la propriété reste où
elle est. C'est aussi ce qui retire à ce ticket le piège annoncé en 10.2 — il n'y a plus de contrainte
à faire échouer.

⚠️ **Ce que la normalisation fusionne sur l'index réel, mesuré : une paire.** `react-select.com/home`
et la même adresse avec `#fixed-options`, sur 1 237 lignes actives. Ce n'est pas l'argument. L'argument
est ailleurs : **1 075 lignes sur 1 237 portent `www.`**, 57 une barre finale, 5 un paramètre de
tracking — aujourd'hui chacune est un doublon que le prochain import va créer, et COS-307 comme
COS-308 n'avaient aucune définition à interroger. L'index contient par ailleurs **38 lignes
strictement égales entre elles**, ce qui est l'autre moitié de la même histoire. Le chiffre est écrit
dans `markImportDuplicates` pour que personne ne relise ce helper en croyant qu'il a nettoyé la base.

⚠️ **2 685 lignes d'`url` sur 3 928 — 68 % — n'étaient atteignables depuis aucun bookmark.** C'est ce
que produit « insérée sans condition, sans transaction autour » sur trois ans. Le balayage passe en
premier dans la migration, et il ne touche **que** ce que personne ne pointe : une ligne dont le seul
bookmark est inactif reste, parce que la suppression est douce et que jeter l'url d'une fiche retirée
rendrait cette suppression-là définitive. La clé étrangère refuserait de toute façon, ce qui est le
schéma qui dit la même chose.

⚠️ **Et le robinet est fermé, sinon le balayage est un nettoyage daté.** `postBookmarkController`
insère l'url *avant* le bookmark et n'a pas de transaction : un échec sur la seconde requête laissait
la première derrière. Trois lignes le reprennent. Le même chemin fabrique aussi une `alarm` orpheline
— pas dans ce ticket, et c'est **COS-353** qui le prend. Mesuré depuis : la base de dev n'a **aucune**
alarme orpheline, donc pas de migration ; ce que la mesure a trouvé à la place est plus gros, la
boucle de catégories tourne après le commit du bookmark et un échec y laisse une fiche créée
derrière un 500.

⚠️ **`host` perd son `www.`, y compris là où il est affiché.** `parseImportFile` calculait le sien
avec `new URL(link).host` : la table de staging annonçait `www.youtube.com` là où la colonne stocke
`youtube.com`, deux réponses à « quel hôte » pour un lien, et l'axe `host` du rail (COS-339) se serait
construit sur l'autre. Les deux appellent le helper maintenant. Conséquence visible : la colonne du
milieu du staging et la ligne `host` de l'aperçu d'insertion affichent l'hôte sans `www.` — c'est
aussi sous ce nom que l'index range la ligne. Le garde-fou est celui du helper : `www.com` est un
domaine, et lui retirer son label laisserait `com`.

**Détails qui se voient à la lecture du helper :** la requête est recoupée dans **l'encodage
d'origine** plutôt que reconstruite par `URLSearchParams.toString()`, qui ré-encode — un `~` revient
en `%7E`, trois caractères pour un, et une transformation autorisée à *grandir* est un 500 sur une
url assez longue. Couper des paires ne fait que raccourcir, ce qui rend la colonne sûre sans clamp
(vérifié sur les 1 243 lignes : la plus longue clé fait 533 pour un original de 545). L'ordre des
paramètres est laissé tel quel : trier a été mesuré sur l'index et ne fusionne rien, l'ordre venant
des liens du site lui-même. Une chaîne qu'`URL` ne sait pas lire est sa propre clé, sans hôte —
l'index en contient deux, dont `I won't do it again`.

**QA faite en local, 39 assertions sur l'API réelle** (compte jetable créé puis supprimé, index
retrouvé à ses 1 243 lignes) : création avec une url volontairement sale
(`https://WWW.Example-QA.test/Page/?utm_source=rss&keep=1&fbclid=zz#frag` → clé
`example-qa.test/Page?keep=1`, original intact), édition qui met la ligne à jour sans la remplacer,
édition qui retire l'url et emporte la ligne sans laisser d'orpheline, puis un fichier d'import dont
trois lignes visent la même page par trois chemins différents — **trois `DUP` là où c'étaient quatre
`NEW` avant ce ticket**. Le commit en importe une, la seconde lecture du même fichier n'y trouve plus
rien de neuf, et une fiche retirée redevient nouvelle (`b.active = 1`, inchangé).

**La migration a été vérifiée sur trois bases**, dont celle qui compte : le dev réel (3 928 → 1 243
lignes, 1 331 bookmarks et 1 280 actifs identiques avant/après, aucun `url_id` déplacé, aucun
`original` réécrit, chaque ligne supprimée prouvée sans référent, et la clé relue depuis la base
égale à ce que le helper répond pour les 1 243) ; une base neuve depuis `bkmk.sql`, dont la table
`url` est colonne pour colonne et index pour index celle que la migration produit ; et une base
ramenée à la forme qu'a la **production** — aucune des trois migrations appliquée — où `up` les
rejoue dans l'ordre, balaie les orphelines, garde celle de la fiche retirée, et où rejouer le fichier
par-dessus une base qui l'a déjà ne change rien. Les deux bases jetables sont supprimées.

**Reliquat, sans ticket :** `url.short` n'est plus renseigné nulle part — les trois seules lignes qui
en avaient une étaient orphelines et sont parties avec le balayage. La colonne reste, personne ne la
lit.

### 10.2 quater DATA 06 (COS-333) — la sortie, faite le 2026-08-01

`GET /bookmarks/export?format=json|csv|html`, trois écritures dans
`helpers/exportFormats.js`, et un menu `export` sur la barre de commande de l'index. bkmk savait
importer et pas sortir : la seule copie lisible d'un compte était le `mysqldump` que le cron envoie
en SFTP deux fois par jour.

⚠️ **`json` est fidèle, les deux autres sont lisibles — c'est une décision, pas une incohérence.**
Les titres et les notes sont stockés percent-encodés : **1 154 des 1 280 fiches actives** de l'index
de dev, et les 19 notes sur 19. `json` écrit ce que la base contient, sans décoder — c'est la
sauvegarde *et* le diagnostic pour lequel ce ticket passe avant DATA 07, puisque savoir quelles
lignes portent l'encodage disparaît à la seconde où quelque chose les décode. `csv` et `html` sont
lus par autre chose que bkmk — son propre import, et un navigateur — donc ils portent le texte comme
on le lit. Le fichier json le dit lui-même, dans un champ `textEncoding` qui partira avec COS-334.

⚠️ **L'index entier, pas la vue filtrée.** La jointure est celle de `getBookmarksController` moins
ses filtres et moins son `LIMIT`. Un export se prend quand on s'en va ou qu'on sauvegarde, et un
contrôle qui rend discrètement un sous-ensemble est la seule chose qu'une sauvegarde ne doit pas
faire. Le menu l'annonce **avant** d'être ouvert (`the whole index`), parce que la barre juste à côté
peut porter un filtre. Exporter un filtre est une autre fonctionnalité, et il lui faut une surface
qui dise lequel.

⚠️ **Une fiche sans url est dans le `json` et dans aucun des deux autres** — 43 des fiches actives.
`title;` relu par l'import est une ligne comptée malformée, et `<A HREF="">` est un lien vers la page
où l'on est. Le format fidèle les garde, les formats d'échange ne peuvent pas les porter. Les
captures d'écran sont des **noms de fichiers** partout : mettre du base64 dans une sauvegarde la
multiplierait par la seule chose dedans que personne ne lit.

⚠️ **Le bouton est placé, pas recopié : le handoff ne dessine aucun contrôle d'export.** Sur la barre
de commande, à côté de `filter`, qui est l'autre contrôle agissant sur la liste entière. L'écran
About — l'autre suggestion du ticket — est servi **sans session** et ne pouvait pas porter un
contrôle qui en demande une.

⚠️ **Le téléchargement passe par `privateRequest`, pas par une ancre `download`.** L'ancre marche —
GET, cookie `SameSite=lax`, navigation de premier niveau — et c'est le problème : elle court-circuite
la redirection 401 → `/login`, donc une session expirée enregistre une page de connexion nommée
`bkmk-2026-08-01.csv`. Le blob est récupéré puis remis au navigateur. Le compte de fiches voyage sur
un en-tête `X-Record-Count`, exposé par `Access-Control-Expose-Headers` — sans quoi le front, qui est
sur un autre port en dev, lit `undefined`.

**QA faite en local, 50 assertions sur l'API réelle**, deux comptes jetables créés puis supprimés,
index retrouvé à ses 1 243 urls, 1 331 fiches et 1 280 actives : les trois formats servis avec leur
`Content-Type`, leur `Content-Disposition` daté et leur compte ; le json qui garde le titre encodé
tel quel, la fiche sans url, les étoiles, la priorité, la fréquence d'alarme, le tag et sa couleur,
et qui ne laisse fuir ni `user_id` ni `active` ; le csv décodé, une ligne par fiche avec url,
séparateur retiré du titre ; **le csv relu par l'import de l'application, 4 entrées, 0 malformée, le
titre revenu tel qu'il était écrit** ; le html avec son `DOCTYPE` Netscape, un `ADD_DATE` en secondes,
les `TAGS`, la note en `<DD>` sur deux lignes et le balisage échappé dans les titres ; une fiche
retirée qui quitte l'export ; un format inconnu et un format absent refusés en 400 ; `/export` qui
n'est pas lu comme un identifiant de fiche ; et une requête sans session refusée en 401.

⚠️ **QA visuelle non faite**, même empêchement qu'au §6 ter — le menu et son bouton sont du markup et
du CSS, pas une capture.

### 10.2 quinquies DATA 07 (COS-334) — le texte en base, fait le 2026-08-01

`backend/src/db/migrations/2026-08-01-decode-text.js`, **1 177 valeurs réécrites en une transaction**
sur les 1 331 lignes de l'index de dev : 1 154 titres et 23 notes. Les encodages partent de l'écriture
(`useBookmarkCreate.ts`, seul restant des trois que listait le ticket), les décodages de la lecture
(neuf appels, huit fichiers, plus le helper `decodeNote` supprimé), et le `FIELD_LIMITS.notes * 3` de
l'API redevient `FIELD_LIMITS.notes` — le facteur 3 ne couvrait que le gonflement de l'encodage.

⚠️ **Un seul décodage, jamais une boucle, et l'index en fournit la preuve deux fois.** Ce n'est pas
une précaution de principe : « décoder tant que ça change » casse deux lignes réelles.
`bookmark 1` est une note qui contient une url LinkedIn, et cette url porte ses propres échappements
dans sa query string (`?trackingId=…%2F…%3D%3D`) ; stockée, elle lit `%252F` — **un**
encodage d'une chaîne qui en contenait déjà, pas deux encodages. Une passe rend la note telle qu'elle
a été tapée, url intacte ; une seconde mangerait l'échappement de l'url et rendrait un lien mort.
`bookmark 275` dit la même chose autrement : stocké
`YouTube%20to%20Mp3%20Converter%20(up%20to%20320kbps)%20%5B100%25%20Working%5D`, il décode proprement
en `YouTube to Mp3 Converter (up to 320kbps) [100% Working]` et **lève** à la seconde passe, `%20W`
n'étant pas un échappement. C'est une ligne que la migration réécrit, et à laquelle elle ne doit plus
jamais toucher.

⚠️ **La migration est sélective, et la clause qui ne servait à rien est celle qui sert maintenant.**
Une valeur contenant une espace littérale a été écrite en clair — `encodeURIComponent` transforme une
espace en `%20` et ne peut donc pas en produire — et la décoder mangerait un `%20` que son auteur a
tapé. **Avant** la passe : 137 valeurs portaient une espace, et **aucune** n'aurait été réécrite sans
cette clause ; elle ne protégeait rien. **Après** : 1 310 en portent, et elle est ce qui sépare deux
d'entre elles — les deux ci-dessus — d'une seconde passe qui les corromprait. Le script imprime les
deux comptes à chaque exécution, donc la garde dit elle-même si elle sert. Rejouée, la migration
trouve **0 valeur à réécrire**, ce qui compte : le runner n'enregistre rien pour un fichier qui a
échoué, donc une reprise repart du début.

⚠️ **Une transaction, et c'est la migration qui pouvait en avoir une.** `migrate.js` n'en enveloppe
délibérément aucune, parce que MySQL ne la donnerait pas : le DDL commit implicitement et un
`ALTER TABLE` dans une transaction la termine (§10.2 bis). Ce fichier-ci n'a **aucun** DDL — 1 177
`UPDATE` — donc il prend la sienne. Un index à moitié décodé est le mauvais résultat ici : les lignes
resteraient lisibles, rien n'échouerait, et rien ne dirait quelle moitié est passée.

⚠️ **Une cinquième commande au runner, `dry-run`, et elle est opt-in par fichier.** Le ticket demandait
de pouvoir lire les ~1 280 lignes avant de les écrire ; `pnpm migrate:dry-run <fichier>` imprime le
diff et n'écrit rien — et n'enregistre rien non plus, une migration prévisualisée reste en attente.
Le runner refuse un `.sql` (donner les statements à MySQL, *c'est* les exécuter) et refuse un `.js`
qui n'a pas déclaré `migration.dryRun = true`, parce qu'un dry run sur un fichier qui ignore l'option
est une application complète avec un mot rassurant devant. `2026-08-01-add-url-normal-form.js` ne le
déclare pas et est refusé, ce qui est le comportement voulu.

⚠️ **Deux des trois « retirer les `encodeURIComponent` » étaient déjà faits**, ce que le ticket ne
pouvait pas savoir : `uploadBookmarksController.js` a disparu avec COS-307 et `CreateBookmark.tsx`
avec COS-319. Il restait `useBookmarkCreate.ts:52`, partagé par la création et l'édition.

⚠️ **Le round-trip d'édition était une migration à la main, en cours depuis COS-319.** `fromRecord`
décodait le titre **et** les notes, `toBookmarkFormData` ne ré-encodait que les notes : donc
**enregistrer une fiche décodait silencieusement son titre en base**, une ligne à la fois, au gré de
ce que quelqu'un éditait. C'est exactement ce que la migration fait en une passe, sauf qu'elle le
fait pour tout le monde et qu'elle le dit.

⚠️ **Deux choses trouvées en dehors de la liste du ticket, prises parce que ce ticket les touchait.**
La première : `decodeURIComponent(title)` était un **second** décodage — Express a déjà déséchappé la
query string — donc chercher `100%` répondait 500. En le retirant, la ligne cesse de lever et se met
à traiter le `%` de l'utilisateur comme un joker `LIKE` : un crash échangé contre une réponse fausse
n'est pas une correction, donc `%`, `_` et `\` sont échappés, la virgule étant mappée **après** puisque
c'est le seul joker que cette recherche veut dire. Le `_` était déjà un joker silencieux avant le
ticket. La seconde : `multipart/form-data` réécrit tout saut de ligne d'un champ texte en `CRLF`, ce
que l'encodage cachait (`\n` voyageait en `%0A`). Les 8 notes multi-lignes de l'index portent `\n` ;
sans `helpers/storedText.js`, une note enregistrée après ce ticket aurait été la seule ligne de la
colonne avec l'autre convention — la forme même du défaut que le ticket ferme, réintroduite par sa
correction.

⚠️ **Et un octet NUL littéral dans `draft.ts`**, séparateur de `sameDraft` depuis COS-319. Il est
correct — aucun nom de catégorie ne peut le contenir — mais un fichier qui en contient un est un
**fichier binaire** pour git et pour grep : `git diff` imprimait `Bin 6499 -> 6798 bytes` et aucune
ligne, `grep -rn` répondait `Binary file … matches`. Le seul module partagé par l'écran insert et la
modale d'édition était le seul fichier illisible en revue. Écrit `"\u0000"`, même valeur.

⚠️ **Ce que le ticket ne répare pas, et il le disait :** `anyASCII` supprimait aussi les accents à
l'import, donc `Café` était déjà `Cafe` dans le fichier arrivé en base. Le décodage rend les espaces
et la ponctuation, il ne rend pas ce qui n'a jamais été écrit.

**La recherche, mesurée avant/après sur les 1 331 lignes** — c'est le constat 1 du §10.1 :
`React Hook Form` 7 → 13, `Google Search` 11 → 36, `Stack Overflow` 0 → 6, `a Command` 1 → 4,
`de la` 2 → 5. Les lignes qu'elle atteignait déjà sont celles que l'écran insert et les imports depuis
COS-307 avaient écrites en clair. Le tri en profite sans que rien ne le demande : `?sort=title`
comparait `%` (0x25) à l'espace (0x20) sur une colonne mixte, donc il n'a jamais été alphabétique.
En revanche **aucun écran n'affichait `Framework%20reimagined`** : les neuf décodages de rendu
faisaient leur travail. Le défaut était dans les comparaisons, pas à l'écran.

**QA faite en local, 52 assertions sur l'API réelle**, compte jetable créé puis supprimé, index
retrouvé à ses 1 331 fiches, 1 280 actives et 1 243 urls : la migration relue ligne à ligne contre un
instantané pris avant elle — **chaque réécriture est exactement un décodage de ce qui était là, et
chacune se ré-encode exactement en ce qui était là**, donc la passe est réversible et prouvée telle ;
le titre et les notes écrits verbatim à la création comme à l'édition, saut de ligne compris ; une
recherche contenant un `%` littéral qui répond 200 et trouve la fiche ; `%` et `_` littéraux qui ne
sont plus des jokers ; la virgule qui l'est toujours ; l'ancienne orthographe encodée qui ne trouve
plus rien ; 1 000 caractères acceptés et 1 001 refusés en 400 ; les trois formats d'export qui portent
le même texte, le json sans son champ `textEncoding` ; les doublons et les rappels qui rendent le
titre tel quel.

⚠️ **QA visuelle non faite**, même empêchement qu'au §6 ter.

**Reliquats, sans ticket.** Deux notes actives dépassent la borne des 1 000 caractères une fois
décodées (id 93 à 1 322, id 1399 à 2 071) : elles ne pouvaient pas être enregistrées depuis le
formulaire avant ce ticket — le front validait déjà la note décodée contre 1 000 — et elles ne le
peuvent pas davantage après. Le ticket ne change pas leur sort, il rend la limite lisible. Et
**COS-308 récupère la moitié de son objection** : le second étage (même hôte, titre proche) était
refusé pour deux raisons, dont « les titres sont encodés » ; celle-là tombe. L'autre — 7 paires
trouvées, 7 fausses, un index à 78 % un seul hôte — est intacte, et c'est une nouvelle mesure qui doit
trancher, pas la colonne devenue lisible.

### 10.3 Ajustements sur des tickets existants (pas de nouveau ticket)

- **COS-306** est livré à ~90 % par UI 03 / UI 04 : pagination serveur, objet de filtres à six
  champs, requête de comptage et `describeQuery` sont en place. Reliquat réel : l'arithmétique de
  pagination est cliente parce que l'API ne renvoie ni `page` ni `pages`. À redécouper ou à fermer.
  ⚠️ **Fait depuis** : le reliquat a été pris tel quel, augmenté du retrait de `?userID=` que COS-322
  lui avait légué. Voir le §0.
- **COS-307 et COS-308** dépendent de COS-338 : la détection de doublons n'a aujourd'hui aucune
  définition de « même url ».
  ⚠️ **Tranché depuis, pour COS-307** : la dépendance a été assumée plutôt que prise. Le staging
  dédupe sur la chaîne exacte, l'écart est écrit dans `markImportDuplicates` et au §0, et DATA 09
  n'aura qu'un fichier à changer. COS-308 garde la question entière.
  ✅ **Soldé depuis (COS-338)** : la définition existe, c'est `url.normalised`, et le staging la lit —
  le fichier annoncé est bien le seul qui a changé. **COS-308 a maintenant sa réponse** : la même
  colonne, cadrée au compte, et l'index qui va avec. Reste entier de son côté : ce que l'écran de
  création fait de la réponse.
- **COS-329** absorbe la favicon si l'occasion se présente — c'est le même fetch que le titre
  automatique. À stocker localement : pointer un service de favicons tiers poserait une balise sur
  chaque ligne d'un index dont l'écran de signup annonce « self-hosted · no tracking ».
  ❌ **Écartée depuis, après avoir été construite** : l'index est à 78 % un seul hôte, donc la colonne
  de 16 px dessinerait la même marque sur ~17 lignes sur 22. Le raisonnement complet, le chiffre et le
  coût de reconstruction sont au §0 et en tête de `helpers/fetchPageTitle.js` — c'est là qu'il faut
  repartir si la question se rouvre, pas de la phrase du ticket. La règle du stockage local, elle,
  reste juste et n'a jamais été le point de blocage.

### 10.4 Écartés, et pourquoi

Consigné ici pour ne pas les reproposer.

| Idée | Pourquoi non |
|---|---|
| Vues enregistrées | L'URL **est** déjà l'état : chaque filtre est une adresse partageable, et l'utilisateur fait tourner un gestionnaire de bookmarks |
| Tags et résumés par IA | Envoie le contenu des pages à un tiers depuis un produit qui annonce « no tracking », la machine ne fera pas tourner de modèle local, et étiqueter automatiquement dans un vocabulaire à doublons ne fait qu'empirer le vocabulaire plus vite. Le problème est COS-336, pas un modèle |
| Archivage du contenu des pages | Bonne intuition, mauvais ordre : on construit le capteur avant la réponse, et la croissance du stockage n'est surveillée par rien |
| Extension navigateur, PWA share target | Un bookmarklet passant `?url=&title=` à l'écran insert prend l'essentiel pour presque rien ; l'extension sort du dépôt unique et la PWA demande un manifest et un service worker qui n'existent pas |
| Vérificateur de liens morts | **Reporté, pas écarté.** Les hôtes hostiles aux robots répondent 403 ou 429, et un vérificateur qui crie au loup sur des liens vivants est pire que rien. Demande aussi une passe qui tient une connexion, `dbinitmysql.js` en ouvrant une par requête |
| `last_opened_at` | **Reporté.** C'est le meilleur signal d'élagage pour une archive de cet âge, et l'action `↗` existe déjà pour l'accrocher — mais c'est de la journalisation de comportement dans un produit qui annonce ne pas en faire. Décision du propriétaire, pas un défaut |

---

## 11. Fichiers de référence

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
