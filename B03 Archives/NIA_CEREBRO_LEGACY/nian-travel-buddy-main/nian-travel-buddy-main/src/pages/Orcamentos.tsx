import { MainLayout } from "@/components/layout/MainLayout";
import { MobileLayout, MobileBudgets } from "@/components/mobile";
import { useIsMobile } from "@/hooks/use-mobile";
import { useSearchParams, useNavigate } from "react-router-dom";
import { FileText, Search, Filter, Plus, Clock, CheckCircle2, XCircle, MoreHorizontal, Send, Trash2 } from "lucide-react";
import { PreEmissaoChecklist } from "@/components/orcamentos/PreEmissaoChecklist";
import { OrcamentoDetailPanel } from "@/components/orcamentos/OrcamentoDetailPanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { CreateBudgetModal } from "@/components/orcamentos/CreateBudgetModal";
import { MarginAlert } from "@/components/orcamentos/MarginAlert";
import { useOrcamentos, type Orcamento, type OrcamentoStatus } from "@/hooks/useOrcamentos";
import { useToast } from "@/hooks/use-toast";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  rascunho: { label: "Rascunho", color: "bg-muted text-muted-foreground border-border", icon: <FileText className="h-4 w-4" /> },
  enviado: { label: "Enviado", color: "bg-blue-500/10 text-blue-500 border-blue-500/20", icon: <Clock className="h-4 w-4" /> },
  aprovado: { label: "Aprovado", color: "bg-green-500/10 text-green-500 border-green-500/20", icon: <CheckCircle2 className="h-4 w-4" /> },
  perdido: { label: "Perdido", color: "bg-red-500/10 text-red-500 border-red-500/20", icon: <XCircle className="h-4 w-4" /> },
  emitido: { label: "Emitido", color: "bg-emerald-600/10 text-emerald-600 border-emerald-600/20", icon: <CheckCircle2 className="h-4 w-4" /> },
};

export default function Orcamentos() {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(searchParams.get("status"));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const { orcamentos, isLoading, updateStatus, updateOrcamento, isUpdating, deleteOrcamento } = useOrcamentos();
  const { toast } = useToast();

  if (isMobile) {
    return (
      <MobileLayout>
        <MobileBudgets />
      </MobileLayout>
    );
  }

  const handleCreateBudget = (mode: "guided" | "free") => {
    navigate(`/orcamentos/criar?mode=${mode}`);
  };

  const filtered = orcamentos.filter((o) => {
    const clientName = o.clients?.name || "";
    const titulo = o.titulo || "";
    const dest = o.clients?.destination || "";
    const matchesSearch =
      titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dest.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !statusFilter ||
      (statusFilter === "aberto" ? ["enviado", "rascunho"].includes(o.status) : o.status === statusFilter);

    return matchesSearch && matchesStatus;
  });

  const counts = {
    total: orcamentos.length,
    abertos: orcamentos.filter((o) => ["enviado", "rascunho"].includes(o.status)).length,
    aprovados: orcamentos.filter((o) => o.status === "aprovado").length,
    perdidos: orcamentos.filter((o) => o.status === "perdido").length,
  };

  const totalOpenValue = orcamentos
    .filter((o) => ["enviado", "rascunho"].includes(o.status))
    .reduce((sum, o) => sum + (o.valor_total || 0), 0);

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

  const selectedOrcamento = selectedId ? orcamentos.find(o => o.id === selectedId) : null;

  return (
    <MainLayout>
      <div className="flex h-full">
        {/* List Side */}
        <div className={`${selectedOrcamento ? "w-1/2 border-r border-border" : "w-full"} p-8 overflow-y-auto transition-all`}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-6 w-6 text-accent" />
                Orçamentos
              </h1>
              <p className="text-muted-foreground mt-1">Gerencie seus orçamentos e acompanhe o status</p>
            </div>
            <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2 bg-accent hover:bg-accent/90 text-accent-foreground">
              <Plus className="h-4 w-4" />
              Novo Orçamento
            </Button>
          </div>

          <CreateBudgetModal open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen} onSelectMode={handleCreateBudget} />

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { key: null, value: counts.total, label: "Total", color: "text-foreground" },
              { key: "aberto", value: counts.abertos, label: "Abertos", color: "text-blue-500", extra: formatCurrency(totalOpenValue) },
              { key: "aprovado", value: counts.aprovados, label: "Aprovados", color: "text-green-500" },
              { key: "perdido", value: counts.perdidos, label: "Perdidos", color: "text-red-500" },
            ].map((stat) => (
              <button
                key={stat.label}
                onClick={() => setStatusFilter(stat.key)}
                className={`p-4 rounded-lg border transition-colors text-left ${
                  statusFilter === stat.key ? "bg-accent/10 border-accent/30" : "bg-secondary border-border hover:border-accent/20"
                }`}
              >
                <p className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                {stat.extra && <p className="text-xs text-muted-foreground mt-1">{stat.extra}</p>}
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Buscar por título, cliente ou destino..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2"><Filter className="h-4 w-4" />Filtrar</Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter(null)}>Todos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("rascunho")}>Rascunhos</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("enviado")}>Enviados</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("aprovado")}>Aprovados</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter("perdido")}>Perdidos</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* List */}
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-center py-12 text-muted-foreground">Carregando...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum orçamento encontrado</p>
              </div>
            ) : (
              filtered.map((o) => {
                const cfg = statusConfig[o.status] || statusConfig.rascunho;
                const isSelected = selectedId === o.id;
                return (
                  <div
                    key={o.id}
                    onClick={() => setSelectedId(isSelected ? null : o.id)}
                    className={`bg-card border rounded-lg p-4 cursor-pointer transition-colors ${
                      isSelected ? "border-accent ring-1 ring-accent/30" : "border-border hover:border-accent/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-medium text-foreground">{o.titulo || "Sem título"}</h3>
                          <Badge variant="outline" className={`gap-1 ${cfg.color}`}>
                            {cfg.icon}
                            {cfg.label}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span>{o.clients?.name || "Sem cliente"}</span>
                          {o.clients?.destination && <><span>•</span><span>{o.clients.destination}</span></>}
                          {o.margem_percent > 0 && <><span>•</span><span>Margem: {o.margem_percent}%</span></>}
                        </div>
                        <MarginAlert marginPercent={o.margem_percent} className="mt-2" />
                      </div>
                      <div className="flex items-center gap-6 ml-4">
                        <div className="text-right">
                          <p className="text-lg font-semibold text-foreground">{formatCurrency(o.valor_total)}</p>
                          {o.lucro > 0 && <p className="text-xs text-muted-foreground">Lucro: {formatCurrency(o.lucro)}</p>}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={(e) => e.stopPropagation()}>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {o.status === "rascunho" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(o.id, "enviado")}>
                                <Send className="h-4 w-4 mr-2" />Marcar como Enviado
                              </DropdownMenuItem>
                            )}
                            {o.status === "enviado" && (
                              <>
                                <DropdownMenuItem onClick={() => handleStatusChange(o.id, "aprovado")}>
                                  <CheckCircle2 className="h-4 w-4 mr-2" />Marcar como Aprovado
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleStatusChange(o.id, "perdido")}>
                                  <XCircle className="h-4 w-4 mr-2" />Marcar como Perdido
                                </DropdownMenuItem>
                              </>
                            )}
                            {o.status === "aprovado" && (
                              <DropdownMenuItem onClick={() => handleStatusChange(o.id, "emitido")}>
                                <CheckCircle2 className="h-4 w-4 mr-2" />Marcar como Emitido
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem onClick={() => deleteOrcamento(o.id)} className="text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />Excluir
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Detail Side Panel */}
        {selectedOrcamento && (
          <div className="w-1/2 h-full overflow-hidden">
            <OrcamentoDetailPanel
              orcamento={selectedOrcamento}
              onSave={updateOrcamento}
              isSaving={isUpdating}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
}
