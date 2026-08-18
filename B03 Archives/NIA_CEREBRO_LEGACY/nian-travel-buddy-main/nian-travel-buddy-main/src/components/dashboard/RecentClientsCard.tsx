import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface Client {
  id: string;
  name: string;
  destination: string;
  status: "lead" | "negotiating" | "confirmed" | "traveling";
  avatar?: string;
}

interface RecentClientsCardProps {
  clients: Client[];
  className?: string;
}

export function RecentClientsCard({ clients, className }: RecentClientsCardProps) {
  const navigate = useNavigate();

  const getStatusColor = (status: Client["status"]) => {
    switch (status) {
      case "lead":
        return "bg-muted text-muted-foreground";
      case "negotiating":
        return "bg-amber-400/10 text-amber-400";
      case "confirmed":
        return "bg-emerald-400/10 text-emerald-400";
      case "traveling":
        return "bg-accent/10 text-accent";
    }
  };

  const getStatusLabel = (status: Client["status"]) => {
    switch (status) {
      case "lead":
        return "Lead";
      case "negotiating":
        return "Negociando";
      case "confirmed":
        return "Confirmado";
      case "traveling":
        return "Viajando";
    }
  };

  const handleViewAll = () => {
    navigate("/clientes");
  };

  const handleClientClick = (clientId: string) => {
    navigate(`/clientes/${clientId}`);
  };

  return (
    <div className={cn("surface-card rounded-xl p-5", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-foreground">Clientes Mais Valiosos</h3>
        <button 
          className="text-xs text-accent hover:underline"
          onClick={handleViewAll}
        >
          Ver todos
        </button>
      </div>
      <div className="space-y-2">
        {clients.map((client) => (
          <div
            key={client.id}
            onClick={() => handleClientClick(client.id)}
            className={cn(
              "flex items-center justify-between p-3 rounded-lg cursor-pointer",
              "bg-secondary hover:bg-surface-hover transition-colors group"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-foreground">
                {client.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{client.name}</p>
                <p className="text-xs text-muted-foreground">{client.destination}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "px-2 py-1 rounded text-xs font-medium",
                  getStatusColor(client.status)
                )}
              >
                {getStatusLabel(client.status)}
              </span>
              <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
