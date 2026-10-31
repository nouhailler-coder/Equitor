/**
 * Moteur de recherche local (fonctions pures) : insensible à la casse et aux accents,
 * tolérant aux petites fautes de frappe, résultats classés par pertinence.
 */
export type SearchCategory =
  | 'fiche'
  | 'terme'
  | 'exercice'
  | 'competence'
  | 'cheval'
  | 'journal'
  | 'programme'
  | 'ressource';

export interface SearchDoc {
  id: string;
  category: SearchCategory;
  title: string;
  subtitle?: string;
  /** Texte complémentaire indexé (non affiché). */
  body?: string;
  keywords?: string[];
  /** Bonus de pertinence (ex. favoris). */
  boost?: number;
}

export interface SearchHit extends SearchDoc {
  score: number;
}

export const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/[’'`]/g, ' ')
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/** Distance d'édition bornée (au-delà de `max`, renvoie max + 1). */
export function editDistance(a: string, b: string, max = 2): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= b.length; j++) {
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      rowMin = Math.min(rowMin, cur[j]);
    }
    if (rowMin > max) return max + 1;
    prev = cur;
  }
  return prev[b.length];
}

interface IndexedDoc {
  doc: SearchDoc;
  title: string;
  titleWords: string[];
  text: string;
  words: string[];
}

export interface SearchIndex {
  docs: IndexedDoc[];
}

export function buildIndex(docs: SearchDoc[]): SearchIndex {
  return {
    docs: docs.map((doc) => {
      const title = normalize(doc.title);
      const text = normalize([doc.title, doc.subtitle, doc.body, ...(doc.keywords ?? [])].filter(Boolean).join(' '));
      return { doc, title, titleWords: title.split(' '), text, words: [...new Set(text.split(' '))] };
    }),
  };
}

/** Score d'un mot de la requête dans un document (0 = absent). */
function termScore(term: string, d: IndexedDoc): number {
  if (d.title === term) return 100;
  if (d.title.startsWith(term)) return 60;
  if (d.titleWords.some((w) => w.startsWith(term))) return 40;
  if (d.text.includes(term)) return 15;
  if (term.length >= 4) {
    const tolerance = term.length >= 7 ? 2 : 1;
    if (d.titleWords.some((w) => editDistance(term, w.slice(0, term.length + 1), tolerance) <= tolerance)) return 20;
    if (d.words.some((w) => editDistance(term, w, tolerance) <= tolerance)) return 8;
  }
  return 0;
}

export function search(
  index: SearchIndex,
  query: string,
  opts: { categories?: SearchCategory[]; limit?: number } = {},
): SearchHit[] {
  const q = normalize(query);
  if (!q) return [];
  const terms = q.split(' ').filter((t) => t.length > 1 || q.length === 1);
  const hits: SearchHit[] = [];
  for (const d of index.docs) {
    if (opts.categories?.length && !opts.categories.includes(d.doc.category)) continue;
    let score = 0;
    let all = true;
    for (const t of terms) {
      const s = termScore(t, d);
      if (s === 0) {
        all = false;
        break;
      }
      score += s;
    }
    if (!all) continue;
    if (d.title.includes(q) && terms.length > 1) score += 30; // expression exacte
    hits.push({ ...d.doc, score: score + (d.doc.boost ?? 0) });
  }
  return hits.sort((a, b) => b.score - a.score || a.title.localeCompare(b.title, 'fr')).slice(0, opts.limit ?? 50);
}

/** Suggestions : titres qui commencent par la saisie. */
export function suggest(index: SearchIndex, query: string, limit = 5): string[] {
  const q = normalize(query);
  if (q.length < 2) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const d of index.docs) {
    if (d.titleWords.some((w) => w.startsWith(q)) && !seen.has(d.doc.title)) {
      seen.add(d.doc.title);
      out.push(d.doc.title);
      if (out.length >= limit) break;
    }
  }
  return out;
}
