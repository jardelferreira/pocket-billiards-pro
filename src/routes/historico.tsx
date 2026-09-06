import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { useHydrated } from "@/hooks/useHydrated";
import { listMatches } from "@/lib/data/repository";
import type { MatchRow } from "@/lib/data/db";
import { getPlayer, teamName, teamTotal } from "@/lib/game/engine";

export const Route = createFileRoute("/historico")({
  head: () => ({
    meta: [
      { title: "Histórico de partidas — Sinuca" },
      {
        name: "description",
        content: "Todas as partidas salvas no aparelho: data, jogadores, placar e vencedor.",
      },
      { property: "og:title", content: "Histórico de partidas — Sinuca" },
      { property: "og:description", content: "Consulte as partidas anteriores e seus detalhes." },
    ],
  }),
  component: HistoryPage,
});

export function formatDate(ts: number): string {
  return new Date(ts).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDuration(start: number, end?: number): string {
  if (!end) return "—";
  const mins = Math.max(1, Math.round((end - start) / 60000));
  return mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}min` : `${mins} min`;
}

export function winnerLabel(match: MatchRow): string {
  if (match.status !== "finished") return "Em andamento";
  if (match.mode === "duplas") return teamName(match.state, match.winnerTeamIndex ?? 0);
  return getPlayer(match.state, match.winnerPlayerId ?? "")?.name ?? "—";
}

function HistoryPage() {
  const hydrated = useHydrated();
  const [matches, setMatches] = useState<MatchRow[]>([]);

  useEffect(() => {
    if (hydrated) void listMatches().then(setMatches);
  }, [hydrated]);

  return (
    <AppShell title="Histórico" subtitle={`${matches.length} partidas salvas`}>
      <ul className="space-y-2">
        {matches.map((m) => (
          <li key={m.id}>
            <Link
              to="/historico/$id"
              params={{ id: m.id }}
              className="block rounded-2xl border border-border bg-card/70 p-4"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">{formatDate(m.startedAt)}</p>
                <p className="text-xs text-primary">
                  {m.mode === "duplas" ? "Duplas" : "Individual"} · meta {m.target}
                </p>
              </div>
              <p className="mt-1 text-base font-semibold">
                {m.mode === "duplas"
                  ? `${teamName(m.state, 0)} ${teamTotal(m.state, 0)} × ${teamTotal(m.state, 1)} ${teamName(m.state, 1)}`
                  : m.state.players.map((p) => `${p.name} ${p.score}`).join(" × ")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">🏆 {winnerLabel(m)}</p>
            </Link>
          </li>
        ))}
        {!matches.length && (
          <li className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhuma partida registrada ainda.
          </li>
        )}
      </ul>
    </AppShell>
  );
}
