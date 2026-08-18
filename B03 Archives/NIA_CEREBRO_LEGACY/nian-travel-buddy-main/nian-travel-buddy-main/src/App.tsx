import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { NiaChatProvider } from "@/contexts/NiaChatContext";
import { NiaAudioProvider } from "@/contexts/NiaAudioContext";
import { OnboardingProvider } from "@/contexts/OnboardingContext";
import { AuthProvider } from "@/contexts/AuthContext";
import Index from "./pages/Index";

import Conversa from "./pages/Conversa";
import Orcamentos from "./pages/Orcamentos";
import Blindagem from "./pages/Blindagem";
import Followups from "./pages/Followups";
import Clientes from "./pages/Clientes";
import ClienteDetalhe from "./pages/ClienteDetalhe";
import Gargalos from "./pages/Gargalos";
import Treinamento from "./pages/Treinamento";
import Relatorios from "./pages/Relatorios";
import Decisao from "./pages/Decisao";
import Configuracoes from "./pages/Configuracoes";
import Tarefas from "./pages/Tarefas";
import Onboarding from "./pages/Onboarding";
import Viagens from "./pages/Viagens";
import Prioridades from "./pages/Prioridades";
import CriarOrcamento from "./pages/CriarOrcamento";
import NotFound from "./pages/NotFound";
import RelatoriosDetalhado from "./pages/RelatoriosDetalhado";
import OperacaoManual from "./pages/OperacaoManual";
import Financeiro from "./pages/Financeiro";

const queryClient = new QueryClient();

const App = () => (
  <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} storageKey="nia-theme">
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <OnboardingProvider>
              <NiaChatProvider>
                <NiaAudioProvider>
                  <Routes>
                    {/* /login and /signup redirect to dashboard */}
                    <Route path="/login" element={<Navigate to="/" replace />} />
                    <Route path="/signup" element={<Navigate to="/" replace />} />
                    <Route path="/" element={<Index />} />
                    <Route path="/conversa" element={<Conversa />} />
                    <Route path="/orcamentos" element={<Orcamentos />} />
                    <Route path="/orcamentos/criar" element={<CriarOrcamento />} />
                    <Route path="/blindagem" element={<Blindagem />} />
                    <Route path="/followups" element={<Followups />} />
                    <Route path="/clientes" element={<Clientes />} />
                    <Route path="/clientes/:id" element={<ClienteDetalhe />} />
                    <Route path="/gargalos" element={<Gargalos />} />
                    <Route path="/treinamento" element={<Treinamento />} />
                    <Route path="/relatorios" element={<Relatorios />} />
                    <Route path="/relatorios/detalhado" element={<RelatoriosDetalhado />} />
                    <Route path="/decisao" element={<Decisao />} />
                    <Route path="/configuracoes" element={<Configuracoes />} />
                    <Route path="/tarefas" element={<Tarefas />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/viagens" element={<Viagens />} />
                    <Route path="/prioridades" element={<Prioridades />} />
                    <Route path="/operacao-manual" element={<OperacaoManual />} />
                    <Route path="/financeiro" element={<Financeiro />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </NiaAudioProvider>
              </NiaChatProvider>
            </OnboardingProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </ThemeProvider>
);
export default App;
