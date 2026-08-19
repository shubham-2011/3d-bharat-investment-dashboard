"use client";

import { useState } from "react";
import StoreProvider from "@/store/StoreProvider";
import { ThemeProvider } from "@/context/ThemeContext";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

export default function AppLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <StoreProvider>
      <ThemeProvider>
        <div className="min-h-screen bg-[#fafaf9] dark:bg-[#0c0a09] text-stone-900 dark:text-stone-100 flex flex-col antialiased">
          <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

          <div className="lg:pl-[220px] flex flex-col flex-1 min-w-0">
            <Header
              mobileOpen={mobileOpen}
              onMenuToggle={() => setMobileOpen((prev) => !prev)}
            />
            <main className="flex-1 px-3 sm:px-6 py-4 lg:py-6 max-w-[1300px] w-full mx-auto space-y-5">
              {children}
            </main>
          </div>
        </div>
      </ThemeProvider>
    </StoreProvider>
  );
}
