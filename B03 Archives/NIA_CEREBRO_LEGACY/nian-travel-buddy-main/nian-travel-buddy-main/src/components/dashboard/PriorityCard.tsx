import { cn } from "@/lib/utils";
import { AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
interface Priority {
  id: string;
  title: string;
  description: string;
  type: "urgent" | "warning" | "info";
  time?: string;
}
interface PriorityCardProps {
  priorities: Priority[];
  className?: string;
}
export function PriorityCard({
  priorities,
  className
}: PriorityCardProps) {
  const navigate = useNavigate();
  const getIcon = (type: Priority["type"]) => {
    switch (type) {
      case "urgent":
        return <AlertCircle className="h-4 w-4 text-red-400" />;
      case "warning":
        return <Clock className="h-4 w-4 text-amber-400" />;
      case "info":
        return <CheckCircle2 className="h-4 w-4 text-accent" />;
    }
  };
  const getBorderColor = (type: Priority["type"]) => {
    switch (type) {
      case "urgent":
        return "border-l-red-400";
      case "warning":
        return "border-l-amber-400";
      case "info":
        return "border-l-accent";
    }
  };
  const handleCardClick = () => {
    navigate("/prioridades");
  };
  return <div onClick={handleCardClick} className={cn("surface-card rounded-xl p-5 cursor-pointer hover:bg-surface-hover transition-colors", className)}>
      <h3 className="text-sm font-medium mb-4 text-primary">Prioridades do Dia</h3>
      <div className="space-y-3">
        {priorities.map(priority => <div key={priority.id} className={cn("p-3 rounded-lg bg-secondary border-l-2", getBorderColor(priority.type))}>
            <div className="flex items-start gap-3">
              <div className="mt-0.5">{getIcon(priority.type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {priority.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {priority.description}
                </p>
                {priority.time && <p className="text-xs text-muted-foreground mt-1">
                    {priority.time}
                  </p>}
              </div>
            </div>
          </div>)}
      </div>
    </div>;
}