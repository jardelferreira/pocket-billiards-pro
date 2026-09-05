import { createFileRoute } from "@tanstack/react-router";
import { Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHydrated } from "@/hooks/useHydrated";
import {
  createPlayer,
  deletePlayer,
  listPlayers,
  playerStats,
  type PlayerStats,
} from "@/lib/data/repository";
import type { PlayerRow } from "@/lib/data/db";

export const Route = createFileRoute("/jogadores")({
  head: () => ({
    meta: [
      { title: "Jogadores — Sinuca" },
      {
        name: "description",
        content: "Cadastre os jogadores e veja as estatísticas de cada um: vitórias, pontos e bolas.",
      },
      { property: "og:title", content: "Jogadores — Sinuca" },
      { property: "og:description", content: "Cadastro de jogadores e estatísticas individuais." },
    ],
  }),
  component: PlayersPage,
});

function PlayersPage() {
  const hydrated = useHydrated();
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [stats, setStats] = useState<PlayerStats[]>([]);
  const [name, setName] = useState("");
  const [open, setOpen] = useState<PlayerStats | null>(null);

  const refresh = useCallback(async () => {
    setPlayers(await listPlayers());
    setStats(await playerStats());
  }, []);

  useEffect(() => {
    if (hydrated) void refresh();
  }, [hydrated, refresh]);

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    await createPlayer(trimmed);
    setName("");
    await refresh();
  }

  return (
    <AppShell title="Jogadores" subtitle={`${players.length} cadastrados`}>
      <form
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void add();
        }}
      >
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nome do jogador"
          className="h-12 text-base"
        />
        <Button type="submit" size="lg" className="h-12 px-4">
          <Plus className="h-5 w-5" />
        </Button>
      </form>

      <ul className="mt-4 space-y-2">
        {stats.map((s) => (
          <li
            key={s.playerId}
            className="flex items-center gap-3 rounded-2xl border border-border bg-card/70 p-3"
          >
            <button
              type="button"
              onClick={() => setOpen(s)}
              className="flex-1 text-left"
            >
              <p className="text-base font-semibold">{s.name}</p>
              <p className="text-xs text-muted-foreground">
                {s.matches} partidas · {s.wins} vitórias · {s.points} pontos
              </p>
            </button>
            <Button
              variant="ghost"
              size="icon"
              aria-label={`Remover ${s.name}`}
              onClick={async () => {
                await deletePlayer(s.playerId);
                await refresh();
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </li>
        ))}
        {!stats.length && (
          <li className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
            Nenhum jogador ainda. Cadastre o primeiro acima.
          </li>
        )}
      </ul>

      <Dialog open={!!open} onOpenChange={(v) => !v && setOpen(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-2xl text-primary">{open?.name}</DialogTitle>
          </DialogHeader>
          {open && (
            <div className="grid grid-cols-2 gap-3">
              <Stat label="Partidas" value={open.matches} />
              <Stat label="Vitórias" value={open.wins} />
              <Stat label="Derrotas" value={open.losses} />
              <Stat label="Aproveitamento" value={`${open.winRate}%`} />
              <Stat label="Pontos" value={open.points} />
              <Stat label="Média de pontos" value={open.avgPoints} />
              <Stat label="Bolas" value={open.balls} />
              <Stat label="Média de bolas" value={open.avgBalls} />
              <Stat label="Maior pontuação" value={open.bestScore} />
              <Stat label="Faltas" value={open.fouls} />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl border border-border bg-card/60 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="scoreboard-digits text-2xl text-primary">{value}</p>
    </div>
  );
}
