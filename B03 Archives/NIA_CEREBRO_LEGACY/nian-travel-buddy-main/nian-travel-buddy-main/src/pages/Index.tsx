import { MainLayout } from "@/components/layout/MainLayout";
import { MobileLayout, MobileDashboard } from "@/components/mobile";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { PriorityCard } from "@/components/dashboard/PriorityCard";
import { RecentClientsCard } from "@/components/dashboard/RecentClientsCard";
import { NiaInsightCard } from "@/components/dashboard/NiaInsightCard";
import { FinancialSummaryCard } from "@/components/dashboard/FinancialSummaryCard";
import { TripsModal } from "@/components/dashboard/TripsModal";
import { Users, FileText, TrendingUp, Calendar, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { useDashboardMetrics, type DateMode } from "@/hooks/useDashboardMetrics";
import { mockPriorities, mockValuableClients, formatCurrency, Priority } from "@/data/mockData";

// Mock trips data for modal
const mockTrips = [{
  id: "1",
  cliente: "Fernanda Costa",
  destino: "Gramado, RS",
  dataInicio: "2025-01-20",
  dataFim: "2025-01-25",
  status: "em_andamento" as const
}, {
  id: "2",
  cliente: "Ana Carolina",
  destino: "Paris, França",
  dataInicio: "2025-03-15",
  dataFim: "2025-03-25",
  status: "confirmada" as const
}, {
  id: "3",
  cliente: "Carlos Lima",
  destino: "Maldivas",
  dataInicio: "2025-04-10",
  dataFim: "2025-04-20",
  status: "confirmada" as const
}];
function getTimeBasedGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 13) {
    return "Bom dia";
  } else if (hour >= 13 && hour < 18) {
    return "Boa tarde";
  } else {
    return "Boa noite";
  }
}
function getGenderTitle(gender: string | null): string {
  if (gender === "feminino") {
    return "Sócia";
  }
  return "Sócio";
}
export default function Index() {
  const isMobile = useIsMobile();
  const {
    startTour
  } = useOnboarding();
  const [greeting, setGreeting] = useState(getTimeBasedGreeting());
  const [genderTitle, setGenderTitle] = useState("Sócio");
  const [showOnboardingBanner, setShowOnboardingBanner] = useState(false);
  const [showTripsModal, setShowTripsModal] = useState(false);
  const [dateMode, setDateMode] = useState<DateMode>("venda");

  // Sort priorities by financial impact and risk
  const sortedPriorities = useMemo(() => {
    return [...mockPriorities].sort((a, b) => {
      const typeOrder: Record<Priority["type"], number> = {
        urgent: 0,
        warning: 1,
        info: 2
      };
      const typeCompare = typeOrder[a.type] - typeOrder[b.type];
      if (typeCompare !== 0) return typeCompare;
      const valueA = a.value || 0;
      const valueB = b.value || 0;
      return valueB - valueA;
    });
  }, []);

  // Real financial data from orcamentos
  const { data: metrics, isLoading: metricsLoading } = useDashboardMetrics(dateMode);

  const financialData = {
    revenue: metrics?.revenue ?? 0,
    profit: metrics?.profit ?? 0,
  };

  const totalOpenBudgets = metrics?.openBudgetsValue ?? 0;
  const openBudgetsCount = metrics?.openBudgetsCount ?? 0;
  const conversionRate = metrics?.conversionRate ?? 0;

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const {
          data
        } = await supabase.from("nia_settings").select("agency_name, user_gender").maybeSingle();
        if (!data || !data.agency_name) {
          setShowOnboardingBanner(true);
        }
        if (data?.user_gender) {
          setGenderTitle(getGenderTitle(data.user_gender));
        }
      } catch (error) {
        console.error("Error checking onboarding:", error);
      }
    };
    checkOnboarding();

    const interval = setInterval(() => {
      setGreeting(getTimeBasedGreeting());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const dismissOnboardingBanner = () => {
    setShowOnboardingBanner(false);
    localStorage.setItem("nia_onboarding_dismissed", "true");
  };

  useEffect(() => {
    const dismissed = localStorage.getItem("nia_onboarding_dismissed");
    if (dismissed === "true") {
      setShowOnboardingBanner(false);
    }
  }, []);

  // Mobile: render simplified dashboard (AFTER all hooks)
  if (isMobile) {
    return (
      <MobileLayout>
        <MobileDashboard />
      </MobileLayout>
    );
  }
  return <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">
            {greeting}, {genderTitle}
          </h1>
          <p className="text-muted-foreground mt-1">
            Aqui está á saúde da sua agência hoje
          </p>
        </div>

        {/* Onboarding Banner (optional, dismissible) */}
        {showOnboardingBanner && <div className="mb-6 p-4 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-between gap-4">
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">
                👋 Primeira vez aqui? Faça um tour rápido para conhecer a N.IA.
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Leva menos de 2 minutos — você pode pular a qualquer momento.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" variant="default" onClick={() => {
            dismissOnboardingBanner();
            startTour();
          }}>
                Iniciar Tour
              </Button>
              <Button size="icon" variant="ghost" className="h-8 w-8" onClick={dismissOnboardingBanner}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>}

        {/* NIA Insight - Top Banner (Resumo Estratégico) */}
        <NiaInsightCard action="Ver análise completa" className="mb-8" />

        {/* Date mode toggle */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-xs text-muted-foreground">Visualizar por:</span>
          <div className="flex rounded-lg border border-border overflow-hidden">
            <button
              onClick={() => setDateMode("venda")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${dateMode === "venda" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              Data de venda
            </button>
            <button
              onClick={() => setDateMode("viagem")}
              className={`px-3 py-1 text-xs font-medium transition-colors ${dateMode === "viagem" ? "bg-accent text-accent-foreground" : "bg-secondary text-muted-foreground hover:text-foreground"}`}
            >
              Data de viagem
            </button>
          </div>
        </div>

        {/* Financial Summary + Open Budgets Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
          <FinancialSummaryCard revenue={financialData.revenue} profit={financialData.profit} className="lg:col-span-2" />
          
          {/* Valor Total em Orçamentos Abertos */}
          <div className="surface-card rounded-xl p-5 flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4 text-accent" />
                Orçamentos Abertos
              </h3>
              <p className="text-3xl font-semibold text-primary">
                {formatCurrency(totalOpenBudgets)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {openBudgetsCount} orçamentos em negociação
              </p>
            </div>
            <Link to="/orcamentos?status=aberto" className="text-xs text-accent hover:underline mt-4">
              Ver orçamentos abertos →
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard title="Clientes Ativos" value="-" change="" changeType="neutral" icon={Users} href="/clientes?status=ativo" />
          <StatsCard title="Orçamentos Abertos" value={openBudgetsCount} change={formatCurrency(totalOpenBudgets)} changeType="neutral" icon={FileText} href="/orcamentos?status=aberto" />
          <StatsCard title="Taxa de Conversão" value={`${conversionRate}%`} change="este mês" changeType="positive" icon={TrendingUp} href="/relatorios?tipo=conversao" />
          <StatsCard title="Viagens este Mês" value="-" change="" changeType="neutral" icon={Calendar} onClick={() => setShowTripsModal(true)} />
        </div>

        {/* Main Content Grid - Priorities + Valuable Clients */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-tour="prioridades">
          <PriorityCard priorities={sortedPriorities} className="lg:col-span-1" />
          <RecentClientsCard clients={mockValuableClients} className="lg:col-span-2" />
        </div>

        {/* Trips Modal */}
        <TripsModal open={showTripsModal} onOpenChange={setShowTripsModal} trips={mockTrips} />
      </div>
    </MainLayout>;
}