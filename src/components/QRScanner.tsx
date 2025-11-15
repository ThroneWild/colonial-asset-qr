import { useCallback, useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, Camera } from 'lucide-react';
import { toast } from 'sonner';

interface QRScannerProps {
  onScan: (data: string) => void;
  onClose: () => void;
}

export const QRScanner = ({ onScan, onClose }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const qrCodeRegionId = 'qr-reader';

  const startScanner = useCallback(async () => {
    try {
      setErrorMessage(null);
      setIsInitializing(true);
      const html5QrCode = new Html5Qrcode(qrCodeRegionId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        (decodedText) => {
          onScan(decodedText);
          stopScanner();
        },
        (errorMessage) => {
          // Scanner errors are expected during scanning
        }
      );
      setIsScanning(true);
      setIsInitializing(false);
    } catch (err) {
      console.error('Error starting scanner:', err);
      setIsScanning(false);
      setIsInitializing(false);
      setErrorMessage('Não foi possível acessar a câmera. Verifique as permissões do navegador ou tente em outro dispositivo.');
      try {
        await scannerRef.current?.clear();
      } catch (clearError) {
        console.error('Error clearing scanner:', clearError);
      }
      scannerRef.current = null;
      toast.error('Erro ao iniciar câmera. Verifique as permissões.');
    }
  }, [onScan]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        await scannerRef.current.stop();
        scannerRef.current.clear();
      } catch (err) {
        console.error('Error stopping scanner:', err);
      }
    }
    setIsScanning(false);
  }, []);

  useEffect(() => {
    startScanner();
    return () => {
      stopScanner();
    };
  }, [startScanner, stopScanner]);

  const handleRetry = async () => {
    await stopScanner();
    startScanner();
  };

  const handleClose = () => {
    stopScanner();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 shadow-elegant">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">Scanner de QR Code</h3>
          </div>
          <Button variant="ghost" size="icon" onClick={handleClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="space-y-4">
          <div 
            id={qrCodeRegionId} 
            className="w-full rounded-lg overflow-hidden border-2 border-primary/20"
          />
          
          <p className="text-sm text-muted-foreground text-center">
            {errorMessage
              ? errorMessage
              : isScanning
                ? 'Aponte a câmera para o QR Code da etiqueta'
                : isInitializing
                  ? 'Iniciando câmera...'
                  : 'Preparando câmera...'}
          </p>

          {errorMessage ? (
            <div className="space-y-2">
              <Button variant="default" onClick={handleRetry} className="w-full">
                Tentar novamente
              </Button>
              <Button variant="outline" onClick={handleClose} className="w-full">
                Fechar
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={handleClose}
              className="w-full"
            >
              Cancelar
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
