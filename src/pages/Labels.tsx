import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Asset } from '@/types/asset';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';

const Labels = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAssets();
    }
  }, [user]);

  const fetchAssets = async () => {
    try {
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('item_number', { ascending: true });

      if (error) throw error;
      setAssets(data || []);
    } catch (error) {
      console.error('Erro ao carregar ativos:', error);
      toast.error('Erro ao carregar ativos');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleAsset = (id: string) => {
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((assetId) => assetId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map((a) => a.id));
    }
  };

  const selectedAssetsList = assets.filter((asset) => selectedAssets.includes(asset.id));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-primary text-primary-foreground py-6 px-4 shadow-md print:hidden">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')} className="text-primary-foreground hover:bg-primary-foreground/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Geração de Etiquetas</h1>
              <p className="text-primary-foreground/90 mt-1">
                Selecione os ativos para imprimir etiquetas
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="print:hidden mb-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Checkbox
                checked={selectedAssets.length === assets.length && assets.length > 0}
                onCheckedChange={toggleAll}
                id="select-all"
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                Selecionar todos ({selectedAssets.length} de {assets.length})
              </label>
            </div>
            <Button onClick={handlePrint} disabled={selectedAssets.length === 0}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Etiquetas
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto p-2">
            {assets.map((asset) => (
              <Card
                key={asset.id}
                className={`p-3 cursor-pointer transition-all ${
                  selectedAssets.includes(asset.id)
                    ? 'border-primary bg-secondary/50'
                    : 'hover:border-muted-foreground'
                }`}
                onClick={() => toggleAsset(asset.id)}
              >
                <div className="flex items-start gap-3">
                  <Checkbox
                    checked={selectedAssets.includes(asset.id)}
                    onCheckedChange={() => toggleAsset(asset.id)}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-primary">HCI-{String(asset.item_number).padStart(6, '0')}</p>
                    <p className="text-sm text-foreground truncate">{asset.description}</p>
                    {asset.brand_model && (
                      <p className="text-xs text-muted-foreground truncate">{asset.brand_model}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        <div className="hidden print:block">
          <div className="grid grid-cols-4 gap-1">
            {selectedAssetsList.map((asset) => (
              <div
                key={asset.id}
                className="border border-black page-break-inside-avoid"
                style={{ width: '180px', height: '130px', padding: '4px' }}
              >
                <div className="flex flex-col h-full">
                  <div className="text-center border-b border-black pb-1 mb-1">
                    <h3 className="text-[8px] font-bold leading-tight">Hotel Colonial Iguaçu</h3>
                  </div>

                  <div className="flex-1 flex gap-1">
                    <div className="flex-1 min-w-0">
                      <div className="mb-1">
                        <p className="text-[9px] font-bold leading-tight">HCI-{String(asset.item_number).padStart(6, '0')}</p>
                      </div>
                      <div>
                        <p className="text-[7px] font-medium leading-tight line-clamp-3">{asset.description}</p>
                      </div>
                    </div>

                    <div className="flex-shrink-0">
                      <div className="bg-white border border-gray-300">
                        <QRCodeSVG
                          value={asset.qr_code_url || `${window.location.origin}/asset/${asset.id}`}
                          size={60}
                          level="H"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0.5cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
};

export default Labels;
