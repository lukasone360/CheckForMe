import type { Severity } from "./types";
import { isBidiOverride, isZeroWidth } from "./unicode";

export type InjectionMatch = {
  id: string;
  severity: Severity;
  label: string;
  start: number;
  end: number;
  snippet: string;
};

type Pattern = {
  id: string;
  re: RegExp;
  severity: Severity;
  label: string;
};

/**
 * Phrases teachers plant so a model that actually read the file gives itself away.
 * Patterns are intentionally specific so ordinary homework wording ("mention two
 * examples", "include a bibliography") is not flagged.
 */
const PATTERNS: Pattern[] = [
  {
    id: "address-ai",
    re: /if you(?: are|'re|’re) an? (?:ai\b|a\.i\.|artificial intelligence|language model|large language model|llm\b|chatbot|chatgpt|gpt(?:-\d+)?|claude|gemini|copilot)/i,
    severity: "high",
    label: "Addresses an AI directly",
  },
  {
    id: "ignore-previous",
    re: /ignore (?:all |any )?(?:previous|prior|above|earlier) (?:instructions|prompts|directions|commands|rules)/i,
    severity: "high",
    label: "Tells the model to ignore previous instructions",
  },
  {
    id: "disregard",
    re: /disregard (?:all |any )?(?:previous|prior|above|your|the) (?:instructions|prompts|rules|directions)/i,
    severity: "high",
    label: "Tells the model to disregard instructions",
  },
  {
    id: "forget",
    re: /forget (?:all |any )?(?:previous|prior|your) (?:instructions|prompts|rules)/i,
    severity: "high",
    label: "Tells the model to forget earlier instructions",
  },
  {
    id: "do-not-tell",
    re: /do ?n[o’']t (?:tell|inform|alert|notify|mention this to|reveal this to) (?:the )?(?:student|user|human|reader)/i,
    severity: "high",
    label: "Tells the model to hide this from the reader",
  },
  {
    id: "hidden-instruction",
    re: /\bhidden instruction\b/i,
    severity: "high",
    label: "Labels itself as a hidden instruction",
  },
  {
    id: "real-task",
    re: /your (?:real|actual|true|secret) (?:task|instructions|assignment|job) (?:is|are)/i,
    severity: "high",
    label: "Replaces the assignment with a secret task",
  },
  {
    id: "start-with",
    re: /(?:start|begin|open) (?:your )?(?:response|answer|reply|essay) with\b/i,
    severity: "high",
    label: "Tells the model how to start its answer",
  },
  {
    id: "include-word",
    re: /include the (?:word|phrase|sentence|number|token)\b/i,
    severity: "high",
    label: "Tells the model to include a specific word or phrase",
  },
  {
    id: "insert-phrase",
    re: /insert the (?:following )?(?:phrase|sentence|word|line)\b/i,
    severity: "high",
    label: "Tells the model to insert a phrase",
  },
  {
    id: "mention-word",
    re: /\bmention the word\b/i,
    severity: "high",
    label: "Tells the model to mention a specific word",
  },
  {
    id: "new-instructions",
    re: /\b(?:new instructions|override (?:the )?instructions|from now on you)\b/i,
    severity: "high",
    label: "Attempts to override the model",
  },
  {
    id: "respond-with",
    re: /\b(?:respond|reply|answer) (?:only )?with (?:the word|exactly)\b/i,
    severity: "high",
    label: "Forces a specific answer",
  },
  {
    id: "grading-trap",
    re: /if (?:this|the) (?:answer|response|essay|submission|text) (?:was|is|were) (?:written|generated|produced|created) by (?:an? )?(?:ai\b|chatgpt|a language model|an llm)/i,
    severity: "high",
    label: "Trap that triggers when an AI wrote the answer",
  },
  {
    id: "note-to-ai",
    re: /\b(?:note|attention|message) to (?:the )?(?:ai\b|model|chatgpt|assistant)\b/i,
    severity: "high",
    label: "Message addressed to an AI",
  },
  {
    id: "mention-imperative",
    re: /\b(?:be sure to|make sure to|always|please) mention\b/i,
    severity: "medium",
    label: "Tells the model to mention something",
  },
  {
    id: "dear-ai",
    re: /\b(?:dear|hello|hey) (?:ai\b|chatgpt|claude|gemini|language model)\b/i,
    severity: "medium",
    label: "Addresses an AI assistant",
  },
  {
    id: "system-prompt",
    re: /\b(?:system prompt|developer message)\b/i,
    severity: "medium",
    label: "References a system prompt",
  },
];

function stripForMatch(text: string): { text: string; map: number[] } {
  const chars: string[] = [];
  const map: number[] = [];
  let unit = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0) ?? 0;
    if (!isZeroWidth(code) && !isBidiOverride(code)) {
      const norm = ch.normalize("NFKC");
      let offset = 0;
      for (const part of norm) {
        chars.push(part);
        map.push(unit + offset);
        offset += part.length;
      }
    }
    unit += ch.length;
  }
  return { text: chars.join(""), map };
}

function sentenceBounds(text: string, start: number, end: number): { start: number; end: number } {
  let from = start;
  while (from > 0 && !/[\n.!?]/.test(text[from - 1] ?? "")) from -= 1;
  if (from < start && /[.!?]/.test(text[from] ?? "")) from += 1;
  while (from < start && /\s/.test(text[from] ?? "")) from += 1;

  let to = end;
  while (to < text.length && !/[\n.!?]/.test(text[to] ?? "")) to += 1;
  if (to < text.length && /[.!?]/.test(text[to] ?? "")) to += 1;
  return { start: from, end: to };
}

export function findInjections(text: string): InjectionMatch[] {
  if (!text.trim()) return [];
  const stripped = stripForMatch(text);
  const found: InjectionMatch[] = [];

  for (const pattern of PATTERNS) {
    const re = new RegExp(pattern.re.source, pattern.re.flags.includes("g") ? pattern.re.flags : pattern.re.flags + "g");
    let match: RegExpExecArray | null;
    while ((match = re.exec(stripped.text))) {
      const startUnit = stripped.map[match.index] ?? 0;
      const last = match.index + match[0].length - 1;
      const endUnit =
        (stripped.map[last] ?? startUnit) +
        (text[stripped.map[last] ?? 0] ? 1 : 0);
      const bounds = sentenceBounds(text, startUnit, Math.max(endUnit, startUnit + 1));
      const snippet = text.slice(bounds.start, bounds.end).trim();
      if (!snippet) continue;
      found.push({
        id: pattern.id,
        severity: pattern.severity,
        label: pattern.label,
        start: bounds.start,
        end: bounds.end,
        snippet,
      });
      if (match.index === re.lastIndex) re.lastIndex += 1;
    }
  }

  found.sort((a, b) => a.start - b.start || a.end - b.end);
  const unique: InjectionMatch[] = [];
  for (const item of found) {
    const duplicate = unique.some(
      (other) => other.id === item.id && other.snippet === item.snippet,
    );
    if (!duplicate) unique.push(item);
  }
  return unique.slice(0, 6);
}

/** Remove sentences that are high-confidence prompt injections. */
export function stripHighInjections(text: string): string {
  const matches = findInjections(text).filter((item) => item.severity === "high");
  if (matches.length === 0) return text;
  const ranges = matches
    .map((item) => ({ start: item.start, end: item.end }))
    .sort((a, b) => a.start - b.start);
  let cursor = 0;
  let out = "";
  for (const range of ranges) {
    if (range.end <= cursor) continue;
    out += text.slice(cursor, range.start);
    cursor = Math.max(cursor, range.end);
  }
  out += text.slice(cursor);
  return out.replace(/[ \t]{2,}/g, " ").replace(/ \n/g, "\n").trim();
}
