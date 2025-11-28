import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Download as DownloadIcon, Monitor, Apple, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { toast } from 'sonner';

interface Release {
  tag_name: string;
  name: string;
  assets: Array<{
    name: string;
    browser_download_url: string;
    size: number;
  }>;
}

export default function Download() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [latestRelease, setLatestRelease] = useState<Release | null>(null);
  const [noReleasesAvailable, setNoReleasesAvailable] = useState(false);
  const [isCheckingRelease, setIsCheckingRelease] = useState(true);

  useEffect(() => {
    // Buscar a versão mais recente do GitHub
    fetchLatestRelease();
  }, []);

  const fetchLatestRelease = async () => {
    try {
      setIsCheckingRelease(true);
      const response = await fetch(
        'https://api.github.com/repos/ThroneWild/colonial-asset-qr/releases/latest'
      );
      if (response.ok) {
        const data = await response.json();
        setLatestRelease(data);
        setNoReleasesAvailable(false);
      } else if (response.status === 404) {
        // Nenhuma release encontrada
        setNoReleasesAvailable(true);
        setLatestRelease(null);
      }
    } catch (error) {
      setNoReleasesAvailable(true);
    } finally {
      setIsCheckingRelease(false);
    }
  };

  const handleDownload = async (platform: 'windows' | 'mac' | 'linux') => {
    // Verificar se há releases disponíveis
    if (noReleasesAvailable || !latestRelease) {
      toast.error('Nenhuma versão disponível', {
        description: 'Ainda não há releases publicadas. Por favor, tente novamente mais tarde.',
      });
      return;
    }

    setIsLoading(true);

    try {
      let downloadUrl = '';
      let fileName = '';

      if (latestRelease && latestRelease.assets.length > 0) {
        // Encontrar o asset correto baseado na plataforma
        const asset = latestRelease.assets.find((a) => {
          if (platform === 'windows') {
            return a.name.endsWith('.exe');
          } else if (platform === 'mac') {
            return a.name.endsWith('.dmg') || a.name.includes('mac');
          } else if (platform === 'linux') {
            return a.name.endsWith('.AppImage') || a.name.endsWith('.deb');
          }
          return false;
        });

        if (asset) {
          downloadUrl = asset.browser_download_url;
          fileName = asset.name;
        } else {
          // Asset específico não encontrado
          toast.error('Arquivo não encontrado', {
            description: `Não foi possível encontrar a versão para ${platform}. Tente outra plataforma.`,
          });
          setIsLoading(false);
          return;
        }
      }

      if (!downloadUrl) {
        toast.error('Erro ao obter link de download', {
          description: 'Não foi possível gerar o link de download. Por favor, tente novamente.',
        });
        setIsLoading(false);
        return;
      }

      // Criar link temporário e iniciar download
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Download iniciado!', {
        description: `Baixando ${fileName}...`,
      });

      // Aguardar um pouco e redirecionar
      setTimeout(() => {
        navigate('/download/thanks');
      }, 1500);
    } catch (error) {
      toast.error('Erro ao iniciar download', {
        description: 'Por favor, tente novamente.',
      });
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl"
      >
        <Card className="border-2">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center"
            >
              <DownloadIcon className="w-10 h-10 text-primary" />
            </motion.div>
            <CardTitle className="text-3xl font-bold">
              Baixar PrizePatrimonios
            </CardTitle>
            <CardDescription className="text-lg">
              Escolha a versão para o seu sistema operacional
              {latestRelease && (
                <span className="block mt-2 text-sm font-medium text-primary">
                  Versão {latestRelease.tag_name}
                </span>
              )}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Alerta quando não há releases disponíveis */}
            {noReleasesAvailable && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Nenhuma versão disponível</AlertTitle>
                  <AlertDescription>
                    Ainda não há versões do app desktop publicadas. Por favor, aguarde enquanto preparamos a primeira release ou entre em contato com o suporte para mais informações.
                  </AlertDescription>
                </Alert>
              </motion.div>
            )}

            {/* Indicador de carregamento */}
            {isCheckingRelease && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Verificando versões disponíveis...</span>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              {/* Windows */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="group hover:border-primary transition-all cursor-pointer hover:shadow-lg">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-blue-500/10 rounded-lg flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                      <Monitor className="w-8 h-8 text-blue-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Windows</h3>
                      <p className="text-sm text-muted-foreground">
                        Windows 10 ou superior
                      </p>
                      {latestRelease?.assets.find((a) => a.name.endsWith('.exe')) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatFileSize(
                            latestRelease.assets.find((a) => a.name.endsWith('.exe'))!.size
                          )}
                        </p>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleDownload('windows')}
                      disabled={isLoading || noReleasesAvailable || isCheckingRelease}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Baixando...
                        </>
                      ) : (
                        <>
                          <DownloadIcon className="mr-2 h-4 w-4" />
                          Baixar para Windows
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>

              {/* macOS */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="group hover:border-primary transition-all cursor-pointer hover:shadow-lg">
                  <CardContent className="p-6 text-center space-y-4">
                    <div className="mx-auto w-16 h-16 bg-gray-500/10 rounded-lg flex items-center justify-center group-hover:bg-gray-500/20 transition-colors">
                      <Apple className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">macOS</h3>
                      <p className="text-sm text-muted-foreground">
                        macOS 10.15 ou superior
                      </p>
                      {latestRelease?.assets.find((a) => a.name.endsWith('.dmg')) && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatFileSize(
                            latestRelease.assets.find((a) => a.name.endsWith('.dmg'))!.size
                          )}
                        </p>
                      )}
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleDownload('mac')}
                      disabled={isLoading || noReleasesAvailable || isCheckingRelease}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Baixando...
                        </>
                      ) : (
                        <>
                          <DownloadIcon className="mr-2 h-4 w-4" />
                          Baixar para macOS
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Informações adicionais */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-muted/50 rounded-lg p-4 space-y-2"
            >
              <h4 className="font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-primary" />
                Características do app desktop:
              </h4>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6">
                <li>• Acesso offline aos seus dados</li>
                <li>• Atualizações automáticas</li>
                <li>• Performance otimizada</li>
                <li>• Scanner de QR Code integrado</li>
                <li>• Sincronização em tempo real</li>
              </ul>
            </motion.div>

            <div className="flex justify-center">
              <Button variant="ghost" onClick={() => navigate(-1)}>
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
