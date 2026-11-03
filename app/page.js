import { loadSheet } from "../lib/sheet";
import { rankNextDinner } from "../lib/ranking";

export const dynamic = "force-dynamic";

function Person({ person, rank }) {
  return (
    <li>
      <span>
        <span className="rank">{rank}.</span>
        {person.name}
        {person.owed && " (organisateur précédent)"}
      </span>
      <span className="details">
        {person.count} dîner{person.count > 1 ? "s" : ""}
        <br />
        {person.lastDate ? `dernier : ${person.lastDate}` : "jamais venu"}
      </span>
    </li>
  );
}

export default async function Home() {
  let result;
  try {
    result = rankNextDinner(await loadSheet());
  } catch (error) {
    return (
      <main>
        <h1>Repas des mecs</h1>
        <p className="error">{error.message}</p>
      </main>
    );
  }

  const { next, organizer, guests, waiting } = result;

  return (
    <main>
      <h1>Prochain dîner</h1>
      <p className="subtitle">{next ? next.name : "Date pas encore fixée"}</p>

      <h2>Organisateur</h2>
      <ol>
        <li className="organizer">{organizer}</li>
      </ol>

      <h2>Invités</h2>
      <ol>
        {guests.map((person, i) => (
          <Person key={person.name} person={person} rank={i + 1} />
        ))}
      </ol>

      <h2>Liste d'attente</h2>
      <p className="subtitle">Si un invité dit non, on appelle le suivant.</p>
      <ol>
        {waiting.map((person, i) => (
          <Person key={person.name} person={person} rank={guests.length + i + 1} />
        ))}
      </ol>
    </main>
  );
}
