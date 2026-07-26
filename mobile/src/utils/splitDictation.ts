export function splitDictation(transcript: string): string[] {
  const cleanedTranscript = transcript
    .replace(/[\n\r]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedTranscript) {
    return [];
  }

  const normalized = cleanedTranscript
    .replace(/\b(and then|then)\b/gi, ".")
    .replace(/[•;]+/g, ".");

  const pieces = normalized
    .split(/(?:,|\.|\?|!|\band\b)/gi)
    .map((piece) => piece.trim())
    .filter(Boolean)
    .map((piece) => piece.replace(/^to\s+/i, ""));

  if (pieces.length === 0) {
    return [cleanedTranscript];
  }

  return pieces.map((piece) => piece.replace(/^and\s+/i, "").trim()).filter(Boolean);
}
