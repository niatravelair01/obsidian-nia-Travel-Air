---
id: "NIA-IA-002"
titulo: "Arquitetura do Modo de Voz N.IA"
tipo: "prompt"
dominio: "ia"
status: "oficial"
versao: "2.0"
tags:
  - "nia/ia"
  - "nia/voice"
  - "nia/realtime"
proprietario: "Gabriel"
ultima_atualizacao: 2026-08-18
---

# 🎙️ Arquitetura do Modo de Voz N.IA (O "Jarvis" do Turismo)

---

## 🛠️ Especificações Técnicas Requeridas

### 1. Sistema de Ativação "Mão Livre" (Wake Word / Claps)
- Web Audio API com AudioWorklet para detecção de transientes ou integração com Picovoice (Porcupine) para Wake Word ("Ativar Nia").

### 2. Fluidez Extrema (Sub-500ms Latency)
- OpenAI Realtime API via WebSockets. Conexão persistente direta entre Frontend -> Supabase Edge Function -> OpenAI.
- Streaming contínuo de áudio em chunks para resposta imediata sem espera de transcrição completa em REST.

### 3. PWA (Progressive Web App)
- Configuração de `manifest.json` e Service Workers para manter a escuta ativa mesmo com o app em segundo plano no desktop.
