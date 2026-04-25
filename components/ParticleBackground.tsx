"use client";

import { useEffect, useRef } from "react";

export default function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let lastT = 0;
    const TARGET_FPS = 24;
    const FRAME_MS = 1000 / TARGET_FPS;
    const chars = "01アイウエオカキクケコサシスセソタチツテト";
    const columns: number[] = [];
    const fontSize = 14;
    let paused = document.hidden;

    function resize() {
      // Cap pixel dimensions to keep this background cheap on large displays
      canvas!.width = Math.min(window.innerWidth, 1600);
      canvas!.height = Math.min(window.innerHeight, 1000);
      const cols = Math.floor(canvas!.width / fontSize);
      columns.length = 0;
      for (let i = 0; i < cols; i++) {
        columns.push(Math.random() * canvas!.height);
      }
    }

    resize();
    window.addEventListener("resize", resize);

    function onVis() {
      paused = document.hidden;
      if (!paused) lastT = 0;
    }
    document.addEventListener("visibilitychange", onVis);

    function draw(t: number) {
      animId = requestAnimationFrame(draw);
      if (paused) return;
      if (t - lastT < FRAME_MS) return;
      lastT = t;

      ctx!.fillStyle = "rgba(5, 12, 8, 0.08)";
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);
      ctx!.fillStyle = "hsla(142, 100%, 50%, 0.15)";
      ctx!.font = `${fontSize}px JetBrains Mono`;

      for (let i = 0; i < columns.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        ctx!.fillText(char, i * fontSize, columns[i]);
        if (columns[i] > canvas!.height && Math.random() > 0.975) {
          columns[i] = 0;
        }
        columns[i] += fontSize;
      }
    }

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.4 }}
    />
  );
}
