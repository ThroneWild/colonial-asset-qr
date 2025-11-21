import { useEffect, useState } from 'react';
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
import { DatePicker } from '@/components/ui/date-picker';
import { AssetFormData, SECTORS, ASSET_GROUPS, CONSERVATION_STATES } from '@/types/asset';
import {
  MAINTENANCE_FREQUENCIES,
  MAINTENANCE_STATUSES,
  MAINTENANCE_TYPES,
  MAINTENANCE_RESPONSIBLES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_CRITICALITIES,
} from '@/types/maintenance';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { toast } from 'sonner';
import { addDays, parseISO } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

const assetSchema = z.object({
  description: z.string().trim().min(3, 'Descrição deve ter no mínimo 3 caracteres').max(500, 'Descrição deve ter no máximo 500 caracteres'),
  sector: z.string().trim().min(2, 'Selecione um setor').max(100),
  asset_group: z.string().trim().min(2, 'Selecione um grupo').max(100),
  conservation_state: z.enum(['Novo', 'Bom', 'Regular', 'Ruim']),
  brand_model: z.string().trim().max(200, 'Marca/Modelo deve ter no máximo 200 caracteres').optional().or(z.literal('')),
  evaluation_value: z.number().positive('Valor deve ser positivo').max(9999999.99, 'Valor muito alto').optional(),
  maintenance_frequency: z.string().optional(),
  maintenance_custom_interval: z.number().optional().nullable(),
  last_maintenance_date: z.string().optional().nullable(),
  next_maintenance_date: z.string().optional().nullable(),
  maintenance_type: z.string().optional().nullable(),
  maintenance_responsible: z.string().optional().nullable(),
  maintenance_notes: z.string().max(1000, 'Observações muito longas').optional().nullable(),
  maintenance_status: z.string().optional().nullable(),
  maintenance_priority: z.string().optional().nullable(),
  maintenance_criticality: z.string().optional().nullable(),
  maintenance_cost: z.number().optional().nullable(),
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
    location_type: 'departamento',
    apartment_number: '',
    asset_group: '',
    conservation_state: 'Bom',
    brand_model: '',
    evaluation_value: undefined,
    maintenance_frequency: null,
    maintenance_custom_interval: null,
    last_maintenance_date: null,
    next_maintenance_date: null,
    maintenance_type: null,
    maintenance_responsible: null,
    maintenance_notes: null,
    maintenance_status: 'Pendente',
    maintenance_priority: 'Média',
    maintenance_criticality: 'Média',
    maintenance_cost: null,
  });
  const [apartmentOptions, setApartmentOptions] = useState<string[]>([]);
  const [lastMaintenanceDate, setLastMaintenanceDate] = useState<Date | null>(null);

  useEffect(() => {
    const loadApartments = async () => {
      const { data } = await supabase
        .from('assets')
        .select('apartment_number')
        .not('apartment_number', 'is', null)
        .order('apartment_number');
      
      if (data) {
        const unique = [...new Set(data.map(d => d.apartment_number).filter(Boolean))] as string[];
        setApartmentOptions(unique);
      }
    };
    loadApartments();
  }, []);

  useEffect(() => {
    if (!formData.last_maintenance_date || !formData.maintenance_frequency) {
      setFormData((prev) =>
        prev.next_maintenance_date !== null
          ? { ...prev, next_maintenance_date: null }
          : prev,
      );
      return;
    }

    let interval = 0;
    if (formData.maintenance_frequency === 'custom') {
      interval = formData.maintenance_custom_interval || 0;
    } else {
      interval = parseInt(formData.maintenance_frequency, 10);
    }

    if (!interval) {
      setFormData((prev) =>
        prev.next_maintenance_date !== null
          ? { ...prev, next_maintenance_date: null }
          : prev,
      );
      return;
    }

    const lastDate = parseISO(formData.last_maintenance_date);
    const nextDate = addDays(lastDate, interval);
    const nextIso = nextDate.toISOString();

    setFormData((prev) =>
      prev.next_maintenance_date === nextIso
        ? prev
        : { ...prev, next_maintenance_date: nextIso },
    );
  }, [formData.last_maintenance_date, formData.maintenance_frequency, formData.maintenance_custom_interval]);

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
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm sm:text-base">Descrição *</Label>
        <Textarea
          id="description"
          placeholder="Ex: Mesa de escritório em madeira"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          required
          rows={3}
          className="text-sm sm:text-base"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location_type">Tipo de Localização *</Label>
          <Select
            value={formData.location_type}
            onValueChange={(value: 'departamento' | 'apartamento') => 
              setFormData({ ...formData, location_type: value, apartment_number: value === 'departamento' ? '' : formData.apartment_number })
            }
            required
          >
            <SelectTrigger id="location_type">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="departamento">Departamento</SelectItem>
              <SelectItem value="apartamento">Apartamento/UH</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {formData.location_type === 'apartamento' && (
          <div className="space-y-2">
            <Label htmlFor="apartment_number">Número do Apartamento *</Label>
            <Input
              id="apartment_number"
              placeholder="Ex: 601"
              value={formData.apartment_number}
              onChange={(e) => setFormData({ ...formData, apartment_number: e.target.value })}
              required
              list="apartment-options"
            />
            <datalist id="apartment-options">
              {apartmentOptions.map((apt) => (
                <option key={apt} value={apt} />
              ))}
            </datalist>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="conservation_state">Estado de Conservação *</Label>
        <Select
          value={formData.conservation_state}
          onValueChange={(value: AssetFormData['conservation_state']) =>
            setFormData({ ...formData, conservation_state: value })
          }
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
          value={formData.evaluation_value ?? ''}
          onChange={(e) =>
            setFormData({
              ...formData,
              evaluation_value: e.target.value ? parseFloat(e.target.value) : undefined,
            })
          }
        />
      </div>

      <div className="pt-4">
        <h3 className="text-lg font-semibold">Manutenção Preventiva</h3>
        <p className="text-sm text-muted-foreground">
          Configure a rotina de manutenção preventiva deste item e mantenha o controle dos prazos.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Frequência de manutenção</Label>
          <Select
            value={formData.maintenance_frequency ?? ''}
            onValueChange={(value) =>
              setFormData({
                ...formData,
                maintenance_frequency: value as any,
                maintenance_custom_interval: value === 'custom' ? formData.maintenance_custom_interval : null,
              })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent>
              {MAINTENANCE_FREQUENCIES.map((frequency) => (
                <SelectItem key={frequency.value} value={frequency.value}>
                  {frequency.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {formData.maintenance_frequency === 'custom' && (
          <div className="space-y-2">
            <Label>Intervalo personalizado (dias)</Label>
            <Input
              type="number"
              min={1}
              value={formData.maintenance_custom_interval ?? ''}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  maintenance_custom_interval: e.target.value ? parseInt(e.target.value, 10) : null,
                })
              }
            />
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Última manutenção</Label>
          <DatePicker
            value={lastMaintenanceDate}
            onChange={(date) => {
              setLastMaintenanceDate(date ?? null);
              setFormData({
                ...formData,
                last_maintenance_date: date ? date.toISOString() : null,
              });
            }}
          />
        </div>
        <div className="space-y-2">
          <Label>Próxima manutenção (automática)</Label>
          <DatePicker
            value={formData.next_maintenance_date ? new Date(formData.next_maintenance_date) : null}
            onChange={(date) =>
              setFormData({
                ...formData,
                next_maintenance_date: date ? date.toISOString() : null,
              })
            }
            placeholder="Defina frequência e última manutenção"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Tipo de manutenção</Label>
          <Select
            value={formData.maintenance_type ?? ''}
            onValueChange={(value) => setFormData({ ...formData, maintenance_type: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent>
              {MAINTENANCE_TYPES.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Responsável</Label>
          <Select
            value={formData.maintenance_responsible ?? ''}
            onValueChange={(value) => setFormData({ ...formData, maintenance_responsible: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione a equipe" />
            </SelectTrigger>
            <SelectContent>
              {MAINTENANCE_RESPONSIBLES.map((responsible) => (
                <SelectItem key={responsible} value={responsible}>
                  {responsible}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Status da manutenção</Label>
          <Select
            value={formData.maintenance_status ?? ''}
            onValueChange={(value) => setFormData({ ...formData, maintenance_status: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione o status" />
            </SelectTrigger>
            <SelectContent>
              {MAINTENANCE_STATUSES.map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Prioridade</Label>
          <Select
            value={formData.maintenance_priority ?? ''}
            onValueChange={(value) => setFormData({ ...formData, maintenance_priority: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {MAINTENANCE_PRIORITIES.map((priority) => (
                <SelectItem key={priority} value={priority}>
                  {priority}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Criticidade</Label>
          <Select
            value={formData.maintenance_criticality ?? ''}
            onValueChange={(value) => setFormData({ ...formData, maintenance_criticality: value as any })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent>
              {MAINTENANCE_CRITICALITIES.map((criticality) => (
                <SelectItem key={criticality} value={criticality}>
                  {criticality}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Custo estimado (R$)</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={formData.maintenance_cost ?? ''}
            onChange={(e) =>
              setFormData({
                ...formData,
                maintenance_cost: e.target.value ? parseFloat(e.target.value) : null,
              })
            }
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label>Observações de manutenção</Label>
        <Textarea
          placeholder="Ex: Verificar níveis de óleo e substituir filtros"
          value={formData.maintenance_notes ?? ''}
          onChange={(e) => setFormData({ ...formData, maintenance_notes: e.target.value })}
          rows={3}
        />
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1 text-sm sm:text-base">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Cadastrar Ativo
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading} className="text-sm sm:text-base">
          Cancelar
        </Button>
      </div>
    </form>
  );
};
