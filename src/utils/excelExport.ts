import * as XLSX from 'xlsx';
import { Asset } from '@/types/asset';

export const exportToExcel = (assets: Asset[], filename: string = 'ativos-prize.xlsx') => {
  // Aba 1: Todos os Ativos
  const allAssetsData = assets.map((asset) => ({
    'Nº Item': `HCI-${String(asset.item_number).padStart(6, '0')}`,
    'Descrição': asset.description,
    'Setor': asset.sector,
    'Grupo': asset.asset_group,
    'Estado': asset.conservation_state,
    'Marca/Modelo': asset.brand_model || '-',
    'Valor (R$)': asset.evaluation_value || 0,
    'Cadastrado em': new Date(asset.created_at).toLocaleDateString('pt-BR'),
  }));

  // Aba 2: Resumo por Setor
  const sectorSummary = assets.reduce((acc, asset) => {
    const sector = asset.sector;
    if (!acc[sector]) {
      acc[sector] = { count: 0, totalValue: 0 };
    }
    acc[sector].count++;
    acc[sector].totalValue += asset.evaluation_value || 0;
    return acc;
  }, {} as Record<string, { count: number; totalValue: number }>);

  const sectorData = Object.entries(sectorSummary).map(([sector, data]) => ({
    'Setor': sector,
    'Quantidade': data.count,
    'Valor Total (R$)': data.totalValue,
    'Valor Médio (R$)': data.totalValue / data.count,
  }));

  // Aba 3: Resumo por Estado de Conservação
  const stateSummary = assets.reduce((acc, asset) => {
    const state = asset.conservation_state;
    if (!acc[state]) {
      acc[state] = { count: 0, totalValue: 0 };
    }
    acc[state].count++;
    acc[state].totalValue += asset.evaluation_value || 0;
    return acc;
  }, {} as Record<string, { count: number; totalValue: number }>);

  const stateData = Object.entries(stateSummary).map(([state, data]) => ({
    'Estado': state,
    'Quantidade': data.count,
    'Valor Total (R$)': data.totalValue,
    'Percentual (%)': ((data.count / assets.length) * 100).toFixed(2),
  }));

  // Aba 4: Resumo Executivo
  const totalValue = assets.reduce((sum, asset) => sum + (asset.evaluation_value || 0), 0);
  const averageValue = totalValue / assets.length;
  const executiveData = [
    { 'Métrica': 'Total de Ativos', 'Valor': assets.length },
    { 'Métrica': 'Valor Total Patrimonial (R$)', 'Valor': totalValue.toFixed(2) },
    { 'Métrica': 'Valor Médio por Ativo (R$)', 'Valor': averageValue.toFixed(2) },
    { 'Métrica': 'Ativos com Valor Cadastrado', 'Valor': assets.filter(a => a.evaluation_value).length },
    { 'Métrica': 'Data do Relatório', 'Valor': new Date().toLocaleDateString('pt-BR') },
  ];

  // Criar workbook
  const wb = XLSX.utils.book_new();

  // Adicionar abas
  const ws1 = XLSX.utils.json_to_sheet(allAssetsData);
  const ws2 = XLSX.utils.json_to_sheet(sectorData);
  const ws3 = XLSX.utils.json_to_sheet(stateData);
  const ws4 = XLSX.utils.json_to_sheet(executiveData);

  XLSX.utils.book_append_sheet(wb, ws1, 'Todos os Ativos');
  XLSX.utils.book_append_sheet(wb, ws2, 'Por Setor');
  XLSX.utils.book_append_sheet(wb, ws3, 'Por Estado');
  XLSX.utils.book_append_sheet(wb, ws4, 'Resumo Executivo');

  // Download
  XLSX.writeFile(wb, filename);
};