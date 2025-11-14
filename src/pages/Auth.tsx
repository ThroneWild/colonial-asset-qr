import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { BackgroundPaths } from "@/components/ui/background-paths";
import { SignInCard } from "@/components/ui/sign-in-card-2";

type SignInFormValues = {
  identifier: string;
  password: string;
  rememberMe: boolean;
};

const Auth = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (session) {
        navigate("/");
      }
    };
    checkAuth();
  }, [navigate]);

  const handleSubmit = useCallback(
    async ({ identifier, password }: SignInFormValues) => {
      setLoading(true);

      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/login-with-username`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            },
            body: JSON.stringify({
              username: identifier,
              password,
            }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Erro ao fazer login");
        }

        const { error: sessionError } = await supabase.auth.setSession({
          access_token: result.session.access_token,
          refresh_token: result.session.refresh_token,
        });

        if (sessionError) throw sessionError;

        toast.success("Login realizado com sucesso!");
        navigate("/");
      } catch (error) {
        const message = error instanceof Error ? error.message : "Usuário ou senha incorretos";
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [navigate]
  );

  return (
    <BackgroundPaths title="Prize Patrimônios">
      <div className="flex w-full justify-center py-12">
        <SignInCard
          title="Bem-vindo de volta"
          subtitle="Sistema de Controle Patrimonial"
          identifierPlaceholder="Usuário"
          identifierType="text"
          identifierMode="user"
          submitLabel="Entrar"
          loading={loading}
          onSubmit={handleSubmit}
        />
      </div>
    </BackgroundPaths>
  );
};

export default Auth;
