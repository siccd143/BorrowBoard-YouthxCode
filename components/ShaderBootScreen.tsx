"use client";

import { useEffect, useRef, useState } from "react";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";

export default function ShaderBootScreen() {
  const startedAt = useRef<number>(Date.now());
  const [shaderReady, setShaderReady] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (!shaderReady) return;

    const elapsed = Date.now() - startedAt.current;
    const exitDelay = Math.max(0, 1450 - elapsed);
    let hiddenTimer = 0;

    const exitTimer = window.setTimeout(() => {
      setExiting(true);
      hiddenTimer = window.setTimeout(() => setVisible(false), 560);
    }, exitDelay);

    return () => {
      window.clearTimeout(exitTimer);
      window.clearTimeout(hiddenTimer);
    };
  }, [shaderReady]);

  if (!visible) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] overflow-hidden bg-[#120f0b] text-white transition duration-500 ${
        exiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      role="status"
      aria-live="polite"
      aria-label="Loading BorrowBoard"
    >
      <AnimatedShaderBackground className="absolute inset-0 opacity-80" onReady={() => setShaderReady(true)} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(251,191,36,0.24),transparent_30%),radial-gradient(circle_at_52%_55%,rgba(99,102,241,0.16),transparent_28%),linear-gradient(180deg,rgba(18,15,11,0.18),rgba(18,15,11,0.92)_76%,#120f0b)]" />
      <div className="absolute inset-x-[18%] top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-amber-200/50 to-transparent boot-scan-line" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="relative flex w-full max-w-xs flex-col items-center rounded-3xl border border-white/12 bg-white/[0.055] px-8 py-10 shadow-2xl shadow-black/45 backdrop-blur-2xl">
          <div className="pointer-events-none absolute inset-0 rounded-3xl bg-[linear-gradient(135deg,rgba(255,255,255,0.14),transparent_42%),radial-gradient(circle_at_50%_0%,rgba(251,191,36,0.18),transparent_42%)]" />
          <div className="pointer-events-none absolute -inset-px rounded-3xl border border-amber-100/10" />

          <div className="relative mb-10 flex h-24 w-24 items-center justify-center rounded-full border border-amber-100/15 bg-stone-950/45 shadow-[0_0_55px_rgba(245,158,11,0.22)]">
            <div className="absolute inset-3 rounded-full border border-white/10" />
            <div className="spinner scale-[3.2]" aria-hidden="true">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} />
              ))}
            </div>
          </div>

          <div className="relative h-2 w-full overflow-hidden rounded-full border border-white/10 bg-black/30 shadow-inner shadow-black/30">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-amber-200 via-orange-400 to-indigo-400 shadow-[0_0_22px_rgba(251,191,36,0.75)] transition-all duration-700 boot-progress ${
                shaderReady ? "w-full" : "w-2/3"
              }`}
            />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)] opacity-40" />
          </div>
        </div>
      </div>
    </div>
  );
}
