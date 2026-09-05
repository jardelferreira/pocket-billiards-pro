import {
  getDb,
  uid,
  type MatchEventRow,
  type MatchPlayerRow,
  type MatchRow,
  type MatchTurnRow,
  type PlayerRow,
  type TeamRow,
} from "./db";
import {
  MODE_NAME,
  type GameEvent,
  type GameState,
  type MatchMode,
  type TurnRecord,
} from "@/lib/game/engine";

/* ---------------- players ---------------- */

export async function listPlayers(): Promise<PlayerRow[]> {
  const rows = await getDb().players.toArray();
  return rows.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
}

export async function createPlayer(name: string): Promise<PlayerRow> {
  const row: PlayerRow = { id: uid(), name: name.trim(), createdAt: Date.now() };
  await getDb().players.add(row);
  return row;
}

export async function renamePlayer(id: string, name: string): Promise<void> {
  await getDb().players.update(id, { name: name.trim() });
}

export async function deletePlayer(id: string): Promise<void> {
  await getDb().players.delete(id);
}

export async function getPlayer(id: string): Promise<PlayerRow | undefined> {
  return getDb().players.get(id);
}

/* ---------------- teams ---------------- */

export async function ensureTeam(playerIds: string[], names: string[]): Promise<TeamRow> {
  const key = [...playerIds].sort().join("|");
  const existing = await getDb().teams.where("key").equals(key).first();
  if (existing) return existing;
  const row: TeamRow = {
    id: uid(),
    key,
    name: names.join(" + "),
    playerIds,
    createdAt: Date.now(),
  };
  await getDb().teams.add(row);
  return row;
}

export async function listTeams(): Promise<TeamRow[]> {
  return getDb().teams.toArray();
}

/* ---------------- matches ---------------- */

export async function createMatch(
  state: GameState,
  events: GameEvent[],
  teamIds?: string[],
): Promise<MatchRow> {
  const match: MatchRow = {
    id: uid(),
    mode: state.mode,
    modeName: MODE_NAME,
    target: state.target,
    startedAt: Date.now(),
    status: "running",
    playerIds: state.players.map((p) => p.id),
    teamIds,
    state,
  };
  await getDb().matches.add(match);
  await syncMatchPlayers(match, teamIds);
  await appendEvents(match.id, events);
  return match;
}

export async function getMatch(id: string): Promise<MatchRow | undefined> {
  return getDb().matches.get(id);
}

export async function listMatches(): Promise<MatchRow[]> {
  const rows = await getDb().matches.toArray();
  return rows.sort((a, b) => b.startedAt - a.startedAt);
}

export async function getRunningMatch(): Promise<MatchRow | undefined> {
  const rows = await getDb().matches.where("status").equals("running").toArray();
  return rows.sort((a, b) => b.startedAt - a.startedAt)[0];
}

async function syncMatchPlayers(match: MatchRow, teamIds?: string[]) {
  const rows: MatchPlayerRow[] = match.state.players.map((p) => ({
    id: `${match.id}:${p.id}`,
    matchId: match.id,
    playerId: p.id,
    name: p.name,
    teamIndex: p.teamIndex,
    teamId: teamIds?.[p.teamIndex],
    score: p.score,
    balls: p.balls,
    fouls: p.fouls,
    isWinner:
      match.status === "finished" &&
      (match.mode === "duplas"
        ? p.teamIndex === match.winnerTeamIndex
        : p.id === match.winnerPlayerId),
    finishedAt: match.finishedAt,
  }));
  await getDb().match_players.bulkPut(rows);
}

export async function appendEvents(matchId: string, events: GameEvent[]): Promise<void> {
  if (!events.length) return;
  const at = Date.now();
  const rows: MatchEventRow[] = events.map((e) => ({
    matchId,
    type: e.type,
    payload: e.payload,
    at,
  }));
  await getDb().match_events.bulkAdd(rows);
}

export async function appendTurn(matchId: string, turn: TurnRecord): Promise<void> {
  const row: MatchTurnRow = { matchId, ...turn, at: Date.now() };
  await getDb().match_turns.add(row);
}

export async function saveMatchProgress(
  matchId: string,
  state: GameState,
  events: GameEvent[],
  turn?: TurnRecord,
): Promise<void> {
  const db = getDb();
  const match = await db.matches.get(matchId);
  if (!match) return;
  const finished = state.finished;
  const updated: MatchRow = {
    ...match,
    state,
    status: finished ? "finished" : "running",
    finishedAt: finished ? (match.finishedAt ?? Date.now()) : undefined,
    winnerPlayerId: state.winnerPlayerId,
    winnerTeamIndex: state.winnerTeamIndex,
  };
  await db.matches.put(updated);
  await syncMatchPlayers(updated, match.teamIds);
  if (turn) await appendTurn(matchId, turn);
  await appendEvents(matchId, events);
}

export async function abandonMatch(matchId: string): Promise<void> {
  const db = getDb();
  await db.match_events.where("matchId").equals(matchId).delete();
  await db.match_turns.where("matchId").equals(matchId).delete();
  await db.match_players.where("matchId").equals(matchId).delete();
  await db.matches.delete(matchId);
}

export async function listTurns(matchId: string): Promise<MatchTurnRow[]> {
  const rows = await getDb().match_turns.where("matchId").equals(matchId).toArray();
  return rows.sort((a, b) => a.index - b.index);
}

export async function listMatchPlayers(matchId: string): Promise<MatchPlayerRow[]> {
  return getDb().match_players.where("matchId").equals(matchId).toArray();
}

/* ---------------- stats / rankings ---------------- */

export interface PlayerStats {
  playerId: string;
  name: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  points: number;
  avgPoints: number;
  balls: number;
  avgBalls: number;
  bestScore: number;
  fouls: number;
}

export async function playerStats(): Promise<PlayerStats[]> {
  const db = getDb();
  const [players, mps, matches] = await Promise.all([
    listPlayers(),
    db.match_players.toArray(),
    db.matches.toArray(),
  ]);
  const finished = new Set(matches.filter((m) => m.status === "finished").map((m) => m.id));
  return players
    .map((p) => {
      const rows = mps.filter((r) => r.playerId === p.id && finished.has(r.matchId));
      const wins = rows.filter((r) => r.isWinner).length;
      const points = rows.reduce((a, r) => a + r.score, 0);
      const balls = rows.reduce((a, r) => a + r.balls, 0);
      const n = rows.length;
      return {
        playerId: p.id,
        name: p.name,
        matches: n,
        wins,
        losses: n - wins,
        winRate: n ? Math.round((wins / n) * 100) : 0,
        points,
        avgPoints: n ? Math.round((points / n) * 10) / 10 : 0,
        balls,
        avgBalls: n ? Math.round((balls / n) * 10) / 10 : 0,
        bestScore: rows.reduce((a, r) => Math.max(a, r.score), 0),
        fouls: rows.reduce((a, r) => a + r.fouls, 0),
      };
    })
    .sort((a, b) => b.wins - a.wins || b.points - a.points);
}

export interface TeamStats {
  teamId: string;
  name: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  points: number;
  avgPoints: number;
  balls: number;
  avgBalls: number;
  bestScore: number;
}

export async function teamStats(): Promise<TeamStats[]> {
  const db = getDb();
  const [teams, mps, matches] = await Promise.all([
    listTeams(),
    db.match_players.toArray(),
    db.matches.toArray(),
  ]);
  const finished = new Set(
    matches.filter((m) => m.status === "finished" && m.mode === "duplas").map((m) => m.id),
  );
  return teams
    .map((t) => {
      const rows = mps.filter((r) => r.teamId === t.id && finished.has(r.matchId));
      const matchIds = [...new Set(rows.map((r) => r.matchId))];
      const perMatch = matchIds.map((id) => {
        const inMatch = rows.filter((r) => r.matchId === id);
        return {
          points: inMatch.reduce((a, r) => a + r.score, 0),
          balls: inMatch.reduce((a, r) => a + r.balls, 0),
          won: inMatch.some((r) => r.isWinner),
        };
      });
      const n = perMatch.length;
      const wins = perMatch.filter((m) => m.won).length;
      const points = perMatch.reduce((a, m) => a + m.points, 0);
      const balls = perMatch.reduce((a, m) => a + m.balls, 0);
      return {
        teamId: t.id,
        name: t.name,
        matches: n,
        wins,
        losses: n - wins,
        winRate: n ? Math.round((wins / n) * 100) : 0,
        points,
        avgPoints: n ? Math.round((points / n) * 10) / 10 : 0,
        balls,
        avgBalls: n ? Math.round((balls / n) * 10) / 10 : 0,
        bestScore: perMatch.reduce((a, m) => Math.max(a, m.points), 0),
      };
    })
    .filter((t) => t.matches > 0)
    .sort((a, b) => b.wins - a.wins || b.points - a.points);
}

/* ---------------- settings ---------------- */

export interface AppSettings {
  appName: string;
  sound: boolean;
  animations: boolean;
  confirmBeforeFinish: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  appName: "Sinuca",
  sound: true,
  animations: true,
  confirmBeforeFinish: true,
};

export async function loadSettings(): Promise<AppSettings> {
  const row = await getDb().settings.get("app");
  return { ...DEFAULT_SETTINGS, ...((row?.value as Partial<AppSettings>) ?? {}) };
}

export async function saveSettings(value: AppSettings): Promise<void> {
  await getDb().settings.put({ key: "app", value });
}
