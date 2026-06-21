'use client';

import Link from 'next/link';
import { useApp } from '@/app/context/AppContext';
import {
  Shield, Star, MapPin, Package, Plus, Search, TrendingUp,
  Clock, CheckCircle, Inbox, DollarSign, ArrowRight, AlertCircle,
  ChevronRight
} from 'lucide-react';
import { ACTIVITY_FEED } from '@/lib/mockData';
import UserAvatar from '@/components/UserAvatar';

function TrustBar({ score }: { score: number }) {
  const color = score >= 90 ? 'bg-emerald-500' : score >= 80 ? 'bg-amber-500' : 'bg-red-400';
  return (
    <div className="w-full bg-gray-100 rounded-full h-1.5 mt-1">
      <div className={`${color} h-1.5 rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  const map: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
    return: { icon: CheckCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
    request: { icon: Inbox, bg: 'bg-blue-50', color: 'text-blue-600' },
    credit: { icon: DollarSign, bg: 'bg-amber-50', color: 'text-amber-600' },
    found: { icon: Search, bg: 'bg-purple-50', color: 'text-purple-600' },
    trust: { icon: TrendingUp, bg: 'bg-indigo-50', color: 'text-indigo-600' },
  };
  const { icon: Icon, bg, color } = map[type] || { icon: AlertCircle, bg: 'bg-gray-50', color: 'text-gray-500' };
  return (
    <div className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center shrink-0`}>
      <Icon className={`w-3.5 h-3.5 ${color}`} />
    </div>
  );
}

const urgencyBadge: Record<string, string> = {
  urgent: 'bg-red-50 text-red-600 border border-red-100',
  normal: 'bg-blue-50 text-blue-600 border border-blue-100',
  low: 'bg-gray-100 text-gray-600',
};

const statusBadge: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700',
  matched: 'bg-indigo-50 text-indigo-700',
  approved: 'bg-emerald-50 text-emerald-700',
  'checked-out': 'bg-purple-50 text-purple-700',
  returned: 'bg-gray-100 text-gray-600',
  cancelled: 'bg-red-50 text-red-600',
};

export default function DashboardPage() {
  const { currentUser, items, requests, transactions } = useApp();

  const myBorrows = transactions.filter((t) => t.borrowerId === currentUser.id && t.status === 'active');
  const myLends = transactions.filter((t) => t.lenderId === currentUser.id && t.status === 'active');
  const incomingRequests = requests.filter((r) => r.requesterId !== currentUser.id && (r.status === 'pending' || r.status === 'matched'));
  const recommendedItems = items.filter((i) => i.ownerId !== currentUser.id && i.isAvailable).slice(0, 3);

  return (
    <div className="p-5 sm:p-8 max-w-5xl mx-auto space-y-6">

      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-950">Good morning, {currentUser.name}</h1>
          <p className="text-gray-400 text-sm mt-0.5">Here&apos;s your BorrowBoard overview.</p>
        </div>
        <Link
          href="/request"
          className="hidden sm:inline-flex items-center gap-2 bg-gray-950 hover:bg-gray-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Request Item
        </Link>
      </div>

      {/* Top row: Profile + Stats */}
      <div className="grid lg:grid-cols-4 gap-4">
        {/* Profile */}
        <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <UserAvatar avatar={currentUser.avatar} name={currentUser.name} className="h-11 w-11 bg-indigo-50 ring-1 ring-gray-100" />
            <div>
              <p className="font-semibold text-gray-900">{currentUser.name}</p>
              <p className="text-xs text-gray-400">Grade {currentUser.grade}</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-gray-500 font-medium flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-blue-500" />Trust Score</span>
                <span className="font-bold text-gray-900">{currentUser.trustScore}</span>
              </div>
              <TrustBar score={currentUser.trustScore} />
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-1.5 text-xs"><Star className="w-3.5 h-3.5 text-amber-500" />Credits</span>
              <span className="font-semibold text-gray-900">{currentUser.credits}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400 flex items-center gap-1.5 text-xs"><MapPin className="w-3.5 h-3.5 text-emerald-500" />Pickup</span>
              <span className="font-medium text-gray-700 text-xs">{currentUser.pickupLocation}</span>
            </div>
          </div>

          <Link href="/credits" className="mt-5 block w-full text-center text-xs font-semibold text-indigo-600 hover:text-indigo-700 py-2 rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer">
            Badges & Rewards →
          </Link>
        </div>

        {/* Stats */}
        <div className="lg:col-span-3 grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Items Lent', value: currentUser.itemsLent, icon: Package, accent: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: 'Borrowed', value: currentUser.itemsBorrowed, icon: Inbox, accent: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Credits', value: currentUser.credits, icon: Star, accent: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'On-Time', value: currentUser.onTimeReturns, icon: Clock, accent: 'text-violet-600', bg: 'bg-violet-50' },
          ].map(({ label, value, icon: Icon, accent, bg }) => (
            <div key={label} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
              <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon className={`w-4 h-4 ${accent}`} />
              </div>
              <p className="text-2xl font-bold text-gray-950">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { href: '/list-item', label: 'List an Item', icon: Plus, color: 'hover:bg-indigo-50 hover:border-indigo-100', iconColor: 'text-indigo-600' },
            { href: '/request', label: 'Request Item', icon: Inbox, color: 'hover:bg-emerald-50 hover:border-emerald-100', iconColor: 'text-emerald-600' },
            { href: '/lost-found?tab=found', label: 'Report Found', icon: Search, color: 'hover:bg-purple-50 hover:border-purple-100', iconColor: 'text-purple-600' },
            { href: '/lost-found?tab=lost', label: 'Report Lost', icon: AlertCircle, color: 'hover:bg-amber-50 hover:border-amber-100', iconColor: 'text-amber-600' },
          ].map(({ href, label, icon: Icon, color, iconColor }) => (
            <Link key={href} href={href} className={`flex items-center gap-2.5 px-3.5 py-3 rounded-xl border border-gray-100 bg-white text-sm font-medium text-gray-700 transition-all cursor-pointer ${color}`}>
              <Icon className={`w-4 h-4 shrink-0 ${iconColor}`} />
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mid row */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Incoming requests */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Incoming Requests</h2>
            {incomingRequests.length > 0 && (
              <span className="bg-indigo-50 text-indigo-700 text-xs font-bold px-2 py-0.5 rounded-full">{incomingRequests.length}</span>
            )}
          </div>
          {incomingRequests.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-400">No active requests right now.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {incomingRequests.map((req) => (
                <div key={req.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-sm shrink-0">
                    {req.requesterName[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{req.requesterName} needs {req.itemName}</p>
                    <p className="text-xs text-gray-400">{req.day} · {req.startTime}–{req.endTime}</p>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${urgencyBadge[req.urgency]}`}>{req.urgency}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Active transactions */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900">Active Transactions</h2>
            <Link href="/transaction" className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer">View all</Link>
          </div>
          {myBorrows.length === 0 && myLends.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-400">No active transactions.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {myBorrows.map((txn) => (
                <div key={txn.id} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                  <Inbox className="w-4 h-4 text-amber-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Borrowing: {txn.itemName}</p>
                    <p className="text-xs text-gray-400">From {txn.lenderName}</p>
                  </div>
                  <Link href="/transaction" className="text-xs text-indigo-600 font-medium hover:underline cursor-pointer">Manage</Link>
                </div>
              ))}
              {myLends.map((txn) => (
                <div key={txn.id} className="flex items-center gap-3 p-3 bg-indigo-50 border border-indigo-100 rounded-xl">
                  <Package className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">Lending: {txn.itemName}</p>
                    <p className="text-xs text-gray-400">To {txn.borrowerName}</p>
                  </div>
                  <Link href="/transaction" className="text-xs text-indigo-600 font-medium hover:underline cursor-pointer">Manage</Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recommended */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-900">Recommended for You</h2>
          <Link href="/borrow" className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer flex items-center gap-1">
            Browse all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          {recommendedItems.map((item) => (
            <Link key={item.id} href="/borrow" className="group p-4 border border-gray-100 hover:border-indigo-200 hover:bg-indigo-50/40 rounded-xl transition-all cursor-pointer">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full capitalize">{item.category}</span>
                <div className="flex items-center gap-1">
                  <Shield className="w-3 h-3 text-emerald-500" />
                  <span className="text-xs text-gray-500">{item.ownerTrustScore}</span>
                </div>
              </div>
              <p className="text-sm font-semibold text-gray-900 leading-tight mb-2">{item.name}</p>
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <MapPin className="w-3 h-3" />
                <span>{item.pickupLocation}</span>
                <span className="mx-1">·</span>
                <span>{item.ownerName}</span>
              </div>
              <div className="mt-3 flex items-center gap-1 text-xs text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                Request <ChevronRight className="w-3 h-3" />
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Activity feed */}
      <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-3">
          {ACTIVITY_FEED.map((activity, i) => (
            <div key={activity.id} className={`flex items-center gap-3 ${i < ACTIVITY_FEED.length - 1 ? 'pb-3 border-b border-gray-50' : ''}`}>
              <ActivityIcon type={activity.type} />
              <p className="text-sm text-gray-700 flex-1 leading-snug">{activity.text}</p>
              <span className="text-xs text-gray-300 shrink-0">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
