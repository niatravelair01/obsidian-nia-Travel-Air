import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Zap, Phone, FileCheck, Clock, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NiaAvatar } from "@/components/nia/NiaAvatar";

interface PriorityAction {
  id: string;
  title: string;
  description: string;
  impact: "high" | "medium" | "low";
  route: string;
  icon: "phone" | "file" | "clock" | "user";
  financialImpact?: number;
}

interface PriorityActionsListProps {
  actions?: PriorityAction[];
}

const defaultActions: PriorityAction[] = [
  {
    id: "1",
    title: "Retomar follow-up com Maria Silva",
    description: "Aguardando retorno há 6 dias — R$ 12.500 em risco",
    impact: "high",
    route: "/followups?client=maria-silva",
    icon: "phone",
    financialImpact: 12500,
  },
  {
    id: "2",
    title: "Confirmar documentação de viagem próxima",
    description: "Viagem em 5 dias — documentos pendentes",
    impact: "high",
    route: "/blindagem?urgent=true",
    icon: "file",
    financialImpact: 8700,
  },
  {
    id: "3",
    title: "Finalizar orçamento parado há 6 dias",
    description: "Cliente Carlos Lima — última interação 15/01",
    impact: "medium",
    route: "/orcamentos?client=carlos-lima",
    icon: "clock",
    financialImpact: 15000,
  },
];

export const PriorityActionsList = ({ actions = defaultActions }: PriorityActionsListProps) => {
  const navigate = useNavigate();
  
  const getIcon = (iconType: PriorityAction["icon"]) => {
    switch (iconType) {
      case "phone":
        return <Phone className="h-4 w-4" />;
      case "file":
        return <FileCheck className="h-4 w-4" />;
      case "clock":
        return <Clock className="h-4 w-4" />;
      case "user":
        return <User className="h-4 w-4" />;
    }
  };
  
  const getImpactColors = (impact: PriorityAction["impact"]) => {
    switch (impact) {
      case "high":
        return {
          bg: "bg-red-500/10",
          border: "border-red-500/30",
          text: "text-red-400",
          badge: "bg-red-500/20 text-red-400",
        };
      case "medium":
        return {
          bg: "bg-amber-500/10",
          border: "border-amber-500/30",
          text: "text-amber-400",
          badge: "bg-amber-500/20 text-amber-400",
        };
      case "low":
        return {
          bg: "bg-blue-500/10",
          border: "border-blue-500/30",
          text: "text-blue-400",
          badge: "bg-blue-500/20 text-blue-400",
        };
    }
  };
  
  const handleActionClick = (action: PriorityAction) => {
    navigate(action.route);
  };
  
  const topActions = actions.slice(0, 3);
  
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-accent" />
          <CardTitle className="text-base">Ações Prioritárias</CardTitle>
        </div>
        <CardDescription className="text-xs">O que fazer agora</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Priority List */}
        <div className="space-y-2">
          {topActions.map((action, index) => {
            const colors = getImpactColors(action.impact);
            return (
              <button
                key={action.id}
                onClick={() => handleActionClick(action)}
                className={`w-full text-left p-3 rounded-lg border transition-all hover:shadow-md ${colors.bg} ${colors.border} group`}
              >
                <div className="flex items-start gap-3">
                  {/* Priority Number */}
                  <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${colors.badge}`}>
                    {index + 1}
                  </div>
                  
                  {/* Icon */}
                  <div className={`flex-shrink-0 mt-0.5 ${colors.text}`}>
                    {getIcon(action.icon)}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {action.title}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {action.description}
                    </p>
                  </div>
                  
                  {/* Arrow */}
                  <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors flex-shrink-0" />
                </div>
              </button>
            );
          })}
        </div>
        
        {/* NIA Interpretation */}
        <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg">
          <NiaAvatar size="xs" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Ações ordenadas por impacto financeiro + risco. Resolva na ordem para maximizar resultados.
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-accent hover:text-accent/80"
          onClick={() => navigate("/prioridades")}
        >
          Ver todas as prioridades
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};
