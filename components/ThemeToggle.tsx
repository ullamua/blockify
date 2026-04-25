"use client";

import { useState, useEffect } from "react";
import { Moon, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

type Mode = "matrix" | "night";
const STORAGE_KEY = "blockify-theme";

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>("matrix");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) as Mode | null;
    if (stored === "night" || stored === "matrix") setMode(stored);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("night", mode === "night");
    if (typeof window !== "undefined") localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggle = () => setMode(m => (m === "matrix" ? "night" : "matrix"));

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      className="text-muted-foreground hover:text-primary"
      title={mode === "matrix" ? "Switch to Night theme" : "Switch to Matrix theme"}
    >
      {mode === "matrix" ? <Sparkles className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  );
}