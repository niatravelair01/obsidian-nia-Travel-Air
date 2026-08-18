import { useState, useCallback, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING TOUR HOOK — GERENCIAMENTO DO TOUR VISUAL
// - Auto-inicia apenas no PRIMEIRO acesso (se onboardingCompleted === false)
// - Persiste conclusão no localStorage
// - Tour NUNCA reabre automaticamente após concluído
// - NIA permanece passiva durante o tour
// ═══════════════════════════════════════════════════════════════════════════════

const ONBOARDING_STORAGE_KEY = "nia-onboarding-completed";

export function useOnboardingTour() {
  const location = useLocation();
  const hasAutoStartedRef = useRef(false);
  
  const [isTourActive, setIsTourActive] = useState(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(() => {
    return localStorage.getItem(ONBOARDING_STORAGE_KEY) === "true";
  });

  // Auto-iniciar tour APENAS no primeiro acesso e APENAS na rota "/"
  useEffect(() => {
    // Só auto-inicia se:
    // 1. Não completou onboarding ainda
    // 2. Está na página principal "/"
    // 3. Ainda não auto-iniciou nesta sessão
    if (
      !hasCompletedOnboarding && 
      location.pathname === "/" && 
      !hasAutoStartedRef.current &&
      !isTourActive
    ) {
      // Pequeno delay para garantir que a UI está renderizada
      const timer = setTimeout(() => {
        hasAutoStartedRef.current = true;
        setIsTourActive(true);
      }, 800);
      
      return () => clearTimeout(timer);
    }
  }, [hasCompletedOnboarding, location.pathname, isTourActive]);

  const startTour = useCallback(() => {
    setIsTourActive(true);
  }, []);

  const completeTour = useCallback(() => {
    setIsTourActive(false);
    setHasCompletedOnboarding(true);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
  }, []);

  const skipTour = useCallback(() => {
    setIsTourActive(false);
    setHasCompletedOnboarding(true);
    localStorage.setItem(ONBOARDING_STORAGE_KEY, "true");
  }, []);

  const resetOnboarding = useCallback(() => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setHasCompletedOnboarding(false);
    hasAutoStartedRef.current = false; // Permite auto-iniciar novamente
  }, []);

  return {
    isTourActive,
    hasCompletedOnboarding,
    startTour,
    completeTour,
    skipTour,
    resetOnboarding,
  };
}
