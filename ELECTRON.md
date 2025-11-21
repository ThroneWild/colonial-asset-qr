# 🖥️ Colonial Asset QR - Versão Desktop com Electron

Este guia explica como usar o Colonial Asset QR tanto como aplicativo web quanto como software desktop instalável, similar ao Figma.

## 📋 Índice

- [Sobre](#sobre)
- [Requisitos](#requisitos)
- [Desenvolvimento](#desenvolvimento)
- [Build e Distribuição](#build-e-distribuição)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [FAQ](#faq)

## 🎯 Sobre

O Colonial Asset QR agora suporta **duas formas de uso**:

1. **Aplicativo Web** - Acesse via navegador (como sempre foi)
2. **Aplicativo Desktop** - Instale no Windows, macOS ou Linux usando Electron

### Vantagens da Versão Desktop

✅ Aplicativo nativo instalável
✅ Ícone na área de trabalho
✅ Funciona offline (após primeiro acesso)
✅ Melhor integração com o sistema operacional
✅ Acesso facilitado à câmera para QR Code
✅ Notificações nativas do sistema
✅ Não depende de navegador aberto

## 📦 Requisitos

- **Node.js** 18+
- **npm** 9+ ou **yarn**
- Sistema operacional: Windows 10+, macOS 10.15+, ou Linux (Ubuntu 20.04+)

## 🚀 Desenvolvimento

### Modo Web (navegador)

```bash
# Desenvolvimento web normal
npm run dev

# Build para web
npm run build
```

Acesse em: `http://localhost:8080`

### Modo Desktop (Electron)

```bash
# Desenvolvimento desktop
npm run dev:electron
```

Isso irá:
1. Iniciar o servidor Vite na porta 8080
2. Abrir automaticamente uma janela Electron
3. Hot reload automático ao editar código

**Dica:** Durante desenvolvimento, o DevTools do Electron abrirá automaticamente!

## 📦 Build e Distribuição

### Build Local (apenas testar)

```bash
# Gerar build sem criar instalador
npm run build:electron:dir
```

A pasta `release/[platform]-unpacked` conterá o executável para testar.

### Gerar Instaladores

#### Windows

```bash
npm run build:electron:win
```

Gera:
- 📦 `release/Colonial Asset QR-1.0.0-Setup.exe` (instalador NSIS)

#### macOS

```bash
npm run build:electron:mac
```

Gera:
- 📦 `release/Colonial Asset QR-1.0.0-x64.dmg` (Intel)
- 📦 `release/Colonial Asset QR-1.0.0-arm64.dmg` (Apple Silicon)

#### Linux

```bash
npm run build:electron:linux
```

Gera:
- 📦 `release/Colonial Asset QR-1.0.0-x64.AppImage`
- 📦 `release/Colonial Asset QR-1.0.0-x64.deb`

#### Todas as plataformas

```bash
npm run build:electron
```

⚠️ **Nota:** Alguns builds específicos só funcionam na plataforma correspondente (ex: build macOS requer macOS).

## 📁 Estrutura do Projeto

```
colonial-asset-qr/
├── electron/                    # ⚡ Arquivos Electron
│   ├── main.js                 # Processo principal
│   └── preload.js              # Script de preload (segurança)
├── src/
│   ├── utils/
│   │   └── electron.ts         # 🔧 Utilitários Electron
│   └── ...                     # Código React existente
├── dist/                        # Build web
├── dist-electron/               # Build Electron (processos)
├── release/                     # 📦 Instaladores gerados
├── package.json                 # Scripts e config
├── vite.config.ts              # Config Vite (web + electron)
└── ELECTRON.md                 # 📖 Esta documentação
```

### Arquivos Principais

#### `electron/main.js`
- Processo principal do Electron
- Gerencia janelas e ciclo de vida
- Configurações de segurança

#### `electron/preload.js`
- Ponte segura entre Electron e React
- Expõe APIs via `contextBridge`
- Isolamento de contexto

#### `src/utils/electron.ts`
- Utilitários para detectar Electron
- Helpers para usar APIs do Electron
- Type safety com TypeScript

## 🔧 Como Usar as APIs do Electron no Código React

### Detectar se está rodando no Electron

```typescript
import { isElectron } from '@/utils/electron';

function MyComponent() {
  if (isElectron()) {
    // Código específico para desktop
    console.log('Rodando no Electron!');
  } else {
    // Código específico para web
    console.log('Rodando no navegador!');
  }
}
```

### Obter versão do app

```typescript
import { getAppVersion } from '@/utils/electron';

async function showVersion() {
  const version = await getAppVersion();
  if (version) {
    console.log('Versão:', version);
  }
}
```

### Solicitar acesso à câmera

```typescript
import { requestCameraAccess } from '@/utils/electron';

async function enableCamera() {
  const granted = await requestCameraAccess();
  if (granted) {
    // Iniciar QR Code scanner
  }
}
```

### Obter plataforma

```typescript
import { getPlatform } from '@/utils/electron';

const platform = getPlatform(); // 'win32', 'darwin', 'linux', ou 'web'
```

## 🎨 Personalização

### Ícone do Aplicativo

Substitua `public/favicon.ico` por um ícone personalizado:

- **Windows:** `.ico` (256x256px ou múltiplos tamanhos)
- **macOS:** `.icns` (512x512px recomendado)
- **Linux:** `.png` (512x512px)

### Configurações do Instalador

Edite `package.json` na seção `"build"`:

```json
{
  "build": {
    "appId": "com.colonial.assetqr",      // ID único
    "productName": "Colonial Asset QR",    // Nome do produto
    "copyright": "Copyright © 2025...",   // Copyright
    // ... mais opções
  }
}
```

### Configurações da Janela

Edite `electron/main.js` na função `createWindow()`:

```javascript
const mainWindow = new BrowserWindow({
  width: 1400,        // Largura inicial
  height: 900,        // Altura inicial
  minWidth: 1024,     // Largura mínima
  minHeight: 768,     // Altura mínima
  // ... mais opções
});
```

## 🐛 Debug e Troubleshooting

### DevTools não abre automaticamente

Edite `electron/main.js`:

```javascript
if (isDev) {
  mainWindow.webContents.openDevTools();
}
```

### Erro ao acessar câmera

No macOS, adicione permissões em `package.json`:

```json
{
  "build": {
    "mac": {
      "entitlements": "build/entitlements.mac.plist"
    }
  }
}
```

### Build falha

1. Limpe cache:
```bash
rm -rf node_modules dist dist-electron release
npm install
```

2. Verifique Node.js:
```bash
node --version  # Deve ser 18+
```

## 🌐 Dual Mode: Web + Desktop

### Como funciona?

O projeto usa uma **variável de ambiente** para alternar entre modos:

- `VITE_ELECTRON=true` → Modo Desktop
- `VITE_ELECTRON` não definido → Modo Web

O Vite detecta isso automaticamente e:
- ✅ **Modo Web:** Build normal React
- ✅ **Modo Desktop:** Build React + processos Electron

### Vantagens

- ✅ **Um único codebase** para web e desktop
- ✅ **Mesma experiência** em ambas versões
- ✅ **Fácil manutenção** - correções aplicam-se a ambos
- ✅ **Deploy independente** - pode atualizar web sem rebuild desktop

### Quando usar cada modo?

| Caso de Uso | Recomendação |
|-------------|--------------|
| Desenvolvimento rápido | 🌐 Web (`npm run dev`) |
| Testar recursos nativos | 🖥️ Desktop (`npm run dev:electron`) |
| Deploy em servidor | 🌐 Web (`npm run build`) |
| Distribuir para usuários | 🖥️ Desktop (`npm run build:electron:win`) |
| Demonstração rápida | 🌐 Web (sem instalação) |
| Uso prolongado/offline | 🖥️ Desktop (melhor experiência) |

## 📚 FAQ

### 1. Preciso escolher entre web ou desktop?

**Não!** Você pode usar ambos. O mesmo código funciona nas duas formas.

### 2. O aplicativo funciona offline?

Sim, após o primeiro acesso. A versão desktop armazena cache localmente.

### 3. Como atualizar a versão desktop?

Você pode implementar auto-update usando `electron-updater`. Por enquanto, o usuário deve baixar nova versão manualmente.

### 4. Posso customizar o menu da aplicação?

Sim! Edite `electron/main.js` e adicione:

```javascript
const { Menu } = require('electron');

const template = [
  // ... seu menu customizado
];

const menu = Menu.buildFromTemplate(template);
Menu.setApplicationMenu(menu);
```

### 5. Como adicionar notificações?

Use a API de Notifications do Electron:

```javascript
// No preload.js, exponha:
ipcRenderer.invoke('show-notification', { title, body });

// No main.js, crie handler:
ipcMain.handle('show-notification', (event, { title, body }) => {
  new Notification({ title, body }).show();
});
```

### 6. Posso usar Node.js no código React?

**Não diretamente** por segurança. Use `contextBridge` no `preload.js` para expor APIs específicas.

### 7. Como debugar o processo principal?

```bash
# Inicie com inspetor
electron --inspect=5858 .
```

Depois conecte Chrome DevTools em `chrome://inspect`.

## 🚀 Próximos Passos

- [ ] Implementar auto-update
- [ ] Adicionar tray icon (ícone na bandeja)
- [ ] Criar menu nativo customizado
- [ ] Implementar atalhos de teclado globais
- [ ] Adicionar suporte a deep linking
- [ ] Configurar code signing para distribuição

## 📞 Suporte

Problemas ou dúvidas? Abra uma issue no repositório ou entre em contato com a equipe de desenvolvimento.

---

**Colonial Asset QR** - Gestão de ativos moderna, em qualquer lugar! 🚀
