import { MobileBottomNav } from "./MobileBottomNav";
import { MobileNiaOverlay } from "./MobileNiaOverlay";

// ═══════════════════════════════════════════════════════════════════════════════
// MOBILE LAYOUT — ESTRUTURA BASE MOBILE
// 
// - Sem sidebar (usa bottom nav)
// - NIA overlay integrado
// - Safe areas para notch/home indicator
// ═══════════════════════════════════════════════════════════════════════════════

interface MobileLayoutProps {
  children: React.ReactNode;
}

export function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-14">
      {/* Main content area - scroll enabled */}
      <main className="min-h-screen">
        {children}
      </main>

      {/* Bottom navigation */}
      <MobileBottomNav />

      {/* NIA fullscreen overlay (controlled by NiaChatContext) */}
      <MobileNiaOverlay />
    </div>
  );
}
