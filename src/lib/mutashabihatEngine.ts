/**
 * Client-side Quran similarity engine
 * Ported from the mutashabihat-demo HTML app.
 * Builds an in-memory index of shared beginnings, endings, and phrases.
 */

export interface VerseInfo {
  s: number; // surah
  a: number; // ayah
  nm: string; // surah name
  t: string; // original text
}

export interface PhraseMatch {
  pc: string; // cleaned phrase
  pt: string; // original phrase text
  n: number; // word count
  count: number;
  oth: VerseInfo[];
  kind: "b" | "e" | "p"; // begin, end, phrase
}

export interface AyahDetail {
  text: string;
  begins: PhraseMatch[];
  ends: PhraseMatch[];
  phrases: PhraseMatch[];
}

export interface AyahCounts {
  b: number;
  e: number;
  p: number;
  total: number;
}

interface RawVerse {
  s: number;
  a: number;
  t: string;
  c: string; // stripped text
}

interface Index {
  b: Record<string, string[]>;
  e: Record<string, string[]>;
  p: Record<string, string[]>;
}

const SURAHS_DATA: { n: number; nm: string; c: number }[] = [
  {n:1,nm:'الفاتحة',c:7},{n:2,nm:'البقرة',c:286},{n:3,nm:'آل عمران',c:200},
  {n:4,nm:'النساء',c:176},{n:5,nm:'المائدة',c:120},{n:6,nm:'الأنعام',c:165},
  {n:7,nm:'الأعراف',c:206},{n:8,nm:'الأنفال',c:75},{n:9,nm:'التوبة',c:129},
  {n:10,nm:'يونس',c:109},{n:11,nm:'هود',c:123},{n:12,nm:'يوسف',c:111},
  {n:13,nm:'الرعد',c:43},{n:14,nm:'إبراهيم',c:52},{n:15,nm:'الحجر',c:99},
  {n:16,nm:'النحل',c:128},{n:17,nm:'الإسراء',c:111},{n:18,nm:'الكهف',c:110},
  {n:19,nm:'مريم',c:98},{n:20,nm:'طه',c:135},{n:21,nm:'الأنبياء',c:112},
  {n:22,nm:'الحج',c:78},{n:23,nm:'المؤمنون',c:118},{n:24,nm:'النور',c:64},
  {n:25,nm:'الفرقان',c:77},{n:26,nm:'الشعراء',c:227},{n:27,nm:'النمل',c:93},
  {n:28,nm:'القصص',c:88},{n:29,nm:'العنكبوت',c:69},{n:30,nm:'الروم',c:60},
  {n:31,nm:'لقمان',c:34},{n:32,nm:'السجدة',c:30},{n:33,nm:'الأحزاب',c:73},
  {n:34,nm:'سبأ',c:54},{n:35,nm:'فاطر',c:45},{n:36,nm:'يس',c:83},
  {n:37,nm:'الصافات',c:182},{n:38,nm:'ص',c:88},{n:39,nm:'الزمر',c:75},
  {n:40,nm:'غافر',c:85},{n:41,nm:'فصلت',c:54},{n:42,nm:'الشورى',c:53},
  {n:43,nm:'الزخرف',c:89},{n:44,nm:'الدخان',c:59},{n:45,nm:'الجاثية',c:37},
  {n:46,nm:'الأحقاف',c:35},{n:47,nm:'محمد',c:38},{n:48,nm:'الفتح',c:29},
  {n:49,nm:'الحجرات',c:18},{n:50,nm:'ق',c:45},{n:51,nm:'الذاريات',c:60},
  {n:52,nm:'الطور',c:49},{n:53,nm:'النجم',c:62},{n:54,nm:'القمر',c:55},
  {n:55,nm:'الرحمن',c:78},{n:56,nm:'الواقعة',c:96},{n:57,nm:'الحديد',c:29},
  {n:58,nm:'المجادلة',c:22},{n:59,nm:'الحشر',c:24},{n:60,nm:'الممتحنة',c:13},
  {n:61,nm:'الصف',c:14},{n:62,nm:'الجمعة',c:11},{n:63,nm:'المنافقون',c:11},
  {n:64,nm:'التغابن',c:18},{n:65,nm:'الطلاق',c:12},{n:66,nm:'التحريم',c:12},
  {n:67,nm:'الملك',c:30},{n:68,nm:'القلم',c:52},{n:69,nm:'الحاقة',c:52},
  {n:70,nm:'المعارج',c:44},{n:71,nm:'نوح',c:28},{n:72,nm:'الجن',c:28},
  {n:73,nm:'المزمل',c:20},{n:74,nm:'المدثر',c:56},{n:75,nm:'القيامة',c:40},
  {n:76,nm:'الإنسان',c:31},{n:77,nm:'المرسلات',c:50},{n:78,nm:'النبأ',c:40},
  {n:79,nm:'النازعات',c:46},{n:80,nm:'عبس',c:42},{n:81,nm:'التكوير',c:29},
  {n:82,nm:'الانفطار',c:19},{n:83,nm:'المطففين',c:36},{n:84,nm:'الانشقاق',c:25},
  {n:85,nm:'البروج',c:22},{n:86,nm:'الطارق',c:17},{n:87,nm:'الأعلى',c:19},
  {n:88,nm:'الغاشية',c:26},{n:89,nm:'الفجر',c:30},{n:90,nm:'البلد',c:20},
  {n:91,nm:'الشمس',c:15},{n:92,nm:'الليل',c:21},{n:93,nm:'الضحى',c:11},
  {n:94,nm:'الشرح',c:8},{n:95,nm:'التين',c:8},{n:96,nm:'العلق',c:19},
  {n:97,nm:'القدر',c:5},{n:98,nm:'البينة',c:8},{n:99,nm:'الزلزلة',c:8},
  {n:100,nm:'العاديات',c:11},{n:101,nm:'القارعة',c:11},{n:102,nm:'التكاثر',c:8},
  {n:103,nm:'العصر',c:3},{n:104,nm:'الهمزة',c:9},{n:105,nm:'الفيل',c:5},
  {n:106,nm:'قريش',c:4},{n:107,nm:'الماعون',c:7},{n:108,nm:'الكوثر',c:3},
  {n:109,nm:'الكافرون',c:6},{n:110,nm:'النصر',c:3},{n:111,nm:'المسد',c:5},
  {n:112,nm:'الإخلاص',c:4},{n:113,nm:'الفلق',c:5},{n:114,nm:'الناس',c:6}
];

function getSurahName(n: number): string {
  return SURAHS_DATA.find(x => x.n === n)?.nm || '';
}

function getSurahAyahCount(n: number): number {
  return SURAHS_DATA.find(x => x.n === n)?.c || 0;
}

function strip(t: string): string {
  return t
    .replace(/[\u0617-\u061A\u064B-\u0652\u0656-\u065F\u0670]/g, '')
    .replace(/\u0671/g, '\u0627')
    .replace(/\s+/g, ' ')
    .trim();
}

let IDX: Index | null = null;
let LKUP: Record<string, { t: string; c: string }> | null = null;
let engineReady = false;
let engineLoading = false;
let enginePromise: Promise<boolean> | null = null;

export type ProgressCallback = (title: string, sub: string, percent: number) => void;

export function isEngineReady(): boolean {
  return engineReady;
}

export async function ensureEngine(onProgress?: ProgressCallback): Promise<boolean> {
  if (engineReady) return true;
  if (engineLoading && enginePromise) return enginePromise;

  engineLoading = true;
  enginePromise = _loadEngine(onProgress);
  const result = await enginePromise;
  engineLoading = false;
  return result;
}

async function _loadEngine(onP?: ProgressCallback): Promise<boolean> {
  const progress = onP || (() => {});
  progress('جاري تحميل القرآن الكريم...', '', 5);

  let verses: RawVerse[];
  try {
    const r = await fetch('https://api.alquran.cloud/v1/quran/quran-uthmani');
    if (!r.ok) throw new Error('Failed to fetch');
    progress('جاري معالجة البيانات...', '', 40);
    const d = await r.json();
    verses = [];
    d.data.surahs.forEach((su: any) =>
      su.ayahs.forEach((ay: any) =>
        verses.push({ s: su.number, a: ay.numberInSurah, t: ay.text, c: strip(ay.text) })
      )
    );
  } catch {
    progress('❌ فشل التحميل', 'تأكد من الاتصال بالإنترنت', 0);
    return false;
  }

  progress('جاري بناء الفهرس...', '', 50);
  await buildIndex(verses, progress);
  engineReady = true;
  return true;
}

function buildIndex(verses: RawVerse[], onP: ProgressCallback): Promise<void> {
  return new Promise(res => {
    const b: Record<string, string[]> = {};
    const e: Record<string, string[]> = {};
    const p: Record<string, string[]> = {};
    const lk: Record<string, { t: string; c: string }> = {};
    let i = 0;

    function chunk() {
      const end = Math.min(i + 100, verses.length);
      for (; i < end; i++) {
        const v = verses[i];
        const ws = v.c.split(' ').filter(Boolean);
        const ref = `${v.s}:${v.a}`;
        const L = ws.length;
        lk[ref] = { t: v.t, c: v.c };

        for (let n = 1; n <= Math.min(7, L); n++) {
          const pre = ws.slice(0, n).join(' ');
          (b[pre] = b[pre] || []).push(ref);
          const suf = ws.slice(-n).join(' ');
          (e[suf] = e[suf] || []).push(ref);
        }
        for (let n = 3; n <= Math.min(7, L); n++) {
          for (let j = 1; j < L - n; j++) {
            const ph = ws.slice(j, j + n).join(' ');
            (p[ph] = p[ph] || []).push(ref);
          }
        }
      }
      onP('جاري بناء الفهرس...', `${i}/${verses.length}`, 50 + Math.round((i / verses.length) * 46));
      if (i < verses.length) {
        setTimeout(chunk, 0);
        return;
      }
      const clean = (obj: Record<string, string[]>) => {
        const o: Record<string, string[]> = {};
        for (const [k, v] of Object.entries(obj)) {
          const u = [...new Set(v)];
          if (u.length >= 2) o[k] = u;
        }
        return o;
      };
      IDX = { b: clean(b), e: clean(e), p: clean(p) };
      LKUP = lk;
      res();
    }
    setTimeout(chunk, 10);
  });
}

function vi(r: string): VerseInfo {
  const [s, a] = r.split(':').map(Number);
  return { s, a, nm: getSurahName(s), t: LKUP?.[r]?.t || '' };
}

export function findAyah(surah: number, ayah: number): AyahDetail | null {
  if (!IDX || !LKUP) return null;
  const ref = `${surah}:${ayah}`;
  const v = LKUP[ref];
  if (!v) return null;

  const ws = v.c.split(' ').filter(Boolean);
  const ows = v.t.split(/\s+/);
  const L = ws.length;
  const sB = new Set<string>(), sE = new Set<string>(), sP = new Set<string>();
  const begins: PhraseMatch[] = [], ends: PhraseMatch[] = [], phrases: PhraseMatch[] = [];

  for (let n = Math.min(7, L); n >= 1; n--) {
    const pc = ws.slice(0, n).join(' ');
    if (sB.has(pc)) continue;
    sB.add(pc);
    if (!IDX.b[pc]) continue;
    const oth = IDX.b[pc].filter(r => r !== ref);
    if (oth.length) begins.push({ pc, pt: ows.slice(0, n).join(' '), n, count: oth.length, oth: oth.map(vi), kind: 'b' });
  }
  for (let n = Math.min(7, L); n >= 1; n--) {
    const pc = ws.slice(-n).join(' ');
    if (sE.has(pc)) continue;
    sE.add(pc);
    if (!IDX.e[pc]) continue;
    const oth = IDX.e[pc].filter(r => r !== ref);
    if (oth.length) ends.push({ pc, pt: ows.slice(-n).join(' '), n, count: oth.length, oth: oth.map(vi), kind: 'e' });
  }
  for (let n = Math.min(7, L); n >= 3; n--) {
    for (let j = 1; j < L - n; j++) {
      const pc = ws.slice(j, j + n).join(' ');
      if (sP.has(pc)) continue;
      sP.add(pc);
      if (!IDX.p[pc]) continue;
      const oth = IDX.p[pc].filter(r => r !== ref);
      if (oth.length) phrases.push({ pc, pt: ows.slice(j, j + n).join(' '), n, count: oth.length, oth: oth.map(vi), kind: 'p' });
    }
  }
  return { text: v.t, begins, ends, phrases };
}

export function getAyahCounts(surah: number, ayah: number): AyahCounts | null {
  if (!IDX || !LKUP) return null;
  const ref = `${surah}:${ayah}`;
  const v = LKUP[ref];
  if (!v) return null;

  const ws = v.c.split(' ').filter(Boolean);
  const L = ws.length;
  const ub = new Set<string>(), ue = new Set<string>(), up = new Set<string>();

  for (let n = 1; n <= Math.min(7, L); n++) {
    const pre = ws.slice(0, n).join(' ');
    if (IDX.b[pre]) IDX.b[pre].filter(r => r !== ref).forEach(r => ub.add(r));
    const suf = ws.slice(-n).join(' ');
    if (IDX.e[suf]) IDX.e[suf].filter(r => r !== ref).forEach(r => ue.add(r));
  }
  for (let n = 3; n <= Math.min(7, L); n++) {
    for (let j = 1; j < L - n; j++) {
      const ph = ws.slice(j, j + n).join(' ');
      if (IDX.p[ph]) IDX.p[ph].filter(r => r !== ref).forEach(r => up.add(r));
    }
  }
  const all = new Set([...ub, ...ue, ...up]);
  return { b: ub.size, e: ue.size, p: up.size, total: all.size };
}

export function getVerseText(surah: number, ayah: number): string {
  return LKUP?.[`${surah}:${ayah}`]?.t || '';
}

export function getSurahInfo(n: number) {
  return SURAHS_DATA.find(x => x.n === n);
}

export function famousSurah(surah: number): PhraseMatch[] {
  if (!engineReady || !IDX || !LKUP) return [];
  const sc = getSurahAyahCount(surah);
  const seen = new Set<string>();
  const out: PhraseMatch[] = [];

  for (let a = 1; a <= sc; a++) {
    const ref = `${surah}:${a}`;
    const v = LKUP[ref];
    if (!v) continue;
    const ws = v.c.split(' ').filter(Boolean);
    const ows = v.t.split(/\s+/);
    const L = ws.length;

    for (let n = 3; n <= Math.min(7, L); n++) {
      const pre = ws.slice(0, n).join(' ');
      if (!seen.has('b:' + pre) && IDX.b[pre]) {
        const oth = IDX.b[pre].filter(r => r !== ref);
        if (oth.length) {
          seen.add('b:' + pre);
          out.push({ pc: pre, pt: ows.slice(0, n).join(' '), n, count: oth.length, oth: oth.map(vi), kind: 'b' });
        }
      }
      const suf = ws.slice(-n).join(' ');
      if (!seen.has('e:' + suf) && IDX.e[suf]) {
        const oth = IDX.e[suf].filter(r => r !== ref);
        if (oth.length) {
          seen.add('e:' + suf);
          out.push({ pc: suf, pt: ows.slice(-n).join(' '), n, count: oth.length, oth: oth.map(vi), kind: 'e' });
        }
      }
      for (let j = 1; j < L - n; j++) {
        const ph = ws.slice(j, j + n).join(' ');
        if (!seen.has('p:' + ph) && IDX.p[ph]) {
          const oth = IDX.p[ph].filter(r => r !== ref);
          if (oth.length) {
            seen.add('p:' + ph);
            out.push({ pc: ph, pt: ows.slice(j, j + n).join(' '), n, count: oth.length, oth: oth.map(vi), kind: 'p' });
          }
        }
      }
    }
  }
  out.sort((a, b) => b.count - a.count || b.n - a.n);
  return out.slice(0, 30);
}

export function highlightPhrase(text: string, pc: string): { before: string; match: string; after: string } {
  const cw = strip(text).split(/\s+/);
  const ow = text.split(/\s+/);
  const pw = pc.split(' ');

  for (let i = 0; i <= cw.length - pw.length; i++) {
    let ok = true;
    for (let j = 0; j < pw.length; j++) {
      if (cw[i + j] !== pw[j]) { ok = false; break; }
    }
    if (ok) {
      return {
        before: ow.slice(0, i).join(' '),
        match: ow.slice(i, i + pw.length).join(' '),
        after: ow.slice(i + pw.length).join(' '),
      };
    }
  }
  return { before: text, match: '', after: '' };
}
