import { useEffect, useRef, useState } from "react";
import calligraphyBg from "@/assets/calligraphy-bg.jpg";

export default function CosmosBackground() {
  const starsRef = useRef<HTMLDivElement>(null);
  const [isLight, setIsLight] = useState(() => document.documentElement.getAttribute("data-theme") === "light");

  useEffect(() => {
    const obs = new MutationObserver(() => {
      setIsLight(document.documentElement.getAttribute("data-theme") === "light");
    });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const el = starsRef.current;
    if (!el || el.children.length > 0) return;
    for (let i = 0; i < 140; i++) {
      const star = document.createElement("div");
      const sz = Math.random() * 2 + 0.4;
      star.style.cssText = `
        position:absolute;border-radius:50%;background:white;
        width:${sz}px;height:${sz}px;
        top:${Math.random() * 100}%;left:${Math.random() * 100}%;
        --d:${2 + Math.random() * 5}s;--delay:${Math.random() * 6}s;
        --lo:${(0.06 + Math.random() * 0.14).toFixed(2)};
        --hi:${(0.4 + Math.random() * 0.5).toFixed(2)};
        animation:twinkle var(--d) ease-in-out infinite var(--delay);
      `;
      el.appendChild(star);
    }
  }, []);

  return (
    <div className="fixed inset-0 z-0">
      {/* Calligraphy background image — always present */}
      <div
        className="absolute inset-0 transition-opacity duration-700"
        style={{
          backgroundImage: `url(${calligraphyBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      />

      {isLight ? (
        <>
          {/* Light mode: warm semi-transparent overlay */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(235,228,212,0.55) 0%, rgba(227,217,197,0.50) 40%, rgba(217,204,174,0.55) 100%)",
            }}
          />
          {/* Golden glow at top */}
          <div className="absolute pointer-events-none" style={{
            width: "80%", height: 350,
            top: -100, left: "10%",
            background: "radial-gradient(ellipse at center, rgba(210, 180, 100, 0.18) 0%, transparent 65%)",
            filter: "blur(80px)",
          }} />
          {/* Sky shimmer */}
          <div className="absolute inset-0 pointer-events-none sky-shimmer" style={{
            background: "linear-gradient(180deg, rgba(220, 195, 130, 0.08) 0%, rgba(200, 170, 100, 0.03) 40%, transparent 70%)",
          }} />
        </>
      ) : (
        <>
          {/* Dark mode: dark overlay with purple tint */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg, rgba(6,13,26,0.88) 0%, rgba(10,22,40,0.85) 30%, rgba(4,8,16,0.90) 70%, rgba(0,0,5,0.92) 100%)",
            }}
          />
          {/* Stars */}
          <div ref={starsRef} className="absolute inset-0 pointer-events-none" />
          {/* Nebula glows */}
          <div
            className="absolute pointer-events-none"
            style={{
              width: 600, height: 350,
              background: "var(--neb1)",
              filter: "blur(130px)", opacity: 0.15,
              top: -100, right: -120,
              borderRadius: "50%",
              animation: "drift 22s ease-in-out infinite alternate",
            }}
          />
          <div
            className="absolute pointer-events-none"
            style={{
              width: 400, height: 400,
              background: "var(--neb2)",
              filter: "blur(110px)", opacity: 0.13,
              bottom: -120, left: -80,
              borderRadius: "50%",
              animation: "drift 28s ease-in-out infinite alternate",
            }}
          />
        </>
      )}
    </div>
  );
}
