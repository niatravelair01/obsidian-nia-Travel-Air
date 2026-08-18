import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  BarChart3,
} from "lucide-react";
import { useNiaChat } from "@/contexts/NiaChatContext";
import logoNiaWhite from "@/assets/logo-nia-white.png";
import logoNiaBlack from "@/assets/logo-nia-black.png";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

const navItems = [
  { icon: LayoutDashboard, label: "Início", path: "/" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: FileText, label: "Orçamentos", path: "/orcamentos" },
  { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
];

export function MobileBottomNav() {
  const location = useLocation();
  const { openChat } = useNiaChat();
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const isDark = mounted && resolvedTheme === "dark";
  const niaLogo = isDark ? logoNiaWhite : logoNiaBlack;

  const leftItems = navItems.slice(0, 2);
  const rightItems = navItems.slice(2);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-12 px-1">
        {leftItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full",
                "transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "scale-110")} />
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
            </NavLink>
          );
        })}

        {/* NIA Center Button */}
        <button
          onClick={openChat}
          className="flex flex-col items-center justify-center flex-1 h-full relative -mt-3"
        >
          <div className="w-11 h-11 rounded-full bg-accent flex items-center justify-center shadow-md shadow-accent/30 border-[3px] border-background">
            <img src={niaLogo} alt="N.IA" className="w-5 h-5 object-contain" />
          </div>
          <span className="text-[9px] font-semibold text-accent leading-none">N.IA</span>
        </button>

        {rightItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 flex-1 h-full",
                "transition-colors duration-200",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className={cn("h-4 w-4", isActive && "scale-110")} />
              <span className="text-[9px] font-medium leading-none">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
}
