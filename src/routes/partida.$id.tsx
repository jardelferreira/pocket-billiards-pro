import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CircleSlash, Trophy, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Ball } from "@/components/Ball";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useHydrated } from "@/hooks/useHydrated";
import { cn } from "@/lib/utils";
import {
  abandonMatch,
  getMatch,
  loadSettings,
  saveMatchProgress,
  DEFAULT_SETTINGS,
  type AppSettings,
} from "@/lib/data/repository";
import {
  ALL_BALLS,
  clearPending,
  confirmTurn,
  defaultBeneficiary,
  foulPoints,
  getPlayer,
  MODE_NAME,
  pendingPoints,
  registerFoul,
  registerMiss,
  teamName,
  teamPlayers,
  teamTotal,
  toggleBall,
  type EngineResult,
  type GameState,
} from "@/lib/game/engine";

export const Route = createFileRoute("/partida/$id")({
  head: () => ({
    meta: [
      { title: "Partida em andamento — Sinuca" },
      {
        name: "description",
        content: "Placar ao vivo da partida: bolas disponíveis, jogador da vez, faltas e pontuação.",
      },
      { property: "og:title", content: "Partida em andamento — Sinuca" },
      { property: "og:description", content: "Marcador eletrônico da sinuca por pontos 1 a 15." },
    ],
  }),
  component: MatchPage,
});

interface FloatScore {
  key: number;
  playerId: string;
  points: number;
}

function MatchPage() {
  const { id } = Route.useParams();
  const hydrated = useHydrated();
  const navigate = useNavigate();

  const [state, setState] = useState<GameState | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [floats, setFloats] = useState<FloatScore[]>([]);
  const [foulOpen, setFoulOpen] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);

  useEffect(() => {
    if (!hydrated) return;
    void (async () => {
      const [match, s] = await Promise.all([getMatch(id), loadSettings()]);
      setSettings(s);
      setState(match?.state ?? null);
      setLoading(false);
    })();
  }, [hydrated, id]);

  const apply = useCallback(
    async (result: EngineResult) => {
      if (result.state === state && !result.events.length) return;
      setState(result.state);
      if (result.gained && settings.animations) {
        const key = Date.now() + Math.random();
        setFloats((f) => [...f, { key, playerId: result.gained!.playerId, points: result.gained!.points }]);
        setTimeout(() => setFloats((f) => f.filter((x) => x.key !== key)), 1000);
      }
      await saveMatchProgress(id, result.state, result.events, result.turn);
    },
    [id, settings.animations, state],
  );

  const pending = state ? pendingPoints(state) : 0;

  if (loading) {
    return <CenterNote text="Carregando partida…" />;
  }
  if (!state) {
    return <CenterNote text="Partida não encontrada." home />;
  }

  if (state.finished) {
    return <Result state={state} />;
  }

  const current = getPlayer(state, state.currentPlayerId)!;

  return (
    <div className="felt-surface min-h-screen pb-56">
      <header className="wood-frame sticky top-0 z-20 flex items-center justify-between px-4 py-3">
        <div>
          <p className="text-xs text-primary-foreground/80">{MODE_NAME}</p>
          <p className="scoreboard-digits text-lg text-primary">Meta: {state.target} pontos</p>
        </div>
        <Button variant="ghost" size="icon" aria-label="Encerrar partida" onClick={() => setQuitOpen(true)}>
          <X className="h-5 w-5" />
        </Button>
      </header>

      <div className="mx-auto w-full max-w-lg px-4 py-4">
        {/* Placar */}
        {state.mode === "duplas" ? (
          <div className="grid grid-cols-2 gap-3">
            {[0, 1].map((t) => {
              const total = teamTotal(state, t);
              const isCurrent = current.teamIndex === t;
              return (
                <div
                  key={t}
                  className={cn(
                    "rounded-2xl border p-3",
                    isCurrent ? "border-primary bg-primary/10" : "border-border bg-card/70",
                  )}
                >
                  <p className="truncate text-xs text-muted-foreground">{teamName(state, t)}</p>
                  <p className="scoreboard-digits text-4xl text-primary">{total}</p>
                  <ul className="mt-1 space-y-1">
                    {teamPlayers(state, t).map((p) => (
                      <li
                        key={p.id}
                        className={cn(
                          "relative flex justify-between text-sm",
                          p.id === current.id && "font-semibold text-primary",
                        )}
                      >
                        <span className="truncate">{p.name}</span>
                        <span className="scoreboard-digits">{p.score}</span>
                        <Floaters floats={floats} playerId={p.id} />
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={cn("grid gap-3", state.players.length > 2 ? "grid-cols-2" : "grid-cols-2")}>
            {state.players.map((p) => (
              <div
                key={p.id}
                className={cn(
                  "relative rounded-2xl border p-3",
                  p.id === current.id ? "border-primary bg-primary/10" : "border-border bg-card/70",
                )}
              >
                <p className="truncate text-xs text-muted-foreground">{p.name}</p>
                <p className="scoreboard-digits animate-(--animate-count-up) text-4xl text-primary" key={p.score}>
                  {p.score}
                </p>
                <p className="text-[0.65rem] text-muted-foreground">
                  {p.balls} bolas · {p.fouls} faltas
                </p>
                <Floaters floats={floats} playerId={p.id} />
              </div>
            ))}
          </div>
        )}

        {/* Jogador da vez */}
        <div className="mt-4 rounded-3xl border border-primary/60 bg-card/80 p-4 text-center shadow-(--shadow-table)">
          <p className="text-xs tracking-widest text-muted-foreground uppercase">Jogador da vez</p>
          <p className="text-3xl text-primary">{current.name}</p>
          <div className="mt-3 flex items-center justify-center gap-3">
            <Ball cue size="lg" />
            <p className="text-left text-xs text-muted-foreground">
              Bola branca é a tacadeira
              <br />e não vale pontos
            </p>
          </div>
        </div>

        {/* Bolas disponíveis */}
        <div className="mt-4 rounded-3xl border border-border bg-card/60 p-4">
          <p className="text-xs text-muted-foreground">
            Bolas na mesa · {state.availableBalls.length} restantes
          </p>
          <div className="mt-3 grid grid-cols-5 justify-items-center gap-3">
            {ALL_BALLS.map((n) => {
              const available = state.availableBalls.includes(n);
              return (
                <Ball
                  key={n}
                  number={n}
                  size="lg"
                  dimmed={!available}
                  selected={state.pending.includes(n)}
                  disabled={!available}
                  onClick={available ? () => setState(toggleBall(state, n)) : undefined}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* Controles fixos */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 px-4 pt-3 pb-5 backdrop-blur">
        <div className="mx-auto max-w-lg">
          {state.pending.length > 0 && (
            <div className="mb-3 rounded-2xl border border-primary/50 bg-primary/10 p-3 text-center">
              <p className="text-xs tracking-widest text-muted-foreground uppercase">Jogada atual</p>
              <p className="text-lg">{state.pending.join(" + ")}</p>
              <p className="scoreboard-digits text-3xl text-primary">TOTAL: +{pending}</p>
            </div>
          )}
          <div className="flex gap-2">
            <Button
              size="lg"
              className="h-14 flex-1 text-base font-semibold"
              disabled={!state.pending.length}
              onClick={() => void apply(confirmTurn(state))}
            >
              Confirmar jogada
            </Button>
            {state.pending.length > 0 && (
              <Button
                size="lg"
                variant="secondary"
                className="h-14"
                onClick={() => setState(clearPending(state))}
              >
                Cancelar
              </Button>
            )}
          </div>
          <div className="mt-2 flex gap-2">
            <Button
              variant="secondary"
              className="h-12 flex-1"
              onClick={() => void apply(registerMiss(state))}
            >
              <CircleSlash className="mr-2 h-4 w-4" /> Não encaçapou
            </Button>
            <Button variant="destructive" className="h-12 flex-1" onClick={() => setFoulOpen(true)}>
              ⚠️ Falta
            </Button>
          </div>
        </div>
      </div>

      <FoulDialog
        open={foulOpen}
        onOpenChange={setFoulOpen}
        state={state}
        onConfirm={(result) => {
          setFoulOpen(false);
          void apply(result);
        }}
      />

      <Dialog open={quitOpen} onOpenChange={setQuitOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Encerrar partida?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            A partida será descartada e não entrará no histórico.
          </p>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setQuitOpen(false)}>
              Voltar ao jogo
            </Button>
            <Button
              variant="destructive"
              onClick={async () => {
                await abandonMatch(id);
                await navigate({ to: "/" });
              }}
            >
              Encerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Floaters({ floats, playerId }: { floats: FloatScore[]; playerId: string }) {
  return (
    <>
      {floats
        .filter((f) => f.playerId === playerId)
        .map((f) => (
          <span
            key={f.key}
            className="scoreboard-digits pointer-events-none absolute -top-1 right-2 animate-(--animate-score-pop) text-2xl text-primary"
          >
            +{f.points}
          </span>
        ))}
    </>
  );
}

function FoulDialog({
  open,
  onOpenChange,
  state,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  state: GameState;
  onConfirm: (result: EngineResult) => void;
}) {
  const [penalty, setPenalty] = useState<"points" | "ball">("points");
  const [ball, setBall] = useState<number | undefined>(undefined);
  const [beneficiaryId, setBeneficiaryId] = useState(() => defaultBeneficiary(state));

  useEffect(() => {
    if (open) {
      setPenalty("points");
      setBall(undefined);
      setBeneficiaryId(defaultBeneficiary(state));
    }
  }, [open, state]);

  const offender = getPlayer(state, state.currentPlayerId)!;
  const beneficiary = getPlayer(state, beneficiaryId);
  const points = foulPoints({ penalty, ball, beneficiaryId });
  const valid = penalty === "points" || !!ball;
  const others = useMemo(
    () => state.players.filter((p) => p.id !== offender.id),
    [state.players, offender.id],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[88vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">⚠️ Registrar falta</DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">Falta de {offender.name}</p>

        <div className="space-y-2">
          <p className="text-xs tracking-widest text-muted-foreground uppercase">Penalidade</p>
          {(["points", "ball"] as const).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPenalty(p)}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border p-3 text-left",
                penalty === p ? "border-primary bg-primary/10" : "border-border bg-card/60",
              )}
            >
              <span
                className={cn(
                  "h-4 w-4 rounded-full border-2",
                  penalty === p ? "border-primary bg-primary" : "border-muted-foreground",
                )}
              />
              {p === "points" ? "7 pontos (padrão)" : "Valor da bola"}
            </button>
          ))}
        </div>

        {penalty === "ball" && (
          <div className="grid grid-cols-5 justify-items-center gap-2">
            {ALL_BALLS.map((n) => (
              <Ball key={n} number={n} size="md" selected={ball === n} onClick={() => setBall(n)} />
            ))}
          </div>
        )}

        <div className="space-y-2">
          <p className="text-xs tracking-widest text-muted-foreground uppercase">Quem recebe os pontos</p>
          <div className="flex flex-wrap gap-2">
            {others.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setBeneficiaryId(p.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm",
                  beneficiaryId === p.id
                    ? "border-primary bg-primary/15 text-primary"
                    : "border-border bg-card/60",
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-primary/50 bg-primary/10 p-3 text-center">
          <p className="text-sm">
            {penalty === "ball" && ball ? `Falta — Bola ${ball}` : "Falta — 7 pontos"}
          </p>
          <p className="scoreboard-digits text-3xl text-primary">
            {beneficiary?.name} recebe +{points}
          </p>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!valid}
            onClick={() => onConfirm(registerFoul(state, { penalty, ball, beneficiaryId }))}
          >
            Confirmar falta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Result({ state }: { state: GameState }) {
  const winnerLabel =
    state.mode === "duplas"
      ? `${teamName(state, state.winnerTeamIndex ?? 0)} venceram!`
      : `${getPlayer(state, state.winnerPlayerId ?? "")?.name} venceu!`;
  const winnerScore =
    state.mode === "duplas"
      ? teamTotal(state, state.winnerTeamIndex ?? 0)
      : (getPlayer(state, state.winnerPlayerId ?? "")?.score ?? 0);

  return (
    <div className="felt-surface flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg rounded-3xl border border-primary/50 bg-card/80 p-6 text-center shadow-(--shadow-table)">
        <Trophy className="mx-auto h-14 w-14 text-primary" />
        <h1 className="mt-3 text-3xl text-primary">{winnerLabel}</h1>
        <p className="scoreboard-digits text-6xl text-primary">{winnerScore}</p>
        <p className="text-xs text-muted-foreground">pontos · {MODE_NAME}</p>

        <ul className="mt-5 space-y-2 text-left">
          {state.players.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-xl border border-border bg-card/60 p-3"
            >
              <span>
                {p.name}
                {state.mode === "duplas" && (
                  <span className="ml-2 text-xs text-muted-foreground">
                    Dupla {p.teamIndex === 0 ? "A" : "B"}
                  </span>
                )}
              </span>
              <span className="scoreboard-digits text-xl text-primary">
                {p.score}
                <span className="ml-2 text-xs text-muted-foreground">
                  {p.balls} bolas · {p.fouls} faltas
                </span>
              </span>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-col gap-2">
          <Link to="/nova-partida">
            <Button size="lg" className="h-12 w-full">
              Nova partida
            </Button>
          </Link>
          <Link to="/historico">
            <Button size="lg" variant="secondary" className="h-12 w-full">
              Ver histórico
            </Button>
          </Link>
          <Link to="/">
            <Button variant="ghost" className="w-full">
              Início
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

function CenterNote({ text, home }: { text: string; home?: boolean }) {
  return (
    <div className="felt-surface flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <p className="text-muted-foreground">{text}</p>
      {home && (
        <Link to="/">
          <Button variant="secondary">Voltar ao início</Button>
        </Link>
      )}
    </div>
  );
}
