"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  Calendar,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu,
  Play,
  Plus,
  Search,
  UserRound,
  ShoppingBag,
  Star,
  X,
} from "lucide-react";
import { useApp } from "@/app/context/AppContext";
import AnimatedShaderBackground from "@/components/ui/animated-shader-background";
import UserAvatar from "@/components/UserAvatar";
import { createClient } from "@/utils/supabase/client";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/borrow", label: "Borrow", icon: ShoppingBag },
  { href: "/request", label: "Request", icon: ClipboardList },
  { href: "/list-item", label: "List Item", icon: Plus },
  { href: "/lost-found", label: "Lost & Found", icon: Search },
  { href: "/credits", label: "Credits", icon: Star },
  { href: "/profile", label: "Profile", icon: UserRound },
  { href: "/schedule", label: "Schedule", icon: Calendar },
  { href: "/demo", label: "Demo Mode", icon: Play },
];

export default function Navigation() {
  const pathname = usePathname();
  const router = useRouter();
  const { currentUser } = useApp();
  const [mobileOpen, setMobileOpen] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const isActive = (href: string) => pathname === href;

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setMobileOpen(false);
    router.replace("/auth");
  };

  const NavLink = ({
    href,
    label,
    icon: Icon,
    onClick,
  }: {
    href: string;
    label: string;
    icon: React.ElementType;
    onClick?: () => void;
  }) => {
    const active = isActive(href);

    return (
      <Link
        href={href}
        onClick={onClick}
        className={`group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-300 ${
          active
            ? "bg-white/[0.14] text-amber-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_12px_30px_rgba(245,158,11,0.12)]"
            : "text-stone-300/80 hover:bg-white/[0.08] hover:text-white"
        }`}
      >
        <Icon
          className={`h-4 w-4 shrink-0 transition-colors ${
            active ? "text-amber-300" : "text-stone-500 group-hover:text-amber-200"
          }`}
        />
        <span>{label}</span>
        {active && <div className="ml-auto h-4 w-1 rounded-full bg-amber-300 shadow-[0_0_18px_rgba(251,191,36,0.8)]" />}
      </Link>
    );
  };

  const SidebarContent = ({ onNav }: { onNav?: () => void }) => (
    <>
      <div className="relative border-b border-white/10 px-4 py-5">
        <Link href="/dashboard" onClick={onNav} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-950 shadow-lg shadow-amber-500/20 ring-1 ring-amber-100/20">
            <img src="/borrowboard-logo.png" alt="" className="h-full w-full object-cover" />
          </div>
          <div>
            <span className="text-sm font-semibold tracking-tight text-white">BorrowBoard</span>
            <p className="mt-0.5 text-xs leading-none text-amber-100/55">School Network</p>
          </div>
        </Link>
      </div>

      <nav className="relative flex-1 space-y-1 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-amber-100/35">Menu</p>
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} onClick={onNav} />
        ))}
      </nav>

      <div className="relative border-t border-white/10 px-3 py-4">
        <Link
          href="/profile"
          onClick={onNav}
          className="group flex items-center gap-3 rounded-lg bg-white/[0.07] px-3 py-2.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-colors hover:bg-white/[0.12]"
        >
          <UserAvatar avatar={currentUser.avatar} name={currentUser.name} className="h-8 w-8 bg-amber-50 ring-1 ring-white/20" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-gray-200">{currentUser.name}</p>
            <p className="truncate text-xs text-amber-100/45">
              Grade {currentUser.grade} / {currentUser.credits} credits
            </p>
          </div>
          <div className="h-2 w-2 shrink-0 rounded-full bg-emerald-300 shadow-[0_0_16px_rgba(110,231,183,0.75)]" title="Online" />
        </Link>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.05] px-3 py-2 text-xs font-bold uppercase tracking-wide text-stone-300 transition hover:bg-white/[0.1] hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          Sign out
        </button>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed bottom-0 left-0 top-0 z-30 hidden min-h-screen w-64 flex-col overflow-hidden border-r border-white/10 bg-[#12100d]/86 text-white shadow-2xl shadow-black/25 backdrop-blur-2xl lg:flex">
        <AnimatedShaderBackground className="absolute inset-0 opacity-65" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,16,13,0.32),rgba(18,16,13,0.76)_48%,rgba(9,9,11,0.95)),radial-gradient(circle_at_28%_0%,rgba(251,191,36,0.18),transparent_34%)]" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <SidebarContent />
        </div>
      </aside>

      <header className="fixed left-0 right-0 top-0 z-40 flex h-14 items-center gap-3 border-b border-white/20 bg-stone-950/72 px-4 shadow-lg shadow-black/15 backdrop-blur-2xl lg:hidden">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg transition-colors hover:bg-white/10"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5 text-stone-200" />
        </button>
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-stone-950 shadow-md shadow-black/20 ring-1 ring-amber-100/20">
            <img src="/borrowboard-logo.png" alt="" className="h-full w-full object-cover" />
          </div>
          <span className="text-sm font-semibold text-white">BorrowBoard</span>
        </Link>
        <div className="ml-auto">
          <UserAvatar avatar={currentUser.avatar} name={currentUser.name} className="h-8 w-8 bg-amber-50 ring-1 ring-white/20" />
        </div>
      </header>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="relative flex w-72 flex-col overflow-hidden bg-[#12100d]/92 shadow-2xl backdrop-blur-2xl">
            <AnimatedShaderBackground className="absolute inset-0 opacity-60" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(18,16,13,0.32),rgba(18,16,13,0.78)_52%,rgba(9,9,11,0.96))]" />
            <button
              onClick={() => setMobileOpen(false)}
              className="absolute right-4 top-4 z-20 flex h-8 w-8 items-center justify-center rounded-lg text-gray-300 transition-colors hover:bg-white/10 hover:text-white"
              aria-label="Close menu"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="relative z-10 flex min-h-full flex-col">
              <SidebarContent onNav={() => setMobileOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
