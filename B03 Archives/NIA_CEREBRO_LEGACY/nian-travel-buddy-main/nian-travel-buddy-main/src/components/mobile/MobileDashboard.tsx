import { useState, useEffect } from "react";
import { ArrowRight, AlertTriangle, TrendingUp, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { NiaAvatar } from "@/components/nia/NiaAvatar";
import { supabase } from "@/integrations/supabase/client";
import { useDashboardMetrics, type DateMode } from "@/hooks/useDashboardMetrics";
import { mockPriorities, formatCurrency } from "@/data/mockData";

function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 13) return "Bom dia";
  if (hour >= 13 && hour < 18) return "Boa tarde";
  return "Boa noite";
}

export function MobileDashboard() {
  const [greeting] = useState(getTimeBasedGreeting());
  const [genderTitle, setGenderTitle] = useState("Sócio");
  const [dateMode, setDateMode] = useState<DateMode>("venda");
  const { data: metrics } = useDashboardMetrics(dateMode);

  useEffect(() => {
    const loadGender = async () => {
      try {
        const { data } = await supabase.from("nia_settings").select("user_gender").maybeSingle();
        if (data?.user_gender === "feminino") setGenderTitle("Sócia");
      } catch (error) { console.error("Error loading settings:", error); }
    };
    loadGender();
  }, []);

  const sortedPriorities = [...mockPriorities].sort((a, b) => {
    const order: Record<string, number> = { urgent: 0, warning: 1, info: 2 };
    return (order[a.type] || 2) - (order[b.type] || 2);
  });
  const primaryAction = sortedPriorities[0];

  return (
    <div className="px-2.5 py-1.5 space-y-1.5">
      <div>
        <h1 className="text-sm font-semibold text-foreground">{greeting}, {genderTitle}</h1>
        <p className="text-[10px] text-muted-foreground">Sua agência hoje</p>
      </div>

      {/* Date mode toggle */}
      <div className="flex items-center gap-1.5">
        <span className="text-[8px] text-muted-foreground">Por:</span>
        <div className="flex rounded border border-border overflow-hidden">
          <button onClick={() => setDateMode("venda")} className={`px-2 py-0.5 text-[8px] font-medium ${dateMode === "venda" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Venda</button>
          <button onClick={() => setDateMode("viagem")} className={`px-2 py-0.5 text-[8px] font-medium ${dateMode === "viagem" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground"}`}>Viagem</button>
        </div>
      </div>

      {/* Faturamento */}
      <div className="rounded border border-border bg-card px-2.5 py-[6px]">
        <div className="flex items-center gap-1 mb-0.5">
          <TrendingUp className="h-3 w-3 text-status-success" />
          <span className="text-[9px] font-medium text-muted-foreground">Faturamento</span>
        </div>
        <p className="text-lg font-bold text-foreground leading-tight">{formatCurrency(metrics?.revenue ?? 0)}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <div>
            <p className="text-[8px] text-muted-foreground">Lucro</p>
            <p className="text-[10px] font-medium text-status-success">{formatCurrency(metrics?.profit ?? 0)}</p>
          </div>
          <div>
            <p className="text-[8px] text-muted-foreground">Margem</p>
            <p className="text-[10px] font-medium text-foreground">{metrics?.marginPercent ?? 0}%</p>
          </div>
        </div>
      </div>

      {/* Em Negociação */}
      <div className="rounded border border-border bg-card px-2.5 py-[6px]">
        <div className="flex items-center gap-1 mb-0.5">
          <FileText className="h-3 w-3 text-accent" />
          <span className="text-[9px] font-medium text-muted-foreground">Em Negociação</span>
        </div>
        <p className="text-lg font-bold text-primary leading-tight">{formatCurrency(metrics?.openBudgetsValue ?? 0)}</p>
        <p className="text-[8px] text-muted-foreground mt-0.5">{metrics?.openBudgetsCount ?? 0} orçamentos</p>
        <Link to="/orcamentos?status=aberto" className="text-[9px] text-accent hover:underline mt-0.5 inline-block">Ver orçamentos →</Link>
      </div>

      {/* Prioridades */}
      <div className="rounded border border-border bg-card px-2.5 py-[6px]">
        <div className="flex items-center gap-1 mb-1">
          <AlertTriangle className="h-3 w-3 text-destructive" />
          <span className="text-[9px] font-medium text-muted-foreground">Prioridades</span>
        </div>
        <div className="space-y-px">
          {sortedPriorities.slice(0, 3).map((priority) => (
            <div key={priority.id} className="flex items-center justify-between py-[3px] border-b border-border last:border-0">
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-medium text-foreground truncate">{priority.title}</p>
                <p className="text-[8px] text-muted-foreground truncate">{priority.description}</p>
              </div>
              {priority.value && (
                <span className="text-[9px] font-medium text-accent ml-1.5 flex-shrink-0">{formatCurrency(priority.value)}</span>
              )}
            </div>
          ))}
        </div>
        <Link to="/prioridades" className="text-[9px] text-accent hover:underline mt-0.5 inline-block">Ver todas →</Link>
      </div>

      {/* NIA Insight */}
      {primaryAction && (
        <div className="rounded border border-accent/20 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent px-2.5 py-[6px]">
          <div className="flex items-start gap-1.5">
            <NiaAvatar size="sm" />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-medium text-accent mb-0.5">Insight da N.IA</p>
              <p className="text-[10px] font-medium text-foreground line-clamp-2">{primaryAction.title}</p>
              <p className="text-[8px] text-muted-foreground mt-0.5">{primaryAction.description}</p>
              <Button size="sm" className="mt-1 h-6 text-[9px] px-2" asChild>
                <Link to="/relatorios?tab=insights">
                  Ver análise <ArrowRight className="h-2.5 w-2.5 ml-0.5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
