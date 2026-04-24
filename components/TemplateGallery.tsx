"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Shapes, Copy, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TEMPLATES, TEMPLATE_NAMES, TEMPLATE_CATEGORIES } from "@/lib/templates";

export default function TemplateGallery() {
  const [copied, setCopied] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");

  const copyTemplate = async (name: string) => {
    await navigator.clipboard.writeText(TEMPLATES[name].trim());
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  const categories = ["All", ...Object.keys(TEMPLATE_CATEGORIES)];

  const filteredNames = TEMPLATE_NAMES.filter((name) => {
    const matchesSearch = name.toLowerCase().includes(search.toLowerCase());
    if (activeCategory === "All") return matchesSearch;
    return matchesSearch && (TEMPLATE_CATEGORIES[activeCategory]?.includes(name) ?? false);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center gap-2 text-primary font-mono text-sm">
        <Shapes className="h-4 w-4" />
        <span>Templates ({TEMPLATE_NAMES.length})</span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
        <Input
          placeholder="Search templates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-8 text-xs bg-background/50 border-border font-mono"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={activeCategory === cat ? "default" : "outline"}
            size="sm"
            className="h-6 text-[10px] px-2"
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredNames.map((name, i) => (
          <motion.div
            key={name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.02 }}
            className="glass-card rounded-lg p-3 hover:glow-border transition-shadow group cursor-pointer"
            onClick={() => copyTemplate(name)}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono text-xs text-foreground capitalize">{name.replace(/_/g, " ")}</span>
              <span className="text-muted-foreground group-hover:text-primary transition-colors">
                {copied === name ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
              </span>
            </div>
            <pre className="font-mono text-[7px] leading-[1.15] text-primary/70 overflow-hidden whitespace-pre max-h-20">
              {TEMPLATES[name].trim()}
            </pre>
          </motion.div>
        ))}
      </div>

      {filteredNames.length === 0 && (
        <div className="text-center py-8 font-mono text-xs text-muted-foreground">
          No templates found matching "{search}"
        </div>
      )}
    </motion.div>
  );
}