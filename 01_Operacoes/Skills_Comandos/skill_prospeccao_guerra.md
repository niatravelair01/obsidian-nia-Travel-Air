---
description: Automação diária de busca de leads e redação de abordagens comerciais.
last_run: 2026-04-01
---

# 🎯 Skill: Prospecção Guerra (Captação Ativa)

## ⚙️ Configurações de Gatilho
- **Frequência:** Diária (Segunda a Sexta às 08:30).
- **Inputs:** [[Protocolo de Captação]], [[Parceiro Local]], [[Influenciadores]].
- **Canais:** Instagram (Busca) e Google Maps.

---

## 🛠️ Script de Execução (WorkFlow)

1. **Definição do Alvo do Dia:** O script alterna entre:
    - *Seg:* Parceiros Locais (Barbearias/Pilates).
    - *Ter:* Influenciadores (Prioridade B/C).
    - *Qua:* Empresas (Viagens Corporativas).
    - *Qui:* Comunidades/YouTube (Leads de Ticket Alto).
    - *Sex:* Reativação de Base Fria.

2. **Extração de Dados:** A skill identifica 40 contatos novos (ou conforme semana do [[Plano de Guerra]]) extraindo Nome, @Perfil e Bio.

3. **Geração de Script Personalizado:** 
    - Lê a Bio do parceiro para identificar um ponto de valor real.
    - Aplica o modelo da [[Agente de Prospecção — Ativa]].
    - Gera a **Fase 1 (Abertura)** para cada um dos 40 alvos.

4. **Entrega da Munição:** Envia para o Gabriel via Telegram/WhatsApp um link direto com a lista:
    - "Alvo 1: [Link Profile] | Script: Olá [Nome]!..."

---

## 🛰️ Integração de Créditos
- Consome créditos de Web-Scraping e tokens de IA para personalização de copy.

---
← [[Guia de Implementação Técnica]]
