import { useState, useCallback, useEffect } from "react";
import { ArrowLeft, ArrowRight, Mic, MicOff, Check, Loader2, AlertTriangle, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { NiaAvatar } from "@/components/nia/NiaAvatar";
import { useBudgetCreation, BudgetProfile } from "@/hooks/useBudgetCreation";
import { useNiaVoiceChat } from "@/hooks/useNiaVoiceChat";
import { useToast } from "@/hooks/use-toast";

// ═══════════════════════════════════════════════════════════════════════════════
// GUIDED BUDGET FLOW — FLUXO GUIADO PELA NIA
// 
// A NIA conduz passo a passo, aceitando texto ou áudio como resposta.
// Nunca assume dados não confirmados.
// ═══════════════════════════════════════════════════════════════════════════════

interface GuidedBudgetFlowProps {
  onComplete: (budgetData: any) => void;
  onCancel: () => void;
}

export function GuidedBudgetFlow({ onComplete, onCancel }: GuidedBudgetFlowProps) {
  const { toast } = useToast();
  const {
    currentStep,
    currentQuestionIndex,
    currentQuestion,
    questions,
    progress,
    budgetData,
    answerQuestion,
    previousQuestion,
    updateProfile,
    goToStep,
    analyzeRisks,
  } = useBudgetCreation();

  const {
    voiceState,
    startListening,
    stopListening,
    cancelListening,
  } = useNiaVoiceChat("budget-creation");

  const [textInput, setTextInput] = useState("");
  const [currencyInput, setCurrencyInput] = useState("");
  const [percentageInput, setPercentageInput] = useState("");
  const [isUnknown, setIsUnknown] = useState(false);

  // Reset input quando mudar de pergunta
  useEffect(() => {
    setTextInput("");
    setCurrencyInput("");
    setPercentageInput("");
    setIsUnknown(false);
  }, [currentQuestionIndex]);

  // Processar resposta por áudio
  const handleAudioResponse = useCallback(async () => {
    if (voiceState === "listening") {
      const transcript = await stopListening();
      if (transcript) {
        // Interpretar resposta por áudio
        processAudioTranscript(transcript);
      }
    } else {
      await startListening();
    }
  }, [voiceState, stopListening, startListening]);

  // Interpretar transcrição de áudio para a pergunta atual
  const processAudioTranscript = useCallback((transcript: string) => {
    if (!currentQuestion) return;
    
    const lowerTranscript = transcript.toLowerCase().trim();
    
    // Verificar "não sei"
    if (lowerTranscript.includes("não sei") || lowerTranscript.includes("nao sei")) {
      if (currentQuestion.options?.some(o => o.value === "nao_sei")) {
        answerQuestion("nao_sei");
        return;
      }
    }
    
    // Para perguntas de múltipla escolha
    if (currentQuestion.options) {
      for (const option of currentQuestion.options) {
        const optionLabel = option.label.toLowerCase();
        if (lowerTranscript.includes(optionLabel) || optionLabel.includes(lowerTranscript)) {
          answerQuestion(option.value);
          toast({
            title: "Resposta registrada",
            description: `"${option.label}" foi selecionado.`,
          });
          return;
        }
      }
      
      // Não conseguiu interpretar
      toast({
        title: "Não entendi",
        description: "Por favor, escolha uma das opções ou repita sua resposta.",
        variant: "destructive",
      });
      return;
    }
    
    // Para perguntas de valor (currency)
    if (currentQuestion.type === "currency") {
      const numbers = lowerTranscript.match(/\d+/g);
      if (numbers) {
        const value = parseInt(numbers.join(""));
        setCurrencyInput(value.toString());
        toast({
          title: "Valor detectado",
          description: `R$ ${value.toLocaleString("pt-BR")} - confirme para continuar.`,
        });
        return;
      }
    }
    
    // Para perguntas de percentual
    if (currentQuestion.type === "percentage") {
      const numbers = lowerTranscript.match(/\d+/g);
      if (numbers) {
        const value = parseInt(numbers[0]);
        setPercentageInput(value.toString());
        toast({
          title: "Percentual detectado",
          description: `${value}% - confirme para continuar.`,
        });
        return;
      }
    }
    
    // Fallback - não conseguiu interpretar
    toast({
      title: "Não entendi completamente",
      description: `Você disse: "${transcript}". Use os botões ou digite sua resposta.`,
    });
  }, [currentQuestion, answerQuestion, toast]);

  // Submeter resposta de texto/valor
  const handleSubmitValue = useCallback(() => {
    if (!currentQuestion) return;
    
    if (currentQuestion.type === "currency") {
      if (isUnknown) {
        updateProfile("budgetCeilingUnknown", true);
        answerQuestion(null);
      } else {
        const value = parseInt(currencyInput.replace(/\D/g, ""));
        if (value > 0) {
          answerQuestion(value);
        }
      }
    } else if (currentQuestion.type === "percentage") {
      const value = parseInt(percentageInput);
      if (value >= 0 && value <= 100) {
        answerQuestion(value);
      }
    }
  }, [currentQuestion, currencyInput, percentageInput, isUnknown, answerQuestion, updateProfile]);

  // NIA Insight baseado nas respostas
  const getNiaInsight = useCallback(() => {
    const { profile } = budgetData;
    
    if (profile.urgentTrip === "sim") {
      return {
        type: "warning",
        message: "Viagem urgente detectada. Vou ajudar a priorizar itens críticos.",
      };
    }
    
    if (profile.hasReferencePrice === "sim" && profile.tripFocus === "preco") {
      return {
        type: "alert",
        message: "Cliente focado em preço com referência. Atenção com a margem.",
      };
    }
    
    if (profile.decisionProfile === "indeciso") {
      return {
        type: "info",
        message: "Cliente indeciso - prepare argumentos fortes e follow-up planejado.",
      };
    }
    
    return null;
  }, [budgetData]);

  const niaInsight = getNiaInsight();

  if (currentStep !== "profile") {
    return null; // Renderizar outro componente para a próxima etapa
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <NiaAvatar size="md" />
            <div>
              <h2 className="font-semibold text-foreground">Orçamento Guiado</h2>
              <p className="text-sm text-muted-foreground">
                Pergunta {currentQuestionIndex + 1} de {questions.length}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Question Area */}
      <div className="flex-1 p-6 overflow-y-auto">
        {currentQuestion && (
          <Card className="mb-6 border-accent/30 bg-accent/5">
            <CardHeader>
              <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
              {currentQuestion.type && (
                <CardDescription>
                  {currentQuestion.type === "currency" && "Digite o valor em reais"}
                  {currentQuestion.type === "percentage" && "Digite o percentual desejado"}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent>
              {/* Options */}
              {currentQuestion.options && (
                <div className="grid gap-3">
                  {currentQuestion.options.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => answerQuestion(option.value)}
                      className={cn(
                        "w-full p-4 rounded-lg border-2 text-left transition-all",
                        "border-border hover:border-accent/50 bg-card",
                        "focus:outline-none focus:ring-2 focus:ring-accent/50"
                      )}
                    >
                      <span className="font-medium text-foreground">{option.label}</span>
                    </button>
                  ))}
                </div>
              )}

              {/* Currency Input */}
              {currentQuestion.type === "currency" && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        R$
                      </span>
                      <Input
                        type="text"
                        value={currencyInput}
                        onChange={(e) => setCurrencyInput(e.target.value.replace(/\D/g, ""))}
                        placeholder="0"
                        className="pl-10"
                        disabled={isUnknown}
                      />
                    </div>
                    <Button 
                      onClick={handleSubmitValue}
                      disabled={!currencyInput && !isUnknown}
                      className="bg-accent hover:bg-accent/90"
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                  {currentQuestion.allowUnknown && (
                    <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isUnknown}
                        onChange={(e) => setIsUnknown(e.target.checked)}
                        className="rounded border-border"
                      />
                      Não sei / Sem limite definido
                    </label>
                  )}
                </div>
              )}

              {/* Percentage Input */}
              {currentQuestion.type === "percentage" && (
                <div className="flex gap-3">
                  <div className="relative flex-1">
                    <Input
                      type="number"
                      value={percentageInput}
                      onChange={(e) => setPercentageInput(e.target.value)}
                      placeholder={currentQuestion.placeholder || "0"}
                      min="0"
                      max="100"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      %
                    </span>
                  </div>
                  <Button 
                    onClick={handleSubmitValue}
                    disabled={!percentageInput}
                    className="bg-accent hover:bg-accent/90"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* NIA Insight */}
        {niaInsight && (
          <Card className={cn(
            "mb-6",
            niaInsight.type === "warning" && "border-amber-500/30 bg-amber-500/5",
            niaInsight.type === "alert" && "border-red-500/30 bg-red-500/5",
            niaInsight.type === "info" && "border-accent/30 bg-accent/5"
          )}>
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                {niaInsight.type === "warning" && <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0" />}
                {niaInsight.type === "alert" && <AlertTriangle className="h-5 w-5 text-red-500 shrink-0" />}
                {niaInsight.type === "info" && <Info className="h-5 w-5 text-accent shrink-0" />}
                <div>
                  <p className="text-sm font-medium text-foreground">Observação da N.IA</p>
                  <p className="text-sm text-muted-foreground mt-1">{niaInsight.message}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-border">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={previousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>

          <div className="flex items-center gap-3">
            {/* Mic Button */}
            <Button
              variant="outline"
              size="icon"
              onClick={handleAudioResponse}
              className={cn(
                "relative",
                voiceState === "listening" && "border-accent bg-accent/10"
              )}
            >
              {voiceState === "listening" ? (
                <MicOff className="h-4 w-4 text-accent" />
              ) : voiceState === "processing" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>

            {voiceState === "listening" && (
              <Badge variant="outline" className="text-accent border-accent/30">
                Ouvindo...
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            onClick={() => answerQuestion("nao_sei")}
            disabled={!currentQuestion?.options?.some(o => o.value === "nao_sei")}
            className="text-muted-foreground"
          >
            Pular
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
