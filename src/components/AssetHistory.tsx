import { AssetHistoryEntry } from '@/types/asset';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { Clock, User, Edit, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface AssetHistoryProps {
  history: AssetHistoryEntry[];
  loading: boolean;
}

const fieldLabels: Record<string, string> = {
  description: 'Descrição',
  sector: 'Setor',
  asset_group: 'Grupo',
  conservation_state: 'Estado de Conservação',
  brand_model: 'Marca/Modelo',
  evaluation_value: 'Valor de Avaliação',
};

const getActionLabel = (action: string) => {
  switch (action) {
    case 'created': return 'Criado';
    case 'updated': return 'Atualizado';
    case 'deleted': return 'Excluído';
    default: return action;
  }
};

const getActionIcon = (action: string) => {
  switch (action) {
    case 'created': return <Plus className="h-4 w-4" />;
    case 'updated': return <Edit className="h-4 w-4" />;
    default: return <Edit className="h-4 w-4" />;
  }
};

const getActionColor = (action: string) => {
  switch (action) {
    case 'created': return 'bg-primary/10 text-primary border-primary/20';
    case 'updated': return 'bg-accent/10 text-accent-foreground border-accent/20';
    case 'deleted': return 'bg-destructive/10 text-destructive border-destructive/20';
    default: return 'bg-muted text-muted-foreground border-border';
  }
};

export const AssetHistory = ({ history, loading }: AssetHistoryProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-4">
            <Skeleton className="h-20 w-full" />
          </Card>
        ))}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <Card className="p-8 text-center">
        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <p className="text-muted-foreground">Nenhum histórico de alterações disponível</p>
      </Card>
    );
  }

  return (
    <ScrollArea className="h-[500px] pr-4">
      <div className="space-y-4">
        {history.map((entry, index) => (
          <Card key={entry.id} className="p-4 relative">
            {index !== history.length - 1 && (
              <div className="absolute left-8 top-16 bottom-0 w-0.5 bg-border -mb-4" />
            )}
            
            <div className="flex gap-4">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${getActionColor(entry.action)}`}>
                {getActionIcon(entry.action)}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <Badge variant="outline" className={getActionColor(entry.action)}>
                    {getActionLabel(entry.action)}
                  </Badge>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(entry.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </div>
                </div>

                {entry.user_profile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    <span>{entry.user_profile.full_name}</span>
                  </div>
                )}

                {entry.changed_fields && entry.changed_fields.length > 0 && entry.action === 'updated' && (
                  <div className="mt-3 space-y-2">
                    <p className="text-sm font-medium text-foreground">Campos alterados:</p>
                    {entry.changed_fields
                      .filter(field => !['id', 'created_at', 'updated_at', 'modified_by', 'user_id', 'qr_code_url'].includes(field))
                      .map((field) => {
                        const oldValue = entry.old_values?.[field as keyof typeof entry.old_values];
                        const newValue = entry.new_values?.[field as keyof typeof entry.new_values];
                        
                        return (
                          <div key={field} className="text-sm bg-muted/50 rounded-lg p-3">
                            <p className="font-medium text-foreground mb-1">
                              {fieldLabels[field] || field}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                              <div>
                                <span className="text-muted-foreground">Anterior: </span>
                                <span className="text-destructive line-through">
                                  {oldValue !== null && oldValue !== undefined ? String(oldValue) : '-'}
                                </span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Novo: </span>
                                <span className="text-primary font-medium">
                                  {newValue !== null && newValue !== undefined ? String(newValue) : '-'}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </ScrollArea>
  );
};