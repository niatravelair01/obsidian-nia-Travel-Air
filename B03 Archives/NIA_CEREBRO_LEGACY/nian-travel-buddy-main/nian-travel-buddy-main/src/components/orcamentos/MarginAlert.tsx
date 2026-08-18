import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarginAlertProps {
  marginPercent: number;
  className?: string;
}

export function MarginAlert({ marginPercent, className }: MarginAlertProps) {
  if (marginPercent >= 12 || marginPercent === 0) return null;

  const isCritical = marginPercent < 10;

  return (
    <div
      className={cn(
        "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium",
        isCritical
          ? "bg-red-500/10 text-red-500 border border-red-500/20"
          : "bg-amber-500/10 text-amber-500 border border-amber-500/20",
        className
      )}
    >
      <AlertTriangle className="h-3 w-3 flex-shrink-0" />
      <span>
        {isCritical
          ? "Margem abaixo do mínimo estrutural de 10%."
          : `Margem de ${marginPercent}% — próxima do limite operacional.`}
      </span>
    </div>
  );
}
