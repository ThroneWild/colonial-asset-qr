import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isAfter,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
  differenceInCalendarDays,
} from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Calendar as CalendarIcon, Clock, FileText, ListChecks, Plus, Search, Wrench } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, LineChart, Line, CartesianGrid, XAxis, YAxis, BarChart, Bar } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatePicker } from '@/components/ui/date-picker';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/types/asset';
import {
  MAINTENANCE_CRITICALITIES,
  MAINTENANCE_FREQUENCIES,
  MAINTENANCE_PRIORITIES,
  MAINTENANCE_RESPONSIBLES,
  MAINTENANCE_STATUSES,
  MAINTENANCE_TYPES,
  MaintenanceChecklistItem,
  MaintenanceCriticality,
  MaintenanceFrequencyValue,
  MaintenancePriority,
  MaintenanceStatus,
  MaintenanceTask,
  MaintenanceType,
  MaintenanceWorkOrder,
} from '@/types/maintenance';
import { MaintenanceStatusBadge } from '@/components/maintenance/MaintenanceStatusBadge';
import { cn } from '@/lib/utils';

interface CalendarTask extends MaintenanceTask {
  notes?: string | null;
  checklist?: MaintenanceChecklistItem[];
  workOrder?: MaintenanceWorkOrder;
}

interface FiltersState {
  sector: string;
  type: string;
  responsible: string;
  criticality: string;
  search: string;
}

interface ScheduleFormState {
  assetId: string;
  date: Date;
  type: MaintenanceType;
  status: MaintenanceStatus;
  responsible: string;
  frequency: MaintenanceFrequencyValue;
  customInterval?: number | null;
  priority: MaintenancePriority;
  criticality: MaintenanceCriticality;
  estimatedTime: number;
  estimatedCost: number;
  notes: string;
}

const STATUS_COLORS: Record<MaintenanceStatus, string> = {
  Pendente: 'bg-yellow-500/15 border-yellow-500/30 text-yellow-800',
  Agendada: 'bg-blue-500/15 border-blue-500/30 text-blue-800',
  'Em andamento': 'bg-orange-500/15 border-orange-500/40 text-orange-800',
  Concluída: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-700',
  Atrasada: 'bg-red-500/15 border-red-500/30 text-red-700 animate-pulse',
};

const STATUS_CHART_COLORS = ['#FACC15', '#38BDF8', '#FB923C', '#34D399', '#F87171'];

const MaintenanceCalendar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading } = useAuth();

  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetTasks, setAssetTasks] = useState<CalendarTask[]>([]);
  const [manualTasks, setManualTasks] = useState<CalendarTask[]>([]);
  const [selectedTask, setSelectedTask] = useState<CalendarTask | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [draggingTaskId, setDraggingTaskId] = useState<string | null>(null);
  const [filters, setFilters] = useState<FiltersState>({ sector: 'all', type: 'all', responsible: 'all', criticality: 'all', search: '' });
  const [scheduleForm, setScheduleForm] = useState<ScheduleFormState>({
    assetId: '',
    date: new Date(),
    type: 'Preventiva',
    status: 'Agendada',
    responsible: MAINTENANCE_RESPONSIBLES[0],
    frequency: MAINTENANCE_FREQUENCIES[0].value,
    customInterval: null,
    priority: 'Média',
    criticality: 'Média',
    estimatedTime: 2,
    estimatedCost: 0,
    notes: '',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    const state = location.state as { openSchedule?: boolean; action?: 'register' | 'schedule' } | null;
    if (state?.openSchedule) {
      setIsScheduleOpen(true);
      if (state.action === 'register') {
        setScheduleForm(prev => ({ ...prev, status: 'Concluída' }));
      } else if (state.action === 'schedule') {
        setScheduleForm(prev => ({ ...prev, status: 'Agendada' }));
      }
      navigate(location.pathname, { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    if (user) {
      fetchAssets();
    }
  }, [user]);

  const fetchAssets = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const assetData = (data || []) as Asset[];
      setAssets(assetData);

      const mappedTasks: CalendarTask[] = assetData
        .filter((asset) => (asset as any).next_maintenance_date)
        .map((asset) => ({
          id: `asset-${asset.id}`,
          assetId: asset.id,
          asset: {
            id: asset.id,
            description: asset.description,
            sector: asset.sector,
            asset_group: asset.asset_group,
          },
          title: asset.description,
          type: ((asset as any).maintenance_type as MaintenanceType) || 'Preventiva',
          status: ((asset as any).maintenance_status as MaintenanceStatus) || 'Pendente',
          frequency: ((asset as any).maintenance_frequency as MaintenanceFrequencyValue) || MAINTENANCE_FREQUENCIES[1].value,
          customInterval: (asset as any).maintenance_custom_interval || undefined,
          lastMaintenance: (asset as any).last_maintenance_date,
          nextMaintenance: (asset as any).next_maintenance_date!,
          responsible: (asset as any).maintenance_responsible || MAINTENANCE_RESPONSIBLES[0],
          criticality: ((asset as any).maintenance_criticality as MaintenanceCriticality) || 'Média',
          workOrder: undefined,
          checklist: [],
          sector: asset.sector,
          itemGroup: asset.asset_group,
          priority: ((asset as any).maintenance_priority as MaintenancePriority) || 'Média',
          estimatedCost: (asset as any).maintenance_cost || undefined,
          notes: (asset as any).maintenance_notes,
        }));

      setAssetTasks(mappedTasks);
    } catch (error) {
      toast.error('Erro ao carregar informações de manutenção');
    } finally {
      setIsLoading(false);
    }
  };

  const tasks = useMemo(() => [...assetTasks, ...manualTasks], [assetTasks, manualTasks]);

  useEffect(() => {
    if (selectedTask) {
      const updated = tasks.find((task) => task.id === selectedTask.id);
      if (updated) {
        setSelectedTask(updated);
      }
    }
  }, [tasks, selectedTask]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (filters.sector !== 'all' && task.sector && task.sector !== filters.sector) return false;
      if (filters.type !== 'all' && task.type !== filters.type) return false;
      if (filters.responsible !== 'all' && task.responsible !== filters.responsible) return false;
      if (filters.criticality !== 'all' && task.criticality !== filters.criticality) return false;
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(searchTerm);
        const matchesResponsible = task.responsible.toLowerCase().includes(searchTerm);
        if (!matchesTitle && !matchesResponsible) return false;
      }

      return true;
    });
  }, [tasks, filters]);

  const calendarDates = useMemo(() => {
    if (viewMode === 'month') {
      const start = startOfWeek(startOfMonth(selectedDate), { weekStartsOn: 0 });
      const end = endOfWeek(endOfMonth(selectedDate), { weekStartsOn: 0 });
      return eachDayOfInterval({ start, end });
    }

    if (viewMode === 'week') {
      const start = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const end = endOfWeek(selectedDate, { weekStartsOn: 0 });
      return eachDayOfInterval({ start, end });
    }

    return [selectedDate];
  }, [viewMode, selectedDate]);

  const summaryMetrics = useMemo(() => {
    const today = new Date();
    const totalThisMonth = filteredTasks.filter((task) => isSameMonth(parseISO(task.nextMaintenance), today)).length;
    const overdue = filteredTasks.filter((task) => {
      const taskDate = parseISO(task.nextMaintenance);
      return (task.status === 'Atrasada' || isBefore(taskDate, today)) && task.status !== 'Concluída';
    }).length;
    const nextSevenDays = filteredTasks.filter((task) => {
      const taskDate = parseISO(task.nextMaintenance);
      return isAfter(taskDate, today) && differenceInCalendarDays(taskDate, today) <= 7;
    }).length;
    const totalCost = filteredTasks.reduce((sum, task) => sum + (task.estimatedCost || 0), 0);

    const criticalItems = filteredTasks
      .filter((task) => task.criticality === 'Alta')
      .sort((a, b) => (a.priority === 'Alta' ? -1 : 1))
      .slice(0, 5);

    const statusDistribution: Record<MaintenanceStatus, number> = {
      Pendente: 0,
      Agendada: 0,
      'Em andamento': 0,
      Concluída: 0,
      Atrasada: 0,
    };

    filteredTasks.forEach((task) => {
      statusDistribution[task.status] += 1;
    });

    return {
      totalThisMonth,
      overdue,
      nextSevenDays,
      totalCost,
      criticalItems,
      statusDistribution,
    };
  }, [filteredTasks]);

  const statusChartData = useMemo(
    () => MAINTENANCE_STATUSES.map((status) => ({ name: status, value: summaryMetrics.statusDistribution[status] })),
    [summaryMetrics],
  );

  const monthlyHistoryData = useMemo(() => {
    const historyMap = new Map<string, number>();

    tasks.forEach((task) => {
      const date = parseISO(task.nextMaintenance);
      const key = format(date, 'yyyy-MM');
      historyMap.set(key, (historyMap.get(key) || 0) + 1);
    });

    return Array.from(historyMap.entries())
      .map(([key, value]) => {
        const [year, month] = key.split('-').map(Number);
        const reference = new Date(year, (month || 1) - 1, 1);
        return {
          name: format(reference, 'MMM/yy', { locale: ptBR }),
          value,
          sortKey: key,
        };
      })
      .sort((a, b) => a.sortKey.localeCompare(b.sortKey))
      .slice(-6);
  }, [tasks]);

  const sectorData = useMemo(() => {
    const map = new Map<string, number>();
    filteredTasks.forEach((task) => {
      const key = task.sector || 'Sem setor';
      map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredTasks]);

  const upcomingTasks = useMemo(() =>
    [...filteredTasks]
      .sort((a, b) => parseISO(a.nextMaintenance).getTime() - parseISO(b.nextMaintenance).getTime())
      .slice(0, 6),
  [filteredTasks]);

  const updateTask = (id: string, updater: (task: CalendarTask) => CalendarTask) => {
    setAssetTasks((prev) => prev.map((task) => (task.id === id ? updater(task) : task)));
    setManualTasks((prev) => prev.map((task) => (task.id === id ? updater(task) : task)));
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>, date: Date) => {
    event.preventDefault();
    const taskId = event.dataTransfer.getData('text/plain') || draggingTaskId;
    if (!taskId) return;

    updateTask(taskId, (task) => ({
      ...task,
      nextMaintenance: date.toISOString(),
      status: task.status === 'Concluída' ? task.status : 'Agendada',
    }));

    setSelectedTask((prev) => (prev && prev.id === taskId ? { ...prev, nextMaintenance: date.toISOString() } : prev));
    toast.success('Manutenção reagendada com sucesso!');
  };

  const handlePrev = () => {
    setSelectedDate((prev) => {
      if (viewMode === 'month') return addMonths(prev, -1);
      if (viewMode === 'week') return addWeeks(prev, -1);
      return addDays(prev, -1);
    });
  };

  const handleNext = () => {
    setSelectedDate((prev) => {
      if (viewMode === 'month') return addMonths(prev, 1);
      if (viewMode === 'week') return addWeeks(prev, 1);
      return addDays(prev, 1);
    });
  };

  const generateChecklist = (asset?: Asset | null): MaintenanceChecklistItem[] => {
    const base: MaintenanceChecklistItem[] = [
      { id: '1', description: 'Verificar condições gerais do equipamento', completed: false },
      { id: '2', description: 'Registrar medições e parâmetros críticos', completed: false },
      { id: '3', description: 'Limpar e lubrificar componentes necessários', completed: false },
    ];

    if (asset?.asset_group) {
      base.push({ id: '4', description: `Testar funcionamento do grupo ${asset.asset_group}`, completed: false });
    }

    return base;
  };

  const handleSchedule = () => {
    if (!scheduleForm.assetId) {
      toast.error('Selecione um item para agendar a manutenção');
      return;
    }

    const asset = assets.find((item) => item.id === scheduleForm.assetId);
    if (!asset) {
      toast.error('Item não encontrado');
      return;
    }

    const maintenanceId = `manual-${Date.now()}`;
    const workOrder: MaintenanceWorkOrder = {
      id: `wo-${Date.now()}`,
      number: `OS-${new Date().getFullYear()}-${String(tasks.length + 1).padStart(4, '0')}`,
      maintenanceId,
      assetId: asset.id,
      scheduledDate: scheduleForm.date.toISOString(),
      description: scheduleForm.notes || `Manutenção ${scheduleForm.type.toLowerCase()} do item ${asset.description}`,
      checklist: generateChecklist(asset),
      beforeImages: [],
      afterImages: [],
      technician: scheduleForm.responsible,
      estimatedTime: scheduleForm.estimatedTime,
      estimatedCost: scheduleForm.estimatedCost,
      priority: scheduleForm.priority,
      status: scheduleForm.status,
    };

    const newTask: CalendarTask = {
      id: maintenanceId,
      assetId: asset.id,
      asset: {
        id: asset.id,
        description: asset.description,
        sector: asset.sector,
        asset_group: asset.asset_group,
      },
      title: asset.description,
      type: scheduleForm.type,
      status: scheduleForm.status,
      frequency: scheduleForm.frequency,
      customInterval: scheduleForm.frequency === 'custom' ? scheduleForm.customInterval || undefined : undefined,
      lastMaintenance: asset.last_maintenance_date,
      nextMaintenance: scheduleForm.date.toISOString(),
      responsible: scheduleForm.responsible,
      criticality: scheduleForm.criticality,
      sector: asset.sector,
      itemGroup: asset.asset_group,
      priority: scheduleForm.priority,
      estimatedCost: scheduleForm.estimatedCost,
      notes: scheduleForm.notes,
      checklist: workOrder.checklist,
      workOrder,
    };

    setManualTasks((prev) => [...prev, newTask]);
    setIsScheduleOpen(false);
    setSelectedTask(newTask);
    setIsDetailOpen(true);
    toast.success('Manutenção agendada com sucesso!');
  };

  const computeNextMaintenance = (task: CalendarTask) => {
    const interval = task.frequency === 'custom' ? task.customInterval || 0 : parseInt(task.frequency, 10);
    if (!interval) return task.nextMaintenance;
    return addDays(new Date(), interval).toISOString();
  };

  const handleStartWorkOrder = (task: CalendarTask) => {
    updateTask(task.id, (current) => ({
      ...current,
      status: 'Em andamento',
      workOrder: current.workOrder
        ? { ...current.workOrder, status: 'Em andamento', startedAt: new Date().toISOString() }
        : current.workOrder,
    }));
    toast.success('Execução iniciada');
  };

  const handleFinishWorkOrder = (task: CalendarTask) => {
    const nowIso = new Date().toISOString();
    const next = computeNextMaintenance(task);

    updateTask(task.id, (current) => ({
      ...current,
      status: 'Concluída',
      lastMaintenance: nowIso,
      nextMaintenance: next,
      workOrder: current.workOrder
        ? { ...current.workOrder, status: 'Concluída', finishedAt: nowIso }
        : current.workOrder,
    }));

    setSelectedTask((prev) =>
      prev && prev.id === task.id
        ? { ...prev, status: 'Concluída', lastMaintenance: nowIso, nextMaintenance: next }
        : prev,
    );

    toast.success('Manutenção concluída');
  };

  const renderDayCell = (date: Date) => {
    const dayTasks = filteredTasks.filter((task) => isSameDay(parseISO(task.nextMaintenance), date));
    const isCurrentMonth = isSameMonth(date, selectedDate);
    const isToday = isSameDay(date, new Date());

    return (
      <div
        key={date.toISOString()}
        className={cn(
          'border border-border/50 rounded-xl p-3 min-h-[130px] flex flex-col gap-2 bg-background/80 hover:bg-muted/60 transition-colors',
          !isCurrentMonth && 'bg-muted/40 text-muted-foreground',
        )}
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => handleDrop(event, date)}
      >
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wide">
          <span className={cn(isToday && 'text-primary')}>{format(date, "dd MMM", { locale: ptBR })}</span>
          {dayTasks.length > 0 && (
            <Badge variant="outline" className="text-[10px] font-medium">
              {dayTasks.length} OS
            </Badge>
          )}
        </div>
        <div className="space-y-2 overflow-hidden">
          {dayTasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(event) => {
                setDraggingTaskId(task.id);
                event.dataTransfer.setData('text/plain', task.id);
              }}
              onClick={() => {
                setSelectedTask(task);
                setIsDetailOpen(true);
              }}
              className={cn(
                'rounded-md border px-2 py-1.5 text-xs leading-tight cursor-pointer transition-transform hover:-translate-y-0.5 shadow-sm',
                STATUS_COLORS[task.status],
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold line-clamp-1">{task.title}</span>
                <span className="text-[10px] uppercase">{task.priority}</span>
              </div>
              <p className="text-[11px] text-muted-foreground line-clamp-1">{task.responsible}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center space-y-2">
          <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Carregando módulo de manutenção preventiva...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl space-y-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-4xl font-display font-bold">Controle de Manutenção Preventiva</h1>
          <p className="text-muted-foreground">Agende, acompanhe e otimize as manutenções do hotel em um só lugar.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
          <Dialog open={isScheduleOpen} onOpenChange={setIsScheduleOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Agendar manutenção
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Nova manutenção preventiva</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label>Item</Label>
                  <Select
                    value={scheduleForm.assetId}
                    onValueChange={(value) => setScheduleForm((prev) => ({ ...prev, assetId: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o item" />
                    </SelectTrigger>
                    <SelectContent>
                      {assets.map((asset) => (
                        <SelectItem key={asset.id} value={asset.id}>
                          {asset.description}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data agendada</Label>
                  <DatePicker
                    value={scheduleForm.date}
                    onChange={(date) =>
                      setScheduleForm((prev) => ({ ...prev, date: date ?? prev.date }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select
                    value={scheduleForm.type}
                    onValueChange={(value: MaintenanceType) => setScheduleForm((prev) => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Tipo de manutenção" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={scheduleForm.status}
                    onValueChange={(value: MaintenanceStatus) => setScheduleForm((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Status" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_STATUSES.map((status) => (
                        <SelectItem key={status} value={status}>
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Responsável</Label>
                  <Select
                    value={scheduleForm.responsible}
                    onValueChange={(value) => setScheduleForm((prev) => ({ ...prev, responsible: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Equipe responsável" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_RESPONSIBLES.map((responsible) => (
                        <SelectItem key={responsible} value={responsible}>
                          {responsible}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select
                    value={scheduleForm.frequency}
                    onValueChange={(value: MaintenanceFrequencyValue) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        frequency: value,
                        customInterval: value === 'custom' ? prev.customInterval : null,
                      }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Frequência" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_FREQUENCIES.map((frequency) => (
                        <SelectItem key={frequency.value} value={frequency.value}>
                          {frequency.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {scheduleForm.frequency === 'custom' && (
                  <div className="space-y-2">
                    <Label>Intervalo personalizado (dias)</Label>
                    <Input
                      type="number"
                      min={1}
                      value={scheduleForm.customInterval ?? ''}
                      onChange={(event) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          customInterval: event.target.value ? parseInt(event.target.value, 10) : null,
                        }))
                      }
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={scheduleForm.priority}
                    onValueChange={(value: MaintenancePriority) => setScheduleForm((prev) => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Prioridade" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_PRIORITIES.map((priority) => (
                        <SelectItem key={priority} value={priority}>
                          {priority}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Criticidade</Label>
                  <Select
                    value={scheduleForm.criticality}
                    onValueChange={(value: MaintenanceCriticality) => setScheduleForm((prev) => ({ ...prev, criticality: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Criticidade" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_CRITICALITIES.map((criticality) => (
                        <SelectItem key={criticality} value={criticality}>
                          {criticality}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tempo estimado (horas)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={scheduleForm.estimatedTime}
                    onChange={(event) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        estimatedTime: Number(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Custo estimado (R$)</Label>
                  <Input
                    type="number"
                    min={0}
                    step="0.01"
                    value={scheduleForm.estimatedCost}
                    onChange={(event) =>
                      setScheduleForm((prev) => ({
                        ...prev,
                        estimatedCost: Number(event.target.value),
                      }))
                    }
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Observações</Label>
                  <Textarea
                    rows={3}
                    value={scheduleForm.notes}
                    onChange={(event) => setScheduleForm((prev) => ({ ...prev, notes: event.target.value }))}
                    placeholder="Detalhes da ordem de serviço, checklists e informações relevantes"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsScheduleOpen(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSchedule}>Agendar manutenção</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="p-6 shadow-sm border-border/60">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" onClick={handlePrev}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="text-left">
              <p className="text-xs uppercase text-muted-foreground">Referência</p>
              <p className="text-lg font-semibold">
                {viewMode === 'day'
                  ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                  : viewMode === 'week'
                    ? `Semana de ${format(startOfWeek(selectedDate, { weekStartsOn: 0 }), "dd/MM", { locale: ptBR })} a ${format(endOfWeek(selectedDate, { weekStartsOn: 0 }), "dd/MM", { locale: ptBR })}`
                    : format(selectedDate, "MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value as 'month' | 'week' | 'day')}>
            <ToggleGroupItem value="month">Mensal</ToggleGroupItem>
            <ToggleGroupItem value="week">Semanal</ToggleGroupItem>
            <ToggleGroupItem value="day">Diário</ToggleGroupItem>
          </ToggleGroup>

          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-3" />
              <Input
                className="pl-9 w-64"
                placeholder="Buscar por item ou responsável"
                value={filters.search}
                onChange={(event) => {
                  const value = event.target.value.toLowerCase();
                  setFilters((prev) => ({
                    ...prev,
                    search: value,
                  }));
                }}
              />
            </div>
            <div className="flex gap-2">
              <Select
                value={filters.sector}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, sector: value }))}
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Setor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os setores</SelectItem>
                  {[...new Set(assets.map((asset) => asset.sector))].map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.type}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, type: value }))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  {MAINTENANCE_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.responsible}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, responsible: value }))}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Responsável" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {MAINTENANCE_RESPONSIBLES.map((responsible) => (
                    <SelectItem key={responsible} value={responsible}>
                      {responsible}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={filters.criticality}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, criticality: value }))}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Criticidade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  {MAINTENANCE_CRITICALITIES.map((criticality) => (
                    <SelectItem key={criticality} value={criticality}>
                      {criticality}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div
          className={cn(
            'grid gap-3 mt-6',
            viewMode === 'month'
              ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-7'
              : viewMode === 'week'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-7'
                : 'grid-cols-1',
          )}
        >
          {calendarDates.map((date) => renderDayCell(date))}
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="p-6 space-y-4 shadow-sm border-border/60">
          <div className="flex items-center gap-3">
            <Wrench className="h-10 w-10 rounded-full bg-primary/10 text-primary p-2" />
            <div>
              <p className="text-sm text-muted-foreground">Total de manutenções do mês</p>
              <p className="text-3xl font-bold">{summaryMetrics.totalThisMonth}</p>
            </div>
          </div>
          <Separator />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs uppercase text-muted-foreground">Atrasadas</p>
              <p className="text-2xl font-semibold text-red-500">{summaryMetrics.overdue}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-muted-foreground">Próximos 7 dias</p>
              <p className="text-2xl font-semibold text-emerald-500">{summaryMetrics.nextSevenDays}</p>
            </div>
          </div>
          <div>
            <p className="text-xs uppercase text-muted-foreground">Custo estimado</p>
            <p className="text-lg font-semibold">
              {summaryMetrics.totalCost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border-border/60">
          <h3 className="text-sm font-semibold mb-4">Status das manutenções</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusChartData} dataKey="value" nameKey="name" innerRadius={40} outerRadius={80}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={entry.name} fill={STATUS_CHART_COLORS[index % STATUS_CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => [`${value} manutenções`, 'Quantidade']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-6 shadow-sm border-border/60">
          <h3 className="text-sm font-semibold mb-4">Itens críticos</h3>
          <ScrollArea className="h-48 pr-4">
            <div className="space-y-3">
              {summaryMetrics.criticalItems.length === 0 && (
                <p className="text-sm text-muted-foreground">Nenhum item crítico no momento.</p>
              )}
              {summaryMetrics.criticalItems.map((task) => (
                <div key={task.id} className="rounded-lg border border-border/60 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm line-clamp-1">{task.title}</span>
                    <MaintenanceStatusBadge status={task.status} />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{task.sector}</span>
                    <span>{format(parseISO(task.nextMaintenance), 'dd/MM/yyyy')}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>
      </div>

      <Card className="p-6 shadow-sm border-border/60">
        <Tabs defaultValue="hist" className="w-full">
          <TabsList className="mb-4 grid grid-cols-3">
            <TabsTrigger value="hist">Histórico Mensal</TabsTrigger>
            <TabsTrigger value="setores">Setores críticos</TabsTrigger>
            <TabsTrigger value="agenda">Próximas manutenções</TabsTrigger>
          </TabsList>
          <TabsContent value="hist" className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyHistoryData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip formatter={(value: number) => [`${value} manutenções`, 'Quantidade']} />
                <Line type="monotone" dataKey="value" stroke="#2563eb" strokeWidth={3} dot />
              </LineChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="setores" className="h-[260px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sectorData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip formatter={(value: number) => [`${value} manutenções`, 'Quantidade']} />
                <Bar dataKey="value" fill="#16a34a" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </TabsContent>
          <TabsContent value="agenda">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>Item</TableHead>
                  <TableHead>Responsável</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Prioridade</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingTasks.map((task) => (
                  <TableRow key={task.id} className="cursor-pointer" onClick={() => { setSelectedTask(task); setIsDetailOpen(true); }}>
                    <TableCell>{format(parseISO(task.nextMaintenance), 'dd/MM/yyyy')}</TableCell>
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.responsible}</TableCell>
                    <TableCell>
                      <MaintenanceStatusBadge status={task.status} />
                    </TableCell>
                    <TableCell>{task.priority}</TableCell>
                  </TableRow>
                ))}
                {upcomingTasks.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                      Nenhuma manutenção agendada.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Card>

      <Sheet open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          {selectedTask && (
            <div className="space-y-5">
              <SheetHeader>
                <SheetTitle>{selectedTask.title}</SheetTitle>
                <SheetDescription>
                  {selectedTask.asset?.asset_group} • {selectedTask.sector}
                </SheetDescription>
              </SheetHeader>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="block text-muted-foreground">Status</span>
                  <MaintenanceStatusBadge status={selectedTask.status} className="mt-1" />
                </div>
                <div>
                  <span className="block text-muted-foreground">Responsável</span>
                  <p className="font-medium">{selectedTask.responsible}</p>
                </div>
                <div>
                  <span className="block text-muted-foreground">Data agendada</span>
                  <p className="font-medium">{format(parseISO(selectedTask.nextMaintenance), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                </div>
                <div>
                  <span className="block text-muted-foreground">Tipo</span>
                  <p className="font-medium">{selectedTask.type}</p>
                </div>
                <div>
                  <span className="block text-muted-foreground">Prioridade</span>
                  <p className="font-medium">{selectedTask.priority}</p>
                </div>
                <div>
                  <span className="block text-muted-foreground">Criticidade</span>
                  <p className="font-medium">{selectedTask.criticality}</p>
                </div>
              </div>

              {selectedTask.notes && (
                <Card className="p-4 bg-muted/40">
                  <h4 className="text-sm font-semibold mb-2">Observações</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-line">{selectedTask.notes}</p>
                </Card>
              )}

              {selectedTask.workOrder && (
                <Card className="p-4 space-y-4 bg-muted/40 border-dashed">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold">Ordem de Serviço #{selectedTask.workOrder.number}</h4>
                      <p className="text-xs text-muted-foreground">Tempo estimado: {selectedTask.workOrder.estimatedTime}h</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {selectedTask.workOrder.priority} prioridade
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      {selectedTask.workOrder.startedAt
                        ? `Iniciada em ${format(parseISO(selectedTask.workOrder.startedAt), 'dd/MM/yyyy HH:mm')}`
                        : 'Ainda não iniciada'}
                    </div>
                    {selectedTask.workOrder.finishedAt && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <CalendarIcon className="h-4 w-4" />
                        {`Finalizada em ${format(parseISO(selectedTask.workOrder.finishedAt), 'dd/MM/yyyy HH:mm')}`}
                      </div>
                    )}
                  </div>

                  {selectedTask.checklist && selectedTask.checklist.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm font-semibold">
                        <ListChecks className="h-4 w-4" />
                        Checklist técnico
                      </div>
                      <ul className="list-disc pl-5 text-sm text-muted-foreground space-y-1">
                        {selectedTask.checklist.map((item) => (
                          <li key={item.id}>{item.description}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    {selectedTask.workOrder.status !== 'Em andamento' && selectedTask.status !== 'Concluída' && (
                      <Button size="sm" onClick={() => handleStartWorkOrder(selectedTask)}>
                        Iniciar execução
                      </Button>
                    )}
                    {selectedTask.status !== 'Concluída' && (
                      <Button size="sm" onClick={() => handleFinishWorkOrder(selectedTask)}>
                        Finalizar manutenção
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <FileText className="h-4 w-4 mr-2" />
                      Gerar PDF
                    </Button>
                  </div>
                </Card>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default MaintenanceCalendar;
