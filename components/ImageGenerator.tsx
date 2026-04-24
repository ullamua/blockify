"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Image, Upload, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { imageToAscii, addBorder, type CharsetKey, CHARSET_KEYS } from "@/lib/ascii-engine";
import { ART_COLORS, type ArtColor, type ArtGradient } from "@/lib/colors";
import ExportDialog from "./ExportDialog";
import ColorPicker from "./ColorPicker";
import { saveToGallery } from "./SavedGallery";

const BORDER_STYLES = ["none", "simple", "double", "rounded", "block"] as const;

export default function ImageGenerator() {
  const [output, setOutput] = useState("");
  const [width, setWidth] = useState(80);
  const [charset, setCharset] = useState<CharsetKey>("retro");
  const [border, setBorder] = useState<typeof BORDER_STYLES[number]>("none");
  const [invert, setInvert] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [artColor, setArtColor] = useState<ArtColor>(ART_COLORS[0]);
  const [artGradient, setArtGradient] = useState<ArtGradient | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const processImage = useCallback((imgEl: HTMLImageElement, w = width, cs = charset, inv = invert, b = border, br = brightness, con = contrast) => {
    imgRef.current = imgEl;
    const canvas = document.createElement("canvas");
    canvas.width = imgEl.naturalWidth;
    canvas.height = imgEl.naturalHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.filter = `brightness(${100 + br}%) contrast(${100 + con}%)`;
    ctx.drawImage(imgEl, 0, 0);
    ctx.filter = "none";
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height);
    let result = imageToAscii(data, w, cs, inv);
    result = addBorder(result, b);
    setOutput(result);
  }, [width, charset, invert, border, brightness, contrast]);

  const updateAndReprocess = <T,>(setter: (v: T) => void, value: T) => {
    setter(value);
    if (!imgRef.current) return;
    setTimeout(() => {
      if (!imgRef.current) return;
      const w = setter === setWidth ? (value as unknown as number) : width;
      const cs = setter === setCharset ? (value as unknown as CharsetKey) : charset;
      const inv = setter === setInvert ? (value as unknown as boolean) : invert;
      const b = setter === setBorder ? (value as unknown as typeof border) : border;
      const br = setter === setBrightness ? (value as unknown as number) : brightness;
      const con = setter === setContrast ? (value as unknown as number) : contrast;
      processImage(imgRef.current!, w, cs, inv, b, br, con);
    }, 0);
  };

  const handleFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    const img = new window.Image();
    img.onload = () => processImage(img);
    img.src = url;
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const outputStyle: React.CSSProperties = artGradient
    ? {
        backgroundImage: `linear-gradient(to right, ${artGradient.colors.join(", ")})`,
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        color: "transparent",
        display: "inline-block",
        width: "100%",
      }
    : { color: artColor.value };

  const handleSave = () => {
    if (output) saveToGallery(output, "Image conversion");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div
        className={`glass-card rounded-lg p-4 sm:p-6 text-center transition-all cursor-pointer ${isDragging ? "glow-border-strong border-primary" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileRef.current?.click()}
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        <div className="flex flex-col items-center gap-2">
          {preview ? (
            <img src={preview} alt="Preview" className="max-h-24 sm:max-h-32 rounded opacity-70" />
          ) : (
            <>
              <Upload className="h-8 w-8 text-muted-foreground" />
              <p className="font-mono text-xs sm:text-sm text-muted-foreground">
                Drop an image or tap to upload
              </p>
            </>
          )}
        </div>
      </div>

      {preview && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-lg p-3 sm:p-4 space-y-3">
          <div className="flex items-center gap-2 text-primary font-mono text-sm">
            <Image className="h-4 w-4" />
            <span>Settings</span>
          </div>
          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground font-mono block mb-1">Width: {width}</label>
              <Slider value={[width]} onValueChange={([v]) => updateAndReprocess(setWidth, v)} min={30} max={200} step={5} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-mono block mb-1">Brightness: {brightness > 0 ? "+" : ""}{brightness}%</label>
              <Slider value={[brightness]} onValueChange={([v]) => updateAndReprocess(setBrightness, v)} min={-50} max={50} step={5} />
            </div>
            <div>
              <label className="text-xs text-muted-foreground font-mono block mb-1">Contrast: {contrast > 0 ? "+" : ""}{contrast}%</label>
              <Slider value={[contrast]} onValueChange={([v]) => updateAndReprocess(setContrast, v)} min={-50} max={50} step={5} />
            </div>
            <div className="flex flex-wrap gap-2">
              <Select value={charset} onValueChange={(v) => updateAndReprocess(setCharset, v as CharsetKey)}>
                <SelectTrigger className="w-full sm:w-32 bg-background/50 border-border text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHARSET_KEYS.map((c) => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={border} onValueChange={(v) => updateAndReprocess(setBorder, v as typeof border)}>
                <SelectTrigger className="w-full sm:w-28 bg-background/50 border-border text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BORDER_STYLES.map((b) => (
                    <SelectItem key={b} value={b}>{b}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant={invert ? "default" : "outline"}
                size="sm"
                onClick={() => updateAndReprocess(setInvert, !invert)}
                className="text-xs h-9"
              >
                Invert
              </Button>
              <ColorPicker
                selectedColor={artColor}
                selectedGradient={artGradient}
                onColorChange={setArtColor}
                onGradientChange={setArtGradient}
              />
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence mode="wait">
        {output && (
          <motion.div
            key="img-output"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-lg p-3 sm:p-4 space-y-3"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs text-muted-foreground">Output</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary h-7 text-xs" onClick={handleSave}>
                  <Save className="h-3 w-3 mr-1" /> Save
                </Button>
                <ExportDialog art={output} filename="blockify-image" color={artColor} gradient={artGradient} />
              </div>
            </div>
            <pre
              className="font-mono text-[5px] sm:text-[7px] md:text-[8px] leading-[1.1] overflow-x-auto whitespace-pre p-2 sm:p-3 bg-background/50 rounded border border-border"
              style={outputStyle}
            >
              {output}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}