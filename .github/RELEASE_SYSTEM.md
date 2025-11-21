# Sistema de Release Automático

## 🎯 Resumo Executivo

Este projeto possui um sistema de release **totalmente automatizado** que:

- ✅ Incrementa versões automaticamente
- ✅ Faz build para Windows, macOS e Linux em paralelo
- ✅ Publica releases no GitHub automaticamente
- ✅ Distribui atualizações para usuários via auto-update
- ✅ Gera release notes automaticamente

## 🚀 Como Usar (Simples)

```bash
# Correção de bug
npm run release:patch

# Nova feature
npm run release:minor

# Breaking change
npm run release:major
```

**Pronto!** O resto é automático.

## 📋 O Que Acontece

1. **Script local** (`scripts/create-release.sh`):
   - Incrementa versão no `package.json`
   - Cria commit: `chore: bump version to X.X.X`
   - Cria tag: `vX.X.X`
   - Push para GitHub

2. **GitHub Actions** (`.github/workflows/release.yml`):
   - Detecta a nova tag
   - Roda 3 builds em paralelo:
     - Windows (windows-latest)
     - macOS (macos-latest) - Intel + ARM
     - Linux (ubuntu-latest) - AppImage + deb
   - Cada build leva ~10-15 minutos
   - Total: ~15-20 minutos (paralelo)

3. **Publicação Automática**:
   - Coleta todos os binários
   - Cria release no GitHub
   - Anexa todos os instaladores
   - Gera release notes automaticamente
   - Publica arquivos `.yml` para auto-update

4. **Auto-Update** (usuários do app):
   - Electron detecta nova versão
   - Mostra notificação
   - Download em background
   - Instalação com um clique

## 📊 Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Developer                                 │
│                        ↓                                     │
│               npm run release:patch                          │
│                        ↓                                     │
│            scripts/create-release.sh                         │
│                        ↓                                     │
│              Update version + Git tag                        │
│                        ↓                                     │
│                  Push to GitHub                              │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  GitHub Actions                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Windows    │  │    macOS     │  │    Linux     │      │
│  │    Build     │  │    Build     │  │    Build     │      │
│  │              │  │              │  │              │      │
│  │  - .exe      │  │  - .dmg x2   │  │  - .AppImage │      │
│  │  - .yml      │  │  - .yml      │  │  - .deb      │      │
│  │              │  │              │  │  - .yml      │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
│         ↓                  ↓                 ↓              │
│  ┌────────────────────────────────────────────────┐        │
│  │        Publish Release Job                      │        │
│  │  - Collect all artifacts                        │        │
│  │  - Create GitHub release                        │        │
│  │  - Upload all binaries                          │        │
│  │  - Generate release notes                       │        │
│  └────────────────────────────────────────────────┘        │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              GitHub Release Published                        │
│  https://github.com/ThroneWild/colonial-asset-qr/releases   │
│                                                              │
│  - Colonial-Asset-QR-1.0.0-Setup.exe                        │
│  - Colonial-Asset-QR-1.0.0-arm64.dmg                        │
│  - Colonial-Asset-QR-1.0.0-x64.dmg                          │
│  - Colonial-Asset-QR-1.0.0-x64.AppImage                     │
│  - Colonial-Asset-QR-1.0.0-amd64.deb                        │
│  - latest.yml, latest-mac.yml, latest-linux.yml             │
└─────────────────────────────────────────────────────────────┘
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                End Users (App Desktop)                       │
│                                                              │
│  electron-updater checks:                                    │
│  - GitHub API: /releases/latest                              │
│  - Compare versions                                          │
│  - Download if newer                                         │
│  - Notify user                                               │
│  - Install on click                                          │
└─────────────────────────────────────────────────────────────┘
```

## 🔧 Componentes

### Scripts
- `scripts/create-release.sh` - Bash script (Linux/macOS)
- `scripts/create-release.ps1` - PowerShell script (Windows)

### GitHub Actions
- `.github/workflows/release.yml` - Workflow principal

### Electron
- `electron/main.js` - Auto-updater config
- `electron/preload.js` - IPC bridge
- `src/hooks/useAutoUpdate.ts` - React hook
- `src/components/UpdateNotification.tsx` - UI

### Config
- `package.json` - Build config + scripts
- `.github/RELEASE_SYSTEM.md` - Este arquivo

### Documentação
- `AUTOMATIC_RELEASE_GUIDE.md` - Guia completo
- `RELEASE_INSTRUCTIONS.md` - Processo manual (fallback)
- `scripts/README.md` - Docs dos scripts

## 🔐 Segurança

- ✅ Auto-updater usa HTTPS
- ✅ Verificação de assinatura via GitHub
- ✅ Electron-updater valida checksums
- ✅ Sem execução de código não verificado
- ✅ Usuário precisa aceitar instalação

## 📈 Versionamento Semântico

| Tipo | Exemplo | Quando Usar |
|------|---------|-------------|
| **patch** | 1.0.0 → 1.0.1 | Bugfixes, correções |
| **minor** | 1.0.0 → 1.1.0 | Novas features compatíveis |
| **major** | 1.0.0 → 2.0.0 | Breaking changes |

## 🐛 Troubleshooting

### Build falha no GitHub Actions

**Erro comum**: Falta de ícone

```bash
# Verifique se existe
ls -la build/icon.png

# Deve ser 256x256 ou maior
file build/icon.png
```

### Auto-update não funciona

1. Confirme que há releases publicadas
2. Verifique a API:
   ```bash
   curl https://api.github.com/repos/ThroneWild/colonial-asset-qr/releases/latest
   ```
3. Verifique os logs no app (Ctrl+Shift+I)
4. Confirme que os arquivos `.yml` foram publicados

### Tag duplicada

```bash
# Remove tag local
git tag -d v1.0.0

# Remove tag remota
git push origin :refs/tags/v1.0.0

# Cria novamente
npm run release:patch
```

## 📚 Recursos

- [Electron Builder](https://www.electron.build/)
- [electron-updater](https://www.electron.build/auto-update)
- [GitHub Actions](https://docs.github.com/actions)
- [Semantic Versioning](https://semver.org/)

## 🎉 Status

- ✅ Sistema implementado
- ✅ Scripts testados
- ✅ Workflow configurado
- ✅ Documentação completa
- ⏳ Aguardando primeira release

## 📞 Suporte

Para problemas ou dúvidas:
- Veja: `AUTOMATIC_RELEASE_GUIDE.md`
- Issues: https://github.com/ThroneWild/colonial-asset-qr/issues
