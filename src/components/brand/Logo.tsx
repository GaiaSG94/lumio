import Link from "next/link";
import { cn } from "@/lib/cn";

export function Logo({ href = "/", compact = false, inverse = false }: { href?: string; compact?: boolean; inverse?: boolean }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-offset-4" aria-label="Lumio, home">
      <span className={cn("grid size-9 place-items-center rounded-[10px] bg-violet-600 shadow-sm", inverse && "bg-white/15")}>
        <span className={cn("ml-0.5 block size-0 border-y-[7px] border-l-[11px] border-y-transparent", inverse ? "border-l-white" : "border-l-white")} />
      </span>
      {!compact && (
        <span className={cn("font-title text-xl font-bold tracking-tight", inverse ? "text-white" : "text-ink")}>
          Lumio
        </span>
      )}
    </Link>
  );
}
