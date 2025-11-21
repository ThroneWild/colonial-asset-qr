/**
 * Utilitários para integração com Electron
 */

// Verificar se está rodando no Electron
export const isElectron = (): boolean => {
  // Verificar se a API do Electron está disponível
  return typeof window !== 'undefined' &&
         typeof (window as any).electronAPI !== 'undefined';
};

// Obter API do Electron (com type safety)
export const getElectronAPI = () => {
  if (typeof window !== 'undefined' && (window as any).electronAPI) {
    return (window as any).electronAPI;
  }
  return null;
};

// Obter versão do app (funciona apenas no Electron)
export const getAppVersion = async (): Promise<string | null> => {
  const api = getElectronAPI();
  if (api && api.getAppVersion) {
    try {
      return await api.getAppVersion();
    } catch (error) {
      console.error('Erro ao obter versão do app:', error);
      return null;
    }
  }
  return null;
};

// Solicitar acesso à câmera (útil para QR Code scanner)
export const requestCameraAccess = async (): Promise<boolean> => {
  const api = getElectronAPI();
  if (api && api.requestCameraAccess) {
    try {
      const result = await api.requestCameraAccess();
      return result.success;
    } catch (error) {
      console.error('Erro ao solicitar acesso à câmera:', error);
      return false;
    }
  }
  // No navegador, retornar true (permissão é solicitada pelo browser)
  return true;
};

// Obter plataforma
export const getPlatform = (): string => {
  const api = getElectronAPI();
  if (api && api.platform) {
    return api.platform;
  }
  return 'web';
};

// Tipos para auto-update
export interface UpdateStatus {
  status: 'checking' | 'available' | 'not-available' | 'downloading' | 'downloaded' | 'error';
  version?: string;
  releaseNotes?: string;
  releaseDate?: string;
  progress?: number;
  transferred?: number;
  total?: number;
  error?: string;
}

// Verificar por atualizações
export const checkForUpdates = async (): Promise<any> => {
  const api = getElectronAPI();
  if (api && api.checkForUpdates) {
    try {
      return await api.checkForUpdates();
    } catch (error) {
      console.error('Erro ao verificar atualizações:', error);
      return { success: false, error: String(error) };
    }
  }
  return { success: false, error: 'Auto-update não disponível' };
};

// Baixar atualização
export const downloadUpdate = async (): Promise<any> => {
  const api = getElectronAPI();
  if (api && api.downloadUpdate) {
    try {
      return await api.downloadUpdate();
    } catch (error) {
      console.error('Erro ao baixar atualização:', error);
      return { success: false, error: String(error) };
    }
  }
  return { success: false, error: 'Auto-update não disponível' };
};

// Instalar atualização
export const installUpdate = async (): Promise<any> => {
  const api = getElectronAPI();
  if (api && api.installUpdate) {
    try {
      return await api.installUpdate();
    } catch (error) {
      console.error('Erro ao instalar atualização:', error);
      return { success: false, error: String(error) };
    }
  }
  return { success: false, error: 'Auto-update não disponível' };
};

// Listener para status de atualizações
export const onUpdateStatus = (callback: (status: UpdateStatus) => void): (() => void) => {
  const api = getElectronAPI();
  if (api && api.onUpdateStatus) {
    return api.onUpdateStatus(callback);
  }
  return () => {}; // Retornar função vazia se não estiver no Electron
};

// Tipo para a API do Electron (para type safety)
export interface ElectronAPI {
  isElectron: () => Promise<boolean>;
  getAppVersion: () => Promise<string>;
  requestCameraAccess: () => Promise<{ success: boolean; error?: string }>;
  checkForUpdates: () => Promise<any>;
  downloadUpdate: () => Promise<any>;
  installUpdate: () => Promise<any>;
  onUpdateStatus: (callback: (status: UpdateStatus) => void) => () => void;
  platform: string;
  nodeEnv: string;
}

// Declaração global para TypeScript
declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
