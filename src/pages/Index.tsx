import { useState, useMemo } from "react";
import { SURAHS } from "@/data/surahs";
import CosmosBackground from "@/components/CosmosBackground";
import SurahCard from "@/components/SurahCard";
import { Search, BookOpen, Headphones, BookMarked, MessageSquare, FileText, Grid3X3 } from "lucide-react";

const SECTIONS = [
  { icon: BookOpen, title: "المصاحف", desc: "مصاحف القراءات العشر بطبعات متنوعة" },
  { icon: Headphones, title: "التلاوات الصوتية", desc: "تلاوات مرتّلة ومجوّدة لمختلف القرّاء" },
  { icon: FileText, title: "معلومات السور", desc: "أسماء السور وموضوعاتها ومقاصدها" },
  { icon: BookMarked, title: "خدمة الآية القرآنية", desc: "التفاسير والإعراب والترجمة للآيات" },
  { icon: MessageSquare, title: "ترجمات القرآن", desc: "ترجمات معتمدة للقرآن الكريم" },
  { icon: Grid3X3, title: "الموسوعة الموضوعية", desc: "فهرسة موضوعية للقرآن الكريم" },
];

export default function Index() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return SURAHS;
    const q = search.trim().toLowerCase();
    return SURAHS.filter(
      (s) =>
        s.name.includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        String(s.id) === q
    );
  }, [search]);

  return (
    <div className="relative min-h-screen" dir="rtl">
      <CosmosBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Hero */}
        <header className="text-center pt-16 pb-10 px-4">
          <p className="font-quran text-lg mb-3" style={{ color: "var(--text-2)" }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <h1 className="font-quran text-4xl md:text-5xl font-bold mb-3" style={{ color: "var(--text-0)" }}>
            القرآن الكريم
          </h1>
          <p className="text-sm md:text-base max-w-md mx-auto" style={{ color: "var(--text-1)" }}>
            تدبّر وتلاوة بتجويد مفصّل — اختر سورة وابدأ
          </p>
        </header>

        {/* Search */}
        <div className="px-4 max-w-2xl mx-auto w-full mb-8">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: "var(--glass-thin-bg)",
              border: "0.5px solid var(--glass-thin-border)",
              backdropFilter: "blur(20px)",
            }}
          >
            <Search className="w-5 h-5 flex-shrink-0" style={{ color: "var(--text-2)" }} />
            <input
              type="text"
              placeholder="أدخل اسم سورة أو رقمها..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm font-quran placeholder:text-[var(--text-3)]"
              style={{ color: "var(--text-0)" }}
            />
          </div>
        </div>

        {/* Surah Grid */}
        <section className="px-4 max-w-5xl mx-auto w-full mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium" style={{ color: "var(--text-1)" }}>
              السور — {filtered.length} سورة
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filtered.map((surah) => (
              <SurahCard key={surah.id} surah={surah} />
            ))}
          </div>
          {filtered.length === 0 && (
            <p className="text-center py-12 font-quran" style={{ color: "var(--text-2)" }}>
              لا توجد نتائج
            </p>
          )}
        </section>

        {/* Sections */}
        <section className="px-4 max-w-5xl mx-auto w-full pb-16">
          <div className="flex items-center gap-2 mb-6">
            <Grid3X3 className="w-5 h-5" style={{ color: "var(--dot-active)" }} />
            <div>
              <h2 className="text-base font-semibold" style={{ color: "var(--text-0)" }}>
                الأقسام الرئيسية
              </h2>
              <p className="text-xs" style={{ color: "var(--text-2)" }}>
                موسوعتك القرآنية الشاملة
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {SECTIONS.map((sec) => (
              <div
                key={sec.title}
                className="flex items-start gap-4 p-5 rounded-2xl cursor-pointer transition-all duration-200 hover:scale-[1.01]"
                style={{
                  background: "var(--glass-card-bg)",
                  border: "0.5px solid var(--glass-card-border)",
                  backdropFilter: "blur(20px)",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: "var(--highlight-bg)" }}
                >
                  <sec.icon className="w-5 h-5" style={{ color: "var(--dot-active)" }} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-0)" }}>
                    {sec.title}
                  </h3>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
                    {sec.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
