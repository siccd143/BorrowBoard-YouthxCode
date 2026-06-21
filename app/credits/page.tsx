'use client';

import { useState } from 'react';
import { useApp } from '@/app/context/AppContext';
import { REDEMPTION_OPTIONS, LEADERBOARD } from '@/lib/mockData';
import UserAvatar from '@/components/UserAvatar';
import { Star, Shield, Trophy, Tag, Zap, Gift, Award, TrendingUp, TrendingDown, Clock } from 'lucide-react';

const redeemIcons: Record<string, React.ElementType> = {
  tag: Tag, zap: Zap, gift: Gift, star: Star, award: Award,
};

const creditRules = [
  { amount: '+15', reason: 'Lending an item', icon: Star, color: 'text-green-600' },
  { amount: '+10', reason: 'Item returned on time', icon: Clock, color: 'text-green-600' },
  { amount: '+20', reason: 'Helping urgent request', icon: Zap, color: 'text-green-600' },
  { amount: '+10', reason: 'Reporting found item', icon: Gift, color: 'text-green-600' },
  { amount: '−10', reason: 'Late return', icon: TrendingDown, color: 'text-red-500' },
];

const badgeStyles: Record<string, string> = {
  star: 'bg-yellow-100 text-yellow-600',
  shield: 'bg-blue-100 text-blue-600',
  heart: 'bg-pink-100 text-pink-600',
  search: 'bg-purple-100 text-purple-600',
  award: 'bg-orange-100 text-orange-600',
  clock: 'bg-green-100 text-green-600',
};

const badgeIcons: Record<string, React.ElementType> = {
  star: Star, shield: Shield, heart: Gift, search: Award, award: Trophy, clock: Clock,
};

export default function CreditsPage() {
  const { currentUser, creditHistory, addCredits, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'overview' | 'history' | 'leaderboard' | 'redeem'>('overview');

  const handleRedeem = (option: typeof REDEMPTION_OPTIONS[0]) => {
    if (currentUser.credits < option.cost) {
      showToast(`Not enough credits. You need ${option.cost - currentUser.credits} more.`, 'error');
      return;
    }
    addCredits(-option.cost, `Redeemed: ${option.name}`);
    showToast(`Redeemed: ${option.name}! Check with your teacher to collect.`, 'success');
  };

  const rankBadge = (rank: number) => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-700 font-bold';
    if (rank === 2) return 'bg-slate-100 text-slate-700 font-bold';
    if (rank === 3) return 'bg-orange-100 text-orange-700 font-bold';
    return 'bg-slate-50 text-slate-600';
  };

  const myRank = LEADERBOARD.findIndex((u) => u.id === currentUser.id) + 1;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Credits & Trust</h1>
        <p className="text-slate-500 text-sm mt-0.5">Earn credits by lending and returning items on time.</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl p-4 text-white">
          <Star className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-3xl font-black">{currentUser.credits}</p>
          <p className="text-sm font-medium opacity-80">Credits</p>
        </div>
        <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-4 text-white">
          <Shield className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-3xl font-black">{currentUser.trustScore}</p>
          <p className="text-sm font-medium opacity-80">Trust Score</p>
        </div>
        <div className="col-span-2 sm:col-span-1 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-4 text-white">
          <Trophy className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-3xl font-black">#{myRank}</p>
          <p className="text-sm font-medium opacity-80">Leaderboard Rank</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {(['overview', 'history', 'leaderboard', 'redeem'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors cursor-pointer capitalize ${activeTab === tab ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-5">
          {/* Badges */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4">Your Badges</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {currentUser.badges.map((badge) => {
                const Icon = badgeIcons[badge.icon] || Award;
                const style = badgeStyles[badge.icon] || 'bg-slate-100 text-slate-600';
                return (
                  <div key={badge.id} className={`flex items-start gap-3 p-3 rounded-xl border ${badge.earned ? 'border-slate-100' : 'border-dashed border-slate-200 opacity-50'}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${style}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-900">{badge.name}</p>
                      <p className="text-xs text-slate-500 leading-tight">{badge.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Credit rules */}
          <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900 mb-4">How Credits Work</h2>
            <div className="space-y-2">
              {creditRules.map(({ amount, reason, icon: Icon, color }) => (
                <div key={reason} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                  <Icon className={`w-4 h-4 shrink-0 ${color}`} />
                  <span className="text-sm text-slate-700 flex-1">{reason}</span>
                  <span className={`text-sm font-bold ${amount.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>{amount} credits</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Credit History */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4">Credit History</h2>
          {creditHistory.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-6">No credit history yet.</p>
          ) : (
            <div className="space-y-2">
              {creditHistory.map((entry) => (
                <div key={entry.id} className="flex items-center gap-3 py-2.5 border-b border-slate-50 last:border-0">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${entry.type === 'earned' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {entry.type === 'earned' ? (
                      <TrendingUp className="w-4 h-4 text-green-600" />
                    ) : (
                      <TrendingDown className="w-4 h-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{entry.reason}</p>
                    <p className="text-xs text-slate-400">{new Date(entry.timestamp).toLocaleDateString()}</p>
                  </div>
                  <span className={`text-sm font-bold shrink-0 ${entry.amount > 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {entry.amount > 0 ? '+' : ''}{entry.amount}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm">
          <h2 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-500" />
            Credits Leaderboard
          </h2>
          <div className="space-y-2">
            {LEADERBOARD.map((user) => (
              <div
                key={user.id}
                className={`flex items-center gap-3 p-3 rounded-xl ${user.id === currentUser.id ? 'bg-blue-50 border border-blue-100' : 'hover:bg-slate-50'}`}
              >
                <span className={`w-7 h-7 flex items-center justify-center rounded-full text-xs ${rankBadge(user.rank)}`}>
                  {user.rank <= 3 ? ['🥇', '🥈', '🥉'][user.rank - 1] : user.rank}
                </span>
                <UserAvatar avatar={user.avatar} name={user.name} className="h-8 w-8 bg-indigo-50 ring-1 ring-slate-100" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">
                    {user.name} {user.id === currentUser.id && <span className="text-blue-600 text-xs">(you)</span>}
                  </p>
                  <p className="text-xs text-slate-500">Grade {user.grade} · Trust {user.trustScore}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">{user.credits}</p>
                  <p className="text-xs text-slate-400">credits</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Redeem */}
      {activeTab === 'redeem' && (
        <div className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-800 font-medium">You have <strong>{currentUser.credits} credits</strong> available to redeem.</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {REDEMPTION_OPTIONS.map((option) => {
              const Icon = redeemIcons[option.icon] || Star;
              const canAfford = currentUser.credits >= option.cost;
              return (
                <div key={option.id} className={`bg-white rounded-2xl border p-4 shadow-sm ${canAfford ? 'border-slate-100' : 'border-slate-100 opacity-60'}`}>
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 text-sm">{option.name}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">{option.description}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleRedeem(option)}
                    disabled={!canAfford}
                    className={`w-full py-2 rounded-xl text-sm font-semibold transition-colors cursor-pointer ${
                      canAfford
                        ? 'bg-blue-600 hover:bg-blue-700 text-white'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    Redeem · {option.cost} credits
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
