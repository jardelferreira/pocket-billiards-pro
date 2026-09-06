import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Ball } from "@/components/Ball";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/useHydrated";
import { getMatch, listTurns } from "@/lib/data/repository";
import type { MatchRow, MatchTurnRow } from "@/lib/data/db";
import { getPlayer, teamName, teamTotal } from "@/lib/game/engine";
import { formatDate, formatDuration, winnerLabel } from "./historico";

export const Route = createFileRoute("/historico/$id")({
  head: () => ({
    meta: [
      { title: "Detalhes da partida — Sinuca" },
      {
        name: "description",
        content: "Placar final, bolas encaçapadas, faltas e todos os turnos da partida.",
      },
      { property: "og:title", content: "Detalhes da partida — Sinuca" },
      { property: "og:description", content: "Veja turno por turno como a partida foi decidida." },
    ],
  }),
  component: MatchDetail,
});

function MatchDetail() {
  const { id } = Route.useParams();
  const hydrated = useHydrated();
  const [match, setMatch] = useState<MatchRow | null>(null);
  const [turns, setTurns] = useState<MatchTurnRow[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    void (async () => {
      setMatch((await getMatch(id)) ?? null);
      setTurns(await listTurns(id));
    })();
  }, [hydrated, id]);

  if (!match) {
    return (
      <AppShell title="Partida">
        <p className="text-sm text-muted-foreground">Partida não encontrada.</p>
      </AppShell>
    );
  }

  const s = match.state;

  return (
    <AppShell title="Partida" subtitle={match.modeName}>
      <section className="rounded-2xl border border-border bg-card/70 p-4">
        <p className="text-xs text-muted-foreground">{formatDate(match.startedAt)}</p>
        <p className="text-lg text-primary">🏆 {winnerLabel(match)}</p>
        <p className="text-xs text-muted-foreground">
          {match.mode === "duplas" ? "Duplas" : "Individual"} · meta {match.target} · duração{" "}
          {formatDuration(match.startedAt, match.finishedAt)}
        </p>
      </section>

      {match.mode === "duplas" && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {[0, 1].map((t) => (
            <div key={t} className="rounded-2xl border border-border bg-card/60 p-3">
              <p className="truncate text-xs text-muted-foreground">{teamName(s, t)}</p>
              <p className="scoreboard-digits text-3xl text-primary">{teamTotal(s, t)}</p>
            </div>
          ))}
        </div>
      )}

      <ul className="mt-3 space-y-2">
        {s.players.map((p) => (
          <li
            key={p.id}
            className="flex items-center justify-between rounded-2xl border border-border bg-card/60 p-3"
          >
            <span>{p.name}</span>
            <span className="text-right">
              <span className="scoreboard-digits text-xl text-primary">{p.score}</span>
              <span className="block text-[0.7rem] text-muted-foreground">
                {p.balls} bolas · {p.fouls} faltas
              </span>
            </span>
          </li>
        ))}
      </ul>

      <h2 className="mt-6 text-xl text-primary">Turnos</h2>
      <ol className="mt-2 space-y-2">
        {turns.map((t) => {
          const player = getPlayer(s, t.playerId);
          const beneficiary = t.beneficiaryId ? getPlayer(s, t.beneficiaryId) : undefined;
          return (
            <li key={t.id} className="rounded-2xl border border-border bg-card/60 p-3">
              <p className="text-xs text-muted-foreground">Turno {t.index}</p>
              <p className="font-semibold">{player?.name}</p>
              {t.kind === "pot" && (
                <div className="mt-2 flex items-center gap-2">
                  {t.balls.map((b) => (
                    <Ball key={b} number={b} size="sm" />
                  ))}
                  <span className="scoreboard-digits text-lg text-primary">+{t.points}</span>
                </div>
              )}
              {t.kind === "miss" && <p className="text-sm text-muted-foreground">Não encaçapou</p>}
              {t.kind === "foul" && (
                <p className="text-sm">
                  Falta{t.balls[0] ? ` — bola ${t.balls[0]}` : ""} · +{t.points} para{" "}
                  {beneficiary?.name}
                </p>
              )}
            </li>
          );
        })}
        {!turns.length && <li className="text-sm text-muted-foreground">Sem turnos registrados.</li>}
      </ol>

      <Link to="/historico" className="mt-6 block">
        <Button variant="secondary" className="w-full">
          Voltar ao histórico
        </Button>
      </Link>
    </AppShell>
  );
}
