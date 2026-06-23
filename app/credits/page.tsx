'use client';

import { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { LEADERBOARD, REDEMPTION_OPTIONS } from '@/lib/mockData';
import UserAvatar from '@/components/UserAvatar';
import { Award, Clock, Gift, Shield, Sparkles, Star, Tag, Trophy, TrendingDown, TrendingUp, Zap } from 'lucide-react';

const redeemIcons: Record<string, React.ElementType> = {
  tag: Tag,
  zap: Zap,
  gift: Gift,
  star: Star,
  award: Award,
};

const creditRules = [
  { amount: '+15', reason: 'Lending an item', icon: Star, color: 'text-emerald-600' },
  { amount: '+10', reason: 'Item returned on time', icon: Clock, color: 'text-emerald-600' },
  { amount: '+20', reason: 'Helping urgent request', icon: Zap, color: 'text-emerald-600' },
  { amount: '+10', reason: 'Reporting a found item', icon: Gift, color: 'text-emerald-600' },
  { amount: '-10', reason: 'Late return', icon: TrendingDown, color: 'text-red-500' },
];

const badgeIcons: Record<string, React.ElementType> = {
  star: Star,
  shield: Shield,
  heart: Gift,
  search: Award,
  award: Trophy,
  clock: Clock,
};

export default function CreditsPage() {
  const { currentUser, creditHistory, addCredits, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'leaderboard' | 'redeem'>('overview');
  const myRank = LEADERBOARD.findIndex((u) => u.id === currentUser.id) + 1 || 4;

  const handleRedeem = (option: typeof REDEMPTION_OPTIONS[0]) => {
    if (currentUser.credits < option.cost) {
      showToast(`Not enough credits. You need ${option.cost - currentUser.credits} more.`, 'error');
      return;
    }
    addCredits(-option.cost, `Redeemed: ${option.name}`);
    showToast(`Redeemed: ${option.name}. Check with your teacher to collect.`, 'success');
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6 p-5 sm:p-8">
      <section className="relative overflow-hidden rounded-3xl bg-stone-950 p-6 text-white shadow-2xl shadow-stone-950/20 sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(251,191,36,0.26),transparent_34%),radial-gradient(circle_at_82%_0%,rgba(16,185,129,0.16),transparent_30%)]" />
        <div className="relative grid gap-6 lg:grid-cols-[1.25fr_0.9fr] lg:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-100/20 bg-white/[0.08] px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100">
              <Sparkles className="h-3.5 w-3.5" />
              Trust economy
            </div>
            <h1 className="max-w-2xl text-4xl font-extrabold sm:text-5xl">Credits should feel earned, not random.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">BorrowBoard rewards the habits schools actually care about: returning early, helping urgent requests, and getting lost items home.</p>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4"><Star className="mb-2 h-5 w-5 text-amber-200" /><p className="text-3xl font-black">{currentUser.credits}</p><p className="text-xs font-bold uppercase text-stone-400">Credits</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4"><Shield className="mb-2 h-5 w-5 text-emerald-200" /><p className="text-3xl font-black">{currentUser.trustScore}</p><p className="text-xs font-bold uppercase text-stone-400">Trust</p></div>
            <div className="rounded-2xl border border-white/10 bg-white/[0.08] p-4"><Trophy className="mb-2 h-5 w-5 text-amber-200" /><p className="text-3xl font-black">#{myRank}</p><p className="text-xs font-bold uppercase text-stone-400">Rank</p></div>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-2 rounded-2xl border border-stone-950/10 bg-white/75 p-1 shadow-sm w-fit">
        {(['overview', 'history', 'leaderboard', 'redeem'] as const).map((tab) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-4 py-2 text-sm font-bold capitalize transition-colors cursor-pointer ${activeTab === tab ? 'bg-stone-950 text-white' : 'text-stone-500 hover:bg-stone-100 hover:text-stone-900'}`}>
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
          <div className="rounded-3xl border border-stone-950/10 bg-white/85 p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-extrabold text-slate-950">Your badges</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {currentUser.badges.map((badge) => {
                const Icon = badgeIcons[badge.icon] || Award;
                return (
                  <div key={badge.id} className={`rounded-2xl border p-4 ${badge.earned ? 'border-stone-100 bg-white' : 'border-dashed border-stone-200 bg-stone-50 opacity-60'}`}>
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-2xl bg-amber-100 text-amber-800"><Icon className="h-5 w-5" /></div>
                    <p className="text-sm font-extrabold text-slate-950">{badge.name}</p>
                    <p className="mt-1 text-xs leading-5 text-stone-500">{badge.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-3xl border border-stone-950/10 bg-white/85 p-5 shadow-sm">
            <h2 className="mb-4 text-lg font-extrabold text-slate-950">How credits work</h2>
            <div className="space-y-2">
              {creditRules.map(({ amount, reason, icon: Icon, color }) => (
                <div key={reason} className="flex items-center gap-3 rounded-2xl bg-stone-50 px-3 py-3">
                  <Icon className={`h-4 w-4 shrink-0 ${color}`} />
                  <span className="flex-1 text-sm font-medium text-stone-700">{reason}</span>
                  <span className={`text-sm font-black ${amount.startsWith('+') ? 'text-emerald-600' : 'text-red-500'}`}>{amount}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="rounded-3xl border border-stone-950/10 bg-white/85 p-5 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold text-slate-950">Credit history</h2>
          {creditHistory.length === 0 ? (
            <p className="py-8 text-center text-sm text-stone-400">No credit history yet.</p>
          ) : (
            <div className="space-y-2">
              {creditHistory.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 rounded-2xl bg-stone-50 px-3 py-3">
                  <div className={`flex h-9 w-9 items-center justify-center rounded-2xl ${entry.type === 'earned' ? 'bg-emerald-100' : 'bg-red-100'}`}>
                    {entry.type === 'earned' ? <TrendingUp className="h-4 w-4 text-emerald-600" /> : <TrendingDown className="h-4 w-4 text-red-500" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-slate-950">{entry.reason}</p>
                    <p className="text-xs text-stone-400">{new Date(entry.timestamp).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-black ${entry.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{entry.amount > 0 ? '+' : ''}{entry.amount}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'leaderboard' && (
        <div className="rounded-3xl border border-stone-950/10 bg-white/85 p-5 shadow-sm">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-extrabold text-slate-950"><Trophy className="h-5 w-5 text-amber-500" /> Credits leaderboard</h2>
          <div className="grid gap-3 md:grid-cols-2">
            {LEADERBOARD.map((user) => (
              <div key={user.id} className={`flex items-center gap-3 rounded-2xl p-3 ${user.id === currentUser.id ? 'border border-amber-200 bg-amber-50' : 'bg-stone-50'}`}>
                <span className="flex h-8 w-8 items-center justify-center rounded-2xl bg-stone-950 text-xs font-black text-white">{user.rank}</span>
                <UserAvatar avatar={user.avatar} name={user.name} className="h-9 w-9 bg-white ring-1 ring-stone-100" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-950">{user.name} {user.id === currentUser.id && <span className="text-xs text-amber-700">(you)</span>}</p>
                  <p className="text-xs text-stone-500">Grade {user.grade} - Trust {user.trustScore}</p>
                </div>
                <div className="text-right"><p className="text-sm font-black text-slate-950">{user.credits}</p><p className="text-xs text-stone-400">credits</p></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'redeem' && (
        <div className="grid gap-4 sm:grid-cols-2">
          {REDEMPTION_OPTIONS.map((option) => {
            const Icon = redeemIcons[option.icon] || Star;
            const canAfford = currentUser.credits >= option.cost;
            return (
              <div key={option.id} className={`rounded-3xl border bg-white/85 p-5 shadow-sm ${canAfford ? 'border-stone-100' : 'border-stone-100 opacity-60'}`}>
                <div className="mb-4 flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-100 text-amber-800"><Icon className="h-5 w-5" /></div>
                  <div><h3 className="text-sm font-extrabold text-slate-950">{option.name}</h3><p className="mt-1 text-xs leading-5 text-stone-500">{option.description}</p></div>
                </div>
                <button onClick={() => handleRedeem(option)} disabled={!canAfford} className={`w-full rounded-xl py-2.5 text-sm font-bold transition-colors cursor-pointer disabled:cursor-not-allowed ${canAfford ? 'bg-stone-950 text-white hover:bg-amber-700' : 'bg-stone-100 text-stone-400'}`}>
                  Redeem - {option.cost} credits
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
