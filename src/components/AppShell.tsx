import { Link } from "@tanstack/react-router";
import { History, Home, Settings, Trophy, Users } from "lucide-react";
import type { ReactNode } from "react";

const NAV = [
  { to: "/", label: "Início", icon: Home },
  { to: "/jogadores", label: "Jogadores", icon: Users },
  { to: "/historico", label: "Histórico", icon: History },
  { to: "/ranking", label: "Ranking", icon: Trophy },
  { to: "/configuracoes", label: "Ajustes", icon: Settings },
] as const;

export function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="felt-surface min-h-screen pb-24">
      <header className="wood-frame sticky top-0 z-20 px-4 py-3 shadow-(--shadow-table)">
        <h1 className="text-2xl leading-none text-primary">{title}</h1>
        {subtitle && <p className="mt-1 text-xs text-primary-foreground/80">{subtitle}</p>}
      </header>
      <main className="mx-auto w-full max-w-lg px-4 py-5">{children}</main>
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-card/95 backdrop-blur">
        <ul className="mx-auto flex max-w-lg items-stretch">
          {NAV.map(({ to, label, icon: Icon }) => (
            <li key={to} className="flex-1">
              <Link
                to={to}
                className="flex flex-col items-center gap-1 py-3 text-[0.65rem] text-muted-foreground transition-colors"
                activeOptions={{ exact: to === "/" }}
                activeProps={{ className: "text-primary" }}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}
