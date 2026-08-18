import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MVP_USER_ID } from "@/lib/mvp-user";

export type DateMode = "venda" | "viagem";

export interface DashboardMetrics {
  revenue: number;
  profit: number;
  marginPercent: number;
  conversionRate: number;
  openBudgetsValue: number;
  openBudgetsCount: number;
}

export function useDashboardMetrics(dateMode: DateMode = "venda") {
  return useQuery({
    queryKey: ["dashboard-metrics", dateMode],
    queryFn: async (): Promise<DashboardMetrics> => {
      const { data: orcamentos, error } = await supabase
        .from("orcamentos")
        .select("valor_total, lucro, custo_total, status, created_at, data_viagem")
        .eq("company_id", MVP_USER_ID);

      if (error) throw error;

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const thisMonth = (orcamentos || []).filter((o) => {
        const dateStr = dateMode === "viagem"
          ? (o.data_viagem || o.created_at)
          : o.created_at;
        const d = new Date(dateStr);
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      });

      const approved = thisMonth.filter((o) => o.status === "aprovado" || o.status === "emitido");
      const revenue = approved.reduce((s, o) => s + (o.valor_total || 0), 0);
      const profit = approved.reduce((s, o) => s + (o.lucro || 0), 0);
      const marginPercent = revenue > 0 ? Number(((profit / revenue) * 100).toFixed(2)) : 0;

      const sentStatuses = ["enviado", "aprovado", "emitido", "perdido"];
      const totalSent = thisMonth.filter((o) => sentStatuses.includes(o.status)).length;
      const totalApproved = approved.length;
      const conversionRate = totalSent > 0 ? Number(((totalApproved / totalSent) * 100).toFixed(1)) : 0;

      const open = (orcamentos || []).filter((o) => o.status === "rascunho" || o.status === "enviado");
      const openBudgetsValue = open.reduce((s, o) => s + (o.valor_total || 0), 0);

      return {
        revenue,
        profit,
        marginPercent,
        conversionRate,
        openBudgetsValue,
        openBudgetsCount: open.length,
      };
    },
  });
}
