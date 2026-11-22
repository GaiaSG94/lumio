import { writeAsset } from "../storage";
import { estimateDuration, type SpeakInput, type SpeakResult, type TtsProvider } from "./types";

const DEFAULT_VOICE_ID = "hUgFhs9U5VcF4E65CSsv";

export const localTts: TtsProvider = {
  name: "local-silence",
  async speak(input: SpeakInput): Promise<SpeakResult> {
    return { url: null, duration: estimateDuration(input.text), provider: this.name };
  },
};

function elevenLabsKeys(): string[] {
  return [
    process.env.TTS_API_KEY,
    process.env.SCAN_ELEVENLABS_1,
    process.env.SCAN_ELEVENLABS_2,
  ].filter((key): key is string => Boolean(key));
}

async function speakWithKey(input: SpeakInput, apiKey: string): Promise<SpeakResult> {
  const voiceId = process.env.ELEVENLABS_VOICE_ID || DEFAULT_VOICE_ID;
  const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`, {
    method: "POST",
    headers: {
      "xi-api-key": apiKey,
      "content-type": "application/json",
      accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text: input.text,
      model_id: "eleven_multilingual_v2",
      voice_settings: { stability: 0.5, similarity_boost: 0.7 },
    }),
  });
  if (!response.ok) throw new Error(`ElevenLabs HTTP ${response.status}`);
  const buffer = Buffer.from(await response.arrayBuffer());
  const url = await writeAsset([input.projectId, `${input.sceneId}.mp3`], buffer);
  return { url, duration: estimateDuration(input.text), provider: "elevenlabs" };
}

export const elevenLabsTts: TtsProvider = {
  name: "elevenlabs",
  async speak(input: SpeakInput): Promise<SpeakResult> {
    const keys = elevenLabsKeys();
    if (!keys.length) throw new Error("Missing ElevenLabs API key");
    let lastError: unknown;
    for (const key of keys) {
      try {
        return await speakWithKey(input, key);
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError instanceof Error ? lastError : new Error("ElevenLabs request failed");
  },
};

export function getTts(): TtsProvider {
  const explicit = process.env.TTS_PROVIDER;
  if (explicit === "local") return localTts;
  if (explicit === "elevenlabs" || elevenLabsKeys().length > 0) return elevenLabsTts;
  return localTts;
}
