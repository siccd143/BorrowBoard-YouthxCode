'use client';

import Link from 'next/link';
import type { ElementType } from 'react';
import { useApp } from '@/app/context/AppContext';
import {
  AlertCircle,
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle,
  ChevronRight,
  ClipboardList,
  Clock,
  DollarSign,
  Inbox,
  MapPin,
  Package,
  Plus,
  QrCode,
  Search,
  Shield,
  Star,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { ACTIVITY_FEED } from '@/lib/mockData';
import UserAvatar from '@/components/UserAvatar';
import ScrollReveal from '@/components/ScrollReveal';

const statusBadge: Record<string, string> = {
  pending: 'border-amber-200 bg-amber-50 text-amber-800',
  matched: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  approved: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  'checked-out': 'border-purple-200 bg-purple-50 text-purple-800',
  returned: 'border-stone-200 bg-stone-100 text-stone-700',
  cancelled: 'border-red-200 bg-red-50 text-red-700',
  active: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  overdue: 'border-red-200 bg-red-50 text-red-700',
};

const urgencyBadge: Record<string, string> = {
  urgent: 'border-red-200 bg-red-50 text-red-700',
  normal: 'border-blue-200 bg-blue-50 text-blue-700',
  low: 'border-stone-200 bg-stone-100 text-stone-600',
};

const activityIcon: Record<string, { icon: ElementType; bg: string; color: string }> = {
  return: { icon: CheckCircle, bg: 'bg-emerald-50', color: 'text-emerald-600' },
  request: { icon: Inbox, bg: 'bg-blue-50', color: 'text-blue-600' },
  credit: { icon: DollarSign, bg: 'bg-amber-50', color: 'text-amber-600' },
  found: { icon: Search, bg: 'bg-purple-50', color: 'text-purple-600' },
  trust: { icon: TrendingUp, bg: 'bg-indigo-50', color: 'text-indigo-600' },
};

const quickActions = [
  { href: '/request', label: 'Request item', icon: Inbox, tone: 'bg-stone-950 text-white hover:bg-amber-700' },
  { href: '/list-item', label: 'List item', icon: Plus, tone: 'bg-white text-stone-950 hover:bg-amber-50' },
  { href: '/lost-found?tab=lost', label: 'Report lost', icon: Search, tone: 'bg-white text-stone-950 hover:bg-amber-50' },
];

const trustSparkline = [38, 46, 44, 58, 61, 74, 70, 82, 88, 95];
const heroFlow = [
  { label: 'Match found', detail: 'USB-C charger / Cafeteria', icon: Zap },
  { label: 'QR ready', detail: 'Checkout confirmed', icon: QrCode },
  { label: 'Return due', detail: '1 hour remaining', icon: Clock },
];

function formatTime(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(value));
}

function ActivityIcon({ type }: { type: string }) {
  const config = activityIcon[type] || { icon: AlertCircle, bg: 'bg-stone-100', color: 'text-stone-500' };
  const Icon = config.icon;

  return (
    <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${config.bg}`}>
      <Icon className={`h-4 w-4 ${config.color}`} />
    </div>
  );
}

function StatCard({
  label,
  value,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string | number;
  icon: ElementType;
  accent: string;
}) {
  return (
    <div className="group rounded-2xl border border-stone-950/10 bg-white/75 p-4 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/10">
      <div className="mb-4 flex items-center justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${accent}`}>
          <Icon className="h-4 w-4" />
        </div>
        <ArrowRight className="h-4 w-4 text-stone-300 opacity-0 transition group-hover:translate-x-0.5 group-hover:opacity-100" />
      </div>
      <p className="text-2xl font-extrabold text-stone-950">{value}</p>
      <p className="mt-0.5 text-xs font-semibold uppercase tracking-wide text-stone-400">{label}</p>
    </div>
  );
}

export default function DashboardPage() {
  const { currentUser, items, requests, transactions } = useApp();

  const myBorrows = transactions.filter((t) => t.borrowerId === currentUser.id && t.status === 'active');
  const myLends = transactions.filter((t) => t.lenderId === currentUser.id && t.status === 'active');
  const activeHandoffs = [...myBorrows, ...myLends];
  const incomingRequests = requests.filter((r) => r.requesterId !== currentUser.id && (r.status === 'pending' || r.status === 'matched' || r.status === 'approved'));
  const needsAction = incomingRequests.filter((r) => r.status === 'matched' || r.status === 'approved');
  const recommendedItems = items
    .filter((i) => i.ownerId !== currentUser.id && i.isAvailable)
    .sort((a, b) => b.ownerTrustScore - a.ownerTrustScore)
    .slice(0, 3);

  const timeline = [
    ...activeHandoffs.map((txn) => ({
      time: formatTime(txn.dueTime),
      title: txn.borrowerId === currentUser.id ? `Return ${txn.itemName}` : `${txn.borrowerName} returns ${txn.itemName}`,
      detail: `${txn.pickupLocation} / QR handoff`,
      icon: QrCode,
      status: txn.status,
    })),
    ...incomingRequests.slice(0, 2).map((req) => ({
      time: req.startTime,
      title: `${req.requesterName} needs ${req.itemName}`,
      detail: `${req.preferredLocation} / ${req.period}`,
      icon: ClipboardList,
      status: req.status,
    })),
  ].slice(0, 4);

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-5 sm:p-8">
      <ScrollReveal>
        <section className="relative overflow-hidden rounded-3xl border border-stone-950/10 bg-[#17130f] p-6 text-white shadow-2xl shadow-stone-950/20 sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_16%_10%,rgba(251,191,36,0.24),transparent_32%),radial-gradient(circle_at_76%_4%,rgba(99,102,241,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.10),transparent_42%)]" />
          <div className="absolute inset-x-8 top-8 h-px bg-gradient-to-r from-transparent via-amber-100/35 to-transparent" />
          <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-center">
            <div>
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-100/20 bg-white/[0.07] px-3 py-1 text-xs font-bold uppercase tracking-wide text-amber-100">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_18px_rgba(110,231,183,0.8)]" />
                Live command center
              </div>
              <h1 className="max-w-4xl text-4xl font-extrabold leading-tight tracking-normal sm:text-5xl xl:text-6xl">
                Good morning, {currentUser.name}. You have {activeHandoffs.length} active handoff{activeHandoffs.length === 1 ? '' : 's'} and {needsAction.length || 1} item due today.
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300">
                Your borrowing, lending, trust score, and campus availability are synced into one view.
              </p>
              <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                {quickActions.map(({ href, label, icon: Icon, tone }) => (
                  <Link key={href} href={href} className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold shadow-sm transition duration-300 hover:-translate-y-0.5 ${tone}`}>
                    <Icon className="h-4 w-4" />
                    {label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.07] p-4 shadow-2xl shadow-black/20 backdrop-blur-2xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-amber-100/65">Today rail</p>
                  <p className="mt-1 text-lg font-extrabold text-white">Live handoff flow</p>
                </div>
                <div className="rounded-full bg-emerald-300/15 px-3 py-1 text-xs font-bold text-emerald-200">Synced</div>
              </div>

              <div className="space-y-3">
                {heroFlow.map(({ label, detail, icon: Icon }, index) => (
                  <div key={label} className="relative flex items-center gap-3 rounded-2xl border border-white/10 bg-black/18 p-3">
                    {index < heroFlow.length - 1 && <div className="absolute left-8 top-12 h-5 w-px bg-amber-100/25" />}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-stone-950">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-extrabold text-white">{label}</p>
                      <p className="truncate text-xs text-stone-400">{detail}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-amber-200/70" />
                  </div>
                ))}
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2">
                {[
                  { label: 'Handoffs', value: activeHandoffs.length, icon: CalendarClock },
                  { label: 'Action', value: needsAction.length, icon: AlertCircle },
                  { label: 'Trust', value: `${currentUser.trustScore}`, icon: Shield },
                ].map(({ label, value, icon: Icon }) => (
                  <div key={label} className="rounded-2xl bg-white/[0.08] p-3">
                    <Icon className="mb-2 h-4 w-4 text-amber-200" />
                    <p className="text-xl font-extrabold">{value}</p>
                    <p className="truncate text-[10px] font-bold uppercase text-stone-500">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </ScrollReveal>

      <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)_320px]">
        <aside className="space-y-6">
          <ScrollReveal delay={80}>
            <section className="rounded-3xl border border-stone-950/10 bg-white/75 p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <UserAvatar avatar={currentUser.avatar} name={currentUser.name} className="h-14 w-14 bg-amber-50 ring-1 ring-stone-950/10" />
                <div>
                  <p className="text-lg font-extrabold text-stone-950">{currentUser.name}</p>
                  <p className="text-xs font-medium text-stone-500">Grade {currentUser.grade} / {currentUser.pickupLocation}</p>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-stone-950 p-5 text-white">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wide text-amber-100/70">Trust score</p>
                    <p className="mt-2 text-5xl font-extrabold">{currentUser.trustScore}</p>
                  </div>
                  <BadgeCheck className="h-7 w-7 text-amber-200" />
                </div>
                <div className="mt-5 flex h-16 items-end gap-1.5">
                  {trustSparkline.map((point, index) => (
                    <div key={index} className="flex-1 rounded-t-full bg-gradient-to-t from-amber-500 to-amber-100" style={{ height: `${point}%` }} />
                  ))}
                </div>
                <p className="mt-4 rounded-xl bg-white/[0.08] px-3 py-2 text-xs font-medium text-stone-200">
                  +10 from early ruler return. Next milestone: 100 trust.
                </p>
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal delay={160}>
            <section className="grid grid-cols-2 gap-3">
              <StatCard label="Lent" value={currentUser.itemsLent} icon={Package} accent="bg-indigo-50 text-indigo-700" />
              <StatCard label="Borrowed" value={currentUser.itemsBorrowed} icon={Inbox} accent="bg-emerald-50 text-emerald-700" />
              <StatCard label="Credits" value={currentUser.credits} icon={Star} accent="bg-amber-50 text-amber-700" />
              <StatCard label="On time" value={currentUser.onTimeReturns} icon={Clock} accent="bg-purple-50 text-purple-700" />
            </section>
          </ScrollReveal>
        </aside>

        <main className="space-y-6">
          <ScrollReveal delay={120}>
            <section className="rounded-3xl border border-stone-950/10 bg-white/75 p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-amber-800">Active transactions</p>
                  <h2 className="mt-1 text-2xl font-extrabold text-stone-950">What needs to happen next</h2>
                </div>
                <Link href="/transaction" className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-amber-700">
                  Manage all <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              {activeHandoffs.length === 0 ? (
                <div className="flex items-center gap-4 rounded-2xl border border-dashed border-stone-300 bg-[#fffaf3] p-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-stone-950">No active handoffs right now.</p>
                    <p className="mt-1 text-xs leading-5 text-stone-500">You are clear until a request is accepted or a checkout starts.</p>
                  </div>
                </div>
              ) : (
                <div className="grid gap-4 lg:grid-cols-2">
                  {activeHandoffs.map((txn, index) => {
                    const borrowing = txn.borrowerId === currentUser.id;
                    return (
                      <ScrollReveal key={txn.id} delay={index * 90} className="rounded-2xl border border-stone-950/10 bg-[#fffaf3] p-5 transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-stone-900/10">
                        <div className="mb-5 flex items-start justify-between gap-4">
                          <div>
                            <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-bold ${statusBadge[txn.status]}`}>
                              {borrowing ? 'Borrowing' : 'Lending'} / Due soon
                            </span>
                            <h3 className="mt-3 text-xl font-extrabold text-stone-950">{txn.itemName}</h3>
                            <p className="mt-1 text-sm text-stone-500">{borrowing ? `From ${txn.lenderName}` : `To ${txn.borrowerName}`}</p>
                          </div>
                          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-950 text-amber-200">
                            <QrCode className="h-5 w-5" />
                          </div>
                        </div>
                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                          <div className="rounded-xl bg-white p-3">
                            <p className="text-xs font-bold uppercase text-stone-400">Due</p>
                            <p className="mt-1 font-extrabold text-stone-950">{formatTime(txn.dueTime)}</p>
                          </div>
                          <div className="rounded-xl bg-white p-3">
                            <p className="text-xs font-bold uppercase text-stone-400">Pickup</p>
                            <p className="mt-1 font-extrabold text-stone-950">{txn.pickupLocation}</p>
                          </div>
                        </div>
                        <div className="mt-5 h-2 overflow-hidden rounded-full bg-white">
                          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-emerald-400 via-amber-300 to-indigo-400" />
                        </div>
                        <p className="mt-3 text-xs font-semibold text-stone-500">QR checkout ready / return confirmation pending</p>
                      </ScrollReveal>
                    );
                  })}
                </div>
              )}
            </section>
          </ScrollReveal>

          <ScrollReveal delay={220}>
            <section className="rounded-3xl border border-stone-950/10 bg-white/75 p-5 shadow-sm sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-stone-950">Incoming requests</h2>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700">{incomingRequests.length} live</span>
              </div>
              <div className="space-y-3">
                {incomingRequests.map((req) => (
                  <div key={req.id} className="flex items-center gap-3 rounded-2xl border border-stone-950/10 bg-white p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-950 text-sm font-bold text-amber-200">
                      {req.requesterName[0]}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-stone-950">{req.requesterName} needs {req.itemName}</p>
                      <p className="truncate text-xs text-stone-500">{req.day} / {req.startTime}-{req.endTime}</p>
                    </div>
                    <span className={`rounded-full border px-2.5 py-1 text-xs font-bold ${urgencyBadge[req.urgency]}`}>{req.urgency}</span>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        </main>

        <aside className="space-y-6">
          <ScrollReveal delay={160}>
            <section className="rounded-3xl border border-stone-950/10 bg-white/75 p-5 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-wide text-amber-800">Today</p>
                  <h2 className="mt-1 text-xl font-extrabold text-stone-950">Handoff timeline</h2>
                </div>
                <CalendarClock className="h-5 w-5 text-stone-400" />
              </div>
              <div className="space-y-4">
                {timeline.map(({ time, title, detail, icon: Icon, status }, index) => (
                  <div key={`${title}-${index}`} className="relative flex gap-3">
                    {index < timeline.length - 1 && <div className="absolute left-5 top-11 h-[calc(100%+0.25rem)] w-px bg-stone-200" />}
                    <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-stone-950 text-amber-200">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1 rounded-2xl bg-[#fffaf3] p-3">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-xs font-extrabold text-stone-950">{time}</p>
                        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${statusBadge[status] || statusBadge.pending}`}>{status}</span>
                      </div>
                      <p className="mt-1 truncate text-sm font-bold text-stone-950">{title}</p>
                      <p className="truncate text-xs text-stone-500">{detail}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>

          <ScrollReveal delay={240}>
            <section className="rounded-3xl border border-stone-950/10 bg-white/75 p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-extrabold uppercase tracking-wide text-stone-950">Recent activity</h2>
                <Zap className="h-4 w-4 text-amber-600" />
              </div>
              <div className="space-y-3">
                {ACTIVITY_FEED.map((activity, index) => (
                  <div key={activity.id} className={`flex items-center gap-3 ${index < ACTIVITY_FEED.length - 1 ? 'border-b border-stone-100 pb-3' : ''}`}>
                    <ActivityIcon type={activity.type} />
                    <p className="min-w-0 flex-1 text-sm leading-snug text-stone-700">{activity.text}</p>
                    <span className="shrink-0 text-xs font-medium text-stone-400">{activity.time}</span>
                  </div>
                ))}
              </div>
            </section>
          </ScrollReveal>
        </aside>
      </div>

      <ScrollReveal delay={180}>
        <section className="rounded-3xl border border-stone-950/10 bg-white/75 p-5 shadow-sm sm:p-6">
          <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase tracking-wide text-amber-800">Smart recommendations</p>
              <h2 className="mt-1 text-3xl font-extrabold tracking-normal text-stone-950">Easiest to borrow today</h2>
            </div>
            <Link href="/borrow" className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-4 py-2.5 text-xs font-bold text-white transition hover:bg-amber-700">
              Browse all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            {recommendedItems.map((item, index) => (
              <ScrollReveal key={item.id} delay={index * 90} className="group rounded-2xl border border-stone-950/10 bg-white p-5 transition duration-300 hover:-translate-y-1 hover:border-amber-300 hover:shadow-xl hover:shadow-stone-900/10">
                <div className="flex h-full flex-col">
                  <div className="mb-5 flex items-start justify-between gap-3">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-stone-950 text-base font-extrabold text-amber-200">
                      {index + 1}
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                      <Shield className="h-3.5 w-3.5" />
                      {item.ownerTrustScore} trust
                    </span>
                  </div>
                  <div className="mb-4 flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-stone-100 px-3 py-1.5 text-xs font-bold capitalize text-stone-600">{item.category}</span>
                    <span className="rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700">Best window</span>
                  </div>
                  <h3 className="text-2xl font-extrabold leading-tight text-stone-950">{item.name}</h3>
                  <div className="mt-4 space-y-2 text-sm font-semibold text-stone-500">
                    <p>{item.availabilityLabel}</p>
                    <p className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4" />
                      <span className="truncate">{item.pickupLocation} / {item.ownerName}</span>
                    </p>
                  </div>
                  <Link href="/request" className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 py-3 text-sm font-bold text-white transition group-hover:bg-amber-700">
                    Request match <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </section>
      </ScrollReveal>
    </div>
  );
}
