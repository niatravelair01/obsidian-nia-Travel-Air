# 🚀 Prompts de Construção Lovable: MVP da NIA (Fase 1)

> **Regra Geral de Uso:** Como estamos sem créditos no momento, este documento concentra os **Prompts Mestre** que deverão ser copiados e colados no Lovable (ou em outra LLM de código) no futuro, um por um, para gerar o MVP exatamente com as funcionalidades definidas.

---

## 🛠️ Prompt 1: O Chat Universal (N.IA) Flutuante
**COPIAR ESTE TEXTO E ENVIAR AO LOVABLE:**
```text
Crie ou atualize o componente de "Chat Universal" do nosso dashboard. Este chat será a interface principal onde o agente interage com a IA (N.IA).

### Requisitos Funcionais:
1. **Janela Desacoplável (Flutuante/Picture-in-Picture):** Adicione um botão ou comportamento que permita que a janela do chat seja "destacada" ou minimizeda no canto da tela, de modo que o agente possa continuar conversando com a N.IA mesmo navegando por outros sistemas e abas do computador, sem perder a janela de foco principal.
2. **Design Universal:** Ele deve ser ágil e estar sempre acessível a um clique, independente da tela do Dashboard em que o usuário esteja.
3. **Barra de Prompt Inspirada no Mac Spotlight (Cmd+K):** Quero um atalho teclado global dentro do SaaS para invocar o chat instantaneamente.
```

---

## 📊 Prompt 2: Dashboard de Saúde e Inteligência de Follow-Up
**COPIAR ESTE TEXTO E ENVIAR AO LOVABLE:**
```text
Crie a tela inicial do "Dashboard de Saúde da Agência". Esta não é apenas uma tela de métricas paradas, é um central de "Inteligência Acionável".

### Requisitos Funcionais:
1. **Painel de Acompanhamento (Follow-up Inteligente):** Crie uma listagem ou card dedicado a "Ações Recomendadas". A NIA precisa sinalizar ao agente exatamente QUAIS clientes ele precisa abordar hoje para fechar vendas.
2. **Avisos de Rentabilidade:** A IA deve analisar a base de dados de clientes e enviar um alerta dizendo: "Feche o roteiro X hoje para faturar R$ Y. Ele esfria em 24h."
3. **Métricas Visíveis:** "Margem de Segurança Atual", "Leads Quentes na Mesa" e "Dinheiro Parado".
```

---

## 💰 Prompt 3: Motor de Precificação (As Novas Regras de Margem)
**COPIAR ESTE TEXTO E ENVIAR AO LOVABLE/SUPABASE:**
```text
Implemente a lógica de cálculo do "Protetor de Lucro" nas funções de precificação do Supabase e Frontend. Aplique as seguintes 'Hard Rules' (regras absolutas) de margem de lucro para a agência:

1. **Margem Piso de Segurança: 13%** 
   - NUNCA o sistema deve sugerir um preço de venda que resulte em uma margem abaixo de 13%. Este é o limiar de sobrevivência para cobrir impostos e operação.
2. **Margem Boa (Alvo): 20%**
   - Esta deve ser a meta sugerida pelo sistema como padrão recomendável para pacotes de turismo convencional.
3. **Margem Excelente (Bônus Milhas): Acima de 20%**
   - O sistema deve entender que marcações acima de 20% ocorrerão apenas quando houver a oportunidade estratégica de emitir o trecho via Milhas. A UI deve sinalizar isso como "[BÔNUS] Emissão com Milhas Recomendada", mas o sistema central não deve esperar que isso ocorra 100% do tempo.
```
