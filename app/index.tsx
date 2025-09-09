"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import ImageTracer from "imagetracerjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Loader2, Download, Image as ImageIcon, Upload, Eraser, Pencil, Minus, Plus } from "lucide-react";
import { useI18n } from "@/components/i18n";

// Types
type Nullable<T> = T | null;

function classNames(...v: Array<string | false | undefined | null>) {
  return v.filter(Boolean).join(" ");
}

function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error || new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

function useObjectUrl(object: Blob | MediaSource | null) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!object) {
      setUrl(null);
      return;
    }
    const u = URL.createObjectURL(object);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [object]);
  return url;
}

export default function IndexPage() {
  const { toast } = useToast();
  const { t } = useI18n();

  const [file, setFile] = useState<Nullable<File>>(null);
  const [pngDataUrl, setPngDataUrl] = useState<Nullable<string>>(null);
  const [svgString, setSvgString] = useState<Nullable<string>>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Options
  const [removeBg, setRemoveBg] = useState(false);
  const [linesOnly, setLinesOnly] = useState(false);
  const [contoursOnly, setContoursOnly] = useState(false);
  const [threshold, setThreshold] = useState<number>(160); // 0..255
  const [invertThreshold, setInvertThreshold] = useState(false);
  const [bgSampleAverage, setBgSampleAverage] = useState(true);

  // Contour styling
  const [strokeWidth, setStrokeWidth] = useState<number>(1.5);
  const [strokeColor, setStrokeColor] = useState<string>("#000000");

  // Advanced tracer options
  const [numColors, setNumColors] = useState<number>(16);
  const [pathOmit, setPathOmit] = useState<number>(8);
  const [ltres, setLtres] = useState<number>(1);
  const [qtres, setQtres] = useState<number>(1);

  const svgBlob = useMemo(() => (svgString ? new Blob([svgString], { type: "image/svg+xml" }) : null), [svgString]);
  const svgDownloadUrl = useObjectUrl(svgBlob);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const resetState = useCallback(() => {
    setSvgString(null);
    setError(null);
  }, []);

  const onPickFile = useCallback((f: File | null) => {
    resetState();
    setFile(null);
    setPngDataUrl(null);

    if (!f) return;
    if (f.type !== "image/png") {
      setError(t.invalidFile);
      toast({ title: t.invalidTypeTitle, description: t.invalidTypeDesc, variant: "destructive" as any });
      return;
    }

    setFile(f);
    readFileAsDataURL(f)
      .then((url) => setPngDataUrl(url))
      .catch((e) => {
        console.error(e);
        setError(t.readErrorDesc);
        toast({ title: t.readErrorTitle, description: t.readErrorDesc, variant: "destructive" as any });
      });
  }, [resetState, toast]);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    onPickFile(f);
  }, [onPickFile]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0] ?? null;
    onPickFile(f);
  }, [onPickFile]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  }, []);

  const convert = useCallback(async () => {
    if (!pngDataUrl) {
      toast({ title: t.noImageSelectedTitle, description: t.noImageSelectedDesc, variant: "destructive" as any });
      return;
    }
    setIsConverting(true);
    setError(null);

    try {
      // Ensure image is loaded into a canvas to get ImageData.
      const img = imageRef.current!;
      if (!img.complete) {
        await new Promise<void>((resolve, reject) => {
          img.onload = () => resolve();
          img.onerror = () => reject(new Error("Failed to load image"));
        });
      }

      // Draw onto canvas
      const canvas = canvasRef.current!;
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas 2D context not available");
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      // Preprocess pixels if needed
      let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const t = Math.max(0, Math.min(255, threshold));
      if (removeBg || linesOnly) {
        const data = imageData.data;
        // Sample background reference from corners or top-left
        let bgR = data[0], bgG = data[1], bgB = data[2];
        if (bgSampleAverage) {
          const w = imageData.width, h = imageData.height;
          const idxs = [0, (w-1)*4, (h-1)*w*4, ((h-1)*w + (w-1))*4];
          let rSum=0,gSum=0,bSum=0,c=0;
          for (const idx of idxs) {
            rSum += data[idx]; gSum += data[idx+1]; bSum += data[idx+2]; c++;
          }
          bgR = Math.round(rSum/c); bgG = Math.round(gSum/c); bgB = Math.round(bSum/c);
        }
        const distThreshold = Math.max(0, Math.min(441, (t / 255) * 441)); // 0..sqrt(255^2*3)
        const toGray = (r:number,g:number,b:number) => Math.round(0.299*r + 0.587*g + 0.114*b);
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i+1], b = data[i+2];
          const a = data[i+3];
          let makeTransparent = false;
          if (removeBg && a > 0) {
            const dr = r - bgR, dg = g - bgG, db = b - bgB;
            const dist = Math.sqrt(dr*dr + dg*dg + db*db);
            if (dist <= distThreshold) {
              makeTransparent = true;
            }
          }
          if (makeTransparent) {
            data[i+3] = 0; // transparent
          } else if (linesOnly) {
            // Threshold to binary (line art)
            const gray = toGray(r,g,b);
            const thresholded = invertThreshold ? (gray < t) : (gray >= t);
            const val = thresholded ? 255 : 0;
            data[i] = data[i+1] = data[i+2] = val;
            data[i+3] = a; // preserve alpha
          }
        }
        imageData = new ImageData(data, imageData.width, imageData.height);
      }

      // Use ImageTracer to convert ImageData to SVG
      const options = {
        numberofcolors: linesOnly ? 2 : Math.max(2, Math.min(64, Math.round(numColors))),
        ltres: Math.max(0.5, Math.min(10, ltres)),
        qtres: Math.max(0.5, Math.min(10, qtres)),
        pathomit: Math.max(0, Math.min(50, Math.round(pathOmit))),
        blurradius: 0,
        blurdelta: 20,
        ltgap: 0,
        linefilter: true,
        scale: 1,
        strokewidth: 1,
        viewbox: true,
        roundcoords: 1,
        desc: true,
      } as Parameters<typeof ImageTracer.imagedataToSVG>[1];

      let svg = ImageTracer.imagedataToSVG(imageData, options);

      if (contoursOnly) {
        // Replace fills with none and ensure strokes are visible
        svg = svg
          .replace(/fill="[^"]*"/g, 'fill="none"')
          .replace(/stroke="none"/g, "");
        const color = strokeColor || "#000";
        const width = isFinite(strokeWidth) ? Math.max(0.1, Math.min(10, strokeWidth)) : 1.5;
        svg = svg.replace(
          /<svg([^>]*)>/,
          (m, attrs) => `<svg${attrs} stroke="${color}" stroke-width="${width}" stroke-linejoin="round" stroke-linecap="round"`
        );
      }

      setSvgString(svg);
      toast({ title: t.conversionDone, description: t.conversionReady });
    } catch (e: any) {
      console.error(e);
      const msg = e?.message || "Conversion failed";
      setError(msg);
      toast({ title: t.conversionErrorTitle, description: msg, variant: "destructive" as any });
    } finally {
      setIsConverting(false);
    }
  }, [pngDataUrl, toast, removeBg, linesOnly, contoursOnly, threshold, invertThreshold, bgSampleAverage, numColors, pathOmit, ltres, qtres, strokeColor, strokeWidth]);

  const clearAll = useCallback(() => {
    setFile(null);
    setPngDataUrl(null);
    setSvgString(null);
    setError(null);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  return (
    <div className="min-h-dvh w-full bg-background text-foreground flex items-center justify-center p-4">
      <Toaster />
      <Card className="w-full max-w-3xl shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <ImageIcon className="h-5 w-5" /> {t.title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Left: Upload & Preview */}
            <div>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                className={classNames(
                  "border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center gap-3",
                  "hover:bg-accent/30 transition-colors",
                )}
              >
                <Upload className="h-6 w-6 opacity-70" />
                <p className="text-sm text-muted-foreground text-center">
                  {t.dragDrop}
                </p>
                <Input
                  ref={inputRef}
                  type="file"
                  accept="image/png"
                  onChange={handleFileChange}
                  className="cursor-pointer"
                />
              </div>

              <div className="mt-4">
                <div className="text-sm font-medium mb-2">{t.pngPreview}</div>
                <div className="relative w-full aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
                  {pngDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      ref={imageRef}
                      src={pngDataUrl}
                      alt={file?.name || "PNG preview"}
                      className="object-contain w-full h-full"
                    />
                  ) : (
                  <div className="text-muted-foreground text-sm">{t.noImage}</div>
                  )}
                </div>
              </div>

              {/* Options */}
              <div className="mt-4 grid grid-cols-1 gap-3">
                <div className="flex items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <Eraser className="h-4 w-4" /> {t.removeBg}
                  </label>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={removeBg}
                    onChange={(e) => setRemoveBg(e.target.checked)}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-sm">
                    <Pencil className="h-4 w-4" /> {t.linesOnly}
                  </label>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={linesOnly}
                    onChange={(e) => setLinesOnly(e.target.checked)}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-sm">
                    {t.contoursOnly}
                  </label>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={contoursOnly}
                    onChange={(e) => setContoursOnly(e.target.checked)}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-sm">
                    {t.invertThreshold}
                  </label>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={invertThreshold}
                    onChange={(e) => setInvertThreshold(e.target.checked)}
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <label className="inline-flex items-center gap-2 text-sm">
                    {t.bgSampleAverage}
                  </label>
                  <input
                    type="checkbox"
                    className="h-4 w-4"
                    checked={bgSampleAverage}
                    onChange={(e) => setBgSampleAverage(e.target.checked)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>{t.threshold}</span>
                    <div className="inline-flex items-center gap-2">
                      <button aria-label="Decrement threshold" className="px-2 py-1 border rounded" onClick={() => setThreshold((v) => Math.max(0, v - 1))}>
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="tabular-nums w-10 text-center">{threshold}</span>
                      <button aria-label="Increment threshold" className="px-2 py-1 border rounded" onClick={() => setThreshold((v) => Math.min(255, v + 1))}>
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={255}
                    value={threshold}
                    onChange={(e) => setThreshold(parseInt(e.target.value || "0", 10))}
                  />
                </div>

                {contoursOnly && (
                  <div className="grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <label className="inline-flex items-center gap-2 text-sm">{t.strokeWidth}</label>
                      <div className="flex items-center gap-2">
                        <button aria-label="Decrement stroke width" className="px-2 py-1 border rounded" onClick={() => setStrokeWidth((v) => Math.max(0.1, parseFloat((v - 0.1).toFixed(1))))}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="range"
                          min={0.1}
                          max={10}
                          step={0.1}
                          value={strokeWidth}
                          onChange={(e) => setStrokeWidth(parseFloat(e.target.value || "1.5"))}
                        />
                        <button aria-label="Increment stroke width" className="px-2 py-1 border rounded" onClick={() => setStrokeWidth((v) => Math.min(10, parseFloat((v + 0.1).toFixed(1))))}>
                          <Plus className="h-3 w-3" />
                        </button>
                        <span className="w-10 text-right tabular-nums text-xs">{strokeWidth.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <label className="inline-flex items-center gap-2 text-sm">{t.strokeColor}</label>
                      <input
                        type="color"
                        value={strokeColor}
                        onChange={(e) => setStrokeColor(e.target.value)}
                        className="h-8 w-12 p-0 border rounded-md"
                        aria-label="Stroke color"
                      />
                    </div>
                  </div>
                )}

                <details className="mt-2">
                  <summary className="cursor-pointer text-sm font-medium">{t.advOptions}</summary>
                  <div className="mt-3 grid grid-cols-1 gap-3">
                    <div className="flex items-center justify-between gap-3">
                      <label className="inline-flex items-center gap-2 text-sm">{t.numColors}</label>
                      <div className="flex items-center gap-2">
                        <button aria-label="Decrement colors" className="px-2 py-1 border rounded" disabled={linesOnly} onClick={() => setNumColors((v) => Math.max(2, v - 1))}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="range"
                          min={2}
                          max={64}
                          value={numColors}
                          onChange={(e) => setNumColors(parseInt(e.target.value || "16", 10))}
                          disabled={linesOnly}
                        />
                        <button aria-label="Increment colors" className="px-2 py-1 border rounded" disabled={linesOnly} onClick={() => setNumColors((v) => Math.min(64, v + 1))}>
                          <Plus className="h-3 w-3" />
                        </button>
                        <span className="w-10 text-right tabular-nums text-xs">{numColors}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <label className="inline-flex items-center gap-2 text-sm">{t.pathOmit}</label>
                      <div className="flex items-center gap-2">
                        <button aria-label="Decrement path omit" className="px-2 py-1 border rounded" onClick={() => setPathOmit((v) => Math.max(0, v - 1))}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="range"
                          min={0}
                          max={50}
                          value={pathOmit}
                          onChange={(e) => setPathOmit(parseInt(e.target.value || "8", 10))}
                        />
                        <button aria-label="Increment path omit" className="px-2 py-1 border rounded" onClick={() => setPathOmit((v) => Math.min(50, v + 1))}>
                          <Plus className="h-3 w-3" />
                        </button>
                        <span className="w-10 text-right tabular-nums text-xs">{pathOmit}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <label className="inline-flex items-center gap-2 text-sm">{t.ltres}</label>
                      <div className="flex items-center gap-2">
                        <button aria-label="Decrement LT res" className="px-2 py-1 border rounded" onClick={() => setLtres((v) => Math.max(0.5, parseFloat((v - 0.5).toFixed(1))))}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="range"
                          min={0.5}
                          max={10}
                          step={0.5}
                          value={ltres}
                          onChange={(e) => setLtres(parseFloat(e.target.value || "1"))}
                        />
                        <button aria-label="Increment LT res" className="px-2 py-1 border rounded" onClick={() => setLtres((v) => Math.min(10, parseFloat((v + 0.5).toFixed(1))))}>
                          <Plus className="h-3 w-3" />
                        </button>
                        <span className="w-10 text-right tabular-nums text-xs">{ltres.toFixed(1)}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <label className="inline-flex items-center gap-2 text-sm">{t.qtres}</label>
                      <div className="flex items-center gap-2">
                        <button aria-label="Decrement QT res" className="px-2 py-1 border rounded" onClick={() => setQtres((v) => Math.max(0.5, parseFloat((v - 0.5).toFixed(1))))}>
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="range"
                          min={0.5}
                          max={10}
                          step={0.5}
                          value={qtres}
                          onChange={(e) => setQtres(parseFloat(e.target.value || "1"))}
                        />
                        <button aria-label="Increment QT res" className="px-2 py-1 border rounded" onClick={() => setQtres((v) => Math.min(10, parseFloat((v + 0.5).toFixed(1))))}>
                          <Plus className="h-3 w-3" />
                        </button>
                        <span className="w-10 text-right tabular-nums text-xs">{qtres.toFixed(1)}</span>
                      </div>
                    </div>
                  </div>
                </details>
              </div>

              <div className="mt-4 flex gap-3">
                <Button variant="secondary" onClick={clearAll} disabled={!file && !svgString}>
                  {t.reset}
                </Button>
                <Button onClick={convert} disabled={!pngDataUrl || isConverting}>
                  {isConverting ? (
                    <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" /> Converting...</span>
                  ) : (
                    t.convert
                  )}
                </Button>
              </div>

              {/* Hidden canvas for processing */}
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Right: SVG Output */}
            <div>
              <div className="text-sm font-medium mb-2">{t.svgOutput}</div>
              <div className="relative w-full aspect-video bg-muted rounded-md flex items-center justify-center overflow-hidden">
                {svgString ? (
                  <div className="w-full h-full overflow-auto p-2">
                    <div
                      className="w-full h-full"
                      dangerouslySetInnerHTML={{ __html: svgString }}
                    />
                  </div>
                ) : (
                    <div className="text-muted-foreground text-sm">{t.noSvg}</div>
                )}
              </div>
              <div className="mt-4 flex gap-3">
                <Button asChild disabled={!svgDownloadUrl} variant={svgDownloadUrl ? "default" : "secondary" as any}>
                  <a href={svgDownloadUrl || undefined} download={(file?.name?.replace(/\.png$/i, "") || "image") + ".svg"}>
                    <span className="inline-flex items-center gap-2"><Download className="h-4 w-4" /> {t.downloadSvg}</span>
                  </a>
                </Button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-6">
              <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </div>
          )}

          <div className="mt-6 text-xs text-muted-foreground">
            {t.localProcessing}
          </div>

          {/* Social share */}
          <div className="mt-6 border-t pt-4">
            <div className="text-sm font-medium mb-2">{t.socialShare}</div>
            <div className="flex flex-wrap items-center gap-3">
              <a
                className="px-3 py-2 text-sm rounded-md border hover:bg-accent"
                href="https://www.instagram.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
              >
                Instagram
              </a>
              <a
                className="px-3 py-2 text-sm rounded-md border hover:bg-accent"
                href="https://www.tiktok.com/"
                target="_blank"
                rel="noreferrer"
                aria-label="TikTok"
              >
                TikTok
              </a>
              <a
                className="px-3 py-2 text-sm rounded-md border hover:bg-accent"
                href="https://www.facebook.com/sharer/sharer.php?u="
                target="_blank"
                rel="noreferrer"
                aria-label="Facebook"
              >
                Facebook
              </a>
              <a
                className="px-3 py-2 text-sm rounded-md border hover:bg-accent"
                href="https://twitter.com/intent/tweet?text=PNG%20to%20SVG%20Converter"
                target="_blank"
                rel="noreferrer"
                aria-label="Twitter"
              >
                X (Twitter)
              </a>
              <button
                className="px-3 py-2 text-sm rounded-md border hover:bg-accent"
                aria-label="Copy link"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(window.location.href);
                    toast({ title: t.linkCopied });
                  } catch (e) {
                    toast({ title: "Copy failed", variant: "destructive" as any });
                  }
                }}
              >
                {t.copyLink}
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

