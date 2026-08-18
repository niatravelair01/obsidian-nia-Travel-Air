---
description: Realiza a auditoria estratégica da agência a cada 15 dias.
last_run: 2026-04-01
---

# 🧠 Skill: Auditoria C-Level (Estrategista)

## ⚙️ Configurações de Gatilho
- **Frequência:** A cada 15 dias.
- **Inputs:** [[Base Mestre de Clientes]], [[Log de Memória Operacional]], [[Financeiro]].
- **Permissões:** Leitura e Escrita no Obsidian.

---

## 🛠️ Script de Execução (WorkFlow)

1. **Varredura de CRM:** O script lê a base de clientes e conta:
    - Novos Leads no período.
    - Taxa de conversão (Leads vs Vendas).
    - Ticket médio das vendas realizadas.

2. **Análise de Dores:** Lê o `Log de Memória Operacional` em busca de palavras-chave como "cancelamento", "erro", "atraso", "preço alto".

3. **Tomada de Decisão:** 
    - Se a taxa de conversão for < 10%, o script marca o próximo gargalo como "Copy de Vendas / Preço".
    - Se houver muitos leads parados, marca como "Follow-up lento".

4. **Atualização do Dashboard:** O script gera o novo conteúdo do arquivo [[Estado Atual da Empresa]].

---

## 🛰️ Integração de Créditos
- Esta skill consome tokens do modelo principal (ex: Gemini/GPT-4) apenas 2x por mês, sendo altamente econômica.

---
← [[Guia de Implementação Técnica]]
