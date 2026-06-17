// scripts/create-indexes.mjs
// Creates compound indexes to optimize the aggregation queries on the class/subject pages.
// Run: node scripts/create-indexes.mjs

import { MongoClient } from "mongodb";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

function loadEnv() {
  const envPath = resolve(__dirname, "..", ".env.local");
  const content = readFileSync(envPath, "utf-8");
  const vars = {};
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    vars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
  }
  return vars;
}

const env = loadEnv();
const uri = env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI not found in .env.local");
  process.exit(1);
}

const indexes = [
  {
    collection: "solutions",
    indexes: [
      { spec: { board: 1, class: 1, subject: 1, chapter: 1 }, name: "board_class_subject_chapter" },
      { spec: { board: 1, class: 1, subject: 1 }, name: "board_class_subject" },
    ],
  },
  {
    collection: "textbooks",
    indexes: [
      { spec: { board: 1, class: 1, subject: 1 }, name: "board_class_subject" },
      { spec: { board: 1, class: 1 }, name: "board_class" },
    ],
  },
  {
    collection: "concept_notes",
    indexes: [
      { spec: { board: 1, class: 1, subject: 1 }, name: "board_class_subject" },
      { spec: { board: 1, class: 1 }, name: "board_class" },
    ],
  },
  {
    collection: "syllabus",
    indexes: [
      { spec: { board: 1, class: 1, subject: 1 }, name: "board_class_subject" },
      { spec: { board: 1, class: 1 }, name: "board_class" },
    ],
  },
  {
    collection: "mcq_questions",
    indexes: [
      { spec: { board: 1, class: 1, subject: 1 }, name: "board_class_subject" },
      { spec: { board: 1, class: 1 }, name: "board_class" },
    ],
  },
  {
    collection: "user_progress",
    indexes: [
      { spec: { userId: 1, board: 1, class: 1, subject: 1, chapter: 1 }, name: "userId_board_class_subject_chapter" },
    ],
  },
];

async function main() {
  console.log("Connecting to MongoDB Atlas...");
  const client = new MongoClient(uri);
  await client.connect();
  const db = client.db("career_guru");
  console.log("Connected.\n");

  for (const { collection, indexes: idxs } of indexes) {
    console.log(`--- ${collection} ---`);
    for (const { spec, name } of idxs) {
      try {
        await db.collection(collection).createIndex(spec, { name, background: true });
        console.log(`  ✓ ${name}: ${JSON.stringify(spec)}`);
      } catch (err) {
        if (err.message?.includes?.("already exists") || err.code === 85 || err.codeName === "IndexAlreadyExists") {
          console.log(`  • ${name}: already exists, skipping`);
        } else {
          console.error(`  ✗ ${name}: ${err.message}`);
        }
      }
    }
  }

  // Show existing indexes
  console.log("\n=== Current Indexes ===");
  for (const { collection } of indexes) {
    const existing = await db.collection(collection).indexes();
    console.log(`\n${collection}:`);
    for (const idx of existing) {
      console.log(`  ${idx.name}: ${JSON.stringify(idx.key)}`);
    }
  }

  await client.close();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
