import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING TOUR — TOUR VISUAL GUIADO (5 PASSOS FIXOS)
// - Auto-inicia apenas no primeiro acesso
// - Trava scroll durante o tour
// - Cancela automaticamente ao mudar de rota
// - A NIA permanece passiva durante o tour
// ═══════════════════════════════════════════════════════════════════════════════

export interface TourStep {
  target: string; // CSS selector
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
}

// 5 passos fixos na ordem correta
const TOUR_STEPS: TourStep[] = [
  {
    target: "[data-tour='dashboard']",
    title: "1. Dashboard",
    description: "Visão geral do seu painel principal. Aqui você acompanha prioridades, resumo financeiro, orçamentos abertos e clientes mais valiosos.",
    position: "right",
  },
  {
    target: "[data-tour='orcamentos']",
    title: "2. Orçamentos",
    description: "Criação e acompanhamento de propostas. Crie orçamentos guiados pela N.IA ou no modo livre.",
    position: "right",
  },
  {
    target: "[data-tour='tarefas']",
    title: "3. Tarefas",
    description: "Tarefas criadas exclusivamente via N.IA. Basta pedir para ela e as tarefas aparecem aqui automaticamente.",
    position: "right",
  },
  {
    target: "[data-tour='followups']",
    title: "4. Follow-up Avançado",
    description: "Priorização inteligente de contatos para maximizar conversão. A N.IA sugere o melhor canal e momento.",
    position: "right",
  },
  {
    target: "[data-tour='nia-chat']",
    title: "5. Conversar com N.IA",
    description: "Sua sócia estratégica está sempre disponível. A N.IA orienta, sugere e organiza — mas você decide.",
    position: "top",
  },
];

interface OnboardingTourProps {
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
}

export function OnboardingTour({ isActive, onComplete, onSkip }: OnboardingTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [highlightRect, setHighlightRect] = useState<DOMRect | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [allAnchorsReady, setAllAnchorsReady] = useState(false);
  const location = useLocation();
  const initialPathRef = useRef(location.pathname);

  const step = TOUR_STEPS[currentStep];
  const isLastStep = currentStep === TOUR_STEPS.length - 1;
  const isFirstStep = currentStep === 0;

  // Cancelar tour ao mudar de rota
  useEffect(() => {
    if (isActive && location.pathname !== initialPathRef.current) {
      onSkip();
    }
  }, [location.pathname, isActive, onSkip]);

  // Travar scroll durante o tour
  useEffect(() => {
    if (isActive) {
      document.body.style.overflow = "hidden";
      document.body.style.paddingRight = "0px"; // Prevent layout shift
    } else {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    }
    
    return () => {
      document.body.style.overflow = "";
      document.body.style.paddingRight = "";
    };
  }, [isActive]);

  // Verificar se todas as âncoras existem antes de iniciar
  useEffect(() => {
    if (!isActive) {
      setAllAnchorsReady(false);
      return;
    }

    const checkAnchors = () => {
      const allExist = TOUR_STEPS.every(step => {
        const el = document.querySelector(step.target);
        return el !== null;
      });
      
      if (allExist) {
        setAllAnchorsReady(true);
      } else {
        // Retry after a short delay if not all anchors are ready
        setTimeout(checkAnchors, 200);
      }
    };

    checkAnchors();
  }, [isActive]);

  const updateHighlight = useCallback(() => {
    if (!step || !allAnchorsReady) return;
    
    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setHighlightRect(rect);
      
      // Calculate tooltip position based on step position preference
      const padding = 16;
      let top = 0;
      let left = 0;
      
      switch (step.position) {
        case "right":
          top = rect.top + rect.height / 2;
          left = rect.right + padding;
          break;
        case "left":
          top = rect.top + rect.height / 2;
          left = rect.left - padding - 320; // tooltip width
          break;
        case "top":
          top = rect.top - padding - 140; // approx tooltip height
          left = rect.left + rect.width / 2 - 160; // center tooltip
          break;
        case "bottom":
        default:
          top = rect.bottom + padding;
          left = rect.left + rect.width / 2 - 160;
          break;
      }
      
      // Ensure tooltip stays within viewport
      top = Math.max(16, Math.min(top, window.innerHeight - 200));
      left = Math.max(16, Math.min(left, window.innerWidth - 336));
      
      setTooltipPosition({ top, left });
    }
  }, [step, allAnchorsReady]);

  useEffect(() => {
    if (!isActive || !allAnchorsReady) return;
    
    updateHighlight();
    
    // Update on resize
    window.addEventListener("resize", updateHighlight);
    window.addEventListener("scroll", updateHighlight, true);
    
    return () => {
      window.removeEventListener("resize", updateHighlight);
      window.removeEventListener("scroll", updateHighlight, true);
    };
  }, [isActive, currentStep, updateHighlight, allAnchorsReady]);

  // Reset step when tour becomes active
  useEffect(() => {
    if (isActive) {
      setCurrentStep(0);
      initialPathRef.current = location.pathname;
    }
  }, [isActive, location.pathname]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Não fechar ao clicar no overlay - apenas botões Pular/Concluir
  };

  if (!isActive || !allAnchorsReady || !highlightRect) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-[9999]" 
      style={{ pointerEvents: "auto" }}
    >
      {/* Overlay with cutout */}
      <div className="absolute inset-0">
        {/* Dark overlay */}
        <div 
          className="absolute inset-0 bg-black/80 transition-all duration-300"
          onClick={handleOverlayClick}
        />
        
        {/* Highlight cutout */}
        <div
          className="absolute border-2 border-accent rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.8)] transition-all duration-300"
          style={{
            top: highlightRect.top - 4,
            left: highlightRect.left - 4,
            width: highlightRect.width + 8,
            height: highlightRect.height + 8,
            pointerEvents: "none",
          }}
        />
        
        {/* Pulse animation around highlight */}
        <div
          className="absolute border-2 border-accent/50 rounded-lg animate-pulse"
          style={{
            top: highlightRect.top - 8,
            left: highlightRect.left - 8,
            width: highlightRect.width + 16,
            height: highlightRect.height + 16,
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Tooltip */}
      <div
        className={cn(
          "absolute z-[10000] w-80 bg-card border border-border rounded-xl shadow-2xl",
          "animate-fade-in-up"
        )}
        style={{
          top: tooltipPosition.top,
          left: tooltipPosition.left,
        }}
      >
        {/* Progress indicator */}
        <div className="flex gap-1 px-4 pt-4">
          {TOUR_STEPS.map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-1 flex-1 rounded-full transition-colors duration-200",
                index === currentStep ? "bg-accent" : index < currentStep ? "bg-accent/50" : "bg-muted"
              )}
            />
          ))}
        </div>
        
        {/* Content */}
        <div className="p-4">
          <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
        </div>
        
        {/* Actions */}
        <div className="flex items-center justify-between px-4 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4 mr-1" />
            Pular
          </Button>
          
          <div className="flex gap-2">
            {!isFirstStep && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Anterior
              </Button>
            )}
            <Button
              size="sm"
              onClick={handleNext}
              className="bg-accent hover:bg-accent/90 text-accent-foreground"
            >
              {isLastStep ? "Concluir" : "Próximo"}
              {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Step counter */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/70 z-[10001]">
        {currentStep + 1} de {TOUR_STEPS.length}
      </div>
    </div>,
    document.body
  );
}
