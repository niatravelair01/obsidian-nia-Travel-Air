// ═══════════════════════════════════════════════════════════════════════════════
// MOCK DATA — DADOS FICTÍCIOS PARA VISUALIZAÇÃO
// 
// ATENÇÃO:
//   - Estes dados são apenas seed visual
//   - Não alteram comportamento real do sistema
//   - Não criam dependência de prompt
//   - Não criam novos chats ou regras de IA
// ═══════════════════════════════════════════════════════════════════════════════

// ────────────────────────────────────────────────────────────────────────────────
// HELPERS (DEFINED FIRST TO AVOID INITIALIZATION ERRORS)
// ────────────────────────────────────────────────────────────────────────────────

export const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export const getClientById = (id: string) => mockClients.find(c => c.id === id);
export const getBudgetsByClientId = (clientId: string) => mockBudgets.filter(b => b.clientId === clientId);
export const getTasksByClientId = (clientId: string) => mockTasks.filter(t => t.relatedClientId === clientId);

// ────────────────────────────────────────────────────────────────────────────────
// CLIENTES
// ────────────────────────────────────────────────────────────────────────────────

export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  destination: string;
  status: "atendimento" | "negociacao" | "pos-venda" | "lead" | "inativo";
  lastInteraction: string;
  budgets: number;
  createdAt: string;
  // Ficha completa
  travelProfile: string;
  averageBudget: number;
  destinationsOfInterest: string[];
  hotelPreference: string;
  flightClassPreference: string;
  priceSensitivity: "low" | "medium" | "high";
  relationshipStatus: string;
  ticketType: "alto" | "premium" | "medio" | "economico";
  // Novos campos para lógica de UI
  valorLifetime?: number;
  dataUltimaInteracao?: string;
}

export const mockClients: Client[] = [
  {
    id: "1",
    name: "Ana Carolina",
    email: "ana.carolina@email.com",
    phone: "(11) 99999-1234",
    destination: "Paris, França",
    status: "negociacao",
    lastInteraction: "Hoje",
    budgets: 1,
    createdAt: "2024-06-15",
    travelProfile: "Viajante experiente, busca experiências culturais e gastronômicas de alto padrão. Prefere roteiros personalizados.",
    averageBudget: 45000,
    destinationsOfInterest: ["Europa", "Ásia", "Oriente Médio"],
    hotelPreference: "5 estrelas, boutique hotels",
    flightClassPreference: "Executiva",
    priceSensitivity: "low",
    relationshipStatus: "Cliente em negociação ativa, alto potencial de fechamento",
    ticketType: "alto",
    valorLifetime: 120000,
    dataUltimaInteracao: new Date().toISOString(),
  },
  {
    id: "2",
    name: "Carlos Lima",
    email: "carlos.lima@email.com",
    phone: "(21) 98888-5678",
    destination: "Maldivas",
    status: "negociacao",
    lastInteraction: "Há 2 dias",
    budgets: 1,
    createdAt: "2024-09-20",
    travelProfile: "Cliente premium, lua de mel. Busca exclusividade e privacidade em resorts de luxo.",
    averageBudget: 50000,
    destinationsOfInterest: ["Maldivas", "Bora Bora", "Seychelles"],
    hotelPreference: "Resorts overwater, all-inclusive premium",
    flightClassPreference: "Primeira Classe",
    priceSensitivity: "low",
    relationshipStatus: "Orçamento enviado, aguardando confirmação",
    ticketType: "premium",
    valorLifetime: 85000,
    dataUltimaInteracao: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "3",
    name: "Maria Silva",
    email: "maria.silva@email.com",
    phone: "(11) 97777-9012",
    destination: "Caribe",
    status: "negociacao",
    lastInteraction: "Há 5 dias",
    budgets: 1,
    createdAt: "2024-11-10",
    travelProfile: "Família com crianças, busca resorts com atividades infantis e praias seguras.",
    averageBudget: 22000,
    destinationsOfInterest: ["Caribe", "Orlando", "Cancún"],
    hotelPreference: "4-5 estrelas, resorts família",
    flightClassPreference: "Econômica Premium",
    priceSensitivity: "medium",
    relationshipStatus: "Follow-up pendente, demonstrou interesse mas não respondeu últimas mensagens",
    ticketType: "medio",
    valorLifetime: 45000,
    dataUltimaInteracao: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "4",
    name: "João Santos",
    email: "joao.santos@email.com",
    phone: "(31) 96666-3456",
    destination: "Lisboa, Portugal",
    status: "lead",
    lastInteraction: "Há 10 dias",
    budgets: 1,
    createdAt: "2025-01-05",
    travelProfile: "Primeira viagem internacional, interesse em história e cultura europeia.",
    averageBudget: 15000,
    destinationsOfInterest: ["Portugal", "Espanha", "Itália"],
    hotelPreference: "3-4 estrelas, localização central",
    flightClassPreference: "Econômica",
    priceSensitivity: "high",
    relationshipStatus: "Sem resposta há 10 dias, orçamento pode estar esfriando",
    ticketType: "medio",
    valorLifetime: 15000,
    dataUltimaInteracao: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "5",
    name: "Fernanda Costa",
    email: "fernanda.costa@email.com",
    phone: "(41) 95555-7890",
    destination: "Gramado, RS",
    status: "pos-venda",
    lastInteraction: "Há 3 dias",
    budgets: 1,
    createdAt: "2024-12-01",
    travelProfile: "Viagem nacional econômica, busca bom custo-benefício e experiências locais.",
    averageBudget: 8000,
    destinationsOfInterest: ["Sul do Brasil", "Nordeste", "Minas Gerais"],
    hotelPreference: "Pousadas charmosas, 3 estrelas",
    flightClassPreference: "Econômica",
    priceSensitivity: "high",
    relationshipStatus: "Viagem finalizada, aguardando feedback pós-venda",
    ticketType: "economico",
    valorLifetime: 22000,
    dataUltimaInteracao: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

// ────────────────────────────────────────────────────────────────────────────────
// ORÇAMENTOS
// ────────────────────────────────────────────────────────────────────────────────

export interface Budget {
  id: string;
  title: string;
  client: string;
  clientId: string;
  value: number;
  profit: number;
  destination: string;
  period: string;
  status: "rascunho" | "enviado" | "aceito" | "recusado" | "expirado";
  timeIdle: string;
  createdAt: string;
  expiresAt?: string;
  riskLevel?: "baixo" | "medio" | "alto";
  diasSemResposta?: number;
}

export const mockBudgets: Budget[] = [
  {
    id: "1",
    title: "Lua de Mel - Paris",
    client: "Ana Carolina",
    clientId: "1",
    value: 45000,
    profit: 6750,
    destination: "Paris, França",
    period: "15-25 Mar 2025",
    status: "aceito",
    timeIdle: "-",
    createdAt: "05/01/2025",
    diasSemResposta: 0,
  },
  {
    id: "2",
    title: "Honeymoon Maldivas Premium",
    client: "Carlos Lima",
    clientId: "2",
    value: 18500,
    profit: 2775,
    destination: "Maldivas",
    period: "10-20 Abr 2025",
    status: "enviado",
    timeIdle: "2 dias",
    createdAt: "12/01/2025",
    expiresAt: "22/01/2025",
    riskLevel: "baixo",
    diasSemResposta: 2,
  },
  {
    id: "3",
    title: "Férias em Família - Caribe",
    client: "Maria Silva",
    clientId: "3",
    value: 22000,
    profit: 3300,
    destination: "Punta Cana",
    period: "01-10 Jul 2025",
    status: "enviado",
    timeIdle: "5 dias",
    createdAt: "08/01/2025",
    expiresAt: "18/01/2025",
    riskLevel: "medio",
    diasSemResposta: 5,
  },
  {
    id: "4",
    title: "Europa Clássica - Lisboa",
    client: "João Santos",
    clientId: "4",
    value: 9000,
    profit: 1350,
    destination: "Lisboa, Porto",
    period: "20-30 Jun 2025",
    status: "enviado",
    timeIdle: "10 dias",
    createdAt: "03/01/2025",
    expiresAt: "13/01/2025",
    riskLevel: "alto",
    diasSemResposta: 10,
  },
  {
    id: "5",
    title: "Escapada Gramado",
    client: "Fernanda Costa",
    clientId: "5",
    value: 6500,
    profit: 975,
    destination: "Gramado, RS",
    period: "05-10 Fev 2025",
    status: "aceito",
    timeIdle: "-",
    createdAt: "20/12/2024",
    diasSemResposta: 0,
  },
  {
    id: "6",
    title: "Safari África Premium",
    client: "Ricardo Mendes",
    clientId: "6",
    value: 78000,
    profit: 11700,
    destination: "Tanzânia",
    status: "recusado",
    timeIdle: "-",
    period: "Mar 2025",
    createdAt: "02/01/2025",
    riskLevel: "alto",
    diasSemResposta: 0,
  },
];

// ────────────────────────────────────────────────────────────────────────────────
// TAREFAS
// ────────────────────────────────────────────────────────────────────────────────

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: string;
  priority: "urgent" | "high" | "medium" | "low";
  status: "pending" | "in_progress" | "completed";
  category: "followup" | "orcamento" | "cliente" | "geral";
  relatedClient?: string;
  relatedClientId?: string;
}

export const mockTasks: Task[] = [
  {
    id: "1",
    title: "Follow-up com Maria Silva",
    description: "Sem resposta há 5 dias, orçamento Caribe em negociação",
    dueDate: "2025-01-20",
    priority: "urgent",
    status: "pending",
    category: "followup",
    relatedClient: "Maria Silva",
    relatedClientId: "3",
  },
  {
    id: "2",
    title: "Revisar pagamento de Ana Carolina",
    description: "Confirmar entrada do pagamento do pacote Paris",
    dueDate: "2025-01-20",
    priority: "high",
    status: "pending",
    category: "cliente",
    relatedClient: "Ana Carolina",
    relatedClientId: "1",
  },
  {
    id: "3",
    title: "Enviar novo contato para João Santos",
    description: "Orçamento parado há 10 dias, tentar reativar interesse",
    dueDate: "2025-01-21",
    priority: "high",
    status: "pending",
    category: "followup",
    relatedClient: "João Santos",
    relatedClientId: "4",
  },
  {
    id: "4",
    title: "Feedback pós-venda Fernanda Costa",
    description: "Coletar avaliação da viagem a Gramado",
    dueDate: "2025-01-22",
    priority: "medium",
    status: "pending",
    category: "followup",
    relatedClient: "Fernanda Costa",
    relatedClientId: "5",
  },
  {
    id: "5",
    title: "Verificar documentação Carlos Lima",
    description: "Confirmar passaportes e vistos para Maldivas",
    dueDate: "2025-01-25",
    priority: "medium",
    status: "pending",
    category: "cliente",
    relatedClient: "Carlos Lima",
    relatedClientId: "2",
  },
];

// ────────────────────────────────────────────────────────────────────────────────
// FOLLOW-UPS
// ────────────────────────────────────────────────────────────────────────────────

export interface FollowUp {
  id: string;
  clientId: string;
  clientName: string;
  destination: string;
  budgetValue: number;
  reason: "sem_resposta" | "interesse_esfriando" | "preco_alto" | "pos_venda" | "reativar";
  lastContact: string;
  daysIdle: number;
  priority: "urgent" | "high" | "medium" | "low";
  suggestedChannel: "whatsapp" | "email" | "phone" | "instagram";
  tripType: "internacional" | "nacional";
  notes?: string;
}

export const mockFollowups: FollowUp[] = [
  {
    id: "1",
    clientId: "3",
    clientName: "Maria Silva",
    destination: "Caribe",
    budgetValue: 22000,
    reason: "sem_resposta",
    lastContact: "2025-01-15",
    daysIdle: 5,
    priority: "urgent",
    suggestedChannel: "whatsapp",
    tripType: "internacional",
    notes: "Família com crianças, mostrou muito interesse inicial",
  },
  {
    id: "2",
    clientId: "4",
    clientName: "João Santos",
    destination: "Lisboa",
    budgetValue: 9000,
    reason: "interesse_esfriando",
    lastContact: "2025-01-10",
    daysIdle: 10,
    priority: "high",
    suggestedChannel: "whatsapp",
    tripType: "internacional",
    notes: "Primeira viagem internacional, pode estar inseguro",
  },
  {
    id: "3",
    clientId: "2",
    clientName: "Carlos Lima",
    destination: "Maldivas",
    budgetValue: 18500,
    reason: "sem_resposta",
    lastContact: "2025-01-18",
    daysIdle: 2,
    priority: "medium",
    suggestedChannel: "email",
    tripType: "internacional",
    notes: "Cliente premium, orçamento recém enviado",
  },
  {
    id: "4",
    clientId: "5",
    clientName: "Fernanda Costa",
    destination: "Gramado",
    budgetValue: 6500,
    reason: "pos_venda",
    lastContact: "2025-01-17",
    daysIdle: 3,
    priority: "low",
    suggestedChannel: "whatsapp",
    tripType: "nacional",
    notes: "Viagem concluída, coletar feedback e avaliação",
  },
];

// ────────────────────────────────────────────────────────────────────────────────
// PRIORIDADES DO DIA
// ────────────────────────────────────────────────────────────────────────────────

export interface Priority {
  id: string;
  title: string;
  description: string;
  type: "urgent" | "warning" | "info";
  time?: string;
  category: "followup" | "orcamento" | "cliente" | "viagem";
  relatedClientId?: string;
  value?: number;
}

export const mockPriorities: Priority[] = [
  {
    id: "1",
    title: "Follow-up: Maria Silva",
    description: "Orçamento Caribe sem resposta há 5 dias",
    type: "urgent",
    time: "R$ 22.000 em risco",
    category: "followup",
    relatedClientId: "3",
    value: 22000,
  },
  {
    id: "2",
    title: "Orçamento parado: João Santos",
    description: "Lisboa - 10 dias sem contato",
    type: "urgent",
    time: "Risco alto de perda",
    category: "orcamento",
    relatedClientId: "4",
    value: 9000,
  },
  {
    id: "3",
    title: "Confirmar pagamento: Ana Carolina",
    description: "Entrada do pacote Paris",
    type: "warning",
    time: "Vence hoje",
    category: "cliente",
    relatedClientId: "1",
    value: 45000,
  },
  {
    id: "4",
    title: "Pós-venda: Fernanda Costa",
    description: "Coletar feedback da viagem a Gramado",
    type: "info",
    time: "Fidelização",
    category: "followup",
    relatedClientId: "5",
  },
];

// ────────────────────────────────────────────────────────────────────────────────
// DASHBOARD — DADOS FINANCEIROS
// ────────────────────────────────────────────────────────────────────────────────

export const mockDashboardData = {
  // Faturamento do mês (orçamentos aceitos)
  monthlyRevenue: 51500, // Ana Carolina + Fernanda Costa
  monthlyProfit: 7725, // 15% margem
  profitMargin: 15,
  
  // Variações vs mês anterior
  revenueChange: 18,
  profitChange: 22,
  
  // Orçamentos abertos (em negociação)
  totalOpenBudgets: 49500, // Carlos + Maria + João
  openBudgetsCount: 3,
  
  // Clientes ativos
  activeClients: 5,
  activeClientsChange: 2,
  
  // Conversão
  conversionRate: 40, // 2 aceitos de 5 orçamentos
  conversionRateChange: 8,
  
  // Viagens do mês
  tripsThisMonth: 1, // Fernanda Costa (Gramado)
};

// ────────────────────────────────────────────────────────────────────────────────
// RELATÓRIOS — DADOS DE ANÁLISE
// ────────────────────────────────────────────────────────────────────────────────

export interface ReportData {
  // Orçamentos
  totalBudgetsSent: number;
  totalConverted: number;
  totalLost: number;
  averageTicket: number;
  
  // Tempo de decisão
  averageDecisionDays: number;
  
  // Destinos
  topQuotedDestinations: { destination: string; count: number }[];
  topSoldDestinations: { destination: string; count: number; value: number }[];
  
  // Conversão por tipo
  conversionByTripType: { type: string; rate: number }[];
  
  // Gargalos identificados
  bottlenecks: {
    id: string;
    title: string;
    description: string;
    impact: "alto" | "medio" | "baixo";
    category: string;
  }[];
}

export const mockReportData: ReportData = {
  totalBudgetsSent: 5,
  totalConverted: 2,
  totalLost: 0,
  averageTicket: 20200,
  averageDecisionDays: 7,
  
  topQuotedDestinations: [
    { destination: "Europa", count: 3 },
    { destination: "Caribe", count: 2 },
    { destination: "Maldivas", count: 1 },
    { destination: "Nacional", count: 1 },
  ],
  
  topSoldDestinations: [
    { destination: "Paris, França", count: 1, value: 45000 },
    { destination: "Gramado, RS", count: 1, value: 6500 },
  ],
  
  conversionByTripType: [
    { type: "Lua de Mel", rate: 67 },
    { type: "Família", rate: 45 },
    { type: "Nacional", rate: 80 },
    { type: "Primeira Viagem", rate: 30 },
  ],
  
  bottlenecks: [
    {
      id: "1",
      title: "Follow-ups atrasados",
      description: "2 clientes sem contato há mais de 5 dias",
      impact: "alto",
      category: "followup",
    },
    {
      id: "2",
      title: "Orçamentos de alto valor parados",
      description: "R$ 31.000 em orçamentos sem movimentação",
      impact: "alto",
      category: "orcamento",
    },
    {
      id: "3",
      title: "Pós-venda pendente",
      description: "1 cliente aguardando follow-up de fidelização",
      impact: "medio",
      category: "posvenda",
    },
  ],
};

// ────────────────────────────────────────────────────────────────────────────────
// TREINAMENTO — MÓDULOS VISUAIS
// ────────────────────────────────────────────────────────────────────────────────

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  lessons: number;
  completedLessons: number;
  status: "available" | "in_progress" | "completed" | "locked";
}

export const mockTrainingModules: TrainingModule[] = [
  {
    id: "uso-nia",
    title: "Como usar a N.IA no dia a dia",
    description: "Aprenda a conversar com a N.IA para organizar sua rotina, criar tarefas e receber alertas inteligentes.",
    lessons: 5,
    completedLessons: 5,
    status: "completed",
  },
  {
    id: "orcamentos-profissionais",
    title: "Como criar orçamentos profissionais com a N.IA",
    description: "Crie propostas premium com layout padronizado e linguagem profissional.",
    lessons: 6,
    completedLessons: 2,
    status: "in_progress",
  },
  {
    id: "organizar-tarefas",
    title: "Como organizar tarefas pela N.IA",
    description: "Use comandos de voz ou texto para criar e gerenciar tarefas automaticamente.",
    lessons: 4,
    completedLessons: 0,
    status: "available",
  },
  {
    id: "padronizar-atendimento",
    title: "Como padronizar atendimento da equipe",
    description: "Estabeleça padrões de qualidade e consistência no atendimento ao cliente.",
    lessons: 5,
    completedLessons: 0,
    status: "locked",
  },
];

// ────────────────────────────────────────────────────────────────────────────────
// CLIENTES MAIS VALIOSOS (para dashboard)
// ────────────────────────────────────────────────────────────────────────────────

export interface ValuableClient {
  id: string;
  name: string;
  destination: string;
  status: "lead" | "negotiating" | "confirmed" | "traveling";
  value?: number;
  margin?: number;
}

export const mockValuableClients: ValuableClient[] = [
  {
    id: "1",
    name: "Ana Carolina",
    destination: "Paris, França",
    status: "confirmed",
    value: 45000,
    margin: 6750,
  },
  {
    id: "2",
    name: "Carlos Lima",
    destination: "Maldivas",
    status: "negotiating",
    value: 18500,
    margin: 2775,
  },
  {
    id: "3",
    name: "Maria Silva",
    destination: "Caribe",
    status: "negotiating",
    value: 22000,
    margin: 3300,
  },
  {
    id: "4",
    name: "João Santos",
    destination: "Lisboa, Portugal",
    status: "negotiating",
    value: 9000,
    margin: 1350,
  },
];

// ────────────────────────────────────────────────────────────────────────────────
// INSIGHTS AUTOMÁTICOS DA NIA (TRIPÉ: O QUE / POR QUE / O QUE FAZER)
// ────────────────────────────────────────────────────────────────────────────────

export interface NiaInsight {
  id: string;
  what: string; // O que está acontecendo
  why: string; // Por que isso importa
  action: string; // O que fazer agora
  priority: "critical" | "warning" | "info";
  relatedValue?: number;
  category: "financeiro" | "operacional" | "cliente" | "gargalo";
  // Actionable insight metadata
  isActionable: boolean;
  actionLabel?: string; // Label for the action button/link
  relatedEntityCount?: number; // Count of related entities (e.g., "2 clientes")
}

// Função para gerar insights automáticos baseados nos dados
export function generateNiaInsights(): NiaInsight[] {
  const insights: NiaInsight[] = [];
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ANÁLISE DE RISCO DE CHARGEBACK
  // Prioridade máxima: proteger o caixa da agência
  // ═══════════════════════════════════════════════════════════════════════════
  
  // Identificar orçamentos com alto risco de chargeback
  const highRiskBudgets = mockBudgets.filter(b => {
    if (b.status !== "enviado" && b.status !== "aceito") return false;
    
    // Fatores de risco de chargeback
    const client = mockClients.find(c => c.id === b.clientId);
    const isNewClient = client ? !client.valorLifetime || client.valorLifetime < 10000 : true;
    const isHighValue = b.value > 15000;
    
    // Cliente novo + valor alto = risco elevado
    return isNewClient && isHighValue;
  });
  
  if (highRiskBudgets.length > 0) {
    const totalRisk = highRiskBudgets.reduce((sum, b) => sum + b.value, 0);
    insights.push({
      id: "chargeback-risk",
      what: `${highRiskBudgets.length} orçamento${highRiskBudgets.length > 1 ? 's' : ''} com risco elevado de chargeback`,
      why: `${formatCurrency(totalRisk)} podem virar prejuízo se o cliente contestar. Clientes novos com valores altos são os principais causadores.`,
      action: "Revise contratos e políticas antes de emitir",
      priority: "critical",
      relatedValue: totalRisk,
      category: "financeiro",
      isActionable: true,
      actionLabel: "Ver orçamentos em risco",
      relatedEntityCount: highRiskBudgets.length,
    });
  }
  
  // Verificar viagens próximas (menos de 7 dias) - alto risco
  const upcomingTrips = mockBudgets.filter(b => {
    if (b.status !== "aceito") return false;
    // Simular datas de viagem
    const tripDate = new Date();
    tripDate.setDate(tripDate.getDate() + 5); // Simulação
    const daysUntil = Math.floor((tripDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return daysUntil < 7 && daysUntil >= 0;
  });
  
  if (upcomingTrips.length > 0) {
    insights.push({
      id: "trip-urgency-risk",
      what: `${upcomingTrips.length} viagem${upcomingTrips.length > 1 ? 's' : ''} em menos de 7 dias`,
      why: "Viagens muito próximas têm maior risco de cancelamento e chargeback por arrependimento.",
      action: "Confirme documentação e obtenha aceite formal do cliente",
      priority: "warning",
      category: "operacional",
      isActionable: true,
      actionLabel: "Ver viagens próximas",
      relatedEntityCount: upcomingTrips.length,
    });
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ANÁLISE DE ORÇAMENTOS EM RISCO (FOLLOW-UP)
  // ═══════════════════════════════════════════════════════════════════════════
  
  const budgetsAtRisk = mockBudgets.filter(b => 
    b.status === "enviado" && (b.diasSemResposta || 0) >= 5
  );
  const totalAtRisk = budgetsAtRisk.reduce((sum, b) => sum + b.value, 0);
  
  if (budgetsAtRisk.length > 0) {
    insights.push({
      id: "orcamentos-risco",
      what: `${budgetsAtRisk.length} orçamento${budgetsAtRisk.length > 1 ? 's' : ''} parado${budgetsAtRisk.length > 1 ? 's' : ''} há mais de 5 dias`,
      why: `${formatCurrency(totalAtRisk)} em risco de perda. Clientes esfriam rápido após 7 dias sem contato.`,
      action: "Priorize follow-up hoje com Maria Silva e João Santos",
      priority: "critical",
      relatedValue: totalAtRisk,
      category: "financeiro",
      isActionable: true,
      actionLabel: "Ver orçamentos parados",
      relatedEntityCount: budgetsAtRisk.length,
    });
  }
  
  // ═══════════════════════════════════════════════════════════════════════════
  // ANÁLISE DE CONVERSÃO E MARGEM
  // ═══════════════════════════════════════════════════════════════════════════
  
  const taxaAtual = mockDashboardData.conversionRate;
  if (taxaAtual >= 35) {
    insights.push({
      id: "conversao-positiva",
      what: `Taxa de conversão em ${taxaAtual}%, ${mockDashboardData.conversionRateChange}% acima do mês anterior`,
      why: "Seu atendimento está convertendo bem. Manter esse ritmo pode aumentar o faturamento em 20%.",
      action: "Continue priorizando atendimento personalizado",
      priority: "info",
      category: "operacional",
      isActionable: false, // Informative insight - no direct action
    });
  }
  
  // Pós-venda pendente
  const posVendaPendentes = mockClients.filter(c => c.status === "pos-venda");
  if (posVendaPendentes.length > 0) {
    insights.push({
      id: "pos-venda",
      what: `${posVendaPendentes.length} cliente${posVendaPendentes.length > 1 ? 's' : ''} aguardando follow-up pós-venda`,
      why: "Clientes satisfeitos indicam em média 2 novos leads. Sem feedback, você perde essa oportunidade.",
      action: "Colete feedback de Fernanda Costa para fortalecer relacionamento",
      priority: "warning",
      category: "cliente",
      isActionable: true,
      actionLabel: "Ver clientes pós-venda",
      relatedEntityCount: posVendaPendentes.length,
    });
  }
  
  return insights.sort((a, b) => {
    const priorityOrder = { critical: 0, warning: 1, info: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

// Insight principal para o dashboard (o mais crítico)
export function getPrimaryInsight(): { text: string; insight: NiaInsight | null } {
  const insights = generateNiaInsights();
  const primary = insights[0];
  
  if (!primary) {
    return { 
      text: "Sua operação está saudável. Continue monitorando os orçamentos em andamento.",
      insight: null 
    };
  }
  
  return {
    text: `${primary.what}. ${primary.why} ${primary.action}.`,
    insight: primary,
  };
}

// Legacy export for backward compatibility
export const mockNiaInsight = getPrimaryInsight().text;

// ────────────────────────────────────────────────────────────────────────────────
// LEADS PARA PRIORIZAÇÃO INTELIGENTE
// ────────────────────────────────────────────────────────────────────────────────

import { classifyMargin, type MarginClassification } from "@/utils/marginEngine";
import type { LeadPriorityData } from "@/utils/leadPrioritization";

export const mockLeadPriorityData: LeadPriorityData[] = [
  {
    clientId: "1",
    clientName: "Ana Carolina",
    destination: "Paris, França",
    budgetValue: 45000,
    estimatedCost: 38250,
    estimatedMarginPercent: 15,
    marginClassification: "saudavel",
    temperature: "quente",
    riskLevel: "baixo",
    isRecurrent: true,
    dataComplete: true,
    daysWithoutResponse: 0,
    daysUntilTrip: 55,
    paymentMethod: "pix",
    hasWrittenConfirmation: true,
    budgetValidated: true,
  },
  {
    clientId: "2",
    clientName: "Carlos Lima",
    destination: "Maldivas",
    budgetValue: 18500,
    estimatedCost: 15725,
    estimatedMarginPercent: 15,
    marginClassification: "saudavel",
    temperature: "quente",
    riskLevel: "baixo",
    isRecurrent: false,
    dataComplete: true,
    daysWithoutResponse: 2,
    daysUntilTrip: 80,
    paymentMethod: "cartao_credito",
    hasWrittenConfirmation: false,
    budgetValidated: true,
  },
  {
    clientId: "3",
    clientName: "Maria Silva",
    destination: "Caribe",
    budgetValue: 22000,
    estimatedCost: 19360,
    estimatedMarginPercent: 12,
    marginClassification: "aceitavel",
    temperature: "morno",
    riskLevel: "medio",
    isRecurrent: false,
    dataComplete: true,
    daysWithoutResponse: 5,
    daysUntilTrip: 165,
    hasWrittenConfirmation: false,
    budgetValidated: true,
  },
  {
    clientId: "4",
    clientName: "João Santos",
    destination: "Lisboa, Portugal",
    budgetValue: 9000,
    estimatedCost: 8100,
    estimatedMarginPercent: 10,
    marginClassification: "limite_operacional",
    temperature: "frio",
    riskLevel: "alto",
    isRecurrent: false,
    dataComplete: false,
    daysWithoutResponse: 10,
    daysUntilTrip: 150,
    paymentMethod: "cartao_credito",
    hasWrittenConfirmation: false,
    budgetValidated: false,
  },
  {
    clientId: "5",
    clientName: "Fernanda Costa",
    destination: "Gramado, RS",
    budgetValue: 6500,
    estimatedCost: 5200,
    estimatedMarginPercent: 20,
    marginClassification: "saudavel",
    temperature: "morno",
    riskLevel: "baixo",
    isRecurrent: true,
    dataComplete: true,
    daysWithoutResponse: 3,
    hasWrittenConfirmation: true,
    budgetValidated: true,
  },
];

// Helpers are now defined at the top of the file
