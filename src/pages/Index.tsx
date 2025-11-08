import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Download, Tag, Package, FileSpreadsheet } from 'lucide-react';
import { AssetList } from '@/components/AssetList';
import { AssetForm } from '@/components/AssetForm';
import { AssetDetails } from '@/components/AssetDetails';
import { Asset, AssetFormData } from '@/types/asset';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssets();
  }, []);

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

  const handleSubmit = async (formData: AssetFormData) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('assets')
        .insert([formData])
        .select()
        .single();

      if (error) throw error;

      // Gerar URL do QR Code
      const qrCodeUrl = `${window.location.origin}/asset/${data.id}`;
      
      await supabase
        .from('assets')
        .update({ qr_code_url: qrCodeUrl })
        .eq('id', data.id);

      toast.success('Ativo cadastrado com sucesso!');
      setIsFormOpen(false);
      fetchAssets();
    } catch (error) {
      console.error('Erro ao cadastrar ativo:', error);
      toast.error('Erro ao cadastrar ativo');
    } finally {
      setIsLoading(false);
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

    // Ajustar largura das colunas
    const columnWidths = [
      { wch: 8 },  // Item
      { wch: 40 }, // Descrição
      { wch: 20 }, // Setor
      { wch: 20 }, // Grupo
      { wch: 20 }, // Estado de Conservação
      { wch: 30 }, // Marca/Modelo
      { wch: 18 }, // Valor de Avaliação
    ];
    worksheet['!cols'] = columnWidths;

    const fileName = `hotel-colonial-ativos-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    toast.success('Planilha exportada com sucesso!');
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="gradient-primary text-primary-foreground shadow-elegant sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold tracking-tight">Hotel Colonial Iguaçu</h1>
          <p className="text-sm opacity-90 mt-1">Sistema de Gestão Patrimonial</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
          <Card className="p-6 shadow-card hover:shadow-hover transition-smooth border-0 bg-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Total de Ativos</h3>
                <p className="text-3xl font-bold text-foreground mt-1">{assets.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-6 shadow-card hover:shadow-hover transition-smooth border-0 bg-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Valor Total</h3>
                <p className="text-3xl font-bold text-foreground mt-1">
                  R$ {assets.reduce((acc, asset) => acc + (asset.evaluation_value || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-6 shadow-card hover:shadow-hover transition-smooth border-0 bg-card">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Setores Ativos</h3>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {new Set(assets.map(a => a.sector)).size}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <div className="mb-8 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Ativos Cadastrados</h2>
            <p className="text-muted-foreground mt-1">Gerencie todos os bens do hotel</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setIsFormOpen(true)} className="gap-2 shadow-card hover:shadow-elegant transition-smooth">
              <Plus className="h-4 w-4" />
              Novo Ativo
            </Button>
            <Button onClick={handleExportExcel} variant="outline" className="gap-2 shadow-card hover:shadow-elegant transition-smooth">
              <FileSpreadsheet className="h-4 w-4" />
              Exportar Planilha
            </Button>
            <Button onClick={() => navigate('/labels')} variant="outline" className="gap-2 shadow-card hover:shadow-elegant transition-smooth">
              <Tag className="h-4 w-4" />
              Gerar Etiquetas
            </Button>
          </div>
        </div>

        {isFormOpen && (
          <Card className="p-6 mb-8 shadow-card border-0 bg-card animate-scale-in">
            <h3 className="text-2xl font-semibold mb-6 text-foreground">Cadastrar Novo Ativo</h3>
            <AssetForm
              onSubmit={handleSubmit}
              onCancel={() => setIsFormOpen(false)}
              isLoading={isLoading}
            />
          </Card>
        )}

        <AssetList assets={assets} onViewAsset={setSelectedAsset} />

        {selectedAsset && (
          <AssetDetails asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
        )}
      </main>
    </div>
  );
};

export default Index;
