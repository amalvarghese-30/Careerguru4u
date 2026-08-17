/**
 * Shaalaa.com Solution Scraper
 *
 * Extracts textbook solutions from Shaalaa.com for all boards/subjects/classes.
 *
 * Usage:
 *   node scripts/scrape-shaalaa.mjs --board=maharashtra --class=9 --subject=algebra
 *   node scripts/scrape-shaalaa.mjs --board=cbse --class=10 --subject=science
 *   node scripts/scrape-shaalaa.mjs --board=icse --class=9
 *   node scripts/scrape-shaalaa.mjs --board=maharashtra --class=9  (all subjects)
 *   node scripts/scrape-shaalaa.mjs --board=maharashtra --class=9 --dry  (discover only)
 *
 * Output: JSON files in ./scraped-data/{board}/{class}/{subject}/
 * Each file contains solutions ready for bulk import via /api/admin/solutions
 */

import fs from "fs";
import path from "path";

const BASE = "https://www.shaalaa.com";
const DELAY_MS = 1000; // 1s between requests
const OUTPUT_DIR = path.join(process.cwd(), "scraped-data");

// Known direct textbook IDs for classes/courses where discovery pages don't list board textbooks.
// Used as a fallback when course-subject page returns no board-specific books.
const KNOWN_TEXTBOOKS = {
  maharashtra: {
    10: [
      // Mathematics
      { slug: "balbharati-solutions-algebra-mathematics-1-english-standard-10-maharashtra-state-board", id: "52" },
      { slug: "balbharati-solutions-geometry-mathematics-2-english-standard-10-maharashtra-state-board", id: "50" },
      // Science
      { slug: "balbharati-solutions-science-and-technology-part-1-english-standard-10-maharashtra-state-board", id: "51" },
      { slug: "balbharati-solutions-science-and-technology-2-english-standard-10-maharashtra-state-board", id: "53" },
      // Languages & Humanities
      { slug: "balbharati-solutions-english-kumarbharati-english-standard-10-maharashtra-state-board", id: "199" },
      { slug: "balbharati-solutions-geography-english-standard-10-maharashtra-state-board", id: "104" },
      { slug: "balbharati-solutions-history-and-political-science-english-standard-10-maharashtra-state-board", id: "105" },
      { slug: "balbharati-solutions-hindi-lokbharati-english-standard-10-maharashtra-state-board", id: "275" },
      { slug: "balbharati-solutions-marathi-aksharbharati-english-standard-10-maharashtra-state-board", id: "277" },
      { slug: "balbharati-solutions-sanskrit-amod-english-standard-10-maharashtra-state-board", id: "594" },
    ],
    8: [
      { slug: "balbharati-solutions-mathematics-english-standard-8-maharashtra-state-board", id: "117" },
      { slug: "balbharati-solutions-science-english-8-standard-maharashtra-state-board", id: "116" },
    ],
  },
};

// ─── Course ID Database ───────────────────────────────────────────
const COURSE_IDS = {
  maharashtra: {
    1:   { id: 1442, slug: "maharashtra-state-board-1st-standard", medium: "english" },
    2:   { id: 1443, slug: "maharashtra-state-board-2nd-standard", medium: "english" },
    3:   { id: 1444, slug: "maharashtra-state-board-3rd-standard", medium: "english" },
    4:   { id: 1445, slug: "maharashtra-state-board-4th-standard", medium: "english" },
    5:   { id: 1435, slug: "maharashtra-board-5th-standard-ssc-english-medium", medium: "english" },
    6:   { id: 1436, slug: "maharashtra-board-6th-standard-ssc-english-medium", medium: "english" },
    7:   { id: 1437, slug: "maharashtra-board-7th-standard-ssc-english-medium", medium: "english" },
    8:   { id: 1438, slug: "maharashtra-board-8th-standard-ssc-english-medium", medium: "english" },
    9:   { id: 1439, slug: "maharashtra-board-9th-standard-ssc-english-medium", medium: "english" },
    10:  { id: 1440, slug: "maharashtra-board-10th-standard-ssc-english-medium", medium: "english" },
  },
  cbse: {
    1:   { id: 3001, slug: "cbse-class-1-english-medium", medium: "english" },
    2:   { id: 3002, slug: "cbse-class-2-english-medium", medium: "english" },
    3:   { id: 3003, slug: "cbse-class-3-english-medium", medium: "english" },
    4:   { id: 3004, slug: "cbse-class-4-english-medium", medium: "english" },
    5:   { id: 3005, slug: "cbse-class-5-english-medium", medium: "english" },
    6:   { id: 3006, slug: "cbse-class-6-english-medium", medium: "english" },
    7:   { id: 3007, slug: "cbse-class-7-english-medium", medium: "english" },
    8:   { id: 3008, slug: "cbse-class-8-english-medium", medium: "english" },
    9:   { id: 1435, slug: "cbse-class-9-secondary-school-examination-english-medium", medium: "english" },
    10:  { id: 660,  slug: "cbse-class-10-secondary-school-examination-english-medium", medium: "english" },
    11:  { id: 646,  slug: "cbse-class-11-senior-school-cert-examination-commerce", medium: "english" },
    12:  { id: 649,  slug: "cbse-class-12-senior-school-cert-examination-commerce", medium: "english" },
  },
  icse: {
    1:   { id: 3600, slug: "cisce-icse-class-1", medium: "english" },
    2:   { id: 3601, slug: "cisce-icse-class-2", medium: "english" },
    3:   { id: 3602, slug: "cisce-icse-class-3", medium: "english" },
    4:   { id: 3603, slug: "cisce-icse-class-4", medium: "english" },
    5:   { id: 3604, slug: "cisce-icse-class-5", medium: "english" },
    6:   { id: 1460, slug: "cisce-icse-class-6-indian-certificate-of-secondary-education-school-5-to-8", medium: "english" },
    7:   { id: 1459, slug: "cisce-icse-class-7-indian-certificate-of-secondary-education-school-5-to-8", medium: "english" },
    8:   { id: 1458, slug: "cisce-icse-class-8-indian-certificate-of-secondary-education-school-5-to-8", medium: "english" },
    9:   { id: 1440, slug: "cisce-icse-class-9-indian-certificate-of-secondary-education", medium: "english" },
    10:  { id: 661,  slug: "cisce-icse-class-10-indian-certificate-of-secondary-education", medium: "english" },
  },
};

/**
 * Missing board/class/subject data still to scrape, keyed by board → class → subjects.
 * Sourced from Shaalaa's search-course-qb-textbook-subjects sitemap (verified course IDs).
 * Each entry: { slug, id, name } where slug/id come from the ?subjects=slug_id URL.
 * Only subjects NOT already present in MongoDB are listed.
 */
const MISSING_TARGETS = {
  cbse: {
    9: [
      { slug: "sanskrit", id: "8336", name: "Sanskrit" },
      { slug: "hindi", id: "8350", name: "Hindi" },
      { slug: "hindi-b", id: "8351", name: "Hindi" },
      { slug: "english-communicative", id: "8352", name: "English" },
      { slug: "english-language-and-literature-9th", id: "8353", name: "English" },
      { slug: "social-science", id: "8356", name: "Social Science" },
    ],
    10: [
      { slug: "sanskrit", id: "3129", name: "Sanskrit" },
      { slug: "hindi", id: "3143", name: "Hindi" },
      { slug: "hindi-b", id: "3144", name: "Hindi" },
      { slug: "english-communicative", id: "3145", name: "English" },
      { slug: "english-language-and-literature-class", id: "3146", name: "English" },
      { slug: "social-science", id: "3149", name: "Social Science" },
    ],
    11: [
      { slug: "english-elective-ncert", id: "7838", name: "English" },
      { slug: "english-core", id: "7840", name: "English" },
      { slug: "hindi-core", id: "7841", name: "Hindi" },
      { slug: "hindi-elective", id: "7842", name: "Hindi" },
      { slug: "sanskrit-core", id: "7866", name: "Sanskrit" },
      { slug: "sanskrit-elective", id: "7867", name: "Sanskrit" },
      { slug: "economics", id: "7883", name: "Economics" },
      { slug: "business-studies", id: "7884", name: "Business Studies" },
      { slug: "accountancy", id: "7885", name: "Accountancy" },
      { slug: "history", id: "7886", name: "History" },
      { slug: "political-science", id: "7889", name: "Political Science" },
      { slug: "geography", id: "7920", name: "Geography" },
      { slug: "psychology", id: "7890", name: "Psychology" },
      { slug: "sociology", id: "7891", name: "Sociology" },
    ],
    12: [
      { slug: "english-elective-ncert", id: "2826", name: "English" },
      { slug: "english-core", id: "2827", name: "English" },
      { slug: "hindi-core", id: "3025", name: "Hindi" },
      { slug: "hindi-elective", id: "3026", name: "Hindi" },
      { slug: "sanskrit-core", id: "2922", name: "Sanskrit" },
      { slug: "sanskrit-elective", id: "2923", name: "Sanskrit" },
      { slug: "economics", id: "2872", name: "Economics" },
      { slug: "business-studies", id: "2828", name: "Business Studies" },
      { slug: "accountancy", id: "2873", name: "Accountancy" },
      { slug: "history", id: "2875", name: "History" },
      { slug: "political-science", id: "2876", name: "Political Science" },
      { slug: "geography", id: "2877", name: "Geography" },
      { slug: "psychology", id: "2878", name: "Psychology" },
      { slug: "sociology", id: "2879", name: "Sociology" },
    ],
  },
  icse: {
    10: [
      { slug: "physics", id: "3799", name: "Physics" },
      { slug: "english-2-literature-english", id: "3849", name: "English" },
      { slug: "geography", id: "3851", name: "Geography" },
      { slug: "history-civics", id: "3231", name: "History and Civics" },
      { slug: "economics", id: "3235", name: "Economics" },
      { slug: "commercial-studies", id: "3237", name: "Commercial Studies" },
      { slug: "environmental-science", id: "3276", name: "Environmental Science" },
      { slug: "computer-applications", id: "3279", name: "Computer Applications" },
      { slug: "economic-applications", id: "3282", name: "Economic Applications" },
      { slug: "commercial-applications-10th", id: "3283", name: "Commercial Applications" },
      { slug: "home-science", id: "3312", name: "Home Science" },
      { slug: "physical-education", id: "3317", name: "Physical Education" },
      { slug: "environmental-applications", id: "3320", name: "Environmental Applications" },
    ],
  },
};

/**
 * Deterministic textbook index built from Shaalaa's textbook-solutions-books sitemap.
 * Maps board → class → subject-slug → list of the subject's REAL textbooks (slug + id).
 *
 * Why this exists: Shaalaa's `?subjects=slug_id` discovery pages are unreliable — they
 * inject ~14 unrelated "popular" books (RD Sharma / NCERT maths-science for other
 * classes) and OMIT many real books (Hindi Kshitij/Kritika/Sparsh/Sanchayan, English
 * Beehive/Moments, and the English-Communicative books that use a "cbse-solutions"
 * prefix instead of "ncert-solutions"). This manifest bypasses discovery entirely and
 * scrapes the exact textbook IDs directly.
 */
const SUBJECT_TEXTBOOKS = {
  cbse: {
    9: {
      sanskrit: [
        { slug: "ncert-solutions-sanskrit-shemushi-class-9", id: "559" },
        { slug: "ncert-solutions-sanskrit-abhyaswaan-bhav-class-9", id: "560" },
        { slug: "ncert-solutions-sanskrit-vyakaranavithi-class-9-and-10", id: "583" },
        { slug: "ncert-solutions-sanskrit-sharda-class-9", id: "731" },
      ],
      hindi: [
        { slug: "ncert-solutions-hindi-kritika-bhag-1-class-9", id: "231" },
        { slug: "ncert-solutions-hindi-kshitij-bhag-1-class-9", id: "232" },
        { slug: "ncert-solutions-hindi-ganga-class-9", id: "732" },
      ],
      "hindi-b": [
        { slug: "ncert-solutions-hindi-sanchayan-bhag-1-class-9", id: "233" },
        { slug: "ncert-solutions-hindi-sparsh-bhag-1-class-9", id: "234" },
      ],
      "english-communicative": [
        { slug: "cbse-solutions-english-literature-reader-english-class-9", id: "63" },
        { slug: "cbse-solutions-english-main-course-book-class-9", id: "68" },
        { slug: "cbse-solutions-english-workbook-class-9", id: "91" },
      ],
      "english-language-and-literature-9th": [
        { slug: "ncert-solutions-english-beehive-class-9", id: "58" },
        { slug: "ncert-solutions-english-moments-class-9", id: "59" },
        { slug: "ncert-solutions-english-kaveri-class-9", id: "729" },
      ],
      "social-science": [
        { slug: "ncert-solutions-social-science-geography-contemporary-india-1-english-class-9", id: "94" },
        { slug: "ncert-solutions-social-science-india-and-the-contemporary-world-1-english-class-9", id: "95" },
        { slug: "ncert-solutions-social-science-democratic-politics-1-english-class-9", id: "96" },
        { slug: "ncert-solutions-social-science-economics-english-class-9", id: "97" },
        { slug: "ncert-solutions-social-science-understanding-society-india-and-beyond-part-1-english-class-9", id: "745" },
      ],
    },
    10: {
      sanskrit: [
        { slug: "ncert-solutions-sanskrit-shemushi-class-10", id: "561" },
        { slug: "ncert-solutions-sanskrit-abhyaswaan-bhav-class-10", id: "562" },
      ],
      hindi: [
        { slug: "ncert-solutions-hindi-kritika-bhag-2-class-10", id: "235" },
        { slug: "ncert-solutions-hindi-kshitij-bhag-2-class-10", id: "236" },
      ],
      "hindi-b": [
        { slug: "ncert-solutions-hindi-sanchayan-bhag-2-class-10", id: "237" },
        { slug: "ncert-solutions-hindi-sparsh-bhag-2-class-10", id: "238" },
      ],
      "english-communicative": [
        { slug: "cbse-solutions-english-literature-reader-class-10", id: "65" },
        { slug: "cbse-solutions-english-main-course-book-class-10", id: "66" },
        { slug: "cbse-solutions-english-workbook-class-10", id: "67" },
      ],
      "english-language-and-literature-class": [
        { slug: "ncert-solutions-english-first-flight-class-10", id: "60" },
        { slug: "ncert-solutions-english-footprints-without-feet-class-10", id: "61" },
        { slug: "ncert-solutions-english-words-and-expressions-2-class-10", id: "581" },
      ],
      "social-science": [
        { slug: "ncert-solutions-social-science-india-and-the-contemporary-world-2-english-class-10", id: "73" },
        { slug: "ncert-solutions-social-science-democratic-politics-2-english-class-10", id: "74" },
        { slug: "ncert-solutions-social-science-understanding-economic-development-english-class-10", id: "75" },
        { slug: "ncert-solutions-social-science-contemporary-india-2-english-class-10", id: "76" },
      ],
    },
    11: {
      "english-core": [
        { slug: "ncert-solutions-english-hornbill-core-class-11", id: "101" },
        { slug: "ncert-solutions-english-snapshots-core-class-11", id: "102" },
      ],
      "english-elective-ncert": [
        { slug: "ncert-solutions-english-woven-words-elective-class-11", id: "103" },
      ],
      "hindi-core": [
        { slug: "ncert-solutions-hindi-aaroh-bhag-1-class-11", id: "574" },
        { slug: "ncert-solutions-hindi-vitaan-bhag-1-class-11", id: "575" },
      ],
      "hindi-elective": [
        { slug: "ncert-solutions-hindi-antara-bhag-1-class-11", id: "576" },
        { slug: "ncert-solutions-hindi-abhivyakti-aur-madhyam-class-11-and-12", id: "736" },
      ],
      "sanskrit-core": [
        { slug: "ncert-solutions-sanskrit-bhaswati-core-class-11", id: "563" },
      ],
      "sanskrit-elective": [
        { slug: "ncert-solutions-sanskrit-shashwati-elective-class-11", id: "564" },
        { slug: "ncert-solutions-sanskrit-sahitya-parichay-class-11-and-12", id: "580" },
      ],
      economics: [
        { slug: "ncert-solutions-economics-introductory-microeconomics-english-class-11", id: "125" },
        { slug: "ncert-solutions-statistics-for-economics-english-class-11", id: "142" },
      ],
      "business-studies": [
        { slug: "ncert-solutions-business-studies-english-class-11", id: "141" },
      ],
      accountancy: [
        { slug: "ncert-solutions-accountancy-financial-accounting-part-1-and-2-english-class-11", id: "483" },
      ],
      history: [
        { slug: "ncert-solutions-themes-in-world-history-english-class-11", id: "134" },
      ],
      "political-science": [
        { slug: "ncert-solutions-political-science-political-theory-english-class-11", id: "135" },
        { slug: "ncert-solutions-political-science-indian-constitution-at-work-english-class-11", id: "136" },
      ],
      geography: [
        { slug: "ncert-solutions-geography-india-physical-environment-english-class-11", id: "498" },
        { slug: "ncert-solutions-fundamentals-of-physical-geography-english-class-11", id: "499" },
        { slug: "ncert-solutions-practical-work-in-geography-part-1-english-class-11", id: "500" },
      ],
      psychology: [
        { slug: "ncert-solutions-psychology-english-class-11", id: "137" },
      ],
      sociology: [
        { slug: "ncert-solutions-introducing-sociology-english-class-11", id: "138" },
        { slug: "ncert-solutions-sociology-understanding-society-english-class-11", id: "139" },
      ],
    },
    12: {
      "english-core": [
        { slug: "ncert-solutions-english-flamingo-english-core-courses-class-12", id: "78" },
        { slug: "ncert-solutions-english-vistas-class-12", id: "77" },
      ],
      "english-elective-ncert": [
        { slug: "ncert-solutions-english-kaleidoscope-class-12", id: "439" },
      ],
      "hindi-core": [
        { slug: "ncert-solutions-hindi-aaroh-bhag-2-english-class-12", id: "448" },
        { slug: "ncert-solutions-hindi-vitaan-bhag-2-class-12", id: "449" },
      ],
      "hindi-elective": [
        { slug: "ncert-solutions-hindi-antara-bhag-2-class-12", id: "450" },
        { slug: "ncert-solutions-hindi-antaraal-bhag-2-class-12", id: "451" },
      ],
      "sanskrit-core": [
        { slug: "ncert-solutions-sanskrit-bhaswati-class-12", id: "543" },
      ],
      "sanskrit-elective": [
        { slug: "ncert-solutions-sanskrit-shashwati-class-12", id: "565" },
      ],
      economics: [
        { slug: "ncert-solutions-economics-introductory-macroeconomics-english-class-12", id: "79" },
        { slug: "ncert-solutions-economics-indian-economic-development-english-class-12", id: "124" },
      ],
      "business-studies": [
        { slug: "ncert-solutions-business-studies-part-1-principles-and-functions-of-management-english-class-12", id: "81" },
        { slug: "ncert-solutions-business-studies-part-2-business-finance-and-marketing-english-class-12", id: "82" },
      ],
      accountancy: [
        { slug: "ncert-solutions-accountancy-partnership-accounts-english-class-12", id: "114" },
        { slug: "ncert-solutions-accountancy-company-accounts-and-analysis-of-financial-statements-english-class-12", id: "120" },
        { slug: "ncert-solutions-accountancy-computerised-accounting-system-english-class-12", id: "566" },
      ],
      history: [
        { slug: "ncert-solutions-themes-in-indian-history-part-i-ii-and-iii-english-class-12", id: "83" },
      ],
      "political-science": [
        { slug: "ncert-solutions-political-science-contemporary-world-politics-english-class-12", id: "88" },
        { slug: "ncert-solutions-political-science-politics-in-india-since-independence-english-class-12", id: "89" },
      ],
      geography: [
        { slug: "ncert-solutions-geography-fundamentals-of-human-english-class-12", id: "442" },
        { slug: "ncert-solutions-geography-india-people-and-economy-english-class-12", id: "443" },
        { slug: "ncert-solutions-practical-work-in-geography-english-class-12", id: "446" },
      ],
      psychology: [
        { slug: "ncert-solutions-psychology-english-class-12", id: "85" },
      ],
      sociology: [
        { slug: "ncert-solutions-sociology-indian-society-english-class-12", id: "86" },
        { slug: "ncert-solutions-sociology-social-change-and-development-in-india-english-class-12", id: "87" },
      ],
    },
  },
  icse: {
    10: {
      physics: [
        { slug: "selina-solutions-concise-physics-english-class-10-icse", id: "32" },
        { slug: "frank-solutions-physics-part-2-english-class-10-icse", id: "131" },
        { slug: "lakhmir-singh-solutions-physics-english-class-10-icse", id: "753" },
      ],
      "english-2-literature-english": [
        { slug: "evergreen-publication-solutions-english-treasure-chest-workbook-class-10-icse", id: "734" },
      ],
      geography: [
        { slug: "morning-star-solutions-total-geography-volume-1-english-class-10-icse", id: "619" },
        { slug: "austine-vas-hemant-m-pednekar-vidhya-malar-solutions-geography-english-class-10-icse", id: "127" },
      ],
      "history-civics": [
        { slug: "icse-solutions-history-and-civics-english-class-10-icse", id: "126" },
        { slug: "morning-star-solutions-total-history-and-civics-english-class-10-icse", id: "620" },
      ],
      economics: [
        { slug: "goyal-brothers-prakashan-solutions-economics-english-class-10-icse", id: "597" },
      ],
      "commercial-studies": [
        { slug: "goyal-brothers-prakashan-solutions-commercial-studies-english-class-10-icse", id: "616" },
      ],
      "environmental-science": [
        { slug: "goyal-brothers-prakashan-solutions-environmental-science-english-class-10-icse", id: "621" },
      ],
      "computer-applications": [
        { slug: "avichal-solutions-computer-applications-english-class-10-icse", id: "626" },
        { slug: "rupa-pandit-solutions-computer-applications-english-class-10-icse", id: "766" },
      ],
      "economic-applications": [
        { slug: "goyal-brothers-prakashan-solutions-economic-applications-english-class-10-icse", id: "618" },
      ],
      "commercial-applications-10th": [
        { slug: "goyal-brothers-prakashan-solutions-commercial-applications-english-class-10-icse", id: "617" },
      ],
      "home-science": [
        { slug: "dr-alka-agarwal-solutions-home-science-english-class-10-icse", id: "625" },
      ],
      "physical-education": [
        { slug: "oswal-solutions-physical-education-english-class-10-icse", id: "624" },
      ],
      "environmental-applications": [
        { slug: "huma-syed-solutions-environmental-applications-english-class-10-icse", id: "622" },
      ],
    },
  },
};

/**
 * Given a lowercased subject name, returns slug patterns to match against KNOWN_TEXTBOOKS.
 */
function getSubjectPatterns(subjLower) {
  if (subjLower.includes("math") || subjLower.includes("algebra") || subjLower.includes("geometry")) {
    return ["mathematics", "algebra", "geometry"];
  }
  if (subjLower.includes("physics")) {
    return ["science-and-technology-part-1", "science-and-technology-1", "physics"];
  }
  if (subjLower.includes("chemistry")) {
    return ["science-and-technology-part-1", "science-and-technology-1", "chemistry"];
  }
  if (subjLower.includes("biology")) {
    return ["science-and-technology-2", "biology"];
  }
  if (subjLower.includes("science") || subjLower.includes("tech")) {
    return ["science-and-technology", "-science-"];
  }
  if (subjLower.includes("history") || subjLower.includes("civics") || subjLower.includes("political")) {
    return ["history-and-political", "history-and-civics", "history"];
  }
  if (subjLower.includes("geography")) {
    return ["geography"];
  }
  if (subjLower.includes("english")) {
    return ["english-kumarbharati", "english-coursebook"];
  }
  if (subjLower.includes("hindi")) {
    return ["hindi-lokbharati", "hindi-kumarbharati", "hindi"];
  }
  if (subjLower.includes("marathi")) {
    return ["marathi-aksharbharati", "marathi-kumarbharati", "marathi"];
  }
  if (subjLower.includes("sanskrit")) {
    return ["sanskrit-amod", "sanskrit-anand", "sanskrit"];
  }
  return [];
}

/**
 * Shaalaa injects ~14 unrelated "popular" textbooks (RD Sharma maths + NCERT
 * maths/science/physics/chemistry/biology for various classes) onto EVERY subject
 * page, before/after the subject's real books. These are never the target for a
 * language/humanities/commerce subject, so we drop them. Returns true when the
 * textbook is one of those injected "popular" books AND the subject being scraped
 * is not itself that maths/science subject (so the generic --subject path still works).
 */
function isInjectedPopular(slug, subjectName) {
  const subject = (subjectName || "").toLowerCase();
  const rules = [
    { re: /^rd-sharma-solutions-mathematics/, subject: "math" },
    { re: /^ncert-solutions-mathematics/, subject: "math" },
    { re: /^ncert-solutions-science/, subject: "science" },
    { re: /^ncert-solutions-physics/, subject: "physics" },
    { re: /^ncert-solutions-chemistry/, subject: "chemistry" },
    { re: /^ncert-solutions-biology/, subject: "biology" },
  ];
  for (const r of rules) {
    if (r.re.test(slug)) {
      // Keep it only if we're actually scraping that maths/science subject.
      return !subject.includes(r.subject);
    }
  }
  return false;
}

// ─── Helpers ──────────────────────────────────────────────────────

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function delay(ms) {
  return new Promise(r => setTimeout(r, ms));
}

// Board-specific textbook filters
const BOARD_TEXTBOOK_FILTERS = {
  maharashtra: ["balbharati-solutions"],
  cbse: ["ncert-solutions"],
  // ICSE textbooks carry an "-icse" slug suffix (publishers: selina, frank, nootan,
  // b-nirmala-shastry, dr-k-k-gupta, etc.). CBSE books (ncert/rd-sharma) share the
  // "-class-N" pattern but lack the suffix, so suffix-match to keep ICSE data clean.
  icse: ["-icse"],
};

function filterTextbooksByBoard(textbooks, boardKey, className) {
  let filtered;
  if (boardKey === "icse") {
    // Suffix-match: ICSE books end in "-icse"; exclude ncert/rd-sharma which do not.
    filtered = textbooks.filter(tb => BOARD_TEXTBOOK_FILTERS[boardKey].some(p => tb.slug.endsWith(p)));
  } else {
    const prefixes = BOARD_TEXTBOOK_FILTERS[boardKey];
    // null means skip prefix filtering (relies on class-number filter below)
    filtered = prefixes ? textbooks.filter(tb => prefixes.some(p => tb.slug.startsWith(p))) : textbooks;
  }

  // Also filter by class number (e.g. standard-8, 8th-standard, -8-)
  if (className != null) {
    const cls = String(className);
    const classPatterns = [
      `-standard-${cls}`,
      `-${cls}th-standard`,
      `-${cls}-`,
      `-class-${cls}`,
    ];
    filtered = filtered.filter(tb =>
      classPatterns.some(p => tb.slug.includes(p))
    );
  }

  return filtered;
}

const curlHeaders = [
  "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  "Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "Accept-Language: en-US,en;q=0.9",
  "Sec-Fetch-Dest: document",
  "Sec-Fetch-Mode: navigate",
  "Sec-Fetch-Site: none",
  "Upgrade-Insecure-Requests: 1",
];

async function fetchWithCurl(url) {
  const args = ["-sS", "--max-time", "30"];
  for (const h of curlHeaders) { args.push("-H", h); }
  args.push(url);
  const { spawnSync } = await import("node:child_process");

  // Retry transient curl crashes (e.g. Windows STATUS_DLL_INIT_FAILED / exit
  // 0xC0000142) that happen when the machine is briefly under stress. Without a
  // retry, a single bad window silently zeroes out an entire subject.
  const MAX_ATTEMPTS = 3;
  let lastErr = null;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    console.log(`     [curl attempt ${attempt}/${MAX_ATTEMPTS}] ${url}`);
    let r;
    try {
      r = spawnSync("curl", args, { encoding: "utf8", maxBuffer: 10 * 1024 * 1024, timeout: 35000 });
    } catch (spawnErr) {
      lastErr = spawnErr;
      console.log(`     [curl spawn error] ${spawnErr.message}`);
      if (attempt < MAX_ATTEMPTS) {
        console.log(`     ↻ Retry ${attempt}/${MAX_ATTEMPTS - 1}`);
        await delay(1000);
        continue;
      }
      throw lastErr;
    }

    if (r.error) {
      lastErr = r.error;
      console.log(`     [curl error] ${r.error.message}`);
    } else if (r.status !== 0) {
      lastErr = new Error(`curl exit ${r.status} for ${url}`);
      console.log(`     [curl exit ${r.status}]`);
    } else if (!r.stdout || r.stdout.length < 100) {
      lastErr = new Error(`Empty/too-short response for ${url}`);
      console.log(`     [curl empty response]`);
    } else {
      console.log(`     [curl success] ${r.stdout.length} bytes`);
      return r.stdout;
    }

    if (attempt < MAX_ATTEMPTS) {
      console.log(`     ↻ Retry ${attempt}/${MAX_ATTEMPTS - 1}`);
      await delay(1000);
    }
  }
  throw lastErr;
}

async function fetchPage(url) {
  console.log(`  GET ${url}`);
  await delay(DELAY_MS);
  // Use curl to bypass Cloudflare bot protection (Node.js fetch gets 403)
  try {
    return await fetchWithCurl(url);
  } catch (e) {
    // Fallback to Node.js fetch if curl not available
    if (e.message?.includes("ENOENT")) {
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.5",
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
      return res.text();
    }
    throw e;
  }
}

/**
 * Extract IDs and slugs from Shaalaa search-textbook-solutions page.
 * Parses out subject links like: ?subjects=algebra-9th-mathematics-1_8870
 */

const SUBJECT_NAME_MAP = {
  "english-2-literature-english-class": "English",
  "history-and-civics-class": "History and Civics",
  "english-1-english-language-class": "English Language",
  "english-2-literature-in-english": "English Literature",
  "physics-chemistry-biology": "Science",
};

function normalizeSubjectName(slug) {
  if (SUBJECT_NAME_MAP[slug]) return SUBJECT_NAME_MAP[slug];
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function parseSubjectLinks(html, courseUrl) {
  const subjects = [];
  // Pattern: href="/search-textbook-solutions/...?subjects=subject-name_id"
  const subjectRegex = /href="([^"]*\?subjects=([^"&]+)_(\d+))"/gi;
  let match;
  while ((match = subjectRegex.exec(html)) !== null) {
    const fullHref = match[1];
    const slug = match[2];
    const id = match[3];
    const name = normalizeSubjectName(slug);
    const url = fullHref.startsWith("http") ? fullHref : BASE + fullHref;
    if (!subjects.find(s => s.id === id)) {
      subjects.push({ name, slug, id, url });
    }
  }
  return subjects;
}

/**
 * Extract textbook solution links from a subject page.
 * Pattern: /textbook-solutions/{textbook-slug}_{textbook-id}
 */
function parseTextbookLinks(html) {
  const textbooks = [];
  const regex = /\/textbook-solutions\/([a-z0-9][a-z0-9-]+)_(\d+)/gi;
  let match;
  const seen = new Set();
  while ((match = regex.exec(html)) !== null) {
    const slug = match[1];
    const id = match[2];
    if (seen.has(id)) continue;
    seen.add(id);
    textbooks.push({
      url: BASE + `/textbook-solutions/${slug}_${id}`,
      id,
      slug,
    });
  }
  return textbooks;
}

/**
 * Extract chapter links from a textbook page.
 * Pattern: /textbook-solutions/c/{chapter-slug}_{chapter-id}
 */
function parseChapterLinks(html) {
  const chapters = [];
  const regex = /\/textbook-solutions\/c\/([a-z0-9][a-z0-9-.]+)_(\d+)/gi;
  let match;
  const seen = new Set();
  while ((match = regex.exec(html)) !== null) {
    const slug = match[1];
    const id = match[2];
    if (seen.has(id)) continue;
    seen.add(id);
    let name = slug
      .replace(/^balbharati-solutions-|^ncert-solutions-|^selina-solutions-|^ml-aggarwal-|^rd-sharma-|^frank-solutions-/i, "")
      .replace(/-english-?(standard|medium)?-?\d*(?:st|nd|rd|th)?-?(standard)?-?(maharashtra-state-board)?-?(ssc)?-?(english-?medium)?.*$/, "")
      .replace(/^mathematics-\d-|^science-and-technology-|^history-and-political-science-|^geography-/, "")
      .replace(/^english-kumarbharati-|^hindi-lokbharati-|^hindi-composite-lokvani-|^marathi-aksharbharati-|^marathi-composite-antarbharati-|^sanskrit-amod-|^sanskrit-composite-anand-/, "")
      .replace(/^(chapter|ch|lesson)-\d+-/, "")
      .replace(/-/g, " ")
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();

    // If name is empty/too generic, try to extract from the link text in HTML
    if (!name || name.length < 5) {
      const linkRegex = new RegExp(`<a[^>]*href="[^"]*\\/c\\/${slug}_${id}"[^>]*>([\\s\\S]*?)<\\/a>`, "i");
      const linkMatch = html.match(linkRegex);
      if (linkMatch) {
        name = stripHtml(linkMatch[1]).trim();
      }
    }

    if (!name || name.length < 3) name = "Chapter " + chapters.length + 1;

    chapters.push({ name, slug, id, url: BASE + `/textbook-solutions/c/${slug}_${id}` });
  }
  return chapters;
}

/**
 * Extract question links and metadata from a chapter page.
 * Parses the question-bank-solutions links.
 */
function parseQuestionLinks(html, chapterUrl) {
  const questions = [];
  // Match question-bank-solutions URLs
  const regex = /\/question-bank-solutions\/([a-z0-9][a-z0-9-]+)_(\d+)/gi;
  let match;
  const seen = new Set();
  while ((match = regex.exec(html)) !== null) {
    const slug = match[1];
    const id = match[2];
    if (seen.has(id)) continue;
    seen.add(id);
    questions.push({
      url: BASE + `/question-bank-solutions/${slug}_${id}`,
      id,
      slug,
    });
  }
  return questions;
}

/**
 * Extract question text and answer text from a solution page.
 * Handles the backtick-delimited math notation used by Shaalaa.
 */
function parseSolution(html) {
  let question = "";
  let answer = "";

  // Extract from JSON-LD structured data (most reliable)
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (ldMatch) {
    try {
      const ld = JSON.parse(ldMatch[1]);
      if (ld["@graph"]) {
        for (const item of ld["@graph"]) {
          if (item["@type"] === "Question" && item.name) {
            question = stripHtml(item.name).trim();
          }
          if (item["@type"] === "Answer" && item.text) {
            answer = stripHtml(item.text).trim();
          }
        }
      }
    } catch {}
  }

  // Fallback: H1 for question
  if (!question) {
    const h1Match = html.match(/<h1[^>]*class="[^"]*question-title[^"]*"[^>]*>([\s\S]*?)<\/h1>/i)
      || html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) {
      question = stripHtml(h1Match[1]).trim();
    }
  }

  // Fallback: meta description
  if (!question) {
    const metaMatch = html.match(/<meta[^>]*name="description"[^>]*content="([^"]+)"/i);
    if (metaMatch) question = stripHtml(metaMatch[1]).trim();
  }

  // Extract answer from solution content area
  if (!answer) {
    const solDiv = html.match(/class="[^"]*solution[_-]content[^"]*"[^>]*>([\s\S]*?)<\/div>/is)
      || html.match(/class="[^"]*answer[^"]*"[^>]*>([\s\S]*?)<\/div>/is)
      || html.match(/class="[^"]*solution[^"]*"[^>]*>([\s\S]*?)<\/div>/is);
    if (solDiv) {
      answer = stripHtml(solDiv[1]).trim();
    }
  }

  // Fallback: extract all text content after question, skipping nav/footer
  if (!answer) {
    // Remove scripts, styles, nav, header, footer
    let body = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "");

    const mainMatch = body.match(/<main[^>]*>([\s\S]*?)<\/main>/i)
      || body.match(/class="[^"]*main-content[^"]*"[^>]*>([\s\S]*?)<\/div>/i);

    if (mainMatch) {
      const text = stripHtml(mainMatch[1]).trim();
      // Try to split after the question to get the answer
      if (question && text.includes(question)) {
        answer = text.substring(text.indexOf(question) + question.length).trim();
      } else {
        answer = text;
      }
    }
  }

  // Strip common prefixes
  question = question.replace(/^(Question\s*:?\s*|Q\s*:?\s*|Q\.\s*)/i, "").trim();
  answer = answer
    .replace(/^Solution\s*:?\s*/i, "")
    .replace(/^Show\s*Solution\s*/i, "")
    .replace(/^Answer\s*:?\s*/i, "")
    .replace(/^A\s*:?\s*/i, "")
    .replace(/^SolutionShow Solution\s*/i, "")
    .replace(/^Show Solution\s*/i, "")
    .trim();

  // Clean math notation
  question = cleanMathNotation(question);
  answer = cleanMathNotation(answer);

  return { question, answer };
}

function stripHtml(html) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&minus;/g, "−")
    .replace(/&times;/g, "×")
    .replace(/&divide;/g, "÷")
    .replace(/&pi;/g, "π")
    .replace(/&radic;/g, "√")
    .replace(/&infin;/g, "∞")
    .replace(/&sum;/g, "∑")
    .replace(/&int;/g, "∫")
    .replace(/&theta;/g, "θ")
    .replace(/&alpha;/g, "α")
    .replace(/&beta;/g, "β")
    .replace(/&gamma;/g, "γ")
    .replace(/&delta;/g, "Δ")
    .replace(/&lambda;/g, "λ")
    .replace(/&mu;/g, "μ")
    .replace(/&le;/g, "≤")
    .replace(/&ge;/g, "≥")
    .replace(/&ne;/g, "≠")
    .replace(/&deg;/g, "°")
    .replace(/&perp;/g, "⟂")
    .replace(/&ang;/g, "∠")
    .replace(/&sim;/g, "∼")
    .replace(/&cong;/g, "≅")
    .replace(/&there4;/g, "∴")
    .replace(/&hellip;/g, "…")
    .replace(/&rarr;/g, "→")
    .replace(/&larr;/g, "←")
    .replace(/&harr;/g, "↔")
    .replace(/&#8201;/g, "")
    .replace(/&#8202;/g, "")
    .replace(/&#160;|&nbsp;/g, " ")
    .replace(/\\n/g, "\n")
    .trim();
}

/**
 * Clean Shaalaa's backtick-delimited math notation into readable text.
 * Input:  `\`13/5\`` (html-escaped)
 * Output: 13/5  (or formatted with proper math notation)
 *
 * The backtick format \`...\` wraps inline math expressions.
 * Also handles sqrt notation, bar notation for repeating decimals, etc.
 */
function cleanMathNotation(text) {
  if (!text) return "";

  // Strip figcaption/image alt text remnants
  text = text.replace(/Figure\s+\d+\.\d+/gi, "").trim();

  return text
    // Replace escaped backtick-wrapped math: \`content\` → proper notation
    .replace(/\\`([^`]+)\\`/g, (_, math) => formatMath(math))
    // Replace unescaped backtick-wrapped math
    .replace(/`([^`]+)`/g, (_, math) => formatMath(math))
    // Handle sqrt notation: sqrt(N) or sqrt(N)
    .replace(/sqrt\s*\(([^)]+)\)/gi, "√($1)")
    .replace(/sqrt\s*(\d+)/gi, "√$1")
    .replace(/sqrt/gi, "√")
    // Clean up multiple newlines
    .replace(/\n{3,}/g, "\n\n")
    // Clean up excessive whitespace
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}

/**
 * Format a LaTeX-style math expression into readable Unicode text.
 */
function formatMath(math) {
  // LaTeX \frac{a}{b}
  math = math.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, "($1)/($2)");

  // Superscript with braces: x^{abc} → x^(abc), then convert numbers
  math = math.replace(/\^\{([^}]+)\}/g, (_, content) => {
    const superscripted = content.replace(/\d+/g, numToSuperscript)
                                  .replace(/\w/g, c => superscriptLetter(c));
    return superscripted;
  });

  // Simple superscript: x^2, x^3 etc (single term)
  math = math.replace(/\^(\d+)/g, (_, num) => numToSuperscript(num));
  math = math.replace(/\^(-?\w+)/g, (_, term) => superscriptLetter(term));

  // Subscript with braces: x_{abc}
  math = math.replace(/_\{([^}]+)\}/g, (_, content) => subscriptString(content));
  // Simple subscript: x_1, x_n (single term)
  math = math.replace(/_(\d+)/g, (_, num) => numToSubscript(num));
  math = math.replace(/_(\w)/g, (_, c) => subscriptChar(c));

  // Multiplication: xx → × (but preserve xx in hex context, pattern is digitxxdigit)
  math = math.replace(/(\d)xx(\d)/g, "$1×$2");
  math = math.replace(/\\times/g, "×");

  // Overline / bar notation for repeating decimals
  math = math.replace(/\\overline\{([^}]+)\}/g, "$1̅");
  math = math.replace(/\\bar\s*\{([^}]+)\}/g, "$1̅");
  math = math.replace(/\\bar\s*(\d+)/g, "$1̅");
  math = math.replace(/bar\s*(\d+)/g, "$1̅");

  // Greek letters
  math = math.replace(/\\pi/g, "π"); math = math.replace(/\\theta/g, "θ");
  math = math.replace(/\\alpha/g, "α"); math = math.replace(/\\beta/g, "β");
  math = math.replace(/\\gamma/g, "γ"); math = math.replace(/\\delta/g, "Δ");
  math = math.replace(/\\lambda/g, "λ"); math = math.replace(/\\mu/g, "μ");
  math = math.replace(/\\sigma/g, "σ"); math = math.replace(/\\rho/g, "ρ");
  math = math.replace(/\\omega/g, "ω"); math = math.replace(/\\Omega/g, "Ω");

  // Other LaTeX
  math = math.replace(/\\infty/g, "∞"); math = math.replace(/\\sum/g, "∑");
  math = math.replace(/\\int/g, "∫"); math = math.replace(/\\prod/g, "∏");
  math = math.replace(/\\therefore/g, "∴"); math = math.replace(/\\because/g, "∵");
  math = math.replace(/\\pm/g, "±"); math = math.replace(/\\mp/g, "∓");
  math = math.replace(/\\div/g, "÷");
  math = math.replace(/\\leq/g, "≤"); math = math.replace(/\\geq/g, "≥");
  math = math.replace(/\\neq/g, "≠"); math = math.replace(/\\approx/g, "≈");
  math = math.replace(/\\angle/g, "∠"); math = math.replace(/\\triangle/g, "△");
  math = math.replace(/\\degree/g, "°"); math = math.replace(/\\sqrt/g, "√");
  math = math.replace(/\\cdot/g, "·"); math = math.replace(/\\to/g, "→");
  math = math.replace(/\\Rightarrow/g, "⇒"); math = math.replace(/\\Leftrightarrow/g, "⇔");
  math = math.replace(/\\perp/g, "⟂"); math = math.replace(/\\parallel/g, "∥");
  math = math.replace(/\\sim/g, "∼"); math = math.replace(/\\cong/g, "≅");
  math = math.replace(/\\subset/g, "⊂"); math = math.replace(/\\subseteq/g, "⊆");
  math = math.replace(/\\in/g, "∈"); math = math.replace(/\\notin/g, "∉");
  math = math.replace(/\\forall/g, "∀"); math = math.replace(/\\exists/g, "∃");
  math = math.replace(/\\cup/g, "∪"); math = math.replace(/\\cap/g, "∩");
  math = math.replace(/\\empty/g, "∅"); math = math.replace(/\\varnothing/g, "∅");

  return math;
}

function numToSuperscript(num) {
  const sups = {"0":"⁰","1":"¹","2":"²","3":"³","4":"⁴","5":"⁵","6":"⁶","7":"⁷","8":"⁸","9":"⁹"};
  return String(num).split("").map(d => sups[d] || d).join("");
}

function numToSubscript(num) {
  const subs = {"0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉"};
  return String(num).split("").map(d => subs[d] || d).join("");
}

function superscriptLetter(s) {
  const map = {"a":"ᵃ","b":"ᵇ","c":"ᶜ","d":"ᵈ","e":"ᵉ","f":"ᶠ","g":"ᵍ","h":"ʰ","i":"ⁱ","j":"ʲ","k":"ᵏ","l":"ˡ","m":"ᵐ","n":"ⁿ","o":"ᵒ","p":"ᵖ","r":"ʳ","s":"ˢ","t":"ᵗ","u":"ᵘ","v":"ᵛ","w":"ʷ","x":"ˣ","y":"ʸ","z":"ᶻ","-":"⁻","+":"⁺","(":"⁽",")":"⁾"};
  return s.split("").map(c => map[c] || c).join("");
}

function subscriptChar(c) {
  const subs = {"0":"₀","1":"₁","2":"₂","3":"₃","4":"₄","5":"₅","6":"₆","7":"₇","8":"₈","9":"₉","a":"ₐ","e":"ₑ","i":"ᵢ","o":"ₒ","u":"ᵤ","x":"ₓ","+":"₊","-":"₋"};
  return subs[c] || c;
}

function subscriptString(s) {
  return s.split("").map(c => subscriptChar(c)).join("");
}

// ─── Main Scraping Logic ─────────────────────────────────────────

async function scrapeChapter(chapterUrl, chapterName, boardName, className, subjectName, existingByUrl) {
  console.log(`\n  📖 Chapter: ${chapterName}`);
  console.log(`     URL: ${chapterUrl}`);

  let html;
  try {
    html = await fetchPage(chapterUrl);
  } catch (err) {
    console.error(`     ❌ Failed to fetch chapter: ${err.message}`);
    return [];
  }

  // Extract proper chapter name from the page H1 or breadcrumb
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    let fromPage = stripHtml(h1Match[1])
      .replace(/^Balbharati\s*Solutions?\s*for\s*/i, "")
      .replace(/^NCERT\s*Solutions?\s*for\s*/i, "")
      .replace(/^Selina\s*Solutions?\s*for\s*/i, "")
      .replace(/Mathematics\s*\d+\s*\(?\[?English\]?\s*\)?\s*Standard\s*\d+\s*/gi, "")
      .replace(/\s*chapter\s*\d+\s*[-–—]\s*/gi, "")
      .replace(/\s*\[Latest\s*edition\]/gi, "")
      .replace(/\s*Class\s*\d+\s*/gi, "")
      .replace(/Maharashtra\s*State\s*Board/i, "")
      .trim();
    if (fromPage && fromPage.length > 3 && !fromPage.toLowerCase().startsWith("solutions")) {
      chapterName = fromPage;
    }
  }

  const questionLinks = parseQuestionLinks(html, chapterUrl);
  console.log(`     Found ${questionLinks.length} questions`);

  if (questionLinks.length === 0) return [];

  const solutions = [];
  let reused = 0;
  for (let i = 0; i < questionLinks.length; i++) {
    const q = questionLinks[i];
    try {
      // Resume: reuse already-scraped questions instead of re-fetching them.
      if (existingByUrl && existingByUrl.has(q.url)) {
        solutions.push(existingByUrl.get(q.url));
        reused++;
        continue;
      }

      const qHtml = await fetchPage(q.url);
      const { question, answer } = parseSolution(qHtml);

      const solution = {
        question: question || `Question ${i + 1} from ${chapterName}`,
        answer: answer || "See solution on Shaalaa.com",
        board: boardName,
        class: className,
        subject: subjectName,
        chapter: chapterName,
        questionNumber: i + 1,
        sourceUrl: q.url,
        isFree: true,
      };

      solutions.push(solution);

      if ((i + 1) % 10 === 0) {
        console.log(`     Progress: ${i + 1}/${questionLinks.length}`);
      }
    } catch (err) {
      console.error(`     ⚠ Failed question ${i + 1}: ${err.message}`);
    }
  }

  if (reused > 0) console.log(`     ♻️ Reused ${reused}/${questionLinks.length} existing questions`);

  return solutions;
}

async function scrapeSubject(subjectInfo, boardName, className, boardKey, existingByUrl) {
  console.log(`\n📘 Subject: ${subjectInfo.name}`);

  // Two textbook sources, merged and deduped by id:
  //  1. SUBJECT_TEXTBOOKS — deterministic index built from Shaalaa's sitemap. Holds
  //     real books the ?subjects= page often OMITS (Hindi Kshitij/Kritika,
  //     English-Communicative "cbse-solutions" books, etc.). Some entries are stale
  //     404s from before NCERT's 2024-25 curriculum rename — those just yield 0
  //     chapters and are skipped harmlessly.
  //  2. Live ?subjects= page — catches new-curriculum renames (e.g. class 9's new
  //     "Kaveri"/"Ganga"/"Sharda" books) not present in the sitemap snapshot.
  const manifest = SUBJECT_TEXTBOOKS[boardKey]?.[className]?.[subjectInfo.slug];
  const manifestBooks = manifest
    ? manifest.map(t => ({ url: `${BASE}/textbook-solutions/${t.slug}_${t.id}`, id: t.id, slug: t.slug }))
    : [];

  const course = COURSE_IDS[boardKey]?.[className];
  const courseSubjectUrl = course
    ? `${BASE}/search-textbook-solutions/${course.slug}_${course.id}?subjects=${subjectInfo.slug}_${subjectInfo.id}`
    : subjectInfo.url;

  let html;
  try {
    html = await fetchPage(courseSubjectUrl);
  } catch (err) {
    console.error(`  ⚠ Subject page failed: ${err.message} — will try known textbooks`);
    html = ""; // allow fallback to KNOWN_TEXTBOOKS below
  }

  let liveBooks = html ? parseTextbookLinks(html) : [];
  liveBooks = filterTextbooksByBoard(liveBooks, boardKey, className);
  if (html) console.log(`  Live subject page: ${liveBooks.length} board-specific textbooks`);
  if (liveBooks.length > 0) {
    const before = liveBooks.length;
    liveBooks = liveBooks.filter(tb => !isInjectedPopular(tb.slug, subjectInfo.name));
    if (liveBooks.length < before) {
      console.log(`  Dropped ${before - liveBooks.length}/${before} injected "popular" textbooks (kept ${liveBooks.length})`);
    }
  }

  // Merge manifest + live, dedup by textbook id (manifest first for determinism).
  const seen = new Set();
  let textbooks = [];
  for (const tb of [...manifestBooks, ...liveBooks]) {
    if (seen.has(tb.id)) continue;
    seen.add(tb.id);
    textbooks.push(tb);
  }
  console.log(`  Total textbooks to scrape: ${textbooks.length} (${manifestBooks.length} manifest + ${liveBooks.length} live)`);

  if (textbooks.length === 0) {
    // Try known textbook IDs as fallback (for e.g. Maharashtra Class 10 SSC that uses different URL patterns)
    const known = KNOWN_TEXTBOOKS[boardKey]?.[className];
    if (known) {
      const subjLower = subjectInfo.name.toLowerCase();
      let filtered = known;
      const patterns = getSubjectPatterns(subjLower);
      if (patterns.length > 0) {
        filtered = known.filter(t => patterns.some(p => t.slug.includes(p)));
      }
      textbooks = filtered.map(t => ({
        url: `${BASE}/textbook-solutions/${t.slug}_${t.id}`,
        id: t.id,
        slug: t.slug,
      }));
      if (textbooks.length > 0) console.log(`  Using ${textbooks.length} known textbooks as fallback`);
    }
  }

  if (textbooks.length === 0) {
    // Try looking for chapter links directly
    const directChapters = parseChapterLinks(html);
    if (directChapters.length > 0) {
      console.log(`  Found ${directChapters.length} chapters directly`);
      let allSolutions = [];
      for (const ch of directChapters) {
        const solutions = await scrapeChapter(ch.url, ch.name, boardName, className, subjectInfo.name, existingByUrl);
        allSolutions = allSolutions.concat(solutions);
      }
      return allSolutions;
    }
    return [];
  }

  // For each textbook, get chapters
  let allSolutions = [];
  for (const textbook of textbooks) {
    console.log(`\n  📚 Textbook: ${textbook.slug}`);

    let tbHtml;
    try {
      tbHtml = await fetchPage(textbook.url);
    } catch (err) {
      console.error(`    ❌ Failed: ${err.message}`);
      continue;
    }

    const chapters = parseChapterLinks(tbHtml);
    console.log(`    Found ${chapters.length} chapters`);

    for (const ch of chapters) {
      const solutions = await scrapeChapter(ch.url, ch.name, boardName, className, subjectInfo.name, existingByUrl);
      allSolutions = allSolutions.concat(solutions);

      // Save incrementally after each chapter
      saveSolutions(allSolutions, boardKey, className, subjectInfo.slug);
    }
  }

  return allSolutions;
}

function saveSolutions(solutions, board, className, subjectSlug) {
  const dir = path.join(OUTPUT_DIR, board, String(className).padStart(2, "0"), subjectSlug);
  fs.mkdirSync(dir, { recursive: true });

  // Save full file
  const filePath = path.join(dir, "solutions.json");
  fs.writeFileSync(filePath, JSON.stringify(solutions, null, 2));

  // Split into chunks of 100 for easy bulk import
  const chunkSize = 100;
  for (let i = 0; i < solutions.length; i += chunkSize) {
    const chunk = solutions.slice(i, i + chunkSize);
    const chunkPath = path.join(dir, `solutions-chunk-${Math.floor(i / chunkSize) + 1}.json`);
    fs.writeFileSync(chunkPath, JSON.stringify(chunk, null, 2));
  }

  console.log(`\n  💾 Saved ${solutions.length} solutions to ${dir}`);
}

/**
 * Load previously-scraped solutions for a board/class/subject, keyed by sourceUrl.
 * Used by --resume to skip re-fetching questions that are already on disk.
 */
function loadExistingSolutions(board, className, subjectSlug) {
  const dir = path.join(OUTPUT_DIR, board, String(className).padStart(2, "0"), subjectSlug);
  const filePath = path.join(dir, "solutions.json");
  if (!fs.existsSync(filePath)) return null;
  try {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    if (!Array.isArray(data)) return null;
    const map = new Map();
    for (const s of data) {
      if (s && s.sourceUrl) map.set(s.sourceUrl, s);
    }
    return map;
  } catch {
    return null;
  }
}

function convertBoardName(boardKey) {
  const map = {
    maharashtra: "Maharashtra Board",
    cbse: "CBSE",
    icse: "ICSE",
  };
  return map[boardKey] || boardKey;
}

// ─── Discovery Mode ──────────────────────────────────────────────

async function discoverCourse(boardKey, className) {
  const course = COURSE_IDS[boardKey]?.[className];
  if (!course) {
    console.error(`Unknown course for ${boardKey} class ${className}`);
    return null;
  }

  const boardName = convertBoardName(boardKey);
  const courseUrl = `${BASE}/search-textbook-solutions/${course.slug}_${course.id}`;

  console.log(`\n🔍 Discovering ${boardName} Class ${className}`);
  console.log(`   URL: ${courseUrl}\n`);

  let html;
  try {
    html = await fetchPage(courseUrl);
  } catch (err) {
    console.error(`❌ Failed: ${err.message}`);
    return null;
  }

  const subjects = parseSubjectLinks(html, courseUrl);
  console.log(`\n📋 Found ${subjects.length} subjects:\n`);

  for (const s of subjects) {
    console.log(`   ${s.name}`);
    console.log(`     Slug: ${s.slug}  ID: ${s.id}`);
    console.log(`     URL: ${s.url}\n`);
  }

  // Save discovery data
  const dir = path.join(OUTPUT_DIR, boardKey, String(className).padStart(2, "0"));
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "discovery.json"),
    JSON.stringify({ board: boardName, class: className, course, subjects }, null, 2)
  );

  console.log(`\n💾 Saved discovery data to ${dir}/discovery.json`);

  return subjects;
}

// ─── Missing-targets runner ──────────────────────────────────────

/**
 * Scrape every subject in MISSING_TARGETS for the given board (or all boards),
 * skipping discovery (the slug/id pairs are already known from the sitemap).
 */
async function runMissingTargets(boardKeyFilter, resume) {
  const boards = boardKeyFilter ? [boardKeyFilter] : Object.keys(MISSING_TARGETS);
  let grandTotal = 0;

  for (const boardKey of boards) {
    const byClass = MISSING_TARGETS[boardKey];
    if (!byClass) {
      console.error(`❌ No missing-target manifest for board "${boardKey}"`);
      continue;
    }
    const boardName = convertBoardName(boardKey);

    for (const [classStr, subjects] of Object.entries(byClass)) {
      const className = parseInt(classStr);
      console.log(`\n${"═".repeat(60)}`);
      console.log(`  ${boardName} Class ${className}: ${subjects.length} missing subjects`);
      console.log(`${"═".repeat(60)}`);

      for (const subj of subjects) {
        const subjectInfo = { name: subj.name, slug: subj.slug, id: subj.id, url: "" };
        const existingByUrl = resume ? loadExistingSolutions(boardKey, className, subj.slug) : null;
        if (existingByUrl && existingByUrl.size > 0) {
          console.log(`\n♻️ Resume: ${existingByUrl.size} existing solutions loaded for ${subj.name}`);
        }
        const solutions = await scrapeSubject(subjectInfo, boardName, className, boardKey, existingByUrl);
        saveSolutions(solutions, boardKey, className, subj.slug);
        grandTotal += solutions.length;
      }
    }
  }

  console.log(`\n${"═".repeat(60)}`);
  console.log(`  ✅ Missing-targets scrape complete: ${grandTotal} solutions`);
  console.log(`${"═".repeat(60)}`);
  return grandTotal;
}

// ─── CLI ──────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const getArg = (name) => {
    const arg = args.find(a => a.startsWith(`--${name}=`));
    return arg ? arg.split("=")[1] : null;
  };

  const boardKey = getArg("board") || "maharashtra";
  const classStr = getArg("class") || "9";
  const subjectFilter = getArg("subject"); // optional - specific subject slug
  const dryRun = args.includes("--dry");
  const resume = args.includes("--resume");
  const chapterOnly = getArg("chapter"); // optional - specific chapter
  const missing = args.includes("--missing");

  // --missing mode: scrape only the known-missing subjects (no discovery step).
  if (missing) {
    const boardArg = getArg("board"); // optional — null means all boards in manifest
    if (boardArg && !MISSING_TARGETS[boardArg]) {
      console.error(`Unknown board for --missing: ${boardArg}. Valid: ${Object.keys(MISSING_TARGETS).join(", ")}`);
      process.exit(1);
    }
    console.log("═".repeat(60));
    console.log("  Shaalaa Solution Scraper — MISSING TARGETS mode");
    console.log(`  Boards: ${boardArg || Object.keys(MISSING_TARGETS).join(", ")}`);
    if (resume) console.log("  Mode: RESUME (skip already-scraped questions)");
    console.log("═".repeat(60));
    await runMissingTargets(boardArg, resume);
    return;
  }

  const className = parseInt(classStr);

  if (!COURSE_IDS[boardKey]) {
    console.error(`Unknown board: ${boardKey}. Valid: ${Object.keys(COURSE_IDS).join(", ")}`);
    process.exit(1);
  }

  if (!COURSE_IDS[boardKey][className]) {
    console.error(`Unknown class ${className} for ${boardKey}. Valid classes: ${Object.keys(COURSE_IDS[boardKey]).join(", ")}`);
    process.exit(1);
  }

  console.log("═".repeat(60));
  console.log(`  Shaalaa Solution Scraper`);
  console.log(`  Board: ${convertBoardName(boardKey)} | Class: ${className}`);
  if (subjectFilter) console.log(`  Subject: ${subjectFilter}`);
  if (dryRun) console.log(`  Mode: DISCOVERY ONLY (--dry)`);
  if (resume) console.log(`  Mode: RESUME (skip already-scraped questions)`);
  console.log("═".repeat(60));

  // Step 1: Discover subjects
  const subjects = await discoverCourse(boardKey, className);

  if (dryRun || !subjects) {
    console.log("\n✅ Discovery complete. Run without --dry to scrape solutions.");
    return;
  }

  // Step 2: Filter subjects if specified
  let targets = subjects;
  if (subjectFilter) {
    targets = subjects.filter(s =>
      s.slug.includes(subjectFilter.toLowerCase()) ||
      s.name.toLowerCase().includes(subjectFilter.toLowerCase())
    );
    if (targets.length === 0) {
      // Fallback: check KNOWN_TEXTBOOKS for language subjects not on discovery page
      const known = KNOWN_TEXTBOOKS[boardKey]?.[className];
      if (known) {
        const subjLower = subjectFilter.toLowerCase();
        const patterns = getSubjectPatterns(subjLower);
        if (patterns.length > 0) {
          const matching = known.filter(t => patterns.some(p => t.slug.includes(p)));
          if (matching.length > 0) {
            // Create synthetic subject entry — scrapeSubject will use KNOWN_TEXTBOOKS fallback
            const synth = {
              name: subjectFilter.charAt(0).toUpperCase() + subjectFilter.slice(1),
              slug: subjectFilter.toLowerCase(),
              id: "0",
              url: "",
            };
            console.log(`\n📋 Subject "${subjectFilter}" not in discovery — using KNOWN_TEXTBOOKS (${matching.length} textbooks)`);
            targets = [synth];
          }
        }
      }
      if (targets.length === 0) {
        console.error(`\n❌ Subject "${subjectFilter}" not found. Available subjects:`);
        subjects.forEach(s => console.log(`   ${s.name} (${s.slug})`));
        process.exit(1);
      }
    }
  }

  const boardName = convertBoardName(boardKey);

  console.log(`\n🎯 Will scrape ${targets.length} subject(s):`);
  targets.forEach(s => console.log(`   - ${s.name}`));
  console.log(`\n⏱️  Estimated time: ~${targets.length * 5} minutes (${DELAY_MS / 1000}s delay between requests)\n`);

  // Step 3: Scrape each subject
  for (const subject of targets) {
    const existingByUrl = resume ? loadExistingSolutions(boardKey, className, subject.slug) : null;
    if (existingByUrl && existingByUrl.size > 0) {
      console.log(`\n♻️ Resume mode: ${existingByUrl.size} existing solutions loaded — skipping re-fetch`);
    }
    const solutions = await scrapeSubject(subject, boardName, className, boardKey, existingByUrl);
    saveSolutions(solutions, boardKey, className, subject.slug);
  }

  console.log("\n" + "═".repeat(60));
  console.log("  Scraping Complete!");
  console.log(`  Data saved to: ${OUTPUT_DIR}`);
  console.log("═".repeat(60));
  console.log("\nTo import into the admin dashboard:");
  console.log("  1. Go to /admin/solutions");
  console.log("  2. Click 'Bulk Import'");
  console.log("  3. Paste the contents of a solutions-chunk-N.json file");
  console.log("  Or use the API directly:");
  console.log("  curl -X POST /api/admin/solutions -d @solutions-chunk-1.json");
}

main().catch(console.error);
