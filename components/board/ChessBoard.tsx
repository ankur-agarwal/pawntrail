"use client";

import { useEffect, useRef } from "react";
import { Chessground } from "@lichess-org/chessground";
import type { Api as CgApi } from "@lichess-org/chessground/api";
import type { Config as CgConfig } from "@lichess-org/chessground/config";
import type { Key as CgKey } from "@lichess-org/chessground/types";
import "@/styles/board.css";

export interface ChessBoardProps {
  fen: string;
  orientation?: "white" | "black";
  size?: number;
  viewOnly?: boolean;
  lastMove?: [CgKey, CgKey];
}

export function ChessBoard({
  fen,
  orientation = "white",
  size = 400,
  viewOnly = true,
  lastMove,
}: ChessBoardProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<CgApi | null>(null);

  useEffect(() => {
    if (!wrapRef.current) return;
    const config: CgConfig = {
      fen,
      orientation,
      viewOnly,
      coordinates: true,
      movable: { free: false },
      draggable: { enabled: false },
    };
    apiRef.current = Chessground(wrapRef.current, config);
    return () => {
      apiRef.current?.destroy();
      apiRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    apiRef.current?.set({
      fen,
      orientation,
      viewOnly,
      lastMove,
    });
  }, [fen, orientation, viewOnly, lastMove]);

  return (
    <div
      ref={wrapRef}
      className="cg-wrap"
      style={{ width: size, height: size }}
    />
  );
}
