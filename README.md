# Blockify — ASCII Art Studio

A feature-rich, client-side ASCII art generator and canvas editor. Transform text and images into ASCII art, browse handcrafted templates, or draw your own diagrams on an interactive canvas — all in the browser with zero backend dependencies.

![Blockify](https://img.shields.io/badge/version-3.1.0-green) ![License](https://img.shields.io/badge/license-MIT-blue)

---

## Features

### Text to ASCII

- **25+ figlet fonts** — Standard, Slant, Doom, 3D-ASCII, Star Wars, Ghost, Larry 3D, Cyber*, and more
- **Border styles** — None, simple, double, rounded, block
- **Live preview** — Instant rendering as you type
- **Font search** — Filter through available fonts quickly
- **Surprise me** — One-click random font + transform + color
- **Text transforms** — leet (h3ll0), wide (H E L L O)
- **Animated output toggle** — turn the entrance animation on or off

### Image to ASCII

- **Drag & drop** image upload
- **4 character sets** — Retro, block, smooth, detailed
- **Adjustable width** (30–200 columns)
- **Brightness & contrast** controls
- **Invert** toggle for light/dark source images
- **Border** wrapping with multiple styles

### Template Gallery

- Handcrafted templates across multiple categories:
  Animals, Symbols, Faces, Objects, Nature, Gaming, Decorations, Vehicles, Characters, Tech, Food, Emotions
- **Search & filter** by name or category
- **One-click copy** to clipboard

### ASCII Canvas (Draw Mode)

- **8 drawing tools**: Draw, Box, Line, Arrow, Fill, Text, Eraser, Select
- **Symbol picker** with 150+ glyphs across 16 categories:
  Numbers, Blocks, Stars, Hearts, Arrows, Math, Dots, Lines, Music, Weather, Cards, Misc, Faces, Currency, Greek, Box Art
- **Atomic multi-character symbols** — paint `:3`, `<3`, `(´·ω·\`)` and other multi-char glyphs as a **single cell** instead of being split character-by-character
- **Custom symbol input** — type any string and stamp it as one atomic glyph
- **4 box styles**: Simple (+), Unicode (┌), Double (╔), Rounded (╭)
- **12 color schemes**:
  - Dark — Matrix, Ocean, Sunset, Vapor, Amber, Arctic, Blood, Midnight, Forest
  - Light — Paper, Blueprint, Parchment
- **Theme-aware** — canvas auto-picks a sensible scheme when you switch the global theme
- **Grid toggle** for clean viewing
- **Zoom controls** (fit-to-frame → 300%)
- **Undo / Redo** with 50-step history (Ctrl+Z / Ctrl+Shift+Z / Ctrl+Y)
- **Selection tool** with region delete
- **Performant rendering** — drag previews use refs (no React re-renders per pointer move), rAF batching, cached pointer rect, capped DPR, and large stable 200×100 grid

### Save & Load

- **`.blockify` project files** — save and reload your full canvas (grid, scheme, box style, symbol, grid visibility)
- **Plain text fallback** — open any `.txt` ASCII file directly into the canvas
- **Locally saved gallery** — browser-side `localStorage` for quick recall

### Export Options

- **Copy** as plain text or Markdown code block
- **Download** as PNG (dark bg or transparent), SVG, or TXT
- **Code snippets** in JavaScript, Python, HTML, Go, Rust, C#

### UI / UX

- **Three themes** — Matrix (dark green), Night (dark purple), Light (paper)
- Theme-reactive Matrix rain background
- Glassmorphism UI with glow effects
- Fully responsive — works on mobile (touch drawing supported)
- Keyboard shortcuts throughout

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run start
```

---

## Tech Stack

- **Next.js 15** (App Router) with **React 19** and TypeScript
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Figlet** for text-to-ASCII rendering
- **Radix UI** primitives (via shadcn/ui)
- **Canvas API** for the drawing editor

---

## License

MIT
