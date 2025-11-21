import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle2, Home, FileText, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import confetti from 'canvas-confetti';

export default function DownloadThanks() {
  const navigate = useNavigate();

  useEffect(() => {
    // Animação de confetti ao carregar a página
    const duration = 2000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
      });
      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ['#3b82f6', '#8b5cf6', '#ec4899'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };

    frame();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2">
          <CardHeader className="text-center space-y-6 pb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.2,
                type: 'spring',
                stiffness: 200,
                damping: 10,
              }}
              className="mx-auto w-24 h-24 bg-green-500/10 rounded-full flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <CardTitle className="text-3xl font-bold mb-2">
                Obrigado por baixar!
              </CardTitle>
              <CardDescription className="text-lg">
                O download do Colonial Asset QR foi iniciado
              </CardDescription>
            </motion.div>
          </CardHeader>

          <CardContent className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-muted/50 rounded-lg p-6 space-y-4"
            >
              <h3 className="font-semibold text-lg">Próximos passos:</h3>
              <ol className="space-y-3 text-sm">
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    1
                  </span>
                  <div>
                    <p className="font-medium">Localize o arquivo baixado</p>
                    <p className="text-muted-foreground">
                      Geralmente na pasta "Downloads" do seu computador
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    2
                  </span>
                  <div>
                    <p className="font-medium">Execute o instalador</p>
                    <p className="text-muted-foreground">
                      Dê um duplo clique no arquivo para iniciar a instalação
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    3
                  </span>
                  <div>
                    <p className="font-medium">Siga as instruções</p>
                    <p className="text-muted-foreground">
                      O assistente de instalação irá guiá-lo pelo processo
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
                    4
                  </span>
                  <div>
                    <p className="font-medium">Faça login</p>
                    <p className="text-muted-foreground">
                      Use suas credenciais para acessar o sistema
                    </p>
                  </div>
                </li>
              </ol>
            </motion.div>

            <Separator />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-3"
            >
              <h4 className="font-semibold text-sm text-muted-foreground">
                PRECISA DE AJUDA?
              </h4>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="outline" className="justify-start" asChild>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    <FileText className="mr-2 h-4 w-4" />
                    Guia de instalação
                  </a>
                </Button>
                <Button variant="outline" className="justify-start" asChild>
                  <a href="#" onClick={(e) => e.preventDefault()}>
                    <HelpCircle className="mr-2 h-4 w-4" />
                    Suporte técnico
                  </a>
                </Button>
              </div>
            </motion.div>

            <Separator />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
              className="flex flex-col sm:flex-row gap-3 justify-center pt-4"
            >
              <Button
                size="lg"
                onClick={() => navigate('/')}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Voltar para o início
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center text-sm text-muted-foreground"
            >
              <p>O download não iniciou?</p>
              <Button
                variant="link"
                size="sm"
                onClick={() => navigate('/download')}
                className="h-auto p-0"
              >
                Clique aqui para tentar novamente
              </Button>
            </motion.div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
