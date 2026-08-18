---
description: Monitora e divulga promoções relâmpago de milhas no Grupo VIP.
last_run: 2026-04-01
---

# 📢 Skill: Garimpeiro de Ofertas (Grupo VIP)

## ⚙️ Configurações de Gatilho
- **Frequência:** 3x ao dia (09h, 14h e 20h) + Gatilho Extra por Notificação de Browser.
- **Inputs:** [[Agente de Gestão do Grupo de Ofertas]], Notificações Melhores Destinos/Passagens Pelo Mundo.

---

## 🛠️ Script de Execução (WorkFlow)

1. **Filtro de Relevância:** A skill ignora promoções de hotéis genéricos ou viagens de ônibus. Foco total em:
    - Transferência bonificada (100% ou +).
    - Queda de preço em rotas Executivas.
    - Promoção de upgrade de cabine.
2. **Redação Urgente:** Formata a mensagem com Emojis e Scarcity (Escassez). 
    - *"URGENTE: Trecho Paris por 35k LATAM acaba de aparecer. Apenas via site oficial. Clique aqui para falar com a Céu."*
3. **Disparo Automático:** Via API do WhatsApp para o Grupo específico.

---
← [[Guia de Implementação Técnica]]
