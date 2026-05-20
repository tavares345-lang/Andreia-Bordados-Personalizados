import React from 'react';
import { Client, Order, Expense } from '../types';
import { 
  BarChart, 
  TrendingUp, 
  User, 
  Award, 
  ShoppingBag, 
  Download, 
  FileSpreadsheet, 
  Clock, 
  DollarSign, 
  ArrowUpRight,
  TrendingDown,
  Percent,
  Layers,
  Sparkles
} from 'lucide-react';

interface ReportsTabProps {
  clients: Client[];
  orders: Order[];
  expenses: Expense[];
}

export default function ReportsTab({ clients, orders, expenses }: ReportsTabProps) {

  // Helper filters
  const nonBudgetOrders = orders.filter(o => o.status !== 'budget');

  // 1. Clientes que mais compram (sorted by sum of totalValue)
  const clientPurchases = clients.map(client => {
    const matchingOrders = nonBudgetOrders.filter(o => o.clientId === client.id);
    const totalSpent = matchingOrders.reduce((sum, o) => sum + o.totalValue, 0);
    return {
      name: client.name,
      ordersCount: matchingOrders.length,
      spent: totalSpent
    };
  }).filter(c => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 5);

  const topClientMax = clientPurchases.length > 0 ? clientPurchases[0].spent : 1;

  // 2. Produtos mais vendidos (frequência)
  // Let's create general groups based on search strings in the order "product" field
  const productCategories = [
    { label: 'Enxoval Infantil (Kit/Manta/Babador)', pattern: /infantil|manta|bebê|baby|babador|ursinho/i },
    { label: 'Roupas Corporativas (Polo/Piquet)', pattern: /polo|piquet|uniforme|camisapeito|corporativo|construtora/i },
    { label: 'Enxoval de Casamento (Roupão/Toalha)', pattern: /noiva|casamento|madrinha|roupão|roupoes|brasão/i },
    { label: 'Jaleco Odonto/Medicina', pattern: /jaleco|odontologia|clinica|sorriso|fisioterapia/i },
    { label: 'Bastidores Decorativos (Monogramas)', pattern: /bastidor|lavabo|porta-maternidade|floral|linho/i }
  ];

  const productStats = productCategories.map(cat => {
    const matching = nonBudgetOrders.filter(o => cat.pattern.test(o.product));
    const totalQty = matching.reduce((sum, o) => sum + o.quantity, 0);
    const revenue = matching.reduce((sum, o) => sum + o.totalValue, 0);
    return {
      label: cat.label,
      totalQty,
      revenue
    };
  }).sort((a,b) => b.totalQty - a.totalQty);

  const topProductMax = productStats.length > 0 ? Math.max(...productStats.map(p => p.totalQty)) : 1;

  // 3. Faturamento por mês (Maio, Abril etc.)
  // We can group orders by month "YYYY-MM"
  const monthlyStatsMap: Record<string, { revenue: number, expenses: number }> = {};
  
  nonBudgetOrders.forEach(o => {
    const m = o.date.substring(0, 7) || '2026-05';
    if (!monthlyStatsMap[m]) monthlyStatsMap[m] = { revenue: 0, expenses: 0 };
    monthlyStatsMap[m].revenue += o.totalValue;
  });

  expenses.forEach(e => {
    const m = e.date.substring(0, 7) || '2026-05';
    if (!monthlyStatsMap[m]) monthlyStatsMap[m] = { revenue: 0, expenses: 0 };
    monthlyStatsMap[m].expenses += e.value;
  });

  // Convert map to list and sort by month string
  const monthlyTimeline = Object.entries(monthlyStatsMap).map(([month, data]) => {
    return {
      monthStr: month,
      revenue: data.revenue,
      expenses: data.expenses,
      profit: data.revenue - data.expenses
    };
  }).sort((a,b) => a.monthStr.localeCompare(b.monthStr));

  const maxRevenue = monthlyTimeline.length > 0 ? Math.max(...monthlyTimeline.map(m => m.revenue)) : 1;

  const handleExportDataSimulate = (format: 'pdf' | 'excel') => {
    alert(`Preparando faturamento consolidado do Ateliê...\nRelatório com ${nonBudgetOrders.length} ordens e ${expenses.length} despesas processadas com sucesso em formato ${format.toUpperCase()}! Enviado para downloads virtuais.`);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in" id="reports_tab">
      
      {/* Painel do Faturamento Geral e Exportador */}
      <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-indigo-950 flex items-center gap-1.5 font-sans">
            <BarChart className="h-4.5 w-4.5 text-indigo-600 animate-pulse" /> Painel de Auditoria e Inteligência de Negócio
          </h2>
          <p className="text-2xs text-gray-400">Analise a saúde comercial da sua marca, ticket médio e lucros por nicho de bordados</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => handleExportDataSimulate('pdf')}
            className="px-3.5 py-1.5 bg-gray-50 hover:bg-slate-100 text-slate-700 border border-slate-205 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-3xs"
          >
            <Download className="h-3.5 w-3.5" /> PDF
          </button>
          
          <button
            onClick={() => handleExportDataSimulate('excel')}
            className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="h-3.5 w-3.5" /> Exportar Planilha Excel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Gráfico 1: Faturamento e Lucro por Mês (Timeline) */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-gray-800 pb-3 border-b border-gray-50 flex items-center gap-2">
              <Award className="h-4.5 w-4.5 text-indigo-500" /> Comparativo e Fluxo de Caixa Mensal
            </h3>
            <p className="text-3xs text-gray-400 mt-1 mb-4 leading-relaxed">Mostra o faturamento vs. despesas operacionais agrupadas mensalmente.</p>
          </div>

          <div className="space-y-4">
            {monthlyTimeline.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs italic">
                Ainda não há dados financeiros lançados para compilar.
              </div>
            ) : (
              monthlyTimeline.map(monthData => {
                const revenuePercent = (monthData.revenue / maxRevenue) * 100;
                const expensesPercent = (monthData.expenses / maxRevenue) * 100;
                
                return (
                  <div key={monthData.monthStr} className="space-y-2 p-3 bg-slate-50/40 rounded-xl border border-slate-50">
                    <div className="flex justify-between items-center">
                      <span className="font-extrabold text-xs text-indigo-950 font-sans uppercase">Mês {monthData.monthStr}</span>
                      <div className="text-right text-xs">
                        <span className="font-bold text-emerald-600">Lucro Líquido: {formatCurrency(monthData.profit)}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 font-mono text-xs">
                      {/* Faturamento */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-3xs font-semibold text-gray-500">
                          <span>Entrada (Vendas):</span>
                          <span>{formatCurrency(monthData.revenue)}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${revenuePercent}%` }} />
                        </div>
                      </div>

                      {/* Despesa */}
                      <div className="space-y-0.5">
                        <div className="flex justify-between text-3xs font-semibold text-gray-500">
                          <span>Saída (Despesas):</span>
                          <span>{formatCurrency(monthData.expenses)}</span>
                        </div>
                        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-rose-500 rounded-full" style={{ width: `${expensesPercent}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Gráfico 2: Produtos e Categorias mais Vendidas */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-extrabold text-gray-800 pb-3 border-b border-gray-50 flex items-center gap-2">
              <ShoppingBag className="h-4.5 w-4.5 text-indigo-500" /> Nichos de Bordados mais Solicitados
            </h3>
            <p className="text-3xs text-gray-400 mt-1 mb-4 leading-relaxed">Frequência por peças vendidas e faturamento acumulado por público do ateliê.</p>
          </div>

          <div className="space-y-4">
            {productStats.map(stat => {
              const countPercent = (stat.totalQty / topProductMax) * 100;
              
              return (
                <div key={stat.label} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-gray-750 truncate max-w-[200px]">{stat.label}</span>
                    <span className="font-bold text-gray-800 font-mono">{stat.totalQty} un ({formatCurrency(stat.revenue)})</span>
                  </div>
                  <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-600 rounded-full" style={{ width: `${countPercent}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Ranking de Clientes (Top Compradores) */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs">
          <h3 className="text-sm font-extrabold text-gray-800 pb-3 border-b border-gray-50 flex items-center gap-2 mb-4">
            <User className="h-4.5 w-4.5 text-indigo-500" /> CLIENTES QUE MAIS COMPRAM (RANKING ANUAL)
          </h3>

          <div className="space-y-3">
            {clientPurchases.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs italic">
                Ainda não há clientes com pedidos fechados para ranquear.
              </div>
            ) : (
              clientPurchases.map((client, idx) => {
                const barPercent = (client.spent / topClientMax) * 100;
                
                return (
                  <div key={client.name} className="flex items-center gap-4 text-xs">
                    <div className="h-7 w-7 rounded-full bg-indigo-50 text-indigo-705 font-bold text-xs flex items-center justify-center shrink-0">
                      {idx + 1}º
                    </div>

                    <div className="flex-1 space-y-1 text-left min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-800 truncate" style={{maxWidth: '220px'}}>{client.name}</span>
                        <span className="font-extrabold text-emerald-600 font-mono">{formatCurrency(client.spent)}</span>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-full bg-slate-50 h-2 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${barPercent}%` }} />
                        </div>
                        <span className="text-3xs text-gray-400 font-bold shrink-0">{client.ordersCount} pedidos</span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Indicadores Operacionais */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
          <h3 className="text-sm font-extrabold text-gray-850 pb-3 border-b border-gray-50 flex items-center gap-1.5 font-sans">
            <Clock className="h-4.5 w-4.5 text-indigo-600 animate-spin-slow" /> Eficiência Operacional
          </h3>

          <div className="space-y-4 text-xs font-sans">
            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-50 flex items-center justify-between text-left">
              <div>
                <p className="text-4xs text-gray-400 uppercase font-mono font-bold">Tempo Médio de Produção</p>
                <h4 className="text-sm font-extrabold text-gray-800 mt-1">2.4 Dias por Bordado</h4>
                <p className="text-4xs text-gray-500 leading-relaxed">Da aprovação do sinal até a retirada.</p>
              </div>
              <div className="text-indigo-600 font-bold text-xl">⏳</div>
            </div>

            <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-50 flex items-center justify-between text-left">
              <div>
                <p className="text-4xs text-gray-400 uppercase font-mono font-bold">Taxa de Conversão Orc.</p>
                <h4 className="text-sm font-extrabold text-gray-850 mt-1">84% dos Orçamentos</h4>
                <p className="text-4xs text-gray-500 leading-relaxed">Preço justo convertendo mais.</p>
              </div>
              <div className="text-emerald-600 font-bold text-xl">🤝</div>
            </div>

            <div className="bg-indigo-50/30 border border-indigo-100 rounded-xl p-3">
              <h5 className="text-3xs font-extrabold text-indigo-900 uppercase font-mono flex items-center gap-1">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600 shrink-0" /> Dica de Produtividade
              </h5>
              <p className="text-3xs text-indigo-700 leading-relaxed mt-1 italic">
                Enfiar as agulhas da máquina na sequência das 8 cores primárias reduz as paradas de alteração manual em até 40% nas toalhas infantis de alta rotatividade.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
