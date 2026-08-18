import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MVP_USER_ID } from "@/lib/mvp-user";

export type OrcamentoStatus = "rascunho" | "enviado" | "aprovado" | "perdido" | "emitido";

export interface Orcamento {
  id: string;
  company_id: string;
  client_id: string | null;
  titulo: string | null;
  valor_total: number;
  custo_total: number;
  margem_percent: number;
  lucro: number;
  status: string;
  motivo_perda: string | null;
  forma_pagamento: string | null;
  created_at: string;
  confirmacao_cliente: boolean;
  checklist_conferido: boolean;
  pagamento_confirmado: boolean;
  clients?: { name: string; destination: string | null } | null;
}

export interface UpdateOrcamentoInput {
  id: string;
  titulo?: string;
  valor_total?: number;
  custo_total?: number;
  forma_pagamento?: string | null;
  motivo_perda?: string | null;
}

export interface CreateOrcamentoInput {
  client_id?: string;
  titulo: string;
  valor_total?: number;
  custo_total?: number;
  status?: OrcamentoStatus;
}

export function useOrcamentos() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const {
    data: orcamentos = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ["orcamentos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orcamentos")
        .select(
          "id, company_id, client_id, titulo, valor_total, custo_total, margem_percent, lucro, status, motivo_perda, forma_pagamento, created_at, confirmacao_cliente, checklist_conferido, pagamento_confirmado, clients(name, destination)",
        )
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data ?? []) as any[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: CreateOrcamentoInput) => {
      const { data, error } = await supabase
        .from("orcamentos")
        .insert({
          company_id: MVP_USER_ID,
          client_id: input.client_id || null,
          titulo: input.titulo,
          valor_total: input.valor_total || 0,
          custo_total: input.custo_total || 0,
          status: input.status || "rascunho",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast({ title: "Orçamento criado com sucesso" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao criar orçamento", description: err.message, variant: "destructive" });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
      motivo_perda,
    }: {
      id: string;
      status: OrcamentoStatus;
      motivo_perda?: string;
    }) => {
      const updateData: Record<string, unknown> = { status };
      if (motivo_perda) updateData.motivo_perda = motivo_perda;

      const { error } = await supabase.from("orcamentos").update(updateData).eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast({ title: "Status atualizado" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("orcamentos").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast({ title: "Orçamento excluído" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao excluir", description: err.message, variant: "destructive" });
    },
  });

  const updateOrcamentoMutation = useMutation({
    mutationFn: async (input: UpdateOrcamentoInput) => {
      const { id, ...fields } = input;
      const { error } = await supabase.from("orcamentos").update(fields).eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orcamentos"] });
      toast({ title: "Orçamento atualizado" });
    },
    onError: (err: Error) => {
      toast({ title: "Erro ao atualizar", description: err.message, variant: "destructive" });
    },
  });

  return {
    orcamentos,
    isLoading,
    error,
    createOrcamento: createMutation.mutateAsync,
    updateStatus: updateStatusMutation.mutate,
    updateOrcamento: updateOrcamentoMutation.mutateAsync,
    isUpdating: updateOrcamentoMutation.isPending,
    deleteOrcamento: deleteMutation.mutate,
    isCreating: createMutation.isPending,
  };
}
