"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Type, Frame, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { textToAscii, AVAILABLE_FONTS, addBorder } from "@/lib/ascii-engine";
import { ART_COLORS, type ArtColor, type ArtGradient } from "@/lib/colors";
import ExportDialog from "./ExportDialog";
import ColorPicker from "./ColorPicker";
import { saveToGallery } from "./SavedGallery";

const BORDER_STYLES = ["none", "simple", "double", "rounded", "block"] as const;

export default function TextGenerator() {
  const [text, setText] = useState("Hello");
  const [font, setFont] = useState("Standard");
  const [border, setBorder] = useState<typeof BORDER_STYLES[number]>("none");
  const [output, setOutput] = useState("");
  const [fontSearch, setFontSearch] = useState("");
  const [artColor, setArtColor] = useState<ArtColor>(ART_COLORS[0]);
  const [artGradient, setArtGradient] = useState<ArtGradient | null>(null);

  const generate = useCallback(async () => {
    if (!text.trim()) { setOutput(""); return; }
    try {
      let result = await textToAscii(text, font);
      result = addBorder(result, border);
      setOutput(result);
    } catch {
      setOutput("Error generating ASCII art");
    }
  }, [text, font, border]);

  useEffect(() => { generate(); }, [generate]);

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
    if (output) {
      saveToGallery(output, `Text: ${text} (${font})`);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="glass-card rounded-lg p-3 sm:p-4 space-y-3">
        <div className="flex items-center gap-2 text-primary font-mono text-sm">
          <Type className="h-4 w-4" />
          <span>Text Input</span>
        </div>
        <Input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type something awesome..."
          className="bg-background/50 border-border font-mono text-foreground placeholder:text-muted-foreground focus:ring-primary"
        />
        <div className="flex flex-wrap gap-2">
          <Select value={font} onValueChange={setFont}>
            <SelectTrigger className="w-full sm:w-48 bg-background/50 border-border text-xs">
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
                <SelectItem key={f} value={f} className="font-mono text-xs">{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={border} onValueChange={(v) => setBorder(v as typeof border)}>
            <SelectTrigger className="w-full sm:w-36 bg-background/50 border-border text-xs">
              <Frame className="h-3 w-3 mr-1" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {BORDER_STYLES.map((b) => (
                <SelectItem key={b} value={b}>{b}</SelectItem>
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
      </div>

      <AnimatePresence mode="wait">
        {output && (
          <motion.div
            key={output.slice(0, 20)}
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
                <ExportDialog art={output} filename="blockify-text" color={artColor} gradient={artGradient} />
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
    </motion.div>
  );
}