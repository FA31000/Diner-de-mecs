# Repas des mecs — Plan

## But
Un site web public, en lecture seule, qui affiche l'ordre de priorité des invités pour le prochain dîner mensuel.
Michel continue de tout gérer dans son Google Sheet. Le site ne fait que lire ce Sheet.

## Source de données : le Google Sheet
- Fichier : « S'inscrire au "repas des mecs" »
- Lien : https://docs.google.com/spreadsheets/d/1zetJQAHLpDFrMhDWR6vWM3eUk_EYsh87iJkohTWnUA0
- Partage : « Tout le monde avec le lien peut consulter ».
- **Pour l'instant, le site lit une copie de test** : « Copy of S'inscrire au "repas des mecs" TEST » — https://docs.google.com/spreadsheets/d/180CWvjX6cR7yfBvPs0Wg7NyWwhXyWEyHEYEG27iWUTY. Pour passer au vrai Sheet, changer `SHEET_ID` dans `lib/sheet.js`.

### Onglet « Liste des participants »
- Colonne A « Nom », colonne B « Actif? » (Oui / Non).
- Seuls les membres « Oui » sont classés et invités.
- L'ordre des lignes sert à départager les égalités (pas de tirage au sort).
- Un nouveau membre est ajouté en bas de la liste.
- Un membre qui part passe à « Non ».

### Un onglet par dîner
- Nom de l'onglet = date du dîner (ex. « Mercredi 11 novembre 2026 »).
- Ligne des noms : la ligne qui commence par « Repas du… ». Une colonne par invité.
- Ligne « Viendra OUI/NON » : oui ou non sous chaque nom.
- Ligne « Remplacé par… » : nom du remplaçant quand la personne a dit non.
- Ligne « organisateur » (ou « hôte »), en ligne 2, au-dessus des noms : le nom de l'hôte est écrit en colonne B, à droite du libellé. Sur le site, on dit « hôte ».
- Le tableau récapitulatif en bas de l'onglet est ignoré.

## Règles de calcul

### Qui est venu à un dîner passé
Pour chaque colonne de la ligne des noms :
- « oui » → la personne est venue.
- « non » → elle n'est pas venue (désistement). Le nom dans « Remplacé par » est venu à sa place.

Un dîner compte dès le lendemain de sa date. On part de zéro : seuls les dîners qui ont leur propre onglet comptent. Le premier est le 11 novembre 2026.

### Comparaison des noms
Les noms des onglets de dîner sont comparés à ceux de la liste des participants en ignorant majuscules, accents, points, virgules, tirets et espaces en trop. « Michel R. » = « michel r », « Jean-Michel » = « Jean Michel », « Thalès » = « Thales ».

### Le prochain dîner
- C'est l'onglet dont la date est aujourd'hui ou plus tard, le plus proche.
- 6 personnes au total : l'hôte + 5 invités.
- Hôte = le nom en colonne B de la ligne « organisateur » (ou « hôte ») de cet onglet. Si la case est vide ou s'il n'y a pas d'onglet : **Michel R** par défaut.

### Classement des autres membres actifs
1. Priorité hôte : l'hôte d'un dîner passe en tête du dîner suivant ; s'il n'y est pas venu, il passe en tête de celui d'après. Ce dîner d'invitation n'est pas compté dans son nombre de dîners (ni pour « dernier dîner » dans le classement).
2. Ensuite, ceux qui sont venus le moins souvent passent devant.
3. Rattrapage limité : on considère qu'un membre a au maximum 2 dîners de retard sur celui qui en a fait le plus. (Ex. : parti 4 mois, il ne rattrape que 2 dîners.)
4. À égalité : celui qui n'est pas venu depuis le plus longtemps passe devant.
5. À égalité encore : l'ordre de l'onglet « Liste des participants ».

Un désistement ne compte pas comme une venue. La personne remonte donc d'elle-même en tête.

## Le site

### Page « Prochain dîner »
1. Date du prochain dîner et hôte.
2. Les 5 invités : les 5 premiers du classement. Dès que des noms sont écrits dans l'onglet du prochain dîner, on affiche plutôt ces noms avec leur réponse (vient / excusé → remplacé par… / pas encore répondu).
3. La liste d'attente, dans l'ordre : si un invité dit non, on appelle le suivant. Les personnes déjà inscrites dans l'onglet (invités et remplaçants) en sont retirées.
4. À côté de chaque nom : nombre de dîners et date du dernier dîner.

### Page « Statistiques » (`/stats`)
Ne compte que les dîners passés. Montre tous les membres de la liste (les inactifs en gris, marqués « inactif »).
- Tableau « Par personne » : nombre de dîners (A), nombre de fois hôte (B), nombre de désistements (C).
- Tableau « Présences » (D) : une colonne par dîner passé. ✓ entouré = hôte, ✓ = venu, ✓ᴿ = venu en remplaçant, ✗ = désisté, vide = pas invité.
- Tableau « Remplacements » : qui a remplacé qui, dîner par dîner.

### Page « Dîners précédents » (`/diners`)
Une carte par dîner passé, du plus récent au plus ancien : date, hôte, liste des venus, désistements (avec « remplacé par … » si un remplaçant est indiqué). Les noms sont affichés comme dans la liste des participants.

### Page « Règles » (`/regles`)
Récapitule toutes les règles de priorité (hôte, classement, ce qui compte comme une venue, désistements, noms). Le texte reprend les réglages de `lib/ranking.js` (5 invités, rattrapage de 2, hôte par défaut). À tenir à jour si les règles changent.

### Menu
Une barre noire (liseré rouge) en haut de chaque page : « Prochain dîner », « Dîners précédents », « Statistiques », « Règles ».

### Fonctionnement
- Le site relit le Google Sheet à chaque ouverture. Pas de base de données, pas de tâche automatique.
- Pas de mot de passe. Lecture seule. Le site n'écrit jamais dans le Sheet.
- En français.

## Technique
- Next.js 16, hébergé gratuitement sur Vercel.
- Code sur GitHub : https://github.com/FA31000/Diner-de-mecs (compte FA31000).
- Le serveur télécharge une copie du Sheet (export xlsx public) et la lit avec SheetJS. Aucune clé Google.
- **L'application ne modifie jamais le Google Sheet.** Aucun code d'écriture.
- Site en ligne : https://diner-de-mecs.vercel.app
- Vercel : projet « diner-de-mecs », relié au dépôt GitHub, redéploie à chaque envoi sur `main`. `vercel.json` force le type Next.js.
- Git : ce dossier a son propre dépôt. Commits signés FA31000, envoi avec le compte FA31000 (via `gh`), réglés pour ce dossier seulement.

### Fichiers
- `lib/sheet.js` : télécharge et lit le Sheet (membres + un objet par onglet de dîner : date, venus, désistés, organisateur). Les lignes sont trouvées par leur libellé en colonne A (« Repas du », « Viendra », « Remplacé par », « organisateur »). Les personnes commencent en colonne C.
- `lib/ranking.js` : applique les règles de classement.
- `app/page.js` : page « Prochain dîner ».
- `lib/stats.js` + `app/stats/page.js` : page « Statistiques ».
- `app/diners/page.js` : page « Dîners précédents ».
- `app/regles/page.js` : page « Règles ».
- `app/layout.js` : menu commun aux pages.
- Lancer en local : `npm run dev`, puis http://localhost:3000.

## Phases
1. **Préparer le Sheet** (Michel / vous) : partage par lien (déjà fait, en Éditeur — on n'y touche pas), ligne « organisateur » (fait), remplacer A à E par les vrais noms.
2. **Page « Prochain dîner »** : lecture du Sheet + règles de classement. Test en local. ✅ Fait.
3. **Page « Statistiques »**. ✅ Fait.
4. **Mise en ligne** sur Vercel. ✅ Fait (avant la phase 3, à la demande).

## Historique des changements
- 2026-11-08 — Couleurs : passage du vert au rouge et noir (style Stade Toulousain) dans `app/globals.css` : barre de menu noire avec liseré rouge, hôte en rouge, titres avec barre rouge, « vient » en noir gras, « excusé » en rouge.
- 2026-11-07 — Noms : les accents sont aussi ignorés (« Thalès » = « Thales »), y compris dans les mois des onglets et les libellés de lignes.
- 2026-11-07 — Noms : les tirets sont aussi ignorés (« Jean-Michel » = « Jean Michel »).
- 2026-11-07 — Page « Règles » ajoutée au menu. Retours de Jean-Michel : priorité hôte (invité au dîner suivant, ou à celui d'après s'il était empêché, sans que ce dîner compte) ; « organisateur » renommé « hôte » sur le site ; hôte entouré dans « Présences », remplaçants marqués ᴿ et tableau « Remplacements » ; la page « Prochain dîner » affiche les vraies réponses de l'onglet du dîner (désistements et remplaçants du jour).
- 2026-11-03 — Page « Dîners précédents » ajoutée au menu ; `lib/sheet.js` garde aussi qui a remplacé qui (`replacedBy`).
- 2026-11-03 — Phase 3 : page « Statistiques » (dîners, organisations, désistements, tableau des présences) + menu en haut des pages.
- 2026-11-03 — Site en ligne sur https://diner-de-mecs.vercel.app, vérifié sur le tableau test.
- 2026-11-03 — Mise en ligne : code envoyé sur GitHub FA31000/Diner-de-mecs, `vercel.json` ajouté (type Next.js) après un échec de déploiement.
- 2026-11-03 — Organisateur : lu dans la colonne B de la ligne « organisateur » (au lieu d'un « oui » sous le nom).
- 2026-11-03 — Site branché sur le tableau test (180CWvjX…) au lieu du vrai Sheet.
- 2026-11-03 — Noms : points et virgules ignorés dans la comparaison (`clean()` dans `lib/sheet.js`).
- 2026-11-03 — Phase 2 : projet Next.js créé ; lecture du Sheet (`lib/sheet.js`), règles de classement (`lib/ranking.js`), page « Prochain dîner » (`app/page.js`). Testé en local et avec de faux dîners (désistement, bonus organisateur, membre inactif).
- 2026-11-03 — Phase 1 : ligne « organisateur » ajoutée au Sheet (format « oui » sous le nom). Partage par lien déjà actif, laissé en Éditeur.
- 2026-11-03 — Création du plan après l'appel de découverte et les questions/réponses. Aucun code écrit.
