"use client";

import { useEffect, useRef } from "react";

/**
 * Localized matrix rain that fills its parent container.
 * Parent must be `position: relative`. Renders behind content (z-0).
 */
export default function MatrixRain({
  className = "",
  opacity = 0.35,
  fontSize = 14,
  fps = 20,
}: {
  className?: string;
  opacity?: number;
  fontSize?: number;
  fps?: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;
    let lastT = 0;
    const FRAME_MS = 1000 / fps;
    const chars = "01アイウエオカキクケコサシスセソタチツテトナニヌネノ{}[]<>/\\=*+-#";
    let columns: number[] = [];
    let paused = document.hidden;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cols = Math.max(1, Math.floor(rect.width / fontSize));
      columns = Array.from({ length: cols }, () => Math.random() * rect.height);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onVis = () => {
      paused = document.hidden;
      if (!paused) lastT = 0;
    };
    document.addEventListener("visibilitychange", onVis);

    const draw = (t: number) => {
      animId = requestAnimationFrame(draw);
      if (paused) return;
      if (t - lastT < FRAME_MS) return;
      lastT = t;

      const rect = canvas.getBoundingClientRect();
      ctx.fillStyle = "rgba(5, 12, 8, 0.10)";
      ctx.fillRect(0, 0, rect.width, rect.height);
      ctx.fillStyle = "hsla(142, 100%, 50%, 0.55)";
      ctx.font = `${fontSize}px JetBrains Mono, monospace`;

      for (let i = 0; i < columns.length; i++) {
        const ch = chars[Math.floor(Math.random() * chars.length)];
        ctx.fillText(ch, i * fontSize, columns[i]);
        if (columns[i] > rect.height && Math.random() > 0.97) {
          columns[i] = 0;
        }
        columns[i] += fontSize;
      }
    };

    animId = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(animId);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [fontSize, fps]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity }}
    />
  );
}
