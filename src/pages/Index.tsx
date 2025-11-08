import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Package, FileSpreadsheet, Tag, LogOut, User, DollarSign, MapPin, QrCode, List, Wrench } from 'lucide-react';
import { AssetList } from '@/components/AssetList';
import { AssetForm } from '@/components/AssetForm';
import { AssetDetails } from '@/components/AssetDetails';
import { Asset, AssetFormData } from '@/types/asset';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import logoColonial from '@/assets/logo-colonial.png';

const Index = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userName, setUserName] = useState<string>('');
  const navigate = useNavigate();
  const { user, loading, signOut } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAssets();
      fetchUserProfile();
    }
  }, [user]);

  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      setUserName(data?.full_name || 'Usuário');
    } catch (error) {
      console.error('Erro ao carregar perfil:', error);
    }
  };

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
    if (!user) {
      toast.error('Você precisa estar autenticado');
      return;
    }

    setIsLoading(true);
    try {
      const dataWithUser = {
        ...formData,
        user_id: user.id,
        modified_by: user.id,
      };

      const { data, error } = await supabase
        .from('assets')
        .insert([dataWithUser])
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

  const handleLogout = async () => {
    await signOut();
    toast.success('Logout realizado com sucesso');
    navigate('/auth');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
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

  const maintenanceCount = assets.filter(a => a.conservation_state === 'Precisa de Manutenção').length;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold tracking-tight">Colonial Patrimônio</h1>
              <p className="text-sm opacity-90 mt-1">Sistema de Controle Patrimonial</p>
            </div>
            <Button 
              onClick={handleLogout} 
              variant="ghost" 
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-fade-in">
          <Card className="p-6 text-center shadow-card hover:shadow-hover transition-smooth">
            <h3 className="text-lg font-semibold text-foreground mb-2">Total de Itens</h3>
            <p className="text-4xl font-bold text-primary mb-2">{assets.length}</p>
            <p className="text-sm text-muted-foreground">Itens cadastrados</p>
          </Card>
          
          <Card className="p-6 text-center shadow-card hover:shadow-hover transition-smooth">
            <h3 className="text-lg font-semibold text-foreground mb-2">Itens Ativos</h3>
            <p className="text-4xl font-bold text-primary mb-2">{assets.filter(a => a.conservation_state !== 'Precisa de Manutenção').length}</p>
            <p className="text-sm text-muted-foreground">Em uso regular</p>
          </Card>
          
          <Card className="p-6 text-center shadow-card hover:shadow-hover transition-smooth">
            <h3 className="text-lg font-semibold text-foreground mb-2">Em Manutenção</h3>
            <p className="text-4xl font-bold text-primary mb-2">{maintenanceCount}</p>
            <p className="text-sm text-muted-foreground">Necessitam atenção</p>
          </Card>
          
          <Card className="p-6 text-center shadow-card hover:shadow-hover transition-smooth">
            <h3 className="text-lg font-semibold text-foreground mb-2">Localizações</h3>
            <p className="text-4xl font-bold text-primary mb-2">{new Set(assets.map(a => a.sector)).size}</p>
            <p className="text-sm text-muted-foreground">Setores diferentes</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-scale-in">
          <Card 
            className="p-8 text-center shadow-card hover:shadow-hover transition-smooth cursor-pointer group"
            onClick={() => setIsFormOpen(true)}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-smooth">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Cadastrar Item</h3>
                <p className="text-sm text-muted-foreground">Adicione um novo item ao patrimônio</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-8 text-center shadow-card hover:shadow-hover transition-smooth cursor-pointer group"
            onClick={() => navigate('/labels')}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-smooth">
                <QrCode className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Ler QR Code</h3>
                <p className="text-sm text-muted-foreground">Escaneie o código para ver detalhes</p>
              </div>
            </div>
          </Card>

          <Card 
            className="p-8 text-center shadow-card hover:shadow-hover transition-smooth cursor-pointer group"
            onClick={() => {
              const element = document.getElementById('asset-list');
              element?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-smooth">
                <List className="h-8 w-8 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-foreground mb-2">Ver Todos os Itens</h3>
                <p className="text-sm text-muted-foreground">Liste e gerencie o patrimônio</p>
              </div>
            </div>
          </Card>
        </div>

        {isFormOpen && (
          <Card className="p-6 mb-6 shadow-card animate-scale-in">
            <h3 className="text-xl font-semibold mb-6 text-foreground">Cadastrar Novo Ativo</h3>
            <AssetForm
              onSubmit={handleSubmit}
              onCancel={() => setIsFormOpen(false)}
              isLoading={isLoading}
            />
          </Card>
        )}

        <div id="asset-list" className="mt-12">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-foreground">Lista de Ativos</h2>
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
            </div>
          </div>
          <AssetList assets={assets} onViewAsset={setSelectedAsset} />
        </div>

        {selectedAsset && (
          <AssetDetails asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
        )}
      </main>
    </div>
  );
};

export default Index;
