"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpen, CheckCircle2, Sparkles } from "lucide-react";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";

const bootSteps = ["GPU shader pass", "Match engine", "Trust layer"];

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
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(251,191,36,0.22),transparent_34%),linear-gradient(180deg,rgba(18,15,11,0.22),rgba(18,15,11,0.90)_72%,#120f0b)]" />
      <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-gradient-to-r from-transparent via-amber-200/40 to-transparent boot-scan-line" />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6">
        <div className="w-full max-w-sm rounded-2xl border border-white/12 bg-white/[0.07] p-7 text-center shadow-2xl shadow-black/40 backdrop-blur-2xl">
          <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-300 via-orange-400 to-indigo-500 shadow-2xl shadow-amber-500/20">
            <BookOpen className="h-7 w-7 text-white" />
          </div>

          <div className="mb-5 flex items-center justify-center gap-3">
            <div className="spinner" aria-hidden="true">
              {Array.from({ length: 10 }).map((_, index) => (
                <div key={index} />
              ))}
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs font-bold text-amber-100">
            <Sparkles className="h-3.5 w-3.5" />
            Compiling visual system
          </div>
          <h1 className="mt-4 text-2xl font-extrabold tracking-normal text-white">BorrowBoard is warming up</h1>
          <p className="mt-3 text-sm leading-6 text-stone-300">
            Preparing shaders, glass layers, and live match surfaces before the app opens.
          </p>

          <div className="mt-6 space-y-2 text-left">
            {bootSteps.map((step, index) => (
              <div key={step} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2">
                <CheckCircle2 className={`h-4 w-4 ${shaderReady || index === 0 ? "text-emerald-300" : "text-stone-500"}`} />
                <span className="text-xs font-semibold text-stone-200">{step}</span>
                <span className="ml-auto text-[10px] font-bold uppercase text-amber-100/50">
                  {shaderReady || index === 0 ? "ready" : "sync"}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className={`h-full rounded-full bg-gradient-to-r from-amber-300 via-orange-400 to-indigo-400 transition-all duration-700 boot-progress ${
                shaderReady ? "w-full" : "w-2/3"
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
