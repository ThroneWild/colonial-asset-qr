import { Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { isElectron } from '@/utils/electron';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * Botão discreto para baixar o app desktop
 * Só aparece quando estiver no modo Web
 */
export function DownloadAppButton() {
  const navigate = useNavigate();

  // Não mostrar o botão se já estiver no Electron
  if (isElectron()) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/download')}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Download className="h-4 w-4" />
          <span className="hidden sm:inline">Baixar App</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Baixar versão desktop</p>
      </TooltipContent>
    </Tooltip>
  );
}

/**
 * Versão compacta do botão para o sidebar footer
 */
export function DownloadAppButtonCompact() {
  const navigate = useNavigate();

  // Não mostrar o botão se já estiver no Electron
  if (isElectron()) {
    return null;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/download')}
          className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <Download className="h-4 w-4" />
          <span>Baixar Desktop</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>Baixar aplicativo para Windows ou macOS</p>
      </TooltipContent>
    </Tooltip>
  );
}
