// Color palette for ASCII art output

export interface ArtColor {
  name: string;
  value: string;
  textClass?: string;
}

export interface ArtGradient {
  name: string;
  colors: string[];
}

export const ART_COLORS: ArtColor[] = [
  { name: "Matrix Green", value: "#00ff41" },
  { name: "White", value: "#ffffff" },
  { name: "Snow", value: "#f0f0f0" },
  { name: "Baby Blue", value: "#89CFF0" },
  { name: "Sky Blue", value: "#87CEEB" },
  { name: "Electric Blue", value: "#0080ff" },
  { name: "Royal Blue", value: "#4169E1" },
  { name: "Pink", value: "#FF69B4" },
  { name: "Rose", value: "#FF007F" },
  { name: "Blush", value: "#DE5D83" },
  { name: "Lavender", value: "#E6E6FA" },
  { name: "Lilac", value: "#C8A2C8" },
  { name: "Purple", value: "#A020F0" },
  { name: "Coral", value: "#FF7F50" },
  { name: "Peach", value: "#FFCBA4" },
  { name: "Gold", value: "#FFD700" },
  { name: "Amber", value: "#FFBF00" },
  { name: "Mint", value: "#98FB98" },
  { name: "Teal", value: "#008080" },
  { name: "Cyan", value: "#00FFFF" },
  { name: "Red", value: "#FF4444" },
  { name: "Crimson", value: "#DC143C" },
  { name: "Sunset Orange", value: "#FF6347" },
  { name: "Lime", value: "#32CD32" },
];
