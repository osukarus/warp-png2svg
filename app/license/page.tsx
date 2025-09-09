"use client";
import React from "react";
import { useI18n } from "@/components/i18n";

export default function LicensePage() {
  const { lang } = useI18n();
  const isEs = lang === "es";
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{isEs ? "Licencia MIT" : "MIT License"}</h1>
      {isEs && (
        <p className="text-sm text-muted-foreground">
          Nota: El texto de la licencia MIT se presenta en inglés por ser la versión oficial.
        </p>
      )}
      <pre className="whitespace-pre-wrap text-xs p-4 bg-muted rounded-md border">
{`MIT License

Copyright (c) ${new Date().getFullYear()} PNG to SVG Converter

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
      </pre>
    </div>
  );
}

