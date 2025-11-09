import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { LogIn, UserPlus } from 'lucide-react';
import { z } from 'zod';
import logoPrize from '@/assets/logo-prize.png';
import { ThemeToggle } from '@/components/ThemeToggle';

const signUpSchema = z.object({
  full_name: z.string().trim().min(3, 'Nome deve ter no mínimo 3 caracteres').max(100, 'Nome muito longo'),
  email: z.string().trim().email('Email inválido').max(255, 'Email muito longo'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres').max(100, 'Senha muito longa'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
});

const loginSchema = z.object({
  email: z.string().trim().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória'),
});

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Verificar se já está autenticado
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate('/');
      }
    };
    checkAuth();
  }, [navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validatedData = signUpSchema.parse(formData);
      setIsLoading(true);

      const { error } = await supabase.auth.signUp({
        email: validatedData.email,
        password: validatedData.password,
        options: {
          data: {
            full_name: validatedData.full_name,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          toast.error('Este email já está cadastrado. Tente fazer login.');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('Conta criada com sucesso! Você já pode fazer login.');
      setIsLogin(true);
      setFormData({ full_name: '', email: '', password: '', confirmPassword: '' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validatedData = loginSchema.parse({
        email: formData.email,
        password: formData.password,
      });
      setIsLoading(true);

      const { error } = await supabase.auth.signInWithPassword({
        email: validatedData.email,
        password: validatedData.password,
      });

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Email ou senha incorretos');
        } else {
          toast.error(error.message);
        }
        return;
      }

      toast.success('Login realizado com sucesso!');
      navigate('/');
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            fieldErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(fieldErrors);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle flex items-center justify-center p-4 relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      
      <Card className="w-full max-w-md p-8 shadow-elegant border-0 animate-scale-in bg-card/80 backdrop-blur">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logoPrize} alt="Prize Patrimônios" className="h-20 w-auto drop-shadow-lg" />
          </div>
          <h1 className="text-3xl font-display font-bold text-foreground mb-1">
            <span className="text-gold">Prize</span> Patrimônios
          </h1>
          <p className="text-sm text-muted-foreground font-sans">Sistema de Gestão Patrimonial</p>
          <p className="text-xs text-muted-foreground/70 mt-1 font-sans italic">By prize hoteis</p>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            variant={isLogin ? 'default' : 'outline'}
            onClick={() => {
              setIsLogin(true);
              setErrors({});
            }}
            className="flex-1"
          >
            <LogIn className="h-4 w-4 mr-2" />
            Entrar
          </Button>
          <Button
            variant={!isLogin ? 'default' : 'outline'}
            onClick={() => {
              setIsLogin(false);
              setErrors({});
            }}
            className="flex-1"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Cadastrar
          </Button>
        </div>

        <form onSubmit={isLogin ? handleLogin : handleSignUp} className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                name="full_name"
                type="text"
                value={formData.full_name}
                onChange={handleInputChange}
                placeholder="Seu nome completo"
                disabled={isLoading}
              />
              {errors.full_name && (
                <p className="text-sm text-destructive">{errors.full_name}</p>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="seu@email.com"
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••"
              disabled={isLoading}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            {errors.password && (
              <p className="text-sm text-destructive">{errors.password}</p>
            )}
          </div>

          {!isLogin && (
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Senha</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                placeholder="••••••••"
                disabled={isLoading}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <p className="text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Cadastrar'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Auth;
