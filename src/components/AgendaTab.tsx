import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  ListTodo, 
  Layers, 
  ArrowRight,
  User,
  ExternalLink,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface AgendaTabProps {
  orders: Order[];
  onUpdateOrder: (order: Order) => void;
  todayDate: string;
}

export default function AgendaTab({ orders, onUpdateOrder, todayDate }: AgendaTabProps) {
  const [selectedDay, setSelectedDay] = useState(todayDate);
  
  // Daily To-Do list checkbox simulation for embroidery tasking
  const [todoList, setTodoList] = useState([
    { id: 'td1', text: 'Esticar tecidos nos bastidores adequados (13x18 / 20x20)', done: true },
    { id: 'td2', text: 'Verificar se há entretela rasgável dupla-face em estoque', done: true },
    { id: 'td3', text: 'Limpar caixa de bobina e lubrificar haste da lançadeira', done: false },
    { id: 'td4', text: 'Carregar bobinas de fio branco de baixo giro', done: false },
    { id: 'td5', text: 'Fazer o corte e queima manual das pontas dos fios do pedido #1001', done: false },
    { id: 'td6', text: 'Exibir amostra física ou foto do monograma p/ noiva aprovar', done: false },
    { id: 'td7', text: 'Passar ferro nas toalhas prontas, perfumar e ensacar p/ entrega', done: false }
  ]);

  const toggleTodo = (id: string) => {
    setTodoList(todoList.map(t => t.id === id ? { ...t, done: !t.done } : t));
  };

  const handleAddNewCustomTodo = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const text = data.get('todotext') as string;
    if (text.trim()) {
      setTodoList([...todoList, { id: 'td_' + Date.now(), text: text.trim(), done: false }]);
      e.currentTarget.reset();
    }
  };

  // Status PT Mapping
  const statusLabels: Record<OrderStatus, { label: string; color: string }> = {
    budget: { label: 'Orçamento', color: 'bg-amber-100/55 text-amber-800 border-amber-200' },
    approved: { label: 'Aprovado', color: 'bg-blue-50 text-blue-800 border-blue-150' },
    production: { label: 'Em Preparação', color: 'bg-indigo-50 text-indigo-805 border-indigo-200' },
    embroidery: { label: 'Bordando na Máquina', color: 'bg-purple-50 text-purple-800 border-purple-200' },
    finished: { label: 'Bordado Pronto', color: 'bg-teal-50 text-teal-850 border-teal-200' },
    delivered: { label: 'Entregue', color: 'bg-gray-100 text-gray-700 border-gray-205' },
  };

  // Filter orders by scheduled delivery date
  const pendingOrders = orders.filter(
    o => o.status !== 'delivered'
  );

  // Sorting: oldest delivery dates (highest priority or late orders first)
  const sortedPendingOrders = [...pendingOrders].sort((a,b) => a.deliveryDate.localeCompare(b.deliveryDate));

  const lateOrders = orders.filter(
    o => o.deliveryDate < todayDate && o.status !== 'delivered'
  );

  const deliveriesToday = orders.filter(
    o => o.deliveryDate === todayDate && o.status !== 'delivered'
  );

  const handleMarkAsReady = (order: Order) => {
    const updated: Order = {
      ...order,
      status: 'finished'
    };
    onUpdateOrder(updated);
    alert(`Pedido #${order.id} marcado como Concluído! Pronto para retirada.`);
  };

  const handleMarkAsDelivered = (order: Order) => {
    const updated: Order = {
      ...order,
      status: 'delivered'
    };
    onUpdateOrder(updated);
    alert(`Pedido #${order.id} com status alterado para Entregue! Faturamento adicionado ao mês atual.`);
  };

  const formatDatePT = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length !== 3) return dateStr;
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 text-left" id="agenda_tab">
      
      {/* Coluna Central e Direita: Fila Chronológica de Encomendas / Controle de Entrega */}
      <div className="lg:col-span-2 space-y-6">
        
        {/* Banner Informativo / Alertas do Dia */}
        <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h3 className="text-base font-extrabold text-indigo-950 flex items-center gap-1.5 font-sans">
                <Calendar className="h-4.5 w-4.5 text-indigo-600" /> Cronograma Visual de Produção
              </h3>
              <p className="text-2xs text-gray-400">Suas datas limite ordenadas por prioridade cronológica de postagem</p>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="p-1 px-2 text-3xs font-extrabold text-rose-800 bg-rose-50 border border-rose-100 rounded-md">
                {lateOrders.length} atrasado(s)
              </span>
              <span className="p-1 px-2 text-3xs font-extrabold text-amber-850 bg-amber-50 border border-amber-100 rounded-md">
                {deliveriesToday.length} entrega(s) hoje
              </span>
            </div>
          </div>
        </div>

        {/* Linha do Tempo de Entregas pendentes */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs space-y-4">
          <h4 className="text-sm font-extrabold text-gray-800 pb-2 border-b border-gray-50 flex items-center gap-2">
            <Clock className="h-4.5 w-4.5 text-indigo-600" /> Fila Crítica de Costura ({sortedPendingOrders.length} encomendas em andamento)
          </h4>

          <div className="space-y-4 relative pl-3 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-indigo-50">
            {sortedPendingOrders.length === 0 ? (
              <div className="py-20 text-center text-gray-400 text-xs italic">
                Nenhuma entrega pendente cadastrada no ateliê! Parabéns, todas as produções estão entregues.
              </div>
            ) : (
              sortedPendingOrders.map((order) => {
                const isLate = order.deliveryDate < todayDate;
                const isToday = order.deliveryDate === todayDate;
                const statusInfo = statusLabels[order.status] || { label: order.status, color: 'bg-gray-150' };
                
                return (
                  <div 
                    key={order.id}
                    className={`p-4 border rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition relative ml-4 ${
                      isLate 
                        ? 'border-rose-250 bg-rose-50/20' 
                        : isToday 
                          ? 'border-amber-250 bg-amber-50/15' 
                          : 'border-slate-100 hover:border-indigo-150'
                    }`}
                  >
                    {/* Indicador de Timeline de Bola */}
                    <div className={`absolute -left-7.5 h-3 w-3 rounded-full border-2 bg-white ${
                      isLate ? 'border-rose-505 border-rose-600' : isToday ? 'border-amber-400' : 'border-indigo-400'
                    }`} />

                    <div className="space-y-1.5 flex-1 col-span-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="p-0.5 px-1.5 rounded-sm bg-indigo-50 text-indigo-900 text-3xs font-extrabold font-mono">
                          #{order.id}
                        </span>
                        <h5 className="text-xs font-bold text-gray-800 leading-normal truncate max-w-xs sm:max-w-md">{order.product}</h5>
                        
                        <span className={`px-2 py-0.5 text-4xs font-bold border rounded-full ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-gray-500 font-medium">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3 text-gray-400 shrink-0" /> Cliente: {order.clientName}
                        </span>
                        <span>• Qtd: {order.quantity} pç</span>
                        <span>• Linha a Bordar: <span className="font-mono text-indigo-705 text-indigo-600 font-bold bg-indigo-50/50 p-0.5 rounded-xs">{order.personalizedName || 'Nenhum'}</span></span>
                      </div>
                    </div>

                    {/* Lado Direito: Prazo e Ações Rápidas de Entrega */}
                    <div className="flex items-center justify-between md:justify-end gap-3.5 border-t md:border-t-0 pt-2 md:pt-0 border-gray-50 shrink-0">
                      <div className="text-left md:text-right font-sans">
                        <span className="text-4xs text-gray-410 block font-bold uppercase">PRAZO DE OUTGANG</span>
                        <span className={`text-xs font-bold ${isLate ? 'text-rose-600 font-black animate-pulse' : 'text-gray-700'}`}>
                          {formatDatePT(order.deliveryDate)}
                        </span>
                        {isLate && <span className="text-4xs text-rose-620 block font-semibold">(Vencido!)</span>}
                        {isToday && <span className="text-4xs text-amber-600 block font-semibold">(Entrega Hoje!)</span>}
                      </div>

                      {/* Botões Rápidos */}
                      <div className="flex gap-1">
                        {order.status !== 'finished' && (
                          <button
                            onClick={() => handleMarkAsReady(order)}
                            className="p-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-805 border border-indigo-100 rounded-lg text-3xs font-bold transition flex items-center gap-1 cursor-pointer"
                            title="Marcar como Bordado concluído"
                          >
                            Concluir
                          </button>
                        )}
                        <button
                          onClick={() => handleMarkAsDelivered(order)}
                          className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-3xs font-black shadow-xs cursor-pointer flex items-center gap-0.5 hover:scale-101 transition duration-150"
                          title="Finalizar e Entregar"
                        >
                          Entregar
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

      {/* Coluna Esquerda: Checklist Diário de Organização de Ateliê */}
      <div className="lg:col-span-1 space-y-6" id="todo_list_sidebar">
        
        {/* Checklist */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-xs flex flex-col h-[750px]" id="ateliere_routine">
          <div className="pb-3 border-b border-gray-50 mb-4 flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-indigo-950 flex items-center gap-1.5 font-sans">
                <ListTodo className="h-5 w-5 text-indigo-600" /> Rotina do Ateliê
              </h3>
              <p className="text-3xs text-gray-400">Verificações de agulha, linhas e lubrificação</p>
            </div>
            <span className="p-1 px-1.5 rounded-full bg-slate-50 text-3xs text-indigo-700 font-bold border border-slate-100">
              {todoList.filter(t => t.done).length}/{todoList.length} d
            </span>
          </div>

          {/* Form para adicionar nova tarefa personalizada na agenda */}
          <form onSubmit={handleAddNewCustomTodo} className="flex gap-1.5 mb-4">
            <input 
              name="todotext"
              type="text" 
              placeholder="Adicionar tarefa do dia..."
              className="flex-1 p-2 border border-gray-150 rounded-lg text-xs placeholder-gray-400 focus:outline-hidden focus:border-indigo-400 bg-slate-50/20"
              required
            />
            <button 
              type="submit"
              className="p-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg cursor-pointer"
            >
              +
            </button>
          </form>

          {/* Lista de checkboxes interativos */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-0.5 scrollbar-thin">
            {todoList.map((t) => (
              <div 
                key={t.id} 
                className="flex items-start gap-2.5 p-2.5 border border-gray-50 hover:border-gray-100 rounded-xl bg-slate-50/10 cursor-pointer text-xs"
                onClick={() => toggleTodo(t.id)}
              >
                <div className={`h-4 w-4 shrink-0 rounded-sm border flex items-center justify-center mt-0.5 transition ${
                  t.done ? 'bg-indigo-600 border-indigo-605 text-white' : 'border-gray-300'
                }`}>
                  {t.done && <CheckCircle className="h-3.5 w-3.5 shrink-0 text-white" />}
                </div>
                <span className={`leading-snug transition-all ${t.done ? 'line-through text-gray-400' : 'text-gray-700 font-semibold'}`}>
                  {t.text}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-indigo-50/40 border border-indigo-50 rounded-xl space-y-1.5">
            <h5 className="text-3xs font-extrabold text-indigo-900 flex items-center gap-1 uppercase font-mono">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600 animate-spin-slow" /> Organização por Lotes
            </h5>
            <p className="text-3xs text-indigo-700 leading-relaxed italic">
              "Agrupar bordados que usam a mesma cor na agulha 1 ou agulha 2 economiza até 12 minutos por toalha de passador de linha!" - Dica Bordando com Amor.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
