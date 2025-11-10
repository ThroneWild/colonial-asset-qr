import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { toast } from 'sonner';
import { UserPlus, Trash2, Eye, EyeOff } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface User {
  id: string;
  email: string;
  created_at: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    // Verificar se é o admin
    if (user.email !== 'alicio@prizehoteis.com') {
      toast.error('Acesso negado. Apenas administradores podem acessar esta página.');
      navigate('/');
      return;
    }
    fetchUsers();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data: { users: authUsers }, error } = await supabase.auth.admin.listUsers();
      
      if (error) throw error;
      
      setUsers(authUsers as User[]);
    } catch (error: any) {
      console.error('Erro ao carregar usuários:', error);
      toast.error('Erro ao carregar lista de usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);

    try {
      const { data, error } = await supabase.auth.admin.createUser({
        email: newUserEmail,
        password: newUserPassword,
        email_confirm: true,
      });

      if (error) throw error;

      toast.success('Usuário criado com sucesso!');
      setIsDialogOpen(false);
      setNewUserEmail('');
      setNewUserPassword('');
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao criar usuário');
    } finally {
      setCreatingUser(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      const { error } = await supabase.auth.admin.deleteUser(userToDelete.id);

      if (error) throw error;

      toast.success('Usuário excluído com sucesso!');
      setUserToDelete(null);
      fetchUsers();
    } catch (error: any) {
      toast.error(error.message || 'Erro ao excluir usuário');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-4xl">
      <div className="mb-6 sm:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Gerenciamento de Usuários
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Gerencie os usuários do sistema
          </p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Criar Novo Usuário</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="usuario@email.com"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  A senha deve ter no mínimo 6 caracteres
                </p>
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={creatingUser} className="flex-1">
                  {creatingUser ? 'Criando...' : 'Criar Usuário'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {users.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">Nenhum usuário cadastrado</p>
          </Card>
        ) : (
          users.map((userItem) => (
            <Card key={userItem.id} className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground text-base sm:text-lg">
                    {userItem.email}
                  </h3>
                  <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                    Criado em: {new Date(userItem.created_at).toLocaleDateString('pt-BR')}
                  </p>
                  {userItem.email === 'alicio@prizehoteis.com' && (
                    <span className="inline-block mt-2 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                      Administrador
                    </span>
                  )}
                </div>

                {userItem.email !== 'alicio@prizehoteis.com' && (
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setUserToDelete(userItem)}
                  >
                    <Trash2 className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Excluir</span>
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={!!userToDelete} onOpenChange={() => setUserToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário <strong>{userToDelete?.email}</strong>?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UserManagement;
