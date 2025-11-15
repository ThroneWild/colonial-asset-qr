import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Plus, QrCode, List, BarChart3 } from 'lucide-react';
import { AssetForm } from '@/components/AssetForm';
import { QRScanner } from '@/components/QRScanner';
import { SingleLabel } from '@/components/SingleLabel';
import { Asset, AssetFormData } from '@/types/asset';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { SkeletonStatsGrid } from '@/components/ui/skeleton-stats';
import { SkeletonActionCards } from '@/components/ui/skeleton-action-cards';
import { HeroSection } from '@/components/ui/hero-section-dark';
const Index = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(false);
  const [newAssetLabel, setNewAssetLabel] = useState<Asset | null>(null);
  const [initialLoad, setInitialLoad] = useState(true);
  const navigate = useNavigate();
  const {
    user,
    loading,
    profile,
    isAdmin
  } = useAuth();
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
      const {
        data,
        error
      } = await supabase.from('assets').select('*').order('item_number', {
        ascending: false
      });
      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao carregar ativos:', error);
      }
      toast.error('Erro ao carregar ativos');
    } finally {
      setIsLoadingAssets(false);
      setTimeout(() => setInitialLoad(false), 300);
    }
  };
  const handleSubmit = async (formData: AssetFormData) => {
    if (!user) {
      toast.error('Você precisa estar autenticado');
      return;
    }
    setIsLoading(true);
    try {
      const {
        data,
        error
      } = await supabase.from('assets').insert([{
        ...formData,
        user_id: user.id,
        modified_by: user.id
      }]).select().single();
      if (error) throw error;
      const qrCodeUrl = `${window.location.origin}/asset/${data.id}`;
      const {
        data: updatedAsset,
        error: updateError
      } = await supabase.from('assets').update({
        qr_code_url: qrCodeUrl
      }).eq('id', data.id).select().single();
      if (updateError) throw updateError;
      toast.success('Ativo cadastrado com sucesso!');
      setIsFormOpen(false);
      await fetchAssets();
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
    if (data.includes('/asset/')) {
      const assetId = data.split('/asset/')[1];
      navigate(`/asset/${assetId}`);
    } else {
      toast.error('QR Code inválido');
    }
  };
  const firstName = profile?.full_name ? profile.full_name.split(' ')[0] : '';

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center rounded-3xl border border-white/10 bg-background/70 p-12 text-center shadow-card">
        <div>
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-2 border-white/20 border-t-accent"></div>
          <p className="text-sm text-muted-foreground">Carregando informações do patrimônio...</p>
        </div>
      </div>
    );
  }
  if (!user) {
    return null;
  }
  const maintenanceCount = assets.filter(a => a.conservation_state === 'Precisa de Manutenção').length;
  return (
    <div className="space-y-12">
      <HeroSection
        title="Prize Patrimônios"
        subtitle={{
          regular: `${firstName ? `Bem-vindo, ${firstName}. ` : ""}Inventário hoteleiro com `,
          gradient: "controle em tempo real.",
        }}
        description="Monitore cada suíte, enxoval e equipamento com dashboards operacionais, auditorias via QR Code e alertas de manutenção preventiva."
        ctaText="Cadastrar patrimônio agora"
        ctaHref="#novo-patrimonio"
      />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        {isLoadingAssets ? (
          <SkeletonStatsGrid count={4} />
        ) : (
          <>
            <Card className="glass rounded-3xl border border-white/10 p-6 text-center text-slate-200 shadow-hover">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Total de itens</h3>
              <p className="mb-1 text-4xl font-bold text-primary sm:text-5xl">{assets.length}</p>
              <p className="text-xs text-slate-400">Patrimônios catalogados</p>
            </Card>

            <Card className="glass rounded-3xl border border-white/10 p-6 text-center text-slate-200 shadow-hover">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Disponíveis</h3>
              <p className="mb-1 text-4xl font-bold text-primary sm:text-5xl">
                {assets.filter(a => a.conservation_state !== 'Precisa de Manutenção').length}
              </p>
              <p className="text-xs text-slate-400">Em uso pelos setores</p>
            </Card>

            <Card className="glass rounded-3xl border border-white/10 p-6 text-center text-slate-200 shadow-hover">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Manutenção</h3>
              <p className="mb-1 text-4xl font-bold text-accent sm:text-5xl">{maintenanceCount}</p>
              <p className="text-xs text-slate-400">Intervenções agendadas</p>
            </Card>

            <Card className="glass rounded-3xl border border-white/10 p-6 text-center text-slate-200 shadow-hover">
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-[0.35em] text-slate-400">Setores</h3>
              <p className="mb-1 text-4xl font-bold text-primary sm:text-5xl">{new Set(assets.map(a => a.sector)).size}</p>
              <p className="text-xs text-slate-400">Áreas acompanhadas</p>
            </Card>
          </>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
        {initialLoad ? (
          <SkeletonActionCards count={4} />
        ) : (
          <>
            <Card
              className="glass group cursor-pointer rounded-3xl border border-white/10 p-8 text-center text-slate-200 transition-smooth hover:border-primary/50 hover:text-white"
              onClick={() => navigate('/dashboard')}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-2xl border border-white/10 bg-primary/10 p-5 transition-smooth group-hover:bg-primary/20">
                  <BarChart3 className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold">Visão executiva</h3>
                  <p className="text-xs text-slate-400">KPIs de ocupação patrimonial e valores investidos</p>
                </div>
              </div>
            </Card>

            <Card
              className="glass group cursor-pointer rounded-3xl border border-white/10 p-8 text-center text-slate-200 transition-smooth hover:border-primary/50 hover:text-white"
              onClick={() => setIsFormOpen(true)}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-2xl border border-white/10 bg-primary/10 p-5 transition-smooth group-hover:bg-primary/20">
                  <Plus className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold">Novo patrimônio</h3>
                  <p className="text-xs text-slate-400">Cadastre bens com fotos, notas fiscais e responsáveis</p>
                </div>
              </div>
            </Card>

            <Card
              className="glass group cursor-pointer rounded-3xl border border-white/10 p-8 text-center text-slate-200 transition-smooth hover:border-primary/50 hover:text-white"
              onClick={() => setShowScanner(true)}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-2xl border border-white/10 bg-primary/10 p-5 transition-smooth group-hover:bg-primary/20">
                  <QrCode className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold">Auditoria por QR Code</h3>
                  <p className="text-xs text-slate-400">Valide etiquetas em campo direto pelo celular</p>
                </div>
              </div>
            </Card>

            <Card
              className="glass group cursor-pointer rounded-3xl border border-white/10 p-8 text-center text-slate-200 transition-smooth hover:border-primary/50 hover:text-white"
              onClick={() => navigate('/assets')}
            >
              <div className="flex flex-col items-center gap-4">
                <div className="rounded-2xl border border-white/10 bg-primary/10 p-5 transition-smooth group-hover:bg-primary/20">
                  <List className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="mb-1 text-lg font-semibold">Lista completa</h3>
                  <p className="text-xs text-slate-400">Filtre por suíte, categoria e status de conservação</p>
                </div>
              </div>
            </Card>
          </>
        )}
      </section>

      {isFormOpen && (
        <Card id="novo-patrimonio" className="glass rounded-3xl border border-white/10 p-6 shadow-hover">
          <h3 className="mb-6 text-xl font-semibold text-slate-100">Cadastrar novo patrimônio</h3>
          <AssetForm onSubmit={handleSubmit} onCancel={() => setIsFormOpen(false)} isLoading={isLoading} />
        </Card>
      )}

      {showScanner && <QRScanner onScan={handleScanQR} onClose={() => setShowScanner(false)} />}

      {newAssetLabel && <SingleLabel asset={newAssetLabel} onClose={() => setNewAssetLabel(null)} />}
    </div>
  );
};
export default Index;