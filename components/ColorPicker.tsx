"use client";

import { ART_COLORS, type ArtColor, type ArtGradient } from "@/lib/colors";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";

interface ColorPickerProps {
  selectedColor: ArtColor;
  selectedGradient?: ArtGradient | null;
  onColorChange: (color: ArtColor) => void;
  onGradientChange?: (gradient: ArtGradient | null) => void;
}

export default function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <Select 
      value={selectedColor.name} 
      onValueChange={(name) => {
        const color = ART_COLORS.find(c => c.name === name);
        if (color) onColorChange(color);
      }}
    >
      <SelectTrigger className="h-9 w-full sm:w-[180px] bg-background/50 border-border text-xs font-mono">
        <div className="flex items-center gap-2">
          <div 
            className="w-3 h-3 rounded-full shrink-0 border border-border"
            style={{ background: selectedColor.value, boxShadow: `0 0 6px ${selectedColor.value}40` }}
          />
          <span className="truncate">{selectedColor.name}</span>
        </div>
      </SelectTrigger>

      <SelectContent className="bg-card border-border max-h-60 p-1">
        <div className="grid grid-cols-6 gap-1 p-2">
          {ART_COLORS.map((color) => (
            <button
              key={color.name}
              className={`w-7 h-7 rounded-md border transition-all hover:scale-110 ${
                selectedColor.name === color.name 
                  ? "border-primary ring-1 ring-primary scale-110" 
                  : "border-border/50 hover:border-primary/50"
              }`}
              style={{ 
                background: color.value,
                boxShadow: selectedColor.name === color.name ? `0 0 8px ${color.value}60` : undefined
              }}
              title={color.name}
              onClick={() => onColorChange(color)}
            />
          ))}
        </div>
      </SelectContent>
    </Select>
  );
}