import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';

interface AssetsByConservationChartProps {
  data: Record<string, number>;
}

const CONSERVATION_COLORS: Record<string, string> = {
  'Novo': 'hsl(157 60% 40%)',
  'Bom': 'hsl(157 50% 50%)',
  'Regular': 'hsl(45 100% 50%)',
  'Ruim': 'hsl(0 84% 60%)',
};

export const AssetsByConservationChart = ({ data }: AssetsByConservationChartProps) => {
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    quantidade: value,
    fill: CONSERVATION_COLORS[name] || 'hsl(var(--primary))',
  }));

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Estado de Conservação</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="name" stroke="hsl(var(--foreground))" />
          <YAxis stroke="hsl(var(--foreground))" />
          <Tooltip
            contentStyle={{
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Bar dataKey="quantidade" radius={[8, 8, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  );
};