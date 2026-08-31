/* Small formatting helpers. Norwegian Bokmål, sentence case, concrete counts. */

/** "God morgen" before 10:00, "God dag" before 18:00, "God kveld" after. */
export function timeGreeting(now: Date = new Date()): string {
  const h = now.getHours();
  if (h < 10) return "God morgen";
  if (h < 18) return "God dag";
  return "God kveld";
}

/** "1 nytt treff" / "4 nye treff" / "Ingen nye treff". */
export function hitLabel(count: number): string {
  if (count === 1) return "1 nytt treff";
  if (count > 0) return `${count} nye treff`;
  return "Ingen nye treff";
}

/** "1 produsent du ikke følger" / "14 produsenter du ikke følger". */
export function unfollowedCountText(n: number): string {
  return `${n} ${n === 1 ? "produsent" : "produsenter"} du ikke følger`;
}

/** Norwegian collation, used by the Produktnavn / Produsent sorts. */
export function compareNb(a: string, b: string): number {
  return a.localeCompare(b, "nb");
}
