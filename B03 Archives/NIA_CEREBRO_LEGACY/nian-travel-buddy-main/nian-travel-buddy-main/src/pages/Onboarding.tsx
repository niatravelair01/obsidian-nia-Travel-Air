import { MainLayout } from "@/components/layout/MainLayout";
import { NiaAvatar } from "@/components/nia/NiaAvatar";
import { Button } from "@/components/ui/button";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { ArrowRight, Play, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

// ═══════════════════════════════════════════════════════════════════════════════
// PÁGINA DE ONBOARDING — TOUR VISUAL GUIADO
// - Onboarding exclusivamente visual com highlights e modais
// - A NIA permanece passiva durante o tour
// - Interface explica a si mesma
// ═══════════════════════════════════════════════════════════════════════════════

export default function Onboarding() {
  const navigate = useNavigate();
  const { hasCompletedOnboarding, startTour, resetOnboarding } = useOnboarding();

  // Se clicar para iniciar o tour, redireciona para o dashboard onde o tour acontece
  const handleStartTour = () => {
    startTour();
    navigate("/");
  };

  const handleResetTour = () => {
    resetOnboarding();
  };

  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-2rem)] p-8">
        {/* Hero Section */}
        <div className="max-w-2xl mx-auto text-center space-y-8">
          {/* NIA Avatar */}
          <div className="flex justify-center">
            <div className="relative">
              <NiaAvatar size="lg" />
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-accent rounded-full animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-foreground">
              Bem-vindo à N<span className="text-accent">.</span>IA
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mx-auto">
              Sua sócia estratégica para agências de viagem.
            </p>
          </div>

          {/* Status & CTA */}
          {hasCompletedOnboarding ? (
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm">
                <span className="w-2 h-2 rounded-full bg-accent" />
                Tour concluído
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  onClick={() => navigate("/")}
                  className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-base gap-2"
                >
                  Ir para o Dashboard
                  <ArrowRight className="h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleResetTour}
                  className="px-8 py-6 text-base gap-2"
                >
                  <RotateCcw className="h-5 w-5" />
                  Refazer Tour
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Button
                size="lg"
                onClick={handleStartTour}
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 text-base gap-2"
              >
                <Play className="h-5 w-5" />
                Iniciar Tour Visual
                <ArrowRight className="h-5 w-5" />
              </Button>
              <p className="text-sm text-muted-foreground">
                Um tour rápido de menos de 1 minuto
              </p>
            </div>
          )}

          {/* Key Points */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-border">
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <span className="text-accent text-lg">1</span>
              </div>
              <h3 className="font-medium text-foreground">Tour Visual</h3>
              <p className="text-sm text-muted-foreground">
                A interface mostra cada área com destaque visual
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <span className="text-accent text-lg">2</span>
              </div>
              <h3 className="font-medium text-foreground">Sem Texto</h3>
              <p className="text-sm text-muted-foreground">
                Não precisa ler explicações longas
              </p>
            </div>
            <div className="text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mx-auto">
                <span className="text-accent text-lg">3</span>
              </div>
              <h3 className="font-medium text-foreground">Você no Controle</h3>
              <p className="text-sm text-muted-foreground">
                Avance no seu ritmo ou pule quando quiser
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
