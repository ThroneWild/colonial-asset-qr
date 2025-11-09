import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Asset, AssetFilters } from '@/types/asset';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, FileText, Tags, PackageSearch } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoPrize from '@/assets/logo-prize.png';
import { AssetList } from '@/components/AssetList';
import { AssetDetails } from '@/components/AssetDetails';
import { AssetEditForm } from '@/components/AssetEditForm';
import { AdvancedFilters } from '@/components/AdvancedFilters';
import { AdvancedSearch } from '@/components/AdvancedSearch';
import { BatchActionBar } from '@/components/BatchActionBar';
import { EmptyState } from '@/components/EmptyState';
import { SkeletonCardGrid } from '@/components/ui/skeleton-card';
import { useAssetFilters } from '@/hooks/useAssetFilters';
import { usePagination } from '@/hooks/usePagination';
import { exportToExcel } from '@/utils/excelExport';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";

const AllAssets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>([]);
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
  const { paginatedItems, currentPage, totalPages, goToPage, nextPage, prevPage, canGoNext, canGoPrev } = usePagination(filteredAssets, 50);
  
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  // Search suggestions
  const searchSuggestions = useMemo(() => {
    const descriptions = assets.map(a => a.description);
    const sectors = [...new Set(assets.map(a => a.sector))];
    const groups = [...new Set(assets.map(a => a.asset_group))];
    return [...descriptions, ...sectors, ...groups];
  }, [assets]);

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
      setIsLoadingAssets(true);
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('item_number', { ascending: false });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao carregar ativos:', error);
      }
      toast.error('Erro ao carregar ativos');
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const handleExportPDF = (assetsToExport: Asset[] = filteredAssets) => {
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
    doc.text(`Total de Ativos: ${assetsToExport.length}`, 14, 35);
    
    const totalValue = assetsToExport.reduce((sum, asset) => sum + (asset.evaluation_value || 0), 0);
    doc.text(`Valor Total: R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 100, 35);
    
    // Preparar dados da tabela
    const tableData = assetsToExport.map(asset => [
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
      if (import.meta.env.DEV) {
        console.error('Erro ao atualizar ativo:', error);
      }
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
      if (import.meta.env.DEV) {
        console.error('Erro ao excluir ativo:', error);
      }
      toast.error('Erro ao excluir ativo. Verifique suas permissões.');
    } finally {
      setIsEditLoading(false);
    }
  };

  // Batch operations
  const handleBatchDelete = async (assetsToDelete: Asset[]) => {
    if (!confirm(`Tem certeza que deseja excluir ${assetsToDelete.length} ${assetsToDelete.length === 1 ? 'ativo' : 'ativos'}?`)) {
      return;
    }

    try {
      const deletePromises = assetsToDelete.map(async (asset) => {
        if (asset.invoice_url) {
          await supabase.storage.from('invoices').remove([asset.invoice_url]);
        }
        return supabase.from('assets').delete().eq('id', asset.id);
      });

      await Promise.all(deletePromises);
      toast.success(`${assetsToDelete.length} ${assetsToDelete.length === 1 ? 'ativo excluído' : 'ativos excluídos'} com sucesso!`);
      setSelectedAssets([]);
      await fetchAssets();
    } catch (error) {
      console.error('Erro ao excluir ativos:', error);
      toast.error('Erro ao excluir alguns ativos');
    }
  };

  const handleToggleAssetSelection = (asset: Asset) => {
    setSelectedAssets(prev => {
      const exists = prev.find(a => a.id === asset.id);
      if (exists) {
        return prev.filter(a => a.id !== asset.id);
      }
      return [...prev, asset];
    });
  };

  const handleSelectAll = () => {
    if (selectedAssets.length === paginatedItems.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets([...paginatedItems]);
    }
  };

  const handleBatchExportPDF = (assetsToExport: Asset[]) => {
    handleExportPDF(assetsToExport);
  };

  const handleBatchExportExcel = (assetsToExport: Asset[]) => {
    exportToExcel(assetsToExport);
    toast.success('Relatório Excel gerado com sucesso!');
  };

  const handleBatchGenerateLabels = (assetsForLabels: Asset[]) => {
    // Store selected assets in sessionStorage and navigate to labels page
    sessionStorage.setItem('selectedAssetsForLabels', JSON.stringify(assetsForLabels));
    navigate('/labels');
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
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer">
                Início
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Todos os Ativos</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Todos os Ativos</h2>
              <p className="text-muted-foreground">
                Mostrando <span className="font-semibold text-primary">{paginatedItems.length}</span> de {filteredAssets.length} ativos
                {filteredAssets.length !== assets.length && ` (${assets.length} total)`}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <AdvancedFilters filters={filters} onFiltersChange={setFilters} />
              <Button onClick={() => handleExportPDF()} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Exportar PDF
              </Button>
              <Button onClick={() => exportToExcel(filteredAssets)} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Exportar Excel
              </Button>
              <Button onClick={() => navigate('/labels')}>
                <Tags className="h-4 w-4 mr-2" />
                Gerar Etiquetas
              </Button>
            </div>
          </div>
          
          <div className="flex gap-4 items-center">
            <AdvancedSearch
              value={filters.searchTerm || ''}
              onChange={(value) => setFilters({ ...filters, searchTerm: value })}
              placeholder="Buscar por descrição, setor, grupo, item nº ou marca..."
              suggestions={searchSuggestions}
            />
            {paginatedItems.length > 0 && (
              <Button
                variant="outline"
                onClick={handleSelectAll}
                className="whitespace-nowrap"
              >
                {selectedAssets.length === paginatedItems.length ? 'Desmarcar' : 'Selecionar'} Todos
              </Button>
            )}
          </div>
        </div>

        {isLoadingAssets ? (
          <SkeletonCardGrid count={6} />
        ) : paginatedItems.length === 0 ? (
          <EmptyState
            icon={PackageSearch}
            title="Nenhum ativo encontrado"
            description={filters.searchTerm ? "Tente ajustar sua busca ou filtros" : "Comece cadastrando seu primeiro ativo"}
            action={!filters.searchTerm ? {
              label: "Cadastrar Ativo",
              onClick: () => navigate('/')
            } : undefined}
          />
        ) : (
          <>
            <AssetList 
              assets={paginatedItems} 
              selectedAssets={selectedAssets}
              onViewAsset={setSelectedAsset}
              onEditAsset={setEditingAsset}
              onToggleSelection={handleToggleAssetSelection}
            />

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={prevPage}
                        className={!canGoPrev ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <PaginationItem key={page}>
                        <PaginationLink
                          onClick={() => goToPage(page)}
                          isActive={currentPage === page}
                          className="cursor-pointer"
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={nextPage}
                        className={!canGoNext ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}

        {/* Batch Action Bar */}
        <BatchActionBar
          selectedAssets={selectedAssets}
          onClearSelection={() => setSelectedAssets([])}
          onExportPDF={handleBatchExportPDF}
          onExportExcel={handleBatchExportExcel}
          onGenerateLabels={handleBatchGenerateLabels}
          onBatchDelete={handleBatchDelete}
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