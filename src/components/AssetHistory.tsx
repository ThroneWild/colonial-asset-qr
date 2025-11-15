import { useState, useMemo } from 'react';
import { AssetHistoryEntry, Asset } from '@/types/asset';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, User, Edit, Plus, Trash2, Filter, X, Calendar, ArrowRight, TrendingUp, AlertCircle, FileDown } from 'lucide-react';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from '@/components/ui/input';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import logoPrize from '@/assets/logo-prize.png';
import { toast } from 'sonner';

interface AssetHistoryProps {
  history: AssetHistoryEntry[];
  loading: boolean;
  asset?: Asset;
}

interface HistoryFilters {
  action: string;
  user: string;
  dateFrom: string;
  dateTo: string;
}

type SupabaseHistoryEntry = Omit<AssetHistoryEntry, 'user_profile'> & {
  user_profile: { full_name: string; email: string } | null;
};

const fieldLabels: Record<string, string> = {
  description: 'Descrição',
  sector: 'Setor',
  asset_group: 'Grupo',
  conservation_state: 'Estado de Conservação',
  brand_model: 'Marca/Modelo',
  evaluation_value: 'Valor de Avaliação',
  invoice_url: 'Nota Fiscal',
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
    case 'invoice_url':
      return value ? 'Anexada' : 'Não anexada';
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

export const AssetHistory = ({ history, loading, asset }: AssetHistoryProps) => {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<HistoryFilters>({
    action: 'all',
    user: 'all',
    dateFrom: '',
    dateTo: '',
  });

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    const users = history.reduce<Array<{ id: string; name: string }>>((acc, entry) => {
      if (entry.user_profile) {
        acc.push({ id: entry.user_id, name: entry.user_profile.full_name });
      }
      return acc;
    }, []);

    const uniqueMap = new Map(users.map(user => [user.id, user]));
    return Array.from(uniqueMap.values());
  }, [history]);

  // Filter history based on filters
  const filteredHistory = useMemo(() => {
    return history.filter(entry => {
      // Filter by action
      if (filters.action !== 'all' && entry.action !== filters.action) {
        return false;
      }

      // Filter by user
      if (filters.user !== 'all' && entry.user_id !== filters.user) {
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
  }, [history, filters]);

  const clearFilters = () => {
    setFilters({
      action: 'all',
      user: 'all',
      dateFrom: '',
      dateTo: '',
    });
  };

  const hasActiveFilters = filters.action !== 'all' || filters.user !== 'all' || filters.dateFrom || filters.dateTo;

  const handleExportPDF = () => {
    const doc = new jsPDF('portrait');
    
    // Add logo
    const imgWidth = 30;
    const imgHeight = 15;
    doc.addImage(logoPrize, 'PNG', 14, 10, imgWidth, imgHeight);
    
    // Header - Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Histórico de Auditoria', 105, 17, { align: 'center' });
    
    // Asset info
    if (asset) {
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Ativo: #${asset.item_number} - ${asset.description}`, 14, 32);
    }
    
    // Report info
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const now = new Date();
    const dateStr = format(now, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    
    doc.text(`Data do Relatório: ${dateStr}`, 14, 40);
    doc.text(`Total de Registros: ${filteredHistory.length}`, 14, 46);
    
    // Separator line
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 52, 196, 52);
    
    let yPos = 58;
    
    // Summary section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Resumo de Alterações', 14, yPos);
    yPos += 8;
    
    // Count by action type
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
    
    // Detailed history
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Histórico Detalhado', 14, yPos);
    yPos += 8;
    
    // Process each history entry
    filteredHistory.forEach((entry, index) => {
      // Check if we need a new page
      if (yPos > 260) {
        doc.addPage();
        yPos = 20;
      }
      
      // Entry header with colored background
      const actionColors: Record<string, [number, number, number]> = {
        created: [76, 175, 80],
        updated: [33, 150, 243],
        deleted: [244, 67, 54],
        sector_changed: [156, 39, 176],
      };
      
      const color = actionColors[entry.action] || [158, 158, 158];
      doc.setFillColor(...color);
      doc.rect(14, yPos - 4, 182, 8, 'F');
      
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text(`${index + 1}. ${getActionLabel(entry.action)}`, 16, yPos + 2);
      
      const entryDate = format(new Date(entry.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
      doc.text(entryDate, 180, yPos + 2, { align: 'right' });
      
      doc.setTextColor(0, 0, 0);
      yPos += 10;
      
      // User info
      if (entry.user_profile) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.text(`Responsável: ${entry.user_profile.full_name}`, 16, yPos);
        yPos += 5;
        doc.text(`Email: ${entry.user_profile.email}`, 16, yPos);
        yPos += 7;
      } else {
        yPos += 3;
      }
      
      // Changed fields for updates
      if (entry.changed_fields && entry.changed_fields.length > 0 && entry.action === 'updated') {
        const relevantFields = entry.changed_fields.filter(
          field => !['id', 'created_at', 'updated_at', 'modified_by', 'user_id', 'qr_code_url'].includes(field)
        );
        
        if (relevantFields.length > 0) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'bold');
          doc.text(`Campos Alterados (${relevantFields.length}):`, 16, yPos);
          yPos += 6;
          
          relevantFields.forEach((field) => {
            // Check page break
            if (yPos > 260) {
              doc.addPage();
              yPos = 20;
            }
            
            const oldValue = entry.old_values?.[field as keyof typeof entry.old_values];
            const newValue = entry.new_values?.[field as keyof typeof entry.new_values];
            
            doc.setFontSize(9);
            doc.setFont('helvetica', 'bold');
            doc.text(`• ${fieldLabels[field] || field}`, 20, yPos);
            yPos += 5;
            
            doc.setFont('helvetica', 'normal');
            doc.setTextColor(200, 0, 0);
            const oldText = `  Anterior: ${formatFieldValue(field, oldValue)}`;
            doc.text(oldText, 22, yPos);
            yPos += 5;
            
            doc.setTextColor(0, 150, 0);
            const newText = `  Novo: ${formatFieldValue(field, newValue)}`;
            doc.text(newText, 22, yPos);
            yPos += 6;
            
            doc.setTextColor(0, 0, 0);
          });
        }
      } else if (entry.action === 'created') {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'italic');
        doc.text('Ativo cadastrado no sistema com sucesso', 16, yPos);
        yPos += 5;
      } else if (entry.action === 'deleted' && entry.deletion_reason) {
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('Motivo da Exclusão:', 16, yPos);
        yPos += 5;
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(200, 0, 0);
        const lines = doc.splitTextToSize(entry.deletion_reason, 170);
        doc.text(lines, 20, yPos);
        yPos += (lines.length * 5) + 2;
        doc.setTextColor(0, 0, 0);
      }
      
      // Separator between entries
      doc.setDrawColor(230, 230, 230);
      doc.line(14, yPos + 2, 196, yPos + 2);
      yPos += 8;
    });
    
    // Footer on all pages
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
      doc.text(
        'Prize Patrimônios - Sistema de Gestão Patrimonial | By prize hoteis',
        105,
        doc.internal.pageSize.height - 6,
        { align: 'center' }
      );
    }
    
    const fileName = asset 
      ? `historico-ativo-${asset.item_number}-${format(now, 'yyyy-MM-dd')}.pdf`
      : `historico-auditoria-${format(now, 'yyyy-MM-dd')}.pdf`;
    
    doc.save(fileName);
    toast.success('Relatório PDF gerado com sucesso!');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6 glass-light">
            <div className="flex gap-4">
              <Skeleton className="h-12 w-12 rounded-full bg-muted/50" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-6 w-32 bg-muted/50" />
                <Skeleton className="h-4 w-48 bg-muted/50" />
                <Skeleton className="h-20 w-full bg-muted/50" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-12 glass-light text-center">
        <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
          <div className="h-20 w-20 rounded-full bg-muted/50 flex items-center justify-center">
            <Clock className="h-10 w-10 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Sem histórico</h3>
            <p className="text-muted-foreground">Nenhuma alteração foi registrada para este ativo ainda.</p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters Section */}
      <Card className="p-4 glass-light">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-in">
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
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Data Inicial</label>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Data Final</label>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              />
            </div>

            {hasActiveFilters && (
              <div className="md:col-span-2 lg:col-span-4">
                <Button onClick={clearFilters} variant="outline" size="sm" className="w-full">
                  <X className="h-4 w-4 mr-2" />
                  Limpar Filtros
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Timeline */}
      <ScrollArea className="h-[600px] pr-4">
        <div className="space-y-6 relative">
          {/* Timeline line */}
          <div className="absolute left-6 top-8 bottom-8 w-0.5 bg-gradient-to-b from-primary/50 via-accent/30 to-transparent" />

          {filteredHistory.length === 0 ? (
            <Card className="p-12 glass-light text-center">
              <AlertCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum resultado encontrado com os filtros aplicados</p>
            </Card>
          ) : (
            filteredHistory.map((entry, index) => {
              const colors = getActionColor(entry.action);
              const entryDate = new Date(entry.created_at);

              return (
                <Card key={entry.id} className="p-6 glass-light relative ml-12 animate-fade-in hover:shadow-hover transition-smooth">
                  {/* Timeline node */}
                  <div className={`absolute -left-[3.25rem] top-6 h-12 w-12 rounded-full flex items-center justify-center border-4 border-background ${colors.icon} shadow-elegant z-10`}>
                    {getActionIcon(entry.action)}
                  </div>

                  {/* Connection dot */}
                  <div className={`absolute -left-[3.75rem] top-9 h-6 w-6 rounded-full ${colors.timeline} opacity-50`} />

                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-3">
                        <Badge variant={colors.badge} className="text-sm font-semibold px-3 py-1">
                          {getActionLabel(entry.action)}
                        </Badge>
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

                    {/* Changed fields for updates */}
                    {entry.changed_fields && entry.changed_fields.length > 0 && entry.action === 'updated' && (
                      <div className="space-y-3 mt-4">
                        <div className="flex items-center gap-2">
                          <Edit className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm font-semibold text-foreground">
                            {entry.changed_fields.length} {entry.changed_fields.length === 1 ? 'campo alterado' : 'campos alterados'}
                          </p>
                        </div>

                        <div className="grid gap-3">
                          {entry.changed_fields
                            .filter(field => !['id', 'created_at', 'updated_at', 'modified_by', 'user_id', 'qr_code_url'].includes(field))
                            .map((field) => {
                              const oldValue = entry.old_values?.[field as keyof typeof entry.old_values];
                              const newValue = entry.new_values?.[field as keyof typeof entry.new_values];
                              
                              return (
                                <div key={field} className="glass-light rounded-xl p-4 border border-border/50">
                                  <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                                    {fieldLabels[field] || field}
                                  </p>
                                  
                                  <div className="flex items-center gap-3">
                                    {/* Old Value */}
                                    <div className="flex-1 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                                      <p className="text-xs text-muted-foreground mb-1">Valor Anterior</p>
                                      <p className="text-sm font-medium text-destructive line-through">
                                        {formatFieldValue(field, oldValue)}
                                      </p>
                                    </div>

                                    {/* Arrow */}
                                    <ArrowRight className="h-5 w-5 text-muted-foreground flex-shrink-0" />

                                    {/* New Value */}
                                    <div className="flex-1 p-3 rounded-lg bg-primary/10 border border-primary/20">
                                      <p className="text-xs text-muted-foreground mb-1">Novo Valor</p>
                                      <p className="text-sm font-bold text-primary">
                                        {formatFieldValue(field, newValue)}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}

                    {/* Creation details */}
                    {entry.action === 'created' && (
                      <div className="p-4 glass-light rounded-lg border border-primary/20">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-semibold text-primary">Ativo cadastrado</span> no sistema com sucesso
                        </p>
                      </div>
                    )}

                    {/* Deletion reason */}
                    {entry.action === 'deleted' && entry.deletion_reason && (
                      <div className="p-4 glass-light rounded-lg border border-destructive/20 bg-destructive/5">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                          <div>
                            <p className="text-sm font-semibold text-destructive mb-2">Motivo da Exclusão:</p>
                            <p className="text-sm text-foreground">{entry.deletion_reason}</p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </ScrollArea>

      {/* Summary */}
      <Card className="p-4 glass-light">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Total: <span className="font-semibold text-foreground">{filteredHistory.length}</span> {filteredHistory.length === 1 ? 'registro' : 'registros'}</span>
          </div>
          {hasActiveFilters && (
            <Badge variant="glass-primary">Filtrado</Badge>
          )}
        </div>
      </Card>
    </div>
  );
};