import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/app/context/AppContext";
import Navigation from "@/components/Navigation";
import ShaderBootScreen from "@/components/ShaderBootScreen";
import ToastContainer from "@/components/Toast";

export const metadata: Metadata = {
  title: "BorrowBoard - School Resource Network",
  description: "Borrow school supplies and recover lost items with BorrowBoard, the peer-to-peer resource platform for students.",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.png", type: "image/png" },
    ],
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full bg-white text-gray-900">
        <AppProvider>
          <ShaderBootScreen />
          <Navigation />
          <main className="borrowboard-theme lg:ml-64 pt-14 lg:pt-0 min-h-screen">
            {children}
          </main>
          <ToastContainer />
        </AppProvider>
      </body>
    </html>
  );
}
