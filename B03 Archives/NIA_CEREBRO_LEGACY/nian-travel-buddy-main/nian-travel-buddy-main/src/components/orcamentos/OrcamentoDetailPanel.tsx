import { useState, useEffect, useMemo } from "react";
import { X, Save, DollarSign, AlertTriangle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PreEmissaoChecklist } from "@/components/orcamentos/PreEmissaoChecklist";
import type { Orcamento } from "@/hooks/useOrcamentos";

interface OrcamentoDetailPanelProps {
  orcamento: Orcamento;
  onSave: (data: {
    id: string;
    titulo?: string;
    valor_total?: number;
    custo_total?: number;
    forma_pagamento?: string | null;
    motivo_perda?: string | null;
  }) => Promise<void>;
  isSaving: boolean;
  onClose: () => void;
  compact?: boolean;
}

const formaPagamentoOptions = [
  { value: "pix", label: "PIX" },
  { value: "cartao_1x", label: "Cartão à vista" },
  { value: "cartao_parcelado", label: "Cartão parcelado" },
  { value: "boleto", label: "Boleto" },
];

const formatCurrency = (v: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);

export function OrcamentoDetailPanel({
  orcamento,
  onSave,
  isSaving,
  onClose,
  compact = false,
}: OrcamentoDetailPanelProps) {
  const [titulo, setTitulo] = useState(orcamento.titulo || "");
  const [valorTotal, setValorTotal] = useState(String(orcamento.valor_total || 0));
  const [custoTotal, setCustoTotal] = useState(String(orcamento.custo_total || 0));
  const [formaPagamento, setFormaPagamento] = useState(orcamento.forma_pagamento || "");
  const [motivoPerda, setMotivoPerda] = useState(orcamento.motivo_perda || "");

  // Reset when orcamento changes
  useEffect(() => {
    setTitulo(orcamento.titulo || "");
    setValorTotal(String(orcamento.valor_total || 0));
    setCustoTotal(String(orcamento.custo_total || 0));
    setFormaPagamento(orcamento.forma_pagamento || "");
    setMotivoPerda(orcamento.motivo_perda || "");
  }, [orcamento.id]);

  const valor = parseFloat(valorTotal) || 0;
  const custo = parseFloat(custoTotal) || 0;
  const lucro = valor - custo;
  const margem = valor > 0 ? Math.round((lucro / valor) * 100 * 100) / 100 : 0;

  const marginLevel = useMemo(() => {
    if (margem < 10) return "danger";
    if (margem < 12) return "warning";
    return "safe";
  }, [margem]);

  const hasChanges =
    titulo !== (orcamento.titulo || "") ||
    valor !== (orcamento.valor_total || 0) ||
    custo !== (orcamento.custo_total || 0) ||
    formaPagamento !== (orcamento.forma_pagamento || "") ||
    motivoPerda !== (orcamento.motivo_perda || "");

  const handleSave = async () => {
    await onSave({
      id: orcamento.id,
      titulo: titulo || undefined,
      valor_total: valor,
      custo_total: custo,
      forma_pagamento: formaPagamento || null,
      motivo_perda: motivoPerda || null,
    });
  };

  const spacing = compact ? "space-y-2" : "space-y-4";
  const labelSize = compact ? "text-[10px]" : "text-sm";
  const inputSize = compact ? "h-7 text-xs" : "";

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className={`flex items-center justify-between border-b border-border ${compact ? "px-3 py-2" : "px-6 py-4"}`}>
        <h2 className={`font-semibold text-foreground ${compact ? "text-sm" : "text-lg"}`}>
          Detalhes do Orçamento
        </h2>
        <Button variant="ghost" size="icon" onClick={onClose} className={compact ? "h-6 w-6" : "h-8 w-8"}>
          <X className={compact ? "h-3.5 w-3.5" : "h-4 w-4"} />
        </Button>
      </div>

      {/* Content */}
      <div className={`flex-1 overflow-y-auto ${compact ? "px-3 py-2" : "px-6 py-4"} ${spacing}`}>
        {/* General Info */}
        <div className={spacing}>
          <Label className={labelSize}>Título</Label>
          <Input
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            placeholder="Nome do orçamento"
            className={inputSize}
          />
        </div>

        {/* Client info (read-only) */}
        {orcamento.clients && (
          <div className={`rounded-lg border border-border bg-muted/30 ${compact ? "p-2" : "p-3"}`}>
            <p className={`text-muted-foreground ${compact ? "text-[9px]" : "text-xs"}`}>Cliente</p>
            <p className={`font-medium text-foreground ${compact ? "text-[11px]" : "text-sm"}`}>
              {orcamento.clients.name}
            </p>
            {orcamento.clients.destination && (
              <p className={`text-muted-foreground ${compact ? "text-[9px]" : "text-xs"}`}>
                {orcamento.clients.destination}
              </p>
            )}
          </div>
        )}

        <Separator />

        {/* Financial Block */}
        <div>
          <div className={`flex items-center gap-2 ${compact ? "mb-1.5" : "mb-3"}`}>
            <DollarSign className={`text-accent ${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
            <span className={`font-medium text-foreground ${compact ? "text-[11px]" : "text-sm"}`}>
              Financeiro
            </span>
          </div>

          <div className={`grid grid-cols-2 gap-3 ${spacing}`}>
            <div>
              <Label className={labelSize}>Valor Total (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={valorTotal}
                onChange={(e) => setValorTotal(e.target.value)}
                className={inputSize}
              />
            </div>
            <div>
              <Label className={labelSize}>Custo Total (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={custoTotal}
                onChange={(e) => setCustoTotal(e.target.value)}
                className={inputSize}
              />
            </div>
          </div>

          {/* Read-only calculated fields */}
          <div className={`grid grid-cols-2 gap-3 ${compact ? "mt-2" : "mt-3"}`}>
            <div className={`rounded-lg border border-border bg-muted/30 ${compact ? "p-2" : "p-3"}`}>
              <p className={`text-muted-foreground ${compact ? "text-[9px]" : "text-xs"}`}>Lucro</p>
              <p className={`font-semibold ${lucro >= 0 ? "text-green-500" : "text-destructive"} ${compact ? "text-xs" : "text-sm"}`}>
                {formatCurrency(lucro)}
              </p>
            </div>
            <div className={`rounded-lg border ${
              marginLevel === "danger" ? "border-destructive/30 bg-destructive/5" :
              marginLevel === "warning" ? "border-amber-500/30 bg-amber-500/5" :
              "border-border bg-muted/30"
            } ${compact ? "p-2" : "p-3"}`}>
              <p className={`text-muted-foreground ${compact ? "text-[9px]" : "text-xs"}`}>Margem</p>
              <p className={`font-semibold ${
                marginLevel === "danger" ? "text-destructive" :
                marginLevel === "warning" ? "text-amber-500" :
                "text-green-500"
              } ${compact ? "text-xs" : "text-sm"}`}>
                {margem}%
              </p>
            </div>
          </div>

          {/* Margin alerts */}
          {marginLevel === "danger" && (
            <div className={`flex items-center gap-2 text-destructive ${compact ? "mt-1.5 text-[9px]" : "mt-2 text-xs"}`}>
              <AlertTriangle className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
              Margem abaixo de 10% — risco de prejuízo!
            </div>
          )}
          {marginLevel === "warning" && (
            <div className={`flex items-center gap-2 text-amber-500 ${compact ? "mt-1.5 text-[9px]" : "mt-2 text-xs"}`}>
              <AlertTriangle className={compact ? "h-3 w-3" : "h-3.5 w-3.5"} />
              Margem entre 10% e 12% — atenção.
            </div>
          )}
        </div>

        <Separator />

        {/* Forma de Pagamento */}
        <div className={spacing}>
          <Label className={labelSize}>Forma de Pagamento</Label>
          <Select value={formaPagamento} onValueChange={setFormaPagamento}>
            <SelectTrigger className={inputSize}>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {formaPagamentoOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Motivo da Perda */}
        {orcamento.status === "perdido" && (
          <div className={spacing}>
            <Label className={`${labelSize} text-destructive`}>
              Motivo da Perda *
            </Label>
            <Textarea
              value={motivoPerda}
              onChange={(e) => setMotivoPerda(e.target.value)}
              placeholder="Informe o motivo da perda..."
              className={compact ? "text-xs min-h-[60px]" : "min-h-[80px]"}
            />
          </div>
        )}

        {/* Pre-emission checklist */}
        {orcamento.status === "aprovado" && (
          <PreEmissaoChecklist
            orcamentoId={orcamento.id}
            confirmacaoCliente={orcamento.confirmacao_cliente}
            checklistConferido={orcamento.checklist_conferido}
            pagamentoConfirmado={orcamento.pagamento_confirmado}
            compact={compact}
          />
        )}
      </div>

      {/* Footer — sticky save */}
      <div className={`border-t border-border ${compact ? "px-3 py-2" : "px-6 py-4"}`}>
        <Button
          onClick={handleSave}
          disabled={!hasChanges || isSaving}
          className={`w-full bg-accent hover:bg-accent/90 text-accent-foreground ${compact ? "h-8 text-xs" : ""}`}
        >
          {isSaving ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Salvando...</>
          ) : (
            <><Save className="h-4 w-4 mr-2" />Salvar Alterações</>
          )}
        </Button>
      </div>
    </div>
  );
}
