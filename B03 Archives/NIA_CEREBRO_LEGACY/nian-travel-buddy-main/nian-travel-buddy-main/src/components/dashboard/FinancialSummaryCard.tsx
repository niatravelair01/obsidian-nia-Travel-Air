import { TrendingUp, TrendingDown, DollarSign, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// FINANCIAL SUMMARY CARD — RESUMO FINANCEIRO DO MÊS
// 
// Bloco obrigatório do dashboard (Prompt-Mãe):
//   - Total faturado
//   - Lucro do mês
// ═══════════════════════════════════════════════════════════════════════════════

interface FinancialSummaryCardProps {
  revenue: number;
  profit: number;
  revenueChange?: number; // percentage change from last month
  profitChange?: number;
  className?: string;
}
function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}
export function FinancialSummaryCard({
  revenue,
  profit,
  revenueChange,
  profitChange,
  className
}: FinancialSummaryCardProps) {
  const profitMargin = revenue > 0 ? (profit / revenue * 100).toFixed(1) : 0;
  return <div className={cn("surface-card rounded-xl p-5 bg-primary opacity-100", className)}>
      <h3 className="text-sm font-medium text-foreground mb-4 flex items-center gap-2">
        <DollarSign className="h-4 w-4 text-accent" />
        Resumo Financeiro do Mês
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {/* Revenue */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Faturamento</p>
          <p className="text-xl font-semibold text-foreground">
            {formatCurrency(revenue)}
          </p>
          {revenueChange !== undefined && <div className={cn("flex items-center gap-1 text-xs", revenueChange >= 0 ? "text-emerald-400" : "text-red-400")}>
              {revenueChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{revenueChange >= 0 ? "+" : ""}{revenueChange}% vs mês anterior</span>
            </div>}
        </div>

        {/* Profit */}
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Lucro</p>
          <p className="text-xl font-semibold text-emerald-400">
            {formatCurrency(profit)}
          </p>
          {profitChange !== undefined && <div className={cn("flex items-center gap-1 text-xs", profitChange >= 0 ? "text-emerald-400" : "text-red-400")}>
              {profitChange >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              <span>{profitChange >= 0 ? "+" : ""}{profitChange}% vs mês anterior</span>
            </div>}
        </div>
      </div>

      {/* Profit Margin */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground flex items-center gap-1">
            <Wallet className="h-4 w-4" />
            Margem de lucro
          </span>
          <span className="font-medium text-foreground">{profitMargin}%</span>
        </div>
      </div>
    </div>;
}