# Guia de Testes - PrizePatrimonios

## Visão Geral

Este projeto utiliza **Vitest** e **React Testing Library** para testes unitários e de integração.

## Executar Testes

```bash
# Executar todos os testes
npm test

# Executar testes em modo watch
npm test -- --watch

# Executar testes com UI interativa
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage
```

## Estrutura de Testes

```
src/
├── test/
│   ├── setup.ts              # Configuração global dos testes
│   └── test-utils.tsx        # Utilitários de teste customizados
├── hooks/
│   ├── useAuth.tsx
│   └── useAuth.test.tsx      # Testes do hook
├── components/
│   └── ui/
│       ├── button.tsx
│       └── button.test.tsx   # Testes do componente
└── utils/
    ├── dateConstants.ts
    └── dateConstants.test.ts # Testes de utilitários
```

## Convenções

### Nomenclatura
- Arquivos de teste devem ter a extensão `.test.ts` ou `.test.tsx`
- Devem estar no mesmo diretório do arquivo testado

### Estrutura de Teste

```typescript
import { describe, it, expect } from 'vitest';
import { render, screen } from '@/test/test-utils';

describe('ComponentName', () => {
  it('should do something', () => {
    // Arrange
    render(<ComponentName />);

    // Act
    const element = screen.getByText('text');

    // Assert
    expect(element).toBeInTheDocument();
  });
});
```

## Cobertura de Testes

### Hooks Testados
- ✅ `useAuth` - Autenticação e gerenciamento de sessão
- ✅ `usePagination` - Paginação de listas

### Componentes Testados
- ✅ `Button` - Componente de botão base
- ✅ Asset Type Constants - Constantes de tipos de ativos

### Utilitários Testados
- ✅ `dateConstants` - Funções e constantes de datas

## Mocks

### Supabase Client
O cliente Supabase é mockado globalmente em `src/test/setup.ts`:

```typescript
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));
```

### Match Media
Match media queries são mockadas para testes de responsive:

```typescript
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })),
});
```

## Adicionar Novos Testes

### 1. Para Hooks

```typescript
import { renderHook } from '@testing-library/react';
import { useYourHook } from './useYourHook';

describe('useYourHook', () => {
  it('should return initial value', () => {
    const { result } = renderHook(() => useYourHook());
    expect(result.current.value).toBe(initialValue);
  });
});
```

### 2. Para Componentes

```typescript
import { render, screen } from '@/test/test-utils';
import { YourComponent } from './YourComponent';

describe('YourComponent', () => {
  it('should render correctly', () => {
    render(<YourComponent />);
    expect(screen.getByText('expected text')).toBeInTheDocument();
  });
});
```

### 3. Para Utilitários

```typescript
import { describe, it, expect } from 'vitest';
import { yourFunction } from './yourUtil';

describe('yourFunction', () => {
  it('should calculate correctly', () => {
    expect(yourFunction(input)).toBe(expectedOutput);
  });
});
```

## Boas Práticas

1. **AAA Pattern**: Arrange, Act, Assert
2. **Testes isolados**: Cada teste deve ser independente
3. **Nomes descritivos**: Use `it('should...')` para descrever o comportamento
4. **Mocking consciente**: Mock apenas o necessário
5. **Cobertura**: Mire em >80% de cobertura para código crítico

## Recursos

- [Vitest Documentation](https://vitest.dev/)
- [React Testing Library](https://testing-library.com/react)
- [Testing Library Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
