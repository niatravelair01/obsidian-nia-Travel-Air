// ═══════════════════════════════════════════════════════════════════════════════
// ANÁLISE DE RISCO — BLINDAGEM FINANCEIRA
// 
// FOCO PRIMÁRIO: Chargeback
// FOCO SECUNDÁRIO: Risco Operacional e Risco Financeiro
// 
// A NIA atua como:
//   - Analista de risco
//   - Guardiã do caixa
//   - Sócia que evita prejuízo silencioso
//
// Ela ALERTA, CLASSIFICA e RECOMENDA.
// Ela NÃO bloqueia automaticamente.
// O USUÁRIO sempre decide.
// ═══════════════════════════════════════════════════════════════════════════════

export type RiskLevel = "baixo" | "medio" | "alto";
export type RiskCategory = "chargeback" | "operacional" | "financeiro" | "cliente";

export interface RiskFactor {
  id: string;
  name: string;
  description: string;
  impact: RiskLevel;
  category: RiskCategory;
  financialExposure?: number; // valor em risco
}

export interface RiskAssessment {
  overallLevel: RiskLevel;
  chargebackRisk: RiskLevel;
  operationalRisk: RiskLevel;
  financialRisk: RiskLevel;
  factors: RiskFactor[];
  recommendations: string[];
  financialImpact: number;
  summary: string;
  explanation: string; // por que o risco existe
}

export interface BudgetRiskInput {
  clientIsNew: boolean;
  clientHistoryValue?: number;
  budgetValue: number;
  daysUntilTrip: number;
  paymentMethod: "pix" | "transferencia" | "cartao_credito" | "cartao_debito" | "boleto";
  hasSignedContract: boolean;
  clientExpectationsAligned: boolean;
  clientUrgency: "baixa" | "normal" | "alta" | "extrema";
  isFirstPurchase: boolean;
  marginPercentage?: number;
  hasThirdPartyDependency?: boolean;
  dataComplete?: boolean;
  deadlineTight?: boolean;
  clientConcentration?: number; // % de receita deste cliente
  installments?: number; // número de parcelas
}

// ────────────────────────────────────────────────────────────────────────────────
// FATORES DE RISCO — CHARGEBACK (Prioridade Máxima)
// ────────────────────────────────────────────────────────────────────────────────

const CHARGEBACK_RISK_FACTORS: Record<string, RiskFactor> = {
  TRIP_UNDER_7_DAYS: {
    id: "trip_under_7_days",
    name: "Viagem em menos de 7 dias",
    description: "Viagens muito próximas têm alto risco de chargeback por arrependimento",
    impact: "alto",
    category: "chargeback",
  },
  PAYMENT_WITH_CHARGEBACK_RIGHTS: {
    id: "payment_chargeback_rights",
    name: "Pagamento com direito de arrependimento",
    description: "Cartão de crédito permite contestação até 120 dias após a compra",
    impact: "alto",
    category: "chargeback",
  },
  NEW_CLIENT: {
    id: "new_client",
    name: "Cliente novo sem histórico",
    description: "Clientes sem histórico são mais propensos a contestar cobranças",
    impact: "medio",
    category: "chargeback",
  },
  HIGH_VALUE_FIRST_PURCHASE: {
    id: "high_value_first",
    name: "Valor elevado para primeira compra",
    description: "Primeira compra com valor alto (acima de R$10.000) aumenta risco de arrependimento",
    impact: "alto",
    category: "chargeback",
  },
  EXPECTATIONS_MISALIGNED: {
    id: "expectations_misaligned",
    name: "Expectativa desalinhada",
    description: "Cliente pode se frustrar e contestar se expectativas não forem claras",
    impact: "alto",
    category: "chargeback",
  },
  EXCESSIVE_URGENCY: {
    id: "excessive_urgency",
    name: "Urgência excessiva para emissão",
    description: "Pressão para emitir rápido pode indicar decisão impulsiva",
    impact: "medio",
    category: "chargeback",
  },
};

// ────────────────────────────────────────────────────────────────────────────────
// FATORES DE RISCO — OPERACIONAL
// ────────────────────────────────────────────────────────────────────────────────

const OPERATIONAL_RISK_FACTORS: Record<string, RiskFactor> = {
  NO_CONTRACT: {
    id: "no_contract",
    name: "Sem contrato assinado",
    description: "Falta de documentação formal dificulta defesa em disputas",
    impact: "medio",
    category: "operacional",
  },
  INCOMPLETE_DATA: {
    id: "incomplete_data",
    name: "Dados incompletos",
    description: "Faltam informações essenciais para execução segura do serviço",
    impact: "medio",
    category: "operacional",
  },
  TIGHT_DEADLINE: {
    id: "tight_deadline",
    name: "Prazo apertado",
    description: "Tempo insuficiente para execução adequada aumenta chance de erros",
    impact: "medio",
    category: "operacional",
  },
  THIRD_PARTY_DEPENDENCY: {
    id: "third_party_dependency",
    name: "Dependência de terceiros",
    description: "Operação depende de confirmação externa que pode falhar",
    impact: "medio",
    category: "operacional",
  },
  NO_WRITTEN_CONFIRMATION: {
    id: "no_written_confirmation",
    name: "Sem confirmação escrita",
    description: "Falta de registro formal das condições acordadas",
    impact: "medio",
    category: "operacional",
  },
};

// ────────────────────────────────────────────────────────────────────────────────
// FATORES DE RISCO — FINANCEIRO
// ────────────────────────────────────────────────────────────────────────────────

const FINANCIAL_RISK_FACTORS: Record<string, RiskFactor> = {
  MARGIN_RED_ALERT: {
    id: "margin_red_alert",
    name: "Margem abaixo do piso (< 10%)",
    description: "Margem abaixo do piso absoluto de 10% — alerta vermelho",
    impact: "alto",
    category: "financeiro",
  },
  MARGIN_OPERATIONAL_LIMIT: {
    id: "margin_operational_limit",
    name: "Margem no limite operacional (10-11%)",
    description: "Margem entre 10% e 11% — limite operacional, sem folga para imprevistos",
    impact: "medio",
    category: "financeiro",
  },
  LOW_MARGIN: {
    id: "low_margin",
    name: "Margem abaixo do recomendado (< 12%)",
    description: "Margem abaixo de 12% não é recomendada para operações seguras",
    impact: "medio",
    category: "financeiro",
  },
  EXCESSIVE_INSTALLMENTS: {
    id: "excessive_installments",
    name: "Parcelamento acima de 6x",
    description: "Parcelamento superior a 6x aumenta risco financeiro e custo da operação",
    impact: "medio",
    category: "financeiro",
  },
  EXCESSIVE_DISCOUNT: {
    id: "excessive_discount",
    name: "Desconto excessivo",
    description: "Desconto acima de 15% compromete a rentabilidade",
    impact: "medio",
    category: "financeiro",
  },
  BELOW_COST: {
    id: "below_cost",
    name: "Venda sem cobertura de custo",
    description: "Preço final não cobre custos operacionais",
    impact: "alto",
    category: "financeiro",
  },
  CLIENT_CONCENTRATION: {
    id: "client_concentration",
    name: "Dependência de poucos clientes",
    description: "Alta concentração de receita em um único cliente aumenta risco",
    impact: "medio",
    category: "financeiro",
  },
  HIGH_VALUE_NO_GUARANTEE: {
    id: "high_value_no_guarantee",
    name: "Valor alto sem garantias",
    description: "Transação de alto valor sem mecanismos de proteção adequados",
    impact: "alto",
    category: "financeiro",
  },
};

// ────────────────────────────────────────────────────────────────────────────────
// RECOMENDAÇÕES POR FATOR DE RISCO
// ────────────────────────────────────────────────────────────────────────────────

const RISK_RECOMMENDATIONS: Record<string, string[]> = {
  // Chargeback
  trip_under_7_days: [
    "Evitar venda com menos de 7 dias de antecedência quando possível",
    "Exigir confirmação escrita de ciência do cliente sobre políticas",
    "Considerar pagamento via PIX ou transferência para evitar chargeback",
  ],
  payment_chargeback_rights: [
    "Preferir PIX ou transferência bancária para reduzir risco",
    "Se usar cartão, obter assinatura em contrato detalhado",
    "Documentar toda comunicação com o cliente por escrito",
  ],
  new_client: [
    "Solicitar referências ou indicação de cliente existente",
    "Iniciar com pacote de menor valor para construir histórico",
    "Reforçar explicação detalhada de todas as condições",
  ],
  high_value_first: [
    "Sugerir entrada menor e parcelamento do restante",
    "Considerar viagem inicial de menor valor como teste",
    "Documentar expectativas detalhadamente por escrito",
  ],
  expectations_misaligned: [
    "Alinhar expectativas por escrito antes de prosseguir",
    "Enviar checklist de condições para cliente confirmar",
    "Não emitir até ter confirmação clara e documentada",
  ],
  excessive_urgency: [
    "Questionar motivo da urgência com calma",
    "Alertar sobre riscos de decisão apressada",
    "Sugerir alternativa de data se possível",
  ],
  // Operacional
  no_contract: [
    "Enviar contrato de prestação de serviços para assinatura",
    "Incluir política de cancelamento clara e detalhada",
    "Obter aceite por escrito antes de qualquer emissão",
  ],
  incomplete_data: [
    "Listar dados faltantes e solicitar preenchimento",
    "Não prosseguir sem informações essenciais",
    "Criar checklist de dados obrigatórios",
  ],
  tight_deadline: [
    "Alertar cliente sobre riscos de prazo apertado",
    "Cobrar taxa de urgência quando aplicável",
    "Documentar que cliente está ciente das limitações",
  ],
  third_party_dependency: [
    "Obter confirmações por escrito de fornecedores",
    "Ter plano B para serviços críticos",
    "Incluir cláusula de dependência no contrato",
  ],
  no_written_confirmation: [
    "Enviar resumo por escrito e solicitar confirmação",
    "Usar e-mail ou WhatsApp para registro formal",
    "Não considerar fechado sem aceite documentado",
  ],
  // Financeiro
  margin_red_alert: [
    "Margem abaixo do piso absoluto de 10%. Revisar precificação imediatamente.",
    "Recomendação estratégica: não executar operação com esta margem.",
    "Identificar onde os custos podem ser reduzidos ou o preço ajustado.",
  ],
  margin_operational_limit: [
    "Margem no limite operacional (10-11%). Sem folga para imprevistos.",
    "Considere aumentar margem para pelo menos 12%.",
    "Avalie se a operação justifica o risco com esta margem.",
  ],
  low_margin: [
    "Revisar precificação antes de fechar",
    "Identificar serviços com margem maior para compensar",
    "Considerar se vale a pena manter esta operação",
  ],
  excessive_installments: [
    "Parcelamento acima de 6x aumenta custo financeiro significativamente",
    "Considere exigir entrada maior para reduzir parcelas",
    "Calcule o impacto das taxas de parcelamento no lucro real",
  ],
  excessive_discount: [
    "Limitar descontos a no máximo 10%",
    "Oferecer benefícios não-financeiros em vez de desconto",
    "Calcular impacto real no lucro antes de conceder",
  ],
  below_cost: [
    "Não prosseguir sem ajuste de preço",
    "Recalcular custos com fornecedores",
    "Considerar desistir da venda para evitar prejuízo",
  ],
  client_concentration: [
    "Diversificar base de clientes ativamente",
    "Não depender de mais de 30% da receita em um cliente",
    "Ter estratégia de aquisição de novos clientes",
  ],
  high_value_no_guarantee: [
    "Exigir pagamento antecipado ou garantias",
    "Usar contrato com cláusulas de proteção",
    "Considerar seguro para operações de alto valor",
  ],
};

// ────────────────────────────────────────────────────────────────────────────────
// FUNÇÃO PRINCIPAL DE ANÁLISE DE RISCO
// ────────────────────────────────────────────────────────────────────────────────

export function analyzeRisk(input: BudgetRiskInput): RiskAssessment {
  const factors: RiskFactor[] = [];
  const recommendations: string[] = [];
  let chargebackScore = 0;
  let operationalScore = 0;
  let financialScore = 0;
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CHARGEBACK (Prioridade Máxima)
  // ═══════════════════════════════════════════════════════════════════════════
  
  // 1. Viagem em menos de 7 dias
  if (input.daysUntilTrip < 7) {
    factors.push(CHARGEBACK_RISK_FACTORS.TRIP_UNDER_7_DAYS);
    recommendations.push(...RISK_RECOMMENDATIONS.trip_under_7_days);
    chargebackScore += 30;
  }
  
  // 2. Pagamento com direito de arrependimento (cartão de crédito)
  if (input.paymentMethod === "cartao_credito") {
    factors.push(CHARGEBACK_RISK_FACTORS.PAYMENT_WITH_CHARGEBACK_RIGHTS);
    recommendations.push(...RISK_RECOMMENDATIONS.payment_chargeback_rights);
    chargebackScore += 25;
  }
  
  // 3. Cliente novo sem histórico
  if (input.clientIsNew || !input.clientHistoryValue || input.clientHistoryValue === 0) {
    factors.push(CHARGEBACK_RISK_FACTORS.NEW_CLIENT);
    recommendations.push(...RISK_RECOMMENDATIONS.new_client);
    chargebackScore += 15;
  }
  
  // 4. Valor elevado para primeira compra (acima de R$10.000)
  if (input.isFirstPurchase && input.budgetValue > 10000) {
    factors.push(CHARGEBACK_RISK_FACTORS.HIGH_VALUE_FIRST_PURCHASE);
    recommendations.push(...RISK_RECOMMENDATIONS.high_value_first);
    chargebackScore += 25;
  }
  
  // 5. Expectativa desalinhada
  if (!input.clientExpectationsAligned) {
    factors.push(CHARGEBACK_RISK_FACTORS.EXPECTATIONS_MISALIGNED);
    recommendations.push(...RISK_RECOMMENDATIONS.expectations_misaligned);
    chargebackScore += 20;
  }
  
  // 6. Urgência excessiva
  if (input.clientUrgency === "extrema" || input.clientUrgency === "alta") {
    factors.push(CHARGEBACK_RISK_FACTORS.EXCESSIVE_URGENCY);
    recommendations.push(...RISK_RECOMMENDATIONS.excessive_urgency);
    chargebackScore += input.clientUrgency === "extrema" ? 20 : 10;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // OPERACIONAL
  // ═══════════════════════════════════════════════════════════════════════════
  
  // 7. Sem contrato assinado
  if (!input.hasSignedContract) {
    factors.push(OPERATIONAL_RISK_FACTORS.NO_CONTRACT);
    recommendations.push(...RISK_RECOMMENDATIONS.no_contract);
    operationalScore += 20;
  }
  
  // 8. Dados incompletos
  if (input.dataComplete === false) {
    factors.push(OPERATIONAL_RISK_FACTORS.INCOMPLETE_DATA);
    recommendations.push(...RISK_RECOMMENDATIONS.incomplete_data);
    operationalScore += 15;
  }
  
  // 9. Prazo apertado
  if (input.deadlineTight === true || input.daysUntilTrip < 3) {
    factors.push(OPERATIONAL_RISK_FACTORS.TIGHT_DEADLINE);
    recommendations.push(...RISK_RECOMMENDATIONS.tight_deadline);
    operationalScore += 15;
  }
  
  // 10. Dependência de terceiros
  if (input.hasThirdPartyDependency === true) {
    factors.push(OPERATIONAL_RISK_FACTORS.THIRD_PARTY_DEPENDENCY);
    recommendations.push(...RISK_RECOMMENDATIONS.third_party_dependency);
    operationalScore += 10;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // FINANCEIRO
  // ═══════════════════════════════════════════════════════════════════════════
  
  // 11. Margem — classificação granular
  if (input.marginPercentage !== undefined) {
    // Margem negativa: venda sem cobertura de custo
    if (input.marginPercentage <= 0) {
      factors.push(FINANCIAL_RISK_FACTORS.BELOW_COST);
      recommendations.push(...RISK_RECOMMENDATIONS.below_cost);
      financialScore += 35;
    }
    // Alerta vermelho: abaixo do piso absoluto (< 10%)
    if (input.marginPercentage < 10) {
      factors.push(FINANCIAL_RISK_FACTORS.MARGIN_RED_ALERT);
      recommendations.push(...RISK_RECOMMENDATIONS.margin_red_alert);
      financialScore += 25;
    }
    // Limite operacional: 10–11%
    else if (input.marginPercentage < 12) {
      factors.push(FINANCIAL_RISK_FACTORS.MARGIN_OPERATIONAL_LIMIT);
      recommendations.push(...RISK_RECOMMENDATIONS.margin_operational_limit);
      financialScore += 10;
    }
    // Abaixo do recomendado: < 12% (capturado acima, mas alerta separado para < 12%)
    if (input.marginPercentage > 0 && input.marginPercentage < 12) {
      factors.push(FINANCIAL_RISK_FACTORS.LOW_MARGIN);
      recommendations.push(...RISK_RECOMMENDATIONS.low_margin);
      financialScore += 5;
    }
  }

  // 11b. Parcelamento acima de 6x
  if (input.installments !== undefined && input.installments > 6) {
    factors.push(FINANCIAL_RISK_FACTORS.EXCESSIVE_INSTALLMENTS);
    recommendations.push(...RISK_RECOMMENDATIONS.excessive_installments);
    financialScore += 15;
  }
  
  // 12. Concentração de cliente
  if (input.clientConcentration !== undefined && input.clientConcentration > 30) {
    factors.push(FINANCIAL_RISK_FACTORS.CLIENT_CONCENTRATION);
    recommendations.push(...RISK_RECOMMENDATIONS.client_concentration);
    financialScore += 10;
  }
  
  // 13. Alto valor sem garantias
  if (input.budgetValue > 20000 && !input.hasSignedContract && input.paymentMethod !== "pix") {
    factors.push(FINANCIAL_RISK_FACTORS.HIGH_VALUE_NO_GUARANTEE);
    recommendations.push(...RISK_RECOMMENDATIONS.high_value_no_guarantee);
    financialScore += 25;
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // CALCULAR NÍVEIS DE RISCO
  // ═══════════════════════════════════════════════════════════════════════════
  
  const chargebackRisk: RiskLevel = 
    chargebackScore >= 50 ? "alto" : 
    chargebackScore >= 25 ? "medio" : 
    "baixo";
    
  const operationalRisk: RiskLevel =
    operationalScore >= 35 ? "alto" :
    operationalScore >= 20 ? "medio" :
    "baixo";
    
  const financialRisk: RiskLevel =
    financialScore >= 35 ? "alto" :
    financialScore >= 15 ? "medio" :
    "baixo";
  
  // Nível geral é o maior entre os três
  const overallLevel: RiskLevel = 
    chargebackRisk === "alto" || operationalRisk === "alto" || financialRisk === "alto" 
      ? "alto" 
      : chargebackRisk === "medio" || operationalRisk === "medio" || financialRisk === "medio"
        ? "medio"
        : "baixo";
  
  // Calcular impacto financeiro potencial
  const financialImpact = overallLevel === "alto" 
    ? input.budgetValue 
    : overallLevel === "medio" 
      ? input.budgetValue * 0.5 
      : input.budgetValue * 0.1;
  
  // Gerar resumo e explicação
  const summary = generateRiskSummary(overallLevel, factors, input.budgetValue);
  const explanation = generateRiskExplanation(chargebackRisk, operationalRisk, financialRisk, factors);
  
  // Remover recomendações duplicadas
  const uniqueRecommendations = [...new Set(recommendations)];
  
  return {
    overallLevel,
    chargebackRisk,
    operationalRisk,
    financialRisk,
    factors,
    recommendations: uniqueRecommendations,
    financialImpact,
    summary,
    explanation,
  };
}

function generateRiskSummary(level: RiskLevel, factors: RiskFactor[], value: number): string {
  const valueFormatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
  }).format(value);
  
  if (level === "alto") {
    return `⚠️ Risco ALTO identificado. ${factors.length} fatores de risco. Valor em risco: ${valueFormatted}. Recomendo revisar antes de prosseguir.`;
  } else if (level === "medio") {
    return `🟡 Risco MÉDIO identificado. ${factors.length} fatores requerem atenção. Considere mitigações antes de emitir.`;
  } else {
    return `🟢 Risco BAIXO. Operação dentro de padrões seguros.`;
  }
}

function generateRiskExplanation(
  chargebackRisk: RiskLevel, 
  operationalRisk: RiskLevel, 
  financialRisk: RiskLevel,
  factors: RiskFactor[]
): string {
  const parts: string[] = [];
  
  // Chargeback
  const chargebackFactors = factors.filter(f => f.category === "chargeback");
  if (chargebackFactors.length > 0) {
    if (chargebackRisk === "alto") {
      parts.push(`CHARGEBACK (ALTO): ${chargebackFactors.map(f => f.name).join(", ")}`);
    } else if (chargebackRisk === "medio") {
      parts.push(`CHARGEBACK (Médio): ${chargebackFactors.map(f => f.name).join(", ")}`);
    }
  }
  
  // Operacional
  const operationalFactors = factors.filter(f => f.category === "operacional");
  if (operationalFactors.length > 0) {
    if (operationalRisk === "alto") {
      parts.push(`OPERACIONAL (ALTO): ${operationalFactors.map(f => f.name).join(", ")}`);
    } else if (operationalRisk === "medio") {
      parts.push(`OPERACIONAL (Médio): ${operationalFactors.map(f => f.name).join(", ")}`);
    }
  }
  
  // Financeiro
  const financialFactors = factors.filter(f => f.category === "financeiro");
  if (financialFactors.length > 0) {
    if (financialRisk === "alto") {
      parts.push(`FINANCEIRO (ALTO): ${financialFactors.map(f => f.name).join(", ")}`);
    } else if (financialRisk === "medio") {
      parts.push(`FINANCEIRO (Médio): ${financialFactors.map(f => f.name).join(", ")}`);
    }
  }
  
  return parts.length > 0 
    ? parts.join(" | ") 
    : "Nenhum risco significativo identificado.";
}

// ────────────────────────────────────────────────────────────────────────────────
// ANÁLISE RÁPIDA PARA ORÇAMENTOS EXISTENTES
// ────────────────────────────────────────────────────────────────────────────────

export function quickRiskCheck(budget: {
  value: number;
  daysUntilTrip?: number;
  clientIsNew?: boolean;
  status?: string;
  marginPercentage?: number;
}): { level: RiskLevel; reason: string; category: RiskCategory } {
  // Viagem muito próxima - CHARGEBACK
  if (budget.daysUntilTrip !== undefined && budget.daysUntilTrip < 7) {
    return {
      level: "alto",
      reason: "Viagem em menos de 7 dias - alto risco de chargeback",
      category: "chargeback",
    };
  }
  
  // Cliente novo com valor alto - CHARGEBACK
  if (budget.clientIsNew && budget.value > 15000) {
    return {
      level: "medio",
      reason: "Cliente novo com valor elevado",
      category: "chargeback",
    };
  }
  
  // Margem muito baixa - FINANCEIRO
  if (budget.marginPercentage !== undefined && budget.marginPercentage < 5) {
    return {
      level: "alto",
      reason: "Margem insuficiente para cobrir riscos",
      category: "financeiro",
    };
  }
  
  // Valor muito alto sem histórico
  if (budget.value > 30000) {
    return {
      level: "medio",
      reason: "Valor elevado requer atenção adicional",
      category: "financeiro",
    };
  }
  
  return {
    level: "baixo",
    reason: "Dentro dos parâmetros normais",
    category: "operacional",
  };
}

// ────────────────────────────────────────────────────────────────────────────────
// GERAR INSIGHT PARA DASHBOARD
// ────────────────────────────────────────────────────────────────────────────────

export interface RiskInsight {
  id: string;
  type: RiskCategory;
  level: RiskLevel;
  title: string;
  description: string;
  action: string;
  value?: number;
}

export function generateRiskInsights(budgets: Array<{
  id: string;
  value: number;
  client: string;
  destination: string;
  status: string;
  daysUntilTrip?: number;
  marginPercentage?: number;
}>): RiskInsight[] {
  const insights: RiskInsight[] = [];
  
  // Verificar cada orçamento em negociação
  const activeBudgets = budgets.filter(b => b.status === "enviado" || b.status === "rascunho");
  
  for (const budget of activeBudgets) {
    const risk = quickRiskCheck({
      value: budget.value,
      daysUntilTrip: budget.daysUntilTrip,
      marginPercentage: budget.marginPercentage,
    });
    
    if (risk.level === "alto") {
      insights.push({
        id: `risk-${budget.id}`,
        type: risk.category,
        level: "alto",
        title: `Risco ${risk.category === "chargeback" ? "de chargeback" : risk.category}: ${budget.client}`,
        description: `${budget.destination} - ${risk.reason}`,
        action: risk.category === "chargeback" 
          ? "Revisar condições antes de emitir" 
          : "Verificar documentação e garantias",
        value: budget.value,
      });
    } else if (risk.level === "medio" && budget.value > 20000) {
      insights.push({
        id: `risk-${budget.id}`,
        type: risk.category,
        level: "medio",
        title: `Atenção: ${budget.client}`,
        description: `${budget.destination} - ${risk.reason}`,
        action: "Verificar documentação e contrato",
        value: budget.value,
      });
    }
  }
  
  return insights;
}

// ────────────────────────────────────────────────────────────────────────────────
// FORMATAÇÃO DE NÍVEL DE RISCO
// ────────────────────────────────────────────────────────────────────────────────

export function getRiskLevelColor(level: RiskLevel): string {
  switch (level) {
    case "alto":
      return "text-red-500";
    case "medio":
      return "text-yellow-500";
    case "baixo":
      return "text-green-500";
    default:
      return "text-muted-foreground";
  }
}

export function getRiskLevelBg(level: RiskLevel): string {
  switch (level) {
    case "alto":
      return "bg-red-500/10 border-red-500/20";
    case "medio":
      return "bg-yellow-500/10 border-yellow-500/20";
    case "baixo":
      return "bg-green-500/10 border-green-500/20";
    default:
      return "bg-muted border-border";
  }
}

export function getRiskLevelIcon(level: RiskLevel): string {
  switch (level) {
    case "alto":
      return "🔴";
    case "medio":
      return "🟡";
    case "baixo":
      return "🟢";
    default:
      return "⚪";
  }
}

export function getRiskLevelLabel(level: RiskLevel): string {
  switch (level) {
    case "alto":
      return "Alto risco";
    case "medio":
      return "Risco médio";
    case "baixo":
      return "Baixo risco";
    default:
      return "Monitoramento";
  }
}

export function getCategoryLabel(category: RiskCategory): string {
  switch (category) {
    case "chargeback":
      return "Chargeback";
    case "operacional":
      return "Operacional";
    case "financeiro":
      return "Financeiro";
    case "cliente":
      return "Cliente";
    default:
      return category;
  }
}
