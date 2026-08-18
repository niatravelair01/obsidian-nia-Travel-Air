import { Sidebar } from "./Sidebar";
import { NiaGlobalChat } from "../nia/NiaGlobalChat";
import { NiaChatToggle } from "../nia/NiaChatToggle";
import { NiaAudioIndicator } from "../nia/NiaAudioIndicator";
import { NiaMicFloatingButton } from "../nia/NiaMicButton";
import { OnboardingTour } from "../onboarding/OnboardingTour";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useNiaAudio } from "@/contexts/NiaAudioContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const { isTourActive, completeTour, skipTour } = useOnboarding();
  const { audioState } = useNiaAudio();

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar hidden on mobile via CSS */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      <main className="md:ml-64 min-h-screen">
        {children}
      </main>

      {/* Audio indicator - FEEDBACK VISUAL OBRIGATÓRIO (fixed position) */}
      {audioState !== "idle" && (
        <div className="fixed top-4 right-4 z-50">
          <NiaAudioIndicator size="md" />
        </div>
      )}

      {/* Floating mic button */}
      <NiaMicFloatingButton />

      {/* Central ÚNICA da NIA - chat global */}
      <NiaChatToggle />
      <NiaGlobalChat />

      {/* Tour Visual - NIA permanece passiva */}
      <OnboardingTour
        isActive={isTourActive}
        onComplete={completeTour}
        onSkip={skipTour}
      />
    </div>
  );
}
