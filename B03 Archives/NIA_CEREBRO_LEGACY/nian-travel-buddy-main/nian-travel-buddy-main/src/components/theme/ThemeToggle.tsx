import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

// ═══════════════════════════════════════════════════════════════════════════════
// THEME TOGGLE — ALTERNÂNCIA ENTRE MODO LIGHT/DARK
// 
// - Persistência automática via next-themes (localStorage)
// - Fallback para preferência do sistema
// - Transição suave sem reload
// - Acessibilidade com labels claros
// ═══════════════════════════════════════════════════════════════════════════════

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "full";
}

export function ThemeToggle({ className, variant = "full" }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Return placeholder to prevent layout shift
    return (
      <div className={cn("h-10", variant === "icon" ? "w-10" : "w-full", className)} />
    );
  }

  const isDark = resolvedTheme === "dark";

  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  if (variant === "icon") {
    return (
      <Button
        variant="ghost"
        size="icon"
        onClick={toggleTheme}
        className={cn("h-10 w-10 rounded-lg", className)}
        aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
      >
        {isDark ? (
          <Sun className="h-5 w-5 text-sidebar-foreground transition-transform hover:rotate-12" />
        ) : (
          <Moon className="h-5 w-5 text-sidebar-foreground transition-transform hover:-rotate-12" />
        )}
      </Button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium w-full",
        "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
        "transition-all duration-200",
        className
      )}
      aria-label={isDark ? "Mudar para modo claro" : "Mudar para modo escuro"}
    >
      {isDark ? (
        <>
          <Sun className="h-4 w-4" />
          <span>Modo Claro</span>
        </>
      ) : (
        <>
          <Moon className="h-4 w-4" />
          <span>Modo Escuro</span>
        </>
      )}
    </button>
  );
}
