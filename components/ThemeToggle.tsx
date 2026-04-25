"use client";

import { useState, useEffect, useCallback } from "react";
import { Moon, Sparkles, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export type ThemeMode = "matrix" | "night" | "light";
const STORAGE_KEY = "blockify-theme";
const EVENT = "blockify-theme-change";

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  root.classList.remove("night", "light");
  if (mode === "night") root.classList.add("night");
  else if (mode === "light") root.classList.add("light");
}

/** Subscribe to theme changes from anywhere in the tree. */
export function useTheme(): ThemeMode {
  const [mode, setMode] = useState<ThemeMode>("matrix");
  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) as ThemeMode | null;
    if (stored === "night" || stored === "matrix" || stored === "light") setMode(stored);
    const handler = (e: Event) => setMode((e as CustomEvent<ThemeMode>).detail);
    window.addEventListener(EVENT, handler as EventListener);
    return () => window.removeEventListener(EVENT, handler as EventListener);
  }, []);
  return mode;
}

const ORDER: ThemeMode[] = ["matrix", "night", "light"];
const NEXT_LABEL: Record<ThemeMode, string> = {
  matrix: "Switch to Night",
  night: "Switch to Light",
  light: "Switch to Matrix",
};

export default function ThemeToggle() {
  const [mode, setMode] = useState<ThemeMode>("matrix");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY)) as ThemeMode | null;
    if (stored === "night" || stored === "matrix" || stored === "light") setMode(stored);
  }, []);

  useEffect(() => {
    applyTheme(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, mode);
      window.dispatchEvent(new CustomEvent<ThemeMode>(EVENT, { detail: mode }));
    }
  }, [mode]);

  const cycle = useCallback(() => {
    setMode((m) => ORDER[(ORDER.indexOf(m) + 1) % ORDER.length]);
  }, []);

  const Icon = mode === "matrix" ? Sparkles : mode === "night" ? Moon : Sun;

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={cycle}
      className="text-muted-foreground hover:text-primary"
      title={NEXT_LABEL[mode]}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );
}
