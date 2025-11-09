import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Asset, AssetStatistics } from '@/types/asset';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, DollarSign, Package } from 'lucide-react';
import { toast } from 'sonner';
import { AssetsBySectorChart } from '@/components/charts/AssetsBySectorChart';
import { AssetsByConservationChart } from '@/components/charts/AssetsByConservationChart';
import { AssetsTimelineChart } from '@/components/charts/AssetsTimelineChart';
import { ValueDistributionChart } from '@/components/charts/ValueDistributionChart';
import { RegistrationTimelineChart } from '@/components/charts/RegistrationTimelineChart';
import { ConservationHeatmapChart } from '@/components/charts/ConservationHeatmapChart';
import { TopAssetsTable } from '@/components/charts/TopAssetsTable';
import { SkeletonStats, SkeletonStatsGrid } from '@/components/ui/skeleton-stats';
import { SkeletonChart } from '@/components/ui/skeleton-chart';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dashboard = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [statistics, setStatistics] = useState<AssetStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const filteredAssets = assets.filter(asset => {
    const createdAt = new Date(asset.created_at);
    const now = new Date();
    
    switch (periodFilter) {
      case '7':
        return (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24) <= 7;
      case '30':
        return (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24) <= 30;
      case '90':
        return (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24) <= 90;
      case '365':
        return (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24) <= 365;
      default:
        return true;
    }
  });

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
      monthlyGrowth: 0,
    });
  };

  // Recalculate stats when period filter changes
  useEffect(() => {
    if (filteredAssets.length > 0) {
      calculateStatistics(filteredAssets);
    }
  }, [periodFilter, assets]);

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <SkeletonStatsGrid count={4} />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <div className="mt-8">
          <SkeletonChart />
        </div>
      </div>
    );
  }

  if (!user || !statistics) return null;

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
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
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Dashboard Patrimonial</h1>
          <p className="text-muted-foreground">Análise e Estatísticas Detalhadas</p>
        </div>
        <Select value={periodFilter} onValueChange={setPeriodFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Período" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os períodos</SelectItem>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
            <SelectItem value="365">Último ano</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
        <Card className="p-6 border-0 shadow-card hover:shadow-hover transition-smooth">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Total de Ativos</p>
              <p className="text-3xl font-bold text-foreground">{statistics.totalAssets}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-card hover:shadow-hover transition-smooth">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-prize-gold/10">
              <DollarSign className="h-6 w-6 text-prize-gold" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Valor Total</p>
              <p className="text-2xl font-bold text-foreground">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(statistics.totalValue)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-card hover:shadow-hover transition-smooth">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Valor Médio</p>
              <p className="text-2xl font-bold text-foreground">
                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(statistics.averageValue)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-card hover:shadow-hover transition-smooth">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-destructive/10">
              <BarChart3 className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Taxa Manutenção</p>
              <p className="text-3xl font-bold text-foreground">{statistics.maintenanceRate.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-scale-in">
        <AssetsBySectorChart data={statistics.assetsBySector} />
        <AssetsByConservationChart data={statistics.assetsByConservation} />
      </div>

      <div className="mb-8 animate-fade-in">
        <ValueDistributionChart assets={filteredAssets} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-fade-in">
        <RegistrationTimelineChart assets={filteredAssets} days={30} />
        <AssetsTimelineChart assets={filteredAssets} />
      </div>

      <div className="mb-8 animate-fade-in">
        <ConservationHeatmapChart assets={filteredAssets} />
      </div>

      <div className="animate-fade-in">
        <TopAssetsTable assets={filteredAssets} />
      </div>
    </div>
  );
};

export default Dashboard;