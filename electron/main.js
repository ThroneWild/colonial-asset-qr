const { app, BrowserWindow, ipcMain } = require('electron');
const { autoUpdater } = require('electron-updater');
const path = require('path');

// Configuração para ambiente de desenvolvimento ou produção
const isDev = process.env.NODE_ENV === 'development';

// Configuração do auto-updater
autoUpdater.autoDownload = false; // Não baixar automaticamente
autoUpdater.autoInstallOnAppQuit = true; // Instalar quando fechar o app

// Configurar o repositório do GitHub para releases
// O electron-builder usa automaticamente o provider do package.json
// mas podemos forçar em desenvolvimento para testes
if (isDev) {
  // Em desenvolvimento, podemos testar apontando para staging ou usar mock
  // autoUpdater.setFeedURL({
  //   provider: 'github',
  //   owner: 'ThroneWild',
  //   repo: 'colonial-asset-qr'
  // });
}

// Log detalhado em desenvolvimento
autoUpdater.logger = require('electron-log');
autoUpdater.logger.transports.file.level = 'info';

console.log('Auto-updater configurado');
console.log('Versão atual:', app.getVersion());
console.log('Modo desenvolvimento:', isDev);

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

// Configurar eventos do auto-updater
function setupAutoUpdater() {
  // Verificar por atualizações quando o app iniciar (somente em produção)
  if (!isDev) {
    // Aguardar 5 segundos após o app iniciar
    setTimeout(() => {
      autoUpdater.checkForUpdates();
    }, 5000);

    // Verificar por atualizações a cada 30 minutos
    setInterval(() => {
      autoUpdater.checkForUpdates();
    }, 30 * 60 * 1000);
  }

  // Eventos do auto-updater
  autoUpdater.on('checking-for-update', () => {
    console.log('Verificando atualizações...');
    if (mainWindow) {
      mainWindow.webContents.send('update-status', { status: 'checking' });
    }
  });

  autoUpdater.on('update-available', (info) => {
    console.log('Atualização disponível:', info.version);
    if (mainWindow) {
      mainWindow.webContents.send('update-status', {
        status: 'available',
        version: info.version,
        releaseNotes: info.releaseNotes,
        releaseDate: info.releaseDate,
      });
    }
  });

  autoUpdater.on('update-not-available', (info) => {
    console.log('Nenhuma atualização disponível');
    if (mainWindow) {
      mainWindow.webContents.send('update-status', { status: 'not-available' });
    }
  });

  autoUpdater.on('error', (err) => {
    console.error('Erro ao verificar atualizações:', err);
    if (mainWindow) {
      mainWindow.webContents.send('update-status', {
        status: 'error',
        error: err.message,
      });
    }
  });

  autoUpdater.on('download-progress', (progressObj) => {
    console.log(
      `Baixando: ${progressObj.percent.toFixed(2)}% - ${progressObj.transferred}/${progressObj.total}`
    );
    if (mainWindow) {
      mainWindow.webContents.send('update-status', {
        status: 'downloading',
        progress: progressObj.percent,
        transferred: progressObj.transferred,
        total: progressObj.total,
      });
    }
  });

  autoUpdater.on('update-downloaded', (info) => {
    console.log('Atualização baixada:', info.version);
    if (mainWindow) {
      mainWindow.webContents.send('update-status', {
        status: 'downloaded',
        version: info.version,
      });
    }
  });
}

// Criar janela quando o app estiver pronto
app.whenReady().then(() => {
  createWindow();
  setupAutoUpdater();

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

// Handlers para auto-update
ipcMain.handle('check-for-updates', async () => {
  if (isDev) {
    return { error: 'Auto-update não disponível em modo desenvolvimento' };
  }
  try {
    const result = await autoUpdater.checkForUpdates();
    return { success: true, updateInfo: result.updateInfo };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('download-update', async () => {
  if (isDev) {
    return { error: 'Auto-update não disponível em modo desenvolvimento' };
  }
  try {
    await autoUpdater.downloadUpdate();
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('install-update', () => {
  if (isDev) {
    return { error: 'Auto-update não disponível em modo desenvolvimento' };
  }
  // Instalar e reiniciar
  autoUpdater.quitAndInstall(false, true);
  return { success: true };
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
