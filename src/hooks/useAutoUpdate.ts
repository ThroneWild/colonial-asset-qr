import { useState, useEffect, useCallback } from 'react';
import {
  isElectron,
  checkForUpdates,
  downloadUpdate,
  installUpdate,
  onUpdateStatus,
  type UpdateStatus,
} from '@/utils/electron';
import { useAutoUpdateConsent } from './useCookies';

/**
 * Hook para gerenciar auto-update no Electron e Web
 */
export function useAutoUpdate() {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { hasConsent } = useAutoUpdateConsent();

  // Listener para status de atualizações (Electron)
  useEffect(() => {
    if (!isElectron()) return;

    const cleanup = onUpdateStatus((status) => {
      setUpdateStatus(status);
      setIsChecking(status.status === 'checking');
      setIsDownloading(status.status === 'downloading');
    });

    return cleanup;
  }, []);

  // Verificar por atualizações
  const checkUpdates = useCallback(async () => {
    if (!hasConsent) {
      console.log('Auto-update desabilitado pelo usuário');
      return;
    }

    setIsChecking(true);
    try {
      if (isElectron()) {
        // Electron: usar auto-updater
        const result = await checkForUpdates();
        if (!result.success && result.error) {
          setUpdateStatus({ status: 'error', error: result.error });
        }
      } else {
        // Web: verificar versão via API
        await checkWebVersion();
      }
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
      setUpdateStatus({ status: 'error', error: String(error) });
    } finally {
      setIsChecking(false);
    }
  }, [hasConsent]);

  // Baixar atualização
  const download = useCallback(async () => {
    if (!isElectron()) {
      console.log('Download não disponível no modo web');
      return;
    }

    setIsDownloading(true);
    try {
      const result = await downloadUpdate();
      if (!result.success && result.error) {
        setUpdateStatus({ status: 'error', error: result.error });
      }
    } catch (error) {
      console.error('Erro ao baixar atualização:', error);
      setUpdateStatus({ status: 'error', error: String(error) });
    } finally {
      setIsDownloading(false);
    }
  }, []);

  // Instalar e reiniciar
  const install = useCallback(async () => {
    if (!isElectron()) {
      // Web: recarregar página
      window.location.reload();
      return;
    }

    try {
      await installUpdate();
    } catch (error) {
      console.error('Erro ao instalar atualização:', error);
      setUpdateStatus({ status: 'error', error: String(error) });
    }
  }, []);

  return {
    updateStatus,
    isChecking,
    isDownloading,
    checkUpdates,
    download,
    install,
    hasConsent,
  };
}

/**
 * Verificar versão no modo Web
 * Esta função pode ser customizada para verificar contra uma API específica
 */
async function checkWebVersion(): Promise<void> {
  try {
    // Verificar se há uma nova versão comparando com o package.json
    // ou consultando uma API de versões
    const response = await fetch('/package.json');
    if (!response.ok) {
      throw new Error('Falha ao verificar versão');
    }

    const data = await response.json();
    const currentVersion = data.version;

    // Verificar se há uma versão mais recente no GitHub Releases
    // Você pode customizar esta URL conforme necessário
    const releaseResponse = await fetch(
      'https://api.github.com/repos/ThroneWild/colonial-asset-qr/releases/latest'
    );

    if (releaseResponse.ok) {
      const releaseData = await releaseResponse.json();
      const latestVersion = releaseData.tag_name.replace('v', '');

      if (compareVersions(latestVersion, currentVersion) > 0) {
        // Nova versão disponível
        console.log('Nova versão disponível:', latestVersion);
        // Você pode atualizar o estado aqui ou disparar um evento
      }
    }
  } catch (error) {
    console.error('Erro ao verificar versão web:', error);
  }
}

/**
 * Comparar versões semânticas
 * @returns 1 se v1 > v2, -1 se v1 < v2, 0 se v1 === v2
 */
function compareVersions(v1: string, v2: string): number {
  const parts1 = v1.split('.').map(Number);
  const parts2 = v2.split('.').map(Number);

  for (let i = 0; i < Math.max(parts1.length, parts2.length); i++) {
    const part1 = parts1[i] || 0;
    const part2 = parts2[i] || 0;

    if (part1 > part2) return 1;
    if (part1 < part2) return -1;
  }

  return 0;
}

/**
 * Hook simplificado para apenas verificar se há atualizações disponíveis
 */
export function useUpdateAvailable() {
  const { updateStatus } = useAutoUpdate();
  return updateStatus?.status === 'available' || updateStatus?.status === 'downloaded';
}

/**
 * Hook para auto-check periódico
 */
export function usePeriodicUpdateCheck(intervalMinutes: number = 30) {
  const { checkUpdates, hasConsent } = useAutoUpdate();

  useEffect(() => {
    if (!hasConsent) return;

    // Verificar ao montar
    checkUpdates();

    // Verificar periodicamente
    const interval = setInterval(() => {
      checkUpdates();
    }, intervalMinutes * 60 * 1000);

    return () => clearInterval(interval);
  }, [checkUpdates, hasConsent, intervalMinutes]);
}
