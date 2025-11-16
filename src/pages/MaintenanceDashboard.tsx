import { useCallback, useEffect, useMemo, useState } from 'react';
import { differenceInCalendarDays, format, isBefore, isSameMonth } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/types/asset';
import {
  MaintenanceDashboardMetrics,
  MAINTENANCE_STATUSES,
  MaintenanceStatus,
} from '@/types/maintenance';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MaintenanceStatusBadge } from '@/components/maintenance/MaintenanceStatusBadge';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import {
  AlertTriangle,
  CalendarDays,
  CalendarPlus,
  ClipboardList,
  Loader2,
  Wrench,
} from 'lucide-react';
import { PageHeading } from '@/components/ui/page-heading';

const MAINTENANCE_STATUS_COLORS = ['#facc15', '#38bdf8', '#fb923c', '#34d399', '#f87171'];

const MaintenanceDashboard = () => {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const fetchAssets = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setAssets((data || []) as Asset[]);
    } catch (error) {
      console.error('Erro ao carregar dados de manutenção:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAssets();
    }
  }, [user, fetchAssets]);

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

  const upcomingMaintenance = useMemo(
    () =>
      assets
        .filter(asset => asset.next_maintenance_date)
        .sort(
          (a, b) =>
            new Date(a.next_maintenance_date!).getTime() - new Date(b.next_maintenance_date!).getTime(),
        )
        .slice(0, 5),
    [assets],
  );

  const overdueMaintenance = useMemo(
    () =>
      assets
        .filter(asset => {
          if (!asset.next_maintenance_date) return false;
          const nextDate = new Date(asset.next_maintenance_date);
          const status = (asset.maintenance_status as MaintenanceStatus) || 'Pendente';
          return (status === 'Atrasada' || isBefore(nextDate, new Date())) && status !== 'Concluída';
        })
        .sort(
          (a, b) =>
            new Date(a.next_maintenance_date!).getTime() - new Date(b.next_maintenance_date!).getTime(),
        ),
    [assets],
  );

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Carregando módulo de manutenção...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

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
            <BreadcrumbPage className="text-slate-200">Manutenções</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <PageHeading
        eyebrow="Manutenção"
        title="Controle das ordens de serviço"
        description="Monitore agendamentos preventivos, intervenções corretivas e custos associados a cada patrimônio."
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              className="border-white/15 bg-background/60 text-slate-200 hover:border-primary/50 hover:bg-primary/10"
              onClick={() => navigate('/maintenance/calendar')}
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Ver calendário
            </Button>
            <Button
              className="border-white/15 bg-accent/10 text-accent hover:bg-accent/20"
              onClick={() =>
                navigate('/maintenance/calendar', {
                  state: { openSchedule: true, action: 'register' },
                })
              }
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Registrar manutenção
            </Button>
            <Button
              className="border-white/15 bg-primary/20 text-primary hover:bg-primary/30"
              onClick={() =>
                navigate('/maintenance/calendar', {
                  state: { openSchedule: true, action: 'schedule' },
                })
              }
            >
              <CalendarPlus className="mr-2 h-4 w-4" />
              Programar manutenção
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <Card className="glass rounded-3xl border border-white/10 p-6 shadow-hover">
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
            <div className="rounded-2xl border border-white/10 bg-background/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Atrasadas</p>
              <p className="text-xl font-semibold text-accent">{maintenanceMetrics.overdue}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-background/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Próximos 7 dias</p>
              <p className="text-xl font-semibold text-emerald-400">{maintenanceMetrics.nextSevenDays}</p>
            </div>
            <div className="col-span-2 rounded-2xl border border-white/10 bg-background/60 p-3">
              <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Custo estimado</p>
              <p className="text-lg font-semibold text-slate-100">
                {maintenanceMetrics.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </Card>

        <Card className="glass rounded-3xl border border-white/10 p-6 shadow-hover">
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

        <Card className="glass rounded-3xl border border-white/10 p-6 shadow-hover">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="glass rounded-3xl border border-white/10 p-6 shadow-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Itens críticos</h3>
            <Badge variant="secondary" className="text-xs">
              Top 5
            </Badge>
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
                <TableRow key={item.assetId}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>
                    {item.nextMaintenance
                      ? format(new Date(item.nextMaintenance), 'dd/MM/yyyy')
                      : 'Sem data'}
                  </TableCell>
                  <TableCell>
                    <MaintenanceStatusBadge status={item.status} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>

        <Card className="glass rounded-3xl border border-white/10 p-6 shadow-hover">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Manutenções atrasadas</h3>
            <Badge variant="destructive" className="text-xs">
              {overdueMaintenance.length}
            </Badge>
          </div>
          <div className="space-y-4">
            {overdueMaintenance.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Ótimo trabalho! Nenhuma manutenção atrasada no momento.
              </p>
            )}
            {overdueMaintenance.map(asset => (
              <div
                key={asset.id}
                className="rounded-lg border border-border/60 p-4 hover:bg-muted/40 transition-colors cursor-pointer"
                onClick={() => navigate(`/asset/${asset.id}`)}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{asset.description}</p>
                  <MaintenanceStatusBadge status={(asset.maintenance_status as MaintenanceStatus) || 'Pendente'} />
                </div>
                <p className="text-sm text-muted-foreground">
                  Próxima manutenção: {format(new Date(asset.next_maintenance_date!), 'dd/MM/yyyy')}
                </p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MaintenanceDashboard;
