import { cn } from "@/lib/utils";
import { NiaAvatar } from "../nia/NiaAvatar";
import { ArrowRight, AlertTriangle, AlertCircle, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NiaInsight, getPrimaryInsight } from "@/data/mockData";
import { getInsightNavigation, buildNavigationUrl } from "@/utils/insightNavigation";
interface NiaInsightCardProps {
  insight?: string;
  action?: string;
  onAction?: () => void;
  className?: string;
}
export function NiaInsightCard({
  insight: propInsight,
  action,
  onAction,
  className
}: NiaInsightCardProps) {
  const navigate = useNavigate();
  const {
    text: generatedInsight,
    insight: insightData
  } = getPrimaryInsight();

  // Use prop insight if provided, otherwise use generated
  const displayInsight = propInsight || generatedInsight;

  // Get navigation info for actionable insights
  const navigationInfo = insightData ? getInsightNavigation(insightData.id) : null;
  const isActionable = insightData?.isActionable && navigationInfo?.isActionable;
  const handleAnalysisClick = () => {
    if (onAction) {
      onAction();
    }
    // Navigate to Relatórios with insights tab
    navigate("/relatorios?tab=insights");
  };
  const handleInsightClick = () => {
    // If the insight is actionable and has navigation, go directly to the entity
    if (isActionable && navigationInfo?.navigation) {
      const url = buildNavigationUrl(navigationInfo.navigation);
      navigate(url);
    }
  };
  const getPriorityIcon = (priority?: NiaInsight["priority"]) => {
    switch (priority) {
      case "critical":
        return <AlertTriangle className="h-4 w-4 text-destructive" />;
      case "warning":
        return <AlertCircle className="h-4 w-4 text-status-warning" />;
      default:
        return <Info className="h-4 w-4 text-accent" />;
    }
  };
  return <div className={cn("rounded-xl p-5 transition-all duration-300 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent border border-accent/20 nia-border-glow", className)}>
      <div className="flex gap-4">
        <NiaAvatar size="md" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <p className="text-xs font-medium text-accent">Insight da N.IA</p>
            {insightData && getPriorityIcon(insightData.priority)}
          </div>
          <p className={cn("text-sm leading-relaxed text-foreground", isActionable && "cursor-pointer hover:text-accent transition-colors")} onClick={isActionable ? handleInsightClick : undefined}>
            {displayInsight}
          </p>
          <div className="mt-3 flex flex-wrap gap-3">
            {/* Primary action: direct navigation for actionable insights */}
            {isActionable && insightData?.actionLabel && <button onClick={handleInsightClick} className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline group text-primary">
                {insightData.actionLabel}
                <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
              </button>}
            {/* Secondary action: view complete analysis */}
            <button onClick={handleAnalysisClick} className={cn("inline-flex items-center gap-1.5 text-sm font-medium hover:underline group", isActionable ? "text-muted-foreground" : "text-accent")}>
              {action || "Ver análise completa"}
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>;
}