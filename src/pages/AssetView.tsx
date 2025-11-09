import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Asset, SECTORS } from '@/types/asset';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2, MapPin } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import logoPrize from '@/assets/logo-prize.png';

const AssetView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newSector, setNewSector] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAsset(id);
    }
  }, [id]);

  const fetchAsset = async (assetId: string) => {
    try {
      const { data, error } = await supabase
        .from('assets_public')
        .select('*')
        .eq('id', assetId)
        .maybeSingle();

      if (error) throw error;
      
      if (!data) {
        toast.error('Ativo não encontrado');
        navigate('/');
        return;
      }
      
      // Cast to Asset type (public view excludes user_id and modified_by which aren't displayed)
      setAsset(data as Asset);
    } catch (error) {
      console.error('Erro ao carregar ativo:', error);
      toast.error('Erro ao carregar ativo');
      navigate('/');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeSector = async () => {
    if (!newSector || !asset || !user) return;

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('assets')
        .update({ sector: newSector })
        .eq('id', asset.id);

      if (error) throw error;

      setAsset({ ...asset, sector: newSector });
      toast.success('Local alterado com sucesso!');
      setIsDialogOpen(false);
      setNewSector('');
    } catch (error) {
      console.error('Erro ao alterar setor:', error);
      toast.error('Erro ao alterar local. Faça login para continuar.');
    } finally {
      setIsSaving(false);
    }
  };

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!asset) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-8 text-center">
          <p className="text-muted-foreground">Ativo não encontrado</p>
          <Button onClick={() => navigate('/')} className="mt-4">
            Voltar ao Início
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-4 px-4 shadow-md">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={logoPrize} alt="Prize Patrimônios" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-bold">Prize Patrimônios</h1>
              <p className="text-xs text-primary-foreground/90">Detalhes do Ativo | By prize hoteis</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card className="p-8 max-w-3xl mx-auto">
          <div className="space-y-6">
            <div className="text-center pb-6 border-b">
              <p className="text-sm font-semibold text-primary mb-2">HCI-{String(asset.item_number).padStart(6, '0')}</p>
              <h2 className="text-3xl font-bold text-foreground">{asset.description}</h2>
              {user && (
                <Button
                  onClick={() => setIsDialogOpen(true)}
                  variant="outline"
                  className="mt-4"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  Alterar Local
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Setor</label>
                  <Badge variant="outline" className="mt-2 block w-fit">
                    {asset.sector}
                  </Badge>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">Grupo</label>
                  <Badge variant="outline" className="mt-2 block w-fit">
                    {asset.asset_group}
                  </Badge>
                </div>

                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Estado de Conservação
                  </label>
                  <Badge className={`mt-2 block w-fit ${getConservationColor(asset.conservation_state)}`}>
                    {asset.conservation_state}
                  </Badge>
                </div>
              </div>

              <div className="space-y-4">
                {asset.brand_model && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Marca/Modelo</label>
                    <p className="text-foreground font-medium mt-2">{asset.brand_model}</p>
                  </div>
                )}

                {asset.evaluation_value && (
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">
                      Valor de Avaliação
                    </label>
                    <p className="text-foreground font-semibold text-xl mt-2">
                      R$ {asset.evaluation_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t">
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <span className="font-medium">Cadastrado em:</span>
                  <p className="mt-1">
                    {new Date(asset.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <span className="font-medium">Atualizado em:</span>
                  <p className="mt-1">
                    {new Date(asset.updated_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </main>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Alterar Local do Item</DialogTitle>
            <DialogDescription>
              Selecione o novo setor onde o item está localizado.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={newSector} onValueChange={setNewSector}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o novo setor" />
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
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Cancelar
            </Button>
            <Button onClick={handleChangeSector} disabled={!newSector || isSaving}>
              {isSaving ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssetView;
