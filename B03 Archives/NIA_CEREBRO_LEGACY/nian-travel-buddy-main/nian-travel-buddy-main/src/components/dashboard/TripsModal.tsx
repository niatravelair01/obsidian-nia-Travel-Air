import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plane, MapPin, User, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface Trip {
  id: string;
  cliente: string;
  destino: string;
  dataInicio: string;
  dataFim: string;
  status: "confirmada" | "em_andamento" | "pendente";
}

interface TripsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trips: Trip[];
}

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

export function TripsModal({ open, onOpenChange, trips }: TripsModalProps) {
  const today = new Date();
  
  // Find most recent trip (currently happening or just started)
  const currentTrip = trips.find(t => {
    const start = new Date(t.dataInicio);
    const end = new Date(t.dataFim);
    return t.status === "em_andamento" || (start <= today && end >= today);
  });

  // Upcoming confirmed trips
  const upcomingTrips = trips
    .filter(t => {
      const start = new Date(t.dataInicio);
      return t.status === "confirmada" && start > today;
    })
    .sort((a, b) => new Date(a.dataInicio).getTime() - new Date(b.dataInicio).getTime())
    .slice(0, 5);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plane className="h-5 w-5 text-accent" />
            Viagens este Mês
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Current Trip */}
          {currentTrip && (
            <div>
              <p className="text-xs font-medium text-accent mb-2">Viagem em Andamento</p>
              <div className="p-4 rounded-lg bg-accent/5 border border-accent/20">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-sm font-medium text-foreground">{currentTrip.cliente}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">{currentTrip.destino}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-2 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      <span>
                        {formatDate(currentTrip.dataInicio)} - {formatDate(currentTrip.dataFim)}
                      </span>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "px-2 py-1 rounded text-xs font-medium",
                      getStatusColor(currentTrip.status)
                    )}
                  >
                    {getStatusLabel(currentTrip.status)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Upcoming Trips */}
          <div>
            <p className="text-xs font-medium text-muted-foreground mb-2">
              Próximas Viagens Confirmadas
            </p>
            <div className="space-y-2">
              {upcomingTrips.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">
                  Nenhuma viagem confirmada para os próximos dias.
                </p>
              ) : (
                upcomingTrips.map((trip) => (
                  <div
                    key={trip.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-muted-foreground" />
                        <p className="text-sm font-medium text-foreground">{trip.cliente}</p>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">{trip.destino}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(trip.dataInicio)}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
