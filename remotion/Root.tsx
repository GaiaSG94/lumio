import { Composition } from "remotion";
import { LumioVideo } from "./LumioVideo";
import { FPS, type LumioStoryboard } from "./types";

const DEMO: LumioStoryboard = {
  title: "A lesson in video",
  level: "middle",
  targetSeconds: 90,
  concepts: ["light", "water"],
  scenes: [
    { id: "s1", title: "Introduction", kind: "hook", narration: "Welcome to this lesson.", visual: "Title", keywords: ["lesson"], motion: "appear", seconds: 30 },
    { id: "s2", title: "Key ideas", kind: "explanation", narration: "Here are the essential ideas.", visual: "Text", keywords: ["ideas"], motion: "draw", seconds: 30 },
    { id: "s3", title: "Key takeaways", kind: "summary", narration: "Remember these concepts.", visual: "Summary", keywords: ["concepts"], motion: "appear", seconds: 30 },
  ],
  quiz: [{ question: "Question?", choices: ["A", "B", "C", "D"], answerIndex: 0, explanation: "Answer A.", sceneId: "s1" }],
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
