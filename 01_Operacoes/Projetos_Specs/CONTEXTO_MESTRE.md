# 🧠 NIA GUARDIAN PRO — CONTEXTO MESTRE (LEIA PRIMEIRO)

> **REGRA:** Este arquivo deve ser lido NO INÍCIO DE CADA SESSÃO antes de qualquer ação.
> **Última atualização:** 14/04/2026

---

## 1. O QUE É O PROJETO

**NIA Guardian Pro** é um **SaaS** (software vendido por assinatura) para agências de viagem.
- **Não é** uso interno apenas. **É** um produto para vender para outras agências.
- **Primeiro cliente/beta-tester:** Gabriel na sua própria agência **Noma Travel**
- Testa → Valida → Melhora → Vende para outras agências

**Repositório GitHub:** `https://github.com/niatravelair01/nia-guardian-pro.git`
**Pasta local:** `c:\Users\gabriel\OneDrive\Desktop\CÉREBRO NOMA IA\NIA-GUARDIAN-PRO`
**Obsidian (Cérebro):** `c:\Users\gabriel\OneDrive\Desktop\CÉREBRO NOMA IA\NIA CÉREBRO`

**IMPORTANTE:** Todo desenvolvimento novo vai pelo **Lovable** (não editar repositório diretamente).

---

## 2. IDENTIDADE DO PRODUTO

- **Nome:** NIA Travelware / NIA Guardian Pro
- **Significado:** Navio, Iate, Avião
- **Função:** Sistema operacional inteligente para agências de viagem.
- **Propósito:** Transformar agências desorganizadas em operações lucrativas, previsíveis e escaláveis.
- **Como a IA age:** Como sócio estratégico. Sempre prioriza margem e lucro sustentável.

---

## 3. PÁGINAS CONFIRMADAS

### MANTER 100%
- Dashboard (saudação, saúde da agência, insights, prioridades do dia, tour de boas-vindas)
- Clientes (CRM + aba Em Negociação + indicador de risco)
- Operação Manual (cadastro manual sem IA)
- Relatórios (sem mudanças)
- Treinamento (videoaulas)
- Conversa com NIA (chat + voz)
- Modo Claro/Escuro

### MANTER + MELHORAR
- Orçamentos → novo modelo com paleta de cores + logo do cliente, exportação profissional
- Financeiro → melhorar visualização
- Configurações → garantir multi-tenant por agência

### NOVO
- Voz Flutuante Global (em todas as páginas, funciona em background)
- Voz → CRM automático (NIA registra infos por voz)
- Extensão WhatsApp 24/7 (captura leads automaticamente)

### FORA DO SISTEMA
- Blindagem, Gargalos, Decisão

---

## 4. REGRAS DE NEGÓCIO

### Precificação:
- Margem mínima: 13% | Margem alvo: 20% | Lucro mínimo/passageiro: R$350

### Prioridade de Leads:
- Score > 8 + Imediato = Alerta Vermelho (4h para agir)
- Score 5-8 + Definido = Atenção (48h)
- Score < 5 = Baixa prioridade

### Follow-up:
- 24h = Ping de Cortesia | 48-72h = Gatilho de Escassez | 7 dias = Retomada de Valor
- Máximo 3 mensagens sem resposta → Mover para Perdido/VIP

---

## 5. MOTOR DE VOZ (Specs Técnicas)

- Ativação: Duas palmas (Web Audio API) ou "Ativar NIA" (Picovoice)
- Latência: Sub-500ms via OpenAI Realtime API + WebSockets
- PWA para funcionar em background mesmo em outras abas
- Captura por voz → distribui para CRM, tarefas e orçamentos

---

## 6. STACK TÉCNICA

- Frontend: React + TypeScript + Vite (via Lovable)
- Backend: Supabase (banco + Edge Functions)
- IA: OpenAI (Chat + Realtime API)
- WhatsApp: API WhatsApp Business / Extensão Chrome

---

## 7. ORDEM DE CONSTRUÇÃO

1. Estrutura base (rotas, layout, sidebar)
2. Dashboard com insights
3. Orçamentos novo modelo
4. Clientes + Operação Manual
5. Financeiro + Relatórios
6. Treinamento + Configurações
7. Chat NIA + Voz Flutuante
8. Extensão WhatsApp

---

## 8. REGRAS DE TRABALHO

1. NÃO editar repositório diretamente — usar Lovable
2. Nunca perguntar o que já foi respondido aqui
3. Atualizar este arquivo a cada nova decisão
4. SaaS multi-tenant — cada agência = dados isolados
5. Feature só entra se: aumenta lucro, reduz risco ou economiza tempo
