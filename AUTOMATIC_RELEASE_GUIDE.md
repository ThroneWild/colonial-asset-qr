# 🚀 Guia de Release Automático

## Visão Geral

Este projeto está configurado com um sistema de release **100% automatizado**. Quando você cria uma nova versão, o GitHub Actions automaticamente:

1. ✅ Faz build dos instaladores para Windows, macOS e Linux
2. ✅ Cria uma release no GitHub com todos os binários
3. ✅ Publica os arquivos para o sistema de auto-update
4. ✅ Gera release notes automaticamente
5. ✅ Usuários do app desktop recebem notificação de atualização

## 🎯 Como Criar uma Nova Release

### Método 1: Usando Scripts NPM (Recomendado)

```bash
# Para correção de bugs (1.0.0 -> 1.0.1)
npm run release:patch

# Para novas features (1.0.0 -> 1.1.0)
npm run release:minor

# Para breaking changes (1.0.0 -> 2.0.0)
npm run release:major
```

**O que o script faz:**
1. Verifica se você está na branch correta
2. Verifica se há mudanças não commitadas
3. Incrementa a versão no `package.json`
4. Cria um commit com a nova versão
5. Cria uma tag Git (ex: `v1.0.1`)
6. Faz push do commit e da tag para o GitHub
7. **GitHub Actions inicia automaticamente o build e publicação**

### Método 2: Usando o Script Diretamente

**Linux/macOS:**
```bash
./scripts/create-release.sh patch   # ou minor, ou major
```

**Windows:**
```powershell
.\scripts\create-release.ps1 patch   # ou minor, ou major
```

### Método 3: Manual (Não Recomendado)

```bash
# Atualizar versão
npm version patch  # ou minor, ou major

# Criar tag
git tag -a v1.0.1 -m "Release v1.0.1"

# Push
git push origin main
git push origin v1.0.1
```

## 📊 Acompanhar o Progresso

Após criar a release:

1. **GitHub Actions**: https://github.com/ThroneWild/colonial-asset-qr/actions
   - Você verá 3 jobs rodando em paralelo (Windows, macOS, Linux)
   - Cada job demora ~10-15 minutos

2. **Releases**: https://github.com/ThroneWild/colonial-asset-qr/releases
   - Quando o build terminar, a release será publicada automaticamente

## 🔄 Sistema de Auto-Update

O app já está configurado com `electron-updater`. Quando há uma nova versão:

### Para Usuários do App Desktop:

1. **Detecção Automática**: O app verifica por atualizações a cada 30 minutos
2. **Consentimento**: Na primeira vez, pede permissão para auto-update
3. **Notificação**: Mostra uma notificação quando há atualização disponível
4. **Download**: Download em background com barra de progresso
5. **Instalação**: Usuário clica para instalar e reiniciar o app

### Configuração do Auto-Update:

O arquivo `electron/main.js` já está configurado:

```javascript
autoUpdater.checkForUpdates()  // Verifica updates
autoUpdater.downloadUpdate()   // Baixa update
autoUpdater.quitAndInstall()   // Instala e reinicia
```

## 📦 Estrutura das Releases

Cada release contém:

### Windows
- `Colonial-Asset-QR-{version}-Setup.exe` - Instalador NSIS
- `latest.yml` - Metadados para auto-update

### macOS
- `Colonial-Asset-QR-{version}-arm64.dmg` - Apple Silicon (M1/M2/M3)
- `Colonial-Asset-QR-{version}-x64.dmg` - Intel
- `latest-mac.yml` - Metadados para auto-update

### Linux
- `Colonial-Asset-QR-{version}-x64.AppImage` - Universal (funciona em todas as distros)
- `Colonial-Asset-QR-{version}-amd64.deb` - Debian/Ubuntu
- `latest-linux.yml` - Metadados para auto-update

## 🎨 Versionamento Semântico

Siga o padrão [Semantic Versioning](https://semver.org/):

- **MAJOR** (1.0.0 -> 2.0.0): Breaking changes
  - Mudanças incompatíveis com versões anteriores
  - Exemplo: Remover funcionalidade, mudar API

- **MINOR** (1.0.0 -> 1.1.0): Novas features
  - Adicionar funcionalidade mantendo compatibilidade
  - Exemplo: Nova tela, novo recurso

- **PATCH** (1.0.0 -> 1.0.1): Bug fixes
  - Correções de bugs mantendo compatibilidade
  - Exemplo: Fix de erro, melhoria de performance

## 🚨 Solução de Problemas

### Erro: "Tag already exists"
```bash
# Deletar tag local e remota
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0

# Criar novamente
npm run release:patch
```

### Erro: "There are uncommitted changes"
```bash
# Commit ou stash suas mudanças
git add .
git commit -m "feat: minhas mudanças"

# Depois crie a release
npm run release:patch
```

### Build falhou no GitHub Actions

1. Veja os logs: https://github.com/ThroneWild/colonial-asset-qr/actions
2. Problemas comuns:
   - Falta de ícone: Garanta que `build/icon.png` existe (256x256 ou maior)
   - Erro de build: Teste localmente com `npm run build:electron:dir`
   - Timeout: Builds de Electron podem demorar, seja paciente

### Auto-update não funciona

1. Verifique se há releases publicadas no GitHub
2. Confirme que os arquivos `.yml` foram publicados (latest.yml, latest-mac.yml, etc.)
3. Teste manualmente a API: `https://api.github.com/repos/ThroneWild/colonial-asset-qr/releases/latest`
4. Verifique os logs no DevTools do Electron (Ctrl+Shift+I)

## 📝 Checklist para Primeira Release

- [ ] Certifique-se de que `build/icon.png` existe (256x256 ou maior)
- [ ] Teste o build localmente: `npm run build:electron:dir`
- [ ] Commit todas as mudanças
- [ ] Execute: `npm run release:patch` (ou minor/major)
- [ ] Aguarde o GitHub Actions terminar (~30 min total)
- [ ] Verifique a release em: https://github.com/ThroneWild/colonial-asset-qr/releases
- [ ] Teste o download pelo app web: https://seu-dominio.com/download
- [ ] Instale o app e teste o sistema de auto-update

## 🎉 Pronto!

Agora você tem um sistema de release totalmente automatizado!

**Workflow típico:**

1. Desenvolver features/fixes
2. Commit as mudanças
3. Executar `npm run release:patch` (ou minor/major)
4. ☕ Tomar um café enquanto o GitHub Actions faz todo o trabalho
5. 🎊 Release publicada e usuários notificados automaticamente!

## 📚 Recursos Adicionais

- [Electron Builder Docs](https://www.electron.build/)
- [electron-updater Docs](https://www.electron.build/auto-update)
- [GitHub Actions Docs](https://docs.github.com/en/actions)
- [Semantic Versioning](https://semver.org/)

## 🆘 Precisa de Ajuda?

- **Issues**: https://github.com/ThroneWild/colonial-asset-qr/issues
- **Documentação anterior**: Veja `RELEASE_INSTRUCTIONS.md` para processo manual
