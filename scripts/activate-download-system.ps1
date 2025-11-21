# Script PowerShell para ativar o sistema de download automaticamente
# Este script faz todo o processo de setup da primeira release

$ErrorActionPreference = "Stop"

Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Blue
Write-Host "║                                                                ║" -ForegroundColor Blue
Write-Host "║     🚀 Ativação do Sistema de Download Automático 🚀          ║" -ForegroundColor Blue
Write-Host "║                                                                ║" -ForegroundColor Blue
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Blue
Write-Host ""

# Verificar se há mudanças não commitadas
$gitStatus = git status -s
if ($gitStatus) {
    Write-Host "⚠️  Aviso: Há mudanças não commitadas." -ForegroundColor Yellow
    git status -s
    Write-Host ""
    $response = Read-Host "Deseja continuar mesmo assim? (s/N)"
    if ($response -ne 's' -and $response -ne 'S') {
        Write-Host "Operação cancelada."
        exit 1
    }
}

# Obter branch atual
$currentBranch = git branch --show-current
Write-Host "📍 Branch atual: " -ForegroundColor Blue -NoNewline
Write-Host $currentBranch -ForegroundColor Yellow

# Verificar se é uma branch claude/*
if ($currentBranch -like "claude/*") {
    Write-Host ""
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host "Você está em uma branch Claude." -ForegroundColor Yellow
    Write-Host "Para ativar o sistema de download, precisamos:" -ForegroundColor Yellow
    Write-Host "1. Fazer merge para a branch principal (main)" -ForegroundColor Yellow
    Write-Host "2. Criar a primeira release" -ForegroundColor Yellow
    Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
    Write-Host ""

    $response = Read-Host "Deseja fazer merge automático para main? (s/N)"
    if ($response -eq 's' -or $response -eq 'S') {
        Write-Host "🔄 Fazendo checkout para main..." -ForegroundColor Blue
        try {
            git checkout main
        } catch {
            Write-Host "❌ Erro ao fazer checkout para main" -ForegroundColor Red
            Write-Host "Certifique-se de que a branch 'main' existe."
            exit 1
        }

        Write-Host "⬇️  Atualizando main..." -ForegroundColor Blue
        try {
            git pull origin main
        } catch {
            Write-Host "⚠️  Aviso: Não foi possível fazer pull de main" -ForegroundColor Yellow
        }

        Write-Host "🔀 Fazendo merge de $currentBranch..." -ForegroundColor Blue
        try {
            git merge $currentBranch
        } catch {
            Write-Host "❌ Erro ao fazer merge" -ForegroundColor Red
            Write-Host "Resolva os conflitos manualmente e execute o script novamente."
            exit 1
        }

        Write-Host "⬆️  Fazendo push para origin/main..." -ForegroundColor Blue
        try {
            git push origin main
        } catch {
            Write-Host "❌ Erro ao fazer push" -ForegroundColor Red
            exit 1
        }

        Write-Host "✅ Merge concluído com sucesso!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "📝 Para fazer merge manualmente:" -ForegroundColor Yellow
        Write-Host "   git checkout main"
        Write-Host "   git pull origin main"
        Write-Host "   git merge $currentBranch"
        Write-Host "   git push origin main"
        Write-Host ""
        Write-Host "Depois execute este script novamente."
        exit 0
    }
}

# Verificar se estamos na main agora
$currentBranch = git branch --show-current
if ($currentBranch -ne "main" -and $currentBranch -ne "master") {
    Write-Host "❌ Erro: Você precisa estar na branch main ou master" -ForegroundColor Red
    Write-Host "Branch atual: $currentBranch"
    exit 1
}

Write-Host ""
Write-Host "✅ Você está na branch principal!" -ForegroundColor Green
Write-Host ""

# Verificar versão atual
$packageJson = Get-Content package.json | ConvertFrom-Json
$currentVersion = $packageJson.version
Write-Host "📦 Versão atual: " -ForegroundColor Blue -NoNewline
Write-Host $currentVersion -ForegroundColor Green

# Calcular próxima versão (patch)
$versionParts = $currentVersion.Split('.')
$major = [int]$versionParts[0]
$minor = [int]$versionParts[1]
$patch = [int]$versionParts[2]
$patch++
$newVersion = "$major.$minor.$patch"

Write-Host "🚀 Próxima versão: " -ForegroundColor Blue -NoNewline
Write-Host "v$newVersion" -ForegroundColor Green
Write-Host ""

# Confirmar criação da release
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host "Criar a primeira release v$newVersion?" -ForegroundColor Yellow
Write-Host ""
Write-Host "Isto irá:"
Write-Host "  1. ✅ Atualizar package.json para v$newVersion"
Write-Host "  2. ✅ Criar commit e tag v$newVersion"
Write-Host "  3. ✅ Fazer push para GitHub"
Write-Host "  4. ✅ Disparar GitHub Actions para build automático"
Write-Host "  5. ✅ Publicar release com instaladores (20-30 min)"
Write-Host "  6. ✅ Ativar sistema de download no app"
Write-Host "═══════════════════════════════════════════════════════════════" -ForegroundColor Yellow
Write-Host ""

$response = Read-Host "Confirma a criação da release? (s/N)"
if ($response -ne 's' -and $response -ne 'S') {
    Write-Host "Operação cancelada."
    exit 0
}

# Criar a release
Write-Host ""
Write-Host "🎬 Criando release v$newVersion..." -ForegroundColor Blue
Write-Host ""

.\scripts\create-release.ps1 patch

# Mostrar informações finais
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "║                    ✅ SUCESSO! ✅                              ║" -ForegroundColor Green
Write-Host "║                                                                ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "📊 O que acontece agora:" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. " -NoNewline
Write-Host "GitHub Actions está fazendo build dos instaladores" -ForegroundColor Blue
Write-Host "   Tempo estimado: 20-30 minutos"
Write-Host "   Acompanhe em: " -NoNewline
Write-Host "https://github.com/ThroneWild/colonial-asset-qr/actions" -ForegroundColor Green
Write-Host ""
Write-Host "2. " -NoNewline
Write-Host "Quando terminar, a release será publicada automaticamente" -ForegroundColor Blue
Write-Host "   Verifique em: " -NoNewline
Write-Host "https://github.com/ThroneWild/colonial-asset-qr/releases" -ForegroundColor Green
Write-Host ""
Write-Host "3. " -NoNewline
Write-Host "O sistema de download estará ativado" -ForegroundColor Blue
Write-Host "   Os usuários poderão baixar o app pela página /download"
Write-Host ""
Write-Host "4. " -NoNewline
Write-Host "Auto-update estará funcionando" -ForegroundColor Blue
Write-Host "   Usuários receberão notificações de novas versões automaticamente"
Write-Host ""
Write-Host "🎉 Sistema de download automático ativado com sucesso!" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Dica: " -ForegroundColor Yellow -NoNewline
Write-Host "Para criar novas releases no futuro, use:"
Write-Host "   " -NoNewline
Write-Host "npm run release:patch" -ForegroundColor Green -NoNewline
Write-Host "  - Correções de bugs"
Write-Host "   " -NoNewline
Write-Host "npm run release:minor" -ForegroundColor Green -NoNewline
Write-Host "  - Novas features"
Write-Host "   " -NoNewline
Write-Host "npm run release:major" -ForegroundColor Green -NoNewline
Write-Host "  - Breaking changes"
Write-Host ""
