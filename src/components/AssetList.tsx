import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Asset } from '@/types/asset';
import { Eye, Search } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SECTORS, ASSET_GROUPS } from '@/types/asset';

interface AssetListProps {
  assets: Asset[];
  onViewAsset: (asset: Asset) => void;
}

export const AssetList = ({ assets, onViewAsset }: AssetListProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sectorFilter, setSectorFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      asset.item_number.toString().includes(searchTerm);
    const matchesSector = sectorFilter === 'all' || asset.sector === sectorFilter;
    const matchesGroup = groupFilter === 'all' || asset.asset_group === groupFilter;
    return matchesSearch && matchesSector && matchesGroup;
  });

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
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Buscar por descrição ou número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={sectorFilter} onValueChange={setSectorFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filtrar por setor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os setores</SelectItem>
            {SECTORS.map((sector) => (
              <SelectItem key={sector} value={sector}>
                {sector}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={groupFilter} onValueChange={setGroupFilter}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue placeholder="Filtrar por grupo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os grupos</SelectItem>
            {ASSET_GROUPS.map((group) => (
              <SelectItem key={group} value={group}>
                {group}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAssets.map((asset) => (
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
              <Button
                size="icon"
                variant="ghost"
                onClick={() => onViewAsset(asset)}
                className="h-9 w-9 hover:bg-primary/10 hover:text-primary transition-smooth"
              >
                <Eye className="h-5 w-5" />
              </Button>
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
          </Card>
        ))}
      </div>

      {filteredAssets.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Nenhum ativo encontrado</p>
        </div>
      )}
    </div>
  );
};
