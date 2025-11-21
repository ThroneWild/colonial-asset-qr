# Novas Funcionalidades - Colonial Asset QR

## 1. Sistema de Cookies

Implementado um sistema completo de gerenciamento de cookies para armazenar preferências do usuário, configurações e dados de sessão.

### Arquivos Criados

- `src/utils/cookies.ts` - Utilitários para gerenciamento de cookies
- `src/hooks/useCookies.ts` - Hooks React para facilitar o uso de cookies

### Funcionalidades

#### Utilitários de Cookies (`cookies.ts`)

- **`setCookie(name, value, options)`** - Define um cookie
- **`getCookie(name)`** - Obtém o valor de um cookie
- **`deleteCookie(name, options)`** - Remove um cookie
- **`getAllCookies()`** - Retorna todos os cookies como objeto
- **`hasCookie(name)`** - Verifica se um cookie existe
- **`clearAllCookies(options)`** - Limpa todos os cookies
- **`setCookieJSON(name, value, options)`** - Armazena objeto JSON em cookie
- **`getCookieJSON(name)`** - Obtém objeto JSON de cookie

#### Hooks React (`useCookies.ts`)

- **`useCookie(name, defaultValue, options)`** - Hook para gerenciar cookies (similar ao useState)
- **`useCookieJSON(name, defaultValue, options)`** - Hook para cookies JSON com type safety
- **`useUserPreferences()`** - Hook para gerenciar preferências do usuário
- **`useAutoUpdateConsent()`** - Hook para gerenciar consentimento de auto-update
- **`useLastVisited()`** - Hook para lembrar última página visitada

### Cookies Predefinidos

```typescript
COOKIE_NAMES = {
  AUTH_TOKEN: 'colonial_auth_token',
  REFRESH_TOKEN: 'colonial_refresh_token',
  USER_PREFERENCES: 'colonial_user_prefs',
  THEME: 'colonial_theme',
  LANGUAGE: 'colonial_language',
  LAST_VISITED: 'colonial_last_visited',
  FILTERS_STATE: 'colonial_filters_state',
  TABLE_SETTINGS: 'colonial_table_settings',
  AUTO_UPDATE_CONSENT: 'colonial_auto_update',
}
```

### Exemplo de Uso

```tsx
import { useCookie, useUserPreferences } from '@/hooks/useCookies';

function MyComponent() {
  // Usar cookie simples
  const [theme, setTheme, removeTheme] = useCookie('theme', 'dark');

  // Usar preferências do usuário
  const { preferences, updatePreference } = useUserPreferences();

  const handleToggleSidebar = () => {
    updatePreference('sidebarCollapsed', !preferences.sidebarCollapsed);
  };

  return <div>...</div>;
}
```

---

## 2. Sistema de Atualização Automática

Implementado um sistema completo de auto-update que funciona tanto no modo Electron (desktop) quanto no modo Web.

### Arquivos Criados/Modificados

- `electron/main.js` - Adicionado suporte para electron-updater
- `electron/preload.js` - Expostas APIs de auto-update
- `src/utils/electron.ts` - Adicionadas funções de auto-update
- `src/hooks/useAutoUpdate.ts` - Hook React para gerenciar atualizações
- `src/components/UpdateNotification.tsx` - Componente de notificação
- `src/App.tsx` - Integrado UpdateNotification
- `package.json` - Adicionada dependência electron-updater e configuração de publicação

### Funcionalidades

#### Electron (Desktop)

- **Verificação automática**: O app verifica atualizações 5 segundos após iniciar e depois a cada 30 minutos
- **Download controlado**: Usuário decide quando baixar (não baixa automaticamente)
- **Instalação ao fechar**: Por padrão, instala a atualização quando o app é fechado
- **Instalação imediata**: Usuário pode optar por instalar e reiniciar imediatamente
- **Barra de progresso**: Mostra progresso do download em tempo real
- **Consentimento**: Pergunta ao usuário se deseja ativar atualizações automáticas

#### Web

- **Verificação de versão**: Compara versão local com GitHub Releases
- **Notificação**: Informa quando há nova versão disponível
- **Reload simples**: Recarrega a página para aplicar atualização

### Status de Atualização

```typescript
type UpdateStatus =
  | 'checking'        // Verificando atualizações
  | 'available'       // Atualização disponível
  | 'not-available'   // Nenhuma atualização
  | 'downloading'     // Baixando atualização
  | 'downloaded'      // Download concluído
  | 'error';          // Erro ocorreu
```

### Exemplo de Uso

```tsx
import { useAutoUpdate } from '@/hooks/useAutoUpdate';
import { CheckUpdateButton } from '@/components/UpdateNotification';

function Settings() {
  const { updateStatus, checkUpdates, download, install } = useAutoUpdate();

  return (
    <div>
      <CheckUpdateButton />
      {updateStatus?.status === 'available' && (
        <button onClick={() => download()}>
          Baixar versão {updateStatus.version}
        </button>
      )}
    </div>
  );
}
```

### Componentes Disponíveis

1. **`<UpdateNotification />`** - Gerencia todos os diálogos de atualização
   - Diálogo de consentimento
   - Diálogo de atualização disponível
   - Diálogo de atualização baixada

2. **`<CheckUpdateButton />`** - Botão para verificar manualmente

3. **`<UpdateIndicator />`** - Indicador visual para barra de navegação

### Configuração do GitHub Releases

Para ativar auto-update, você precisa:

1. Criar releases no GitHub com tags de versão (ex: `v1.0.1`)
2. Fazer upload dos instaladores (`.exe`, `.dmg`, `.AppImage`, etc.)
3. O electron-updater baixará automaticamente do GitHub Releases

### Variáveis de Ambiente

Certifique-se de ter estas variáveis no `.env`:

```env
# Auto-update (opcional)
GH_TOKEN=seu_github_token  # Para publicar releases privados
```

---

## Como Testar

### Testar Cookies

1. Abra o DevTools (F12)
2. Na aba Application > Cookies, você verá os cookies sendo criados
3. Teste alterando preferências na UI e veja os cookies sendo atualizados

### Testar Auto-Update (Electron)

1. Build da aplicação: `npm run build:electron`
2. Instale o app gerado em `release/`
3. Crie uma nova versão no GitHub com número maior
4. Abra o app e aguarde 10 segundos
5. Você verá o diálogo de consentimento
6. Após dar consentimento, o app verificará atualizações automaticamente

### Testar Auto-Update (Web)

1. Rode o dev server: `npm run dev`
2. Abra o console do navegador
3. A verificação de versão rodará em background
4. Se houver nova versão no GitHub, você verá uma notificação

---

## 3. Sistema de Download do App Desktop

Implementado um fluxo elegante e discreto para download da versão desktop.

### Páginas Criadas

- `src/pages/Download.tsx` - Página de seleção de plataforma
- `src/pages/DownloadThanks.tsx` - Página de agradecimento
- `src/components/DownloadBadge.tsx` - Componentes de badges discretos
- `src/components/DownloadAppButton.tsx` - Botões reutilizáveis

### Funcionalidades

#### Fluxo de Download

1. **Página de Seleção** (`/download`)
   - Cards elegantes para Windows e macOS
   - Busca automática do GitHub Releases
   - Mostra versão e tamanho dos arquivos
   - Animações suaves com Framer Motion
   - Download automático ao clicar

2. **Página de Agradecimento** (`/download/thanks`)
   - Animação de confetti celebratório
   - Instruções passo a passo
   - Links para guia e suporte
   - Botão para voltar ao início

#### Componentes de Badge Discretos

Múltiplas opções de badges para promover o download:

1. **`<DownloadFloatingBadge />`** (Recomendado)
   - Badge flutuante no canto inferior direito
   - Aparece após 3 segundos
   - Pode ser dispensado (lembra por 7 dias via cookie)
   - Animação suave de entrada/saída
   - Tooltip com dica

2. **`<DownloadFooterLink />`**
   - Link discreto para rodapé
   - Texto pequeno com ícone
   - Ideal para footers

3. **`<DownloadInlineBadge />`**
   - Badge inline com fundo colorido
   - Pode ser inserido em qualquer texto

4. **`<DownloadTopBanner />`**
   - Banner no topo da página
   - Pode ser fechado
   - Mensagem promocional

5. **`<DownloadTextLink />`**
   - Link de texto simples
   - Mais discreto possível

#### Integração

**No Sidebar:**
```tsx
// Botão "Baixar Desktop" no rodapé do sidebar
// Só aparece no modo Web
```

**No AppLayout:**
```tsx
// Badge flutuante em todas as páginas
<DownloadFloatingBadge />
```

### Exemplo de Uso

```tsx
import { DownloadFloatingBadge, DownloadTextLink } from '@/components/DownloadBadge';

// Em qualquer componente
<DownloadTextLink className="ml-2" />

// No layout principal (já integrado)
<DownloadFloatingBadge />
```

### Detecção Inteligente

Todos os componentes:
- ✅ Detectam automaticamente se está no Electron
- ✅ Não aparecem na versão desktop (evita confusão)
- ✅ Só aparecem no modo Web

### Cookies Utilizados

- `download_badge_dismissed` - Lembra se o usuário dispensou o badge (7 dias)

---

## Próximos Passos

1. **CI/CD**: Configurar GitHub Actions para build e publicação automática
2. **Analytics**: Adicionar tracking de atualizações instaladas
3. **Rollback**: Implementar sistema de rollback em caso de problemas
4. **Changelog**: Melhorar exibição de release notes
5. **Configurações**: Adicionar página de configurações com controles de auto-update

---

## Segurança

- Cookies usam `sameSite: 'lax'` por padrão
- Cookies sensíveis devem usar `secure: true` (apenas HTTPS)
- Auto-update verifica assinatura dos arquivos (electron-updater)
- Comunicação Electron usa `contextIsolation: true` e `nodeIntegration: false`

---

## Performance

- Cookies são sincronizados entre abas/janelas a cada 1 segundo
- Verificação de atualização não bloqueia a UI
- Downloads são realizados em background
- Cache de verificação para evitar requests desnecessários
