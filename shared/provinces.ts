export const PNG_PROVINCES = [
  "Bougainville",
  "Central",
  "Chimbu",
  "East New Britain",
  "East Sepik",
  "Eastern Highlands",
  "Enga",
  "Gulf",
  "Hela",
  "Jiwaka",
  "Madang",
  "Manus",
  "Milne Bay",
  "Morobe",
  "National Capital District",
  "New Ireland",
  "Oro",
  "Sandaun",
  "Southern Highlands",
  "West New Britain",
  "Western",
  "Western Highlands",
] as const;

export type PngProvince = (typeof PNG_PROVINCES)[number];

export function isValidProvince(value: string): value is PngProvince {
  return (PNG_PROVINCES as readonly string[]).includes(value);
}
