import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/hooks/useHydrated";
import { createMatch, ensureTeam, listPlayers } from "@/lib/data/repository";
import type { PlayerRow } from "@/lib/data/db";
import { createState, targetFor, type MatchMode } from "@/lib/game/engine";

export const Route = createFileRoute("/nova-partida")({
  head: () => ({
    meta: [
      { title: "Nova partida — Sinuca" },
      {
        name: "description",
        content: "Escolha individual ou duplas, selecione os jogadores e comece a marcar a partida.",
      },
      { property: "og:title", content: "Nova partida — Sinuca" },
      {
        property: "og:description",
        content: "Monte a partida com 2, 3 ou 4 jogadores, ou jogue em duplas.",
      },
    ],
  }),
  component: NewMatch,
});

function NewMatch() {
  const hydrated = useHydrated();
  const navigate = useNavigate();
  const [players, setPlayers] = useState<PlayerRow[]>([]);
  const [mode, setMode] = useState<MatchMode>("individual");
  const [selected, setSelected] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (hydrated) void listPlayers().then(setPlayers);
  }, [hydrated]);

  const max = mode === "duplas" ? 4 : 4;
  const min = mode === "duplas" ? 4 : 2;

  const toggle = useCallback(
    (id: string) => {
      setSelected((cur) =>
        cur.includes(id) ? cur.filter((x) => x !== id) : cur.length >= max ? cur : [...cur, id],
      );
    },
    [max],
  );

  const ready = selected.length >= min && (mode !== "duplas" || selected.length === 4);
  const target = mode === "duplas" ? 60 : targetFor("individual", Math.max(selected.length, 2));

  async function start() {
    if (!ready || busy) return;
    setBusy(true);
    try {
      const people = selected.map((id, i) => {
        const p = players.find((x) => x.id === id)!;
        return {
          id: p.id,
          name: p.name,
          teamIndex: mode === "duplas" ? (i < 2 ? 0 : 1) : i,
        };
      });
      const { state, events } = createState(mode, people);
      let teamIds: string[] | undefined;
      if (mode === "duplas") {
        const a = await ensureTeam(
          people.slice(0, 2).map((p) => p.id),
          people.slice(0, 2).map((p) => p.name),
        );
        const b = await ensureTeam(
          people.slice(2).map((p) => p.id),
          people.slice(2).map((p) => p.name),
        );
        teamIds = [a.id, b.id];
      }
      const match = await createMatch(state, events, teamIds);
      await navigate({ to: "/partida/$id", params: { id: match.id } });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell title="Nova partida" subtitle="Sinuca por Pontos — 1 a 15">
      <div className="grid grid-cols-2 gap-3">
        {(["individual", "duplas"] as MatchMode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setMode(m);
              setSelected([]);
            }}
            className={cn(
              "rounded-2xl border p-4 text-center transition-colors",
              mode === m
                ? "border-primary bg-primary/15 text-primary"
                : "border-border bg-card/60 text-muted-foreground",
            )}
          >
            <span className="block text-lg font-semibold">
              {m === "individual" ? "Individual" : "Duplas"}
            </span>
            <span className="text-xs">
              {m === "individual" ? "2, 3 ou 4 jogadores" : "2 duplas · meta 60"}
            </span>
          </button>
        ))}
      </div>

      <p className="mt-4 text-sm text-muted-foreground">
        {mode === "duplas"
          ? "Escolha 4 jogadores na ordem: os 2 primeiros formam a Dupla A."
          : `Escolha de 2 a 4 jogadores. Meta atual: ${target} pontos.`}
      </p>

      <ul className="mt-3 space-y-2">
        {players.map((p) => {
          const idx = selected.indexOf(p.id);
          const picked = idx >= 0;
          return (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => toggle(p.id)}
                className={cn(
                  "flex w-full items-center justify-between rounded-2xl border p-4 text-left",
                  picked ? "border-primary bg-primary/10" : "border-border bg-card/60",
                )}
              >
                <span className="text-base font-medium">{p.name}</span>
                {picked && (
                  <span className="scoreboard-digits text-sm text-primary">
                    {mode === "duplas" ? (idx < 2 ? "Dupla A" : "Dupla B") : `${idx + 1}º`}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ul>

      {!players.length && (
        <div className="mt-3 rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
          Cadastre jogadores primeiro.
          <Link to="/jogadores" className="mt-3 block">
            <Button variant="secondary">Ir para jogadores</Button>
          </Link>
        </div>
      )}

      <div className="fixed bottom-20 left-0 right-0 px-4">
        <div className="mx-auto max-w-lg">
          <Button
            size="lg"
            className="h-14 w-full text-lg font-semibold"
            disabled={!ready || busy}
            onClick={() => void start()}
          >
            Começar partida
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
