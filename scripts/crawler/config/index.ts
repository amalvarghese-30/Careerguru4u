export const BASE_URL = "https://www.shaalaa.com";
export const DELAY_MS = 1500;
export const MAX_RETRIES = 3;
export const MAX_PARALLEL = 4;
export const REQUEST_TIMEOUT = 30000;
export const NAVIGATION_TIMEOUT = 60000;

export const OUTPUT_DIR = "academic-library";

export const BOARD_CONFIG: Record<string, { name: string; url: string; key: string }> = {
  maharashtra: {
    key: "maharashtra",
    name: "Maharashtra Board",
    url: `${BASE_URL}/study-material/maharashtra-board_3186`,
  },
  cbse: {
    key: "cbse",
    name: "CBSE",
    url: `${BASE_URL}/study-material/cbse_3025`,
  },
  icse: {
    key: "icse",
    name: "ICSE",
    url: `${BASE_URL}/study-material/cisce_3604`,
  },
};

export const COURSE_IDS: Record<string, Record<number, { id: number; slug: string }>> = {
  maharashtra: {
    1: { id: 1442, slug: "maharashtra-state-board-1st-standard" },
    2: { id: 1443, slug: "maharashtra-state-board-2nd-standard" },
    3: { id: 1444, slug: "maharashtra-state-board-3rd-standard" },
    4: { id: 1445, slug: "maharashtra-state-board-4th-standard" },
    5: { id: 1435, slug: "maharashtra-board-5th-standard-ssc-english-medium" },
    6: { id: 1436, slug: "maharashtra-board-6th-standard-ssc-english-medium" },
    7: { id: 1437, slug: "maharashtra-board-7th-standard-ssc-english-medium" },
    8: { id: 1438, slug: "maharashtra-board-8th-standard-ssc-english-medium" },
    9: { id: 1439, slug: "maharashtra-board-9th-standard-ssc-english-medium" },
    10: { id: 1440, slug: "maharashtra-board-10th-standard-ssc-english-medium" },
    11: { id: 1441, slug: "maharashtra-board-11th-standard" },
    12: { id: 1446, slug: "maharashtra-board-12th-standard-hsc" },
  },
  cbse: {
    1: { id: 3001, slug: "cbse-class-1-english-medium" },
    2: { id: 3002, slug: "cbse-class-2-english-medium" },
    3: { id: 3003, slug: "cbse-class-3-english-medium" },
    4: { id: 3004, slug: "cbse-class-4-english-medium" },
    5: { id: 3005, slug: "cbse-class-5-english-medium" },
    6: { id: 3006, slug: "cbse-class-6-english-medium" },
    7: { id: 3007, slug: "cbse-class-7-english-medium" },
    8: { id: 3008, slug: "cbse-class-8-english-medium" },
    9: { id: 151, slug: "cbse-secondary-school-examination-english-medium-class-9" },
    10: { id: 152, slug: "cbse-secondary-school-examination-english-medium-class-10" },
    11: { id: 153, slug: "cbse-class-11" },
    12: { id: 154, slug: "cbse-class-12" },
  },
  icse: {
    1: { id: 3600, slug: "cisce-icse-class-1" },
    2: { id: 3601, slug: "cisce-icse-class-2" },
    3: { id: 3602, slug: "cisce-icse-class-3" },
    4: { id: 3603, slug: "cisce-icse-class-4" },
    5: { id: 3604, slug: "cisce-icse-class-5" },
    6: { id: 39, slug: "cisce-icse-class-6" },
    7: { id: 40, slug: "cisce-icse-class-7" },
    8: { id: 41, slug: "cisce-icse-class-8" },
    9: { id: 42, slug: "cisce-icse-class-9" },
    10: { id: 661, slug: "cisce-icse-class-10" },
    11: { id: 3621, slug: "cisce-isc-class-11" },
    12: { id: 3622, slug: "cisce-isc-class-12" },
  },
};

export const PUBLICATION_PATTERNS: Record<string, string[]> = {
  maharashtra: ["balbharati", "target", "navneet"],
  cbse: ["ncert", "rd-sharma", "rs-aggarwal", "hc-verma", "oswal", "evergreen", "lakhmir-singh"],
  icse: ["selina", "concise", "ml-aggarwal", "frank", "evergreen"],
};
