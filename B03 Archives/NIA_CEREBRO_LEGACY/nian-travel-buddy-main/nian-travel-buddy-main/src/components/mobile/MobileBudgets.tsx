import { useState } from "react";
import { Search, Plus, ChevronRight, Send, CheckCircle2, XCircle, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MarginAlert } from "@/components/orcamentos/MarginAlert";
import { OrcamentoDetailPanel } from "@/components/orcamentos/OrcamentoDetailPanel";
import { useOrcamentos, type OrcamentoStatus } from "@/hooks/useOrcamentos";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(value);

const getStatusConfig = (status: string) => {
  switch (status) {
    case "rascunho": return { label: "Rascunho", color: "bg-muted text-muted-foreground" };
    case "enviado": return { label: "Enviado", color: "bg-blue-500/15 text-blue-500" };
    case "aprovado": return { label: "Aprovado", color: "bg-green-500/15 text-green-500" };
    case "perdido": return { label: "Perdido", color: "bg-destructive/15 text-destructive" };
    case "emitido": return { label: "Emitido", color: "bg-emerald-600/15 text-emerald-600" };
    default: return { label: status, color: "bg-muted text-muted-foreground" };
  }
};

export function MobileBudgets() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { orcamentos, isLoading, updateStatus, updateOrcamento, isUpdating, deleteOrcamento } = useOrcamentos();
  const { toast } = useToast();

  const handleStatusChange = (id: string, status: OrcamentoStatus) => {
    if (status === "emitido") {
      const orc = orcamentos.find(o => o.id === id);
      if (orc && (!orc.confirmacao_cliente || !orc.checklist_conferido || !orc.pagamento_confirmado)) {
        toast({ title: "Checklist obrigatório antes da emissão.", variant: "destructive" });
        return;
      }
    }
    updateStatus({ id, status });
  };

  const filtered = orcamentos.filter((o) => {
    const q = searchQuery.toLowerCase();
    return (
      (o.clients?.name || "").toLowerCase().includes(q) ||
      (o.clients?.destination || "").toLowerCase().includes(q) ||
      (o.titulo || "").toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    const priority: Record<string, number> = { enviado: 0, rascunho: 1, aprovado: 2, perdido: 3 };
    return (priority[a.status] || 5) - (priority[b.status] || 5);
  });

  const openCount = orcamentos.filter((o) => o.status === "enviado" || o.status === "rascunho").length;
  const selectedOrcamento = selectedId ? orcamentos.find(o => o.id === selectedId) : null;

  // Full-screen detail view on mobile
  if (selectedOrcamento) {
    return (
      <div className="fixed inset-0 z-50 bg-background">
        <OrcamentoDetailPanel
          orcamento={selectedOrcamento}
          onSave={updateOrcamento}
          isSaving={isUpdating}
          onClose={() => setSelectedId(null)}
          compact
        />
      </div>
    );
  }

  return (
    <div className="px-2.5 py-1.5 space-y-1 pb-16">
      <div className="flex items-baseline justify-between">
        <h1 className="text-sm font-semibold text-foreground">Orçamentos</h1>
        <span className="text-[10px] text-muted-foreground">{openCount} em aberto</span>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input placeholder="Buscar orçamento..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-7 h-7 text-xs" />
      </div>

      <div className="space-y-px">
        {isLoading ? (
          <div className="text-center py-3 text-muted-foreground"><p className="text-[10px]">Carregando...</p></div>
        ) : sorted.length === 0 ? (
          <div className="text-center py-3 text-muted-foreground"><p className="text-[10px]">Nenhum orçamento encontrado</p></div>
        ) : (
          sorted.map((o) => {
            const cfg = getStatusConfig(o.status);
            return (
              <div
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className="flex items-start gap-1.5 px-2 py-[6px] rounded border border-border bg-card cursor-pointer active:bg-muted/50"
              >
                <div className="flex-1 min-w-0 space-y-[2px]">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[11px] font-semibold text-foreground truncate">{o.clients?.name || "Sem cliente"}</p>
                    <span className="text-xs font-bold text-foreground flex-shrink-0 tabular-nums">{formatCurrency(o.valor_total)}</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground truncate">{o.titulo || "Sem título"}</p>
                  <p className="text-[8px] text-muted-foreground/70">{o.clients?.destination || ""}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] text-muted-foreground tabular-nums">
                      {o.margem_percent > 0 ? `Margem: ${o.margem_percent}% (${formatCurrency(o.lucro)})` : "—"}
                    </span>
                    <span className={cn("text-[8px] px-1 py-px rounded-full leading-none font-medium flex-shrink-0", cfg.color)}>
                      {cfg.label}
                    </span>
                  </div>
                  <MarginAlert marginPercent={o.margem_percent} className="text-[8px] py-0.5 px-1" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="mt-0.5 p-0.5" onClick={(e) => e.stopPropagation()}>
                      <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {o.status === "rascunho" && (
                      <DropdownMenuItem onClick={() => handleStatusChange(o.id, "enviado")}>
                        <Send className="h-3 w-3 mr-1" />Enviar
                      </DropdownMenuItem>
                    )}
                    {o.status === "enviado" && (
                      <>
                        <DropdownMenuItem onClick={() => handleStatusChange(o.id, "aprovado")}>
                          <CheckCircle2 className="h-3 w-3 mr-1" />Aprovar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(o.id, "perdido")}>
                          <XCircle className="h-3 w-3 mr-1" />Perdido
                        </DropdownMenuItem>
                      </>
                    )}
                    {o.status === "aprovado" && (
                      <DropdownMenuItem onClick={() => handleStatusChange(o.id, "emitido")}>
                        <CheckCircle2 className="h-3 w-3 mr-1" />Emitir
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => deleteOrcamento(o.id)} className="text-destructive">
                      <Trash2 className="h-3 w-3 mr-1" />Excluir
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            );
          })
        )}
      </div>

      <div className="fixed bottom-12 left-2.5 right-2.5 z-40">
        <Button className="w-full h-7 text-[10px] shadow-sm" asChild>
          <Link to="/orcamentos/criar"><Plus className="h-3 w-3 mr-0.5" />Novo Orçamento</Link>
        </Button>
      </div>
    </div>
  );
}
