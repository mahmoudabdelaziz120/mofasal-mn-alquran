import { useState, useMemo } from "react";
import { SURAHS, SURAH_CATEGORIES, numToArabic } from "@/data/surahs";
import CosmosBackground from "@/components/CosmosBackground";
import SurahCard from "@/components/SurahCard";
import ThemeToggle from "@/components/ThemeToggle";
import { Search, ChevronDown } from "lucide-react";
import logoImg from "@/assets/logo.png";

export default function Index() {
  const [search, setSearch] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return null;
    const q = search.trim().toLowerCase();
    return SURAHS.filter(
      (s) =>
        s.name.includes(q) ||
        s.englishName.toLowerCase().includes(q) ||
        String(s.id) === q
    );
  }, [search]);

  const getSurahsForCategory = (surahIds: number[]) =>
    surahIds.map((id) => SURAHS.find((s) => s.id === id)!).filter(Boolean);

  const toggleCat = (catId: string) => {
    setExpandedCat((prev) => (prev === catId ? null : catId));
  };

  return (
    <div className="relative min-h-screen" dir="rtl">
      <CosmosBackground />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header: logo + theme toggle */}
        <div className="flex justify-between items-center px-4 pt-4">
          <img src={logoImg} alt="المفصل من القرآن" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover" />
          <ThemeToggle />
        </div>

        {/* Hero — Dedication */}
        <header className="text-center pt-6 sm:pt-8 pb-6 sm:pb-10 px-4">
          <p className="font-quran text-base sm:text-lg mb-3" style={{ color: "var(--text-2)" }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <h1
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 leading-relaxed max-w-2xl mx-auto"
            style={{
              color: "var(--text-0)",
              fontFamily: "'Amiri', serif",
              lineHeight: 2,
            }}
          >
            هذا الموقع صدقة جارية لروح أمي
            <br />
            رزقها الله الفردوس الأعلى من الجنة
          </h1>
        </header>

        {/* Search */}
        <div className="px-4 max-w-2xl mx-auto w-full mb-6 sm:mb-8">
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-2xl"
            style={{
              background: "var(--glass-card-bg)",
              border: "0.5px solid var(--glass-card-border)",
              backdropFilter: "blur(40px)",
            }}
          >
            <Search className="w-5 h-5 flex-shrink-0" style={{ color: "var(--text-2)" }} />
            <input
              type="text"
              placeholder="ابحث عن سورة بالاسم أو الرقم..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none text-sm sm:text-base font-quran placeholder:text-[var(--text-3)]"
              style={{ color: "var(--text-0)" }}
            />
          </div>
        </div>

        {/* Search Results */}
        {filtered ? (
          <section className="px-4 max-w-5xl mx-auto w-full mb-12">
            <h2 className="text-sm font-medium mb-4" style={{ color: "var(--text-1)" }}>
              نتائج البحث — {filtered.length} سورة
            </h2>
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
        ) : (
          /* Collapsible Categories */
          <section className="px-4 max-w-5xl mx-auto w-full pb-16">
            {/* Fatiha standalone */}
            <div className="mb-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                <SurahCard surah={SURAHS[0]} />
              </div>
            </div>

            <div className="space-y-3">
              {SURAH_CATEGORIES.map((cat) => {
                const isExpanded = expandedCat === cat.id;
                const surahs = getSurahsForCategory(cat.surahIds);
                return (
                  <div
                    key={cat.id}
                    className="rounded-2xl overflow-hidden transition-all duration-200 glass-card-themed"
                  >
                    <button
                      onClick={() => toggleCat(cat.id)}
                      className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3 sm:py-4 text-right transition-colors duration-200"
                      style={{
                        background: isExpanded ? "var(--highlight-bg)" : "transparent",
                      }}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: `${cat.badgeColor}18` }}
                        >
                          <span className="text-xs font-bold" style={{ color: cat.badgeColor }}>
                            {numToArabic(cat.surahIds.length)}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-quran text-sm sm:text-base font-bold" style={{ color: "var(--text-0)" }}>
                            {cat.title}
                          </div>
                          <div className="text-[0.65rem] sm:text-xs leading-relaxed" style={{ color: "var(--text-2)" }}>
                            {cat.desc}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-[0.6rem] sm:text-[0.65rem] px-2 sm:px-2.5 py-1 rounded-lg"
                          style={{
                            background: "var(--category-badge-bg)",
                            color: "var(--category-badge-color)",
                          }}
                        >
                          {cat.badgeText}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 accordion-arrow ${isExpanded ? "rotated" : ""}`}
                          style={{ color: "var(--text-2)" }}
                        />
                      </div>
                    </button>
                    <div className={`accordion-content ${isExpanded ? "expanded" : ""}`}>
                      <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                        <div className="h-px mb-3" style={{ background: "var(--glass-thin-border)" }} />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                          {surahs.map((s) => (
                            <SurahCard key={s.id} surah={s} />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
