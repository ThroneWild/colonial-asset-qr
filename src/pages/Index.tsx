import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, QrCode, List, BarChart3, UserCog } from 'lucide-react';
import { AssetForm } from '@/components/AssetForm';
import { QRScanner } from '@/components/QRScanner';
import { SingleLabel } from '@/components/SingleLabel';
import { Asset, AssetFormData } from '@/types/asset';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonStatsGrid } from '@/components/ui/skeleton-stats';
import { GlowingEffect } from '@/components/ui/glowing-effect';

const Index = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [newAssetLabel, setNewAssetLabel] = useState<Asset | null>(null);
  const navigate = useNavigate();
  const { user, loading, profile, isAdmin } = useAuth();

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
      
      const { data: updatedAsset } = await supabase
        .from('assets')
        .update({ qr_code_url: qrCodeUrl })
        .eq('id', data.id)
        .select()
        .single();

      toast.success('Ativo cadastrado com sucesso!');
      setIsFormOpen(false);
      fetchAssets();
      
      // Mostrar etiqueta para impressão
      if (updatedAsset) {
        setNewAssetLabel(updatedAsset);
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao cadastrar ativo:', error);
      }
      toast.error('Erro ao cadastrar ativo');
    } finally {
      setIsLoading(false);
    }
  };

  const handleScanQR = (data: string) => {
    setShowScanner(false);
    // Se for uma URL do nosso sistema, navegar para ela
    if (data.includes('/asset/')) {
      const assetId = data.split('/asset/')[1];
      navigate(`/asset/${assetId}`);
    } else {
      toast.error('QR Code inválido');
    }
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
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold mb-2">
          Bem-vindo{profile ? `, ${profile.full_name.split(' ')[0]}` : ''} ao <span className="text-gold">Prize</span> Patrimônios
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">Sistema de Controle Patrimonial Empresarial</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 animate-fade-in">
        {isLoadingAssets ? (
          <SkeletonStatsGrid count={4} />
        ) : (
          <>
            <Card className="p-5 sm:p-6 text-center shadow-card hover:shadow-hover transition-smooth border-0">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sm:mb-3 uppercase tracking-wider">Total de Itens</h3>
              <p className="text-4xl sm:text-5xl font-bold text-primary mb-1 sm:mb-2">{assets.length}</p>
              <p className="text-xs text-muted-foreground">Itens cadastrados</p>
            </Card>
            
            <Card className="p-5 sm:p-6 text-center shadow-card hover:shadow-hover transition-smooth border-0">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sm:mb-3 uppercase tracking-wider">Itens Ativos</h3>
              <p className="text-4xl sm:text-5xl font-bold text-primary mb-1 sm:mb-2">{assets.filter(a => a.conservation_state !== 'Precisa de Manutenção').length}</p>
              <p className="text-xs text-muted-foreground">Em uso regular</p>
            </Card>
            
            <Card className="p-5 sm:p-6 text-center shadow-card hover:shadow-hover transition-smooth border-0">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sm:mb-3 uppercase tracking-wider">Em Manutenção</h3>
              <p className="text-4xl sm:text-5xl font-bold text-destructive mb-1 sm:mb-2">{maintenanceCount}</p>
              <p className="text-xs text-muted-foreground">Necessitam atenção</p>
            </Card>
            
            <Card className="p-5 sm:p-6 text-center shadow-card hover:shadow-hover transition-smooth border-0">
              <h3 className="text-xs sm:text-sm font-semibold text-muted-foreground mb-2 sm:mb-3 uppercase tracking-wider">Localizações</h3>
              <p className="text-4xl sm:text-5xl font-bold text-primary mb-1 sm:mb-2">{new Set(assets.map(a => a.sector)).size}</p>
              <p className="text-xs text-muted-foreground">Setores diferentes</p>
            </Card>
          </>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8 sm:mb-12 animate-scale-in">
        <div className="relative">
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
            borderWidth={2}
          />
          <Card 
            className="relative p-6 sm:p-8 text-center shadow-card hover:shadow-hover transition-smooth cursor-pointer group border-0"
            onClick={() => navigate('/dashboard')}
          >
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-smooth">
                <BarChart3 className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 sm:mb-2">Dashboard</h3>
                <p className="text-xs text-muted-foreground">Visualize estatísticas e gráficos</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="relative">
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
            borderWidth={2}
          />
          <Card 
            className="relative p-6 sm:p-8 text-center shadow-card hover:shadow-hover transition-smooth cursor-pointer group border-0"
            onClick={() => setIsFormOpen(true)}
          >
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-smooth">
                <Plus className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 sm:mb-2">Cadastrar Item</h3>
                <p className="text-xs text-muted-foreground">Adicione um novo item ao patrimônio</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="relative">
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
            borderWidth={2}
          />
          <Card 
            className="relative p-6 sm:p-8 text-center shadow-card hover:shadow-hover transition-smooth cursor-pointer group border-0"
            onClick={() => setShowScanner(true)}
          >
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-smooth">
                <QrCode className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 sm:mb-2">Ler QR Code</h3>
                <p className="text-xs text-muted-foreground">Escaneie o código para ver detalhes</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="relative">
          <GlowingEffect
            spread={40}
            glow={true}
            disabled={false}
            proximity={64}
            inactiveZone={0.01}
            borderWidth={2}
          />
          <Card 
            className="relative p-6 sm:p-8 text-center shadow-card hover:shadow-hover transition-smooth cursor-pointer group border-0"
            onClick={() => navigate('/assets')}
          >
            <div className="flex flex-col items-center gap-3 sm:gap-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-smooth">
                <List className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-foreground mb-1 sm:mb-2">Ver Todos os Itens</h3>
                <p className="text-xs text-muted-foreground">Liste e gerencie o patrimônio</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      <div className="flex justify-center mb-8 animate-fade-in">
        <Button 
          onClick={() => navigate('/users')}
          className="w-48 h-12 text-base relative group overflow-hidden"
        >
          <span className="inline-block translate-x-1 transition-all duration-300 group-hover:translate-x-12 group-hover:opacity-0">
            Usuários
          </span>
          <div className="absolute top-0 z-10 flex h-full w-full translate-x-12 items-center justify-center gap-2 opacity-0 transition-all duration-300 group-hover:-translate-x-1 group-hover:opacity-100">
            <span>Usuários</span>
            <UserCog className="h-4 w-4" />
          </div>
          <div className="absolute left-[20%] top-[40%] h-2 w-2 scale-[1] rounded-lg bg-primary transition-all duration-300 group-hover:left-[0%] group-hover:top-[0%] group-hover:h-full group-hover:w-full group-hover:scale-[1.8]"></div>
        </Button>
      </div>

        {isFormOpen && (
          <Card className="p-5 sm:p-6 mb-6 shadow-card animate-scale-in border-0">
            <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-foreground">Cadastrar Novo Ativo</h3>
            <AssetForm
              onSubmit={handleSubmit}
              onCancel={() => setIsFormOpen(false)}
              isLoading={isLoading}
            />
          </Card>
        )}

        {showScanner && (
          <QRScanner onScan={handleScanQR} onClose={() => setShowScanner(false)} />
        )}

        {newAssetLabel && (
          <SingleLabel asset={newAssetLabel} onClose={() => setNewAssetLabel(null)} />
        )}
    </div>
  );
};

export default Index;
