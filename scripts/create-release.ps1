# Script PowerShell para criar uma nova release automaticamente
# Uso: .\scripts\create-release.ps1 [patch|minor|major]

param(
    [Parameter(Position=0)]
    [ValidateSet('patch', 'minor', 'major')]
    [string]$BumpType = 'patch'
)

$ErrorActionPreference = "Stop"

# Verificar se está na branch main ou master
$currentBranch = git branch --show-current
if ($currentBranch -ne "main" -and $currentBranch -ne "master") {
    Write-Host "⚠️  Aviso: Você não está na branch main/master (branch atual: $currentBranch)" -ForegroundColor Yellow
    $response = Read-Host "Deseja continuar mesmo assim? (s/N)"
    if ($response -ne 's' -and $response -ne 'S') {
        Write-Host "Operação cancelada."
        exit 1
    }
}

# Verificar se há mudanças não commitadas
$gitStatus = git status -s
if ($gitStatus) {
    Write-Host "❌ Erro: Há mudanças não commitadas." -ForegroundColor Red
    Write-Host "Por favor, commit ou stash suas mudanças antes de criar uma release."
    git status -s
    exit 1
}

# Obter versão atual
$packageJson = Get-Content package.json | ConvertFrom-Json
$currentVersion = $packageJson.version
Write-Host "📦 Versão atual: $currentVersion" -ForegroundColor Green

# Calcular nova versão
$versionParts = $currentVersion.Split('.')
$major = [int]$versionParts[0]
$minor = [int]$versionParts[1]
$patch = [int]$versionParts[2]

switch ($BumpType) {
    'major' {
        $major++
        $minor = 0
        $patch = 0
    }
    'minor' {
        $minor++
        $patch = 0
    }
    'patch' {
        $patch++
    }
}

$newVersion = "$major.$minor.$patch"
Write-Host "🚀 Nova versão: $newVersion" -ForegroundColor Green

# Confirmar com usuário
$response = Read-Host "Deseja criar a release v$newVersion? (s/N)"
if ($response -ne 's' -and $response -ne 'S') {
    Write-Host "Operação cancelada."
    exit 0
}

# Atualizar versão no package.json
Write-Host "📝 Atualizando package.json..." -ForegroundColor Yellow
npm version $newVersion --no-git-tag-version

# Commit da mudança de versão
Write-Host "💾 Criando commit..." -ForegroundColor Yellow
git add package.json package-lock.json
git commit -m "chore: bump version to $newVersion"

# Criar tag
Write-Host "🏷️  Criando tag v$newVersion..." -ForegroundColor Yellow
git tag -a "v$newVersion" -m "Release v$newVersion"

# Push das mudanças e da tag
Write-Host "⬆️  Fazendo push para o repositório..." -ForegroundColor Yellow
git push origin $currentBranch
git push origin "v$newVersion"

Write-Host ""
Write-Host "✅ Release v$newVersion criada com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "🔄 O GitHub Actions irá automaticamente:"
Write-Host "  1. Fazer build dos instaladores para Windows, macOS e Linux"
Write-Host "  2. Criar uma release no GitHub com os binários"
Write-Host "  3. Publicar os arquivos para auto-update"
Write-Host ""
Write-Host "📊 Acompanhe o progresso em:"
Write-Host "   https://github.com/ThroneWild/colonial-asset-qr/actions"
Write-Host ""
Write-Host "🎉 Quando o build terminar, a release estará disponível em:"
Write-Host "   https://github.com/ThroneWild/colonial-asset-qr/releases/tag/v$newVersion"
