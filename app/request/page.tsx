'use client';

import { Suspense, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { findMatches } from '@/lib/matching';
import { BorrowRequest, DayOfWeek, ItemCategory, MatchResult, UrgencyLevel } from '@/lib/types';
import {
  ArrowLeft,
  CheckCircle,
  Package,
  Send,
  Shield,
  Sparkles,
  Star,
  Zap,
} from 'lucide-react';
import Link from 'next/link';
import { CATEGORY_OPTIONS, categoryConfig, inferItemCategory } from '@/lib/categories';
import { getQrCells } from '@/lib/qrPattern';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const LOCATIONS = ['Library', 'Cafeteria', 'Room 210', 'STEM Lab', 'Gym', 'Hallway', 'Main Office'];
const PERIODS = ['1st Period', '2nd Period', '3rd Period', '4th Period', '5th Period', 'Lunch A', 'Lunch B', '6th Period', '7th Period', 'After School'];

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-emerald-500' : score >= 60 ? 'bg-amber-500' : 'bg-stone-500';
  return (
    <div className="h-2 w-full rounded-full bg-stone-100">
      <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
    </div>
  );
}

function QrGrid({ value }: { value: string }) {
  const cells = useMemo(
    () => getQrCells(value),
    [value]
  );

  return (
    <div className="mx-auto h-24 w-24 rounded-xl bg-white p-2">
      <div className="grid h-full w-full grid-cols-7 gap-px">
        {cells.map((filled, i) => (
          <div key={i} className={`rounded-[2px] ${filled ? 'bg-stone-950' : 'bg-white'}`} />
        ))}
      </div>
    </div>
  );
}

function MatchHero() {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-stone-950 p-6 text-white shadow-2xl shadow-stone-950/20 sm:p-8">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(251,191,36,0.26),transparent_34%),radial-gradient(circle_at_84%_12%,rgba(255,255,255,0.12),transparent_28%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[1.35fr_0.85fr] lg:items-end">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-100/20 bg-white/[0.08] px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100">
            <Sparkles className="h-3.5 w-3.5" />
            AI schedule matching
          </div>
          <h1 className="max-w-2xl text-4xl font-extrabold tracking-normal sm:text-5xl">Tell BorrowBoard what you need.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
            The engine scores real item availability, lender trust, campus location, urgency, and your schedule windows.
          </p>
        </div>
        <div className="grid grid-cols-3 gap-2 rounded-2xl border border-white/10 bg-white/[0.08] p-3 text-center">
          {['Schedule', 'Trust', 'Location'].map((label) => (
            <div key={label} className="rounded-xl bg-white/[0.08] px-2 py-3">
              <CheckCircle className="mx-auto mb-2 h-4 w-4 text-amber-200" />
              <p className="text-[11px] font-bold uppercase text-stone-300">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RequestFormContent() {
  const { items, users, availability, currentUser, addRequest, addTransaction, showToast } = useApp();
  const searchParams = useSearchParams();
  const prefillCategory = (searchParams.get('category') as ItemCategory) || 'calculator';
  const prefillName = searchParams.get('name') || '';

  const [step, setStep] = useState<'form' | 'matches' | 'sent'>('form');
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [sentMatchIdx, setSentMatchIdx] = useState<number | null>(null);
  const [form, setForm] = useState({
    itemName: prefillName,
    category: prefillCategory,
    day: 'Monday' as DayOfWeek,
    startTime: '11:20',
    endTime: '11:50',
    period: '5th Period',
    urgency: 'normal' as UrgencyLevel,
    preferredLocation: 'Library',
    notes: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const request: BorrowRequest = {
      id: `req-${Date.now()}`,
      requesterId: currentUser.id,
      requesterName: currentUser.name,
      itemCategory: form.category,
      itemName: form.itemName,
      day: form.day,
      startTime: form.startTime,
      endTime: form.endTime,
      period: form.period,
      urgency: form.urgency,
      preferredLocation: form.preferredLocation,
      notes: form.notes,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    setMatches(findMatches(request, items, users, availability));
    addRequest(request);
    setStep('matches');
  };

  const handleSendRequest = (matchIdx: number) => {
    const match = matches[matchIdx];
    setSentMatchIdx(matchIdx);
    addTransaction({
      id: `txn-${Date.now()}`,
      itemId: match.item.id,
      itemName: match.item.name,
      borrowerId: currentUser.id,
      borrowerName: currentUser.name,
      lenderId: match.lender.id,
      lenderName: match.lender.name,
      checkoutTime: new Date().toISOString(),
      dueTime: new Date(Date.now() + 3600000).toISOString(),
      status: 'active',
      pickupLocation: match.item.pickupLocation,
    });
    showToast(`Request sent to ${match.lender.name}. Waiting for approval.`, 'success');
    setStep('sent');
  };

  if (step === 'sent' && sentMatchIdx !== null) {
    const match = matches[sentMatchIdx];
    const txnId = `TXN-${match.item.id.slice(-4).toUpperCase()}${match.lender.id.slice(-2).toUpperCase()}`;
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-5 sm:p-8">
        <div className="rounded-3xl border border-emerald-100 bg-white/85 p-6 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
            <CheckCircle className="h-7 w-7 text-emerald-600" />
          </div>
          <h2 className="mb-1 text-xl font-extrabold text-slate-950">Request sent</h2>
          <p className="mb-6 text-sm text-stone-500">Waiting for {match.lender.name} to approve your request.</p>

          <div className="rounded-3xl bg-stone-950 p-5 text-left text-white shadow-2xl shadow-stone-950/20">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-100/80">BorrowBoard QR Checkout</span>
              <span className="font-mono text-xs text-white/60">{txnId}</span>
            </div>
            <h3 className="mb-1 text-lg font-bold">{match.item.name}</h3>
            <div className="mb-4 grid grid-cols-2 gap-3 text-xs">
              <div><p className="mb-0.5 text-white/45">Borrower</p><p className="font-semibold">{currentUser.name} (Grade {currentUser.grade})</p></div>
              <div><p className="mb-0.5 text-white/45">Lender</p><p className="font-semibold">{match.lender.name} (Grade {match.lender.grade})</p></div>
              <div><p className="mb-0.5 text-white/45">Pickup</p><p className="font-semibold">{match.item.pickupLocation}</p></div>
              <div><p className="mb-0.5 text-white/45">Due By</p><p className="font-semibold">{match.overlapEnd}</p></div>
            </div>
            <QrGrid value={`${txnId}:${match.item.id}:${currentUser.id}:${match.lender.id}`} />
            <div className="mt-4 rounded-full bg-white/15 py-1 text-center text-xs font-bold text-amber-100">Pending Approval</div>
          </div>

          <div className="mt-6 flex gap-3">
            <Link href="/transaction" className="flex-1 rounded-xl bg-stone-950 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-amber-700">
              View Transaction
            </Link>
            <button onClick={() => setStep('form')} className="flex-1 rounded-xl bg-stone-100 py-3 text-sm font-semibold text-stone-700 transition-colors hover:bg-stone-200 cursor-pointer">
              New Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'matches') {
    return (
      <div className="mx-auto max-w-4xl space-y-5 p-5 sm:p-8">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep('form')} className="flex h-9 w-9 items-center justify-center rounded-xl border border-stone-200 bg-white hover:bg-stone-50 cursor-pointer">
            <ArrowLeft className="h-4 w-4 text-stone-700" />
          </button>
          <div>
            <h1 className="text-xl font-extrabold text-slate-950">AI match results</h1>
            <p className="text-sm text-stone-500">{matches.length} schedule-aware matches found for &quot;{form.itemName}&quot;</p>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="rounded-3xl border border-stone-100 bg-white/85 p-10 text-center shadow-sm">
            <Package className="mx-auto mb-3 h-10 w-10 text-stone-300" />
            <h3 className="mb-1 font-semibold text-slate-700">No matches found</h3>
            <p className="mb-4 text-sm text-slate-400">No one has that item available during your time window right now.</p>
            <button onClick={() => setStep('form')} className="text-sm font-bold text-amber-700 hover:underline cursor-pointer">Adjust your request</button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, idx) => {
              const Icon = categoryConfig[match.item.category]?.icon || Package;
              return (
                <div key={match.item.id} className={`rounded-3xl border bg-white/85 p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-stone-950/5 ${idx === 0 ? 'border-amber-200 ring-2 ring-amber-100' : 'border-stone-100'}`}>
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-950 text-amber-100">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        {idx === 0 && (
                          <p className="mb-0.5 flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-amber-700">
                            <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                            Best Match
                          </p>
                        )}
                        <h3 className="font-extrabold text-slate-950">{match.item.name}</h3>
                        <p className="text-sm text-stone-500">{match.lender.name} - Grade {match.lender.grade}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-black ${match.score >= 80 ? 'text-emerald-600' : match.score >= 60 ? 'text-amber-600' : 'text-stone-700'}`}>{match.score}%</p>
                      <p className="text-xs text-stone-400">match score</p>
                    </div>
                  </div>

                  <ScoreBar score={match.score} />
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {match.reasons.map((reason) => (
                      <span key={reason} className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs text-amber-800">
                        <CheckCircle className="h-3 w-3" />
                        {reason}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                    <div className="rounded-xl bg-stone-50 p-2"><p className="mb-0.5 text-stone-400">Overlap</p><p className="font-semibold text-slate-800">{match.overlapStart}-{match.overlapEnd}</p></div>
                    <div className="rounded-xl bg-stone-50 p-2"><p className="mb-0.5 text-stone-400">Pickup</p><p className="font-semibold text-slate-800">{match.item.pickupLocation}</p></div>
                    <div className="rounded-xl bg-stone-50 p-2"><p className="mb-0.5 text-stone-400">Trust</p><p className="flex items-center gap-1 font-semibold text-slate-800"><Shield className="h-3 w-3 text-emerald-500" />{match.lender.trustScore}</p></div>
                    <div className="rounded-xl bg-stone-50 p-2"><p className="mb-0.5 text-stone-400">Handoff</p><p className="font-semibold text-slate-800">{match.estimatedHandoff}</p></div>
                  </div>

                  <button onClick={() => handleSendRequest(idx)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-amber-700 cursor-pointer">
                    <Send className="h-4 w-4" />
                    Send Request to {match.lender.name}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        <div className="py-2 text-center text-xs text-stone-400">
          <Zap className="mr-1 inline h-3 w-3 text-amber-500" />
          Matching uses live schedules, location, trust, urgency, and item availability
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-5 sm:p-8">
      <MatchHero />
      <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-stone-950/10 bg-white/85 p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Item Needed *</label>
            <input
              type="text"
              required
              value={form.itemName}
              onChange={(e) => {
                const nextName = e.target.value;
                const inferred = inferItemCategory(nextName);
                setForm({ ...form, itemName: nextName, category: inferred === 'other' ? form.category : inferred });
              }}
              placeholder="e.g. TI-84 Calculator"
              className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Category *</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ItemCategory })} className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              {CATEGORY_OPTIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Day *</label>
            <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value as DayOfWeek })} className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Start Time *</label>
            <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">End Time *</label>
            <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Class Period</label>
            <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-semibold text-slate-700">Pickup Location</label>
            <select value={form.preferredLocation} onChange={(e) => setForm({ ...form, preferredLocation: e.target.value })} className="w-full rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-slate-700">Urgency</label>
          <div className="flex gap-2">
            {(['low', 'normal', 'urgent'] as UrgencyLevel[]).map((urgency) => (
              <button key={urgency} type="button" onClick={() => setForm({ ...form, urgency })} className={`flex-1 rounded-xl border py-2 text-sm font-medium capitalize transition-colors cursor-pointer ${form.urgency === urgency ? urgency === 'urgent' ? 'border-red-500 bg-red-500 text-white' : urgency === 'normal' ? 'border-stone-950 bg-stone-950 text-white' : 'border-stone-300 bg-stone-200 text-stone-900' : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'}`}>
                {urgency}
              </button>
            ))}
          </div>
          {form.urgency === 'urgent' && <p className="mt-1.5 text-xs text-red-600">Urgent requests earn the lender +20 credits.</p>}
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">Additional Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Any specific requirements or details..." rows={2} className="w-full resize-none rounded-xl border border-stone-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
        </div>

        <button type="submit" className="flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 py-3 font-semibold text-white transition-colors hover:bg-amber-700 cursor-pointer">
          <Zap className="h-4 w-4" />
          Find Matches
        </button>
      </form>
    </div>
  );
}

export default function RequestPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Loading...</div>}>
      <RequestFormContent />
    </Suspense>
  );
}
