import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MVP_USER_ID } from "@/lib/mvp-user";

export interface ReportMetrics {
  revenue: number;
  profit: number;
  marginPercent: number;
  conversionRate: number;
  ticketMedio: number;
  pipelineValue: number;
  openBudgetsCount: number;
  totalBudgets: number;
  budgetsSent: number;
  budgetsApproved: number;
  activeClients: number;
  totalClients: number;
  pendingFollowups: number;
  staleEnviados: number;
  posVendaClients: number;
  recurringClients: number;
  recurrenceRate: number;
  topClients: { id: string; name: string; ticket_type: string | null; valor_lifetime: number | null; average_budget: number | null }[];
  confirmedSales: { id: string; titulo: string | null; valor_total: number; lucro: number; client_name: string | null }[];
}

export function useReportMetrics() {
  return useQuery({
    queryKey: ["report-metrics"],
    queryFn: async (): Promise<ReportMetrics> => {
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const fiveDaysAgo = new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString();

      // Parallel queries
      const [orcRes, clientsRes, followupsRes] = await Promise.all([
        supabase.from("orcamentos").select("id, titulo, valor_total, lucro, custo_total, status, created_at, data_viagem, client_id").eq("company_id", MVP_USER_ID),
        supabase.from("clients").select("id, name, status, ticket_type, valor_lifetime, average_budget").eq("company_id", MVP_USER_ID),
        supabase.from("follow_ups").select("id, status").eq("company_id", MVP_USER_ID).eq("status", "pendente"),
      ]);

      if (orcRes.error) throw orcRes.error;
      if (clientsRes.error) throw clientsRes.error;

      const orcamentos = orcRes.data || [];
      const clients = clientsRes.data || [];
      const followups = followupsRes.data || [];

      // This month filter
      const thisMonth = orcamentos.filter((o) => {
        const d = new Date(o.created_at!);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      // Revenue & profit (approved + emitted this month)
      const approved = thisMonth.filter((o) => o.status === "aprovado" || o.status === "emitido");
      const revenue = approved.reduce((s, o) => s + (o.valor_total || 0), 0);
      const profit = approved.reduce((s, o) => s + (o.lucro || 0), 0);
      const marginPercent = revenue > 0 ? Number(((profit / revenue) * 100).toFixed(2)) : 0;

      // Conversion
      const sentStatuses = ["enviado", "aprovado", "emitido", "perdido"];
      const totalSent = thisMonth.filter((o) => sentStatuses.includes(o.status!)).length;
      const totalApproved = approved.length;
      const conversionRate = totalSent > 0 ? Number(((totalApproved / totalSent) * 100).toFixed(1)) : 0;
      const ticketMedio = approved.length > 0 ? Math.round(revenue / approved.length) : 0;

      // Pipeline (rascunho + enviado)
      const open = orcamentos.filter((o) => o.status === "rascunho" || o.status === "enviado");
      const pipelineValue = open.reduce((s, o) => s + (o.valor_total || 0), 0);

      // Stale enviados (created > 5 days ago, still enviado)
      const staleEnviados = orcamentos.filter(
        (o) => o.status === "enviado" && o.created_at && o.created_at < fiveDaysAgo
      ).length;

      // Client counts
      const activeClients = clients.filter((c) => c.status !== "inativo").length;
      const posVendaClients = clients.filter((c) => c.status === "pos-venda").length;

      // Recurrence: clients with valor_lifetime > average_budget * 1.5
      const recurringClients = clients.filter(
        (c) => (c.valor_lifetime || 0) > (c.average_budget || 0) * 1.5
      ).length;
      const recurrenceRate = clients.length > 0 ? Math.round((recurringClients / clients.length) * 100) : 0;

      // Top clients by lifetime value
      const topClients = [...clients]
        .sort((a, b) => (b.valor_lifetime || b.average_budget || 0) - (a.valor_lifetime || a.average_budget || 0))
        .slice(0, 3)
        .map((c) => ({
          id: c.id,
          name: c.name,
          ticket_type: c.ticket_type,
          valor_lifetime: c.valor_lifetime,
          average_budget: c.average_budget,
        }));

      // Confirmed sales detail (approved/emitted this month) with client name
      const clientMap = new Map(clients.map((c) => [c.id, c.name]));
      const confirmedSales = approved.map((o) => ({
        id: o.id,
        titulo: o.titulo,
        valor_total: o.valor_total || 0,
        lucro: o.lucro || 0,
        client_name: o.client_id ? clientMap.get(o.client_id) || null : null,
      }));

      return {
        revenue,
        profit,
        marginPercent,
        conversionRate,
        ticketMedio,
        pipelineValue,
        openBudgetsCount: open.length,
        totalBudgets: orcamentos.length,
        budgetsSent: totalSent,
        budgetsApproved: totalApproved,
        activeClients,
        totalClients: clients.length,
        pendingFollowups: followups.length,
        staleEnviados,
        posVendaClients,
        recurringClients,
        recurrenceRate,
        topClients,
        confirmedSales,
      };
    },
  });
}
