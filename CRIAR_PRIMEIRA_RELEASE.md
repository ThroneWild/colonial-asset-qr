# 🚀 Como Criar a Primeira Release (2 minutos)

## ✅ Passo a Passo Visual

### **Passo 1: Acesse a Página de Releases**

Clique neste link (ou abra no navegador):
```
https://github.com/ThroneWild/colonial-asset-qr/releases/new
```

---

### **Passo 2: Preencha o Formulário**

#### **📌 Tag version:**
```
v1.0.1
```
- Digite `v1.0.1` no campo "Choose a tag"
- Clique em **"+ Create new tag: v1.0.1 on publish"**

#### **🎯 Target:**
- Selecione: `main` (ou `claude/fix-download-button-01NeQCng2WnT6RjuwGWfFT3R`)

#### **📝 Release title:**
```
Release v1.0.1
```

#### **📄 Description:**
```markdown
## Colonial Asset QR - Primeira Release

Sistema completo de gestão de ativos com QR Code.

### ✨ Funcionalidades

- 📱 App Desktop para Windows, macOS e Linux
- 📥 Sistema de download automático
- 🔄 Auto-update integrado
- 📊 Gestão completa de ativos
- 🔍 Scanner de QR Code
- 📈 Dashboard e relatórios

### 🚀 Para Instalar

1. Escolha a versão para seu sistema operacional abaixo
2. Baixe e execute o instalador
3. Siga as instruções na tela

### 🔄 Auto-Update

O app verifica automaticamente por atualizações e notifica quando
há uma nova versão disponível.

---

**Nota:** Esta é a primeira release. Os instaladores serão adicionados
automaticamente pelo GitHub Actions em ~20-30 minutos.
```

---

### **Passo 3: Configurações**

Na parte inferior do formulário:

- ✅ **Marque:** "Set as the latest release"
- ❌ **NÃO marque:** "Set as a pre-release"
- ❌ **NÃO marque:** "Create a discussion for this release"

---

### **Passo 4: Publicar!**

Clique no botão verde:
```
🟢 Publish release
```

---

## 🎉 Pronto! O Que Acontece Agora?

### ⏱️ Imediatamente (0-2 minutos)

1. ✅ **Release v1.0.1 criada** no GitHub
2. ✅ **Tag v1.0.1** criada automaticamente
3. ✅ **Página de download ativada** (sem arquivos ainda)
4. ✅ **GitHub Actions iniciado** automaticamente

### 🔧 Durante o Build (20-30 minutos)

O GitHub Actions vai:
- 🔨 Fazer build do instalador para **Windows**
- 🔨 Fazer build do instalador para **macOS** (Intel + ARM)
- 🔨 Fazer build do instalador para **Linux** (AppImage + deb)
- 📦 Anexar todos os arquivos à release v1.0.1
- 📝 Adicionar metadados para auto-update

Acompanhe o progresso:
```
https://github.com/ThroneWild/colonial-asset-qr/actions
```

Você verá 3 jobs rodando em paralelo:
- ⏳ **release (windows-latest)** - ~15 min
- ⏳ **release (macos-latest)** - ~15 min
- ⏳ **release (ubuntu-latest)** - ~10 min

### ✅ Quando Terminar (20-30 min)

A release v1.0.1 terá:
- ✅ `Colonial-Asset-QR-1.0.1-Setup.exe` (Windows)
- ✅ `Colonial-Asset-QR-1.0.1-arm64.dmg` (macOS M1/M2/M3)
- ✅ `Colonial-Asset-QR-1.0.1-x64.dmg` (macOS Intel)
- ✅ `Colonial-Asset-QR-1.0.1-x64.AppImage` (Linux)
- ✅ `Colonial-Asset-QR-1.0.1-amd64.deb` (Debian/Ubuntu)
- ✅ `latest.yml`, `latest-mac.yml`, `latest-linux.yml` (auto-update)

---

## 🧪 Como Testar

### 1. Testar a Página de Download

Acesse seu app e vá para `/download`:
```
https://seu-dominio.com/download
```

**Antes do build terminar:**
- ✅ Página detecta a release v1.0.1
- ❌ Botões desabilitados (ainda não há arquivos)
- ℹ️ Mensagem: "Nenhuma versão disponível" OU mostra versão mas sem downloads

**Depois do build terminar:**
- ✅ Página detecta a release v1.0.1
- ✅ Mostra "Versão v1.0.1"
- ✅ Botões habilitados
- ✅ Download funciona ao clicar!

### 2. Testar o Download

1. Clique em "Baixar para Windows" ou "Baixar para macOS"
2. Arquivo deve baixar automaticamente
3. Execute o instalador
4. App deve instalar e abrir corretamente

### 3. Testar Auto-Update

1. Com o app instalado (v1.0.1), crie uma nova release (v1.0.2):
   ```bash
   npm run release:patch
   ```
2. Aguarde ~30 min (ou reinicie o app)
3. App deve mostrar notificação: "Atualização disponível!"
4. Clique em "Baixar atualização"
5. Quando terminar: "Instalar e reiniciar"
6. App atualiza para v1.0.2 automaticamente

---

## ❓ Perguntas Frequentes

### "Como sei se o build terminou?"

Acesse: https://github.com/ThroneWild/colonial-asset-qr/actions

Quando todos os 3 jobs mostrarem ✅ verde, está pronto!

### "O download não funciona ainda"

**Causa:** Build ainda não terminou (demora 20-30 min)

**Solução:** Aguarde. A página mostrará "Nenhuma versão disponível" ou botões desabilitados até o build terminar.

### "Quero criar a segunda release"

Simples:
```bash
npm run release:patch   # v1.0.1 -> v1.0.2
```

Pronto! GitHub Actions faz todo o resto automaticamente.

### "Algo deu errado no build"

1. Acesse: https://github.com/ThroneWild/colonial-asset-qr/actions
2. Clique no workflow que falhou
3. Veja os logs de erro
4. Corrija o problema
5. Crie nova release: `npm run release:patch`

---

## 🎯 Checklist de Sucesso

Marque conforme completar:

- [ ] Acessei https://github.com/ThroneWild/colonial-asset-qr/releases/new
- [ ] Criei tag `v1.0.1`
- [ ] Publiquei a release
- [ ] GitHub Actions iniciou (3 jobs rodando)
- [ ] Aguardei ~30 minutos
- [ ] Todos os jobs completaram ✅
- [ ] Release tem 6+ arquivos anexados
- [ ] Página `/download` mostra "Versão v1.0.1"
- [ ] Consegui baixar o instalador
- [ ] Instalei e o app funciona
- [ ] Sistema está pronto! 🎉

---

## 📞 Precisa de Ajuda?

- **GitHub Actions falhou?** Veja os logs em Actions
- **Download não funciona?** Aguarde o build terminar
- **Outro problema?** Abra uma issue no GitHub

---

## 🎊 Próximos Passos

Depois que tudo funcionar:

1. **Criar novas releases é automático:**
   ```bash
   npm run release:patch   # ou minor/major
   ```

2. **Usuários recebem atualizações automaticamente**

3. **Zero manutenção necessária**

**Sistema 100% automatizado e funcionando!** 🚀
