import { useState } from "react";
import { FileText, Sparkles, MessageSquare, Mic } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// CREATE BUDGET MODAL — ESCOLHA DE MODO
// 
// Opções:
//   1. Orçamento guiado pela NIA (perguntas estratégicas + áudio)
//   2. Orçamento com NIA livre
// ═══════════════════════════════════════════════════════════════════════════════

interface CreateBudgetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectMode: (mode: "guided" | "free") => void;
}

export function CreateBudgetModal({ open, onOpenChange, onSelectMode }: CreateBudgetModalProps) {
  const [selectedMode, setSelectedMode] = useState<"guided" | "free" | null>(null);

  const handleContinue = () => {
    if (selectedMode) {
      onSelectMode(selectedMode);
      onOpenChange(false);
      setSelectedMode(null);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    setSelectedMode(null);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-accent" />
            Criar Orçamento Premium
          </DialogTitle>
          <DialogDescription>
            Escolha como você quer criar o orçamento
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-4">
          {/* Guided Mode */}
          <button
            onClick={() => setSelectedMode("guided")}
            className={cn(
              "w-full p-4 rounded-lg border-2 text-left transition-all",
              selectedMode === "guided"
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent/50 bg-card"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                selectedMode === "guided" ? "bg-accent text-accent-foreground" : "bg-secondary"
              )}>
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Orçamento guiado pela N.IA</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  A N.IA conduz passo a passo com perguntas estratégicas. Responda por texto ou áudio.
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li className="flex items-center gap-1">
                    <Mic className="h-3 w-3" /> Suporte a voz e texto
                  </li>
                  <li>• 12 perguntas de perfil do cliente</li>
                  <li>• Detalhamento de voos com confirmação</li>
                  <li>• Análise de riscos automática</li>
                </ul>
              </div>
            </div>
          </button>

          {/* Free Mode */}
          <button
            onClick={() => setSelectedMode("free")}
            className={cn(
              "w-full p-4 rounded-lg border-2 text-left transition-all",
              selectedMode === "free"
                ? "border-accent bg-accent/10"
                : "border-border hover:border-accent/50 bg-card"
            )}
          >
            <div className="flex items-start gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                selectedMode === "free" ? "bg-accent text-accent-foreground" : "bg-secondary"
              )}>
                <MessageSquare className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-foreground">Orçamento com N.IA livre</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Você preenche as informações e a N.IA auxilia conforme necessário.
                </p>
                <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                  <li>• Mais liberdade no preenchimento</li>
                  <li>• N.IA disponível para consultas</li>
                  <li>• Ideal para orçamentos rápidos</li>
                </ul>
              </div>
            </div>
          </button>
        </div>

        <div className="flex gap-3 pt-2">
          <Button variant="outline" onClick={handleClose} className="flex-1">
            Cancelar
          </Button>
          <Button 
            onClick={handleContinue} 
            disabled={!selectedMode}
            className="flex-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            Continuar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
