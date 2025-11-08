import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Asset } from '@/types/asset';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, FileSpreadsheet, Tag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { AssetList } from '@/components/AssetList';
import { AssetDetails } from '@/components/AssetDetails';
import * as XLSX from 'xlsx';

const AllAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
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
    const exportData = assets.map((asset) => ({
      Item: asset.item_number,
      Descrição: asset.description,
      Setor: asset.sector,
      Grupo: asset.asset_group,
      'Estado de Conservação': asset.conservation_state,
      'Marca/Modelo': asset.brand_model || '',
      'Valor de Avaliação': asset.evaluation_value
        ? `R$ ${asset.evaluation_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
        : '',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Ativos');

    const columnWidths = [
      { wch: 8 },
      { wch: 40 },
      { wch: 20 },
      { wch: 20 },
      { wch: 20 },
      { wch: 30 },
      { wch: 18 },
    ];
    worksheet['!cols'] = columnWidths;

    const fileName = `hotel-colonial-ativos-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Planilha exportada com sucesso!');
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
        <div className="flex justify-between items-center mb-6">
          <p className="text-muted-foreground">
            Total: <strong className="text-foreground">{assets.length}</strong> itens cadastrados
          </p>
          <div className="flex gap-2">
            <Button 
              onClick={handleExportExcel} 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar
            </Button>
            <Button 
              onClick={() => navigate('/labels')} 
              variant="outline" 
              size="sm"
              className="gap-2"
            >
              <Tag className="h-4 w-4" />
              Gerar Etiquetas
            </Button>
          </div>
        </div>

        <AssetList assets={assets} onViewAsset={setSelectedAsset} />

        {selectedAsset && (
          <AssetDetails asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
        )}
      </main>
    </div>
  );
};

export default AllAssets;
