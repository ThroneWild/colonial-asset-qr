import { Asset } from '@/types/asset';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Download, Printer } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface AssetDetailsProps {
  asset: Asset;
  onClose: () => void;
}

export const AssetDetails = ({ asset, onClose }: AssetDetailsProps) => {
  const assetUrl = `${window.location.origin}/asset/${asset.id}`;

  const handlePrintLabel = () => {
    window.print();
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code-svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `qrcode-item-${asset.item_number}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const getConservationColor = (state: string) => {
    switch (state) {
      case 'Novo':
        return 'bg-primary text-primary-foreground';
      case 'Bom':
        return 'bg-secondary text-secondary-foreground';
      case 'Regular':
        return 'bg-accent text-accent-foreground';
      case 'Ruim':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Detalhes do Ativo</h2>
              <p className="text-sm text-muted-foreground mt-1">Item #{asset.item_number}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Descrição</label>
                <p className="text-foreground font-medium mt-1">{asset.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Setor</label>
                  <Badge variant="outline" className="mt-1 block w-fit">
                    {asset.sector}
                  </Badge>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Grupo</label>
                  <Badge variant="outline" className="mt-1 block w-fit">
                    {asset.asset_group}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-muted-foreground">
                  Estado de Conservação
                </label>
                <Badge className={`mt-1 block w-fit ${getConservationColor(asset.conservation_state)}`}>
                  {asset.conservation_state}
                </Badge>
              </div>

              {asset.brand_model && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Marca/Modelo</label>
                  <p className="text-foreground mt-1">{asset.brand_model}</p>
                </div>
              )}

              {asset.evaluation_value && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">
                    Valor de Avaliação
                  </label>
                  <p className="text-foreground font-semibold mt-1">
                    R$ {asset.evaluation_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-col items-center justify-start space-y-4">
              <div className="bg-card p-4 rounded-lg border">
                <QRCodeSVG id="qr-code-svg" value={assetUrl} size={200} level="H" />
              </div>
              <div className="flex gap-2 w-full">
                <Button variant="outline" size="sm" onClick={handleDownloadQR} className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Baixar QR
                </Button>
                <Button variant="outline" size="sm" onClick={handlePrintLabel} className="flex-1">
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimir
                </Button>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                Escaneie o QR Code para acessar os detalhes do ativo
              </p>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
              <div>
                <span className="font-medium">Cadastrado em:</span>
                <p className="mt-1">
                  {new Date(asset.created_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
              <div>
                <span className="font-medium">Atualizado em:</span>
                <p className="mt-1">
                  {new Date(asset.updated_at).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
