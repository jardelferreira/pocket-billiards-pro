import { createFileRoute, Link } from "@tanstack/react-router";
import { History, Play, Trophy, Users } from "lucide-react";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Ball } from "@/components/Ball";
import { Button } from "@/components/ui/button";
import { useHydrated } from "@/hooks/useHydrated";
import { getRunningMatch } from "@/lib/data/repository";
import { MODE_NAME, TOTAL_POINTS } from "@/lib/game/engine";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Sinuca — Marcador de partidas por pontos (1 a 15)" },
      {
        name: "description",
        content:
          "Marcador de sinuca por pontos de 1 a 15: crie jogadores, jogue individual ou em duplas, registre bolas e faltas e veja rankings. Funciona offline.",
      },
      { property: "og:title", content: "Sinuca — Marcador de partidas por pontos" },
      {
        property: "og:description",
        content: "Placar de sinuca por pontos (1 a 15) para jogar com os amigos, direto no celular.",
      },
    ],
  }),
  component: Home,
});

function Home() {
  const hydrated = useHydrated();
  const [runningId, setRunningId] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated) return;
    getRunningMatch()
      .then((m) => setRunningId(m?.id ?? null))
      .catch(() => setRunningId(null));
  }, [hydrated]);

  return (
    <AppShell title="Sinuca" subtitle={MODE_NAME}>
      <section className="rounded-3xl border border-border bg-card/70 p-5 text-center shadow-(--shadow-table)">
        <div className="flex justify-center gap-1">
          {[1, 5, 8, 11, 15].map((n) => (
            <Ball key={n} number={n} size="md" />
          ))}
        </div>
        <h2 className="mt-4 text-3xl text-primary">Marque suas partidas</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Cada bola vale o número dela. Todas as bolas somam {TOTAL_POINTS} pontos.
        </p>

        {runningId && (
          <Link to="/partida/$id" params={{ id: runningId }} className="mt-5 block">
            <Button size="lg" variant="secondary" className="w-full text-base">
              Continuar partida em andamento
            </Button>
          </Link>
        )}

        <Link to="/nova-partida" className="mt-3 block">
          <Button size="lg" className="h-14 w-full text-lg font-semibold">
            <Play className="mr-2 h-5 w-5" /> Nova partida
          </Button>
        </Link>
      </section>

      <div className="mt-4 grid grid-cols-3 gap-3">
        <QuickLink to="/jogadores" label="Jogadores" icon={<Users className="h-5 w-5" />} />
        <QuickLink to="/historico" label="Histórico" icon={<History className="h-5 w-5" />} />
        <QuickLink to="/ranking" label="Ranking" icon={<Trophy className="h-5 w-5" />} />
      </div>

      <section className="mt-5 rounded-2xl border border-border bg-card/60 p-4">
        <h3 className="text-lg text-primary">Como pontuar</h3>
        <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
          <li>2 jogadores: primeiro a chegar a 60 pontos vence</li>
          <li>3 jogadores: meta de 40 pontos</li>
          <li>4 jogadores: meta de 30 pontos</li>
          <li>Duplas: soma dos dois jogadores a partir de 60 pontos</li>
          <li>Falta: 7 pontos ou o valor de uma bola escolhida</li>
        </ul>
      </section>
    </AppShell>
  );
}

function QuickLink({
  to,
  label,
  icon,
}: {
  to: "/jogadores" | "/historico" | "/ranking";
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 rounded-2xl border border-border bg-card/60 py-4 text-xs text-foreground"
    >
      <span className="text-primary">{icon}</span>
      {label}
    </Link>
  );
}
