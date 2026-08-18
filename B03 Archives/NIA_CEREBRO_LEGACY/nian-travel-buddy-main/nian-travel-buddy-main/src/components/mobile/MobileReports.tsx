import { TrendingUp, TrendingDown, ArrowRight, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useReportMetrics } from "@/hooks/useReportMetrics";
import { formatCurrency } from "@/hooks/useClients";

export function MobileReports() {
  const { data: m, isLoading } = useReportMetrics();

  if (isLoading || !m) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
      </div>
    );
  }

  const metrics = [
    {
      label: "Faturamento",
      value: formatCurrency(m.revenue),
      large: true,
    },
    {
      label: "Margem",
      value: `${m.marginPercent}%`,
      sub: formatCurrency(m.profit),
    },
    {
      label: "Conversão",
      value: `${m.conversionRate}%`,
      sub: `${m.budgetsApproved}/${m.budgetsSent}`,
    },
    {
      label: "Ticket Médio",
      value: formatCurrency(m.ticketMedio),
    },
    {
      label: "Lucro Total",
      value: formatCurrency(m.profit),
    },
  ];

  return (
    <div className="px-2.5 py-1.5 space-y-1">
      <div className="flex items-baseline justify-between">
        <h1 className="text-sm font-semibold text-foreground">Relatórios</h1>
        <span className="text-[10px] text-muted-foreground">Resumo do mês</span>
      </div>

      {/* Faturamento destaque */}
      <div className="rounded border border-border bg-card px-2.5 py-[6px]">
        <span className="text-[9px] text-muted-foreground">{metrics[0].label}</span>
        <div className="flex items-end justify-between">
          <p className="text-xl font-bold text-foreground leading-tight">{metrics[0].value}</p>
        </div>
      </div>

      {/* Grid 2x2 para demais métricas */}
      <div className="grid grid-cols-2 gap-px">
        {metrics.slice(1).map((met, i) => (
          <div key={i} className="rounded border border-border bg-card px-2 py-[5px]">
            <span className="text-[8px] text-muted-foreground">{met.label}</span>
            <p className="text-sm font-bold text-foreground leading-tight">{met.value}</p>
            {met.sub && <span className="text-[8px] text-muted-foreground">{met.sub}</span>}
          </div>
        ))}
      </div>

      <Button className="w-full h-7 text-[10px]" variant="outline" asChild>
        <Link to="/relatorios/detalhado">
          Ver análise detalhada <ArrowRight className="h-2.5 w-2.5 ml-0.5" />
        </Link>
      </Button>
    </div>
  );
}
