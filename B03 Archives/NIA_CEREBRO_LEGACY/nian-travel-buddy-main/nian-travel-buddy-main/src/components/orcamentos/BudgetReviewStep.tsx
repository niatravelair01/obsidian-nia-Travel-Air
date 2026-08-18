import { useState } from "react";
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  Eye, 
  CheckCircle2, 
  AlertTriangle,
  Plane,
  Calendar,
  User,
  Target
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { BudgetData } from "@/hooks/useBudgetCreation";
import { PDFStyle, BudgetPDFDownload } from "./BudgetPDFGenerator";
import { PDFStyleSelector } from "./PDFStyleSelector";
import { AgencyLogoUpload } from "./AgencyLogoUpload";
import { NiaAvatar } from "@/components/nia/NiaAvatar";

// ═══════════════════════════════════════════════════════════════════════════════
// BUDGET REVIEW STEP — REVISÃO E GERAÇÃO DO PDF
// 
// Última etapa antes de gerar o PDF profissional.
// ═══════════════════════════════════════════════════════════════════════════════

interface BudgetReviewStepProps {
  budgetData: BudgetData;
  onBack: () => void;
  onComplete: () => void;
}

export function BudgetReviewStep({ budgetData, onBack, onComplete }: BudgetReviewStepProps) {
  const [pdfStyle, setPdfStyle] = useState<PDFStyle>('executivo');
  const [agencyLogo, setAgencyLogo] = useState<string | null>(null);
  const [agencyName, setAgencyName] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Carregar nome da agência do localStorage
  useState(() => {
    const savedName = localStorage.getItem('agency-name');
    if (savedName) {
      setAgencyName(savedName);
    }
  });

  const formatCurrency = (value: number | null) => {
    if (value === null) return 'A definir';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getTripOccasionLabel = (occasion: string | null) => {
    const labels: Record<string, string> = {
      lazer: 'Lazer',
      lua_de_mel: 'Lua de Mel',
      familia: 'Viagem em Família',
      trabalho: 'Negócios',
      presente: 'Presente',
      outro: 'Outro',
    };
    return labels[occasion || ''] || 'Não especificado';
  };

  const getTripFocusLabel = (focus: string | null) => {
    const labels: Record<string, string> = {
      preco: 'Melhor preço',
      conforto: 'Conforto',
      experiencia: 'Experiência única',
      equilibrio: 'Custo-benefício equilibrado',
      nao_sei: 'A definir',
    };
    return labels[focus || ''] || 'Não especificado';
  };

  const getRiskColor = (level: string | null) => {
    switch (level) {
      case 'baixo':
        return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'medio':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      case 'alto':
        return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const confirmedFlights = budgetData.flights.filter(f => f.confirmed);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <NiaAvatar size="md" />
            <div>
              <h2 className="font-semibold text-foreground">Revisão do Orçamento</h2>
              <p className="text-sm text-muted-foreground">
                Verifique os dados e escolha o estilo do PDF
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Resumo do Orçamento */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5 text-accent" />
              Resumo do Orçamento
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Cliente</p>
                  <p className="text-sm font-medium">{budgetData.clientName || 'Não informado'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Destino</p>
                  <p className="text-sm font-medium">{budgetData.destination || 'Não informado'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Período</p>
                  <p className="text-sm font-medium">{budgetData.period || 'A definir'}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Plane className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Ocasião</p>
                  <p className="text-sm font-medium">{getTripOccasionLabel(budgetData.profile.tripOccasion)}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Valor e Risco */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Valor Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(budgetData.totalValue)}
                </p>
              </div>
              
              {budgetData.riskLevel && (
                <Badge variant="outline" className={getRiskColor(budgetData.riskLevel)}>
                  {budgetData.riskLevel === 'alto' && <AlertTriangle className="h-3 w-3 mr-1" />}
                  {budgetData.riskLevel === 'baixo' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                  Risco {budgetData.riskLevel}
                </Badge>
              )}
            </div>

            {/* Alertas de Risco */}
            {budgetData.riskReasons.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <p className="text-xs font-medium text-amber-600 mb-2">Pontos de atenção:</p>
                <ul className="text-xs text-amber-600/80 space-y-1">
                  {budgetData.riskReasons.map((reason, i) => (
                    <li key={i}>• {reason}</li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Voos Confirmados */}
        {confirmedFlights.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <Plane className="h-5 w-5 text-accent" />
                Voos ({confirmedFlights.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {confirmedFlights.map((flight) => (
                  <div 
                    key={flight.id}
                    className="p-3 rounded-lg bg-secondary/50 border border-border"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {flight.type === 'ida' ? '✈️ Ida' : '✈️ Volta'}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {flight.airline} {flight.flightNumber}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {flight.originAirport} → {flight.destinationAirport}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {flight.departureTime} - {flight.arrivalTime}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Configurações do PDF */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Configurações do PDF</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Logo da Agência */}
            <AgencyLogoUpload 
              logo={agencyLogo} 
              onLogoChange={setAgencyLogo} 
            />

            <Separator />

            {/* Estilo do PDF */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-foreground">
                Estilo Visual
              </label>
              <PDFStyleSelector value={pdfStyle} onChange={setPdfStyle} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-border">
        <div className="flex items-center justify-between gap-4">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Editar Dados
          </Button>

          <div className="flex gap-3">
            <BudgetPDFDownload
              data={budgetData}
              style={pdfStyle}
              agencyLogo={agencyLogo || undefined}
              agencyName={agencyName || undefined}
            >
              <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">
                <Download className="h-4 w-4 mr-2" />
                Gerar PDF Premium
              </Button>
            </BudgetPDFDownload>
          </div>
        </div>
      </div>
    </div>
  );
}
