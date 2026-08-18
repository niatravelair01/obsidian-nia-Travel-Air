---
id: "NIA-SYS-003"
titulo: "Guia de Sincronização Multi-Usuário (Gabriel + Sócio + Equipe)"
tipo: "spec"
dominio: "sistema"
status: "oficial"
versao: "2.0"
tags:
  - "nia/sistema"
  - "nia/sincronizacao"
  - "nia/multi-usuario"
proprietario: "Gabriel"
ultima_atualizacao: 2026-08-18
---

# 🌐 Guia de Sincronização e Operação Multi-Usuário (NIA Travelware)

Este guia orienta como manter o Obsidian e o Antigravity sincronizados entre os fundadores (**Gabriel & Sócio**) e como plugar futuros colaboradores com total segurança.

---

## 🔄 Opção 1: Sincronização via Repositório Git Privado (Recomendado)

### 1. No computador do Gabriel (Origem):
1. Criar repositório privado no GitHub (ex: `cerebro-nia` dentro da conta/organização `niatravelair01`).
2. Adicionar o remote e enviar os arquivos:
   ```bash
   git init
   git remote add origin https://github.com/niatravelair01/cerebro-nia.git
   git add .
   git commit -m "feat: setup taxonomia oficial v2.0"
   git branch -M main
   git push -u origin main
   ```
3. Convidar a conta GitHub do Sócio nas configurações do repositório (*Settings > Collaborators*).

### 2. No notebook do Sócio (Destino):
1. Clonar o repositório em uma pasta local:
   ```bash
   git clone https://github.com/niatravelair01/cerebro-nia.git "D:\Obsidian Vaults\Cerebro Nia"
   ```
2. Abrir o **Obsidian** > Clicar em *"Open folder as vault"* > Selecionar a pasta clonada.
3. Abrir o **Antigravity** > Adicionar o workspace apontando para a pasta do Obsidian e a pasta de código do sistema.
4. Enviar o **Prompt Mestre do Sócio** na primeira conversa do Antigravity.

---

## 👥 Protocolo de Edição Multi-Usuário Sem Conflito
- **Divisão por Arquivos ou Cabeçalhos:** Cada fundador edita suas seções ou assina no YAML com seu nome.
- **Puxar antes de Alterar:** Sempre dar `git pull` antes de começar a sessão de trabalho e `git push` ao terminar.
- **Futuros Colaboradores:** Funcionários terão acesso apenas de leitura ou permissão de escrita restrita à pasta `00_Entrada/`, garantindo que ninguém desmonte a arquitetura mestre da empresa.
