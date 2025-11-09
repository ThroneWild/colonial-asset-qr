import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Download, Tag, Edit, Trash2, FileSpreadsheet } from "lucide-react";
import { Asset } from "@/types/asset";

interface BatchActionBarProps {
  selectedAssets: Asset[];
  onClearSelection: () => void;
  onExportPDF: (assets: Asset[]) => void;
  onExportExcel: (assets: Asset[]) => void;
  onGenerateLabels: (assets: Asset[]) => void;
  onBatchDelete?: (assets: Asset[]) => void;
}

export const BatchActionBar = ({
  selectedAssets,
  onClearSelection,
  onExportPDF,
  onExportExcel,
  onGenerateLabels,
  onBatchDelete,
}: BatchActionBarProps) => {
  if (selectedAssets.length === 0) return null;

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
      <div className="glass-light border-2 border-primary/20 rounded-xl shadow-elegant px-6 py-4 flex items-center gap-4">
        <Badge variant="default" className="h-8 px-3 text-base">
          {selectedAssets.length} {selectedAssets.length === 1 ? 'item selecionado' : 'itens selecionados'}
        </Badge>

        <div className="h-8 w-px bg-border" />

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onExportPDF(selectedAssets)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onExportExcel(selectedAssets)}
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            Excel
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onGenerateLabels(selectedAssets)}
            className="gap-2"
          >
            <Tag className="h-4 w-4" />
            Etiquetas
          </Button>

          {onBatchDelete && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => onBatchDelete(selectedAssets)}
              className="gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Excluir
            </Button>
          )}
        </div>

        <div className="h-8 w-px bg-border" />

        <Button
          variant="ghost"
          size="sm"
          onClick={onClearSelection}
          className="gap-2"
        >
          <X className="h-4 w-4" />
          Limpar
        </Button>
      </div>
    </div>
  );
};