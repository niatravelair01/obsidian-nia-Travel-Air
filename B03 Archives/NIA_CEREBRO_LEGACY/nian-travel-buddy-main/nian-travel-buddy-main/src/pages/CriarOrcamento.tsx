import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { GuidedBudgetFlow } from "@/components/orcamentos/GuidedBudgetFlow";
import { FreeBudgetFlow } from "@/components/orcamentos/FreeBudgetFlow";
import { BudgetReviewStep } from "@/components/orcamentos/BudgetReviewStep";
import { BudgetDetailFlow } from "@/components/orcamentos/BudgetDetailFlow";
import { BudgetData, useBudgetCreation } from "@/hooks/useBudgetCreation";
import { useToast } from "@/hooks/use-toast";

// ═══════════════════════════════════════════════════════════════════════════════
// CRIAR ORÇAMENTO — PÁGINA COMPLETA
// 
// Gerencia o fluxo completo de criação:
//   1. Perfil (guiado ou livre)
//   2. Detalhes (voos, hotel)
//   3. Revisão e PDF
// ═══════════════════════════════════════════════════════════════════════════════

type CreationStep = 'profile' | 'details' | 'review';

export default function CriarOrcamento() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  const mode = (searchParams.get('mode') as 'guided' | 'free') || 'guided';
  const [currentStep, setCurrentStep] = useState<CreationStep>('profile');
  const [budgetData, setBudgetData] = useState<BudgetData | null>(null);

  const {
    budgetData: hookBudgetData,
    addFlight,
    updateFlight,
    confirmFlight,
    removeFlight,
    analyzeRisks,
    reset,
  } = useBudgetCreation();

  // Reset on mount
  useEffect(() => {
    reset();
  }, []);

  const handleProfileComplete = (data: BudgetData) => {
    setBudgetData(data);
    // Analisar riscos após perfil completo
    analyzeRisks();
    setCurrentStep('details');
  };

  const handleDetailsComplete = () => {
    setCurrentStep('review');
  };

  const handleReviewComplete = () => {
    toast({
      title: "Orçamento salvo!",
      description: "O PDF foi gerado com sucesso.",
    });
    navigate('/orcamentos');
  };

  const handleCancel = () => {
    navigate('/orcamentos');
  };

  const handleBack = () => {
    if (currentStep === 'review') {
      setCurrentStep('details');
    } else if (currentStep === 'details') {
      setCurrentStep('profile');
    } else {
      navigate('/orcamentos');
    }
  };

  return (
    <MainLayout>
      <div className="h-full bg-background">
        {/* Step: Profile */}
        {currentStep === 'profile' && mode === 'guided' && (
          <GuidedBudgetFlow
            onComplete={handleProfileComplete}
            onCancel={handleCancel}
          />
        )}
        
        {currentStep === 'profile' && mode === 'free' && (
          <FreeBudgetFlow
            onComplete={handleProfileComplete}
            onCancel={handleCancel}
          />
        )}

        {/* Step: Details */}
        {currentStep === 'details' && budgetData && (
          <BudgetDetailFlow
            flights={hookBudgetData.flights}
            onAddFlight={addFlight}
            onUpdateFlight={updateFlight}
            onConfirmFlight={confirmFlight}
            onRemoveFlight={removeFlight}
            onComplete={handleDetailsComplete}
            onBack={handleBack}
          />
        )}

        {/* Step: Review */}
        {currentStep === 'review' && (
          <BudgetReviewStep
            budgetData={budgetData || hookBudgetData}
            onBack={handleBack}
            onComplete={handleReviewComplete}
          />
        )}
      </div>
    </MainLayout>
  );
}
