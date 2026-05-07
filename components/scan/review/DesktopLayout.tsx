"use client";

import { useMemo } from "react";
import type { Key as CgKey } from "@lichess-org/chessground/types";
import { ChessBoard } from "@/components/board/ChessBoard";
import type { Ply } from "@/lib/pgn/build";
import type { Classification } from "@/lib/pgn/classify";
import type { EngineSnapshot } from "@/lib/stockfish/engine";
import { CapturedTray } from "./CapturedTray";
import { CorrectionPopover } from "./CorrectionPopover";
import { EvalBar } from "./EvalBar";
import { ReviewEnginePanel } from "./EnginePanel";
import { GameHeader } from "./GameHeader";
import { HeadersForm, type HeadersFormState } from "./HeadersForm";
import { MoveList } from "./MoveList";
import { PgnView } from "./PgnView";
import { PlaybackBar } from "./PlaybackBar";
import { ScoresheetThumb } from "./ScoresheetThumb";
import { Avatar, Micro, SegControl } from "./primitives";

export interface DesktopLayoutProps {
  plies: Ply[];
  currentPly: number;
  popoverPly: number | -1;
  fenAtSelection: string;
  startFen: string;
  lastMove?: [CgKey, CgKey];
  classifications: Map<number, Classification>;
  correctedPlies: Set<number>;
  engineSnapshot: EngineSnapshot;
  engineTargetDepth: number;
  whiteName: string;
  blackName: string;
  date?: string;
  dirty: boolean;
  saving: boolean;
  saveDisabled: boolean;
  flaggedCount: number;
  tab: "moves" | "pgn" | "headers";
  headers: HeadersFormState;
  pgn: string;
  sheetUrl: string | null;
  orientation: "white" | "black";
  onSetTab: (t: "moves" | "pgn" | "headers") => void;
  onSetHeaders: (h: HeadersFormState) => void;
  onJump: (idx: number) => void;
  onOpenCorrection: (idx: number) => void;
  onPickCorrection: (idx: number, san: string) => void;
  onDismissCorrection: () => void;
  onJumpToFlag: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

export function DesktopLayout(props: DesktopLayoutProps) {
  const {
    plies,
    currentPly,
    popoverPly,
    fenAtSelection,
    lastMove,
    classifications,
    correctedPlies,
    engineSnapshot,
    engineTargetDepth,
    whiteName,
    blackName,
    date,
    dirty,
    saving,
    saveDisabled,
    flaggedCount,
    tab,
    headers,
    pgn,
    sheetUrl,
    orientation,
    onSetTab,
    onSetHeaders,
    onJump,
    onOpenCorrection,
    onPickCorrection,
    onDismissCorrection,
    onJumpToFlag,
    onSave,
    onDiscard,
  } = props;

  const evalCp = engineSnapshot.lines[0]?.scoreCp ?? 0;
  const popoverPlyData = popoverPly >= 0 ? plies[popoverPly] : undefined;

  const captureFen = useMemo(() => fenAtSelection, [fenAtSelection]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        background: "var(--pt-bg)",
        minHeight: "calc(100vh - 56px)",
      }}
    >
      <GameHeader
        whiteName={whiteName}
        blackName={blackName}
        date={date}
        dirty={dirty}
        saving={saving}
        saveDisabled={saveDisabled}
        onSave={onSave}
        onDiscard={onDiscard}
      />

      <div
        style={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 400px",
          minHeight: 0,
        }}
      >
        <div
          style={{
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            alignItems: "center",
            justifyContent: "center",
            borderRight: "0.5px solid var(--pt-border)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              maxWidth: 480,
            }}
          >
            <Avatar
              name={orientation === "white" ? blackName : whiteName}
              size={26}
              tone="forest"
            />
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                color: "var(--pt-text)",
                flex: 1,
              }}
            >
              {orientation === "white" ? blackName : whiteName}
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "stretch", gap: 12 }}>
            <EvalBar cp={evalCp} height={460} width={18} />
            <ChessBoard
              fen={fenAtSelection}
              orientation={orientation}
              size={460}
              lastMove={lastMove}
            />
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              width: "100%",
              maxWidth: 480,
            }}
          >
            <Avatar
              name={orientation === "white" ? whiteName : blackName}
              size={26}
              tone="amber"
            />
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: 13,
                color: "var(--pt-text)",
                flex: 1,
              }}
            >
              {orientation === "white" ? whiteName : blackName}
            </span>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            minHeight: 0,
            position: "relative",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 14px",
              borderBottom: "0.5px solid var(--pt-border)",
              background: "var(--pt-surface)",
            }}
          >
            <SegControl<"moves" | "pgn" | "headers">
              size="sm"
              value={tab}
              options={[
                { value: "moves", label: "Moves" },
                { value: "pgn", label: "PGN" },
                { value: "headers", label: "Headers" },
              ]}
              onChange={onSetTab}
            />
            <span style={{ flex: 1 }} />
            <Micro style={{ color: "var(--pt-text-muted)" }}>
              {plies.length} ply
            </Micro>
          </div>

          {tab === "moves" && (
            <div
              className="pt-review-scroll"
              style={{
                flex: 1,
                overflowY: "auto",
                padding: "6px 8px",
                position: "relative",
              }}
            >
              <MoveList
                plies={plies}
                currentPly={currentPly}
                classifications={classifications}
                correctedPlies={correctedPlies}
                onJump={onJump}
                onOpenCorrection={onOpenCorrection}
              />
              {popoverPlyData && (
                <div
                  style={{
                    position: "absolute",
                    top: Math.floor(popoverPly / 2) * 32 + 4,
                    right: 8,
                    pointerEvents: "auto",
                    zIndex: 5,
                  }}
                >
                  <CorrectionPopover
                    ply={popoverPlyData}
                    variant="desktop"
                    onPick={(san) => onPickCorrection(popoverPly, san)}
                    onDismiss={onDismissCorrection}
                  />
                </div>
              )}
            </div>
          )}

          {tab === "pgn" && (
            <div
              className="pt-review-scroll"
              style={{ flex: 1, overflowY: "auto" }}
            >
              <PgnView pgn={pgn} />
            </div>
          )}

          {tab === "headers" && (
            <div
              className="pt-review-scroll"
              style={{ flex: 1, overflowY: "auto" }}
            >
              <HeadersForm state={headers} onChange={onSetHeaders} />
            </div>
          )}

          {tab === "moves" && (
            <ReviewEnginePanel
              snapshot={engineSnapshot}
              targetDepth={engineTargetDepth}
              maxLines={3}
              pvTrim={6}
            />
          )}

          {tab === "moves" && sheetUrl && (
            <div
              style={{
                borderTop: "0.5px solid var(--pt-border)",
                padding: 12,
                background: "var(--pt-bg-elev)",
              }}
            >
              <ScoresheetThumb url={sheetUrl} />
            </div>
          )}

          {tab === "moves" && (
            <div
              style={{
                padding: "10px 14px",
                borderTop: "0.5px solid var(--pt-border)",
                background: "var(--pt-surface)",
              }}
            >
              <CapturedTray fen={captureFen} />
            </div>
          )}
        </div>
      </div>

      <PlaybackBar
        ply={currentPly}
        total={Math.max(plies.length, 1)}
        flaggedCount={flaggedCount}
        onJump={onJump}
        onJumpToFlag={onJumpToFlag}
      />
    </div>
  );
}
