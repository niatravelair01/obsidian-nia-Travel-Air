import { useState } from "react";
import { Mic, MicOff, Settings, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useNiaAudio } from "@/contexts/NiaAudioContext";

// ═══════════════════════════════════════════════════════════════════════════════
// NIA FIRST AUDIO MODAL — PRIMEIRA UTILIZAÇÃO
// 
// Na primeira ativação de áudio, a NIA deve:
//   - Mostrar um aviso curto explicando:
//     - Como ativar e desativar
//     - Que o áudio pausa sozinho
//   - Oferecer a opção de personalizar as palavras-chave
//
// Esse aviso:
//   - Aparece apenas uma vez
//   - Não interrompe o fluxo
//   - Não vira tutorial longo
// ═══════════════════════════════════════════════════════════════════════════════

interface NiaFirstAudioModalProps {
  open: boolean;
  onClose: () => void;
}

export function NiaFirstAudioModal({ open, onClose }: NiaFirstAudioModalProps) {
  const { keywords, setKeywords, markFirstUseModalSeen } = useNiaAudio();
  const [showCustomize, setShowCustomize] = useState(false);
  const [activateKeyword, setActivateKeyword] = useState(keywords.activate);
  const [deactivateKeyword, setDeactivateKeyword] = useState(keywords.deactivate);
  
  const handleContinue = () => {
    markFirstUseModalSeen();
    onClose();
  };
  
  const handleSaveKeywords = () => {
    setKeywords({
      activate: activateKeyword.trim() || keywords.activate,
      deactivate: deactivateKeyword.trim() || keywords.deactivate,
    });
    handleContinue();
  };
  
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mic className="h-5 w-5 text-accent" />
            Conversa por Voz
          </DialogTitle>
          <DialogDescription>
            Você ativou o modo de voz pela primeira vez.
          </DialogDescription>
        </DialogHeader>
        
        {!showCustomize ? (
          <div className="space-y-4 py-4">
            {/* Quick explanation */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="p-2 rounded-full bg-green-500/20">
                  <Mic className="h-4 w-4 text-green-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Para ativar</p>
                  <p className="text-xs text-muted-foreground">
                    Clique no botão do microfone ou diga "{keywords.activate}"
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50">
                <div className="p-2 rounded-full bg-red-500/20">
                  <MicOff className="h-4 w-4 text-red-400" />
                </div>
                <div>
                  <p className="text-sm font-medium">Para desativar</p>
                  <p className="text-xs text-muted-foreground">
                    Clique novamente ou diga "{keywords.deactivate}"
                  </p>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground">
                  💡 A escuta pausa automaticamente após 10 segundos de silêncio.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Customize keywords */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="activate-keyword">Palavra para ativar</Label>
                <Input
                  id="activate-keyword"
                  value={activateKeyword}
                  onChange={(e) => setActivateKeyword(e.target.value)}
                  placeholder="Ex: Sócia confere"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="deactivate-keyword">Palavra para desativar</Label>
                <Input
                  id="deactivate-keyword"
                  value={deactivateKeyword}
                  onChange={(e) => setDeactivateKeyword(e.target.value)}
                  placeholder="Ex: Chega, sócia"
                />
              </div>
            </div>
          </div>
        )}
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          {!showCustomize ? (
            <>
              <Button
                variant="ghost"
                onClick={() => setShowCustomize(true)}
                className="gap-2"
              >
                <Settings className="h-4 w-4" />
                Personalizar palavras
              </Button>
              <Button onClick={handleContinue}>
                Entendi
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                onClick={() => setShowCustomize(false)}
              >
                Voltar
              </Button>
              <Button onClick={handleSaveKeywords}>
                Salvar e continuar
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
