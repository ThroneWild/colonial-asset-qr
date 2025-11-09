import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Asset, AssetFilters } from '@/types/asset';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ArrowLeft, FileText, Tags, Edit } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoPrize from '@/assets/logo-prize.png';
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

  const handleExportPDF = () => {
    const doc = new jsPDF('landscape');
    
    // Adicionar logo
    const imgWidth = 30;
    const imgHeight = 15;
    doc.addImage(logoPrize, 'PNG', 14, 10, imgWidth, imgHeight);
    
    // Cabeçalho - Título
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Patrimônio', 148, 15, { align: 'center' });
    
    // Informações do cabeçalho
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    
    // Data e usuário no canto direito
    doc.text(`Data: ${dateStr}`, 280, 15, { align: 'right' });
    doc.text(`Usuário: ${user?.email || 'Sistema'}`, 280, 20, { align: 'right' });
    
    // Linha separadora
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 28, 282, 28);
    
    // Resumo
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(`Total de Ativos: ${filteredAssets.length}`, 14, 35);
    
    const totalValue = filteredAssets.reduce((sum, asset) => sum + (asset.evaluation_value || 0), 0);
    doc.text(`Valor Total: R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 100, 35);
    
    // Preparar dados da tabela
    const tableData = filteredAssets.map(asset => [
      asset.item_number,
      asset.description,
      asset.sector,
      asset.asset_group,
      asset.conservation_state,
      asset.brand_model || '-',
      `R$ ${(asset.evaluation_value || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
      new Date(asset.created_at).toLocaleDateString('pt-BR')
    ]);
    
    // Criar tabela
    autoTable(doc, {
      startY: 42,
      head: [['Item Nº', 'Descrição', 'Setor', 'Grupo', 'Estado', 'Marca/Modelo', 'Valor', 'Cadastro']],
      body: tableData,
      theme: 'striped',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 3
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 20 },
        1: { cellWidth: 50 },
        2: { cellWidth: 30 },
        3: { cellWidth: 30 },
        4: { halign: 'center', cellWidth: 25 },
        5: { cellWidth: 35 },
        6: { halign: 'right', cellWidth: 25 },
        7: { halign: 'center', cellWidth: 25 }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 42, left: 14, right: 14 }
    });
    
    // Rodapé
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Página ${i} de ${pageCount}`,
        148,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
      doc.text(
        'Prize Patrimônios - Sistema de Gestão Patrimonial | By prize hoteis',
        148,
        doc.internal.pageSize.height - 6,
        { align: 'center' }
      );
    }
    
    const fileName = `patrimonio-${new Date().toLocaleDateString('pt-BR').replace(/\//g, '-')}.pdf`;
    doc.save(fileName);
    
    toast.success('Relatório PDF gerado com sucesso!');
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

  const handleDeleteAsset = async () => {
    if (!editingAsset) return;
    
    setIsEditLoading(true);
    try {
      // Delete invoice file if exists
      if (editingAsset.invoice_url) {
        await supabase.storage.from('invoices').remove([editingAsset.invoice_url]);
      }

      // Delete asset
      const { error } = await supabase
        .from('assets')
        .delete()
        .eq('id', editingAsset.id);

      if (error) throw error;

      toast.success('Ativo excluído com sucesso!');
      setEditingAsset(null);
      await fetchAssets();
    } catch (error) {
      console.error('Erro ao excluir ativo:', error);
      toast.error('Erro ao excluir ativo. Verifique suas permissões.');
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
              <Button onClick={handleExportPDF} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
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
                onDelete={handleDeleteAsset}
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