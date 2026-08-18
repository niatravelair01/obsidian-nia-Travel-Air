import { useState, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// HOOK: BUDGET CREATION STATE
// 
// Gerencia o estado completo do orçamento durante a criação guiada ou livre.
// A NIA nunca assume dados não confirmados.
// ═══════════════════════════════════════════════════════════════════════════════

export interface BudgetProfile {
  // Etapa 1 - Perguntas Estratégicas
  isReturningClient: "sim" | "nao" | "nao_sei" | null;
  decisionProfile: "rapido" | "indeciso" | "nao_sei" | null;
  hasReferencePrice: "sim" | "nao" | "nao_sei" | null;
  tripFocus: "preco" | "conforto" | "experiencia" | "equilibrio" | "nao_sei" | null;
  tripOccasion: "lazer" | "lua_de_mel" | "familia" | "trabalho" | "presente" | "outro" | null;
  datesFlexible: "sim" | "nao" | "nao_sei" | null;
  destinationFlexible: "sim" | "nao" | "nao_sei" | null;
  hotelCategoryFlexible: "sim" | "nao" | "nao_sei" | null;
  budgetCeiling: number | null;
  budgetCeilingUnknown: boolean;
  desiredMargin: number | null;
  urgentTrip: "sim" | "nao" | null; // Viagem em menos de 7 dias
  budgetStage: "primeira_conversa" | "ajuste" | "final" | null;
}

export interface FlightDetails {
  id: string;
  type: "ida" | "volta";
  airline: string;
  flightNumber: string;
  originAirport: string;
  destinationAirport: string;
  departureTime: string;
  arrivalTime: string;
  connections: string;
  baggage: "mao" | "despachada" | "ambas" | "";
  notes: string;
  confirmed: boolean;
}

export interface BudgetData {
  // Dados básicos
  clientId: string | null;
  clientName: string;
  destination: string;
  period: string;
  
  // Perfil estratégico
  profile: BudgetProfile;
  
  // Detalhes operacionais
  flights: FlightDetails[];
  
  // Valores
  totalValue: number | null;
  estimatedMargin: number | null;
  
  // Status
  riskLevel: "baixo" | "medio" | "alto" | null;
  riskReasons: string[];
  
  // Metadados
  createdAt: Date;
  lastModified: Date;
}

export type BudgetStep = 
  | "profile" // Etapa 1 - Perguntas estratégicas
  | "details" // Etapa 2 - Detalhamento operacional
  | "review"  // Etapa 3 - Revisão e confirmação
  | "complete"; // Concluído

const createEmptyProfile = (): BudgetProfile => ({
  isReturningClient: null,
  decisionProfile: null,
  hasReferencePrice: null,
  tripFocus: null,
  tripOccasion: null,
  datesFlexible: null,
  destinationFlexible: null,
  hotelCategoryFlexible: null,
  budgetCeiling: null,
  budgetCeilingUnknown: false,
  desiredMargin: null,
  urgentTrip: null,
  budgetStage: null,
});

const createEmptyBudget = (): BudgetData => ({
  clientId: null,
  clientName: "",
  destination: "",
  period: "",
  profile: createEmptyProfile(),
  flights: [],
  totalValue: null,
  estimatedMargin: null,
  riskLevel: null,
  riskReasons: [],
  createdAt: new Date(),
  lastModified: new Date(),
});

export function useBudgetCreation() {
  const [currentStep, setCurrentStep] = useState<BudgetStep>("profile");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [budgetData, setBudgetData] = useState<BudgetData>(createEmptyBudget());
  const [mode, setMode] = useState<"guided" | "free">("guided");
  const [isProcessing, setIsProcessing] = useState(false);
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    field: string;
    value: any;
    displayText: string;
  } | null>(null);

  // Perguntas do fluxo guiado
  const questions = [
    {
      id: "isReturningClient",
      question: "O cliente já viajou com a agência antes?",
      field: "isReturningClient" as keyof BudgetProfile,
      options: [
        { value: "sim", label: "Sim" },
        { value: "nao", label: "Não" },
        { value: "nao_sei", label: "Não sei" },
      ],
    },
    {
      id: "decisionProfile",
      question: "Qual é o perfil de decisão do cliente?",
      field: "decisionProfile" as keyof BudgetProfile,
      options: [
        { value: "rapido", label: "Decide rápido" },
        { value: "indeciso", label: "Indeciso, precisa de tempo" },
        { value: "nao_sei", label: "Não sei ainda" },
      ],
    },
    {
      id: "hasReferencePrice",
      question: "O cliente já tem preço de referência?",
      field: "hasReferencePrice" as keyof BudgetProfile,
      options: [
        { value: "sim", label: "Sim, já pesquisou" },
        { value: "nao", label: "Não tem referência" },
        { value: "nao_sei", label: "Não sei" },
      ],
    },
    {
      id: "tripFocus",
      question: "Qual é o foco principal da viagem?",
      field: "tripFocus" as keyof BudgetProfile,
      options: [
        { value: "preco", label: "Menor preço possível" },
        { value: "conforto", label: "Conforto" },
        { value: "experiencia", label: "Experiência única" },
        { value: "equilibrio", label: "Equilíbrio custo-benefício" },
        { value: "nao_sei", label: "Não sei" },
      ],
    },
    {
      id: "tripOccasion",
      question: "Qual é a ocasião da viagem?",
      field: "tripOccasion" as keyof BudgetProfile,
      options: [
        { value: "lazer", label: "Lazer" },
        { value: "lua_de_mel", label: "Lua de mel" },
        { value: "familia", label: "Família" },
        { value: "trabalho", label: "Trabalho" },
        { value: "presente", label: "Presente" },
        { value: "outro", label: "Outro" },
      ],
    },
    {
      id: "datesFlexible",
      question: "As datas são flexíveis?",
      field: "datesFlexible" as keyof BudgetProfile,
      options: [
        { value: "sim", label: "Sim, flexíveis" },
        { value: "nao", label: "Não, datas fixas" },
        { value: "nao_sei", label: "Não sei" },
      ],
    },
    {
      id: "destinationFlexible",
      question: "O destino é flexível?",
      field: "destinationFlexible" as keyof BudgetProfile,
      options: [
        { value: "sim", label: "Sim, aceita sugestões" },
        { value: "nao", label: "Não, destino definido" },
        { value: "nao_sei", label: "Não sei" },
      ],
    },
    {
      id: "hotelCategoryFlexible",
      question: "A categoria de hotel é flexível?",
      field: "hotelCategoryFlexible" as keyof BudgetProfile,
      options: [
        { value: "sim", label: "Sim, flexível" },
        { value: "nao", label: "Não, categoria definida" },
        { value: "nao_sei", label: "Não sei" },
      ],
    },
    {
      id: "budgetCeiling",
      question: "Existe um teto de orçamento?",
      field: "budgetCeiling" as keyof BudgetProfile,
      type: "currency",
      allowUnknown: true,
    },
    {
      id: "desiredMargin",
      question: "Qual a margem mínima desejada?",
      field: "desiredMargin" as keyof BudgetProfile,
      type: "percentage",
      placeholder: "Ex: 15",
    },
    {
      id: "urgentTrip",
      question: "A viagem é em menos de 7 dias?",
      field: "urgentTrip" as keyof BudgetProfile,
      options: [
        { value: "sim", label: "Sim, urgente" },
        { value: "nao", label: "Não" },
      ],
    },
    {
      id: "budgetStage",
      question: "Em qual estágio está esse orçamento?",
      field: "budgetStage" as keyof BudgetProfile,
      options: [
        { value: "primeira_conversa", label: "Primeira conversa" },
        { value: "ajuste", label: "Ajuste de proposta" },
        { value: "final", label: "Fechamento final" },
      ],
    },
  ];

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  // Atualizar campo do perfil
  const updateProfile = useCallback((field: keyof BudgetProfile, value: any) => {
    setBudgetData(prev => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
      lastModified: new Date(),
    }));
  }, []);

  // Atualizar dados gerais do orçamento
  const updateBudget = useCallback((updates: Partial<BudgetData>) => {
    setBudgetData(prev => ({
      ...prev,
      ...updates,
      lastModified: new Date(),
    }));
  }, []);

  // Responder pergunta atual e avançar
  const answerQuestion = useCallback((value: any) => {
    if (!currentQuestion) return;
    
    updateProfile(currentQuestion.field, value);
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Concluiu todas as perguntas, avançar para detalhamento
      setCurrentStep("details");
    }
  }, [currentQuestion, currentQuestionIndex, questions.length, updateProfile]);

  // Voltar para pergunta anterior
  const previousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  }, [currentQuestionIndex]);

  // Adicionar voo
  const addFlight = useCallback((type: "ida" | "volta") => {
    const newFlight: FlightDetails = {
      id: Date.now().toString(),
      type,
      airline: "",
      flightNumber: "",
      originAirport: "",
      destinationAirport: "",
      departureTime: "",
      arrivalTime: "",
      connections: "",
      baggage: "",
      notes: "",
      confirmed: false,
    };
    
    setBudgetData(prev => ({
      ...prev,
      flights: [...prev.flights, newFlight],
      lastModified: new Date(),
    }));
    
    return newFlight.id;
  }, []);

  // Atualizar voo
  const updateFlight = useCallback((flightId: string, updates: Partial<FlightDetails>) => {
    setBudgetData(prev => ({
      ...prev,
      flights: prev.flights.map(f => 
        f.id === flightId ? { ...f, ...updates } : f
      ),
      lastModified: new Date(),
    }));
  }, []);

  // Confirmar voo (após revisão do usuário)
  const confirmFlight = useCallback((flightId: string) => {
    updateFlight(flightId, { confirmed: true });
  }, [updateFlight]);

  // Remover voo
  const removeFlight = useCallback((flightId: string) => {
    setBudgetData(prev => ({
      ...prev,
      flights: prev.flights.filter(f => f.id !== flightId),
      lastModified: new Date(),
    }));
  }, []);

  // Analisar riscos do orçamento
  const analyzeRisks = useCallback(() => {
    const risks: string[] = [];
    const { profile } = budgetData;
    
    // Viagem urgente
    if (profile.urgentTrip === "sim") {
      risks.push("Viagem urgente (menos de 7 dias) aumenta risco de problemas");
    }
    
    // Cliente com referência de preço + foco em preço
    if (profile.hasReferencePrice === "sim" && profile.tripFocus === "preco") {
      risks.push("Cliente com referência de preço e foco em menor valor - margem pode ser pressionada");
    }
    
    // Cliente indeciso
    if (profile.decisionProfile === "indeciso") {
      risks.push("Cliente indeciso pode demorar a fechar ou desistir");
    }
    
    // Margem baixa
    if (profile.desiredMargin !== null && profile.desiredMargin < 10) {
      risks.push("Margem abaixo de 10% é arriscada para a operação");
    }
    
    // Primeira conversa + urgente
    if (profile.budgetStage === "primeira_conversa" && profile.urgentTrip === "sim") {
      risks.push("Primeira conversa com viagem urgente - risco de expectativas desalinhadas");
    }
    
    // Definir nível de risco
    let riskLevel: "baixo" | "medio" | "alto" = "baixo";
    if (risks.length >= 3) {
      riskLevel = "alto";
    } else if (risks.length >= 1) {
      riskLevel = "medio";
    }
    
    updateBudget({ riskLevel, riskReasons: risks });
    
    return { riskLevel, risks };
  }, [budgetData, updateBudget]);

  // Pular para etapa
  const goToStep = useCallback((step: BudgetStep) => {
    setCurrentStep(step);
  }, []);

  // Resetar criação
  const reset = useCallback(() => {
    setBudgetData(createEmptyBudget());
    setCurrentStep("profile");
    setCurrentQuestionIndex(0);
    setPendingConfirmation(null);
  }, []);

  // Verificar se perfil está completo
  const isProfileComplete = useCallback(() => {
    const { profile } = budgetData;
    const requiredFields: (keyof BudgetProfile)[] = [
      "isReturningClient",
      "decisionProfile",
      "tripFocus",
      "tripOccasion",
      "datesFlexible",
      "budgetStage",
    ];
    
    return requiredFields.every(field => profile[field] !== null);
  }, [budgetData]);

  // Verificar se detalhes estão completos
  const isDetailsComplete = useCallback(() => {
    return budgetData.flights.length > 0 && 
           budgetData.flights.every(f => f.confirmed);
  }, [budgetData]);

  return {
    // Estado
    currentStep,
    currentQuestionIndex,
    currentQuestion,
    questions,
    progress,
    budgetData,
    mode,
    isProcessing,
    pendingConfirmation,
    
    // Ações - Perguntas
    answerQuestion,
    previousQuestion,
    updateProfile,
    
    // Ações - Voos
    addFlight,
    updateFlight,
    confirmFlight,
    removeFlight,
    
    // Ações - Geral
    updateBudget,
    analyzeRisks,
    goToStep,
    reset,
    setMode,
    setIsProcessing,
    setPendingConfirmation,
    
    // Validações
    isProfileComplete,
    isDetailsComplete,
  };
}
