import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "academic-library", "cache");

function ensureDir() {
  if (!fs.existsSync(CACHE_DIR)) fs.mkdirSync(CACHE_DIR, { recursive: true });
}

function loadCache<T>(file: string): T {
  ensureDir();
  const p = path.join(CACHE_DIR, file);
  try {
    if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf-8"));
  } catch {}
  return {} as unknown as T;
}

function saveCache(file: string, data: unknown) {
  ensureDir();
  fs.writeFileSync(path.join(CACHE_DIR, file), JSON.stringify(data, null, 2), "utf-8");
}

export interface VisitedPages {
  [url: string]: { visitedAt: string; status: number; type: string };
}

export interface DownloadedBook {
  [key: string]: { downloadedAt: string; path: string; size: number };
}

export interface DownloadedPdf {
  [url: string]: { downloadedAt: string; path: string; size: number; checksum?: string };
}

export const cache = {
  visitedPages(): VisitedPages {
    return loadCache<VisitedPages>("visited-pages.json");
  },
  markVisited(url: string, status: number, type: string) {
    const v = this.visitedPages();
    v[url] = { visitedAt: new Date().toISOString(), status, type };
    saveCache("visited-pages.json", v);
  },
  isVisited(url: string): boolean {
    return url in this.visitedPages();
  },

  downloadedBooks(): DownloadedBook {
    return loadCache<DownloadedBook>("downloaded-books.json");
  },
  markBookDownloaded(key: string, filePath: string, size: number) {
    const b = this.downloadedBooks();
    b[key] = { downloadedAt: new Date().toISOString(), path: filePath, size };
    saveCache("downloaded-books.json", b);
  },
  isBookDownloaded(key: string): boolean {
    return key in this.downloadedBooks();
  },

  downloadedPdfs(): DownloadedPdf {
    return loadCache<DownloadedPdf>("downloaded-pdfs.json");
  },
  markPdfDownloaded(url: string, filePath: string, size: number, checksum?: string) {
    const p = this.downloadedPdfs();
    p[url] = { downloadedAt: new Date().toISOString(), path: filePath, size, checksum };
    saveCache("downloaded-pdfs.json", p);
  },
  isPdfDownloaded(url: string): boolean {
    return url in this.downloadedPdfs();
  },

  saveCheckpoint(key: string, data: unknown) {
    ensureDir();
    fs.writeFileSync(path.join(CACHE_DIR, `checkpoint-${key}.json`), JSON.stringify(data, null, 2), "utf-8");
  },
  loadCheckpoint<T>(key: string): T | null {
    const p = path.join(CACHE_DIR, `checkpoint-${key}.json`);
    try {
      if (fs.existsSync(p)) return JSON.parse(fs.readFileSync(p, "utf-8"));
    } catch {}
    return null;
  },
};
