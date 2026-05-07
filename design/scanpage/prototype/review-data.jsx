/* PawnTrail — sample game data for the PGN review screen.
   Italian Game · Evans Gambit (Anderssen — Dufresne, 1852 echo).
   Each ply has SAN, from/to, optional confidence + correction state. */

const buildGame = () => {
  // Build successive board snapshots from a from→to script.
  let b = startPosition();
  const moves = [
    // [san, from, to, conf, suggestions, status]
    // status: 'ok' | 'flagged' | 'illegal' | 'corrected' | 'edited'
    { san: 'e4',    from: 'e2', to: 'e4', conf: 0.99 },
    { san: 'e5',    from: 'e7', to: 'e5', conf: 0.98 },
    { san: 'Nf3',   from: 'g1', to: 'f3', conf: 0.94 },
    { san: 'Nc6',   from: 'b8', to: 'c6', conf: 0.95 },
    { san: 'Bc4',   from: 'f1', to: 'c4', conf: 0.92 },
    { san: 'Bc5',   from: 'f8', to: 'c5', conf: 0.91 },
    { san: 'b4',    from: 'b2', to: 'b4', conf: 0.88, note: 'Evans Gambit' },
    { san: 'Bxb4',  from: 'c5', to: 'b4', conf: 0.78 },
    { san: 'c3',    from: 'c2', to: 'c3', conf: 0.93 },
    { san: 'Ba5',   from: 'b4', to: 'a5', conf: 0.82 },
    { san: 'd4',    from: 'd2', to: 'd4', conf: 0.96 },
    { san: 'exd4',  from: 'e5', to: 'd4', conf: 0.84 },
    // ── Ambiguous OCR: scoresheet shows "N♢3" — could be Nf3 or Nh3
    { san: 'Nh3?',  from: 'g1', to: 'h3', conf: 0.41, status: 'flagged',
      reason: 'Ambiguous handwriting — could be Nf3 or another knight move',
      suggestions: [
        { san: 'Nxd4', from: 'f3', to: 'd4', why: 'Recaptures the pawn — engine top choice',  preferred: true },
        { san: 'O-O',  from: 'e1', to: 'g1', why: 'Castle kingside' },
        { san: 'Qb3',  from: 'd1', to: 'b3', why: 'Queen pressures f7' },
        { san: 'Nh3',  from: 'g1', to: 'h3', why: 'As written (low confidence)' },
      ] },
    // unread row — empty placeholder for the rest
  ];

  const plies = [];
  for (const m of moves) {
    b = applyMove(b, m.from, m.to);
    plies.push({ ...m, board: cloneBoard(b) });
  }

  // also keep a "corrected" fork where ply 13 is Nxd4 instead of Nh3
  const correctedBoard = (() => {
    let bb = startPosition();
    const seq = moves.slice(0, 12);
    for (const m of seq) bb = applyMove(bb, m.from, m.to);
    bb = applyMove(bb, 'f3', 'd4'); // Nxd4 corrected
    return bb;
  })();

  return { plies, correctedBoard };
};

// Per-ply engine analysis — score is from White's perspective (centipawns).
// Lines are arrays of SAN moves continuing from that position.
const ENGINE_ANALYSIS = {
  // ply index -> { depth, scoreCp, lines: [{cp, pv: [...]}, ...], classify }
  0:  { depth: 24, scoreCp:  +30, classify: 'book',
        lines: [
          { cp: +30, pv: ['e5','Nf3','Nc6','Bb5','a6','Ba4'] },
          { cp: +25, pv: ['c5','Nf3','d6','d4','cxd4','Nxd4'] },
          { cp: +22, pv: ['e6','d4','d5','Nc3','Bb4'] },
        ] },
  1:  { depth: 24, scoreCp:  +25, classify: 'book',
        lines: [
          { cp: +25, pv: ['Nf3','Nc6','Bb5','a6','Ba4','Nf6'] },
          { cp: +20, pv: ['Nc3','Nf6','f4','d5','exd5'] },
          { cp: +18, pv: ['Bc4','Nf6','d3','Bc5','Nf3'] },
        ] },
  2:  { depth: 24, scoreCp:  +20, classify: 'book',
        lines: [
          { cp: +20, pv: ['Nc6','Bb5','a6','Ba4','Nf6','O-O'] },
          { cp: +15, pv: ['d6','d4','exd4','Nxd4','Nf6'] },
        ] },
  3:  { depth: 24, scoreCp:  +18, classify: 'book',
        lines: [
          { cp: +18, pv: ['Bb5','a6','Ba4','Nf6','O-O','Be7'] },
          { cp: +15, pv: ['Bc4','Bc5','c3','Nf6','d4'] },
          { cp: +12, pv: ['d4','exd4','Nxd4','Nf6','Nc3'] },
        ] },
  4:  { depth: 24, scoreCp:  +15, classify: 'book',
        lines: [
          { cp: +15, pv: ['Bc5','c3','Nf6','d4','exd4','cxd4'] },
          { cp: +12, pv: ['Be7','d4','d6','c3','Nf6'] },
          { cp: +10, pv: ['Nf6','d3','d6','c3','Be7'] },
        ] },
  5:  { depth: 24, scoreCp:  +14, classify: 'book',
        lines: [
          { cp: +14, pv: ['c3','Nf6','d4','exd4','cxd4','Bb4+'] },
          { cp: +10, pv: ['b4','Bxb4','c3','Ba5','d4','exd4'] },
          { cp: +8,  pv: ['O-O','Nf6','d3','d6','c3'] },
        ] },
  6:  { depth: 25, scoreCp:  -10, classify: 'inaccuracy',
        lines: [
          { cp: +18, pv: ['c3','Nf6','d4','exd4','cxd4','Bb4+'] },
          { cp: -10, pv: ['Bxb4','c3','Ba5','d4','exd4','O-O'] },
          { cp: -25, pv: ['Bb6','a4','a6','Nc3','Nf6','Nd5'] },
        ] },
  7:  { depth: 25, scoreCp:  +5, classify: 'book',
        lines: [
          { cp: +5,  pv: ['c3','Ba5','d4','exd4','O-O','Nge7'] },
          { cp: 0,   pv: ['a3','Bc5','b5','Na5','Nxe5','Qf6'] },
          { cp: -8,  pv: ['Be2','Nf6','d3','d6','c3'] },
        ] },
  8:  { depth: 25, scoreCp:  +12, classify: 'good',
        lines: [
          { cp: +12, pv: ['Ba5','d4','exd4','O-O','Nge7','cxd4'] },
          { cp: -5,  pv: ['Bc5','d4','exd4','cxd4','Bb6','Nc3'] },
          { cp: -22, pv: ['Bd6','d4','exd4','cxd4','Bb4+','Bd2'] },
        ] },
  9:  { depth: 25, scoreCp:  +14, classify: 'good',
        lines: [
          { cp: +14, pv: ['d4','exd4','O-O','Nge7','cxd4','d5'] },
          { cp: +5,  pv: ['Qb3','Qf6','d4','exd4','cxd4','Nh6'] },
          { cp: 0,   pv: ['O-O','Nge7','d4','exd4','cxd4','d5'] },
        ] },
  10: { depth: 26, scoreCp:  +30, classify: 'good',
        lines: [
          { cp: +30, pv: ['exd4','O-O','Nge7','cxd4','d5','exd5'] },
          { cp: +5,  pv: ['Bb6','dxe5','Nxe5','Nxe5','Qg5','Bxf7+'] },
          { cp: -50, pv: ['d6','dxe5','dxe5','Qb3','Qd6','O-O'] },
        ] },
  11: { depth: 26, scoreCp:  +35, classify: 'good',
        lines: [
          { cp: +35, pv: ['Nxd4','Nxd4','Qxd4','O-O','Nf6','e5'] },
          { cp: +28, pv: ['cxd4','Bb4+','Bd2','Bxd2+','Nbxd2','Nf6'] },
          { cp: +5,  pv: ['O-O','dxc3','Nxc3','Nge7','Nd5','O-O'] },
        ] },
  12: { depth: 26, scoreCp:  +175, classify: 'blunder',  // Nh3? — really bad
        lines: [
          { cp: +120, pv: ['Nxd4','Nxd4','Qxd4','O-O','Nf6','e5'] },
          { cp: +95,  pv: ['cxd4','Bb4+','Bd2','Bxd2+','Nbxd2','Nf6'] },
          { cp: +60,  pv: ['Qb3','Qf6','e5','Qg6','cxd4'] },
          { cp: -180, pv: ['Nh3','dxc3','Nxc3','Nf6','e5','Ng4'] },
        ] },
};

// Pre-game vs alternatives — used for popover "BEST" label sourcing
const HEADERS = {
  Event: 'Casual Game',
  Site: 'Berlin',
  Date: '1852.??.??',
  White: 'A. Anderssen',
  Black: 'J. Dufresne',
  Result: '1-0',
  ECO: 'C52',
  Opening: 'Italian — Evans Gambit',
};

Object.assign(window, { buildGame, HEADERS, ENGINE_ANALYSIS });
