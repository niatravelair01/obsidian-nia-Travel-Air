import { useState, useRef, useEffect } from "react";
import { Upload, X, Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

// ═══════════════════════════════════════════════════════════════════════════════
// AGENCY LOGO UPLOAD — UPLOAD DA LOGO DA AGÊNCIA
// 
// Solicita upload da logo no primeiro uso e salva como padrão.
// ═══════════════════════════════════════════════════════════════════════════════

interface AgencyLogoUploadProps {
  logo: string | null;
  onLogoChange: (logo: string | null) => void;
  compact?: boolean;
}

const LOGO_STORAGE_KEY = 'agency-logo';

export function AgencyLogoUpload({ logo, onLogoChange, compact = false }: AgencyLogoUploadProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Carregar logo salva do localStorage
  useEffect(() => {
    const savedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
    if (savedLogo && !logo) {
      onLogoChange(savedLogo);
    }
  }, []);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Arquivo inválido",
        description: "Por favor, selecione uma imagem (PNG, JPG ou SVG).",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "Arquivo muito grande",
        description: "A imagem deve ter no máximo 2MB.",
        variant: "destructive",
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onLogoChange(result);
      localStorage.setItem(LOGO_STORAGE_KEY, result);
      toast({
        title: "Logo salva",
        description: "A logo será usada em todos os orçamentos.",
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleRemoveLogo = () => {
    onLogoChange(null);
    localStorage.removeItem(LOGO_STORAGE_KEY);
    toast({
      title: "Logo removida",
      description: "Os orçamentos serão gerados sem logo.",
    });
  };

  if (compact && logo) {
    return (
      <div className="flex items-center gap-3">
        <div className="h-10 w-20 rounded border border-border bg-white flex items-center justify-center overflow-hidden">
          <img src={logo} alt="Logo" className="max-h-full max-w-full object-contain" />
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="text-xs text-muted-foreground"
        >
          Alterar
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          className="hidden"
        />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-foreground">
        Logo da Agência
      </label>
      
      {logo ? (
        <div className="flex items-center gap-4 p-4 rounded-lg border border-border bg-card">
          <div className="h-16 w-32 rounded border border-border bg-white flex items-center justify-center overflow-hidden">
            <img src={logo} alt="Logo da agência" className="max-h-full max-w-full object-contain" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground flex items-center gap-1">
              <Check className="h-4 w-4 text-green-500" />
              Logo configurada
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Será usada automaticamente nos PDFs
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Alterar
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRemoveLogo}
              className="text-destructive hover:text-destructive"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={cn(
            "border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors",
            isDragging
              ? "border-accent bg-accent/10"
              : "border-border hover:border-accent/50 bg-card"
          )}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="p-3 rounded-full bg-secondary">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Adicione a logo da agência
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Arraste ou clique para selecionar
              </p>
              <p className="text-xs text-muted-foreground">
                PNG, JPG ou SVG (máx. 2MB)
              </p>
            </div>
          </div>
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
}
