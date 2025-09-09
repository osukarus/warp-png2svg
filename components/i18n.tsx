"use client";

import React, { createContext, useContext, useMemo, useState } from "react";

export type Lang = "en" | "es";

const strings = {
  en: {
    title: "PNG to SVG Converter",
    dragDrop: "Drag & drop a PNG here, or choose a file below",
    pngPreview: "PNG Preview",
    options: "Options",
    removeBg: "Remove background",
    linesOnly: "Lines only",
    contoursOnly: "Contours only (no fills)",
    invertThreshold: "Invert threshold (lines-only)",
    bgSampleAverage: "Background sample: average corners",
    threshold: "Threshold sensitivity",
    strokeWidth: "Stroke width",
    strokeColor: "Stroke color",
    advOptions: "Advanced vectorization options",
    numColors: "Number of colors",
    pathOmit: "Path omit",
    ltres: "LT res",
    qtres: "QT res",
    reset: "Reset",
    convert: "Convert",
    svgOutput: "SVG Output",
    noImage: "No image selected",
    noSvg: "No SVG yet. Click Convert to generate.",
    downloadSvg: "Download SVG",
    localProcessing: "All processing happens locally in your browser. Supported input: PNG. Output: SVG.",
    error: "Error",
    invalidFile: "Please upload a PNG file (.png)",
    invalidTypeTitle: "Invalid file type",
    invalidTypeDesc: "Only PNG images are supported.",
    readErrorTitle: "Read error",
    readErrorDesc: "Could not read the PNG file.",
    noImageSelectedTitle: "No image selected",
    noImageSelectedDesc: "Please upload a PNG before converting.",
    conversionDone: "Conversion complete",
    conversionReady: "Your SVG is ready.",
    conversionErrorTitle: "Conversion error",
    headerHome: "Home",
    headerInstructions: "Instructions",
    headerLicense: "License",
    language: "Language",
    socialShare: "Share this app",
    copyLink: "Copy link",
    linkCopied: "Link copied to clipboard",
    vectorStrokeWidth: "Vector stroke width",
  },
  es: {
    title: "Conversor de PNG a SVG",
    dragDrop: "Arrastra y suelta un PNG aquí o elige un archivo abajo",
    pngPreview: "Vista previa PNG",
    options: "Opciones",
    removeBg: "Eliminar fondo",
    linesOnly: "Solo líneas",
    contoursOnly: "Solo contornos (sin rellenos)",
    invertThreshold: "Invertir umbral (solo líneas)",
    bgSampleAverage: "Muestrear fondo: media de esquinas",
    threshold: "Sensibilidad del umbral",
    strokeWidth: "Grosor del trazo",
    strokeColor: "Color del trazo",
    advOptions: "Opciones avanzadas de vectorización",
    numColors: "Número de colores",
    pathOmit: "Omisión de trazos",
    ltres: "Resolución LT",
    qtres: "Resolución QT",
    reset: "Reiniciar",
    convert: "Convertir",
    svgOutput: "Salida SVG",
    noImage: "Ninguna imagen seleccionada",
    noSvg: "Aún no hay SVG. Pulsa Convertir para generarlo.",
    downloadSvg: "Descargar SVG",
    localProcessing: "Todo el procesamiento ocurre localmente en tu navegador. Entrada: PNG. Salida: SVG.",
    error: "Error",
    invalidFile: "Por favor sube un archivo PNG (.png)",
    invalidTypeTitle: "Tipo de archivo no válido",
    invalidTypeDesc: "Solo se admiten imágenes PNG.",
    readErrorTitle: "Error de lectura",
    readErrorDesc: "No se pudo leer el archivo PNG.",
    noImageSelectedTitle: "No hay imagen seleccionada",
    noImageSelectedDesc: "Sube un PNG antes de convertir.",
    conversionDone: "Conversión completa",
    conversionReady: "Tu SVG está listo.",
    conversionErrorTitle: "Error de conversión",
    headerHome: "Inicio",
    headerInstructions: "Instrucciones",
    headerLicense: "Licencia",
    language: "Idioma",
    socialShare: "Compartir esta app",
    copyLink: "Copiar enlace",
    linkCopied: "Enlace copiado al portapapeles",
    vectorStrokeWidth: "Grosor del trazo vectorial",
  }
} as const;

const I18nContext = createContext<{ lang: Lang; setLang: (l: Lang) => void; t: (typeof strings)[Lang] } | null>(null);

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>("en");
  const t = useMemo(() => strings[lang], [lang]);
  const value = useMemo(() => ({ lang, setLang, t }), [lang, t]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}

