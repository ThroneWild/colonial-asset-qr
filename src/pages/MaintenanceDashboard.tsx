import { useEffect, useMemo, useState } from 'react';
import { differenceInCalendarDays, format, isBefore, isSameMonth } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { AlertTriangle, CalendarPlus, Loader2, Wrench } from 'lucide-react';

import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/types/asset';
import { MaintenanceDashboardMetrics, MaintenanceStatus, MAINTENANCE_STATUSES } from '@/types/maintenance';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MaintenanceStatusBadge } from '@/components/maintenance/MaintenanceStatusBadge';
import { SkeletonStatsGrid } from '@/components/ui/skeleton-stats';
import { SkeletonChart } from '@/components/ui/skeleton-chart';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const MAINTENANCE_STATUS_COLORS = ['#facc15', '#38bdf8', '#fb923c', '#34d399', '#f87171'];

const MaintenanceDashboard = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [authLoading, user, navigate]);

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

      setAssets(data || []);
    } catch (error) {
      console.error('Erro ao carregar dados de manutenção:', error);
      toast.error('Não foi possível carregar os dados de manutenção');
    } finally {
      setLoading(false);
    }
  };

  const maintenanceAssets = useMemo(() => assets.filter(asset => asset.next_maintenance_date), [assets]);

  const maintenanceMetrics = useMemo<MaintenanceDashboardMetrics>(() => {
    const today = new Date();

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
        responsible: asset.maintenance_responsible,
      }))
      .sort((a, b) => {
        if (a.status === 'Atrasada' && b.status !== 'Atrasada') return -1;
        if (b.status === 'Atrasada' && a.status !== 'Atrasada') return 1;
        return 0;
      })
      .slice(0, 8);

    return {
      totalThisMonth,
      overdue,
      nextSevenDays,
      totalCost,
      criticalItems,
      statusDistribution,
    };
  }, [maintenanceAssets]);

  const maintenanceStatusData = useMemo(
    () => MAINTENANCE_STATUSES.map(status => ({ name: status, value: maintenanceMetrics.statusDistribution[status] })),
    [maintenanceMetrics],
  );

  const upcomingMaintenance = useMemo(
    () =>
      maintenanceAssets
        .slice()
        .sort((a, b) => {
          if (!a.next_maintenance_date) return 1;
          if (!b.next_maintenance_date) return -1;
          return new Date(a.next_maintenance_date).getTime() - new Date(b.next_maintenance_date).getTime();
        })
        .slice(0, 10),
    [maintenanceAssets],
  );

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <SkeletonStatsGrid count={3} />
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/')} className="cursor-pointer">
              Início
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Manutenção</BreadcrumbPage>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Dashboard de Manutenção</h1>
          <p className="text-muted-foreground">Monitoramento completo das rotinas preventivas e corretivas</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => navigate('/maintenance/calendar')} className="gap-2">
            <CalendarPlus className="h-4 w-4" />
            Abrir calendário
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 border-0 shadow-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Wrench className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Manutenções no mês</p>
              <p className="text-3xl font-bold text-foreground">{maintenanceMetrics.totalThisMonth}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Manutenções atrasadas</p>
              <p className="text-3xl font-bold text-destructive">{maintenanceMetrics.overdue}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-card">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-sky-500/10">
              <Loader2 className="h-6 w-6 text-sky-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Próximos 7 dias</p>
              <p className="text-3xl font-bold text-sky-600">{maintenanceMetrics.nextSevenDays}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 border-0 shadow-card">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Custo estimado</p>
            <p className="text-2xl font-bold">
              {maintenanceMetrics.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 border-0 shadow-card xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Próximas manutenções</h3>
            <Badge variant="outline" className="gap-1 text-xs">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              {upcomingMaintenance.length} agendadas
            </Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Item</TableHead>
                <TableHead>Responsável</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {upcomingMaintenance.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-sm text-muted-foreground">
                    Nenhuma manutenção programada.
                  </TableCell>
                </TableRow>
              )}
              {upcomingMaintenance.map(asset => (
                <TableRow key={asset.id} className="cursor-pointer" onClick={() => navigate(`/asset/${asset.id}`)}>
                  <TableCell>{asset.next_maintenance_date ? format(new Date(asset.next_maintenance_date), 'dd/MM/yyyy') : '-'}</TableCell>
                  <TableCell className="font-medium">{asset.description}</TableCell>
                  <TableCell>{asset.maintenance_responsible || '—'}</TableCell>
                  <TableCell>
                    <MaintenanceStatusBadge status={(asset.maintenance_status as MaintenanceStatus) || 'Pendente'} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6 border-0 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Distribuição por status</h3>
            <Badge variant="outline" className="gap-1 text-xs">
              <AlertTriangle className="h-3.5 w-3.5 text-destructive" />
              {maintenanceMetrics.overdue} atrasadas
            </Badge>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={maintenanceStatusData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90}>
                  {maintenanceStatusData.map((entry, index) => (
                    <Cell key={entry.name} fill={MAINTENANCE_STATUS_COLORS[index % MAINTENANCE_STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} manutenções`, 'Quantidade']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 border-0 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Itens críticos</h3>
            <Badge variant="secondary" className="text-xs">Prioridade alta</Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead>Próxima manutenção</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {maintenanceMetrics.criticalItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-muted-foreground">
                    Nenhum item crítico pendente.
                  </TableCell>
                </TableRow>
              )}
              {maintenanceMetrics.criticalItems.map(item => (
                <TableRow key={item.assetId} className="cursor-pointer" onClick={() => navigate(`/asset/${item.assetId}`)}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.nextMaintenance ? format(new Date(item.nextMaintenance), 'dd/MM/yyyy') : '-'}</TableCell>
                  <TableCell>
                    <MaintenanceStatusBadge status={item.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="p-6 border-0 shadow-card">
          <h3 className="text-sm font-semibold mb-4">Ações rápidas</h3>
          <div className="space-y-3 text-sm text-muted-foreground">
            <p>• Gere ordens de serviço para iniciar uma manutenção programada.</p>
            <p>• Atualize o status das manutenções em andamento para manter os indicadores corretos.</p>
            <p>• Use o calendário para reagendar manutenções conforme disponibilidade da equipe.</p>
          </div>
          <Button className="mt-6 w-full" onClick={() => navigate('/maintenance/calendar')}>
            Gerenciar calendário
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
