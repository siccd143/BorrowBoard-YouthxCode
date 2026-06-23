"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Camera,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Crown,
  Gift,
  MapPin,
  Play,
  Plus,
  QrCode,
  Search,
  ShieldCheck,
  Star,
  Target,
  TrendingUp,
  Zap,
} from "lucide-react";
import GradientBackground from "@/components/ui/gradient-backgrounds";
import ScrollReveal from "@/components/ScrollReveal";

const stats = [
  { value: "412", label: "shared items" },
  { value: "98%", label: "on-time returns" },
  { value: "4.8m", label: "avg match time" },
  { value: "127", label: "active students" },
];

const workflowActions = [
  { href: "/borrow", label: "Find item", icon: Search },
  { href: "/list-item", label: "List item", icon: Plus },
  { href: "/lost-found", label: "Report lost", icon: Camera },
];

const campusFeed = [
  { actor: "Kevin", action: "requested a TI-84", detail: "5th Period / Library", time: "now", icon: Search },
  { actor: "Maya", action: "found a USB-C charger", detail: "Library tables", time: "2m", icon: Camera },
  { actor: "Ayaan", action: "returned a ruler early", detail: "+10 trust credit", time: "8m", icon: CheckCircle2 },
  { actor: "Elena", action: "earned +20 credits", detail: "urgent request helped", time: "12m", icon: Gift },
];

const marketplaceItems = [
  {
    name: "TI-84 Plus CE",
    owner: "Ayaan",
    location: "Library",
    trust: 95,
    tag: "Calculator",
    image: "/ti84.png",
  },
  {
    name: "USB-C fast charger",
    owner: "Maya",
    location: "STEM Lab",
    trust: 91,
    tag: "Tech",
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80",
  },
  {
    name: "Safety goggles",
    owner: "Elena",
    location: "Room 210",
    trust: 88,
    tag: "Science",
    image: "/safetygoggles.jpg",
  },
  {
    name: "Robotics toolkit",
    owner: "Maya",
    location: "STEM Lab",
    trust: 92,
    tag: "Robotics",
    image: "/toolkit.jpg",
  },
];

const trustTimeline = [
  { title: "QR checkout", body: "Both students confirm the handoff and item condition.", icon: QrCode },
  { title: "Return confirmation", body: "The lender verifies the item came back on time.", icon: CheckCircle2 },
  { title: "Credit rewards", body: "Helpful behavior earns visible school credits.", icon: Gift },
  { title: "Trust score", body: "Reliable students become easier to match with.", icon: ShieldCheck },
];

const workflow = [
  {
    icon: Search,
    title: "Request with context",
    body: "Students choose what they need, when they need it, and where they can actually pick it up.",
  },
  {
    icon: Zap,
    title: "Ranked match list",
    body: "Availability, distance, trust, category, and urgency become a clear score instead of guesswork.",
  },
  {
    icon: QrCode,
    title: "Verified handoff",
    body: "A QR checkout card records condition, due time, and both students before the item leaves.",
  },
];

export default function LandingPage() {
  return (
    <GradientBackground className="bg-[#f7efe4] text-stone-950">
      <section className="relative isolate overflow-hidden bg-[#0f0d0a] text-white">
        <div
          className="absolute inset-0 z-0 bg-[url(https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1600&q=80)] bg-cover bg-center opacity-34"
          style={{
            maskImage: "linear-gradient(180deg, black 0%, black 70%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(180deg, black 0%, black 70%, transparent 100%)",
          }}
        />
        <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.24),transparent_32%),radial-gradient(circle_at_76%_8%,rgba(99,102,241,0.18),transparent_30%),linear-gradient(180deg,rgba(15,13,10,0.15),#0f0d0a_88%)]" />

        <div className="relative z-10 mx-auto grid min-h-[92vh] max-w-7xl gap-12 px-5 pb-14 pt-20 sm:px-8 md:pt-28 lg:grid-cols-12 lg:px-10">
          <div className="flex flex-col justify-center space-y-8 lg:col-span-7">
            <div className="hero-stable">
              <div className="hero-glass-stable inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-stone-300 transition hover:bg-white/10">
                Campus trust network
                <Star className="h-3.5 w-3.5 fill-amber-300 text-amber-300" />
              </div>
            </div>

            <h1
              className="hero-stable max-w-4xl text-5xl font-medium leading-[0.9] tracking-normal sm:text-6xl lg:text-7xl xl:text-8xl"
              style={{
                maskImage: "linear-gradient(180deg, black 0%, black 82%, transparent 100%)",
                WebkitMaskImage: "linear-gradient(180deg, black 0%, black 82%, transparent 100%)",
              }}
            >
              Borrow what you need.
              <br />
              <span className="bg-gradient-to-br from-white via-white to-[#ffcd75] bg-clip-text text-transparent">
                Return with trust.
              </span>
            </h1>

            <p className="hero-stable max-w-xl text-lg leading-8 text-stone-400">
              BorrowBoard turns last-minute school supply problems into verified campus handoffs with matching,
              trust scores, and QR checkout built in.
            </p>

            <div className="hero-stable flex flex-col gap-4 sm:flex-row">
              <Link
                href="/borrow"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 text-sm font-bold text-stone-950 transition-[transform,background-color,color] hover:scale-[1.02] hover:bg-amber-100 active:scale-[0.98]"
              >
                Start borrowing
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/demo"
                className="hero-glass-stable group inline-flex items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-8 py-4 text-sm font-bold text-white transition-colors hover:border-white/20 hover:bg-white/10"
              >
                <Play className="h-4 w-4 fill-current" />
                Watch demo
              </Link>
            </div>
          </div>

          <div className="space-y-6 lg:col-span-5 lg:mt-12">
            <div className="hero-glass-stable relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] p-8 shadow-2xl">
              <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-amber-200/10 blur-3xl" />
              <div className="relative z-10">
                <div className="mb-8 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <div className="text-3xl font-bold tracking-tight text-white">4.8m</div>
                    <div className="text-sm text-stone-400">average match time</div>
                  </div>
                </div>

                <div className="mb-8 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-stone-400">Return confidence</span>
                    <span className="font-medium text-white">98%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-stone-800/70">
                    <div className="h-full w-[98%] rounded-full bg-gradient-to-r from-white to-amber-200" />
                  </div>
                </div>

                <div className="mb-6 h-px w-full bg-white/10" />

                <div className="grid grid-cols-3 gap-3 text-center">
                  {stats.slice(0, 3).map((stat) => (
                    <div key={stat.label} className="transition-transform hover:-translate-y-1">
                      <span className="block text-xl font-bold text-white sm:text-2xl">{stat.value}</span>
                      <span className="text-[10px] font-medium uppercase tracking-wider text-stone-500 sm:text-xs">{stat.label}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-bold tracking-wide text-stone-300">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-300 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                    </span>
                    LIVE MATCHING
                  </div>
                  <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-[10px] font-bold tracking-wide text-stone-300">
                    <Crown className="h-3 w-3 text-amber-300" />
                    VERIFIED HANDOFFS
                  </div>
                </div>
              </div>
            </div>

            <div className="hero-glass-stable relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.06] py-8">
              <h3 className="mb-6 px-8 text-sm font-medium text-stone-400">Built around real school workflows</h3>
              <div
                className="relative flex overflow-hidden"
                style={{
                  maskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                  WebkitMaskImage: "linear-gradient(to right, transparent, black 20%, black 80%, transparent)",
                }}
              >
                <div className="animate-marquee flex whitespace-nowrap px-4">
                  {[...workflow, ...workflow, ...workflow].map(({ icon: Icon, title }, index) => (
                    <div key={`${title}-${index}`} className="mx-6 flex items-center gap-2 opacity-55 transition-all hover:scale-105 hover:opacity-100">
                      <Icon className="h-6 w-6 text-white" />
                      <span className="text-lg font-bold tracking-normal text-white">{title}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-stone-950/10 bg-[#14110e] px-5 py-3 text-white sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 text-xs font-bold uppercase text-stone-400">
          <span className="text-amber-200">Live campus layer</span>
          <span>Availability aware</span>
          <span>Trust scored</span>
          <span>QR verified</span>
          <span>Lost item recovery</span>
        </div>
      </section>

      <section className="bg-[#fffaf3] px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="mb-12 flex flex-col items-center gap-4 text-center">
            <div className="rounded-full border border-stone-950/10 bg-white px-4 py-2 text-xs font-bold text-stone-500">Live campus feed</div>
            <h2 className="max-w-3xl text-5xl font-semibold leading-[1.05] text-stone-950">The app should feel alive before anyone clicks.</h2>
            <p className="max-w-xl text-sm leading-7 text-stone-600">Real-time activity makes BorrowBoard feel like the school is already using it.</p>
          </ScrollReveal>

          <div className="grid min-w-0 gap-5 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.85fr)_minmax(0,1.45fr)]">
            <ScrollReveal delay={80} className="flex min-h-[560px] min-w-0 flex-col justify-between rounded-2xl border border-stone-950/10 bg-white p-8 shadow-sm">
              <div>
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-stone-950 text-amber-200">
                      <BookOpen className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-bold text-stone-950">BorrowBoard</p>
                      <p className="text-xs text-stone-500">Campus network</p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-[#f8f7f4] px-3 py-2 text-xs font-bold text-stone-500">LIVE</div>
                </div>
                <p className="text-2xl font-medium leading-tight text-stone-950">"No charger. Quiz in 12 minutes. BorrowBoard found one before the bell."</p>
                <p className="mt-6 text-lg leading-8 text-stone-500">That is the product promise: less panic, fewer awkward group chats, and a cleaner way to share what students already have.</p>
              </div>
              <div className="flex gap-1 text-stone-950">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star key={index} className="h-5 w-5 fill-current" />
                ))}
              </div>
            </ScrollReveal>

            <div className="flex min-h-[560px] min-w-0 flex-col gap-5">
              <div className="relative h-[300px] overflow-hidden rounded-2xl">
                <img src="https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=800&q=80" alt="Classroom supplies" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5">
                  <p className="text-sm font-bold text-white">Calculators, chargers, goggles</p>
                  <p className="text-xs text-white/70">Shared during real class windows</p>
                </div>
              </div>
              <ScrollReveal delay={180} className="flex flex-1 flex-col items-center justify-center rounded-2xl border border-stone-950/10 bg-white p-7 text-center shadow-sm">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-stone-950 text-amber-200 transition-transform hover:scale-110">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <p className="text-5xl font-semibold tracking-normal text-stone-950">4.8m</p>
                <p className="mt-2 text-sm font-medium text-stone-500">average match time</p>
              </ScrollReveal>
            </div>

            <div className="flex min-h-[560px] min-w-0 flex-col gap-5">
              <div className="grid min-w-0 gap-5 sm:grid-cols-2">
                {campusFeed.slice(0, 2).map(({ actor, action, detail, time, icon: Icon }, index) => (
                  <ScrollReveal key={action} delay={220 + index * 90} className="rounded-2xl border border-stone-950/10 bg-white p-6 shadow-sm">
                    <Icon className="mb-8 h-8 w-8 text-stone-950" />
                    <p className="text-4xl font-semibold tracking-normal text-stone-950">{time}</p>
                    <p className="mt-2 text-sm text-stone-500">{actor} {action}</p>
                    <p className="mt-1 text-xs font-bold uppercase text-amber-700">{detail}</p>
                  </ScrollReveal>
                ))}
              </div>

              <ScrollReveal delay={340} className="flex flex-1 flex-col justify-center gap-8 overflow-hidden rounded-2xl bg-black p-8 text-white shadow-inner-soft">
                <p className="text-2xl font-medium leading-[1.4] tracking-normal">"I returned the ruler two minutes early and the app immediately updated my trust score."</p>
                <div className="space-y-3">
                  {campusFeed.slice(2).map(({ actor, action, detail, time, icon: Icon }) => (
                    <div key={action} className="flex items-center gap-3 rounded-xl bg-white/[0.07] p-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-stone-950">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold">{actor} {action}</p>
                        <p className="truncate text-xs text-white/55">{detail}</p>
                      </div>
                      <span className="text-xs text-amber-200">{time}</span>
                    </div>
                  ))}
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#f3eadf] px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="mb-10 flex flex-col justify-between gap-5 lg:flex-row lg:items-end">
            <div>
              <p className="text-xs font-extrabold uppercase text-amber-800">Marketplace preview</p>
              <h2 className="mt-3 max-w-2xl text-4xl font-extrabold text-stone-950">Make the inventory visible, not abstract.</h2>
            </div>
            <Link href="/borrow" className="inline-flex items-center gap-2 rounded-full bg-stone-950 px-5 py-3 text-sm font-bold text-white transition hover:-translate-y-0.5">
              Browse all items <ArrowRight className="h-4 w-4" />
            </Link>
          </ScrollReveal>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {marketplaceItems.map((item, index) => (
              <ScrollReveal key={item.name} delay={index * 90} className="group overflow-hidden rounded-2xl border border-white/70 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-stone-900/10">
                <div className="relative h-52 overflow-hidden">
                  <img src={item.image} alt={item.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                  <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-bold text-stone-800 backdrop-blur">{item.tag}</div>
                </div>
                <div className="p-4">
                  <div className="mb-3 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-extrabold text-stone-950">{item.name}</h3>
                      <p className="mt-1 text-xs text-stone-500">{item.owner} / {item.location}</p>
                    </div>
                    <div className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700">{item.trust}</div>
                  </div>
                  <Link href="/request" className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-stone-950 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-amber-700">
                    Request <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#fffaf3] px-5 py-20 sm:px-8 lg:px-10">
        <div className="mx-auto max-w-7xl">
          <ScrollReveal className="mb-12 text-center">
            <p className="text-xs font-extrabold uppercase text-amber-800">Trust layer</p>
            <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold text-stone-950">Trust is a workflow, not a vague score.</h2>
          </ScrollReveal>

          <div className="grid gap-4 lg:grid-cols-4">
            {trustTimeline.map(({ title, body, icon: Icon }, index) => (
              <ScrollReveal key={title} delay={index * 100} className="relative rounded-2xl border border-stone-950/10 bg-white p-6 shadow-sm">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-stone-950 text-amber-200">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="text-4xl font-semibold text-black">0{index + 1}</span>
                </div>
                <h3 className="text-lg font-extrabold text-stone-950">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-stone-600">{body}</p>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[#14110e] px-5 py-20 text-white sm:px-8 lg:px-10">
        <ScrollReveal className="mx-auto max-w-7xl rounded-2xl border border-white/10 bg-white/[0.04] p-6 shadow-2xl shadow-black/30 backdrop-blur-xl sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[1fr_0.95fr] lg:items-center">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-200/20 bg-amber-200/10 px-3 py-1 text-xs font-bold text-amber-100">
                <ClipboardList className="h-3.5 w-3.5" />
                Choose your next move
              </div>
              <h2 className="text-3xl font-extrabold sm:text-4xl">Three ways to solve the hallway problem.</h2>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-stone-300">
                Find what you need, lend what you have, or recover what got left behind.
              </p>
            </div>
            <div className="grid gap-3">
              {workflowActions.map(({ href, label, icon: Icon }, index) => (
                <ScrollReveal key={href} delay={120 + index * 90}>
                  <Link href={href} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.06] p-4 text-sm font-bold text-stone-100 transition hover:-translate-y-0.5 hover:bg-white/[0.10]">
                    <Icon className="h-5 w-5 text-amber-200" />
                    {label}
                    <ArrowRight className="ml-auto h-4 w-4" />
                  </Link>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </section>

      <footer className="border-t border-stone-950/10 bg-[#fffaf3] px-5 py-8 sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-stone-950 shadow-md shadow-black/15 ring-1 ring-stone-950/10">
              <img src="/borrowboard-logo.png" alt="" className="h-full w-full object-cover" />
            </div>
            <span className="text-sm font-extrabold text-stone-950">BorrowBoard</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-stone-500">
            <MapPin className="h-3.5 w-3.5" />
            Built for school hallways, lunch tables, and last-minute saves.
          </div>
        </div>
      </footer>
    </GradientBackground>
  );
}
