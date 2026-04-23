"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChessBoard } from "@/components/board/ChessBoard";
import { buildPgn, replayMoves, type Ply } from "@/lib/pgn/build";
import { suggestionsFor } from "@/lib/pgn/suggestions";
import type { ExtractedMovePair } from "@/lib/scanner/types";
import {
  saveScanAsGame,
  type GameMetadataInput,
  type SavedMove,
} from "@/app/(app)/scan/actions";

const START_FEN = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

export interface ReviewEditorProps {
  scanId: string;
  initialPairs: ExtractedMovePair[];
  sheetUrl: string | null;
}

export function ReviewEditor({
  scanId,
  initialPairs,
  sheetUrl,
}: ReviewEditorProps) {
  const router = useRouter();
  const [pairs, setPairs] = useState<ExtractedMovePair[]>(initialPairs);
  const [selectedPly, setSelectedPly] = useState(0); // 0 = start
  const [popoverPly, setPopoverPly] = useState<number | null>(null);
  const [color, setColor] = useState<"white" | "black">("white");
  const [result, setResult] = useState<"win" | "loss" | "draw" | "unknown">(
    "unknown",
  );
  const [opponentName, setOpponentName] = useState("");
  const [opponentRating, setOpponentRating] = useState("");
  const [tournament, setTournament] = useState("");
  const [round, setRound] = useState("");
  const [playedOn, setPlayedOn] = useState("");
  const [timeControl, setTimeControl] = useState("");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();
  const [isZoomed, setIsZoomed] = useState(false);

  const plies = useMemo<Ply[]>(() => replayMoves(pairs), [pairs]);
  const flaggedCount = plies.filter((p) => p.invalid).length;
  const fenAtSelection = useMemo(() => {
    if (selectedPly === 0) return START_FEN;
    const p = plies[selectedPly - 1];
    return p && !p.invalid && p.fenAfter ? p.fenAfter : START_FEN;
  }, [plies, selectedPly]);

  // last-move highlight is a Phase 4 polish item; leaving undefined for now.
  const lastMove = undefined;

  function replacePly(plyIdx: number, newSan: string) {
    const pairIdx = Math.floor(plyIdx / 2);
    const isWhite = plyIdx % 2 === 0;
    const newPairs = pairs.map((pair, i) => {
      if (i !== pairIdx) return pair;
      return isWhite
        ? { ...pair, white: newSan }
        : { ...pair, black: newSan };
    });
    setPairs(newPairs);
    setPopoverPly(null);
  }

  function handleSave() {
    if (flaggedCount > 0) return;
    setSaveError(null);

    const pgn = buildPgn(pairs);
    const movesForDb: SavedMove[] = plies
      .filter((p) => !p.invalid)
      .map((p) => ({ ply: p.ply, san: p.san, fen_after: p.fenAfter }));
    const totalPlies = plies.length;
    const validPlies = plies.filter((p) => !p.invalid).length;
    const confidence = totalPlies === 0 ? null : validPlies / totalPlies;

    const meta: GameMetadataInput = {
      played_on: playedOn || undefined,
      opponent_name: opponentName || undefined,
      opponent_rating: opponentRating || undefined,
      color,
      result,
      time_control: timeControl || undefined,
      tournament_name: tournament || undefined,
      round: round || undefined,
      pgn,
      scan_confidence: confidence !== null ? confidence.toFixed(3) : undefined,
    };

    startSaving(async () => {
      const res = await saveScanAsGame(scanId, meta, movesForDb);
      if (!res.ok) {
        setSaveError(res.error);
        return;
      }
      router.push(`/games/${res.data.gameId}`);
    });
  }

  return (
    <main style={{ padding: "40px 24px", maxWidth: 1080, margin: "0 auto" }}>
      <Breadcrumb />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) 300px",
          gap: 24,
          alignItems: "start",
        }}
      >
        <div>
          <div
            style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}
          >
            <ChessBoard
              fen={fenAtSelection}
              orientation={color}
              size={440}
              lastMove={lastMove}
            />
          </div>
          <div
            style={{
              fontFamily: "var(--font-mono)",
              fontSize: 11,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: "var(--pt-text-muted)",
              textAlign: "center",
            }}
          >
            {selectedPly === 0
              ? "Start position"
              : `After ply ${selectedPly} · ${plies[selectedPly - 1]?.san ?? ""}`}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {sheetUrl && (
            <SheetThumb
              url={sheetUrl}
              onZoom={() => setIsZoomed(true)}
            />
          )}
          <MoveList
            pairs={pairs}
            plies={plies}
            selectedPly={selectedPly}
            onSelect={setSelectedPly}
            onOpenFlagPopover={setPopoverPly}
            popoverPly={popoverPly}
            onReplace={replacePly}
            onClosePopover={() => setPopoverPly(null)}
          />
        </div>
      </div>

      <MetadataForm
        opponentName={opponentName}
        setOpponentName={setOpponentName}
        opponentRating={opponentRating}
        setOpponentRating={setOpponentRating}
        color={color}
        setColor={setColor}
        result={result}
        setResult={setResult}
        tournament={tournament}
        setTournament={setTournament}
        round={round}
        setRound={setRound}
        playedOn={playedOn}
        setPlayedOn={setPlayedOn}
        timeControl={timeControl}
        setTimeControl={setTimeControl}
      />

      <div
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
        }}
      >
        <div
          style={{
            fontSize: 12,
            color: flaggedCount > 0 ? "var(--pt-amber)" : "var(--pt-text-muted)",
            fontFamily: "var(--font-mono)",
          }}
        >
          {flaggedCount > 0
            ? `${flaggedCount} flagged move${flaggedCount === 1 ? "" : "s"} — resolve before saving`
            : `All ${plies.length} moves validated`}
        </div>
        <button
          type="button"
          onClick={handleSave}
          disabled={flaggedCount > 0 || isSaving}
          style={{
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 500,
            background:
              flaggedCount > 0 || isSaving
                ? "var(--pt-bg-elev)"
                : "var(--pt-forest)",
            color:
              flaggedCount > 0 || isSaving
                ? "var(--pt-text-dim)"
                : "var(--pt-cream)",
            border: "0.5px solid var(--pt-forest)",
            borderRadius: 6,
            cursor: flaggedCount > 0 || isSaving ? "not-allowed" : "pointer",
          }}
        >
          {isSaving ? "Saving…" : "Save game"}
        </button>
      </div>

      {saveError && (
        <div
          role="alert"
          style={{
            marginTop: 12,
            padding: "10px 14px",
            border: "0.5px solid var(--pt-border-strong)",
            borderRadius: 6,
            background: "rgba(169, 79, 36, 0.08)",
            fontSize: 13,
          }}
        >
          Save failed: {saveError}
        </div>
      )}

      {isZoomed && sheetUrl && (
        <ZoomedSheet url={sheetUrl} onClose={() => setIsZoomed(false)} />
      )}
    </main>
  );
}

function Breadcrumb() {
  return (
    <div
      style={{
        fontSize: 13,
        marginBottom: 16,
        color: "var(--pt-text-muted)",
        fontFamily: "var(--font-mono)",
        letterSpacing: "0.05em",
      }}
    >
      <a href="/scan" style={{ color: "var(--pt-text-muted)" }}>
        Scan
      </a>
      <span style={{ margin: "0 8px" }}>›</span>
      <span style={{ color: "var(--pt-text)" }}>Review &amp; edit</span>
    </div>
  );
}

function SheetThumb({
  url,
  onZoom,
}: {
  url: string;
  onZoom: () => void;
}) {
  return (
    <div
      style={{
        padding: 10,
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 8,
        background: "var(--pt-bg-elev)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
          fontFamily: "var(--font-mono)",
          marginBottom: 6,
        }}
      >
        Original sheet
      </div>
      <button
        type="button"
        onClick={onZoom}
        style={{
          padding: 0,
          width: "100%",
          aspectRatio: "4 / 5",
          background: "transparent",
          border: "0.5px solid var(--pt-border)",
          borderRadius: 4,
          overflow: "hidden",
          cursor: "zoom-in",
          display: "block",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt="Original scoresheet"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </button>
    </div>
  );
}

function ZoomedSheet({
  url,
  onClose,
}: {
  url: string;
  onClose: () => void;
}) {
  return (
    <div
      role="dialog"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20, 32, 26, 0.85)",
        display: "grid",
        placeItems: "center",
        padding: 24,
        zIndex: 50,
        cursor: "zoom-out",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={url}
        alt="Original scoresheet (zoomed)"
        style={{ maxWidth: "95vw", maxHeight: "95vh", objectFit: "contain" }}
      />
    </div>
  );
}

function MoveList({
  pairs,
  plies,
  selectedPly,
  onSelect,
  onOpenFlagPopover,
  popoverPly,
  onReplace,
  onClosePopover,
}: {
  pairs: ExtractedMovePair[];
  plies: Ply[];
  selectedPly: number;
  onSelect: (ply: number) => void;
  onOpenFlagPopover: (ply: number) => void;
  popoverPly: number | null;
  onReplace: (plyIdx: number, san: string) => void;
  onClosePopover: () => void;
}) {
  const flaggedCount = plies.filter((p) => p.invalid).length;

  return (
    <div
      style={{
        padding: 10,
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 8,
        background: "var(--pt-bg-elev)",
        maxHeight: 320,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
          fontFamily: "var(--font-mono)",
          marginBottom: 10,
        }}
      >
        <span>Move list</span>
        {flaggedCount > 0 && (
          <span style={{ color: "var(--pt-amber)" }}>{flaggedCount} flagged</span>
        )}
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "24px 1fr 1fr",
          rowGap: 2,
          fontFamily: "var(--font-mono)",
          fontSize: 12,
        }}
      >
        {pairs.map((pair, idx) => {
          const whitePly = plies[idx * 2];
          const blackPly = plies[idx * 2 + 1];
          return (
            <div key={pair.moveNumber} style={{ display: "contents" }}>
              <div style={{ color: "var(--pt-text-dim)", paddingTop: 4 }}>
                {pair.moveNumber}.
              </div>
              <MoveCell
                ply={whitePly}
                plyIdx={idx * 2}
                selected={selectedPly === idx * 2 + 1}
                onSelect={() => whitePly && onSelect(idx * 2 + 1)}
                onOpenPopover={() => whitePly && onOpenFlagPopover(idx * 2)}
                popoverOpen={popoverPly === idx * 2}
                onReplace={onReplace}
                onClosePopover={onClosePopover}
              />
              <MoveCell
                ply={blackPly}
                plyIdx={idx * 2 + 1}
                selected={selectedPly === idx * 2 + 2}
                onSelect={() => blackPly && onSelect(idx * 2 + 2)}
                onOpenPopover={() => blackPly && onOpenFlagPopover(idx * 2 + 1)}
                popoverOpen={popoverPly === idx * 2 + 1}
                onReplace={onReplace}
                onClosePopover={onClosePopover}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MoveCell({
  ply,
  plyIdx,
  selected,
  onSelect,
  onOpenPopover,
  popoverOpen,
  onReplace,
  onClosePopover,
}: {
  ply: Ply | undefined;
  plyIdx: number;
  selected: boolean;
  onSelect: () => void;
  onOpenPopover: () => void;
  popoverOpen: boolean;
  onReplace: (plyIdx: number, san: string) => void;
  onClosePopover: () => void;
}) {
  if (!ply) {
    return <div />;
  }
  const invalid = ply.invalid;
  return (
    <div style={{ position: "relative" }}>
      <button
        type="button"
        onClick={invalid ? onOpenPopover : onSelect}
        style={{
          width: "100%",
          padding: "3px 8px",
          fontFamily: "inherit",
          fontSize: "inherit",
          textAlign: "left",
          color: invalid
            ? "var(--pt-amber)"
            : selected
              ? "var(--pt-cream)"
              : "var(--pt-text)",
          background: selected && !invalid ? "var(--pt-forest)" : "transparent",
          border: invalid
            ? "0.5px solid var(--pt-amber)"
            : "0.5px solid transparent",
          borderRadius: 3,
          cursor: "pointer",
        }}
      >
        {ply.san}
        {invalid && (
          <span style={{ marginLeft: 4, fontFamily: "var(--font-sans)" }}>
            ⚠
          </span>
        )}
      </button>
      {popoverOpen && invalid && (
        <FlagPopover
          ply={ply}
          plyIdx={plyIdx}
          onReplace={onReplace}
          onClose={onClosePopover}
        />
      )}
    </div>
  );
}

function FlagPopover({
  ply,
  plyIdx,
  onReplace,
  onClose,
}: {
  ply: Ply;
  plyIdx: number;
  onReplace: (plyIdx: number, san: string) => void;
  onClose: () => void;
}) {
  const suggestions = useMemo(
    () => (ply.fenBefore ? suggestionsFor(ply.fenBefore, ply.san) : []),
    [ply.fenBefore, ply.san],
  );
  return (
    <div
      style={{
        position: "absolute",
        top: "100%",
        left: 0,
        marginTop: 4,
        padding: "10px 12px",
        background: "var(--pt-bg)",
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 6,
        boxShadow: "0 4px 12px rgba(20, 32, 26, 0.2)",
        zIndex: 10,
        minWidth: 140,
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
          fontFamily: "var(--font-mono)",
          marginBottom: 6,
        }}
      >
        Did you mean?
      </div>
      {suggestions.length === 0 && (
        <div style={{ fontSize: 12, color: "var(--pt-text-dim)" }}>
          No legal moves at this position. Fix an earlier flagged move first.
        </div>
      )}
      {suggestions.map((san) => (
        <button
          key={san}
          type="button"
          onClick={() => onReplace(plyIdx, san)}
          style={{
            display: "block",
            width: "100%",
            padding: "4px 8px",
            fontFamily: "var(--font-mono)",
            fontSize: 13,
            textAlign: "left",
            background: "transparent",
            border: "none",
            color: "var(--pt-text)",
            cursor: "pointer",
            borderRadius: 3,
          }}
          onMouseOver={(e) => {
            (e.target as HTMLElement).style.background = "var(--pt-bg-elev)";
          }}
          onMouseOut={(e) => {
            (e.target as HTMLElement).style.background = "transparent";
          }}
        >
          {san}
        </button>
      ))}
      <button
        type="button"
        onClick={onClose}
        style={{
          marginTop: 6,
          fontSize: 10,
          fontFamily: "var(--font-mono)",
          color: "var(--pt-text-muted)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
        }}
      >
        Cancel
      </button>
    </div>
  );
}

function MetadataForm(props: {
  opponentName: string;
  setOpponentName: (v: string) => void;
  opponentRating: string;
  setOpponentRating: (v: string) => void;
  color: "white" | "black";
  setColor: (v: "white" | "black") => void;
  result: "win" | "loss" | "draw" | "unknown";
  setResult: (v: "win" | "loss" | "draw" | "unknown") => void;
  tournament: string;
  setTournament: (v: string) => void;
  round: string;
  setRound: (v: string) => void;
  playedOn: string;
  setPlayedOn: (v: string) => void;
  timeControl: string;
  setTimeControl: (v: string) => void;
}) {
  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "6px 10px",
    fontSize: 13,
    background: "transparent",
    color: "var(--pt-text)",
    border: "0.5px solid var(--pt-border-strong)",
    borderRadius: 4,
    fontFamily: "inherit",
  };
  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: 10,
    letterSpacing: "0.14em",
    textTransform: "uppercase",
    color: "var(--pt-text-muted)",
    fontFamily: "var(--font-mono)",
    marginBottom: 4,
  };

  return (
    <div
      style={{
        marginTop: 24,
        padding: 16,
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 8,
        background: "var(--pt-bg-elev)",
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: "0.14em",
          textTransform: "uppercase",
          color: "var(--pt-text-muted)",
          fontFamily: "var(--font-mono)",
          marginBottom: 12,
        }}
      >
        Game details
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        <Field label="Opponent" style={labelStyle}>
          <input
            value={props.opponentName}
            onChange={(e) => props.setOpponentName(e.target.value)}
            style={inputStyle}
          />
        </Field>
        <Field label="Rating" style={labelStyle}>
          <input
            type="number"
            value={props.opponentRating}
            onChange={(e) => props.setOpponentRating(e.target.value)}
            style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
          />
        </Field>
        <Field label="Color" style={labelStyle}>
          <SegmentedControl
            value={props.color}
            options={[
              { v: "white", l: "White" },
              { v: "black", l: "Black" },
            ]}
            onChange={(v) => props.setColor(v)}
          />
        </Field>
        <Field label="Result" style={labelStyle}>
          <SegmentedControl
            value={props.result}
            options={[
              { v: "win", l: "Win" },
              { v: "loss", l: "Loss" },
              { v: "draw", l: "Draw" },
            ]}
            onChange={(v) => props.setResult(v)}
          />
        </Field>
        <Field label="Tournament" style={labelStyle}>
          <input
            value={props.tournament}
            onChange={(e) => props.setTournament(e.target.value)}
            style={inputStyle}
          />
        </Field>
        <Field label="Round" style={labelStyle}>
          <input
            value={props.round}
            onChange={(e) => props.setRound(e.target.value)}
            style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
          />
        </Field>
        <Field label="Date" style={labelStyle}>
          <input
            type="date"
            value={props.playedOn}
            onChange={(e) => props.setPlayedOn(e.target.value)}
            style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
          />
        </Field>
        <Field label="Time control" style={labelStyle}>
          <input
            value={props.timeControl}
            onChange={(e) => props.setTimeControl(e.target.value)}
            placeholder="90+30"
            style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
          />
        </Field>
      </div>
    </div>
  );
}

function Field({
  label,
  style,
  children,
}: {
  label: string;
  style: React.CSSProperties;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div style={style}>{label}</div>
      {children}
    </div>
  );
}

function SegmentedControl<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ v: T; l: string }>;
  onChange: (v: T) => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        border: "0.5px solid var(--pt-border-strong)",
        borderRadius: 4,
        overflow: "hidden",
      }}
    >
      {options.map((opt, i) => {
        const active = opt.v === value;
        return (
          <button
            key={opt.v}
            type="button"
            onClick={() => onChange(opt.v)}
            style={{
              flex: 1,
              padding: "6px 8px",
              fontSize: 12,
              border: "none",
              borderRight:
                i < options.length - 1
                  ? "0.5px solid var(--pt-border)"
                  : "none",
              background: active ? "var(--pt-forest)" : "transparent",
              color: active ? "var(--pt-cream)" : "var(--pt-text)",
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {opt.l}
          </button>
        );
      })}
    </div>
  );
}
