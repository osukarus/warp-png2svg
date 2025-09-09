import React from "react";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata = {
  title: "PNG to SVG Converter",
  description: "Convert PNG images to SVG in the browser with shadcn/ui",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

