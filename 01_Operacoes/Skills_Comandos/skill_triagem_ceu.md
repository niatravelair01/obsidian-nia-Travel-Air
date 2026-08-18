---
description: Gerenciamento em tempo real de novos leads via WhatsApp e Instagram.
last_run: 2026-04-01
---

# 📱 Skill: Triagem "Céu" (Atendimento Real-Time)

## ⚙️ Configurações de Gatilho
- **Frequência:** Reativa (Gatilho por Webhook de nova mensagem).
- **Inputs:** [[Agente de Atendimento WhatsApp]], [[Qualificação de Clientes]].
- **Ferramenta:** ManyChat / Typebot / Global-API.

---

## 🛠️ Script de Execução (WorkFlow)

1. **Recepção Amigável:** A cada novo contato, a skill dispara a Fase 1 do script da Céu.
2. **Coleta Progressiva:** A cada resposta do cliente, a skill:
    - Analisa se a resposta contém dado de Destino e Data.
    - Se sim, avança para as perguntas de Qualificação Básica (Adultos/Crianças).
    - **TRANSFERÊNCIA:** Assim que os dados básicos forem coletados, a Céu notifica o Gabriel para a qualificação de **Momento de Compra** e Autoridade.
    - Se não, insiste educadamente no dado faltante.

3. **Lead Scoring (A Grande Decisão):**
    - **Ponta A (Premium):** Viagem internacional + Foco conforto + Data definida.
    - **AÇÃO:** Oferecer a agenda do Gabriel para Call de 15 min.
    - **Ponta B (Curioso/Frio):** Sem data + Apenas preço.
    - **AÇÃO:** Coletar dados e convidar para o [[Agente de Gestão do Grupo de Ofertas]].

4. **Registro de Log:** Todas as respostas importantes são salvas automaticamente na [[Base Mestre de Clientes]].

5. **Encerramento com Autoridade (Gatilho de Fechamento):**
    - Ao finalizar a coleta, a instrução obrigatória é:
    - *"Maravilha, [Nome]! Finalizamos essa primeira etapa. Agora, para garantir o melhor custo-benefício e as melhores conexões, eu vou repassar todas essas informações para o nosso **Especialista em Trechos de [Destino]**.*
    - *Ele vai realizar a sua cotação fina agora e em seguida já te enviamos o orçamento completo no WhatsApp. Combinado?"*

---

## 🛰️ Integração de Créditos
- Consome tokens por mensagem processada. Otimizada para ser sucinta e economizar API.

---
← [[Guia de Implementação Técnica]]
