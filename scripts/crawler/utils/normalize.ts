const BASE = "https://www.shaalaa.com";

export function normalizeUrl(url: string): string {
  let u = url.trim();
  if (u.startsWith("//")) u = "https:" + u;
  if (u.startsWith("/")) u = BASE + u;
  // Remove trailing slashes
  u = u.replace(/\/+$/, "");
  // Remove tracking params
  u = u.replace(/[?&](utm_|ref_|source_|session_)[^&]+/gi, "");
  return u;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function normalizeBoardName(name: string): string {
  const map: Record<string, string> = {
    maharashtra: "Maharashtra Board",
    cbse: "CBSE",
    icse: "ICSE",
    isc: "ISC",
    "maharashtra-board": "Maharashtra Board",
    "maharashtra state board": "Maharashtra Board",
    "central board of secondary education": "CBSE",
    "indian certificate of secondary education": "ICSE",
  };
  const k = name.toLowerCase().trim();
  return map[k] || name;
}

/** Maps any board name variant to its COURSE_IDS key */
export function normalizeBoardKey(name: string): string {
  const k = name.toLowerCase().trim();
  if (k.includes("maharashtra") || k.includes("msbshse")) return "maharashtra";
  if (k.includes("cbse") || k.includes("central")) return "cbse";
  if (k.includes("cisce") || k.includes("icse") || k.includes("isc")) return "icse";
  return slugify(k);
}

export function normalizeSubjectName(name: string): string {
  return name
    .replace(/-/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\s+/g, " ")
    .trim();
}

export function detectPublication(slug: string, boardKey: string): string {
  const patterns: Record<string, Record<string, string>> = {
    maharashtra: {
      balbharati: "Balbharati",
      target: "Target Publications",
      navneet: "Navneet",
    },
    cbse: {
      ncert: "NCERT",
      "rd-sharma": "RD Sharma",
      "rs-aggarwal": "RS Aggarwal",
      "hc-verma": "HC Verma",
      oswal: "Oswal",
      evergreen: "Evergreen",
      "lakhmir-singh": "Lakhmir Singh",
    },
    icse: {
      selina: "Selina Publishers",
      concise: "Concise",
      "ml-aggarwal": "ML Aggarwal",
      frank: "Frank Brothers",
      evergreen: "Evergreen",
    },
  };

  const boardPatterns = patterns[boardKey] || {};
  for (const [pattern, name] of Object.entries(boardPatterns)) {
    if (slug.includes(pattern)) return name;
  }
  return "General";
}
