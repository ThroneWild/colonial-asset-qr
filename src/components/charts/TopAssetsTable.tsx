import { Card } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Asset } from '@/types/asset';
import { Badge } from '@/components/ui/badge';

interface TopAssetsTableProps {
  assets: Asset[];
}

export const TopAssetsTable = ({ assets }: TopAssetsTableProps) => {
  const topAssets = [...assets]
    .filter(a => a.evaluation_value)
    .sort((a, b) => (b.evaluation_value || 0) - (a.evaluation_value || 0))
    .slice(0, 10);

  return (
    <Card className="p-4 md:p-6">
      <h3 className="text-base md:text-lg font-semibold mb-4">Top 10 Ativos por Valor</h3>
      <div className="overflow-x-auto -mx-4 md:mx-0">
        <div className="inline-block min-w-full align-middle">
          <div className="overflow-hidden rounded-md border">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px] md:w-[100px] whitespace-nowrap text-xs md:text-sm">Item Nº</TableHead>
              <TableHead className="min-w-[150px] md:min-w-[200px] text-xs md:text-sm">Descrição</TableHead>
              <TableHead className="min-w-[120px] text-xs md:text-sm">Setor</TableHead>
              <TableHead className="min-w-[100px] text-xs md:text-sm">Estado</TableHead>
              <TableHead className="text-right min-w-[100px] text-xs md:text-sm">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum ativo com valor cadastrado para o período selecionado
                </TableCell>
              </TableRow>
            ) : (
              topAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium text-xs md:text-sm whitespace-nowrap">{asset.item_number}</TableCell>
                  <TableCell className="max-w-[200px] md:max-w-[300px] truncate text-xs md:text-sm">{asset.description}</TableCell>
                  <TableCell className="text-xs md:text-sm">{asset.sector}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs whitespace-nowrap">{asset.conservation_state}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold text-xs md:text-sm whitespace-nowrap">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.evaluation_value || 0)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </Card>
  );
};