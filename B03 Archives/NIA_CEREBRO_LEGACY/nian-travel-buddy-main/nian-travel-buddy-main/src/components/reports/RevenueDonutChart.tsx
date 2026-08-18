import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, DollarSign } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NiaAvatar } from "@/components/nia/NiaAvatar";
import { formatCurrency } from "@/hooks/useClients";

interface RevenueDonutChartProps {
  confirmedRevenue: number;
  negotiatingRevenue: number;
  atRiskRevenue: number;
}

export const RevenueDonutChart = ({
  confirmedRevenue,
  negotiatingRevenue,
  atRiskRevenue,
}: RevenueDonutChartProps) => {
  const navigate = useNavigate();
  
  const data = useMemo(() => [
    { name: "Confirmada", value: confirmedRevenue, color: "hsl(142, 71%, 45%)" },
    { name: "Em negociação", value: negotiatingRevenue, color: "hsl(45, 93%, 47%)" },
    { name: "Em risco", value: atRiskRevenue, color: "hsl(0, 72%, 51%)" },
  ], [confirmedRevenue, negotiatingRevenue, atRiskRevenue]);
  
  const total = confirmedRevenue + negotiatingRevenue + atRiskRevenue;
  const negotiatingPercent = Math.round((negotiatingRevenue / total) * 100);
  
  const handleClick = () => {
    navigate("/orcamentos?status=enviado&sortBy=value");
  };
  
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-accent" />
          <CardTitle className="text-base">Distribuição do Dinheiro</CardTitle>
        </div>
        <CardDescription className="text-xs">Composição da receita atual</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-32 h-32">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={55}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{
                    backgroundColor: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex-1 space-y-2">
            {data.map((item, index) => (
              <div key={index} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-2.5 h-2.5 rounded-full" 
                    style={{ backgroundColor: item.color }} 
                  />
                  <span className="text-muted-foreground">{item.name}</span>
                </div>
                <span className="font-medium text-foreground">
                  {formatCurrency(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* NIA Interpretation */}
        <div className="flex items-start gap-2 p-3 bg-secondary/50 rounded-lg">
          <NiaAvatar size="xs" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {negotiatingPercent > 40 
              ? "Grande parte do faturamento está concentrada em negociações ainda não concluídas."
              : negotiatingPercent > 20
              ? "Boa distribuição de receita, mas atenção aos orçamentos em negociação."
              : "Receita bem consolidada, com baixa dependência de negociações pendentes."}
          </p>
        </div>
        
        <Button 
          variant="ghost" 
          size="sm" 
          className="w-full text-accent hover:text-accent/80"
          onClick={handleClick}
        >
          Ver orçamentos relacionados
          <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </CardContent>
    </Card>
  );
};
