import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { MobileLayout } from "@/components/mobile";
import { useIsMobile } from "@/hooks/use-mobile";
import { Bell, Search, Clock, Loader2, Plus, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { MVP_USER_ID } from "@/lib/mvp-user";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type DbFollowUp = Tables<"follow_ups">;
type DbClient = { id: string; name: string };

function formatDate(dateStr: string | null) {
  if (!dateStr) return "Sem data";
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === tomorrow.toDateString()) return "Amanhã";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

function getStatusColor(status: string | null) {
  switch (status) {
    case "concluido": return "bg-green-500/10 text-green-500 border-green-500/20";
    case "em_andamento": return "bg-blue-500/10 text-blue-500 border-blue-500/20";
    default: return "bg-amber-500/10 text-amber-500 border-amber-500/20";
  }
}

function getStatusLabel(status: string | null) {
  switch (status) {
    case "concluido": return "Concluído";
    case "em_andamento": return "Em andamento";
    default: return "Pendente";
  }
}

export default function Followups() {
  const isMobile = useIsMobile();
  const [followups, setFollowups] = useState<DbFollowUp[]>([]);
  const [clients, setClients] = useState<DbClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [saving, setSaving] = useState(false);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [formTipo, setFormTipo] = useState("");
  const [formData, setFormData] = useState("");
  const [formClientId, setFormClientId] = useState("");

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const [fRes, cRes] = await Promise.all([
      supabase.from("follow_ups").select("*").order("created_at", { ascending: false }),
      supabase.from("clients").select("id, name").order("name"),
    ]);
    if (fRes.data) setFollowups(fRes.data);
    if (cRes.data) setClients(cRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const channel = supabase
      .channel("followups-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "follow_ups" }, () => fetchData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCreate = async () => {
    if (!formTipo.trim()) { toast({ title: "Tipo é obrigatório", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("follow_ups").insert({
      company_id: MVP_USER_ID,
      tipo: formTipo.trim(),
      status: "pendente",
      client_id: formClientId || null,
      data_agendada: formData || null,
    });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Follow-up criado!" }); setShowCreate(false); setFormTipo(""); setFormData(""); setFormClientId(""); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setSaving(true);
    const { error } = await supabase.from("follow_ups").delete().eq("id", deletingId);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Follow-up excluído!" });
    setDeletingId(null);
    setSaving(false);
  };

  const filtered = followups.filter(f =>
    f.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const pending = filtered.filter(f => f.status !== "concluido");
  const completed = filtered.filter(f => f.status === "concluido");

  const getClientName = (clientId: string | null) => {
    if (!clientId) return null;
    return clients.find(c => c.id === clientId)?.name || null;
  };

  if (isMobile) {
    return (
      <MobileLayout>
        <div className="px-3 py-2 space-y-1.5">
          <h1 className="text-sm font-semibold text-foreground">Follow-ups</h1>
          {loading ? (
            <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <div className="space-y-px">
              {pending.map(f => (
                <div key={f.id} className="flex items-center justify-between px-2 py-[6px] rounded border border-border bg-card">
                  <div className="min-w-0 flex-1">
                    <p className="text-[11px] font-medium text-foreground truncate">{f.tipo}</p>
                    {getClientName(f.client_id) && <p className="text-[8px] text-muted-foreground">{getClientName(f.client_id)}</p>}
                    <p className="text-[8px] text-muted-foreground/70">{formatDate(f.data_agendada)}</p>
                  </div>
                  <span className={`text-[8px] px-1 py-px rounded-full ${getStatusColor(f.status)}`}>{getStatusLabel(f.status)}</span>
                </div>
              ))}
              {pending.length === 0 && <p className="text-[10px] text-muted-foreground text-center py-4">Nenhum follow-up pendente</p>}
            </div>
          )}
        </div>
      </MobileLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <Bell className="h-6 w-6 text-accent" />Follow-ups
            </h1>
            <p className="text-muted-foreground mt-1">Acompanhe e organize seus follow-ups</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />Novo Follow-up
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-secondary border border-border">
            <p className="text-2xl font-semibold text-amber-500">{pending.length}</p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary border border-border">
            <p className="text-2xl font-semibold text-green-500">{completed.length}</p>
            <p className="text-sm text-muted-foreground">Concluídos</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary border border-border">
            <p className="text-2xl font-semibold text-foreground">{followups.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar por tipo..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-10" />
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div>
        ) : (
          <div className="space-y-3">
            {pending.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Bell className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum follow-up pendente</p>
                <p className="text-sm mt-2">Clique em "Novo Follow-up" para criar</p>
              </div>
            ) : (
              pending.map(f => {
                const clientName = getClientName(f.client_id);
                return (
                  <div key={f.id} className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                          <h3 className="font-medium text-foreground capitalize">{f.tipo}</h3>
                          <Badge variant="outline" className={getStatusColor(f.status)}>{getStatusLabel(f.status)}</Badge>
                          {clientName && <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded">{clientName}</span>}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />Agendado: {formatDate(f.data_agendada)}</span>
                          <span>Criado: {formatDate(f.created_at)}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeletingId(f.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {completed.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-foreground mb-4">Concluídos</h2>
            <div className="space-y-2 opacity-60">
              {completed.map(f => (
                <div key={f.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-foreground capitalize">{f.tipo}</span>
                    <Badge variant="outline" className={getStatusColor(f.status)}>{getStatusLabel(f.status)}</Badge>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeletingId(f.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Follow-up</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Tipo *</Label><Input value={formTipo} onChange={e => setFormTipo(e.target.value)} placeholder="Ex: Pós-venda, Proposta" /></div>
            <div>
              <Label>Cliente (opcional)</Label>
              <Select value={formClientId} onValueChange={setFormClientId}>
                <SelectTrigger><SelectValue placeholder="Selecionar cliente..." /></SelectTrigger>
                <SelectContent>
                  {clients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Data agendada</Label><Input type="datetime-local" value={formData} onChange={e => setFormData(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancelar</Button>
            <Button onClick={handleCreate} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingId} onOpenChange={open => { if (!open) setDeletingId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir follow-up?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={saving} className="bg-destructive text-destructive-foreground">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
