import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Asset, AssetStatistics } from '@/types/asset';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner';
import { AssetsBySectorChart } from '@/components/charts/AssetsBySectorChart';
import { AssetsByConservationChart } from '@/components/charts/AssetsByConservationChart';
import { AssetsTimelineChart } from '@/components/charts/AssetsTimelineChart';
import { TopAssetsTable } from '@/components/charts/TopAssetsTable';

const Dashboard = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [statistics, setStatistics] = useState<AssetStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const assetsData = data || [];
      setAssets(assetsData);
      calculateStatistics(assetsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados do dashboard');
    } finally {
      setLoading(false);
    }
  };

  const calculateStatistics = (assetsData: Asset[]) => {
    const assetsBySector: Record<string, number> = {};
    const assetsByGroup: Record<string, number> = {};
    const assetsByConservation: Record<string, number> = {};
    let totalValue = 0;

    assetsData.forEach(asset => {
      assetsBySector[asset.sector] = (assetsBySector[asset.sector] || 0) + 1;
      assetsByGroup[asset.asset_group] = (assetsByGroup[asset.asset_group] || 0) + 1;
      assetsByConservation[asset.conservation_state] = (assetsByConservation[asset.conservation_state] || 0) + 1;
      if (asset.evaluation_value) {
        totalValue += asset.evaluation_value;
      }
    });

    const averageValue = assetsData.length > 0 ? totalValue / assetsData.length : 0;
    const maintenanceRate = assetsData.length > 0 
      ? (assetsByConservation['Ruim'] || 0) / assetsData.length * 100 
      : 0;

    setStatistics({
      totalAssets: assetsData.length,
      totalValue,
      averageValue,
      assetsBySector,
      assetsByGroup,
      assetsByConservation,
      maintenanceRate,
      monthlyGrowth: 0, // Simplified for now
    });
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="bg-primary text-primary-foreground shadow-md">
          <div className="container mx-auto px-4 py-6">
            <Skeleton className="h-8 w-64 mx-auto" />
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          <div className="grid gap-6">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-64" />
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (!user || !statistics) return null;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground shadow-md">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/')}
              variant="ghost"
              size="sm"
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1 text-center">
              <h1 className="text-3xl font-bold tracking-tight">Dashboard Patrimonial</h1>
              <p className="text-sm opacity-90 mt-1">Análise e Estatísticas</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de Ativos</p>
                <p className="text-2xl font-bold text-foreground">{statistics.totalAssets}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(statistics.totalValue)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Valor Médio</p>
                <p className="text-2xl font-bold text-foreground">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(statistics.averageValue)}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-destructive/10">
                <BarChart3 className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Taxa Manutenção</p>
                <p className="text-2xl font-bold text-foreground">{statistics.maintenanceRate.toFixed(1)}%</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <AssetsBySectorChart data={statistics.assetsBySector} />
          <AssetsByConservationChart data={statistics.assetsByConservation} />
        </div>

        <div className="mb-8">
          <AssetsTimelineChart assets={assets} />
        </div>

        <TopAssetsTable assets={assets} />
      </main>
    </div>
  );
};

export default Dashboard;