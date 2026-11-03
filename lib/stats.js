import { clean } from "./sheet";
import { includesName, pastDinners } from "./ranking";

export function buildStats({ members, dinners }) {
  const past = pastDinners(dinners);

  const people = members.map((member) => ({
    name: member.name,
    active: member.active,
    attended: past.filter((dinner) => includesName(dinner.attendees, member.name)).length,
    organized: past.filter((dinner) => clean(dinner.organizer) === clean(member.name)).length,
    declined: past.filter((dinner) => includesName(dinner.declined, member.name)).length,
    // One entry per past dinner: "venu", "non" or "".
    presence: past.map((dinner) =>
      includesName(dinner.attendees, member.name) ? "venu" : includesName(dinner.declined, member.name) ? "non" : ""
    ),
  }));

  return { dinners: past, people };
}
