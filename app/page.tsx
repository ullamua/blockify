"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Type, ImageIcon, Shapes, Archive, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import ParticleBackground from "@/components/ParticleBackground";
import BlockifyLogo from "@/components/BlockifyLogo";
import ThemeToggle from "@/components/ThemeToggle";
import TextGenerator from "@/components/TextGenerator";
import ImageGenerator from "@/components/ImageGenerator";
import TemplateGallery from "@/components/TemplateGallery";
import SavedGallery from "@/components/SavedGallery";
import AsciiCanvas from "@/components/AsciiCanvas";

type Mode = "generator" | "canvas";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState("text");
  const [mode, setMode] = useState<Mode>("generator");

  return (
    <div className="min-h-screen relative overflow-hidden">
      {mode !== "canvas" && <ParticleBackground />}
      <div className="fixed inset-0 scanline z-[1] pointer-events-none" />

      <div className="relative z-10">
        <header className="flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 border-b border-border/50">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <span className="font-mono text-[10px] sm:text-xs text-muted-foreground hidden sm:block">
              ASCII Art Studio
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-secondary/50 border border-border rounded-lg p-0.5">
              <Button
                variant={mode === "generator" ? "default" : "ghost"}
                size="sm"
                className={`h-7 text-[10px] sm:text-xs font-mono ${mode === "generator" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                onClick={() => setMode("generator")}
              >
                <Type className="h-3 w-3 mr-0.5 sm:mr-1" />
                <span className="hidden sm:inline">Generator</span>
                <span className="sm:hidden">Gen</span>
              </Button>
              <Button
                variant={mode === "canvas" ? "default" : "ghost"}
                size="sm"
                className={`h-7 text-[10px] sm:text-xs font-mono ${mode === "canvas" ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
                onClick={() => setMode("canvas")}
              >
                <PenTool className="h-3 w-3 mr-0.5 sm:mr-1" />
                Canvas
              </Button>
            </div>
            <ThemeToggle />
          </div>
        </header>

        <section className="py-4 sm:py-8 px-3 sm:px-4">
          <BlockifyLogo />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center font-mono text-[10px] sm:text-xs md:text-sm text-muted-foreground mt-3 sm:mt-4 max-w-lg mx-auto px-2"
          >
            {mode === "generator"
              ? "Transform text and images into stunning ASCII art. 25+ fonts, 55+ templates, instant export."
              : "Draw ASCII diagrams with boxes, lines, arrows, and text. 12 color schemes."}
          </motion.p>
        </section>

        <main className={`mx-auto px-2 sm:px-4 pb-12 sm:pb-16 ${mode === "canvas" ? "max-w-7xl" : "max-w-4xl"}`}>
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {mode === "generator" ? (
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="w-full grid grid-cols-4 bg-secondary/50 border border-border rounded-lg h-9 sm:h-10 mb-4 sm:mb-6">
                  <TabsTrigger
                    value="text"
                    className="font-mono text-[10px] sm:text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md gap-1"
                  >
                    <Type className="h-3 w-3 sm:h-3.5 sm:w-3.5 hidden sm:block" />
                    Text
                  </TabsTrigger>
                  <TabsTrigger
                    value="image"
                    className="font-mono text-[10px] sm:text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md gap-1"
                  >
                    <ImageIcon className="h-3 w-3 sm:h-3.5 sm:w-3.5 hidden sm:block" />
                    Image
                  </TabsTrigger>
                  <TabsTrigger
                    value="templates"
                    className="font-mono text-[10px] sm:text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md gap-1"
                  >
                    <Shapes className="h-3 w-3 sm:h-3.5 sm:w-3.5 hidden sm:block" />
                    Templates
                  </TabsTrigger>
                  <TabsTrigger
                    value="gallery"
                    className="font-mono text-[10px] sm:text-xs data-[state=active]:bg-primary/10 data-[state=active]:text-primary data-[state=active]:shadow-none rounded-md gap-1"
                  >
                    <Archive className="h-3 w-3 sm:h-3.5 sm:w-3.5 hidden sm:block" />
                    Gallery
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="text"><TextGenerator /></TabsContent>
                <TabsContent value="image"><ImageGenerator /></TabsContent>
                <TabsContent value="templates"><TemplateGallery /></TabsContent>
                <TabsContent value="gallery"><SavedGallery /></TabsContent>
              </Tabs>
            ) : (
              <AsciiCanvas />
            )}
          </motion.div>
        </main>

        <footer className="border-t border-border/30 py-4 sm:py-6 text-center">
          <p className="font-mono text-[9px] sm:text-[10px] text-muted-foreground/50">
            BLOCKIFY — Block Your Art
          </p>
        </footer>
      </div>
    </div>
  );
}
