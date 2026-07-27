type ParsedVoiceTask = {
  title: string;
  description: string;
  hasStructuredFields: boolean;
};

export function parseVoiceTaskTranscript(transcript: string): ParsedVoiceTask {
  const normalizedTranscript = transcript.replace(/[\n\r]+/g, " ").replace(/\s+/g, " ").trim();

  if (!normalizedTranscript) {
    return {
      title: "",
      description: "",
      hasStructuredFields: false,
    };
  }

  const titleMatch = normalizedTranscript.match(/(?:^|\b)(?:the\s+)?title\s*(?:is|:|=)\s*(.+?)(?=(?:\b(?:the\s+)?description\s*(?:is|:|=)|$))/i);
  const descriptionMatch = normalizedTranscript.match(/(?:^|\b)(?:the\s+)?description\s*(?:is|:|=)\s*(.+)$/i);

  const parsedTitle = titleMatch?.[1]?.trim() ?? "";
  const parsedDescription = descriptionMatch?.[1]?.trim() ?? "";

  if (parsedTitle || parsedDescription) {
    return {
      title: parsedTitle,
      description: parsedDescription,
      hasStructuredFields: true,
    };
  }

  return {
    title: normalizedTranscript,
    description: "",
    hasStructuredFields: false,
  };
}