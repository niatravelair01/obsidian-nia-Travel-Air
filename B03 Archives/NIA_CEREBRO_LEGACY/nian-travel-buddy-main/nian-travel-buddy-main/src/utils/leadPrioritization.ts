// ═══════════════════════════════════════════════════════════════════════════════
// MOTOR DE PRIORIZAÇÃO INTELIGENTE DE LEADS — NIA TRAVEL AIR
//
// Regras de ordenação:
//   1. Maior margem prevista
//   2. Lead quente
//   3. Urgência real de viagem
//   4. Ticket maior
//   5. Cliente recorrente
//
// Classificações:
//   🔥 MÁXIMA  — Margem ≥ 15%, baixo risco, dados completos
//   ⚖  ALTA    — Lead quente, margem 10-14%, orçamento validado
//   🌡  MÉDIA   — Lead morno, margem ≥ 15%, boa possibilidade
//   🧊  BAIXA   — Lead frio, margem mínima, alto risco
//
// Sem bloqueios automáticos. Decisão final sempre humana.
// ═══════════════════════════════════════════════════════════════════════════════

import { MARGIN_POLICY, classifyMargin, type MarginClassification } from "./marginEngine";

// ────────────────────────────────────────────────────────────────────────────────
// TIPOS
// ────────────────────────────────────────────────────────────────────────────────

export type LeadTemperature = "quente" | "morno" | "frio";
export type PriorityLevel = "maxima" | "alta" | "media" | "baixa";

export interface LeadPriorityData {
  clientId: string;
  clientName: string;
  destination: string;
  budgetValue: number;
  estimatedCost: number;
  estimatedMarginPercent: number;
  marginClassification: MarginClassification;
  temperature: LeadTemperature;
  riskLevel: "baixo" | "medio" | "alto";
  isRecurrent: boolean;
  dataComplete: boolean;
  daysWithoutResponse: number;
  daysUntilTrip?: number;
  paymentMethod?: "pix" | "cartao_credito" | "boleto";
  hasWrittenConfirmation: boolean;
  budgetValidated: boolean;
}

export interface PrioritizedLead extends LeadPriorityData {
  priorityLevel: PriorityLevel;
  priorityScore: number;
  alerts: LeadAlert[];
  recommendedAction: string;
  reasoning: string;
}

export interface LeadAlert {
  id: string;
  severity: "info" | "warning" | "critical";
  message: string;
  suggestion: string;
}

// ────────────────────────────────────────────────────────────────────────────────
// CONSTANTES DE SCORE
// ────────────────────────────────────────────────────────────────────────────────

const SCORE_WEIGHTS = {
  MARGIN_HEALTHY: 30,
  MARGIN_ACCEPTABLE: 20,
  MARGIN_LIMIT: 10,
  MARGIN_RED: -10,
  LEAD_HOT: 25,
  LEAD_WARM: 15,
  LEAD_COLD: 0,
  URGENCY_HIGH: 20,     // < 14 days
  URGENCY_MEDIUM: 10,   // 14-30 days
  TICKET_HIGH: 15,      // > R$20k
  TICKET_MEDIUM: 10,    // R$10k-20k
  TICKET_LOW: 5,        // < R$10k
  RECURRENT_CLIENT: 10,
  DATA_COMPLETE: 5,
  BUDGET_VALIDATED: 5,
  // Penalties
  NO_RESPONSE_LONG: -15,  // > 7 days
  NO_RESPONSE_MED: -5,    // 3-7 days
  HIGH_RISK: -20,
  MEDIUM_RISK: -5,
} as const;

// ────────────────────────────────────────────────────────────────────────────────
// SCORING ENGINE
// ────────────────────────────────────────────────────────────────────────────────

export function calculatePriorityScore(lead: LeadPriorityData): number {
  let score = 50; // base

  // 1. Margem
  const mc = lead.marginClassification;
  if (mc === "saudavel") score += SCORE_WEIGHTS.MARGIN_HEALTHY;
  else if (mc === "aceitavel") score += SCORE_WEIGHTS.MARGIN_ACCEPTABLE;
  else if (mc === "limite_operacional") score += SCORE_WEIGHTS.MARGIN_LIMIT;
  else score += SCORE_WEIGHTS.MARGIN_RED;

  // 2. Temperatura do lead
  if (lead.temperature === "quente") score += SCORE_WEIGHTS.LEAD_HOT;
  else if (lead.temperature === "morno") score += SCORE_WEIGHTS.LEAD_WARM;

  // 3. Urgência de viagem
  if (lead.daysUntilTrip !== undefined) {
    if (lead.daysUntilTrip < 14) score += SCORE_WEIGHTS.URGENCY_HIGH;
    else if (lead.daysUntilTrip < 30) score += SCORE_WEIGHTS.URGENCY_MEDIUM;
  }

  // 4. Ticket
  if (lead.budgetValue > 20000) score += SCORE_WEIGHTS.TICKET_HIGH;
  else if (lead.budgetValue > 10000) score += SCORE_WEIGHTS.TICKET_MEDIUM;
  else score += SCORE_WEIGHTS.TICKET_LOW;

  // 5. Recorrência
  if (lead.isRecurrent) score += SCORE_WEIGHTS.RECURRENT_CLIENT;

  // Bonus
  if (lead.dataComplete) score += SCORE_WEIGHTS.DATA_COMPLETE;
  if (lead.budgetValidated) score += SCORE_WEIGHTS.BUDGET_VALIDATED;

  // Penalties
  if (lead.daysWithoutResponse > 7) score += SCORE_WEIGHTS.NO_RESPONSE_LONG;
  else if (lead.daysWithoutResponse > 3) score += SCORE_WEIGHTS.NO_RESPONSE_MED;

  if (lead.riskLevel === "alto") score += SCORE_WEIGHTS.HIGH_RISK;
  else if (lead.riskLevel === "medio") score += SCORE_WEIGHTS.MEDIUM_RISK;

  return Math.max(0, Math.min(100, score));
}

// ────────────────────────────────────────────────────────────────────────────────
// CLASSIFICAÇÃO DE PRIORIDADE
// ────────────────────────────────────────────────────────────────────────────────

export function classifyPriority(lead: LeadPriorityData): PriorityLevel {
  const { estimatedMarginPercent, temperature, riskLevel, dataComplete, budgetValidated, daysUntilTrip } = lead;

  // 🔥 MÁXIMA: Margem ≥ 15%, baixo risco, dados completos
  if (
    estimatedMarginPercent >= MARGIN_POLICY.HEALTHY_THRESHOLD &&
    riskLevel === "baixo" &&
    dataComplete
  ) {
    return "maxima";
  }

  // ⚖ ALTA: Lead quente, margem 10-14%, orçamento validado, urgência
  if (
    temperature === "quente" &&
    estimatedMarginPercent >= MARGIN_POLICY.ABSOLUTE_FLOOR &&
    estimatedMarginPercent < MARGIN_POLICY.HEALTHY_THRESHOLD &&
    budgetValidated
  ) {
    return "alta";
  }

  // Also ALTA if hot lead with healthy margin
  if (temperature === "quente" && estimatedMarginPercent >= MARGIN_POLICY.HEALTHY_THRESHOLD) {
    return "maxima";
  }

  // 🌡 MÉDIA: Lead morno, margem ≥ 15%, possibilidade de fechamento
  if (
    temperature === "morno" &&
    estimatedMarginPercent >= MARGIN_POLICY.HEALTHY_THRESHOLD
  ) {
    return "media";
  }

  // Also ALTA for urgent trips with decent margin
  if (daysUntilTrip !== undefined && daysUntilTrip < 14 && estimatedMarginPercent >= MARGIN_POLICY.ABSOLUTE_FLOOR) {
    return "alta";
  }

  // 🧊 BAIXA: everything else
  return "baixa";
}

// ────────────────────────────────────────────────────────────────────────────────
// GERAÇÃO DE ALERTAS
// ────────────────────────────────────────────────────────────────────────────────

export function generateLeadAlerts(lead: LeadPriorityData): LeadAlert[] {
  const alerts: LeadAlert[] = [];

  // Margem abaixo do piso
  if (lead.estimatedMarginPercent < MARGIN_POLICY.ABSOLUTE_FLOOR) {
    alerts.push({
      id: "margin_floor",
      severity: "critical",
      message: `Margem de ${lead.estimatedMarginPercent.toFixed(1)}% abaixo do piso de ${MARGIN_POLICY.ABSOLUTE_FLOOR}%`,
      suggestion: "Revisar precificação ou recusar estrategicamente",
    });
  } else if (lead.estimatedMarginPercent < MARGIN_POLICY.RECOMMENDED_MIN) {
    alerts.push({
      id: "margin_low",
      severity: "warning",
      message: `Margem de ${lead.estimatedMarginPercent.toFixed(1)}% abaixo do recomendado`,
      suggestion: "Ajustar margem para pelo menos 12%",
    });
  }

  // Regra dos 7 dias + cartão
  if (
    lead.daysUntilTrip !== undefined &&
    lead.daysUntilTrip < 7 &&
    lead.paymentMethod === "cartao_credito"
  ) {
    alerts.push({
      id: "chargeback_7d",
      severity: "critical",
      message: `Embarque em ${lead.daysUntilTrip} dias com cartão — risco de chargeback`,
      suggestion: "Migrar pagamento para Pix",
    });
  }

  // Sem confirmação escrita
  if (!lead.hasWrittenConfirmation && lead.budgetValidated) {
    alerts.push({
      id: "no_confirmation",
      severity: "warning",
      message: "Sem confirmação escrita do cliente",
      suggestion: "Obter aceite formal antes de emitir",
    });
  }

  // Alto risco + margem baixa = recusa estratégica
  if (lead.riskLevel === "alto" && lead.estimatedMarginPercent < MARGIN_POLICY.RECOMMENDED_MIN) {
    alerts.push({
      id: "strategic_refuse",
      severity: "critical",
      message: "Alto risco combinado com margem baixa",
      suggestion: "Recomendação: não executar operação",
    });
  }

  // Sem resposta prolongada
  if (lead.daysWithoutResponse > 7) {
    alerts.push({
      id: "cold_lead",
      severity: "warning",
      message: `${lead.daysWithoutResponse} dias sem resposta`,
      suggestion: "Última tentativa de reativação ou encerrar",
    });
  }

  return alerts;
}

// ────────────────────────────────────────────────────────────────────────────────
// AÇÃO RECOMENDADA
// ────────────────────────────────────────────────────────────────────────────────

function getRecommendedAction(lead: LeadPriorityData, priority: PriorityLevel): string {
  // Critical alerts take precedence
  if (lead.estimatedMarginPercent < MARGIN_POLICY.ABSOLUTE_FLOOR && lead.riskLevel === "alto") {
    return "Recusar estrategicamente — risco + margem inviável";
  }

  if (lead.estimatedMarginPercent < MARGIN_POLICY.ABSOLUTE_FLOOR) {
    return "Revisar precificação antes de prosseguir";
  }

  if (lead.daysWithoutResponse > 7) {
    return "Tentativa final de reativação via WhatsApp";
  }

  switch (priority) {
    case "maxima":
      return "Fechar agora — condições ideais";
    case "alta":
      return "Follow-up imediato para fechar";
    case "media":
      return "Nutrir interesse e agendar contato";
    case "baixa":
      return "Monitorar sem investir tempo excessivo";
  }
}

function getReasoning(lead: LeadPriorityData, priority: PriorityLevel, score: number): string {
  const parts: string[] = [];

  parts.push(`Score ${score}/100`);

  if (lead.estimatedMarginPercent >= MARGIN_POLICY.HEALTHY_THRESHOLD) {
    parts.push(`margem saudável (${lead.estimatedMarginPercent.toFixed(1)}%)`);
  } else if (lead.estimatedMarginPercent >= MARGIN_POLICY.ABSOLUTE_FLOOR) {
    parts.push(`margem ${lead.estimatedMarginPercent.toFixed(1)}%`);
  } else {
    parts.push(`margem crítica (${lead.estimatedMarginPercent.toFixed(1)}%)`);
  }

  if (lead.temperature === "quente") parts.push("lead quente");
  if (lead.isRecurrent) parts.push("cliente recorrente");
  if (lead.budgetValue > 20000) parts.push("ticket alto");
  if (lead.riskLevel === "alto") parts.push("⚠ risco alto");

  return parts.join(" · ");
}

// ────────────────────────────────────────────────────────────────────────────────
// PRIORIZAÇÃO COMPLETA
// ────────────────────────────────────────────────────────────────────────────────

export function prioritizeLeads(leads: LeadPriorityData[]): PrioritizedLead[] {
  return leads
    .map((lead) => {
      const priorityLevel = classifyPriority(lead);
      const priorityScore = calculatePriorityScore(lead);
      const alerts = generateLeadAlerts(lead);
      const recommendedAction = getRecommendedAction(lead, priorityLevel);
      const reasoning = getReasoning(lead, priorityLevel, priorityScore);

      return {
        ...lead,
        priorityLevel,
        priorityScore,
        alerts,
        recommendedAction,
        reasoning,
      };
    })
    .sort((a, b) => b.priorityScore - a.priorityScore);
}

// ────────────────────────────────────────────────────────────────────────────────
// LABELS & DISPLAY HELPERS
// ────────────────────────────────────────────────────────────────────────────────

export function getPriorityLabel(level: PriorityLevel): string {
  const labels: Record<PriorityLevel, string> = {
    maxima: "🔥 Máxima",
    alta: "⚖️ Alta",
    media: "🌡️ Média",
    baixa: "🧊 Baixa",
  };
  return labels[level];
}

export function getPriorityBgColor(level: PriorityLevel): string {
  const colors: Record<PriorityLevel, string> = {
    maxima: "bg-red-500/10 border-red-500/30 text-red-500",
    alta: "bg-amber-500/10 border-amber-500/30 text-amber-500",
    media: "bg-blue-500/10 border-blue-500/30 text-blue-500",
    baixa: "bg-muted/50 border-border text-muted-foreground",
  };
  return colors[level];
}

export function getTemperatureLabel(temp: LeadTemperature): string {
  const labels: Record<LeadTemperature, string> = {
    quente: "🔥 Quente",
    morno: "🌡️ Morno",
    frio: "🧊 Frio",
  };
  return labels[temp];
}
