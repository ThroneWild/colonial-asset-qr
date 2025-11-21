#!/bin/bash

# Script para criar o primeiro release tag após o merge do PR
# Execute este script DEPOIS de aprovar e fazer merge do Pull Request

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}║        🎉 Criar Primeiro Release - PrizePatrimonios 🎉         ║${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se está na branch main
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    echo -e "${YELLOW}⚠️  Você não está na branch main. Mudando para main...${NC}"
    git checkout main || {
        echo -e "${RED}❌ Erro ao fazer checkout para main${NC}"
        exit 1
    }
fi

# Atualizar branch main
echo -e "${BLUE}⬇️  Atualizando branch main...${NC}"
git pull origin main || {
    echo -e "${RED}❌ Erro ao fazer pull de main${NC}"
    echo "Certifique-se de que você tem acesso ao repositório."
    exit 1
}

# Verificar versão no package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📦 Versão no package.json: ${GREEN}$CURRENT_VERSION${NC}"

# Confirmar criação da tag
echo ""
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Criar tag v$CURRENT_VERSION?${NC}"
echo ""
echo -e "Isto irá:"
echo -e "  1. ✅ Criar tag v$CURRENT_VERSION"
echo -e "  2. ✅ Fazer push da tag para GitHub"
echo -e "  3. ✅ Disparar GitHub Actions automaticamente"
echo -e "  4. ✅ Gerar builds para Windows, macOS e Linux (20-30 min)"
echo -e "  5. ✅ Publicar release com todos os instaladores"
echo -e "  6. ✅ Ativar sistema de download automático"
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo ""

read -p "Confirma a criação da tag v$CURRENT_VERSION? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operação cancelada."
    exit 0
fi

# Criar a tag
echo ""
echo -e "${BLUE}🏷️  Criando tag v$CURRENT_VERSION...${NC}"
git tag -a "v$CURRENT_VERSION" -m "Release v$CURRENT_VERSION - PrizePatrimonios

Primeiro release oficial do PrizePatrimonios!

## Features
- Sistema completo de gestão de patrimônios com QR Code
- Interface web responsiva
- App desktop para Windows, macOS e Linux
- Sistema de auto-atualização
- Scanner de QR Code integrado
- Sincronização em tempo real

## Instaladores
Este release inclui instaladores para:
- Windows (PrizePatrimonios-$CURRENT_VERSION-Setup.exe)
- macOS (PrizePatrimonios-$CURRENT_VERSION-x64.dmg e arm64.dmg)
- Linux (PrizePatrimonios-$CURRENT_VERSION-x64.AppImage e .deb)

## Auto-Update
Os instaladores incluem sistema de auto-update. Usuários serão notificados automaticamente quando novas versões estiverem disponíveis."

# Fazer push da tag
echo -e "${BLUE}⬆️  Fazendo push da tag para GitHub...${NC}"
git push origin "v$CURRENT_VERSION" || {
    echo -e "${RED}❌ Erro ao fazer push da tag${NC}"
    echo "Removendo tag local..."
    git tag -d "v$CURRENT_VERSION"
    exit 1
}

# Sucesso!
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║                  ✅ TAG CRIADA COM SUCESSO! ✅                 ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}🚀 O que acontece agora:${NC}"
echo ""
echo -e "1. ${BLUE}GitHub Actions foi disparado automaticamente${NC}"
echo -e "   Status: ${GREEN}https://github.com/ThroneWild/colonial-asset-qr/actions${NC}"
echo ""
echo -e "2. ${BLUE}Builds estão sendo gerados (20-30 minutos)${NC}"
echo -e "   - Windows: PrizePatrimonios-$CURRENT_VERSION-Setup.exe"
echo -e "   - macOS: PrizePatrimonios-$CURRENT_VERSION-x64.dmg e arm64.dmg"
echo -e "   - Linux: PrizePatrimonios-$CURRENT_VERSION-x64.AppImage e .deb"
echo ""
echo -e "3. ${BLUE}Release será publicada automaticamente${NC}"
echo -e "   URL: ${GREEN}https://github.com/ThroneWild/colonial-asset-qr/releases/tag/v$CURRENT_VERSION${NC}"
echo ""
echo -e "4. ${BLUE}Sistema de download estará ativo${NC}"
echo -e "   Os usuários poderão baixar o app pela página /download"
echo ""
echo -e "${GREEN}🎉 Primeiro release do PrizePatrimonios criado com sucesso!${NC}"
echo ""
echo -e "${YELLOW}💡 Para releases futuras:${NC}"
echo -e "   ${GREEN}npm run release:patch${NC}  - Correções (1.0.0 → 1.0.1)"
echo -e "   ${GREEN}npm run release:minor${NC}  - Features (1.0.0 → 1.1.0)"
echo -e "   ${GREEN}npm run release:major${NC}  - Breaking (1.0.0 → 2.0.0)"
echo ""
