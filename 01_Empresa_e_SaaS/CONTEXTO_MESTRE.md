---
id: "NIA-EMP-002"
titulo: "Contexto Mestre — NIA Guardian Pro"
tipo: "arquitetura"
dominio: "empresa"
status: "oficial"
versao: "2.0"
tags:
  - "nia/empresa"
  - "nia/contexto"
  - "nia/arquitetura"
proprietario: "Gabriel"
ultima_atualizacao: 2026-08-18
---

# 🧠 NIA GUARDIAN PRO — CONTEXTO MESTRE (LEIA PRIMEIRO)

> **REGRA:** Este arquivo deve ser lido NO INÍCIO DE CADA SESSÃO antes de qualquer ação.
> **Última atualização:** 2026-08-18

---

## 1. O QUE É O PROJETO

**NIA Guardian Pro** é um **SaaS** (software vendido por assinatura) para agências de viagem.
- **Não é** uso interno apenas. **É** um produto para vender para outras agências.
- **Primeiro cliente/beta-tester:** Gabriel na sua própria agência **Noma Travel**
- Testa → Valida → Melhora → Vende para outras agências

**Repositório GitHub:** `https://github.com/niatravelair01/nia-guardian-pro.git`
**Obsidian (Cérebro):** `d:\Obsidian Vaults\Cerebro Nia`

**IMPORTANTE:** Todo desenvolvimento novo vai pelo **Lovable** ou Antigravity via sincronização controlada.

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
- Orçamentos → novo modelo multimodal (Voz + Upload de PDFs/Prints + Manual), paleta de cores e exportação profissional
- Financeiro → melhorar visualização e travas
- Configurações → garantir multi-tenant por agência

### NOVO
- Voz Flutuante Global (em todas as páginas, funciona em background)
- Voz → CRM automático (NIA registra infos por voz)
- Extensão WhatsApp 24/7 (captura leads automaticamente)

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
- Backend: Supabase (banco PostgreSQL + Edge Functions Deno)
- IA: OpenAI (GPT-4o / GPT-4o-mini + Realtime API)
- WhatsApp: API WhatsApp Business / Extensão Chrome

---

## 7. REGRAS DE TRABALHO

1. Manter integridade no Lovable e repositório GitHub
2. SaaS multi-tenant — cada agência = dados isolados
3. Feature só entra se: aumenta lucro, reduz risco ou economiza tempo
