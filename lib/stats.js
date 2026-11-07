import { includesName, pastDinners, sameName } from "./ranking";

// Status of one member at one dinner, with who replaced whom.
function presenceAt(dinner, name) {
  if (dinner.host && sameName(dinner.host, name)) return { status: "hote" };
  const replaced = Object.keys(dinner.replacedBy).find((person) => sameName(dinner.replacedBy[person], name));
  if (replaced) return { status: "remplacant", other: replaced };
  if (includesName(dinner.declined, name)) {
    const person = Object.keys(dinner.replacedBy).find((other) => sameName(other, name));
    return { status: "non", other: person ? dinner.replacedBy[person] : null };
  }
  if (includesName(dinner.attendees, name)) return { status: "venu" };
  return { status: "" };
}

export function buildStats({ members, dinners }) {
  const past = pastDinners(dinners);

  const people = members.map((member) => ({
    name: member.name,
    active: member.active,
    attended: past.filter((dinner) => includesName(dinner.attendees, member.name)).length,
    hosted: past.filter((dinner) => dinner.host && sameName(dinner.host, member.name)).length,
    declined: past.filter((dinner) => includesName(dinner.declined, member.name)).length,
    // One entry per past dinner.
    presence: past.map((dinner) => presenceAt(dinner, member.name)),
  }));

  return { dinners: past, people };
}
