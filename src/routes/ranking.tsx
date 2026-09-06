import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useHydrated } from "@/hooks/useHydrated";
import { playerStats, teamStats, type PlayerStats, type TeamStats } from "@/lib/data/repository";

export const Route = createFileRoute("/ranking")({
  head: () => ({
    meta: [
      { title: "Rankings — Sinuca" },
      {
        name: "description",
        content: "Rankings de pontos, bolas encaçapadas e aproveitamento, individual e em duplas.",
      },
      { property: "og:title", content: "Rankings — Sinuca" },
      { property: "og:description", content: "Quem pontua mais, quem encaçapa mais e quem vence mais." },
    ],
  }),
  component: RankingPage,
});

type Row = { id: string; name: string; value: string | number; sub: string };

function RankingPage() {
  const hydrated = useHydrated();
  const [players, setPlayers] = useState<PlayerStats[]>([]);
  const [teams, setTeams] = useState<TeamStats[]>([]);

  useEffect(() => {
    if (!hydrated) return;
    void playerStats().then(setPlayers);
    void teamStats().then(setTeams);
  }, [hydrated]);

  return (
    <AppShell title="Rankings" subtitle="Sinuca por Pontos — 1 a 15">
      <Tabs defaultValue="individual">
        <TabsList className="w-full">
          <TabsTrigger value="individual" className="flex-1">
            Individual
          </TabsTrigger>
          <TabsTrigger value="duplas" className="flex-1">
            Duplas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="individual" className="space-y-5">
          <Board
            title="Pontos"
            rows={[...players]
              .sort((a, b) => b.points - a.points)
              .map((p) => ({
                id: p.playerId,
                name: p.name,
                value: p.points,
                sub: `média ${p.avgPoints} por partida`,
              }))}
          />
          <Board
            title="Bolas encaçapadas"
            rows={[...players]
              .sort((a, b) => b.balls - a.balls)
              .map((p) => ({
                id: p.playerId,
                name: p.name,
                value: p.balls,
                sub: `média ${p.avgBalls} por partida`,
              }))}
          />
          <Board
            title="Partidas"
            rows={[...players]
              .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins)
              .map((p) => ({
                id: p.playerId,
                name: p.name,
                value: `${p.winRate}%`,
                sub: `${p.matches} partidas · ${p.wins}V ${p.losses}D`,
              }))}
          />
        </TabsContent>

        <TabsContent value="duplas" className="space-y-5">
          <Board
            title="Pontos"
            rows={[...teams]
              .sort((a, b) => b.points - a.points)
              .map((t) => ({
                id: t.teamId,
                name: t.name,
                value: t.points,
                sub: `média ${t.avgPoints} por partida`,
              }))}
          />
          <Board
            title="Bolas encaçapadas"
            rows={[...teams]
              .sort((a, b) => b.balls - a.balls)
              .map((t) => ({
                id: t.teamId,
                name: t.name,
                value: t.balls,
                sub: `média ${t.avgBalls} por partida`,
              }))}
          />
          <Board
            title="Partidas"
            rows={[...teams]
              .sort((a, b) => b.winRate - a.winRate || b.wins - a.wins)
              .map((t) => ({
                id: t.teamId,
                name: t.name,
                value: `${t.winRate}%`,
                sub: `${t.matches} partidas · ${t.wins}V ${t.losses}D`,
              }))}
          />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}

function Board({ title, rows }: { title: string; rows: Row[] }) {
  return (
    <section>
      <h2 className="text-xl text-primary">{title}</h2>
      <ul className="mt-2 space-y-2">
        {rows.map((r, i) => (
          <li
            key={r.id}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 p-3"
          >
            <span className="scoreboard-digits w-6 text-center text-lg text-muted-foreground">
              {i + 1}
            </span>
            <span className="flex-1">
              <span className="block text-base font-medium">{r.name}</span>
              <span className="block text-xs text-muted-foreground">{r.sub}</span>
            </span>
            <span className="scoreboard-digits text-2xl text-primary">{r.value}</span>
          </li>
        ))}
        {!rows.length && (
          <li className="rounded-2xl border border-dashed border-border p-5 text-center text-sm text-muted-foreground">
            Sem dados ainda.
          </li>
        )}
      </ul>
    </section>
  );
}
