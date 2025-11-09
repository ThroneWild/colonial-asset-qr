import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertCircle } from 'lucide-react';

interface DeleteAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reason: string) => void;
  assetDescription: string;
  isLoading?: boolean;
}

export const DeleteAssetDialog = ({ 
  open, 
  onOpenChange, 
  onConfirm, 
  assetDescription,
  isLoading = false 
}: DeleteAssetDialogProps) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('O motivo da exclusão é obrigatório');
      return;
    }

    if (reason.trim().length < 10) {
      setError('O motivo deve ter pelo menos 10 caracteres');
      return;
    }

    onConfirm(reason.trim());
    setReason('');
    setError('');
  };

  const handleCancel = () => {
    setReason('');
    setError('');
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
            <AlertDialogTitle className="text-2xl">Confirmar Exclusão</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="text-base">
            Você está prestes a excluir permanentemente o ativo:
            <span className="block mt-2 font-semibold text-foreground">"{assetDescription}"</span>
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-4 py-4">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
            <p className="text-sm text-destructive font-medium">
              ⚠️ Esta ação não pode ser desfeita. O ativo será removido permanentemente do sistema.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="deletion-reason" className="text-base font-semibold">
              Motivo da Exclusão <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="deletion-reason"
              placeholder="Descreva o motivo da exclusão deste ativo (mínimo 10 caracteres)..."
              value={reason}
              onChange={(e) => {
                setReason(e.target.value);
                setError('');
              }}
              className={`min-h-[120px] ${error ? 'border-destructive' : ''}`}
              disabled={isLoading}
            />
            {error && (
              <p className="text-sm text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {error}
              </p>
            )}
            <p className="text-sm text-muted-foreground">
              Este motivo será registrado no histórico de auditoria e não poderá ser alterado.
            </p>
          </div>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={handleCancel} disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isLoading ? 'Excluindo...' : 'Confirmar Exclusão'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};