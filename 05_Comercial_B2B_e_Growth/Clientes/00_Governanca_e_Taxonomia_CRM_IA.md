---
id: "NIA-COM-CRM-GOV-001"
titulo: "Governança, Hierarquia e Fonte Única da Verdade (SSOT) do CRM para a IA"
tipo: "arquitetura"
dominio: "comercial"
status: "oficial"
versao: "2.0"
tags:
  - "nia/comercial"
  - "nia/crm/governanca"
  - "nia/ia/memoria"
proprietario: "Leo"
ultima_atualizacao: 2026-10-28
---

# 🧠 Governança & Taxonomia do CRM para a IA do Sistema (Niam)

Este documento define o **Protocolo Anti-Ambiguidade e Fonte Única da Verdade (Single Source of Truth - SSOT)** para que a Inteligência Artificial central do sistema compreenda toda a carteira de clientes da agência sem jamais confundir dados antigos com dados novos.

---

## 🛡️ 1. As 4 Regras de Ouro Anti-Confusão para a IA

1. **Regra "1 Cliente = 1 Ficha Canônica Única" (Proibido Duplicar Notas):**
   - Cada cliente possui **exatamente um único arquivo** dentro de `05_Comercial_B2B_e_Growth/Clientes/`, batizado com o ID sequencial imutável: `NIA-CRM-[NNN]_[Nome_Sobrenome].md`.
   - Quando o mesmo cliente fechar uma **segunda ou terceira viagem**, **NUNCA** se cria outro arquivo para ele. A nova venda é adicionada na seção `## 📜 Histórico Cronológico de Vendas` da mesma ficha e o `ltv_total` no cabeçalho YAML é somado.
2. **Hierarquia de Verdade por Metadados (`status` + `ultima_atualizacao`):**
   - A IA deve considerar como **verdade absoluta atual** apenas notas que possuam `status: "oficial"` no cabeçalho YAML.
   - Qualquer nota ou rascunho em `00_Entrada/` ou `B03 Archives/` com `status: "arquivado"` ou `"rascunho"` é tratada apenas como registro histórico passivo, nunca sobrepondo uma nota `oficial`.
   - Em caso de duas referências ao mesmo dado em documentos diferentes, prevalece **sempre** o documento com a data `ultima_atualizacao` (formato ISO `YYYY-MM-DD`) mais recente.
3. **Separação Estrita entre Estado Atual e Histórico:**
   - **Bloco YAML + Seção 1 (Resumo Executivo & LTV):** Representam **100% o momento presente** (quanto o cliente já gastou no acumulado total, qual o status atual dele hoje).
   - **Seção 3 (Histórico Cronológico de Vendas):** Lista cada viagem individualmente da mais recente no topo para a mais antiga embaixo (`#Venda-002`, `#Venda-001`).
4. **Espelhamento com o Banco de Dados (`Supabase -> noma_clients`):**
   - Cada ficha carrega o campo `supabase_client_id` exato da tabela `noma_clients`, permitindo cruzamento determinístico sem depender apenas de nomes parecidos.

---

## 🗂️ 2. Mapa de Acesso e Hierarquia do Cofre para a IA

| Pasta do Cofre | Nível de Confiança para a IA | O que a IA deve extrair daqui |
| :--- | :--- | :--- |
| **`01_Empresa_e_SaaS/`** | 🟢 **Verdade Institucional Suprema** | Visão, regras societárias e diretrizes gerais da empresa. |
| **`03_Motores_Financeiro_e_Risco/`** | 🟢 **Travas Financeiras Inegociáveis** | Margem mínima (13%), margem alvo (20%), lucro mínimo por passageiro (R$ 350). |
| **`05_Comercial_B2B_e_Growth/Clientes/`** | 🟢 **Fonte Única da Carteira (CRM)** | LTV real, poder aquisitivo, origem, preferências e histórico de viagens de cada cliente. |
| **`00_Entrada/` e `B03 Archives/`** | 🔴 **Apenas Consulta Bruta / Legado** | Rascunhos e arquivos antigos. **Proibido** usar para sobrescrever regras das pastas oficiais. |
