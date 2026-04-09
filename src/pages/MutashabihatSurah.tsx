import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SURAHS } from "@/data/surahs";
import { SURAH_SLUGS } from "@/data/surahSlugs";
import CosmosBackground from "@/components/CosmosBackground";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowRight, Loader2 } from "lucide-react";
import logoImg from "@/assets/logo.png";
import {
  ensureEngine,
  isEngineReady,
  getAyahCounts,
  getVerseText,
  type AyahCounts,
} from "@/lib/mutashabihatEngine";

interface AyahRow {
  a: number;
  txt: string;
  cnt: AyahCounts;
}

export default function MutashabihatSurah() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const surahId = Object.entries(SURAH_SLUGS).find(([, s]) => s === slug)?.[0];
  const surah = surahId ? SURAHS.find((s) => s.id === Number(surahId)) : undefined;

  const [loading, setLoading] = useState(true);
  const [progressTitle, setProgressTitle] = useState("");
  const [progressSub, setProgressSub] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [ready, setReady] = useState(isEngineReady());
  const [rows, setRows] = useState<AyahRow[]>([]);

  const onProgress = useCallback((t: string, s: string, p: number) => {
    setProgressTitle(t);
    setProgressSub(s);
    setProgressPct(p);
  }, []);

  useEffect(() => {
    if (!surah) return;
    let cancelled = false;

    (async () => {
      setLoading(true);
      const ok = await ensureEngine(onProgress);
      if (cancelled) return;
      if (ok) {
        setReady(true);
        // Build ayah list
        const ayahRows: AyahRow[] = [];
        for (let a = 1; a <= surah.versesCount; a++) {
          const cnt = getAyahCounts(surah.id, a) || { b: 0, e: 0, p: 0, total: 0 };
          ayahRows.push({ a, txt: getVerseText(surah.id, a), cnt });
        }
        setRows(ayahRows);
      }
      setLoading(false);
    })();

    return () => { cancelled = true; };
  }, [surah, onProgress]);

  const totalSimilar = useMemo(() => rows.filter(r => r.cnt.total > 0).length, [rows]);

  if (!surah) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p style={{ color: "var(--text-2)" }}>السورة غير موجودة</p>
      </div>
    );
  }

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
        <header className="text-center pt-6 pb-4 px-4">
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
            متشابهات سورة {surah.name}
          </h1>
          <p className="text-sm" style={{ color: "var(--text-2)" }}>
            {surah.versesCount} آية
            {ready && ` — ${totalSimilar} آية بها متشابهات`}
          </p>

          {/* Legend */}
          {ready && (
            <div className="flex items-center justify-center gap-4 mt-3 flex-wrap">
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-2)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "#2E8B57" }} />
                الآيات المتشابهة
              </span>
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-2)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "#1B8A8A" }} />
                فواتح الآيات
              </span>
              <span className="flex items-center gap-1.5 text-xs" style={{ color: "var(--text-2)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: "#7B52B9" }} />
                خواتم الآيات
              </span>
            </div>
          )}
        </header>

        {/* Content */}
        <section className="px-4 max-w-4xl mx-auto w-full pb-16">
          {loading && (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "var(--dot-active)" }} />
              <p className="text-base font-bold font-quran mb-1" style={{ color: "var(--dot-active)" }}>
                {progressTitle}
              </p>
              <p className="text-xs mb-3" style={{ color: "var(--text-2)" }}>
                {progressSub}
              </p>
              <div className="w-60 h-1.5 mx-auto rounded-full overflow-hidden" style={{ background: "var(--glass-thin-border)" }}>
                <div
                  className="h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%`, background: "var(--dot-active)" }}
                />
              </div>
            </div>
          )}

          {!loading && ready && rows.length > 0 && (
            <div className="flex flex-col gap-2">
              {rows.map((row) => (
                <button
                  key={row.a}
                  onClick={() => navigate(`/mutashabihat/${slug}/${row.a}`)}
                  className="glass-card-themed rounded-xl p-4 text-right transition-all duration-200 hover:scale-[1.005]"
                  style={{
                    borderRight: row.cnt.total > 0 ? "3px solid var(--dot-active)" : undefined,
                  }}
                >
                  <div className="flex items-start gap-3">
                    {/* Ayah number */}
                    <span
                      className="w-9 h-9 flex items-center justify-center rounded-full text-sm font-bold flex-shrink-0"
                      style={{ background: "var(--highlight-bg)", color: "var(--dot-active)" }}
                    >
                      {row.a}
                    </span>
                    {/* Ayah text */}
                    <p
                      className="font-quran text-lg sm:text-xl leading-[2.2] flex-1"
                      style={{ color: "var(--text-0)" }}
                    >
                      {row.txt}
                    </p>
                  </div>

                  {/* Stats */}
                  {row.cnt.total > 0 && (
                    <div className="flex items-center gap-3 mt-2 mr-12 flex-wrap">
                      {row.cnt.total > 0 && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-2)" }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#2E8B57" }} />
                          {row.cnt.total} متشابهة
                        </span>
                      )}
                      {row.cnt.b > 0 && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-2)" }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#1B8A8A" }} />
                          {row.cnt.b} فاتحة
                        </span>
                      )}
                      {row.cnt.e > 0 && (
                        <span className="flex items-center gap-1 text-xs" style={{ color: "var(--text-2)" }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: "#7B52B9" }} />
                          {row.cnt.e} خاتمة
                        </span>
                      )}
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {!loading && ready && rows.length === 0 && (
            <div className="text-center py-20">
              <p className="font-quran text-lg" style={{ color: "var(--text-2)" }}>
                لا توجد متشابهات مسجَّلة لهذه السورة
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
