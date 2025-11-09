import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AssetFormData, SECTORS, ASSET_GROUPS, CONSERVATION_STATES } from '@/types/asset';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';

const assetSchema = z.object({
  description: z.string().trim().min(3, 'Descrição deve ter no mínimo 3 caracteres').max(500, 'Descrição deve ter no máximo 500 caracteres'),
  sector: z.string().trim().min(2, 'Selecione um setor').max(100),
  asset_group: z.string().trim().min(2, 'Selecione um grupo').max(100),
  conservation_state: z.enum(['Novo', 'Bom', 'Regular', 'Ruim']),
  brand_model: z.string().trim().max(200, 'Marca/Modelo deve ter no máximo 200 caracteres').optional().or(z.literal('')),
  evaluation_value: z.number().positive('Valor deve ser positivo').max(9999999.99, 'Valor muito alto').optional(),
});

interface AssetFormProps {
  onSubmit: (data: AssetFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AssetForm = ({ onSubmit, onCancel, isLoading }: AssetFormProps) => {
  const [formData, setFormData] = useState<AssetFormData>({
    description: '',
    sector: '',
    asset_group: '',
    conservation_state: 'Bom',
    brand_model: '',
    evaluation_value: undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      assetSchema.parse(formData);
      await onSubmit(formData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        toast.error(firstError.message);
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="description">Descrição *</Label>
        <Textarea
          id="description"
          placeholder="Ex: Mesa de escritório em madeira"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={3}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="sector">Setor *</Label>
          <Select
            value={formData.sector}
            onValueChange={(value) => setFormData({ ...formData, sector: value })}
            required
          >
            <SelectTrigger id="sector">
              <SelectValue placeholder="Selecione o setor" />
            </SelectTrigger>
            <SelectContent>
              {SECTORS.map((sector) => (
                <SelectItem key={sector} value={sector}>
                  {sector}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="asset_group">Grupo *</Label>
          <Select
            value={formData.asset_group}
            onValueChange={(value) => setFormData({ ...formData, asset_group: value })}
            required
          >
            <SelectTrigger id="asset_group">
              <SelectValue placeholder="Selecione o grupo" />
            </SelectTrigger>
            <SelectContent>
              {ASSET_GROUPS.map((group) => (
                <SelectItem key={group} value={group}>
                  {group}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="conservation_state">Estado de Conservação *</Label>
        <Select
          value={formData.conservation_state}
          onValueChange={(value: any) => setFormData({ ...formData, conservation_state: value })}
          required
        >
          <SelectTrigger id="conservation_state">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CONSERVATION_STATES.map((state) => (
              <SelectItem key={state} value={state}>
                {state}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="brand_model">Marca/Modelo</Label>
        <Input
          id="brand_model"
          placeholder="Ex: Dell Inspiron 15"
          value={formData.brand_model}
          onChange={(e) => setFormData({ ...formData, brand_model: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="evaluation_value">Valor de Avaliação (R$)</Label>
        <Input
          id="evaluation_value"
          type="number"
          step="0.01"
          min="0"
          placeholder="Ex: 1500.00"
          value={formData.evaluation_value || ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              evaluation_value: e.target.value ? parseFloat(e.target.value) : undefined,
            })
          }
        />
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Cadastrar Ativo
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};
