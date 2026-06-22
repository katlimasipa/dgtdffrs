import { TriggerMode } from '../store/bot-settings-store';

export interface PatternMatch {
  matched: boolean;
  patternName: string;
  matchedDigits: number[];
}

export function detectPattern(digits: number[], mode: TriggerMode, targetDigit: number, streakLength: number): PatternMatch {
  if (digits.length < streakLength) {
    return { matched: false, patternName: mode, matchedDigits: [] };
  }

  const recent = digits.slice(-streakLength);

  switch (mode) {
    case 'SPECIFIC_DIGIT':
      return {
        matched: recent.every((d) => d === targetDigit),
        patternName: `Specific Digit (${targetDigit}) x${streakLength}`,
        matchedDigits: recent,
      };

    case 'ANY_DIGIT':
      const firstDigit = recent[0];
      return {
        matched: recent.every((d) => d === firstDigit),
        patternName: `Any Digit x${streakLength}`,
        matchedDigits: recent,
      };

    case 'ODD_STREAK':
      return {
        matched: recent.every((d) => d % 2 !== 0),
        patternName: `Odd Streak x${streakLength}`,
        matchedDigits: recent,
      };

    case 'EVEN_STREAK':
      return {
        matched: recent.every((d) => d % 2 === 0),
        patternName: `Even Streak x${streakLength}`,
        matchedDigits: recent,
      };

    case 'XXYYY':
      // Needs exactly 5 digits for this specific pattern test
      if (digits.length < 5) return { matched: false, patternName: 'XXYYY', matchedDigits: [] };
      const last5 = digits.slice(-5);
      const x1 = last5[0], x2 = last5[1];
      const y1 = last5[2], y2 = last5[3], y3 = last5[4];
      const isXXYYY = (x1 === x2) && (y1 === y2 && y2 === y3) && (x1 !== y1);
      return {
        matched: isXXYYY,
        patternName: 'XXYYY',
        matchedDigits: last5,
      };

    case 'XXXYY':
      // Needs exactly 5 digits
      if (digits.length < 5) return { matched: false, patternName: 'XXXYY', matchedDigits: [] };
      const last5b = digits.slice(-5);
      const xx1 = last5b[0], xx2 = last5b[1], xx3 = last5b[2];
      const yy1 = last5b[3], yy2 = last5b[4];
      const isXXXYY = (xx1 === xx2 && xx2 === xx3) && (yy1 === yy2) && (xx1 !== yy1);
      return {
        matched: isXXXYY,
        patternName: 'XXXYY',
        matchedDigits: last5b,
      };

    default:
      return { matched: false, patternName: 'Unknown', matchedDigits: [] };
  }
}
