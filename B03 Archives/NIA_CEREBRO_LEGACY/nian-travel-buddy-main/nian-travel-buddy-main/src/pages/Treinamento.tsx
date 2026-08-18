import { MainLayout } from "@/components/layout/MainLayout";
import { GraduationCap, BookOpen, MessageSquare, FileText, Users, Heart, ChevronRight, Lock, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { mockTrainingModules, type TrainingModule } from "@/data/mockData";

const iconMap: Record<string, React.ElementType> = {
  "uso-nia": MessageSquare,
  "orcamentos-profissionais": FileText,
  "organizar-tarefas": BookOpen,
  "padronizar-atendimento": Users,
};

const getStatusConfig = (status: TrainingModule["status"]) => {
  switch (status) {
    case "available":
      return { badge: "default" as const, label: "Disponível", color: "text-accent" };
    case "in_progress":
      return { badge: "secondary" as const, label: "Em andamento", color: "text-blue-500" };
    case "completed":
      return { badge: "default" as const, label: "Concluído", color: "text-green-500" };
    case "locked":
      return { badge: "outline" as const, label: "Bloqueado", color: "text-muted-foreground" };
  }
};

export default function Treinamento() {
  const totalLessons = mockTrainingModules.reduce((acc, m) => acc + m.lessons, 0);
  const completedLessons = mockTrainingModules.reduce((acc, m) => acc + m.completedLessons, 0);
  const progressPercent = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <GraduationCap className="h-6 w-6 text-accent" />
            Treinamento de Equipe
          </h1>
          <p className="text-muted-foreground mt-1">
            Padronize atendimento e vendas com a N.IA como instrutora
          </p>
        </div>

        {/* Progress Overview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-lg">Seu Progresso</CardTitle>
            <CardDescription>
              {completedLessons} de {totalLessons} aulas concluídas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercent} className="h-2" />
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>Início</span>
              <span>{Math.round(progressPercent)}% completo</span>
              <span>Certificado</span>
            </div>
          </CardContent>
        </Card>

        {/* Modules Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mockTrainingModules.map((modulo) => {
            const statusConfig = getStatusConfig(modulo.status);
            const ModuleIcon = iconMap[modulo.id] || BookOpen;
            const isLocked = modulo.status === "locked";
            const moduleProgress = modulo.lessons > 0 ? (modulo.completedLessons / modulo.lessons) * 100 : 0;

            return (
              <Card 
                key={modulo.id} 
                className={`transition-colors ${isLocked ? "opacity-60" : "hover:border-accent/30 cursor-pointer"}`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-secondary ${statusConfig.color}`}>
                        {isLocked ? <Lock className="h-5 w-5" /> : <ModuleIcon className="h-5 w-5" />}
                      </div>
                      <div>
                        <CardTitle className="text-base">{modulo.title}</CardTitle>
                        <p className="text-xs text-muted-foreground mt-1">
                          {modulo.lessons} aulas
                        </p>
                      </div>
                    </div>
                    <Badge variant={statusConfig.badge}>{statusConfig.label}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{modulo.description}</p>
                  
                  {!isLocked && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{modulo.completedLessons}/{modulo.lessons} aulas</span>
                        <span>{Math.round(moduleProgress)}%</span>
                      </div>
                      <Progress value={moduleProgress} className="h-1.5" />
                    </div>
                  )}
                  
                  {!isLocked && (
                    <div className="flex items-center justify-end mt-4 text-sm text-accent">
                      <span>Acessar módulo</span>
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* NIA Note */}
        <Card className="mt-6 border-accent/30 bg-accent/5">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <GraduationCap className="h-5 w-5 text-accent shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground">
                  A N.IA atua como <span className="font-medium">instrutora</span>, 
                  não como avaliadora. O objetivo é padronizar conhecimento e 
                  capacitar sua equipe de forma prática e acessível.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Complete os módulos anteriores para desbloquear os próximos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
