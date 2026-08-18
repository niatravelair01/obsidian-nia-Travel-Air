import { useState, useMemo } from "react";
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isBefore, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Calendar, ChevronLeft, ChevronRight, Sparkles, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { NiaAvatar } from "@/components/nia/NiaAvatar";

// ═══════════════════════════════════════════════════════════════════════════════
// SMART DATE CALENDAR — CALENDÁRIO INTELIGENTE DE APOIO À DECISÃO
// 
// Inspirado em companhias aéreas: mostra tendência de custo por dia.
// A NIA sugere janelas ideais baseadas em destino e sazonalidade.
// Não mostra preços finais, apenas tendência relativa.
// ═══════════════════════════════════════════════════════════════════════════════

interface SmartDateCalendarProps {
  destination: string;
  datesFlexible: "sim" | "nao" | "nao_sei" | null;
  urgentTrip: "sim" | "nao" | null;
  onSelectRange: (startDate: Date, endDate: Date) => void;
  children: React.ReactNode;
}

type CostLevel = "low" | "medium" | "high";

interface DayCostInfo {
  date: Date;
  level: CostLevel;
}

// Simula análise de custo baseada em sazonalidade (demo)
function analyzeCostTrends(destination: string, month: Date): DayCostInfo[] {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  
  return days.map((date) => {
    const dayOfWeek = date.getDay();
    const dayOfMonth = date.getDate();
    
    // Lógica simplificada de tendência (produção usaria dados reais)
    // Finais de semana e feriados tendem a ser mais caros
    let level: CostLevel = "medium";
    
    // Sexta e Sábado = mais caro
    if (dayOfWeek === 5 || dayOfWeek === 6) {
      level = "high";
    }
    // Terça e Quarta = mais barato
    else if (dayOfWeek === 2 || dayOfWeek === 3) {
      level = "low";
    }
    
    // Início e fim do mês tendem a ser mais caros
    if (dayOfMonth <= 5 || dayOfMonth >= 26) {
      level = level === "low" ? "medium" : "high";
    }
    
    // Meio do mês tende a ser mais vantajoso
    if (dayOfMonth >= 10 && dayOfMonth <= 20 && level === "medium") {
      level = "low";
    }
    
    return { date, level };
  });
}

// Gera sugestão da NIA baseada em análise
function generateNiaSuggestion(
  destination: string,
  costData: DayCostInfo[],
  datesFlexible: "sim" | "nao" | "nao_sei" | null
): string | null {
  if (datesFlexible === "nao") {
    return null; // Datas fixas, sem sugestão
  }
  
  // Encontra a melhor sequência de dias "low"
  const lowDays = costData.filter(d => d.level === "low");
  
  if (lowDays.length === 0) {
    return "Este mês tem alta demanda. Considere meses adjacentes para melhor custo-benefício.";
  }
  
  // Encontra primeira e última data de baixo custo
  const firstLow = lowDays[0];
  const lastLow = lowDays[lowDays.length - 1];
  
  const startStr = format(firstLow.date, "d", { locale: ptBR });
  const endStr = format(lastLow.date, "d 'de' MMMM", { locale: ptBR });
  
  return `Datas entre ${startStr} e ${endStr} tendem a ter melhor custo-benefício.`;
}

export function SmartDateCalendar({
  destination,
  datesFlexible,
  urgentTrip,
  onSelectRange,
  children,
}: SmartDateCalendarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedStart, setSelectedStart] = useState<Date | null>(null);
  const [selectedEnd, setSelectedEnd] = useState<Date | null>(null);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Analisa tendências de custo para o mês atual
  const costData = useMemo(() => {
    return analyzeCostTrends(destination, currentMonth);
  }, [destination, currentMonth]);

  // Sugestão da NIA
  const niaSuggestion = useMemo(() => {
    return generateNiaSuggestion(destination, costData, datesFlexible);
  }, [destination, costData, datesFlexible]);

  const handleDayClick = (date: Date) => {
    if (!selectedStart || (selectedStart && selectedEnd)) {
      // Primeiro clique ou reset
      setSelectedStart(date);
      setSelectedEnd(null);
    } else {
      // Segundo clique - define fim
      if (isBefore(date, selectedStart)) {
        setSelectedEnd(selectedStart);
        setSelectedStart(date);
      } else {
        setSelectedEnd(date);
      }
    }
  };

  const handleConfirm = () => {
    if (selectedStart && selectedEnd) {
      onSelectRange(selectedStart, selectedEnd);
      setIsOpen(false);
    } else if (selectedStart) {
      // Se apenas uma data, assume viagem de 7 dias
      onSelectRange(selectedStart, addDays(selectedStart, 6));
      setIsOpen(false);
    }
  };

  const isInRange = (date: Date) => {
    if (!selectedStart) return false;
    const end = selectedEnd || hoveredDate;
    if (!end) return false;
    
    const start = isBefore(selectedStart, end) ? selectedStart : end;
    const finish = isBefore(selectedStart, end) ? end : selectedStart;
    
    return date >= start && date <= finish;
  };

  const getCostColor = (level: CostLevel) => {
    switch (level) {
      case "low": return "bg-status-success/20 text-status-success";
      case "medium": return "bg-status-warning/15 text-status-warning";
      case "high": return "bg-destructive/15 text-destructive";
    }
  };

  const getCostIcon = (level: CostLevel) => {
    switch (level) {
      case "low": return <TrendingDown className="h-2.5 w-2.5" />;
      case "medium": return <Minus className="h-2.5 w-2.5" />;
      case "high": return <TrendingUp className="h-2.5 w-2.5" />;
    }
  };

  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Adiciona dias vazios no início para alinhar com dia da semana
  const startDayOfWeek = monthStart.getDay();
  const emptyDays = Array(startDayOfWeek).fill(null);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      
      <PopoverContent 
        className="w-auto p-0 bg-background border-border z-50" 
        align="start"
        sideOffset={8}
      >
        <div className="p-4 space-y-4 min-w-[340px]">
          {/* Header com navegação */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(addMonths(currentMonth, -1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h3 className="font-medium text-sm capitalize">
              {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
            </h3>
            
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Legenda de cores */}
          <div className="flex items-center justify-center gap-4 text-[10px]">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-status-success/20" />
              <span className="text-muted-foreground">Mais vantajoso</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-status-warning/15" />
              <span className="text-muted-foreground">Médio</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-destructive/15" />
              <span className="text-muted-foreground">Alta demanda</span>
            </div>
          </div>

          {/* Calendário */}
          <div className="space-y-1">
            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="h-8 flex items-center justify-center text-[10px] font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-1">
              {emptyDays.map((_, i) => (
                <div key={`empty-${i}`} className="h-10" />
              ))}
              
              {days.map((day) => {
                const costInfo = costData.find(
                  (d) => d.date.getDate() === day.getDate()
                );
                const isPast = isBefore(day, new Date()) && !isToday(day);
                const isSelected = 
                  (selectedStart && day.getTime() === selectedStart.getTime()) ||
                  (selectedEnd && day.getTime() === selectedEnd.getTime());
                const inRange = isInRange(day);

                return (
                  <button
                    key={day.toISOString()}
                    onClick={() => !isPast && handleDayClick(day)}
                    onMouseEnter={() => setHoveredDate(day)}
                    onMouseLeave={() => setHoveredDate(null)}
                    disabled={isPast}
                    className={cn(
                      "h-10 flex flex-col items-center justify-center rounded-md text-xs transition-all",
                      "hover:ring-2 hover:ring-accent/50",
                      isPast && "opacity-30 cursor-not-allowed",
                      isSelected && "ring-2 ring-accent bg-accent text-accent-foreground",
                      inRange && !isSelected && "bg-accent/20",
                      !isSelected && !inRange && costInfo && getCostColor(costInfo.level),
                    )}
                  >
                    <span className="font-medium">{format(day, "d")}</span>
                    {costInfo && !isPast && !isSelected && (
                      <span className="opacity-70">
                        {getCostIcon(costInfo.level)}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sugestão da NIA */}
          {niaSuggestion && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/10">
              <NiaAvatar size="xs" />
              <div className="flex-1">
                <p className="text-[10px] font-medium text-accent flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Sugestão da N.IA
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {niaSuggestion}
                </p>
              </div>
            </div>
          )}

          {/* Seleção atual e confirmação */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="text-xs text-muted-foreground">
              {selectedStart && selectedEnd ? (
                <span>
                  {format(selectedStart, "dd/MM")} - {format(selectedEnd, "dd/MM/yyyy")}
                </span>
              ) : selectedStart ? (
                <span>Início: {format(selectedStart, "dd/MM/yyyy")}</span>
              ) : (
                <span>Clique para selecionar início</span>
              )}
            </div>
            
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedStart(null);
                  setSelectedEnd(null);
                }}
              >
                Limpar
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={!selectedStart}
                className="bg-accent hover:bg-accent/90"
              >
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
