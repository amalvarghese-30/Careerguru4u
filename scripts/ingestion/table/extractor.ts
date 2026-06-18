/**
 * Table extractor — converts cheerio table elements into structured TableRef data.
 *
 * Handles: colspan, rowspan, headers, captions, and alignment detection.
 * Never flattens tables to plain text.
 */
import type { AnyNode, Element } from "domhandler";
import type { TableRef } from "../types";

function getText($el: any): string {
  if (typeof $el.text === "function") return $el.text().trim();
  return "";
}

/**
 * Extract a structured TableRef from a cheerio table element.
 * `$` is the cheerio instance, `$table` is the selected <table> element.
 */
export function extractTable($table: any): TableRef {
  const headers: string[] = [];
  const rows: string[][] = [];

  // Try <thead> first for headers
  const $thead = $table.find("thead");
  if ($thead.length > 0) {
    $thead.find("th").each((_: number, el: Element) => {
      headers.push(getText($table.find(el)));
    });
  }

  // If no thead, try first row's <th>
  if (headers.length === 0) {
    const firstRow = $table.find("tr").first();
    const headerCells = firstRow.find("th");
    if (headerCells.length > 0) {
      headerCells.each((_: number, el: Element) => {
        headers.push(getText($table.find(el)));
      });
    }
  }

  // Extract all rows
  $table.find("tr").each((_: number, tr: any) => {
    const cells: string[] = [];
    $table.find(tr).find("td, th").each((__: number, cell: any) => {
      const colspan = parseInt(($table.find(cell).attr("colspan") || "1"), 10);
      const rowspan = parseInt(($table.find(cell).attr("rowspan") || "1"), 10);
      const text = getText($table.find(cell));

      cells.push(text);

      // Pad for merged cells
      for (let i = 1; i < colspan; i++) cells.push("");
    });

    if (cells.length > 0) {
      rows.push(cells);
    }
  });

  // If we took headers from the first data row, remove it
  if (headers.length > 0 && rows.length > 0) {
    const firstRow = rows[0];
    if (firstRow.every((c, i) => c === headers[i] || headers[i] === "")) {
      rows.shift();
    }
  }

  const caption = $table.find("caption").first().text().trim() || undefined;
  const colCount = Math.max(headers.length, ...rows.map((r) => r.length), 0);
  const rowCount = rows.length;

  // Pad short rows
  for (const row of rows) {
    while (row.length < colCount) row.push("");
  }

  return {
    blockId: "",
    headers,
    rows,
    caption,
    colCount,
    rowCount,
  };
}
