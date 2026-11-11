export type ReadingBlock = { kind: 'heading' | 'paragraph'; text: string } | { kind: 'list'; items: string[]; ordered: boolean };
const marker = /^(?:[•●▪–-]\s+|\d{1,2}[.)]\s+)/;
const heading = (text: string) => text.length <= 90 && !/[.!?;]$/.test(text) && /[A-Za-zÀ-žА-Яа-яІіЇїЄє]/.test(text)
  && (text === text.toLocaleUpperCase() || (/:$/.test(text) && text.split(/\s+/).length <= 4));
const closingNote = /^(?:повідомлення\s*№|джерело\s*[:—]|source\s*:|fonte\s*:|quelle\s*:|fuente\s*:|źródło\s*:)/i;

// Split at sentence boundaries only; do not paraphrase or remove qualifications.
export function readingParagraphs(text: string): string[] {
  if (text.length <= 420) return [text];
  const sentences = text.split(/(?<=[.!?])\s+(?=[A-ZÀ-ÞА-ЯІЇЄ«“„])/);
  const result: string[] = [];
  let current = '';
  for (const sentence of sentences) {
    if (current && current.length + sentence.length > 360) { result.push(current); current = ''; }
    current = current ? `${current} ${sentence}` : sentence;
  }
  if (current) result.push(current);
  return result;
}
export function newsReadingBlocks(paragraphs: string[]): ReadingBlock[] {
  const values = paragraphs.flatMap(text => text.split(/\n+/)).map(text => text.trim()).filter(Boolean);
  const blocks: ReadingBlock[] = [];
  for (let i = 0; i < values.length; i++) {
    const text = values[i];
    if (marker.test(text)) {
      const items = [text];
      while (i + 1 < values.length && marker.test(values[i + 1])) items.push(values[++i]);
      blocks.push({ kind: 'list', items, ordered: items.every(item => /^\d+[.)]\s/.test(item)) });
      continue;
    }
    if (heading(text)) blocks.push({ kind: 'heading', text });
    else {
      const entries = text.split(/;\s+/);
      if (entries.length >= 3 && entries.every(entry => entry.length > 8)) {
        const colon = entries[0].match(/^(.{2,90}:)\s+(.+)$/);
        if (colon) { blocks.push({ kind: 'paragraph', text: colon[1] }); entries[0] = colon[2]; }
        blocks.push({ kind: 'list', items: entries.map((entry, index) => entry + (index < entries.length - 1 ? ';' : '')), ordered: false });
      } else blocks.push(...readingParagraphs(text).map(value => ({ kind: 'paragraph' as const, text: value })));
    }
    // A colon introduces an actual enumeration in the official notices. Keep its
    // scope until the next heading or long narrative paragraph, never the footer.
    if (/:$/.test(text)) {
      const items: string[] = [];
      let end = i + 1;
      while (end < values.length && !heading(values[end]) && !marker.test(values[end]) && values[end].length <= 420 && !closingNote.test(values[end])) items.push(values[end++]);
      if (items.length >= 2) { blocks.push({ kind: 'list', items, ordered: false }); i = end - 1; }
    }
  }
  return blocks;
}
export function listItemText(text: string) { return text.replace(marker, ''); }
