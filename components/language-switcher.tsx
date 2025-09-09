"use client";

import React from "react";
import { useI18n } from "@/components/i18n";
import Image from "next/image";

export function LanguageSwitcher() {
  const { lang, setLang } = useI18n();
  return (
    <div className="inline-flex items-center gap-2">
      <button
        aria-label="English"
        className={`h-6 w-8 rounded overflow-hidden border ${lang === 'en' ? 'ring-2 ring-ring' : ''}`}
        onClick={() => setLang('en')}
        title="English"
      >
        {/* UK/US flag approximation via emoji fallback */}
        <span className="text-base leading-none">🇬🇧</span>
      </button>
      <button
        aria-label="Español"
        className={`h-6 w-8 rounded overflow-hidden border ${lang === 'es' ? 'ring-2 ring-ring' : ''}`}
        onClick={() => setLang('es')}
        title="Español"
      >
        <span className="text-base leading-none">🇪🇸</span>
      </button>
    </div>
  );
}

