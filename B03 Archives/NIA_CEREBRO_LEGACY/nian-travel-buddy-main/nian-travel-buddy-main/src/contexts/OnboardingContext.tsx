import React, { createContext, useContext } from "react";
import { useOnboardingTour } from "@/hooks/useOnboardingTour";

// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING CONTEXT — ESTADO GLOBAL DO TOUR VISUAL
// - Tour exclusivamente visual
// - NIA permanece passiva
// - Interface explica a si mesma
// ═══════════════════════════════════════════════════════════════════════════════

interface OnboardingContextType {
  isTourActive: boolean;
  hasCompletedOnboarding: boolean;
  startTour: () => void;
  completeTour: () => void;
  skipTour: () => void;
  resetOnboarding: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export function OnboardingProvider({ children }: { children: React.ReactNode }) {
  const onboardingState = useOnboardingTour();

  return (
    <OnboardingContext.Provider value={onboardingState}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider");
  }
  return context;
}
