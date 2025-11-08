import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, Package, FileSpreadsheet, Tag, LogOut, User, DollarSign, MapPin } from 'lucide-react';
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

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <header className="gradient-primary text-primary-foreground shadow-elegant sticky top-0 z-50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <img src={logoColonial} alt="Hotel Colonial Iguaçu" className="h-12 w-auto" />
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Hotel Colonial Iguaçu</h1>
                <p className="text-xs opacity-90">Sistema de Gestão Patrimonial</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm bg-primary-foreground/10 px-3 py-2 rounded-lg">
                <User className="h-4 w-4" />
                <span className="opacity-90">{userName}</span>
              </div>
              <Button 
                onClick={handleLogout} 
                variant="outline" 
                size="sm"
                className="bg-primary-foreground/10 border-primary-foreground/20 hover:bg-primary-foreground/20 text-primary-foreground"
              >
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in">
          <Card className="p-5 shadow-card hover:shadow-hover transition-smooth border-0 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <Package className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total de Ativos</h3>
                <p className="text-2xl font-bold text-foreground mt-1">{assets.length}</p>
              </div>
            </div>
          </Card>
          <Card className="p-5 shadow-card hover:shadow-hover transition-smooth border-0 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <DollarSign className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Valor Total</h3>
                <p className="text-2xl font-bold text-foreground mt-1">
                  R$ {assets.reduce((acc, asset) => acc + (asset.evaluation_value || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </p>
              </div>
            </div>
          </Card>
          <Card className="p-5 shadow-card hover:shadow-hover transition-smooth border-0 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-primary/10">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Setores Ativos</h3>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {new Set(assets.map(a => a.sector)).size}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="mb-6 p-6 shadow-card border-0 bg-card/80 backdrop-blur-sm">
          <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Gestão de Ativos</h2>
              <p className="text-sm text-muted-foreground mt-1">Gerencie todos os bens do hotel</p>
            </div>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button 
                onClick={() => setIsFormOpen(true)} 
                className="gap-2 shadow-card hover:shadow-elegant transition-smooth flex-1 md:flex-initial"
              >
                <Plus className="h-4 w-4" />
                Novo Ativo
              </Button>
              <Button 
                onClick={handleExportExcel} 
                variant="outline" 
                className="gap-2 shadow-card hover:shadow-elegant transition-smooth flex-1 md:flex-initial"
              >
                <FileSpreadsheet className="h-4 w-4" />
                Exportar
              </Button>
              <Button 
                onClick={() => navigate('/labels')} 
                variant="outline" 
                className="gap-2 shadow-card hover:shadow-elegant transition-smooth flex-1 md:flex-initial"
              >
                <Tag className="h-4 w-4" />
                Etiquetas
              </Button>
            </div>
          </div>
        </Card>

        {isFormOpen && (
          <Card className="p-6 mb-6 shadow-card border-0 bg-card/80 backdrop-blur-sm animate-scale-in">
            <h3 className="text-xl font-semibold mb-6 text-foreground">Cadastrar Novo Ativo</h3>
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
