import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Asset, AssetFilters } from '@/types/asset';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, FileSpreadsheet, Tags, Edit } from 'lucide-react';
import { AssetList } from '@/components/AssetList';
import { AssetDetails } from '@/components/AssetDetails';
import { AssetEditForm } from '@/components/AssetEditForm';
import { AdvancedFilters } from '@/components/AdvancedFilters';
import { useAssetFilters } from '@/hooks/useAssetFilters';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';

const AllAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [isEditLoading, setIsEditLoading] = useState(false);
  const [filters, setFilters] = useState<AssetFilters>({
    searchTerm: '',
    sectors: [],
    groups: [],
    conservationStates: [],
    sortBy: 'date_desc',
  });
  
  const filteredAssets = useAssetFilters(assets, filters);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAssets();
    }
  }, [user]);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('item_number', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Erro ao carregar ativos:', error);
      toast.error('Erro ao carregar ativos');
    }
  };

  const handleExportExcel = () => {
    const excelData = filteredAssets.map(asset => ({
      'Item Nº': asset.item_number,
      'Descrição': asset.description,
      'Setor': asset.sector,
      'Grupo': asset.asset_group,
      'Estado': asset.conservation_state,
      'Marca/Modelo': asset.brand_model || '-',
      'Valor (R$)': asset.evaluation_value || 0,
      'Cadastrado em': new Date(asset.created_at).toLocaleDateString('pt-BR'),
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Ativos');
    
    const fileName = `colonial-patrimonio-${new Date().toLocaleDateString('pt-BR')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    
    toast.success('Arquivo Excel exportado com sucesso!');
  };

  const handleEditAsset = async (id: string, data: Partial<Asset>) => {
    setIsEditLoading(true);
    try {
      const { error } = await supabase
        .from('assets')
        .update(data)
        .eq('id', id);

      if (error) throw error;

      toast.success('Ativo atualizado com sucesso!');
      setEditingAsset(null);
      await fetchAssets();
      
      // Update selected asset if it's the one being edited
      if (selectedAsset?.id === id) {
        const updated = assets.find(a => a.id === id);
        if (updated) setSelectedAsset({ ...updated, ...data } as Asset);
      }
    } catch (error) {
      console.error('Erro ao atualizar ativo:', error);
      toast.error('Erro ao atualizar ativo');
    } finally {
      setIsEditLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate('/')}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-2xl font-bold tracking-tight">Lista de Ativos</h1>
              <p className="text-sm opacity-90 mt-1">Gerencie todo o patrimônio</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Todos os Ativos</h2>
              <p className="text-muted-foreground">
                Total: <span className="font-semibold text-primary">{filteredAssets.length}</span> de {assets.length} ativos
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AdvancedFilters filters={filters} onFiltersChange={setFilters} />
              <Button onClick={handleExportExcel} variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
              <Button onClick={() => navigate('/labels')}>
                <Tags className="h-4 w-4 mr-2" />
                Gerar Etiquetas
              </Button>
            </div>
          </div>
          
          <Input
            placeholder="Buscar por descrição, setor, grupo, item nº ou marca..."
            value={filters.searchTerm}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            className="max-w-md"
          />
        </div>

        <AssetList 
          assets={filteredAssets} 
          onViewAsset={setSelectedAsset}
          onEditAsset={setEditingAsset}
        />

        {selectedAsset && (
          <AssetDetails
            asset={selectedAsset}
            onClose={() => setSelectedAsset(null)}
            onEdit={() => {
              setEditingAsset(selectedAsset);
              setSelectedAsset(null);
            }}
          />
        )}

        {editingAsset && (
          <Dialog open={!!editingAsset} onOpenChange={(open) => !open && setEditingAsset(null)}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Editar Ativo #{editingAsset.item_number}</DialogTitle>
              </DialogHeader>
              <AssetEditForm
                asset={editingAsset}
                onSubmit={handleEditAsset}
                onCancel={() => setEditingAsset(null)}
                isLoading={isEditLoading}
              />
            </DialogContent>
          </Dialog>
        )}
      </main>
    </div>
  );
};

export default AllAssets;