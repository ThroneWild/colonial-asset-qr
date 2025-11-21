#!/bin/bash

# Script para ativar o sistema de download automaticamente
# Este script faz todo o processo de setup da primeira release

set -e

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}║     🚀 Ativação do Sistema de Download Automático 🚀          ║${NC}"
echo -e "${BLUE}║                                                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar se há mudanças não commitadas
if [[ -n $(git status -s) ]]; then
    echo -e "${YELLOW}⚠️  Aviso: Há mudanças não commitadas.${NC}"
    git status -s
    echo ""
    read -p "Deseja continuar mesmo assim? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Operação cancelada."
        exit 1
    fi
fi

# Obter branch atual
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 Branch atual: ${YELLOW}$CURRENT_BRANCH${NC}"

# Verificar se é uma branch claude/*
if [[ $CURRENT_BRANCH == claude/* ]]; then
    echo ""
    echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
    echo -e "${YELLOW}Você está em uma branch Claude.${NC}"
    echo -e "${YELLOW}Para ativar o sistema de download, precisamos:${NC}"
    echo -e "${YELLOW}1. Fazer merge para a branch principal (main)${NC}"
    echo -e "${YELLOW}2. Criar a primeira release${NC}"
    echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
    echo ""

    read -p "Deseja fazer merge automático para main? (s/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Ss]$ ]]; then
        echo -e "${BLUE}🔄 Fazendo checkout para main...${NC}"
        git checkout main || {
            echo -e "${RED}❌ Erro ao fazer checkout para main${NC}"
            echo "Certifique-se de que a branch 'main' existe."
            exit 1
        }

        echo -e "${BLUE}⬇️  Atualizando main...${NC}"
        git pull origin main || {
            echo -e "${YELLOW}⚠️  Aviso: Não foi possível fazer pull de main${NC}"
        }

        echo -e "${BLUE}🔀 Fazendo merge de $CURRENT_BRANCH...${NC}"
        git merge $CURRENT_BRANCH || {
            echo -e "${RED}❌ Erro ao fazer merge${NC}"
            echo "Resolva os conflitos manualmente e execute o script novamente."
            exit 1
        }

        echo -e "${BLUE}⬆️  Fazendo push para origin/main...${NC}"
        git push origin main || {
            echo -e "${RED}❌ Erro ao fazer push${NC}"
            exit 1
        }

        echo -e "${GREEN}✅ Merge concluído com sucesso!${NC}"
    else
        echo ""
        echo -e "${YELLOW}📝 Para fazer merge manualmente:${NC}"
        echo "   git checkout main"
        echo "   git pull origin main"
        echo "   git merge $CURRENT_BRANCH"
        echo "   git push origin main"
        echo ""
        echo "Depois execute este script novamente."
        exit 0
    fi
fi

# Verificar se estamos na main agora
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    echo -e "${RED}❌ Erro: Você precisa estar na branch main ou master${NC}"
    echo "Branch atual: $CURRENT_BRANCH"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Você está na branch principal!${NC}"
echo ""

# Verificar versão atual
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📦 Versão atual: ${GREEN}$CURRENT_VERSION${NC}"

# Calcular próxima versão (patch)
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}
PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$PATCH"

echo -e "${BLUE}🚀 Próxima versão: ${GREEN}v$NEW_VERSION${NC}"
echo ""

# Confirmar criação da release
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}Criar a primeira release v$NEW_VERSION?${NC}"
echo ""
echo -e "Isto irá:"
echo -e "  1. ✅ Atualizar package.json para v$NEW_VERSION"
echo -e "  2. ✅ Criar commit e tag v$NEW_VERSION"
echo -e "  3. ✅ Fazer push para GitHub"
echo -e "  4. ✅ Disparar GitHub Actions para build automático"
echo -e "  5. ✅ Publicar release com instaladores (20-30 min)"
echo -e "  6. ✅ Ativar sistema de download no app"
echo -e "${YELLOW}════════════════════════════════════════════════════════════════${NC}"
echo ""

read -p "Confirma a criação da release? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operação cancelada."
    exit 0
fi

# Criar a release
echo ""
echo -e "${BLUE}🎬 Criando release v$NEW_VERSION...${NC}"
echo ""

./scripts/create-release.sh patch

# Mostrar informações finais
echo ""
echo -e "${GREEN}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}║                    ✅ SUCESSO! ✅                              ║${NC}"
echo -e "${GREEN}║                                                                ║${NC}"
echo -e "${GREEN}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${YELLOW}📊 O que acontece agora:${NC}"
echo ""
echo -e "1. ${BLUE}GitHub Actions está fazendo build dos instaladores${NC}"
echo -e "   Tempo estimado: 20-30 minutos"
echo -e "   Acompanhe em: ${GREEN}https://github.com/ThroneWild/colonial-asset-qr/actions${NC}"
echo ""
echo -e "2. ${BLUE}Quando terminar, a release será publicada automaticamente${NC}"
echo -e "   Verifique em: ${GREEN}https://github.com/ThroneWild/colonial-asset-qr/releases${NC}"
echo ""
echo -e "3. ${BLUE}O sistema de download estará ativado${NC}"
echo -e "   Os usuários poderão baixar o app pela página /download"
echo ""
echo -e "4. ${BLUE}Auto-update estará funcionando${NC}"
echo -e "   Usuários receberão notificações de novas versões automaticamente"
echo ""
echo -e "${GREEN}🎉 Sistema de download automático ativado com sucesso!${NC}"
echo ""
echo -e "${YELLOW}💡 Dica:${NC} Para criar novas releases no futuro, use:"
echo -e "   ${GREEN}npm run release:patch${NC}  - Correções de bugs"
echo -e "   ${GREEN}npm run release:minor${NC}  - Novas features"
echo -e "   ${GREEN}npm run release:major${NC}  - Breaking changes"
echo ""
