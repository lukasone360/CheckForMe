import { findInjections } from "./injection";
import { findInvisible } from "./unicode";

export type MetadataSource = "Info" | "XMP";

export type MetadataField = {
  id: string;
  name: string;
  value: string;
  source: MetadataSource;
  suspicious: boolean;
  reason: string | null;
};

const INFO_LABELS: Record<string, string> = {
  Title: "Title",
  Author: "Author",
  Subject: "Subject",
  Keywords: "Keywords",
  Creator: "Creator",
  Producer: "Producer",
  CreationDate: "Creation date",
  ModDate: "Modification date",
  Trapped: "Trapped",
  PDFFormatVersion: "PDF version",
  Language: "Language",
  IsLinearized: "Linearized",
  IsAcroFormPresent: "AcroForm present",
  IsXFAPresent: "XFA present",
  IsCollectionPresent: "Collection present",
};

const INFO_ORDER = [
  "Title",
  "Author",
  "Subject",
  "Keywords",
  "Creator",
  "Producer",
  "CreationDate",
  "ModDate",
  "Trapped",
  "PDFFormatVersion",
  "Language",
  "IsLinearized",
  "IsAcroFormPresent",
  "IsXFAPresent",
  "IsCollectionPresent",
];

export const STANDARD_INFO_LABELS = [
  "Title",
  "Author",
  "Subject",
  "Keywords",
  "Creator",
  "Producer",
  "Creation date",
  "Modification date",
] as const;

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatPdfDate(raw: string): string | null {
  const match = /^D:(\d{4})(\d{2})?(\d{2})?(\d{2})?(\d{2})?(\d{2})?/.exec(raw.trim());
  if (!match) return null;
  const year = Number(match[1]);
  const month = match[2] ? Number(match[2]) : 1;
  const day = match[3] ? Number(match[3]) : 1;
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  let text = `${MONTHS[month - 1]} ${day}, ${year}`;
  if (match[4]) {
    const hh = match[4];
    const mm = match[5] ?? "00";
    const ss = match[6] ?? "00";
    text += `, ${hh}:${mm}:${ss}`;
  }
  return text;
}

export function presentMetadataValue(name: string, raw: string): string {
  if (/date/i.test(name) || /^D:\d{4}/.test(raw)) {
    const formatted = formatPdfDate(raw);
    if (formatted && formatted !== raw) return `${formatted} (${raw})`;
  }
  return raw;
}

function fieldKind(name: string): string {
  if (/keyword/i.test(name)) return "keywords";
  if (/subject|description/i.test(name)) return "subject";
  return name;
}

/** Flag instruction-like phrasing and invisible characters. Ordinary creator names stay clear. */
export function assessMetadataText(name: string, value: string): { suspicious: boolean; reason: string | null } {
  const injections = findInjections(value);
  if (injections.length > 0) {
    return {
      suspicious: true,
      reason: `Instructions in ${fieldKind(name)}: ${injections[0]?.label}.`,
    };
  }
  if (findInvisible(value).length > 0) {
    return { suspicious: true, reason: `Invisible characters in ${fieldKind(name)}.` };
  }
  return { suspicious: false, reason: null };
}

function flatten(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  if (typeof value === "number" && Number.isFinite(value)) return String(value);
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (Array.isArray(value)) {
    const parts = value.map((item) => flatten(item)).filter((item): item is string => item != null);
    return parts.length > 0 ? parts.join("; ") : null;
  }
  if (value && typeof value === "object" && "value" in value) {
    return flatten((value as { value: unknown }).value);
  }
  return null;
}

function pushField(
  fields: MetadataField[],
  source: MetadataSource,
  name: string,
  raw: string,
) {
  const assessment = assessMetadataText(name, raw);
  fields.push({
    id: `${source}-${fields.length}-${name}`,
    name,
    value: presentMetadataValue(name, raw),
    source,
    suspicious: assessment.suspicious,
    reason: assessment.reason,
  });
}

export function buildMetadataFields(
  info: Record<string, unknown> | null | undefined,
  xmpEntries: Array<[string, unknown]>,
  rawXmp?: string | null,
): MetadataField[] {
  const fields: MetadataField[] = [];
  const record = info ?? {};
  const seen = new Set<string>();
  const orderedKeys = [
    ...INFO_ORDER.filter((key) => key in record),
    ...Object.keys(record)
      .filter((key) => !INFO_ORDER.includes(key))
      .sort((a, b) => a.localeCompare(b)),
  ];
  for (const key of orderedKeys) {
    const raw = flatten(record[key]);
    if (!raw) continue;
    seen.add(key);
    pushField(fields, "Info", INFO_LABELS[key] ?? key, raw);
  }

  let xmpCount = 0;
  for (const [key, value] of xmpEntries) {
    const raw = flatten(value);
    if (!raw) continue;
    xmpCount += 1;
    pushField(fields, "XMP", key, raw);
  }

  const packet = rawXmp?.trim();
  if (xmpCount === 0 && packet) {
    const shown = packet.length > 600 ? `${packet.slice(0, 600)}…` : packet;
    pushField(fields, "XMP", "XMP packet", shown);
  }

  return fields;
}

export function missingStandardInfo(fields: MetadataField[]): string[] {
  const present = new Set(fields.filter((field) => field.source === "Info").map((field) => field.name));
  return STANDARD_INFO_LABELS.filter((name) => !present.has(name));
}
