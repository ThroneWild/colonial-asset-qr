import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Asset, AssetStatistics } from '@/types/asset';
import { Card } from '@/components/ui/card';
import { BarChart3, TrendingUp, DollarSign, Package, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { AssetsBySectorChart } from '@/components/charts/AssetsBySectorChart';
import { AssetsByConservationChart } from '@/components/charts/AssetsByConservationChart';
import { AssetsTimelineChart } from '@/components/charts/AssetsTimelineChart';
import { ValueDistributionChart } from '@/components/charts/ValueDistributionChart';
import { RegistrationTimelineChart } from '@/components/charts/RegistrationTimelineChart';
import { ConservationHeatmapChart } from '@/components/charts/ConservationHeatmapChart';
import { TopAssetsTable } from '@/components/charts/TopAssetsTable';
import { SkeletonStatsGrid } from '@/components/ui/skeleton-stats';
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
import { cn } from '@/lib/utils';
import { PageHeading } from '@/components/ui/page-heading';

const Dashboard = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [statistics, setStatistics] = useState<AssetStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [isApplyingFilter, setIsApplyingFilter] = useState(false);
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  const filteredAssets = useMemo(() => {
    const now = new Date();

    return assets.filter(asset => {
      const createdAt = new Date(asset.created_at);

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
  }, [assets, periodFilter]);

  const handlePeriodChange = (value: string) => {
    setIsApplyingFilter(true);
    setPeriodFilter(value);
  };

  const renderFilterOverlay = () => (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-3xl bg-background/80 backdrop-blur-sm">
      <Loader2 className="h-5 w-5 animate-spin text-primary" />
      <span className="mt-2 text-sm text-muted-foreground">Atualizando dados...</span>
    </div>
  );

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const fetchData = useCallback(async () => {
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
      setIsApplyingFilter(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void fetchData();
    }
  }, [user, fetchData]);

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
    calculateStatistics(filteredAssets);
    const timeout = window.setTimeout(() => setIsApplyingFilter(false), 300);
    return () => window.clearTimeout(timeout);
  }, [filteredAssets]);

  if (authLoading || loading) {
    return (
      <div className="space-y-8">
        <SkeletonStatsGrid count={4} />
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <SkeletonChart />
          <SkeletonChart />
        </div>
        <SkeletonChart />
      </div>
    );
  }

  if (!user || !statistics) return null;

  return (
    <div className="space-y-8">
      <Breadcrumb className="w-fit rounded-full border border-white/10 bg-background/60 px-5 py-2 text-xs uppercase tracking-[0.35em] text-slate-300/70">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer text-slate-300">
              Início
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage className="text-slate-200">Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeading
        eyebrow="Visão geral"
        title="Painel patrimonial"
        description="Acompanhe ativos, valores e manutenção do hotel com indicadores consolidados."
        actions={
          <div className="flex items-center gap-3">
            <span className="hidden text-xs uppercase tracking-[0.35em] text-slate-400 sm:inline">Período</span>
            <Select value={periodFilter} onValueChange={handlePeriodChange}>
              <SelectTrigger className="w-[180px] border-white/10 bg-background/70 text-slate-200">
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
        }
      />

      {filteredAssets.length === 0 && !loading && (
        <div className="mb-6 rounded-lg border border-dashed border-muted-foreground/40 bg-muted/20 px-4 py-3 text-center text-sm text-muted-foreground">
          Sem registros para o período selecionado.
        </div>
      )}

      {/* Cards de Estatísticas */}
      <div className="relative mb-8">
        {isApplyingFilter && renderFilterOverlay()}
        <div
          className={cn(
            "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-fade-in",
            isApplyingFilter && "pointer-events-none opacity-50",
          )}
        >
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
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8 animate-scale-in">
        <div className="relative">
          {isApplyingFilter && renderFilterOverlay()}
          <div className={cn(isApplyingFilter && "pointer-events-none opacity-50")}>
            <AssetsBySectorChart data={statistics.assetsBySector} />
          </div>
        </div>
        <div className="relative">
          {isApplyingFilter && renderFilterOverlay()}
          <div className={cn(isApplyingFilter && "pointer-events-none opacity-50")}>
            <AssetsByConservationChart data={statistics.assetsByConservation} />
          </div>
        </div>
      </div>

      <div className="relative mb-8 animate-fade-in">
        {isApplyingFilter && renderFilterOverlay()}
        <div className={cn(isApplyingFilter && "pointer-events-none opacity-50")}>
          <ValueDistributionChart assets={filteredAssets} />
        </div>
      </div>

      <div className="relative mb-8 animate-fade-in">
        {isApplyingFilter && renderFilterOverlay()}
        <div
          className={cn(
            "grid grid-cols-1 lg:grid-cols-2 gap-6",
            isApplyingFilter && "pointer-events-none opacity-50",
          )}
        >
          <RegistrationTimelineChart assets={filteredAssets} days={30} />
          <AssetsTimelineChart assets={filteredAssets} />
        </div>
      </div>

      <div className="relative mb-8 animate-fade-in">
        {isApplyingFilter && renderFilterOverlay()}
        <div className={cn(isApplyingFilter && "pointer-events-none opacity-50")}> 
          <ConservationHeatmapChart assets={filteredAssets} />
        </div>
      </div>

      <div className="relative animate-fade-in">
        {isApplyingFilter && renderFilterOverlay()}
        <div className={cn(isApplyingFilter && "pointer-events-none opacity-50")}> 
          <TopAssetsTable assets={filteredAssets} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;