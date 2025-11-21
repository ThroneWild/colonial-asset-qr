# 🚀 Quick Start - Ativar Sistema de Download

## ⚡ Ativação Rápida (5 minutos)

Para ativar o sistema de download e criar a primeira release:

### Opção 1: Automática (Recomendado)

```bash
# 1. Fazer merge das mudanças para main
git checkout main
git merge claude/fix-download-button-01NeQCng2WnT6RjuwGWfFT3R
git push origin main

# 2. Criar a primeira release
npm run release:patch

# 3. Aguardar ~20 minutos (GitHub Actions faz o resto)
```

**Pronto!** O GitHub Actions vai automaticamente:
- ✅ Fazer build para Windows, macOS e Linux
- ✅ Criar a release no GitHub
- ✅ Publicar os instaladores
- ✅ Ativar o sistema de auto-update

### Opção 2: Via Pull Request (Mais Seguro)

```bash
# 1. Criar PR no GitHub
gh pr create --title "Add automated release system" --body "Sistema completo de release automático"

# 2. Aprovar e fazer merge da PR

# 3. Voltar para main e criar release
git checkout main
git pull origin main
npm run release:patch
```

## 🎯 Verificar Progresso

### 1. GitHub Actions (Build em andamento)
```
https://github.com/ThroneWild/colonial-asset-qr/actions
```
Aguarde os 3 jobs terminarem:
- ⏳ Build Windows (~15 min)
- ⏳ Build macOS (~15 min)
- ⏳ Build Linux (~10 min)

### 2. Release Publicada
```
https://github.com/ThroneWild/colonial-asset-qr/releases
```
Quando terminar, você verá:
- ✅ Release v1.0.1
- ✅ 5+ arquivos anexados (.exe, .dmg, .AppImage, .deb, .yml)
- ✅ Release notes geradas automaticamente

### 3. Testar Download
```
https://seu-dominio.com/download
```
Agora deve funcionar:
- ✅ Versão aparece (ex: "Versão v1.0.1")
- ✅ Botões habilitados
- ✅ Download inicia ao clicar
- ✅ Arquivo é baixado corretamente

## 🚨 Se Não Puder Aguardar o Build

### Criar Release Placeholder (Teste Imediato)

Se você quer testar o sistema de download AGORA sem aguardar o build:

```bash
# 1. Criar uma release manualmente no GitHub
gh release create v1.0.1 \
  --title "Colonial Asset QR v1.0.1" \
  --notes "Primeira release - Instaladores serão adicionados em breve" \
  --draft=false

# 2. Testar a página de download
# A página vai detectar a release, mas não terá arquivos para download ainda
```

Depois, quando o GitHub Actions rodar, ele vai adicionar os binários automaticamente.

## 📋 Checklist de Ativação

Siga esta ordem:

- [ ] **Passo 1**: Merge das mudanças para main
  ```bash
  git checkout main
  git merge claude/fix-download-button-01NeQCng2WnT6RjuwGWfFT3R
  git push origin main
  ```

- [ ] **Passo 2**: Criar primeira release
  ```bash
  npm run release:patch
  ```

- [ ] **Passo 3**: Aguardar GitHub Actions (20-30 min)
  - Acessar: https://github.com/ThroneWild/colonial-asset-qr/actions
  - Verificar que os 3 jobs estão rodando
  - Aguardar todos completarem ✅

- [ ] **Passo 4**: Verificar release publicada
  - Acessar: https://github.com/ThroneWild/colonial-asset-qr/releases
  - Confirmar que v1.0.1 existe
  - Confirmar que tem 5+ arquivos anexados

- [ ] **Passo 5**: Testar download
  - Acessar a página de download do app
  - Verificar que versão aparece
  - Clicar em "Baixar para Windows" ou "Baixar para macOS"
  - Confirmar que download inicia

- [ ] **Passo 6**: Testar instalação
  - Instalar o app baixado
  - Abrir o app
  - Verificar que funciona corretamente

- [ ] **Passo 7**: Testar auto-update
  - Com o app instalado, criar nova release (v1.0.2)
  - Aguardar 30 minutos (ou reiniciar o app)
  - Verificar notificação de atualização
  - Aceitar atualização
  - Confirmar que app atualiza corretamente

## 🎯 Próximas Releases (Automatizado)

Depois da primeira release, para criar novas versões:

```bash
# Correção de bug
npm run release:patch   # 1.0.1 -> 1.0.2

# Nova feature
npm run release:minor   # 1.0.2 -> 1.1.0

# Breaking change
npm run release:major   # 1.1.0 -> 2.0.0
```

**É só isso!** GitHub Actions faz todo o resto automaticamente.

## 🔧 Troubleshooting

### Erro: "Icon not found"

```bash
# Criar ícone temporário para teste
mkdir -p build
cp public/favicon.ico build/icon.png
# Ou baixe um ícone 256x256 PNG
```

### Erro: "npm run release:patch not found"

```bash
# Instalar dependências primeiro
npm install
```

### Build falha no GitHub Actions

1. Veja os logs: https://github.com/ThroneWild/colonial-asset-qr/actions
2. Clique no job que falhou
3. Veja a mensagem de erro
4. Corrija e crie nova release

### Download mostra "Nenhuma versão disponível"

**Causa**: Ainda não há release publicada

**Solução**:
1. Confirme que executou `npm run release:patch`
2. Aguarde o GitHub Actions terminar
3. Verifique: https://github.com/ThroneWild/colonial-asset-qr/releases

## 📞 Precisa de Ajuda?

1. **Erro no script?** Veja `scripts/README.md`
2. **Erro no GitHub Actions?** Veja `.github/RELEASE_SYSTEM.md`
3. **Erro no auto-update?** Veja `AUTOMATIC_RELEASE_GUIDE.md`
4. **Outro problema?** Abra uma issue

## ✅ Sistema Pronto Para Uso

Tudo está configurado e pronto:

- ✅ Scripts de versionamento
- ✅ GitHub Actions workflow
- ✅ Electron auto-updater
- ✅ Página de download com detecção automática
- ✅ Documentação completa

**Basta executar os passos acima e o sistema estará funcionando!** 🎉
