---
id: "NIA-FIN-002"
titulo: "Motor de Prioridade e Risco (Inteligência NIA)"
tipo: "motor"
dominio: "financeiro"
status: "oficial"
versao: "2.0"
tags:
  - "nia/financeiro"
  - "nia/risco"
  - "nia/leads"
proprietario: "Gabriel"
ultima_atualizacao: 2026-08-18
---

# 🧠 Motor de Prioridade e Risco (Inteligência NIA)

> Este motor é o cérebro analítico da NIA. Ele varre o CRM e gera insights e alertas de ação em tempo real.

---

## 🚦 Critérios de Classificação de Leads

1. **Prioridade Máxima (Alerta Vermelho):**
   - **Lead Score > 8** + **Momento de Compra = Imediato**.
   - **Regra de Alerta:** Se o próximo passo não for executado em até **4 horas**, a NIA emite um alerta de *"Risco de Perda de Venda"*.

2. **Prioridade Média (Oportunidade):**
   - **Lead Score entre 5 e 8** + **Momento de Compra = Definido**.
   - **Regra de Alerta:** Monitorar follow-up a cada **48h**.

3. **Baixa Prioridade (Informativo):**
   - **Lead Score < 5** ou **Momento de Compra = Planejamento**.
   - **Regra:** Direcionar para automação de grupo de ofertas e aquecimento.

---

## ⚠️ Detecção de Gargalos Operacionais

A NIA reporta periodicamente os seguintes riscos:
- **Volume de Orçamentos Parados:** Valor total somado dos orçamentos em negociação ativa.
- **Leads Abandonados:** Listagem de contatos quentes sem interação há mais de 3 dias.
- **Risco de Margem:** Alertas de oscilação súbita no custo de milhas ou câmbio.

---

## 💡 Camada "Boa tarde, Sócio" (Insights)
*"Hoje temos R$ [X] em negociações ativas. Para batermos a meta do mês, priorize o contato com [Lead A] e [Lead B]. O especialista de [Trecho] já deixou os rascunhos prontos."*
