import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileDown, FileText, Image as ImageIcon, ListChecks } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { MaintenanceRecord } from "@/types/maintenance";
import { MaintenanceStatusBadge } from "./MaintenanceStatusBadge";

export interface MaintenanceHistoryListProps {
  records?: MaintenanceRecord[] | null;
}

export const MaintenanceHistoryList = ({ records }: MaintenanceHistoryListProps) => {
  if (!records || records.length === 0) {
    return (
      <Card className="p-6 bg-muted/30 text-center">
        <p className="text-sm text-muted-foreground">
          Nenhum histórico de manutenção encontrado para este item. Cadastre manutenções preventivas para acompanhar a evolução.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {records.map((record) => (
        <Card key={record.id} className="p-6 space-y-4 shadow-sm border-border/60">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h4 className="text-lg font-semibold">{record.type} • {record.technician}</h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(record.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <MaintenanceStatusBadge status={record.status} />
          </div>

          <div className="flex flex-wrap gap-2">
            {record.cost && (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 border-emerald-500/30">
                Custo: {record.cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </Badge>
            )}
            {record.observations && (
              <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 border-blue-500/30">
                Observações registradas
              </Badge>
            )}
          </div>

          {record.observations && (
            <p className="text-sm text-muted-foreground leading-relaxed">
              {record.observations}
            </p>
          )}

          {record.checklist && record.checklist.length > 0 && (
            <div className="space-y-2">
              <Separator />
              <div className="flex items-center gap-2 text-sm font-medium">
                <ListChecks className="h-4 w-4" />
                Checklist técnico
              </div>
              <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                {record.checklist.map((item) => (
                  <li key={item.id} className={item.completed ? 'line-through text-emerald-600' : ''}>
                    {item.description}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {record.attachments && record.attachments.length > 0 && (
            <div className="space-y-2">
              <Separator />
              <div className="flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="h-4 w-4" />
                Anexos e fotos
              </div>
              <div className="flex flex-wrap gap-2">
                {record.attachments.map((attachment) => (
                  <Button key={attachment} variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Visualizar anexo
                  </Button>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Baixar OS em PDF
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
};
