import { useState } from "react";
import { Check, ChevronRight, AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { mockTasks, mockFollowups, formatCurrency } from "@/data/mockData";
import { toast } from "sonner";

const getPriorityDot = (priority: string) => {
  switch (priority) {
    case "urgent": return "bg-destructive";
    case "high": return "bg-status-warning";
    case "medium": return "bg-accent";
    case "low": return "bg-muted-foreground/40";
    default: return "bg-muted-foreground/40";
  }
};

export function MobileTasks() {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<"tasks" | "followups">("tasks");

  const todayTasks = mockTasks.filter(task => {
    const dueDate = new Date(task.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate <= today && task.status !== "completed";
  });

  const pendingFollowUps = mockFollowups.filter(f => f.priority === "urgent" || f.priority === "high");

  const handleComplete = (taskId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setCompletedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) { newSet.delete(taskId); }
      else { newSet.add(taskId); toast.success("Tarefa concluída!"); }
      return newSet;
    });
  };

  return (
    <div className="px-2.5 py-1.5 space-y-1">
      <div className="flex items-baseline justify-between">
        <h1 className="text-sm font-semibold text-foreground">Tarefas</h1>
        <span className="text-[10px] text-muted-foreground">
          {todayTasks.length} hoje • {pendingFollowUps.length} follow-ups
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-0.5">
        <button
          onClick={() => setActiveTab("tasks")}
          className={cn(
            "flex-1 py-[3px] text-[9px] font-medium rounded transition-colors",
            activeTab === "tasks" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          Tarefas ({todayTasks.length})
        </button>
        <button
          onClick={() => setActiveTab("followups")}
          className={cn(
            "flex-1 py-[3px] text-[9px] font-medium rounded transition-colors",
            activeTab === "followups" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
          )}
        >
          Follow-ups ({pendingFollowUps.length})
        </button>
      </div>

      {activeTab === "tasks" ? (
        <div className="space-y-px">
          {todayTasks.length === 0 ? (
            <div className="text-center py-3 text-muted-foreground">
              <Check className="h-3.5 w-3.5 mx-auto mb-0.5 text-status-success" />
              <p className="text-[9px]">Nenhuma tarefa pendente</p>
            </div>
          ) : (
            todayTasks.map((task) => {
              const isCompleted = completedTasks.has(task.id);
              const dueDate = new Date(task.dueDate);
              return (
                <div key={task.id} className={cn("flex items-start gap-1.5 px-2 py-[5px] rounded border border-border bg-card", isCompleted && "opacity-40")}>
                  <button
                    className={cn(
                      "w-3.5 h-3.5 rounded-full flex-shrink-0 flex items-center justify-center mt-px",
                      isCompleted ? "bg-status-success" : "border border-muted-foreground/30"
                    )}
                    onClick={(e) => handleComplete(task.id, e)}
                  >
                    {isCompleted && <Check className="h-2 w-2 text-status-success-foreground" />}
                  </button>
                  <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1", getPriorityDot(task.priority))} />
                  <div className="flex-1 min-w-0 space-y-[1px]">
                    {/* L1: Título */}
                    <p className={cn("text-[11px] font-medium text-foreground truncate leading-tight", isCompleted && "line-through")}>{task.title}</p>
                    {/* L2: Cliente */}
                    {task.relatedClient && (
                      <p className="text-[8px] text-muted-foreground truncate">{task.relatedClient}</p>
                    )}
                    {/* L3: Data + Status */}
                    <p className="text-[8px] text-muted-foreground/70">
                      {dueDate.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} • {task.status === "pending" ? "Pendente" : task.status === "in_progress" ? "Em andamento" : "Concluída"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      ) : (
        <div className="space-y-px">
          {pendingFollowUps.length === 0 ? (
            <div className="text-center py-3 text-muted-foreground">
              <Check className="h-3.5 w-3.5 mx-auto mb-0.5 text-status-success" />
              <p className="text-[9px]">Nenhum follow-up pendente</p>
            </div>
          ) : (
            pendingFollowUps.map((followUp) => (
              <Link key={followUp.id} to="/followups">
                <div className="flex items-center gap-1.5 px-2 py-[5px] rounded border border-border bg-card hover:bg-muted/30 transition-colors">
                  <AlertTriangle className="h-2.5 w-2.5 text-status-warning flex-shrink-0" />
                  <div className="flex-1 min-w-0 space-y-[1px]">
                    <p className="text-[11px] font-medium text-foreground truncate leading-tight">{followUp.clientName}</p>
                    <p className="text-[8px] text-muted-foreground truncate">{followUp.destination} • {followUp.daysIdle}d sem contato</p>
                  </div>
                  <span className="text-[11px] font-semibold text-foreground flex-shrink-0 tabular-nums">
                    {followUp.budgetValue ? formatCurrency(followUp.budgetValue) : ""}
                  </span>
                  <ChevronRight className="h-2.5 w-2.5 text-muted-foreground/40 flex-shrink-0" />
                </div>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}
