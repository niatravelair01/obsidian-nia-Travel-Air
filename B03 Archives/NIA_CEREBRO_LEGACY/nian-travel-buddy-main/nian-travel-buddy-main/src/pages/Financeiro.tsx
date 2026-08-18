import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { MVP_USER_ID } from "@/lib/mvp-user";
import { MainLayout } from "@/components/layout/MainLayout";
import { DollarSign, TrendingUp, Wallet, Target, Building2, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function useFinanceiroData() {
  return useQuery({
    queryKey: ["financeiro"],
    queryFn: async () => {
      const [orcRes, settingsRes] = await Promise.all([
        supabase
          .from("orcamentos")
          .select("valor_total, lucro, custo_total, status")
          .eq("company_id", MVP_USER_ID),
        supabase
          .from("company_settings")
          .select("caixa_disponivel, custos_fixos_mensais, meta_faturamento")
          .eq("company_id", MVP_USER_ID)
          .maybeSingle(),
      ]);

      if (orcRes.error) throw orcRes.error;

      const orcamentos = orcRes.data || [];

      const fechados = orcamentos.filter((o) => o.status === "aprovado" || o.status === "emitido");
      const faturamento = fechados.reduce((s, o) => s + (o.valor_total || 0), 0);
      const lucro = fechados.reduce((s, o) => s + (o.lucro || 0), 0);
      const margem = faturamento > 0 ? (lucro / faturamento) * 100 : 0;

      const emNegociacao = orcamentos.filter((o) => o.status === "enviado" || o.status === "rascunho");
      const valorNegociacao = emNegociacao.reduce((s, o) => s + (o.valor_total || 0), 0);

      const settings = settingsRes.data;
      const caixa = settings?.caixa_disponivel ?? 0;
      const custos = settings?.custos_fixos_mensais ?? 0;
      const meta = settings?.meta_faturamento ?? 0;

      const resultadoProjetado = lucro - custos;

      return { faturamento, lucro, margem, valorNegociacao, caixa, custos, meta, resultadoProjetado };
    },
  });
}

function MetricCard({ icon: Icon, label, value, accent }: { icon: any; label: string; value: string; accent?: string }) {
  return (
    <div className="surface-card rounded-xl p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={cn("text-2xl font-semibold mt-1", accent || "text-foreground")}>{value}</p>
        </div>
        <div className="p-2.5 rounded-lg bg-secondary">
          <Icon className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
}

export default function Financeiro() {
  const { data, isLoading } = useFinanceiroData();

  const healthStatus = !data ? "neutro" : data.resultadoProjetado > 0 ? "positivo" : data.resultadoProjetado < 0 ? "negativo" : "neutro";

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto space-y-8">
        <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="surface-card rounded-xl p-5 h-24 animate-pulse bg-muted/30" />
            ))}
          </div>
        ) : data ? (
          <>
            {/* BLOCO 1 — Resumo Financeiro */}
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Resumo Financeiro</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard icon={DollarSign} label="Faturamento Total" value={formatCurrency(data.faturamento)} />
                <MetricCard icon={TrendingUp} label="Lucro Total" value={formatCurrency(data.lucro)} accent="text-emerald-400" />
                <MetricCard icon={Wallet} label="Margem Média" value={`${data.margem.toFixed(1)}%`} />
                <MetricCard icon={Target} label="Em Negociação" value={formatCurrency(data.valorNegociacao)} accent="text-amber-400" />
              </div>
            </section>

            {/* BLOCO 2 — Caixa da Empresa */}
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Caixa da Empresa</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <MetricCard icon={Building2} label="Caixa Atual" value={formatCurrency(data.caixa)} />
                <MetricCard icon={Wallet} label="Custos Fixos Mensais" value={formatCurrency(data.custos)} />
                <MetricCard icon={Target} label="Meta Mensal" value={formatCurrency(data.meta)} />
              </div>
            </section>

            {/* BLOCO 3 — Saúde Financeira */}
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Saúde Financeira</h2>
              <div className={cn(
                "surface-card rounded-xl p-6 border-l-4",
                healthStatus === "positivo" && "border-l-emerald-400",
                healthStatus === "negativo" && "border-l-red-400",
                healthStatus === "neutro" && "border-l-amber-400",
              )}>
                <div className="flex items-center gap-3">
                  {healthStatus === "positivo" && <ArrowUpRight className="h-6 w-6 text-emerald-400" />}
                  {healthStatus === "negativo" && <ArrowDownRight className="h-6 w-6 text-red-400" />}
                  {healthStatus === "neutro" && <Minus className="h-6 w-6 text-amber-400" />}
                  <div>
                    <p className="text-sm text-muted-foreground">Resultado Projetado (Lucro − Custos Fixos)</p>
                    <p className={cn(
                      "text-2xl font-bold mt-1",
                      healthStatus === "positivo" && "text-emerald-400",
                      healthStatus === "negativo" && "text-red-400",
                      healthStatus === "neutro" && "text-amber-400",
                    )}>
                      {formatCurrency(data.resultadoProjetado)}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {healthStatus === "positivo" && "Sua operação está gerando resultado positivo acima dos custos fixos."}
                  {healthStatus === "negativo" && "Atenção: os custos fixos estão superando o lucro atual."}
                  {healthStatus === "neutro" && "O resultado está equilibrado. Busque aumentar margem ou reduzir custos."}
                </p>
              </div>
            </section>
          </>
        ) : null}
      </div>
    </MainLayout>
  );
}
