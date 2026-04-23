import { parseUciLine, type EngineLine } from "./parser";

export interface EngineOpts {
  multiPV: number;
  targetDepth: number;
}

export interface EngineSnapshot {
  running: boolean;
  depth: number;
  nps: number;
  lines: EngineLine[];
  bestMoveUci: string | null;
}

export class Engine {
  private worker: Worker;
  private ready = false;
  private snapshot: EngineSnapshot = {
    running: false,
    depth: 0,
    nps: 0,
    lines: [],
    bestMoveUci: null,
  };
  private listeners = new Set<(s: EngineSnapshot) => void>();
  private currentOpts: EngineOpts = { multiPV: 3, targetDepth: 22 };
  private pvByRank = new Map<number, EngineLine>();
  private readyCallbacks: Array<() => void> = [];

  constructor() {
    this.worker = new Worker("/stockfish/stockfish.js");
    this.worker.onmessage = (e) => this.handleLine(String(e.data));
    this.post("uci");
  }

  private post(cmd: string) {
    this.worker.postMessage(cmd);
  }

  private handleLine(line: string) {
    if (!this.ready && line.trim() === "uciok") {
      this.post("isready");
      return;
    }
    if (!this.ready && line.trim() === "readyok") {
      this.ready = true;
      this.readyCallbacks.forEach((cb) => cb());
      this.readyCallbacks = [];
      return;
    }
    const parsed = parseUciLine(line);
    if (parsed.type === "info" && parsed.pv.length > 0) {
      const scoreCp =
        parsed.scoreCp !== null
          ? parsed.scoreCp
          : parsed.mate !== null
            ? (parsed.mate > 0 ? 1 : -1) * (100000 - Math.abs(parsed.mate))
            : 0;
      this.pvByRank.set(parsed.multipv, {
        rank: parsed.multipv,
        scoreCp,
        mate: parsed.mate,
        depth: parsed.depth,
        pv: parsed.pv,
      });
      this.snapshot = {
        ...this.snapshot,
        running: true,
        depth: parsed.depth,
        nps: parsed.nps ?? this.snapshot.nps,
        lines: Array.from(this.pvByRank.values()).sort(
          (a, b) => a.rank - b.rank,
        ),
      };
      this.emit();
    } else if (parsed.type === "bestmove") {
      this.snapshot = {
        ...this.snapshot,
        running: false,
        bestMoveUci: parsed.move,
      };
      this.emit();
    }
  }

  private emit() {
    const snap = this.snapshot;
    this.listeners.forEach((l) => l(snap));
  }

  subscribe(cb: (s: EngineSnapshot) => void): () => void {
    this.listeners.add(cb);
    cb(this.snapshot);
    return () => {
      this.listeners.delete(cb);
    };
  }

  whenReady(cb: () => void) {
    if (this.ready) cb();
    else this.readyCallbacks.push(cb);
  }

  analyze(fen: string, opts: EngineOpts) {
    this.currentOpts = opts;
    this.whenReady(() => {
      this.pvByRank.clear();
      this.snapshot = {
        running: true,
        depth: 0,
        nps: 0,
        lines: [],
        bestMoveUci: null,
      };
      this.emit();
      this.post("stop");
      this.post(`setoption name MultiPV value ${opts.multiPV}`);
      this.post(`position fen ${fen}`);
      this.post(`go depth ${opts.targetDepth}`);
    });
  }

  stop() {
    this.post("stop");
  }

  destroy() {
    this.post("quit");
    this.worker.terminate();
    this.listeners.clear();
  }

  getCurrentOpts(): EngineOpts {
    return this.currentOpts;
  }
}
