import React from 'react';
import { Client, Order, Expense, InventoryItem, OrderStatus } from '../types';
import { 
  ShoppingBag, 
  AlertTriangle, 
  CheckCircle, 
  Calendar, 
  TrendingUp, 
  DollarSign, 
  ArrowDownIcon, 
  Package, 
  ArrowRight,
  Clock,
  User,
  Phone
} from 'lucide-react';

interface DashboardTabProps {
  clients: Client[];
  orders: Order[];
  expenses: Expense[];
  inventory: InventoryItem[];
  onNavigateToTab: (tabId: string) => void;
  onSelectOrder: (order: Order) => void;
  todayDate: string;
}

export default function DashboardTab({
  clients,
  orders,
  expenses,
  inventory,
  onNavigateToTab,
  onSelectOrder,
  todayDate
}: DashboardTabProps) {

  // Current month prefix for stats, e.g. "2026-05"
  const currentMonthPrefix = todayDate.substring(0, 7); // "2026-05"

  // 1. Pedidos em andamento (all except budget and delivered)
  const ordersInProgress = orders.filter(
    o => o.status !== 'budget' && o.status !== 'delivered'
  );

  // 2. Pedidos atrasados (delivery date < today and not delivered)
  const lateOrders = orders.filter(
    o => o.deliveryDate < todayDate && o.status !== 'delivered'
  );

  // 3. Entregas do dia
  const deliveriesToday = orders.filter(
    o => o.deliveryDate === todayDate && o.status !== 'delivered'
  );

  // 4. Total vendido no mês (May 2026 - where status is approved/production/embroidery/finished/delivered)
  const currentMonthOrders = orders.filter(
    o => o.status !== 'budget' && o.date.startsWith(currentMonthPrefix)
  );
  const totalVendidoMes = currentMonthOrders.reduce((sum, o) => sum + o.totalValue, 0);

  // 5. Despesas do mês (May 2026)
  const currentMonthExpenses = expenses.filter(
    e => e.date.startsWith(currentMonthPrefix)
  );
  const totalDespesasMes = currentMonthExpenses.reduce((sum, e) => sum + e.value, 0);

  // 6. Lucro líquido/estimado no mês
  const lucroEstimado = totalVendidoMes - totalDespesasMes;

  // 7. Alertas de estoque baixo
  const lowStockItems = inventory.filter(p => p.quantity <= p.minQuantity);

  // Status mapping to label/color
  const statusLabels: Record<OrderStatus, { label: string; color: string }> = {
    budget: { label: 'Orçamento', color: 'bg-amber-50 text-amber-700 border-amber-200' },
    approved: { label: 'Aprovado', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    production: { label: 'Em Produção', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    embroidery: { label: 'Bordando', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    finished: { label: 'Finalizado', color: 'bg-teal-50 text-teal-700 border-teal-200' },
    delivered: { label: 'Entregue', color: 'bg-gray-50 text-gray-600 border-gray-200' },
  };

  // Quick Schedule (orders sorting by proximity of deliveryDate)
  const upcomingDeliveries = [...orders]
    .filter(o => o.status !== 'delivered')
    .sort((a, b) => a.deliveryDate.localeCompare(b.deliveryDate))
    .slice(0, 5);

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
    <div className="space-y-6" id="dashboard_tab">
      
      {/* Alertas Críticos se houver */}
      {(lateOrders.length > 0 || lowStockItems.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {lateOrders.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-rose-50 border border-rose-200 rounded-xl shadow-xs" id="alert_late_orders">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-rose-100 text-rose-700 rounded-lg">
                  <AlertTriangle className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-rose-900">Atenção: Pedidos Atrasados</h4>
                  <p className="text-xs text-rose-700">Há {lateOrders.length} pedido(s) pendente(s) com prazo de entrega expirado!</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigateToTab('orders')}
                className="text-xs font-semibold text-rose-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Verificar <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}

          {lowStockItems.length > 0 && (
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-xl shadow-xs" id="alert_low_stock">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-amber-900">Alerta de Estoque Baixo</h4>
                  <p className="text-xs text-amber-700">{lowStockItems.length} item(ns) estão abaixo do estoque mínimo exigido.</p>
                </div>
              </div>
              <button 
                onClick={() => onNavigateToTab('stock')}
                className="text-xs font-semibold text-amber-800 hover:underline flex items-center gap-1 cursor-pointer"
              >
                Comprar <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Grid de Métricas Principais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" id="stats_grid">
        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs hover:shadow-xs transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Vendas no Mês</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1 font-sans">{formatCurrency(totalVendidoMes)}</h3>
              <p className="text-xs text-emerald-600 mt-1 flex items-center gap-0.5">
                <TrendingUp className="h-3 w-3" /> {currentMonthOrders.length} pedidos fechados
              </p>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs hover:shadow-xs transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Despesas no Mês</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1 font-sans">{formatCurrency(totalDespesasMes)}</h3>
              <p className="text-xs text-rose-500 mt-1 flex items-center gap-0.5">
                <ArrowDownIcon className="h-3 w-3" /> {currentMonthExpenses.length} despesas lançadas
              </p>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingUp className="h-5 w-5 rotate-180" />
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs hover:shadow-xs transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Resultado (Lucro Est.)</p>
              <h3 className={`text-2xl font-bold mt-1 font-sans ${lucroEstimado >= 0 ? 'text-indigo-600' : 'text-rose-600'}`}>
                {formatCurrency(lucroEstimado)}
              </h3>
              <p className="text-xs text-indigo-500 mt-1">
                Faturamento líquido do mês
              </p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <TrendingUp className="h-5 w-5" />
            </div>
          </div>
        </div>

        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs hover:shadow-xs transition">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Produção do Ateliê</p>
              <h3 className="text-2xl font-bold text-gray-800 mt-1 font-sans">{ordersInProgress.length}</h3>
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <Clock className="h-3 w-3" /> {deliveriesToday.length} de hoje • {lateOrders.length} atrasado(s)
              </p>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <ShoppingBag className="h-5 w-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Segundo Nível da Main Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Agenda / Lista de Produção Diária Rápida */}
        <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-5 shadow-xs" id="quick_agenda">
          <div className="flex items-center justify-between pb-4 border-b border-gray-50 mb-4">
            <div>
              <h3 className="text-base font-bold text-gray-800">Próximas Entregas & Prioridades</h3>
              <p className="text-xs text-gray-400">Clique para ver e alterar detalhes do pedido</p>
            </div>
            <button 
              onClick={() => onNavigateToTab('agenda')}
              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-lg transition cursor-pointer flex items-center gap-1"
            >
              <Calendar className="h-3 w-3" /> Agenda Completa
            </button>
          </div>

          <div className="space-y-3">
            {upcomingDeliveries.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm">
                Nenhum pedido pendente em andamento!
              </div>
            ) : (
              upcomingDeliveries.map((order) => {
                const statusInfo = statusLabels[order.status] || { label: order.status, color: 'bg-gray-100 text-gray-800' };
                const isLate = order.deliveryDate < todayDate;
                
                return (
                  <div 
                    key={order.id} 
                    onClick={() => {
                      onNavigateToTab('orders');
                      onSelectOrder(order);
                    }}
                    className={`p-3.5 border rounded-xl hover:border-indigo-200 hover:bg-slate-50/50 cursor-pointer transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isLate ? 'border-rose-100 bg-rose-50/20' : 'border-gray-100'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-700">#{order.id}</span>
                        <h4 className="text-sm font-semibold text-gray-800 truncate max-w-xs">{order.product}</h4>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-400" /> {order.clientName}
                        </span>
                        <span className="font-medium text-gray-700">
                          {order.quantity} un • {order.personalizedName || 'Sem nome personalizado'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-0 pt-2 sm:pt-0 border-gray-50">
                      <div className="text-right">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-2xs font-semibold border ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                        <p className={`text-2xs mt-1 font-medium ${isLate ? 'text-rose-600 font-bold' : 'text-gray-400'}`}>
                          Entrega: {formatDatePT(order.deliveryDate)} {isLate ? '(Atrasado)' : ''}
                        </p>
                      </div>
                      <div className="text-sm font-bold text-gray-700">
                        {formatCurrency(order.totalValue)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Funil de Produção & Capacidade */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col" id="production_funnel">
          <h3 className="text-base font-bold text-gray-800 pb-3 border-b border-gray-50 mb-4">Pedidos por Etapa</h3>
          
          <div className="flex-1 space-y-3.5">
            {[
              { status: 'budget', name: 'Orçamentos', color: 'bg-amber-400' },
              { status: 'approved', name: 'Aprovados', color: 'bg-blue-500' },
              { status: 'production', name: 'Em Preparação/Produção', color: 'bg-indigo-500' },
              { status: 'embroidery', name: 'Na Máquina / Bordando', color: 'bg-purple-500' },
              { status: 'finished', name: 'Prontos para Retirada', color: 'bg-teal-500' },
              { status: 'delivered', name: 'Entregues (Histórico)', color: 'bg-gray-400' }
            ].map(stage => {
              const count = orders.filter(o => o.status === stage.status).length;
              const percent = orders.length > 0 ? (count / orders.length) * 100 : 0;
              
              return (
                <div key={stage.status} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-gray-700">
                    <span className="flex items-center gap-1.5">
                      <span className={`h-2.5 w-2.5 rounded-full ${stage.color}`}></span>
                      {stage.name}
                    </span>
                    <span>{count}</span>
                  </div>
                  <div className="w-full bg-gray-50 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${stage.color}`} 
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="bg-indigo-50/50 rounded-xl p-3 mt-5">
            <h5 className="text-xs font-bold text-indigo-900 flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-indigo-600" />
              Calculadora de Precificação
            </h5>
            <p className="text-3xs text-indigo-700 mt-1 leading-relaxed">
              Evite prejuízos estimando pontos, consumo de linha, entretela e o custo horário de sua máquina de bordado.
            </p>
            <button
              onClick={() => onNavigateToTab('calculator')}
              className="mt-2.5 w-full bg-indigo-600 hover:bg-indigo-700 text-white text-2xs font-bold py-1.5 px-3 rounded-lg flex items-center justify-center gap-1 shadow-xs transition cursor-pointer"
            >
              Criar Orçamento Inteligente <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

      </div>

    </div>
  );
}
