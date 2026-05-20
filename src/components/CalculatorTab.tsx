import React, { useState, useEffect } from 'react';
import { Client, Order } from '../types';
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
  Settings
} from 'lucide-react';

interface CalculatorTabProps {
  clients: Client[];
  onAddOrder: (order: Order) => void;
  onNavigateToTab: (tabId: string) => void;
}

export default function CalculatorTab({ clients, onAddOrder, onNavigateToTab }: CalculatorTabProps) {
  // Presets
  const presets = [
    { name: 'Toalha de Bebê / Nome Cursivo', points: 8000, manualTime: 0.5, matrixEdit: 15, fabric: 'Fralda Plush', otherCosts: 5 },
    { name: 'Logomarca Corporativa Pequena (Peito)', points: 12000, manualTime: 0.3, matrixEdit: 30, fabric: 'Camisa Polo PA', otherCosts: 2 },
    { name: 'Brasão Costas Casamento Roupão', points: 22000, manualTime: 0.8, matrixEdit: 40, fabric: 'Cetim Especial', otherCosts: 8 },
    { name: 'Bordado Gigante Jaqueta Moletom', points: 45000, manualTime: 1.5, matrixEdit: 60, fabric: 'Moletom 3 cabos', otherCosts: 10 }
  ];

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

  const loadPreset = (preset: typeof presets[0]) => {
    setDescName(preset.name);
    setPoints(preset.points);
    setManualTime(preset.manualTime);
    setMatrixCost(preset.matrixEdit);
    setAdditionalCost(preset.otherCosts);
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
    const textMsg = `*Ateliê de Bordados - Novo Orçamento (%F0%9F%AA%A1)*\n\n` +
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
      
      {/* Box de Introdução */}
      <div className="p-5 bg-indigo-600 rounded-2xl text-white shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <h2 className="text-lg font-extrabold flex items-center gap-1.5 font-sans">
            <Calculator className="h-5 w-5 animate-pulse" /> Calculadora Inteligente de Precificação
          </h2>
          <p className="text-xs text-indigo-150 leading-relaxed max-w-2xl">
            Descubra o custo real do seu bordado em segundos! Calcule o desgaste de agulhas, linhas, energia, depreciação física da sua máquina e seu tempo de trabalho manual para faturar com integridade e lucro.
          </p>
        </div>
        
        {/* Presets Grid */}
        <div className="shrink-0 space-y-1">
          <span className="text-2xs font-extrabold text-indigo-200 block uppercase font-mono mb-2">Modelos Rápidos Presets</span>
          <div className="grid grid-cols-2 gap-1.5">
            {presets.map(p => (
              <button
                key={p.name}
                onClick={() => loadPreset(p)}
                className="px-2 py-1 bg-white/10 hover:bg-white/20 hover:scale-101 border border-white/10 rounded-lg text-3xs font-semibold text-white transition text-left truncate cursor-pointer"
                title={p.name}
              >
                {p.name.split('/')[0]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Coluna Esquerda & Centro: Inputs */}
        <div className="lg:col-span-2 space-y-5">
          
          {/* Sessão 1: Características do Bordado */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
            <h3 className="text-sm font-extrabold text-indigo-950 flex items-center gap-1.5 uppercase tracking-wide border-b border-gray-50 pb-2">
              <Sparkles className="h-4 w-4 text-indigo-600" /> 1. Tamanho do Desenho & Matriz
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Descrição do Serviço / Produto</label>
                <input 
                  type="text" 
                  value={descName}
                  onChange={(e) => setDescName(e.target.value)}
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-lg font-medium"
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
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-lg font-mono"
                />
                <span className="text-3xs text-gray-405 block">Consulte o número de pontos no seu programa editor de matriz (Wilcom/Embird).</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 flex justify-between">
                  <span>Trabalho Manual</span>
                  <span className="text-indigo-600 font-bold">{manualTime}h ({manualTime * 60}m)</span>
                </label>
                <input 
                  type="range" 
                  min={0.1} 
                  max={4} 
                  step={0.1}
                  value={manualTime}
                  onChange={(e) => setManualTime(Number(e.target.value))}
                  className="w-full accent-indigo-650 h-2 bg-gray-100 rounded-lg cursor-pointer"
                />
                <span className="text-3xs text-gray-400 block">Tempo gasto limpando linhas, colocando bastidores, etc.</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Investimento Arte/Matriz (R$)</label>
                <input 
                  type="number" 
                  value={matrixCost}
                  onChange={(e) => setMatrixCost(Number(e.target.value))}
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-lg font-medium"
                />
                <span className="text-3xs text-gray-405 block">Custo de digitalização ou alteração da matriz de bordado.</span>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Custos adicionais (Embalagem, etc.)</label>
                <input 
                  type="number" 
                  value={additionalCost}
                  onChange={(e) => setAdditionalCost(Number(e.target.value))}
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-lg"
                />
              </div>
            </div>
          </div>

          {/* Sessão 2: Parâmetros do Ateliê (Custo Operacional) */}
          <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
            <details className="group">
              <summary className="list-none flex items-center justify-between font-extrabold text-sm text-indigo-950 uppercase tracking-wide cursor-pointer focus:outline-hidden">
                <span className="flex items-center gap-1.5">
                  <Settings className="h-4 w-4 text-indigo-500 animate-spin-slow" /> 2. Custos Unitários de Insumos (Configurações Avançadas)
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
                  <label className="font-bold text-gray-650">Desgaste físico e manutenção preventiva da Máquina por 1000 pontos (R$)</label>
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
              <div className="flex justify-between items-center text-xs text-gray-550">
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
                  <p className="text-2xl font-black text-indigo-750 text-indigo-600 mt-0.5">{formatCurrency(prices.suggestedWithDiscount)}</p>
                </div>
                <div className="text-right">
                  <span className="text-3xs font-bold text-gray-400 uppercase block">Margem Real</span>
                  <span className="inline-block px-2 py-0.5 mt-1 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-sm">
                    {Math.round((prices.profitValue / prices.rawCost) * 100)}% de Retorno
                  </span>
                </div>
              </div>
            </div>

            {/* Ações Rápidas */}
            <div className="pt-3 space-y-2">
              <button
                onClick={handleShareQuoteOnWhatsapp}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition"
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
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 text-xs space-y-2 text-slate-705">
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
                <span className="font-medium text-gray-750">{formatCurrency(costBreakdown.energy)}</span>
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

    </div>
  );
}
