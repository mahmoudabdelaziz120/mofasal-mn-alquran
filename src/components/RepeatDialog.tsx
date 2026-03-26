import { useState } from "react";
import { X, Plus, Minus, RefreshCw } from "lucide-react";

interface RepeatDialogProps {
  open: boolean;
  onClose: () => void;
  totalAyahs: number;
  currentAyah: number;
  onStart: (config: RepeatConfig) => void;
}

export interface RepeatConfig {
  fromAyah: number;
  toAyah: number;
  ayahRepeat: number;
  sectionRepeat: number;
}

export default function RepeatDialog({ open, onClose, totalAyahs, currentAyah, onStart }: RepeatDialogProps) {
  const [fromAyah, setFromAyah] = useState(currentAyah);
  const [toAyah, setToAyah] = useState(currentAyah);
  const [ayahRepeat, setAyahRepeat] = useState(1);
  const [sectionRepeat, setSectionRepeat] = useState(1);

  // Sync when dialog opens
  if (open && fromAyah === 0 && currentAyah > 0) {
    setFromAyah(currentAyah);
    setToAyah(currentAyah);
  }

  if (!open) return null;

  const inc = (val: number, set: (v: number) => void, max: number) => set(Math.min(val + 1, max));
  const dec = (val: number, set: (v: number) => void, min: number) => set(Math.max(val - 1, min));

  const handleStart = () => {
    onStart({ fromAyah, toAyah: Math.max(fromAyah, toAyah), ayahRepeat, sectionRepeat });
  };

  const reset = () => {
    setFromAyah(currentAyah);
    setToAyah(currentAyah);
    setAyahRepeat(1);
    setSectionRepeat(1);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      
      {/* Dialog */}
      <div
        className="relative w-[90%] max-w-[380px] rounded-2xl overflow-hidden"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--glass-thick-bg)",
          backdropFilter: "blur(40px)",
          border: "0.5px solid var(--glass-thick-border)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "0.5px solid var(--glass-thin-border)" }}>
          <button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "var(--glass-card-bg)" }}>
            <X className="w-3.5 h-3.5" style={{ color: "var(--text-2)" }} />
          </button>
          <div className="flex items-center gap-2">
            <span className="font-quran text-base font-bold" style={{ color: "var(--text-0)" }}>تكرار الآيات</span>
            <RefreshCw className="w-4 h-4 cursor-pointer" style={{ color: "var(--dot-active)" }} onClick={reset} />
          </div>
        </div>

        {/* Controls */}
        <div className="p-5 space-y-4">
          <CounterRow label="من آية" value={fromAyah} onInc={() => inc(fromAyah, setFromAyah, totalAyahs)} onDec={() => dec(fromAyah, setFromAyah, 1)} />
          <CounterRow label="إلى آية" value={toAyah} onInc={() => inc(toAyah, setToAyah, totalAyahs)} onDec={() => dec(toAyah, setToAyah, 1)} />
          <CounterRow label="تكرار الآية" value={ayahRepeat} onInc={() => inc(ayahRepeat, setAyahRepeat, 99)} onDec={() => dec(ayahRepeat, setAyahRepeat, 1)} />
          <CounterRow label="تكرار المقطع" value={sectionRepeat} onInc={() => inc(sectionRepeat, setSectionRepeat, 99)} onDec={() => dec(sectionRepeat, setSectionRepeat, 1)} />
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-5 pb-5">
          <button
            onClick={handleStart}
            className="flex-1 py-3 rounded-xl font-quran text-sm font-bold transition-all"
            style={{ background: "var(--dot-active)", color: "var(--primary-foreground, #fff)" }}
          >
            استماع
          </button>
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl font-quran text-sm transition-all"
            style={{ background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-card-border)", color: "var(--text-1)" }}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  );
}

function CounterRow({ label, value, onInc, onDec }: { label: string; value: number; onInc: () => void; onDec: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <span className="font-quran text-sm" style={{ color: "var(--text-1)" }}>{label}</span>
      <div className="flex items-center gap-0">
        <button
          onClick={onInc}
          className="w-9 h-9 rounded-l-xl flex items-center justify-center transition-colors"
          style={{ background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-card-border)" }}
        >
          <Plus className="w-3.5 h-3.5" style={{ color: "var(--text-1)" }} />
        </button>
        <div
          className="w-12 h-9 flex items-center justify-center text-sm font-bold tabular-nums"
          style={{ background: "var(--glass-thin-bg)", borderTop: "0.5px solid var(--glass-card-border)", borderBottom: "0.5px solid var(--glass-card-border)", color: "var(--text-0)" }}
        >
          {value}
        </div>
        <button
          onClick={onDec}
          className="w-9 h-9 rounded-r-xl flex items-center justify-center transition-colors"
          style={{ background: "var(--glass-card-bg)", border: "0.5px solid var(--glass-card-border)" }}
        >
          <Minus className="w-3.5 h-3.5" style={{ color: "var(--text-1)" }} />
        </button>
      </div>
    </div>
  );
}
