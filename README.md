# Lumio — One lesson, one animated video

Lumio turns pasted course text into an educational animated video: storyboard, scenes, voiceover, subtitles and a quiz. It ships in a **no-key demo mode** that runs entirely locally, with optional real generation using accounts injected at runtime.

Public repository: https://github.com/GaiaSG94/lumio

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000, paste a text (or click a suggestion such as "Photosynthesis"), and the Studio opens while generation runs. No API key, database or external service is required for the demo.

### Real accounts (keys injected in memory, never written to disk)

From the `Downloads` root:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "HACKATONS/tools/with-secrets.ps1" -Only "ENV_USER_INFERHUB_API_KEY,SCAN_ELEVENLABS_1,SCAN_ELEVENLABS_2" cmd /c "cd /d <path>\lumio && npm run dev"
```

Lumio automatically detects `ENV_USER_INFERHUB_API_KEY` (LLM) and `SCAN_ELEVENLABS_1`/`SCAN_ELEVENLABS_2` (TTS, falling back from account 1 to account 2). No secret is written to `.env`, to logs, or to the repository. Direct Claude access is also supported by injecting `ANTHROPIC_API_KEY`; without it the InferHub gateway is used with `LLM_MODEL=combo/cheap`.

## Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and server |
| `npm test` | Vitest unit tests (schema, patch, SRT, local generation) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright journey: home -> Studio -> student view -> quiz |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run render:video -- <storyboard.json> <output.mp4>` | Standalone Remotion MP4 render |

## Environment variables

Copy `.env.example` to `.env.local` if you want local overrides. **All values are optional**: with no keys, Lumio uses its local providers.

| Variable | Description | Default |
|---|---|---|
| `ANTHROPIC_API_KEY` | Direct Claude API access | InferHub gateway, then local provider |
| `ANTHROPIC_MODEL` | Direct Claude model | `claude-sonnet-5-5` |
| `INFERHUB_API_KEY` / `ENV_USER_INFERHUB_API_KEY` | Gateway access (Claude/Cheap models) | Local provider |
| `LLM_BASE_URL`, `LLM_MODEL` | OpenAI-compatible gateway endpoint and model | `https://api.inferhub.dev/v1`, `combo/cheap` |
| `LLM_MAX_INPUT_PRICE`, `LLM_MAX_OUTPUT_PRICE` | Cost ceiling per request | `0.01`, `0.05` |
| `TTS_PROVIDER` | `elevenlabs` or `local` (silence + estimated durations) | `elevenlabs` when a key is present, otherwise `local` |
| `TTS_API_KEY`, `SCAN_ELEVENLABS_1`, `SCAN_ELEVENLABS_2` | ElevenLabs voiceover keys (1 -> 2 fallback) | None |
| `ELEVENLABS_VOICE_ID` | Default "gaia" voice of the account | `hUgFhs9U5VcF4E65CSsv` |
| `DATA_DIR` | Folder for projects and generated assets | `.data` |
| `CHROME_PATH` | Browser used by Remotion (auto-detected otherwise) | System Chrome/Edge, else headless download |

`S3_*` and `DATABASE_URL` are reserved for V2. Never place a real secret in the repository.

## Architecture

```
src/app/                 App Router pages: /, /p/[id], /v/[slug], /v/[slug]/quiz, /api/*
src/components/home/     Home screen and prompt composer (Aurora background)
src/components/studio/   Chat, preview, scene strip, script, export panel
src/components/player/   Animated scene, controls, student tabs, quiz
src/lib/schema.ts        Zod schema for the Storyboard and the patch
src/lib/llm/             LlmProvider interface + Anthropic, gateway, local providers
src/lib/tts/             TtsProvider interface + local and ElevenLabs providers
src/lib/pipeline/        Generation, chat-based patching, step queue
src/lib/srt.ts           Narration -> SRT/VTT cue splitting
src/lib/storage.ts       Local JSON repository and asset storage
remotion/                React compositions and MP4 render script
tests/unit, tests/e2e    Vitest and Playwright suites
```

The pipeline reports five steps to the Studio: **Script -> Voiceover -> Visuals -> Edit -> Subtitles**. The Studio polls `GET /api/projects/:id` while the job is active.

## User journey

1. **Home**: one text field, level and duration, four suggestions.
2. **Studio**: chat on the left, 16:9 preview and scene strip on the right, Script tab, export and share panel.
3. **Chat**: "Shorter", "More diagrams", "Slower voice", or a free-form instruction. The LLM returns a JSON patch; only affected scenes are re-synthesized, `version` is incremented and history is preserved.
4. **Student view** `/v/[slug]`: playback, chapters, highlighted transcript, timestamped notes in `localStorage`, active subtitles.
5. **Quiz** `/v/[slug]/quiz`: one question at a time, immediate feedback, "Review 2:15" jumps to the source scene, score saved through the API.

## Decisions and assumptions

- **Demo mode**: with no keys, local providers derive the storyboard strictly from the sentences of the input text (no invented facts) and build fill-in-the-blank questions from keywords; the local TTS provider estimates durations and emits no audio.
- **Storage**: a JSON repository under `.data/` behind a `store` interface, replaceable by Prisma/Postgres without touching the routes. This keeps `npm install && npm run dev` free of external services.
- **Video rendering**: the browser preview is a deterministic CSS composition; the MP4 is rendered by Remotion + FFmpeg. The "Generate MP4" button starts a background server render; the first render may download a headless browser.
- **Auth**: not implemented in the MVP (teachers create a project without an account, students access via link). Planned for V2 with Auth.js; `S3_*` storage and `DATABASE_URL` are likewise V2.
- **Formats and quality**: selectors are present in the export panel; the Remotion render is 1920x1080 / 30 fps, to be adapted for 9:16 and 1:1 in V2.
- **Accessibility**: targets of at least 44 px, `aria-label`, visible focus, AA contrast, and `prefers-reduced-motion` respected.

## Visual identity

A single violet accent: `#5B2EE8` primary, `#4A21D6` text on light backgrounds, `#8A6BFF` / `#C4AEFF` halos, `#E4DBFF` chips, `#F6F3FF` background. Headings use Bricolage Grotesque, body text uses Inter. The animated Aurora background is limited to the home screen; Studio and student screens stay sober.

## Submission and compliance

See [SUBMISSION.md](./SUBMISSION.md) for the compliance checklist, credits, secret-handling statement and judge demo path.
