import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  FileText,
  CheckSquare,
  Bell,
  BarChart3,
  Settings,
  MessageCircle,
  Shield,
  Lightbulb,
  AlertTriangle,
  GraduationCap,
  ClipboardEdit,
  Landmark,
} from "lucide-react";
import { Logo } from "../brand/Logo";
import { ThemeToggle } from "../theme/ThemeToggle";

const mainNavItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/" },
  { icon: Users, label: "Clientes", path: "/clientes" },
  { icon: FileText, label: "Orçamentos", path: "/orcamentos" },
  { icon: BarChart3, label: "Relatórios", path: "/relatorios" },
  { icon: ClipboardEdit, label: "Operação Manual", path: "/operacao-manual" },
  { icon: Landmark, label: "Financeiro", path: "/financeiro" },
];

const niaModules = [
  { icon: Shield, label: "Blindagem", path: "/blindagem", accent: true },
  { icon: Lightbulb, label: "Decisão Difícil", path: "/decisao" },
  { icon: AlertTriangle, label: "Detector de Gargalos", path: "/gargalos" },
  { icon: GraduationCap, label: "Treinamento", path: "/treinamento" },
];

export function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-sidebar-border">
        <Logo size="sm" />
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto scrollbar-nia">
        <div className="space-y-1">
        {mainNavItems.map((item) => {
            const tourId = item.path === "/" ? "dashboard" 
              : item.path === "/clientes" ? "clientes" 
              : item.path === "/orcamentos" ? "orcamentos" 
              : item.path === "/tarefas" ? "tarefas" 
              : item.path === "/followups" ? "followups"
              : undefined;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                data-tour={tourId}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            );
          })}
        </div>

        {/* NIA Modules */}
        <div className="mt-8">
          <p className="px-3 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Módulos N.IA
          </p>
          <div className="space-y-1">
            {niaModules.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                    item.accent && !isActive && "text-accent"
                  )
                }
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Full Conversation */}
        <div className="mt-8">
          <NavLink
            to="/conversa"
            data-tour="nia-chat"
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all duration-200",
                "border border-border",
                isActive
                  ? "bg-accent/10 border-accent/30 text-foreground"
                  : "hover:bg-accent/5 hover:border-accent/20"
              )
            }
          >
            <MessageCircle className="h-4 w-4 text-accent" />
            <span>Conversar com N.IA</span>
          </NavLink>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
        {/* Theme Toggle */}
        <ThemeToggle />
        
        <NavLink
          to="/configuracoes"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent/50"
            )
          }
        >
          <Settings className="h-4 w-4" />
          Configurações
        </NavLink>
      </div>
    </aside>
  );
}
