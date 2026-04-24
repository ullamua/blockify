"use client";

import figlet from "figlet";

import standard from "figlet/importable-fonts/Standard";
import slant from "figlet/importable-fonts/Slant";
import banner from "figlet/importable-fonts/Banner";
import big from "figlet/importable-fonts/Big";
import block from "figlet/importable-fonts/Block";
import doom from "figlet/importable-fonts/Doom";
import lean from "figlet/importable-fonts/Lean";
import small from "figlet/importable-fonts/Small";
import smSlant from "figlet/importable-fonts/Small Slant";
import isometric1 from "figlet/importable-fonts/Isometric1";
import threeD from "figlet/importable-fonts/3D-ASCII";
import shadow from "figlet/importable-fonts/Shadow";
import speed from "figlet/importable-fonts/Speed";
import starWars from "figlet/importable-fonts/Star Wars";
import epic from "figlet/importable-fonts/Epic";
import colossal from "figlet/importable-fonts/Colossal";
import cyberlarge from "figlet/importable-fonts/Cyberlarge";
import cybermedium from "figlet/importable-fonts/Cybermedium";
import cybersmall from "figlet/importable-fonts/Cybersmall";
import alligator from "figlet/importable-fonts/Alligator";
import ghost from "figlet/importable-fonts/Ghost";
import larry3d from "figlet/importable-fonts/Larry 3D";
import ogre from "figlet/importable-fonts/Ogre";
import univers from "figlet/importable-fonts/Univers";
import rectangles from "figlet/importable-fonts/Rectangles";

const FONT_MAP: Record<string, string> = {
  Standard: "Standard", Slant: "Slant", Banner: "Banner", Big: "Big",
  Block: "Block", Doom: "Doom", Lean: "Lean", Small: "Small",
  "Small Slant": "Small Slant", Isometric1: "Isometric1", "3D-ASCII": "3D-ASCII",
  Shadow: "Shadow", Speed: "Speed", "Star Wars": "Star Wars", Epic: "Epic",
  Colossal: "Colossal", Cyberlarge: "Cyberlarge", Cybermedium: "Cybermedium",
  Cybersmall: "Cybersmall", Alligator: "Alligator", Ghost: "Ghost",
  "Larry 3D": "Larry 3D", Ogre: "Ogre", Univers: "Univers", Rectangles: "Rectangles",
};

const fontEntries: [string, string][] = [
  ["Standard", standard], ["Slant", slant], ["Banner", banner], ["Big", big],
  ["Block", block], ["Doom", doom], ["Lean", lean], ["Small", small],
  ["Small Slant", smSlant], ["Isometric1", isometric1], ["3D-ASCII", threeD],
  ["Shadow", shadow], ["Speed", speed], ["Star Wars", starWars], ["Epic", epic],
  ["Colossal", colossal], ["Cyberlarge", cyberlarge], ["Cybermedium", cybermedium],
  ["Cybersmall", cybersmall], ["Alligator", alligator], ["Ghost", ghost],
  ["Larry 3D", larry3d], ["Ogre", ogre], ["Univers", univers], ["Rectangles", rectangles],
];

fontEntries.forEach(([name, data]) => { figlet.parseFont(name, data); });

export const AVAILABLE_FONTS = Object.keys(FONT_MAP);

export function textToAscii(text: string, font: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const fontKey = FONT_MAP[font] || "Standard";
    figlet.text(text, { font: fontKey as any }, (err: any, result: any) => {
      if (err) reject(err);
      else resolve(result || "");
    });
  });
}

const DENSITY_CHARS = {
  retro: "@%#*+=-:. ",
  block: "█▓▒░ ",
  smooth: "●◉◎○◌ ",
  detailed: "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,\"^`'. ",
};

export type CharsetKey = keyof typeof DENSITY_CHARS;
export const CHARSET_KEYS = Object.keys(DENSITY_CHARS) as CharsetKey[];

// Advanced image to ASCII with multi-pixel sampling and edge detection
export function imageToAscii(
  imageData: ImageData,
  width: number,
  charset: CharsetKey = "retro",
  invert: boolean = false
): string {
  const chars = DENSITY_CHARS[charset];
  const { data } = imageData;
  const imgW = imageData.width;
  const imgH = imageData.height;
  const aspect = 0.5;
  const height = Math.round((width * imgH * aspect) / imgW);
  const lines: string[] = [];

  const blockW = imgW / width;
  const blockH = imgH / height;

  for (let y = 0; y < height; y++) {
    let line = "";
    for (let x = 0; x < width; x++) {
      const startX = Math.floor(x * blockW);
      const startY = Math.floor(y * blockH);
      const endX = Math.min(Math.floor((x + 1) * blockW), imgW);
      const endY = Math.min(Math.floor((y + 1) * blockH), imgH);

      let totalBrightness = 0;
      let sampleCount = 0;
      let minB = 1, maxB = 0;

      const stepX = Math.max(1, Math.floor((endX - startX) / 3));
      const stepY = Math.max(1, Math.floor((endY - startY) / 3));

      for (let sy = startY; sy < endY; sy += stepY) {
        for (let sx = startX; sx < endX; sx += stepX) {
          const idx = (sy * imgW + sx) * 4;
          const r = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
          const lum = (0.2126 * Math.pow(r / 255, 2.2) +
                       0.7152 * Math.pow(g / 255, 2.2) +
                       0.0722 * Math.pow(b / 255, 2.2));
          const brightness = Math.pow(lum, 1 / 2.2) * (a / 255);
          totalBrightness += brightness;
          minB = Math.min(minB, brightness);
          maxB = Math.max(maxB, brightness);
          sampleCount++;
        }
      }

      let brightness = sampleCount > 0 ? totalBrightness / sampleCount : 0;

      const localContrast = maxB - minB;
      if (localContrast > 0.15) {
        brightness = brightness * 0.85 + (brightness > 0.5 ? 0.15 : -0.05);
      }

      brightness = Math.max(0, Math.min(1, brightness));
      if (invert) brightness = 1 - brightness;
      const charIdx = Math.floor(brightness * (chars.length - 1));
      line += chars[charIdx];
    }
    lines.push(line);
  }
  return lines.join("\n");
}

export function addBorder(art: string, style: "none" | "simple" | "double" | "rounded" | "block"): string {
  if (style === "none") return art;
  const lines = art.split("\n");
  const maxLen = Math.max(...lines.map((l) => l.length));
  const padded = lines.map((l) => l.padEnd(maxLen));
  const borders = {
    simple: { tl: "+", tr: "+", bl: "+", br: "+", h: "-", v: "|" },
    double: { tl: "╔", tr: "╗", bl: "╚", br: "╝", h: "═", v: "║" },
    rounded: { tl: "╭", tr: "╮", bl: "╰", br: "╯", h: "─", v: "│" },
    block: { tl: "█", tr: "█", bl: "█", br: "█", h: "█", v: "█" },
  };
  const b = borders[style];
  const top = b.tl + b.h.repeat(maxLen + 2) + b.tr;
  const bottom = b.bl + b.h.repeat(maxLen + 2) + b.br;
  const body = padded.map((l) => `${b.v} ${l} ${b.v}`);
  return [top, ...body, bottom].join("\n");
}