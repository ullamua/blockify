"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Square, MousePointer, Pencil, ArrowUpRight, Minus, Type, Eraser,
  Undo2, Redo2, Trash2, Copy, Check, ZoomIn, ZoomOut,
  Palette, Grid3X3, PaintBucket, Save, FolderOpen, Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import ExportDialog from "./ExportDialog";

// ── Color Schemes ─────────────────────────────
const COLOR_SCHEMES = {
  matrix: { name: "Matrix", bg: "#050c08", fg: "#00ff41", grid: "#0a1f0f", accent: "#00cc33", cursor: "#00ff41" },
  ocean: { name: "Ocean", bg: "#0a1628", fg: "#64b5f6", grid: "#0f2240", accent: "#42a5f5", cursor: "#90caf9" },
  sunset: { name: "Sunset", bg: "#1a0a0a", fg: "#ff8a65", grid: "#2a1515", accent: "#ff7043", cursor: "#ffab91" },
  vapor: { name: "Vapor", bg: "#1a0a2e", fg: "#e040fb", grid: "#200f3a", accent: "#ea80fc", cursor: "#f8bbd0" },
  amber: { name: "Amber", bg: "#1a1400", fg: "#ffb300", grid: "#2a2200", accent: "#ffc107", cursor: "#ffe082" },
  arctic: { name: "Arctic", bg: "#0a1a1a", fg: "#80deea", grid: "#0f2828", accent: "#4dd0e1", cursor: "#b2ebf2" },
  blood: { name: "Blood", bg: "#1a0505", fg: "#ef5350", grid: "#2a0f0f", accent: "#e53935", cursor: "#ef9a9a" },
  midnight: { name: "Midnight", bg: "#0d0d1a", fg: "#b388ff", grid: "#15152a", accent: "#7c4dff", cursor: "#d1c4e9" },
  forest: { name: "Forest", bg: "#0a1a0a", fg: "#66bb6a", grid: "#102810", accent: "#43a047", cursor: "#a5d6a7" },
} as const;

type SchemeKey = keyof typeof COLOR_SCHEMES;

// ── Draw Symbols ──────────────────────────────
const DRAW_SYMBOLS: Record<string, string[]> = {
  "Numbers": ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
  "Blocks": ["█", "▓", "▒", "░", "▄", "▀", "▌", "▐", "■", "□"],
  "Stars": ["★", "☆", "✦", "✧", "✩", "✪", "✫", "✬", "✭", "✮", "✯", "⁂"],
  "Hearts": ["♥", "♡", "❤", "❥", "❣", "💕"],
  "Arrows": ["→", "←", "↑", "↓", "↗", "↘", "↙", "↖", "⇒", "⇐", "⇑", "⇓"],
  "Math": ["+", "-", "×", "÷", "=", "≠", "≈", "≤", "≥", "±", "∞", "π"],
  "Dots": ["·", "•", "●", "○", "◉", "◎", "◌", "◐", "◑", "◒", "◓"],
  "Lines": ["─", "│", "┌", "┐", "└", "┘", "├", "┤", "┬", "┴", "┼", "═", "║"],
  "Music": ["♪", "♫", "♬", "♩", "𝄞"],
  "Weather": ["☀", "☁", "☂", "☃", "❄", "⚡", "☾", "☽"],
  "Cards": ["♠", "♣", "♥", "♦", "♤", "♧", "♡", "♢"],
  "Misc": ["✓", "✗", "✿", "❀", "☮", "☯", "⚓", "⚔", "✂", "✉", "☎", "⌘"],
  "Faces": ["☺", "☻", "☹", "◕‿◕", "ᵔᴥᵔ"],
  "Currency": ["$", "€", "£", "¥", "₿", "¢"],
  "Greek": ["α", "β", "γ", "δ", "ε", "θ", "λ", "μ", "π", "σ", "φ", "ω"],
  "Box Art": ["╔", "╗", "╚", "╝", "╠", "╣", "╦", "╩", "╬", "║", "═"],
};

// ── Types ─────────────────────────────────────
type Tool = "box" | "select" | "freeform" | "arrow" | "line" | "text" | "eraser" | "fill";
interface Point { x: number; y: number; }

// Large grid so canvas never clips on zoom out
const GRID_W = 200;
const GRID_H = 100;
const BASE_CELL = 12;

// ── Box char helpers ──────────────────────────
const BOX_CHARS = {
  simple: { tl: "+", tr: "+", bl: "+", br: "+", h: "-", v: "|" },
  unicode: { tl: "┌", tr: "┐", bl: "└", br: "┘", h: "─", v: "│" },
  double: { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" },
  rounded: { tl: "╭", tr: "╮", bl: "╰", br: "╯", h: "─", v: "│" },
};

type BoxStyle = keyof typeof BOX_CHARS;

function createGrid(): string[][] {
  return Array.from({ length: GRID_H }, () => Array(GRID_W).fill(" "));
}

function cloneGrid(g: string[][]): string[][] {
  return g.map(r => [...r]);
}

// Stamp a (possibly multi-char) string at (x, y) horizontally, in-place.
function stampAt(grid: string[][], x: number, y: number, str: string) {
  if (!str) return;
  for (let i = 0; i < str.length; i++) {
    const cx = x + i;
    if (cx < 0 || cx >= GRID_W || y < 0 || y >= GRID_H) continue;
    grid[y][cx] = str[i];
  }
}

function drawBox(grid: string[][], x1: number, y1: number, x2: number, y2: number, style: BoxStyle) {
  const b = BOX_CHARS[style];
  const minX = Math.max(0, Math.min(x1, x2));
  const maxX = Math.min(GRID_W - 1, Math.max(x1, x2));
  const minY = Math.max(0, Math.min(y1, y2));
  const maxY = Math.min(GRID_H - 1, Math.max(y1, y2));
  if (maxX - minX < 1 || maxY - minY < 1) return;

  for (let x = minX + 1; x < maxX; x++) {
    grid[minY][x] = b.h;
    grid[maxY][x] = b.h;
  }
  for (let y = minY + 1; y < maxY; y++) {
    grid[y][minX] = b.v;
    grid[y][maxX] = b.v;
  }
  grid[minY][minX] = b.tl;
  grid[minY][maxX] = b.tr;
  grid[maxY][minX] = b.bl;
  grid[maxY][maxX] = b.br;
}

function drawLine(grid: string[][], x1: number, y1: number, x2: number, y2: number, useArrow: boolean) {
  const dx = Math.abs(x2 - x1), dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1, sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;
  let cx = x1, cy = y1;

  while (true) {
    if (cy >= 0 && cy < GRID_H && cx >= 0 && cx < GRID_W) {
      if (cx === x2 && cy === y2 && useArrow) {
        if (x2 > x1) grid[cy][cx] = ">";
        else if (x2 < x1) grid[cy][cx] = "<";
        else if (y2 > y1) grid[cy][cx] = "v";
        else grid[cy][cx] = "^";
      } else {
        if (dx > dy) grid[cy][cx] = "-";
        else if (dy > dx) grid[cy][cx] = "|";
        else grid[cy][cx] = dx === 0 && dy === 0 ? "+" : (sx === sy ? "\\" : "/");
      }
    }
    if (cx === x2 && cy === y2) break;
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; cx += sx; }
    if (e2 < dx) { err += dx; cy += sy; }
  }
}

// Flood-fill from (x, y), replacing matching cells with `replace`.
// `replace` may be a single char or a multi-char string — multi-char strings
// are tiled across the filled region row-by-row.
function floodFill(grid: string[][], x: number, y: number, replace: string) {
  if (x < 0 || x >= GRID_W || y < 0 || y >= GRID_H) return;
  const target = grid[y][x];
  // Avoid no-op fills that would also infinite-loop on multi-char tiles.
  if (replace.length === 1 && target === replace) return;
  const visited: boolean[][] = Array.from({ length: GRID_H }, () => Array(GRID_W).fill(false));
  const stack: Point[] = [{ x, y }];
  const filled: Point[] = [];
  while (stack.length) {
    const p = stack.pop()!;
    if (p.x < 0 || p.x >= GRID_W || p.y < 0 || p.y >= GRID_H) continue;
    if (visited[p.y][p.x]) continue;
    if (grid[p.y][p.x] !== target) continue;
    visited[p.y][p.x] = true;
    filled.push(p);
    stack.push({ x: p.x + 1, y: p.y });
    stack.push({ x: p.x - 1, y: p.y });
    stack.push({ x: p.x, y: p.y + 1 });
    stack.push({ x: p.x, y: p.y - 1 });
  }
  if (replace.length <= 1) {
    const ch = replace || " ";
    for (const p of filled) grid[p.y][p.x] = ch;
  } else {
    // Tile the string across each filled row, anchored at the leftmost
    // filled cell of that row so the pattern reads consistently.
    const rows: Record<number, number[]> = {};
    for (const p of filled) (rows[p.y] ||= []).push(p.x);
    for (const y of Object.keys(rows)) {
      const yy = +y;
      const xs = rows[yy].sort((a, b) => a - b);
      const x0 = xs[0];
      for (const x of xs) {
        grid[yy][x] = replace[(x - x0) % replace.length];
      }
    }
  }
}

export default function AsciiCanvas() {
  const [grid, setGrid] = useState<string[][]>(createGrid);
  const [history, setHistory] = useState<string[][][]>([]);
  const [future, setFuture] = useState<string[][][]>([]);
  const [tool, setTool] = useState<Tool>("freeform");
  const [boxStyle, setBoxStyle] = useState<BoxStyle>("unicode");
  const [scheme, setScheme] = useState<SchemeKey>("matrix");
  const [zoom, setZoom] = useState(1);
  const [previewGrid, setPreviewGrid] = useState<string[][] | null>(null);
  const [textInput, setTextInput] = useState("");
  const [textPos, setTextPos] = useState<Point | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectStart, setSelectStart] = useState<Point | null>(null);
  const [selectEnd, setSelectEnd] = useState<Point | null>(null);
  const [drawChar, setDrawChar] = useState("*");
  const [showGrid, setShowGrid] = useState(true);
  const [customSymbol, setCustomSymbol] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Mutable working copy of grid; mirrors `grid` state but allows in-place edits
  // during high-frequency drag events without React re-renders.
  const gridRef = useRef<string[][]>(grid);
  useEffect(() => { gridRef.current = grid; }, [grid]);

  // Drag/draw working refs
  const drawingRef = useRef(false);
  const startPosRef = useRef<Point | null>(null);
  const lastCellRef = useRef<Point | null>(null);
  const dragRectRef = useRef<DOMRect | null>(null);
  const baseGridRef = useRef<string[][] | null>(null); // snapshot before stroke
  const rafRef = useRef<number | null>(null);

  // Mirror state in a ref so the rAF paint loop can read latest values
  // without forcing a React re-render on every frame.
  const paintStateRef = useRef({
    colors: COLOR_SCHEMES.matrix as typeof COLOR_SCHEMES[SchemeKey],
    cellSize: BASE_CELL,
    showGrid: true,
    textPos: null as Point | null,
    textInput: "",
    selectStart: null as Point | null,
    selectEnd: null as Point | null,
    previewGrid: null as string[][] | null,
  });

  // Container size (for auto-fit zoom so canvas always fills the frame)
  const [containerSize, setContainerSize] = useState({ w: 0, h: 0 });
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    update();
    if (typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Minimum cellSize that makes the grid fill the container
  const fitCellSize = useMemo(() => {
    if (containerSize.w <= 0 || containerSize.h <= 0) return 0;
    return Math.max(containerSize.w / GRID_W, containerSize.h / GRID_H);
  }, [containerSize]);

  const colors = COLOR_SCHEMES[scheme];
  const userCellSize = BASE_CELL * zoom;
  const cellSize = Math.max(userCellSize, fitCellSize);

  // The actual paint function. Reads inputs from refs so it can be called
  // from rAF during a drag without triggering React re-renders.
  const paint = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    const { colors, cellSize, showGrid, textPos, textInput, selectStart, selectEnd, previewGrid } = paintStateRef.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const displayW = GRID_W * cellSize;
    const displayH = GRID_H * cellSize;
    const pxW = Math.round(displayW * dpr);
    const pxH = Math.round(displayH * dpr);
    if (canvas.width !== pxW) canvas.width = pxW;
    if (canvas.height !== pxH) canvas.height = pxH;
    canvas.style.width = `${displayW}px`;
    canvas.style.height = `${displayH}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    ctx.fillStyle = colors.bg;
    ctx.fillRect(0, 0, displayW, displayH);

    if (showGrid && cellSize >= 4) {
      ctx.strokeStyle = colors.grid;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      for (let x = 0; x <= GRID_W; x++) {
        const px = Math.round(x * cellSize) + 0.5;
        ctx.moveTo(px, 0);
        ctx.lineTo(px, displayH);
      }
      for (let y = 0; y <= GRID_H; y++) {
        const py = Math.round(y * cellSize) + 0.5;
        ctx.moveTo(0, py);
        ctx.lineTo(displayW, py);
      }
      ctx.stroke();
    }

    if (selectStart && selectEnd) {
      const sx = Math.min(selectStart.x, selectEnd.x);
      const sy = Math.min(selectStart.y, selectEnd.y);
      const sw = Math.abs(selectEnd.x - selectStart.x) + 1;
      const sh = Math.abs(selectEnd.y - selectStart.y) + 1;
      ctx.fillStyle = colors.accent + "22";
      ctx.fillRect(sx * cellSize, sy * cellSize, sw * cellSize, sh * cellSize);
      ctx.strokeStyle = colors.accent + "66";
      ctx.lineWidth = 1;
      ctx.strokeRect(sx * cellSize, sy * cellSize, sw * cellSize, sh * cellSize);
    }

    const displayGrid = previewGrid || gridRef.current;
    ctx.fillStyle = colors.fg;
    ctx.font = `${Math.max(8, cellSize - 2)}px "JetBrains Mono", monospace`;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    const half = cellSize / 2;
    for (let y = 0; y < GRID_H; y++) {
      const row = displayGrid[y];
      const yPos = y * cellSize + half;
      for (let x = 0; x < GRID_W; x++) {
        const ch = row[x];
        if (ch !== " " && ch !== undefined) {
          ctx.fillText(ch, x * cellSize + half, yPos);
        }
      }
    }

    if (textPos) {
      const cx = (textPos.x + textInput.length) * cellSize;
      const cy = textPos.y * cellSize;
      ctx.fillStyle = colors.cursor;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(cx, cy, 2, cellSize);
      ctx.globalAlpha = 1;
      ctx.fillStyle = colors.accent;
      for (let i = 0; i < textInput.length; i++) {
        ctx.fillText(textInput[i], (textPos.x + i) * cellSize + cellSize / 2, textPos.y * cellSize + cellSize / 2);
      }
    }
  }, []);

  const scheduleRedraw = useCallback(() => {
    if (rafRef.current != null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      paint();
    });
  }, [paint]);

  useEffect(() => () => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
  }, []);

  const commitGrid = useCallback((g: string[][]) => {
    gridRef.current = g;
    setGrid(g);
  }, []);

  const pushHistorySnapshot = useCallback((snapshot: string[][]) => {
    setHistory(h => {
      const next = h.length >= 50 ? h.slice(h.length - 49) : h;
      return [...next, snapshot];
    });
    setFuture([]);
  }, []);

  const undo = useCallback(() => {
    setHistory(h => {
      if (h.length === 0) return h;
      const prev = h[h.length - 1];
      setFuture(f => [...f, cloneGrid(gridRef.current)]);
      gridRef.current = prev;
      setGrid(prev);
      scheduleRedraw();
      return h.slice(0, -1);
    });
  }, [scheduleRedraw]);

  const redo = useCallback(() => {
    setFuture(f => {
      if (f.length === 0) return f;
      const next = f[f.length - 1];
      setHistory(h => [...h, cloneGrid(gridRef.current)]);
      gridRef.current = next;
      setGrid(next);
      scheduleRedraw();
      return f.slice(0, -1);
    });
  }, [scheduleRedraw]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "z" && !e.shiftKey) { e.preventDefault(); undo(); }
        if (e.key === "z" && e.shiftKey) { e.preventDefault(); redo(); }
        if (e.key === "y") { e.preventDefault(); redo(); }
      }
      if (textPos && e.key === "Escape") { setTextPos(null); setTextInput(""); }
      if (textPos && e.key === "Enter") {
        pushHistorySnapshot(cloneGrid(gridRef.current));
        const g = cloneGrid(gridRef.current);
        for (let i = 0; i < textInput.length; i++) {
          const x = textPos.x + i;
          if (x >= 0 && x < GRID_W && textPos.y >= 0 && textPos.y < GRID_H)
            g[textPos.y][x] = textInput[i];
        }
        commitGrid(g);
        setTextPos(null);
        setTextInput("");
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [undo, redo, textPos, textInput, pushHistorySnapshot, commitGrid]);

  // Sync paint inputs into the ref and trigger a paint when state changes
  useEffect(() => {
    paintStateRef.current = {
      colors, cellSize, showGrid, textPos, textInput, selectStart, selectEnd, previewGrid,
    };
    paint();
  }, [paint, grid, previewGrid, cellSize, colors, textPos, textInput, selectStart, selectEnd, showGrid]);

  // ── Position getter (uses cached rect during drag) ──
  const getCellPosFromEvent = useCallback((clientX: number, clientY: number): Point => {
    const rect = dragRectRef.current ?? canvasRef.current!.getBoundingClientRect();
    return {
      x: Math.floor((clientX - rect.left) / cellSize),
      y: Math.floor((clientY - rect.top) / cellSize),
    };
  }, [cellSize]);

  // ── Unified interaction handlers ───────────
  const handleStart = useCallback((pos: Point) => {
    if (pos.x < 0 || pos.x >= GRID_W || pos.y < 0 || pos.y >= GRID_H) return;
    if (tool === "text") { setTextPos(pos); setTextInput(""); return; }
    if (tool === "fill") {
      pushHistorySnapshot(cloneGrid(gridRef.current));
      const g = cloneGrid(gridRef.current);
      floodFill(g, pos.x, pos.y, drawChar || " ");
      commitGrid(g);
      return;
    }
    if (tool === "select") {
      setSelectStart(pos);
      setSelectEnd(pos);
      drawingRef.current = true;
      return;
    }
    // Snapshot for undo BEFORE the stroke
    baseGridRef.current = cloneGrid(gridRef.current);
    drawingRef.current = true;
    startPosRef.current = pos;
    lastCellRef.current = pos;

    if (tool === "freeform") {
      // Multi-char drawChar: stamp the whole string starting at the cell.
      stampAt(gridRef.current, pos.x, pos.y, drawChar);
      scheduleRedraw();
    } else if (tool === "eraser") {
      gridRef.current[pos.y][pos.x] = " ";
      scheduleRedraw();
    }
  }, [tool, drawChar, scheduleRedraw, pushHistorySnapshot, commitGrid]);

  const handleMove = useCallback((pos: Point) => {
    if (!drawingRef.current) return;
    if (pos.x < 0 || pos.x >= GRID_W || pos.y < 0 || pos.y >= GRID_H) return;

    if (tool === "select") {
      setSelectEnd(pos);
      return;
    }

    // Skip duplicate cells for freeform/eraser to avoid wasted work
    if (tool === "freeform" || tool === "eraser") {
      const last = lastCellRef.current;
      if (last && last.x === pos.x && last.y === pos.y) return;

      // Bresenham fill between last and current to handle fast strokes
      if (last) {
        // For multi-char freeform, just use the first char while dragging
        // so the symbol doesn't repeat awkwardly along the stroke.
        const ch = tool === "freeform" ? (drawChar[0] || "*") : " ";
        const dx = Math.abs(pos.x - last.x), dy = Math.abs(pos.y - last.y);
        const sx = last.x < pos.x ? 1 : -1, sy = last.y < pos.y ? 1 : -1;
        let err = dx - dy;
        let cx = last.x, cy = last.y;
        const g = gridRef.current;
        while (true) {
          if (cy >= 0 && cy < GRID_H && cx >= 0 && cx < GRID_W) g[cy][cx] = ch;
          if (cx === pos.x && cy === pos.y) break;
          const e2 = 2 * err;
          if (e2 > -dy) { err -= dy; cx += sx; }
          if (e2 < dx) { err += dx; cy += sy; }
        }
      } else {
        gridRef.current[pos.y][pos.x] = tool === "freeform" ? (drawChar[0] || "*") : " ";
      }
      lastCellRef.current = pos;
      scheduleRedraw();
      return;
    }

    const startPos = startPosRef.current;
    if (startPos && (tool === "box" || tool === "line" || tool === "arrow")) {
      const last = lastCellRef.current;
      if (last && last.x === pos.x && last.y === pos.y) return;
      lastCellRef.current = pos;
      const preview = cloneGrid(baseGridRef.current ?? gridRef.current);
      if (tool === "box") drawBox(preview, startPos.x, startPos.y, pos.x, pos.y, boxStyle);
      else drawLine(preview, startPos.x, startPos.y, pos.x, pos.y, tool === "arrow");
      setPreviewGrid(preview);
    }
  }, [tool, drawChar, boxStyle, scheduleRedraw]);

  const handleEnd = useCallback((pos: Point) => {
    if (!drawingRef.current) return;
    drawingRef.current = false;
    dragRectRef.current = null;

    if (tool === "select") return;

    if (
      pos.x >= 0 && pos.x < GRID_W && pos.y >= 0 && pos.y < GRID_H &&
      startPosRef.current && (tool === "box" || tool === "line" || tool === "arrow")
    ) {
      const sp = startPosRef.current;
      const g = cloneGrid(baseGridRef.current ?? gridRef.current);
      if (tool === "box") drawBox(g, sp.x, sp.y, pos.x, pos.y, boxStyle);
      else drawLine(g, sp.x, sp.y, pos.x, pos.y, tool === "arrow");
      if (baseGridRef.current) pushHistorySnapshot(baseGridRef.current);
      commitGrid(g);
    } else if (tool === "freeform" || tool === "eraser") {
      // Commit the in-place edits as a new state reference + history snapshot
      if (baseGridRef.current) pushHistorySnapshot(baseGridRef.current);
      commitGrid(gridRef.current.map(r => r.slice()));
    }

    setPreviewGrid(null);
    startPosRef.current = null;
    lastCellRef.current = null;
    baseGridRef.current = null;
  }, [tool, boxStyle, pushHistorySnapshot, commitGrid]);

  // Cache canvas rect at pointer-down to avoid expensive getBoundingClientRect on every move
  const cacheRect = useCallback(() => {
    if (canvasRef.current) dragRectRef.current = canvasRef.current.getBoundingClientRect();
  }, []);

  // Mouse handlers
  const onMouseDown = (e: React.MouseEvent) => {
    cacheRect();
    handleStart(getCellPosFromEvent(e.clientX, e.clientY));
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!drawingRef.current) return;
    handleMove(getCellPosFromEvent(e.clientX, e.clientY));
  };
  const onMouseUp = (e: React.MouseEvent) => handleEnd(getCellPosFromEvent(e.clientX, e.clientY));
  const onMouseLeave = (e: React.MouseEvent) => {
    if (drawingRef.current) handleEnd(getCellPosFromEvent(e.clientX, e.clientY));
  };

  // Touch handlers
  const onTouchStart = (e: React.TouchEvent) => {
    e.preventDefault();
    cacheRect();
    const t = e.touches[0];
    handleStart(getCellPosFromEvent(t.clientX, t.clientY));
  };
  const onTouchMove = (e: React.TouchEvent) => {
    e.preventDefault();
    if (!drawingRef.current) return;
    const t = e.touches[0];
    handleMove(getCellPosFromEvent(t.clientX, t.clientY));
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    e.preventDefault();
    const t = e.changedTouches[0];
    handleEnd(getCellPosFromEvent(t.clientX, t.clientY));
  };

  // ── Export ─────────────────────────────────
  const gridToString = useCallback(() => {
    return grid.map(row => row.join("").replace(/\s+$/, "")).join("\n").replace(/(\n\s*)+$/, "");
  }, [grid]);

  const copyGrid = async () => {
    await navigator.clipboard.writeText(gridToString());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const clearGrid = () => {
    pushHistorySnapshot(cloneGrid(gridRef.current));
    commitGrid(createGrid());
    setSelectStart(null);
    setSelectEnd(null);
  };

  const deleteSelected = () => {
    if (!selectStart || !selectEnd) return;
    pushHistorySnapshot(cloneGrid(gridRef.current));
    const g = cloneGrid(gridRef.current);
    const sx = Math.min(selectStart.x, selectEnd.x);
    const sy = Math.min(selectStart.y, selectEnd.y);
    const ex = Math.max(selectStart.x, selectEnd.x);
    const ey = Math.max(selectStart.y, selectEnd.y);
    for (let y = sy; y <= ey; y++)
      for (let x = sx; x <= ex; x++)
        if (y >= 0 && y < GRID_H && x >= 0 && x < GRID_W) g[y][x] = " ";
    commitGrid(g);
    setSelectStart(null);
    setSelectEnd(null);
  };

  const onTextKeyDown = (e: React.KeyboardEvent) => {
    if (!textPos) return;
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) setTextInput(prev => prev + e.key);
    else if (e.key === "Backspace") setTextInput(prev => prev.slice(0, -1));
  };

  // Compute the user's minimum useful zoom so the "zoom out" button doesn't
  // go past fit-to-container (and so the displayed % matches reality).
  const minZoom = useMemo(() => {
    if (fitCellSize <= 0) return 0.3;
    return Math.max(0.3, fitCellSize / BASE_CELL);
  }, [fitCellSize]);

  // If container resized and current zoom is below fit, snap zoom up
  useEffect(() => {
    if (zoom < minZoom - 0.001) setZoom(minZoom);
  }, [minZoom, zoom]);

  const TOOLS: { key: Tool; icon: typeof Square; label: string }[] = [
    { key: "freeform", icon: Pencil, label: "Draw" },
    { key: "box", icon: Square, label: "Box" },
    { key: "line", icon: Minus, label: "Line" },
    { key: "arrow", icon: ArrowUpRight, label: "Arrow" },
    { key: "fill", icon: PaintBucket, label: "Fill" },
    { key: "text", icon: Type, label: "Text" },
    { key: "eraser", icon: Eraser, label: "Erase" },
    { key: "select", icon: MousePointer, label: "Select" },
  ];

  // ── Project save / load (.blockify JSON) ─────────────
  const saveProject = useCallback(() => {
    const project = {
      app: "blockify",
      version: 1,
      savedAt: new Date().toISOString(),
      grid: gridRef.current,
      scheme,
      boxStyle,
      drawChar,
      showGrid,
    };
    const blob = new Blob([JSON.stringify(project)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `blockify-project-${Date.now()}.blockify`;
    a.click();
    URL.revokeObjectURL(a.href);
  }, [scheme, boxStyle, drawChar, showGrid]);

  const loadProjectFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const text = String(reader.result || "");
        // Accept .blockify JSON OR fall back to plain ASCII text files.
        let nextGrid: string[][] | null = null;
        try {
          const data = JSON.parse(text);
          if (data && Array.isArray(data.grid)) {
            const g = createGrid();
            for (let y = 0; y < Math.min(GRID_H, data.grid.length); y++) {
              const row = data.grid[y];
              if (!Array.isArray(row)) continue;
              for (let x = 0; x < Math.min(GRID_W, row.length); x++) {
                const ch = row[x];
                if (typeof ch === "string" && ch.length >= 1) g[y][x] = ch[0];
              }
            }
            nextGrid = g;
            if (typeof data.scheme === "string" && data.scheme in COLOR_SCHEMES) {
              setScheme(data.scheme as SchemeKey);
            }
            if (typeof data.boxStyle === "string" && data.boxStyle in BOX_CHARS) {
              setBoxStyle(data.boxStyle as BoxStyle);
            }
            if (typeof data.drawChar === "string" && data.drawChar.length > 0) {
              setDrawChar(data.drawChar);
            }
            if (typeof data.showGrid === "boolean") setShowGrid(data.showGrid);
          }
        } catch {
          // not JSON — treat as plain text
        }
        if (!nextGrid) {
          const lines = text.split(/\r?\n/);
          const g = createGrid();
          for (let y = 0; y < Math.min(GRID_H, lines.length); y++) {
            const line = lines[y];
            for (let x = 0; x < Math.min(GRID_W, line.length); x++) {
              g[y][x] = line[x] || " ";
            }
          }
          nextGrid = g;
        }
        pushHistorySnapshot(cloneGrid(gridRef.current));
        commitGrid(nextGrid);
      } catch {
        // ignore malformed files silently
      }
    };
    reader.readAsText(file);
  }, [pushHistorySnapshot, commitGrid]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
      tabIndex={0}
      onKeyDown={onTextKeyDown}
    >
      {/* Toolbar */}
      <div className="glass-card rounded-xl p-2 sm:p-3 space-y-2">
        {/* Tools row */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <div className="flex flex-wrap gap-0.5 border border-border rounded-lg p-0.5 bg-secondary/30">
            {TOOLS.map(t => (
              <Button
                key={t.key}
                variant={tool === t.key ? "default" : "ghost"}
                size="sm"
                className={`h-7 sm:h-8 px-1.5 sm:px-2.5 gap-0.5 sm:gap-1 text-[10px] sm:text-xs ${tool === t.key ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => { setTool(t.key); setTextPos(null); }}
                title={t.label}
              >
                <t.icon className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                <span className="hidden sm:inline">{t.label}</span>
              </Button>
            ))}
          </div>

          {tool === "freeform" && (
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-7 sm:h-8 text-xs gap-1 border-border">
                  <span className="text-base leading-none">{drawChar}</span>
                  <span className="text-muted-foreground hidden sm:inline">Symbol</span>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-72 sm:w-80 p-0 glass-card border-border" align="start">
                <div className="p-2 border-b border-border/40 space-y-1.5">
                  <label className="font-mono text-[10px] text-muted-foreground uppercase tracking-wide">
                    Custom symbol or text
                  </label>
                  <div className="flex gap-1">
                    <Input
                      value={customSymbol}
                      onChange={(e) => setCustomSymbol(e.target.value)}
                      placeholder='e.g. :3 or "hi"'
                      className="h-7 text-xs font-mono bg-background/50"
                      maxLength={32}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && customSymbol) {
                          setDrawChar(customSymbol);
                        }
                      }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 text-[10px] gap-1"
                      onClick={() => customSymbol && setDrawChar(customSymbol)}
                      disabled={!customSymbol}
                    >
                      <Plus className="h-3 w-3" />
                      Use
                    </Button>
                  </div>
                  <p className="font-mono text-[9px] text-muted-foreground/70">
                    Click stamps the whole string. Drag uses just the first character.
                  </p>
                </div>
                <Tabs defaultValue={Object.keys(DRAW_SYMBOLS)[0]} className="w-full">
                  <ScrollArea className="w-full">
                    <TabsList className="w-full h-auto flex flex-wrap gap-0.5 p-1.5 bg-transparent">
                      {Object.keys(DRAW_SYMBOLS).map(cat => (
                        <TabsTrigger key={cat} value={cat} className="text-[10px] h-6 px-2 data-[state=active]:bg-primary/15 data-[state=active]:text-primary rounded-md">
                          {cat}
                        </TabsTrigger>
                      ))}
                    </TabsList>
                  </ScrollArea>
                  {Object.entries(DRAW_SYMBOLS).map(([cat, symbols]) => (
                    <TabsContent key={cat} value={cat} className="p-2 mt-0">
                      <div className="grid grid-cols-8 gap-1">
                        {symbols.map((sym, i) => (
                          <button
                            key={`${cat}-${i}`}
                            className={`h-8 w-8 flex items-center justify-center rounded-md text-sm transition-all ${drawChar === sym ? "bg-primary/20 text-primary ring-1 ring-primary/50" : "hover:bg-secondary text-foreground"}`}
                            onClick={() => setDrawChar(sym)}
                          >
                            {sym}
                          </button>
                        ))}
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>
              </PopoverContent>
            </Popover>
          )}

          {tool === "box" && (
            <Select value={boxStyle} onValueChange={(v) => setBoxStyle(v as BoxStyle)}>
              <SelectTrigger className="w-24 sm:w-28 h-7 sm:h-8 text-xs bg-secondary/30 border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(BOX_CHARS).map(s => (
                  <SelectItem key={s} value={s} className="text-xs">{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {tool === "fill" && (
            <span className="font-mono text-[10px] text-muted-foreground hidden sm:inline">
              Fills connected cells with <span className="text-primary">{drawChar || " "}</span>
            </span>
          )}
        </div>

        {/* Actions row */}
        <div className="flex flex-wrap items-center gap-1 sm:gap-2">
          <div className="flex gap-0.5">
            <Button variant="ghost" size="sm" onClick={undo} disabled={history.length === 0} className="h-7 sm:h-8 px-1.5 sm:px-2 text-muted-foreground" title="Undo (Ctrl+Z)">
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={redo} disabled={future.length === 0} className="h-7 sm:h-8 px-1.5 sm:px-2 text-muted-foreground" title="Redo">
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="h-5 w-px bg-border/50" />

          <div className="flex gap-0.5">
            <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.max(minZoom, +(z - 0.15).toFixed(3)))} disabled={zoom <= minZoom + 0.001} className="h-7 sm:h-8 px-1.5 sm:px-2 text-muted-foreground">
              <ZoomOut className="h-3.5 w-3.5" />
            </Button>
            <span className="text-[10px] font-mono text-muted-foreground self-center w-9 text-center">{Math.round(Math.max(zoom, minZoom) * 100)}%</span>
            <Button variant="ghost" size="sm" onClick={() => setZoom(z => Math.min(3, +(Math.max(z, minZoom) + 0.15).toFixed(3)))} className="h-7 sm:h-8 px-1.5 sm:px-2 text-muted-foreground">
              <ZoomIn className="h-3.5 w-3.5" />
            </Button>
          </div>

          <div className="h-5 w-px bg-border/50" />

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 sm:h-8 px-1.5 sm:px-2 gap-1 text-muted-foreground">
                <Palette className="h-3.5 w-3.5" />
                <span className="w-2 h-2 rounded-full" style={{ background: colors.fg }} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 glass-card border-border" align="start">
              <div className="grid gap-1">
                {Object.entries(COLOR_SCHEMES).map(([key, s]) => (
                  <button
                    key={key}
                    className={`flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-mono transition-all ${scheme === key ? "bg-primary/15 text-primary" : "hover:bg-secondary text-foreground"}`}
                    onClick={() => setScheme(key as SchemeKey)}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ background: s.fg }} />
                    {s.name}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowGrid(!showGrid)}
            className={`h-7 sm:h-8 px-1.5 sm:px-2 ${showGrid ? "text-primary" : "text-muted-foreground"}`}
          >
            <Grid3X3 className="h-3.5 w-3.5" />
          </Button>

          <div className="flex-1" />

          {selectStart && selectEnd && (
            <Button variant="ghost" size="sm" onClick={deleteSelected} className="h-7 sm:h-8 px-1.5 sm:px-2 text-destructive">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}

          <Button variant="ghost" size="sm" onClick={clearGrid} className="h-7 sm:h-8 px-1.5 sm:px-2 text-muted-foreground hover:text-destructive">
            <Trash2 className="h-3.5 w-3.5" />
          </Button>

          <Button variant="ghost" size="sm" onClick={copyGrid} className="h-7 sm:h-8 px-1.5 sm:px-2 text-muted-foreground">
            {copied ? <Check className="h-3.5 w-3.5 text-primary" /> : <Copy className="h-3.5 w-3.5" />}
          </Button>

          <div className="h-5 w-px bg-border/50" />

          <input
            ref={fileInputRef}
            type="file"
            accept=".blockify,.json,.txt,application/json,text/plain"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) loadProjectFile(f);
              e.target.value = "";
            }}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            className="h-7 sm:h-8 px-1.5 sm:px-2 text-muted-foreground hover:text-primary gap-1"
            title="Open project (.blockify or .txt)"
          >
            <FolderOpen className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[10px]">Open</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={saveProject}
            className="h-7 sm:h-8 px-1.5 sm:px-2 text-muted-foreground hover:text-primary gap-1"
            title="Save project as .blockify file"
          >
            <Save className="h-3.5 w-3.5" />
            <span className="hidden sm:inline text-[10px]">Save</span>
          </Button>

          <ExportDialog art={gridToString()} filename="blockify-canvas" />
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={containerRef}
        className="rounded-xl overflow-auto relative border canvas-frame"
        style={{
          background: colors.bg,
          borderColor: "var(--glass-border)",
        }}
      >
        <canvas
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseLeave}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onContextMenu={(e) => e.preventDefault()}
          className="cursor-crosshair touch-none block"
        />
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-2 font-mono text-[10px] text-muted-foreground/60">
        <span>{GRID_W}×{GRID_H}</span>
        <span>{history.length} steps</span>
        <span>{colors.name}</span>
      </div>
    </motion.div>
  );
}