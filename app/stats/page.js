import { loadSheet } from "../../lib/sheet";
import { buildStats } from "../../lib/stats";
import { clean } from "../../lib/sheet";

export const dynamic = "force-dynamic";

function Presence({ presence, dinner }) {
  const { status, other } = presence;
  if (status === "hote") return <span className="host-mark" title={`Hôte du ${dinner}`}>✓</span>;
  if (status === "venu") return "✓";
  if (status === "remplacant")
    return (
      <span title={`A remplacé ${other}`}>
        ✓<sup>R</sup>
      </span>
    );
  if (status === "non") return <span title={other ? `Remplacé par ${other}` : "Désisté, pas remplacé"}>✗</span>;
  return "";
}

// Who replaced whom, dinner by dinner (tooltips are not visible on a phone).
function Replacements({ dinners, people }) {
  const display = (name) => people.find((p) => clean(p.name) === clean(name))?.name || name;
  const rows = dinners.flatMap((dinner) =>
    Object.entries(dinner.replacedBy).map(([person, by]) => ({ dinner: dinner.name, person: display(person), by: display(by) }))
  );
  if (rows.length === 0) return null;
  return (
    <>
      <h2>Remplacements</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Dîner</th>
              <th>Désisté</th>
              <th>Remplacé par</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.dinner + row.person}>
                <td>{row.dinner}</td>
                <td>{row.person}</td>
                <td>{row.by}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

export default async function Stats() {
  let stats;
  try {
    stats = buildStats(await loadSheet());
  } catch (error) {
    return (
      <main>
        <h1>Statistiques</h1>
        <p className="error">{error.message}</p>
      </main>
    );
  }

  const { dinners, people } = stats;

  return (
    <main>
      <h1>Statistiques</h1>
      <p className="subtitle">
        {dinners.length} dîner{dinners.length > 1 ? "s" : ""} passé{dinners.length > 1 ? "s" : ""}
      </p>

      <h2>Par personne</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              <th>Dîners</th>
              <th>Hôte</th>
              <th>Désistements</th>
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.name} className={person.active ? "" : "inactive"}>
                <td>
                  {person.name}
                  {!person.active && " (inactif)"}
                </td>
                <td>{person.attended}</td>
                <td>{person.hosted}</td>
                <td>{person.declined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Présences</h2>
      <p className="subtitle">
        <span className="host-mark">✓</span> hôte · ✓ venu · ✓<sup>R</sup> venu en remplaçant · ✗ désisté
      </p>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nom</th>
              {dinners.map((dinner) => (
                <th key={dinner.name}>{dinner.name}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {people.map((person) => (
              <tr key={person.name} className={person.active ? "" : "inactive"}>
                <td>{person.name}</td>
                {person.presence.map((status, i) => (
                  <td key={dinners[i].name}>
                    <Presence presence={status} dinner={dinners[i].name} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Replacements dinners={dinners} people={people} />
    </main>
  );
}
