import { MainLayout } from "@/components/layout/MainLayout";
import { useSearchParams } from "react-router-dom";
import { Calendar, Plane, MapPin, User } from "lucide-react";
import { cn } from "@/lib/utils";

const mockViagens = [
  {
    id: "1",
    cliente: "João Santos",
    destino: "Paris, França",
    dataInicio: "2025-02-10",
    dataFim: "2025-02-20",
    status: "confirmada" as const,
  },
  {
    id: "2",
    cliente: "Carlos Lima",
    destino: "Tailândia",
    dataInicio: "2025-01-15",
    dataFim: "2025-01-28",
    status: "em_andamento" as const,
  },
  {
    id: "3",
    cliente: "Maria Silva",
    destino: "Caribe",
    dataInicio: "2025-01-20",
    dataFim: "2025-01-30",
    status: "confirmada" as const,
  },
  {
    id: "4",
    cliente: "Ana Rodrigues",
    destino: "Europa",
    dataInicio: "2025-03-05",
    dataFim: "2025-03-20",
    status: "pendente" as const,
  },
  {
    id: "5",
    cliente: "Pedro Almeida",
    destino: "Maldivas",
    dataInicio: "2025-01-25",
    dataFim: "2025-02-05",
    status: "confirmada" as const,
  },
  {
    id: "6",
    cliente: "Fernanda Costa",
    destino: "Nova York, EUA",
    dataInicio: "2025-01-18",
    dataFim: "2025-01-25",
    status: "em_andamento" as const,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmada":
      return "bg-emerald-400/10 text-emerald-400";
    case "em_andamento":
      return "bg-accent/10 text-accent";
    case "pendente":
      return "bg-amber-400/10 text-amber-400";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "confirmada":
      return "Confirmada";
    case "em_andamento":
      return "Em Andamento";
    case "pendente":
      return "Pendente";
    default:
      return status;
  }
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
};

export default function Viagens() {
  const [searchParams] = useSearchParams();
  const mesAtual = searchParams.get("mes") === "atual";

  // Filter by current month if param is present
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const viagensFiltradas = mesAtual
    ? mockViagens.filter((v) => {
        const inicio = new Date(v.dataInicio);
        return inicio.getMonth() === currentMonth && inicio.getFullYear() === currentYear;
      })
    : mockViagens;

  return (
    <MainLayout>
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
            <Plane className="h-6 w-6" />
            Viagens
          </h1>
          <p className="text-muted-foreground mt-1">
            {mesAtual
              ? "Viagens programadas para este mês"
              : "Acompanhe todas as viagens dos seus clientes"}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="surface-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Total de Viagens</p>
            <p className="text-2xl font-semibold text-foreground">{viagensFiltradas.length}</p>
          </div>
          <div className="surface-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Em Andamento</p>
            <p className="text-2xl font-semibold text-accent">
              {viagensFiltradas.filter((v) => v.status === "em_andamento").length}
            </p>
          </div>
          <div className="surface-card rounded-xl p-4">
            <p className="text-sm text-muted-foreground">Confirmadas</p>
            <p className="text-2xl font-semibold text-emerald-400">
              {viagensFiltradas.filter((v) => v.status === "confirmada").length}
            </p>
          </div>
        </div>

        {/* Viagens List */}
        <div className="surface-card rounded-xl p-5">
          <h3 className="text-sm font-medium text-foreground mb-4">
            {mesAtual ? "Viagens deste Mês" : "Todas as Viagens"}
          </h3>
          <div className="space-y-3">
            {viagensFiltradas.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                Nenhuma viagem encontrada para este período.
              </p>
            ) : (
              viagensFiltradas.map((viagem) => (
                <div
                  key={viagem.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-secondary hover:bg-surface-hover transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 rounded-lg bg-muted">
                      <Plane className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">{viagem.cliente}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{viagem.destino}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>
                          {formatDate(viagem.dataInicio)} - {formatDate(viagem.dataFim)}
                        </span>
                      </div>
                    </div>
                    <span
                      className={cn(
                        "px-2 py-1 rounded text-xs font-medium",
                        getStatusColor(viagem.status)
                      )}
                    >
                      {getStatusLabel(viagem.status)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
