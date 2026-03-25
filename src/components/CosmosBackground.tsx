import { useEffect, useRef, useState } from "react";
import lightBgImg from "@/assets/light-bg.png";

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

  if (isLight) {
    return (
      <div
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: `url(${lightBgImg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
        }}
      >
        {/* Subtle overlay to ensure readability */}
        <div className="absolute inset-0" style={{ background: "rgba(235,228,212,0.75)" }} />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-0" style={{ background: "var(--cosmos-bg)" }}>
      <div ref={starsRef} className="absolute inset-0 pointer-events-none" />
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
    </div>
  );
}
