import * as XLSX from "xlsx";

// Test copy. Real Sheet: 1zetJQAHLpDFrMhDWR6vWM3eUk_EYsh87iJkohTWnUA0
const SHEET_ID = "180CWvjX6cR7yfBvPs0Wg7NyWwhXyWEyHEYEG27iWUTY";
const EXPORT_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=xlsx`;
const PARTICIPANTS_TAB = "Liste des participants";

const MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

// Ignores case, dots, commas and extra spaces: "Michel R." = "michel r"
export function clean(text) {
  return String(text ?? "").replace(/[.,]/g, " ").replace(/\s+/g, " ").trim().toLowerCase();
}

// "Mercredi 11 novembre 2026" -> "2026-11-11"
function parseTabDate(name) {
  const match = clean(name).match(/(\d{1,2})\s+([a-zéû]+)\s+(\d{4})/);
  if (!match) return null;
  const month = MONTHS.indexOf(match[2]);
  if (month === -1) return null;
  return `${match[3]}-${String(month + 1).padStart(2, "0")}-${match[1].padStart(2, "0")}`;
}

function findRow(rows, label) {
  return rows.find((row) => clean(row[0]).startsWith(label)) || [];
}

function readDinner(name, rows) {
  const names = findRow(rows, "repas du");
  const answers = findRow(rows, "viendra");
  const replacements = findRow(rows, "remplacé par");
  // The host row may be labelled "hôte" or "organisateur".
  const hostRow = findRow(rows, "hôte").length ? findRow(rows, "hôte") : findRow(rows, "organisateur");

  const attendees = [];
  const declined = [];
  const replacedBy = {};
  // Everyone listed in the tab, with their answer ("oui", "non" or "" if not answered yet).
  const invited = [];
  // Host name is written in column B, next to the "organisateur" / "hôte" label.
  const host = String(hostRow[1] ?? "").trim() || null;

  // Columns A and B are labels; people start at column C.
  for (let col = 2; col < names.length; col++) {
    const person = String(names[col] ?? "").trim();
    if (!person) continue;
    const answer = clean(answers[col]);
    const replacement = answer === "non" ? String(replacements[col] ?? "").trim() || null : null;
    invited.push({ name: person, answer: answer === "oui" || answer === "non" ? answer : "", replacement });
    if (answer === "oui") attendees.push(person);
    if (answer === "non") {
      declined.push(person);
      if (replacement) {
        attendees.push(replacement);
        replacedBy[person] = replacement;
      }
    }
  }

  return { name, date: parseTabDate(name), attendees, declined, replacedBy, invited, host };
}

// Read-only: downloads a copy of the Sheet. Never writes to it.
export async function loadSheet() {
  const response = await fetch(EXPORT_URL, { cache: "no-store" });
  if (!response.ok) throw new Error(`Impossible de lire le Google Sheet (${response.status})`);
  const workbook = XLSX.read(await response.arrayBuffer());

  const participantRows = XLSX.utils.sheet_to_json(workbook.Sheets[PARTICIPANTS_TAB], { header: 1 });
  const members = participantRows
    .slice(1)
    .filter((row) => String(row[0] ?? "").trim())
    .map((row) => ({ name: String(row[0]).trim(), active: clean(row[1]) === "oui" }));

  const dinners = workbook.SheetNames
    .filter((name) => name !== PARTICIPANTS_TAB)
    .map((name) => readDinner(name, XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 })))
    .filter((dinner) => dinner.date)
    .sort((a, b) => a.date.localeCompare(b.date));

  return { members, dinners };
}
