---
id: "NIA-ENG-001"
titulo: "Stack Técnica, Diretrizes Lovable & Arquitetura"
tipo: "arquitetura"
dominio: "engenharia"
status: "oficial"
versao: "2.0"
tags:
  - "nia/engenharia"
  - "nia/lovable"
  - "nia/supabase"
proprietario: "Gabriel"
ultima_atualizacao: 2026-08-18
---

# 🛠️ Stack Técnica & Diretrizes de Desenvolvimento (NIA Guardian Pro)

---

## 💻 1. Stack Tecnológica Oficial
- **Frontend:** React 18+ com TypeScript, Vite, Tailwind CSS, Lucide Icons, Shadcn UI.
- **Plataforma de Desenvolvimento Rápido:** Lovable.dev (segunda via operacional de interface).
- **Backend as a Service:** Supabase:
  - **Database:** PostgreSQL com RLS (Row Level Security) para isolamento estrito multi-tenant.
  - **Edge Functions:** Deno / TypeScript para regras de negócio sensíveis, cálculos de markup e chamadas à OpenAI.
  - **Storage:** Buckets seguros para armazenamento de PDFs de orçamentos e fotos de hotéis/passeios.
- **Inteligência Artificial:**
  - OpenAI GPT-4o / GPT-4o-mini para orquestração de texto, transcrição e extração de PDFs.
  - OpenAI Realtime API via WebSockets para comandos de voz sub-500ms.
- **Versionamento:** GitHub (`niatravelair01/nia-guardian-pro`).

---

## 🛡️ 2. Regras de Engenharia & Resiliência
1. **Persistência de Estado Local:**
   - Em formulários longos (ex: criação de orçamentos), o estado deve ser persistido em `localStorage` ou rascunho no Supabase para que um recarregamento acidental (F5) JAMAIS faça o agente perder dados digitados ou áudios processados.
2. **Robustez na Geração de PDF:**
   - A renderização de propostas deve possuir layout responsivo para páginas A4 sem cortes de imagens ou sobreposição de valores/textos.
   - Se o usuário não incluir fotos de passeios/hotéis, o sistema deve renderizar o layout limpo sem fotos, sem quebras e sem placeholders quebrados.
3. **Camada Dupla de Transcrição de Voz:**
   - Transcrição em tempo real durante a fala do usuário.
   - Refinamento semântico automático ao clicar em parar gravação para correção de termos de turismo (nomes de cias aéreas, códigos de aeroportos, hotéis).
