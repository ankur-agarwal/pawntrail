"use client";

import type { Key as CgKey } from "@lichess-org/chessground/types";
import { ChessBoard } from "@/components/board/ChessBoard";
import type { Ply } from "@/lib/pgn/build";
import type { Classification } from "@/lib/pgn/classify";
import type { EngineSnapshot } from "@/lib/stockfish/engine";
import { CorrectionPopover } from "./CorrectionPopover";
import { EvalBar, formatEval } from "./EvalBar";
import { ReviewEnginePanel } from "./EnginePanel";
import { GameHeader } from "./GameHeader";
import { HeadersForm, type HeadersFormState } from "./HeadersForm";
import { MoveChip } from "./MoveChip";
import { PgnView } from "./PgnView";
import { Avatar, Chip, ClassDot, Micro, NavBtn, SegControl } from "./primitives";

const FLAGGED_CONFIDENCE = 0.6;

export interface MobileLayoutProps {
  plies: Ply[];
  currentPly: number;
  popoverPly: number | -1;
  fenAtSelection: string;
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

export function MobileLayout(props: MobileLayoutProps) {
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

  const cur = currentPly >= 0 ? plies[currentPly] : undefined;
  const evalCp = engineSnapshot.lines[0]?.scoreCp ?? 0;
  const popoverPlyData = popoverPly >= 0 ? plies[popoverPly] : undefined;

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
        compact
      />

      <div
        style={{
          padding: "14px 14px 8px",
          display: "flex",
          flexDirection: "column",
          gap: 8,
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "var(--font-sans)",
            fontSize: 12,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Avatar
              name={orientation === "white" ? blackName : whiteName}
              size={20}
              tone="forest"
            />
            {orientation === "white" ? blackName : whiteName}
          </span>
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--pt-text-dim)",
            }}
          >
            {currentPly + 1}/{Math.max(plies.length, 1)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "stretch", gap: 8 }}>
          <EvalBar cp={evalCp} height={272} width={14} />
          <ChessBoard
            fen={fenAtSelection}
            orientation={orientation}
            size={272}
            lastMove={lastMove}
          />
        </div>
        <div
          style={{
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontFamily: "var(--font-sans)",
            fontSize: 12,
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            <Avatar
              name={orientation === "white" ? whiteName : blackName}
              size={20}
              tone="amber"
            />
            {orientation === "white" ? whiteName : blackName}
          </span>
          {date && (
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 10,
                color: "var(--pt-text-dim)",
              }}
            >
              {date}
            </span>
          )}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 14px",
          borderTop: "0.5px solid var(--pt-border)",
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

      {tab === "moves" ? (
        <>
          <div
            style={{
              padding: "6px 10px",
              display: "flex",
              gap: 6,
              overflowX: "auto",
              borderBottom: "0.5px solid var(--pt-border)",
              background: "var(--pt-bg-elev)",
              flexShrink: 0,
            }}
          >
            {plies.map((p, i) => {
              const cls = classifications.get(i);
              return (
                <MoveChip
                  key={i}
                  state={{
                    san: p.san,
                    flagged: p.invalid,
                    corrected: correctedPlies.has(i),
                    confidence: p.invalid ? FLAGGED_CONFIDENCE : undefined,
                    classification: cls,
                  }}
                  active={currentPly === i}
                  dense
                  onClick={() => onJump(i)}
                  onCorrect={() => onOpenCorrection(i)}
                />
              );
            })}
          </div>

          <div
            className="pt-review-scroll"
            style={{
              flex: 1,
              minHeight: 0,
              background: "var(--pt-surface)",
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              boxShadow: "0 -8px 24px -16px rgba(20,32,26,0.18)",
              padding: 14,
              display: "flex",
              flexDirection: "column",
              gap: 10,
              overflowY: "auto",
            }}
          >
            <div
              aria-hidden
              style={{
                width: 36,
                height: 4,
                borderRadius: 9999,
                background: "var(--pt-border-strong)",
                alignSelf: "center",
              }}
            />

            {popoverPlyData ? (
              <CorrectionPopover
                ply={popoverPlyData}
                variant="mobile"
                onPick={(san) => onPickCorrection(popoverPly, san)}
                onDismiss={onDismissCorrection}
              />
            ) : cur ? (
              <RestingDetail
                ply={cur}
                plyIdx={currentPly}
                classification={classifications.get(currentPly)}
                snapshot={engineSnapshot}
                targetDepth={engineTargetDepth}
              />
            ) : (
              <Micro style={{ color: "var(--pt-text-muted)" }}>
                Start position — pick a move to begin review
              </Micro>
            )}
          </div>
        </>
      ) : tab === "pgn" ? (
        <div
          className="pt-review-scroll"
          style={{ flex: 1, overflowY: "auto" }}
        >
          <PgnView pgn={pgn} />
        </div>
      ) : (
        <div
          className="pt-review-scroll"
          style={{ flex: 1, overflowY: "auto" }}
        >
          <HeadersForm state={headers} onChange={onSetHeaders} />
        </div>
      )}

      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "8px 12px",
          borderTop: "0.5px solid var(--pt-border)",
          background: "var(--pt-surface)",
        }}
      >
        <NavBtn onClick={() => onJump(Math.max(-1, currentPly - 1))} title="Previous">
          ‹
        </NavBtn>
        <span style={{ flex: 1 }} />
        {flaggedCount > 0 ? (
          <Chip
            tone="amber"
            onClick={onJumpToFlag}
            icon={
              <span
                aria-hidden
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "var(--pt-amber)",
                  animation: "pt-confidence-blink 1.4s ease-in-out infinite",
                }}
              />
            }
          >
            {flaggedCount} to review
          </Chip>
        ) : (
          <span
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              color: "var(--pt-text-dim)",
            }}
          >
            {currentPly + 1} / {Math.max(plies.length, 1)}
          </span>
        )}
        <span style={{ flex: 1 }} />
        <NavBtn
          onClick={() => onJump(Math.min(plies.length - 1, currentPly + 1))}
          title="Next"
        >
          ›
        </NavBtn>
      </div>
    </div>
  );
}

function RestingDetail({
  ply,
  plyIdx,
  classification,
  snapshot,
  targetDepth,
}: {
  ply: Ply;
  plyIdx: number;
  classification?: Classification;
  snapshot: EngineSnapshot;
  targetDepth: number;
}) {
  const moveNum = Math.floor(plyIdx / 2) + 1;
  const isWhite = plyIdx % 2 === 0;
  const evalCp = snapshot.lines[0]?.scoreCp ?? 0;
  return (
    <>
      <Micro style={{ color: "var(--pt-text-muted)" }}>Move details</Micro>
      <div style={{ display: "flex", alignItems: "baseline", gap: 12 }}>
        <div
          style={{
            fontFamily: "var(--font-mono)",
            fontSize: 22,
            fontWeight: 500,
            color: "var(--pt-text)",
          }}
        >
          {moveNum}
          {isWhite ? "." : "…"} {ply.san}
        </div>
        {snapshot.lines.length > 0 && (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
            {classification && <ClassDot kind={classification} size={7} />}
            <span
              style={{
                fontFamily: "var(--font-mono)",
                fontSize: 13,
                fontWeight: 600,
                color: "var(--pt-text)",
              }}
            >
              {formatEval(evalCp)}
            </span>
          </span>
        )}
      </div>
      <ReviewEnginePanel
        snapshot={snapshot}
        targetDepth={targetDepth}
        classification={classification}
        maxLines={2}
        pvTrim={4}
      />
    </>
  );
}
