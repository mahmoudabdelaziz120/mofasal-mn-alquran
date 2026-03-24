import React from "react";
import { TAJWEED_COLORS_DARK, TAJWEED_COLORS_LIGHT } from "@/data/surahs";

/**
 * Parse AlQuran.cloud tajweed bracket format into React elements.
 * Format: [code[text] or [code:id[text]
 * Regex captures the code letter(s) and the enclosed text.
 */
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

  // Reset regex
  TAJWEED_REGEX.lastIndex = 0;

  while ((match = TAJWEED_REGEX.exec(text)) !== null) {
    // Add plain text before this match
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

  // Add remaining plain text
  if (lastIndex < text.length) {
    result.push(text.slice(lastIndex));
  }

  return result;
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
