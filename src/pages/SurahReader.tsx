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
  const [rulesWidth, setRulesWidth] = useState(280);

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
              <div className="flex items-center gap-1.5 flex-1 min-w-0" style={{ color: "var(--text-2)" }}>
                <span className="text-[0.625rem] sm:text-[0.6875rem]">الآية</span>
                <select
                  value={ayahs[curIdx]?.num || 1}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    const idx = ayahs.findIndex(a => a.num === val);
                    if (idx >= 0) loadAyaDirect(idx, isPlaying, reciter);
                  }}
                  className="text-[0.6875rem] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg outline-none cursor-pointer font-quran"
                  style={{ background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-thin-border)", color: "var(--text-0)" }}
                >
                  {ayahs.map((a) => (
                    <option key={a.num} value={a.num} style={{ background: "var(--select-option-bg)", color: "var(--text-0)" }}>
                      {numToArabic(a.num)}
                    </option>
                  ))}
                </select>
                <span className="text-[0.5625rem] sm:text-[0.625rem]">من {numToArabic(ayahs.length)}</span>
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

        {/* Main content — resizable */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Mushaf pane */}
          <div
            ref={mushafRef}
            className="flex-1 overflow-y-auto px-4 sm:px-7 py-3 sm:py-4 pb-8 sm:pb-10 custom-scrollbar"
            style={{
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
                      className="inline-flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 mx-[2px] sm:mx-[3px] align-middle"
                      style={{
                        color: isDark ? "var(--dot-active)" : "#6B4C1E",
                        fontFamily: "system-ui",
                        fontSize: "0.625rem",
                        fontWeight: 700,
                        position: "relative",
                      }}
                    >
                      <svg viewBox="0 0 40 40" className="absolute inset-0 w-full h-full" style={{ color: isDark ? "var(--dot-active)" : "#B8935A" }}>
                        <path d="M20 2 L26 8 L38 10 L30 18 L32 30 L20 25 L8 30 L10 18 L2 10 L14 8 Z" fill="none" stroke="currentColor" strokeWidth="1.5" opacity="0.7" />
                        <circle cx="20" cy="17" r="11" fill="none" stroke="currentColor" strokeWidth="0.8" opacity="0.4" />
                      </svg>
                      <span className="relative z-10">{numToArabic(aya.num)}</span>
                    </span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Resizable divider */}
          {showRules && (
            <div
              className="w-[3px] sm:w-[4px] cursor-col-resize flex-shrink-0 group relative hover:bg-[var(--dot-active)] transition-colors"
              style={{ background: "var(--glass-thin-border)" }}
              onMouseDown={(e) => {
                e.preventDefault();
                const startX = e.clientX;
                const startW = rulesWidth;
                const onMove = (ev: MouseEvent) => {
                  const diff = startX - ev.clientX;
                  const newW = Math.max(160, Math.min(500, startW + diff));
                  setRulesWidth(newW);
                };
                const onUp = () => { document.removeEventListener("mousemove", onMove); document.removeEventListener("mouseup", onUp); };
                document.addEventListener("mousemove", onMove);
                document.addEventListener("mouseup", onUp);
              }}
              onTouchStart={(e) => {
                const startX = e.touches[0].clientX;
                const startW = rulesWidth;
                const onMove = (ev: TouchEvent) => {
                  const diff = startX - ev.touches[0].clientX;
                  const newW = Math.max(160, Math.min(500, startW + diff));
                  setRulesWidth(newW);
                };
                const onUp = () => { document.removeEventListener("touchmove", onMove); document.removeEventListener("touchend", onUp); };
                document.addEventListener("touchmove", onMove);
                document.addEventListener("touchend", onUp);
              }}
            >
              <div className="absolute inset-y-0 -left-1 -right-1" />
            </div>
          )}

          {/* Rules pane — Premium Tajweed Panel */}
          {showRules && (
            <div
              className="flex-shrink-0 overflow-y-auto p-3 sm:p-4 custom-scrollbar"
              style={{
                background: "var(--rules-pane-bg)",
                width: rulesWidth,
                backdropFilter: "blur(24px)",
                WebkitBackdropFilter: "blur(24px)",
              }}
            >
              {/* Panel header */}
              <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: "0.5px solid var(--glass-thin-border)" }}>
                <div className="w-1.5 h-5 rounded-full" style={{ background: "var(--progress-grad)" }} />
                <span className="text-[0.6875rem] sm:text-xs font-bold tracking-wide" style={{ color: "var(--text-1)" }}>
                  أحكام التجويد
                </span>
                <span className="text-[0.5625rem] sm:text-[0.625rem] mr-auto px-2 py-0.5 rounded-md" style={{ color: "var(--text-3)", background: "var(--glass-thin-bg)", border: "0.5px solid var(--glass-thin-border)" }}>
                  الآية {ayahs[curIdx] ? numToArabic(ayahs[curIdx].num) : ""}
                </span>
              </div>

              {/* Hero verse container */}
              {ayahs[curIdx] && (
                <div
                  className="font-quran text-xs sm:text-sm leading-[2.2] p-3 sm:p-4 rounded-2xl mb-4 text-center relative overflow-hidden"
                  style={{
                    background: isDark
                      ? "radial-gradient(ellipse at 50% 0%, rgba(147,197,253,0.06) 0%, var(--rule-card-bg) 70%)"
                      : "radial-gradient(ellipse at 50% 0%, rgba(210,180,100,0.08) 0%, var(--rule-card-bg) 70%)",
                    border: "0.5px solid var(--rule-card-border)",
                    boxShadow: isDark
                      ? "0 4px 24px -4px rgba(147,197,253,0.08), inset 0 1px 0 rgba(255,255,255,0.04)"
                      : "0 4px 20px -4px rgba(128,101,23,0.06), inset 0 1px 0 rgba(255,255,255,0.5)",
                    color: "var(--quran-text, var(--text-0))",
                  }}
                >
                  {/* Top glow inside card */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] rounded-full" style={{
                    background: isDark
                      ? "linear-gradient(90deg, transparent, rgba(147,197,253,0.3), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(210,180,100,0.3), transparent)",
                  }} />
                  {parseTajweedText(ayahs[curIdx].text, isDark)}
                </div>
              )}

              {ruleOccurrences.length === 0 ? (
                <p className="text-[0.6875rem] text-center py-8 font-quran" style={{ color: "var(--text-3)" }}>لا توجد أحكام خاصة</p>
              ) : (
                <div className="flex flex-col gap-[1px]" style={{ background: "var(--glass-thin-border)", borderRadius: "1rem", overflow: "hidden", border: "0.5px solid var(--glass-thin-border)" }}>
                  {ruleOccurrences.map((occ, idx) => {
                    const color = colors[occ.code] || "#888";
                    return (
                      <div
                        key={`${occ.code}-${idx}`}
                        className="transition-transform duration-200 hover:scale-[0.99] active:scale-[0.98]"
                        style={{
                          background: "var(--rule-card-bg)",
                          animation: `fadeSlideUp 0.3s ease ${idx * 0.04}s both`,
                        }}
                      >
                        <div className="flex items-start gap-2.5 p-3 sm:p-3.5" dir="rtl">
                          {/* Colored dot */}
                          <div
                            className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                            style={{
                              background: color,
                              boxShadow: `0 0 6px ${color}66`,
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            {/* Rule name */}
                            <span className="text-[0.8125rem] sm:text-[0.875rem] font-bold block mb-1.5" style={{ color }}>
                              {TAJWEED_RULE_LABELS[occ.code] || occ.code}
                            </span>
                            {/* Context with highlighted word */}
                            <div className="font-quran text-[0.9375rem] sm:text-[1rem] leading-[2] mb-1.5" dir="rtl">
                              {(() => {
                                const ctx = occ.context;
                                const wordIdx = ctx.indexOf(occ.word);
                                if (wordIdx === -1) {
                                  return <span style={{ color, background: `${color}1A`, border: `0.5px solid ${color}33`, borderRadius: "0.5rem", padding: "2px 10px", fontWeight: "bold" }}>{ctx}</span>;
                                }
                                const before = ctx.slice(0, wordIdx);
                                const after = ctx.slice(wordIdx + occ.word.length);
                                return (
                                  <>
                                    {before && <span style={{ color: "var(--text-1)" }}>{before}</span>}
                                    <span style={{ color, background: `${color}1A`, border: `0.5px solid ${color}33`, borderRadius: "0.5rem", padding: "2px 10px", fontWeight: "bold", display: "inline-block" }}>{occ.word}</span>
                                    {after && <span style={{ color: "var(--text-1)" }}>{after}</span>}
                                  </>
                                );
                              })()}
                            </div>
                            {/* Description */}
                            <p className="text-[0.6875rem] sm:text-[0.75rem] leading-relaxed m-0" style={{ color: "var(--text-2)" }}>
                              {RULE_DESCRIPTIONS[occ.code] || ""}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
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
