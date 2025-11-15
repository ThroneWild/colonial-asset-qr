import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Asset } from "@/types/asset";

interface ValueDistributionChartProps {
  assets: Asset[];
}

export const ValueDistributionChart = ({ assets }: ValueDistributionChartProps) => {
  const data = assets.reduce((acc, asset) => {
    const sector = asset.sector;
    const value = asset.evaluation_value || 0;
    
    const existing = acc.find(item => item.sector === sector);
    if (existing) {
      existing.value += value;
    } else {
      acc.push({ sector, value });
    }
    return acc;
  }, [] as Array<{ sector: string; value: number }>);

  const sortedData = data.sort((a, b) => b.value - a.value);

  const chartConfig = {
    value: {
      label: "Valor Total",
      color: "hsl(var(--primary))",
    },
  };

  if (sortedData.length === 0) {
    return (
      <Card className="glass-light p-6 flex items-center justify-center text-sm text-muted-foreground">
        Sem registros para o período selecionado.
      </Card>
    );
  }

  return (
    <Card className="glass-light">
      <CardHeader>
        <CardTitle>Distribuição de Valor por Setor</CardTitle>
        <CardDescription>Valor total do patrimônio por setor</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="sector" 
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                angle={-45}
                textAnchor="end"
                height={100}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`}
              />
              <ChartTooltip 
                content={<ChartTooltipContent />}
                formatter={(value: number) => `R$ ${value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
              />
              <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};