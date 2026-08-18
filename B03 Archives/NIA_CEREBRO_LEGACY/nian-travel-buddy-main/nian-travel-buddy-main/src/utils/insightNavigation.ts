// ═══════════════════════════════════════════════════════════════════════════════
// INSIGHT NAVIGATION UTILITY
// Global actionable navigation for NIA insights
// Classifies insights as INFORMATIVE or ACTIONABLE with automatic filters
// ═══════════════════════════════════════════════════════════════════════════════

export type InsightEntity = "clientes" | "orcamentos" | "followups" | "tarefas" | "relatorios" | "prioridades";

export type InsightIntent = "resolver" | "acompanhar" | "priorizar" | "revisar" | "analisar";

export interface InsightNavigation {
  entity: InsightEntity;
  intent: InsightIntent;
  filters: Record<string, string>;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ActionableInsight {
  isActionable: boolean;
  navigation?: InsightNavigation;
  label?: string; // Button/link label for actionable insights
}

// Map insight IDs to their navigation configuration
const INSIGHT_NAVIGATION_MAP: Record<string, InsightNavigation & { label: string }> = {
  // Chargeback risk → Orçamentos with high-risk filter
  "chargeback-risk": {
    entity: "orcamentos",
    intent: "revisar",
    filters: {
      status: "enviado",
      risk: "alto",
    },
    sortBy: "value",
    sortOrder: "desc",
    label: "Ver orçamentos em risco",
  },
  
  // Trip urgency → Orçamentos with upcoming trips
  "trip-urgency-risk": {
    entity: "orcamentos",
    intent: "revisar",
    filters: {
      status: "aceito",
      urgency: "alta",
    },
    sortBy: "tripDate",
    sortOrder: "asc",
    label: "Ver viagens próximas",
  },
  
  // Stalled budgets → Orçamentos with idle filter
  "orcamentos-risco": {
    entity: "orcamentos",
    intent: "acompanhar",
    filters: {
      status: "enviado",
      idle: "5",
    },
    sortBy: "diasSemResposta",
    sortOrder: "desc",
    label: "Ver orçamentos parados",
  },
  
  // Post-sale follow-up → Clientes with pos-venda status
  "pos-venda": {
    entity: "clientes",
    intent: "acompanhar",
    filters: {
      status: "pos-venda",
    },
    sortBy: "lastContact",
    sortOrder: "asc",
    label: "Ver clientes pós-venda",
  },
  
  // Positive conversion → Informative, but can link to reports
  "conversao-positiva": {
    entity: "relatorios",
    intent: "analisar",
    filters: {
      tab: "conversao",
    },
    label: "Ver análise de conversão",
  },
};

/**
 * Determines if an insight is actionable and returns navigation data
 */
export function getInsightNavigation(insightId: string): ActionableInsight {
  const navigation = INSIGHT_NAVIGATION_MAP[insightId];
  
  if (!navigation) {
    return { isActionable: false };
  }
  
  return {
    isActionable: true,
    navigation: {
      entity: navigation.entity,
      intent: navigation.intent,
      filters: navigation.filters,
      sortBy: navigation.sortBy,
      sortOrder: navigation.sortOrder,
    },
    label: navigation.label,
  };
}

/**
 * Builds a URL path with query parameters for navigation
 */
export function buildNavigationUrl(navigation: InsightNavigation): string {
  const basePaths: Record<InsightEntity, string> = {
    clientes: "/clientes",
    orcamentos: "/orcamentos",
    followups: "/followups",
    tarefas: "/tarefas",
    relatorios: "/relatorios",
    prioridades: "/prioridades",
  };
  
  const basePath = basePaths[navigation.entity];
  const params = new URLSearchParams();
  
  // Add filters as query params
  Object.entries(navigation.filters).forEach(([key, value]) => {
    params.set(key, value);
  });
  
  // Add sort params if present
  if (navigation.sortBy) {
    params.set("sortBy", navigation.sortBy);
  }
  if (navigation.sortOrder) {
    params.set("sortOrder", navigation.sortOrder);
  }
  
  const queryString = params.toString();
  return queryString ? `${basePath}?${queryString}` : basePath;
}

/**
 * Safe navigation - validates that the target exists before navigating
 * Returns null if navigation should be disabled
 */
export function validateNavigation(
  navigation: InsightNavigation,
  dataExists: boolean
): string | null {
  if (!dataExists) {
    return null; // Disable click if entity no longer exists
  }
  
  return buildNavigationUrl(navigation);
}

/**
 * Determines the visual style for actionable insights
 */
export function getActionableStyle(isActionable: boolean): string {
  if (isActionable) {
    return "cursor-pointer hover:bg-accent/5 transition-colors";
  }
  return "";
}

/**
 * Insight categories that are typically informative (non-actionable)
 */
const INFORMATIVE_PATTERNS = [
  "faturamento-positivo",
  "margem-media",
  "crescimento",
  "meta-atingida",
];

/**
 * Quick check if an insight ID is typically informative
 */
export function isInformativeInsight(insightId: string): boolean {
  return INFORMATIVE_PATTERNS.some(pattern => insightId.includes(pattern));
}
