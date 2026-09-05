import { cn } from "@/lib/utils";

const SIZES = {
  sm: "h-9 w-9 text-[0.65rem]",
  md: "h-12 w-12 text-xs",
  lg: "h-16 w-16 text-sm",
  xl: "h-[4.5rem] w-[4.5rem] text-base",
} as const;

const INNER = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-8 w-8",
  xl: "h-9 w-9",
} as const;

export interface BallProps {
  number?: number;
  cue?: boolean;
  size?: keyof typeof SIZES;
  selected?: boolean;
  dimmed?: boolean;
  potting?: boolean;
  onClick?: () => void;
  disabled?: boolean;
  label?: string;
}

export function Ball({
  number,
  cue = false,
  size = "lg",
  selected = false,
  dimmed = false,
  potting = false,
  onClick,
  disabled = false,
  label,
}: BallProps) {
  const striped = !cue && !!number && number > 8;
  const color = cue ? "var(--ball-cue)" : `var(--ball-${number})`;

  const backgroundImage = cue
    ? `radial-gradient(circle at 32% 26%, oklch(1 0 0 / 0.95), transparent 50%), radial-gradient(circle at 55% 65%, var(--ball-cue), color-mix(in oklab, var(--ball-cue) 74%, black))`
    : striped
      ? `radial-gradient(circle at 32% 24%, oklch(1 0 0 / 0.8), transparent 44%), linear-gradient(180deg, var(--ball-cue) 0 20%, ${color} 20% 80%, var(--ball-cue) 80% 100%)`
      : `radial-gradient(circle at 32% 24%, oklch(1 0 0 / 0.75), transparent 46%), radial-gradient(circle at 55% 68%, ${color}, color-mix(in oklab, ${color} 68%, black))`;

  const Comp = onClick ? "button" : "div";

  return (
    <Comp
      type={onClick ? "button" : undefined}
      onClick={onClick}
      disabled={onClick ? disabled : undefined}
      aria-label={label ?? (cue ? "Bola branca (tacadeira)" : `Bola ${number}`)}
      aria-pressed={onClick && !cue ? selected : undefined}
      className={cn(
        "relative grid shrink-0 place-items-center rounded-full shadow-(--shadow-ball) transition-transform duration-150 select-none",
        SIZES[size],
        onClick && !disabled && "active:scale-90",
        selected && "ring-4 ring-primary ring-offset-2 ring-offset-background scale-105",
        dimmed && "opacity-35 saturate-50",
        potting && "animate-(--animate-pocket)",
      )}
      style={{ backgroundImage }}
    >
      {!cue && (
        <span
          className={cn(
            "grid place-items-center rounded-full font-bold shadow-inner",
            INNER[size],
          )}
          style={{ backgroundColor: "var(--ball-cue)", color: "var(--ball-8)" }}
        >
          {number}
        </span>
      )}
    </Comp>
  );
}
