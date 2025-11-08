import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { AssetFilters, SECTORS, ASSET_GROUPS, CONSERVATION_STATES } from '@/types/asset';
import { Filter, X } from 'lucide-react';

interface AdvancedFiltersProps {
  filters: AssetFilters;
  onFiltersChange: (filters: AssetFilters) => void;
}

export const AdvancedFilters = ({ filters, onFiltersChange }: AdvancedFiltersProps) => {
  const [open, setOpen] = useState(false);

  const activeFiltersCount = [
    filters.sectors && filters.sectors.length > 0,
    filters.groups && filters.groups.length > 0,
    filters.conservationStates && filters.conservationStates.length > 0,
    filters.valueMin !== undefined,
    filters.valueMax !== undefined,
    filters.sortBy && filters.sortBy !== 'date_desc',
  ].filter(Boolean).length;

  const handleClearFilters = () => {
    onFiltersChange({
      searchTerm: filters.searchTerm,
      sectors: [],
      groups: [],
      conservationStates: [],
      valueMin: undefined,
      valueMax: undefined,
      dateFrom: undefined,
      dateTo: undefined,
      sortBy: 'date_desc',
    });
  };

  const toggleArrayFilter = (key: 'sectors' | 'groups' | 'conservationStates', value: string) => {
    const current = filters[key] || [];
    const updated = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    onFiltersChange({ ...filters, [key]: updated });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filtros Avançados
          {activeFiltersCount > 0 && (
            <Badge variant="default" className="ml-2 h-5 w-5 p-0 flex items-center justify-center">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Filtros Avançados</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 py-6">
          {/* Ordenação */}
          <div className="space-y-2">
            <Label>Ordenar por</Label>
            <Select value={filters.sortBy || 'date_desc'} onValueChange={(value: any) => onFiltersChange({ ...filters, sortBy: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date_desc">Mais recente</SelectItem>
                <SelectItem value="date_asc">Mais antigo</SelectItem>
                <SelectItem value="value_desc">Maior valor</SelectItem>
                <SelectItem value="value_asc">Menor valor</SelectItem>
                <SelectItem value="alpha">A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Setores */}
          <div className="space-y-3">
            <Label>Setores</Label>
            {SECTORS.map(sector => (
              <div key={sector} className="flex items-center space-x-2">
                <Checkbox
                  id={`sector-${sector}`}
                  checked={filters.sectors?.includes(sector)}
                  onCheckedChange={() => toggleArrayFilter('sectors', sector)}
                />
                <label htmlFor={`sector-${sector}`} className="text-sm cursor-pointer">
                  {sector}
                </label>
              </div>
            ))}
          </div>

          {/* Grupos */}
          <div className="space-y-3">
            <Label>Grupos</Label>
            {ASSET_GROUPS.map(group => (
              <div key={group} className="flex items-center space-x-2">
                <Checkbox
                  id={`group-${group}`}
                  checked={filters.groups?.includes(group)}
                  onCheckedChange={() => toggleArrayFilter('groups', group)}
                />
                <label htmlFor={`group-${group}`} className="text-sm cursor-pointer">
                  {group}
                </label>
              </div>
            ))}
          </div>

          {/* Estado de Conservação */}
          <div className="space-y-3">
            <Label>Estado de Conservação</Label>
            {CONSERVATION_STATES.map(state => (
              <div key={state} className="flex items-center space-x-2">
                <Checkbox
                  id={`state-${state}`}
                  checked={filters.conservationStates?.includes(state)}
                  onCheckedChange={() => toggleArrayFilter('conservationStates', state)}
                />
                <label htmlFor={`state-${state}`} className="text-sm cursor-pointer">
                  {state}
                </label>
              </div>
            ))}
          </div>

          {/* Faixa de Valor */}
          <div className="space-y-3">
            <Label>Faixa de Valor (R$)</Label>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Mínimo"
                  value={filters.valueMin || ''}
                  onChange={(e) => onFiltersChange({ 
                    ...filters, 
                    valueMin: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                />
              </div>
              <div>
                <Input
                  type="number"
                  placeholder="Máximo"
                  value={filters.valueMax || ''}
                  onChange={(e) => onFiltersChange({ 
                    ...filters, 
                    valueMax: e.target.value ? parseFloat(e.target.value) : undefined 
                  })}
                />
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="flex gap-2 pt-4">
            <Button variant="outline" onClick={handleClearFilters} className="flex-1">
              <X className="h-4 w-4 mr-2" />
              Limpar
            </Button>
            <Button onClick={() => setOpen(false)} className="flex-1">
              Aplicar
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};