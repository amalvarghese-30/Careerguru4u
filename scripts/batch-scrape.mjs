/**
 * Batch scraper — runs multiple subject scrapes in parallel.
 * Usage:
 *   node scripts/batch-scrape.mjs --board=maharashtra --class=9
 *   node scripts/batch-scrape.mjs --board=maharashtra --class=9 --subject=algebra,geometry
 *   node scripts/batch-scrape.mjs --board=maharashtra --class=8,9,10 --parallel=3
 *   node scripts/batch-scrape.mjs --board=cbse --class=9,10 --parallel=2
 */

import { execSync } from "child_process";
import { spawn } from "child_process";
import fs from "fs";
import path from "path";

const SCRAPER = path.join(process.cwd(), "scripts", "scrape-shaalaa.mjs");

function getArg(name) {
  const arg = process.argv.find(a => a.startsWith(`--${name}=`));
  return arg ? arg.split("=")[1] : null;
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function runScraper(board, cls, subject) {
  const args = [`--board=${board}`, `--class=${cls}`];
  if (subject) args.push(`--subject=${subject}`);

  const label = `${board}/class${cls}${subject ? "/" + subject : ""}`;

  return new Promise((resolve) => {
    const proc = spawn("node", [SCRAPER, ...args], {
      stdio: ["ignore", "pipe", "pipe"],
      cwd: process.cwd(),
    });

    let stdout = "";
    let stderr = "";

    proc.stdout.on("data", (d) => { stdout += d.toString(); });
    proc.stderr.on("data", (d) => { stderr += d.toString(); });

    proc.on("close", (code) => {
      // Extract key info from output
      const solMatch = stdout.match(/Saved (\d+) solutions/);
      const count = solMatch ? parseInt(solMatch[1]) : 0;

      if (code === 0) {
        console.log(`  ✅ ${label}: ${count} solutions`);
      } else {
        console.log(`  ❌ ${label}: failed (exit ${code})`);
        if (stderr) console.log(`     ${stderr.slice(0, 200)}`);
      }
      resolve({ board, class: cls, subject, count, success: code === 0 });
    });

    proc.on("error", (err) => {
      console.log(`  ❌ ${label}: ${err.message}`);
      resolve({ board, class: cls, subject, count: 0, success: false });
    });
  });
}

async function discoverSubjects(board, cls) {
  const args = [`--board=${board}`, `--class=${cls}`, "--dry"];

  return new Promise((resolve) => {
    const proc = spawn("node", [SCRAPER, ...args], {
      stdio: ["ignore", "pipe", "pipe"],
      cwd: process.cwd(),
    });

    let stdout = "";
    proc.stdout.on("data", (d) => { stdout += d.toString(); });
    proc.stderr.on("data", () => {});

    proc.on("close", () => {
      const discoveryPath = path.join(
        process.cwd(), "scraped-data", board, String(cls).padStart(2, "0"), "discovery.json"
      );
      try {
        const disc = JSON.parse(fs.readFileSync(discoveryPath, "utf8"));
        resolve(disc.subjects || []);
      } catch {
        resolve([]);
      }
    });

    proc.on("error", () => resolve([]));
  });
}

async function main() {
  const board = getArg("board") || "maharashtra";
  const classStr = getArg("class") || "9";
  const subjectFilter = getArg("subject");
  const parallel = parseInt(getArg("parallel") || "2");

  const classes = classStr.split(",").map(Number);
  const boardNames = { maharashtra: "Maharashtra Board", cbse: "CBSE", icse: "ICSE" };

  console.log("═".repeat(60));
  console.log(`  Batch Scraper — ${boardNames[board] || board}`);
  console.log(`  Classes: ${classes.join(", ")} | Parallel: ${parallel}`);
  console.log("═".repeat(60));

  // Discover subjects for each class
  const allTasks = [];
  for (const cls of classes) {
    console.log(`\n🔍 Discovering class ${cls}...`);
    const subjects = await discoverSubjects(board, cls);
    console.log(`  Found ${subjects.length} subjects`);

    let targets = subjects;
    if (subjectFilter) {
      const filters = subjectFilter.split(",").map(s => s.trim().toLowerCase());
      targets = subjects.filter(s =>
        filters.some(f => s.slug.includes(f) || s.name.toLowerCase().includes(f))
      );
    }

    // Priority subjects first (math, science) then the rest
    const priority = targets.filter(s => {
      const n = s.name.toLowerCase();
      return n.includes("math") || n.includes("algebra") || n.includes("geometry") || n.includes("science");
    });
    const rest = targets.filter(s => !priority.includes(s));
    targets = [...priority, ...rest];

    for (const s of targets) {
      allTasks.push({ board, cls, subject: s.slug, name: s.name });
    }
  }

  console.log(`\n📋 Total tasks: ${allTasks.length}`);
  console.log(`⏱️  Estimated: ~${Math.ceil(allTasks.length * 8 / parallel)} minutes\n`);

  // Run in parallel batches
  const results = [];
  for (let i = 0; i < allTasks.length; i += parallel) {
    const batch = allTasks.slice(i, i + parallel);
    console.log(`\n--- Batch ${Math.floor(i / parallel) + 1}/${Math.ceil(allTasks.length / parallel)} ---`);
    const batchResults = await Promise.all(batch.map(t => runScraper(t.board, t.cls, t.subject)));
    results.push(...batchResults);
  }

  // Summary
  console.log("\n" + "═".repeat(60));
  console.log("  Batch Complete!");
  const totalSolutions = results.reduce((sum, r) => sum + r.count, 0);
  const succeeded = results.filter(r => r.success).length;
  console.log(`  ${succeeded}/${results.length} tasks succeeded, ${totalSolutions} total solutions`);
  console.log("═".repeat(60));
}

main().catch(console.error);
