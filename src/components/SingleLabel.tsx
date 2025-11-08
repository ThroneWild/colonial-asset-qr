import { Asset } from '@/types/asset';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Printer, X } from 'lucide-react';
import logoColonial from '@/assets/logo-colonial.png';

interface SingleLabelProps {
  asset: Asset;
  onClose: () => void;
}

export const SingleLabel = ({ asset, onClose }: SingleLabelProps) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl p-6 shadow-elegant">
        <div className="print:hidden mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-foreground">Etiqueta Pronta</h3>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>
          
          <p className="text-sm text-muted-foreground mb-4">
            Etiqueta gerada para o item <strong>HCI-{String(asset.item_number).padStart(6, '0')}</strong>
          </p>
          
          <div className="flex gap-2">
            <Button onClick={handlePrint} className="flex-1">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Etiqueta
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Fechar
            </Button>
          </div>
        </div>

        <div className="flex justify-center">
          <div
            className="border-2 border-black"
            style={{ width: '195px', height: '155px', padding: '6px' }}
          >
            <div className="flex flex-col h-full">
              <div className="flex items-center justify-center border-b-2 border-black pb-1 mb-2">
                <img src={logoColonial} alt="Hotel Colonial Iguaçu" className="h-8 w-auto" />
              </div>

              <div className="flex-1 flex gap-2">
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <p className="text-[10px] font-bold leading-tight mb-1">
                      HCI-{String(asset.item_number).padStart(6, '0')}
                    </p>
                    <p className="text-[8px] font-medium leading-tight line-clamp-4">
                      {asset.description}
                    </p>
                  </div>
                  <div className="text-[7px] text-gray-600 mt-1">
                    <p className="truncate">{asset.sector}</p>
                  </div>
                </div>

                <div className="flex-shrink-0 flex items-center">
                  <div className="bg-white p-1 border border-gray-400">
                    <QRCodeSVG
                      value={asset.qr_code_url || `${window.location.origin}/asset/${asset.id}`}
                      size={70}
                      level="H"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .border-2.border-black,
          .border-2.border-black * {
            visibility: visible;
          }
          .border-2.border-black {
            position: fixed;
            left: 50%;
            top: 50%;
            transform: translate(-50%, -50%);
          }
        }
        .line-clamp-4 {
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};
