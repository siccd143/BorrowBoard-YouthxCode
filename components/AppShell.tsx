"use client";

import { usePathname } from "next/navigation";
import { AppProvider } from "@/app/context/AppContext";
import Navigation from "@/components/Navigation";
import ShaderBootScreen from "@/components/ShaderBootScreen";
import ToastContainer from "@/components/Toast";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuth = pathname === "/auth";

  return (
    <AppProvider>
      {!isAuth && <ShaderBootScreen />}
      {!isAuth && <Navigation />}
      {isAuth ? (
        children
      ) : (
        <main className="borrowboard-theme min-h-screen pt-14 lg:ml-64 lg:pt-0">
          {children}
        </main>
      )}
      <ToastContainer />
    </AppProvider>
  );
}
