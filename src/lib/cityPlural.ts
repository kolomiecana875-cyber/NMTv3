/** Українські форми множини для ігрових чисел. */

function plural(value: number, one: string, few: string, many: string): string {
  const mod10 = Math.abs(value) % 10;
  const mod100 = Math.abs(value) % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return few;
  return many;
}

export function pluralCoins(value: number): string {
  return plural(value, "монета", "монети", "монет");
}

export function pluralPeople(value: number): string {
  return plural(value, "людина", "люди", "людей");
}

export function pluralBuildings(value: number): string {
  return plural(value, "будівля", "будівлі", "будівель");
}
