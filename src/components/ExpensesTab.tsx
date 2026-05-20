import React, { useState } from 'react';
import { Expense, Order } from '../types';
import { 
  Plus, 
  Search, 
  Trash2, 
  Check, 
  X, 
  TrendingDown, 
  ChevronRight, 
  PlusCircle, 
  DollarSign, 
  PieChart, 
  Layers,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';

interface ExpensesTabProps {
  expenses: Expense[];
  orders: Order[];
  onAddExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  todayDate: string;
}

export default function ExpensesTab({
  expenses,
  orders,
  onAddExpense,
  onDeleteExpense,
  todayDate
}: ExpensesTabProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form State
  const [formDesc, setFormDesc] = useState('');
  const [formValue, setFormValue] = useState(10);
  const [formCategory, setFormCategory] = useState<Expense['category']>('Linhas');
  const [formDate, setFormDate] = useState(todayDate);
  const [formNotes, setFormNotes] = useState('');

  const [formError, setFormError] = useState('');

  // Categories definition
  const expenseCategories: Expense['category'][] = [
    'Linhas', 'Tecidos', 'Entretelas', 'Agulhas', 'Manutenção', 'Energia', 'Água/Internet', 'Mão de Obra', 'Embalagem', 'Transporte', 'Outros'
  ];

  const categoryColors: Record<Expense['category'], string> = {
    'Linhas': 'bg-amber-500',
    'Tecidos': 'bg-emerald-500',
    'Entretelas': 'bg-blue-500',
    'Agulhas': 'bg-teal-500',
    'Manutenção': 'bg-rose-500',
    'Energia': 'bg-yellow-500',
    'Água/Internet': 'bg-cyan-500',
    'Mão de Obra': 'bg-purple-500',
    'Embalagem': 'bg-fuchsia-500',
    'Transporte': 'bg-sky-500',
    'Outros': 'bg-slate-500'
  };

  const filteredExpenses = expenses.filter(e => {
    const matchesSearch = e.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || e.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  // Calculate stats for current month, e.g. "2026-05"
  const currentMonth = todayDate.substring(0, 7); // YYYY-MM

  const currentMonthExpenses = expenses.filter(e => e.date.startsWith(currentMonth));
  const totalMonthExpenses = currentMonthExpenses.reduce((sum, e) => sum + e.value, 0);

  // Dynamic Revenue for May 2026
  const currentMonthOrders = orders.filter(o => o.status !== 'budget' && o.date.startsWith(currentMonth));
  const totalMonthRevenue = currentMonthOrders.reduce((sum, o) => sum + o.totalValue, 0);

  // Total Lifetime values
  const totalLifeExpenses = expenses.reduce((sum, e) => sum + e.value, 0);
  const totalLifeRevenue = orders.filter(o => o.status !== 'budget').reduce((sum, o) => sum + o.totalValue, 0);

  // Group current month costs by category for charts
  const costByCategory = expenseCategories.map(cat => {
    const total = currentMonthExpenses
      .filter(e => e.category === cat)
      .reduce((sum, e) => sum + e.value, 0);
    return { name: cat, value: total };
  }).filter(item => item.value > 0)
    .sort((a,b) => b.value - a.value);

  const maxVal = costByCategory.length > 0 ? Math.max(...costByCategory.map(c => c.value)) : 1;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDesc.trim()) {
      setFormError('A descrição é obrigatória.');
      return;
    }
    if (formValue <= 0) {
      setFormError('Insira um valor maior que zero.');
      return;
    }

    const newExpense: Expense = {
      id: 'e_' + Date.now(),
      description: formDesc,
      value: Number(formValue),
      date: formDate,
      category: formCategory,
      observations: formNotes
    };

    onAddExpense(newExpense);
    setIsFormOpen(false);
    
    // reset form
    setFormDesc('');
    setFormValue(10);
    setFormNotes('');
    setFormError('');
  };

  const handleQuickAdd = (desc: string, val: number, cat: Expense['category']) => {
    const newEx: Expense = {
      id: 'e_' + Math.random(),
      description: desc,
      value: val,
      date: todayDate,
      category: cat,
      observations: 'Lançamento rápido simplificado.'
    };
    onAddExpense(newEx);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDatePT = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left" id="expenses_tab">
      
      {/* Coluna Central/Direita: Resumo Financeiro & Gráficos */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Painel Geral do Fluxo de Caixa do Mês (DRE Simplificada) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-55 border-gray-50 mb-4 text-left">
            <div>
              <h3 className="text-base font-extrabold text-gray-800">Resultado Operacional (Fluxo do Mês)</h3>
              <p className="text-3xs text-gray-400">Dados baseados no mês corrente de {currentMonth}</p>
            </div>
            
            <div className="bg-slate-50 px-3 py-1.5 rounded-lg text-2xs font-extrabold text-gray-500">
              Mês: Maio / 2026
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            
            {/* Faturado */}
            <div className="p-4 bg-emerald-50/50 border border-emerald-100 rounded-xl relative overflow-hidden">
              <p className="text-4xs font-bold text-gray-400 uppercase tracking-widest font-mono">1. Receitas de Pedidos</p>
              <h4 className="text-xl font-extrabold text-emerald-800 mt-1.5">{formatCurrency(totalMonthRevenue)}</h4>
              <p className="text-3xs text-gray-550 mt-1 flex items-center justify-center gap-0.5">
                <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" /> + {currentMonthOrders.length} ordens de produção
              </p>
            </div>

            {/* Despesas */}
            <div className="p-4 bg-rose-50/50 border border-rose-100 rounded-xl relative overflow-hidden">
              <p className="text-4xs font-bold text-gray-400 uppercase tracking-widest font-mono">2. Despesas Totais</p>
              <h4 className="text-xl font-extrabold text-rose-800 mt-1.5">{formatCurrency(totalMonthExpenses)}</h4>
              <p className="text-3xs text-gray-550 mt-1 flex items-center justify-center gap-0.5">
                <ArrowDownRight className="h-3.5 w-3.5 text-rose-500" /> {currentMonthExpenses.length} saídas registradas
              </p>
            </div>

            {/* Lucro Líquido */}
            <div className={`p-4 rounded-xl border relative overflow-hidden ${
              totalMonthRevenue - totalMonthExpenses >= 0 
                ? 'bg-indigo-50/50 border-indigo-150' 
                : 'bg-rose-100/50 border-rose-200'
            }`}>
              <p className="text-4xs font-bold text-gray-400 uppercase tracking-widest font-mono">3. Lucro Líquido Real</p>
              <h4 className="text-xl font-black text-indigo-950 mt-1.5">{formatCurrency(totalMonthRevenue - totalMonthExpenses)}</h4>
              <p className="text-3xs text-gray-550 mt-1">
                {totalMonthRevenue > 0 
                  ? `${Math.round(((totalMonthRevenue - totalMonthExpenses) / totalMonthRevenue) * 100)}% de rentabilidade livre`
                  : 'Nenhum faturamento registrado'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Gráfico Detalhado de Distribuição dos Custos por Categoria (Maio) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-extrabold text-gray-800 mb-4 flex items-center gap-1.5 uppercase font-mono">
            <PieChart className="h-4.5 w-4.5 text-indigo-500" /> Distribuição de Gastos do Mês
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            
            {/* Visual Bars */}
            <div className="md:col-span-7 space-y-3.5">
              {costByCategory.length === 0 ? (
                <div className="text-center py-10 text-gray-400 text-xs italic">
                  Nenhuma despesa lançada para este mês ainda.
                </div>
              ) : (
                costByCategory.map(item => {
                  const widthPercent = (item.value / maxVal) * 100;
                  const catColor = categoryColors[item.name as Expense['category']] || 'bg-gray-400';
                  
                  return (
                    <div key={item.name} className="space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-gray-700 flex items-center gap-1.5">
                          <span className={`h-2 text-indigo-755 w-2 rounded-full ${catColor}`}></span>
                          {item.name}
                        </span>
                        <span className="font-bold font-mono text-gray-800">{formatCurrency(item.value)}</span>
                      </div>
                      <div className="w-full bg-slate-50 h-2.5 rounded-full overflow-hidden flex">
                        <div 
                          className={`h-full ${catColor} rounded-full`} 
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Resumos Financeiros Rápidos */}
            <div className="md:col-span-5 bg-slate-50/50 border border-slate-100 rounded-xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-gray-700 font-sans">Sugestões de Redução de Custo</h4>
              
              <div className="space-y-2 text-2xs leading-normal text-gray-600">
                <p>💡 *Linhas e Agulhas:* Comprar cones grandes de 4000 metros em lotes reduz o preço em até 30% em relação aos retrozes curtos.</p>
                <p>💡 *Manutenção Preventiva:* Limpar e lubrificar a caixa de bobina diariamente evita quebras de agulha e perda de tecidos caros.</p>
                <p>💡 *Entretela:* Reaproveite as rebarbas de entretela em bordados menores de bastidores pequenos de 10x10 cm.</p>
              </div>
            </div>

          </div>
        </div>

        {/* Lançamentos Rápidos de Insumos */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-extrabold text-indigo-950 uppercase mb-4 flex items-center gap-1 font-mono">
            <Sparkles className="h-4.5 w-4.5 text-indigo-600" /> Lançador Rápido de Insumos
          </h3>
          <p className="text-3xs text-gray-450 mb-3 block">Clique para lançar instantaneamente compras comuns do dia a dia no caixa:</p>
          
          <div className="flex flex-wrap gap-2.5">
            {[
              { desc: 'Pacote Agulhas Bordado 75/11', val: 35.00, cat: 'Agulhas' as const },
              { desc: 'Óleo lubrificante Singer Brother', val: 12.00, cat: 'Manutenção' as const },
              { desc: 'Fita de Cetim Larga p/ Roupões', val: 24.50, cat: 'Embalagem' as const },
              { desc: 'Entretela Rasgável 10 metros', val: 18.00, cat: 'Entretelas' as const },
              { desc: 'Energia Elétrica Estimada', val: 50.00, cat: 'Energia' as const }
            ].map((fastEx, idx) => (
              <button
                key={idx}
                onClick={() => {
                  handleQuickAdd(fastEx.desc, fastEx.val, fastEx.cat);
                  alert(`Lançamento rápido feito: "${fastEx.desc}" de R$${fastEx.val} no caixa.`);
                }}
                className="px-3 py-1.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-200 rounded-lg text-2xs font-semibold text-gray-700 transition flex items-center gap-1 cursor-pointer"
              >
                + {fastEx.desc} <span className="font-bold text-indigo-600">({formatCurrency(fastEx.val)})</span>
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* Coluna Esquerda: Cadastro de Despesa & Histórico */}
      <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex flex-col h-[750px]" id="expenses_management_panel">
        
        {/* Toggle para formulário ou lista */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-50 mb-4">
          <h3 className="text-base font-bold text-gray-800">
            {isFormOpen ? 'Lançar Despesa' : `Despesas (${filteredExpenses.length})`}
          </h3>
          <button 
            onClick={() => setIsFormOpen(!isFormOpen)}
            className={`p-1 px-3 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer ${
              isFormOpen 
                ? 'bg-gray-100 hover:bg-gray-205 text-gray-600' 
                : 'bg-rose-600 hover:bg-rose-700 text-white'
            }`}
          >
            {isFormOpen ? 'Ver Lista' : '+ Novo Gasto'}
          </button>
        </div>

        {isFormOpen ? (
          /* FORMULÁRIO DE NOVA DESPESA */
          <form onSubmit={handleSubmit} className="space-y-4 text-left flex-1 overflow-y-auto">
            {formError && (
              <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs">
                {formError}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">Descrição do Gasto *</label>
              <input 
                type="text" 
                value={formDesc}
                onChange={(e) => setFormDesc(e.target.value)}
                placeholder="Ex: Compra de 5 cones de linha"
                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg"
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-650">Valor Gasto (R$) *</label>
              <input 
                type="number" 
                min={0.1}
                step={0.01}
                value={formValue}
                onChange={(e) => setFormValue(Number(e.target.value))}
                className="w-full p-2.5 text-sm border border-gray-200 rounded-lg font-bold"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-655">Categoria</label>
                <select 
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as Expense['category'])}
                  className="w-full p-2 bg-white text-xs border border-gray-200 rounded-lg"
                >
                  {expenseCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-650">Data do Gasto</label>
                <input 
                  type="date" 
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full p-2 text-xs border border-gray-200 rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-600">Observações adicionais (Opcional)</label>
              <textarea 
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                rows={2}
                placeholder="Nota fiscal, local de compra, etc."
                className="w-full p-2 text-sm border border-gray-200 rounded-lg"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm py-2.5 rounded-lg flex items-center justify-center gap-1 cursor-pointer shadow-xs"
            >
              <Check className="h-4 w-4" /> Registrar Saída
            </button>
          </form>
        ) : (
          /* LISTA DE HISTÓRICO DE DESPESAS */
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            
            {/* Input Filtro de Busca */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Pesquisar por gasto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border-gray-100 rounded-xl bg-gray-50/50 focus:border-indigo-400 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Categorias Filtros Rápidos */}
            <div className="flex flex-wrap gap-1 mb-3">
              <button
                onClick={() => setCategoryFilter('all')}
                className={`px-2 py-0.5 text-3xs font-semibold rounded-md ${
                  categoryFilter === 'all' ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-500'
                }`}
              >
                Todas
              </button>
              {expenseCategories.slice(0, 5).map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-2 py-0.5 text-3xs font-semibold rounded-md ${
                    categoryFilter === cat ? 'bg-rose-600 text-white' : 'bg-slate-50 text-slate-400'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Lista Scrollable */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
              {filteredExpenses.length === 0 ? (
                <div className="text-center py-20 text-gray-400 text-xs italic">
                  Nenhuma despesa para esta busca.
                </div>
              ) : (
                filteredExpenses.map(expense => {
                  const catColor = categoryColors[expense.category] || 'bg-gray-400';
                  
                  return (
                    <div 
                      key={expense.id}
                      className="p-3 border border-gray-50 hover:border-rose-100 rounded-xl bg-slate-50/30 flex items-center justify-between transition text-left"
                    >
                      <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <span className={`${catColor} h-2 w-2 rounded-full shrink-0`}></span>
                          <h4 className="text-xs font-bold text-gray-800 truncate">{expense.description}</h4>
                        </div>
                        <p className="text-3xs text-gray-500 flex items-center gap-2">
                          <span>Data: {formatDatePT(expense.date)}</span>
                          <span className="font-semibold text-indigo-800 bg-indigo-50/75 px-1 py-0.5 rounded-sm">{expense.category}</span>
                        </p>
                      </div>

                      <div className="text-right ml-4 flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold text-rose-700">{formatCurrency(expense.value)}</span>
                        <button 
                          onClick={() => onDeleteExpense(expense.id)}
                          className="p-1 text-gray-300 hover:text-rose-605 hover:bg-rose-50 hover:text-rose-600 rounded-md transition cursor-pointer"
                          title="Excluir gasto"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

          </div>
        )}

      </div>

    </div>
  );
}
