/**
 * Motor de jogo — Sinuca por Pontos (1 a 15)
 *
 * Camada independente da UI. Todas as regras da modalidade vivem aqui.
 */

export const MODE_NAME = "Sinuca por Pontos — 1 a 15";

export const ALL_BALLS: number[] = Array.from({ length: 15 }, (_, i) => i + 1);
export const TOTAL_POINTS = ALL_BALLS.reduce((a, b) => a + b, 0); // 120
export const DEFAULT_FOUL_POINTS = 7;

export type MatchMode = "individual" | "duplas";

export interface EnginePlayer {
  id: string;
  name: string;
  score: number;
  balls: number;
  fouls: number;
  teamIndex: number; // 0/1 em duplas, índice do jogador em individual
}

export interface GameState {
  mode: MatchMode;
  target: number;
  players: EnginePlayer[];
  order: string[];
  currentPlayerId: string;
  availableBalls: number[];
  pending: number[];
  turnCount: number;
  finished: boolean;
  winnerPlayerId?: string;
  winnerTeamIndex?: number;
}

export interface TurnRecord {
  index: number;
  playerId: string;
  kind: "pot" | "miss" | "foul";
  balls: number[];
  points: number;
  beneficiaryId?: string;
}

export interface GameEvent {
  type:
    | "match_started"
    | "ball_potted"
    | "turn_confirmed"
    | "miss"
    | "foul"
    | "foul_7_points"
    | "foul_ball_value"
    | "turn_changed"
    | "match_finished";
  payload?: Record<string, unknown>;
}

export interface EngineResult {
  state: GameState;
  turn?: TurnRecord;
  events: GameEvent[];
  gained?: { playerId: string; points: number };
}

export function targetFor(mode: MatchMode, playerCount: number): number {
  if (mode === "duplas") return 60;
  if (playerCount <= 2) return 60;
  if (playerCount === 3) return 40;
  return 30;
}

/** Em duplas a ordem alterna as equipes: A1, B1, A2, B2 */
export function buildOrder(
  mode: MatchMode,
  players: { id: string; teamIndex: number }[],
): string[] {
  if (mode !== "duplas") return players.map((p) => p.id);
  const a = players.filter((p) => p.teamIndex === 0).map((p) => p.id);
  const b = players.filter((p) => p.teamIndex === 1).map((p) => p.id);
  const out: string[] = [];
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i]) out.push(a[i]);
    if (b[i]) out.push(b[i]);
  }
  return out;
}

export function createState(
  mode: MatchMode,
  people: { id: string; name: string; teamIndex: number }[],
): EngineResult {
  const players: EnginePlayer[] = people.map((p) => ({
    id: p.id,
    name: p.name,
    score: 0,
    balls: 0,
    fouls: 0,
    teamIndex: p.teamIndex,
  }));
  const order = buildOrder(mode, players);
  const state: GameState = {
    mode,
    target: targetFor(mode, players.length),
    players,
    order,
    currentPlayerId: order[0],
    availableBalls: [...ALL_BALLS],
    pending: [],
    turnCount: 0,
    finished: false,
  };
  return {
    state,
    events: [
      {
        type: "match_started",
        payload: { mode, target: state.target, players: players.map((p) => p.id) },
      },
    ],
  };
}

export function getPlayer(state: GameState, id: string): EnginePlayer | undefined {
  return state.players.find((p) => p.id === id);
}

export function teamPlayers(state: GameState, teamIndex: number): EnginePlayer[] {
  return state.players.filter((p) => p.teamIndex === teamIndex);
}

export function teamTotal(state: GameState, teamIndex: number): number {
  return teamPlayers(state, teamIndex).reduce((sum, p) => sum + p.score, 0);
}

export function teamName(state: GameState, teamIndex: number): string {
  return teamPlayers(state, teamIndex)
    .map((p) => p.name)
    .join(" + ");
}

export function pendingPoints(state: GameState): number {
  return state.pending.reduce((a, b) => a + b, 0);
}

function clone(state: GameState): GameState {
  return {
    ...state,
    players: state.players.map((p) => ({ ...p })),
    availableBalls: [...state.availableBalls],
    pending: [...state.pending],
  };
}

function advanceTurn(state: GameState, toPlayerId?: string): GameEvent {
  const from = state.currentPlayerId;
  if (toPlayerId) {
    state.currentPlayerId = toPlayerId;
  } else {
    const i = state.order.indexOf(state.currentPlayerId);
    state.currentPlayerId = state.order[(i + 1) % state.order.length];
  }
  return { type: "turn_changed", payload: { from, to: state.currentPlayerId } };
}

/** Vencedor após qualquer alteração de pontuação */
function checkWin(state: GameState, events: GameEvent[]) {
  if (state.mode === "duplas") {
    for (const teamIndex of [0, 1]) {
      if (teamTotal(state, teamIndex) >= state.target) {
        state.finished = true;
        state.winnerTeamIndex = teamIndex;
        break;
      }
    }
  } else {
    const winner = state.players.find((p) => p.score >= state.target);
    if (winner) {
      state.finished = true;
      state.winnerPlayerId = winner.id;
    }
  }

  // Mesa sem bolas e ninguém atingiu a meta: vence quem tem mais pontos.
  if (!state.finished && state.availableBalls.length === 0) {
    state.finished = true;
    if (state.mode === "duplas") {
      state.winnerTeamIndex = teamTotal(state, 0) >= teamTotal(state, 1) ? 0 : 1;
    } else {
      state.winnerPlayerId = [...state.players].sort((a, b) => b.score - a.score)[0]?.id;
    }
  }

  if (state.finished) {
    state.pending = [];
    events.push({
      type: "match_finished",
      payload: {
        winnerPlayerId: state.winnerPlayerId,
        winnerTeamIndex: state.winnerTeamIndex,
      },
    });
  }
}

export function toggleBall(state: GameState, ball: number): GameState {
  if (state.finished) return state;
  if (!state.availableBalls.includes(ball)) return state;
  const next = clone(state);
  next.pending = next.pending.includes(ball)
    ? next.pending.filter((b) => b !== ball)
    : [...next.pending, ball];
  return next;
}

export function clearPending(state: GameState): GameState {
  const next = clone(state);
  next.pending = [];
  return next;
}

export function confirmTurn(state: GameState): EngineResult {
  if (state.finished || state.pending.length === 0) return { state, events: [] };
  const next = clone(state);
  const player = getPlayer(next, next.currentPlayerId)!;
  const balls = [...next.pending];
  const points = balls.reduce((a, b) => a + b, 0);

  player.score += points;
  player.balls += balls.length;
  next.availableBalls = next.availableBalls.filter((b) => !balls.includes(b));
  next.pending = [];
  next.turnCount += 1;

  const events: GameEvent[] = balls.map((ball) => ({
    type: "ball_potted" as const,
    payload: { ball, playerId: player.id, value: ball },
  }));
  events.push({
    type: "turn_confirmed",
    payload: { playerId: player.id, balls, points },
  });

  const turn: TurnRecord = {
    index: next.turnCount,
    playerId: player.id,
    kind: "pot",
    balls,
    points,
  };

  checkWin(next, events);
  if (!next.finished) events.push(advanceTurn(next));

  return { state: next, turn, events, gained: { playerId: player.id, points } };
}

export function registerMiss(state: GameState): EngineResult {
  if (state.finished) return { state, events: [] };
  const next = clone(state);
  next.pending = [];
  next.turnCount += 1;
  const playerId = next.currentPlayerId;
  const events: GameEvent[] = [{ type: "miss", payload: { playerId } }];
  const turn: TurnRecord = { index: next.turnCount, playerId, kind: "miss", balls: [], points: 0 };
  events.push(advanceTurn(next));
  return { state: next, turn, events };
}

export interface FoulInput {
  penalty: "points" | "ball";
  ball?: number;
  beneficiaryId: string;
}

export function defaultBeneficiary(state: GameState): string {
  if (state.mode === "duplas") {
    const offender = getPlayer(state, state.currentPlayerId);
    const other = state.players.find((p) => p.teamIndex !== offender?.teamIndex);
    return other?.id ?? state.currentPlayerId;
  }
  const i = state.order.indexOf(state.currentPlayerId);
  return state.order[(i + 1) % state.order.length];
}

export function foulPoints(input: FoulInput): number {
  return input.penalty === "ball" ? (input.ball ?? DEFAULT_FOUL_POINTS) : DEFAULT_FOUL_POINTS;
}

export function registerFoul(state: GameState, input: FoulInput): EngineResult {
  if (state.finished) return { state, events: [] };
  const next = clone(state);
  const offenderId = next.currentPlayerId;
  const offender = getPlayer(next, offenderId)!;
  const beneficiary = getPlayer(next, input.beneficiaryId) ?? getPlayer(next, defaultBeneficiary(next))!;
  const points = foulPoints(input);

  offender.fouls += 1;
  beneficiary.score += points;
  next.pending = [];
  next.turnCount += 1;

  const events: GameEvent[] = [
    {
      type: input.penalty === "ball" ? "foul_ball_value" : "foul_7_points",
      payload: { offenderId, beneficiaryId: beneficiary.id, points, ball: input.ball },
    },
    { type: "foul", payload: { offenderId, beneficiaryId: beneficiary.id, points } },
  ];

  const turn: TurnRecord = {
    index: next.turnCount,
    playerId: offenderId,
    kind: "foul",
    balls: input.penalty === "ball" && input.ball ? [input.ball] : [],
    points,
    beneficiaryId: beneficiary.id,
  };

  checkWin(next, events);
  if (!next.finished) events.push(advanceTurn(next, beneficiary.id));

  return { state: next, turn, events, gained: { playerId: beneficiary.id, points } };
}
