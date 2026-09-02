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
  Layers,
  Trash2,
  AlertTriangle
} from 'lucide-react';

interface ClientsTabProps {
  clients: Client[];
  orders: Order[];
  onAddClient: (client: Client) => void;
  onUpdateClient: (client: Client) => void;
  onDeleteClient: (id: string) => void;
}

export default function ClientsTab({ clients, orders, onAddClient, onUpdateClient, onDeleteClient }: ClientsTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(clients[0] || null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);

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

  const handleOpenEditForm = (client: Client, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
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

  const handlePromptDelete = (client: Client, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setClientToDelete(client);
  };

  const handleConfirmDelete = () => {
    if (!clientToDelete) return;
    
    const idToDelete = clientToDelete.id;
    onDeleteClient(idToDelete);
    
    // Adjust selected client if the deleted one was selected
    if (selectedClient?.id === idToDelete) {
      const remaining = clients.filter(c => c.id !== idToDelete);
      setSelectedClient(remaining.length > 0 ? remaining[0] : null);
    }
    
    setClientToDelete(null);
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
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative" id="clients_tab">
      
      {/* MODAL DE CADASTRO / EDIÇÃO DE CLIENTE */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto" id="client_form_modal">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl border border-indigo-100">
                  {editingClient ? <Edit3 className="h-5 w-5" /> : <Plus className="h-5 w-5" />}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {editingClient ? `Editar Cliente: ${editingClient.name}` : 'Cadastrar Novo Cliente'}
                  </h3>
                  <p className="text-2xs text-slate-500">
                    {editingClient ? 'Atualize as informações cadastrais e de contato do cliente' : 'Preencha os dados cadastrais, contato e endereço de entrega'}
                  </p>
                </div>
              </div>
              <button 
                type="button"
                onClick={() => {
                  setIsFormOpen(false);
                  setEditingClient(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl cursor-pointer transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium">
                  {formError}
                </div>
              )}

              {/* Nome */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Nome Completo *</label>
                <input 
                  type="text" 
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Ex: Maria Eduarda Silva"
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition"
                  required
                  autoFocus
                />
              </div>

              {/* Grid Telefone & WhatsApp */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 font-sans">Telefone de Contato</label>
                  <input 
                    type="text" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">WhatsApp (DDD + Número)</label>
                  <input 
                    type="text" 
                    name="whatsapp"
                    value={formData.whatsapp}
                    onChange={handleInputChange}
                    placeholder="Ex: 11987654321"
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition font-mono"
                  />
                  <span className="text-3xs text-slate-400 block">Preenchido automaticamente ao digitar o telefone</span>
                </div>
              </div>

              {/* Grid E-mail & CPF/CNPJ */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">E-mail</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Ex: maria.silva@email.com"
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">CPF ou CNPJ</label>
                  <input 
                    type="text" 
                    name="cpfCnpj"
                    value={formData.cpfCnpj}
                    onChange={handleInputChange}
                    placeholder="Ex: 123.456.789-00 ou 12.345.678/0001-00"
                    className="w-full p-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition font-mono"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Endereço Completo para Entregas</label>
                <input 
                  type="text" 
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="Rua, número, complemento, bairro, cidade - UF"
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-hidden transition"
                />
              </div>

              {/* Observações */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Observações Especiais do Ateliê</label>
                <textarea 
                  name="observations"
                  rows={3}
                  value={formData.observations}
                  onChange={handleInputChange}
                  placeholder="Ex: Prefere tecidos em algodão puro, entrega para presente, sempre enviar fotos do teste."
                  className="w-full p-2.5 text-sm border border-slate-200 rounded-xl bg-slate-50/50 focus:bg-white focus:border-indigo-500 focus:outline-hidden resize-none transition"
                />
              </div>

              {/* Rodapé / Botões */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                {editingClient ? (
                  <button
                    type="button"
                    onClick={() => {
                      const client = editingClient;
                      setIsFormOpen(false);
                      setEditingClient(null);
                      handlePromptDelete(client);
                    }}
                    className="px-3.5 py-2 text-rose-600 hover:bg-rose-50 border border-rose-200 hover:border-rose-300 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> Excluir Cliente
                  </button>
                ) : (
                  <div></div>
                )}
                
                <div className="flex items-center gap-3">
                  <button 
                    type="button"
                    onClick={() => {
                      setIsFormOpen(false);
                      setEditingClient(null);
                    }}
                    className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl cursor-pointer transition"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs shadow-indigo-200 transition"
                  >
                    <Check className="h-4 w-4" /> {editingClient ? 'Atualizar Cliente' : 'Salvar Cliente'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO */}
      {clientToDelete && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" id="delete_client_modal">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900">Excluir Cliente</h4>
                <p className="text-2xs text-slate-500">Ação irreversível de remoção</p>
              </div>
            </div>

            <p className="text-sm text-slate-700 mt-2">
              Tem certeza que deseja excluir o cadastro de <strong className="text-slate-900 font-bold">{clientToDelete.name}</strong>?
            </p>

            {getClientStats(clientToDelete.id).count > 0 && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  ⚠️ Atenção: Histórico Vinculado
                </p>
                <p className="text-2xs text-amber-700 leading-relaxed">
                  Este cliente possui <strong>{getClientStats(clientToDelete.id).count} pedido(s)</strong> registrados. Os pedidos continuarão no histórico geral do ateliê, mas o cliente será removido desta lista.
                </p>
              </div>
            )}

            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setClientToDelete(null)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="h-3.5 w-3.5" /> Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Coluna Esquerda: Pesquisa & Lista de Clientes */}
      <div className="lg:col-span-1 bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col h-[750px]" id="clients_list_column">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 h-12">
          <h3 className="text-base font-bold text-slate-900">Clientes ({clients.length})</h3>
          <button 
            type="button"
            onClick={handleOpenNewForm}
            className="p-1 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition flex items-center gap-1 cursor-pointer shadow-xs shadow-indigo-200"
          >
            <Plus className="h-3.5 w-3.5" /> Novo
          </button>
        </div>

        {/* Input de Busca */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar nome, telefone ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-xl bg-slate-50/70 focus:border-indigo-500 focus:bg-white focus:outline-hidden transition"
          />
        </div>

        {/* Lista de Rolagem */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin">
          {filteredClients.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
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
                  className={`p-3 rounded-xl border text-left cursor-pointer transition flex justify-between items-center group ${
                    active 
                      ? 'border-indigo-500 bg-indigo-50/40 shadow-xs ring-1 ring-indigo-500/20' 
                      : 'border-slate-200 bg-white hover:border-indigo-200 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="min-w-0 flex-1 pr-2">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">{client.name}</h4>
                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-mono">
                      <Phone className="h-3 w-3 text-slate-400" /> {client.phone || 'Sem telefone'}
                    </p>
                    <div className="flex gap-2 items-center text-3xs text-indigo-700 mt-1.5 font-medium">
                      <span className="bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-sm">{stats.count} pedidos</span>
                      <span>Total: {formatCurrency(stats.totalSpent)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    {/* Botão rápido de edição na lista */}
                    <button
                      type="button"
                      title="Editar Cliente"
                      onClick={(e) => handleOpenEditForm(client, e)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition cursor-pointer"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    {/* Botão rápido de exclusão na lista */}
                    <button
                      type="button"
                      title="Excluir Cliente"
                      onClick={(e) => handlePromptDelete(client, e)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                    <ChevronRight className={`h-4 w-4 ml-0.5 transition ${active ? 'text-indigo-600 translate-x-0.5' : 'text-slate-300'}`} />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Coluna Direita: Ficha de Detalhes */}
      <div className="lg:col-span-2 flex flex-col h-[750px]" id="client_workspace">
        {selectedClient ? (
          /* DETALHES DO CLIENTE SELECIONADO */
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col h-full overflow-hidden" id="client_details_sheet">
            
            {/* Header Ficha */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-center space-x-3.5">
                <div className="h-12 w-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-700 font-bold text-lg shadow-2xs">
                  {selectedClient.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">{selectedClient.name}</h3>
                  <p className="text-2xs text-slate-400">Cliente desde: {formatDatePT(selectedClient.createdAt)}</p>
                </div>
              </div>
              
              {/* Botões de Ação do Cliente */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={(e) => handleOpenEditForm(selectedClient, e)}
                  className="px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Edit3 className="h-3.5 w-3.5 text-indigo-600" /> Editar Cadastro
                </button>

                <button
                  type="button"
                  onClick={(e) => handlePromptDelete(selectedClient, e)}
                  className="px-3 py-1.5 bg-rose-50/50 hover:bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  title="Excluir este cliente"
                >
                  <Trash2 className="h-3.5 w-3.5 text-rose-600" /> Excluir
                </button>

                {selectedClient.whatsapp && (
                  <a 
                    href={`https://wa.me/${selectedClient.whatsapp.replace(/\D/g, '')}`} 
                    target="_blank" 
                    referrerPolicy="no-referrer"
                    className="px-3.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <MessageSquare className="h-3.5 w-3.5 text-emerald-600" /> WhatsApp
                  </a>
                )}
              </div>
            </div>

            {/* Informações de Contato e Ficha */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-5 border-b border-slate-100 text-left">
              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <Phone className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-3xs font-bold text-slate-400 uppercase tracking-wide">Celular/Contato</p>
                    <p className="text-sm font-semibold text-slate-800">{selectedClient.phone || 'Não informado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <Mail className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-3xs font-bold text-slate-400 uppercase tracking-wide">E-mail</p>
                    <p className="text-sm font-medium text-slate-800 truncate max-w-xs">{selectedClient.email || 'Não informado'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <FileText className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-3xs font-bold text-slate-400 uppercase tracking-wide">CPF / CNPJ</p>
                    <p className="text-sm font-medium text-slate-800 font-mono">{selectedClient.cpfCnpj || 'Não cadastrado'}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <MapPin className="h-4 w-4 mt-0.5 text-slate-400 shrink-0" />
                  <div>
                    <p className="text-3xs font-bold text-slate-400 uppercase tracking-wide">Endereço de Entrega</p>
                    <p className="text-sm font-medium text-slate-800 leading-relaxed">{selectedClient.address || 'Não cadastrado'}</p>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl">
                  <p className="text-3xs font-bold text-slate-400 uppercase tracking-wide mb-1">Anotações do Ateliê</p>
                  <p className="text-xs text-slate-700 leading-normal italic">
                    {selectedClient.observations ? `"${selectedClient.observations}"` : 'Sem observações cadastradas para este cliente.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Histórico Comercial / Pedidos */}
            <div className="flex-1 overflow-hidden flex flex-col pt-4">
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-indigo-500" /> Histórico de Pedidos ({selectedClientOrders.length})
                </h4>
                
                {/* Mini Box Financeiro do Cliente */}
                <div className="text-right text-xs">
                  <span className="text-slate-400">Total Investido: </span>
                  <span className="font-bold text-emerald-600">{formatCurrency(selectedClientStats.totalSpent)}</span>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 scrollbar-thin">
                {selectedClientOrders.length === 0 ? (
                  <div className="py-20 text-center text-slate-400 text-sm italic">
                    Nenhum pedido feito por este cliente ainda.
                  </div>
                ) : (
                  selectedClientOrders.map((order) => {
                    return (
                      <div 
                        key={order.id} 
                        className="p-3 border border-slate-200 rounded-xl bg-slate-50/40 flex items-center justify-between text-left hover:border-indigo-200 transition"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-indigo-600">#{order.id}</span>
                            <span className="text-xs font-bold text-slate-800">{order.product}</span>
                          </div>
                          <div className="flex items-center gap-3 text-2xs text-slate-500">
                            <span className="flex items-center gap-0.5"><Calendar className="h-3 w-3 text-slate-400" /> Pedido: {formatDatePT(order.date)}</span>
                            <span>• un: {order.quantity}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="mb-1">{getOrderStatusBadge(order.status)}</div>
                          <span className="text-xs font-extrabold text-slate-900">{formatCurrency(order.totalValue)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center flex flex-col items-center justify-center h-full text-slate-400 shadow-xs">
            <User className="h-16 w-16 text-slate-200 mb-2" />
            <p className="text-sm">Selecione ou adicione um cliente para ver sua ficha detalhada e o histórico completo de bordados encomendados.</p>
          </div>
        )}

      </div>

    </div>
  );
}
