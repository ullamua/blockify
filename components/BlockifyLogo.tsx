"use client";

import { motion } from "framer-motion";

export default function BlockifyLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex flex-col items-center gap-2 select-none"
    >
      <h1
        className="font-mono text-4xl sm:text-6xl md:text-7xl font-bold tracking-widest text-primary"
        style={{
          textShadow:
            "0 0 10px hsl(var(--primary) / 0.6), 0 0 24px hsl(var(--primary) / 0.3)",
        }}
        aria-label="BLOCKIFY"
      >
        BLOCKIFY
      </h1>
      <div className="flex items-center gap-3">
        <span className="h-px w-8 bg-border" />
        <span className="font-mono text-[10px] sm:text-xs tracking-[0.4em] uppercase text-muted-foreground">
          ASCII Art Studio
        </span>
        <span className="h-px w-8 bg-border" />
      </div>
    </motion.div>
  );
}
