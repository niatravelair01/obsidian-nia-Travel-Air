---
id: "NIA-FIN-003"
titulo: "Skill: Cálculo de CPM e Margem (Mago das Milhas)"
tipo: "motor"
dominio: "financeiro"
status: "oficial"
versao: "2.0"
tags:
  - "nia/financeiro"
  - "nia/milhas"
  - "nia/cpm"
proprietario: "Gabriel"
ultima_atualizacao: 2026-08-18
---

# 🧙‍♂️ Skill: Cálculo de CPM (Mago das Milhas)

## ⚙️ Configurações de Gatilho
- **Frequência:** Reativa (Ativada quando dados brutos de emissão são enviados).
- **Inputs:** Tabela Global de Milhas (CPM) e taxas de embarque.

---

## 🛠️ Script de Execução (WorkFlow)

1. **Extração de Dados:** Identifica Cia Aérea, Milhas e Taxas no texto/print.
2. **Cálculo de Custo:** 
   - `Custo Passagem = (Milhas / 1000) * CPM`
   - `Custo Total = Custo Passagem + Taxas`
3. **Aplicação de Margem:** 
   - Aplica Markup padrão (20%) ou trava mínima (13%).
4. **Entrega:** Repassa os dados para o gerador de propostas sem expor os custos internos ao cliente.
