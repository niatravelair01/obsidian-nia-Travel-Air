import { useState } from "react";
import { Search, ChevronRight, Plus, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useClients, formatCurrency } from "@/hooks/useClients";
import type { Client } from "@/hooks/useClients";

const getStatusConfig = (status: string) => {
  switch (status) {
    case "negociacao":
      return { label: "Negociando", color: "bg-status-warning/15 text-status-warning" };
    case "atendimento":
      return { label: "Atendimento", color: "bg-status-info/15 text-status-info" };
    case "pos-venda":
      return { label: "Pós-venda", color: "bg-status-success/15 text-status-success" };
    case "lead":
      return { label: "Lead", color: "bg-muted text-muted-foreground" };
    case "inativo":
      return { label: "Inativo", color: "bg-destructive/15 text-destructive" };
    default:
      return { label: status, color: "bg-muted text-muted-foreground" };
  }
};

type Temperature = "quente" | "morno" | "frio";

const getTemperature = (client: Client): Temperature => {
  if (!client.last_interaction) return "frio";
  const days = Math.floor(
    (Date.now() - new Date(client.last_interaction).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (days <= 2) return "quente";
  if (days <= 7) return "morno";
  return "frio";
};

const temperatureConfig: Record<Temperature, { label: string; dot: string }> = {
  quente: { label: "Quente", dot: "bg-red-500" },
  morno: { label: "Morno", dot: "bg-amber-500" },
  frio: { label: "Frio", dot: "bg-blue-400" },
};

const sensitivityLabel: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
};

const getLastContactDays = (client: Client) => {
  if (!client.last_interaction) return null;
  return Math.floor(
    (Date.now() - new Date(client.last_interaction).getTime()) / (1000 * 60 * 60 * 24)
  );
};

export function MobileClients() {
  const { clients, isLoading } = useClients();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredClients = clients.filter(
    (client) =>
      client.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.destination || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (client.email || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedClients = [...filteredClients].sort((a, b) => {
    const order: Record<Temperature, number> = { quente: 0, morno: 1, frio: 2 };
    return order[getTemperature(a)] - order[getTemperature(b)];
  });

  return (
    <div className="px-2.5 py-1.5 space-y-1">
      <div className="flex items-baseline justify-between">
        <h1 className="text-sm font-semibold text-foreground">Clientes</h1>
        <span className="text-[10px] text-muted-foreground">{clients.length} total</span>
      </div>

      <div className="relative">
        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" />
        <Input
          placeholder="Buscar cliente..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-7 h-7 text-xs"
        />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-accent" />
        </div>
      ) : (
        <div className="space-y-px">
          {sortedClients.map((client) => {
            const statusConfig = getStatusConfig(client.status);
            const temp = getTemperature(client);
            const tempConf = temperatureConfig[temp];
            const days = getLastContactDays(client);

            return (
              <Link key={client.id} to={`/clientes/${client.id}`}>
                <div className="flex items-start gap-1.5 px-2 py-[6px] rounded border border-border bg-card hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0 space-y-[2px]">
                    {/* L1: Nome + Valor */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", tempConf.dot)} />
                        <p className="text-[11px] font-semibold text-foreground truncate">{client.name}</p>
                      </div>
                      <span className="text-[11px] font-semibold text-foreground flex-shrink-0 tabular-nums">
                        {formatCurrency(client.average_budget)}
                      </span>
                    </div>
                    {/* L2: Destino + Status */}
                    <div className="flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground truncate">{client.destination || "—"}</span>
                      <span className={cn("text-[8px] px-1 py-px rounded-full leading-none font-medium flex-shrink-0", statusConfig.color)}>
                        {statusConfig.label}
                      </span>
                    </div>
                    {/* L3: Perfil + Sensibilidade + Ticket */}
                    <div className="flex items-center gap-1.5 text-[8px] text-muted-foreground">
                      {client.ticket_type && (
                        <span className="truncate">{client.ticket_type.charAt(0).toUpperCase()}{client.ticket_type.slice(1)}</span>
                      )}
                      {client.price_sensitivity && (
                        <>
                          <span>•</span>
                          <span>Sens. {sensitivityLabel[client.price_sensitivity] || client.price_sensitivity}</span>
                        </>
                      )}
                      {client.valor_lifetime ? (
                        <>
                          <span>•</span>
                          <span className="tabular-nums">LTV {formatCurrency(client.valor_lifetime)}</span>
                        </>
                      ) : null}
                    </div>
                    {/* L4: Último contato */}
                    <div className="text-[8px] text-muted-foreground/70">
                      {days !== null ? (
                        days === 0 ? "Contato hoje" : `Último contato: ${days}d atrás`
                      ) : "Sem contato registrado"}
                    </div>
                  </div>
                  <ChevronRight className="h-3 w-3 text-muted-foreground/40 flex-shrink-0 mt-0.5" />
                </div>
              </Link>
            );
          })}

          {sortedClients.length === 0 && (
            <div className="text-center py-3 text-muted-foreground">
              <p className="text-[10px]">Nenhum cliente encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
