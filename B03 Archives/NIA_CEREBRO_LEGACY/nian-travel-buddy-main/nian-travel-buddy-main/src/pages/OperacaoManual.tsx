import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { MVP_USER_ID } from "@/lib/mvp-user";
import { useClients } from "@/hooks/useClients";
import { toast } from "sonner";
import { UserPlus, FileText, Wallet } from "lucide-react";

// ─── SEÇÃO 1: Cadastro de Cliente ───────────────────────────────────────────

function CadastroCliente() {
  const { createClient, isCreating } = useClients();
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    travel_profile: "",
    destination: "",
    data_viagem: "",
    average_budget: "",
    status: "lead" as "lead" | "atendimento" | "negociacao",
    notes: "",
  });

  const statusMap: Record<string, "lead" | "atendimento" | "negociacao"> = {
    frio: "lead",
    morno: "atendimento",
    quente: "negociacao",
  };

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const handleSave = async () => {
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Nome e telefone são obrigatórios.");
      return;
    }

    // Check duplicate phone
    const { data: existing } = await supabase
      .from("clients")
      .select("id")
      .eq("phone", form.phone.trim())
      .maybeSingle();

    if (existing) {
      toast.error("Já existe um cliente com esse telefone.");
      return;
    }

    try {
      await createClient({
        name: form.name.trim(),
        phone: form.phone.trim(),
        email: form.email.trim() || null,
        status: form.status,
      } as any);

      // Update extra fields that useClients doesn't handle
      // We need the created client id — refetch
      const { data: created } = await supabase
        .from("clients")
        .select("id")
        .eq("phone", form.phone.trim())
        .single();

      if (created) {
        await supabase
          .from("clients")
          .update({
            travel_profile: form.travel_profile || null,
            destination: form.destination || null,
            average_budget: form.average_budget ? Number(form.average_budget) : null,
            notes: form.notes || null,
          })
          .eq("id", created.id);
      }

      toast.success("Cliente salvo com sucesso!");
      setForm({
        name: "", phone: "", email: "", travel_profile: "",
        destination: "", data_viagem: "", average_budget: "",
        status: "lead", notes: "",
      });
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar cliente.");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-accent" />
          Cadastro Manual de Cliente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nome completo *</Label>
            <Input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Nome do cliente" />
          </div>
          <div className="space-y-2">
            <Label>Telefone (WhatsApp) *</Label>
            <Input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@exemplo.com" />
          </div>
          <div className="space-y-2">
            <Label>Tipo de cliente</Label>
            <Select value={form.travel_profile} onValueChange={(v) => set("travel_profile", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="lazer">Lazer</SelectItem>
                <SelectItem value="corporativo">Corporativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Destino principal</Label>
            <Input value={form.destination} onChange={(e) => set("destination", e.target.value)} placeholder="Ex: Paris" />
          </div>
          <div className="space-y-2">
            <Label>Data prevista da viagem</Label>
            <Input type="date" value={form.data_viagem} onChange={(e) => set("data_viagem", e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label>Orçamento estimado (R$)</Label>
            <Input type="number" value={form.average_budget} onChange={(e) => set("average_budget", e.target.value)} placeholder="5000" />
          </div>
          <div className="space-y-2">
            <Label>Status do lead</Label>
            <Select value={Object.entries(statusMap).find(([, v]) => v === form.status)?.[0] || "frio"} onValueChange={(v) => set("status", statusMap[v])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="frio">Frio</SelectItem>
                <SelectItem value="morno">Morno</SelectItem>
                <SelectItem value="quente">Quente</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label>Observações estratégicas</Label>
          <Textarea value={form.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Notas sobre o cliente..." rows={3} />
        </div>
        <Button onClick={handleSave} disabled={isCreating} className="w-full md:w-auto">
          {isCreating ? "Salvando..." : "Salvar Cliente"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── SEÇÃO 2: Cadastro de Orçamento ─────────────────────────────────────────

function CadastroOrcamento() {
  const { clients } = useClients();
  const [form, setForm] = useState({
    client_id: "",
    valor_total: "",
    margem: "",
    status: "rascunho",
    data_viagem: "",
  });
  const [saving, setSaving] = useState(false);

  const lucro = form.valor_total && form.margem
    ? (Number(form.valor_total) * Number(form.margem) / 100).toFixed(2)
    : "0.00";

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  const statusOrcMap: Record<string, string> = {
    negociacao: "enviado",
    fechado: "aprovado",
    perdido: "perdido",
  };

  const handleSave = async () => {
    if (!form.client_id || !form.valor_total) {
      toast.error("Selecione um cliente e informe o valor.");
      return;
    }
    setSaving(true);
    try {
      const valorTotal = Number(form.valor_total);
      const margemPct = Number(form.margem) || 0;
      const custoTotal = valorTotal - (valorTotal * margemPct / 100);

      const { error } = await supabase.from("orcamentos").insert({
        company_id: MVP_USER_ID,
        client_id: form.client_id,
        valor_total: valorTotal,
        custo_total: custoTotal,
        status: statusOrcMap[form.status] || "rascunho",
        data_viagem: form.data_viagem || null,
        titulo: `Orçamento - ${clients.find((c) => c.id === form.client_id)?.name || ""}`,
      } as any);

      if (error) throw error;
      toast.success("Orçamento salvo com sucesso!");
      setForm({ client_id: "", valor_total: "", margem: "", status: "rascunho", data_viagem: "" });
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar orçamento.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-accent" />
          Cadastro Manual de Orçamento
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Cliente *</Label>
            <Select value={form.client_id} onValueChange={(v) => set("client_id", v)}>
              <SelectTrigger><SelectValue placeholder="Selecione o cliente" /></SelectTrigger>
              <SelectContent>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Valor bruto (R$) *</Label>
            <Input type="number" value={form.valor_total} onChange={(e) => set("valor_total", e.target.value)} placeholder="10000" />
          </div>
          <div className="space-y-2">
            <Label>Margem aplicada (%)</Label>
            <Input type="number" value={form.margem} onChange={(e) => set("margem", e.target.value)} placeholder="15" />
          </div>
          <div className="space-y-2">
            <Label>Lucro estimado (R$)</Label>
            <Input readOnly value={lucro} className="bg-muted" />
          </div>
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={form.status} onValueChange={(v) => set("status", v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="negociacao">Em negociação</SelectItem>
                <SelectItem value="fechado">Fechado</SelectItem>
                <SelectItem value="perdido">Perdido</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Data de emissão prevista</Label>
            <Input type="date" value={form.data_viagem} onChange={(e) => set("data_viagem", e.target.value)} />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          {saving ? "Salvando..." : "Salvar Orçamento"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── SEÇÃO 3: Visão Manual de Caixa ─────────────────────────────────────────

function VisaoCaixa() {
  const [form, setForm] = useState({ caixa_disponivel: "", custos_fixos_mensais: "", meta_faturamento: "" });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("company_settings" as any)
        .select("*")
        .maybeSingle();
      if (data) {
        const d = data as any;
        setForm({
          caixa_disponivel: String(d.caixa_disponivel || ""),
          custos_fixos_mensais: String(d.custos_fixos_mensais || ""),
          meta_faturamento: String(d.meta_faturamento || ""),
        });
      }
      setLoaded(true);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        company_id: MVP_USER_ID,
        caixa_disponivel: Number(form.caixa_disponivel) || 0,
        custos_fixos_mensais: Number(form.custos_fixos_mensais) || 0,
        meta_faturamento: Number(form.meta_faturamento) || 0,
      };

      const { data: existing } = await (supabase.from("company_settings" as any) as any)
        .select("id")
        .maybeSingle();

      if (existing) {
        const { error } = await (supabase.from("company_settings" as any) as any)
          .update(payload)
          .eq("id", (existing as any).id);
        if (error) throw error;
      } else {
        const { error } = await (supabase.from("company_settings" as any) as any)
          .insert(payload);
        if (error) throw error;
      }

      toast.success("Configurações de caixa salvas!");
    } catch (e: any) {
      toast.error(e.message || "Erro ao salvar.");
    } finally {
      setSaving(false);
    }
  };

  const set = (key: string, val: string) => setForm((p) => ({ ...p, [key]: val }));

  if (!loaded) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5 text-accent" />
          Visão Manual de Caixa
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Caixa disponível atual (R$)</Label>
            <Input type="number" value={form.caixa_disponivel} onChange={(e) => set("caixa_disponivel", e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label>Custos fixos mensais (R$)</Label>
            <Input type="number" value={form.custos_fixos_mensais} onChange={(e) => set("custos_fixos_mensais", e.target.value)} placeholder="0" />
          </div>
          <div className="space-y-2">
            <Label>Meta de faturamento (R$)</Label>
            <Input type="number" value={form.meta_faturamento} onChange={(e) => set("meta_faturamento", e.target.value)} placeholder="0" />
          </div>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
          {saving ? "Salvando..." : "Salvar Configurações"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ─── PAGE ────────────────────────────────────────────────────────────────────

export default function OperacaoManual() {
  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Operação Manual</h1>
          <p className="text-muted-foreground">Cadastre clientes, orçamentos e configure seu caixa — sem depender de IA.</p>
        </div>
        <CadastroCliente />
        <CadastroOrcamento />
        <VisaoCaixa />
      </div>
    </MainLayout>
  );
}
