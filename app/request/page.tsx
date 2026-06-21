'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/app/context/AppContext';
import { findMatches } from '@/lib/matching';
import { BorrowRequest, ItemCategory, DayOfWeek, UrgencyLevel, MatchResult } from '@/lib/types';
import {
  Shield, MapPin, Clock, Zap, CheckCircle, ArrowLeft, Send,
  Star, Calculator, Plug, FlaskConical, Package, Wrench, Camera, Dumbbell, Monitor, Paintbrush
} from 'lucide-react';
import Link from 'next/link';

const CATEGORIES: Array<{ value: ItemCategory; label: string }> = [
  { value: 'calculator', label: 'Calculator' },
  { value: 'charger', label: 'Charger' },
  { value: 'science', label: 'Science' },
  { value: 'school-supply', label: 'School Supply' },
  { value: 'robotics', label: 'Robotics' },
  { value: 'media', label: 'Media' },
  { value: 'sports', label: 'Sports' },
  { value: 'tech', label: 'Tech' },
  { value: 'art', label: 'Art' },
  { value: 'other', label: 'Other' },
];

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
const LOCATIONS = ['Library', 'Cafeteria', 'Room 210', 'STEM Lab', 'Gym', 'Hallway', 'Main Office'];
const PERIODS = ['1st Period', '2nd Period', '3rd Period', '4th Period', '5th Period', 'Lunch A', 'Lunch B', '6th Period', '7th Period', 'After School'];

const categoryIcons: Record<string, React.ElementType> = {
  calculator: Calculator, charger: Plug, science: FlaskConical,
  'school-supply': Package, robotics: Wrench, media: Camera,
  sports: Dumbbell, tech: Monitor, art: Paintbrush, other: Package,
};

function ScoreBar({ score }: { score: number }) {
  const color = score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : 'bg-blue-400';
  return (
    <div className="w-full bg-slate-100 rounded-full h-2">
      <div className={`${color} h-2 rounded-full transition-all duration-700`} style={{ width: `${score}%` }} />
    </div>
  );
}

function RequestFormContent() {
  const { items, currentUser, addRequest, addTransaction, showToast } = useApp();
  const searchParams = useSearchParams();
  const prefillCategory = searchParams.get('category') as ItemCategory || 'calculator';
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
    const results = findMatches(request, items);
    setMatches(results);
    addRequest(request);
    setStep('matches');
  };

  const handleSendRequest = (matchIdx: number) => {
    const match = matches[matchIdx];
    setSentMatchIdx(matchIdx);

    const txn = {
      id: `txn-${Date.now()}`,
      itemId: match.item.id,
      itemName: match.item.name,
      borrowerId: currentUser.id,
      borrowerName: currentUser.name,
      lenderId: match.lender.id,
      lenderName: match.lender.name,
      checkoutTime: new Date().toISOString(),
      dueTime: new Date(Date.now() + 3600000).toISOString(),
      status: 'active' as const,
      pickupLocation: match.item.pickupLocation,
    };
    addTransaction(txn);
    showToast(`Request sent to ${match.lender.name}! Waiting for approval.`, 'success');
    setStep('sent');
  };

  if (step === 'sent' && sentMatchIdx !== null) {
    const match = matches[sentMatchIdx];
    const txnId = `TXN-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto space-y-6">
        <div className="bg-white rounded-2xl border border-green-100 p-6 text-center shadow-sm">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-7 h-7 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-1">Request Sent!</h2>
          <p className="text-slate-500 text-sm mb-6">Waiting for {match.lender.name} to approve your request.</p>

          {/* Simulated QR Card */}
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-left text-white">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">BorrowBoard QR Checkout</span>
              <span className="text-xs font-mono opacity-70">{txnId}</span>
            </div>
            <h3 className="text-lg font-bold mb-1">{match.item.name}</h3>
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div>
                <p className="opacity-60 mb-0.5">Borrower</p>
                <p className="font-semibold">{currentUser.name} (Grade {currentUser.grade})</p>
              </div>
              <div>
                <p className="opacity-60 mb-0.5">Lender</p>
                <p className="font-semibold">{match.lender.name} (Grade {match.lender.grade})</p>
              </div>
              <div>
                <p className="opacity-60 mb-0.5">Pickup Location</p>
                <p className="font-semibold">{match.item.pickupLocation}</p>
              </div>
              <div>
                <p className="opacity-60 mb-0.5">Due By</p>
                <p className="font-semibold">{match.overlapEnd}</p>
              </div>
            </div>
            {/* Fake QR grid */}
            <div className="flex justify-center mb-4">
              <div className="w-24 h-24 bg-white rounded-lg p-2">
                <div className="w-full h-full grid grid-cols-7 gap-px">
                  {Array.from({ length: 49 }).map((_, i) => (
                    <div key={i} className={`rounded-sm ${Math.random() > 0.5 ? 'bg-slate-900' : 'bg-white'}`} />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex-1 bg-white/20 rounded-full text-center text-xs py-1 font-medium">Pending Approval</div>
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <Link href="/transaction" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-3 rounded-xl text-center transition-colors cursor-pointer">
              View Transaction
            </Link>
            <button onClick={() => setStep('form')} className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold py-3 rounded-xl transition-colors cursor-pointer">
              New Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'matches') {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-5">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep('form')} className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 cursor-pointer">
            <ArrowLeft className="w-4 h-4 text-slate-700" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Match Results</h1>
            <p className="text-slate-500 text-sm">{matches.length} matches found for &quot;{form.itemName}&quot;</p>
          </div>
        </div>

        {matches.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-100 p-10 text-center shadow-sm">
            <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-semibold text-slate-700 mb-1">No matches found</h3>
            <p className="text-sm text-slate-400 mb-4">No one has that item available during your time window right now.</p>
            <button onClick={() => setStep('form')} className="text-sm text-blue-600 font-medium hover:underline cursor-pointer">Adjust your request</button>
          </div>
        ) : (
          <div className="space-y-4">
            {matches.map((match, idx) => (
              <div key={match.item.id} className={`bg-white rounded-2xl border p-5 shadow-sm ${idx === 0 ? 'border-blue-200 ring-2 ring-blue-100' : 'border-slate-100'}`}>
                {idx === 0 && (
                  <div className="flex items-center gap-1.5 mb-3">
                    <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    <span className="text-xs font-bold text-blue-700">Best Match</span>
                  </div>
                )}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="font-bold text-slate-900">{match.item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-xs">{match.lender.name[0]}</div>
                      <span className="text-sm text-slate-600">{match.lender.name} · Grade {match.lender.grade}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className={`text-2xl font-black ${match.score >= 80 ? 'text-green-600' : match.score >= 60 ? 'text-yellow-600' : 'text-blue-600'}`}>{match.score}%</div>
                    <p className="text-xs text-slate-400">match score</p>
                  </div>
                </div>

                <ScoreBar score={match.score} />

                <div className="mt-3 flex flex-wrap gap-1.5">
                  {match.reasons.map((r) => (
                    <span key={r} className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {r}
                    </span>
                  ))}
                </div>

                <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400 mb-0.5">Overlap</p>
                    <p className="font-semibold text-slate-800">{match.overlapStart}–{match.overlapEnd}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400 mb-0.5">Pickup</p>
                    <p className="font-semibold text-slate-800">{match.item.pickupLocation}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400 mb-0.5">Trust Score</p>
                    <p className="font-semibold text-slate-800 flex items-center gap-1"><Shield className="w-3 h-3 text-green-500" />{match.lender.trustScore}</p>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <p className="text-slate-400 mb-0.5">Handoff</p>
                    <p className="font-semibold text-slate-800">{match.estimatedHandoff}</p>
                  </div>
                </div>

                <button
                  onClick={() => handleSendRequest(idx)}
                  className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  Send Request to {match.lender.name}
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="text-center text-xs text-slate-400 py-2">
          <Zap className="w-3 h-3 inline mr-1 text-indigo-400" />
          AI smart request matching coming soon
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Request an Item</h1>
        <p className="text-slate-500 text-sm mt-0.5">Fill in what you need and we&apos;ll find the best match.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-100 p-6 shadow-sm space-y-5">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Item Needed *</label>
            <input
              type="text"
              required
              value={form.itemName}
              onChange={(e) => setForm({ ...form, itemName: e.target.value })}
              placeholder="e.g. TI-84 Calculator"
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Category *</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as ItemCategory })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Day *</label>
            <select
              value={form.day}
              onChange={(e) => setForm({ ...form, day: e.target.value as DayOfWeek })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Start Time *</label>
            <input
              type="time"
              value={form.startTime}
              onChange={(e) => setForm({ ...form, startTime: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">End Time *</label>
            <input
              type="time"
              value={form.endTime}
              onChange={(e) => setForm({ ...form, endTime: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Class Period</label>
            <select
              value={form.period}
              onChange={(e) => setForm({ ...form, period: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Pickup Location</label>
            <select
              value={form.preferredLocation}
              onChange={(e) => setForm({ ...form, preferredLocation: e.target.value })}
              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Urgency</label>
          <div className="flex gap-2">
            {(['low', 'normal', 'urgent'] as UrgencyLevel[]).map((u) => (
              <button
                key={u}
                type="button"
                onClick={() => setForm({ ...form, urgency: u })}
                className={`flex-1 py-2 rounded-xl text-sm font-medium border transition-colors cursor-pointer capitalize ${
                  form.urgency === u
                    ? u === 'urgent' ? 'bg-red-500 text-white border-red-500'
                      : u === 'normal' ? 'bg-blue-500 text-white border-blue-500'
                      : 'bg-slate-200 text-slate-800 border-slate-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {u}
              </button>
            ))}
          </div>
          {form.urgency === 'urgent' && (
            <p className="text-xs text-red-600 mt-1.5">Urgent requests earn the lender +20 credits.</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">Additional Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any specific requirements or details..."
            rows={2}
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-xl transition-colors cursor-pointer"
        >
          <Zap className="w-4 h-4" />
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
