"use client";

import { useCallback, useEffect, useState } from "react";

export function usePlayback(total: number, initialTime = 0) {
  const [time, setTime] = useState(initialTime);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setTime((current) => Math.min(total, current + 0.5)), 500);
    return () => window.clearInterval(id);
  }, [playing, total]);

  useEffect(() => {
    if (playing && time >= total) setPlaying(false);
  }, [playing, time, total]);

  const seek = useCallback(
    (value: number) => setTime(Math.max(0, Math.min(total, value))),
    [total],
  );
  const toggle = useCallback(() => {
    setPlaying((current) => {
      if (!current && time >= total) setTime(0);
      return !current;
    });
  }, [time, total]);

  return { time, playing, toggle, seek, setTime };
}
