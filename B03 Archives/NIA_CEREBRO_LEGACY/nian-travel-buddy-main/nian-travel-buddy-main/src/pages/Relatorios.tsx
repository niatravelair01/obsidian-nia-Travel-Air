import { MainLayout } from "@/components/layout/MainLayout";
import { MobileLayout, MobileReports } from "@/components/mobile";
import { useIsMobile } from "@/hooks/use-mobile";
import { useState, useEffect, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { BarChart3, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, ArrowRight, DollarSign, MapPin, Users, RefreshCcw, Lightbulb, AlertCircle, Info, Activity, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { NiaAvatar } from "@/components/nia/NiaAvatar";
import {
  RevenueDonutChart,
  BottlenecksHorizontalChart,
  RiskSemaphoreChart,
  ConversionLineChart,
  PriorityActionsList
} from "@/components/reports";
import { useReportMetrics } from "@/hooks/useReportMetrics";
import { formatCurrency } from "@/hooks/useClients";

// ═══════════════════════════════════════════════════════════════════════════════
// INTERPRETAÇÕES ESTRATÉGICAS DA NIA
// ═══════════════════════════════════════════════════════════════════════════════

const generateNiaInterpretations = (data: {
  taxaConversao: number;
  faturamentoMesAtual: number;
  margemLucro: number;
  ticketMedio: number;
  orcamentosEnviados: number;
  orcamentosAceitos: number;
  followupsPendentes: number;
  valorPipeline: number;
  recurringClients: number;
  totalClients: number;
  recurrenceRate: number;
}) => {
  const visaoGeral = {
    resumo: (() => {
      const criticalItems = data.followupsPendentes;
      if (criticalItems >= 3) {
        return `Sua operação está com sinais de atenção. Há ${criticalItems} follow-ups pendentes que representam risco de perda. Priorize a recuperação de clientes em negociação antes de buscar novos leads.`;
      } else if (criticalItems >= 2) {
        return `Operação com pontos de atenção. Existem ${criticalItems} follow-ups pendentes que representam risco de perda. Recomendo priorizar esses contatos hoje.`;
      } else if (data.faturamentoMesAtual > 0) {
        return `Operação saudável. Os indicadores estão dentro do esperado. Foque em manter a qualidade do atendimento e aproveite para fortalecer relacionamentos com clientes existentes.`;
      } else {
        return `Ainda sem faturamento neste mês. Crie orçamentos e acompanhe seus leads para gerar receita.`;
      }
    })(),
    alertas: (() => {
      const alerts: string[] = [];
      if (data.followupsPendentes >= 2) {
        alerts.push(`${data.followupsPendentes} clientes aguardando retorno`);
      }
      if (data.margemLucro > 0 && data.margemLucro < 12) {
        alerts.push(`Margem de lucro abaixo do ideal (${data.margemLucro}%)`);
      }
      if (data.valorPipeline > data.faturamentoMesAtual * 0.8 && data.valorPipeline > 0) {
        alerts.push(`Pipeline alto (${formatCurrency(data.valorPipeline)}) parado — risco de perda`);
      }
      return alerts;
    })()
  };

  const faturamento = (() => {
    const margemBoa = data.margemLucro >= 15;
    if (data.faturamentoMesAtual === 0) {
      return `Ainda sem faturamento este mês. Foque em converter orçamentos enviados e acompanhar leads ativos.`;
    } else if (!margemBoa && data.margemLucro > 0) {
      return `A margem de ${data.margemLucro}% está abaixo do ideal. Verifique se não está sacrificando lucro para fechar vendas. Ticket médio de ${formatCurrency(data.ticketMedio)}.`;
    } else {
      return `Faturamento com margem saudável de ${data.margemLucro}%. Ticket médio de ${formatCurrency(data.ticketMedio)} indica perfil de cliente consistente.`;
    }
  })();

  const conversao = (() => {
    if (data.orcamentosEnviados === 0) {
      return `Nenhum orçamento enviado neste período. Crie e envie orçamentos para começar a medir conversão.`;
    } else if (data.taxaConversao < 20) {
      return `Taxa de conversão de ${data.taxaConversao}% está abaixo do esperado. Possíveis causas: tempo de resposta longo, orçamentos desalinhados ou follow-up insuficiente.`;
    } else {
      return `Conversão estável em ${data.taxaConversao}%. Para aumentar, foque em reduzir tempo de resposta e personalizar propostas.`;
    }
  })();

  const recorrencia = (() => {
    if (data.totalClients === 0) return `Ainda sem clientes cadastrados. Adicione clientes para acompanhar recorrência.`;
    if (data.recurrenceRate < 15) {
      return `Apenas ${data.recurrenceRate}% dos clientes são recorrentes. Considere implementar ações de relacionamento pós-viagem.`;
    } else if (data.recurrenceRate >= 30) {
      return `${data.recurrenceRate}% de clientes recorrentes indica base saudável. Priorize mantê-los.`;
    } else {
      return `Taxa de recorrência em ${data.recurrenceRate}% — espaço para crescimento. Invista em contato pós-viagem.`;
    }
  })();

  return { visaoGeral, faturamento, conversao, recorrencia };
};

export default function Relatorios() {
  const isMobile = useIsMobile();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const tabFromUrl = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState(tabFromUrl || "geral");
  const { data: m, isLoading } = useReportMetrics();

  useEffect(() => {
    if (tabFromUrl && ["geral", "conversao", "faturamento", "recorrentes", "insights"].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    }
  }, [tabFromUrl]);

  const niaInterpretations = useMemo(() => {
    if (!m) return null;
    return generateNiaInterpretations({
      taxaConversao: m.conversionRate,
      faturamentoMesAtual: m.revenue,
      margemLucro: m.marginPercent,
      ticketMedio: m.ticketMedio,
      orcamentosEnviados: m.budgetsSent,
      orcamentosAceitos: m.budgetsApproved,
      followupsPendentes: m.pendingFollowups,
      valorPipeline: m.pipelineValue,
      recurringClients: m.recurringClients,
      totalClients: m.totalClients,
      recurrenceRate: m.recurrenceRate,
    });
  }, [m]);

  if (isMobile) {
    return (
      <MobileLayout>
        <MobileReports />
      </MobileLayout>
    );
  }

  if (isLoading || !m || !niaInterpretations) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-accent" />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-accent" />
            Relatórios
          </h1>
          <p className="text-muted-foreground mt-1">
            Leitura estratégica do desempenho da sua agência
          </p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 max-w-4xl">
            <TabsTrigger value="geral" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              <span className="hidden sm:inline">Relatórios</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              <span className="hidden sm:inline">Insights</span>
            </TabsTrigger>
            <TabsTrigger value="conversao" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              <span className="hidden sm:inline">Conversão</span>
            </TabsTrigger>
            <TabsTrigger value="faturamento" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              <span className="hidden sm:inline">Faturamento</span>
            </TabsTrigger>
            <TabsTrigger value="recorrentes" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Recorrentes</span>
            </TabsTrigger>
          </TabsList>

          {/* Visão Geral Tab */}
          <TabsContent value="geral" className="space-y-6">
            <Card className="border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <NiaAvatar size="md" />
                  <div>
                    <CardTitle className="text-lg">Leitura da N.IA — Visão Geral</CardTitle>
                    <CardDescription>Resumo estratégico da saúde do seu negócio</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">
                  {niaInterpretations.visaoGeral.resumo}
                </p>
              </CardContent>
            </Card>

            {niaInterpretations.visaoGeral.alertas.length > 0 && (
              <Card className="border-amber-500/30 bg-amber-500/5">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5 text-amber-500" />
                    Alertas Ativos
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {niaInterpretations.visaoGeral.alertas.map((alerta, index) => (
                      <li key={index} className="flex items-start gap-2 text-sm text-foreground">
                        <span className="text-amber-500 mt-0.5">•</span>
                        {alerta}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-accent">{formatCurrency(m.revenue)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Faturamento do mês</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{m.conversionRate}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Taxa de conversão</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{m.marginPercent}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Margem de lucro</p>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{formatCurrency(m.pipelineValue)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Pipeline em negociação</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Próximos Passos Sugeridos</CardTitle>
                <CardDescription>Ações recomendadas pela N.IA baseadas nos dados atuais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {m.pendingFollowups > 0 && (
                    <div
                      onClick={() => navigate("/followups?status=pendente")}
                      className="flex items-center gap-3 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg cursor-pointer hover:bg-amber-500/15 transition-colors"
                    >
                      <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Retomar {m.pendingFollowups} follow-up(s) pendente(s)</p>
                        <p className="text-xs text-muted-foreground">Clientes aguardando retorno</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  {m.pipelineValue > 0 && (
                    <div
                      onClick={() => navigate("/orcamentos?status=enviado")}
                      className="flex items-center gap-3 p-3 bg-accent/10 border border-accent/20 rounded-lg cursor-pointer hover:bg-accent/15 transition-colors"
                    >
                      <DollarSign className="h-5 w-5 text-accent shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Pipeline de {formatCurrency(m.pipelineValue)} aguardando fechamento</p>
                        <p className="text-xs text-muted-foreground">Priorize orçamentos de maior valor</p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  )}
                  <div
                    onClick={() => setActiveTab("insights")}
                    className="flex items-center gap-3 p-3 bg-secondary rounded-lg cursor-pointer hover:bg-secondary/80 transition-colors"
                  >
                    <Lightbulb className="h-5 w-5 text-accent shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">Ver análise detalhada na aba Insights</p>
                      <p className="text-xs text-muted-foreground">Recomendações específicas da N.IA</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <p className="text-xs text-muted-foreground text-center italic">
              A N.IA interpreta dados e sugere ações, mas a decisão final é sempre sua.
            </p>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <Card className="border-accent/30 bg-gradient-to-br from-accent/10 via-accent/5 to-transparent">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <NiaAvatar size="md" />
                  <div>
                    <CardTitle className="text-lg">Painel Executivo da N.IA</CardTitle>
                    <CardDescription>Análise visual estratégica da sua operação</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">
                  Cada gráfico responde uma pergunta diferente sobre seu negócio.
                  Clique nos CTAs para ir direto ao ponto de ação.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <RevenueDonutChart
                confirmedRevenue={m.revenue}
                negotiatingRevenue={m.pipelineValue}
                atRiskRevenue={Math.round(m.pipelineValue * 0.3)}
              />
              <BottlenecksHorizontalChart
                followupsAtrasados={m.pendingFollowups}
                orcamentosParados={m.staleEnviados}
                posVendaPendente={m.posVendaClients || 0}
              />
              <RiskSemaphoreChart
                lowRiskCount={m.budgetsApproved}
                mediumRiskCount={Math.max(0, m.staleEnviados - Math.floor(m.staleEnviados / 2))}
                highRiskCount={Math.floor(m.staleEnviados / 2)}
              />
              <ConversionLineChart />
              <PriorityActionsList />
            </div>

            <Card className="border-accent/20">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-accent" />
                  Recomendação Geral
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">
                  {m.pendingFollowups > 2 ? (
                    <>
                      <span className="font-medium text-red-400">Atenção imediata necessária.</span> Você tem{" "}
                      {m.pendingFollowups} follow-ups pendentes que podem impactar diretamente seu faturamento.
                    </>
                  ) : m.pendingFollowups > 0 ? (
                    <>
                      <span className="font-medium text-amber-400">Pontos de atenção identificados.</span> Sua operação
                      está saudável, mas há oportunidades de melhoria.
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-green-400">Operação saudável.</span> Continue monitorando seus
                      indicadores e mantenha o ritmo de atendimento atual.
                    </>
                  )}
                </p>
                <p className="text-xs text-muted-foreground mt-4 italic">
                  Esta análise é atualizada automaticamente com base nos dados da sua agência.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conversion Tab */}
          <TabsContent value="conversao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Taxa de Conversão — Mês Atual</CardTitle>
                <CardDescription>Funil de vendas real</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <p className="text-3xl font-bold text-blue-500">{m.budgetsSent}</p>
                    <p className="text-sm text-muted-foreground mt-1">Orçamentos enviados</p>
                  </div>
                  <div className="text-center p-4 bg-secondary rounded-lg">
                    <p className="text-3xl font-bold text-green-500">{m.budgetsApproved}</p>
                    <p className="text-sm text-muted-foreground mt-1">Aprovados / Emitidos</p>
                  </div>
                  <div className="text-center p-4 bg-accent/10 border border-accent/30 rounded-lg">
                    <p className="text-3xl font-bold text-accent">{m.conversionRate}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Taxa de conversão</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-accent/30 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <NiaAvatar size="sm" />
                  Leitura da N.IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">
                  {niaInterpretations.conversao}
                </p>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  A N.IA interpreta padrões e sugere ações, mas a decisão final é sempre sua.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Faturamento Tab */}
          <TabsContent value="faturamento" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Faturamento Mensal</CardTitle>
                <CardDescription>Evolução e comparativo de receita</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="text-center p-6 bg-accent/10 border border-accent/30 rounded-lg">
                    <p className="text-3xl font-bold text-accent">{formatCurrency(m.revenue)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Faturamento atual</p>
                  </div>
                  <div className="text-center p-6 bg-secondary rounded-lg">
                    <p className="text-3xl font-bold text-foreground">{formatCurrency(m.ticketMedio)}</p>
                    <p className="text-sm text-muted-foreground mt-1">Ticket médio</p>
                  </div>
                  <div className="text-center p-6 bg-secondary rounded-lg">
                    <p className="text-3xl font-bold text-foreground">{m.marginPercent}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Margem de lucro</p>
                  </div>
                </div>

                {m.confirmedSales.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Vendas Confirmadas</h4>
                    {m.confirmedSales.map((sale) => (
                      <div key={sale.id} className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{sale.titulo || "Sem título"}</p>
                          {sale.client_name && <p className="text-sm text-muted-foreground">{sale.client_name}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-500">{formatCurrency(sale.valor_total)}</p>
                          <p className="text-xs text-muted-foreground">Lucro: {formatCurrency(sale.lucro)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-accent/30 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <NiaAvatar size="sm" />
                  Leitura da N.IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">
                  {niaInterpretations.faturamento}
                </p>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  A N.IA interpreta dados e aponta tendências, mas a decisão final é sempre sua.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recorrentes Tab */}
          <TabsContent value="recorrentes" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <RefreshCcw className="h-5 w-5 text-accent" />
                  Clientes Recorrentes
                </CardTitle>
                <CardDescription>Análise de fidelização e recompra</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="text-center p-6 bg-secondary rounded-lg">
                    <p className="text-3xl font-bold text-foreground">{m.recurringClients}</p>
                    <p className="text-sm text-muted-foreground mt-1">Clientes recorrentes</p>
                  </div>
                  <div className="text-center p-6 bg-secondary rounded-lg">
                    <p className="text-3xl font-bold text-foreground">{m.recurrenceRate}%</p>
                    <p className="text-sm text-muted-foreground mt-1">Taxa de recompra</p>
                  </div>
                </div>

                {m.topClients.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="font-medium text-foreground">Clientes com Maior Valor Lifetime</h4>
                    {m.topClients.map((client) => (
                      <div key={client.id} className="flex items-center justify-between p-3 bg-secondary rounded-lg">
                        <div>
                          <p className="font-medium text-foreground">{client.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {client.ticket_type === "premium" ? "Premium" : client.ticket_type === "alto" ? "Alto Ticket" : "Médio Ticket"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-accent">{formatCurrency(client.valor_lifetime || client.average_budget)}</p>
                          <p className="text-xs text-muted-foreground">Valor lifetime</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-accent/30 bg-accent/5">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <NiaAvatar size="sm" />
                  Leitura da N.IA
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-foreground leading-relaxed">
                  {niaInterpretations.recorrencia}
                </p>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  A N.IA analisa a saúde da sua base de clientes, mas a decisão final é sempre sua.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
