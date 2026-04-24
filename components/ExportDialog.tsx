"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Copy, Check, Code, FileImage, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { ArtColor, ArtGradient } from "@/lib/colors";

type Language = "javascript" | "python" | "html" | "go" | "rust" | "csharp";

const LANG_LABELS: Record<Language, string> = {
  javascript: "JavaScript", python: "Python", html: "HTML",
  go: "Go", rust: "Rust", csharp: "C#",
};

function wrapCode(art: string, lang: Language): string {
  const escaped = art.replace(/\\/g, "\\\\").replace(/`/g, "\\`").replace(/\$/g, "\\$");
  switch (lang) {
    case "javascript": return `const asciiArt = \`\n${escaped}\n\`;\nconsole.log(asciiArt);`;
    case "python": return `ascii_art = """\n${art}\n"""\nprint(ascii_art)`;
    case "html": return `<pre style="font-family: monospace; white-space: pre;">\n${art.replace(/</g, "&lt;").replace(/>/g, "&gt;")}\n</pre>`;
    case "go": return `package main\n\nimport "fmt"\n\nfunc main() {\n\tfmt.Println(\`\n${art}\n\`)\n}`;
    case "rust": return `fn main() {\n    println!(r#"\n${art}\n"#);\n}`;
    case "csharp": return `using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine(@"\n${art.replace(/"/g, '""')}\n");\n    }\n}`;
  }
}

interface ExportDialogProps {
  art: string;
  filename?: string;
  color?: ArtColor;
  gradient?: ArtGradient | null;
}

export default function ExportDialog({ art, filename = "blockify-ascii", color, gradient }: ExportDialogProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  const copyText = async (text: string, key: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const getExportColor = (): string => {
    if (color) return color.value;
    return "#00ff41";
  };

  const downloadPng = (transparent: boolean) => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d")!;
    const lines = art.split("\n");
    const fontSize = 14;
    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
    const maxWidth = Math.max(...lines.map((l) => ctx.measureText(l).width));
    const pad = 20;
    canvas.width = maxWidth + pad * 2;
    canvas.height = lines.length * (fontSize + 4) + pad * 2;
    if (!transparent) {
      ctx.fillStyle = "#050c08";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    if (gradient) {
      const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.colors.forEach((c, i) => grd.addColorStop(i / (gradient.colors.length - 1), c));
      ctx.fillStyle = grd;
    } else {
      ctx.fillStyle = getExportColor();
    }

    ctx.font = `${fontSize}px "JetBrains Mono", monospace`;
    lines.forEach((line, i) => {
      ctx.fillText(line, pad, pad + (i + 1) * (fontSize + 4));
    });
    const link = document.createElement("a");
    link.download = `${filename}${transparent ? "-transparent" : ""}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  const downloadSvg = () => {
    const lines = art.split("\n");
    const fontSize = 14;
    const lineH = fontSize + 4;
    const pad = 20;
    const h = lines.length * lineH + pad * 2;
    const w = Math.max(...lines.map(l => l.length)) * (fontSize * 0.6) + pad * 2;
    const fillColor = getExportColor();
    const escaped = lines.map((line, i) =>
      `<text x="${pad}" y="${pad + (i + 1) * lineH}" fill="${fillColor}" font-family="monospace" font-size="${fontSize}">${line.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</text>`
    ).join("\n");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">\n<rect width="100%" height="100%" fill="#050c08"/>\n${escaped}\n</svg>`;
    const blob = new Blob([svg], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.download = `${filename}.svg`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  const downloadTxt = () => {
    const blob = new Blob([art], { type: "text/plain" });
    const link = document.createElement("a");
    link.download = `${filename}.txt`;
    link.href = URL.createObjectURL(blob);
    link.click();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary h-7 text-xs">
          <Download className="h-3 w-3 mr-1" />
          Export
        </Button>
      </DialogTrigger>
      <DialogContent className="glass-card border-border max-w-md max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-mono text-sm text-primary">Export ASCII Art</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <p className="font-mono text-xs text-muted-foreground">Quick Copy</p>
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => copyText(art, "plain")}>
                {copied === "plain" ? <Check className="h-3 w-3 mr-1" /> : <Copy className="h-3 w-3 mr-1" />}
                Plain
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => copyText("```\n" + art + "\n```", "md")}>
                {copied === "md" ? <Check className="h-3 w-3 mr-1" /> : <Code className="h-3 w-3 mr-1" />}
                Markdown
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-xs text-muted-foreground">Download</p>
            <div className="flex flex-wrap gap-1.5">
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => downloadPng(false)}>
                <FileImage className="h-3 w-3 mr-1" /> PNG
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={() => downloadPng(true)}>
                <FileImage className="h-3 w-3 mr-1" /> Transparent
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={downloadSvg}>
                <FileImage className="h-3 w-3 mr-1" /> SVG
              </Button>
              <Button size="sm" variant="outline" className="text-xs h-7" onClick={downloadTxt}>
                <FileText className="h-3 w-3 mr-1" /> TXT
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <p className="font-mono text-xs text-muted-foreground">Copy as Code</p>
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(LANG_LABELS) as Language[]).map((lang) => (
                <Button key={lang} size="sm" variant="outline" className="text-xs h-7" onClick={() => copyText(wrapCode(art, lang), lang)}>
                  {copied === lang ? <Check className="h-3 w-3 mr-1" /> : <Code className="h-3 w-3 mr-1" />}
                  {LANG_LABELS[lang]}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}