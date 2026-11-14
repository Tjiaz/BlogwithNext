export type TocHeading = {
  id: string;
  text: string;
  level: 2 | 3 | 4;
};

type RawSection = {
  index: number;
  level: 2 | 3 | 4;
  text: string;
  existingId?: string;
};

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&#(\d+);/g, (_, n) => {
      const code = Number(n);
      return Number.isFinite(code) && code > 0 && code < 0x110000
        ? String.fromCodePoint(code)
        : "";
    })
    .replace(/\s+/g, " ")
    .trim();
}

function slugifyHeading(text: string): string {
  const slug = text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
  return slug || "section";
}

function addIdToOpeningTag(source: string, tagStart: number, id: string): string {
  const tagEnd = source.indexOf(">", tagStart);
  if (tagEnd === -1) return source;
  const open = source.slice(tagStart, tagEnd);
  const next = /\bid\s*=/.test(open)
    ? open.replace(/\bid\s*=\s*["'][^"']*["']/i, `id="${id}"`)
    : `${open} id="${id}"`;
  return source.slice(0, tagStart) + next + source.slice(tagEnd);
}

/**
 * Injects stable ids into article sections and returns a table-of-contents list.
 * Uses h2–h4 when the article has them. Articles that mark sections with a
 * bold-only paragraph get those titles instead.
 */
export function processArticleContent(html: string): {
  html: string;
  headings: TocHeading[];
} {
  if (!html || typeof html !== "string") {
    return { html: html || "", headings: [] };
  }

  const semantic: RawSection[] = [];
  const headingRe = /<(h[2-4])(\s[^>]*)?>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;
  while ((match = headingRe.exec(html))) {
    const text = stripHtml(match[3]);
    if (!text) continue;
    semantic.push({
      index: match.index,
      level: Number(match[1][1]) as 2 | 3 | 4,
      text,
      existingId: match[2]?.match(/\bid\s*=\s*["']([^"']+)["']/i)?.[1],
    });
  }

  const boldSections: RawSection[] = [];
  if (semantic.length < 2) {
    const boldRe =
      /<p(\s[^>]*)?>\s*(?:<br\s*\/?>\s*)*(?:<span\b[^>]*>\s*)*<(strong|b)\b[^>]*>([\s\S]*?)<\/\2>\s*(?:<\/span>\s*)*(?:<br\s*\/?>\s*)*<\/p>/gi;
    while ((match = boldRe.exec(html))) {
      const text = stripHtml(match[3]);
      if (text.length < 2 || text.length > 140) continue;
      if (/<[a-z]/i.test(match[3])) continue;
      boldSections.push({
        index: match.index,
        level: 2,
        text,
        existingId: match[1]?.match(/\bid\s*=\s*["']([^"']+)["']/i)?.[1],
      });
    }
  }

  const sections =
    semantic.length >= 2
      ? semantic
      : [...semantic, ...boldSections].sort((a, b) => a.index - b.index);

  if (!sections.length) {
    return { html, headings: [] };
  }

  const usedIds = new Set<string>();
  const headings: TocHeading[] = [];
  const stamped = sections.map((section) => {
    let id = section.existingId || slugifyHeading(section.text);
    const base = id;
    let n = 2;
    while (usedIds.has(id)) id = `${base}-${n++}`;
    usedIds.add(id);
    headings.push({ id, text: section.text, level: section.level });
    return { index: section.index, id };
  });

  let processed = html;
  for (let i = stamped.length - 1; i >= 0; i--) {
    processed = addIdToOpeningTag(processed, stamped[i].index, stamped[i].id);
  }

  return { html: processed, headings };
}
