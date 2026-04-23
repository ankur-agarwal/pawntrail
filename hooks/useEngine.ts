"use client";

import { useEffect, useRef, useState } from "react";
import { Engine, type EngineSnapshot, type EngineOpts } from "@/lib/stockfish/engine";

const EMPTY: EngineSnapshot = {
  running: false,
  depth: 0,
  nps: 0,
  lines: [],
  bestMoveUci: null,
};

export function useEngine(fen: string, opts: EngineOpts) {
  const [state, setState] = useState<EngineSnapshot>(EMPTY);
  const engineRef = useRef<Engine | null>(null);

  useEffect(() => {
    if (typeof Worker === "undefined") return;
    const engine = new Engine();
    engineRef.current = engine;
    const unsub = engine.subscribe(setState);
    return () => {
      unsub();
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  useEffect(() => {
    engineRef.current?.analyze(fen, opts);
  }, [fen, opts.multiPV, opts.targetDepth]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function onVisibility() {
      if (document.hidden) engineRef.current?.stop();
      else engineRef.current?.analyze(fen, opts);
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [fen, opts.multiPV, opts.targetDepth]); // eslint-disable-line react-hooks/exhaustive-deps

  return state;
}
