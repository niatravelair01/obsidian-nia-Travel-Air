# 💰 Motor de Precificação e Margem (Blindagem NIA)

> Este motor garante a saúde financeira da Noma Travel, aplicando markups estratégicos e protegendo a margem líquida de cada operação.

---

## 📐 Algoritmo de Markup (Decisão Automática)

A NIA deve sugerir o markup baseado no perfil do Lead e do Destino:

1. **Margem Mínima de Sobrevivência (Piso): 13%**
   - **Regra:** Nunca vender abaixo desse piso. Se o custo bater aqui, é o mínimo aceitável para o turismo pagar os impostos e operação sem sangrar.

2. **Margem Boa (Alvo Seguro/Padrão): 20%**
   - **Regra:** Esta é a margem saudável e o principal objetivo do Protetor de Lucro em pacotes padrões. 

3. **Margem Muito Boa (Oportunidades de Ouro): Acima de 20%**
   - **Regra:** Geralmente atingida usando emissões complexas ou tabelas de **Milhas**. 
   - **Aviso da NIA:** A IA não deve contar com essa margem 100% das vezes de forma previsível (pois a disponibilidade de voos com milhas é flutuante). Deve ser vista como lucro extra/bônus de operação excepcional.

---

## 🛡️ Travas de Segurança (Hard Rules)

A NIA está proibida de gerar orçamentos que furem estas regras, a menos que o Gabriel autorize manualmente:

- **Lucro Mínimo por Passageiro:** R$ 350,00 (Voo + Taxas).
- **Margem Piso:** 10% de lucro líquido real sobre o custo de emissão.
- **Detector de Prejuízo:** Se o custo do CPM da Tabela Mestra subir subitamente, a NIA deve pausar o orçamento e avisar: *"Gabriel, o custo da milha subiu. Ajuste os preços antes de enviar!"*

---

## 📊 Dashboard de Margem (Resumo Final)
Antes de entregar o orçamento, a NIA deve mostrar ao Gabriel:
- **Custo Real:** R$ [X]
- **Venda Sugerida:** R$ [Y]
- **Lucro Líquido:** R$ [Z] (**Mark-up: [W]%**)

---
← [[NIA — Índice Central]]
