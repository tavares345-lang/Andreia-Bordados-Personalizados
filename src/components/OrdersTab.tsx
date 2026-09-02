import React, { useState, useEffect } from 'react';
import { Client, Order, OrderStatus } from '../types';
import { ANDREIA_LOGO_URL } from '../assets/logo';
import { printDocument } from '../utils/printUtils';
import { 
  Plus, 
  Search, 
  ChevronRight, 
  X, 
  Check, 
  MessageSquare, 
  Calendar, 
  DollarSign, 
  User, 
  Maximize2,
  Trash2,
  Edit2,
  Camera,
  Layers,
  Settings,
  Clock,
  ExternalLink,
  ChevronLeft,
  Printer,
  FileText,
  Eye,
  Sparkles
} from 'lucide-react';

interface OrdersTabProps {
  orders: Order[];
  clients: Client[];
  selectedOrderFromDashboard: Order | null;
  onClearSelectedOrder: () => void;
  onAddOrder: (order: Order) => void;
  onUpdateOrder: (order: Order) => void;
  onDeleteOrder: (id: number) => void;
  todayDate: string;
}

export default function OrdersTab({
  orders,
  clients,
  selectedOrderFromDashboard,
  onClearSelectedOrder,
  onAddOrder,
  onUpdateOrder,
  onDeleteOrder,
  todayDate
}: OrdersTabProps) {

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(orders[0] || null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [orderToDelete, setOrderToDelete] = useState<Order | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // If selected from dashboard, force focus on it
  useEffect(() => {
    if (selectedOrderFromDashboard) {
      setSelectedOrder(selectedOrderFromDashboard);
      onClearSelectedOrder(); // Clear to prevent loops but stay on it
    }
  }, [selectedOrderFromDashboard]);

  // Form states
  const [formClientId, setFormClientId] = useState('');
  const [formProduct, setFormProduct] = useState('');
  const [formQuantity, setFormQuantity] = useState(1);
  const [formSize, setFormSize] = useState('14x14 cm');
  const [formFabric, setFormFabric] = useState('Algodão');
  const [formName, setFormName] = useState('');
  const [formColors, setFormColors] = useState<string[]>([]);
  const [colorInput, setColorInput] = useState('');
  const [formTotal, setFormTotal] = useState(100);
  const [formDeposit, setFormDeposit] = useState(50);
  const [formPayMethod, setFormPayMethod] = useState('Pix');
  const [formDate, setFormDate] = useState(todayDate);
  const [formDeliveryDate, setFormDeliveryDate] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formImage, setFormImage] = useState('');
  const [formStatus, setFormStatus] = useState<OrderStatus>('approved');

  const [formError, setFormError] = useState('');

  // Status definition in PT
  const statusConfig: Record<OrderStatus, { label: string; bg: string; text: string; nextStatus?: OrderStatus; nextLabel?: string }> = {
    budget: { label: 'Orçamento', bg: 'bg-amber-50 border-amber-250', text: 'text-amber-800', nextStatus: 'approved', nextLabel: 'Aprovar Orçamento' },
    approved: { label: 'Aprovado', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-800', nextStatus: 'production', nextLabel: 'Iniciar Produção' },
    production: { label: 'Em Preparação/Corte', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-800', nextStatus: 'embroidery', nextLabel: 'Levar para Máquina/Bordar' },
    embroidery: { label: 'Bordando', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800', nextStatus: 'finished', nextLabel: 'Concluir Bordado' },
    finished: { label: 'Finalizado (Pronto)', bg: 'bg-teal-50 border-teal-200', text: 'text-teal-850', nextStatus: 'delivered', nextLabel: 'Registrar Entrega' },
    delivered: { label: 'Entregue', bg: 'bg-gray-50 border-gray-200', text: 'text-gray-600' },
  };

  const filteredOrders = orders.filter(o => {
    const matchesSearch = 
      o.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (o.personalizedName && o.personalizedName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      String(o.id).includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || o.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const handleOpenNewOrder = () => {
    setEditingOrder(null);
    setFormClientId(clients.length > 0 ? clients[0].id : '');
    setFormProduct('');
    setFormQuantity(1);
    setFormSize('13x18 cm');
    setFormFabric('Algodão');
    setFormName('');
    setFormColors([]);
    setColorInput('');
    setFormTotal(50);
    setFormDeposit(25);
    setFormPayMethod('Pix');
    setFormDate(todayDate || new Date().toISOString().split('T')[0]);
    
    // 7 days default
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    setFormDeliveryDate(futureDate.toISOString().split('T')[0]);
    setFormNotes('');
    setFormImage('');
    setFormStatus('approved');
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEditOrder = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setEditingOrder(order);
    setFormClientId(order.clientId);
    setFormProduct(order.product);
    setFormQuantity(order.quantity || 1);
    setFormSize(order.embroiderySize || '13x18 cm');
    setFormFabric(order.fabricType || 'Algodão');
    setFormName(order.personalizedName || '');
    setFormColors(order.colorsUsed || []);
    setColorInput('');
    setFormTotal(order.totalValue || 0);
    setFormDeposit(order.depositPaid || 0);
    setFormPayMethod(order.paymentMethod || 'Pix');
    setFormDate(order.date || todayDate);
    setFormDeliveryDate(order.deliveryDate || '');
    setFormNotes(order.observations || '');
    setFormImage(order.photoUrl || '');
    setFormStatus(order.status || 'approved');
    setFormError('');
    setIsFormOpen(true);
  };

  const handlePromptDelete = (order: Order, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setOrderToDelete(order);
  };

  const handleConfirmDelete = () => {
    if (!orderToDelete) return;
    const idToDelete = orderToDelete.id;
    onDeleteOrder(idToDelete);
    
    if (selectedOrder?.id === idToDelete) {
      const remaining = orders.filter(o => o.id !== idToDelete);
      setSelectedOrder(remaining.length > 0 ? remaining[0] : null);
    }
    setOrderToDelete(null);
  };

  const handleAddColor = () => {
    if (colorInput.trim() && !formColors.includes(colorInput.trim())) {
      setFormColors([...formColors, colorInput.trim()]);
      setColorInput('');
    }
  };

  const handleRemoveColor = (col: string) => {
    setFormColors(formColors.filter(c => c !== col));
  };

  const handleApplyQuickPrice = (price: number) => {
    setFormTotal(price);
    setFormDeposit(price / 2);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formProduct.trim()) {
      setFormError('A descrição do produto é obrigatória.');
      return;
    }
    if (!formDeliveryDate) {
      setFormError('A data de entrega é obrigatória.');
      return;
    }

    if (!formClientId) {
      setFormError('Selecione ou cadastre um cliente para associar ao pedido.');
      return;
    }

    const client = clients.find(c => c.id === formClientId);
    const clientName = client ? client.name : 'Cliente Avulso';

    const orderPayload: Order = {
      id: editingOrder ? editingOrder.id : (orders.length > 0 ? Math.max(...orders.map(o => o.id)) + 1 : 1001),
      clientId: formClientId,
      clientName: clientName,
      date: formDate || todayDate,
      deliveryDate: formDeliveryDate,
      status: formStatus,
      product: formProduct,
      quantity: Number(formQuantity) || 1,
      embroiderySize: formSize,
      fabricType: formFabric,
      personalizedName: formName,
      colorsUsed: formColors,
      totalValue: Number(formTotal) || 0,
      paymentMethod: formPayMethod,
      depositPaid: Number(formDeposit) || 0,
      remainingValue: (Number(formTotal) || 0) - (Number(formDeposit) || 0),
      observations: formNotes,
      photoUrl: formImage || 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400'
    };

    if (editingOrder) {
      onUpdateOrder(orderPayload);
    } else {
      onAddOrder(orderPayload);
    }

    setSelectedOrder(orderPayload);
    setIsFormOpen(false);
    setEditingOrder(null);
  };

  const advanceStatus = (order: Order) => {
    const config = statusConfig[order.status];
    if (config && config.nextStatus) {
      const updated: Order = {
        ...order,
        status: config.nextStatus
      };
      onUpdateOrder(updated);
      setSelectedOrder(updated);
    }
  };

  const setManualStatus = (order: Order, val: OrderStatus) => {
    const updated: Order = {
      ...order,
      status: val
    };
    onUpdateOrder(updated);
    setSelectedOrder(updated);
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

  // Generate customized message for WhatsApp status notifications
  const getWhatsAppMessage = (order: Order) => {
    const client = clients.find(c => c.id === order.clientId);
    const greetingName = client ? client.name.split(' ')[0] : 'Olá';
    const statusTextPT = statusConfig[order.status]?.label || order.status;
    const remainingToPay = order.totalValue - order.depositPaid;
    
    let baseMsg = `Olá, ${greetingName}! 😄 Aqui é da Andreia Bordados. Passando para atualizar as informações do seu pedido *#${order.id}* (%F0%9F%AA%A1):\n\n`;
    baseMsg += `*Produto:* ${order.product}\n`;
    baseMsg += `*Nome customizado:* ${order.personalizedName || 'Nenhum'}\n`;
    baseMsg += `*Status atual:* _${statusTextPT}_\n`;
    
    if (order.status === 'finished') {
      baseMsg += `\n*BOAS NOTÍCIAS!* Seu bordado foi finalizado e está pronto para retirada! 🎉🎈\n`;
    } else if (order.status === 'embroidery') {
      baseMsg += `\nSeu bordado já está na máquina sendo costurado com muito carinho! 🧵✨\n`;
    } else if (order.status === 'budget') {
      baseMsg += `\nSeu orçamento já está pré-calculado. Você pode visualizar e aprovar conosco.\n`;
    }

    baseMsg += `*Valor Total:* ${formatCurrency(order.totalValue)}\n`;
    if (order.depositPaid > 0) {
      baseMsg += `*Sinal já pago:* ${formatCurrency(order.depositPaid)}\n`;
      baseMsg += `*Valor restante na entrega:* *${formatCurrency(remainingToPay)}*\n`;
    }
    
    baseMsg += `*Prazo previsto de entrega:* ${formatDatePT(order.deliveryDate)}\n\n`;
    baseMsg += `Ficamos à disposição se tiver qualquer dúvida!`;
    
    return encodeURIComponent(baseMsg);
  };

  const currentOrderClient = selectedOrder ? clients.find(c => c.id === selectedOrder.clientId) : null;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="orders_tab">
      
      {/* Coluna Esquerda: Lista de Pedidos */}
      <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex flex-col h-[750px]" id="orders_list_panel">
        
        {/* Header List */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-50 mb-4 h-12">
          <div>
            <h3 className="text-base font-bold text-gray-800">Meus Pedidos ({filteredOrders.length})</h3>
            <span className="text-3xs text-gray-400">Fila de confecção e entregas</span>
          </div>
          <button 
            id="btn_novo_pedido"
            onClick={handleOpenNewOrder}
            className="p-2 px-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer font-sans shadow-xs active:scale-95"
          >
            <Plus className="h-4 w-4" /> Novo Pedido
          </button>
        </div>

        {/* Busca e Barra de Filtros */}
        <div className="space-y-2 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar por cliente, produto, número..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border-gray-100 rounded-xl bg-gray-50/50 focus:border-indigo-400 focus:bg-white focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap gap-1">
            {[
              { id: 'all', label: 'Todos' },
              { id: 'budget', label: 'Orç' },
              { id: 'approved', label: 'Aprov' },
              { id: 'production', label: 'Prod' },
              { id: 'embroidery', label: 'Bord' },
              { id: 'finished', label: 'Pronto' },
              { id: 'delivered', label: 'Entr' }
            ].map(cat => {
              const active = statusFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setStatusFilter(cat.id)}
                  className={`px-2.5 py-1 text-2xs font-semibold rounded-md transition cursor-pointer ${
                    active 
                      ? 'bg-indigo-600 text-white shadow-2xs' 
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de Pedidos */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-16 text-gray-400 text-sm italic">
              Nenhum pedido encontrado.
            </div>
          ) : (
            filteredOrders.map(order => {
              const active = selectedOrder?.id === order.id;
              const config = statusConfig[order.status] || { label: order.status, bg: 'bg-gray-50', text: 'text-gray-600' };
              const isLate = order.deliveryDate < todayDate && order.status !== 'delivered';
              
              return (
                <div 
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition flex flex-col justify-between group ${
                    active 
                      ? 'border-indigo-600 bg-indigo-50/25 shadow-2xs' 
                      : isLate 
                        ? 'border-rose-200 bg-rose-50/20' 
                        : 'border-gray-100 bg-white hover:border-indigo-200 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-xs font-bold font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded-sm">#{order.id}</span>
                        <h4 className="text-xs font-semibold text-gray-800 truncate" style={{maxWidth: '140px'}}>{order.product}</h4>
                      </div>
                      <p className="text-2xs text-gray-500 mt-1 flex items-center gap-1">
                        <User className="h-3 w-3 text-gray-400 shrink-0" /> {order.clientName}
                      </p>
                      {order.personalizedName && (
                        <p className="text-3xs font-mono text-rose-700 font-bold mt-0.5 truncate">
                          "{order.personalizedName}"
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1.5 shrink-0">
                      <span className={`px-2 py-0.5 rounded-full text-3xs font-semibold border ${config.bg} ${config.text}`}>
                        {config.label}
                      </span>
                      
                      {/* Quick Edit/Delete buttons on hover */}
                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                        <button
                          onClick={(e) => handleOpenEditOrder(order, e)}
                          title="Editar este pedido"
                          className="p-1 hover:bg-indigo-100 hover:text-indigo-700 text-gray-400 rounded-md transition cursor-pointer"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={(e) => handlePromptDelete(order, e)}
                          title="Excluir este pedido"
                          className="p-1 hover:bg-rose-100 hover:text-rose-600 text-gray-400 rounded-md transition cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-100/70 text-2xs text-gray-500">
                    <span className={`font-medium ${isLate ? 'text-rose-600 font-bold' : ''}`}>
                      Fim: {formatDatePT(order.deliveryDate)} {isLate ? '(Atrasado)' : ''}
                    </span>
                    <span className="font-extrabold text-gray-800">{formatCurrency(order.totalValue)}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Coluna Direita: Detalhe do Pedido */}
      <div className="lg:col-span-2 flex flex-col h-[750px]" id="orders_workspace">
        {selectedOrder ? (
          /* DETALHE DO PEDIDO SELECIONADO */
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col h-full overflow-hidden" id="order_details_panel">
            
            {/* Header Ficha Pedido */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-50">
              <div className="space-y-0.5 text-left">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono tracking-widest text-indigo-600">PEDIDO DE BORDADO</span>
                  <span className="p-1 px-2 rounded-md bg-indigo-50 text-indigo-800 text-2xs font-extrabold">#{selectedOrder.id}</span>
                </div>
                <h3 className="text-base font-bold text-gray-800 truncate max-w-sm sm:max-w-md">{selectedOrder.product}</h3>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => setIsPrintModalOpen(true)}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-xs"
                  title="Imprimir pedido limpo com logo, dados do cliente e valores"
                >
                  <Printer className="h-3.5 w-3.5" /> Imprimir Pedido
                </button>

                <button
                  onClick={() => handleOpenEditOrder(selectedOrder)}
                  className="px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold rounded-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95 shadow-2xs"
                >
                  <Edit2 className="h-3.5 w-3.5" /> Editar Pedido
                </button>
                
                <button
                  onClick={() => handlePromptDelete(selectedOrder)}
                  className="p-1.5 text-rose-600 border border-transparent hover:border-rose-200 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Apagar pedido"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Ficha Visual de Conteúdos */}
            <div className="flex-1 overflow-y-auto space-y-5 py-5 pr-1 text-left scrollbar-thin">
              
              {/* Barra de Status e Próximo Passo */}
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-xl" id="status_flow_tracker">
                <p className="text-3xs font-bold text-gray-400 uppercase tracking-wider mb-2 font-mono">Progresso de Confecção</p>
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {(['budget', 'approved', 'production', 'embroidery', 'finished', 'delivered'] as OrderStatus[]).map((st) => {
                      const isCurrent = selectedOrder.status === st;
                      const config = statusConfig[st] || { label: st };
                      
                      return (
                        <button
                          key={st}
                          onClick={() => setManualStatus(selectedOrder, st)}
                          className={`px-2.5 py-1 text-3xs font-bold rounded-md border transition cursor-pointer ${
                            isCurrent 
                              ? 'bg-indigo-600 border-indigo-700 text-white shadow-xs' 
                              : 'bg-white text-gray-500 hover:border-gray-300'
                          }`}
                        >
                          {config.label}
                        </button>
                      );
                    })}
                  </div>

                  {statusConfig[selectedOrder.status]?.nextStatus && (
                    <button
                      onClick={() => advanceStatus(selectedOrder)}
                      className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg flex items-center gap-1 shrink-0 cursor-pointer shadow-xs"
                    >
                      <Check className="h-3.5 w-3.5" /> {statusConfig[selectedOrder.status].nextLabel}
                    </button>
                  )}
                </div>
              </div>

              {/* Detalhes do Cliente Real do Pedido */}
              <div className="p-4 bg-indigo-50/30 border border-indigo-50 rounded-xl flex items-center justify-between flex-col sm:flex-row gap-4" id="order_client_section">
                <div>
                  <p className="text-3xs font-bold text-gray-400 uppercase tracking-wider font-mono">Contato do Cliente</p>
                  <p className="text-sm font-bold text-gray-800 mt-0.5">{selectedOrder.clientName}</p>
                  {currentOrderClient && (
                    <p className="text-2xs text-gray-500 mt-0.5 leading-relaxed">
                      Telefone: {currentOrderClient.phone} • E-mail: {currentOrderClient.email || 'Não informado'}
                    </p>
                  )}
                </div>
                {currentOrderClient && (
                  <div className="flex gap-2">
                    <a 
                      href={`https://wa.me/${currentOrderClient.whatsapp.replace(/\D/g, '')}?text=${getWhatsAppMessage(selectedOrder)}`}
                      target="_blank" 
                      referrerPolicy="no-referrer"
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                    >
                      <MessageSquare className="h-3.5 w-3.5" /> Notificar WhatsApp
                    </a>
                  </div>
                )}
              </div>

              {/* Grid Informações de Produção */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Esquerda: Detalhes Técnicos */}
                <div className="space-y-4">
                  <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-widest border-l-2 border-indigo-600 pl-2">Especificações do Bordado</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-3xs font-bold text-gray-400 uppercase">Quantidade solicitada</p>
                      <p className="text-sm font-bold text-gray-800">{selectedOrder.quantity} un</p>
                    </div>
                    <div>
                      <p className="text-3xs font-bold text-gray-400 uppercase">Tamanho do Bordado</p>
                      <p className="text-sm font-bold text-gray-800">{selectedOrder.embroiderySize || 'Não medido'}</p>
                    </div>
                    <div>
                      <p className="text-3xs font-bold text-gray-400 uppercase font-sans">Tipo de Tecido</p>
                      <p className="text-sm font-bold text-gray-800">{selectedOrder.fabricType || 'Qualquer um'}</p>
                    </div>
                    <div>
                      <p className="text-3xs font-bold text-gray-400 uppercase">Texto / Nome Customizado</p>
                      <p className="text-sm font-extrabold text-rose-750 font-mono text-rose-700 bg-rose-50/50 p-1 rounded-sm inline-block">{selectedOrder.personalizedName || 'Nenhum'}</p>
                    </div>
                  </div>

                  <div>
                    <p className="text-3xs font-bold text-gray-400 uppercase mb-1">Paleta de Linhas / Tons de Fios Utilizados</p>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedOrder.colorsUsed && selectedOrder.colorsUsed.length > 0 ? (
                        selectedOrder.colorsUsed.map((color, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-gray-50 border border-gray-150 rounded-md text-2xs font-semibold text-gray-700">
                            {color}
                          </span>
                        ))
                      ) : (
                        <p className="text-xs text-gray-500 italic">Nenhuma cor pré-definida.</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-3xs font-bold text-gray-400 uppercase font-sans">Observações do Ateliê</p>
                    <p className="text-xs text-gray-650 bg-slate-50 p-3 rounded-xl italic">
                      {selectedOrder.observations ? `"${selectedOrder.observations}"` : 'Sem anotações complementares.'}
                    </p>
                  </div>
                </div>

                {/* Direita: Imagem de Referência & Finanças */}
                <div className="space-y-5">
                  <h4 className="text-xs font-extrabold text-indigo-950 uppercase tracking-widest border-l-2 border-indigo-600 pl-2">Material Visual</h4>

                  {/* Foto de Referência */}
                  {selectedOrder.photoUrl ? (
                    <div className="relative rounded-xl overflow-hidden group aspect-video bg-gray-50 border border-gray-100 shadow-xs max-h-48">
                      <img 
                        src={selectedOrder.photoUrl} 
                        alt="Bordado referência" 
                        className="w-full h-full object-cover transition duration-300 group-hover:scale-105"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent flex items-end p-2.5">
                        <span className="text-2xs text-white font-medium">Bordado de referência cadastrado</span>
                      </div>
                    </div>
                  ) : (
                    <div className="border border-dashed border-gray-200 rounded-xl p-8 text-center bg-gray-50/50 flex flex-col items-center">
                      <Camera className="h-8 w-8 text-gray-300 mb-1" />
                      <span className="text-2xs text-gray-400">Nenhuma foto de referência anexada.</span>
                    </div>
                  )}

                  {/* Informações Financeiras e Fluxo */}
                  <div className="p-4 bg-emerald-50/40 border border-emerald-100 rounded-xl space-y-3">
                    <h5 className="text-xs font-bold text-emerald-950 flex items-center gap-1 border-b border-emerald-100 pb-2 mb-2 font-mono">
                      VALORES E SALDO DO PEDIDO
                    </h5>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-white p-2 rounded-lg border border-emerald-50/50">
                        <p className="text-4xs text-gray-400 font-bold uppercase font-mono">Valor Total</p>
                        <p className="text-sm font-extrabold text-emerald-700 mt-1">{formatCurrency(selectedOrder.totalValue)}</p>
                      </div>

                      <div className="bg-white p-2 rounded-lg border border-emerald-50/50">
                        <p className="text-4xs text-gray-400 font-bold uppercase font-mono">Sinal Pago</p>
                        <p className="text-xs font-bold text-gray-600 mt-1">{formatCurrency(selectedOrder.depositPaid)}</p>
                      </div>

                      <div className="bg-emerald-600 text-white p-2 rounded-lg shadow-xs">
                        <p className="text-4xs text-emerald-100 font-extrabold uppercase font-mono">Falta Pagar</p>
                        <p className="text-sm font-black mt-1">
                          {formatCurrency(selectedOrder.totalValue - selectedOrder.depositPaid)}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between text-2xs text-emerald-800 font-medium">
                      <span>Forma de Ajuste: {selectedOrder.paymentMethod}</span>
                      <span>Cadastrado em: {formatDatePT(selectedOrder.date)}</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full text-gray-400 shadow-xs">
            <Layers className="h-16 w-16 text-gray-200 mb-2" />
            <p className="text-sm font-medium">Nenhum pedido selecionado na lista.</p>
            <p className="text-xs text-gray-400 mt-1">Selecione um pedido na lateral ou crie um novo pedido para começar.</p>
            <button
              onClick={handleOpenNewOrder}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" /> Criar Novo Pedido
            </button>
          </div>
        )}
      </div>

      {/* MODAL DIALOG: NOVO / EDITAR PEDIDO */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden text-left my-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-700 rounded-xl">
                  {editingOrder ? <Edit2 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">
                    {editingOrder ? `Editar Pedido #${editingOrder.id}` : 'Lançar Novo Pedido de Bordado'}
                  </h3>
                  <p className="text-2xs text-gray-500">
                    {editingOrder ? 'Altere as informações do pedido e salve as modificações' : 'Preencha os detalhes do produto e cliente para a fila de produção'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body Form */}
            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin">
              {formError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Cliente Selector */}
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-gray-700">Cliente Associado *</label>
                  {clients.length === 0 && (
                    <span className="text-3xs text-amber-600 font-bold">Nenhum cliente cadastrado ainda</span>
                  )}
                </div>
                {clients.length > 0 ? (
                  <select 
                    value={formClientId}
                    onChange={(e) => setFormClientId(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:border-indigo-400 focus:outline-hidden"
                    required
                  >
                    <option value="" disabled>Selecione um cliente...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>{c.name} ({c.phone || 'Sem fone'})</option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-xs">
                    Cadastre um cliente na aba <strong>Clientes</strong> ou utilizaremos um registro automático.
                  </div>
                )}
              </div>

              {/* Produto & Quantidade */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-gray-700">Produto solicitado *</label>
                  <input 
                    type="text" 
                    value={formProduct}
                    onChange={(e) => setFormProduct(e.target.value)}
                    placeholder="Ex: Toalha de Banho com capuz azul"
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-hidden"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 font-sans">Quantidade *</label>
                  <input 
                    type="number" 
                    min={1}
                    value={formQuantity}
                    onChange={(e) => setFormQuantity(Number(e.target.value))}
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Tipo de Tecido, Tamanho do bordado & Nome Personalizado */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Tipo de Tecido</label>
                  <input 
                    type="text" 
                    value={formFabric}
                    onChange={(e) => setFormFabric(e.target.value)}
                    placeholder="Ex: Piquet, Linho, Felpudo"
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Tamanho do Bordado</label>
                  <input 
                    type="text" 
                    value={formSize}
                    onChange={(e) => setFormSize(e.target.value)}
                    placeholder="Ex: 13x18 cm, 10x10 cm"
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Texto / Monograma</label>
                  <input 
                    type="text" 
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Ex: Arthur / Família Silva"
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-xl font-mono text-xs focus:border-indigo-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Cores Utilizadas */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">Cores / Tons das Linhas do Bordado</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={colorInput}
                    onChange={(e) => setColorInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddColor();
                      }
                    }}
                    placeholder="Ex: Ouro Luminoso (Ricamare 3020) e pressione enter"
                    className="flex-1 p-2.5 text-sm border border-gray-200 rounded-xl focus:border-indigo-400 focus:outline-hidden"
                  />
                  <button 
                    type="button"
                    onClick={handleAddColor}
                    className="px-4 py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 font-bold hover:bg-indigo-100 rounded-xl text-xs cursor-pointer"
                  >
                    Adicionar
                  </button>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {formColors.map(c => (
                    <span key={c} className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-800 text-2xs font-semibold rounded-lg border border-slate-200">
                      {c}
                      <X className="h-3 w-3 hover:text-rose-600 cursor-pointer" onClick={() => handleRemoveColor(c)} />
                    </span>
                  ))}
                  {formColors.length === 0 && <span className="text-3xs text-gray-400">Nenhuma cor de linha adicionada.</span>}
                </div>
              </div>

              {/* Status do Pedido & Imagem de Referência */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Status / Etapa do Pedido</label>
                  <select 
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as OrderStatus)}
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-xl bg-white focus:border-indigo-400 focus:outline-hidden"
                  >
                    <option value="budget">Orçamento</option>
                    <option value="approved">Aprovado (Aguardando Fila)</option>
                    <option value="production">Em Preparação/Corte</option>
                    <option value="embroidery">Na Máquina (Bordando)</option>
                    <option value="finished">Finalizado (Pronto)</option>
                    <option value="delivered">Entregue ao Cliente</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">URL Foto / Referência Visual</label>
                  <input 
                    type="text" 
                    value={formImage}
                    onChange={(e) => setFormImage(e.target.value)}
                    placeholder="https://..."
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-xl text-xs focus:border-indigo-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Valores & Pagamento */}
              <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-3">
                <p className="text-xs font-extrabold text-gray-800 uppercase tracking-wider font-mono">Valores e Condições</p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-indigo-600" /> Valor Total (R$) *
                    </label>
                    <input 
                      type="number" 
                      value={formTotal}
                      onChange={(e) => setFormTotal(Number(e.target.value))}
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-xl bg-white font-bold text-indigo-900"
                      required
                    />
                    <div className="flex gap-1 mt-1">
                      <button type="button" onClick={() => handleApplyQuickPrice(35)} className="px-2 py-0.5 bg-white border border-gray-200 hover:border-indigo-400 rounded-md text-3xs text-gray-600 cursor-pointer">R$35</button>
                      <button type="button" onClick={() => handleApplyQuickPrice(60)} className="px-2 py-0.5 bg-white border border-gray-200 hover:border-indigo-400 rounded-md text-3xs text-gray-600 cursor-pointer">R$60</button>
                      <button type="button" onClick={() => handleApplyQuickPrice(120)} className="px-2 py-0.5 bg-white border border-gray-200 hover:border-indigo-400 rounded-md text-3xs text-gray-600 cursor-pointer">R$120</button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                      <DollarSign className="h-3.5 w-3.5 text-indigo-600" /> Sinal Pago (R$)
                    </label>
                    <input 
                      type="number" 
                      value={formDeposit}
                      onChange={(e) => setFormDeposit(Number(e.target.value))}
                      className="w-full p-2.5 text-sm border border-gray-300 rounded-xl bg-white"
                    />
                    <button 
                      type="button" 
                      onClick={() => setFormDeposit(formTotal / 2)} 
                      className="text-3xs text-indigo-600 hover:underline mt-1 cursor-pointer block font-bold"
                    >
                      Definir 50% de Sinal
                    </button>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Forma de Pagamento</label>
                    <select 
                      value={formPayMethod}
                      onChange={(e) => setFormPayMethod(e.target.value)}
                      className="w-full p-2.5 text-sm border border-gray-300 bg-white rounded-xl"
                    >
                      <option value="Pix">Pix</option>
                      <option value="Cartão de Crédito">Cartão de Crédito</option>
                      <option value="Cartão de Débito">Cartão de Débito</option>
                      <option value="Dinheiro">Dinheiro</option>
                      <option value="Transferência">Transferência / TED</option>
                    </select>
                    <span className="text-3xs text-gray-500 font-bold block mt-1">
                      Restante: {formatCurrency(formTotal - formDeposit)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Datas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Data de Abertura do Pedido</label>
                  <input 
                    type="date" 
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-xl"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-indigo-950 flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-indigo-600" /> Data Limite de Entrega *
                  </label>
                  <input 
                    type="date" 
                    value={formDeliveryDate}
                    onChange={(e) => setFormDeliveryDate(e.target.value)}
                    className="w-full p-2.5 text-sm border border-indigo-300 rounded-xl bg-indigo-50/20 font-bold text-indigo-950 focus:border-indigo-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-700">Observações Adicionais do Ateliê</label>
                <textarea 
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Instruções de bastidor, linha metálica, reforço de entretela..."
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-xl resize-none focus:border-indigo-400 focus:outline-hidden"
                />
              </div>

              {/* Modal Footer Buttons */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-3">
                <div>
                  {editingOrder && (
                    <button
                      type="button"
                      onClick={() => handlePromptDelete(editingOrder)}
                      className="px-3 py-2 text-rose-600 hover:bg-rose-50 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" /> Excluir Pedido
                    </button>
                  )}
                </div>

                <div className="flex gap-2.5">
                  <button 
                    type="button"
                    onClick={() => setIsFormOpen(false)}
                    className="px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95"
                  >
                    <Check className="h-4 w-4" /> {editingOrder ? 'Salvar Alterações' : 'Criar Pedido'}
                  </button>
                </div>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* CONFIRMAÇÃO DE EXCLUSÃO DE PEDIDO */}
      {orderToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-md p-6 text-left space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800">Excluir Pedido #{orderToDelete.id}?</h3>
                <p className="text-xs text-gray-500">Esta ação removerá o pedido e seu histórico de confecção.</p>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-xl text-xs space-y-1 border border-gray-100">
              <p><strong>Produto:</strong> {orderToDelete.product}</p>
              <p><strong>Cliente:</strong> {orderToDelete.clientName}</p>
              <p><strong>Valor:</strong> {formatCurrency(orderToDelete.totalValue)}</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setOrderToDelete(null)}
                className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-bold rounded-xl cursor-pointer"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
              >
                Sim, Excluir Pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE FICHA / ORÇAMENTO OFICIAL COM LOGO ANDREIA BORDADOS */}
      {isPrintModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto animate-fadeIn" id="order_print_sheet_modal">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-auto">
            
            {/* Modal Topbar Actions (não sai no print) */}
            <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between gap-3 shrink-0 print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-rose-400" />
                <span className="text-xs font-bold font-sans">Ficha de Produção / Orçamento Oficial #{selectedOrder.id}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    printDocument('printable_order_sheet', `Pedido_${selectedOrder.id}_Andreia_Bordados`);
                  }}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                  title="Imprimir ou Salvar em PDF"
                >
                  <Printer className="h-3.5 w-3.5" /> Imprimir / PDF
                </button>
                <button
                  onClick={() => setIsPrintModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Folha Oficial com Logo para Impressão */}
            <div className="p-6 sm:p-8 overflow-y-auto space-y-6 text-slate-800 bg-white printable-sheet" id="printable_order_sheet">
              
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
                      Bordados Personalizados & Confecção
                    </p>
                    <p className="text-3xs text-slate-500">
                      Qualidade premium, pontualidade e acabamento artesanal de excelência.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="inline-block px-3 py-1 bg-slate-100 text-slate-900 font-black text-xs rounded-md border border-slate-300 uppercase font-mono">
                    {selectedOrder.status === 'budget' ? 'ORÇAMENTO OFICIAL' : 'FICHA DE PEDIDO'}
                  </span>
                  <p className="text-sm font-black text-slate-900 font-mono mt-1.5">PEDIDO #{selectedOrder.id}</p>
                  <p className="text-3xs text-slate-500 font-mono">Data: {selectedOrder.createdAt}</p>
                  <p className="text-3xs font-bold text-slate-700 font-mono">Previsão: {selectedOrder.deadline}</p>
                </div>
              </div>

              {/* Informações do Cliente */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs print-card print-avoid-break">
                <div>
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Dados do Cliente</span>
                  <p className="mt-1 font-bold text-slate-900 text-sm">{selectedOrder.clientName}</p>
                  {currentOrderClient && (
                    <div className="text-2xs text-slate-600 mt-1 space-y-0.5">
                      <p className="font-semibold">Telefone/WhatsApp: {currentOrderClient.phone}</p>
                      {currentOrderClient.email && <p>E-mail: {currentOrderClient.email}</p>}
                      {currentOrderClient.address && <p>Endereço/Cidade: {currentOrderClient.address}</p>}
                    </div>
                  )}
                </div>
                <div>
                  <span className="text-3xs font-bold text-slate-400 uppercase tracking-wider block">Status & Responsável</span>
                  <p className="mt-1 font-bold text-slate-900 uppercase text-xs">
                    {statusConfig[selectedOrder.status]?.label || selectedOrder.status}
                  </p>
                  <p className="text-3xs text-slate-500 mt-1">Ateliê: Andreia Bordados</p>
                  <p className="text-3xs text-slate-500">Bordados Computadorizados de Alta Definição</p>
                </div>
              </div>

              {/* Detalhes de Produção do Bordado */}
              <div className="space-y-3 print-avoid-break">
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-rose-600" /> Especificações do Bordado
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200 print-card">
                  <div>
                    <span className="text-3xs font-bold text-slate-500 uppercase block">Produto / Peça</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{selectedOrder.product}</span>
                  </div>
                  <div>
                    <span className="text-3xs font-bold text-slate-500 uppercase block">Quantidade</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{selectedOrder.quantity} unidade(s)</span>
                  </div>
                  <div>
                    <span className="text-3xs font-bold text-slate-500 uppercase block">Tamanho da Matriz</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{selectedOrder.embroiderySize || 'Padrão'}</span>
                  </div>
                  <div>
                    <span className="text-3xs font-bold text-slate-500 uppercase block">Tecido Base</span>
                    <span className="font-bold text-slate-900 mt-0.5 block">{selectedOrder.fabricType || 'Padrão'}</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-3xs font-bold text-slate-500 uppercase block">Nome / Texto Personalizado</span>
                    <span className="font-black text-rose-800 font-mono text-sm mt-0.5 block">
                      {selectedOrder.personalizedName || 'Sem personalização nominal'}
                    </span>
                  </div>
                </div>

                {selectedOrder.colorsUsed && selectedOrder.colorsUsed.length > 0 && (
                  <div className="text-xs print-card p-3 bg-white border border-slate-200 rounded-lg">
                    <span className="text-3xs font-bold text-slate-500 uppercase block mb-1">Cores e Linhas Programadas:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedOrder.colorsUsed.map((color, idx) => (
                        <span key={idx} className="px-2 py-0.5 bg-slate-100 border border-slate-300 rounded-md text-3xs font-bold text-slate-800">
                          {color}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {selectedOrder.observations && (
                  <div className="text-xs p-3 bg-slate-50 rounded-lg italic text-slate-700 border border-slate-200 print-card">
                    <span className="font-bold not-italic text-slate-900 block text-3xs uppercase mb-0.5">Observações Adicionais:</span>
                    "{selectedOrder.observations}"
                  </div>
                )}
              </div>

              {/* Quadro Financeiro */}
              <div className="p-4 bg-slate-50 rounded-xl border-2 border-slate-300 grid grid-cols-3 gap-3 text-center print-card print-avoid-break">
                <div>
                  <span className="text-3xs font-bold text-slate-500 uppercase block">Valor Total</span>
                  <span className="text-base sm:text-xl font-black text-slate-900 font-mono mt-0.5 block">
                    {formatCurrency(selectedOrder.totalValue)}
                  </span>
                </div>
                <div>
                  <span className="text-3xs font-bold text-slate-500 uppercase block">Sinal / Entrada</span>
                  <span className="text-base sm:text-xl font-bold text-emerald-800 font-mono mt-0.5 block">
                    {formatCurrency(selectedOrder.depositPaid)}
                  </span>
                </div>
                <div>
                  <span className="text-3xs font-bold text-slate-500 uppercase block">Saldo a Receber</span>
                  <span className="text-base sm:text-xl font-black text-rose-800 font-mono mt-0.5 block">
                    {formatCurrency(selectedOrder.remainingValue)}
                  </span>
                </div>
              </div>

              {/* Assinatura / Aceite do Cliente */}
              <div className="pt-6 border-t-2 border-slate-200 text-3xs text-slate-600 grid grid-cols-2 gap-8 items-end print-avoid-break">
                <div className="space-y-1">
                  <p className="font-bold text-slate-900">Andreia Bordados Personalizados</p>
                  <p>Agradecemos a preferência e a confiança em nosso trabalho!</p>
                  <p className="text-slate-400">Garantia de acabamento artesanal de alto padrão.</p>
                </div>
                <div className="text-center">
                  <div className="border-b border-slate-500 pb-1 mb-1"></div>
                  <p className="font-bold text-slate-800">Assinatura / Aceite do Cliente</p>
                </div>
              </div>

            </div>

            {/* Rodapé do Modal */}
            <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2 shrink-0 print:hidden">
              <button
                type="button"
                onClick={() => setIsPrintModalOpen(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-white text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs transition"
              >
                <Printer className="h-3.5 w-3.5" /> Imprimir Documento
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
