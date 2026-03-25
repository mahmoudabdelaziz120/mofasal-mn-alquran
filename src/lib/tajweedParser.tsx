import React from "react";
import { TAJWEED_COLORS_DARK, TAJWEED_COLORS_LIGHT } from "@/data/surahs";

const TAJWEED_REGEX = /\[([a-z]+)(?::\d+)?\[([^\]]+)\]/g;

export function parseTajweedText(
  text: string,
  isDarkMode: boolean
): React.ReactNode[] {
  const colors = isDarkMode ? TAJWEED_COLORS_DARK : TAJWEED_COLORS_LIGHT;
  const result: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  let key = 0;

  TAJWEED_REGEX.lastIndex = 0;

  while ((match = TAJWEED_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      result.push(text.slice(lastIndex, match.index));
    }
    const code = match[1];
    const innerText = match[2];
    const color = colors[code] || "inherit";
    result.push(
      <span key={key++} style={{ color }}>{innerText}</span>
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
}

/**
 * Strip all tajweed bracket codes, returning plain Arabic text.
 */
export function stripTajweedCodes(text: string): string {
  TAJWEED_REGEX.lastIndex = 0;
  return text.replace(TAJWEED_REGEX, "$2");
}

/**
 * Extract unique tajweed codes found in a text string.
 */
export function extractTajweedCodes(text: string): string[] {
  const codes = new Set<string>();
  TAJWEED_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TAJWEED_REGEX.exec(text)) !== null) {
    codes.add(match[1]);
  }
  return Array.from(codes);
}

export interface TajweedRuleOccurrence {
  code: string;
  word: string;       // the tagged word itself
  context: string;    // surrounding context (nearby words)
}

/**
 * Extract tajweed rule occurrences with surrounding context words.
 * Returns array of { code, word, context } for each tajweed match.
 */
export function extractTajweedOccurrences(text: string): TajweedRuleOccurrence[] {
  const plainText = stripTajweedCodes(text);
  const results: TajweedRuleOccurrence[] = [];
  const seen = new Set<string>(); // dedupe by code

  TAJWEED_REGEX.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = TAJWEED_REGEX.exec(text)) !== null) {
    const code = match[1];
    const word = match[2];

    if (seen.has(code)) continue;
    seen.add(code);

    // Find the word position in plain text and extract surrounding context
    const wordIdx = plainText.indexOf(word);
    if (wordIdx === -1) {
      results.push({ code, word, context: word });
      continue;
    }

    // Get ~2 words before and after
    const beforeText = plainText.slice(Math.max(0, wordIdx - 30), wordIdx);
    const afterText = plainText.slice(wordIdx + word.length, Math.min(plainText.length, wordIdx + word.length + 30));

    // Trim to word boundaries
    const beforeWords = beforeText.trim().split(/\s+/).slice(-2).join(" ");
    const afterWords = afterText.trim().split(/\s+/).slice(0, 2).join(" ");

    const context = [beforeWords, word, afterWords].filter(Boolean).join(" ");
    results.push({ code, word, context });
  }

  return results;
}
