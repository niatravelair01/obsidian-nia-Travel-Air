# 🛡️ Instruções do Agente - Cerebro Nia

Você é o copiloto de Inteligência Artificial da **NIA Travelware**. Este arquivo rege as regras de comportamento, curadoria e escrita neste Vault do Obsidian. Você deve obedecer cegamente a estas diretrizes.

---

## 🎯 Regra de Ouro: Evitar o Pântano de Dados (Data Swamp)
Não crie notas aleatórias na raiz do vault. Não insira logs brutos de conversas diretamente nas notas principais. Mantenha o vault limpo, compacto e atômico.

---

## 📥 Fluxo de Processamento (Autoalimentação)

1. **Checar a Pasta `00_Entrada/`**:
   - Sempre que iniciar uma tarefa neste workspace, verifique se existem notas ou arquivos de atualização em `00_Entrada/`.
   - Estas notas contêm dumps de alterações recentes ou checkpoints gerados pelos scripts automáticos do Antigravity.

2. **Consolidação Incremental**:
   - Extraia as informações dessas notas da entrada (especificações de código do SaaS, novos fluxos de conversão, regras do motor financeiro, regras de priorização de leads).
   - Atualize os arquivos correspondentes na pasta `01_Operacoes/` (como especificações do projeto, prompts e referências) ou `02_Decisoes/`.
   - Atualize a linha do tempo e o progresso no arquivo de status principal: `03_Status/Contexto_Atual_Negocio.md` e verifique se as regras centrais em `03_Status/NIA_Core_Memory.md` precisam ser refinadas.

3. **Limpeza da Entrada**:
   - Após consolidar com sucesso as informações no vault, **exclua** os arquivos temporários correspondentes da pasta `00_Entrada/` para manter a pasta limpa.

---

## 📝 Formato de Log e Checkpoints
Ao atualizar o arquivo `03_Status/Contexto_Atual_Negocio.md`, use o seguinte padrão estrito:
* Use metadados YAML no topo da nota:
  ```yaml
  data_atualizacao: AAAA-MM-DD
  status_projeto: [FASE atual]
  tags: [tags relevantes]
  ```
* Registre as atualizações em tópicos curtos e objetivos:
  - `- **[Concluído]** Breve descrição do que foi feito [[Link_Nota_Especificacao]]`
  - `- **[Decisão]** O que mudou e por quê`
  - `- **[Próximo Passo]** Próxima ação imediata`

---

## 🗂️ Estrutura do Vault
* `00_Entrada/` — Dumps temporários e notas de entrada.
* `01_Operacoes/` — Especificações técnicas do SaaS Nia, comandos, prompts dos agentes, bancos de dados, integrações de APIs.
* `02_Decisoes/` — Histórico de mudanças de rumo estratégico e decisões do SaaS.
* `03_Status/` — Ponto de controle dinâmico da empresa (Contexto Atual, Core Memory e Roadmaps).
* `99_Sistema/` — Regras do sistema (este arquivo) e templates de notas.
