import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SURAHS, RECITERS, TAJWEED_COLORS_DARK, TAJWEED_COLORS_LIGHT, TAJWEED_RULE_LABELS, numToArabic, ayaUrl } from "@/data/surahs";
import { parseTajweedText, extractTajweedOccurrences } from "@/lib/tajweedParser";
import CosmosBackground from "@/components/CosmosBackground";
import ThemeToggle from "@/components/ThemeToggle";
import RepeatDialog, { RepeatConfig } from "@/components/RepeatDialog";
import { Play, Pause, SkipBack, SkipForward, Repeat, PanelRightClose, PanelRightOpen } from "lucide-react";
import logoImg from "@/assets/logo.png";

interface AyahData {
  num: number;
  text: string;
}

function useIsDarkMode() {
  const [dark, setDark] = useState(() => document.documentElement.getAttribute("data-theme") !== "light");
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute("data-theme") !== "light");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

const RULE_DESCRIPTIONS: Record<string, string> = {
  h: "همزة الوصل — تُحذف وصلاً",
  s: "حرف ساكن لا يُلفظ",
  l: "لام شمسية — تُدغم في الحرف بعدها",
  n: "مدّ طبيعي — حركتان",
  p: "مدّ جائز منفصل — ٢-٥ حركات",
  m: "مدّ لازم — ٦ حركات",
  q: "قلقلة — اضطراب الحرف عند سكونه",
  o: "مدّ واجب متصل — ٤-٥ حركات",
  c: "إخفاء شفوي — الميم الساكنة قبل الباء",
  f: "إخفاء — النون الساكنة/التنوين قبل حروف الإخفاء",
  w: "إدغام شفوي — الميم الساكنة قبل الميم",
  i: "إقلاب — النون الساكنة/التنوين قبل الباء",
  a: "إدغام بغنة — التنوين أو النون الساكنة",
  u: "إدغام بغير غنة — النون الساكنة قبل اللام والراء",
  g: "غنة — صوت يخرج من الخيشوم",
  d: "إدغام متجانسين",
  b: "إدغام متقاربين",
};

export default function SurahReader() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const surahNum = parseInt(id || "1");
  const surah = SURAHS.find((s) => s.id === surahNum);
  const isDark = useIsDarkMode();

  const [ayahs, setAyahs] = useState<AyahData[]>([]);
  const [loading, setLoading] = useState(true);
  const [curIdx, setCurIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [repeatMode, setRepeatMode] = useState(false);
  const [reciter, setReciter] = useState("Muhammad_Jibreel_128kbps");
  const [progress, setProgress] = useState(0);
  const [curTime, setCurTime] = useState("0:00");
  const [durTime, setDurTime] = useState("0:00");
  const [showRules, setShowRules] = useState(true);
  const [showRepeatDialog, setShowRepeatDialog] = useState(false);

  // Repeat loop state
  const repeatConfigRef = useRef<RepeatConfig | null>(null);
  const repeatAyahCountRef = useRef(0);
  const repeatSectionCountRef = useRef(0);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mushafRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<number | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);

  // Restore saved state
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`quran_surah${surahNum}_last`);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.reciter) setReciter(data.reciter);
        if (typeof data.idx === "number") setCurIdx(data.idx);
      }
    } catch {}
  }, [surahNum]);

  // Save state
  useEffect(() => {
    try {
      localStorage.setItem(`quran_surah${surahNum}_last`, JSON.stringify({ idx: curIdx, reciter }));
    } catch {}
  }, [curIdx, reciter, surahNum]);

  // Fetch ayahs
  useEffect(() => {
    setLoading(true);
    setAyahs([]);
    setCurIdx(0);
    const ctrl = new AbortController();
    fetch(`https://api.alquran.cloud/v1/surah/${surahNum}/quran-tajweed`, { signal: ctrl.signal })
      .then((r) => r.json())
      .then((d) => {
        if (d.data?.ayahs) {
          setAyahs(d.data.ayahs.map((a: any) => ({ num: a.numberInSurah, text: a.text })));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
    return () => ctrl.abort();
  }, [surahNum]);

  // Audio setup
  useEffect(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    const audio = audioRef.current;
    const onTimeUpdate = () => {
      if (audio.duration) {
        setProgress((audio.currentTime / audio.duration) * 100);
        setCurTime(fmt(audio.currentTime));
      }
    };
    const onDurationChange = () => setDurTime(fmt(audio.duration));
    const onEnded = () => {
      const cfg = repeatConfigRef.current;
      if (cfg) {
        // Repeat loop mode
        repeatAyahCountRef.current++;
        if (repeatAyahCountRef.current < cfg.ayahRepeat) {
          // Repeat same ayah
          audio.currentTime = 0;
          audio.play().catch(() => {});
        } else {
          // Move to next ayah in range
          repeatAyahCountRef.current = 0;
          const nextAyahNum = ayahs[curIdx]?.num + 1;
          if (nextAyahNum && nextAyahNum <= cfg.toAyah) {
            const nextIdx = ayahs.findIndex(a => a.num === nextAyahNum);
            if (nextIdx >= 0) { loadAyaDirect(nextIdx, true, reciter); return; }
          }
          // End of section, check section repeat
          repeatSectionCountRef.current++;
          if (repeatSectionCountRef.current < cfg.sectionRepeat) {
            const startIdx = ayahs.findIndex(a => a.num === cfg.fromAyah);
            if (startIdx >= 0) { loadAyaDirect(startIdx, true, reciter); return; }
          }
          // Done repeating
          repeatConfigRef.current = null;
          repeatAyahCountRef.current = 0;
          repeatSectionCountRef.current = 0;
          setIsPlaying(false);
        }
      } else if (repeatMode) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      } else if (curIdx < ayahs.length - 1) {
        loadAyaDirect(curIdx + 1, true, reciter);
      } else {
        setIsPlaying(false);
      }
    };
    const onError = () => { clearTimeout(timeoutRef.current!); setIsPlaying(false); };
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("durationchange", onDurationChange);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("error", onError);
    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("durationchange", onDurationChange);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("error", onError);
    };
  }, [curIdx, ayahs.length, repeatMode]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; } };
  }, []);

  // Auto-reload audio when reciter or ayah changes
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || ayahs.length === 0) return;
    const wasPlaying = isPlayingRef.current;
    const newSrc = ayaUrl(surahNum, ayahs[curIdx]?.num || 1, reciter);
    if (audio.src !== newSrc) {
      loadAyaDirect(curIdx, wasPlaying, reciter);
    }
  }, [reciter, curIdx]); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (s: number) => {
    if (!s || isNaN(s)) return "0:00";
    const m = Math.floor(s / 60);
    const ss = Math.floor(s % 60);
    return `${m}:${ss < 10 ? "0" : ""}${ss}`;
  };

  const loadAyaDirect = (idx: number, autoPlay: boolean, rec: string) => {
    const audio = audioRef.current;
    if (!audio || !ayahs[idx]) return;
    clearTimeout(timeoutRef.current!);
    setCurIdx(idx);
    setProgress(0);
    setCurTime("0:00");
    setDurTime("0:00");
    audio.src = ayaUrl(surahNum, ayahs[idx].num, rec);
    audio.load();
    if (autoPlay) {
      audio.play().catch(() => {});
      setIsPlaying(true);
      timeoutRef.current = window.setTimeout(() => {
        if (!audio.duration && idx < ayahs.length - 1) loadAyaDirect(idx + 1, true, rec);
      }, 6000);
    }
  };

  const loadAya = useCallback(
    (idx: number, autoPlay = false) => { loadAyaDirect(idx, autoPlay, reciter); },
    [ayahs, reciter, surahNum] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const selectAyah = (idx: number) => {
    setCurIdx(idx);
    const el = document.getElementById(`aw-${idx}`);
    if (el && mushafRef.current) {
      const pane = mushafRef.current;
      const paneRect = pane.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const elRelTop = elRect.top - paneRect.top + pane.scrollTop;
      const target = elRelTop - pane.clientHeight / 2 + elRect.height / 2;
      pane.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      if (!audio.src || audio.src === window.location.href) { loadAya(curIdx, true); return; }
      audio.play().catch(() => {});
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio?.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pct = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    audio.currentTime = pct * audio.duration;
  };

  const handleRepeatStart = (config: RepeatConfig) => {
    setShowRepeatDialog(false);
    repeatConfigRef.current = config;
    repeatAyahCountRef.current = 0;
    repeatSectionCountRef.current = 0;
    const startIdx = ayahs.findIndex(a => a.num === config.fromAyah);
    if (startIdx >= 0) {
      loadAyaDirect(startIdx, true, reciter);
    }
  };

  // Scroll to active ayah when playing
  useEffect(() => {
    if (!isPlaying) return;
    const el = document.getElementById(`aw-${curIdx}`);
    if (el && mushafRef.current) {
      const pane = mushafRef.current;
      const paneRect = pane.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const elRelTop = elRect.top - paneRect.top + pane.scrollTop;
      const target = elRelTop - pane.clientHeight / 2 + elRect.height / 2;
      pane.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    }
  }, [curIdx, isPlaying]);

  const ruleOccurrences = useMemo(() => {
    if (!ayahs[curIdx]) return [];
    return extractTajweedOccurrences(ayahs[curIdx].text);
  }, [ayahs, curIdx]);

  const colors = isDark ? TAJWEED_COLORS_DARK : TAJWEED_COLORS_LIGHT;

  if (!surah) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <CosmosBackground />
        <p className="relative z-10 font-quran text-lg" style={{ color: "var(--text-1)" }}>السورة غير موجودة</p>
      </div>
    );
  }

  const showBasmalah = surahNum !== 1 && surahNum !== 9;

  return (
    <div className="relative h-[100dvh] flex flex-col" dir="rtl">
      <CosmosBackground />
      <RepeatDialog
        open={showRepeatDialog}
        onClose={() => setShowRepeatDialog(false)}
        totalAyahs={ayahs.length}
        currentAyah={ayahs[curIdx]?.num || 1}
        onStart={handleRepeatStart}
      />
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div
          className="flex-shrink-0"
          style={{
            background: "var(--glass-thin-bg)",
            backdropFilter: "blur(20px)",
            borderBottom: "0.5px solid var(--glass-thin-border)",
          }}
        >
          <div className="px-3 sm:px-4 py-2 sm:py-2.5">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <button onClick={() => navigate("/")} className="flex-shrink-0">
                  <img src={logoImg} alt="الرئيسية" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full object-cover" />
                </button>
                <h1 className="font-quran text-base sm:text-lg font-bold" style={{ color: "var(--text-0)" }}>
                  سورة {surah.name}
                </h1>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="hidden sm:inline text-[0.6875rem] px-2.5 py-1 rounded-lg" style={{ color: "var(--text-2)", background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-card-border)" }}>
                  {surah.revelationPlace === "makkah" ? "مكية" : "مدنية"} · {numToArabic(surah.versesCount)} آية
                </span>
                <button onClick={() => setShowRules(!showRules)} className="md:hidden w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-card-border)" }}>
                  {showRules ? <PanelRightClose className="w-3.5 h-3.5" style={{ color: "var(--text-1)" }} /> : <PanelRightOpen className="w-3.5 h-3.5" style={{ color: "var(--text-1)" }} />}
                </button>
                <ThemeToggle />
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[0.625rem] sm:text-[0.6875rem]" style={{ color: "var(--text-2)" }}>القارئ:</span>
              <select
                value={reciter}
                onChange={(e) => setReciter(e.target.value)}
                className="text-[0.6875rem] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg outline-none cursor-pointer font-[system-ui]"
                style={{ background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-thin-border)", color: "var(--text-0)" }}
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id} style={{ background: "var(--select-option-bg)", color: "var(--text-0)" }}>{r.name}</option>
                ))}
              </select>
              <span className="text-[0.625rem] sm:text-[0.6875rem] mr-2" style={{ color: "var(--text-2)" }}>السورة:</span>
              <select
                value={surahNum}
                onChange={(e) => navigate(`/surah/${e.target.value}`)}
                className="text-[0.6875rem] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg outline-none cursor-pointer font-quran"
                style={{ background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-thin-border)", color: "var(--text-0)" }}
              >
                {SURAHS.map((s) => (
                  <option key={s.id} value={s.id} style={{ background: "var(--select-option-bg)", color: "var(--text-0)" }}>
                    {numToArabic(s.id)}. {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Player bar */}
          <div className="px-3 sm:px-4 py-2 sm:py-2.5" style={{ background: "var(--glass-thin-bg)", borderTop: "0.5px solid var(--glass-thin-border)" }}>
            <div className="flex items-center gap-2 sm:gap-3 mb-1.5 sm:mb-2">
              <div className="flex-1 font-quran text-[0.6875rem] sm:text-[0.8125rem] truncate" style={{ color: "var(--text-2)" }}>
                {ayahs[curIdx] ? `الآية ${numToArabic(ayahs[curIdx].num)}` : "اضغط ▶ للبدء"}
              </div>
              <div className="flex items-center gap-1 sm:gap-1.5">
                <button onClick={() => curIdx > 0 && loadAya(curIdx - 1, isPlaying)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center" style={{ background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-card-border)", color: "var(--text-1)" }}>
                  <SkipForward className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
                <button onClick={togglePlay} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center" style={{ background: "var(--highlight-bg)", border: "0.5px solid var(--highlight-border)", color: "var(--dot-active)" }}>
                  {isPlaying ? <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-0.5" />}
                </button>
                <button onClick={() => curIdx < ayahs.length - 1 && loadAya(curIdx + 1, isPlaying)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center" style={{ background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-card-border)", color: "var(--text-1)" }}>
                  <SkipBack className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
                <button
                  onClick={() => setShowRepeatDialog(true)}
                  className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center"
                  style={{
                    background: repeatConfigRef.current ? "var(--highlight-bg)" : "var(--glass-card-bg)",
                    border: `0.5px solid ${repeatConfigRef.current ? "var(--highlight-border)" : "var(--glass-card-border)"}`,
                    color: repeatConfigRef.current ? "var(--dot-active)" : "var(--text-1)",
                  }}
                >
                  <Repeat className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </button>
              </div>
            </div>
            {/* Progress */}
            <div className="flex items-center gap-2" dir="ltr">
              <span className="text-[0.5625rem] sm:text-[0.625rem] min-w-[28px] text-center tabular-nums" style={{ color: "var(--text-3)" }}>{curTime}</span>
              <div className="flex-1 h-1 rounded-full cursor-pointer relative" style={{ background: "var(--progress-bar-bg)" }} onClick={handleSeek}>
                <div className="h-full rounded-full pointer-events-none" style={{ background: "var(--progress-grad)", width: `${progress}%` }} />
              </div>
              <span className="text-[0.5625rem] sm:text-[0.625rem] min-w-[28px] text-center tabular-nums" style={{ color: "var(--text-3)" }}>{durTime}</span>
            </div>
            {/* Ayah dots */}
            <div className="flex gap-[2px] sm:gap-[3px] flex-wrap mt-1.5 sm:mt-2" dir="ltr">
              {ayahs.map((_, i) => (
                <div key={i} onClick={() => selectAyah(i)} className="h-[2.5px] sm:h-[3px] rounded-sm cursor-pointer flex-1 transition-all duration-200" style={{ minWidth: 4, maxWidth: 14, background: i === curIdx ? "var(--dot-active)" : i < curIdx ? "var(--dot-done)" : "var(--progress-bar-bg)", boxShadow: i === curIdx ? "0 0 5px var(--dot-active)" : "none" }} />
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Mushaf pane */}
          <div
            ref={mushafRef}
            className="flex-1 overflow-y-auto px-4 sm:px-7 py-3 sm:py-4 pb-8 sm:pb-10 custom-scrollbar"
            style={{
              borderLeft: showRules ? "0.5px solid var(--glass-thin-border)" : "none",
              background: isDark ? "transparent" : "var(--mushaf-bg, transparent)",
            }}
          >
            {showBasmalah && (
              <div className="text-center font-quran text-lg sm:text-xl mb-3 sm:mb-3.5 pb-2 sm:pb-3" style={{ color: "var(--quran-text, var(--text-1))", borderBottom: "0.5px solid var(--glass-thin-border)" }}>
                بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
              </div>
            )}
            {loading ? (
              <p className="text-center py-10 font-quran" style={{ color: "var(--text-2)" }}>جاري تحميل الآيات...</p>
            ) : (
              <div
                className="font-quran quran-text-responsive leading-[2.5] sm:leading-[2.7] md:leading-[2.9] text-justify"
                style={{ color: "var(--quran-text, var(--text-0))" }}
              >
                {ayahs.map((aya, i) => (
                  <span
                    key={i}
                    id={`aw-${i}`}
                    onClick={() => selectAyah(i)}
                    className="inline rounded-[5px] px-[1px] cursor-pointer transition-all duration-150"
                    style={{
                      background: i === curIdx ? "var(--highlight-bg)" : "transparent",
                      boxShadow: i === curIdx ? "0 0 0 1.5px var(--highlight-border)" : "none",
                    }}
                  >
                    {parseTajweedText(aya.text, isDark)}
                    <span
                      className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full text-[0.5625rem] sm:text-[0.6875rem] mx-[2px] sm:mx-[3px] align-middle"
                      style={{
                        background: "var(--ayah-num-bg)",
                        border: "0.5px solid var(--ayah-num-border)",
                        color: "var(--text-3)",
                        fontFamily: "system-ui",
                      }}
                    >
                      {numToArabic(aya.num)}
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Rules pane */}
          {showRules && (
            <div
              className="w-[200px] sm:w-[240px] md:w-[280px] lg:w-[310px] flex-shrink-0 overflow-y-auto p-2.5 sm:p-3.5 custom-scrollbar"
              style={{ background: "var(--rules-pane-bg)" }}
            >
              <div className="text-[0.5625rem] sm:text-[0.625rem] uppercase tracking-widest mb-2 sm:mb-2.5 pb-1.5" style={{ color: "var(--text-3)", borderBottom: "0.5px solid var(--glass-thin-border)" }}>
                أحكام التجويد — الآية {ayahs[curIdx] ? numToArabic(ayahs[curIdx].num) : ""}
              </div>

              {ayahs[curIdx] && (
                <div
                  className="font-quran text-xs sm:text-sm leading-[2] p-2.5 rounded-xl mb-3 text-right"
                  style={{
                    background: "var(--rule-card-bg)",
                    border: "0.5px solid var(--rule-card-border)",
                    boxShadow: "var(--rule-card-shadow)",
                    color: "var(--quran-text, var(--text-0))",
                  }}
                >
                  {parseTajweedText(ayahs[curIdx].text, isDark)}
                </div>
              )}

              {ruleOccurrences.length === 0 ? (
                <p className="text-[0.6875rem] text-center py-5 font-quran" style={{ color: "var(--text-3)" }}>لا توجد أحكام خاصة</p>
              ) : (
                ruleOccurrences.map((occ, idx) => {
                  const color = colors[occ.code] || "#888";
                  return (
                    <div
                      key={`${occ.code}-${idx}`}
                      className="p-2.5 sm:p-3 rounded-xl mb-2"
                      style={{
                        background: "var(--rule-card-bg)",
                        border: "0.5px solid var(--rule-card-border)",
                        boxShadow: "var(--rule-card-shadow)",
                        borderRight: `3px solid ${color}`,
                        animation: "fadeSlideUp 0.2s ease",
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: color }} />
                        <span className="text-[0.75rem] sm:text-sm font-bold" style={{ color }}>
                          {TAJWEED_RULE_LABELS[occ.code] || occ.code}
                        </span>
                      </div>
                      <div className="mt-1.5 mb-1.5">
                        <span
                          className="font-quran text-[0.8125rem] sm:text-sm px-2.5 py-1 rounded-lg inline-block"
                          style={{
                            background: `${color}1A`,
                            color: color,
                            border: `0.5px solid ${color}33`,
                          }}
                        >
                          {occ.context}
                        </span>
                      </div>
                      <p className="text-[0.6rem] sm:text-[0.6875rem] mt-1" style={{ color: "var(--text-2)" }}>
                        {RULE_DESCRIPTIONS[occ.code] || ""}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>

        {/* Legend strip */}
        <div className="flex-shrink-0 flex flex-wrap gap-1 items-center px-3 sm:px-4 py-1 sm:py-1.5" style={{ background: "var(--legend-bg)", borderTop: "0.5px solid var(--glass-thin-border)" }}>
          {Object.entries(TAJWEED_RULE_LABELS)
            .filter(([code]) => !["s", "d", "b"].includes(code))
            .map(([code, label]) => (
              <span key={code} className="text-[0.5rem] sm:text-[0.625rem] px-1.5 sm:px-2 py-0.5 rounded-md font-medium whitespace-nowrap" style={{ background: `${colors[code]}22`, color: colors[code], border: `0.5px solid ${colors[code]}44` }}>
                {label}
              </span>
            ))}
        </div>
      </div>
    </div>
  );
}
