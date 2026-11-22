import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FPS, type LumioScene } from "./types";

const VIOLET = "#5B2EE8";
const ENCRE = "#1A1033";
const GRIS = "#4A4366";

type Props = {
  scene: LumioScene;
  index: number;
  total: number;
  courseTitle: string;
};

function Backdrop({ variant }: { variant: number }) {
  const colors = [["#C4AEFF", "#E4DBFF"], ["#8A6BFF", "#E7DDFF"], ["#5B2EE8", "#C4AEFF"]];
  const [first, second] = colors[variant % colors.length];
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", width: 760, height: 760, borderRadius: "50%", background: first, opacity: 0.32, filter: "blur(110px)", top: -240, right: -140 }} />
      <div style={{ position: "absolute", width: 620, height: 620, borderRadius: "50%", background: second, opacity: 0.45, filter: "blur(120px)", bottom: -220, left: -160 }} />
      <div style={{ position: "absolute", inset: 46, border: "1px solid rgba(91,46,232,.14)", borderRadius: 30 }} />
    </AbsoluteFill>
  );
}

function Chips({ keywords, frame }: { keywords: string[]; frame: number }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16, marginTop: 44 }}>
      {keywords.slice(0, 5).map((word, i) => {
        const opacity = interpolate(frame, [12 + i * 8, 26 + i * 8], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
        return (
          <span
            key={`${word}-${i}`}
            style={{
              opacity,
              padding: "14px 26px",
              borderRadius: 999,
              background: "#E4DBFF",
              color: "#3F1BB0",
              fontWeight: 600,
              fontSize: 26,
              border: "1px solid rgba(91,46,232,.18)",
            }}
          >
            {word}
          </span>
        );
      })}
    </div>
  );
}

function TitleBlock({ scene, frame }: { scene: LumioScene; frame: number }) {
  const scale = interpolate(frame, [0, 30], [0.94, 1], { extrapolateRight: "clamp" });
  return (
    <>
      <div style={{ fontSize: 28, fontWeight: 700, letterSpacing: 3, color: VIOLET, textTransform: "uppercase" }}>Welcome</div>
      <h1 style={{ fontSize: 104, lineHeight: 1.03, letterSpacing: -4, margin: "22px 0 0", color: ENCRE, transform: `scale(${scale})`, transformOrigin: "left center" }}>
        {scene.title}
      </h1>
      <div style={{ width: interpolate(frame, [10, 34], [0, 260], { extrapolateRight: "clamp" }), height: 10, borderRadius: 10, background: VIOLET, marginTop: 34 }} />
      <Chips keywords={scene.keywords} frame={frame} />
    </>
  );
}

function Explanation({ scene }: { scene: LumioScene }) {
  return (
    <>
      <h2 style={{ fontSize: 58, letterSpacing: -2, color: ENCRE, margin: 0 }}>{scene.title}</h2>
      <p style={{ fontSize: 40, lineHeight: 1.35, color: GRIS, marginTop: 30, maxWidth: 1500 }}>{scene.narration}</p>
      <Chips keywords={scene.keywords} frame={90} />
    </>
  );
}

function Schema({ scene, frame }: { scene: LumioScene }) {
  const items = scene.keywords.slice(0, 4);
  const progress = interpolate(frame, [15, 70], [0, 1], { extrapolateRight: "clamp" });
  return (
    <>
      <h2 style={{ fontSize: 54, color: ENCRE, letterSpacing: -2, marginBottom: 48 }}>{scene.title}</h2>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        {items.map((item, i) => (
          <div key={`${item}-${i}`} style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            <div
              style={{
                flex: 1,
                padding: "32px 18px",
                borderRadius: 22,
                background: i === items.length - 1 ? VIOLET : "#E4DBFF",
                color: i === items.length - 1 ? "white" : "#3F1BB0",
                fontSize: 30,
                fontWeight: 600,
                textAlign: "center",
                opacity: interpolate(frame, [i * 14, 18 + i * 14], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
              }}
            >
              {item}
            </div>
            {i < items.length - 1 ? (
              <div style={{ width: 60 * progress, height: 6, background: "#8A6BFF", borderRadius: 6 }} />
            ) : null}
          </div>
        ))}
      </div>
      <p style={{ fontSize: 32, color: GRIS, marginTop: 44 }}>{scene.narration}</p>
    </>
  );
}

function Animation({ scene, frame }: { scene: LumioScene }) {
  return (
    <>
      <h2 style={{ fontSize: 54, color: ENCRE, letterSpacing: -2 }}>{scene.title}</h2>
      <div style={{ display: "flex", gap: 34, marginTop: 52, alignItems: "center" }}>
        {scene.keywords.slice(0, 4).map((word, i) => {
          const shift = interpolate(frame, [i * 18, 40 + i * 18], [0, -18], { extrapolateRight: "clamp" });
          return (
            <div
              key={`${word}-${i}`}
              style={{
                width: 250,
                height: 250,
                borderRadius: 36,
                background: i % 2 ? "#C4AEFF" : VIOLET,
                color: i % 2 ? ENCRE : "white",
                display: "grid",
                placeItems: "center",
                fontSize: 30,
                fontWeight: 700,
                textAlign: "center",
                transform: `translateY(${shift}px)`,
                boxShadow: "0 24px 50px -24px rgba(91,46,232,.5)",
              }}
            >
              {word}
            </div>
          );
        })}
      </div>
      <p style={{ fontSize: 32, color: GRIS, marginTop: 52 }}>{scene.narration}</p>
    </>
  );
}

function Synthesis({ scene, frame }: { scene: LumioScene }) {
  return (
    <>
      <h2 style={{ fontSize: 60, color: ENCRE, letterSpacing: -2, marginBottom: 38 }}>{scene.title}</h2>
      {scene.keywords.slice(0, 5).map((word, i) => (
        <div
          key={`${word}-${i}`}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 24,
            opacity: interpolate(frame, [i * 12, 22 + i * 12], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            marginBottom: 18,
          }}
        >
          <div style={{ width: 22, height: 22, borderRadius: 999, background: VIOLET }} />
          <span style={{ fontSize: 38, fontWeight: 600, color: "#3F1BB0" }}>{word}</span>
        </div>
      ))}
    </>
  );
}

function Quiz({ scene, frame }: { scene: LumioScene; frame: number }) {
  return (
    <>
      <h2 style={{ fontSize: 46, color: ENCRE, marginBottom: 36, maxWidth: 1500 }}>{scene.title}</h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, maxWidth: 1300 }}>
        {scene.keywords.slice(0, 4).map((word, i) => (
          <div key={`${word}-${i}`} style={{ padding: "26px 30px", borderRadius: 18, background: "white", color: ENCRE, fontSize: 30, border: "2px solid #E4DBFF", opacity: interpolate(frame, [10 + i * 10, 26 + i * 10], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) }}>
            <span style={{ color: VIOLET, fontWeight: 700, marginRight: 18 }}>{String.fromCharCode(65 + i)}</span>
            {word}
          </div>
        ))}
      </div>
    </>
  );
}

export const SceneView = ({ scene, index, total, courseTitle }: Props) => {
  const frame = useCurrentFrame();
  const enter = interpolate(frame, [0, 14], [0, 1], { extrapolateRight: "clamp" });
  const rise = interpolate(frame, [0, 22], [34, 0], { extrapolateRight: "clamp" });
  const duration = scene.seconds * FPS;

  let content;
  switch (scene.kind) {
    case "hook":
      content = <TitleBlock scene={scene} frame={frame} />;
      break;
    case "explanation":
      content = <Explanation scene={scene} />;
      break;
    case "diagram":
      content = <Schema scene={scene} frame={frame} />;
      break;
    case "animation":
      content = <Animation scene={scene} frame={frame} />;
      break;
    case "summary":
      content = <Synthesis scene={scene} frame={frame} />;
      break;
    case "quiz":
      content = <Quiz scene={scene} frame={frame} />;
      break;
    default:
      content = <Explanation scene={scene} />;
  }

  return (
    <AbsoluteFill style={{ background: "linear-gradient(135deg,#F6F3FF 0%,#EDE6FF 100%)" }}>
      <Backdrop variant={index} />
      <div style={{ position: "absolute", top: 56, left: 84, right: 84, display: "flex", justifyContent: "space-between", color: VIOLET, fontSize: 24, fontWeight: 600 }}>
        <span>{courseTitle}</span>
        <span>{index + 1} / {total}</span>
      </div>
      <div style={{ position: "absolute", left: 84, right: 84, top: 130, bottom: 90, display: "flex", flexDirection: "column", justifyContent: "center", opacity: enter, transform: `translateY(${rise}px)` }}>
        {content}
      </div>
      <div style={{ position: "absolute", left: 84, bottom: 54, width: (index + interpolate(frame, [0, duration], [0, 1], { extrapolateRight: "clamp" })) / total * (1920 - 168), height: 8, background: VIOLET, borderRadius: 8 }} />
    </AbsoluteFill>
  );
};
