/**
 * HTML parsing utilities for Shaalaa.com content extraction.
 */

export function stripHtml(html: string): string {
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
    // Fix common UTF-8 mojibake: â€¢ → •, â€" → –, â€" → —
    .replace(/â€¢/g, "•")
    .replace(/â€"/g, "–")
    .replace(/â€"/g, "—")
    .replace(/â€˜/g, "‘")
    .replace(/â€™/g, "’")
    .replace(/â€œ/g, "“")
    .replace(/â€/g, "”")
    .trim();
}

export function extractSubjectLinks(html: string): Array<{ name: string; slug: string; id: string; url: string }> {
  const subjects: Array<{ name: string; slug: string; id: string; url: string }> = [];
  const regex = /href="([^"]*\?subjects=([^"&]+)_(\d+))"/gi;
  let match: RegExpExecArray | null;
  const seen = new Set<string>();

  while ((match = regex.exec(html)) !== null) {
    const fullHref = match[1];
    const slug = match[2];
    const id = match[3];
    if (seen.has(id)) continue;
    seen.add(id);

    const name = slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const url = fullHref.startsWith("http") ? fullHref : `https://www.shaalaa.com${fullHref}`;
    subjects.push({ name, slug, id, url });
  }
  return subjects;
}

export function extractTextbookLinks(html: string): Array<{ url: string; id: string; slug: string }> {
  const textbooks: Array<{ url: string; id: string; slug: string }> = [];
  const regex = /\/textbook-solutions\/([a-z0-9][a-z0-9-]+)_(\d+)/gi;
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const slug = match[1];
    const id = match[2];
    if (seen.has(id)) continue;
    seen.add(id);
    textbooks.push({
      url: `https://www.shaalaa.com/textbook-solutions/${slug}_${id}`,
      id,
      slug,
    });
  }
  return textbooks;
}

export function extractChapterLinks(html: string): Array<{ name: string; slug: string; id: string; url: string }> {
  const chapters: Array<{ name: string; slug: string; id: string; url: string }> = [];
  const regex = /\/textbook-solutions\/c\/([a-z0-9][a-z0-9-]+)_(\d+)/gi;
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const slug = match[1];
    const id = match[2];
    if (seen.has(id)) continue;
    seen.add(id);

    // Try extracting chapter name from the "-chapter-{num}-{name}" suffix first
    let name = "";
    const chapterPartMatch = slug.match(/-chapter-(\d+)-(.+)$/i);
    if (chapterPartMatch) {
      name = chapterPartMatch[2]
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
    }

    // Also try to extract from the anchor tag text (often has better "of"/"and" words)
    const linkRegex = new RegExp(`<a[^>]*href="[^"]*\\/c\\/${slug}_${id}"[^>]*>([\\s\\S]*?)<\\/a>`, "i");
    const linkMatch = html.match(linkRegex);
    let anchorText = "";
    if (linkMatch) {
      anchorText = stripHtml(linkMatch[1]).trim();
      // Strip leading bullet chars, whitespace, and number prefix like "1:"
      anchorText = anchorText.replace(/^[\s•\-•\d]+:?\s*/i, "").trim();
    }

    // Prefer anchor text if it looks like a real chapter name (longer, contains letters)
    if (anchorText && !/^exercises?$/i.test(anchorText) && anchorText.length >= 2) {
      // Use anchor text if it's clearly better than slug-derived name
      if (!name || anchorText.length > name.length) {
        name = anchorText;
      }
    }

    // Fallback: derive from full slug
    if (!name || name.length < 3) {
      name = slug
        .replace(/^(balbharati|ncert|selina|ml-aggarwal|rd-sharma|frank)-solutions-/i, "")
        .replace(/-english-?(standard|medium)?-?\d*.*$/, "")
        .replace(/^mathematics-\d-|^science-and-technology-/, "")
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
        .trim();
    }

    if (!name || name.length < 3) {
      name = `Chapter ${chapters.length + 1}`;
    }

    chapters.push({ name, slug, id, url: `https://www.shaalaa.com/textbook-solutions/c/${slug}_${id}` });
  }
  return chapters;
}

export function extractQuestionLinks(html: string): Array<{ url: string; id: string; slug: string }> {
  const questions: Array<{ url: string; id: string; slug: string }> = [];
  const regex = /\/question-bank-solutions\/([a-z0-9][a-z0-9-]+)_(\d+)/gi;
  const seen = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const slug = match[1];
    const id = match[2];
    if (seen.has(id)) continue;
    seen.add(id);
    questions.push({
      url: `https://www.shaalaa.com/question-bank-solutions/${slug}_${id}`,
      id,
      slug,
    });
  }
  return questions;
}

export function extractPdfLinks(html: string): string[] {
  const pdfs: string[] = [];
  const seen = new Set<string>();

  // Direct PDF links
  const directRegex = /href="([^"]*\.pdf[^"]*)"/gi;
  let match: RegExpExecArray | null;
  while ((match = directRegex.exec(html)) !== null) {
    const url = match[1];
    if (!seen.has(url)) {
      seen.add(url);
      pdfs.push(url.startsWith("http") ? url : `https://www.shaalaa.com${url}`);
    }
  }

  // Links containing "download" or "pdf" in class/text
  const hintRegex = /href="([^"]*(?:download|pdf)[^"]*)"/gi;
  while ((match = hintRegex.exec(html)) !== null) {
    const url = match[1];
    if (!seen.has(url) && !url.endsWith(".html")) {
      seen.add(url);
      pdfs.push(url.startsWith("http") ? url : `https://www.shaalaa.com${url}`);
    }
  }

  return pdfs;
}

export function extractCoverImage(html: string): string {
  const ogMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]+)"/i);
  if (ogMatch) return ogMatch[1];

  const imgMatch =
    html.match(/<img[^>]*class="[^"]*book[_-]?cover[^"]*"[^>]*src="([^"]+)"/i) ||
    html.match(/<img[^>]*src="([^"]*cover[^"]*)"[^>]*>/i);

  if (imgMatch) {
    const src = imgMatch[1];
    return src.startsWith("http") ? src : `https://www.shaalaa.com${src}`;
  }
  return "";
}

export function parseSolutionPage(html: string): { question: string; answer: string } {
  let question = "";
  let answer = "";

  // Extract from JSON-LD structured data — Shaalaa uses QAPage format:
  // { "@type": "QAPage", mainEntity: { "@type": "Question", name: "...", acceptedAnswer: { "@type": "Answer", text: "..." } } }
  const ldMatch = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/i);
  if (ldMatch) {
    try {
      const ld = JSON.parse(ldMatch[1]);
      const items = Array.isArray(ld) ? ld : [ld];

      for (const item of items) {
        // QAPage format
        if (item["@type"] === "QAPage" && item.mainEntity) {
          const q = item.mainEntity;
          if (q["@type"] === "Question" && q.name) {
            question = stripHtml(q.name).trim();
          }
          if (q.acceptedAnswer && q.acceptedAnswer.text) {
            answer = stripHtml(q.acceptedAnswer.text).trim();
          }
          if (q.suggestedAnswer && q.suggestedAnswer.text && !answer) {
            answer = stripHtml(q.suggestedAnswer.text).trim();
          }
        }
        // @graph format (older pages)
        if (item["@graph"]) {
          for (const node of item["@graph"]) {
            if (node["@type"] === "Question" && node.name && !question) {
              question = stripHtml(node.name).trim();
            }
            if (node["@type"] === "Answer" && node.text) {
              answer = stripHtml(node.text).trim();
            }
          }
        }
      }
    } catch {}
  }

  // Fallback: H1 for question
  if (!question) {
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) question = stripHtml(h1Match[1]).trim();
  }

  // Shaalaa-specific: solution is in div.qbq_text_solution (after "Show Solution" is clicked)
  if (!answer) {
    const solBlock = html.match(
      /<div[^>]*class="[^"]*qbq_text_solution[^"]*"[^>]*>([\s\S]*?)<\/div>/i
    );
    if (solBlock) {
      answer = stripHtml(solBlock[1]).trim();
    }
  }

  // Also check for solution content in tabs_content
  if (!answer) {
    const tabContent = html.match(
      /<div[^>]*class="[^"]*tabs_content[^"]*"[^>]*>([\s\S]*?)<\/div>/i
    );
    if (tabContent) {
      answer = stripHtml(tabContent[1]).trim();
    }
  }

  // Generic fallbacks
  if (!answer) {
    const solDiv =
      html.match(/class="[^"]*solution[_-]?content[^"]*"[^>]*>([\s\S]*?)<\/div>/i) ||
      html.match(/class="[^"]*answer[^"]*"[^>]*>([\s\S]*?)<\/div>/i);
    if (solDiv) answer = stripHtml(solDiv[1]).trim();
  }

  // Last resort: extract all text from main content
  if (!answer) {
    let body = html
      .replace(/<script[\s\S]*?<\/script>/gi, "")
      .replace(/<style[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[\s\S]*?<\/nav>/gi, "")
      .replace(/<header[\s\S]*?<\/header>/gi, "")
      .replace(/<footer[\s\S]*?<\/footer>/gi, "");
    const mainMatch = body.match(/<main[^>]*>([\s\S]*?)<\/main>/i);
    if (mainMatch) {
      const text = stripHtml(mainMatch[1]).trim();
      if (question && text.includes(question)) {
        answer = text.substring(text.indexOf(question) + question.length).trim();
      } else {
        answer = text;
      }
    }
  }

  // Clean up prefixes
  question = question.replace(/^(Question\s*:?\s*|Q\s*:?\s*|Q\.\s*)/i, "").trim();
  answer = answer
    .replace(/^Solution\s*:?\s*/i, "")
    .replace(/^Show\s*Solution\s*/i, "")
    .replace(/^Answer\s*:?\s*/i, "")
    .replace(/^SolutionShow Solution\s*/i, "")
    .trim();

  return { question, answer };
}
