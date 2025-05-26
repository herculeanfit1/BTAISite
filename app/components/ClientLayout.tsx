"use client";

import { ReactNode, useEffect, useState } from "react";
import { ThemeProvider } from "next-themes";
import { NavBar } from "./NavBar";
import { Footer } from "./Footer";
import { CookieConsent } from "./CookieConsent";

interface ClientLayoutProps {
  children: ReactNode;
  locale: string;
}

export default function ClientLayout({ children, locale }: ClientLayoutProps) {
  const [isMounted, setIsMounted] = useState(false);

  // Use effect for hydration safety
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Provide a simpler structure during initial render to avoid hydration issues
  if (!isMounted) {
    return (
      <div className="flex min-h-screen flex-col">
        <header className="h-20"></header>
        <main className="flex-grow">{children}</main>
        <footer></footer>
      </div>
    );
  }

  // Full rendering after hydration is complete
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {/* Main layout structure with locale for language handling */}
      <NavBar locale={locale} />
      <main className="flex-grow">{children}</main>
      <Footer />
      <CookieConsent />
    </ThemeProvider>
  );
}
