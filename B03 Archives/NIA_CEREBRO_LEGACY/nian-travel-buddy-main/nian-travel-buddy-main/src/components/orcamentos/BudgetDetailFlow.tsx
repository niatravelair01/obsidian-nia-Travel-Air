import { useState, useCallback } from "react";
import { Plane, Plus, Trash2, Mic, MicOff, Check, X, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { NiaAvatar } from "@/components/nia/NiaAvatar";
import { FlightDetails } from "@/hooks/useBudgetCreation";
import { useNiaVoiceChat } from "@/hooks/useNiaVoiceChat";
import { useToast } from "@/hooks/use-toast";

// ═══════════════════════════════════════════════════════════════════════════════
// BUDGET DETAIL FLOW — DETALHAMENTO OPERACIONAL
// 
// A NIA conduz para coleta de dados técnicos (voos, etc).
// Aceita entrada por áudio ou texto.
// Sempre confirma antes de salvar.
// ═══════════════════════════════════════════════════════════════════════════════

interface BudgetDetailFlowProps {
  flights: FlightDetails[];
  onAddFlight: (type: "ida" | "volta") => string;
  onUpdateFlight: (flightId: string, updates: Partial<FlightDetails>) => void;
  onConfirmFlight: (flightId: string) => void;
  onRemoveFlight: (flightId: string) => void;
  onComplete: () => void;
  onBack: () => void;
}

export function BudgetDetailFlow({
  flights,
  onAddFlight,
  onUpdateFlight,
  onConfirmFlight,
  onRemoveFlight,
  onComplete,
  onBack,
}: BudgetDetailFlowProps) {
  const { toast } = useToast();
  const [activeFlightId, setActiveFlightId] = useState<string | null>(
    flights[0]?.id || null
  );
  const [pendingConfirmation, setPendingConfirmation] = useState<{
    flightId: string;
    displayText: string;
  } | null>(null);

  const {
    voiceState,
    startListening,
    stopListening,
  } = useNiaVoiceChat("budget-details");

  // Adicionar novo voo
  const handleAddFlight = (type: "ida" | "volta") => {
    const newId = onAddFlight(type);
    setActiveFlightId(newId);
  };

  // Processar áudio para preencher voo
  const handleAudioInput = useCallback(async () => {
    if (voiceState === "listening") {
      const transcript = await stopListening();
      if (transcript && activeFlightId) {
        processFlightAudio(transcript, activeFlightId);
      }
    } else {
      await startListening();
    }
  }, [voiceState, stopListening, startListening, activeFlightId]);

  // Interpretar áudio e preencher campos do voo
  const processFlightAudio = useCallback((transcript: string, flightId: string) => {
    const lowerTranscript = transcript.toLowerCase();
    const updates: Partial<FlightDetails> = {};
    
    // Detectar companhia aérea
    const airlines = ["latam", "gol", "azul", "tap", "air france", "klm", "emirates", "qatar", "american", "united", "delta", "iberia", "lufthansa"];
    for (const airline of airlines) {
      if (lowerTranscript.includes(airline)) {
        updates.airline = airline.toUpperCase();
        break;
      }
    }
    
    // Detectar número do voo (padrão: letras + números)
    const flightMatch = lowerTranscript.match(/([a-z]{2}\s?\d{3,4})|(\d{3,4})/i);
    if (flightMatch) {
      updates.flightNumber = flightMatch[0].toUpperCase().replace(/\s/g, "");
    }
    
    // Detectar aeroportos (códigos IATA)
    const airportCodes = lowerTranscript.match(/\b[a-z]{3}\b/gi);
    if (airportCodes && airportCodes.length >= 2) {
      updates.originAirport = airportCodes[0].toUpperCase();
      updates.destinationAirport = airportCodes[1].toUpperCase();
    }
    
    // Detectar horários (formato HH:MM ou "X horas")
    const timeMatches = lowerTranscript.match(/(\d{1,2}[h:]\d{2})|(\d{1,2}\s*horas?)/gi);
    if (timeMatches) {
      const normalizedTimes = timeMatches.map(t => {
        const nums = t.match(/\d+/g);
        if (nums && nums.length >= 1) {
          const hour = nums[0].padStart(2, "0");
          const minute = nums[1] || "00";
          return `${hour}:${minute}`;
        }
        return null;
      }).filter(Boolean);
      
      if (normalizedTimes[0]) updates.departureTime = normalizedTimes[0];
      if (normalizedTimes[1]) updates.arrivalTime = normalizedTimes[1];
    }
    
    // Detectar bagagem
    if (lowerTranscript.includes("despachada") || lowerTranscript.includes("despachar")) {
      updates.baggage = "despachada";
    } else if (lowerTranscript.includes("mão") || lowerTranscript.includes("mao") || lowerTranscript.includes("cabine")) {
      updates.baggage = "mao";
    } else if (lowerTranscript.includes("ambas") || lowerTranscript.includes("duas")) {
      updates.baggage = "ambas";
    }
    
    // Detectar conexões
    if (lowerTranscript.includes("direto") || lowerTranscript.includes("sem escala")) {
      updates.connections = "Voo direto";
    } else if (lowerTranscript.includes("conexão") || lowerTranscript.includes("escala")) {
      const connectionMatch = lowerTranscript.match(/conexão\s+(?:em\s+)?([a-z]+)/i);
      if (connectionMatch) {
        updates.connections = `Conexão em ${connectionMatch[1].toUpperCase()}`;
      } else {
        updates.connections = "Com conexão";
      }
    }

    // Atualizar voo com dados detectados
    if (Object.keys(updates).length > 0) {
      onUpdateFlight(flightId, updates);
      
      // Gerar texto de confirmação
      const parts = [];
      if (updates.airline) parts.push(`Companhia: ${updates.airline}`);
      if (updates.flightNumber) parts.push(`Voo: ${updates.flightNumber}`);
      if (updates.originAirport && updates.destinationAirport) {
        parts.push(`Rota: ${updates.originAirport} → ${updates.destinationAirport}`);
      }
      if (updates.departureTime) parts.push(`Saída: ${updates.departureTime}`);
      if (updates.arrivalTime) parts.push(`Chegada: ${updates.arrivalTime}`);
      if (updates.baggage) parts.push(`Bagagem: ${updates.baggage}`);
      
      setPendingConfirmation({
        flightId,
        displayText: parts.join(" | "),
      });
      
      toast({
        title: "Dados detectados",
        description: "Verifique as informações e confirme.",
      });
    } else {
      toast({
        title: "Não consegui interpretar",
        description: "Por favor, preencha os campos manualmente ou tente novamente.",
        variant: "destructive",
      });
    }
  }, [onUpdateFlight, toast]);

  // Confirmar dados do voo
  const handleConfirmFlight = (flightId: string) => {
    onConfirmFlight(flightId);
    setPendingConfirmation(null);
    toast({
      title: "Voo confirmado",
      description: "Os dados foram salvos com sucesso.",
    });
  };

  // Cancelar confirmação pendente
  const handleCancelConfirmation = () => {
    setPendingConfirmation(null);
  };

  const activeFlight = flights.find(f => f.id === activeFlightId);
  const idaFlights = flights.filter(f => f.type === "ida");
  const voltaFlights = flights.filter(f => f.type === "volta");
  const allConfirmed = flights.length > 0 && flights.every(f => f.confirmed);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <NiaAvatar size="md" />
          <div>
            <h2 className="font-semibold text-foreground">Detalhamento Operacional</h2>
            <p className="text-sm text-muted-foreground">
              Informe os dados de voos por texto ou áudio
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 overflow-y-auto">
        {/* Flight Tabs */}
        <Tabs defaultValue="ida" className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="ida" className="gap-2">
                <Plane className="h-4 w-4" />
                Ida ({idaFlights.length})
              </TabsTrigger>
              <TabsTrigger value="volta" className="gap-2">
                <Plane className="h-4 w-4 rotate-180" />
                Volta ({voltaFlights.length})
              </TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddFlight("ida")}
              >
                <Plus className="h-4 w-4 mr-1" />
                Ida
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAddFlight("volta")}
              >
                <Plus className="h-4 w-4 mr-1" />
                Volta
              </Button>
            </div>
          </div>

          <TabsContent value="ida">
            {idaFlights.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <Plane className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground">Nenhum voo de ida cadastrado</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => handleAddFlight("ida")}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar voo de ida
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {idaFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    isActive={flight.id === activeFlightId}
                    isPendingConfirmation={pendingConfirmation?.flightId === flight.id}
                    confirmationText={pendingConfirmation?.displayText}
                    onSelect={() => setActiveFlightId(flight.id)}
                    onUpdate={(updates) => onUpdateFlight(flight.id, updates)}
                    onConfirm={() => handleConfirmFlight(flight.id)}
                    onCancelConfirmation={handleCancelConfirmation}
                    onRemove={() => onRemoveFlight(flight.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="volta">
            {voltaFlights.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="pt-6 text-center">
                  <Plane className="h-8 w-8 mx-auto text-muted-foreground mb-2 rotate-180" />
                  <p className="text-muted-foreground">Nenhum voo de volta cadastrado</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => handleAddFlight("volta")}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Adicionar voo de volta
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {voltaFlights.map((flight) => (
                  <FlightCard
                    key={flight.id}
                    flight={flight}
                    isActive={flight.id === activeFlightId}
                    isPendingConfirmation={pendingConfirmation?.flightId === flight.id}
                    confirmationText={pendingConfirmation?.displayText}
                    onSelect={() => setActiveFlightId(flight.id)}
                    onUpdate={(updates) => onUpdateFlight(flight.id, updates)}
                    onConfirm={() => handleConfirmFlight(flight.id)}
                    onCancelConfirmation={handleCancelConfirmation}
                    onRemove={() => onRemoveFlight(flight.id)}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* NIA Security Notice */}
        <Card className="border-amber-500/30 bg-amber-500/5">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">Regra de Segurança</p>
                <p className="text-xs text-muted-foreground mt-1">
                  A N.IA nunca mistura ida e volta, nunca assume aeroportos ou horários, 
                  e sempre confirma antes de salvar. Dados incompletos não serão salvos.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-border">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={onBack}>
            Voltar às perguntas
          </Button>

          <div className="flex items-center gap-3">
            {/* Audio Input Button */}
            {activeFlightId && (
              <Button
                variant="outline"
                onClick={handleAudioInput}
                className={cn(
                  voiceState === "listening" && "border-accent bg-accent/10"
                )}
              >
                {voiceState === "listening" ? (
                  <>
                    <MicOff className="h-4 w-4 mr-2 text-accent" />
                    Parar
                  </>
                ) : voiceState === "processing" ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Mic className="h-4 w-4 mr-2" />
                    Falar dados do voo
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={onComplete}
              disabled={!allConfirmed}
              className="bg-accent hover:bg-accent/90"
            >
              Continuar para revisão
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// FLIGHT CARD COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

interface FlightCardProps {
  flight: FlightDetails;
  isActive: boolean;
  isPendingConfirmation: boolean;
  confirmationText?: string;
  onSelect: () => void;
  onUpdate: (updates: Partial<FlightDetails>) => void;
  onConfirm: () => void;
  onCancelConfirmation: () => void;
  onRemove: () => void;
}

function FlightCard({
  flight,
  isActive,
  isPendingConfirmation,
  confirmationText,
  onSelect,
  onUpdate,
  onConfirm,
  onCancelConfirmation,
  onRemove,
}: FlightCardProps) {
  return (
    <Card
      className={cn(
        "transition-all cursor-pointer",
        isActive && "ring-2 ring-accent",
        flight.confirmed && "border-green-500/30 bg-green-500/5"
      )}
      onClick={onSelect}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plane className={cn(
              "h-4 w-4",
              flight.type === "volta" && "rotate-180"
            )} />
            <CardTitle className="text-base">
              {flight.type === "ida" ? "Voo de Ida" : "Voo de Volta"}
            </CardTitle>
            {flight.confirmed && (
              <Badge variant="outline" className="text-green-500 border-green-500/30">
                <Check className="h-3 w-3 mr-1" />
                Confirmado
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-red-500"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      {/* Confirmation Banner */}
      {isPendingConfirmation && confirmationText && (
        <div className="mx-6 mb-4 p-3 bg-accent/10 border border-accent/30 rounded-lg">
          <p className="text-sm text-foreground mb-2">
            <strong>Confirma os dados detectados?</strong>
          </p>
          <p className="text-xs text-muted-foreground mb-3">{confirmationText}</p>
          <div className="flex gap-2">
            <Button size="sm" onClick={onConfirm} className="bg-accent hover:bg-accent/90">
              <Check className="h-3 w-3 mr-1" />
              Confirmar
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelConfirmation}>
              <X className="h-3 w-3 mr-1" />
              Corrigir
            </Button>
          </div>
        </div>
      )}

      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Companhia Aérea</Label>
            <Input
              value={flight.airline}
              onChange={(e) => onUpdate({ airline: e.target.value })}
              placeholder="Ex: LATAM"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <Label className="text-xs">Número do Voo</Label>
            <Input
              value={flight.flightNumber}
              onChange={(e) => onUpdate({ flightNumber: e.target.value })}
              placeholder="Ex: LA8084"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Aeroporto de Origem</Label>
            <Input
              value={flight.originAirport}
              onChange={(e) => onUpdate({ originAirport: e.target.value.toUpperCase() })}
              placeholder="Ex: GRU"
              maxLength={3}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <Label className="text-xs">Aeroporto de Destino</Label>
            <Input
              value={flight.destinationAirport}
              onChange={(e) => onUpdate({ destinationAirport: e.target.value.toUpperCase() })}
              placeholder="Ex: LIS"
              maxLength={3}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Horário de Saída</Label>
            <Input
              type="time"
              value={flight.departureTime}
              onChange={(e) => onUpdate({ departureTime: e.target.value })}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <Label className="text-xs">Horário de Chegada</Label>
            <Input
              type="time"
              value={flight.arrivalTime}
              onChange={(e) => onUpdate({ arrivalTime: e.target.value })}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="text-xs">Conexões</Label>
            <Input
              value={flight.connections}
              onChange={(e) => onUpdate({ connections: e.target.value })}
              placeholder="Ex: Voo direto ou Conexão em MAD"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div>
            <Label className="text-xs">Bagagem</Label>
            <Select
              value={flight.baggage}
              onValueChange={(value) => onUpdate({ baggage: value as FlightDetails["baggage"] })}
            >
              <SelectTrigger onClick={(e) => e.stopPropagation()}>
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mao">Apenas mão</SelectItem>
                <SelectItem value="despachada">Despachada</SelectItem>
                <SelectItem value="ambas">Mão + Despachada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <Label className="text-xs">Observações</Label>
          <Textarea
            value={flight.notes}
            onChange={(e) => onUpdate({ notes: e.target.value })}
            placeholder="Observações relevantes..."
            rows={2}
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {!flight.confirmed && (
          <Button
            className="w-full bg-accent hover:bg-accent/90"
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
            disabled={!flight.airline || !flight.originAirport || !flight.destinationAirport}
          >
            <Check className="h-4 w-4 mr-2" />
            Confirmar dados do voo
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
