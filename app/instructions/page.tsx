"use client";
import React from "react";
import { useI18n } from "@/components/i18n";

export default function InstructionsPage() {
  const { lang } = useI18n();
  const isEs = lang === "es";
  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <h1 className="text-2xl font-semibold">{isEs ? "Instrucciones" : "Instructions"}</h1>
      {isEs ? (
        <ol className="list-decimal pl-5 space-y-3 text-sm">
          <li>Sube un archivo PNG usando el selector de archivos o arrástralo al área punteada.</li>
          <li>Opcionalmente activa Eliminar fondo, Solo líneas o Solo contornos. Ajusta el deslizador de umbral para la sensibilidad.</li>
          <li>Usa las Opciones avanzadas para afinar la vectorización (número de colores, omisión de trazos, resoluciones LT/QT).</li>
          <li>Pulsa Convertir para generar la vista previa del SVG.</li>
          <li>Descarga el resultado con el botón Descargar SVG.</li>
        </ol>
      ) : (
        <ol className="list-decimal pl-5 space-y-3 text-sm">
          <li>Upload a PNG file using the file input or by dragging and dropping into the dashed area.</li>
          <li>Optionally enable Remove background, Lines only, or Contours only. Adjust the threshold slider for sensitivity.</li>
          <li>Use Advanced options to fine-tune vectorization (number of colors, path omit, LT/QT res).</li>
          <li>Click Convert to generate the SVG preview.</li>
          <li>Download the result with the Download SVG button.</li>
        </ol>
      )}
      <p className="text-sm text-muted-foreground">
        {isEs
          ? "Todo el procesamiento ocurre localmente en tu navegador. No se suben imágenes a ningún servidor."
          : "All processing happens locally in your browser. No images are uploaded to a server."}
      </p>
    </div>
  );
}

