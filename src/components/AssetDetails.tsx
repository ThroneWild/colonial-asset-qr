import { Asset } from '@/types/asset';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { X, Printer, Download, Info, History, Edit, FileText, Wrench } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { AssetHistory } from './AssetHistory';
import { useAssetHistory } from '@/hooks/useAssetHistory';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { MaintenanceStatusBadge } from '@/components/maintenance/MaintenanceStatusBadge';
import { MaintenanceHistoryList } from '@/components/maintenance/MaintenanceHistoryList';
import { MAINTENANCE_STATUSES, type MaintenanceStatus } from '@/types/maintenance';

interface AssetDetailsProps {
  asset: Asset;
  onClose: () => void;
  onEdit?: () => void;
}

export const AssetDetails = ({ asset, onClose, onEdit }: AssetDetailsProps) => {
  const { history, loading: historyLoading } = useAssetHistory(asset?.id);
  const assetUrl = `${window.location.origin}/asset/${asset.id}`;

  const isValidMaintenanceStatus = (status: string): status is MaintenanceStatus =>
    MAINTENANCE_STATUSES.includes(status as MaintenanceStatus);

  const handleViewInvoice = async () => {
    if (!asset.invoice_url) return;
    
    try {
      const { data, error } = await supabase.storage
        .from('invoices')
        .createSignedUrl(asset.invoice_url, 60);

      if (error) throw error;
      
      window.open(data.signedUrl, '_blank');
    } catch (error) {
      console.error('Erro ao abrir nota fiscal:', error);
      toast.error('Erro ao abrir nota fiscal');
    }
  };

  const handlePrintLabel = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 256;
    canvas.height = 256;
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const svgData = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      ctx.drawImage(img, 0, 0, 256, 256);
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `qrcode-${asset.item_number}.png`;
          a.click();
          URL.revokeObjectURL(url);
        }
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const getConservationBadge = (state: string) => {
    switch (state) {
      case 'Novo':
        return 'glass-excellent';
      case 'Bom':
        return 'glass-good';
      case 'Regular':
        return 'glass-fair';
      case 'Ruim':
        return 'glass-poor';
      default:
        return 'outline';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <Card className="w-full max-w-4xl max-h-[95vh] flex flex-col shadow-elegant my-auto">
      <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">Detalhes do Ativo</h2>
          <div className="flex gap-2">
            {onEdit && (
              <Button onClick={onEdit} size="sm" variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
            )}
            <Button onClick={onClose} size="sm" variant="ghost">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="info" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Informações
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Histórico
            </TabsTrigger>
            <TabsTrigger value="maintenance" className="flex items-center gap-2">
              <Wrench className="h-4 w-4" />
              Manutenções
            </TabsTrigger>
          </TabsList>

          <TabsContent value="info" className="space-y-6">
            <Card className="p-6 bg-muted/30">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Informações Gerais</h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">Item Nº</dt>
                  <dd className="text-lg font-semibold text-primary">#{asset.item_number}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">Estado de Conservação</dt>
                  <dd>
                    <Badge variant={getConservationBadge(asset.conservation_state)} className="text-sm font-semibold">
                      {asset.conservation_state}
                    </Badge>
                  </dd>
                </div>
                <div className="md:col-span-2">
                  <dt className="text-sm font-medium text-muted-foreground mb-1">Descrição</dt>
                  <dd className="text-foreground">{asset.description}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">Setor</dt>
                  <dd className="text-foreground">{asset.sector}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-muted-foreground mb-1">Grupo</dt>
                  <dd className="text-foreground">{asset.asset_group}</dd>
                </div>
                {asset.location_type === 'apartamento' && asset.apartment_number && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">Apartamento</dt>
                    <dd>
                      <Badge variant="glass-gold" className="text-sm font-semibold">
                        {asset.apartment_number}
                      </Badge>
                    </dd>
                  </div>
                )}
                {asset.brand_model && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">Marca/Modelo</dt>
                    <dd className="text-foreground">{asset.brand_model}</dd>
                  </div>
                )}
                {asset.evaluation_value && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">Valor de Avaliação</dt>
                    <dd>
                      <Badge variant="glass-gold" className="text-base font-bold">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.evaluation_value)}
                      </Badge>
                    </dd>
                  </div>
                )}
                {asset.invoice_url && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground mb-1">Nota Fiscal</dt>
                    <dd>
                      <Button onClick={handleViewInvoice} variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Ver Nota Fiscal
                      </Button>
                    </dd>
                  </div>
                )}
              </dl>
            </Card>

            <Card className="p-6 bg-muted/30 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-foreground">Controle de Manutenção</h3>
                  <p className="text-sm text-muted-foreground">
                    Acompanhe o status preventivo deste ativo.
                  </p>
                </div>
                {asset.maintenance_status && isValidMaintenanceStatus(asset.maintenance_status) && (
                  <MaintenanceStatusBadge status={asset.maintenance_status} />
                )}
              </div>

              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {asset.maintenance_type && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">Tipo de manutenção</dt>
                    <dd className="text-foreground">{asset.maintenance_type}</dd>
                  </div>
                )}
                {asset.maintenance_responsible && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">Responsável</dt>
                    <dd className="text-foreground">{asset.maintenance_responsible}</dd>
                  </div>
                )}
                {asset.last_maintenance_date && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">Última manutenção</dt>
                    <dd className="text-foreground">
                      {format(new Date(asset.last_maintenance_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </dd>
                  </div>
                )}
                {asset.next_maintenance_date && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">Próxima manutenção</dt>
                    <dd className="text-foreground">
                      {format(new Date(asset.next_maintenance_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </dd>
                  </div>
                )}
                {asset.maintenance_frequency && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">Frequência</dt>
                    <dd className="text-foreground">
                      {asset.maintenance_frequency === 'custom'
                        ? `${asset.maintenance_custom_interval ?? 0} dias`
                        : `${asset.maintenance_frequency} dias`}
                    </dd>
                  </div>
                )}
                {asset.maintenance_priority && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">Prioridade</dt>
                    <dd className="text-foreground">{asset.maintenance_priority}</dd>
                  </div>
                )}
                {asset.maintenance_cost && (
                  <div>
                    <dt className="text-sm font-medium text-muted-foreground mb-1">Custo estimado</dt>
                    <dd className="text-foreground font-semibold">
                      {asset.maintenance_cost.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </dd>
                  </div>
                )}
                {asset.maintenance_notes && (
                  <div className="md:col-span-2">
                    <dt className="text-sm font-medium text-muted-foreground mb-1">Observações</dt>
                    <dd className="text-foreground leading-relaxed">{asset.maintenance_notes}</dd>
                  </div>
                )}
              </dl>
            </Card>

            <Card className="p-6 bg-muted/30">
              <h3 className="text-lg font-semibold mb-4 text-foreground">QR Code</h3>
              <div className="flex flex-col items-center gap-4">
                <div id="qr-code" className="bg-white p-4 rounded-lg shadow-card">
                  <QRCodeSVG value={assetUrl} size={200} />
                </div>
                <p className="text-sm text-muted-foreground text-center max-w-md">
                  Escaneie este QR Code para acessar rapidamente as informações deste ativo
                </p>
                <div className="flex gap-2">
                  <Button onClick={handleDownloadQR} variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Baixar QR Code
                  </Button>
                  <Button onClick={handlePrintLabel} size="sm">
                    <Printer className="h-4 w-4 mr-2" />
                    Imprimir Etiqueta
                  </Button>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-muted/30">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Registro</h3>
              <div className="space-y-2 text-sm">
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Criado em:</span>{' '}
                  {format(new Date(asset.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
                <p className="text-muted-foreground">
                  <span className="font-medium text-foreground">Última atualização:</span>{' '}
                  {format(new Date(asset.updated_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <AssetHistory history={history} loading={historyLoading} asset={asset} />
          </TabsContent>

          <TabsContent value="maintenance">
            <MaintenanceHistoryList records={asset.maintenance_history || undefined} />
          </TabsContent>
        </Tabs>
      </div>
      </Card>
    </div>
  );
};
