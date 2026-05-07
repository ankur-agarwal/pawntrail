"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import { useRouter } from "next/navigation";
import { Chess } from "chess.js";
import type { Key as CgKey } from "@lichess-org/chessground/types";
import {
  saveScanAsGame,
  type GameMetadataInput,
  type SavedMove,
} from "@/app/(app)/scan/actions";
import { buildPgn, replayMoves, type Ply } from "@/lib/pgn/build";
import type { Classification } from "@/lib/pgn/classify";
import { useEngine } from "@/hooks/useEngine";
import type { ExtractedMovePair } from "@/lib/scanner/types";
import { DesktopLayout } from "./DesktopLayout";
import { MobileLayout } from "./MobileLayout";
import { EMPTY_HEADERS, type HeadersFormState } from "./HeadersForm";
import { useIsMobile } from "./useIsMobile";
import "./review.css";

const START_FEN =
  "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

const ENGINE_DEPTH = 22;
const ENGINE_MULTIPV = 3;

export interface ReviewScreenProps {
  scanId: string;
  initialPairs: ExtractedMovePair[];
  sheetUrl: string | null;
  scanCreatedAt?: string;
}

interface FromTo {
  from: CgKey;
  to: CgKey;
}

function deriveLastMoves(plies: Ply[]): Array<FromTo | undefined> {
  const out: Array<FromTo | undefined> = [];
  for (const ply of plies) {
    if (ply.invalid || !ply.fenBefore) {
      out.push(undefined);
      continue;
    }
    try {
      const game = new Chess(ply.fenBefore);
      const move = game.move(ply.san);
      if (!move) {
        out.push(undefined);
      } else {
        out.push({ from: move.from as CgKey, to: move.to as CgKey });
      }
    } catch {
      out.push(undefined);
    }
  }
  return out;
}

function formatScanDate(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return undefined;
  return d.toISOString().slice(0, 10);
}

function pairsAfterEdit(
  pairs: ExtractedMovePair[],
  plyIdx: number,
  newSan: string,
): ExtractedMovePair[] {
  const pairIdx = Math.floor(plyIdx / 2);
  const isWhite = plyIdx % 2 === 0;
  return pairs.map((pair, i) => {
    if (i !== pairIdx) return pair;
    return isWhite
      ? { ...pair, white: newSan }
      : { ...pair, black: newSan };
  });
}

export function ReviewScreen({
  scanId,
  initialPairs,
  sheetUrl,
  scanCreatedAt,
}: ReviewScreenProps) {
  const router = useRouter();
  const isMobile = useIsMobile();

  const [pairs, setPairs] = useState<ExtractedMovePair[]>(initialPairs);
  const [currentPly, setCurrentPly] = useState<number>(-1);
  const [popoverPly, setPopoverPly] = useState<number>(-1);
  const [tab, setTab] = useState<"moves" | "pgn" | "headers">("moves");
  const [headers, setHeaders] = useState<HeadersFormState>(EMPTY_HEADERS);
  const [correctedPlies] = useState<Set<number>>(() => new Set());
  const [dirty, setDirty] = useState(false);
  const [saving, startSaving] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  const plies = useMemo<Ply[]>(() => replayMoves(pairs), [pairs]);
  const lastMoves = useMemo(() => deriveLastMoves(plies), [plies]);
  const flaggedPlies = useMemo(
    () => plies.filter((p) => p.invalid).length,
    [plies],
  );
  const pgn = useMemo(() => buildPgn(pairs), [pairs]);

  const fenAtSelection = useMemo(() => {
    if (currentPly < 0) return START_FEN;
    const p = plies[currentPly];
    return p && !p.invalid && p.fenAfter ? p.fenAfter : START_FEN;
  }, [plies, currentPly]);

  const lastMove = useMemo<[CgKey, CgKey] | undefined>(() => {
    if (currentPly < 0) return undefined;
    const lm = lastMoves[currentPly];
    return lm ? [lm.from, lm.to] : undefined;
  }, [lastMoves, currentPly]);

  const engineSnapshot = useEngine(fenAtSelection, {
    multiPV: ENGINE_MULTIPV,
    targetDepth: ENGINE_DEPTH,
  });

  // No classification computation yet — wired through but always empty in v1.
  const classifications = useMemo(
    () => new Map<number, Classification>(),
    [],
  );

  const onJump = useCallback(
    (idx: number) => {
      const clamped = Math.max(-1, Math.min(plies.length - 1, idx));
      setCurrentPly(clamped);
      const ply = clamped >= 0 ? plies[clamped] : undefined;
      if (ply?.invalid) {
        setPopoverPly(clamped);
      } else {
        setPopoverPly(-1);
      }
    },
    [plies],
  );

  const onOpenCorrection = useCallback(
    (idx: number) => {
      setCurrentPly(idx);
      setPopoverPly(idx);
    },
    [],
  );

  const onPickCorrection = useCallback(
    (idx: number, san: string) => {
      setPairs((prev) => pairsAfterEdit(prev, idx, san));
      correctedPlies.add(idx);
      setDirty(true);
      setPopoverPly(-1);
    },
    [correctedPlies],
  );

  const onDismissCorrection = useCallback(() => {
    setPopoverPly(-1);
  }, []);

  const onJumpToFlag = useCallback(() => {
    const idx = plies.findIndex((p) => p.invalid);
    if (idx >= 0) {
      setCurrentPly(idx);
      setPopoverPly(idx);
    }
  }, [plies]);

  const onSave = useCallback(() => {
    if (flaggedPlies > 0) return;
    if (saving) return;
    setSaveError(null);

    const movesForDb: SavedMove[] = plies
      .filter((p) => !p.invalid)
      .map((p) => ({ ply: p.ply, san: p.san, fen_after: p.fenAfter }));
    const total = plies.length;
    const valid = movesForDb.length;
    const confidence = total === 0 ? null : valid / total;

    const meta: GameMetadataInput = {
      played_on: headers.played_on || undefined,
      opponent_name: headers.opponent_name || undefined,
      opponent_rating: headers.opponent_rating || undefined,
      color: headers.color,
      result: headers.result,
      time_control: headers.time_control || undefined,
      tournament_name: headers.tournament_name || undefined,
      round: headers.round || undefined,
      pgn,
      scan_confidence:
        confidence !== null ? confidence.toFixed(3) : undefined,
    };

    startSaving(async () => {
      const res = await saveScanAsGame(scanId, meta, movesForDb);
      if (!res.ok) {
        setSaveError(res.error);
        return;
      }
      router.push(`/games/${res.data.gameId}`);
    });
  }, [flaggedPlies, headers, pgn, plies, router, saving, scanId]);

  const onDiscard = useCallback(() => {
    if (
      dirty &&
      !window.confirm("Discard your edits and leave this scan?")
    ) {
      return;
    }
    router.push("/scan");
  }, [dirty, router]);

  useEffect(() => {
    function isInputFocused() {
      const el = document.activeElement as HTMLElement | null;
      if (!el) return false;
      const tag = el.tagName.toLowerCase();
      return tag === "input" || tag === "textarea" || el.isContentEditable;
    }
    function onKey(e: KeyboardEvent) {
      if (isInputFocused()) return;
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onJump(currentPly - 1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        onJump(currentPly + 1);
      } else if (e.key === "Home") {
        e.preventDefault();
        onJump(-1);
      } else if (e.key === "End") {
        e.preventDefault();
        onJump(plies.length - 1);
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        onJumpToFlag();
      } else if (e.key === "Escape") {
        if (popoverPly >= 0) setPopoverPly(-1);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentPly, onJump, onJumpToFlag, plies.length, popoverPly]);

  const whiteName = headers.color === "white"
    ? "You"
    : headers.opponent_name || "Opponent";
  const blackName = headers.color === "black"
    ? "You"
    : headers.opponent_name || "Opponent";

  const orientation: "white" | "black" = headers.color;
  const date = formatScanDate(scanCreatedAt);
  const saveDisabled = flaggedPlies > 0 || saving || plies.length === 0;
  const headersOnChange = useCallback((next: HeadersFormState) => {
    setHeaders(next);
    setDirty(true);
  }, []);

  const sharedProps = {
    plies,
    currentPly,
    popoverPly,
    fenAtSelection,
    lastMove,
    classifications,
    correctedPlies,
    engineSnapshot,
    engineTargetDepth: ENGINE_DEPTH,
    whiteName,
    blackName,
    date,
    dirty,
    saving,
    saveDisabled,
    flaggedCount: flaggedPlies,
    tab,
    headers,
    pgn,
    orientation,
    onSetTab: setTab,
    onSetHeaders: headersOnChange,
    onJump,
    onOpenCorrection,
    onPickCorrection,
    onDismissCorrection,
    onJumpToFlag,
    onSave,
    onDiscard,
  };

  return (
    <>
      {isMobile ? (
        <MobileLayout {...sharedProps} />
      ) : (
        <DesktopLayout {...sharedProps} startFen={START_FEN} sheetUrl={sheetUrl} />
      )}
      {saveError && (
        <div
          role="alert"
          style={{
            position: "fixed",
            left: "50%",
            bottom: 24,
            transform: "translateX(-50%)",
            padding: "10px 16px",
            background: "var(--pt-surface)",
            color: "var(--pt-blunder)",
            border: "0.5px solid var(--pt-border-strong)",
            borderRadius: "var(--pt-r-card)",
            boxShadow: "var(--pt-shadow-pop)",
            fontSize: 13,
            zIndex: 60,
          }}
        >
          Save failed: {saveError}
        </div>
      )}
    </>
  );
}
