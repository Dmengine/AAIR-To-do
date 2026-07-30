import { describe, expect, it } from '@jest/globals';
import { parseVoiceTaskTranscript } from './voiceTaskParser';

describe('parseVoiceTaskTranscript', () => {
  it('parses a structured title and description', () => {
    const result = parseVoiceTaskTranscript('Title is Buy milk. Description is Pick up oat milk.');

    expect(result).toEqual({
      title: 'Buy milk.',
      description: 'Pick up oat milk.',
      hasStructuredFields: true,
    });
  });

  it('falls back to the full transcript when no structured fields are present', () => {
    const result = parseVoiceTaskTranscript('Call the dentist tomorrow');

    expect(result).toEqual({
      title: 'Call the dentist tomorrow',
      description: '',
      hasStructuredFields: false,
    });
  });
});