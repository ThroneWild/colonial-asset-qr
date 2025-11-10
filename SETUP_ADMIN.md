# Configuração do Usuário Administrador

Para configurar o sistema pela primeira vez, você precisa criar o usuário administrador Alicio e atribuir a role de admin.

## Passo 1: Criar o Usuário Alicio

Acesse o Backend (Lovable Cloud) e vá até a aba "Users" (Usuários).

Clique em "Add User" e crie um novo usuário com:
- **Email:** alicio@prizehoteis.com
- **Password:** gerencia
- **Confirm email:** Marque esta opção
- **User Metadata (opcional):** Adicione:
  ```json
  {
    "full_name": "Alicio",
    "username": "alicio"
  }
  ```

## Passo 2: Obter o ID do Usuário e Configurar Username

1. Ainda no Backend, vá para a aba "Table Editor"
2. Selecione a tabela `profiles`
3. Encontre o perfil do Alicio
4. Se o campo `username` estiver vazio, edite e defina como: **alicio**
5. Copie o ID (UUID) do perfil

## Passo 3: Atribuir Role de Admin

1. No Backend, vá para a aba "SQL Editor"
2. Execute o seguinte comando (substitua `ID_DO_USUARIO` pelo UUID copiado):

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('ID_DO_USUARIO', 'admin');
```

Por exemplo:
```sql
INSERT INTO user_roles (user_id, role)
VALUES ('c94df5de-a4c1-4bd5-ab26-e5683bdba07a', 'admin');
```

## Passo 4: Verificar

1. Faça logout se estiver logado
2. Faça login com:
   - **Usuário:** alicio
   - **Senha:** gerencia

3. Você deverá ver o menu "Usuários" na barra de navegação
4. Acesse este menu para criar novos usuários para o sistema

## Como Criar Novos Usuários

Uma vez logado como Alicio:

1. Clique em "Usuários" na barra de navegação
2. Clique no botão "Novo Usuário"
3. Preencha:
   - **Nome Completo** (será exibido no sistema)
   - **Nome de Usuário** (usado para login - sem espaços, minúsculas)
   - **Email** (para recuperação de senha e notificações)
   - **Senha** (mínimo 6 caracteres)
4. Clique em "Criar Usuário"

Os novos usuários poderão fazer login usando o **nome de usuário** e senha que você definiu. O nome completo será exibido em todo o sistema e conectado aos registros de auditoria.

## Exemplo de Login

Para um usuário criado com:
- Nome Completo: João Silva
- Nome de Usuário: joaosilva
- Senha: 123456

O login será:
- **Usuário:** joaosilva
- **Senha:** 123456

## Notas Importantes

- Apenas o usuário com role 'admin' pode criar e excluir outros usuários
- O login é feito com o **nome de usuário** (não com email)
- Os nomes de usuário são únicos e não podem ser duplicados
- Todos os usuários são registrados na tabela `profiles` com nome completo e username
- Todas as ações (criar, editar, excluir ativos) são registradas na tabela `asset_history` com o ID do usuário que executou a ação
- O sistema distingue os usuários pelo nome completo em relatórios e logs
