import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Asset, SECTORS, CONSERVATION_STATES } from "@/types/asset";
import { Badge } from "@/components/ui/badge";

interface ConservationHeatmapChartProps {
  assets: Asset[];
}

export const ConservationHeatmapChart = ({ assets }: ConservationHeatmapChartProps) => {
  const getCount = (sector: string, state: string) => {
    return assets.filter(a => a.sector === sector && a.conservation_state === state).length;
  };

  const getMaxCount = () => {
    let max = 0;
    SECTORS.forEach(sector => {
      CONSERVATION_STATES.forEach(state => {
        const count = getCount(sector, state);
        if (count > max) max = count;
      });
    });
    return max;
  };

  const maxCount = getMaxCount();

  const getIntensity = (count: number) => {
    if (maxCount === 0) return 0;
    return count / maxCount;
  };

  const getColorClass = (state: string, intensity: number) => {
    if (intensity === 0) return 'bg-muted/20';
    
    const alpha = Math.max(0.3, intensity);
    switch (state) {
      case 'Novo':
        return `bg-primary/[${alpha}]`;
      case 'Bom':
        return `bg-secondary/[${alpha}]`;
      case 'Regular':
        return `bg-accent/[${alpha}]`;
      case 'Ruim':
        return `bg-destructive/[${alpha}]`;
      default:
        return `bg-muted/[${alpha}]`;
    }
  };

  return (
    <Card className="glass-light">
      <CardHeader>
        <CardTitle>Mapa de Conservação por Setor</CardTitle>
        <CardDescription>Visualização da distribuição de estados de conservação</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-4 text-xs text-muted-foreground mb-4">
            {CONSERVATION_STATES.map(state => (
              <Badge key={state} variant="outline" className="text-xs">
                {state}
              </Badge>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-sm font-medium text-muted-foreground p-2 border-b border-border">
                    Setor
                  </th>
                  {CONSERVATION_STATES.map(state => (
                    <th key={state} className="text-center text-xs font-medium text-muted-foreground p-2 border-b border-border">
                      {state}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {SECTORS.map(sector => (
                  <tr key={sector} className="border-b border-border/50">
                    <td className="text-sm font-medium text-foreground p-2">
                      {sector}
                    </td>
                    {CONSERVATION_STATES.map(state => {
                      const count = getCount(sector, state);
                      const intensity = getIntensity(count);
                      return (
                        <td 
                          key={state} 
                          className="text-center p-2"
                        >
                          <div 
                            className={`
                              h-12 w-full rounded flex items-center justify-center
                              text-sm font-medium transition-all hover:scale-105
                              ${count > 0 ? getColorClass(state, intensity) : 'bg-muted/20'}
                            `}
                            style={{
                              opacity: count > 0 ? Math.max(0.4, intensity) : 0.2
                            }}
                          >
                            {count > 0 ? count : ''}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};