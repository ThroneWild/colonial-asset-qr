import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Asset } from '@/types/asset';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Building2, 
  Search, 
  Download, 
  Printer, 
  ChevronDown, 
  ChevronUp,
  TrendingUp,
  Package,
  AlertCircle,
  CheckCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface ApartmentData {
  number: string;
  assets: Asset[];
  totalValue: number;
  totalItems: number;
  conservationStats: {
    Novo: number;
    Bom: number;
    Regular: number;
    Ruim: number;
  };
}

export default function ApartmentReport() {
  const [apartments, setApartments] = useState<ApartmentData[]>([]);
  const [filteredApartments, setFilteredApartments] = useState<ApartmentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [openApartments, setOpenApartments] = useState<Set<string>>(new Set());
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
      return;
    }

    if (user) {
      loadApartmentData();
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (searchTerm) {
      const filtered = apartments.filter(apt => 
        apt.number.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredApartments(filtered);
    } else {
      setFilteredApartments(apartments);
    }
  }, [searchTerm, apartments]);

  const loadApartmentData = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('assets')
        .select('*')
        .eq('location_type', 'apartamento')
        .not('apartment_number', 'is', null)
        .order('apartment_number');

      if (error) throw error;

      const apartmentMap = new Map<string, Asset[]>();
      
      (data as Asset[]).forEach(asset => {
        if (asset.apartment_number) {
          if (!apartmentMap.has(asset.apartment_number)) {
            apartmentMap.set(asset.apartment_number, []);
          }
          apartmentMap.get(asset.apartment_number)!.push(asset);
        }
      });

      const apartmentsData: ApartmentData[] = Array.from(apartmentMap.entries()).map(([number, assets]) => {
        const totalValue = assets.reduce((sum, asset) => sum + (asset.evaluation_value || 0), 0);
        const conservationStats = {
          Novo: assets.filter(a => a.conservation_state === 'Novo').length,
          Bom: assets.filter(a => a.conservation_state === 'Bom').length,
          Regular: assets.filter(a => a.conservation_state === 'Regular').length,
          Ruim: assets.filter(a => a.conservation_state === 'Ruim').length,
        };

        return {
          number,
          assets,
          totalValue,
          totalItems: assets.length,
          conservationStats,
        };
      });

      apartmentsData.sort((a, b) => a.number.localeCompare(b.number, undefined, { numeric: true }));
      
      setApartments(apartmentsData);
      setFilteredApartments(apartmentsData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar relatório de apartamentos');
    } finally {
      setLoading(false);
    }
  };

  const toggleApartment = (number: string) => {
    setOpenApartments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(number)) {
        newSet.delete(number);
      } else {
        newSet.add(number);
      }
      return newSet;
    });
  };

  const getConservationColor = (state: string) => {
    switch (state) {
      case 'Novo': return 'text-green-600';
      case 'Bom': return 'text-blue-600';
      case 'Regular': return 'text-yellow-600';
      case 'Ruim': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getConservationBadge = (state: string) => {
    switch (state) {
      case 'Novo': return 'glass-excellent';
      case 'Bom': return 'glass-good';
      case 'Regular': return 'glass-fair';
      case 'Ruim': return 'glass-poor';
      default: return 'outline';
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    doc.setFontSize(18);
    doc.text('Relatório de Patrimônio por Apartamento', pageWidth / 2, 15, { align: 'center' });
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`, pageWidth / 2, 22, { align: 'center' });

    let yPos = 30;

    filteredApartments.forEach((apt, index) => {
      if (yPos > 270) {
        doc.addPage();
        yPos = 20;
      }

      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text(`Apartamento ${apt.number}`, 14, yPos);
      yPos += 7;

      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(`Total de Itens: ${apt.totalItems}`, 14, yPos);
      doc.text(`Valor Total: R$ ${apt.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 100, yPos);
      yPos += 5;

      const tableData = apt.assets.map(asset => [
        asset.item_number.toString(),
        asset.description,
        asset.asset_group,
        asset.conservation_state,
        asset.evaluation_value ? `R$ ${asset.evaluation_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '-'
      ]);

      autoTable(doc, {
        startY: yPos,
        head: [['Item', 'Descrição', 'Grupo', 'Estado', 'Valor']],
        body: tableData,
        theme: 'striped',
        headStyles: { fillColor: [59, 130, 246] },
        margin: { left: 14, right: 14 },
        styles: { fontSize: 8 },
      });

      yPos = (doc as any).lastAutoTable.finalY + 10;
    });

    doc.save('relatorio-apartamentos.pdf');
    toast.success('PDF gerado com sucesso!');
  };

  const exportToExcel = () => {
    const workbook = XLSX.utils.book_new();

    const summaryData = filteredApartments.map(apt => ({
      'Apartamento': apt.number,
      'Total de Itens': apt.totalItems,
      'Valor Total': apt.totalValue,
      'Novo': apt.conservationStats.Novo,
      'Bom': apt.conservationStats.Bom,
      'Regular': apt.conservationStats.Regular,
      'Ruim': apt.conservationStats.Ruim,
    }));

    const summarySheet = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Resumo');

    filteredApartments.forEach(apt => {
      const detailData = apt.assets.map(asset => ({
        'Item': asset.item_number,
        'Descrição': asset.description,
        'Setor': asset.sector,
        'Grupo': asset.asset_group,
        'Estado': asset.conservation_state,
        'Marca/Modelo': asset.brand_model || '-',
        'Valor': asset.evaluation_value || 0,
      }));

      const detailSheet = XLSX.utils.json_to_sheet(detailData);
      const sheetName = `Apt ${apt.number}`.substring(0, 31);
      XLSX.utils.book_append_sheet(workbook, detailSheet, sheetName);
    });

    XLSX.writeFile(workbook, 'relatorio-apartamentos.xlsx');
    toast.success('Excel gerado com sucesso!');
  };

  const handlePrint = () => {
    window.print();
  };

  const totalItems = filteredApartments.reduce((sum, apt) => sum + apt.totalItems, 0);
  const totalValue = filteredApartments.reduce((sum, apt) => sum + apt.totalValue, 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Início</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Relatório por Apartamento</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Relatório por Apartamento</h1>
            <p className="text-muted-foreground">Visualize o patrimônio detalhado de cada unidade habitacional</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-600/5 border-blue-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Apartamentos</p>
                <p className="text-3xl font-bold text-foreground mt-1">{filteredApartments.length}</p>
              </div>
              <Building2 className="h-10 w-10 text-blue-600 opacity-80" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-purple-500/10 to-purple-600/5 border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total de Itens</p>
                <p className="text-3xl font-bold text-foreground mt-1">{totalItems}</p>
              </div>
              <Package className="h-10 w-10 text-purple-600 opacity-80" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-600/5 border-green-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Valor Total</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValue)}
                </p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600 opacity-80" />
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-600/5 border-orange-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Média por Apt</p>
                <p className="text-2xl font-bold text-foreground mt-1">
                  {filteredApartments.length > 0 ? (totalValue / filteredApartments.length).toFixed(0) : '0'} R$
                </p>
              </div>
              <CheckCircle className="h-10 w-10 text-orange-600 opacity-80" />
            </div>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar apartamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Button onClick={exportToPDF} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              PDF
            </Button>
            <Button onClick={exportToExcel} variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Excel
            </Button>
            <Button onClick={handlePrint} variant="outline" className="gap-2 print:hidden">
              <Printer className="h-4 w-4" />
              Imprimir
            </Button>
          </div>
        </div>
      </div>

      {filteredApartments.length === 0 ? (
        <Card className="p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Nenhum apartamento encontrado</h3>
          <p className="text-muted-foreground">
            {searchTerm ? 'Tente ajustar sua busca' : 'Não há apartamentos cadastrados no sistema'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredApartments.map((apt, index) => (
            <Card key={apt.number} className="overflow-hidden animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
              <Collapsible open={openApartments.has(apt.number)} onOpenChange={() => toggleApartment(apt.number)}>
                <CollapsibleTrigger className="w-full">
                  <div className="p-6 hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-bold">Apartamento {apt.number}</h3>
                          <p className="text-sm text-muted-foreground">
                            {apt.totalItems} {apt.totalItems === 1 ? 'item' : 'itens'} cadastrados
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Valor Total</p>
                          <Badge variant="glass-gold" className="text-lg font-bold mt-1">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(apt.totalValue)}
                          </Badge>
                        </div>

                        <div className="flex gap-2">
                          {apt.conservationStats.Novo > 0 && (
                            <Badge variant="glass-excellent">{apt.conservationStats.Novo}</Badge>
                          )}
                          {apt.conservationStats.Bom > 0 && (
                            <Badge variant="glass-good">{apt.conservationStats.Bom}</Badge>
                          )}
                          {apt.conservationStats.Regular > 0 && (
                            <Badge variant="glass-fair">{apt.conservationStats.Regular}</Badge>
                          )}
                          {apt.conservationStats.Ruim > 0 && (
                            <Badge variant="glass-poor">{apt.conservationStats.Ruim}</Badge>
                          )}
                        </div>

                        {openApartments.has(apt.number) ? (
                          <ChevronUp className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </div>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="border-t border-border">
                    <div className="p-6 bg-muted/30">
                      <div className="grid gap-4">
                        {apt.assets.map((asset) => (
                          <Card key={asset.id} className="p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <Badge variant="glass-primary">#{asset.item_number}</Badge>
                                  <Badge variant={getConservationBadge(asset.conservation_state)}>
                                    {asset.conservation_state}
                                  </Badge>
                                </div>
                                <h4 className="font-semibold text-lg mb-1">{asset.description}</h4>
                                <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
                                  <span>{asset.sector}</span>
                                  <span>•</span>
                                  <span>{asset.asset_group}</span>
                                  {asset.brand_model && (
                                    <>
                                      <span>•</span>
                                      <span>{asset.brand_model}</span>
                                    </>
                                  )}
                                </div>
                              </div>
                              {asset.evaluation_value && (
                                <Badge variant="glass-gold" className="text-base font-bold shrink-0">
                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(asset.evaluation_value)}
                                </Badge>
                              )}
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
