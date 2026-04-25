"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Type, Frame, Save, Shuffle, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { textToAscii, AVAILABLE_FONTS, addBorder } from "@/lib/ascii-engine";
import { ART_COLORS, type ArtColor, type ArtGradient } from "@/lib/colors";
import ExportDialog from "./ExportDialog";
import ColorPicker from "./ColorPicker";
import { saveToGallery } from "./SavedGallery";
import MatrixRain from "./MatrixRain";

const BORDER_STYLES = ["none", "simple", "double", "rounded", "block"] as const;

const TRANSFORMS = ["none", "leet", "wide"] as const;
type Transform = typeof TRANSFORMS[number];

const LEET: Record<string, string> = {
  a: "4", e: "3", i: "1", o: "0", s: "5", t: "7", b: "8", g: "9", l: "1",
};

function applyTransform(s: string, t: Transform): string {
  if (t === "none") return s;
  if (t === "wide") return s.split("").join(" ");
  if (t === "leet")
    return s
      .split("")
      .map((ch) => {
        const lower = ch.toLowerCase();
        const mapped = LEET[lower];
        if (!mapped) return ch;
        return ch === lower ? mapped : mapped.toUpperCase();
      })
      .join("");
  return s;
}

export default function TextGenerator() {
  const [text, setText] = useState("Hello");
  const [font, setFont] = useState("Standard");
  const [border, setBorder] = useState<typeof BORDER_STYLES[number]>("none");
  const [output, setOutput] = useState("");
  const [fontSearch, setFontSearch] = useState("");
  const [artColor, setArtColor] = useState<ArtColor>(ART_COLORS[0]);
  const [artGradient, setArtGradient] = useState<ArtGradient | null>(null);
  const [transform, setTransform] = useState<Transform>("none");
  const [animateOut, setAnimateOut] = useState(true);

  const transformed = useMemo(() => applyTransform(text, transform), [text, transform]);

  const generate = useCallback(async () => {
    if (!transformed.trim()) {
      setOutput("");
      return;
    }
    try {
      // Transforms (leet/upside/smallcaps/wide) are stylized text effects —
      // render them as-is. Only run the original text through figlet when
      // no transform is active, so users see the styled output they picked.
      let result: string;
      if (transform === "none") {
        result = await textToAscii(text, font);
      } else {
        result = transformed;
      }
      result = addBorder(result, border);
      setOutput(result);
    } catch {
      setOutput("Error generating ASCII art");
    }
  }, [transformed, text, transform, font, border]);

  useEffect(() => {
    generate();
  }, [generate]);

  const filteredFonts = AVAILABLE_FONTS.filter((f) =>
    f.toLowerCase().includes(fontSearch.toLowerCase())
  );

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
    if (output) saveToGallery(output, `Text: ${text} (${font})`);
  };

  const randomizeFont = () => {
    const pool = AVAILABLE_FONTS.filter((f) => f !== font);
    setFont(pool[Math.floor(Math.random() * pool.length)]);
  };

  const surpriseMe = () => {
    randomizeFont();
    const trs = TRANSFORMS.filter((t) => t !== transform);
    setTransform(trs[Math.floor(Math.random() * trs.length)]);
    const grads = ART_COLORS;
    setArtColor(grads[Math.floor(Math.random() * grads.length)]);
    setArtGradient(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative space-y-4 rounded-lg overflow-hidden"
    >
      <MatrixRain opacity={0.18} />
      <div className="relative z-10 space-y-4">
      <div className="glass-card rounded-lg p-3 sm:p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-primary font-mono text-sm">
            <Type className="h-4 w-4" />
            <span>Text Input</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={surpriseMe}
            className="h-7 text-[10px] gap-1 text-muted-foreground hover:text-primary"
            title="Surprise me — random font, transform & color"
          >
            <Wand2 className="h-3 w-3" />
            Surprise me
          </Button>
        </div>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something awesome..."
          className="bg-background/50 border-border font-mono text-foreground placeholder:text-muted-foreground focus:ring-primary"
        />
        <div className="flex flex-wrap gap-2">
          <div className="flex gap-1 items-center">
            <Select value={font} onValueChange={setFont}>
              <SelectTrigger className="w-44 sm:w-48 bg-background/50 border-border text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                <div className="p-2">
                  <Input
                    placeholder="Search fonts..."
                    value={fontSearch}
                    onChange={(e) => setFontSearch(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                {filteredFonts.map((f) => (
                  <SelectItem key={f} value={f} className="font-mono text-xs">
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={randomizeFont}
              className="h-9 px-2 border-border text-muted-foreground hover:text-primary"
              title="Random font"
            >
              <Shuffle className="h-3.5 w-3.5" />
            </Button>
          </div>

          <Select value={border} onValueChange={(v) => setBorder(v as typeof border)}>
            <SelectTrigger className="w-full sm:w-36 bg-background/50 border-border text-xs">
              <Frame className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BORDER_STYLES.map((b) => (
                <SelectItem key={b} value={b}>
                  {b}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={transform} onValueChange={(v) => setTransform(v as Transform)}>
            <SelectTrigger className="w-full sm:w-36 bg-background/50 border-border text-xs">
              <Wand2 className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {TRANSFORMS.map((t) => (
                <SelectItem key={t} value={t} className="text-xs">
                  {t === "none" ? "no transform" : t}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <ColorPicker
            selectedColor={artColor}
            selectedGradient={artGradient}
            onColorChange={setArtColor}
            onGradientChange={setArtGradient}
          />
        </div>

        {transform !== "none" && (
          <div className="font-mono text-[10px] text-muted-foreground">
            Rendered as:{" "}
            <span className="text-primary">{transformed}</span>
          </div>
        )}

        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground">
          <label className="flex items-center gap-1.5 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={animateOut}
              onChange={(e) => setAnimateOut(e.target.checked)}
              className="accent-primary h-3 w-3"
            />
            Animate output
          </label>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {output && (
          <motion.div
            key={animateOut ? output.slice(0, 24) : "static"}
            initial={animateOut ? { opacity: 0, scale: 0.98 } : false}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="glass-card rounded-lg p-3 sm:p-4 space-y-3"
          >
            <div className="flex items-center justify-between flex-wrap gap-2">
              <span className="font-mono text-xs text-muted-foreground">Output</span>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground hover:text-primary h-7 text-xs"
                  onClick={handleSave}
                >
                  <Save className="h-3 w-3 mr-1" /> Save
                </Button>
                <ExportDialog
                  art={output}
                  filename="blockify-text"
                  color={artColor}
                  gradient={artGradient}
                />
              </div>
            </div>
            <pre
              className="font-mono text-[8px] sm:text-[10px] md:text-xs leading-tight overflow-x-auto whitespace-pre p-3 bg-background/50 rounded border border-border"
              style={outputStyle}
            >
              {output}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
      </div>
    </motion.div>
  );
}
