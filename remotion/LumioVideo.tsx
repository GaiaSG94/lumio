import { AbsoluteFill, Sequence, useCurrentFrame } from "remotion";
import { SceneView } from "./SceneView";
import { FPS, type LumioStoryboard } from "./types";

export const LumioVideo = ({ storyboard }: { storyboard: LumioStoryboard }) => {
  const frame = useCurrentFrame();
  let cursor = 0;

  return (
    <AbsoluteFill style={{ backgroundColor: "#F6F3FF", fontFamily: "Inter, Arial, sans-serif" }}>
      {storyboard.scenes.map((scene, index) => {
        const from = cursor * FPS;
        const durationInFrames = Math.max(1, scene.seconds * FPS);
        cursor += scene.seconds;
        return (
          <Sequence key={scene.id} from={from} durationInFrames={durationInFrames}>
            <SceneView scene={scene} index={index} total={storyboard.scenes.length} courseTitle={storyboard.title} />
          </Sequence>
        );
      })}
      <div
        style={{
          position: "absolute",
          right: 56,
          bottom: 40,
          display: "flex",
          alignItems: "center",
          gap: 10,
          opacity: frame < 30 ? frame / 30 : 0.75,
        }}
      >
        <div style={{ width: 22, height: 22, borderRadius: 7, background: "#5B2EE8", display: "grid", placeItems: "center" }}>
          <div style={{ width: 0, height: 0, borderTop: "6px solid transparent", borderBottom: "6px solid transparent", borderLeft: "9px solid white", marginLeft: 3 }} />
        </div>
        <span style={{ fontSize: 22, fontWeight: 700, color: "#4A21D6", letterSpacing: -0.5 }}>Lumio</span>
      </div>
    </AbsoluteFill>
  );
};
