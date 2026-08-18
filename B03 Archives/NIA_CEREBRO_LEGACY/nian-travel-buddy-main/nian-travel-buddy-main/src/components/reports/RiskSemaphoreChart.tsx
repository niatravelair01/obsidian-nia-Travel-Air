import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, AlertTriangle, CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NiaAvatar } from "@/components/nia/NiaAvatar";

interface RiskLevel {
  level: "low" | "medium" | "high";
  count: number;
  label: string;
  description: string;
}

interface RiskSemaphoreChartProps {
  lowRiskCount: number;
  mediumRiskCount: number;
  highRiskCount: number;
}

export const RiskSemaphoreChart = ({
  lowRiskCount,
  mediumRiskCount,
  highRiskCount,
}: RiskSemaphoreChartProps) => {
  const navigate = useNavigate();
  
  const riskLevels: RiskLevel[] = [
    { 
      level: "high", 
      count: highRiskCount, 
      label: "Alto Risco",
      description: "Viagens < 7 dias, chargeback"
    },
    { 
      level: "medium", 
      count: mediumRiskCount, 
      label: "Médio Risco",
      description: "Aguardando documentação"
    },
    { 
      level: "low", 
      count: lowRiskCount, 
      label: "Baixo Risco",
      description: "Operação normal"
    },
  ];
  
  const getIcon = (level: RiskLevel["level"]) => {
    switch (level) {
      case "high":
        return <AlertTriangle className="h-5 w-5" />;
      case "medium":
        return <AlertCircle className="h-5 w-5" />;
      case "low":
        return <CheckCircle2 className="h-5 w-5" />;
    }
  };
  
  const getColors = (level: RiskLevel["level"]) => {
    switch (level) {
      case "high":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-400",
          indicator: "bg-red-500",
        };
      case "medium":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-400",
          indicator: "bg-amber-500",
        };
      case "low":
        return {
          bg: "bg-green-500/10",
          border: "border-green-500/30",
          text: "text-green-400",
          indicator: "bg-green-500",
        };
    }
  };
  
  const handleClick = () => {
    navigate("/blindagem?risk=alto");
  };
  
  const hasHighRisk = highRiskCount > 0;
  
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-accent" />
          <CardTitle className="text-base">Risco Financeiro</CardTitle>
        </div>
        <CardDescription className="text-xs">Gravidade dos riscos ativos</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Semaphore Visual */}
        <div className="space-y-3">
          {riskLevels.map((risk) => {
            const colors = getColors(risk.level);
            return (
              <div 
                key={risk.level}
                className={`flex items-center gap-3 p-3 rounded-lg border ${colors.bg} ${colors.border}`}
              >
                <div className={`w-3 h-3 rounded-full ${colors.indicator} animate-pulse`} />
                <div className={colors.text}>
                  {getIcon(risk.level)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-medium ${colors.text}`}>
                      {risk.label}
                    </span>
                    <span className={`text-lg font-bold ${colors.text}`}>
                      {risk.count}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{risk.description}</p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* NIA Interpretation */}
        <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg">
          <NiaAvatar size="xs" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {hasHighRisk
              ? "Viagens muito próximas concentram maior risco de cancelamento e chargeback."
              : mediumRiskCount > 0
              ? "Riscos médios identificados — monitore documentações pendentes."
              : "Operação com baixo risco financeiro no momento."}
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-accent hover:text-accent/80"
          onClick={handleClick}
        >
          Ver riscos ativos
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};
