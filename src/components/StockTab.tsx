import React, { useState } from 'react';
import { InventoryItem } from '../types';
import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle, 
  Layers, 
  ArrowUp, 
  ArrowDown, 
  X, 
  Check, 
  RotateCcw,
  Clock,
  History
} from 'lucide-react';

interface StockTabProps {
  inventory: InventoryItem[];
  onAddStockItem: (item: InventoryItem) => void;
  onUpdateStockQty: (id: string, newQty: number) => void;
}

interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  type: 'in' | 'out';
  quantityMoved: number;
  reason: string;
  date: string;
}

export default function StockTab({ inventory, onAddStockItem, onUpdateStockQty }: StockTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  // Modals / Form
  const [isNewItemFormOpen, setIsNewItemFormOpen] = useState(false);
  const [adjustItem, setAdjustItem] = useState<InventoryItem | null>(null);
  const [adjustType, setAdjustType] = useState<'in' | 'out'>('in');
  const [adjustQtyStr, setAdjustQtyStr] = useState('1');
  const [adjustReason, setAdjustReason] = useState('Compras Fornecedor');

  // Form New Item States
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<InventoryItem['category']>('Linhas');
  const [formQty, setFormQty] = useState(1);
  const [formUnit, setFormUnit] = useState('Cones');
  const [formMinQty, setFormMinQty] = useState(2);
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Local movement log list (mock simulation)
  const [movements, setMovements] = useState<StockMovement[]>([
    { id: 'm_1', itemId: 'i4', itemName: 'Agulhas Organ DBxK5 Caboclo 75/11', type: 'out', quantityMoved: 2, reason: 'Quebra na máquina Brother', date: '2026-05-19' },
    { id: 'm_2', itemId: 'i1', itemName: 'Linha Ricamare Poliéster - Branco 3002', type: 'in', quantityMoved: 3, reason: 'Compra no Armarinho Central', date: '2026-05-18' },
    { id: 'm_3', itemId: 'i2', itemName: 'Linha Ricamare Poliéster - Preto 3000', type: 'out', quantityMoved: 1, reason: 'Consumido no pedido corporativo #1002', date: '2026-05-16' },
    { id: 'm_4', itemId: 'i5', itemName: 'Caixas de Kraft com Visor Acetato 25x25', type: 'in', quantityMoved: 100, reason: 'Estoque inicial fornecedor', date: '2026-05-14' }
  ]);

  const categories: InventoryItem['category'][] = [
    'Linhas', 'Tecidos', 'Entretelas', 'Agulhas', 'Embalagens', 'Aviamentos', 'Outros'
  ];

  const filteredItems = inventory.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const lowStockItems = inventory.filter(p => p.quantity <= p.minQuantity);

  const handleCreateNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('O nome do material é obrigatório.');
      return;
    }

    const newItem: InventoryItem = {
      id: 'i_' + Date.now(),
      name: formName,
      category: formCategory,
      quantity: Number(formQty),
      unit: formUnit,
      minQuantity: Number(formMinQty),
      observations: formNotes,
      lastUpdated: new Date().toISOString().split('T')[0]
    };

    onAddStockItem(newItem);
    
    // Log movement
    const log: StockMovement = {
      id: 'mlog_' + Date.now(),
      itemId: newItem.id,
      itemName: newItem.name,
      type: 'in',
      quantityMoved: Number(formQty),
      reason: 'Lançamento de estoque inicial de cadastro.',
      date: new Date().toISOString().split('T')[0]
    };
    setMovements([log, ...movements]);

    // Cleanup
    setIsNewItemFormOpen(false);
    setFormName('');
    setFormQty(1);
    setFormNotes('');
    setFormError('');
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustItem) return;
    const qtyChange = Number(adjustQtyStr);
    if (qtyChange <= 0) return;

    let newQty = adjustItem.quantity;
    if (adjustType === 'in') {
      newQty += qtyChange;
    } else {
      newQty = Math.max(0, adjustItem.quantity - qtyChange);
    }

    onUpdateStockQty(adjustItem.id, newQty);

    // Save movement log
    const log: StockMovement = {
      id: 'mlog_' + Date.now(),
      itemId: adjustItem.id,
      itemName: adjustItem.name,
      type: adjustType,
      quantityMoved: qtyChange,
      reason: adjustReason,
      date: new Date().toISOString().split('T')[0]
    };

    setMovements([log, ...movements]);
    setAdjustItem(null);
    setAdjustReason('Compras Fornecedor');
  };

  const formatDatePT = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left" id="stock_tab">
      
      {/* Coluna Central e Direita: Gerenciamento dos Materiais do Estoque */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Caixa de Métricas de Insumos */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 bg-white border border-gray-100 rounded-2xl shadow-xs">
            <span className="text-4xs font-bold text-gray-405 uppercase tracking-wide block font-mono">Itens Totais em Estoque</span>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="p-2.5 bg-indigo-50 text-indigo-700 rounded-xl">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-gray-800">{inventory.length}</h4>
                <p className="text-3xs text-gray-400">Insumos homologados</p>
              </div>
            </div>
          </div>

          <div className="p-4 bg-amber-50/50 border border-amber-100 rounded-2xl shadow-xs">
            <span className="text-4xs font-bold text-amber-900 uppercase tracking-wide block font-mono">Estoques com Alerta</span>
            <div className="flex items-center gap-3 mt-1.5">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <AlertTriangle className="h-5 w-5 animate-pulse" />
              </div>
              <div>
                <h4 className="text-xl font-bold text-amber-900">{lowStockItems.length}</h4>
                <p className="text-3xs text-amber-700">Abaixo do mínimo</p>
              </div>
            </div>
          </div>

          {/* Dica de Compra */}
          <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-2xl text-xs flex flex-col justify-center text-emerald-900">
            <h5 className="font-bold flex items-center gap-1 mb-1 font-mono">📊 SEU ATELIÊ BEM ABASTECIDO</h5>
            <p className="text-3xs text-emerald-700 leading-normal">
              A falta de uma linha preta ou entretela pode parar uma produção urgente. Sempre registre as entradas das compras de insumos para relatórios financeiros perfeitos.
            </p>
          </div>
        </div>

        {/* Grid de Itens */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
          
          {/* Header & Busca */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-50 mb-4 text-left">
            <div>
              <h3 className="text-sm font-extrabold text-gray-800">Insumos em Estoque</h3>
              <p className="text-3xs text-gray-400">Controle rigoroso dos materiais consumidos no ateliê</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
              {/* Pesquisa */}
              <div className="relative shrink-0">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Buscar insumo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 text-xs text-indigo-950 border border-gray-200 rounded-lg w-full sm:w-44 focus:border-indigo-400"
                />
              </div>

              {/* Botão Cadastrar Material */}
              <button
                onClick={() => setIsNewItemFormOpen(true)}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg flex items-center justify-center gap-1 shrink-0 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Cadastrar Material
              </button>
            </div>
          </div>

          {/* Filtro por Categorias */}
          <div className="flex flex-wrap gap-1 mb-4">
            <button
              onClick={() => setCategoryFilter('all')}
              className={`px-3 py-1 text-2xs font-semibold rounded-md ${
                categoryFilter === 'all' ? 'bg-indigo-600 text-white shadow-3xs' : 'bg-slate-50 text-slate-550 hover:bg-slate-100'
              }`}
            >
              Todos Insumos
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-2.5 py-1 text-2xs font-semibold rounded-md ${
                  categoryFilter === cat ? 'bg-indigo-600 text-white shadow-3xs' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Grid de visual bento-like items */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="inventory_items_grid">
            {filteredItems.length === 0 ? (
              <div className="py-20 text-center text-gray-400 text-sm italic col-span-3">
                Nenhum material encontrado com estas especificações.
              </div>
            ) : (
              filteredItems.map(item => {
                const isUnderMin = item.quantity <= item.minQuantity;
                
                return (
                  <div 
                    key={item.id} 
                    className={`p-4 border rounded-xl flex flex-col justify-between transition-colors ${
                      isUnderMin 
                        ? 'border-amber-200 bg-amber-50/20 shadow-3xs' 
                        : 'border-slate-100 bg-white hover:border-indigo-150'
                    }`}
                  >
                    <div className="space-y-1 text-left">
                      <div className="flex justify-between items-start gap-1">
                        <span className="px-2 py-0.5 rounded-sm bg-slate-100 text-slate-700 text-3xs font-extrabold font-mono">
                          {item.category}
                        </span>
                        
                        {isUnderMin && (
                          <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-3xs font-extrabold animate-pulse">
                            Baixo Estoque
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-gray-800 min-h-[32px] line-clamp-2 mt-1">{item.name}</h4>
                      
                      <p className="text-3xs text-gray-400">Última movimentação: {formatDatePT(item.lastUpdated)}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-dashed border-gray-100 flex items-center justify-between">
                      <div className="text-left font-sans">
                        <span className="text-4xs text-gray-420 block font-bold uppercase">ESTOQUE ATUAL</span>
                        <span className="text-sm font-black text-slate-850">
                          {item.quantity} {item.unit}
                        </span>
                        <span className="text-4xs text-gray-400 block">Mínimo ideal: {item.minQuantity}</span>
                      </div>

                      {/* Botões de Movimentação */}
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setAdjustItem(item);
                            setAdjustType('out');
                            setAdjustQtyStr('1');
                            setAdjustReason('Consumo de produção diária');
                          }}
                          className="p-1 px-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-sm font-bold text-3xs cursor-pointer border border-rose-100"
                          title="Remover peças (Saída)"
                        >
                          <ArrowDown className="h-3 w-3 shrink-0" /> Saída
                        </button>
                        <button
                          onClick={() => {
                            setAdjustItem(item);
                            setAdjustType('in');
                            setAdjustQtyStr('5');
                            setAdjustReason('Compra reposição');
                          }}
                          className="p-1 px-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-sm font-bold text-3xs cursor-pointer border border-emerald-100"
                          title="Inserir peças (Compra)"
                        >
                          <ArrowUp className="h-3 w-3 shrink-0" /> Entrada
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Coluna Lateral: Histórico de Movimentações */}
      <div className="lg:col-span-1 space-y-6" id="stock_logs_panel">
        
        {/* LISTAGEM DE LOGS DE ENTRADAS/SAÍDAS */}
        <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-xs h-[750px] flex flex-col" id="stock_mov_history">
          <div className="flex items-center justify-between pb-3 border-b border-gray-50 mb-3">
            <h3 className="text-base font-bold text-gray-800 flex items-center gap-1">
              <History className="h-4.5 w-4.5 text-indigo-500" /> Registro de Movimento
            </h3>
            <span className="text-3xs text-gray-400">Tempo real</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3.5 pr-1 scrollbar-thin">
            {movements.map((mov) => {
              const isIn = mov.type === 'in';
              return (
                <div key={mov.id} className="p-3 border border-gray-50 rounded-xl bg-slate-50/20 text-left text-xs text-gray-700 relative">
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex items-center gap-0.5 text-2xs font-bold rounded-sm border px-1.5 py-0.5 ${
                      isIn 
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-100' 
                        : 'bg-rose-50 text-rose-805 border-rose-100'
                    }`}>
                      {isIn ? <ArrowUp className="h-2.5 w-2.5 text-emerald-600" /> : <ArrowDown className="h-2.5 w-2.5 text-rose-500" />}
                      {isIn ? 'Entrada' : 'Saída'}
                    </span>
                    <span className="text-4xs font-mono text-gray-400">{formatDatePT(mov.date)}</span>
                  </div>

                  <p className="font-bold text-indigo-950 mt-2 leading-relaxed truncate">{mov.itemName}</p>
                  
                  <div className="flex gap-2 justify-between items-center mt-2 pt-1 border-t border-gray-50/50 text-2xs text-gray-500">
                    <span>Qtd alterada: *{mov.quantityMoved} un*</span>
                    <span className="font-medium italic truncate max-w-[150px]" title={mov.reason}>"{mov.reason}"</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* MODAL / DIALOG DE NOVO INSUMO (CRIAR INTEGRADO) */}
      {isNewItemFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="new_stock_item_modal">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto shadow-xl text-left">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-base text-gray-800">Cadastrar Novo Material</h3>
              <button onClick={() => setIsNewItemFormOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-md cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewItem} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-lg">
                  {formError}
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Nome do Insumo / Linha / Botão *</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Linha Ricamare - Azul Tiffany 3145"
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-655">Categoria</label>
                  <select 
                    value={formCategory} 
                    onChange={(e) => setFormCategory(e.target.value as InventoryItem['category'])}
                    className="w-full p-2 border border-gray-200 bg-white rounded-lg text-xs"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-650">Unidade de Medida</label>
                  <input 
                    type="text" 
                    value={formUnit}
                    onChange={(e) => setFormUnit(e.target.value)}
                    placeholder="Ex: Cones, Metros, Un"
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Quantidade Atual</label>
                  <input 
                    type="number" 
                    min={0}
                    value={formQty}
                    onChange={(e) => setFormQty(Number(e.target.value))}
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Estoque Mínimo Alerta</label>
                  <input 
                    type="number" 
                    min={0}
                    value={formMinQty}
                    onChange={(e) => setFormMinQty(Number(e.target.value))}
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Anotações do Fornecedor</label>
                <textarea 
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Link de compra, código de linha, fornecedor Armarinho Fernando etc."
                  className="w-full p-2 text-xs border border-gray-200 rounded-lg"
                />
              </div>

              <div className="pt-3 border-t border-gray-150 flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setIsNewItemFormOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs"
                >
                  Salvar Material
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL AJUSTE MANUAL RÁPIDO DE QUANTIDADES */}
      {adjustItem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="adjust_inventory_modal">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl text-left">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4">
              <h3 className="font-extrabold text-sm text-gray-805">
                {adjustType === 'in' ? 'Registrar Compra / Reposição' : 'Registrar Saída/Uso de Insumo'}
              </h3>
              <button onClick={() => setAdjustItem(null)} className="p-1 text-gray-400 hover:text-gray-600 rounded-md cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleAdjustSubmit} className="space-y-4">
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <p className="text-3xs text-gray-400 font-bold uppercase">Item Selecionado:</p>
                <h4 className="text-xs font-extrabold text-indigo-950 mt-1 leading-relaxed">{adjustItem.name}</h4>
                <p className="text-3xs text-gray-500 mt-1">Quantidade atual: {adjustItem.quantity} {adjustItem.unit}</p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {adjustType === 'in' ? 'Quantidade Adicionada' : 'Quantidade Retirada'}
                  </label>
                  <input 
                    type="number" 
                    min={1}
                    value={adjustQtyStr}
                    onChange={(e) => setAdjustQtyStr(e.target.value)}
                    className="w-full p-2.5 border border-indigo-200 rounded-lg font-bold"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Justificativa / Motivo da Operação *</label>
                  <input 
                    type="text" 
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    placeholder="Ex: Compra ou Gasto no pedido Arthur"
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-gray-150 flex justify-end gap-2">
                <button 
                  type="button" 
                  onClick={() => setAdjustItem(null)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className={`px-4 py-2 text-white text-xs font-bold rounded-lg cursor-pointer shadow-xs ${
                    adjustType === 'in' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-750'
                  }`}
                >
                  Confirmar {adjustType === 'in' ? 'Entrada' : 'Saída'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
