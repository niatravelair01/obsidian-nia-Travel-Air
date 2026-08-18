import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { MobileLayout, MobileClients } from "@/components/mobile";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNavigate } from "react-router-dom";
import { Users, Search, Plus, Loader2, Phone, Mail, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { MVP_USER_ID } from "@/lib/mvp-user";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type DbClient = Tables<"clients">;

const statusOptions = [
  { value: "lead", label: "Lead" },
  { value: "atendimento", label: "Em Atendimento" },
  { value: "negociacao", label: "Negociação" },
  { value: "pos-venda", label: "Pós-Venda" },
  { value: "inativo", label: "Inativo" },
] as const;

const getStatusColor = (status: string) => {
  switch (status) {
    case "atendimento": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    case "negociacao": return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "pos-venda": return "bg-green-500/10 text-green-500 border-green-500/20";
    case "lead": return "bg-purple-500/10 text-purple-500 border-purple-500/20";
    case "inativo": return "bg-muted text-muted-foreground border-border";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

const getStatusLabel = (status: string) => {
  return statusOptions.find(s => s.value === status)?.label || status;
};

export default function Clientes() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [clients, setClients] = useState<DbClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingClient, setEditingClient] = useState<DbClient | null>(null);
  const [deletingClient, setDeletingClient] = useState<DbClient | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formStatus, setFormStatus] = useState<string>("lead");

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setClients(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
    const channel = supabase
      .channel("clients-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, () => fetchClients())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const resetForm = () => {
    setFormName(""); setFormPhone(""); setFormEmail(""); setFormStatus("lead");
  };

  const openCreate = () => { resetForm(); setShowCreateModal(true); };
  const openEdit = (client: DbClient) => {
    setFormName(client.name);
    setFormPhone(client.phone || "");
    setFormEmail(client.email || "");
    setFormStatus(client.status);
    setEditingClient(client);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      toast({ title: "Nome é obrigatório", variant: "destructive" });
      return;
    }
    setSaving(true);

    if (editingClient) {
      const { error } = await supabase
        .from("clients")
        .update({
          name: formName.trim(),
          phone: formPhone.trim() || null,
          email: formEmail.trim() || null,
          status: formStatus as DbClient["status"],
        })
        .eq("id", editingClient.id);
      if (error) {
        toast({ title: "Erro ao atualizar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Cliente atualizado!" });
        setEditingClient(null);
      }
    } else {
      const { error } = await supabase
        .from("clients")
        .insert({
          company_id: MVP_USER_ID,
          name: formName.trim(),
          phone: formPhone.trim() || null,
          email: formEmail.trim() || null,
          status: formStatus as DbClient["status"],
        });
      if (error) {
        toast({ title: "Erro ao criar", description: error.message, variant: "destructive" });
      } else {
        toast({ title: "Cliente criado!" });
        setShowCreateModal(false);
      }
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deletingClient) return;
    setSaving(true);
    const { error } = await supabase.from("clients").delete().eq("id", deletingClient.id);
    if (error) {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Cliente excluído", description: "Tarefas e follow-ups vinculados foram removidos." });
    }
    setDeletingClient(null);
    setSaving(false);
  };

  const filtered = clients.filter(c => {
    const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.phone || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = !statusFilter || c.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isMobile) {
    return <MobileLayout><MobileClients /></MobileLayout>;
  }

  const counts = {
    total: clients.length,
    ativos: clients.filter(c => ["atendimento", "negociacao", "pos-venda"].includes(c.status)).length,
    leads: clients.filter(c => c.status === "lead").length,
  };

  const formModal = (
    <Dialog open={showCreateModal || !!editingClient} onOpenChange={(open) => { if (!open) { setShowCreateModal(false); setEditingClient(null); } }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editingClient ? "Editar Cliente" : "Novo Cliente"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Nome *</Label>
            <Input value={formName} onChange={e => setFormName(e.target.value)} placeholder="Nome do cliente" />
          </div>
          <div>
            <Label>Telefone</Label>
            <Input value={formPhone} onChange={e => setFormPhone(e.target.value)} placeholder="(11) 99999-9999" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={formEmail} onChange={e => setFormEmail(e.target.value)} placeholder="email@exemplo.com" type="email" />
          </div>
          <div>
            <Label>Status</Label>
            <Select value={formStatus} onValueChange={setFormStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {statusOptions.map(s => (
                  <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { setShowCreateModal(false); setEditingClient(null); }}>Cancelar</Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : editingClient ? "Salvar" : "Criar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <MainLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Users className="h-6 w-6 text-accent" />
              Clientes
            </h1>
            <p className="text-muted-foreground mt-1">Gerencie seus clientes</p>
          </div>
          <Button onClick={openCreate} className="gap-2">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <button onClick={() => setStatusFilter(null)} className={`p-4 rounded-lg border text-left transition-colors ${!statusFilter ? "bg-accent/10 border-accent/30" : "bg-secondary border-border"}`}>
            <p className="text-2xl font-semibold text-foreground">{counts.total}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </button>
          <button onClick={() => setStatusFilter("negociacao")} className={`p-4 rounded-lg border text-left transition-colors ${statusFilter === "negociacao" ? "bg-accent/10 border-accent/30" : "bg-secondary border-border"}`}>
            <p className="text-2xl font-semibold text-amber-500">{clients.filter(c => c.status === "negociacao").length}</p>
            <p className="text-sm text-muted-foreground">Em Negociação</p>
          </button>
          <button onClick={() => setStatusFilter("lead")} className={`p-4 rounded-lg border text-left transition-colors ${statusFilter === "lead" ? "bg-accent/10 border-accent/30" : "bg-secondary border-border"}`}>
            <p className="text-2xl font-semibold text-purple-500">{counts.leads}</p>
            <p className="text-sm text-muted-foreground">Leads</p>
          </button>
        </div>

        {/* Search */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por nome, email ou telefone..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum cliente encontrado</p>
            <p className="text-sm mt-2">Clique em "Novo Cliente" para adicionar</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map(client => (
              <div
                key={client.id}
                className="bg-card border border-border rounded-lg p-4 hover:border-accent/30 transition-colors cursor-pointer"
                onClick={() => navigate(`/clientes/${client.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-medium text-foreground">{client.name}</h3>
                      <Badge variant="outline" className={getStatusColor(client.status)}>
                        {getStatusLabel(client.status)}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {client.email && <span className="flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{client.email}</span>}
                      {client.phone && <span className="flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{client.phone}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <Button variant="ghost" size="sm" onClick={e => { e.stopPropagation(); openEdit(client); }}>Editar</Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={e => { e.stopPropagation(); setDeletingClient(client); }}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {formModal}

        <AlertDialog open={!!deletingClient} onOpenChange={(open) => { if (!open) setDeletingClient(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Excluir cliente?</AlertDialogTitle>
              <AlertDialogDescription>
                Isso excluirá permanentemente "{deletingClient?.name}" e todas as tarefas e follow-ups vinculados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete} disabled={saving} className="bg-destructive text-destructive-foreground">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
}
