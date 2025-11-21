const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

// Configuração para ambiente de desenvolvimento ou produção
const isDev = process.env.NODE_ENV === 'development';

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 768,
    title: 'Colonial Asset QR',
    icon: path.join(__dirname, '../public/favicon.ico'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
      // Permitir acesso a câmera e outros recursos
      enableRemoteModule: false,
    },
    backgroundColor: '#ffffff',
    show: false, // Não mostrar até estar pronto
  });

  // Carregar a aplicação
  if (isDev) {
    // Modo desenvolvimento: conectar ao servidor Vite
    mainWindow.loadURL('http://localhost:8080');
    // Abrir DevTools automaticamente em desenvolvimento
    mainWindow.webContents.openDevTools();
  } else {
    // Modo produção: carregar arquivo build
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Mostrar janela quando estiver pronta
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Fechar a aplicação quando a janela for fechada
  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  // Prevenir navegação externa
  mainWindow.webContents.on('will-navigate', (event, url) => {
    // Permitir apenas navegação interna
    if (!url.startsWith('http://localhost') && !url.startsWith('file://')) {
      event.preventDefault();
      // Abrir links externos no navegador padrão
      require('electron').shell.openExternal(url);
    }
  });

  // Lidar com novos windows (abrir no navegador)
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    require('electron').shell.openExternal(url);
    return { action: 'deny' };
  });
}

// Criar janela quando o app estiver pronto
app.whenReady().then(() => {
  createWindow();

  // No macOS, recriar janela quando clicar no dock
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Sair quando todas as janelas forem fechadas (exceto no macOS)
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers para comunicação com o renderer
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});

ipcMain.handle('is-electron', () => {
  return true;
});

// Handler para acessar a câmera
ipcMain.handle('request-camera-access', async () => {
  try {
    // Solicitar permissão para câmera
    const { systemPreferences } = require('electron');
    if (process.platform === 'darwin') {
      const status = await systemPreferences.getMediaAccessStatus('camera');
      if (status !== 'granted') {
        await systemPreferences.askForMediaAccess('camera');
      }
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Prevenir múltiplas instâncias
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    // Quando alguém tenta abrir uma segunda instância, focar na janela principal
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });
}
