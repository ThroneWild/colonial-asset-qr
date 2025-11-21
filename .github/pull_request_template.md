## 🚀 Primeiro Release - PrizePatrimonios

### Resumo das Mudanças

Este PR prepara o primeiro release oficial do **PrizePatrimonios**, incluindo o rebranding completo do aplicativo.

### ✅ Mudanças Realizadas

- **Rebranding Completo**
  - `productName`: "Colonial Asset QR" → "PrizePatrimonios"
  - `appId`: "com.colonial.assetqr" → "com.prizepatrimonios.app"
  - `author`: "Colonial Asset" → "PrizePatrimonios"
  - `copyright`: Atualizado para "Copyright © 2025 PrizePatrimonios"
  - `shortcutName`: Atualizado para "PrizePatrimonios"

- **Páginas e Componentes Atualizados**
  - `src/pages/Download.tsx` - Título de download atualizado
  - `src/pages/DownloadThanks.tsx` - Mensagem de agradecimento atualizada
  - `src/components/UpdateNotification.tsx` - Diálogos de atualização com novo nome

- **Documentação**
  - Adicionado guia completo `COMO_CRIAR_PRIMEIRO_RELEASE.md`

### 📋 Próximos Passos (Após Merge)

1. **Criar a tag v1.0.0:**
   ```bash
   git checkout main
   git pull origin main
   git tag -a "v1.0.0" -m "Release v1.0.0 - PrizePatrimonios"
   git push origin v1.0.0
   ```

2. **Aguardar GitHub Actions** (20-30 minutos)
   - Build automático para Windows, macOS e Linux
   - Publicação automática da release

3. **Testar o Sistema de Download**
   - Verificar página `/download`
   - Testar downloads dos instaladores
   - Confirmar auto-update funcionando

### 🔧 Sistema de Release

O sistema de releases automáticas já está configurado:
- ✅ GitHub Actions configurado (`.github/workflows/release.yml`)
- ✅ electron-builder configurado
- ✅ electron-updater configurado
- ✅ Scripts de release prontos (`npm run release:patch/minor/major`)

### ✨ O Que Será Gerado

Quando a tag `v1.0.0` for criada, o GitHub Actions irá gerar:
- 🪟 `PrizePatrimonios-1.0.0-Setup.exe` (Windows)
- 🍎 `PrizePatrimonios-1.0.0-x64.dmg` e `-arm64.dmg` (macOS)
- 🐧 `PrizePatrimonios-1.0.0-x64.AppImage` e `.deb` (Linux)
- 📝 Arquivos de auto-update (`.yml`)

### 🎯 Checklist

- [x] Código testado localmente
- [x] Rebranding completo realizado
- [x] Documentação atualizada
- [x] Commits com mensagens descritivas
- [ ] PR aprovado e merged
- [ ] Tag v1.0.0 criada
- [ ] Release publicada no GitHub
- [ ] Sistema de download testado

---

**Pronto para o primeiro release oficial do PrizePatrimonios!** 🎉
