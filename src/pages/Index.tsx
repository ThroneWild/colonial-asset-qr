import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Download, Tag } from 'lucide-react';
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
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-6 px-4 shadow-md">
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold">Hotel Colonial Iguaçu</h1>
          <p className="text-primary-foreground/90 mt-1">Sistema de Gestão Patrimonial</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Ativos Patrimoniais</h2>
            <p className="text-muted-foreground mt-1">
              Total de {assets.length} {assets.length === 1 ? 'ativo' : 'ativos'} cadastrados
            </p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <Button onClick={() => navigate('/labels')} variant="outline" className="flex-1 md:flex-initial">
              <Tag className="mr-2 h-4 w-4" />
              Etiquetas
            </Button>
            <Button onClick={handleExportExcel} variant="outline" className="flex-1 md:flex-initial">
              <Download className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button onClick={() => setIsFormOpen(true)} className="flex-1 md:flex-initial">
              <Plus className="mr-2 h-4 w-4" />
              Novo Ativo
            </Button>
          </div>
        </div>

        {isFormOpen && (
          <Card className="p-6 mb-8">
            <h3 className="text-xl font-semibold mb-4 text-foreground">Cadastrar Novo Ativo</h3>
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
