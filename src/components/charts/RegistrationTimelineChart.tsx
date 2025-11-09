import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Asset } from "@/types/asset";
import { format, subDays, startOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RegistrationTimelineChartProps {
  assets: Asset[];
  days?: number;
}

export const RegistrationTimelineChart = ({ assets, days = 30 }: RegistrationTimelineChartProps) => {
  const today = new Date();
  const dateRange = Array.from({ length: days }, (_, i) => {
    const date = subDays(today, days - 1 - i);
    return startOfDay(date);
  });

  const data = dateRange.map(date => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const count = assets.filter(asset => {
      const assetDate = format(new Date(asset.created_at), 'yyyy-MM-dd');
      return assetDate === dateStr;
    }).length;

    return {
      date: format(date, 'dd/MM', { locale: ptBR }),
      count,
    };
  });

  const chartConfig = {
    count: {
      label: "Cadastros",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <Card className="glass-light">
      <CardHeader>
        <CardTitle>Timeline de Cadastros</CardTitle>
        <CardDescription>Ativos cadastrados nos últimos {days} dias</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: "hsl(var(--muted-foreground))" }}
              />
              <YAxis 
                tick={{ fill: "hsl(var(--muted-foreground))" }}
                allowDecimals={false}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="hsl(var(--primary))" 
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))", r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};