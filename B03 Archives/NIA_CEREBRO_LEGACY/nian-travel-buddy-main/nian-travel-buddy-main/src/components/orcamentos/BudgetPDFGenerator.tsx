import { Document, Page, Text, View, Image, StyleSheet, Font, PDFDownloadLink } from '@react-pdf/renderer';
import { BudgetData } from '@/hooks/useBudgetCreation';

// ═══════════════════════════════════════════════════════════════════════════════
// PDF GENERATOR — ORÇAMENTOS PROFISSIONAIS
// 
// 3 Estilos fixos:
//   1. Executivo Clean (padrão) - fundo branco, corporativo
//   2. Premium Turismo - cards elegantes, foco em experiência
//   3. Ultra Premium VIP - fundo escuro, minimalista
// ═══════════════════════════════════════════════════════════════════════════════

export type PDFStyle = 'executivo' | 'premium' | 'vip';

interface BudgetPDFProps {
  data: BudgetData;
  style: PDFStyle;
  agencyLogo?: string;
  agencyName?: string;
}

// ─────────────────────────────────────────────────────────────────
// ESTILOS BASE
// ─────────────────────────────────────────────────────────────────

const baseStyles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 40,
    objectFit: 'contain',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    paddingBottom: 6,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 10,
    width: '40%',
  },
  value: {
    fontSize: 10,
    width: '60%',
  },
  card: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
  },
  totalBox: {
    padding: 20,
    borderRadius: 8,
    marginTop: 20,
  },
  totalValue: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  totalLabel: {
    fontSize: 12,
    textAlign: 'center',
    marginTop: 4,
  },
  legalText: {
    fontSize: 8,
    lineHeight: 1.4,
    marginTop: 20,
  },
});

// ─────────────────────────────────────────────────────────────────
// ESTILO 1: EXECUTIVO CLEAN
// ─────────────────────────────────────────────────────────────────

const executivoStyles = StyleSheet.create({
  page: {
    ...baseStyles.page,
    backgroundColor: '#FFFFFF',
  },
  title: {
    ...baseStyles.title,
    color: '#1a1a1a',
  },
  subtitle: {
    ...baseStyles.subtitle,
    color: '#666666',
  },
  sectionTitle: {
    ...baseStyles.sectionTitle,
    color: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e5e5',
  },
  label: {
    ...baseStyles.label,
    color: '#666666',
  },
  value: {
    ...baseStyles.value,
    color: '#1a1a1a',
  },
  card: {
    ...baseStyles.card,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },
  totalBox: {
    ...baseStyles.totalBox,
    backgroundColor: '#1a1a1a',
  },
  totalValue: {
    ...baseStyles.totalValue,
    color: '#FFFFFF',
  },
  totalLabel: {
    ...baseStyles.totalLabel,
    color: '#cccccc',
  },
  footer: {
    ...baseStyles.footer,
    color: '#999999',
  },
  legalText: {
    ...baseStyles.legalText,
    color: '#999999',
  },
});

// ─────────────────────────────────────────────────────────────────
// ESTILO 2: PREMIUM TURISMO
// ─────────────────────────────────────────────────────────────────

const premiumStyles = StyleSheet.create({
  page: {
    ...baseStyles.page,
    backgroundColor: '#fefefe',
  },
  title: {
    ...baseStyles.title,
    color: '#0f4c5c',
  },
  subtitle: {
    ...baseStyles.subtitle,
    color: '#5f9ea0',
  },
  sectionTitle: {
    ...baseStyles.sectionTitle,
    color: '#0f4c5c',
    borderBottomWidth: 2,
    borderBottomColor: '#9fb8ad',
  },
  label: {
    ...baseStyles.label,
    color: '#5f9ea0',
  },
  value: {
    ...baseStyles.value,
    color: '#2d3436',
  },
  card: {
    ...baseStyles.card,
    backgroundColor: '#e8f4f8',
    borderWidth: 0,
    borderLeftWidth: 4,
    borderLeftColor: '#0f4c5c',
  },
  totalBox: {
    ...baseStyles.totalBox,
    backgroundColor: '#0f4c5c',
  },
  totalValue: {
    ...baseStyles.totalValue,
    color: '#FFFFFF',
  },
  totalLabel: {
    ...baseStyles.totalLabel,
    color: '#9fb8ad',
  },
  footer: {
    ...baseStyles.footer,
    color: '#5f9ea0',
  },
  legalText: {
    ...baseStyles.legalText,
    color: '#5f9ea0',
  },
});

// ─────────────────────────────────────────────────────────────────
// ESTILO 3: ULTRA PREMIUM VIP
// ─────────────────────────────────────────────────────────────────

const vipStyles = StyleSheet.create({
  page: {
    ...baseStyles.page,
    backgroundColor: '#0d0d0d',
  },
  title: {
    ...baseStyles.title,
    color: '#d4af37',
  },
  subtitle: {
    ...baseStyles.subtitle,
    color: '#808080',
  },
  sectionTitle: {
    ...baseStyles.sectionTitle,
    color: '#d4af37',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  label: {
    ...baseStyles.label,
    color: '#808080',
  },
  value: {
    ...baseStyles.value,
    color: '#ffffff',
  },
  card: {
    ...baseStyles.card,
    backgroundColor: '#1a1a1a',
    borderWidth: 1,
    borderColor: '#333333',
  },
  totalBox: {
    ...baseStyles.totalBox,
    backgroundColor: '#d4af37',
  },
  totalValue: {
    ...baseStyles.totalValue,
    color: '#0d0d0d',
  },
  totalLabel: {
    ...baseStyles.totalLabel,
    color: '#333333',
  },
  footer: {
    ...baseStyles.footer,
    color: '#555555',
  },
  legalText: {
    ...baseStyles.legalText,
    color: '#555555',
  },
});

const getStyles = (style: PDFStyle) => {
  switch (style) {
    case 'premium':
      return premiumStyles;
    case 'vip':
      return vipStyles;
    default:
      return executivoStyles;
  }
};

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

const formatCurrency = (value: number | null) => {
  if (value === null) return 'A consultar';
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

// ─────────────────────────────────────────────────────────────────
// COMPONENTE DO PDF
// ─────────────────────────────────────────────────────────────────

export function BudgetPDFDocument({ data, style, agencyLogo, agencyName }: BudgetPDFProps) {
  const styles = getStyles(style);

  return (
    <Document>
      {/* PÁGINA 1: CAPA */}
      <Page size="A4" style={styles.page}>
        {/* Header com Logo */}
        <View style={baseStyles.header}>
          {agencyLogo && (
            <Image src={agencyLogo} style={baseStyles.logo} />
          )}
          {agencyName && (
            <Text style={{ fontSize: 12, color: styles.label.color, marginTop: 8 }}>
              {agencyName}
            </Text>
          )}
        </View>

        {/* Título do Destino */}
        <View style={{ marginTop: 80, marginBottom: 60 }}>
          <Text style={styles.title}>{data.destination || 'Destino'}</Text>
          <Text style={styles.subtitle}>
            {getTripOccasionLabel(data.profile.tripOccasion)} • {data.period || 'Datas a confirmar'}
          </Text>
        </View>

        {/* Resumo da Proposta */}
        <View style={styles.card}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: styles.value.color, marginBottom: 12 }}>
            Proposta Personalizada
          </Text>
          <Text style={{ fontSize: 10, color: styles.label.color, lineHeight: 1.5 }}>
            Preparamos esta proposta exclusiva para {data.clientName || 'você'}, 
            considerando suas preferências e buscando o melhor em {getTripFocusLabel(data.profile.tripFocus).toLowerCase()}.
          </Text>
        </View>

        {/* Box de Valor Total */}
        {data.totalValue && (
          <View style={styles.totalBox}>
            <Text style={styles.totalValue}>{formatCurrency(data.totalValue)}</Text>
            <Text style={styles.totalLabel}>Valor Total da Proposta</Text>
          </View>
        )}

        {/* Footer */}
        <Text style={styles.footer}>
          Proposta válida por 7 dias • Sujeita à disponibilidade no momento da confirmação
        </Text>
      </Page>

      {/* PÁGINA 2: DETALHAMENTO */}
      <Page size="A4" style={styles.page}>
        {/* Seção: Resumo da Viagem */}
        <View style={baseStyles.section}>
          <Text style={styles.sectionTitle}>Resumo da Viagem</Text>
          
          <View style={baseStyles.row}>
            <Text style={styles.label}>Destino</Text>
            <Text style={styles.value}>{data.destination || 'A definir'}</Text>
          </View>
          
          <View style={baseStyles.row}>
            <Text style={styles.label}>Período</Text>
            <Text style={styles.value}>{data.period || 'A definir'}</Text>
          </View>
          
          <View style={baseStyles.row}>
            <Text style={styles.label}>Ocasião</Text>
            <Text style={styles.value}>{getTripOccasionLabel(data.profile.tripOccasion)}</Text>
          </View>
          
          <View style={baseStyles.row}>
            <Text style={styles.label}>Foco da Viagem</Text>
            <Text style={styles.value}>{getTripFocusLabel(data.profile.tripFocus)}</Text>
          </View>
        </View>

        {/* Seção: Voos */}
        {data.flights.length > 0 && (
          <View style={baseStyles.section}>
            <Text style={styles.sectionTitle}>Voos</Text>
            
            {data.flights.filter(f => f.confirmed).map((flight, index) => (
              <View key={flight.id} style={styles.card}>
                <Text style={{ fontSize: 11, fontWeight: 'bold', color: styles.value.color, marginBottom: 8 }}>
                  {flight.type === 'ida' ? '✈️ Ida' : '✈️ Volta'} - {flight.airline} {flight.flightNumber}
                </Text>
                
                <View style={baseStyles.row}>
                  <Text style={styles.label}>Origem</Text>
                  <Text style={styles.value}>{flight.originAirport}</Text>
                </View>
                
                <View style={baseStyles.row}>
                  <Text style={styles.label}>Destino</Text>
                  <Text style={styles.value}>{flight.destinationAirport}</Text>
                </View>
                
                <View style={baseStyles.row}>
                  <Text style={styles.label}>Horário</Text>
                  <Text style={styles.value}>{flight.departureTime} → {flight.arrivalTime}</Text>
                </View>
                
                {flight.baggage && (
                  <View style={baseStyles.row}>
                    <Text style={styles.label}>Bagagem</Text>
                    <Text style={styles.value}>
                      {flight.baggage === 'mao' ? 'Mão (10kg)' : 
                       flight.baggage === 'despachada' ? 'Despachada (23kg)' : 
                       'Mão + Despachada'}
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Seção: Observações */}
        <View style={baseStyles.section}>
          <Text style={styles.sectionTitle}>Observações Importantes</Text>
          
          <View style={styles.card}>
            <Text style={{ fontSize: 9, color: styles.label.color, lineHeight: 1.5 }}>
              • Valores sujeitos à disponibilidade no momento da reserva{'\n'}
              • Taxas de embarque e serviços inclusos no valor total{'\n'}
              • Seguro viagem recomendado para destinos internacionais{'\n'}
              • Documentação necessária deve ser verificada antes da viagem{'\n'}
              • Alterações podem gerar custos adicionais conforme política das companhias
            </Text>
          </View>
        </View>

        {/* Avisos Legais */}
        <Text style={styles.legalText}>
          Esta proposta foi elaborada com base nas informações fornecidas e condições disponíveis no momento da consulta. 
          Os preços e disponibilidades podem sofrer alterações sem aviso prévio. A confirmação da reserva está sujeita 
          à verificação final de disponibilidade e pagamento. Consulte as condições de cancelamento e alteração 
          específicas de cada serviço contratado.
        </Text>

        {/* Footer */}
        <Text style={styles.footer}>
          {agencyName ? `${agencyName} • ` : ''}Documento gerado em {new Date().toLocaleDateString('pt-BR')}
        </Text>
      </Page>
    </Document>
  );
}

// ─────────────────────────────────────────────────────────────────
// COMPONENTE DE DOWNLOAD
// ─────────────────────────────────────────────────────────────────

interface BudgetPDFDownloadProps {
  data: BudgetData;
  style: PDFStyle;
  agencyLogo?: string;
  agencyName?: string;
  fileName?: string;
  children: React.ReactNode;
}

export function BudgetPDFDownload({ 
  data, 
  style, 
  agencyLogo, 
  agencyName, 
  fileName,
  children 
}: BudgetPDFDownloadProps) {
  const pdfFileName = fileName || `orcamento-${data.destination?.toLowerCase().replace(/\s+/g, '-') || 'viagem'}.pdf`;
  
  return (
    <PDFDownloadLink
      document={
        <BudgetPDFDocument 
          data={data} 
          style={style} 
          agencyLogo={agencyLogo}
          agencyName={agencyName}
        />
      }
      fileName={pdfFileName}
    >
      {({ loading }) => (loading ? 'Gerando PDF...' : children)}
    </PDFDownloadLink>
  );
}
