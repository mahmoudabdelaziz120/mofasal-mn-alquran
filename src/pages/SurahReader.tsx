import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SURAHS, RECITERS, TAJWEED_COLORS_DARK, TAJWEED_COLORS_LIGHT, TAJWEED_RULE_LABELS, numToArabic, ayaUrl } from "@/data/surahs";
import { parseTajweedText, extractTajweedCodes } from "@/lib/tajweedParser";
import CosmosBackground from "@/components/CosmosBackground";
import ThemeToggle from "@/components/ThemeToggle";
import { Play, Pause, SkipBack, SkipForward, Repeat, Home, PanelRightClose, PanelRightOpen } from "lucide-react";

interface AyahData {
  num: number;
  text: string; // raw bracket-format tajweed text
}

function useIsDarkMode() {
  const [dark, setDark] = useState(() => {
    return document.documentElement.getAttribute("data-theme") !== "light";
  });
  useEffect(() => {
    const obs = new MutationObserver(() => {
      setDark(document.documentElement.getAttribute("data-theme") !== "light");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);
  return dark;
}

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

  // Fetch ayahs from AlQuran.cloud tajweed API
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
      if (repeatMode) { audio.play().catch(() => {}); }
      else if (curIdx < ayahs.length - 1) loadAya(curIdx + 1, true);
      else setIsPlaying(false);
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

  // Auto-reload when reciter changes during playback
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || ayahs.length === 0) return;
    if (audio.src && audio.src !== window.location.href) {
      const wasPlaying = isPlayingRef.current;
      loadAyaDirect(curIdx, wasPlaying, reciter);
    }
  }, [reciter]); // eslint-disable-line react-hooks/exhaustive-deps

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

  // Scroll to active ayah
  useEffect(() => {
    const el = document.getElementById(`aw-${curIdx}`);
    if (el && mushafRef.current) {
      const pane = mushafRef.current;
      const paneRect = pane.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const elRelTop = elRect.top - paneRect.top + pane.scrollTop;
      const target = elRelTop - pane.clientHeight / 2 + elRect.height / 2;
      pane.scrollTo({ top: Math.max(0, target), behavior: "smooth" });
    }
  }, [curIdx]);

  // Extract tajweed codes from current ayah
  const currentCodes = useMemo(() => {
    if (!ayahs[curIdx]) return [];
    return extractTajweedCodes(ayahs[curIdx].text);
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
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex-shrink-0" style={{ background: "var(--glass-thin-bg)", backdropFilter: "blur(20px)", borderBottom: "0.5px solid var(--glass-thin-border)" }}>
          <div className="px-3 sm:px-4 py-2 sm:py-2.5">
            <div className="flex items-center justify-between mb-1.5 sm:mb-2">
              <div className="flex items-center gap-2 sm:gap-3">
                <button onClick={() => navigate("/")} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-80" style={{ background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-card-border)" }}>
                  <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: "var(--text-1)" }} />
                </button>
                <h1 className="font-quran text-base sm:text-lg font-bold" style={{ color: "var(--text-0)" }}>
                  سورة {surah.name}
                </h1>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <span className="hidden sm:inline text-[0.6875rem] px-2.5 py-1 rounded-lg" style={{ color: "var(--text-2)", background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-card-border)" }}>
                  {surah.revelationPlace === "makkah" ? "مكية" : "مدنية"} · {numToArabic(surah.versesCount)} آية
                </span>
                {/* Toggle rules panel on mobile */}
                <button onClick={() => setShowRules(!showRules)} className="md:hidden w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-card-border)" }}>
                  {showRules ? <PanelRightClose className="w-3.5 h-3.5" style={{ color: "var(--text-1)" }} /> : <PanelRightOpen className="w-3.5 h-3.5" style={{ color: "var(--text-1)" }} />}
                </button>
                <ThemeToggle />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[0.625rem] sm:text-[0.6875rem]" style={{ color: "var(--text-2)" }}>القارئ:</span>
              <select
                value={reciter}
                onChange={(e) => setReciter(e.target.value)}
                className="text-[0.6875rem] sm:text-xs px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg outline-none cursor-pointer font-[system-ui]"
                style={{ background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-thin-border)", color: "var(--text-0)" }}
              >
                {RECITERS.map((r) => (
                  <option key={r.id} value={r.id} style={{ background: "#0a1628", color: "var(--text-0)" }}>{r.name}</option>
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
                <button onClick={() => setRepeatMode(!repeatMode)} className="w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center" style={{ background: repeatMode ? "var(--highlight-bg)" : "var(--glass-card-bg)", border: `0.5px solid ${repeatMode ? "var(--highlight-border)" : "var(--glass-card-border)"}`, color: repeatMode ? "var(--dot-active)" : "var(--text-1)" }}>
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
                <div key={i} onClick={() => loadAya(i, true)} className="h-[2.5px] sm:h-[3px] rounded-sm cursor-pointer flex-1 transition-all duration-200" style={{ minWidth: 4, maxWidth: 14, background: i === curIdx ? "var(--dot-active)" : i < curIdx ? "var(--dot-done)" : "var(--progress-bar-bg)", boxShadow: i === curIdx ? "0 0 5px var(--dot-active)" : "none" }} />
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-1 overflow-hidden min-h-0">
          {/* Mushaf pane */}
          <div ref={mushafRef} className="flex-1 overflow-y-auto px-4 sm:px-7 py-3 sm:py-4 pb-8 sm:pb-10 custom-scrollbar" style={{ borderLeft: showRules ? "0.5px solid var(--glass-thin-border)" : "none" }}>
            {showBasmalah && (
              <div className="text-center font-quran text-lg sm:text-xl mb-3 sm:mb-3.5 pb-2 sm:pb-3" style={{ color: "var(--text-1)", borderBottom: "0.5px solid var(--glass-thin-border)" }}>
                بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ ٱلرَّحِيمِ
              </div>
            )}
            {loading ? (
              <p className="text-center py-10 font-quran" style={{ color: "var(--text-2)" }}>جاري تحميل الآيات...</p>
            ) : (
              <div className="font-quran text-lg sm:text-xl md:text-[1.375rem] leading-[2.5] sm:leading-[2.7] md:leading-[2.9] text-justify" style={{ color: "var(--text-0)" }}>
                {ayahs.map((aya, i) => (
                  <span
                    key={i}
                    id={`aw-${i}`}
                    onClick={() => loadAya(i, true)}
                    className="inline rounded-[5px] px-[1px] cursor-pointer transition-all duration-150"
                    style={{
                      background: i === curIdx ? "var(--highlight-bg)" : "transparent",
                      boxShadow: i === curIdx ? "0 0 0 1.5px var(--highlight-border)" : "none",
                    }}
                  >
                    {parseTajweedText(aya.text, isDark)}
                    <span
                      className="inline-flex items-center justify-center w-4 h-4 sm:w-5 sm:h-5 rounded-full text-[0.5rem] sm:text-[0.625rem] mx-[2px] sm:mx-[3px] align-middle"
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

          {/* Rules pane — hidden on mobile unless toggled */}
          {showRules && (
            <div className="w-[180px] sm:w-[220px] md:w-[260px] flex-shrink-0 overflow-y-auto p-2.5 sm:p-3.5 custom-scrollbar" style={{ background: "var(--rules-pane-bg)" }}>
              <div className="text-[0.5625rem] sm:text-[0.625rem] uppercase tracking-widest mb-2 sm:mb-2.5 pb-1.5" style={{ color: "var(--text-3)", borderBottom: "0.5px solid var(--glass-thin-border)" }}>
                أحكام التجويد — الآية {ayahs[curIdx] ? numToArabic(ayahs[curIdx].num) : ""}
              </div>
              {currentCodes.length === 0 ? (
                <p className="text-[0.6875rem] text-center py-5 font-quran" style={{ color: "var(--text-3)" }}>لا توجد أحكام خاصة</p>
              ) : (
                currentCodes.map((code) => (
                  <div
                    key={code}
                    className="flex items-start gap-2 p-2 sm:p-2.5 rounded-xl mb-1.5"
                    style={{ background: "var(--ayah-num-bg)", border: "0.5px solid var(--ayah-num-border)", animation: "fadeSlideUp 0.2s ease" }}
                  >
                    <div className="w-2 h-2 rounded-full flex-shrink-0 mt-1" style={{ background: colors[code] || "#888" }} />
                    <div className="text-[0.6875rem] sm:text-xs font-medium" style={{ color: colors[code] || "#888" }}>
                      {TAJWEED_RULE_LABELS[code] || code}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Legend strip */}
        <div className="flex-shrink-0 flex flex-wrap gap-1 items-center px-3 sm:px-4 py-1 sm:py-1.5" style={{ background: "var(--legend-bg)", borderTop: "0.5px solid var(--glass-thin-border)" }}>
          {Object.entries(TAJWEED_RULE_LABELS)
            .filter(([code]) => !["s", "d", "b"].includes(code)) // skip duplicates of gray group
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
