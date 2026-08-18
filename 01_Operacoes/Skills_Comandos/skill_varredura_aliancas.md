---
description: Executa a busca técnica em alianças aéreas e valida acordos bilaterais.
last_run: 2026-04-01
---

# 🔎 Skill: Varredura de Alianças (Cotador Snipper)

## ⚙️ Configurações de Gatilho
- **Frequência:** Reativa (Ativada por comando ou por lead qualificado).
- **Inputs:** Destino, Datas e Alianças Alvo ([[Agente Cotador de Milhas]]).
- **Ferramenta:** Web Scraping / APIs de Consolidadoras.

---

## 🛠️ Script de Execução (WorkFlow)

1. **Protocolo de Busca Primária:**
    - Varre aggregadores (Experts Aéreos/Zede) em busca de "sweet spots" na OneWorld e Star Alliance.
2. **Double Check (Protocolo Céu e Terra):**
    - A skill abre os portais da Smiles, Azul e Latam.
    - Faz o log-in técnico e simula a emissão até o carrinho para confirmar se a vaga não é "fantasma".
3. **Filtro de Conforto:** Identifica se há executiva com preço de econômica (ex: Iberia Avios).
4. **Relatório de Opções:** Gera uma lista simplificada:
    - [Opção 1] Destino | Cia | Milhas Necessárias | Taxas.

---

## 🛰️ Integração de Créditos
- Consome créditos de navegação web e automação de browser (Puppeteer/Selenium).

---
← [[Guia de Implementação Técnica]]
