import { MainLayout } from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import { AlertTriangle, Clock, DollarSign, Users, FileText, TrendingDown, ArrowRight, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockReportData, mockBudgets, formatCurrency } from "@/data/mockData";

interface Gargalo {
  id: string;
  area: "atendimento" | "orcamentos" | "followup" | "conversao" | "operacao";
  title: string;
  description: string;
  impact: "critico" | "alto" | "medio" | "baixo";
  metric?: string;
  actionLabel?: string;
  actionRoute?: string;
}

// Derive gargalos from actual mock data
const calculateGargalos = (): Gargalo[] => {
  const gargalos: Gargalo[] = [];

  // Follow-ups atrasados (diasSemResposta >= 5)
  const followupsAtrasados = mockBudgets.filter(b => (b.diasSemResposta || 0) >= 5 && b.status === "enviado");
  if (followupsAtrasados.length > 0) {
    gargalos.push({
      id: "1",
      area: "followup",
      title: "Follow-ups atrasados",
      description: `${followupsAtrasados.length} orçamentos enviados há mais de 5 dias sem contato de retorno`,
      impact: "critico",
      metric: `${followupsAtrasados.length} pendentes`,
      actionLabel: "Ver Follow-ups",
      actionRoute: "/followups",
    });
  }

  // Orçamentos de alto valor parados
  const orcamentosParados = mockBudgets.filter(b => b.status === "enviado" && (b.diasSemResposta || 0) >= 3);
  const valorParado = orcamentosParados.reduce((sum, b) => sum + b.value, 0);
  if (valorParado > 0) {
    gargalos.push({
      id: "2",
      area: "orcamentos",
      title: "Orçamentos de alto valor parados",
      description: `${formatCurrency(valorParado)} em orçamentos sem movimentação há 3+ dias`,
      impact: "alto",
      metric: `${orcamentosParados.length} orçamentos`,
      actionLabel: "Ver Orçamentos",
      actionRoute: "/orcamentos",
    });
  }

  // Taxa de recusa
  const recusados = mockBudgets.filter(b => b.status === "recusado");
  if (recusados.length > 0) {
    gargalos.push({
      id: "3",
      area: "conversao",
      title: "Orçamentos recusados",
      description: `${recusados.length} orçamento(s) recusado(s) - analisar motivos de perda`,
      impact: "medio",
      metric: `${recusados.length} recusados`,
      actionLabel: "Analisar",
      actionRoute: "/relatorios",
    });
  }

  // Pós-venda pendente
  gargalos.push({
    id: "4",
    area: "followup",
    title: "Pós-venda pendente",
    description: "1 cliente aguardando follow-up de fidelização após viagem concluída",
    impact: "medio",
    metric: "1 pendente",
    actionLabel: "Ver Cliente",
    actionRoute: "/clientes/5",
  });

  // Leads sem orçamento (exemplo)
  gargalos.push({
    id: "5",
    area: "atendimento",
    title: "Lead sem orçamento",
    description: "João Santos está há 10 dias sem orçamento atualizado",
    impact: "baixo",
    metric: "10 dias",
    actionLabel: "Criar Orçamento",
    actionRoute: "/orcamentos",
  });

  return gargalos;
};

const mockGargalos = calculateGargalos();

const getImpactConfig = (impact: Gargalo["impact"]) => {
  switch (impact) {
    case "critico":
      return { color: "text-red-500 bg-red-500/10 border-red-500/30", badge: "destructive" as const, label: "Crítico" };
    case "alto":
      return { color: "text-orange-500 bg-orange-500/10 border-orange-500/30", badge: "default" as const, label: "Alto" };
    case "medio":
      return { color: "text-amber-500 bg-amber-500/10 border-amber-500/30", badge: "secondary" as const, label: "Médio" };
    case "baixo":
      return { color: "text-blue-500 bg-blue-500/10 border-blue-500/30", badge: "outline" as const, label: "Baixo" };
  }
};

const getAreaIcon = (area: Gargalo["area"]) => {
  switch (area) {
    case "atendimento":
      return Users;
    case "orcamentos":
      return FileText;
    case "followup":
      return Clock;
    case "conversao":
      return TrendingDown;
    case "operacao":
      return AlertTriangle;
  }
};

const getAreaLabel = (area: Gargalo["area"]) => {
  switch (area) {
    case "atendimento":
      return "Atendimento";
    case "orcamentos":
      return "Orçamentos";
    case "followup":
      return "Follow-up";
    case "conversao":
      return "Conversão";
    case "operacao":
      return "Operação";
  }
};

export default function Gargalos() {
  const navigate = useNavigate();
  
  const criticalCount = mockGargalos.filter(g => g.impact === "critico").length;
  const highCount = mockGargalos.filter(g => g.impact === "alto").length;

  const handleAction = (route?: string) => {
    if (route) {
      navigate(route);
    }
  };

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-accent" />
            Detector de Gargalos
          </h1>
          <p className="text-muted-foreground mt-1">
            Identifique perdas de tempo, dinheiro e conversão na sua operação
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-red-500/30 bg-red-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-red-500">{criticalCount}</p>
                  <p className="text-sm text-muted-foreground">Críticos</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-orange-500/30 bg-orange-500/5">
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-orange-500">{highCount}</p>
                  <p className="text-sm text-muted-foreground">Alto impacto</p>
                </div>
                <TrendingDown className="h-8 w-8 text-orange-500/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">{mockGargalos.length}</p>
                  <p className="text-sm text-muted-foreground">Total detectado</p>
                </div>
                <Clock className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-foreground">5</p>
                  <p className="text-sm text-muted-foreground">Áreas analisadas</p>
                </div>
                <DollarSign className="h-8 w-8 text-muted-foreground/50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gargalos List */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Gargalos Identificados</CardTitle>
            <CardDescription>
              A N.IA aponta problemas — você decide como resolver
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockGargalos.map((gargalo) => {
                const impactConfig = getImpactConfig(gargalo.impact);
                const AreaIcon = getAreaIcon(gargalo.area);
                
                return (
                  <div
                    key={gargalo.id}
                    className={`p-4 rounded-lg border ${impactConfig.color}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-2 rounded-lg bg-background/50">
                        <AreaIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h4 className="font-medium">{gargalo.title}</h4>
                          <div className="flex items-center gap-2 shrink-0">
                            {gargalo.metric && (
                              <span className="text-xs bg-background/50 px-2 py-1 rounded">
                                {gargalo.metric}
                              </span>
                            )}
                            <Badge variant={impactConfig.badge}>{impactConfig.label}</Badge>
                          </div>
                        </div>
                        <p className="text-sm opacity-80">{gargalo.description}</p>
                        <div className="flex items-center justify-between mt-3">
                          <p className="text-xs text-muted-foreground">
                            Área: {getAreaLabel(gargalo.area)}
                          </p>
                          {gargalo.actionLabel && gargalo.actionRoute && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleAction(gargalo.actionRoute)}
                            >
                              {gargalo.actionLabel}
                              <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* NIA Note */}
        <Card className="mt-6 border-accent/30 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <Info className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground">
                  A N.IA identifica gargalos com base nos dados disponíveis. 
                  Ela <span className="font-medium">aponta problemas</span>, 
                  mas <span className="font-medium">não corrige automaticamente</span>.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  A decisão de priorização e ação é sempre sua.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
