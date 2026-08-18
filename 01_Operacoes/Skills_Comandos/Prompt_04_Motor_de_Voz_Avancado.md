# 🎙️ PROMPT 4: Arquitetura do Modo de Voz N.IA (O "Jarvis" do Turismo)

> **Contexto:** Este prompt deve ser entregue ao engenheiro de software ou ao Lovable quando formos implementar a integração de voz avançada. O foco é fluidez, capacidade de rodar em segundo plano e a "Ativação por Palmas".

---

## 🛠️ Especificações Técnicas Requeridas (Copiar e colar no Lovable/Cursor)

Preciso que você crie o "Motor de Voz de Baixa Latência" para a N.IA, transformando-a em uma assistente onipresente. Para isso, devemos seguir a arquitetura técnica descrita abaixo para não sobrecarregar o Client-Side (o que corrompeu o sistema antigo):

### 1. Sistema de Ativação "Mão Livre" (Wake Word / Claps)
O usuário deve poder acionar a N.IA sem usar o mouse, idealmente "batendo duas palmas" ou chamando-a pelo nome, mesmo se estiver em outra tela.
- **Implementação:** Utilize a `Web Audio API` com um *AudioWorklet* para rodar um algoritmo de detecção de transientes (Transient Detection). Ele deve ficar rodando em background (com permissão contínua de microfone concedida no primeiro acesso) escutando picos agudos de DB (decibéis) que caracterizam duas palmas em um intervalo de menos de 1 segundo.
- **Alternativa Robusta:** Caso o algoritmo de palmas nativo fique instável, implemente a biblioteca leve do **Picovoice (Porcupine)** para criar uma *Wake Word* personalizada (Ex: "Ativar Nia").

### 2. Fluidez Extrema (Sub-500ms Latency)
- A N.IA tem que conversar como uma humana. O delay de mandar áudio, esperar transcrever, pensar e gerar áudio é inaceitável.
- **Arquitetura Obrigatória:** Não use o pipeline comum de API REST de três etapas. Solicito a implementação da **OpenAI Realtime API** via **WebSockets**. Abra uma conexão WebSocket persistente entre o frontend (React) e nosso backend (Supabase Edge Function), e da Edge Function para a OpenAI. O áudio deve fluir em *chunks* (pedacinhos contínuos), permitindo que a IA comece a falar antes mesmo de gerar todo o texto.

### 3. Modificador de PWA (Onipresença)
- Para que o som de ativação funcione enquanto o usuário está com outra aba aberta (ex: site da Latam), o `manifest.json` do aplicativo deve estar configurado para ser instalado como um **PWA (Progressive Web App)** no desktop (Windows/Mac). Isso garante que o app não seja "congelado" pelo Google Chrome quando perder o foco, mantendo a permissão de microfone ativa no background.
