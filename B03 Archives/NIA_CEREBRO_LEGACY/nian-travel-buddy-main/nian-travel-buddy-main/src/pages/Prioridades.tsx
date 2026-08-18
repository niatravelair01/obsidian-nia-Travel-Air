import { MainLayout } from "@/components/layout/MainLayout";
import { useNavigate } from "react-router-dom";
import {
  Target, AlertCircle, AlertTriangle, ArrowRight, MessageCircle,
  TrendingUp, Shield, ChevronRight, Flame, Snowflake, Thermometer,
  Scale,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NiaAvatar } from "@/components/nia/NiaAvatar";
import { mockLeadPriorityData, formatCurrency } from "@/data/mockData";
import {
  prioritizeLeads,
  getPriorityLabel,
  getPriorityBgColor,
  getTemperatureLabel,
  type PrioritizedLead,
  type PriorityLevel,
} from "@/utils/leadPrioritization";
import {
  getMarginLabel,
  getMarginBgColor,
} from "@/utils/marginEngine";
import { useMemo } from "react";

// ────────────────────────────────────────────────────────────────────────────────
// HELPERS
// ────────────────────────────────────────────────────────────────────────────────

const priorityIcon = (level: PriorityLevel) => {
  switch (level) {
    case "maxima": return <Flame className="h-5 w-5 text-red-500" />;
    case "alta": return <Scale className="h-5 w-5 text-amber-500" />;
    case "media": return <Thermometer className="h-5 w-5 text-blue-500" />;
    case "baixa": return <Snowflake className="h-5 w-5 text-muted-foreground" />;
  }
};

const priorityBorder = (level: PriorityLevel) => {
  switch (level) {
    case "maxima": return "border-l-red-500";
    case "alta": return "border-l-amber-500";
    case "media": return "border-l-blue-500";
    case "baixa": return "border-l-muted-foreground";
  }
};

// ────────────────────────────────────────────────────────────────────────────────
// PAGE
// ────────────────────────────────────────────────────────────────────────────────

export default function Prioridades() {
  const navigate = useNavigate();

  const prioritized = useMemo(() => prioritizeLeads(mockLeadPriorityData), []);

  // Stats
  const totalValue = prioritized.reduce((s, l) => s + l.budgetValue, 0);
  const criticalAlerts = prioritized.flatMap((l) => l.alerts.filter((a) => a.severity === "critical"));
  const avgMargin =
    prioritized.reduce((s, l) => s + l.estimatedMarginPercent, 0) / (prioritized.length || 1);

  const groupedByLevel: Record<PriorityLevel, PrioritizedLead[]> = {
    maxima: prioritized.filter((l) => l.priorityLevel === "maxima"),
    alta: prioritized.filter((l) => l.priorityLevel === "alta"),
    media: prioritized.filter((l) => l.priorityLevel === "media"),
    baixa: prioritized.filter((l) => l.priorityLevel === "baixa"),
  };

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-accent" />
            Prioridades do Dia
          </h1>
          <p className="text-muted-foreground mt-1">
            Leads ordenados por margem, risco, urgência e ticket — decisão final sempre sua
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-foreground">{prioritized.length}</p>
              <p className="text-sm text-muted-foreground">Leads priorizados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-2xl font-bold text-accent">{formatCurrency(totalValue)}</p>
              <p className="text-sm text-muted-foreground">Potencial total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className={`text-2xl font-bold ${avgMargin >= 15 ? "text-emerald-500" : avgMargin >= 12 ? "text-yellow-500" : "text-red-500"}`}>
                {avgMargin.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground">Margem média</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className={`text-2xl font-bold ${criticalAlerts.length > 0 ? "text-red-500" : "text-emerald-500"}`}>
                {criticalAlerts.length}
              </p>
              <p className="text-sm text-muted-foreground">Alertas críticos</p>
            </CardContent>
          </Card>
        </div>

        {/* NIA Strategic Summary */}
        <div className="flex items-start gap-3 p-4 rounded-lg bg-secondary/50 border border-border/50 mb-6">
          <NiaAvatar size="sm" />
          <div>
            <p className="text-sm font-medium text-foreground mb-1">Análise estratégica</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {groupedByLevel.maxima.length > 0
                ? `${groupedByLevel.maxima.length} lead(s) com condições ideais para fechar — margem saudável e risco controlado. `
                : ""}
              {criticalAlerts.length > 0
                ? `${criticalAlerts.length} alerta(s) crítico(s) requerem atenção antes de prosseguir. `
                : "Nenhum alerta crítico no momento. "}
              Priorize por ordem de score para maximizar lucro sustentável.
            </p>
          </div>
        </div>

        {/* Priority Groups */}
        {(["maxima", "alta", "media", "baixa"] as PriorityLevel[]).map((level) => {
          const leads = groupedByLevel[level];
          if (leads.length === 0) return null;

          return (
            <div key={level} className="mb-6">
              <h2 className="text-lg font-medium text-foreground mb-3 flex items-center gap-2">
                {priorityIcon(level)}
                {getPriorityLabel(level)}
                <Badge variant="secondary" className="ml-1">{leads.length}</Badge>
              </h2>

              <div className="space-y-3">
                {leads.map((lead, idx) => (
                  <LeadCard
                    key={lead.clientId}
                    lead={lead}
                    rank={idx + 1}
                    level={level}
                    onNavigate={() => navigate(`/clientes/${lead.clientId}`)}
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </MainLayout>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// LEAD CARD COMPONENT
// ────────────────────────────────────────────────────────────────────────────────

function LeadCard({
  lead,
  rank,
  level,
  onNavigate,
}: {
  lead: PrioritizedLead;
  rank: number;
  level: PriorityLevel;
  onNavigate: () => void;
}) {
  const navigate = useNavigate();

  return (
    <div
      onClick={onNavigate}
      className={`p-4 rounded-lg border-l-4 cursor-pointer transition-all hover:shadow-md bg-card border border-border/50 ${priorityBorder(level)}`}
    >
      <div className="flex items-start justify-between gap-4">
        {/* Left: Info */}
        <div className="flex-1 min-w-0">
          {/* Top row */}
          <div className="flex items-center gap-3 mb-2 flex-wrap">
            {/* Score badge */}
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${getPriorityBgColor(level)}`}>
              {lead.priorityScore}
            </div>

            <h3 className="font-medium text-foreground">{lead.clientName}</h3>

            <Badge variant="outline" className="text-xs">
              {lead.destination}
            </Badge>

            <Badge variant="outline" className="text-xs">
              {getTemperatureLabel(lead.temperature)}
            </Badge>
          </div>

          {/* Financial row */}
          <div className="flex items-center gap-4 mb-2 ml-11 flex-wrap">
            <span className="text-sm font-semibold text-accent">
              {formatCurrency(lead.budgetValue)}
            </span>
            <span className={`text-xs px-2 py-0.5 rounded-full border ${getMarginBgColor(lead.marginClassification)}`}>
              {getMarginLabel(lead.marginClassification)} — {lead.estimatedMarginPercent.toFixed(1)}%
            </span>
            {lead.riskLevel !== "baixo" && (
              <span className={`text-xs flex items-center gap-1 ${lead.riskLevel === "alto" ? "text-red-500" : "text-amber-500"}`}>
                <Shield className="h-3 w-3" />
                Risco {lead.riskLevel}
              </span>
            )}
          </div>

          {/* Reasoning */}
          <p className="text-xs text-muted-foreground ml-11 mb-2">
            {lead.reasoning}
          </p>

          {/* Alerts */}
          {lead.alerts.length > 0 && (
            <div className="ml-11 space-y-1 mb-2">
              {lead.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`text-xs flex items-start gap-1.5 ${
                    alert.severity === "critical" ? "text-red-500" : "text-amber-500"
                  }`}
                >
                  {alert.severity === "critical" ? (
                    <AlertCircle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  ) : (
                    <AlertTriangle className="h-3 w-3 mt-0.5 flex-shrink-0" />
                  )}
                  <span>{alert.message} — <em>{alert.suggestion}</em></span>
                </div>
              ))}
            </div>
          )}

          {/* Recommended action */}
          <div className="ml-11 flex items-center gap-2 text-xs">
            <ArrowRight className="h-3 w-3 text-accent" />
            <span className="font-medium text-accent">{lead.recommendedAction}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex flex-col items-end gap-2 flex-shrink-0">
          {lead.temperature !== "frio" && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-green-600 border-green-600/30 hover:bg-green-600/10"
              onClick={(e) => {
                e.stopPropagation();
              }}
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
          )}
          <Button
            variant="default"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/clientes/${lead.clientId}`);
            }}
          >
            Ver ficha
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
