// ═══════════════════════════════════════════════════════════════════════════════
// MOTOR DE MARGEM E PROTEÇÃO FINANCEIRA — NIA TRAVEL AIR
//
// Política Oficial de Margem:
//   - Piso absoluto: 10%
//   - Recomendada ideal: 12%–18%
//   - Saudável estratégica: ≥ 15%
//
// A NIA NUNCA sugere margem inferior a 10%.
// A NIA ALERTA, CLASSIFICA e ORIENTA.
// Sem bloqueios automáticos. Decisão final sempre humana.
// ═══════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────────
// TIPOS E CLASSIFICAÇÕES
// ────────────────────────────────────────────────────────────────────────────────

export type MarginClassification =
  | "alerta_vermelho"   // < 10%
  | "limite_operacional" // 10%–11%
  | "aceitavel"          // 12%–14%
  | "saudavel";          // ≥ 15%

export type OperationRiskType = "baixo" | "medio" | "alto" | "critico";

export interface MarginAnalysis {
  margin: number;
  classification: MarginClassification;
  label: string;
  color: string;
  alerts: MarginAlert[];
  suggestions: string[];
}

export interface MarginAlert {
  id: string;
  type: "margin" | "installment" | "chargeback" | "operational" | "pattern";
  severity: "info" | "warning" | "critical";
  message: string;
  recommendation: string;
}

export interface ProfitCalculation {
  finalPrice: number;
  realCost: number;
  fees: number;
  installmentCost: number;
  realProfit: number;
  marginPercentage: number;
  classification: MarginClassification;
  operationRiskType: OperationRiskType;
}

export interface SmartMarginSuggestion {
  idealMargin: number;
  adjustedForRisk: number;
  adjustedForComplexity: number;
  adjustedForClientProfile: number;
  finalSuggested: number;
  reasoning: string[];
}

// ────────────────────────────────────────────────────────────────────────────────
// CONSTANTES
// ────────────────────────────────────────────────────────────────────────────────

export const MARGIN_POLICY = {
  ABSOLUTE_FLOOR: 10,
  RECOMMENDED_MIN: 12,
  RECOMMENDED_MAX: 18,
  HEALTHY_THRESHOLD: 15,
  MAX_INSTALLMENTS_SAFE: 6,
} as const;

// ────────────────────────────────────────────────────────────────────────────────
// CLASSIFICAÇÃO DE MARGEM
// ────────────────────────────────────────────────────────────────────────────────

export function classifyMargin(marginPercentage: number): MarginClassification {
  if (marginPercentage < MARGIN_POLICY.ABSOLUTE_FLOOR) return "alerta_vermelho";
  if (marginPercentage < 12) return "limite_operacional";
  if (marginPercentage < MARGIN_POLICY.HEALTHY_THRESHOLD) return "aceitavel";
  return "saudavel";
}

export function getMarginLabel(classification: MarginClassification): string {
  const labels: Record<MarginClassification, string> = {
    alerta_vermelho: "🔴 Alerta Vermelho",
    limite_operacional: "🟠 Limite Operacional",
    aceitavel: "🟡 Aceitável",
    saudavel: "🟢 Saudável",
  };
  return labels[classification];
}

export function getMarginColor(classification: MarginClassification): string {
  const colors: Record<MarginClassification, string> = {
    alerta_vermelho: "text-red-500",
    limite_operacional: "text-orange-500",
    aceitavel: "text-yellow-500",
    saudavel: "text-emerald-500",
  };
  return colors[classification];
}

export function getMarginBgColor(classification: MarginClassification): string {
  const colors: Record<MarginClassification, string> = {
    alerta_vermelho: "bg-red-500/10 border-red-500/30",
    limite_operacional: "bg-orange-500/10 border-orange-500/30",
    aceitavel: "bg-yellow-500/10 border-yellow-500/30",
    saudavel: "bg-emerald-500/10 border-emerald-500/30",
  };
  return colors[classification];
}

// ────────────────────────────────────────────────────────────────────────────────
// CÁLCULO DE LUCRO REAL (BLOCO 6)
// ────────────────────────────────────────────────────────────────────────────────

export function calculateRealProfit(params: {
  finalPrice: number;
  realCost: number;
  fees?: number;
  installments?: number;
  installmentFeeRate?: number; // taxa por parcela (ex: 0.0199 para 1.99%/mês)
}): ProfitCalculation {
  const { finalPrice, realCost, fees = 0, installments = 1, installmentFeeRate = 0 } = params;

  // Custo do parcelamento: aproximação simples
  const installmentCost =
    installments > 1 && installmentFeeRate > 0
      ? finalPrice * installmentFeeRate * (installments - 1)
      : 0;

  const realProfit = finalPrice - realCost - fees - installmentCost;
  const marginPercentage = finalPrice > 0 ? (realProfit / finalPrice) * 100 : 0;
  const classification = classifyMargin(marginPercentage);

  // Determinar tipo de risco da operação
  let operationRiskType: OperationRiskType = "baixo";
  if (marginPercentage < 0) operationRiskType = "critico";
  else if (marginPercentage < MARGIN_POLICY.ABSOLUTE_FLOOR) operationRiskType = "alto";
  else if (marginPercentage < MARGIN_POLICY.RECOMMENDED_MIN) operationRiskType = "medio";

  return {
    finalPrice,
    realCost,
    fees,
    installmentCost: Math.round(installmentCost * 100) / 100,
    realProfit: Math.round(realProfit * 100) / 100,
    marginPercentage: Math.round(marginPercentage * 100) / 100,
    classification,
    operationRiskType,
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// ANÁLISE COMPLETA DE MARGEM COM ALERTAS (BLOCOS 1-5)
// ────────────────────────────────────────────────────────────────────────────────

export function analyzeMargin(params: {
  marginPercentage: number;
  installments?: number;
  daysUntilTrip?: number;
  paymentMethod?: "pix" | "transferencia" | "cartao_credito" | "cartao_debito" | "boleto";
  isNewClient?: boolean;
  hasWrittenConfirmation?: boolean;
  hasPaymentConfirmed?: boolean;
  dataVerified?: boolean; // nome, data, aeroporto, tarifa conferidos
  checklistComplete?: boolean;
  clientTrusted?: boolean;
}): MarginAnalysis {
  const {
    marginPercentage,
    installments = 1,
    daysUntilTrip,
    paymentMethod,
    isNewClient = false,
    hasWrittenConfirmation = true,
    hasPaymentConfirmed = true,
    dataVerified = true,
    checklistComplete = true,
    clientTrusted = false,
  } = params;

  const classification = classifyMargin(marginPercentage);
  const alerts: MarginAlert[] = [];
  const suggestions: string[] = [];

  // BLOCO 1 — Alertas de margem
  if (marginPercentage < MARGIN_POLICY.ABSOLUTE_FLOOR) {
    alerts.push({
      id: "margin_below_floor",
      type: "margin",
      severity: "critical",
      message: `Margem de ${marginPercentage.toFixed(1)}% está ABAIXO do piso absoluto de ${MARGIN_POLICY.ABSOLUTE_FLOOR}%.`,
      recommendation: "Recomendação estratégica: revisar precificação antes de prosseguir.",
    });
  } else if (marginPercentage < MARGIN_POLICY.RECOMMENDED_MIN) {
    alerts.push({
      id: "margin_below_recommended",
      type: "margin",
      severity: "warning",
      message: `Margem de ${marginPercentage.toFixed(1)}% está abaixo do mínimo recomendado de ${MARGIN_POLICY.RECOMMENDED_MIN}%.`,
      recommendation: "Considere ajustar o preço para atingir pelo menos 12% de margem.",
    });
  }

  // BLOCO 2 — Parcelamento > 6x
  if (installments > MARGIN_POLICY.MAX_INSTALLMENTS_SAFE) {
    alerts.push({
      id: "excessive_installments",
      type: "installment",
      severity: "warning",
      message: `Parcelamento em ${installments}x excede o limite seguro de ${MARGIN_POLICY.MAX_INSTALLMENTS_SAFE}x.`,
      recommendation: "Risco financeiro elevado. Considere reduzir parcelas ou exigir entrada maior.",
    });
  }

  // BLOCO 3 — Regra dos 7 dias (chargeback)
  if (daysUntilTrip !== undefined && daysUntilTrip < 7 && paymentMethod === "cartao_credito") {
    const severity = clientTrusted ? "warning" : "critical";
    alerts.push({
      id: "chargeback_7_days",
      type: "chargeback",
      severity,
      message: `Embarque em ${daysUntilTrip} dia(s) com pagamento em cartão — risco ELEVADO de chargeback.`,
      recommendation: clientTrusted
        ? "Cliente confiável, mas recomenda-se PIX. Exceção permitida com cautela."
        : "Recomendação: pagamento via PIX. Cartão apenas com documentação completa.",
    });
  }

  // BLOCO 4 — Confirmação antes da emissão
  if (!hasPaymentConfirmed) {
    alerts.push({
      id: "no_payment_confirmation",
      type: "operational",
      severity: "critical",
      message: "Pagamento NÃO confirmado. Emissão proibida sem pagamento.",
      recommendation: "Aguarde confirmação de pagamento antes de qualquer emissão.",
    });
  }

  if (!hasWrittenConfirmation) {
    alerts.push({
      id: "no_written_confirmation",
      type: "operational",
      severity: "critical",
      message: "Sem confirmação escrita do cliente. Emissão proibida.",
      recommendation: "Obtenha confirmação escrita (e-mail, WhatsApp) antes de emitir.",
    });
  }

  if (!dataVerified) {
    alerts.push({
      id: "data_not_verified",
      type: "operational",
      severity: "warning",
      message: "Dados não conferidos (nome, data, aeroporto, tarifa).",
      recommendation: "Confira todos os dados antes de emitir para evitar reemissão.",
    });
  }

  // BLOCO 5 — Checklist pré-emissão
  if (!checklistComplete) {
    alerts.push({
      id: "checklist_incomplete",
      type: "operational",
      severity: "warning",
      message: "Checklist pré-emissão não está completamente preenchido.",
      recommendation: "Revise o checklist antes de prosseguir com a emissão.",
    });
  }

  // BLOCO 10 — Recusa estratégica
  if (
    marginPercentage < MARGIN_POLICY.ABSOLUTE_FLOOR &&
    alerts.some((a) => a.type === "chargeback" && a.severity === "critical")
  ) {
    suggestions.push(
      "Recomendação estratégica: não executar operação. Margem abaixo do piso + risco elevado de chargeback."
    );
  } else if (marginPercentage < MARGIN_POLICY.ABSOLUTE_FLOOR) {
    suggestions.push(
      "Recomendação: revisar precificação. Margem atual não sustenta a operação."
    );
  }

  if (classification === "saudavel") {
    suggestions.push("Operação com margem saudável. Boa para executar.");
  }

  return {
    margin: marginPercentage,
    classification,
    label: getMarginLabel(classification),
    color: getMarginColor(classification),
    alerts,
    suggestions,
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// SUGESTÃO INTELIGENTE DE MARGEM (BLOCO 8)
// ────────────────────────────────────────────────────────────────────────────────

export function suggestSmartMargin(params: {
  historicalAvgMargin?: number;
  operationalRiskLevel?: "baixo" | "medio" | "alto";
  complexity?: "simples" | "moderada" | "complexa";
  clientProfile?: "novo" | "recorrente" | "vip";
}): SmartMarginSuggestion {
  const {
    historicalAvgMargin = MARGIN_POLICY.HEALTHY_THRESHOLD,
    operationalRiskLevel = "baixo",
    complexity = "simples",
    clientProfile = "recorrente",
  } = params;

  const reasoning: string[] = [];

  // Base: histórico ou ideal
  let idealMargin = Math.max(historicalAvgMargin, MARGIN_POLICY.RECOMMENDED_MIN);
  reasoning.push(`Base histórica: ${historicalAvgMargin.toFixed(1)}%`);

  // Ajuste por risco operacional
  let riskAdjustment = 0;
  if (operationalRiskLevel === "alto") {
    riskAdjustment = 3;
    reasoning.push("+3% por risco operacional alto");
  } else if (operationalRiskLevel === "medio") {
    riskAdjustment = 1.5;
    reasoning.push("+1.5% por risco operacional médio");
  }

  // Ajuste por complexidade
  let complexityAdjustment = 0;
  if (complexity === "complexa") {
    complexityAdjustment = 2;
    reasoning.push("+2% por complexidade alta");
  } else if (complexity === "moderada") {
    complexityAdjustment = 1;
    reasoning.push("+1% por complexidade moderada");
  }

  // Ajuste por perfil do cliente
  let clientAdjustment = 0;
  if (clientProfile === "novo") {
    clientAdjustment = 1;
    reasoning.push("+1% por cliente novo (sem histórico)");
  } else if (clientProfile === "vip") {
    clientAdjustment = -1;
    reasoning.push("-1% por cliente VIP recorrente");
  }

  const finalSuggested = Math.max(
    MARGIN_POLICY.ABSOLUTE_FLOOR,
    idealMargin + riskAdjustment + complexityAdjustment + clientAdjustment
  );

  reasoning.push(`Margem sugerida final: ${finalSuggested.toFixed(1)}%`);

  return {
    idealMargin: Math.round(idealMargin * 10) / 10,
    adjustedForRisk: Math.round(riskAdjustment * 10) / 10,
    adjustedForComplexity: Math.round(complexityAdjustment * 10) / 10,
    adjustedForClientProfile: Math.round(clientAdjustment * 10) / 10,
    finalSuggested: Math.round(finalSuggested * 10) / 10,
    reasoning,
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// ANÁLISE DE PADRÃO MENSAL (BLOCO 7)
// ────────────────────────────────────────────────────────────────────────────────

export interface MonthlyPatternAnalysis {
  avgMargin: number;
  lowMarginCount: number;
  totalSales: number;
  lowMarginPercentage: number;
  trend: "positiva" | "estavel" | "negativa";
  alerts: string[];
  recommendation: string;
}

export function analyzeMonthlyPattern(sales: Array<{
  margin: number;
  value: number;
  riskLevel?: OperationRiskType;
}>): MonthlyPatternAnalysis {
  if (sales.length === 0) {
    return {
      avgMargin: 0,
      lowMarginCount: 0,
      totalSales: 0,
      lowMarginPercentage: 0,
      trend: "estavel",
      alerts: [],
      recommendation: "Sem dados suficientes para análise.",
    };
  }

  const avgMargin = sales.reduce((sum, s) => sum + s.margin, 0) / sales.length;
  const lowMarginSales = sales.filter((s) => s.margin < MARGIN_POLICY.RECOMMENDED_MIN);
  const lowMarginPercentage = (lowMarginSales.length / sales.length) * 100;

  const alerts: string[] = [];

  // Padrão de vendas com margem baixa
  if (lowMarginPercentage > 50) {
    alerts.push(
      `${lowMarginPercentage.toFixed(0)}% das vendas estão com margem abaixo de ${MARGIN_POLICY.RECOMMENDED_MIN}%. Tendência preocupante.`
    );
  }

  // Repetição de risco estratégico
  const highRiskSales = sales.filter((s) => s.riskLevel === "alto" || s.riskLevel === "critico");
  if (highRiskSales.length > 2) {
    alerts.push(
      `${highRiskSales.length} vendas de alto risco no período. Padrão de risco recorrente detectado.`
    );
  }

  // Tendência
  let trend: "positiva" | "estavel" | "negativa" = "estavel";
  if (avgMargin >= MARGIN_POLICY.HEALTHY_THRESHOLD && lowMarginPercentage < 20) {
    trend = "positiva";
  } else if (avgMargin < MARGIN_POLICY.ABSOLUTE_FLOOR || lowMarginPercentage > 60) {
    trend = "negativa";
  }

  // Recomendação
  let recommendation = "";
  if (trend === "negativa") {
    recommendation = `Margem média de ${avgMargin.toFixed(1)}% está abaixo do saudável. Recomendo revisar a precificação geral e priorizar operações com margem ≥ ${MARGIN_POLICY.HEALTHY_THRESHOLD}%.`;
  } else if (trend === "estavel") {
    recommendation = `Margem média de ${avgMargin.toFixed(1)}%. Estável, mas há espaço para otimização. Mire em ${MARGIN_POLICY.HEALTHY_THRESHOLD}%+.`;
  } else {
    recommendation = `Margem média de ${avgMargin.toFixed(1)}%. Operação saudável e sustentável. Continue priorizando qualidade sobre volume.`;
  }

  return {
    avgMargin: Math.round(avgMargin * 10) / 10,
    lowMarginCount: lowMarginSales.length,
    totalSales: sales.length,
    lowMarginPercentage: Math.round(lowMarginPercentage * 10) / 10,
    trend,
    alerts,
    recommendation,
  };
}
