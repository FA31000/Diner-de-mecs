import { loadSheet } from "../lib/sheet";
import { rankNextDinner, includesName, sameName } from "../lib/ranking";

export const dynamic = "force-dynamic";

function plural(n, word) {
  return `${n} ${word}${n > 1 ? "s" : ""}`;
}

function Details({ person }) {
  if (!person) return null;
  return (
    <span className="details">
      {plural(person.count, "dîner")}
      {person.bonusCount > 0 && ` (+${person.bonusCount} invitation d'hôte non comptée)`}
      <br />
      {person.lastDate ? `dernier : ${person.lastDate}` : "jamais venu"}
    </span>
  );
}

function Person({ person, rank }) {
  return (
    <li>
      <span>
        <span className="rank">{rank}.</span>
        {person.name}
        {person.owed && " (priorité hôte)"}
      </span>
      <Details person={person} />
    </li>
  );
}

function Status({ invite }) {
  if (invite.answer === "oui") return <span className="status yes">vient</span>;
  if (invite.answer === "non")
    return (
      <span className="status no">
        excusé{invite.replacement ? ` → remplacé par ${invite.replacement}` : ", à remplacer"}
      </span>
    );
  return <span className="status">pas encore répondu</span>;
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

  const { next, host, guests, waiting, ranked } = result;
  const find = (name) => ranked.find((person) => sameName(person.name, name));

  // Once the invitations are written in the dinner's tab, show them as they are.
  const invited = (next?.invited || []).filter((invite) => !sameName(invite.name, host));
  const taken = [...invited.map((i) => i.name), ...invited.map((i) => i.replacement).filter(Boolean)];
  const stillWaiting = ranked.filter((person) => !includesName(taken, person.name));
  const toReplace = invited.filter((i) => i.answer === "non" && !i.replacement).length;

  return (
    <main>
      <h1>Prochain dîner</h1>
      <p className="subtitle">{next ? next.name : "Date pas encore fixée"}</p>

      <h2>Hôte</h2>
      <ol>
        <li className="organizer">{host}</li>
      </ol>

      {invited.length > 0 ? (
        <>
          <h2>Invités</h2>
          <p className="subtitle">D'après l'onglet du dîner dans le Sheet.</p>
          <ol>
            {invited.map((invite, i) => (
              <li key={invite.name}>
                <span>
                  <span className="rank">{i + 1}.</span>
                  {invite.name}
                  {find(invite.name)?.owed && " (priorité hôte)"}
                  <br />
                  <Status invite={invite} />
                </span>
                <Details person={find(invite.name)} />
              </li>
            ))}
          </ol>

          <h2>Liste d'attente</h2>
          <p className="subtitle">
            {toReplace > 0
              ? `${plural(toReplace, "place")} à remplacer : appeler dans cet ordre.`
              : "Si un invité dit non, on appelle le suivant."}
          </p>
          <ol>
            {stillWaiting.map((person, i) => (
              <Person key={person.name} person={person} rank={i + 1} />
            ))}
          </ol>
        </>
      ) : (
        <>
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
        </>
      )}
    </main>
  );
}
