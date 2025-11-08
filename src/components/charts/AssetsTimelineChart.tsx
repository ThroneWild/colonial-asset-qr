import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Asset } from '@/types/asset';
import { format, parseISO, startOfMonth } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AssetsTimelineChartProps {
  assets: Asset[];
}

export const AssetsTimelineChart = ({ assets }: AssetsTimelineChartProps) => {
  // Group assets by month
  const monthlyData = assets.reduce((acc, asset) => {
    const month = format(startOfMonth(parseISO(asset.created_at)), 'MMM yyyy', { locale: ptBR });
    acc[month] = (acc[month] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Convert to array and calculate cumulative
  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });

  let cumulative = 0;
  const chartData = sortedMonths.map(month => {
    cumulative += monthlyData[month];
    return {
      month,
      novos: monthlyData[month],
      total: cumulative,
    };
  });

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Evolução de Cadastros</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="month" stroke="hsl(var(--foreground))" />
          <YAxis stroke="hsl(var(--foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="novos"
            name="Novos Cadastros"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--primary))' }}
          />
          <Line
            type="monotone"
            dataKey="total"
            name="Total Acumulado"
            stroke="hsl(var(--accent))"
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--accent))' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </Card>
  );
};