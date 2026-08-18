import { useNavigate } from "react-router-dom";
import { ArrowLeft, TrendingUp, TrendingDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileLayout } from "@/components/mobile";
import { useIsMobile } from "@/hooks/use-mobile";
import { MainLayout } from "@/components/layout/MainLayout";
import { useReportMetrics } from "@/hooks/useReportMetrics";
import { formatCurrency } from "@/hooks/useClients";

export default function RelatoriosDetalhado() {
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { data: m, isLoading } = useReportMetrics();

  if (isLoading || !m) {
    const Wrapper = isMobile ? MobileLayout : MainLayout;
    return (
      <Wrapper>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </Wrapper>
    );
  }

  const metrics = [
    { label: "Faturamento do Mês", value: formatCurrency(m.revenue) },
    { label: "Lucro Líquido", value: formatCurrency(m.profit) },
    { label: "Margem de Lucro", value: `${m.marginPercent}%` },
    { label: "Taxa de Conversão", value: `${m.conversionRate}%`, sub: `${m.budgetsApproved} de ${m.budgetsSent}` },
    { label: "Ticket Médio", value: formatCurrency(m.ticketMedio) },
    { label: "Lucro Total (Pipeline)", value: formatCurrency(m.profit) },
    { label: "Clientes Ativos", value: String(m.activeClients) },
    { label: "Orçamentos Totais", value: String(m.totalBudgets) },
    { label: "Volume em Pipeline", value: formatCurrency(m.pipelineValue) },
  ];

  const content = (
    <div className={isMobile ? "px-3 py-2 space-y-2" : "p-8"}>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate(-1)} className="h-7 px-2">
          <ArrowLeft className="h-3.5 w-3.5 mr-1" />Voltar
        </Button>
        <h1 className={isMobile ? "text-sm font-semibold text-foreground" : "text-xl font-semibold text-foreground"}>
          Análise Detalhada
        </h1>
      </div>

      <div className={isMobile ? "grid grid-cols-2 gap-1" : "grid grid-cols-3 gap-4"}>
        {metrics.map((met, i) => (
          <div key={i} className={isMobile
            ? "rounded border border-border bg-card px-2 py-[6px]"
            : "rounded-lg border border-border bg-card p-4"
          }>
            <span className={isMobile ? "text-[8px] text-muted-foreground" : "text-xs text-muted-foreground"}>{met.label}</span>
            <p className={isMobile ? "text-sm font-bold text-foreground leading-tight" : "text-2xl font-bold text-foreground mt-1"}>{met.value}</p>
            {met.sub && <span className={isMobile ? "text-[8px] text-muted-foreground" : "text-xs text-muted-foreground"}>{met.sub}</span>}
          </div>
        ))}
      </div>
    </div>
  );

  if (isMobile) {
    return <MobileLayout>{content}</MobileLayout>;
  }
  return <MainLayout>{content}</MainLayout>;
}
