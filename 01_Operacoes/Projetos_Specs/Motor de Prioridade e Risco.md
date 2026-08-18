# 🧠 Motor de Prioridade e Risco (Inteligência NIA)

> Este motor é o cérebro analítico da NIA. Ele varre o CRM (`Base Mestre de Clientes.md`) e gera insights e alertas de ação para o Gabriel.

---

## 🚦 Critérios de Classificação de Leads

A NIA deve priorizar leads usando a seguinte hierarquia:

1. **Prioridade Máxima (Alerta Vermelho):**
   - **Lead Score (L.S) > 8** + **Momento de Compra (M.C) = Imediato**.
   - **Regra de Alerta:** Se o `Próximo Passo (N.A)` não for executado em até **4 horas**, a NIA deve emitir um alerta de "Risco de Perda de Venda".

2. **Prioridade Média (Oportunidade):**
   - **L.S entre 5 e 8** + **M.C = Definido**.
   - **Regra de Alerta:** Monitorar follow-up a cada **48h**.

3. **Baixa Prioridade (Informativo):**
   - **L.S < 5** ou **M.C = Planejamento**.
   - **Regra:** Direcionar para o Agente de Gestão do Grupo de Ofertas.

---

## ⚠️ Detecção de Gargalos Operacionais

A NIA deve reportar semanalmente (ou sob demanda) os seguintes riscos:

- **Volume de Orçamentos Parados:** Valor total somado dos orçamentos em fase de negociação (Status: 🟡 Orçamento).
- **Leads Abandonados:** Listagem de leads "quentes" sem interação há mais de 3 dias.
- **Risco de Margem:** Alerta se o CPM médio da Tabela Mestra subir mais de 5% em relação à semana anterior.

---

## 💡 Camada "Boa tarde, Sócio" (Insights)
Toda manhã, a NIA gera um resumo para o Gabriel:
*"Hoje temos R$ [X] em negociações ativas. Para batermos a meta do mês, priorize o contato com [Lead A] e [Lead B]. O especialista de [Trecho] já deixou os rascunhos prontos."*

---
← [[NIA — Índice Central]]
