export function AuroraBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
      <div className="halo left-[-12%] top-[-18%] h-[42rem] w-[42rem] animate-derive1" style={{ background: "rgba(138,107,255,.38)" }} />
      <div className="halo right-[-14%] top-[4%] h-[38rem] w-[38rem] animate-derive2" style={{ background: "rgba(196,174,255,.55)" }} />
      <div className="halo bottom-[-22%] left-[22%] h-[44rem] w-[44rem] animate-derive3" style={{ background: "rgba(91,46,232,.30)" }} />
      <div className="halo bottom-[-10%] right-[8%] h-[28rem] w-[28rem] animate-derive2" style={{ background: "rgba(231,221,255,.85)" }} />
    </div>
  );
}
