import { useState, useMemo, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { SURAHS, SURAH_CATEGORIES, numToArabic } from "@/data/surahs";
import CosmosBackground from "@/components/CosmosBackground";
import SurahCard from "@/components/SurahCard";
import ThemeToggle from "@/components/ThemeToggle";
import { Search, ChevronDown, BookOpen } from "lucide-react";
import logoImg from "@/assets/logo.png";

const MAIN_SECTIONS = [
  {
    id: "tafsir",
    title: "التفسير الميسر",
    desc: "تفسير مبسط لكل آيات القرآن الكريم",
    icon: "📖",
    route: "/tafsir",
  },
  {
    id: "tajweed-course",
    title: "سلسلة التجويد الميسر",
    desc: "52 درساً شاملاً لتعلّم أحكام التجويد خطوة بخطوة",
    icon: "🎓",
    route: "/tajweed-course",
  },
];

// Scroll reveal hook
function useScrollReveal() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) { el.style.opacity = "1"; el.style.transform = "none"; return; }

    el.style.opacity = "0";
    el.style.transform = "translateY(16px)";
    el.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out";

    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        el.style.opacity = "1";
        el.style.transform = "translateY(0)";
        obs.disconnect();
      }
    }, { threshold: 0.1 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export default function Index() {
  const [search, setSearch] = useState("");
  const [expandedCat, setExpandedCat] = useState<string | null>(null);
  const [showSurahSection, setShowSurahSection] = useState(false);
  const navigate = useNavigate();

  const heroRef = useScrollReveal();
  const searchRef = useScrollReveal();
  const surahsRef = useScrollReveal();
  const sectionsRef = useScrollReveal();

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

      {/* Top gradient glow */}
      <div className="top-glow" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center px-4 pt-4">
          <img src={logoImg} alt="المفصل من القرآن" className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover" />
          <ThemeToggle />
        </div>

        {/* Hero */}
        <header ref={heroRef} className="text-center pt-6 sm:pt-8 pb-6 sm:pb-10 px-4">
          <p className="font-quran text-base sm:text-lg mb-3" style={{ color: "var(--text-2)" }}>
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          <h1
            className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 leading-relaxed max-w-2xl mx-auto"
            style={{ color: "var(--text-0)", fontFamily: "'Amiri', serif", lineHeight: 2 }}
          >
            هذا الموقع صدقة جارية لروح أمي
            <br />
            رزقها الله الفردوس الأعلى من الجنة
          </h1>
        </header>

        {/* Search */}
        <div ref={searchRef} className="px-4 max-w-2xl mx-auto w-full mb-6 sm:mb-8">
          <div className="relative">
            {/* Neon glow - dark mode only */}
            <div
              className="absolute -inset-[3px] rounded-[28px] opacity-70 blur-md pointer-events-none dark-only-glow"
              style={{
                background: "linear-gradient(90deg, #c026d3, #7c3aed, #201E4B)",
              }}
            />
            <div
              className="absolute -inset-[1.5px] rounded-[26px] opacity-90 pointer-events-none dark-only-glow"
              style={{
                background: "linear-gradient(90deg, #c026d3, #7c3aed, #201E4B)",
              }}
            />
            {/* Main bar */}
            <div
              className="relative flex items-center gap-3 px-4 py-3 rounded-3xl"
              style={{
                background: "hsl(var(--card))",
                border: "1px solid var(--glass-card-border)",
              }}
            >
              <Search className="w-5 h-5 flex-shrink-0" style={{ color: "var(--text-2)" }} />
              <input
                type="text"
                placeholder="ابحث عن سورة بالاسم أو الرقم..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-base sm:text-lg font-bold font-quran placeholder:font-normal placeholder:text-[var(--text-2)]"
                style={{ color: "var(--text-0)" }}
              />
            </div>
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
          <section className="px-4 max-w-5xl mx-auto w-full pb-16 space-y-6">
            {/* Surahs — Collapsible with "عرض الكل" */}
            <div ref={surahsRef}>
              <button
                onClick={() => setShowSurahSection(!showSurahSection)}
                className="w-full flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 sm:py-4 rounded-2xl text-right transition-all duration-200 glass-card-themed mb-2"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: "var(--highlight-bg)" }}
                  >
                    <BookOpen className="w-5 h-5" style={{ color: "var(--dot-active)" }} />
                  </div>
                  <div className="min-w-0">
                    <div className="font-quran text-sm sm:text-base font-bold" style={{ color: "var(--text-0)" }}>
                      سور القرآن الكريم
                    </div>
                    <div className="text-[0.65rem] sm:text-xs" style={{ color: "var(--text-2)" }}>
                      ١١٤ سورة مقسمة حسب التصنيف التقليدي
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[0.65rem] sm:text-xs font-medium" style={{ color: "var(--dot-active)" }}>
                    {showSurahSection ? "إخفاء" : "عرض الكل"}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 accordion-arrow ${showSurahSection ? "rotated" : ""}`}
                    style={{ color: "var(--text-2)" }}
                  />
                </div>
              </button>

              <div className={`accordion-content ${showSurahSection ? "expanded" : ""}`}>
                {/* Fatiha standalone */}
                <div className="mb-3 px-1">
                  <SurahCard surah={SURAHS[0]} />
                </div>

                <div className="space-y-2 px-1">
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
                          style={{ background: isExpanded ? "var(--highlight-bg)" : "transparent" }}
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
                              style={{ background: "var(--category-badge-bg)", color: "var(--category-badge-color)" }}
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
              </div>
            </div>

            {/* Main Sections — visible and open */}
            <div ref={sectionsRef}>
              <h2 className="font-quran text-sm sm:text-base font-bold mb-3 px-1 flex items-center gap-2" style={{ color: "var(--text-1)" }}>
                <span>الأقسام الرئيسية</span>
                <span className="text-[0.6rem]" style={{ color: "var(--text-2)" }}>موسوعتك القرآنية الشاملة</span>
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MAIN_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => navigate(section.route)}
                    className="w-full flex items-center gap-3 px-4 sm:px-5 py-4 sm:py-5 rounded-2xl text-right transition-all duration-200 glass-card-themed group hover:scale-[1.01]"
                  >
                    <div
                      className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
                      style={{ background: "var(--highlight-bg)" }}
                    >
                      {section.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-quran text-sm sm:text-base font-bold" style={{ color: "var(--text-0)" }}>
                        {section.title}
                      </div>
                      <div className="text-[0.65rem] sm:text-xs" style={{ color: "var(--text-2)" }}>
                        {section.desc}
                      </div>
                    </div>
                    <svg className="w-4 h-4 opacity-30 group-hover:opacity-60 transition-opacity flex-shrink-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
