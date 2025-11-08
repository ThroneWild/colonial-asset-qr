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
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">Top 10 Ativos por Valor</h3>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Item Nº</TableHead>
              <TableHead>Descrição</TableHead>
              <TableHead>Setor</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Valor</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {topAssets.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nenhum ativo com valor cadastrado
                </TableCell>
              </TableRow>
            ) : (
              topAssets.map((asset) => (
                <TableRow key={asset.id}>
                  <TableCell className="font-medium">{asset.item_number}</TableCell>
                  <TableCell className="max-w-[300px] truncate">{asset.description}</TableCell>
                  <TableCell>{asset.sector}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{asset.conservation_state}</Badge>
                  </TableCell>
                  <TableCell className="text-right font-semibold">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.evaluation_value || 0)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};