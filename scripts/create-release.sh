#!/bin/bash

# Script para criar uma nova release automaticamente
# Uso: ./scripts/create-release.sh [patch|minor|major]

set -e

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Verificar se está na branch main ou master
current_branch=$(git branch --show-current)
if [[ "$current_branch" != "main" && "$current_branch" != "master" ]]; then
    echo -e "${YELLOW}⚠️  Aviso: Você não está na branch main/master (branch atual: $current_branch)${NC}"
    read -p "Deseja continuar mesmo assim? (s/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Operação cancelada."
        exit 1
    fi
fi

# Verificar se há mudanças não commitadas
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}❌ Erro: Há mudanças não commitadas.${NC}"
    echo "Por favor, commit ou stash suas mudanças antes de criar uma release."
    git status -s
    exit 1
fi

# Tipo de bump (patch, minor, major)
BUMP_TYPE=${1:-patch}

if [[ ! "$BUMP_TYPE" =~ ^(patch|minor|major)$ ]]; then
    echo -e "${RED}❌ Erro: Tipo de bump inválido: $BUMP_TYPE${NC}"
    echo "Uso: $0 [patch|minor|major]"
    echo ""
    echo "  patch: 1.0.0 -> 1.0.1 (bugfixes)"
    echo "  minor: 1.0.0 -> 1.1.0 (novas features)"
    echo "  major: 1.0.0 -> 2.0.0 (breaking changes)"
    exit 1
fi

# Obter versão atual
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}📦 Versão atual: $CURRENT_VERSION${NC}"

# Calcular nova versão
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

case $BUMP_TYPE in
    major)
        MAJOR=$((MAJOR + 1))
        MINOR=0
        PATCH=0
        ;;
    minor)
        MINOR=$((MINOR + 1))
        PATCH=0
        ;;
    patch)
        PATCH=$((PATCH + 1))
        ;;
esac

NEW_VERSION="$MAJOR.$MINOR.$PATCH"
echo -e "${GREEN}🚀 Nova versão: $NEW_VERSION${NC}"

# Confirmar com usuário
read -p "Deseja criar a release v$NEW_VERSION? (s/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operação cancelada."
    exit 0
fi

# Atualizar versão no package.json
echo -e "${YELLOW}📝 Atualizando package.json...${NC}"
npm version $NEW_VERSION --no-git-tag-version

# Commit da mudança de versão
echo -e "${YELLOW}💾 Criando commit...${NC}"
git add package.json package-lock.json
git commit -m "chore: bump version to $NEW_VERSION"

# Criar tag
echo -e "${YELLOW}🏷️  Criando tag v$NEW_VERSION...${NC}"
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Push das mudanças e da tag
echo -e "${YELLOW}⬆️  Fazendo push para o repositório...${NC}"
git push origin $current_branch
git push origin "v$NEW_VERSION"

echo ""
echo -e "${GREEN}✅ Release v$NEW_VERSION criada com sucesso!${NC}"
echo ""
echo "🔄 O GitHub Actions irá automaticamente:"
echo "  1. Fazer build dos instaladores para Windows, macOS e Linux"
echo "  2. Criar uma release no GitHub com os binários"
echo "  3. Publicar os arquivos para auto-update"
echo ""
echo "📊 Acompanhe o progresso em:"
echo "   https://github.com/ThroneWild/colonial-asset-qr/actions"
echo ""
echo "🎉 Quando o build terminar, a release estará disponível em:"
echo "   https://github.com/ThroneWild/colonial-asset-qr/releases/tag/v$NEW_VERSION"
