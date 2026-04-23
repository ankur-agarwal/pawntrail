export interface EngineLine {
  rank: number;
  scoreCp: number;
  mate: number | null;
  depth: number;
  pv: string[];
}

export interface ParsedInfo {
  type: "info";
  depth: number;
  multipv: number;
  scoreCp: number | null;
  mate: number | null;
  nps: number | null;
  pv: string[];
}

export interface ParsedBestmove {
  type: "bestmove";
  move: string;
}

export type ParsedLine = ParsedInfo | ParsedBestmove | { type: "other" };

export function parseUciLine(line: string): ParsedLine {
  line = line.trim();
  if (line.startsWith("bestmove")) {
    const parts = line.split(/\s+/);
    return { type: "bestmove", move: parts[1] ?? "" };
  }
  if (!line.startsWith("info")) return { type: "other" };

  const tokens = line.split(/\s+/);
  let depth = 0;
  let multipv = 1;
  let scoreCp: number | null = null;
  let mate: number | null = null;
  let nps: number | null = null;
  const pv: string[] = [];

  for (let i = 0; i < tokens.length; i++) {
    const t = tokens[i];
    if (t === "depth") depth = parseInt(tokens[++i] ?? "0", 10);
    else if (t === "multipv") multipv = parseInt(tokens[++i] ?? "1", 10);
    else if (t === "nps") nps = parseInt(tokens[++i] ?? "0", 10);
    else if (t === "score") {
      const kind = tokens[++i];
      const val = parseInt(tokens[++i] ?? "0", 10);
      if (kind === "cp") scoreCp = val;
      else if (kind === "mate") mate = val;
    } else if (t === "pv") {
      for (i = i + 1; i < tokens.length; i++) pv.push(tokens[i] ?? "");
      break;
    }
  }

  return { type: "info", depth, multipv, scoreCp, mate, nps, pv };
}
