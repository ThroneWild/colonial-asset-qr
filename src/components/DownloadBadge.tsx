import { Download, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { isElectron } from '@/utils/electron';
import { Button } from '@/components/ui/button';
import { getCookie, setCookie } from '@/utils/cookies';

/**
 * Badge discreto flutuante para download do app
 * Aparece no canto inferior direito
 */
export function DownloadFloatingBadge() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Não mostrar no Electron
    if (isElectron()) return;

    // Verificar se foi dispensado anteriormente
    const dismissed = getCookie('download_badge_dismissed');
    if (dismissed === 'true') {
      setIsDismissed(true);
      return;
    }

    // Mostrar após 3 segundos
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    // Lembrar por 7 dias
    setCookie('download_badge_dismissed', 'true', { expires: 7 });
  };

  const handleClick = () => {
    navigate('/download');
  };

  // Não renderizar se for Electron ou foi dispensado
  if (isElectron() || isDismissed) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="fixed bottom-6 right-6 z-50"
        >
          <div className="relative bg-gradient-to-r from-primary/90 to-primary/80 backdrop-blur-sm text-primary-foreground rounded-full shadow-lg hover:shadow-xl transition-all group">
            <Button
              onClick={handleClick}
              variant="ghost"
              className="h-auto py-3 px-5 pr-12 rounded-full hover:bg-transparent group-hover:scale-105 transition-transform"
            >
              <Download className="mr-2 h-4 w-4" />
              <span className="text-sm font-medium">Baixe aqui</span>
            </Button>
            <button
              onClick={handleDismiss}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Dispensar"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="absolute -top-12 right-0 bg-popover text-popover-foreground text-xs px-3 py-1.5 rounded-md shadow-md whitespace-nowrap pointer-events-none"
          >
            Experimente o app desktop
            <div className="absolute -bottom-1 right-6 w-2 h-2 bg-popover rotate-45" />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/**
 * Link discreto para footer/rodapé
 */
export function DownloadFooterLink() {
  const navigate = useNavigate();

  // Não mostrar no Electron
  if (isElectron()) return null;

  return (
    <button
      onClick={() => navigate('/download')}
      className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
    >
      <Download className="h-3 w-3" />
      <span>Baixe aqui</span>
    </button>
  );
}

/**
 * Badge inline discreto
 */
export function DownloadInlineBadge() {
  const navigate = useNavigate();

  // Não mostrar no Electron
  if (isElectron()) return null;

  return (
    <button
      onClick={() => navigate('/download')}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-xs font-medium"
    >
      <Download className="h-3 w-3" />
      <span>Baixe aqui</span>
    </button>
  );
}

/**
 * Banner discreto no topo
 */
export function DownloadTopBanner() {
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(true);

  // Não mostrar no Electron
  if (isElectron() || !isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className="bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-b border-primary/20"
    >
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm">
            <Download className="h-4 w-4 text-primary" />
            <span className="text-muted-foreground">
              Experimente a versão desktop para melhor desempenho
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigate('/download')}
              className="h-7 text-xs font-medium"
            >
              Baixe aqui
            </Button>
            <button
              onClick={() => setIsVisible(false)}
              className="p-1 rounded-full hover:bg-muted transition-colors"
              aria-label="Fechar"
            >
              <X className="h-3 w-3 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Texto discreto com ícone
 */
export function DownloadTextLink({ className = '' }: { className?: string }) {
  const navigate = useNavigate();

  // Não mostrar no Electron
  if (isElectron()) return null;

  return (
    <button
      onClick={() => navigate('/download')}
      className={`inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors underline-offset-4 hover:underline ${className}`}
    >
      <Download className="h-3 w-3" />
      Baixe aqui
    </button>
  );
}
