import * as fs from "fs";
import * as path from "path";

// Load .env.local
const envPath = path.resolve(process.cwd(), ".env.local");
const content = fs.readFileSync(envPath, "utf-8");
for (const line of content.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eqIdx = trimmed.indexOf("=");
  if (eqIdx === -1) continue;
  const key = trimmed.slice(0, eqIdx);
  const val = trimmed.slice(eqIdx + 1);
  if (!process.env[key]) process.env[key] = val;
}

async function main() {
  const { default: clientPromise } = await import("../lib/db/mongodb");
  const client = await clientPromise;
  const db = client.db("career_guru");
  const col = db.collection("solutions");

  // Distinct boards
  const boards = await col.distinct("board");
  console.log("Boards in DB:", boards);

  // Class 10 total
  const mah10 = await col.countDocuments({ board: "Maharashtra Board", class: 10 });
  console.log(`Maharashtra Board class 10 total: ${mah10}`);

  // By subject
  const subjects = await col.aggregate([
    { $match: { board: "Maharashtra Board", class: 10 } },
    { $group: { _id: "$subject", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
  ]).toArray();
  console.log("\nSubjects:");
  subjects.forEach(s => console.log(`  ${s._id}: ${s.count}`));

  // Check English samples
  const eng = await col.find({ board: "Maharashtra Board", class: 10, subject: /english/i }).limit(3).toArray();
  console.log("\nEnglish samples:", eng.map(e => ({ subject: e.subject, board: e.board, chapter: e.chapter })));

  // Check Geography
  const geo = await col.find({ board: "Maharashtra Board", class: 10, subject: /geo/i }).limit(2).toArray();
  console.log("\nGeography samples:", geo.map(e => ({ subject: e.subject, board: e.board })));

  // Check Hindi
  const hin = await col.find({ board: "Maharashtra Board", class: 10, subject: /hindi|hin/i }).limit(2).toArray();
  console.log("\nHindi samples:", hin.map(e => ({ subject: e.subject, board: e.board })));

  // Check Marathi
  const mar = await col.find({ board: "Maharashtra Board", class: 10, subject: /mar/i }).limit(2).toArray();
  console.log("\nMarathi samples:", mar.map(e => ({ subject: e.subject, board: e.board })));

  // Check History
  const his = await col.find({ board: "Maharashtra Board", class: 10, subject: /hist/i }).limit(2).toArray();
  console.log("\nHistory samples:", his.map(e => ({ subject: e.subject, board: e.board })));

  await client.close();
}

main().catch(console.error);
