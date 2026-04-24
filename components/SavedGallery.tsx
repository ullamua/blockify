"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Archive, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SavedArt {
  id: string;
  art: string;
  label: string;
  date: string;
}

const STORAGE_KEY = "blockify-gallery";

export function saveToGallery(art: string, label: string) {
  const items: SavedArt[] = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  items.unshift({ id: Date.now().toString(), art, label, date: new Date().toLocaleDateString() });
  if (items.length > 50) items.pop();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export default function SavedGallery() {
  const [items, setItems] = useState<SavedArt[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  }, []);

  const remove = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const copy = async (id: string, art: string) => {
    await navigator.clipboard.writeText(art);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  if (items.length === 0) {
    return (
      <div className="glass-card rounded-lg p-8 text-center">
        <Archive className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
        <p className="font-mono text-sm text-muted-foreground">No saved art yet</p>
        <p className="font-mono text-xs text-muted-foreground/60 mt-1">
          Generate ASCII art and save it to your gallery
        </p>
      </div>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
      <AnimatePresence>
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ delay: i * 0.03 }}
            className="glass-card rounded-lg p-3 group"
          >
            <div className="flex items-center justify-between mb-2">
              <div>
                <span className="font-mono text-xs text-foreground">{item.label}</span>
                <span className="font-mono text-[10px] text-muted-foreground ml-2">{item.date}</span>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="sm" onClick={() => copy(item.id, item.art)} className="h-6 text-muted-foreground hover:text-primary">
                  {copied === item.id ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                </Button>
                <Button variant="ghost" size="sm" onClick={() => remove(item.id)} className="h-6 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <pre className="font-mono text-[7px] leading-[1.1] text-primary/70 overflow-hidden whitespace-pre max-h-24">
              {item.art}
            </pre>
          </motion.div>
        ))}
      </AnimatePresence>
    </motion.div>
  );
}