import { DEFAULT_HOST, GUESTS, MAX_CATCH_UP } from "../../lib/ranking";

export const metadata = { title: "Règles — Repas des mecs" };

// Keep this page in line with lib/ranking.js: it describes exactly what the code does.
export default function Rules() {
  return (
    <main className="rules">
      <h1>Règles</h1>
      <p className="subtitle">Comment le site choisit qui est invité au prochain dîner.</p>

      <h2>En bref</h2>
      <div className="card">
        <p>
          Chaque dîner réunit <strong>{GUESTS + 1} personnes</strong> : l'hôte et {GUESTS} invités. Les {GUESTS}{" "}
          invités sont les {GUESTS} premiers du classement. Les suivants forment la liste d'attente.
        </p>
        <p>
          Le principe : <strong>ceux qui sont venus le moins souvent passent devant</strong>, pour que chacun vienne
          à peu près autant que les autres.
        </p>
      </div>

      <h2>L'hôte</h2>
      <ul>
        <li>
          L'hôte est le nom écrit en colonne B de la ligne « organisateur » (ou « hôte ») de l'onglet du dîner.
        </li>
        <li>
          Si la case est vide, ou si l'onglet du prochain dîner n'existe pas encore, l'hôte est{" "}
          <strong>{DEFAULT_HOST}</strong>.
        </li>
        <li>L'hôte n'est pas classé : il a sa place d'office.</li>
      </ul>

      <h2>Qui est classé</h2>
      <ul>
        <li>
          Tous les membres marqués « Oui » dans la colonne « Actif? » de l'onglet « Liste des participants ».
        </li>
        <li>Un membre marqué « Non » n'est ni classé ni invité, mais ses dîners passés restent dans les statistiques.</li>
        <li>Un nouveau membre s'ajoute en bas de la liste.</li>
      </ul>

      <h2>Ordre de priorité</h2>
      <p>Les membres sont classés selon ces règles, dans cet ordre. On ne passe à la règle suivante qu'en cas d'égalité.</p>
      <ol className="steps">
        <li>
          <strong>Priorité hôte.</strong> L'hôte d'un dîner passe en tête pour le dîner suivant. S'il n'a pas pu venir à
          ce dîner, il passe en tête pour celui d'après. Ce dîner d'invitation n'est{" "}
          <strong>pas compté</strong> dans son nombre de dîners : il ne lui coûte rien pour la suite.
        </li>
        <li>
          <strong>Le moins de dîners d'abord.</strong> Celui qui est venu le moins souvent passe devant.
        </li>
        <li>
          <strong>Rattrapage limité à {MAX_CATCH_UP} dîners.</strong> Un membre est considéré comme ayant au plus{" "}
          {MAX_CATCH_UP} dîners de retard sur celui qui en a fait le plus. Exemple : quelqu'un qui revient après 4 mois
          d'absence ne rattrape que {MAX_CATCH_UP} dîners ; il ne passe pas devant tout le monde pendant des mois.
        </li>
        <li>
          <strong>Le plus ancien d'abord.</strong> À égalité, celui qui n'est pas venu depuis le plus longtemps passe
          devant.
        </li>
        <li>
          <strong>Ordre de la liste.</strong> À égalité encore, c'est l'ordre de l'onglet « Liste des participants » qui
          tranche. Il n'y a pas de tirage au sort.
        </li>
      </ol>

      <h2>Ce qui compte comme une venue</h2>
      <ul>
        <li>« oui » sous son nom dans l'onglet du dîner : la personne est venue.</li>
        <li>
          « non » : la personne s'est désistée. <strong>Un désistement ne compte pas comme une venue</strong>, elle
          remonte donc d'elle-même dans le classement.
        </li>
        <li>Le nom écrit dans « Remplacé par… » compte comme venu à la place de celui qui s'est désisté.</li>
        <li>Un dîner compte à partir du lendemain de sa date.</li>
        <li>Seuls les dîners qui ont leur propre onglet comptent. Le premier est celui du 11 novembre 2026.</li>
      </ul>

      <h2>Désistements et liste d'attente</h2>
      <ul>
        <li>Si un invité dit non, on appelle le premier de la liste d'attente, puis le suivant, etc.</li>
        <li>
          Dès que les invités sont écrits dans l'onglet du dîner, la page « Prochain dîner » affiche cette liste réelle
          (vient, excusé, remplacé par…) et la liste d'attente sans les personnes déjà appelées.
        </li>
      </ul>

      <h2>Les noms</h2>
      <p>
        Les noms des onglets de dîner sont comparés à ceux de la liste des participants sans tenir compte des
        majuscules, des accents, des points, des virgules, des tirets ni des espaces en trop : « Michel R. » =
        « michel r », « Jean-Michel » = « Jean Michel », « Thalès » = « Thales ». Une vraie faute d'orthographe (« Micheal ») n'est en revanche pas reconnue.
      </p>
    </main>
  );
}
