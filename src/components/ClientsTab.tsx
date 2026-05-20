import React, { useState } from 'react';
import { Client, Order } from '../types';
import { 
  Plus, 
  Search, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  FileText, 
  MessageSquare, 
  ChevronRight, 
  X, 
  Check, 
  Edit3,
  Calendar,
  Layers
} from 'lucide-react';

interface ClientsTabProps {
  clients: Client[];
  orders: Order[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
}

export default function ClientsTab({ clients, orders, onAddClient, onUpdateClient }: ClientsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0] || null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    whatsapp: '',
    email: '',
    address: '',
    cpfCnpj: '',
    observations: ''
  });

  const [formError, setFormError] = useState('');

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.phone.includes(searchTerm) ||
    c.cpfCnpj.includes(searchTerm)
  );

  // Helper to count orders and spent amount for a client
  const getClientStats = (clientId: string) => {
    const clientOrders = orders.filter(o => o.clientId === clientId && o.status !== 'budget');
    const totalSpent = clientOrders.reduce((sum, o) => sum + o.totalValue, 0);
    return {
      count: clientOrders.length,
      totalSpent
    };
  };

  const handleOpenNewForm = () => {
    setEditingClient(null);
    setFormData({
      name: '',
      phone: '',
      whatsapp: '',
      email: '',
      address: '',
      cpfCnpj: '',
      observations: ''
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      whatsapp: client.whatsapp,
      email: client.email,
      address: client.address,
      cpfCnpj: client.cpfCnpj,
      observations: client.observations
    });
    setFormError('');
    setIsFormOpen(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    // Auto populate whatsapp if user types in phone and hasn't customized whatsapp yet
    if (name === 'phone' && !formData.whatsapp) {
      const sanitized = value.replace(/\D/g, '');
      setFormData(prev => ({
        ...prev,
        phone: value,
        whatsapp: sanitized
      }));
    } else if (name === 'whatsapp') {
      const sanitized = value.replace(/\D/g, '');
      setFormData(prev => ({ ...prev, whatsapp: sanitized }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormError('O nome do cliente é obrigatório.');
      return;
    }

    const clientPayload: Client = {
      id: editingClient ? editingClient.id : 'c_' + Date.now(),
      name: formData.name,
      phone: formData.phone,
      whatsapp: formData.whatsapp || formData.phone.replace(/\D/g, ''),
      email: formData.email,
      address: formData.address,
      cpfCnpj: formData.cpfCnpj,
      observations: formData.observations,
      createdAt: editingClient ? editingClient.createdAt : new Date().toISOString().split('T')[0]
    };

    if (editingClient) {
      onUpdateClient(clientPayload);
      if (selectedClient?.id === editingClient.id) {
        setSelectedClient(clientPayload);
      }
    } else {
      onAddClient(clientPayload);
      setSelectedClient(clientPayload);
    }

    setIsFormOpen(false);
    setEditingClient(null);
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

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'budget': return <span className="px-2 py-0.5 text-3xs font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">Orçamento</span>;
      case 'approved': return <span className="px-2 py-0.5 text-3xs font-medium rounded-full bg-blue-50 text-blue-700 border border-blue-200">Aprovado</span>;
      case 'production': return <span className="px-2 py-0.5 text-3xs font-medium rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">Produção</span>;
      case 'embroidery': return <span className="px-2 py-0.5 text-3xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200">Bordando</span>;
      case 'finished': return <span className="px-2 py-0.5 text-3xs font-medium rounded-full bg-teal-50 text-teal-700 border border-teal-200">Pronto</span>;
      case 'delivered': return <span className="px-2 py-0.5 text-3xs font-medium rounded-full bg-gray-50 text-gray-600 border border-gray-200">Entregue</span>;
      default: return null;
    }
  };

  const selectedClientStats = selectedClient ? getClientStats(selectedClient.id) : { count: 0, totalSpent: 0 };
  const selectedClientOrders = selectedClient ? orders.filter(o => o.clientId === selectedClient.id) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="clients_tab">
      
      {/* Coluna Esquerda: Pesquisa & Lista de Clientes */}
      <div className="lg:col-span-1 bg-white border border-gray-100 rounded-2xl p-4 shadow-xs flex flex-col h-[750px]" id="clients_list_column">
        <div className="flex items-center justify-between pb-4 border-b border-gray-50 mb-4 h-12">
          <h3 className="text-base font-bold text-gray-800">Clientes ({clients.length})</h3>
          <button 
            onClick={handleOpenNewForm}
            className="p-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
          >
            <Plus className="h-3.5 w-3.5" /> Novo
          </button>
        </div>

        {/* Input de Busca */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Buscar nome, telefone ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border-gray-100 rounded-xl bg-gray-50/50 focus:border-indigo-400 focus:bg-white focus:outline-hidden focus:ring-0 transition"
          />
        </div>

        {/* Lista de Rolagem */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-sm">
              Nenhum cliente cadastrado com este nome.
            </div>
          ) : (
            filteredClients.map((client) => {
              const active = selectedClient?.id === client.id;
              const stats = getClientStats(client.id);
              
              return (
                <div 
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`p-3 rounded-xl border text-left cursor-pointer transition flex justify-between items-center ${
                    active 
                      ? 'border-indigo-600 bg-indigo-50/35 shadow-xs' 
                      : 'border-slate-55 bg-white hover:border-indigo-100 hover:bg-slate-50/30'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold text-gray-800 truncate">{client.name}</h4>
                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-mono">
                      <Phone className="h-3 w-3 text-gray-400" /> {client.phone}
                    </p>
                    <div className="flex gap-2 items-center text-3xs text-indigo-700 mt-1.5 font-medium">
                      <span className="bg-indigo-50 px-1.5 py-0.5 rounded-sm">{stats.count} pedidos</span>
                      <span>Total: {formatCurrency(stats.totalSpent)}</span>
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition ${active ? 'text-indigo-600 translate-x-0.5' : 'text-gray-300'}`} />
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Coluna Direita: Ficha de Detalhes ou Formulário */}
      <div className="lg:col-span-2 flex flex-col h-[750px]" id="client_workspace">
        
        {isFormOpen ? (
          /* FORMULÁRIO DE CADASTRO/EDIÇÃO */
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col h-full overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-gray-50 mb-6">
              <h3 className="text-base font-bold text-gray-800">
                {editingClient ? `Editar Cliente: ${editingClient.name}` : 'Cadastrar Novo Cliente'}
              </h3>
              <button 
                onClick={() => setIsFormOpen(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 flex-1">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs">
                  {formError}
                </div>
              )}

              {/* Nome */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Nome Completo *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Maria Eduarda Silva"
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-hidden"
                  required
                />
              </div>

              {/* Grid Telefone & WhatsApp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 font-sans">Telefone de Contato</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">WhatsApp (Apenas números, DDI+DDD)</label>
                  <input 
                    type="text" 
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="Ex: 5511987654321"
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-hidden"
                  />
                  <span className="text-3xs text-gray-400 block mt-0.5">Preenchido automaticamente ao digitar o telefone</span>
                </div>
              </div>

              {/* Grid E-mail & CPF/CNPJ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">E-mail</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Ex: maria.silva@email.com"
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">CPF ou CNPJ</label>
                  <input 
                    type="text" 
                    name="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={handleInputChange}
                    placeholder="Ex: 123.456.789-00 ou 12.345/0001-00"
                    className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Endereço Completo para Entregas</label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Rua, número, complemento, bairro, cidade - UF"
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-hidden"
                />
              </div>

              {/* Observações */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Observações Especiais do Ateliê</label>
                <textarea 
                  name="observations"
                  rows={3}
                  value={formData.observations}
                  onChange={handleInputChange}
                  placeholder="Gosta de acabamento com linho duro? Prefere tecidos em algodão egípcio? Escreva anotações gerais aqui."
                  className="w-full p-2.5 text-sm border border-gray-200 rounded-lg focus:border-indigo-400 focus:outline-hidden resize-none"
                />
              </div>

              {/* Botões de Ação */}
              <div className="pt-4 border-t border-gray-50 flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-200 hover:bg-gray-50 text-gray-600 text-sm font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-lg flex items-center gap-1 cursor-pointer"
                >
                  <Check className="h-4 w-4" /> Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        ) : selectedClient ? (
          /* DETALHES DO CLIENTE SELECIONADO */
          <div className="bg-white border border-gray-100 rounded-2xl p-6 shadow-xs flex flex-col h-full overflow-hidden" id="client_details_sheet">
            
            {/* Header Ficha */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-gray-50">
              <div className="flex items-center space-x-3.5">
                <div className="h-12 w-12 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold text-lg">
                  {selectedClient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-800">{selectedClient.name}</h3>
                  <p className="text-2xs text-gray-400">Cliente desde: {formatDatePT(selectedClient.createdAt)}</p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => handleOpenEditForm(selectedClient)}
                  className="px-3.5 py-1.5 border border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="h-3 w-3" /> Editar Cadastro
                </button>
                {selectedClient.whatsapp && (
                  <a 
                    href={`https://wa.me/${selectedClient.whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    referrerPolicy="no-referrer"
                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-100 text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                  >
                    <MessageSquare className="h-3 w-3 text-emerald-600" /> Chamar WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Informações de Contato e Ficha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-5 border-b border-gray-50 text-left">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-3xs font-bold text-gray-400 uppercase tracking-wide">Celular/Contato</p>
                    <p className="text-sm font-semibold text-gray-700">{selectedClient.phone || 'Não informado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-3xs font-bold text-gray-400 uppercase tracking-wide">E-mail</p>
                    <p className="text-sm font-medium text-gray-700 truncate max-w-xs">{selectedClient.email || 'Não informado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <FileText className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-3xs font-bold text-gray-400 uppercase tracking-wide">CPF / CNPJ</p>
                    <p className="text-sm font-medium text-gray-700 font-mono">{selectedClient.cpfCnpj || 'Não cadastrado'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 text-gray-400 shrink-0" />
                  <div>
                    <p className="text-3xs font-bold text-gray-400 uppercase tracking-wide">Endereço de Entrega</p>
                    <p className="text-sm font-medium text-gray-650 leading-relaxed text-slate-650">{selectedClient.address || 'Não cadastrado'}</p>
                  </div>
                </div>

                <div className="p-3 bg-gray-50/50 rounded-xl">
                  <p className="text-3xs font-bold text-gray-400 uppercase tracking-wide mb-1">Anotações do Ateliê</p>
                  <p className="text-xs text-gray-600 leading-normal italic">
                    {selectedClient.observations ? `"${selectedClient.observations}"` : 'Sem observações cadastradas para este cliente.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Histórico Comercial / Pedidos */}
            <div className="flex-1 overflow-hidden flex flex-col pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-indigo-500" /> Histórico de Pedidos ({selectedClientOrders.length})
                </h4>
                
                {/* Mini Box Financeiro do Cliente */}
                <div className="text-right text-xs">
                  <span className="text-gray-400">Total Investido: </span>
                  <span className="font-bold text-emerald-600">{formatCurrency(selectedClientStats.totalSpent)}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                {selectedClientOrders.length === 0 ? (
                  <div className="py-20 text-center text-gray-400 text-sm italic">
                    Nenhum pedido feito por este cliente ainda.
                  </div>
                ) : (
                  selectedClientOrders.map((order) => {
                    return (
                      <div 
                        key={order.id} 
                        className="p-3 border border-gray-100 rounded-xl bg-slate-50/30 flex items-center justify-between text-left hover:border-indigo-150 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-700">#{order.id}</span>
                            <span className="text-xs font-bold text-gray-700">{order.product}</span>
                          </div>
                          <div className="flex items-center gap-3 text-2xs text-gray-500">
                            <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3 text-gray-400" /> Pedido: {formatDatePT(order.date)}</span>
                            <span>• un: {order.quantity}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="mb-1">{getOrderStatusBadge(order.status)}</div>
                          <span className="text-xs font-extrabold text-gray-800">{formatCurrency(order.totalValue)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full text-gray-400 shadow-xs">
            <User className="h-16 w-16 text-gray-200 mb-2" />
            <p className="text-sm">Selecione ou adicione um cliente para ver sua ficha detalhada e o histórico completo de bordados encomendados.</p>
          </div>
        )}

      </div>

    </div>
  );
}
