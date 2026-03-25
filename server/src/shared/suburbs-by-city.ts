/**
 * Known suburbs grouped by city — aligned with `server/scripts/dummy-data.json`
 * `properties.suburbsByCity` (seed / UX reference). Used to expand a suburb-only
 * search to the whole metro (same city + all catalog suburbs).
 */
export const SUBURBS_BY_CITY: Readonly<Record<string, readonly string[]>> = {
  Kathmandu: [
    "Budhanilkantha",
    "Kapan",
    "Tokha",
    "Sitapaila",
    "Jorpati",
    "Soyambhunath",
    "Boudhanath",
    "Chabahil",
    "Gaushala",
    "Sankhamul",
    "Baneshwor",
    "Thapathali",
  ],
  Bhaktapur: [
    "Lokanthali",
    "Kaushaltar",
    "Gaththaghar",
    "Balkot",
    "Dadhikot",
    "Sirutar",
    "Duwakot",
    "Bode",
    "Sallaghari",
    "Srijananagar",
    "Jhaukhel",
  ],
  Lalitpur: [
    "Sanepa",
    "Jhamsikhel",
    "Bhaisepati",
    "Satdobato",
    "Lubhu",
    "Imadol",
    "Godawari",
    "Mahalaxmisthan",
  ],
  Pokhara: [
    "Lakeside",
    "Hemja",
    "Lamachaur",
    "Birauta",
    "Matepani",
    "Kundahar",
    "Lekhnath",
    "Sishuwa",
    "Gagangauda",
    "Batulechaur",
    "Sarangkot",
  ],
  Chitwan: [
    "Kshetrapur",
    "Sauraha",
    "Parsa",
    "Khairahani",
    "Jagatpur",
    "Gaindakot",
    "Tandi",
    "Gitanagar",
    "Patihani",
    "Sharadanagar",
  ],
} as const;

export type KnownNepalCity = keyof typeof SUBURBS_BY_CITY;

/**
 * If `search` matches a catalog suburb (exact, then fuzzy within one city), return that city.
 */
export function findCityForSuburb(search: string): string | null {
  const s = search.trim().toLowerCase();
  if (!s) return null;

  for (const [city, suburbs] of Object.entries(SUBURBS_BY_CITY)) {
    for (const sub of suburbs) {
      if (sub.toLowerCase() === s) return city;
    }
  }

  const candidateCities = new Set<string>();
  for (const [city, suburbs] of Object.entries(SUBURBS_BY_CITY)) {
    for (const sub of suburbs) {
      const sl = sub.toLowerCase();
      if (sl.includes(s) || s.includes(sl)) {
        candidateCities.add(city);
        break;
      }
    }
  }
  if (candidateCities.size === 1) {
    return [...candidateCities][0]!;
  }

  return null;
}
