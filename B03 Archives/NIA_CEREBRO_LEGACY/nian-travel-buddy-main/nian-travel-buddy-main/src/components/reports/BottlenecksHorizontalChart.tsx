import { useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NiaAvatar } from "@/components/nia/NiaAvatar";

interface BottleneckData {
  name: string;
  value: number;
  route: string;
  filters?: string;
}

interface BottlenecksHorizontalChartProps {
  followupsAtrasados: number;
  orcamentosParados: number;
  posVendaPendente: number;
}

export const BottlenecksHorizontalChart = ({
  followupsAtrasados,
  orcamentosParados,
  posVendaPendente,
}: BottlenecksHorizontalChartProps) => {
  const navigate = useNavigate();
  
  const data: BottleneckData[] = useMemo(() => [
    { 
      name: "Follow-ups atrasados", 
      value: followupsAtrasados, 
      route: "/followups",
      filters: "?status=pendente&risk=alto"
    },
    { 
      name: "Orçamentos parados", 
      value: orcamentosParados, 
      route: "/orcamentos",
      filters: "?status=enviado&idle=5"
    },
    { 
      name: "Pós-venda pendente", 
      value: posVendaPendente, 
      route: "/clientes",
      filters: "?status=pos-venda"
    },
  ].sort((a, b) => b.value - a.value), [followupsAtrasados, orcamentosParados, posVendaPendente]);
  
  const maxValue = Math.max(...data.map(d => d.value));
  const topBottleneck = data[0];
  
  const getBarColor = (value: number) => {
    const percentage = (value / maxValue) * 100;
    if (percentage >= 80) return "hsl(0, 72%, 51%)";
    if (percentage >= 50) return "hsl(45, 93%, 47%)";
    return "hsl(217, 91%, 60%)";
  };
  
  const handleClick = () => {
    navigate("/gargalos");
  };
  
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <CardTitle className="text-base">Gargalos Operacionais</CardTitle>
        </div>
        <CardDescription className="text-xs">Onde o processo está travando</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-36">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={data} 
              layout="vertical"
              margin={{ top: 0, right: 30, left: 0, bottom: 0 }}
            >
              <XAxis 
                type="number" 
                hide 
                domain={[0, maxValue + 1]}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                width={130}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(value: number) => [`${value} itens`, "Quantidade"]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
              />
              <Bar 
                dataKey="value" 
                radius={[0, 4, 4, 0]}
                barSize={20}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* NIA Interpretation */}
        <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg">
          <NiaAvatar size="xs" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {topBottleneck.name === "Follow-ups atrasados"
              ? "Follow-ups são o principal ponto de travamento da operação no momento."
              : topBottleneck.name === "Orçamentos parados"
              ? "Orçamentos parados indicam possível perda de oportunidades."
              : "Pós-venda pendente pode impactar recorrência e indicações."}
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-accent hover:text-accent/80"
          onClick={handleClick}
        >
          Ver gargalos
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};
