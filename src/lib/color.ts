import type { RGB } from "./types";

export const WHITE: RGB = [1, 1, 1];
export const BLACK: RGB = [0, 0, 0];

function linearize(channel: number): number {
  return channel <= 0.04045
    ? channel / 12.92
    : ((channel + 0.055) / 1.055) ** 2.4;
}

export function relativeLuminance(rgb: RGB): number {
  return (
    0.2126 * linearize(rgb[0]) +
    0.7152 * linearize(rgb[1]) +
    0.0722 * linearize(rgb[2])
  );
}

/** WCAG contrast ratio. 1 means the colors are identical. */
export function contrastRatio(foreground: RGB, background: RGB): number {
  const lighter = Math.max(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  const darker = Math.min(
    relativeLuminance(foreground),
    relativeLuminance(background),
  );
  return (lighter + 0.05) / (darker + 0.05);
}

export function blendOver(foreground: RGB, background: RGB, opacity: number): RGB {
  const alpha = clamp01(opacity);
  return [
    foreground[0] * alpha + background[0] * (1 - alpha),
    foreground[1] * alpha + background[1] * (1 - alpha),
    foreground[2] * alpha + background[2] * (1 - alpha),
  ];
}

export function isNearWhite(rgb: RGB): boolean {
  return rgb[0] >= 0.93 && rgb[1] >= 0.93 && rgb[2] >= 0.93;
}

export function hexToRgb(hex: string): RGB | undefined {
  const cleaned = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{6}$/.test(cleaned) && !/^[0-9a-fA-F]{8}$/.test(cleaned)) {
    return undefined;
  }
  const value = cleaned.length === 8 ? cleaned.slice(2) : cleaned;
  const r = Number.parseInt(value.slice(0, 2), 16) / 255;
  const g = Number.parseInt(value.slice(2, 4), 16) / 255;
  const b = Number.parseInt(value.slice(4, 6), 16) / 255;
  return [r, g, b];
}

export function clamp01(value: number): number {
  if (Number.isNaN(value)) return 1;
  return Math.min(1, Math.max(0, value));
}

/** Accepts 0–1 or 0–255 component lists from pdf.js. */
export function normalizeRgb(components: number[]): RGB | undefined {
  if (components.length < 3) return undefined;
  const [r, g, b] = components;
  if (![r, g, b].every((n) => Number.isFinite(n))) return undefined;
  if (r > 1 || g > 1 || b > 1) {
    return [clamp01(r / 255), clamp01(g / 255), clamp01(b / 255)];
  }
  return [clamp01(r), clamp01(g), clamp01(b)];
}

export function grayToRgb(gray: number): RGB {
  const value = gray > 1 ? gray / 255 : gray;
  const channel = clamp01(value);
  return [channel, channel, channel];
}

export function cmykToRgb(c: number, m: number, y: number, k: number): RGB {
  const scale = c > 1 || m > 1 || y > 1 || k > 1 ? 255 : 1;
  const cc = c / scale;
  const mm = m / scale;
  const yy = y / scale;
  const kk = k / scale;
  return [
    clamp01(1 - Math.min(1, cc * (1 - kk) + kk)),
    clamp01(1 - Math.min(1, mm * (1 - kk) + kk)),
    clamp01(1 - Math.min(1, yy * (1 - kk) + kk)),
  ];
}

export function formatRgb(rgb: RGB): string {
  const channel = (n: number) => Math.round(n * 255).toString(16).padStart(2, "0");
  return `#${channel(rgb[0])}${channel(rgb[1])}${channel(rgb[2])}`.toUpperCase();
}
