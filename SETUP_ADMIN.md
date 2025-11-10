# Configuração do Usuário Administrador

Para configurar o sistema pela primeira vez, você precisa criar o usuário administrador Alicio e atribuir a role de admin.

## Passo 1: Criar o Usuário Alicio

Acesse o Backend (Lovable Cloud) e vá até a aba "Users" (Usuários).

Clique em "Add User" e crie um novo usuário com:
- **Email:** alicio@prizehoteis.com
- **Password:** gerencia
- **Confirm email:** Marque esta opção

## Passo 2: Obter o ID do Usuário

1. Ainda no Backend, vá para a aba "Table Editor"
2. Selecione a tabela `profiles`
3. Encontre o perfil do Alicio e copie o ID (UUID)

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
   - Email: alicio@prizehoteis.com
   - Senha: gerencia

3. Você deverá ver o menu "Usuários" na barra de navegação
4. Acesse este menu para criar novos usuários para o sistema

## Como Criar Novos Usuários

Uma vez logado como Alicio:

1. Clique em "Usuários" na barra de navegação
2. Clique no botão "Novo Usuário"
3. Preencha:
   - Nome Completo (será exibido no sistema)
   - Email (usado para login)
   - Senha (mínimo 6 caracteres)
4. Clique em "Criar Usuário"

Os novos usuários poderão fazer login com o email e senha que você definiu. O nome completo será exibido em todo o sistema e conectado aos registros de auditoria.

## Notas Importantes

- Apenas o usuário com role 'admin' pode criar e excluir outros usuários
- Todos os usuários são registrados na tabela `profiles` com nome completo
- Todas as ações (criar, editar, excluir ativos) são registradas na tabela `asset_history` com o ID do usuário que executou a ação
- O sistema distingue os usuários pelo nome completo em relatórios e logs
