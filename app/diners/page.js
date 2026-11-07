import { loadSheet, clean } from "../../lib/sheet";
import { pastDinners } from "../../lib/ranking";

export const dynamic = "force-dynamic";

export default async function PastDinners() {
  let sheet;
  try {
    sheet = await loadSheet();
  } catch (error) {
    return (
      <main>
        <h1>Dîners précédents</h1>
        <p className="error">{error.message}</p>
      </main>
    );
  }

  // Show names as written in the participants list ("MICHEL R" -> "Michel R").
  const displayName = (name) => sheet.members.find((m) => clean(m.name) === clean(name))?.name || name;
  const dinners = pastDinners(sheet.dinners).reverse();

  return (
    <main>
      <h1>Dîners précédents</h1>
      <p className="subtitle">Du plus récent au plus ancien</p>

      {dinners.length === 0 && <p>Aucun dîner passé pour l'instant.</p>}

      {dinners.map((dinner) => (
        <section key={dinner.name} className="dinner">
          <h2>{dinner.name}</h2>
          <p>
            <strong>Hôte :</strong> {dinner.host ? displayName(dinner.host) : "non indiqué"}
          </p>
          <p>
            <strong>Venus ({dinner.attendees.length}) :</strong> {dinner.attendees.map(displayName).join(", ") || "personne"}
          </p>
          {dinner.declined.length > 0 && (
            <p>
              <strong>Désistements :</strong>{" "}
              {dinner.declined
                .map((name) =>
                  dinner.replacedBy[name]
                    ? `${displayName(name)} (remplacé par ${displayName(dinner.replacedBy[name])})`
                    : displayName(name)
                )
                .join(", ")}
            </p>
          )}
        </section>
      ))}
    </main>
  );
}
