import { useState, useEffect, useMemo } from 'react';
import { differenceInCalendarDays, format, isBefore, isSameMonth } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Asset, AssetStatistics } from '@/types/asset';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BarChart3, TrendingUp, DollarSign, Package, Loader2, Wrench, AlertTriangle } from 'lucide-react';
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
import { cn } from '@/lib/utils';
import { MaintenanceDashboardMetrics, MAINTENANCE_STATUSES, MaintenanceStatus } from '@/types/maintenance';
import { MaintenanceStatusBadge } from '@/components/maintenance/MaintenanceStatusBadge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';

const MAINTENANCE_STATUS_COLORS = ['#facc15', '#38bdf8', '#fb923c', '#34d399', '#f87171'];

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

  const maintenanceMetrics = useMemo<MaintenanceDashboardMetrics>(() => {
    const today = new Date();
    const maintenanceAssets = assets.filter(asset => asset.next_maintenance_date);

    const statusDistribution: Record<MaintenanceStatus, number> = {
      Pendente: 0,
      Agendada: 0,
      'Em andamento': 0,
      Concluída: 0,
      Atrasada: 0,
    };

    const totalThisMonth = maintenanceAssets.filter(asset =>
      asset.next_maintenance_date ? isSameMonth(new Date(asset.next_maintenance_date), today) : false,
    ).length;

    const overdue = maintenanceAssets.filter(asset => {
      if (!asset.next_maintenance_date) return false;
      const nextDate = new Date(asset.next_maintenance_date);
      const status = (asset.maintenance_status as MaintenanceStatus) || 'Pendente';
      return (status === 'Atrasada' || isBefore(nextDate, today)) && status !== 'Concluída';
    }).length;

    const nextSevenDays = maintenanceAssets.filter(asset => {
      if (!asset.next_maintenance_date) return false;
      const nextDate = new Date(asset.next_maintenance_date);
      const diff = differenceInCalendarDays(nextDate, today);
      return diff >= 0 && diff <= 7;
    }).length;

    const totalCost = maintenanceAssets.reduce((sum, asset) => sum + (asset.maintenance_cost || 0), 0);

    maintenanceAssets.forEach(asset => {
      const status = (asset.maintenance_status as MaintenanceStatus) || 'Pendente';
      statusDistribution[status] += 1;
    });

    const criticalItems = maintenanceAssets
      .filter(asset => asset.maintenance_criticality === 'Alta')
      .map(asset => ({
        assetId: asset.id,
        name: asset.description,
        status: (asset.maintenance_status as MaintenanceStatus) || 'Pendente',
        nextMaintenance: asset.next_maintenance_date,
      }))
      .sort((a, b) => {
        if (a.status === 'Atrasada' && b.status !== 'Atrasada') return -1;
        if (b.status === 'Atrasada' && a.status !== 'Atrasada') return 1;
        return 0;
      })
      .slice(0, 5);

    return {
      totalThisMonth,
      overdue,
      nextSevenDays,
      totalCost,
      criticalItems,
      statusDistribution,
    };
  }, [assets]);

  const maintenanceStatusData = useMemo(
    () => MAINTENANCE_STATUSES.map(status => ({ name: status, value: maintenanceMetrics.statusDistribution[status] })),
    [maintenanceMetrics],
  );

  const upcomingMaintenance = useMemo(() =>
    assets
      .filter(asset => asset.next_maintenance_date)
      .sort((a, b) => new Date(a.next_maintenance_date!).getTime() - new Date(b.next_maintenance_date!).getTime())
      .slice(0, 5),
  [assets]);

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
      setIsApplyingFilter(false);
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
    calculateStatistics(filteredAssets);
    const timeout = window.setTimeout(() => setIsApplyingFilter(false), 300);
    return () => window.clearTimeout(timeout);
  }, [filteredAssets]);

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
        <Select value={periodFilter} onValueChange={handlePeriodChange}>
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

      <div className="relative mb-8 animate-fade-in">
        {isApplyingFilter && renderFilterOverlay()}
        <div
          className={cn(
            "grid grid-cols-1 xl:grid-cols-3 gap-6",
            isApplyingFilter && "pointer-events-none opacity-50",
          )}
        >
          <Card className="p-6 border-0 shadow-card">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-2xl bg-primary/10">
                <Wrench className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-xs uppercase text-muted-foreground">Manutenções do mês</p>
                <p className="text-3xl font-bold text-foreground">{maintenanceMetrics.totalThisMonth}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-[11px] uppercase text-muted-foreground">Atrasadas</p>
                <p className="text-xl font-semibold text-destructive">{maintenanceMetrics.overdue}</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3">
                <p className="text-[11px] uppercase text-muted-foreground">Próximos 7 dias</p>
                <p className="text-xl font-semibold text-emerald-500">{maintenanceMetrics.nextSevenDays}</p>
              </div>
              <div className="rounded-lg border border-border/60 p-3 col-span-2">
                <p className="text-[11px] uppercase text-muted-foreground">Custo estimado</p>
                <p className="text-lg font-semibold">
                  {maintenanceMetrics.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold">Status das manutenções</h3>
              <Badge variant="outline" className="gap-1 text-xs">
                <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
                {maintenanceMetrics.overdue} atrasadas
              </Badge>
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={maintenanceStatusData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80}>
                    {maintenanceStatusData.map((entry, index) => (
                      <Cell key={entry.name} fill={MAINTENANCE_STATUS_COLORS[index % MAINTENANCE_STATUS_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [`${value} manutenções`, 'Quantidade']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 border-0 shadow-card">
            <h3 className="text-sm font-semibold mb-4">Próximas manutenções</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingMaintenance.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                      Nenhuma manutenção programada.
                    </TableCell>
                  </TableRow>
                )}
                {upcomingMaintenance.map(asset => (
                  <TableRow key={asset.id}>
                    <TableCell>{format(new Date(asset.next_maintenance_date!), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-medium">{asset.description}</TableCell>
                    <TableCell>
                      <MaintenanceStatusBadge status={(asset.maintenance_status as MaintenanceStatus) || 'Pendente'} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
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