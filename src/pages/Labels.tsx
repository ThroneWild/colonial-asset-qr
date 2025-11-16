import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Asset } from '@/types/asset';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Printer, Loader2 } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/hooks/useAuth';
import logoPrize from '@/assets/logo-prize.png';

const Labels = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from;
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
      setIsLoadingAssets(true);
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .order('item_number', { ascending: true });

      if (error) throw error;
      setAssets((data || []) as Asset[]);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Erro ao carregar ativos:', error);
      }
      toast.error('Erro ao carregar ativos');
    } finally {
      setIsLoadingAssets(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const toggleAsset = (id: string) => {
    if (isLoadingAssets) return;
    setSelectedAssets((prev) =>
      prev.includes(id) ? prev.filter((assetId) => assetId !== id) : [...prev, id]
    );
  };

  const toggleAll = () => {
    if (isLoadingAssets) return;
    if (selectedAssets.length === assets.length) {
      setSelectedAssets([]);
    } else {
      setSelectedAssets(assets.map((a) => a.id));
    }
  };

  useEffect(() => {
    if (assets.length === 0) return;
    const stored = sessionStorage.getItem('selectedAssetsForLabels');
    if (stored) {
      try {
        const parsed: Asset[] = JSON.parse(stored);
        const ids = parsed.map((asset) => asset.id);
        setSelectedAssets(ids.filter((id) => assets.some((asset) => asset.id === id)));
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Erro ao restaurar seleção de etiquetas:', error);
        }
      } finally {
        sessionStorage.removeItem('selectedAssetsForLabels');
      }
    }
  }, [assets]);

  const selectedAssetsList = assets.filter((asset) => selectedAssets.includes(asset.id));

  const handleBack = () => {
    navigate(from || '/assets');
  };

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
      <header className="bg-primary text-primary-foreground py-4 px-4 shadow-md print:hidden">
        <div className="container mx-auto">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleBack} className="text-primary-foreground hover:bg-primary-foreground/10">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <img src={logoPrize} alt="Prize Patrimônios" className="h-10 w-auto" />
            <div>
              <h1 className="text-xl font-bold">Geração de Etiquetas</h1>
              <p className="text-xs text-primary-foreground/90">
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
                disabled={isLoadingAssets || assets.length === 0}
              />
              <label htmlFor="select-all" className="text-sm font-medium cursor-pointer">
                {isLoadingAssets
                  ? 'Carregando ativos...'
                  : `Selecionar todos (${selectedAssets.length} de ${assets.length})`}
              </label>
            </div>
            <Button onClick={handlePrint} disabled={selectedAssets.length === 0 || isLoadingAssets}>
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Etiquetas
            </Button>
          </div>

          {isLoadingAssets ? (
            <div className="flex flex-col items-center justify-center gap-3 py-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Carregando ativos para etiquetas...</span>
            </div>
          ) : assets.length === 0 ? (
            <div className="rounded-lg border border-dashed border-muted-foreground/40 bg-muted/10 p-6 text-center text-sm text-muted-foreground">
              Nenhum ativo disponível para gerar etiquetas.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 p-2">
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
          )}
        </div>

        <div className="hidden print:block print-labels-grid">
          <div className="grid grid-cols-4 gap-2 bg-white">
            {selectedAssetsList.map((asset) => (
              <div
                key={asset.id}
                className="border-2 border-black page-break-inside-avoid bg-white"
                style={{ width: '195px', height: '155px', padding: '6px' }}
              >
                <div className="flex flex-col h-full">
                  <div className="flex items-center justify-center border-b-2 border-black pb-1 mb-2">
                    <img src={logoPrize} alt="Prize Patrimônios" className="h-8 w-auto" />
                  </div>

                  <div className="flex-1 flex gap-2">
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="text-[10px] font-bold leading-tight mb-1">HCI-{String(asset.item_number).padStart(6, '0')}</p>
                        <p className="text-[8px] font-medium leading-tight line-clamp-4">{asset.description}</p>
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
            margin: 0;
            padding: 0;
            background: white !important;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          
          body * {
            visibility: hidden !important;
          }
          
          .print-labels-grid,
          .print-labels-grid * {
            visibility: visible !important;
          }
          
          .print-labels-grid {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            background: white !important;
          }
          
          .page-break-inside-avoid {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          
          .line-clamp-4 {
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        }
      `}</style>
    </div>
  );
};

export default Labels;
