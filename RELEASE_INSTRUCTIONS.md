# Instruções para Publicar a Primeira Release

## Problema Identificado

O botão "Baixar Desktop" no sidebar leva para `/download`, mas o download falha com erro 404 do GitHub porque ainda não há releases publicadas no repositório.

## Solução Implementada

Melhorias na página de download (`src/pages/Download.tsx`):

1. **Detecção de releases ausentes**: Sistema agora detecta quando não há releases disponíveis
2. **Mensagem de erro clara**: Alerta visual vermelho informando que não há versões disponíveis
3. **Botões desabilitados**: Os botões de download são desabilitados automaticamente quando não há releases
4. **Indicador de carregamento**: Mostra "Verificando versões disponíveis..." durante a busca
5. **Tratamento de erros aprimorado**: Mensagens específicas para diferentes tipos de erro

## Como Publicar a Primeira Release

Para que o sistema de download funcione, você precisa publicar uma release no GitHub com os binários do app. Siga estes passos:

### 1. Build dos Binários

Execute os comandos para gerar os instaladores:

```bash
# Para Windows
npm run build:electron:win

# Para macOS
npm run build:electron:mac

# Para Linux
npm run build:electron:linux
```

Ou use o script completo:
```bash
npm run build:electron:all
```

### 2. Publicar Release no GitHub

#### Opção A: Via GitHub Actions (Recomendado)

Configure um workflow do GitHub Actions para build e deploy automático:

1. Crie `.github/workflows/release.yml`
2. O workflow deve fazer build dos binários
3. Usar `electron-builder` com `publish: github`
4. Criar uma release automaticamente quando você criar uma tag

#### Opção B: Manual via GitHub UI

1. Vá para: `https://github.com/ThroneWild/colonial-asset-qr/releases`
2. Clique em "Create a new release"
3. Crie uma tag (ex: `v1.0.0`)
4. Adicione título e descrição
5. **IMPORTANTE**: Faça upload dos arquivos gerados:
   - `Colonial-Asset-QR-1.0.0-Setup.exe` (Windows)
   - `Colonial-Asset-QR-1.0.0-arm64.dmg` (macOS ARM)
   - `Colonial-Asset-QR-1.0.0-x64.dmg` (macOS Intel)
   - `Colonial-Asset-QR-1.0.0-x64.AppImage` (Linux)
   - `Colonial-Asset-QR-1.0.0-amd64.deb` (Linux)
6. Clique em "Publish release"

#### Opção C: Via GitHub CLI

```bash
# Criar uma release
gh release create v1.0.0 \
  --title "Colonial Asset QR v1.0.0" \
  --notes "Primeira versão do app desktop" \
  ./dist/*.exe \
  ./dist/*.dmg \
  ./dist/*.AppImage \
  ./dist/*.deb
```

### 3. Verificar

Depois de publicar a release:

1. Acesse o app web
2. Clique em "Baixar Desktop" no sidebar
3. A página `/download` deve:
   - Mostrar a versão disponível (ex: "Versão v1.0.0")
   - Exibir os botões habilitados
   - Permitir download dos arquivos

## Estrutura Esperada dos Assets

O sistema busca automaticamente por arquivos com estas extensões:

- **Windows**: `.exe`
- **macOS**: `.dmg` ou arquivos contendo "mac"
- **Linux**: `.AppImage` ou `.deb`

Certifique-se de que os nomes dos arquivos seguem o padrão:
```
Colonial-Asset-QR-{versão}-Setup.exe
Colonial-Asset-QR-{versão}-arm64.dmg
Colonial-Asset-QR-{versão}-x64.AppImage
```

## Auto-Update

O sistema já está configurado com `electron-updater`. Após publicar a primeira release:

1. As próximas versões serão detectadas automaticamente
2. Usuários receberão notificação de atualização
3. Download e instalação podem ser feitos pelo próprio app

## Notas Importantes

- A API do GitHub tem limite de taxa: 60 requisições/hora sem autenticação
- Para aumentar o limite, configure um token de acesso pessoal
- O sistema funciona tanto no modo web quanto Electron
- No modo Electron, o botão de download fica oculto automaticamente

## Suporte

Se tiver problemas:
1. Verifique se a release está pública (não draft)
2. Confirme que os assets foram anexados corretamente
3. Teste a URL manualmente: `https://api.github.com/repos/ThroneWild/colonial-asset-qr/releases/latest`
