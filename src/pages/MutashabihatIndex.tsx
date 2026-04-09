import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SURAHS } from "@/data/surahs";
import { SURAH_SLUGS } from "@/data/surahSlugs";
import CosmosBackground from "@/components/CosmosBackground";
import ThemeToggle from "@/components/ThemeToggle";
import { Search, ArrowRight } from "lucide-react";
import logoImg from "@/assets/logo.png";

export default function MutashabihatIndex() {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

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

  const getAyahLabel = (count: number) =>
    count >= 3 && count <= 10 ? "آيات" : "آية";

  return (
    <div className="relative min-h-screen" dir="rtl">
      <CosmosBackground />
      <div className="top-glow" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center px-4 pt-4">
          <button onClick={() => navigate("/")} className="flex items-center gap-2 group">
            <img src={logoImg} alt="الرئيسية" className="w-9 h-9 rounded-full object-cover" />
            <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-2)" }} />
          </button>
          <ThemeToggle />
        </div>

        {/* Hero */}
        <header className="text-center pt-6 pb-4 px-4">
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{
              background: "linear-gradient(135deg, hsl(var(--primary)), hsl(var(--accent-foreground, var(--primary))))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              fontFamily: "'Amiri', serif",
              lineHeight: 1.8,
            }}
          >
            مُتشابِهاتُ القُرآنِ الكريم
          </h1>
          <p className="text-sm sm:text-base max-w-2xl mx-auto leading-relaxed" style={{ color: "var(--text-2)" }}>
            تصفَّح الآياتِ المُتشابِهةَ لفظًا في القُرآنِ الكريم مُرتَّبةً حسبَ السُّوَر
          </p>
        </header>

        {/* Search */}
        <div className="px-4 max-w-2xl mx-auto w-full mb-6">
          <div className="relative">
            <div
              className="absolute -inset-[3px] rounded-[28px] opacity-70 blur-md pointer-events-none dark-only-glow"
              style={{ background: "linear-gradient(90deg, #c026d3, #7c3aed, #201E4B)" }}
            />
            <div
              className="absolute -inset-[1.5px] rounded-[26px] opacity-90 pointer-events-none dark-only-glow"
              style={{ background: "linear-gradient(90deg, #c026d3, #7c3aed, #201E4B)" }}
            />
            <div
              className="relative flex items-center gap-3 px-4 py-3 rounded-3xl"
              style={{ background: "hsl(var(--card))", border: "1px solid var(--glass-card-border)" }}
            >
              <Search className="w-5 h-5 flex-shrink-0" style={{ color: "var(--text-2)" }} />
              <input
                type="text"
                placeholder="ابحث عن سورة..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="flex-1 bg-transparent outline-none text-base font-bold font-quran placeholder:font-normal placeholder:text-[var(--text-2)]"
                style={{ color: "var(--text-0)" }}
              />
            </div>
          </div>
        </div>

        {/* Surahs Grid */}
        <section className="px-4 max-w-7xl mx-auto w-full pb-16">
          <h2 className="text-base font-bold mb-4 px-1 font-quran" style={{ color: "var(--text-1)" }}>
            جميعُ السُّوَر — {filtered.length} سورة
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {filtered.map((surah) => (
              <button
                key={surah.id}
                onClick={() => navigate(`/mutashabihat/${SURAH_SLUGS[surah.id]}`)}
                className="group mutashabihat-card rounded-2xl p-4 text-right transition-all duration-200 hover:scale-[1.02]"
              >
                {/* Header row */}
                <div className="flex items-center justify-between mb-3">
                  <span className="mutashabihat-num w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold">
                    {surah.id}
                  </span>
                  <div className="flex gap-1">
                    <span className="w-[6px] h-[6px] rounded-full" style={{ background: "#2E8B57" }} />
                    <span className="w-[6px] h-[6px] rounded-full" style={{ background: "#1B8A8A" }} />
                    <span className="w-[6px] h-[6px] rounded-full" style={{ background: "#7B52B9" }} />
                  </div>
                </div>

                {/* Surah name */}
                <div className="font-quran text-lg font-bold mb-1 mutashabihat-name transition-colors" >
                  {surah.name}
                </div>

                {/* Verse count */}
                <div className="text-sm font-semibold mutashabihat-sub">
                  {surah.versesCount} {getAyahLabel(surah.versesCount)}
                </div>
              </button>
            ))}
          </div>

          {filtered.length === 0 && (
            <p className="text-center py-12 font-quran" style={{ color: "var(--text-2)" }}>
              لا توجد نتائج
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
