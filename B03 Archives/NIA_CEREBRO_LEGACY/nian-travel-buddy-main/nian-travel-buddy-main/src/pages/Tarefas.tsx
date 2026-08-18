import { useState, useEffect } from "react";
import { MainLayout } from "@/components/layout/MainLayout";
import { MobileLayout, MobileTasks } from "@/components/mobile";
import { useIsMobile } from "@/hooks/use-mobile";
import { CheckSquare, CheckCircle2, Calendar, Loader2, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { MVP_USER_ID } from "@/lib/mvp-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";

type DbTask = Tables<"tasks">;

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  const date = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  if (date.toDateString() === today.toDateString()) return "Hoje";
  if (date.toDateString() === tomorrow.toDateString()) return "Amanhã";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

function getStatusConfig(status: string | null) {
  switch (status) {
    case "em_andamento":
      return { color: "text-blue-500", bg: "bg-blue-500/10", border: "border-l-blue-500", label: "Em andamento" };
    case "concluida":
      return { color: "text-green-500", bg: "bg-green-500/10", border: "border-l-green-500", label: "Concluída" };
    default:
      return { color: "text-amber-500", bg: "bg-amber-500/10", border: "border-l-amber-500", label: "Pendente" };
  }
}

export default function Tarefas() {
  const isMobile = useIsMobile();
  const [tasks, setTasks] = useState<DbTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Create modal
  const [showCreate, setShowCreate] = useState(false);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks").select("*").order("created_at", { ascending: false });
    if (!error && data) setTasks(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchTasks();
    const channel = supabase
      .channel("tasks-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, () => fetchTasks())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleCreate = async () => {
    if (!title.trim()) { toast({ title: "Título é obrigatório", variant: "destructive" }); return; }
    setSaving(true);
    const { error } = await supabase.from("tasks").insert({
      company_id: MVP_USER_ID, titulo: title.trim(), descricao: desc.trim() || null, status: "pendente",
    });
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else { toast({ title: "Tarefa criada!" }); setShowCreate(false); setTitle(""); setDesc(""); }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setSaving(true);
    const { error } = await supabase.from("tasks").delete().eq("id", deletingId);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
    else toast({ title: "Tarefa excluída!" });
    setDeletingId(null);
    setSaving(false);
  };

  const toggleStatus = async (task: DbTask) => {
    const newStatus = task.status === "concluida" ? "pendente" : "concluida";
    const { error } = await supabase.from("tasks").update({ status: newStatus }).eq("id", task.id);
    if (error) toast({ title: "Erro", description: error.message, variant: "destructive" });
  };

  if (isMobile) {
    return <MobileLayout><MobileTasks /></MobileLayout>;
  }

  const pendingTasks = tasks.filter(t => t.status !== "concluida");
  const completedTasks = tasks.filter(t => t.status === "concluida");

  return (
    <MainLayout>
      <div className="p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-accent" />Tarefas
            </h1>
            <p className="text-muted-foreground mt-1">Suas atividades organizadas por prioridade</p>
          </div>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" />Nova Tarefa
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg bg-secondary border border-border">
            <p className="text-2xl font-semibold text-foreground">{pendingTasks.length}</p>
            <p className="text-sm text-muted-foreground">Pendentes</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary border border-border">
            <p className="text-2xl font-semibold text-green-500">{completedTasks.length}</p>
            <p className="text-sm text-muted-foreground">Concluídas</p>
          </div>
          <div className="p-4 rounded-lg bg-secondary border border-border">
            <p className="text-2xl font-semibold text-foreground">{tasks.length}</p>
            <p className="text-sm text-muted-foreground">Total</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-accent" />
          </div>
        ) : (
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <CheckSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma tarefa pendente</p>
                <p className="text-sm mt-2">Clique em "Nova Tarefa" para criar</p>
              </div>
            ) : (
              pendingTasks.map(task => {
                const sc = getStatusConfig(task.status);
                return (
                  <div key={task.id} className={cn("bg-card border border-border rounded-lg p-4 border-l-4", sc.border)}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleStatus(task)}>
                        <div className="flex items-center gap-2 mb-1">
                          <CheckSquare className={cn("h-4 w-4", sc.color)} />
                          <h3 className="font-medium text-foreground">{task.titulo}</h3>
                          <span className={cn("px-2 py-0.5 rounded text-xs", sc.bg, sc.color)}>{sc.label}</span>
                        </div>
                        {task.descricao && <p className="text-sm text-muted-foreground mt-1">{task.descricao}</p>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Calendar className="h-4 w-4" />{formatDate(task.created_at)}
                        </span>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeletingId(task.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {completedTasks.length > 0 && (
          <div className="mt-8">
            <h2 className="text-lg font-medium text-foreground mb-4 flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />Concluídas
            </h2>
            <div className="space-y-2 opacity-60">
              {completedTasks.map(task => (
                <div key={task.id} className="bg-card border border-border rounded-lg p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 cursor-pointer" onClick={() => toggleStatus(task)}>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-foreground line-through">{task.titulo}</span>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => setDeletingId(task.id)}>
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
          <DialogHeader><DialogTitle>Nova Tarefa</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div><Label>Título *</Label><Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Enviar orçamento" /></div>
            <div><Label>Descrição</Label><Textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Detalhes..." /></div>
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
            <AlertDialogTitle>Excluir tarefa?</AlertDialogTitle>
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
