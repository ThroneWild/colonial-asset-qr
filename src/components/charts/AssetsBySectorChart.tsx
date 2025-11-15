import { Card } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface AssetsBySectorChartProps {
  data: Record<string, number>;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--accent))',
  'hsl(var(--secondary))',
  'hsl(157 60% 40%)',
  'hsl(157 50% 50%)',
  'hsl(157 40% 60%)',
  'hsl(157 30% 70%)',
  'hsl(157 20% 80%)',
];

export const AssetsBySectorChart = ({ data }: AssetsBySectorChartProps) => {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  if (chartData.length === 0) {
    return (
      <Card className="p-6 flex items-center justify-center text-sm text-muted-foreground">
        Sem registros para o período selecionado.
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Ativos por Setor</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend
            wrapperStyle={{ color: 'hsl(var(--foreground))' }}
            formatter={(value) => <span className="text-sm text-foreground font-medium">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </Card>
  );
};