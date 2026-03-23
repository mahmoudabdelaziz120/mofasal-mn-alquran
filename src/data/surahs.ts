export interface SurahInfo {
  id: number;
  name: string;
  englishName: string;
  versesCount: number;
  revelationPlace: 'makkah' | 'madinah';
}

export const SURAHS: SurahInfo[] = [
  { id: 1, name: "الفاتحة", englishName: "Al-Fatihah", versesCount: 7, revelationPlace: "makkah" },
  { id: 2, name: "البقرة", englishName: "Al-Baqarah", versesCount: 286, revelationPlace: "madinah" },
  { id: 3, name: "آل عمران", englishName: "Ali 'Imran", versesCount: 200, revelationPlace: "madinah" },
  { id: 4, name: "النساء", englishName: "An-Nisa", versesCount: 176, revelationPlace: "madinah" },
  { id: 5, name: "المائدة", englishName: "Al-Ma'idah", versesCount: 120, revelationPlace: "madinah" },
  { id: 6, name: "الأنعام", englishName: "Al-An'am", versesCount: 165, revelationPlace: "makkah" },
  { id: 7, name: "الأعراف", englishName: "Al-A'raf", versesCount: 206, revelationPlace: "makkah" },
  { id: 8, name: "الأنفال", englishName: "Al-Anfal", versesCount: 75, revelationPlace: "madinah" },
  { id: 9, name: "التوبة", englishName: "At-Tawbah", versesCount: 129, revelationPlace: "madinah" },
  { id: 10, name: "يونس", englishName: "Yunus", versesCount: 109, revelationPlace: "makkah" },
  { id: 11, name: "هود", englishName: "Hud", versesCount: 123, revelationPlace: "makkah" },
  { id: 12, name: "يوسف", englishName: "Yusuf", versesCount: 111, revelationPlace: "makkah" },
  { id: 13, name: "الرعد", englishName: "Ar-Ra'd", versesCount: 43, revelationPlace: "madinah" },
  { id: 14, name: "إبراهيم", englishName: "Ibrahim", versesCount: 52, revelationPlace: "makkah" },
  { id: 15, name: "الحجر", englishName: "Al-Hijr", versesCount: 99, revelationPlace: "makkah" },
  { id: 16, name: "النحل", englishName: "An-Nahl", versesCount: 128, revelationPlace: "makkah" },
  { id: 17, name: "الإسراء", englishName: "Al-Isra", versesCount: 111, revelationPlace: "makkah" },
  { id: 18, name: "الكهف", englishName: "Al-Kahf", versesCount: 110, revelationPlace: "makkah" },
  { id: 19, name: "مريم", englishName: "Maryam", versesCount: 98, revelationPlace: "makkah" },
  { id: 20, name: "طه", englishName: "Taha", versesCount: 135, revelationPlace: "makkah" },
  { id: 21, name: "الأنبياء", englishName: "Al-Anbiya", versesCount: 112, revelationPlace: "makkah" },
  { id: 22, name: "الحج", englishName: "Al-Hajj", versesCount: 78, revelationPlace: "madinah" },
  { id: 23, name: "المؤمنون", englishName: "Al-Mu'minun", versesCount: 118, revelationPlace: "makkah" },
  { id: 24, name: "النور", englishName: "An-Nur", versesCount: 64, revelationPlace: "madinah" },
  { id: 25, name: "الفرقان", englishName: "Al-Furqan", versesCount: 77, revelationPlace: "makkah" },
  { id: 26, name: "الشعراء", englishName: "Ash-Shu'ara", versesCount: 227, revelationPlace: "makkah" },
  { id: 27, name: "النمل", englishName: "An-Naml", versesCount: 93, revelationPlace: "makkah" },
  { id: 28, name: "القصص", englishName: "Al-Qasas", versesCount: 88, revelationPlace: "makkah" },
  { id: 29, name: "العنكبوت", englishName: "Al-'Ankabut", versesCount: 69, revelationPlace: "makkah" },
  { id: 30, name: "الروم", englishName: "Ar-Rum", versesCount: 60, revelationPlace: "makkah" },
  { id: 31, name: "لقمان", englishName: "Luqman", versesCount: 34, revelationPlace: "makkah" },
  { id: 32, name: "السجدة", englishName: "As-Sajdah", versesCount: 30, revelationPlace: "makkah" },
  { id: 33, name: "الأحزاب", englishName: "Al-Ahzab", versesCount: 73, revelationPlace: "madinah" },
  { id: 34, name: "سبأ", englishName: "Saba", versesCount: 54, revelationPlace: "makkah" },
  { id: 35, name: "فاطر", englishName: "Fatir", versesCount: 45, revelationPlace: "makkah" },
  { id: 36, name: "يس", englishName: "Ya-Sin", versesCount: 83, revelationPlace: "makkah" },
  { id: 37, name: "الصافات", englishName: "As-Saffat", versesCount: 182, revelationPlace: "makkah" },
  { id: 38, name: "ص", englishName: "Sad", versesCount: 88, revelationPlace: "makkah" },
  { id: 39, name: "الزمر", englishName: "Az-Zumar", versesCount: 75, revelationPlace: "makkah" },
  { id: 40, name: "غافر", englishName: "Ghafir", versesCount: 85, revelationPlace: "makkah" },
  { id: 41, name: "فصلت", englishName: "Fussilat", versesCount: 54, revelationPlace: "makkah" },
  { id: 42, name: "الشورى", englishName: "Ash-Shura", versesCount: 53, revelationPlace: "makkah" },
  { id: 43, name: "الزخرف", englishName: "Az-Zukhruf", versesCount: 89, revelationPlace: "makkah" },
  { id: 44, name: "الدخان", englishName: "Ad-Dukhan", versesCount: 59, revelationPlace: "makkah" },
  { id: 45, name: "الجاثية", englishName: "Al-Jathiyah", versesCount: 37, revelationPlace: "makkah" },
  { id: 46, name: "الأحقاف", englishName: "Al-Ahqaf", versesCount: 35, revelationPlace: "makkah" },
  { id: 47, name: "محمد", englishName: "Muhammad", versesCount: 38, revelationPlace: "madinah" },
  { id: 48, name: "الفتح", englishName: "Al-Fath", versesCount: 29, revelationPlace: "madinah" },
  { id: 49, name: "الحجرات", englishName: "Al-Hujurat", versesCount: 18, revelationPlace: "madinah" },
  { id: 50, name: "ق", englishName: "Qaf", versesCount: 45, revelationPlace: "makkah" },
  { id: 51, name: "الذاريات", englishName: "Adh-Dhariyat", versesCount: 60, revelationPlace: "makkah" },
  { id: 52, name: "الطور", englishName: "At-Tur", versesCount: 49, revelationPlace: "makkah" },
  { id: 53, name: "النجم", englishName: "An-Najm", versesCount: 62, revelationPlace: "makkah" },
  { id: 54, name: "القمر", englishName: "Al-Qamar", versesCount: 55, revelationPlace: "makkah" },
  { id: 55, name: "الرحمن", englishName: "Ar-Rahman", versesCount: 78, revelationPlace: "madinah" },
  { id: 56, name: "الواقعة", englishName: "Al-Waqi'ah", versesCount: 96, revelationPlace: "makkah" },
  { id: 57, name: "الحديد", englishName: "Al-Hadid", versesCount: 29, revelationPlace: "madinah" },
  { id: 58, name: "المجادلة", englishName: "Al-Mujadila", versesCount: 22, revelationPlace: "madinah" },
  { id: 59, name: "الحشر", englishName: "Al-Hashr", versesCount: 24, revelationPlace: "madinah" },
  { id: 60, name: "الممتحنة", englishName: "Al-Mumtahanah", versesCount: 13, revelationPlace: "madinah" },
  { id: 61, name: "الصف", englishName: "As-Saf", versesCount: 14, revelationPlace: "madinah" },
  { id: 62, name: "الجمعة", englishName: "Al-Jumu'ah", versesCount: 11, revelationPlace: "madinah" },
  { id: 63, name: "المنافقون", englishName: "Al-Munafiqun", versesCount: 11, revelationPlace: "madinah" },
  { id: 64, name: "التغابن", englishName: "At-Taghabun", versesCount: 18, revelationPlace: "madinah" },
  { id: 65, name: "الطلاق", englishName: "At-Talaq", versesCount: 12, revelationPlace: "madinah" },
  { id: 66, name: "التحريم", englishName: "At-Tahrim", versesCount: 12, revelationPlace: "madinah" },
  { id: 67, name: "الملك", englishName: "Al-Mulk", versesCount: 30, revelationPlace: "makkah" },
  { id: 68, name: "القلم", englishName: "Al-Qalam", versesCount: 52, revelationPlace: "makkah" },
  { id: 69, name: "الحاقة", englishName: "Al-Haqqah", versesCount: 52, revelationPlace: "makkah" },
  { id: 70, name: "المعارج", englishName: "Al-Ma'arij", versesCount: 44, revelationPlace: "makkah" },
  { id: 71, name: "نوح", englishName: "Nuh", versesCount: 28, revelationPlace: "makkah" },
  { id: 72, name: "الجن", englishName: "Al-Jinn", versesCount: 28, revelationPlace: "makkah" },
  { id: 73, name: "المزمل", englishName: "Al-Muzzammil", versesCount: 20, revelationPlace: "makkah" },
  { id: 74, name: "المدثر", englishName: "Al-Muddaththir", versesCount: 56, revelationPlace: "makkah" },
  { id: 75, name: "القيامة", englishName: "Al-Qiyamah", versesCount: 40, revelationPlace: "makkah" },
  { id: 76, name: "الإنسان", englishName: "Al-Insan", versesCount: 31, revelationPlace: "madinah" },
  { id: 77, name: "المرسلات", englishName: "Al-Mursalat", versesCount: 50, revelationPlace: "makkah" },
  { id: 78, name: "النبأ", englishName: "An-Naba", versesCount: 40, revelationPlace: "makkah" },
  { id: 79, name: "النازعات", englishName: "An-Nazi'at", versesCount: 46, revelationPlace: "makkah" },
  { id: 80, name: "عبس", englishName: "'Abasa", versesCount: 42, revelationPlace: "makkah" },
  { id: 81, name: "التكوير", englishName: "At-Takwir", versesCount: 29, revelationPlace: "makkah" },
  { id: 82, name: "الانفطار", englishName: "Al-Infitar", versesCount: 19, revelationPlace: "makkah" },
  { id: 83, name: "المطففين", englishName: "Al-Mutaffifin", versesCount: 36, revelationPlace: "makkah" },
  { id: 84, name: "الانشقاق", englishName: "Al-Inshiqaq", versesCount: 25, revelationPlace: "makkah" },
  { id: 85, name: "البروج", englishName: "Al-Buruj", versesCount: 22, revelationPlace: "makkah" },
  { id: 86, name: "الطارق", englishName: "At-Tariq", versesCount: 17, revelationPlace: "makkah" },
  { id: 87, name: "الأعلى", englishName: "Al-A'la", versesCount: 19, revelationPlace: "makkah" },
  { id: 88, name: "الغاشية", englishName: "Al-Ghashiyah", versesCount: 26, revelationPlace: "makkah" },
  { id: 89, name: "الفجر", englishName: "Al-Fajr", versesCount: 30, revelationPlace: "makkah" },
  { id: 90, name: "البلد", englishName: "Al-Balad", versesCount: 20, revelationPlace: "makkah" },
  { id: 91, name: "الشمس", englishName: "Ash-Shams", versesCount: 15, revelationPlace: "makkah" },
  { id: 92, name: "الليل", englishName: "Al-Layl", versesCount: 21, revelationPlace: "makkah" },
  { id: 93, name: "الضحى", englishName: "Ad-Duhaa", versesCount: 11, revelationPlace: "makkah" },
  { id: 94, name: "الشرح", englishName: "Ash-Sharh", versesCount: 8, revelationPlace: "makkah" },
  { id: 95, name: "التين", englishName: "At-Tin", versesCount: 8, revelationPlace: "makkah" },
  { id: 96, name: "العلق", englishName: "Al-'Alaq", versesCount: 19, revelationPlace: "makkah" },
  { id: 97, name: "القدر", englishName: "Al-Qadr", versesCount: 5, revelationPlace: "makkah" },
  { id: 98, name: "البينة", englishName: "Al-Bayyinah", versesCount: 8, revelationPlace: "madinah" },
  { id: 99, name: "الزلزلة", englishName: "Az-Zalzalah", versesCount: 8, revelationPlace: "madinah" },
  { id: 100, name: "العاديات", englishName: "Al-'Adiyat", versesCount: 11, revelationPlace: "makkah" },
  { id: 101, name: "القارعة", englishName: "Al-Qari'ah", versesCount: 11, revelationPlace: "makkah" },
  { id: 102, name: "التكاثر", englishName: "At-Takathur", versesCount: 8, revelationPlace: "makkah" },
  { id: 103, name: "العصر", englishName: "Al-'Asr", versesCount: 3, revelationPlace: "makkah" },
  { id: 104, name: "الهمزة", englishName: "Al-Humazah", versesCount: 9, revelationPlace: "makkah" },
  { id: 105, name: "الفيل", englishName: "Al-Fil", versesCount: 5, revelationPlace: "makkah" },
  { id: 106, name: "قريش", englishName: "Quraysh", versesCount: 4, revelationPlace: "makkah" },
  { id: 107, name: "الماعون", englishName: "Al-Ma'un", versesCount: 7, revelationPlace: "makkah" },
  { id: 108, name: "الكوثر", englishName: "Al-Kawthar", versesCount: 3, revelationPlace: "makkah" },
  { id: 109, name: "الكافرون", englishName: "Al-Kafirun", versesCount: 6, revelationPlace: "makkah" },
  { id: 110, name: "النصر", englishName: "An-Nasr", versesCount: 3, revelationPlace: "madinah" },
  { id: 111, name: "المسد", englishName: "Al-Masad", versesCount: 5, revelationPlace: "makkah" },
  { id: 112, name: "الإخلاص", englishName: "Al-Ikhlas", versesCount: 4, revelationPlace: "makkah" },
  { id: 113, name: "الفلق", englishName: "Al-Falaq", versesCount: 5, revelationPlace: "makkah" },
  { id: 114, name: "الناس", englishName: "An-Nas", versesCount: 6, revelationPlace: "makkah" },
];

export const RECITERS = [
  { id: "Muhammad_Jibreel_128kbps", name: "محمد جبريل" },
  { id: "Alafasy_128kbps", name: "مشاري العفاسي — مرتل" },
  { id: "Abdul_Basit_Murattal_192kbps", name: "عبد الباسط — مرتل" },
  { id: "Abdul_Basit_Mujawwad_128kbps", name: "عبد الباسط — مجوّد" },
  { id: "Minshawy_Murattal_128kbps", name: "المنشاوي — مرتل" },
  { id: "Minshawy_Mujawwad_64kbps", name: "المنشاوي — مجوّد" },
  { id: "Hudhaify_128kbps", name: "علي الحذيفي" },
  { id: "Nasser_Alqatami_128kbps", name: "ناصر القطامي" },
  { id: "Yasser_Ad-Dussary_128kbps", name: "ياسر الدوسري" },
];

export const TAJWEED_RULES: Record<string, { label: string; color: string }> = {
  ham_wasl: { label: "إدغام ومالا يُلفظ", color: "#888888" },
  laam_shamsiyah: { label: "إدغام ومالا يُلفظ", color: "#888888" },
  madda_normal: { label: "مدّ حركتان", color: "#B8860B" },
  madda_permissible: { label: "مدّ جائز ٢-٤-٦ حركات", color: "#E8740C" },
  madda_necessary: { label: "مدّ لازم ٦ حركات", color: "#900048" },
  madda_obligatory: { label: "مدّ واجب ٤-٥ حركات", color: "#D6006E" },
  ikhfa_shafawi: { label: "إخفاء ومواقع الغنة", color: "#008B00" },
  ikhfa: { label: "إخفاء ومواقع الغنة", color: "#008B00" },
  idgham_shafawi: { label: "إدغام ومالا يُلفظ", color: "#888888" },
  idgham_ghunnah: { label: "إدغام ومالا يُلفظ", color: "#888888" },
  idgham_with_ghunnah: { label: "إدغام ومالا يُلفظ", color: "#888888" },
  idgham_without_ghunnah: { label: "إدغام ومالا يُلفظ", color: "#888888" },
  qalaqah: { label: "قلقلة", color: "#4488EE" },
  ghunnah: { label: "إخفاء ومواقع الغنة", color: "#008B00" },
  iqlab: { label: "إقلاب", color: "#26BFFD" },
};

// Surah categories for the main page
export interface SurahCategory {
  id: string;
  title: string;
  desc: string;
  surahIds: number[];
  badgeText: string;
  badgeColor: string;
}

export const SURAH_CATEGORIES: SurahCategory[] = [
  {
    id: "tiwal",
    title: "السبع الطوال",
    desc: "أطول سور القرآن — البقرة وآل عمران والنساء والمائدة والأنعام والأعراف والأنفال والتوبة",
    surahIds: [2, 3, 4, 5, 6, 7, 8, 9],
    badgeText: "٧ سور",
    badgeColor: "#93c5fd",
  },
  {
    id: "miuun",
    title: "المئون",
    desc: "السور التي تلي الطوال — تزيد آياتها على مائة أو تقاربها",
    surahIds: [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22],
    badgeText: "~٧ سور",
    badgeColor: "#a78bfa",
  },
  {
    id: "mathani",
    title: "المثاني",
    desc: "السور التي تلي المئون — دون المئة آية وفوق المفصل",
    surahIds: [23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49],
    badgeText: "سور متوسطة",
    badgeColor: "#4ade80",
  },
  {
    id: "mufassal_tiwal",
    title: "طوال المفصل",
    desc: "من سورة ق (٥٠) إلى سورة النبأ (٧٨)",
    surahIds: Array.from({ length: 29 }, (_, i) => 50 + i),
    badgeText: "٢٩ سورة",
    badgeColor: "#fbbf24",
  },
  {
    id: "mufassal_awsat",
    title: "أوساط المفصل",
    desc: "من سورة النبأ (٧٨) إلى سورة الضحى (٩٣)",
    surahIds: Array.from({ length: 16 }, (_, i) => 78 + i),
    badgeText: "١٦ سورة",
    badgeColor: "#fb923c",
  },
  {
    id: "mufassal_qisar",
    title: "قصار المفصل",
    desc: "من سورة الضحى (٩٣) إلى سورة الناس (١١٤)",
    surahIds: Array.from({ length: 22 }, (_, i) => 93 + i),
    badgeText: "٢٢ سورة",
    badgeColor: "#f87171",
  },
];

// Special groupings
export const SPECIAL_CATEGORIES = [
  {
    id: "fatiha",
    title: "الفاتحة",
    desc: "أم الكتاب — فاتحة القرآن الكريم",
    surahIds: [1],
  },
  {
    id: "hawameem",
    title: "الحواميم السبع",
    desc: "سبع سور تبدأ بـ (حم) — من سورة غافر (٤٠) إلى سورة الأحقاف (٤٦)",
    surahIds: [40, 41, 42, 43, 44, 45, 46],
  },
  {
    id: "musabbihat",
    title: "المسبّحات",
    desc: "السور التي تبدأ بـ (سبّح أو يسبّح) — الإسراء، الحديد، الحشر، الصف، الجمعة، التغابن، الأعلى",
    surahIds: [17, 57, 59, 61, 62, 64, 87],
  },
  {
    id: "tawasin",
    title: "الطواسين",
    desc: "الشعراء، النمل، القصص — تبدأ كل منها بـ (طس أو طسم)",
    surahIds: [26, 27, 28],
  },
  {
    id: "muawwidhat",
    title: "المعوذتان",
    desc: "سورة الفلق وسورة الناس — يُقرَآن معاً للاستعاذة",
    surahIds: [113, 114],
  },
  {
    id: "zahrawaan",
    title: "الزهراوان",
    desc: "البقرة وآل عمران — لنورهما وضيائهما يوم القيامة",
    surahIds: [2, 3],
  },
];

export function numToArabic(n: number): string {
  return String(n).split('').map(d => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)] || d).join('');
}

export function ayaUrl(surah: number, ayah: number, reciter: string): string {
  const s = String(surah).padStart(3, '0');
  const a = String(ayah).padStart(3, '0');
  return `https://everyayah.com/data/${reciter}/${s}${a}.mp3`;
}
