import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/AppShell";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useHydrated } from "@/hooks/useHydrated";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  saveSettings,
  type AppSettings,
} from "@/lib/data/repository";
import { MODE_NAME, TOTAL_POINTS } from "@/lib/game/engine";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({
    meta: [
      { title: "Configurações — Sinuca" },
      {
        name: "description",
        content: "Ajuste nome do aplicativo, som, animações e confirmação antes de encerrar a partida.",
      },
      { property: "og:title", content: "Configurações — Sinuca" },
      { property: "og:description", content: "Preferências simples do marcador de sinuca." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const hydrated = useHydrated();
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    if (hydrated) void loadSettings().then(setSettings);
  }, [hydrated]);

  function update(patch: Partial<AppSettings>) {
    const next = { ...settings, ...patch };
    setSettings(next);
    void saveSettings(next);
  }

  return (
    <AppShell title="Configurações" subtitle="Preferências do aplicativo">
      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-card/70 p-4">
          <Label htmlFor="appName" className="text-sm">
            Nome do aplicativo
          </Label>
          <Input
            id="appName"
            className="mt-2 h-12"
            value={settings.appName}
            onChange={(e) => update({ appName: e.target.value })}
          />
        </div>

        <Toggle
          label="Som"
          description="Efeitos sonoros das jogadas"
          checked={settings.sound}
          onChange={(v) => update({ sound: v })}
        />
        <Toggle
          label="Animações"
          description="Animações de pontuação e bolas"
          checked={settings.animations}
          onChange={(v) => update({ animations: v })}
        />
        <Toggle
          label="Confirmar antes de encerrar"
          description="Pergunta antes de descartar uma partida"
          checked={settings.confirmBeforeFinish}
          onChange={(v) => update({ confirmBeforeFinish: v })}
        />

        <div className="rounded-2xl border border-border bg-card/60 p-4 text-sm text-muted-foreground">
          <p className="text-base text-primary">{MODE_NAME}</p>
          <p className="mt-1">
            Bolas de 1 a 15 valendo o próprio número, somando {TOTAL_POINTS} pontos na mesa. Todos os
            dados ficam salvos apenas neste aparelho e funcionam sem internet.
          </p>
        </div>
      </div>
    </AppShell>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-border bg-card/70 p-4">
      <div>
        <p className="text-base">{label}</p>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
