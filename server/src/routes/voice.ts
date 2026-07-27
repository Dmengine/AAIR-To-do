import { Router } from "express";
import multer from "multer";

import { env } from "../env.js";

export const voiceRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

voiceRouter.post("/transcribe", upload.single("audio"), async (request, response, next) => {
  try {
    const transcriptOverride = typeof request.body?.transcript === "string" ? request.body.transcript.trim() : "";
    const uploadedAudio = request.file;

    if (!uploadedAudio && transcriptOverride) {
      response.json({ transcript: transcriptOverride });
      return;
    }

    if (!uploadedAudio) {
      response.status(400).json({ error: "Audio file is required." });
      return;
    }

    if (!env.openAiApiKey) {
      response.status(503).json({ error: "Voice transcription is not configured." });
      return;
    }

    const formData = new FormData();
    formData.append("model", "whisper-1");
    formData.append(
      "file",
      new Blob([uploadedAudio.buffer], { type: uploadedAudio.mimetype }),
      uploadedAudio.originalname,
    );

    const transcriptionResponse = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.openAiApiKey}`,
      },
      body: formData,
    });

    if (!transcriptionResponse.ok) {
      const errorPayload = (await transcriptionResponse.json().catch(() => null)) as
        | { error?: { message?: string; code?: string } }
        | null;

      const errorMessage = errorPayload?.error?.message ?? `OpenAI transcription failed with status ${transcriptionResponse.status}`;
      const errorCode = errorPayload?.error?.code;

      console.warn(`Voice transcription unavailable. ${errorCode ? `${errorCode}: ` : ""}${errorMessage}`);
      response.status(503).json({ error: errorMessage });
      return;
    }

    const transcriptionPayload = (await transcriptionResponse.json()) as { text?: string };
    response.json({ transcript: transcriptionPayload.text ?? transcriptOverride });
  } catch (error) {
    console.warn(`Voice transcription failed. ${error instanceof Error ? error.message : "Unknown error."}`);
    response.status(503).json({ error: "Voice transcription failed." });
  }
});
