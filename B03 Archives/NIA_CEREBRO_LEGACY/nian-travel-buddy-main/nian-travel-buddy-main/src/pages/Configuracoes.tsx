import { MainLayout } from "@/components/layout/MainLayout";
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Building2, MessageSquare, Target, ShieldCheck, Check, Database, FileText, Lightbulb, User } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface NiaSettings {
  id?: string;
  agency_name: string | null;
  agency_stage: string | null;
  agency_focus: string | null;
  communication_style: string | null;
  business_priority: string | null;
  client_profile: string | null;
  avoid_discounts: boolean;
  avoid_aggressive_followups: boolean;
  prefer_premium: boolean;
  user_gender: string | null;
}

const defaultSettings: NiaSettings = {
  agency_name: null,
  agency_stage: null,
  agency_focus: null,
  communication_style: null,
  business_priority: null,
  client_profile: null,
  avoid_discounts: false,
  avoid_aggressive_followups: false,
  prefer_premium: false,
  user_gender: null,
};

export default function Configuracoes() {
  const [settings, setSettings] = useState<NiaSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveTimeout, setSaveTimeout] = useState<NodeJS.Timeout | null>(null);
  const [activeTab, setActiveTab] = useState("perfil");

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("nia_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;
      
      if (data) {
        setSettings(data as NiaSettings);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveSettings = async (newSettings: NiaSettings) => {
    setIsSaving(true);
    try {
      const { id, ...settingsToSave } = newSettings;
      
      if (id) {
        const { error } = await supabase
          .from("nia_settings")
          .update(settingsToSave)
          .eq("id", id);
        if (error) throw error;
      } else {
        const { data, error } = await supabase
          .from("nia_settings")
          .insert(settingsToSave as any)
          .select()
          .single();
        if (error) throw error;
        if (data) {
          setSettings(prev => ({ ...prev, id: data.id }));
        }
      }
      
      toast.success("Configurações salvas", {
        icon: <Check className="h-4 w-4" />,
      });
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Erro ao salvar configurações");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = <K extends keyof NiaSettings>(key: K, value: NiaSettings[K]) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    if (saveTimeout) {
      clearTimeout(saveTimeout);
    }
    
    const timeout = setTimeout(() => {
      saveSettings(newSettings);
    }, 500);
    
    setSaveTimeout(timeout);
  };

  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-[calc(100vh-2rem)]">
          <div className="animate-pulse text-muted-foreground">Carregando configurações...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8 max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Database className="h-6 w-6 text-accent" />
            Banco de Dados da Agência
          </h1>
          <p className="text-muted-foreground mt-1">
            Memória estrutural da empresa — alimenta orçamentos, follow-ups e análises
          </p>
          {isSaving && (
            <p className="text-xs text-muted-foreground mt-2 animate-pulse">
              Salvando...
            </p>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="perfil" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Perfil</span>
            </TabsTrigger>
            <TabsTrigger value="comunicacao" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Comunicação</span>
            </TabsTrigger>
            <TabsTrigger value="negocio" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Negócio</span>
            </TabsTrigger>
            <TabsTrigger value="limites" className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Limites</span>
            </TabsTrigger>
          </TabsList>

          {/* Perfil Tab */}
          <TabsContent value="perfil" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Building2 className="h-5 w-5 text-primary" />
                  Perfil da Agência
                </CardTitle>
                <CardDescription>
                  Informações básicas sobre sua agência de viagens
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Como devo me referir a você?</Label>
                  <RadioGroup
                    value={settings.user_gender || ""}
                    onValueChange={(value) => updateSetting("user_gender", value || null)}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="masculino" id="gender_masculino" />
                      <Label htmlFor="gender_masculino" className="font-normal cursor-pointer">
                        <span className="font-medium">Sócio</span>
                        <span className="text-muted-foreground ml-2">— Masculino</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="feminino" id="gender_feminino" />
                      <Label htmlFor="gender_feminino" className="font-normal cursor-pointer">
                        <span className="font-medium">Sócia</span>
                        <span className="text-muted-foreground ml-2">— Feminino</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="agency_name">Nome da Agência</Label>
                  <Input
                    id="agency_name"
                    placeholder="Ex: Viagens dos Sonhos"
                    value={settings.agency_name || ""}
                    onChange={(e) => updateSetting("agency_name", e.target.value || null)}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Estágio da Agência</Label>
                  <RadioGroup
                    value={settings.agency_stage || ""}
                    onValueChange={(value) => updateSetting("agency_stage", value || null)}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="iniciante" id="stage_iniciante" />
                      <Label htmlFor="stage_iniciante" className="font-normal cursor-pointer">
                        <span className="font-medium">Iniciante</span>
                        <span className="text-muted-foreground ml-2">— Estou começando no mercado</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="crescimento" id="stage_crescimento" />
                      <Label htmlFor="stage_crescimento" className="font-normal cursor-pointer">
                        <span className="font-medium">Em Crescimento</span>
                        <span className="text-muted-foreground ml-2">— Tenho clientes, buscando expandir</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="estruturada" id="stage_estruturada" />
                      <Label htmlFor="stage_estruturada" className="font-normal cursor-pointer">
                        <span className="font-medium">Estruturada</span>
                        <span className="text-muted-foreground ml-2">— Operação consolidada com equipe</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Foco Principal</Label>
                  <RadioGroup
                    value={settings.agency_focus || ""}
                    onValueChange={(value) => updateSetting("agency_focus", value || null)}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="lazer" id="focus_lazer" />
                      <Label htmlFor="focus_lazer" className="font-normal cursor-pointer">
                        <span className="font-medium">Lazer</span>
                        <span className="text-muted-foreground ml-2">— Viagens de férias e turismo</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="corporativo" id="focus_corporativo" />
                      <Label htmlFor="focus_corporativo" className="font-normal cursor-pointer">
                        <span className="font-medium">Corporativo</span>
                        <span className="text-muted-foreground ml-2">— Viagens de negócios e eventos</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="misto" id="focus_misto" />
                      <Label htmlFor="focus_misto" className="font-normal cursor-pointer">
                        <span className="font-medium">Misto</span>
                        <span className="text-muted-foreground ml-2">— Atendo ambos os segmentos</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Comunicação Tab */}
          <TabsContent value="comunicacao" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <MessageSquare className="h-5 w-5 text-primary" />
                  Estilo de Comunicação
                </CardTitle>
                <CardDescription>
                  Como você prefere que a N.IA se comunique com você
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={settings.communication_style || ""}
                  onValueChange={(value) => updateSetting("communication_style", value || null)}
                  className="flex flex-col gap-3"
                >
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="direto" id="comm_direto" />
                    <Label htmlFor="comm_direto" className="font-normal cursor-pointer">
                      <span className="font-medium">Direto e Objetivo</span>
                      <span className="text-muted-foreground ml-2">— Respostas curtas e práticas</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="explicativo" id="comm_explicativo" />
                    <Label htmlFor="comm_explicativo" className="font-normal cursor-pointer">
                      <span className="font-medium">Explicativo</span>
                      <span className="text-muted-foreground ml-2">— Detalhes e contexto nas respostas</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="informal" id="comm_informal" />
                    <Label htmlFor="comm_informal" className="font-normal cursor-pointer">
                      <span className="font-medium">Informal</span>
                      <span className="text-muted-foreground ml-2">— Tom amigável e descontraído</span>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3">
                    <RadioGroupItem value="estrategico" id="comm_estrategico" />
                    <Label htmlFor="comm_estrategico" className="font-normal cursor-pointer">
                      <span className="font-medium">Estratégico</span>
                      <span className="text-muted-foreground ml-2">— Foco em análise e resultados</span>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Negócio Tab */}
          <TabsContent value="negocio" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Target className="h-5 w-5 text-primary" />
                  Foco do Negócio
                </CardTitle>
                <CardDescription>
                  Suas prioridades e perfil típico de clientes
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-3">
                  <Label>Prioridade Principal</Label>
                  <RadioGroup
                    value={settings.business_priority || ""}
                    onValueChange={(value) => updateSetting("business_priority", value || null)}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="vender_mais" id="priority_vender" />
                      <Label htmlFor="priority_vender" className="font-normal cursor-pointer">
                        <span className="font-medium">Vender Mais</span>
                        <span className="text-muted-foreground ml-2">— Aumentar conversões e faturamento</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="eficiencia" id="priority_eficiencia" />
                      <Label htmlFor="priority_eficiencia" className="font-normal cursor-pointer">
                        <span className="font-medium">Ganhar Eficiência</span>
                        <span className="text-muted-foreground ml-2">— Otimizar processos e tempo</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="reduzir_erros" id="priority_erros" />
                      <Label htmlFor="priority_erros" className="font-normal cursor-pointer">
                        <span className="font-medium">Reduzir Erros</span>
                        <span className="text-muted-foreground ml-2">— Evitar falhas e retrabalho</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-3">
                  <Label>Perfil Típico de Cliente</Label>
                  <RadioGroup
                    value={settings.client_profile || ""}
                    onValueChange={(value) => updateSetting("client_profile", value || null)}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="preco" id="client_preco" />
                      <Label htmlFor="client_preco" className="font-normal cursor-pointer">
                        <span className="font-medium">Foco em Preço</span>
                        <span className="text-muted-foreground ml-2">— Busca economia e custo-benefício</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="conforto" id="client_conforto" />
                      <Label htmlFor="client_conforto" className="font-normal cursor-pointer">
                        <span className="font-medium">Foco em Conforto</span>
                        <span className="text-muted-foreground ml-2">— Valoriza qualidade e conveniência</span>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="experiencia" id="client_experiencia" />
                      <Label htmlFor="client_experiencia" className="font-normal cursor-pointer">
                        <span className="font-medium">Foco em Experiência</span>
                        <span className="text-muted-foreground ml-2">— Busca exclusividade e diferencial</span>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Limites Tab */}
          <TabsContent value="limites" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  Limites e Preferências
                </CardTitle>
                <CardDescription>
                  Controle o que a N.IA deve evitar ou priorizar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Evitar sugerir descontos automaticamente</Label>
                    <p className="text-sm text-muted-foreground">
                      A N.IA não vai propor descontos sem você pedir
                    </p>
                  </div>
                  <Switch
                    checked={settings.avoid_discounts}
                    onCheckedChange={(checked) => updateSetting("avoid_discounts", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Evitar follow-ups agressivos</Label>
                    <p className="text-sm text-muted-foreground">
                      Sugestões de contato mais espaçadas e sutis
                    </p>
                  </div>
                  <Switch
                    checked={settings.avoid_aggressive_followups}
                    onCheckedChange={(checked) => updateSetting("avoid_aggressive_followups", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between py-2">
                  <div className="space-y-0.5">
                    <Label className="text-base">Priorizar opções premium</Label>
                    <p className="text-sm text-muted-foreground">
                      Sugerir primeiro opções de maior valor agregado
                    </p>
                  </div>
                  <Switch
                    checked={settings.prefer_premium}
                    onCheckedChange={(checked) => updateSetting("prefer_premium", checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* NIA Note */}
            <Card className="border-accent/30 bg-accent/5">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <Lightbulb className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm text-foreground">
                      A N.IA usa estas configurações silenciosamente para ajustar 
                      análises, orçamentos e sugestões de follow-up ao seu contexto.
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      Ela não cria nem altera dados sem seu pedido explícito.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
