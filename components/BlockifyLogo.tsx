"use client";

import { motion } from "framer-motion";

export default function BlockifyLogo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="flex flex-col items-center gap-2"
    >
      <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-black tracking-wider text-primary glow-text select-none">
        {"BLOCKIFY".split("").map((char, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08, duration: 0.4 }}
            className="inline-block hover:animate-glitch"
          >
            {char}
          </motion.span>
        ))}
      </h1>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="font-mono text-xs sm:text-sm tracking-[0.3em] uppercase text-muted-foreground"
      >
        Block Your Art
      </motion.p>
    </motion.div>
  );
}