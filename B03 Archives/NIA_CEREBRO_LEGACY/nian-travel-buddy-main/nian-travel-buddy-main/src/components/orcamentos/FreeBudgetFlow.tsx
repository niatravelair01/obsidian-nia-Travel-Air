import { useState, useCallback } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  ArrowLeft, 
  Save, 
  Plane, 
  Hotel, 
  MapPin, 
  Calendar,
  User,
  DollarSign,
  Mic,
  MicOff,
  Loader2,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BudgetData, useBudgetCreation } from "@/hooks/useBudgetCreation";
import { useNiaVoiceChat } from "@/hooks/useNiaVoiceChat";
import { NiaAvatar } from "@/components/nia/NiaAvatar";
import { useToast } from "@/hooks/use-toast";
import { SmartDateCalendar } from "./SmartDateCalendar";

// ═══════════════════════════════════════════════════════════════════════════════
// FREE BUDGET FLOW — MODO LIVRE COM APOIO DA NIA
// 
// O usuário preenche campos manualmente.
// A NIA observa em segundo plano e só alerta erros críticos.
// ═══════════════════════════════════════════════════════════════════════════════

interface FreeBudgetFlowProps {
  onComplete: (budgetData: BudgetData) => void;
  onCancel: () => void;
}

export function FreeBudgetFlow({ onComplete, onCancel }: FreeBudgetFlowProps) {
  const { toast } = useToast();
  const {
    budgetData,
    updateBudget,
    updateProfile,
    analyzeRisks,
  } = useBudgetCreation();

  const {
    voiceState,
    startListening,
    stopListening,
  } = useNiaVoiceChat("free-budget");

  const [niaAlert, setNiaAlert] = useState<{
    type: 'warning' | 'error' | 'info';
    message: string;
  } | null>(null);

  // NIA observa em segundo plano e alerta apenas problemas críticos
  const checkForCriticalIssues = useCallback(() => {
    const issues: string[] = [];
    
    // Valor muito baixo
    if (budgetData.totalValue && budgetData.totalValue < 1000) {
      issues.push("Valor muito baixo para uma viagem");
    }
    
    // Viagem urgente
    if (budgetData.profile.urgentTrip === 'sim') {
      issues.push("Viagem urgente detectada - maior risco de chargeback");
    }
    
    // Cliente focado em preço com referência
    if (budgetData.profile.hasReferencePrice === 'sim' && budgetData.profile.tripFocus === 'preco') {
      issues.push("Cliente com referência de preço focado em menor valor - atenção com margem");
    }
    
    if (issues.length > 0) {
      setNiaAlert({
        type: issues.length > 1 ? 'error' : 'warning',
        message: issues[0],
      });
    } else {
      setNiaAlert(null);
    }
  }, [budgetData]);

  const handleSubmit = () => {
    // Validações básicas
    if (!budgetData.clientName) {
      toast({
        title: "Nome do cliente obrigatório",
        description: "Por favor, informe o nome do cliente.",
        variant: "destructive",
      });
      return;
    }
    
    if (!budgetData.destination) {
      toast({
        title: "Destino obrigatório",
        description: "Por favor, informe o destino da viagem.",
        variant: "destructive",
      });
      return;
    }

    // Analisar riscos
    analyzeRisks();
    
    // Completar
    onComplete(budgetData);
  };

  // Handle voice input for specific fields
  const handleVoiceInput = async (field: string) => {
    if (voiceState === 'listening') {
      const transcript = await stopListening();
      if (transcript) {
        switch (field) {
          case 'clientName':
            updateBudget({ clientName: transcript });
            break;
          case 'destination':
            updateBudget({ destination: transcript });
            break;
          case 'period':
            updateBudget({ period: transcript });
            break;
        }
        toast({
          title: "Texto capturado",
          description: `"${transcript}" foi preenchido.`,
        });
      }
    } else {
      await startListening();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NiaAvatar size="md" />
            <div>
              <h2 className="font-semibold text-foreground">Orçamento Livre</h2>
              <p className="text-sm text-muted-foreground">
                Preencha os campos. A N.IA observa em segundo plano.
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* NIA Alert */}
        {niaAlert && (
          <Card className={cn(
            "border-l-4",
            niaAlert.type === 'error' && "border-l-red-500 bg-red-500/5",
            niaAlert.type === 'warning' && "border-l-amber-500 bg-amber-500/5",
            niaAlert.type === 'info' && "border-l-accent bg-accent/5",
          )}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertCircle className={cn(
                  "h-5 w-5 shrink-0",
                  niaAlert.type === 'error' && "text-red-500",
                  niaAlert.type === 'warning' && "text-amber-500",
                  niaAlert.type === 'info' && "text-accent",
                )} />
                <div>
                  <p className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-accent" />
                    Observação da N.IA
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">{niaAlert.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Dados do Cliente */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <User className="h-4 w-4 text-accent" />
              Cliente
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="clientName">Nome do Cliente *</Label>
              <div className="flex gap-2">
                <Input
                  id="clientName"
                  value={budgetData.clientName}
                  onChange={(e) => updateBudget({ clientName: e.target.value })}
                  placeholder="Nome completo do cliente"
                  className="flex-1"
                />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleVoiceInput('clientName')}
                  className={cn(voiceState === 'listening' && "border-accent bg-accent/10")}
                >
                  {voiceState === 'listening' ? (
                    <MicOff className="h-4 w-4 text-accent" />
                  ) : voiceState === 'processing' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Mic className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Perfil de Decisão</Label>
                <Select
                  value={budgetData.profile.decisionProfile || ''}
                  onValueChange={(v) => updateProfile('decisionProfile', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rapido">Decide rápido</SelectItem>
                    <SelectItem value="indeciso">Indeciso</SelectItem>
                    <SelectItem value="nao_sei">Não sei</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Cliente Recorrente?</Label>
                <Select
                  value={budgetData.profile.isReturningClient || ''}
                  onValueChange={(v) => updateProfile('isReturningClient', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                    <SelectItem value="nao_sei">Não sei</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados da Viagem */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              Viagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="destination">Destino *</Label>
                <div className="flex gap-2">
                  <Input
                    id="destination"
                    value={budgetData.destination}
                    onChange={(e) => updateBudget({ destination: e.target.value })}
                    placeholder="Ex: Paris, França"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="period">Período</Label>
                <div className="flex gap-2">
                  <Input
                    id="period"
                    value={budgetData.period}
                    onChange={(e) => updateBudget({ period: e.target.value })}
                    placeholder="Ex: 10-20 Mar 2025"
                    className="flex-1"
                  />
                  {/* Calendário inteligente de apoio à decisão */}
                  <SmartDateCalendar
                    destination={budgetData.destination}
                    datesFlexible={budgetData.profile.datesFlexible}
                    urgentTrip={budgetData.profile.urgentTrip}
                    onSelectRange={(startDate, endDate) => {
                      const periodStr = `${format(startDate, "dd", { locale: ptBR })}-${format(endDate, "dd MMM yyyy", { locale: ptBR })}`;
                      updateBudget({ period: periodStr });
                    }}
                  >
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="shrink-0"
                      title="Abrir calendário inteligente"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </SmartDateCalendar>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ocasião</Label>
                <Select
                  value={budgetData.profile.tripOccasion || ''}
                  onValueChange={(v) => updateProfile('tripOccasion', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lazer">Lazer</SelectItem>
                    <SelectItem value="lua_de_mel">Lua de mel</SelectItem>
                    <SelectItem value="familia">Família</SelectItem>
                    <SelectItem value="trabalho">Trabalho</SelectItem>
                    <SelectItem value="presente">Presente</SelectItem>
                    <SelectItem value="outro">Outro</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Foco da Viagem</Label>
                <Select
                  value={budgetData.profile.tripFocus || ''}
                  onValueChange={(v) => updateProfile('tripFocus', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="preco">Menor preço</SelectItem>
                    <SelectItem value="conforto">Conforto</SelectItem>
                    <SelectItem value="experiencia">Experiência única</SelectItem>
                    <SelectItem value="equilibrio">Custo-benefício</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Datas Flexíveis?</Label>
                <Select
                  value={budgetData.profile.datesFlexible || ''}
                  onValueChange={(v) => updateProfile('datesFlexible', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                    <SelectItem value="nao_sei">Não sei</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Destino Flexível?</Label>
                <Select
                  value={budgetData.profile.destinationFlexible || ''}
                  onValueChange={(v) => updateProfile('destinationFlexible', v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                    <SelectItem value="nao_sei">Não sei</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Viagem Urgente?</Label>
                <Select
                  value={budgetData.profile.urgentTrip || ''}
                  onValueChange={(v) => {
                    updateProfile('urgentTrip', v);
                    checkForCriticalIssues();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim (menos de 7 dias)</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Valores */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-accent" />
              Valores
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalValue">Valor Total (R$)</Label>
                <Input
                  id="totalValue"
                  type="number"
                  value={budgetData.totalValue || ''}
                  onChange={(e) => updateBudget({ totalValue: parseFloat(e.target.value) || null })}
                  placeholder="0,00"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="margin">Margem Desejada (%)</Label>
                <Input
                  id="margin"
                  type="number"
                  value={budgetData.profile.desiredMargin || ''}
                  onChange={(e) => updateProfile('desiredMargin', parseFloat(e.target.value) || null)}
                  placeholder="15"
                  min="0"
                  max="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Teto de Orçamento (R$)</Label>
                <Input
                  type="number"
                  value={budgetData.profile.budgetCeiling || ''}
                  onChange={(e) => updateProfile('budgetCeiling', parseFloat(e.target.value) || null)}
                  placeholder="Valor máximo do cliente"
                />
              </div>

              <div className="space-y-2">
                <Label>Cliente tem Referência de Preço?</Label>
                <Select
                  value={budgetData.profile.hasReferencePrice || ''}
                  onValueChange={(v) => {
                    updateProfile('hasReferencePrice', v);
                    checkForCriticalIssues();
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sim">Sim, já pesquisou</SelectItem>
                    <SelectItem value="nao">Não</SelectItem>
                    <SelectItem value="nao_sei">Não sei</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Cancelar
          </Button>

          <Button 
            onClick={handleSubmit}
            className="bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Save className="h-4 w-4 mr-2" />
            Continuar para Revisão
          </Button>
        </div>
      </div>
    </div>
  );
}
