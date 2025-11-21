import { useEffect, useState } from 'react';
import { useAutoUpdate } from '@/hooks/useAutoUpdate';
import { useAutoUpdateConsent } from '@/hooks/useCookies';
import { isElectron } from '@/utils/electron';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Download, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

/**
 * Componente para exibir notificações de atualização
 */
export function UpdateNotification() {
  const { updateStatus, download, install, isDownloading, checkUpdates } = useAutoUpdate();
  const { hasConsent, giveConsent } = useAutoUpdateConsent();
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showDownloadedDialog, setShowDownloadedDialog] = useState(false);

  // Mostrar diálogo de consentimento na primeira vez
  useEffect(() => {
    if (!hasConsent && isElectron()) {
      // Aguardar 10 segundos após o app iniciar
      const timer = setTimeout(() => {
        setShowConsentDialog(true);
      }, 10000);

      return () => clearTimeout(timer);
    }
  }, [hasConsent]);

  // Reagir às mudanças de status
  useEffect(() => {
    if (!updateStatus) return;

    switch (updateStatus.status) {
      case 'available':
        setShowUpdateDialog(true);
        toast.info('Nova atualização disponível!', {
          description: `Versão ${updateStatus.version} está disponível.`,
          action: {
            label: 'Baixar',
            onClick: () => {
              download();
              setShowUpdateDialog(false);
            },
          },
        });
        break;

      case 'downloaded':
        setShowDownloadedDialog(true);
        toast.success('Atualização baixada!', {
          description: 'A atualização está pronta para ser instalada.',
          action: {
            label: 'Instalar',
            onClick: () => {
              install();
            },
          },
        });
        break;

      case 'error':
        toast.error('Erro ao atualizar', {
          description: updateStatus.error || 'Ocorreu um erro ao verificar atualizações.',
        });
        break;

      case 'not-available':
        console.log('Nenhuma atualização disponível');
        break;
    }
  }, [updateStatus, download, install]);

  const handleConsent = (consent: boolean) => {
    if (consent) {
      giveConsent();
      toast.success('Atualizações automáticas ativadas', {
        description: 'O app verificará atualizações automaticamente.',
      });
      // Verificar imediatamente após dar consentimento
      setTimeout(() => {
        checkUpdates();
      }, 1000);
    }
    setShowConsentDialog(false);
  };

  return (
    <>
      {/* Diálogo de Consentimento */}
      <AlertDialog open={showConsentDialog} onOpenChange={setShowConsentDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Manter o app atualizado?</AlertDialogTitle>
            <AlertDialogDescription>
              Deseja permitir que o PrizePatrimonios verifique automaticamente por atualizações?
              <br />
              <br />
              Isso garante que você sempre tenha acesso aos recursos mais recentes e correções de
              segurança. Você pode alterar esta configuração a qualquer momento nas preferências.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => handleConsent(false)}>
              Não, obrigado
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => handleConsent(true)}>
              Sim, ativar atualizações
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de Atualização Disponível */}
      <AlertDialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Download className="h-5 w-5 text-blue-500" />
              Nova atualização disponível
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                A versão <strong>{updateStatus?.version}</strong> do PrizePatrimonios está
                disponível.
              </p>
              {updateStatus?.releaseNotes && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-2">Novidades:</p>
                  <div className="text-sm whitespace-pre-wrap">{updateStatus.releaseNotes}</div>
                </div>
              )}
              {isDownloading && (
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>Baixando atualização...</span>
                    <span>{updateStatus?.progress?.toFixed(0)}%</span>
                  </div>
                  <Progress value={updateStatus?.progress || 0} />
                </div>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDownloading}>Mais tarde</AlertDialogCancel>
            <AlertDialogAction onClick={() => download()} disabled={isDownloading}>
              {isDownloading ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Baixando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Baixar agora
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Diálogo de Atualização Baixada */}
      <AlertDialog open={showDownloadedDialog} onOpenChange={setShowDownloadedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Atualização pronta para instalar
            </AlertDialogTitle>
            <AlertDialogDescription>
              A versão <strong>{updateStatus?.version}</strong> foi baixada com sucesso.
              <br />
              <br />O app será reiniciado para aplicar a atualização. Deseja instalar agora?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Instalar ao fechar</AlertDialogCancel>
            <AlertDialogAction onClick={() => install()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reiniciar e instalar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * Botão para verificar manualmente por atualizações
 */
export function CheckUpdateButton() {
  const { checkUpdates, isChecking } = useAutoUpdate();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => checkUpdates()}
      disabled={isChecking}
    >
      {isChecking ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Verificando...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Verificar atualizações
        </>
      )}
    </Button>
  );
}

/**
 * Indicador de atualização disponível (para exibir na barra de navegação)
 */
export function UpdateIndicator() {
  const { updateStatus } = useAutoUpdate();

  if (!updateStatus || (updateStatus.status !== 'available' && updateStatus.status !== 'downloaded')) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md text-sm">
      {updateStatus.status === 'downloaded' ? (
        <CheckCircle className="h-4 w-4" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      <span>
        {updateStatus.status === 'downloaded'
          ? 'Atualização pronta'
          : `Versão ${updateStatus.version} disponível`}
      </span>
    </div>
  );
}
