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
- Ligne « organisateur » (en ligne 2, au-dessus des noms) : le nom de l'organisateur est écrit en colonne B, à droite du libellé.
- Le tableau récapitulatif en bas de l'onglet est ignoré.

## Règles de calcul

### Qui est venu à un dîner passé
Pour chaque colonne de la ligne des noms :
- « oui » → la personne est venue.
- « non » → elle n'est pas venue (désistement). Le nom dans « Remplacé par » est venu à sa place.

Un dîner compte dès le lendemain de sa date. On part de zéro : seuls les dîners qui ont leur propre onglet comptent. Le premier est le 11 novembre 2026.

### Comparaison des noms
Les noms des onglets de dîner sont comparés à ceux de la liste des participants en ignorant majuscules, points, virgules et espaces en trop. « Michel R. » = « michel r ».

### Le prochain dîner
- C'est l'onglet dont la date est aujourd'hui ou plus tard, le plus proche.
- 6 personnes au total : l'organisateur + 5 invités.
- Organisateur = le nom en colonne B de la ligne « organisateur » de cet onglet. Si la case est vide ou s'il n'y a pas d'onglet : **Michel R** par défaut.

### Classement des autres membres actifs
1. Bonus organisateur : celui qui a organisé un dîner doit être invité à l'un des 2 dîners suivants. S'il n'est pas venu au dîner d'après, il passe en tête de la liste du dîner suivant.
2. Ensuite, ceux qui sont venus le moins souvent passent devant.
3. Rattrapage limité : on considère qu'un membre a au maximum 2 dîners de retard sur celui qui en a fait le plus. (Ex. : parti 4 mois, il ne rattrape que 2 dîners.)
4. À égalité : celui qui n'est pas venu depuis le plus longtemps passe devant.
5. À égalité encore : l'ordre de l'onglet « Liste des participants ».

Un désistement ne compte pas comme une venue. La personne remonte donc d'elle-même en tête.

## Le site

### Page « Prochain dîner »
1. Date du prochain dîner et organisateur.
2. Les 5 invités (les 5 premiers du classement).
3. La liste d'attente, dans l'ordre : si un invité dit non, on appelle le suivant.
4. À côté de chaque nom : nombre de dîners et date du dernier dîner.

### Page « Statistiques »
- A. Nombre de dîners par personne.
- B. Nombre de fois organisateur par personne.
- C. Nombre de désistements par personne.
- D. Tableau des présences : qui était à quel dîner.

### Fonctionnement
- Le site relit le Google Sheet à chaque ouverture. Pas de base de données, pas de tâche automatique.
- Pas de mot de passe. Lecture seule. Le site n'écrit jamais dans le Sheet.
- En français.

## Technique
- Next.js 16, hébergé gratuitement sur Vercel.
- Code sur GitHub : https://github.com/FA31000/Diner-de-mecs (compte FA31000).
- Le serveur télécharge une copie du Sheet (export xlsx public) et la lit avec SheetJS. Aucune clé Google.
- **L'application ne modifie jamais le Google Sheet.** Aucun code d'écriture.

### Fichiers
- `lib/sheet.js` : télécharge et lit le Sheet (membres + un objet par onglet de dîner : date, venus, désistés, organisateur). Les lignes sont trouvées par leur libellé en colonne A (« Repas du », « Viendra », « Remplacé par », « organisateur »). Les personnes commencent en colonne C.
- `lib/ranking.js` : applique les règles de classement.
- `app/page.js` : page « Prochain dîner ».
- Lancer en local : `npm run dev`, puis http://localhost:3000.

## Phases
1. **Préparer le Sheet** (Michel / vous) : partage par lien (déjà fait, en Éditeur — on n'y touche pas), ligne « organisateur » (fait), remplacer A à E par les vrais noms.
2. **Page « Prochain dîner »** : lecture du Sheet + règles de classement. Test en local. ✅ Fait.
3. **Page « Statistiques »**.
4. **Mise en ligne** sur Vercel.

## Historique des changements
- 2026-11-03 — Organisateur : lu dans la colonne B de la ligne « organisateur » (au lieu d'un « oui » sous le nom).
- 2026-11-03 — Site branché sur le tableau test (180CWvjX…) au lieu du vrai Sheet.
- 2026-11-03 — Noms : points et virgules ignorés dans la comparaison (`clean()` dans `lib/sheet.js`).
- 2026-11-03 — Phase 2 : projet Next.js créé ; lecture du Sheet (`lib/sheet.js`), règles de classement (`lib/ranking.js`), page « Prochain dîner » (`app/page.js`). Testé en local et avec de faux dîners (désistement, bonus organisateur, membre inactif).
- 2026-11-03 — Phase 1 : ligne « organisateur » ajoutée au Sheet (format « oui » sous le nom). Partage par lien déjà actif, laissé en Éditeur.
- 2026-11-03 — Création du plan après l'appel de découverte et les questions/réponses. Aucun code écrit.
