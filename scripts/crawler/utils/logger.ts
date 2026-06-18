import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "academic-library", "logs");

function ensureDir() {
  if (!fs.existsSync(LOG_DIR)) fs.mkdirSync(LOG_DIR, { recursive: true });
}

function timestamp(): string {
  return new Date().toISOString();
}

function writeLog(file: string, level: string, msg: string) {
  ensureDir();
  const line = `[${timestamp()}] [${level}] ${msg}\n`;
  fs.appendFileSync(path.join(LOG_DIR, file), line, "utf-8");
}

export const logger = {
  info(msg: string) {
    writeLog("crawler.log", "INFO", msg);
    console.log(`  ℹ ${msg}`);
  },
  success(msg: string) {
    writeLog("crawler.log", "SUCCESS", msg);
    console.log(`  ✅ ${msg}`);
  },
  warn(msg: string) {
    writeLog("crawler.log", "WARN", msg);
    console.log(`  ⚠️ ${msg}`);
  },
  error(msg: string) {
    writeLog("errors.log", "ERROR", msg);
    console.log(`  ❌ ${msg}`);
  },
  download(msg: string) {
    writeLog("downloads.log", "DOWNLOAD", msg);
  },
  skip(msg: string) {
    writeLog("skipped.log", "SKIP", msg);
  },
  progress(current: number, total: number, label: string) {
    const pct = total > 0 ? Math.round((current / total) * 100) : 0;
    process.stdout.write(`\r  📦 ${label}: ${current}/${total} (${pct}%)`);
    if (current >= total) process.stdout.write("\n");
  },
};
