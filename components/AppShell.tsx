"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AppProvider } from "@/app/context/AppContext";
import Navigation from "@/components/Navigation";
import ShaderBootScreen from "@/components/ShaderBootScreen";
import ToastContainer from "@/components/Toast";
import { createClient } from "@/utils/supabase/client";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuth = pathname === "/auth";
  const isOnboarding = pathname === "/onboarding";
  const isAuthFlow = isAuth || isOnboarding;
  const supabase = useMemo(() => createClient(), []);
  const [checkingAuth, setCheckingAuth] = useState(!isAuthFlow);

  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;

      if (!data.session && !isAuthFlow) {
        router.replace("/auth");
        return;
      }

      setCheckingAuth(false);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && !isAuthFlow) router.replace("/auth");
      if (session && isAuth) router.replace("/onboarding");
    });

    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, [isAuth, isAuthFlow, router, supabase]);

  return (
    <AppProvider>
      {checkingAuth && !isAuthFlow ? (
        <main className="flex min-h-screen items-center justify-center bg-stone-950 text-sm font-bold text-amber-100">
          Loading BorrowBoard...
        </main>
      ) : isAuthFlow ? (
        children
      ) : (
        <>
          <ShaderBootScreen />
          <Navigation />
          <main className="borrowboard-theme min-h-screen pt-14 lg:ml-64 lg:pt-0">
            {children}
          </main>
        </>
      )}
      <ToastContainer />
    </AppProvider>
  );
}
