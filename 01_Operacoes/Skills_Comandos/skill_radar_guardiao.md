---
description: Monitoramento diário de voos e gestão proativa de crises de malha aérea.
last_run: 2026-04-01
---

# 🛡️ Skill: Radar Guardião (Monitoramento 24h)

## ⚙️ Configurações de Gatilho
- **Frequência:** Diária (Recomendado às 06:00 e às 18:00).
- **Inputs:** Localizadores na [[Base Mestre de Clientes]] (Status: "Emitido").
- **API Necessária:** FlightAware / AviationStack / AeroDataBox.

---

## 🛠️ Script de Execução (WorkFlow)

1. **Varredura de Passageiros:** O script identifica todos os passageiros que viajam nas próximas 48 horas.
2. **Ping na Malha Aérea:** Para cada voo, a skill consulta o status real via API.
3. **Detecção de Divergência:** 
    - Compara o horário original vs o horário atual da Cia.
    - Checa se o voo foi cancelado ou sofreu alteração de portão.
4. **Disparo de Alerta (Crise):**
    - Se alteração > 30 min → Envia notificação ao Gabriel.
    - Se cancelamento → Inicia o [[Agente Guardião da Viagem]] (Módulo de Crise) e gera o rascunho de reacomodação.
5. **Aviso de Check-in:** 48h antes da ida, envia lembrete automático ao cliente com link oficial.

---

## 🛰️ Integração de Créditos
- Consome créditos de API de aviação e tokens de IA para gerar mensagens de suporte personalizadas.

---
← [[Guia de Implementação Técnica]]
