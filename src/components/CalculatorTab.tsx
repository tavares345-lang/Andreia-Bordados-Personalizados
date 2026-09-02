import React, { useState, useEffect } from 'react';
import { Client, Order, CalculatorPreset } from '../types';
import { ANDREIA_LOGO_URL } from '../assets/logo';
import { 
  Calculator, 
  HelpCircle, 
  TrendingUp, 
  DollarSign, 
  FileText, 
  Share2, 
  Sparkles, 
  ArrowRight, 
  Info, 
  CheckCircle, 
  Copy, 
  Plus, 
  Settings,
  Edit2,
  Trash2,
  X,
  Check,
  Bookmark,
  RotateCcw,
  Sliders,
  Layers,
  Save,
  Printer,
  Eye
} from 'lucide-react';

interface CalculatorTabProps {
  clients: Client[];
  onAddOrder: (order: Order) => void;
  onNavigateToTab: (tabId: string) => void;
}

const DEFAULT_PRESETS: CalculatorPreset[] = [
  { id: 'preset-1', name: 'Toalha de Bebê / Nome Cursivo', points: 8000, manualTime: 0.5, matrixEdit: 15, fabric: 'Fralda Plush', otherCosts: 5, profitMargin: 50 },
  { id: 'preset-2', name: 'Logomarca Corporativa Pequena (Peito)', points: 12000, manualTime: 0.3, matrixEdit: 30, fabric: 'Camisa Polo PA', otherCosts: 2, profitMargin: 50 },
  { id: 'preset-3', name: 'Brasão Costas Casamento Roupão', points: 22000, manualTime: 0.8, matrixEdit: 40, fabric: 'Cetim Especial', otherCosts: 8, profitMargin: 60 },
  { id: 'preset-4', name: 'Bordado Gigante Jaqueta Moletom', points: 45000, manualTime: 1.5, matrixEdit: 60, fabric: 'Moletom 3 cabos', otherCosts: 10, profitMargin: 50 }
];

const PRESETS_STORAGE_KEY = 'atelie_calculator_presets_v1';

export default function CalculatorTab({ clients, onAddOrder, onNavigateToTab }: CalculatorTabProps) {
  // Presets State with LocalStorage Persistence
  const [presets, setPresets] = useState<CalculatorPreset[]>(() => {
    try {
      const saved = localStorage.getItem(PRESETS_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch {
      // Fallback
    }
    return DEFAULT_PRESETS;
  });

  const [activePresetId, setActivePresetId] = useState<string | null>('preset-2');
  
  // Presets Management Modal State
  const [isPresetModalOpen, setIsPresetModalOpen] = useState(false);
  const [isEditingPresetFormOpen, setIsEditingPresetFormOpen] = useState(false);
  const [presetUnderEdit, setPresetUnderEdit] = useState<CalculatorPreset | null>(null);

  // Official Quote Preview Modal with Logo
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteClientName, setQuoteClientName] = useState('');
  const [copiedQuoteToast, setCopiedQuoteToast] = useState('');

  // Preset Form Fields
  const [presetFormName, setPresetFormName] = useState('');
  const [presetFormPoints, setPresetFormPoints] = useState(10000);
  const [presetFormManualTime, setPresetFormManualTime] = useState(0.5);
  const [presetFormMatrixCost, setPresetFormMatrixCost] = useState(25);
  const [presetFormOtherCosts, setPresetFormOtherCosts] = useState(5);
  const [presetFormFabric, setPresetFormFabric] = useState('');
  const [presetFormProfitMargin, setPresetFormProfitMargin] = useState(50);
  const [presetFormError, setPresetFormError] = useState('');
  const [presetToast, setPresetToast] = useState('');

  // Save presets whenever they change
  useEffect(() => {
    try {
      localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets));
    } catch (e) {
      console.error('Error saving presets to localStorage', e);
    }
  }, [presets]);

  const showPresetToast = (msg: string) => {
    setPresetToast(msg);
    setTimeout(() => setPresetToast(''), 4000);
  };

  // Inputs state
  const [descName, setDescName] = useState('Bordado Personalizado');
  const [points, setPoints] = useState(12000);
  const [manualTime, setManualTime] = useState(0.5); // Hours
  const [matrixCost, setMatrixCost] = useState(25); // Criação e edição da matriz
  const [backingCount, setBackingCount] = useState(1); // Entretelas gastas (un)
  const [needleWearCost, setNeedleWearCost] = useState(0.5); // Agulha gasta flat
  const [additionalCost, setAdditionalCost] = useState(5.00); // Embalagem, fitas, outros
  
  // Advanced parameters
  const [machineSpeed, setMachineSpeed] = useState(650); // stitches per minute
  const [manualHourRate, setManualHourRate] = useState(20.00); // R$/hora
  const [backingUnitPrice, setBackingUnitPrice] = useState(0.80); // R$ por folha/metro
  const [threadCostPer1k, setThreadCostPer1k] = useState(0.20); // R$ por 1000 pontos
  const [energyCostHour, setEnergyCostHour] = useState(0.25); // R$ por hora de uso da máquina
  const [machineDepreciationPer1k, setMachineDepreciationPer1k] = useState(0.12); // R$ por 1k pontos

  // Profit & Discounts
  const [profitMargin, setProfitMargin] = useState(50); // (%)
  const [discountPercent, setDiscountPercent] = useState(0); // (%)

  // Outputs state
  const [costBreakdown, setCostBreakdown] = useState({
    thread: 0,
    backing: 0,
    needles: 0,
    machineTime: 0,
    manualTimeCost: 0,
    energy: 0,
    depreciation: 0,
    matrix: 0,
    additionally: 0,
    totalCost: 0
  });

  const [prices, setPrices] = useState({
    rawCost: 0,
    suggestedNoDiscount: 0,
    suggestedWithDiscount: 0,
    profitValue: 0
  });

  const [selectedClientForConvert, setSelectedClientForConvert] = useState(clients[0]?.id || '');
  const [convertSuccess, setConvertSuccess] = useState('');

  // Auto-recalculate
  useEffect(() => {
    // Calculando custos parciais
    const threadCostTotal = (points / 1000) * threadCostPer1k;
    const backingCostTotal = backingCount * backingUnitPrice;
    const needleCostTotal = needleWearCost;
    
    // Tempo estimado de máquina em horas
    const machineMinutes = (points / machineSpeed) + 5; // 5 minutos de setup
    const machineHours = machineMinutes / 60;
    
    const energyCostTotal = machineHours * energyCostHour;
    const depreciationCostTotal = (points / 1000) * machineDepreciationPer1k;
    const manualTimeTotalCost = manualTime * manualHourRate;

    const totalCustoReal = 
      threadCostTotal + 
      backingCostTotal + 
      needleCostTotal + 
      energyCostTotal + 
      depreciationCostTotal + 
      manualTimeTotalCost + 
      matrixCost + 
      additionalCost;

    setCostBreakdown({
      thread: threadCostTotal,
      backing: backingCostTotal,
      needles: needleCostTotal,
      machineTime: machineMinutes,
      manualTimeCost: manualTimeTotalCost,
      energy: energyCostTotal,
      depreciation: depreciationCostTotal,
      matrix: matrixCost,
      additionally: additionalCost,
      totalCost: totalCustoReal
    });

    // Preços de Venda
    const valueProfit = totalCustoReal * (profitMargin / 100);
    const priceSugNoDiscount = totalCustoReal + valueProfit;
    const priceSugWithDiscount = priceSugNoDiscount * (1 - (discountPercent / 100));

    setPrices({
      rawCost: totalCustoReal,
      suggestedNoDiscount: priceSugNoDiscount,
      suggestedWithDiscount: priceSugWithDiscount,
      profitValue: priceSugWithDiscount - totalCustoReal
    });

  }, [
    points, manualTime, matrixCost, backingCount, needleWearCost, additionalCost,
    machineSpeed, manualHourRate, backingUnitPrice, threadCostPer1k, energyCostHour,
    machineDepreciationPer1k, profitMargin, discountPercent
  ]);

  const loadPreset = (preset: CalculatorPreset) => {
    setActivePresetId(preset.id);
    setDescName(preset.name);
    setPoints(preset.points);
    setManualTime(preset.manualTime);
    setMatrixCost(preset.matrixEdit);
    setAdditionalCost(preset.otherCosts);
    if (preset.profitMargin) {
      setProfitMargin(preset.profitMargin);
    }
    showPresetToast(`Modelo "${preset.name}" carregado na calculadora!`);
  };

  const handleOpenNewPresetModal = (prefillCurrentValues = false) => {
    setPresetUnderEdit(null);
    if (prefillCurrentValues) {
      setPresetFormName(descName || 'Novo Modelo');
      setPresetFormPoints(points);
      setPresetFormManualTime(manualTime);
      setPresetFormMatrixCost(matrixCost);
      setPresetFormOtherCosts(additionalCost);
      setPresetFormFabric('');
      setPresetFormProfitMargin(profitMargin);
    } else {
      setPresetFormName('');
      setPresetFormPoints(10000);
      setPresetFormManualTime(0.5);
      setPresetFormMatrixCost(25);
      setPresetFormOtherCosts(5);
      setPresetFormFabric('');
      setPresetFormProfitMargin(50);
    }
    setPresetFormError('');
    setIsEditingPresetFormOpen(true);
  };

  const handleOpenEditPresetModal = (preset: CalculatorPreset) => {
    setPresetUnderEdit(preset);
    setPresetFormName(preset.name);
    setPresetFormPoints(preset.points);
    setPresetFormManualTime(preset.manualTime);
    setPresetFormMatrixCost(preset.matrixEdit);
    setPresetFormOtherCosts(preset.otherCosts);
    setPresetFormFabric(preset.fabric || '');
    setPresetFormProfitMargin(preset.profitMargin || 50);
    setPresetFormError('');
    setIsEditingPresetFormOpen(true);
  };

  const handleSavePresetForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetFormName.trim()) {
      setPresetFormError('O nome do modelo de preset é obrigatório.');
      return;
    }

    if (presetFormPoints <= 0) {
      setPresetFormError('A quantidade de pontos deve ser maior que zero.');
      return;
    }

    if (presetUnderEdit) {
      // Edit existing
      const updated: CalculatorPreset = {
        ...presetUnderEdit,
        name: presetFormName.trim(),
        points: Number(presetFormPoints) || 1000,
        manualTime: Number(presetFormManualTime) || 0.5,
        matrixEdit: Number(presetFormMatrixCost) || 0,
        otherCosts: Number(presetFormOtherCosts) || 0,
        fabric: presetFormFabric.trim() || undefined,
        profitMargin: Number(presetFormProfitMargin) || 50
      };

      setPresets(prev => prev.map(p => p.id === updated.id ? updated : p));
      showPresetToast(`Modelo "${updated.name}" atualizado com sucesso!`);
    } else {
      // Create new
      const newPreset: CalculatorPreset = {
        id: 'preset-' + Date.now(),
        name: presetFormName.trim(),
        points: Number(presetFormPoints) || 1000,
        manualTime: Number(presetFormManualTime) || 0.5,
        matrixEdit: Number(presetFormMatrixCost) || 0,
        otherCosts: Number(presetFormOtherCosts) || 0,
        fabric: presetFormFabric.trim() || undefined,
        profitMargin: Number(presetFormProfitMargin) || 50
      };

      setPresets(prev => [...prev, newPreset]);
      setActivePresetId(newPreset.id);
      showPresetToast(`Novo modelo "${newPreset.name}" adicionado aos presets!`);
    }

    setIsEditingPresetFormOpen(false);
  };

  const handleDeletePreset = (id: string, name: string) => {
    if (presets.length <= 1) {
      alert('Você deve manter pelo menos um modelo salvo.');
      return;
    }
    if (confirm(`Deseja realmente remover o modelo "${name}" dos presets?`)) {
      setPresets(prev => prev.filter(p => p.id !== id));
      if (activePresetId === id) {
        setActivePresetId(null);
      }
      showPresetToast(`Modelo "${name}" removido.`);
    }
  };

  const handleResetDefaultPresets = () => {
    if (confirm('Deseja restaurar a lista para os modelos padrão de fábrica?')) {
      setPresets(DEFAULT_PRESETS);
      setActivePresetId(DEFAULT_PRESETS[0].id);
      showPresetToast('Modelos padrão restaurados com sucesso!');
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  // Convert Quotation into active Order in the DB
  const handleConvertToOrder = () => {
    if (clients.length === 0) {
      alert('É necessário cadastrar um cliente antes.');
      return;
    }
    const client = clients.find(c => c.id === selectedClientForConvert);
    if (!client) {
      alert('Selecione um cliente válido.');
      return;
    }

    const newOrder: Order = {
      id: Math.floor(Math.random() * 9000) + 1001, // sequential simulation
      clientId: client.id,
      clientName: client.name,
      date: new Date().toISOString().split('T')[0],
      deliveryDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0], // 7 dias pra frente
      status: 'budget', // Entra como Orçamento
      product: descName,
      quantity: 1,
      embroiderySize: points > 20050 ? '20x20 cm' : '13x18 cm',
      fabricType: 'Algodão Padrão',
      personalizedName: 'Bordado com ' + points.toLocaleString() + ' pontos',
      colorsUsed: ['Configurar no pedido'],
      totalValue: Math.round(prices.suggestedWithDiscount * 100) / 100,
      paymentMethod: 'Pix',
      depositPaid: 0,
      remainingValue: Math.round(prices.suggestedWithDiscount * 100) / 100,
      observations: `Orçamento calculado de forma inteligente na aba Calculadora.\nCusto real de fabricação: ${formatCurrency(prices.rawCost)}. Lucro estimado: ${formatCurrency(prices.profitValue)} (${profitMargin}% de margem comercial).`
    };

    onAddOrder(newOrder);
    setConvertSuccess(`Sucesso! Orçamento convertido no Pedido #${newOrder.id} como Orçamento pendente.`);
    setTimeout(() => setConvertSuccess(''), 6000);
  };

  // Create Whatsapp text and open link
  const handleShareQuoteOnWhatsapp = () => {
    const textMsg = `*Andreia Bordados - Novo Orçamento (%F0%9F%AA%A1)*\n\n` +
      `*Item:* ${descName}\n` +
      `*Número de pontos estimado:* ${points.toLocaleString()} pontos\n` +
      `*Tempo de máquina aproximado:* ${Math.round(costBreakdown.machineTime)} minutos\n\n` +
      `---------------------------------------\n` +
      `*VALOR SUGERIDO:* *${formatCurrency(prices.suggestedWithDiscount)}*\n` +
      `---------------------------------------\n` +
      `- Facilitamos em Pix ou Cartão.\n` +
      `- Sinal padrão de 50% para aprovar matriz e iniciar bordado.\n\n` +
      `Deseja fechar o pedido conosco? Retorne esta mensagem! 😄`;

    const encoded = encodeURIComponent(textMsg);
    window.open(`https://wa.me/?text=${encoded}`, '_blank', 'noreferrer');
  };

  return (
    <div className="space-y-6 text-left" id="calculator_tab">
      
      {/* Toast de feedback de presets */}
      {presetToast && (
        <div className="p-3 bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-between gap-2 animate-fadeIn">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="h-4 w-4 shrink-0" />
            <span>{presetToast}</span>
          </div>
          <button onClick={() => setPresetToast('')} className="p-1 hover:bg-emerald-600 rounded-lg cursor-pointer">
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Box de Introdução com Presets Rápidos e Logo */}
      <div className="p-5 bg-gradient-to-r from-indigo-700 via-indigo-650 to-indigo-600 rounded-2xl text-white shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <img 
            src={ANDREIA_LOGO_URL} 
            alt="Andreia Bordados" 
            className="h-16 w-16 rounded-full object-cover border-2 border-white/40 shadow-md ring-4 ring-white/10 shrink-0 bg-white"
            referrerPolicy="no-referrer"
          />
          <div className="space-y-1">
            <h2 className="text-lg font-extrabold flex items-center gap-2 font-sans">
              <Calculator className="h-5 w-5" /> Calculadora & Gerador de Orçamentos
            </h2>
            <p className="text-xs text-indigo-100 leading-relaxed max-w-2xl">
              Descubra o custo real do bordado em segundos e gere propostas comerciais oficiais personalizadas com a logo da <strong>Andreia Bordados</strong> prontas para impressão e envio no WhatsApp.
            </p>
          </div>
        </div>
        
        {/* Presets Header Card */}
        <div className="shrink-0 bg-white/10 backdrop-blur-xs p-3.5 rounded-xl border border-white/15 space-y-2 lg:max-w-md w-full">
          <div className="flex items-center justify-between gap-2">
            <span className="text-2xs font-extrabold text-indigo-100 uppercase tracking-wider font-mono flex items-center gap-1">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" /> Modelos Rápidos Presets ({presets.length})
            </span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleOpenNewPresetModal(false)}
                title="Adicionar Novo Modelo Preset"
                className="p-1 px-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-3xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3 w-3" /> Novo
              </button>
              <button
                onClick={() => setIsPresetModalOpen(true)}
                title="Gerenciar e Editar Modelos"
                className="p-1 px-2 bg-white/20 hover:bg-white/30 text-white rounded-lg text-3xs font-bold transition flex items-center gap-1 cursor-pointer"
              >
                <Sliders className="h-3 w-3" /> Gerenciar
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-1.5 max-h-32 overflow-y-auto scrollbar-thin">
            {presets.map(p => {
              const isSelected = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => loadPreset(p)}
                  className={`px-2.5 py-1.5 rounded-lg text-3xs font-semibold transition text-left truncate cursor-pointer flex items-center justify-between gap-1 border ${
                    isSelected
                      ? 'bg-white text-indigo-900 border-white shadow-xs font-bold'
                      : 'bg-white/10 text-white hover:bg-white/20 border-white/10'
                  }`}
                  title={`${p.name} - ${p.points.toLocaleString()} pts, R$ ${p.matrixEdit} matriz`}
                >
                  <span className="truncate">{p.name}</span>
                  <span className={`text-4xs px-1 rounded-sm shrink-0 font-mono ${isSelected ? 'bg-indigo-100 text-indigo-800' : 'bg-white/20 text-white'}`}>
                    {(p.points / 1000).toFixed(0)}k
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda & Centro: Inputs */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Sessão 1: Características do Bordado */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-50 pb-2">
              <h3 className="text-sm font-extrabold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wide">
                <Sparkles className="h-4 w-4 text-indigo-600" /> 1. Tamanho do Desenho & Matriz
              </h3>
              
              {/* Botão de Salvar como Preset direto do cálculo atual */}
              <button
                type="button"
                onClick={() => handleOpenNewPresetModal(true)}
                className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-2xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                title="Salvar esses valores como um novo Modelo Rápido"
              >
                <Bookmark className="h-3.5 w-3.5" /> Salvar como Modelo Preset
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Descrição do Serviço / Produto</label>
                <input 
                  type="text" 
                  value={descName}
                  onChange={(e) => setDescName(e.target.value)}
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-lg font-medium focus:border-indigo-400 focus:outline-hidden"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-650 flex justify-between">
                  <span>Pontos do Bordado (Ponto Cruz/Satin)</span>
                  <span className="font-extrabold font-mono text-indigo-700">{points.toLocaleString()} pts</span>
                </label>
                <input 
                  type="number" 
                  min={100} 
                  step={500}
                  value={points}
                  onChange={(e) => setPoints(Number(e.target.value))}
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-lg font-mono focus:border-indigo-400 focus:outline-hidden"
                />
                <span className="text-3xs text-gray-400 block">Consulte o número de pontos no seu programa editor de matriz (Wilcom/Embird).</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 flex justify-between">
                  <span>Trabalho Manual</span>
                  <span className="text-indigo-600 font-bold">{manualTime}h ({Math.round(manualTime * 60)}m)</span>
                </label>
                <input 
                  type="range" 
                  min={0.1} 
                  max={4} 
                  step={0.1}
                  value={manualTime}
                  onChange={(e) => setManualTime(Number(e.target.value))}
                  className="w-full accent-indigo-600 h-2 bg-gray-100 rounded-lg cursor-pointer"
                />
                <span className="text-3xs text-gray-400 block">Tempo gasto limpando linhas, colocando bastidores, etc.</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Investimento Arte/Matriz (R$)</label>
                <input 
                  type="number" 
                  value={matrixCost}
                  onChange={(e) => setMatrixCost(Number(e.target.value))}
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-lg font-medium focus:border-indigo-400 focus:outline-hidden"
                />
                <span className="text-3xs text-gray-400 block">Custo de digitalização ou alteração da matriz de bordado.</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Custos adicionais (Embalagem, etc.)</label>
                <input 
                  type="number" 
                  value={additionalCost}
                  onChange={(e) => setAdditionalCost(Number(e.target.value))}
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Sessão 2: Parâmetros do Ateliê (Custo Operacional) */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
            <details className="group">
              <summary className="list-none flex items-center justify-between font-extrabold text-sm text-indigo-950 uppercase tracking-wide cursor-pointer focus:outline-hidden">
                <span className="flex items-center gap-1.5">
                  <Settings className="h-4 w-4 text-indigo-500" /> 2. Custos Unitários de Insumos (Configurações Avançadas)
                </span>
                <span className="text-2xs font-bold text-indigo-600 group-open:hidden">+ Mostrar Configuração</span>
                <span className="text-2xs font-bold text-indigo-600 hidden group-open:block">- Ocultar Configuração</span>
              </summary>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-3 border-t border-gray-50 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Velocidade Máquina (ST/Min)</label>
                  <input type="number" value={machineSpeed} onChange={(e) => setMachineSpeed(Number(e.target.value))} className="w-full p-2 border border-gray-200 rounded-lg bg-slate-50/50" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Sua Hora de Trabalho (R$)</label>
                  <input type="number" value={manualHourRate} onChange={(e) => setManualHourRate(Number(e.target.value))} className="w-full p-2 border border-gray-200 rounded-lg bg-slate-50/50" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Entretela unitária (R$)</label>
                  <input type="number" value={backingUnitPrice} onChange={(e) => setBackingUnitPrice(Number(e.target.value))} className="w-full p-2 border border-gray-200 rounded-lg bg-slate-50/50" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Desgaste Linha por 1k pto (R$)</label>
                  <input type="number" step="0.05" value={threadCostPer1k} onChange={(e) => setThreadCostPer1k(Number(e.target.value))} className="w-full p-2 border border-gray-200 rounded-lg bg-slate-50/50" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Energia da Máquina / hora (R$)</label>
                  <input type="number" step="0.05" value={energyCostHour} onChange={(e) => setEnergyCostHour(Number(e.target.value))} className="w-full p-2 border border-gray-200 rounded-lg bg-slate-50/50" />
                </div>
                <div className="space-y-1">
                  <label className="font-bold text-gray-600">Fração Agulha gasta por bordado (R$)</label>
                  <input type="number" step="0.1" value={needleWearCost} onChange={(e) => setNeedleWearCost(Number(e.target.value))} className="w-full p-2 border border-gray-200 rounded-lg bg-slate-50/50" />
                </div>
                <div className="space-y-1 md:col-span-3">
                  <label className="font-bold text-gray-600">Desgaste físico e manutenção preventiva da Máquina por 1000 pontos (R$)</label>
                  <input type="number" step="0.01" value={machineDepreciationPer1k} onChange={(e) => setMachineDepreciationPer1k(Number(e.target.value))} className="w-full p-2 border border-gray-200 rounded-lg bg-slate-50/50" />
                </div>
              </div>
            </details>
          </div>

          {/* Seção 3: Margem e Descontos */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 flex justify-between">
                <span>Margem de Lucro (% Comercial sobre o custo)</span>
                <span className="font-extrabold text-emerald-600">{profitMargin}%</span>
              </label>
              <input 
                type="range" 
                min={10} 
                max={200} 
                step={5}
                value={profitMargin}
                onChange={(e) => setProfitMargin(Number(e.target.value))}
                className="w-full accent-emerald-500 h-2 bg-gray-100 rounded-lg cursor-pointer"
              />
              <span className="text-3xs text-gray-400 block leading-normal">
                Adiciona rentabilidade livre de despesas. Recomenda-se entre 40% e 100% dependendo da complexidade.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 flex justify-between">
                <span>Conceder Desconto Adicional (%)</span>
                <span className="font-extrabold text-rose-500">{discountPercent}%</span>
              </label>
              <input 
                type="range" 
                min={0} 
                max={50} 
                step={1}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Number(e.target.value))}
                className="w-full accent-rose-500 h-2 bg-gray-100 rounded-lg cursor-pointer"
              />
              <span className="text-3xs text-gray-400 block">
                Permite testar descontos de fechamento para faturamento por volume.
              </span>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Análise de Custos & Simulação do Orçamento Impresso */}
        <div className="space-y-5">
          
          {/* Caixa de Preço Final e Lucro */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">Resumo de Viabilidade</h3>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Custo Real Físico (Agulhas/Mão de Obra/Fios)</span>
                <span className="font-semibold text-gray-700">{formatCurrency(prices.rawCost)}</span>
              </div>
              
              <div className="flex justify-between items-center text-xs text-emerald-600 font-medium">
                <span>Retorno Comércio/Lucro Bruto Estimado</span>
                <span>+{formatCurrency(prices.profitValue)}</span>
              </div>

              {discountPercent > 0 && (
                <div className="flex justify-between items-center text-xs text-rose-500">
                  <span>Desconto Aplicado ({discountPercent}%)</span>
                  <span>-{formatCurrency(prices.suggestedNoDiscount - prices.suggestedWithDiscount)}</span>
                </div>
              )}

              <div className="pt-3 border-t border-dashed border-gray-100 flex justify-between items-center">
                <div>
                  <span className="text-3xs font-extrabold text-gray-400 uppercase">Preço de Venda Sugerido</span>
                  <p className="text-2xl font-black text-indigo-600 mt-0.5">{formatCurrency(prices.suggestedWithDiscount)}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xs font-bold text-gray-400 uppercase block">Margem Real</span>
                  <span className="inline-block px-2 py-0.5 mt-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-sm">
                    {Math.round((prices.profitValue / (prices.rawCost || 1)) * 100)}% de Retorno
                  </span>
                </div>
              </div>
            </div>

            {/* Ações Rápidas de Orçamento */}
            <div className="pt-3 space-y-2">
              <button
                onClick={() => setIsQuoteModalOpen(true)}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition active:scale-98"
              >
                <Eye className="h-4 w-4" /> Visualizar Orçamento Oficial com Logo
              </button>

              <button
                onClick={handleShareQuoteOnWhatsapp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition active:scale-98"
              >
                <Share2 className="h-4 w-4" /> Compartilhar via WhatsApp
              </button>
            </div>
          </div>

          {/* Conversão em Pedido de verdade */}
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 space-y-3">
            <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider font-mono">Fechar Serviço</h4>
            <p className="text-3xs text-indigo-700 leading-normal">
              O cliente aprovou o preço? Escolha-o abaixo e gere o pedido automaticamente como Orçamento pendente na listagem do ateliê.
            </p>

            {convertSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-250 text-emerald-800 text-3xs font-bold rounded-lg flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" /> {convertSuccess}
              </div>
            )}

            <div className="space-y-2">
              <select
                value={selectedClientForConvert}
                onChange={(e) => setSelectedClientForConvert(e.target.value)}
                className="w-full p-2 text-xs border border-indigo-250 rounded-lg bg-white"
              >
                <option value="" disabled>Selecione o Cliente do Ateliê...</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <button
                onClick={handleConvertToOrder}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2 px-4 rounded-xl flex items-center justify-center gap-1 cursor-pointer transition shadow-xs"
              >
                <Plus className="h-4 w-4" /> Converter em Pedido Ativo <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Demonstrativo Interno do Custo */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2 text-slate-700">
            <h4 className="text-3xs font-bold text-gray-400 uppercase tracking-widest mb-2 font-mono">Detalhamento Técnico do Custo Real (Sem Lucro)</h4>
            
            <div className="space-y-1.5 font-mono text-xs">
              <div className="flex justify-between">
                <span>Fração Fios de Linha:</span>
                <span className="font-medium text-gray-700">{formatCurrency(costBreakdown.thread)}</span>
              </div>
              <div className="flex justify-between">
                <span>Backing / Entretelas:</span>
                <span className="font-medium text-gray-700">{formatCurrency(costBreakdown.backing)}</span>
              </div>
              <div className="flex justify-between">
                <span>Energia Elétrica Estimada:</span>
                <span className="font-medium text-gray-700">{formatCurrency(costBreakdown.energy)}</span>
              </div>
              <div className="flex justify-between">
                <span>Tempo do Trabalho Manual:</span>
                <span className="font-semibold text-gray-700">{formatCurrency(costBreakdown.manualTimeCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>Criação / Edição Matriz:</span>
                <span className="font-semibold text-gray-700">{formatCurrency(costBreakdown.matrix)}</span>
              </div>
              <div className="flex justify-between">
                <span>Fração Agulha & Depreciação:</span>
                <span className="font-medium text-gray-700">{formatCurrency(costBreakdown.needles + costBreakdown.depreciation)}</span>
              </div>
              <div className="flex justify-between">
                <span>Custos de Embalagem / Viagem:</span>
                <span className="font-medium text-gray-700">{formatCurrency(costBreakdown.additionally)}</span>
              </div>
              <div className="pt-2 border-t border-dashed border-gray-200 flex justify-between font-bold text-indigo-900 font-sans">
                <span>CUSTO DIRETO TOTAL:</span>
                <span>{formatCurrency(costBreakdown.totalCost)}</span>
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* MODAL 1: GERENCIAR MODELOS RÁPIDOS PRESETS */}
      {isPresetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-left my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                  <Sliders className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">Gerenciar Modelos Rápidos (Presets)</h3>
                  <p className="text-2xs text-gray-500">Crie, edite ou exclua modelos pré-configurados de precificação do ateliê</p>
                </div>
              </div>
              <button 
                onClick={() => setIsPresetModalOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body: List of Presets */}
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-600">Modelos cadastrados ({presets.length})</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleResetDefaultPresets}
                    className="px-2.5 py-1 text-2xs font-semibold text-gray-500 hover:text-gray-800 border border-gray-200 hover:bg-gray-50 rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" /> Restaurar Padrões
                  </button>
                  <button
                    onClick={() => handleOpenNewPresetModal(false)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Plus className="h-3.5 w-3.5" /> Adicionar Modelo
                  </button>
                </div>
              </div>

              <div className="space-y-2.5">
                {presets.map(p => (
                  <div 
                    key={p.id}
                    className="p-3.5 border border-gray-200 rounded-xl hover:border-indigo-200 bg-white transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                  >
                    <div className="space-y-1 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-gray-800">{p.name}</h4>
                        {p.fabric && (
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md text-3xs font-medium">
                            {p.fabric}
                          </span>
                        )}
                        {activePresetId === p.id && (
                          <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md text-3xs font-bold">
                            Em uso na calculadora
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-2xs text-gray-500 flex-wrap font-mono">
                        <span><strong>{p.points.toLocaleString()}</strong> pontos</span>
                        <span>•</span>
                        <span><strong>{p.manualTime}h</strong> trab. manual</span>
                        <span>•</span>
                        <span>Matriz: <strong>R$ {p.matrixEdit}</strong></span>
                        <span>•</span>
                        <span>Outros: <strong>R$ {p.otherCosts}</strong></span>
                        {p.profitMargin && (
                          <>
                            <span>•</span>
                            <span>Margem: <strong className="text-emerald-600">{p.profitMargin}%</strong></span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => {
                          loadPreset(p);
                          setIsPresetModalOpen(false);
                        }}
                        className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg transition cursor-pointer"
                        title="Aplicar na calculadora agora"
                      >
                        Aplicar
                      </button>
                      <button
                        onClick={() => handleOpenEditPresetModal(p)}
                        className="p-1.5 hover:bg-gray-100 text-gray-600 hover:text-indigo-600 rounded-lg transition cursor-pointer"
                        title="Editar valores deste modelo"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePreset(p.id, p.name)}
                        className="p-1.5 hover:bg-rose-50 text-gray-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                        title="Excluir este modelo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3.5 border-t border-gray-100 bg-slate-50/50 flex justify-end">
              <button
                onClick={() => setIsPresetModalOpen(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: FORMULÁRIO DE ADICIONAR / EDITAR PRESET */}
      {isEditingPresetFormOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden text-left my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                  {presetUnderEdit ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    {presetUnderEdit ? `Editar Modelo: ${presetUnderEdit.name}` : 'Novo Modelo Rápido Preset'}
                  </h3>
                  <p className="text-2xs text-gray-500">Configure os parâmetros pré-definidos para calcular com 1 clique</p>
                </div>
              </div>
              <button 
                onClick={() => setIsEditingPresetFormOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSavePresetForm} className="p-6 overflow-y-auto flex-1 space-y-4">
              {presetFormError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                  {presetFormError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Nome do Modelo Preset *</label>
                <input
                  type="text"
                  value={presetFormName}
                  onChange={(e) => setPresetFormName(e.target.value)}
                  placeholder="Ex: Toalha Lavabo Infantil / Logo Peito Uniforme"
                  className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-indigo-400 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Pontos Estimados do Bordado *</label>
                  <input
                    type="number"
                    min={100}
                    step={100}
                    value={presetFormPoints}
                    onChange={(e) => setPresetFormPoints(Number(e.target.value))}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-xl font-mono focus:border-indigo-400 focus:outline-hidden"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Tempo Trabalho Manual (Horas) *</label>
                  <input
                    type="number"
                    min={0.1}
                    max={10}
                    step={0.1}
                    value={presetFormManualTime}
                    onChange={(e) => setPresetFormManualTime(Number(e.target.value))}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-indigo-400 focus:outline-hidden"
                    required
                  />
                  <span className="text-3xs text-gray-400">Ex: 0.5 = 30min, 1.0 = 1 hora</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Custo de Arte / Matriz (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={presetFormMatrixCost}
                    onChange={(e) => setPresetFormMatrixCost(Number(e.target.value))}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-indigo-400 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Custos Adicionais / Outros (R$)</label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={presetFormOtherCosts}
                    onChange={(e) => setPresetFormOtherCosts(Number(e.target.value))}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-indigo-400 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Tipo de Tecido Sugerido</label>
                  <input
                    type="text"
                    value={presetFormFabric}
                    onChange={(e) => setPresetFormFabric(e.target.value)}
                    placeholder="Ex: Piquet, Fralda, Linho, Brim"
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-xl focus:border-indigo-400 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Margem de Lucro Sugerida (%)</label>
                  <input
                    type="number"
                    min={10}
                    max={300}
                    step={5}
                    value={presetFormProfitMargin}
                    onChange={(e) => setPresetFormProfitMargin(Number(e.target.value))}
                    className="w-full p-2.5 text-sm border border-gray-300 rounded-xl font-bold text-emerald-700 focus:border-indigo-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Botões do Form Modal */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditingPresetFormOpen(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                >
                  <Check className="h-4 w-4" /> {presetUnderEdit ? 'Salvar Alterações' : 'Adicionar Modelo'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* MODAL DE ORÇAMENTO OFICIAL COM LOGO ANDREIA BORDADOS (VISUALIZAR / IMPRIMIR) */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-fadeIn" id="official_quote_modal">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            
            {/* Modal Topbar Actions (não sai no print) */}
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-indigo-400" />
                <span className="text-xs font-bold font-sans">Proposta Comercial de Orçamento Oficial</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    window.print();
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                  title="Imprimir ou Salvar como PDF"
                >
                  <Printer className="h-3.5 w-3.5" /> Imprimir / PDF
                </button>
                <button
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Folha do Orçamento (Documento Formatado com Logo) */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 bg-white printable-sheet" id="printable_quote_sheet">
              
              {/* Cabeçalho Oficial do Ateliê com a Logo */}
              <div className="flex items-center justify-between gap-4 pb-5 border-b-2 border-slate-200 print-avoid-break">
                <div className="flex items-center gap-4">
                  <img 
                    src={ANDREIA_LOGO_URL} 
                    alt="Logo Andreia Bordados Personalizados" 
                    className="h-20 w-20 sm:h-24 sm:w-24 rounded-full object-cover border-2 border-rose-200 shadow-sm ring-4 ring-rose-50/60 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="space-y-0.5 text-left">
                    <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 font-sans">
                      Andreia Bordados
                    </h1>
                    <p className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                      Bordados Personalizados & Alta Costura
                    </p>
                    <p className="text-3xs text-slate-500">
                      Ateliê especializado em bordados computadorizados, enxovais, uniformes e matrizes exclusivas.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-900 font-black text-xs rounded-md border border-slate-300 uppercase font-mono">
                    ORÇAMENTO OFICIAL
                  </span>
                  <p className="text-3xs text-slate-500 mt-1 font-mono">Data: 20/05/2026</p>
                  <p className="text-3xs font-bold text-slate-700 font-mono">Validade: 10 dias</p>
                </div>
              </div>

              {/* Seletor / Destinatário */}
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs print-card print-avoid-break">
                <div>
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Cliente / Solicitante</span>
                  <div className="mt-1">
                    <input 
                      type="text"
                      value={quoteClientName}
                      onChange={(e) => setQuoteClientName(e.target.value)}
                      placeholder="Nome do cliente (ex: Maria Souza)"
                      className="w-full p-1.5 text-xs bg-white border border-slate-300 rounded-lg font-bold text-slate-800 focus:outline-hidden print:hidden"
                    />
                    <p className="hidden print:block font-bold text-slate-900 text-sm">
                      {quoteClientName || 'Cliente não identificado'}
                    </p>
                  </div>
                </div>
                <div>
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Ateliê Responsável</span>
                  <p className="mt-1 font-bold text-slate-800">Andreia Bordados Personalizados</p>
                  <p className="text-3xs text-slate-500">Garantia de acabamento refinado e fios de alta resistência</p>
                </div>
              </div>

              {/* Detalhes do Serviço & Especificações */}
              <div className="space-y-3 print-avoid-break">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-indigo-600" /> Descrição do Serviço de Bordado
                </h3>
                
                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2.5 text-xs print-card">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-slate-700">Item / Peça a ser bordada:</span>
                    <span className="font-black text-slate-900">{descName}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Densidade de Pontos Calculada:</span>
                    <span className="font-mono font-bold text-slate-800">{points.toLocaleString()} pontos</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Tempo de Produção em Máquina:</span>
                    <span className="font-mono">{Math.round(costBreakdown.machineTime)} minutos de bordado</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Criação / Ajuste Digital de Matriz:</span>
                    <span className="font-mono text-emerald-700 font-bold">{matrixCost > 0 ? `Inclusa (R$ ${matrixCost.toFixed(2)})` : 'Gratuita / Já em acervo'}</span>
                  </div>
                  <div className="flex justify-between items-center text-slate-600">
                    <span>Estruturação / Entretelas & Fios:</span>
                    <span>Linhas poliéster alto brilho + reforço têxtil</span>
                  </div>
                </div>
              </div>

              {/* Resumo Financeiro & Totais */}
              <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-300 space-y-3 print-card print-avoid-break">
                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Valor Base do Trabalho:</span>
                    <span className="font-mono font-bold text-slate-800">{formatCurrency(prices.suggestedNoDiscount)}</span>
                  </div>
                  {discountPercent > 0 && (
                    <div className="flex justify-between text-rose-600 font-bold">
                      <span>Desconto Especial Concedido ({discountPercent}%):</span>
                      <span className="font-mono">-{formatCurrency(prices.suggestedNoDiscount - prices.suggestedWithDiscount)}</span>
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-3xs font-black uppercase text-slate-700 tracking-wider">Valor Total da Proposta</span>
                    <p className="text-2xl font-black text-slate-900 font-mono mt-0.5">
                      {formatCurrency(prices.suggestedWithDiscount)}
                    </p>
                  </div>
                  <div className="text-right text-3xs text-slate-600">
                    <span className="font-bold text-slate-800 block">Condição de Pagamento:</span>
                    <span>50% sinal de início + 50% na entrega</span>
                    <span className="block font-semibold text-emerald-700">Aceitamos Pix e Cartão</span>
                  </div>
                </div>
              </div>

              {/* Rodapé do Orçamento com Carimbo e Assinatura */}
              <div className="pt-4 border-t-2 border-slate-200 text-3xs text-slate-500 space-y-3 print-avoid-break">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <p className="font-bold text-slate-700">Andreia Bordados Personalizados</p>
                    <p>Qualidade, pontualidade e dedicação em cada ponto.</p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-slate-400">Documento gerado automaticamente pelo Ateliê</p>
                  </div>
                </div>
              </div>

            </div>

            {/* Rodapé do Modal */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3 shrink-0 print:hidden">
              <span className="text-3xs text-slate-500">
                💡 Dica: Ao clicar em "Imprimir / PDF", selecione "Salvar como PDF" na janela de impressão para enviar o arquivo ao cliente.
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleShareQuoteOnWhatsapp();
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                >
                  <Share2 className="h-3.5 w-3.5" /> Enviar no WhatsApp
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
