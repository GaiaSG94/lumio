# Lumio — Submission and compliance

Project: **Lumio — one lesson, one animated video**
Public repository: https://github.com/GaiaSG94/lumio

This document records how the submission satisfies the six submission rules. It was written during the build session together with the application code and documentation.

## Submission status

> **DEADLINE: [to be filled from the official hackathon page before submission]**

No deadline was provided in the build brief. The value above is a deliberate placeholder: the submitter must consult the official hackathon page, verify the published submission deadline, replace this placeholder with the confirmed deadline, and submit before it. **No submission was made by the agent.** Creating this documentation, including this file, does not constitute a submission to any hackathon.

| # | Rule | Status | Where addressed |
|---|---|---|---|
| 1 | Submit before the published deadline | Open — action required by submitter | [1. Deadline](#1-deadline) |
| 2 | Distinguish event work from pre-existing code, templates or assets | Compliant | [2. Origin of the work](#2-origin-of-the-work) |
| 3 | Credit external libraries, datasets, assets and AI-assisted work | Compliant | [3. Credits](#3-credits) |
| 4 | Use materials you have permission to use | Compliant | [4. Permissions](#4-permissions) |
| 5 | Expose no passwords, API keys, private information or confidential data | Compliant | [5. Secrets and private data](#5-secrets-and-private-data) |
| 6 | Make the demonstration accessible to judges and explain setup | Compliant | [6. Judge demo and setup](#6-judge-demo-and-setup) |

## 1. Deadline

The brief contains no deadline, hackathon name, prize amount or event date, and none has been invented here. Before submitting, the submitter must:

1. Read the deadline from the official hackathon page.
2. Replace `DEADLINE: [to be filled from the official hackathon page before submission]` above with that value.
3. Submit the project before that deadline.

The agent has not submitted this project anywhere.

## 2. Origin of the work

All application code, configuration, UI, tests and documentation in this repository were authored during this build session. No starter template, copied repository or pre-existing asset was reused. No dates are asserted: "during this build session" is the time reference throughout.

| Item | Origin | When |
|---|---|---|
| Next.js App Router pages and API routes (`src/app/`) | Written for this project | During this build session |
| UI components: home, Studio, player, quiz, brand (`src/components/`) | Written for this project | During this build session |
| Domain model and Zod schema (`src/lib/schema.ts`, `src/lib/types.ts`) | Written for this project | During this build session |
| LLM abstraction and local/Anthropic/gateway providers (`src/lib/llm/`) | Written for this project | During this build session |
| TTS abstraction and local/ElevenLabs providers (`src/lib/tts/`) | Written for this project | During this build session |
| Generation, chat patch pipeline and step queue (`src/lib/pipeline/`) | Written for this project | During this build session |
| Local JSON repository, SRT splitting and helpers (`src/lib/storage.ts`, `srt.ts`, `time.ts`, `ids.ts`, `cn.ts`) | Written for this project | During this build session |
| Demo storyboard and original demo lesson text (`src/lib/demo-storyboard.ts`) | Original content written for this project | During this build session |
| Remotion compositions and render script (`remotion/`) | Written for this project | During this build session |
| Unit tests and end-to-end tests (`tests/`) | Written for this project | During this build session |
| Project configuration (`package.json`, `next.config.ts`, `tailwind.config.ts`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.eslintrc.json`, `postcss.config.js`) | Written for this project | During this build session |
| `README.md`, `.env.example`, `SUBMISSION.md` | Written for this project | During this build session |
| Next.js, React, Tailwind CSS, Zod, Lucide, clsx, Remotion and the listed dev tools | External open-source dependencies, installed via npm; not authored here | Pre-existing third-party packages |
| Chrome/Edge and FFmpeg | External system tools, invoked at render time; not bundled | Pre-existing system tools |
| Bricolage Grotesque and Inter | External fonts loaded from Google Fonts via CSS `@import`; not bundled as files | Pre-existing third-party fonts |
| ElevenLabs and InferHub services | External runtime services, accessed only with the submitter's own injected credentials | Pre-existing third-party services |
| Third-party datasets, images or audio files | None bundled | Not applicable |

## 3. Credits

### Libraries and tools

License names below are given only where known with confidence; otherwise the package license file is referenced rather than guessed.

| Dependency | License |
|---|---|
| Next.js (`next`, `eslint-config-next`) | MIT |
| React and React DOM | MIT |
| Tailwind CSS | MIT |
| Zod | MIT |
| clsx | MIT |
| Lucide icons (`lucide-react`) | See package license |
| Remotion (`remotion`, `@remotion/bundler`, `@remotion/renderer`) | See package license |
| TypeScript | Apache-2.0 |
| ESLint | MIT |
| Vitest | MIT |
| @vitejs/plugin-react | MIT |
| Playwright (`@playwright/test`) | Apache-2.0 |
| jsdom | MIT |
| Testing Library (`@testing-library/react`, `@testing-library/jest-dom`) | MIT |
| PostCSS | MIT |
| Autoprefixer | MIT |
| FFmpeg (system tool, not bundled) | See the license of the installed build |
| Chrome/Edge (system browser, not bundled) | See the browser's own license |

### Fonts

- **Bricolage Grotesque** — SIL Open Font License (OFL), loaded from Google Fonts via CSS `@import`.
- **Inter** — SIL Open Font License (OFL), loaded from Google Fonts via CSS `@import`.

No font files are bundled in the repository.

### Datasets and media

No third-party dataset, image, audio or video file is bundled. The demo storyboard, lesson text and quiz questions are original content written for this project. The ElevenLabs voice named "gaia" is the voice of the submitter's own account and is used only at runtime with that account's credentials.

### AI-assisted work

- The application code, configuration, UI, tests and documentation were generated with the assistance of the **opencode** AI assistant and reviewed in this build session.
- At runtime, storyboards and quiz content can be generated by a Large Language Model through the InferHub gateway or a direct Claude API key, when such a key is injected. With no key, Lumio uses its deterministic local provider instead.
- At runtime, voiceover can be generated by **ElevenLabs** from the user's own account, when a key is injected. With no key, the local TTS provider produces silence with estimated durations.

## 4. Permissions

Lumio uses only:

- openly licensed packages and fonts as credited above;
- original content written for this project, including the demo "Photosynthesis" lesson text, storyboard scenes and quiz questions;
- the submitter's own ElevenLabs voice "gaia" and the submitter's own InferHub/Claude accounts, used at runtime only.

No copyrighted course material, stock media, paid asset, third-party dataset or copied source repository is bundled or reproduced. External services are called only by the user who supplies their own credentials.

## 5. Secrets and private data

- `.env.example` contains **placeholders and non-secret defaults only**: empty API key fields, endpoint/model names, cost limits, the local data directory, the public default voice ID, and empty V2 fields. No real credential value appears in it.
- `.env`, `.env.local`, `.data`, `.data/*`, `node_modules`, `.next`, `out`, `coverage`, `playwright-report`, `test-results`, `*.tsbuildinfo`, `.DS_Store` and npm debug logs are excluded by `.gitignore`.
- Real secrets are injected **in memory only** through `HACKATONS/tools/with-secrets.ps1` using a whitelist (`-Only "ENV_USER_INFERHUB_API_KEY,SCAN_ELEVENLABS_1,SCAN_ELEVENLABS_2"`). They are read from environment variables by the application, are never written to `.env`, a log file or the repository, and no value is printed in chat or console output.
- Verification performed for this document: the `.gitignore` file was read, and all tracked files were scanned for credential-shaped patterns (API key prefixes, inline `xi-api-key` values, AWS access key IDs and private key headers). Result: **0 matches across all tracked files**. No secret value was printed or reproduced here.

If a credential were ever exposed, it would be rotated in its provider (Bitwarden for the injected secrets) and the occurrence removed before submission.

## 6. Judge demo and setup

### Judge-facing demo path

1. Open the public repository: https://github.com/GaiaSG94/lumio
2. Run `npm install && npm run dev`.
3. Open http://localhost:3000.
4. Click the **Photosynthesis** suggestion, then submit.
5. Watch the Studio generate the five steps (Script, Voiceover, Visuals, Rendering, Subtitles).
6. Open the **Script** tab to read the generated storyboard.
7. In chat, type **Shorter** to see version 2 of the script (only affected scenes change; version and history are tracked).
8. Open the share link to view the student player and the quiz.

### Setup requirements

- Node.js 20 or newer and npm.
- Internet access for the first `npm install` (and for the Google Fonts `@import`).
- **Demo mode works with no keys at all**: no database, no account and no external service is needed.
- Optional real generation requires injected InferHub (`ENV_USER_INFERHUB_API_KEY`) and/or ElevenLabs (`SCAN_ELEVENLABS_1`, `SCAN_ELEVENLABS_2`) secrets, supplied through `with-secrets.ps1` as described above. Direct Claude access uses `ANTHROPIC_API_KEY`.
- MP4 rendering requires FFmpeg and Chrome/Edge (auto-detected) or a headless browser download on first render. The in-browser preview and the whole demo path above work without MP4 rendering.
- Tests and checks: `npm test` (unit), `npm run test:e2e` (end-to-end journey), `npm run lint`, `npm run typecheck`.
