import { loadSheet } from "../../lib/sheet";
import { buildStats } from "../../lib/stats";

export const dynamic = "force-dynamic";

const SYMBOLS = { venu: "✓", non: "✗", "": "" };

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
              <th>Organisés</th>
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
                <td>{person.organized}</td>
                <td>{person.declined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Présences</h2>
      <p className="subtitle">✓ venu · ✗ désisté</p>
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
                  <td key={dinners[i].name}>{SYMBOLS[status]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
