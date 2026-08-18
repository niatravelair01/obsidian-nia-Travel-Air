import { useParams, useNavigate } from "react-router-dom";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, User, Phone, Mail, Plus, CheckSquare, Bell, Loader2, Trash2, Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MVP_USER_ID } from "@/lib/mvp-user";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type DbClient = Tables<"clients">;
type DbTask = Tables<"tasks">;
type DbFollowUp = Tables<"follow_ups">;

const statusOptions = [
  { value: "lead", label: "Lead" },
  { value: "atendimento", label: "Em Atendimento" },
  { value: "negociacao", label: "Negociação" },
  { value: "pos-venda", label: "Pós-Venda" },
  { value: "inativo", label: "Inativo" },
] as const;

function formatDate(d: string | null) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export default function ClienteDetalhe() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [client, setClient] = useState<DbClient | null>(null);
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [followups, setFollowups] = useState<DbFollowUp[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Task form
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskDesc, setTaskDesc] = useState("");

  // Followup form
  const [showFollowupModal, setShowFollowupModal] = useState(false);
  const [followupTipo, setFollowupTipo] = useState("");
  const [followupData, setFollowupData] = useState("");

  // Edit client
  const [showEditModal, setShowEditModal] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStatus, setEditStatus] = useState("lead");

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<{ type: "task" | "followup"; id: string } | null>(null);

  const fetchAll = async () => {
    if (!id) return;
    setLoading(true);
    const [clientRes, tasksRes, followupsRes] = await Promise.all([
      supabase.from("clients").select("*").eq("id", id).maybeSingle(),
      supabase.from("tasks").select("*").eq("client_id", id).order("created_at", { ascending: false }),
      supabase.from("follow_ups").select("*").eq("client_id", id).order("created_at", { ascending: false }),
    ]);
    if (clientRes.data) setClient(clientRes.data);
    if (tasksRes.data) setTasks(tasksRes.data);
    if (followupsRes.data) setFollowups(followupsRes.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchAll();
    const ch1 = supabase.channel(`client-tasks-${id}`).on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, fetchAll).subscribe();
    const ch2 = supabase.channel(`client-followups-${id}`).on("postgres_changes", { event: "*", schema: "public", table: "follow_ups" }, fetchAll).subscribe();
    return () => { supabase.removeChannel(ch1); supabase.removeChannel(ch2); };
  }, [id]);

  const handleCreateTask = async () => {
    if (!taskTitle.trim()) { toast({ title: "Título é obrigatório", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("tasks").insert({
      company_id: MVP_USER_ID, client_id: id!, titulo: taskTitle.trim(), descricao: taskDesc.trim() || null, status: "pendente",
    });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Tarefa criada!" }); setShowTaskModal(false); setTaskTitle(""); setTaskDesc(""); }
    setSaving(false);
  };

  const handleCreateFollowup = async () => {
    if (!followupTipo.trim()) { toast({ title: "Tipo é obrigatório", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("follow_ups").insert({
      company_id: MVP_USER_ID, client_id: id!, tipo: followupTipo.trim(), status: "pendente",
      data_agendada: followupData || null,
    });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Follow-up criado!" }); setShowFollowupModal(false); setFollowupTipo(""); setFollowupData(""); }
    setSaving(false);
  };

  const handleEditClient = async () => {
    if (!editName.trim() || !client) return;
    setSaving(true);
    const { error } = await supabase.from("clients").update({
      name: editName.trim(), phone: editPhone.trim() || null, email: editEmail.trim() || null,
      status: editStatus as DbClient["status"],
    }).eq("id", client.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Cliente atualizado!" }); setShowEditModal(false); fetchAll(); }
    setSaving(false);
  };

  const handleDeleteItem = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    const table = deleteTarget.type === "task" ? "tasks" : "follow_ups";
    const { error } = await supabase.from(table).delete().eq("id", deleteTarget.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Removido com sucesso!" });
    setDeleteTarget(null);
    setSaving(false);
  };

  const openEditClient = () => {
    if (!client) return;
    setEditName(client.name); setEditPhone(client.phone || ""); setEditEmail(client.email || ""); setEditStatus(client.status);
    setShowEditModal(true);
  };

  if (loading) {
    return <MainLayout><div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-accent" /></div></MainLayout>;
  }

  if (!client) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <h1 className="text-2xl font-semibold text-foreground">Cliente não encontrado</h1>
          <Button onClick={() => navigate("/clientes")} variant="outline"><ArrowLeft className="h-4 w-4 mr-2" />Voltar</Button>
        </div>
      </MainLayout>
    );
  }

  const pendingTasks = tasks.filter(t => t.status !== "concluida");
  const completedTasks = tasks.filter(t => t.status === "concluida");
  const pendingFollowups = followups.filter(f => f.status !== "concluido");

  return (
    <MainLayout>
      <div className="p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-5 w-5" /></Button>
          <div className="flex-1">
            <h1 className="text-2xl font-semibold text-foreground">{client.name}</h1>
            <p className="text-sm text-muted-foreground">Ficha do cliente</p>
          </div>
          <Button variant="outline" onClick={openEditClient}>Editar</Button>
        </div>

        {/* Client Info */}
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-3">
            <Badge variant="outline" className={
              client.status === "negociacao" ? "bg-amber-500/10 text-amber-500" :
              client.status === "atendimento" ? "bg-blue-500/10 text-blue-500" :
              client.status === "pos-venda" ? "bg-green-500/10 text-green-500" :
              client.status === "lead" ? "bg-purple-500/10 text-purple-500" :
              "bg-muted text-muted-foreground"
            }>
              {statusOptions.find(s => s.value === client.status)?.label || client.status}
            </Badge>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="text-foreground">{client.name}</span>
            </div>
            {client.email && (
              <div className="flex items-center gap-2 text-sm">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{client.email}</span>
              </div>
            )}
            {client.phone && (
              <div className="flex items-center gap-2 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{client.phone}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-muted-foreground">Criado em {formatDate(client.created_at)}</p>
        </div>

        {/* Tasks Section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
              <CheckSquare className="h-5 w-5 text-accent" />
              Tarefas ({tasks.length})
            </h2>
            <Button size="sm" onClick={() => setShowTaskModal(true)} className="gap-1">
              <Plus className="h-4 w-4" />Nova Tarefa
            </Button>
          </div>
          {pendingTasks.length === 0 && completedTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhuma tarefa vinculada</p>
          ) : (
            <div className="space-y-2">
              {pendingTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground">{task.titulo}</p>
                    {task.descricao && <p className="text-xs text-muted-foreground mt-0.5">{task.descricao}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 text-xs">{task.status === "em_andamento" ? "Em andamento" : "Pendente"}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget({ type: "task", id: task.id })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {completedTasks.map(task => (
                <div key={task.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border opacity-60">
                  <p className="text-sm text-foreground line-through">{task.titulo}</p>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs">Concluída</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Follow-ups Section */}
        <div className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-foreground flex items-center gap-2">
              <Bell className="h-5 w-5 text-accent" />
              Follow-ups ({followups.length})
            </h2>
            <Button size="sm" onClick={() => setShowFollowupModal(true)} className="gap-1">
              <Plus className="h-4 w-4" />Novo Follow-up
            </Button>
          </div>
          {followups.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">Nenhum follow-up vinculado</p>
          ) : (
            <div className="space-y-2">
              {pendingFollowups.map(f => (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary border border-border">
                  <div>
                    <p className="text-sm font-medium text-foreground capitalize">{f.tipo}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-3 w-3" />Agendado: {formatDate(f.data_agendada)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-500 text-xs">Pendente</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeleteTarget({ type: "followup", id: f.id })}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
              {followups.filter(f => f.status === "concluido").map(f => (
                <div key={f.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border opacity-60">
                  <p className="text-sm text-foreground capitalize">{f.tipo}</p>
                  <Badge variant="outline" className="bg-green-500/10 text-green-500 text-xs">Concluído</Badge>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Back button */}
        <Button onClick={() => navigate("/clientes")} variant="outline">Ver todos os clientes</Button>
      </div>

      {/* Create Task Modal */}
      <Dialog open={showTaskModal} onOpenChange={setShowTaskModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Tarefa</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Título *</Label><Input value={taskTitle} onChange={e => setTaskTitle(e.target.value)} placeholder="Ex: Ligar para confirmar" /></div>
            <div><Label>Descrição</Label><Textarea value={taskDesc} onChange={e => setTaskDesc(e.target.value)} placeholder="Detalhes opcionais..." /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTaskModal(false)}>Cancelar</Button>
            <Button onClick={handleCreateTask} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Follow-up Modal */}
      <Dialog open={showFollowupModal} onOpenChange={setShowFollowupModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Follow-up</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Tipo *</Label><Input value={followupTipo} onChange={e => setFollowupTipo(e.target.value)} placeholder="Ex: Pós-venda, Proposta, Retorno" /></div>
            <div><Label>Data agendada</Label><Input type="datetime-local" value={followupData} onChange={e => setFollowupData(e.target.value)} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFollowupModal(false)}>Cancelar</Button>
            <Button onClick={handleCreateFollowup} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Client Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>Editar Cliente</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Nome *</Label><Input value={editName} onChange={e => setEditName(e.target.value)} /></div>
            <div><Label>Telefone</Label><Input value={editPhone} onChange={e => setEditPhone(e.target.value)} /></div>
            <div><Label>Email</Label><Input value={editEmail} onChange={e => setEditEmail(e.target.value)} type="email" /></div>
            <div>
              <Label>Status</Label>
              <Select value={editStatus} onValueChange={setEditStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>Cancelar</Button>
            <Button onClick={handleEditClient} disabled={saving}>{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {deleteTarget?.type === "task" ? "tarefa" : "follow-up"}?</AlertDialogTitle>
            <AlertDialogDescription>Esta ação não pode ser desfeita.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} disabled={saving} className="bg-destructive text-destructive-foreground">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </MainLayout>
  );
}
