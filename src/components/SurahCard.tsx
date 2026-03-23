import { useNavigate } from "react-router-dom";
import { SurahInfo, numToArabic } from "@/data/surahs";

interface Props {
  surah: SurahInfo;
}

export default function SurahCard({ surah }: Props) {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(`/surah/${surah.id}`)}
      className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl transition-all duration-200 text-right group"
      style={{
        background: "var(--glass-card-bg)",
        border: "0.5px solid var(--glass-card-border)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
          style={{ background: "var(--highlight-bg)", color: "var(--dot-active)" }}
        >
          {numToArabic(surah.id)}
        </div>
        <div className="min-w-0">
          <div className="font-quran text-base font-bold" style={{ color: "var(--text-0)" }}>
            {surah.name}
          </div>
          <div className="text-xs" style={{ color: "var(--text-2)" }}>
            {surah.revelationPlace === "makkah" ? "مكية" : "مدنية"} · {numToArabic(surah.versesCount)} آية
          </div>
        </div>
      </div>
      <svg className="w-4 h-4 opacity-30 group-hover:opacity-60 transition-opacity flex-shrink-0 rtl:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
      </svg>
    </button>
  );
}
