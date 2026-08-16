import type { ColorMode } from "@/components/theme-provider";

export const COLOR_MODE_ORDER: ColorMode[] = [
  "amber",
  "blue",
  "pink",
  "rose",
  "emerald",
  "black",
];

export const COLOR_MODE_META: Record<
  Exclude<ColorMode, "black">,
  { label: string; hex: string }
> = {
  amber: { label: "Amber", hex: "#D97706" },
  blue: { label: "Blue", hex: "#9333EA" },
  pink: { label: "Pink", hex: "#DB2777" },
  rose: { label: "Rose", hex: "#E11D48" },
  emerald: { label: "Emerald", hex: "#059669" },
};

// "black" is the neutral/no-accent option — it tracks the theme's own
// foreground color, so it reads as "Black" in light mode and "White" in
// dark mode rather than showing a stale label/swatch.
export function getColorModeMeta(mode: ColorMode, theme: "light" | "dark") {
  if (mode === "black") {
    return theme === "dark"
      ? { label: "White", hex: "#FFFFFF" }
      : { label: "Black", hex: "#171717" };
  }
  return COLOR_MODE_META[mode];
}
