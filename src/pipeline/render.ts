import type { AssembledLetter, CitationRef } from "./types.js";

interface CitationLike {
  cited_text: string;
  document_title?: string | null;
  start_page_number?: number;
  end_page_number?: number;
  start_char_index?: number;
  end_char_index?: number;
  type: string;
}

interface TextBlockLike {
  type: string;
  text?: string;
  citations?: CitationLike[] | null;
}

function locationOf(c: CitationLike): string {
  if (c.type === "page_location" && c.start_page_number != null) {
    const end = c.end_page_number != null ? c.end_page_number - 1 : c.start_page_number;
    return end > c.start_page_number ? `pp.${c.start_page_number}-${end}` : `p.${c.start_page_number}`;
  }
  if (c.type === "char_location" && c.start_char_index != null) {
    return `chars ${c.start_char_index}-${c.end_char_index ?? "?"}`;
  }
  return "";
}

/**
 * Walk the drafter's content blocks and assemble the letter text with [n]
 * citation markers plus a numbered reference list. Identical (doc, location,
 * cited_text) citations share a number.
 */
export function assembleLetter(content: TextBlockLike[]): AssembledLetter {
  const refs: CitationRef[] = [];
  const seen = new Map<string, number>();
  let text = "";

  for (const block of content) {
    if (block.type !== "text" || !block.text) continue;
    text += block.text;
    for (const c of block.citations ?? []) {
      const key = `${c.document_title}|${locationOf(c)}|${c.cited_text}`;
      let n = seen.get(key);
      if (n == null) {
        n = refs.length + 1;
        seen.set(key, n);
        refs.push({
          n,
          cited_text: c.cited_text.trim(),
          doc_title: c.document_title ?? "unknown document",
          location: locationOf(c),
        });
      }
      text += `[${n}]`;
    }
  }
  return { text, refs };
}

export function letterWithSources(letter: AssembledLetter): string {
  const sources = letter.refs
    .map(
      (r) =>
        `[${r.n}] ${r.doc_title} (${r.location}):\n    "${r.cited_text.replace(/\s+/g, " ").slice(0, 220)}"`,
    )
    .join("\n\n");
  return `${letter.text}\n\n${"=".repeat(72)}\nEVIDENCE CHAIN (API-enforced citations)\n${"=".repeat(72)}\n\n${sources}\n`;
}
