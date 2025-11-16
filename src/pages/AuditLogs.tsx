import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Asset, AssetHistoryEntry } from '@/types/asset';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, User, Edit, Plus, Trash2, TrendingUp, Calendar, 
  AlertCircle, Filter, X, FileDown, PackageSearch, ArrowRight 
} from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { EmptyState } from '@/components/EmptyState';
import { toast } from 'sonner';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoPrize from '@/assets/logo-prize.png';

const fieldLabels: Record<string, string> = {
  description: 'Descrição',
  sector: 'Setor',
  asset_group: 'Grupo',
  conservation_state: 'Estado de Conservação',
  brand_model: 'Marca/Modelo',
  evaluation_value: 'Valor de Avaliação',
};

const formatFieldValue = (field: string, value: unknown) => {
  if (value === null || value === undefined) return '-';

  switch (field) {
    case 'evaluation_value':
      return typeof value === 'number'
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
        : '-';
    case 'created_at':
    case 'updated_at':
      return typeof value === 'string'
        ? format(parseISO(value), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
        : '-';
    default:
      return String(value);
  }
};

const getActionLabel = (action: string) => {
  switch (action) {
    case 'created': return 'Criado';
    case 'updated': return 'Atualizado';
    case 'deleted': return 'Excluído';
    case 'sector_changed': return 'Local Alterado';
    default: return action;
  }
};

const getActionIcon = (action: string) => {
  switch (action) {
    case 'created': return <Plus className="h-5 w-5" />;
    case 'updated': return <Edit className="h-5 w-5" />;
    case 'deleted': return <Trash2 className="h-5 w-5" />;
    case 'sector_changed': return <TrendingUp className="h-5 w-5" />;
    default: return <Edit className="h-5 w-5" />;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'created': 
      return {
        badge: 'glass-excellent' as const,
        icon: 'bg-primary/20 text-primary border-primary/30',
        timeline: 'bg-primary',
      };
    case 'updated': 
      return {
        badge: 'glass-primary' as const,
        icon: 'bg-accent/20 text-accent-foreground border-accent/30',
        timeline: 'bg-accent',
      };
    case 'deleted': 
      return {
        badge: 'glass-poor' as const,
        icon: 'bg-destructive/20 text-destructive border-destructive/30',
        timeline: 'bg-destructive',
      };
    case 'sector_changed':
      return {
        badge: 'glass-good' as const,
        icon: 'bg-secondary/20 text-secondary-foreground border-secondary/30',
        timeline: 'bg-secondary',
      };
    default: 
      return {
        badge: 'outline' as const,
        icon: 'bg-muted text-muted-foreground border-border',
        timeline: 'bg-muted',
      };
  }
};

const formatRelativeDate = (date: Date) => {
  if (isToday(date)) {
    return `Hoje às ${format(date, 'HH:mm', { locale: ptBR })}`;
  }
  if (isYesterday(date)) {
    return `Ontem às ${format(date, 'HH:mm', { locale: ptBR })}`;
  }
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

interface Filters {
  action: string;
  user: string;
  asset: string;
  dateFrom: string;
  dateTo: string;
  searchTerm: string;
}

type SupabaseHistoryEntry = Omit<AssetHistoryEntry, 'user_profile'> & {
  user_profile: { full_name: string; email: string } | null;
};

const AuditLogs = () => {
  const [history, setHistory] = useState<AssetHistoryEntry[]>([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    action: 'all',
    user: 'all',
    asset: 'all',
    dateFrom: '',
    dateTo: '',
    searchTerm: '',
  });

  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      const { data: assetsData, error: assetsError } = await supabase
        .from('assets')
        .select('*')
        .order('item_number', { ascending: false });

      if (assetsError) throw assetsError;
      setAssets((assetsData ?? []) as Asset[]);

      const { data: historyData, error: historyError } = await supabase
        .from('asset_history')
        .select(`
          *,
          user_profile:profiles(full_name, email)
        `)
        .order('created_at', { ascending: false });

      if (historyError) throw historyError;

      const transformedData = (historyData ?? []).map((entry) => {
        const typedEntry = entry as SupabaseHistoryEntry;
        return {
          ...typedEntry,
          user_profile: typedEntry.user_profile ?? undefined,
        } satisfies AssetHistoryEntry;
      });

      setHistory(transformedData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar registros de auditoria');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      void fetchData();
    }
  }, [user, fetchData]);

  // Get unique users and assets for filters
  const uniqueUsers = useMemo(() => {
    const users = history
      .filter(entry => entry.user_profile)
      .map(entry => ({
        id: entry.user_id,
        name: entry.user_profile!.full_name,
      }));
    
    const uniqueMap = new Map(users.map(u => [u.id, u]));
    return Array.from(uniqueMap.values());
  }, [history]);

  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      // Search term filter
      if (filters.searchTerm) {
        const asset = assets.find(a => a.id === entry.asset_id);
        const searchLower = filters.searchTerm.toLowerCase();
        const matchesAsset = asset?.description.toLowerCase().includes(searchLower) ||
                           asset?.item_number.toString().includes(searchLower);
        const matchesUser = entry.user_profile?.full_name.toLowerCase().includes(searchLower) ||
                          entry.user_profile?.email.toLowerCase().includes(searchLower);
        
        if (!matchesAsset && !matchesUser) return false;
      }

      // Filter by action
      if (filters.action !== 'all' && entry.action !== filters.action) {
        return false;
      }

      // Filter by user
      if (filters.user !== 'all' && entry.user_id !== filters.user) {
        return false;
      }

      // Filter by asset
      if (filters.asset !== 'all' && entry.asset_id !== filters.asset) {
        return false;
      }

      // Filter by date range
      const entryDate = new Date(entry.created_at);
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        if (entryDate < fromDate) return false;
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999);
        if (entryDate > toDate) return false;
      }

      return true;
    });
  }, [history, filters, assets]);

  const clearFilters = () => {
    setFilters({
      action: 'all',
      user: 'all',
      asset: 'all',
      dateFrom: '',
      dateTo: '',
      searchTerm: '',
    });
  };

  const hasActiveFilters = filters.action !== 'all' || filters.user !== 'all' || 
                          filters.asset !== 'all' || filters.dateFrom || 
                          filters.dateTo || filters.searchTerm;

  const handleExportPDF = () => {
    const doc = new jsPDF('portrait');
    
    doc.addImage(logoPrize, 'PNG', 14, 10, 30, 15);
    
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Registros de Auditoria Global', 105, 17, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const now = new Date();
    const dateStr = format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    
    doc.text(`Data do Relatório: ${dateStr}`, 14, 32);
    doc.text(`Total de Registros: ${filteredHistory.length}`, 14, 38);
    
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 44, 196, 44);
    
    let yPos = 52;
    
    // Summary
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo de Alterações', 14, yPos);
    yPos += 8;
    
    const actionCounts = filteredHistory.reduce((acc, entry) => {
      acc[entry.action] = (acc[entry.action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    Object.entries(actionCounts).forEach(([action, count]) => {
      doc.text(`• ${getActionLabel(action)}: ${count}`, 20, yPos);
      yPos += 6;
    });
    
    yPos += 6;
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Histórico Detalhado', 14, yPos);
    yPos += 8;
    
    filteredHistory.slice(0, 50).forEach((entry, index) => {
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      
      const asset = assets.find(a => a.id === entry.asset_id);
      const assetName = asset ? `#${asset.item_number} - ${asset.description}` : 'Ativo desconhecido';
      
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(`${index + 1}. ${getActionLabel(entry.action)} - ${assetName}`, 16, yPos);
      yPos += 5;
      
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      const entryDate = format(new Date(entry.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      doc.text(`Data: ${entryDate}`, 20, yPos);
      yPos += 5;
      
      if (entry.user_profile) {
        doc.text(`Usuário: ${entry.user_profile.full_name}`, 20, yPos);
        yPos += 7;
      }
      
      yPos += 3;
    });
    
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128);
      doc.text(
        `Página ${i} de ${pageCount}`,
        105,
        doc.internal.pageSize.height - 10,
        { align: 'center' }
      );
    }
    
    const fileName = `auditoria-global-${format(now, 'yyyy-MM-dd')}.pdf`;
    doc.save(fileName);
    toast.success('Relatório PDF gerado com sucesso!');
  };

  const getAssetInfo = (assetId: string) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? `#${asset.item_number} - ${asset.description}` : 'Ativo não encontrado';
  };

  if (authLoading || loading) {
    return (
      <div className="container mx-auto px-6 py-8 max-w-7xl">
        <div className="space-y-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

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
            <BreadcrumbPage>Registros de Auditoria</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="mb-8">
        <h1 className="text-4xl font-display font-bold mb-2">Registros de Auditoria</h1>
        <p className="text-muted-foreground">Visão global de todas as alterações no sistema</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in">
        <Card className="p-6 glass-light">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Registros</p>
              <p className="text-3xl font-bold text-foreground">{history.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-light">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Criações</p>
              <p className="text-3xl font-bold text-foreground">
                {history.filter(h => h.action === 'created').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-light">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-accent/10 flex items-center justify-center">
              <Edit className="h-6 w-6 text-accent-foreground" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Atualizações</p>
              <p className="text-3xl font-bold text-foreground">
                {history.filter(h => h.action === 'updated').length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 glass-light">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Exclusões</p>
              <p className="text-3xl font-bold text-foreground">
                {history.filter(h => h.action === 'deleted').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 glass-light mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-semibold text-foreground">Filtros</h3>
              {hasActiveFilters && (
                <Badge variant="glass-primary" className="ml-2">
                  {filteredHistory.length} de {history.length}
                </Badge>
              )}
            </div>
            <Button
              onClick={handleExportPDF}
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={filteredHistory.length === 0}
            >
              <FileDown className="h-4 w-4" />
              Exportar PDF
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Ocultar' : 'Mostrar'}
          </Button>
        </div>

        {showFilters && (
          <div className="space-y-4 animate-fade-in">
            <Input
              placeholder="Buscar por ativo, usuário ou email..."
              value={filters.searchTerm}
              onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Ação</label>
                <Select value={filters.action} onValueChange={(value) => setFilters({ ...filters, action: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="created">Criado</SelectItem>
                    <SelectItem value="updated">Atualizado</SelectItem>
                    <SelectItem value="deleted">Excluído</SelectItem>
                    <SelectItem value="sector_changed">Local Alterado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Usuário</label>
                <Select value={filters.user} onValueChange={(value) => setFilters({ ...filters, user: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {uniqueUsers.map(user => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Ativo</label>
                <Select value={filters.asset} onValueChange={(value) => setFilters({ ...filters, asset: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {assets.map(asset => (
                      <SelectItem key={asset.id} value={asset.id}>
                        #{asset.item_number} - {asset.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Data Inicial</label>
                <Input
                  type="date"
                  value={filters.dateFrom}
                  onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                  placeholder="dd/mm/aaaa"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground mb-2 block">Data Final</label>
                <Input
                  type="date"
                  value={filters.dateTo}
                  onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                  placeholder="dd/mm/aaaa"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <Button onClick={clearFilters} variant="outline" size="sm" className="w-full">
                <X className="h-4 w-4 mr-2" />
                Limpar Filtros
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* Timeline */}
      {filteredHistory.length === 0 ? (
        <EmptyState
          icon={PackageSearch}
          title="Nenhum registro encontrado"
          description={hasActiveFilters ? "Tente ajustar seus filtros" : "Ainda não há registros de auditoria"}
        />
      ) : (
        <ScrollArea className="h-[600px]">
          <div className="space-y-6 relative pr-4">
            <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/50 via-accent/30 to-transparent" />

            {filteredHistory.map((entry) => {
              const colors = getActionColor(entry.action);
              const entryDate = new Date(entry.created_at);
              const assetInfo = getAssetInfo(entry.asset_id);

              return (
                <Card key={entry.id} className="p-6 glass-light relative ml-12 animate-fade-in hover:shadow-hover transition-smooth">
                  <div className={`absolute -left-[3.25rem] top-6 h-12 w-12 rounded-full flex items-center justify-center border-4 border-background ${colors.icon} shadow-elegant z-10`}>
                    {getActionIcon(entry.action)}
                  </div>

                  <div className={`absolute -left-[3.75rem] top-9 h-6 w-6 rounded-full ${colors.timeline} opacity-50`} />

                  <div className="space-y-4">
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <Badge variant={colors.badge} className="text-sm font-semibold px-3 py-1">
                            {getActionLabel(entry.action)}
                          </Badge>
                          <span className="text-sm font-medium text-foreground">{assetInfo}</span>
                        </div>
                        
                        {entry.user_profile && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{entry.user_profile.full_name}</p>
                              <p className="text-xs text-muted-foreground">{entry.user_profile.email}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatRelativeDate(entryDate)}</span>
                      </div>
                    </div>

                    {entry.changed_fields && entry.changed_fields.length > 0 && entry.action === 'updated' && (
                      <div className="space-y-3 mt-4">
                        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
                          <Edit className="h-4 w-4" />
                          {entry.changed_fields.length} {entry.changed_fields.length === 1 ? 'campo alterado' : 'campos alterados'}
                        </p>
                        <div className="grid gap-2">
                          {entry.changed_fields
                            .filter(field => !['id', 'created_at', 'updated_at', 'modified_by', 'user_id', 'qr_code_url'].includes(field))
                            .slice(0, 3)
                            .map((field) => {
                              const oldValue = entry.old_values?.[field as keyof typeof entry.old_values];
                              const newValue = entry.new_values?.[field as keyof typeof entry.new_values];
                              
                              return (
                                <div key={field} className="text-sm bg-muted/30 rounded-lg p-3 flex items-center gap-2">
                                  <span className="font-medium">{fieldLabels[field] || field}:</span>
                                  <span className="text-destructive line-through">{formatFieldValue(field, oldValue)}</span>
                                  <ArrowRight className="h-3 w-3" />
                                  <span className="text-primary font-semibold">{formatFieldValue(field, newValue)}</span>
                                </div>
                              );
                            })}
                          {entry.changed_fields.length > 3 && (
                            <p className="text-xs text-muted-foreground">
                              + {entry.changed_fields.length - 3} outros campos alterados
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default AuditLogs;
