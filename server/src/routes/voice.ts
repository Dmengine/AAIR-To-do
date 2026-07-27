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

    if (!env.assemblyAiApiKey) {
      response.status(503).json({ error: "Voice transcription is not configured." });
      return;
    }

    const audioUrl = await uploadToAssemblyAI(uploadedAudio.buffer, uploadedAudio.mimetype);
    const transcriptId = await createAssemblyAITranscript(audioUrl);
    const transcriptText = await waitForAssemblyAITranscript(transcriptId);

    response.json({ transcript: transcriptText ?? transcriptOverride });
  } catch (error) {
    console.warn(`Voice transcription failed. ${error instanceof Error ? error.message : "Unknown error."}`);
    response.status(503).json({ error: "Voice transcription failed." });
  }
});

async function uploadToAssemblyAI(audioBuffer: Buffer, mimeType: string): Promise<string> {
  const uploadResponse = await fetch("https://api.assemblyai.com/v2/upload", {
    method: "POST",
    headers: {
      authorization: env.assemblyAiApiKey,
    },
    body: audioBuffer,
  });

  if (!uploadResponse.ok) {
    const errorMessage = await readAssemblyAiError(uploadResponse, "AssemblyAI upload failed");
    throw new Error(errorMessage);
  }

  const uploadPayload = (await uploadResponse.json()) as { upload_url?: string };
  if (!uploadPayload.upload_url) {
    throw new Error("AssemblyAI upload did not return an upload URL.");
  }

  return uploadPayload.upload_url;
}

async function createAssemblyAITranscript(audioUrl: string): Promise<string> {
  const transcriptResponse = await fetch("https://api.assemblyai.com/v2/transcript", {
    method: "POST",
    headers: {
      authorization: env.assemblyAiApiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      audio_url: audioUrl,
      punctuate: true,
      format_text: true,
    }),
  });

  if (!transcriptResponse.ok) {
    const errorMessage = await readAssemblyAiError(transcriptResponse, "AssemblyAI transcript creation failed");
    throw new Error(errorMessage);
  }

  const transcriptPayload = (await transcriptResponse.json()) as { id?: string };
  if (!transcriptPayload.id) {
    throw new Error("AssemblyAI transcript creation did not return an id.");
  }

  return transcriptPayload.id;
}

async function waitForAssemblyAITranscript(transcriptId: string): Promise<string> {
  const timeoutMs = 60_000;
  const startTime = Date.now();

  while (Date.now() - startTime < timeoutMs) {
    const transcriptResponse = await fetch(`https://api.assemblyai.com/v2/transcript/${transcriptId}`, {
      headers: {
        authorization: env.assemblyAiApiKey,
      },
    });

    if (!transcriptResponse.ok) {
      const errorMessage = await readAssemblyAiError(transcriptResponse, "AssemblyAI transcript polling failed");
      throw new Error(errorMessage);
    }

    const transcriptPayload = (await transcriptResponse.json()) as { status?: string; text?: string; error?: string };

    if (transcriptPayload.status === "completed") {
      return transcriptPayload.text?.trim() ?? "";
    }

    if (transcriptPayload.status === "error") {
      throw new Error(transcriptPayload.error ?? "AssemblyAI transcription failed.");
    }

    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  throw new Error("AssemblyAI transcription timed out.");
}

async function readAssemblyAiError(response: Response, fallbackMessage: string): Promise<string> {
  const errorPayload = (await response.json().catch(() => null)) as
    | { error?: string | { message?: string; code?: string } }
    | null;

  if (!errorPayload?.error) {
    return `${fallbackMessage} with status ${response.status}`;
  }

  if (typeof errorPayload.error === "string") {
    return `${fallbackMessage}: ${errorPayload.error}`;
  }

  const errorCode = errorPayload.error.code ? `${errorPayload.error.code}: ` : "";
  const errorMessage = errorPayload.error.message ?? `status ${response.status}`;
  return `${fallbackMessage}: ${errorCode}${errorMessage}`;
}
