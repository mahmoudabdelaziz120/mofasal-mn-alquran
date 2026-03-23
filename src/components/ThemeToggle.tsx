import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle() {
  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("quran_theme") || "dark";
    } catch {
      return "dark";
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "light" ? "light" : "");
    try {
      localStorage.setItem("quran_theme", theme);
    } catch {}
  }, [theme]);

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 hover:opacity-80"
      style={{
        background: "var(--glass-card-bg)",
        border: "0.5px solid var(--glass-card-border)",
      }}
      title={theme === "dark" ? "الوضع الفاتح" : "الوضع الداكن"}
    >
      {theme === "dark" ? (
        <Sun className="w-4 h-4" style={{ color: "var(--text-1)" }} />
      ) : (
        <Moon className="w-4 h-4" style={{ color: "var(--text-1)" }} />
      )}
    </button>
  );
}
