const { contextBridge, ipcRenderer } = require('electron');

// Expor APIs seguras para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // Verificar se está rodando no Electron
  isElectron: () => ipcRenderer.invoke('is-electron'),

  // Obter versão do app
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),

  // Solicitar acesso à câmera
  requestCameraAccess: () => ipcRenderer.invoke('request-camera-access'),

  // Informações do sistema
  platform: process.platform,

  // Node environment
  nodeEnv: process.env.NODE_ENV,
});

// Log para debug
console.log('Preload script carregado com sucesso');
console.log('Plataforma:', process.platform);
console.log('Electron version:', process.versions.electron);
console.log('Chrome version:', process.versions.chrome);
console.log('Node version:', process.versions.node);
