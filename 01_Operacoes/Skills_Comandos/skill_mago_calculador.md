---
description: Realiza a conversão de milhas em valores monetários e calcula markup da Noma.
last_run: 2026-04-01
---

# 🧙‍♂️ Skill: Cálculo de CPM (Mago das Milhas)

## ⚙️ Configurações de Gatilho
- **Frequência:** Reativa (Ativada quando o Gabriel ou a Céu enviam dados brutos).
- **Inputs:** [[Tabela Global de Milhas (CPM)]].

---

## 🛠️ Script de Execução (WorkFlow)

1. **Extração de Dados:** Identifica Cia Aérea, Milhas e Taxas no texto fornecido.
2. **Cálculo de Custo:** 
    - Aplica a régua de CPF (Ex: Smiles 80k = R$ 15,99).
    - Custo Passagem = (Milhas / 1000) * CPM.
    - Custo Total = Custo Passagem + Taxas.
3. **Aplicação de Margem:** 
    - Adiciona Markup padrão (20%) ou manual.
4. **Redação Estratégica (The Final Copy):** 
    - Cruza os cálculos com a [[skill_gerador_orcamento_premium]].
    - Gera o bloco de "Logística de Voo" focando em conforto e tempo.
    - Gera o bloco de "Por que este Hotel" justificando a escolha técnica.
    - Entrega o preço final sem menção a custos internos ou milhas.

---

## 🛰️ Integração de Créditos
- Altamente econômica. Utiliza lógica puramente matemática.

---
← [[Guia de Implementação Técnica]]
