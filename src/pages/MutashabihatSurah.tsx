import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SURAHS } from "@/data/surahs";
import { SURAH_SLUGS } from "@/data/surahSlugs";
import CosmosBackground from "@/components/CosmosBackground";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowRight, Loader2 } from "lucide-react";
import logoImg from "@/assets/logo.png";

interface SimilarAyah {
  info: {
    id: number;
    number: number;
    text: string;
    surah_id: number;
    surah: { id: number; name: string };
  };
  text: string;
}

interface SimilarGroup {
  notes: string;
  ayahs: SimilarAyah[];
}

const API_BASE = "https://api.quranpedia.net/v1";

export default function MutashabihatSurah() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Find surah by slug
  const surahId = Object.entries(SURAH_SLUGS).find(([, s]) => s === slug)?.[0];
  const surah = surahId ? SURAHS.find((s) => s.id === Number(surahId)) : undefined;

  const [groups, setGroups] = useState<SimilarGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const fetchSimilarVerses = useCallback(async () => {
    if (!surah) return;
    setLoading(true);
    setError(null);
    setGroups([]);

    try {
      // First get all ayahs to check which have "similar" option
      const ayahsRes = await fetch(`${API_BASE}/mushafs/1/${surah.id}`);
      if (!ayahsRes.ok) throw new Error("فشل تحميل الآيات");
      const ayahsData = await ayahsRes.json();

      const ayahsWithSimilar = (ayahsData as Array<{ number: number; options?: string[] }>)
        .filter((a) => a.options?.includes("similar"))
        .map((a) => a.number);

      if (ayahsWithSimilar.length === 0) {
        setLoading(false);
        return;
      }

      // Fetch similar for each ayah (batch with concurrency limit)
      const allGroups: SimilarGroup[] = [];
      const batchSize = 5;

      for (let i = 0; i < ayahsWithSimilar.length; i += batchSize) {
        const batch = ayahsWithSimilar.slice(i, i + batchSize);
        const results = await Promise.all(
          batch.map(async (ayahNum) => {
            try {
              const res = await fetch(`${API_BASE}/ayah/${surah.id}/${ayahNum}/similar`);
              if (!res.ok) return [];
              return (await res.json()) as SimilarGroup[];
            } catch {
              return [];
            }
          })
        );
        results.forEach((r) => allGroups.push(...r));
        setLoadingProgress(Math.min(100, Math.round(((i + batch.length) / ayahsWithSimilar.length) * 100)));
      }

      // Deduplicate groups by their first ayah's id set
      const seen = new Set<string>();
      const unique = allGroups.filter((g) => {
        const key = g.ayahs.map((a) => `${a.info.surah_id}:${a.info.number}`).sort().join("|");
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });

      setGroups(unique);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ");
    } finally {
      setLoading(false);
    }
  }, [surah]);

  useEffect(() => {
    fetchSimilarVerses();
  }, [fetchSimilarVerses]);

  if (!surah) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p style={{ color: "var(--text-2)" }}>السورة غير موجودة</p>
      </div>
    );
  }

  // Clean ayah text (remove HTML spans)
  const cleanText = (html: string) => {
    return html.replace(/<[^>]*>/g, "").trim();
  };

  return (
    <div className="relative min-h-screen" dir="rtl">
      <CosmosBackground />
      <div className="top-glow" />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div className="flex justify-between items-center px-4 pt-4">
          <button onClick={() => navigate("/mutashabihat")} className="flex items-center gap-2 group">
            <img src={logoImg} alt="الرئيسية" className="w-9 h-9 rounded-full object-cover" />
            <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-2)" }} />
          </button>
          <ThemeToggle />
        </div>

        {/* Hero */}
        <header className="text-center pt-6 pb-6 px-4">
          <div className="flex items-center justify-center gap-3 mb-3">
            <span
              className="w-10 h-10 flex items-center justify-center rounded-xl text-sm font-bold"
              style={{ background: "var(--highlight-bg)", color: "var(--dot-active)" }}
            >
              {surah.id}
            </span>
          </div>
          <h1
            className="text-2xl sm:text-3xl font-bold mb-2"
            style={{ fontFamily: "'Amiri', serif", color: "var(--text-0)", lineHeight: 1.8 }}
          >
            متشابهات {surah.name}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            {surah.versesCount} آية
            {!loading && ` — ${groups.length} مجموعة تشابه`}
          </p>
        </header>

        {/* Content */}
        <section className="px-4 max-w-4xl mx-auto w-full pb-16">
          {loading && (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "var(--dot-active)" }} />
              <p className="text-sm font-quran" style={{ color: "var(--text-2)" }}>
                جاري تحميل المتشابهات... {loadingProgress}%
              </p>
              <div className="w-48 h-1.5 mx-auto mt-3 rounded-full overflow-hidden" style={{ background: "var(--glass-thin-border)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${loadingProgress}%`, background: "var(--dot-active)" }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="text-center py-20">
              <p className="text-sm mb-4" style={{ color: "#f87171" }}>{error}</p>
              <button
                onClick={fetchSimilarVerses}
                className="px-4 py-2 rounded-xl text-sm font-bold glass-card-themed"
                style={{ color: "var(--dot-active)" }}
              >
                إعادة المحاولة
              </button>
            </div>
          )}

          {!loading && !error && groups.length === 0 && (
            <div className="text-center py-20">
              <p className="font-quran text-lg" style={{ color: "var(--text-2)" }}>
                لا توجد متشابهات مسجَّلة لهذه السورة
              </p>
            </div>
          )}

          {!loading && groups.length > 0 && (
            <div className="space-y-4">
              {groups.map((group, gi) => (
                <div key={gi} className="glass-card-themed rounded-2xl overflow-hidden">
                  {/* Group header */}
                  <div
                    className="px-5 py-3 border-b"
                    style={{ background: "var(--highlight-bg)", borderColor: "var(--glass-thin-border)" }}
                  >
                    <span className="text-sm font-bold font-quran" style={{ color: "var(--dot-active)" }}>
                      مجموعة تشابه — {group.ayahs.length} آيات متشابهة
                    </span>
                    {group.notes && (
                      <p className="text-xs mt-1" style={{ color: "var(--text-2)" }}>
                        {group.notes}
                      </p>
                    )}
                  </div>

                  {/* Ayahs */}
                  <div>
                    {group.ayahs.map((ayah, ai) => (
                      <div
                        key={ai}
                        className="px-5 py-4 transition-colors"
                        style={{
                          borderBottom: ai < group.ayahs.length - 1 ? "1px solid var(--glass-thin-border)" : "none",
                        }}
                      >
                        {/* Surah badge + ayah number */}
                        <div className="flex items-center gap-2 mb-3">
                          <span
                            className="text-xs font-bold px-2.5 py-1 rounded-lg"
                            style={{ background: "var(--highlight-bg)", color: "var(--dot-active)" }}
                          >
                            {ayah.info.surah.name}
                          </span>
                          <span className="text-xs" style={{ color: "var(--text-2)" }}>
                            آية {ayah.info.number}
                          </span>
                        </div>

                        {/* Ayah text */}
                        <p
                          className="font-quran text-xl sm:text-2xl leading-[2.5] text-right"
                          style={{ color: "var(--text-0)" }}
                        >
                          {cleanText(ayah.text)}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
