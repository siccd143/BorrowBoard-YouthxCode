'use client';

import { useState, useEffect, useRef } from 'react';
import {
  Play, Pause, RotateCcw, ChevronRight, CheckCircle,
  Zap, QrCode, Star, Search, Shield, Package, ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface DemoStep {
  id: number;
  title: string;
  description: string;
  detail: string;
  icon: React.ElementType;
  color: string;
  visual: React.ReactNode;
}

function StepVisual({ step }: { step: number }) {
  if (step === 0) return (
    <div className="bg-white rounded-xl border border-slate-100 p-4">
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-700 shrink-0">K</div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-900">Kevin needs a TI-84 Calculator</p>
          <p className="text-xs text-slate-500 mt-0.5">Monday · 5th Period · 11:20–11:50</p>
          <p className="text-xs text-slate-500">Cafeteria pickup preferred</p>
        </div>
        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-0.5 rounded-full shrink-0">URGENT</span>
      </div>
    </div>
  );

  if (step === 1) return (
    <div className="space-y-2">
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-bold text-blue-700 flex items-center gap-1"><Zap className="w-3 h-3" /> Matching...</span>
          <span className="text-xs text-slate-500">Rule-based engine</span>
        </div>
        <div className="space-y-1 text-xs text-slate-600">
          <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-green-500" /> Category match: calculator (+40)</div>
          <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-green-500" /> Schedule overlap Mon 11:20–11:50 (+25)</div>
          <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-green-500" /> Trust score 95/100 (+19)</div>
          <div className="flex items-center gap-1.5"><CheckCircle className="w-3 h-3 text-green-500" /> Urgency bonus (+5)</div>
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">Ayaan&apos;s TI-84 Plus CE</p>
          <p className="text-xs text-slate-500">Library · Trust 95 · Available 11:20–11:50</p>
        </div>
        <div className="bg-green-500 text-white text-sm font-black px-2.5 py-1 rounded-lg">89%</div>
      </div>
    </div>
  );

  if (step === 2) return (
    <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-3">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
        Request sent to Ayaan
      </div>
      <div className="space-y-2">
        {['Request submitted', 'Ayaan notified', 'Waiting for approval...'].map((s, i) => (
          <div key={s} className={`flex items-center gap-2 text-xs ${i < 2 ? 'text-green-700' : 'text-slate-400'}`}>
            {i < 2 ? <CheckCircle className="w-3.5 h-3.5 text-green-500" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-slate-300 border-t-blue-500 animate-spin" />}
            {s}
          </div>
        ))}
      </div>
    </div>
  );

  if (step === 3) return (
    <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl p-4 text-white text-xs">
      <div className="flex items-center justify-between mb-3">
        <span className="font-bold uppercase tracking-wider opacity-70 text-xs">BorrowBoard QR Checkout</span>
        <QrCode className="w-4 h-4 opacity-70" />
      </div>
      <p className="font-bold text-base mb-2">TI-84 Plus CE Calculator</p>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div><p className="opacity-60">Borrower</p><p className="font-semibold">Kevin (Gr.10)</p></div>
        <div><p className="opacity-60">Lender</p><p className="font-semibold">Ayaan (Gr.9)</p></div>
        <div><p className="opacity-60">Pickup</p><p className="font-semibold">Library</p></div>
        <div><p className="opacity-60">Due By</p><p className="font-semibold">11:50 AM</p></div>
      </div>
      <div className="bg-white/20 rounded-lg p-2 text-center font-semibold text-xs">✓ Checkout Confirmed</div>
    </div>
  );

  if (step === 4) return (
    <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <p className="font-bold text-green-800">Item Returned!</p>
      </div>
      <p className="text-sm text-slate-600">Kevin returned Ayaan&apos;s TI-84 at 11:48 AM — 2 minutes early.</p>
      <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-green-100">
        <Shield className="w-4 h-4 text-green-500" />
        <span className="text-xs text-slate-700">Kevin&apos;s trust score: 88 → <strong className="text-green-700">89</strong></span>
      </div>
    </div>
  );

  if (step === 5) return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 space-y-2">
      <div className="flex items-center gap-2 mb-2">
        <Star className="w-5 h-5 text-yellow-500" />
        <p className="font-bold text-slate-900">Credits Awarded</p>
      </div>
      {[
        { who: 'Ayaan', reason: 'Lent TI-84', amount: '+15' },
        { who: 'Ayaan', reason: 'Helped urgent request', amount: '+20' },
        { who: 'Kevin', reason: 'Returned on time', amount: '+10' },
      ].map((e) => (
        <div key={e.reason} className="flex items-center justify-between text-sm bg-white rounded-lg px-3 py-1.5 border border-yellow-100">
          <span className="text-slate-700">{e.who}: {e.reason}</span>
          <span className="font-bold text-green-600">{e.amount}</span>
        </div>
      ))}
    </div>
  );

  if (step === 6) return (
    <div className="space-y-2">
      <div className="bg-red-50 border border-red-200 rounded-xl p-3">
        <p className="text-xs font-bold text-red-700 mb-1">Lost: USB-C Charger</p>
        <p className="text-xs text-slate-600">Kevin reported · Last seen: Library</p>
        <p className="text-xs text-slate-400 italic">Unique detail: blue sticker on cable</p>
      </div>
      <div className="flex justify-center">
        <div className="flex items-center gap-1 text-xs text-green-700 font-semibold">
          <Zap className="w-3 h-3" /> Match found — 80% confidence
        </div>
      </div>
      <div className="bg-green-50 border border-green-200 rounded-xl p-3">
        <p className="text-xs font-bold text-green-700 mb-1">Found: USB-C Charger</p>
        <p className="text-xs text-slate-600">Maya found it · Location: Library</p>
        <p className="text-xs text-slate-500">Verification: Cable sticker detail</p>
      </div>
    </div>
  );

  return null;
}

const DEMO_STEPS: Omit<DemoStep, 'visual'>[] = [
  { id: 0, title: 'Kevin requests a TI-84', description: 'Kevin submits an urgent request for a graphing calculator during 5th period on Monday.', detail: 'Item: TI-84 Calculator · Monday 11:20–11:50 · Cafeteria · URGENT', icon: Package, color: 'bg-orange-100 text-orange-700' },
  { id: 1, title: 'App finds Ayaan\'s TI-84', description: 'The matching engine checks category, schedule overlap, trust score, and location. Ayaan scores 89%.', detail: 'Category +40 · Schedule overlap +25 · Trust +19 · Urgency +5 = 89', icon: Zap, color: 'bg-blue-100 text-blue-700' },
  { id: 2, title: 'Request sent', description: 'Kevin hits "Send Request" and Ayaan receives a notification. The system logs the pending transaction.', detail: 'Awaiting approval from Ayaan · Status: Matched', icon: ArrowRight, color: 'bg-indigo-100 text-indigo-700' },
  { id: 3, title: 'QR checkout at Library', description: 'Ayaan approves. A QR checkout card is generated. Both students confirm the handoff.', detail: 'Transaction TXN-A8K2B · Borrower: Kevin · Lender: Ayaan · Due: 11:50', icon: QrCode, color: 'bg-purple-100 text-purple-700' },
  { id: 4, title: 'Return confirmed', description: 'Kevin returns the calculator 2 minutes early. Ayaan confirms. Status updates to returned.', detail: 'Returned at 11:48 AM · On-time return · Trust score updated', icon: CheckCircle, color: 'bg-green-100 text-green-700' },
  { id: 5, title: 'Credits earned', description: 'Both students earn credits. Ayaan gets +35 for lending and helping an urgent request. Kevin gets +10 for on-time return.', detail: 'Ayaan: +35 credits · Kevin: +10 credits · Trust scores improved', icon: Star, color: 'bg-yellow-100 text-yellow-700' },
  { id: 6, title: 'Lost charger matched to found charger', description: 'Kevin\'s lost USB-C charger is automatically matched to one found by Maya in the library. 80% confidence.', detail: 'Lost: Kevin @ Library → Found: Maya @ Library · Verification required', icon: Search, color: 'bg-pink-100 text-pink-700' },
];

export default function DemoPage() {
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalSteps = DEMO_STEPS.length;

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentStep((prev) => {
          if (prev >= totalSteps - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 2800);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [isPlaying, totalSteps]);

  const handleRun = () => {
    setCurrentStep(0);
    setIsPlaying(true);
  };

  const handlePause = () => setIsPlaying(false);

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentStep(-1);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-semibold mb-3">
              <Play className="w-3 h-3" />
              Demo Mode — Hackathon Judges
            </div>
            <h1 className="text-2xl font-bold mb-1">BorrowBoard Full Flow Demo</h1>
            <p className="text-blue-100 text-sm">Watch the complete borrowing journey from request to return in 7 steps.</p>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          {currentStep === -1 ? (
            <button onClick={handleRun} className="flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer">
              <Play className="w-4 h-4" /> Run Demo
            </button>
          ) : (
            <>
              <button onClick={isPlaying ? handlePause : () => setIsPlaying(true)} className="flex items-center gap-2 bg-white text-blue-700 font-bold px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors cursor-pointer">
                {isPlaying ? <><Pause className="w-4 h-4" /> Pause</> : <><Play className="w-4 h-4" /> Resume</>}
              </button>
              <button onClick={handleReset} className="flex items-center gap-2 bg-white/20 text-white font-semibold px-4 py-2.5 rounded-xl hover:bg-white/30 transition-colors cursor-pointer">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </>
          )}
        </div>
      </div>

      {/* Progress bar */}
      {currentStep >= 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-semibold text-slate-700">Step {currentStep + 1} of {totalSteps}</span>
            <span className="text-sm text-slate-400">— {DEMO_STEPS[currentStep]?.title}</span>
            {isPlaying && <div className="ml-auto w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-700"
              style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Steps grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {DEMO_STEPS.map((step, idx) => {
          const Icon = step.icon;
          const isActive = currentStep === idx;
          const isDone = currentStep > idx;
          const isFuture = currentStep < idx;

          return (
            <button
              key={step.id}
              onClick={() => { setIsPlaying(false); setCurrentStep(idx); }}
              className={`text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                isActive
                  ? 'border-blue-300 bg-blue-50 shadow-md ring-2 ring-blue-200'
                  : isDone
                  ? 'border-green-200 bg-green-50'
                  : 'border-slate-100 bg-white hover:bg-slate-50 hover:shadow-sm'
              }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isDone ? 'bg-green-100' : isActive ? 'bg-blue-100' : step.color.split(' ')[0]}`}>
                  {isDone ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : step.color.split(' ')[1]}`} />
                  )}
                </div>
                <span className={`text-xs font-bold ${isDone ? 'text-green-600' : isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                  Step {idx + 1}
                </span>
              </div>
              <h3 className={`text-sm font-bold mb-1 ${isActive ? 'text-blue-900' : isDone ? 'text-green-900' : 'text-slate-900'}`}>
                {step.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{step.description}</p>
            </button>
          );
        })}
      </div>

      {/* Active step detail */}
      {currentStep >= 0 && (
        <div className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm">
          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold mb-3 ${DEMO_STEPS[currentStep].color}`}>
                Step {currentStep + 1} / {totalSteps}
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">{DEMO_STEPS[currentStep].title}</h2>
              <p className="text-slate-600 text-sm mb-4 leading-relaxed">{DEMO_STEPS[currentStep].description}</p>
              <div className="bg-slate-50 rounded-xl px-4 py-3 text-xs text-slate-600 font-mono leading-relaxed">
                {DEMO_STEPS[currentStep].detail}
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
                  disabled={currentStep === 0}
                  className="flex-1 py-2 text-sm font-semibold border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  ← Previous
                </button>
                <button
                  onClick={() => setCurrentStep((p) => Math.min(totalSteps - 1, p + 1))}
                  disabled={currentStep === totalSteps - 1}
                  className="flex-1 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed transition-colors"
                >
                  Next →
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-3">Live Preview</p>
              <StepVisual step={currentStep} />
            </div>
          </div>
        </div>
      )}

      {/* Quick links for judges */}
      <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
        <h2 className="font-semibold text-slate-900 mb-3">Explore the Full App</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { href: '/dashboard', label: 'Dashboard', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
            { href: '/borrow', label: 'Marketplace', color: 'bg-green-50 text-green-700 hover:bg-green-100' },
            { href: '/request', label: 'Request Item', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100' },
            { href: '/lost-found', label: 'Lost & Found', color: 'bg-orange-50 text-orange-700 hover:bg-orange-100' },
            { href: '/credits', label: 'Credits', color: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100' },
            { href: '/schedule', label: 'Schedule', color: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100' },
            { href: '/list-item', label: 'List Item', color: 'bg-pink-50 text-pink-700 hover:bg-pink-100' },
            { href: '/transaction', label: 'Transactions', color: 'bg-teal-50 text-teal-700 hover:bg-teal-100' },
          ].map(({ href, label, color }) => (
            <Link key={href} href={href} className={`flex items-center justify-center gap-1.5 text-sm font-semibold py-2.5 rounded-xl transition-colors cursor-pointer ${color}`}>
              {label} <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

