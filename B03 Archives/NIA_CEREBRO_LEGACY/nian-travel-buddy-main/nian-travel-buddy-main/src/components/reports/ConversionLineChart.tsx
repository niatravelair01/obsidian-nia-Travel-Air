import { useMemo } from "react";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NiaAvatar } from "@/components/nia/NiaAvatar";

interface ConversionDataPoint {
  period: string;
  leadsToOrcamentos: number;
  orcamentosToVendas: number;
}

interface ConversionLineChartProps {
  data?: ConversionDataPoint[];
}

const defaultData: ConversionDataPoint[] = [
  { period: "Sem 1", leadsToOrcamentos: 65, orcamentosToVendas: 28 },
  { period: "Sem 2", leadsToOrcamentos: 72, orcamentosToVendas: 32 },
  { period: "Sem 3", leadsToOrcamentos: 68, orcamentosToVendas: 30 },
  { period: "Sem 4", leadsToOrcamentos: 58, orcamentosToVendas: 22 },
];

export const ConversionLineChart = ({ data = defaultData }: ConversionLineChartProps) => {
  const navigate = useNavigate();
  
  const trend = useMemo(() => {
    if (data.length < 2) return "stable";
    const lastTwo = data.slice(-2);
    const recentConversion = lastTwo[1].orcamentosToVendas;
    const previousConversion = lastTwo[0].orcamentosToVendas;
    
    if (recentConversion < previousConversion - 5) return "declining";
    if (recentConversion > previousConversion + 5) return "improving";
    return "stable";
  }, [data]);
  
  const handleClick = () => {
    navigate("/relatorios?tab=conversao");
  };
  
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-accent" />
          <CardTitle className="text-base">Conversão no Tempo</CardTitle>
        </div>
        <CardDescription className="text-xs">Evolução últimos 30 dias</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="h-40">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart 
              data={data}
              margin={{ top: 5, right: 10, left: -20, bottom: 0 }}
            >
              <XAxis 
                dataKey="period" 
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                axisLine={false}
                tickLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value: number, name: string) => [
                  `${value}%`,
                  name === "leadsToOrcamentos" ? "Leads → Orçamentos" : "Orçamentos → Vendas"
                ]}
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                  fontSize: "11px",
                }}
              />
              <Line 
                type="monotone" 
                dataKey="leadsToOrcamentos" 
                stroke="hsl(217, 91%, 60%)" 
                strokeWidth={2}
                dot={{ fill: "hsl(217, 91%, 60%)", strokeWidth: 0, r: 3 }}
                name="leadsToOrcamentos"
              />
              <Line 
                type="monotone" 
                dataKey="orcamentosToVendas" 
                stroke="hsl(142, 71%, 45%)" 
                strokeWidth={2}
                dot={{ fill: "hsl(142, 71%, 45%)", strokeWidth: 0, r: 3 }}
                name="orcamentosToVendas"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Leads → Orçamentos</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Orçamentos → Vendas</span>
          </div>
        </div>
        
        {/* NIA Interpretation */}
        <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg">
          <NiaAvatar size="xs" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {trend === "declining"
              ? "A conversão caiu nos últimos dias, indicando necessidade de ação comercial imediata."
              : trend === "improving"
              ? "Conversão em alta — continue mantendo o ritmo de atendimento atual."
              : "Conversão estável, mas sempre há espaço para otimização."}
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-accent hover:text-accent/80"
          onClick={handleClick}
        >
          Ver conversão detalhada
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};
