# Scripts de Release

Este diretório contém scripts para automatizar o processo de criação de releases.

## 📜 Scripts Disponíveis

### `create-release.sh` (Linux/macOS)

Script Bash para criar releases automaticamente.

**Uso:**
```bash
./scripts/create-release.sh [patch|minor|major]
```

**Exemplos:**
```bash
./scripts/create-release.sh patch   # 1.0.0 -> 1.0.1
./scripts/create-release.sh minor   # 1.0.0 -> 1.1.0
./scripts/create-release.sh major   # 1.0.0 -> 2.0.0
```

### `create-release.ps1` (Windows)

Script PowerShell equivalente para Windows.

**Uso:**
```powershell
.\scripts\create-release.ps1 [patch|minor|major]
```

**Exemplos:**
```powershell
.\scripts\create-release.ps1 patch   # 1.0.0 -> 1.0.1
.\scripts\create-release.ps1 minor   # 1.0.0 -> 1.1.0
.\scripts\create-release.ps1 major   # 1.0.0 -> 2.0.0
```

## 🚀 Via NPM (Recomendado)

É mais fácil usar os comandos npm que chamam estes scripts:

```bash
npm run release:patch   # Correção de bugs
npm run release:minor   # Novas features
npm run release:major   # Breaking changes
```

## 🔍 O Que os Scripts Fazem

1. ✅ Verifica se você está na branch correta (main/master)
2. ✅ Verifica se há mudanças não commitadas
3. ✅ Calcula a nova versão baseada no tipo de bump
4. ✅ Atualiza `package.json` e `package-lock.json`
5. ✅ Cria um commit com a mensagem `chore: bump version to X.X.X`
6. ✅ Cria uma tag Git anotada (ex: `v1.0.1`)
7. ✅ Faz push do commit e da tag para o GitHub
8. ✅ Dispara o GitHub Actions para build e publicação automática

## 📋 Pré-requisitos

- Git configurado e autenticado
- Node.js e npm instalados
- Permissões para push no repositório
- Estar em uma branch limpa (sem mudanças não commitadas)

## ⚠️ Importante

- **Não edite** estes scripts sem entender completamente o que fazem
- **Sempre teste** em uma branch de teste antes de aplicar em produção
- **Certifique-se** de que todas as mudanças foram commitadas antes de criar uma release
- O script **não pode ser revertido** facilmente após o push

## 🆘 Problemas Comuns

### "Permissão negada" ao executar o script

```bash
chmod +x scripts/create-release.sh
```

### Script não encontra npm/node

Certifique-se de que Node.js está no PATH:

```bash
which node
which npm
```

### "Tag already exists"

Se você precisa recriar uma tag:

```bash
git tag -d v1.0.0                    # Remove localmente
git push origin :refs/tags/v1.0.0    # Remove remotamente
```

Depois execute o script novamente.

## 📚 Mais Informações

Veja o guia completo em: `../AUTOMATIC_RELEASE_GUIDE.md`
