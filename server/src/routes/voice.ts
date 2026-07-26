import { Router } from "express";
import multer from "multer";
import OpenAI from "openai";
import { toFile } from "openai/uploads";

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
      response.json({ transcript: transcriptOverride || "Buy provisions and call mom" });
      return;
    }

    const client = new OpenAI({ apiKey: env.openAiApiKey });
    const file = await toFile(uploadedAudio.buffer, uploadedAudio.originalname, {
      type: uploadedAudio.mimetype,
    });

    const transcription = await client.audio.transcriptions.create({
      file,
      model: "whisper-1",
    });

    response.json({ transcript: transcription.text });
  } catch (error) {
    next(error);
  }
});
