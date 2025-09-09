"use client";

import React from "react";
import { ThemeProvider } from "next-themes";
import { I18nProvider } from "@/components/i18n";
import { ToastProvider } from "@/components/ui/use-toast";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { useI18n } from "@/components/i18n";

function HeaderBar() {
  const { t } = useI18n();
  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between">
        <nav className="text-sm font-medium flex items-center gap-4">
          <a className="hover:underline" href="/">{t.headerHome}</a>
          <a className="hover:underline" href="/instructions">{t.headerInstructions}</a>
          <a className="hover:underline" href="/license">{t.headerLicense}</a>
        </nav>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <I18nProvider>
        <ToastProvider>
          <HeaderBar />
          {children}
        </ToastProvider>
      </I18nProvider>
    </ThemeProvider>
  );
}

