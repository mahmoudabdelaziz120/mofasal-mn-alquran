import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SURAHS, numToArabic } from "@/data/surahs";
import CosmosBackground from "@/components/CosmosBackground";
import ThemeToggle from "@/components/ThemeToggle";
import logoImg from "@/assets/logo.png";

interface TafsirAyah {
  number: number;
  numberInSurah: number;
  text: string; // tafsir text
}

interface QuranAyah {
  numberInSurah: number;
  text: string; // quran text
}

export default function TafsirReader() {
  const navigate = useNavigate();
  const [surahNum, setSurahNum] = useState(1);
  const [tafsirAyahs, setTafsirAyahs] = useState<TafsirAyah[]>([]);
  const [quranAyahs, setQuranAyahs] = useState<QuranAyah[]>([]);
  const [loading, setLoading] = useState(true);

  const surah = SURAHS.find((s) => s.id === surahNum);

  useEffect(() => {
    setLoading(true);
    const ctrl = new AbortController();

    Promise.all([
      fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/ar.muyassar`, { signal: ctrl.signal }).then((r) => r.json()),
      fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-uthmani`, { signal: ctrl.signal }).then((r) => r.json()),
    ])
      .then(([tafsirData, quranData]) => {
        if (tafsirData.data?.ayahs) {
          setTafsirAyahs(tafsirData.data.ayahs.map((a: any) => ({
            number: a.number,
            numberInSurah: a.numberInSurah,
            text: a.text,
          })));
        }
        if (quranData.data?.ayahs) {
          setQuranAyahs(quranData.data.ayahs.map((a: any) => ({
            numberInSurah: a.numberInSurah,
            text: a.text,
          })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    return () => ctrl.abort();
  }, [surahNum]);

  return (
    <div className="relative min-h-screen" dir="rtl">
      <CosmosBackground />
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <div
          className="flex-shrink-0"
          style={{
            background: "var(--glass-thin-bg)",
            backdropFilter: "blur(20px)",
            borderBottom: "0.5px solid var(--glass-thin-border)",
          }}
        >
          <div className="px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <button onClick={() => navigate("/")} className="flex-shrink-0">
                <img src={logoImg} alt="الرئيسية" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover" />
              </button>
              <h1 className="font-quran text-base sm:text-lg font-bold" style={{ color: "var(--text-0)" }}>
                التفسير الميسر
              </h1>
            </div>
            <ThemeToggle />
          </div>
          {/* Surah selector */}
          <div className="px-3 sm:px-4 pb-2.5 flex items-center gap-2">
            <span className="text-[0.625rem] sm:text-[0.6875rem]" style={{ color: "var(--text-2)" }}>السورة:</span>
            <select
              value={surahNum}
              onChange={(e) => setSurahNum(Number(e.target.value))}
              className="text-[0.6875rem] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg outline-none cursor-pointer font-quran"
              style={{ background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-thin-border)", color: "var(--text-0)" }}
            >
              {SURAHS.map((s) => (
                <option key={s.id} value={s.id} style={{ background: "var(--select-option-bg)", color: "var(--text-0)" }}>
                  {numToArabic(s.id)}. {s.name}
                </option>
              ))}
            </select>
            {surah && (
              <span className="text-[0.6rem] sm:text-[0.6875rem] px-2 py-0.5 rounded-lg" style={{ color: "var(--text-2)", background: "var(--glass-card-bg)" }}>
                {surah.revelationPlace === "makkah" ? "مكية" : "مدنية"} · {numToArabic(surah.versesCount)} آية
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto px-3 sm:px-5 md:px-8 py-4 sm:py-6 pb-10 max-w-4xl mx-auto w-full">
          {loading ? (
            <p className="text-center py-10 font-quran" style={{ color: "var(--text-2)" }}>جاري تحميل التفسير...</p>
          ) : (
            <div className="space-y-4 sm:space-y-5">
              {quranAyahs.map((qAyah, idx) => {
                const tafsir = tafsirAyahs[idx];
                return (
                  <div
                    key={qAyah.numberInSurah}
                    className="rounded-2xl overflow-hidden"
                    style={{
                      background: "var(--glass-card-bg)",
                      border: "0.5px solid var(--glass-card-border)",
                      backdropFilter: "blur(40px)",
                    }}
                  >
                    {/* Quran text */}
                    <div className="px-4 sm:px-5 pt-4 sm:pt-5 pb-3">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[0.625rem] sm:text-xs font-medium flex-shrink-0 mt-1"
                          style={{ background: "var(--highlight-bg)", color: "var(--dot-active)", border: "0.5px solid var(--highlight-border)" }}
                        >
                          {numToArabic(qAyah.numberInSurah)}
                        </div>
                        <p
                          className="font-quran text-lg sm:text-xl md:text-2xl leading-[2.2] sm:leading-[2.5] flex-1"
                          style={{ color: "var(--quran-text, var(--text-0))" }}
                        >
                          {qAyah.text}
                        </p>
                      </div>
                    </div>
                    {/* Tafsir */}
                    {tafsir && (
                      <div
                        className="px-4 sm:px-5 py-3 sm:py-4"
                        style={{
                          background: "var(--rules-pane-bg)",
                          borderTop: "0.5px solid var(--glass-thin-border)",
                        }}
                      >
                        <p
                          className="text-sm sm:text-base leading-[1.9] sm:leading-[2]"
                          style={{ color: "var(--text-1)", fontFamily: "system-ui, sans-serif" }}
                        >
                          {tafsir.text}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
