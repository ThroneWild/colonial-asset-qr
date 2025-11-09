import { Asset } from '@/types/asset';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit } from 'lucide-react';

interface AssetListProps {
  assets: Asset[];
  onViewAsset: (asset: Asset) => void;
  onEditAsset?: (asset: Asset) => void;
}

export const AssetList = ({ assets, onViewAsset, onEditAsset }: AssetListProps) => {
  const getConservationBadge = (state: string) => {
    switch (state) {
      case 'Novo':
        return 'glass-excellent';
      case 'Bom':
        return 'glass-good';
      case 'Regular':
        return 'glass-fair';
      case 'Ruim':
        return 'glass-poor';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <Card key={asset.id} className="p-6 shadow-card hover:shadow-hover transition-smooth border-0 bg-card group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <Badge variant="glass-primary" className="mb-3">
                  Item #{asset.item_number}
                </Badge>
                <h3 className="font-semibold text-xl text-foreground group-hover:text-primary transition-smooth">
                  {asset.description}
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="glass-primary" className="text-xs font-medium">
                  {asset.sector}
                </Badge>
                <Badge variant="glass-primary" className="text-xs font-medium">
                  {asset.asset_group}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={getConservationBadge(asset.conservation_state)} className="text-xs font-semibold">
                  {asset.conservation_state}
                </Badge>
              </div>
              {asset.brand_model && (
                <p className="text-sm text-muted-foreground font-medium pt-2 border-t border-border">{asset.brand_model}</p>
              )}
              {asset.evaluation_value && (
                <div className="mt-3 pt-3 border-t border-border">
                  <Badge variant="glass-gold" className="text-sm font-bold">
                    R$ {asset.evaluation_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Badge>
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <Button onClick={() => onViewAsset(asset)} size="sm" className="flex-1">
                <Eye className="h-4 w-4 mr-2" />
                Visualizar
              </Button>
              {onEditAsset && (
                <Button onClick={() => onEditAsset(asset)} size="sm" variant="outline" className="flex-1">
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {assets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum ativo encontrado</p>
        </div>
      )}
    </div>
  );
};