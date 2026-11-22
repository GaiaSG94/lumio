import { Composition } from "remotion";
import { LumioVideo } from "./LumioVideo";
import { FPS, type LumioStoryboard } from "./types";

const DEMO: LumioStoryboard = {
  title: "Une leçon en vidéo",
  level: "college",
  targetSeconds: 90,
  concepts: ["lumière", "eau"],
  scenes: [
    { id: "s1", title: "Introduction", kind: "accroche", narration: "Bienvenue dans cette leçon.", visual: "Titre", keywords: ["leçon"], motion: "appear", seconds: 30 },
    { id: "s2", title: "Les idées clés", kind: "explication", narration: "Voici les idées essentielles.", visual: "Texte", keywords: ["idées"], motion: "draw", seconds: 30 },
    { id: "s3", title: "À retenir", kind: "synthese", narration: "Retiens ces notions.", visual: "Récapitulatif", keywords: ["notions"], motion: "appear", seconds: 30 },
  ],
  quiz: [{ question: "Question ?", choices: ["A", "B", "C", "D"], answerIndex: 0, explanation: "Réponse A.", sceneId: "s1" }],
};

export const RemotionRoot = () => (
  <Composition
    id="Lumio"
    component={LumioVideo}
    durationInFrames={DEMO.scenes.reduce((sum, s) => sum + s.seconds, 0) * FPS}
    fps={FPS}
    width={1920}
    height={1080}
    defaultProps={{ storyboard: DEMO }}
    calculateMetadata={({ props }) => ({
      durationInFrames: Math.max(FPS, props.storyboard.scenes.reduce((sum, s) => sum + s.seconds, 0) * FPS),
    })}
  />
);
