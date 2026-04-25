"use client";

import { motion } from "framer-motion";

/**
 * Polished animated wordmark.
 * Each letter is rendered as a stacked SVG block with a soft glow + sheen sweep
 * that uses the active theme's primary color (so it adapts to Matrix / Night / Light).
 */
export default function BlockifyLogo() {
  const word = "BLOCKIFY";

  return (
    <motion.div
      initial={{ opacity: 0, y: -16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className="flex flex-col items-center gap-3 select-none"
    >
      <div className="relative">
        {/* soft halo behind the wordmark */}
        <div
          aria-hidden
          className="absolute inset-0 -z-10 blur-3xl opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at center, hsl(var(--primary) / 0.45) 0%, transparent 65%)",
          }}
        />

        <h1
          className="font-display text-[2.5rem] sm:text-6xl md:text-7xl font-black tracking-[0.18em] flex items-center gap-[0.06em]"
          aria-label="BLOCKIFY"
        >
          {word.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ opacity: 0, y: 18, rotateX: -40 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.06, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.18 } }}
              className="relative inline-block"
              style={{
                color: "hsl(var(--primary))",
                textShadow:
                  "0 0 12px hsl(var(--primary) / 0.55), 0 0 32px hsl(var(--primary) / 0.25), 0 2px 0 hsl(var(--primary) / 0.15)",
                WebkitTextStroke: "0.5px hsl(var(--primary) / 0.4)",
              }}
            >
              {char}
              {/* small block tick under each letter — subtle "block" motif */}
              <span
                aria-hidden
                className="absolute left-1/2 -bottom-1.5 h-[3px] w-[55%] -translate-x-1/2 rounded-sm opacity-70"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)",
                }}
              />
            </motion.span>
          ))}

          {/* sheen sweep */}
          <motion.span
            aria-hidden
            initial={{ x: "-120%" }}
            animate={{ x: "220%" }}
            transition={{ duration: 3.6, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }}
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{
              background:
                "linear-gradient(110deg, transparent 30%, hsl(var(--primary) / 0.35) 50%, transparent 70%)",
              mixBlendMode: "screen",
              WebkitMaskImage:
                "linear-gradient(180deg, transparent 0%, white 25%, white 75%, transparent 100%)",
              maskImage:
                "linear-gradient(180deg, transparent 0%, white 25%, white 75%, transparent 100%)",
            }}
          />
        </h1>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="flex items-center gap-3"
      >
        <span className="h-px w-8 bg-border" />
        <span className="font-mono text-[10px] sm:text-xs tracking-[0.45em] uppercase text-muted-foreground">
          Block · Your · Art
        </span>
        <span className="h-px w-8 bg-border" />
      </motion.div>
    </motion.div>
  );
}
