import { useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { ShieldCheck, UserCheck, ClipboardCheck, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

interface PreEmissaoChecklistProps {
  orcamentoId: string;
  confirmacaoCliente: boolean;
  checklistConferido: boolean;
  pagamentoConfirmado: boolean;
  compact?: boolean;
}

const items = [
  { key: "confirmacao_cliente" as const, label: "Confirmação do cliente", icon: UserCheck },
  { key: "checklist_conferido" as const, label: "Dados conferidos", icon: ClipboardCheck },
  { key: "pagamento_confirmado" as const, label: "Pagamento confirmado", icon: CreditCard },
];

export function PreEmissaoChecklist({
  orcamentoId,
  confirmacaoCliente,
  checklistConferido,
  pagamentoConfirmado,
  compact = false,
}: PreEmissaoChecklistProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState<string | null>(null);

  const values: Record<string, boolean> = {
    confirmacao_cliente: confirmacaoCliente,
    checklist_conferido: checklistConferido,
    pagamento_confirmado: pagamentoConfirmado,
  };

  const handleToggle = async (field: string, newValue: boolean) => {
    setLoading(field);
    const { error } = await supabase
      .from("orcamentos")
      .update({ [field]: newValue })
      .eq("id", orcamentoId);

    if (error) {
      toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
    } else {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
    }
    setLoading(null);
  };

  const allChecked = confirmacaoCliente && checklistConferido && pagamentoConfirmado;

  return (
    <div className={`rounded-lg border border-border bg-card ${compact ? "p-2" : "p-4"}`}>
      <div className={`flex items-center gap-2 ${compact ? "mb-1.5" : "mb-3"}`}>
        <ShieldCheck className={`text-accent ${compact ? "h-3.5 w-3.5" : "h-4 w-4"}`} />
        <span className={`font-medium text-foreground ${compact ? "text-[10px]" : "text-sm"}`}>
          Checklist Pré-Emissão
        </span>
        {allChecked && (
          <span className={`ml-auto text-green-500 font-medium ${compact ? "text-[8px]" : "text-xs"}`}>
            ✓ Completo
          </span>
        )}
      </div>
      <div className={compact ? "space-y-1" : "space-y-2"}>
        {items.map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className={`text-muted-foreground ${compact ? "h-3 w-3" : "h-4 w-4"}`} />
              <Label className={`text-muted-foreground cursor-pointer ${compact ? "text-[9px]" : "text-sm"}`}>
                {label}
              </Label>
            </div>
            <Switch
              checked={values[key]}
              onCheckedChange={(v) => handleToggle(key, v)}
              disabled={loading === key}
              className={compact ? "scale-75" : ""}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
