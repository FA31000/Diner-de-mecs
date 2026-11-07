import { clean } from "./sheet";

export const DEFAULT_HOST = "Michel R";
export const GUESTS = 5;
export const MAX_CATCH_UP = 2;

function todayInFrance() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Europe/Paris" });
}

export function sameName(a, b) {
  return clean(a) === clean(b);
}

export function includesName(list, name) {
  return list.some((other) => sameName(other, name));
}

// A dinner counts from the day after its date.
export function pastDinners(dinners) {
  const today = todayInFrance();
  return dinners.filter((dinner) => dinner.date < today);
}

// Host bonus: the host of a dinner is invited first to the next dinner;
// if he could not come to it, he is invited first to the one after.
// `dinners` is the list of dinners before this one, `host` the host of this one.
export function owedHosts(dinners, host) {
  const last = dinners[dinners.length - 1];
  const twoAgo = dinners[dinners.length - 2];
  const owed = [];
  if (last?.host) owed.push(last.host);
  if (twoAgo?.host && !includesName(last.attendees, twoAgo.host)) owed.push(twoAgo.host);
  return owed.filter((name, i) => !sameName(name, host) && owed.findIndex((other) => sameName(other, name)) === i);
}

// For each past dinner, the guests who came thanks to the host bonus.
// Those visits are not counted against them in the ranking.
export function bonusVisits(past) {
  return past.map((dinner, i) =>
    owedHosts(past.slice(0, i), dinner.host).filter((name) => includesName(dinner.attendees, name))
  );
}

export function rankNextDinner({ members, dinners }) {
  const today = todayInFrance();
  const past = pastDinners(dinners);
  const next = dinners.find((dinner) => dinner.date >= today) || null;
  const bonus = bonusVisits(past);

  const active = members.filter((member) => member.active);
  const hostName = next?.host || DEFAULT_HOST;
  const host = active.find((member) => sameName(member.name, hostName))?.name || hostName;
  const owed = owedHosts(past, host);

  const stats = active.map((member, order) => {
    const attended = past.filter((dinner) => includesName(dinner.attendees, member.name));
    const counted = past.filter(
      (dinner, i) => includesName(dinner.attendees, member.name) && !includesName(bonus[i], member.name)
    );
    return {
      name: member.name,
      order,
      count: counted.length,
      bonusCount: attended.length - counted.length,
      lastIndex: counted.length ? past.indexOf(counted[counted.length - 1]) : -1,
      lastDate: attended.length ? attended[attended.length - 1].name : null,
    };
  });

  const maxCount = Math.max(0, ...stats.map((s) => s.count));
  const ranked = stats
    .filter((s) => !sameName(s.name, host))
    .map((s) => ({
      ...s,
      owed: includesName(owed, s.name),
      catchUpCount: Math.max(s.count, maxCount - MAX_CATCH_UP),
    }))
    .sort((a, b) => b.owed - a.owed || a.catchUpCount - b.catchUpCount || a.lastIndex - b.lastIndex || a.order - b.order);

  return {
    next,
    host,
    guests: ranked.slice(0, GUESTS),
    waiting: ranked.slice(GUESTS),
    ranked,
  };
}
