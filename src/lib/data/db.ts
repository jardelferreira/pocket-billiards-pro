import Dexie, { type Table } from "dexie";

import type { GameState, MatchMode } from "@/lib/game/engine";

export interface PlayerRow {
  id: string;
  name: string;
  createdAt: number;
}

export interface TeamRow {
  id: string;
  key: string; // ids ordenados, para reutilizar a mesma dupla
  name: string;
  playerIds: string[];
  createdAt: number;
}

export interface MatchRow {
  id: string;
  mode: MatchMode;
  modeName: string;
  target: number;
  startedAt: number;
  finishedAt?: number;
  status: "running" | "finished";
  playerIds: string[];
  teamIds?: string[];
  winnerPlayerId?: string;
  winnerTeamIndex?: number;
  state: GameState;
}

export interface MatchPlayerRow {
  id: string; // matchId:playerId
  matchId: string;
  playerId: string;
  name: string;
  teamIndex: number;
  teamId?: string;
  score: number;
  balls: number;
  fouls: number;
  isWinner: boolean;
  finishedAt?: number;
}

export interface MatchTurnRow {
  id?: number;
  matchId: string;
  index: number;
  playerId: string;
  kind: "pot" | "miss" | "foul";
  balls: number[];
  points: number;
  beneficiaryId?: string;
  at: number;
}

export interface MatchEventRow {
  id?: number;
  matchId: string;
  type: string;
  payload?: Record<string, unknown>;
  at: number;
}

export interface SettingRow {
  key: string;
  value: unknown;
}

export class SinucaDb extends Dexie {
  players!: Table<PlayerRow, string>;
  teams!: Table<TeamRow, string>;
  matches!: Table<MatchRow, string>;
  match_players!: Table<MatchPlayerRow, string>;
  match_turns!: Table<MatchTurnRow, number>;
  match_events!: Table<MatchEventRow, number>;
  settings!: Table<SettingRow, string>;

  constructor() {
    super("sinuca");
    this.version(1).stores({
      players: "id, name, createdAt",
      teams: "id, key, createdAt",
      matches: "id, status, startedAt, finishedAt",
      match_players: "id, matchId, playerId, teamId",
      match_turns: "++id, matchId, index",
      match_events: "++id, matchId, type, at",
      settings: "key",
    });
  }
}

let instance: SinucaDb | null = null;

/** Só existe no navegador — nunca instanciar durante o SSR. */
export function getDb(): SinucaDb {
  if (typeof indexedDB === "undefined") {
    throw new Error("IndexedDB indisponível (execução fora do navegador)");
  }
  if (!instance) instance = new SinucaDb();
  return instance;
}

export function uid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
