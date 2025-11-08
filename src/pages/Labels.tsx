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
                    <p className="text-sm font-semibold text-primary">Item #{asset.item_number}</p>
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
          <div className="grid grid-cols-2 gap-4">
            {selectedAssetsList.map((asset) => (
              <div
                key={asset.id}
                className="border-2 border-black p-4 page-break-inside-avoid"
                style={{ minHeight: '280px' }}
              >
                <div className="flex flex-col h-full">
                  <div className="text-center border-b-2 border-black pb-3 mb-3">
                    <h3 className="text-xl font-bold">Hotel Colonial Iguaçu</h3>
                    <p className="text-sm text-gray-600 mt-1">Patrimônio</p>
                  </div>

                  <div className="flex-1 flex items-center justify-between gap-4">
                    <div className="flex-1 space-y-2">
                      <div>
                        <p className="text-xs font-semibold text-gray-600">ITEM</p>
                        <p className="text-2xl font-bold">#{asset.item_number}</p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-gray-600">DESCRIÇÃO</p>
                        <p className="text-sm font-medium leading-tight">{asset.description}</p>
                      </div>
                      {asset.brand_model && (
                        <div>
                          <p className="text-xs font-semibold text-gray-600">MARCA/MODELO</p>
                          <p className="text-sm">{asset.brand_model}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2 pt-2">
                        <div>
                          <p className="text-xs font-semibold text-gray-600">SETOR</p>
                          <p className="text-xs">{asset.sector}</p>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-600">GRUPO</p>
                          <p className="text-xs">{asset.asset_group}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-center">
                      <div className="bg-white p-2 border border-gray-300">
                        <QRCodeSVG
                          value={asset.qr_code_url || `${window.location.origin}/asset/${asset.id}`}
                          size={120}
                          level="H"
                        />
                      </div>
                      <p className="text-xs text-center mt-2 text-gray-600">Escaneie para detalhes</p>
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
            margin: 1cm;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          .page-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
      `}</style>
    </div>
  );
};

export default Labels;
