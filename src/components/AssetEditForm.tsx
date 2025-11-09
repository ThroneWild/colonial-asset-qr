import { useState, useEffect } from 'react';
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
import { Asset, SECTORS, ASSET_GROUPS, CONSERVATION_STATES } from '@/types/asset';
import { Loader2, Upload, X, FileText } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AssetEditFormProps {
  asset: Asset;
  onSubmit: (id: string, data: Partial<Asset>) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AssetEditForm = ({ asset, onSubmit, onCancel, isLoading }: AssetEditFormProps) => {
  const [formData, setFormData] = useState({
    description: asset.description,
    sector: asset.sector,
    asset_group: asset.asset_group,
    conservation_state: asset.conservation_state,
    brand_model: asset.brand_model || '',
    evaluation_value: asset.evaluation_value || undefined,
    invoice_url: asset.invoice_url || null,
  });
  const [uploading, setUploading] = useState(false);
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setInvoiceFile(file);
    setUploading(true);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${asset.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('invoices')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('invoices')
        .getPublicUrl(filePath);

      setFormData({ ...formData, invoice_url: filePath });
      toast.success('Nota fiscal anexada com sucesso!');
    } catch (error) {
      console.error('Erro ao fazer upload:', error);
      toast.error('Erro ao anexar nota fiscal');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveInvoice = async () => {
    if (formData.invoice_url) {
      try {
        const { error } = await supabase.storage
          .from('invoices')
          .remove([formData.invoice_url]);

        if (error) throw error;
        
        setFormData({ ...formData, invoice_url: null });
        setInvoiceFile(null);
        toast.success('Nota fiscal removida');
      } catch (error) {
        console.error('Erro ao remover arquivo:', error);
        toast.error('Erro ao remover nota fiscal');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(asset.id, formData);
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

      <div className="space-y-2">
        <Label htmlFor="invoice">Nota Fiscal</Label>
        {formData.invoice_url ? (
          <div className="flex items-center gap-2 p-3 border border-border rounded-lg bg-muted/30">
            <FileText className="h-5 w-5 text-primary" />
            <span className="text-sm flex-1 text-foreground">Nota fiscal anexada</span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemoveInvoice}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Input
              id="invoice"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileUpload}
              disabled={uploading}
              className="cursor-pointer"
            />
            {uploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <Loader2 className="h-4 w-4 animate-spin" />
              </div>
            )}
          </div>
        )}
        <p className="text-xs text-muted-foreground">
          Formatos aceitos: PDF, JPG, PNG (máx. 10MB)
        </p>
      </div>

      <div className="flex gap-3 pt-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Salvar Alterações
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancelar
        </Button>
      </div>
    </form>
  );
};