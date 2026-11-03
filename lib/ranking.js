import { clean } from "./sheet";

const DEFAULT_ORGANIZER = "Michel R";
const GUESTS = 5;
const MAX_CATCH_UP = 2;

function todayInFrance() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
}

function includesName(list, name) {
  return list.some((other) => clean(other) === clean(name));
}

export function rankNextDinner({ members, dinners }) {
  const today = todayInFrance();
  // A dinner counts from the day after its date.
  const past = dinners.filter((dinner) => dinner.date < today);
  const next = dinners.find((dinner) => dinner.date >= today) || null;

  const active = members.filter((member) => member.active);
  const organizerName = next?.organizer || DEFAULT_ORGANIZER;
  const organizer = active.find((member) => clean(member.name) === clean(organizerName)) || { name: organizerName };

  const stats = active.map((member, order) => {
    const attended = past.filter((dinner) => includesName(dinner.attendees, member.name));
    return {
      name: member.name,
      order,
      count: attended.length,
      lastIndex: attended.length ? past.indexOf(attended[attended.length - 1]) : -1,
      lastDate: attended.length ? attended[attended.length - 1].name : null,
    };
  });

  // Organizer of the dinner before last who missed the last dinner gets a guaranteed spot.
  const twoAgo = past[past.length - 2];
  const last = past[past.length - 1];
  const owedOrganizer = twoAgo?.organizer && !includesName(last.attendees, twoAgo.organizer) ? twoAgo.organizer : null;

  const maxCount = Math.max(0, ...stats.map((s) => s.count));
  const ranked = stats
    .filter((s) => clean(s.name) !== clean(organizer.name))
    .map((s) => ({
      ...s,
      owed: owedOrganizer !== null && clean(s.name) === clean(owedOrganizer),
      catchUpCount: Math.max(s.count, maxCount - MAX_CATCH_UP),
    }))
    .sort((a, b) => b.owed - a.owed || a.catchUpCount - b.catchUpCount || a.lastIndex - b.lastIndex || a.order - b.order);

  return {
    next,
    organizer: organizer.name,
    guests: ranked.slice(0, GUESTS),
    waiting: ranked.slice(GUESTS),
  };
}
