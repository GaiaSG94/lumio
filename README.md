# Lumio — une leçon, une vidéo

Application web qui transforme un texte de cours en vidéo éducative animée : script, scènes, voix off, sous-titres et quiz. Livrée en **mode démo sans clé**, entièrement utilisable hors ligne.

## Démarrage

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000. Coller un texte (ou cliquer une suggestion), le Studio s'ouvre et la génération démarre.

### Comptes réels (clés injectées, rien sur disque)

Depuis la racine `Downloads` :

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File "HACKATONS/tools/with-secrets.ps1" -Only "ENV_USER_INFERHUB_API_KEY,SCAN_ELEVENLABS_1,SCAN_ELEVENLABS_2" cmd /c "cd /d <chemin>\lumio && npm run dev"
```

L'application détecte automatiquement `ENV_USER_INFERHUB_API_KEY` (LLM) et `SCAN_ELEVENLABS_1/2` (TTS, bascule sur le compte 2 en cas d'erreur du compte 1). Aucun secret n'est écrit dans `.env`, les logs ou le dépôt.

Accès Claude direct : renseigner `ANTHROPIC_API_KEY` dans le coffre puis l'injecter avec `-Only ANTHROPIC_API_KEY` (ou se connecter avec `claude /login` pour utiliser Claude Code). Sans cela, le routeur InferHub est utilisé avec `LLM_MODEL=combo/cheap`, seul modèle accessible avec les plafonds de coût du compte.

## Commandes

| Commande | Rôle |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm test` | Tests unitaires Vitest (schéma, patch, SRT, génération locale) |
| `npm run test:e2e` | Parcours Playwright accueil → studio → élève → quiz |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run render:video -- <storyboard.json> <sortie.mp4>` | Rendu Remotion standalone |

## Variables d'environnement

Copier `.env.example` vers `.env.local`. **Toutes les valeurs sont facultatives** : sans clé, Lumio utilise ses providers locaux.

| Variable | Rôle | Défaut |
|---|---|---|
| `ANTHROPIC_API_KEY` | Accès direct à l'API Claude | routeur InferHub, puis provider local |
| `ANTHROPIC_MODEL` | Modèle Claude direct | `claude-sonnet-5-5` |
| `INFERHUB_API_KEY` / `ENV_USER_INFERHUB_API_KEY` | Accès au routeur (modèles Claude/Cheap) | provider local |
| `LLM_BASE_URL`, `LLM_MODEL` | Routeur OpenAI-compatible | `https://api.inferhub.dev/v1`, `combo/cheap` |
| `LLM_MAX_INPUT_PRICE`, `LLM_MAX_OUTPUT_PRICE` | Plafond de coût par requête | `0.01`, `0.05` |
| `TTS_PROVIDER` | `elevenlabs` ou `local` (silence + durées estimées) | `elevenlabs` si une clé est présente |
| `TTS_API_KEY`, `SCAN_ELEVENLABS_1`, `SCAN_ELEVENLABS_2` | Voix off ElevenLabs (fallback 1 → 2) | — |
| `ELEVENLABS_VOICE_ID` | Voix par défaut « gaia » du compte | `hUgFhs9U5VcF4E65CSsv` |
| `DATA_DIR` | Dossier des projets et fichiers générés | `.data` |
| `CHROME_PATH` | Navigateur utilisé par Remotion (détecté automatiquement sinon) | Chrome/Edge du système, sinon téléchargement |

`S3_*` et `DATABASE_URL` sont réservés à la V2 (voir plus bas) ; ne jamais mettre de secret dans le dépôt.

## Architecture

```
src/app/                 Pages App Router : /, /p/[id], /v/[slug], /v/[slug]/quiz, /api/*
src/components/home/     Accueil et composeur (fond Aurore)
src/components/studio/   Chat, aperçu, bande de scènes, script, export
src/components/player/   Scène animée, contrôles, onglets élève, quiz
src/lib/schema.ts        Schéma Zod du Storyboard et du patch
src/lib/llm/             Interface LlmProvider + providers Anthropic et local
src/lib/tts/             Interface TtsProvider + providers local et ElevenLabs
src/lib/pipeline/        Génération, patch par chat, file d'étapes
src/lib/srt.ts           Découpage narration → cues SRT/VTT
src/lib/storage.ts       Dépôt JSON local + stockage des assets
remotion/                Compositions React et script de rendu MP4
tests/unit, tests/e2e    Vitest et Playwright
```

Le pipeline suit cinq étapes remontées au Studio : **Script → Voix off → Visuels → Montage → Sous-titres**. Le Studio interroge `GET /api/projects/:id` tant que le job est actif.

## Parcours utilisateur

1. **Accueil** : un champ, niveau et durée, quatre suggestions.
2. **Studio** : chat à gauche, aperçu 16:9 et bande de scènes à droite, onglet Script, export/partage.
3. **Chat** : `Plus court`, `Plus de schémas`, `Voix plus lente`, ou une instruction libre. Le LLM renvoie un patch JSON ; seules les scènes touchées sont re-synthétisées, `version++` et l'historique est conservé.
4. **Élève** `/v/[slug]` : lecture, chapitres, transcription surlignée, notes horodatées en `localStorage`, sous-titres actifs.
5. **Quiz** `/v/[slug]/quiz` : une question à la fois, retour immédiat, `Revoir 2:15` qui saute à la scène source, score enregistré via l'API.

## Décisions et hypothèses

- **Stockage** : dépôt JSON dans `.data/` derrière une interface (`store`) — remplaçable par Prisma/Postgres sans toucher aux routes. Cela garantit `npm install && npm run dev` sans services externes.
- **Mode démo** : le provider LLM local dérive le storyboard **uniquement des phrases du texte saisi** (pas d'invention de faits) et produit des questions à trous à partir des mots-clés. Le provider TTS local estime les durées et ne génère pas d'audio.
- **Rendu vidéo** : l'aperçu du navigateur est une composition CSS déterministe ; le MP4 est rendu par Remotion + FFmpeg. Le bouton « Générer la vidéo MP4 » lance le rendu en tâche de fond côté serveur. Le premier rendu télécharge un navigateur headless.
- **Auth** : non implémentée dans le MVP (les professeurs créent un projet sans compte, les élèves accèdent par lien). À brancher en V2 avec Auth.js.
- **Formats/qualité** : sélecteurs présents dans le panneau d'export ; le rendu Remotion est en 1920×1080 / 30 fps, à recadrer en V2 pour 9:16 et 1:1.
- **Accessibilité** : cibles ≥ 44 px, `aria-label`, focus visible, contraste AA, `prefers-reduced-motion` respecté.

## Identité visuelle

Un seul accent : le violet. `#5B2EE8` primaire, `#4A21D6` texte sur clair, `#8A6BFF` / `#C4AEFF` halos, `#E4DBFF` pastilles, `#F6F3FF` fond. Titres en Bricolage Grotesque, texte en Inter. Fond Aurore animé sur l'accueil uniquement ; Studio et écrans élève sobres.
