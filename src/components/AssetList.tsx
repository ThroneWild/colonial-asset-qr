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
  const getConservationColor = (state: string) => {
    switch (state) {
      case 'Novo':
        return 'bg-primary text-primary-foreground';
      case 'Bom':
        return 'bg-secondary text-secondary-foreground';
      case 'Regular':
        return 'bg-accent text-accent-foreground';
      case 'Ruim':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <Card key={asset.id} className="p-6 shadow-card hover:shadow-hover transition-smooth border-0 bg-card group">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <span className="text-xs font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full inline-block mb-2">
                  Item #{asset.item_number}
                </span>
                <h3 className="font-semibold text-xl text-foreground mt-2 group-hover:text-primary transition-smooth">
                  {asset.description}
                </h3>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="text-xs font-medium border-primary/20 bg-primary/5">
                  {asset.sector}
                </Badge>
                <Badge variant="outline" className="text-xs font-medium border-primary/20 bg-primary/5">
                  {asset.asset_group}
                </Badge>
              </div>
              <Badge className={`text-xs font-medium ${getConservationColor(asset.conservation_state)}`}>
                {asset.conservation_state}
              </Badge>
              {asset.brand_model && (
                <p className="text-sm text-muted-foreground font-medium pt-2 border-t border-border">{asset.brand_model}</p>
              )}
              {asset.evaluation_value && (
                <p className="text-lg font-bold text-primary mt-2">
                  R$ {asset.evaluation_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
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