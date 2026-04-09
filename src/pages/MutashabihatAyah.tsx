import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SURAHS } from "@/data/surahs";
import { SURAH_SLUGS } from "@/data/surahSlugs";
import CosmosBackground from "@/components/CosmosBackground";
import ThemeToggle from "@/components/ThemeToggle";
import { ArrowRight, Loader2, ChevronDown } from "lucide-react";
import logoImg from "@/assets/logo.png";
import {
  ensureEngine,
  isEngineReady,
  findAyah,
  famousSurah,
  highlightPhrase,
  type AyahDetail,
  type PhraseMatch,
} from "@/lib/mutashabihatEngine";

export default function MutashabihatAyah() {
  const { slug, ayahNum } = useParams<{ slug: string; ayahNum: string }>();
  const navigate = useNavigate();

  const surahId = Object.entries(SURAH_SLUGS).find(([, s]) => s === slug)?.[0];
  const surah = surahId ? SURAHS.find((s) => s.id === Number(surahId)) : undefined;
  const ayah = Number(ayahNum);

  const [loading, setLoading] = useState(!isEngineReady());
  const [progressTitle, setProgressTitle] = useState("");
  const [progressPct, setProgressPct] = useState(0);
  const [data, setData] = useState<AyahDetail | null>(null);
  const [famous, setFamous] = useState<PhraseMatch[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const onProgress = useCallback((t: string, _s: string, p: number) => {
    setProgressTitle(t);
    setProgressPct(p);
  }, []);

  useEffect(() => {
    if (!surah || !ayah) return;
    let cancelled = false;

    (async () => {
      if (!isEngineReady()) {
        setLoading(true);
        await ensureEngine(onProgress);
        if (cancelled) return;
      }
      const d = findAyah(surah.id, ayah);
      const f = famousSurah(surah.id);
      if (!cancelled) {
        setData(d);
        setFamous(f);
        setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [surah, ayah, onProgress]);

  const toggle = (id: string) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }));

  if (!surah) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <p style={{ color: "var(--text-2)" }}>الصفحة غير موجودة</p>
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
          <button onClick={() => navigate(`/mutashabihat/${slug}`)} className="flex items-center gap-2 group">
            <img src={logoImg} alt="رجوع" className="w-9 h-9 rounded-full object-cover" />
            <ArrowRight className="w-4 h-4 opacity-50 group-hover:opacity-100 transition-opacity" style={{ color: "var(--text-2)" }} />
          </button>
          <ThemeToggle />
        </div>

        {/* Breadcrumb */}
        <div className="px-4 max-w-4xl mx-auto w-full mt-4 flex items-center gap-2 text-xs flex-wrap" style={{ color: "var(--text-2)" }}>
          <button onClick={() => navigate("/mutashabihat")} className="hover:underline" style={{ color: "var(--dot-active)" }}>
            متشابهات القرآن
          </button>
          <span>/</span>
          <button onClick={() => navigate(`/mutashabihat/${slug}`)} className="hover:underline" style={{ color: "var(--dot-active)" }}>
            سورة {surah.name}
          </button>
          <span>/</span>
          <span>الآية {ayah}</span>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "var(--dot-active)" }} />
            <p className="text-base font-bold font-quran" style={{ color: "var(--dot-active)" }}>{progressTitle}</p>
            <div className="w-60 h-1.5 mx-auto mt-3 rounded-full overflow-hidden" style={{ background: "var(--glass-thin-border)" }}>
              <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progressPct}%`, background: "var(--dot-active)" }} />
            </div>
          </div>
        ) : data ? (
          <section className="px-4 max-w-4xl mx-auto w-full pb-16">
            {/* Page title */}
            <h1
              className="text-xl sm:text-2xl font-bold text-center mt-4 mb-4"
              style={{ fontFamily: "'Amiri', serif", color: "var(--dot-active)", lineHeight: 1.8 }}
            >
              آياتٌ مُشابِهةٌ للآيةِ {ayah} من سورة {surah.name}
            </h1>

            {/* Verse card */}
            <div className="glass-card-themed rounded-2xl p-5 sm:p-7 mb-6">
              <p className="font-quran text-xl sm:text-2xl leading-[2.4] text-right" style={{ color: "var(--text-0)" }}>
                {data.text}
              </p>
              <p className="text-xs mt-3" style={{ color: "var(--text-2)" }}>
                سورة {surah.name} — الآية {ayah}
              </p>
            </div>

            {/* Type pills */}
            <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
              <Pill color="#2E8B57" label="فواتح الآيات" count={data.begins.length} />
              <Pill color="#7B52B9" label="خواتم الآيات" count={data.ends.length} />
              <Pill color="#C47A0A" label="العبارات المشتركة" count={data.phrases.length} />
            </div>

            {/* Sections */}
            <SectionBlock
              title="فواتح الآيات"
              desc="تشترك هذه الآيات في افتتاحيتها بالكلمات ذاتها"
              color="#2E8B57"
              items={data.begins}
              expanded={expanded}
              toggle={toggle}
              prefix="b"
            />
            <SectionBlock
              title="خواتم الآيات"
              desc="تشترك هذه الآيات في خاتمتها بالكلمات ذاتها"
              color="#7B52B9"
              items={data.ends}
              expanded={expanded}
              toggle={toggle}
              prefix="e"
            />
            <SectionBlock
              title="العبارات المشتركة"
              desc="تشترك هذه الآيات في عبارة واحدة تتكرر فيها"
              color="#C47A0A"
              items={data.phrases}
              expanded={expanded}
              toggle={toggle}
              prefix="p"
            />

            {/* Famous */}
            {famous.length > 0 && (
              <SectionBlock
                title={`أشهر المتشابهات في سورة ${surah.name}`}
                desc="أكثر العبارات تكراراً (٣ كلمات فأكثر)"
                color="#1B8A8A"
                items={famous}
                expanded={expanded}
                toggle={toggle}
                prefix="f"
              />
            )}
          </section>
        ) : (
          <div className="text-center py-20">
            <p className="font-quran" style={{ color: "var(--text-2)" }}>لا توجد بيانات</p>
          </div>
        )}
      </div>
    </div>
  );
}

function Pill({ color, label, count }: { color: string; label: string; count: number }) {
  return (
    <span
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
      style={{
        background: `${color}15`,
        color,
        border: `1px solid ${color}40`,
      }}
    >
      <span className="w-2 h-2 rounded-full" style={{ background: color }} />
      {label}
      <span
        className="px-1.5 py-0.5 rounded text-[10px]"
        style={{ background: color, color: "#fff" }}
      >
        {count}
      </span>
    </span>
  );
}

function SectionBlock({
  title, desc, color, items, expanded, toggle, prefix,
}: {
  title: string;
  desc: string;
  color: string;
  items: PhraseMatch[];
  expanded: Record<string, boolean>;
  toggle: (id: string) => void;
  prefix: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="glass-card-themed rounded-2xl overflow-hidden mb-4">
      {/* Header */}
      <div className="px-5 py-3 flex justify-between items-start" style={{ borderBottom: "1px solid var(--glass-thin-border)" }}>
        <div>
          <div className="flex items-center gap-2 text-sm font-bold" style={{ color }}>
            <span className="w-2 h-2 rounded-full" style={{ background: color }} />
            {title}
            <span className="px-2 py-0.5 rounded text-[11px]" style={{ background: `${color}18`, color }}>{items.length}</span>
          </div>
          <p className="text-xs mt-1" style={{ color: "var(--text-2)" }}>{desc}</p>
        </div>
        <span className="text-xl font-bold" style={{ color: "var(--text-2)" }}>{items.length}</span>
      </div>

      {/* Rows */}
      {items.map((item, i) => {
        const id = `${prefix}${i}`;
        const isOpen = !!expanded[id];
        const label = item.kind === "b"
          ? `آيات تبدأ بـ «${item.pt}»`
          : item.kind === "e"
          ? `آيات تنتهي بـ «${item.pt}»`
          : `آيات تحتوي على «${item.pt}»`;

        return (
          <div key={id} style={{ borderBottom: "1px solid var(--glass-thin-border)" }}>
            {/* Row header */}
            <button
              onClick={() => toggle(id)}
              className="w-full flex items-center justify-between px-5 py-3 gap-3 transition-colors hover:opacity-80"
            >
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-xs font-bold flex-shrink-0"
                  style={{ background: `${color}18`, color }}
                >
                  {item.n}
                </span>
                <span className="text-xs truncate" style={{ color: "var(--text-2)" }}>
                  {label}
                </span>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs" style={{ color: "var(--text-2)" }}>
                  {item.oth.length} {item.oth.length === 1 ? "آية" : "آيات"}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  style={{ color: "var(--text-2)" }}
                />
              </div>
            </button>

            {/* Expanded content */}
            {isOpen && (
              <div style={{ background: "var(--glass-thin-bg)", borderTop: "1px solid var(--glass-thin-border)" }}>
                {item.oth.map((v, vi2) => {
                  const hl = highlightPhrase(v.t, item.pc);
                  return (
                    <div
                      key={vi2}
                      className="px-5 py-3 flex justify-between items-start gap-3"
                      style={{ borderBottom: vi2 < item.oth.length - 1 ? "1px solid var(--glass-thin-border)" : "none" }}
                    >
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                          style={{ background: "var(--highlight-bg)", color: "var(--dot-active)" }}
                        >
                          {v.nm}
                        </span>
                        <span className="text-[11px]" style={{ color: "var(--text-2)" }}>
                          آية {v.a}
                        </span>
                      </div>
                      <p className="font-quran text-base sm:text-lg leading-[2] flex-1 text-right" style={{ color: "var(--text-1)" }}>
                        {hl.before && <span>{hl.before} </span>}
                        {hl.match && (
                          <span className="px-1 rounded" style={{ background: `${color}20`, color }}>
                            {hl.match}
                          </span>
                        )}
                        {hl.after && <span> {hl.after}</span>}
                        {!hl.match && hl.before}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
