import { FileText, Sparkles, Crown } from "lucide-react";
import { cn } from "@/lib/utils";
import { PDFStyle } from "./BudgetPDFGenerator";

// ═══════════════════════════════════════════════════════════════════════════════
// PDF STYLE SELECTOR — ESCOLHA DE ESTILO DO PDF
// 
// 3 estilos bloqueados:
//   🟦 Executivo Clean (padrão)
//   🟩 Premium Turismo
//   ⬛ Ultra Premium VIP
// ═══════════════════════════════════════════════════════════════════════════════

interface PDFStyleSelectorProps {
  value: PDFStyle;
  onChange: (style: PDFStyle) => void;
}

const styles: Array<{
  id: PDFStyle;
  name: string;
  description: string;
  icon: React.ReactNode;
  preview: {
    bg: string;
    accent: string;
    text: string;
  };
}> = [
  {
    id: 'executivo',
    name: 'Executivo Clean',
    description: 'Fundo branco, tipografia corporativa, visual limpo e profissional',
    icon: <FileText className="h-5 w-5" />,
    preview: {
      bg: 'bg-white',
      accent: 'bg-gray-900',
      text: 'text-gray-900',
    },
  },
  {
    id: 'premium',
    name: 'Premium Turismo',
    description: 'Cards elegantes, destaque para experiência e destino',
    icon: <Sparkles className="h-5 w-5" />,
    preview: {
      bg: 'bg-teal-50',
      accent: 'bg-teal-700',
      text: 'text-teal-800',
    },
  },
  {
    id: 'vip',
    name: 'Ultra Premium VIP',
    description: 'Fundo escuro, minimalista, sensação de exclusividade',
    icon: <Crown className="h-5 w-5" />,
    preview: {
      bg: 'bg-neutral-900',
      accent: 'bg-amber-500',
      text: 'text-amber-400',
    },
  },
];

export function PDFStyleSelector({ value, onChange }: PDFStyleSelectorProps) {
  return (
    <div className="grid gap-3">
      {styles.map((style) => (
        <button
          key={style.id}
          onClick={() => onChange(style.id)}
          className={cn(
            "w-full p-4 rounded-lg border-2 text-left transition-all",
            "flex items-start gap-4",
            value === style.id
              ? "border-accent bg-accent/10"
              : "border-border hover:border-accent/50 bg-card"
          )}
        >
          {/* Preview Box */}
          <div className={cn(
            "w-16 h-20 rounded-md flex flex-col items-center justify-center shrink-0",
            style.preview.bg,
            "border border-border/50"
          )}>
            <div className={cn("w-8 h-1 rounded mb-2", style.preview.accent)} />
            <div className={cn("w-6 h-0.5 rounded mb-1 opacity-50", style.preview.accent)} />
            <div className={cn("w-10 h-0.5 rounded mb-1 opacity-30", style.preview.accent)} />
            <div className={cn("w-8 h-0.5 rounded opacity-20", style.preview.accent)} />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={cn(
                "p-1 rounded",
                value === style.id ? "bg-accent text-accent-foreground" : "bg-secondary"
              )}>
                {style.icon}
              </span>
              <h3 className="font-medium text-foreground">{style.name}</h3>
              {style.id === 'executivo' && (
                <span className="text-xs text-muted-foreground">(Padrão)</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {style.description}
            </p>
          </div>

          {/* Selection Indicator */}
          {value === style.id && (
            <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center shrink-0">
              <svg className="w-3 h-3 text-accent-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  );
}
