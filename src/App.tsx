import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Calculator, 
  DollarSign, 
  Package, 
  Calendar, 
  FolderOpen, 
  BarChart, 
  Scissors, 
  Sparkles,
  Menu,
  X,
  Phone,
  Clock,
  Heart
} from 'lucide-react';

// Types
import { Client, Order, Expense, InventoryItem, ArtMatrix } from './types';

// Default Data Presets
import { 
  defaultClients, 
  defaultOrders, 
  defaultExpenses, 
  defaultInventory, 
  defaultMatrices 
} from './defaultData';

// Tab Components
import DashboardTab from './components/DashboardTab';
import ClientsTab from './components/ClientsTab';
import OrdersTab from './components/OrdersTab';
import CalculatorTab from './components/CalculatorTab';
import ExpensesTab from './components/ExpensesTab';
import StockTab from './components/StockTab';
import AgendaTab from './components/AgendaTab';
import GalleryTab from './components/GalleryTab';
import ReportsTab from './components/ReportsTab';

export default function App() {
  const todayDate = "2026-05-20"; // Standard simulated local time context from metadata

  // --- LOCAL PERSISTENCE STORAGE CONTROLLERS ---
  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem('atelie_clients');
    return saved ? JSON.parse(saved) : defaultClients;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('atelie_orders');
    return saved ? JSON.parse(saved) : defaultOrders;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem('atelie_expenses');
    return saved ? JSON.parse(saved) : defaultExpenses;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem('atelie_inventory');
    return saved ? JSON.parse(saved) : defaultInventory;
  });

  const [matrices, setMatrices] = useState<ArtMatrix[]>(() => {
    const saved = localStorage.getItem('atelie_matrices');
    return saved ? JSON.parse(saved) : defaultMatrices;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedOrderLink, setSelectedOrderLink] = useState<Order | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Sync state to LocalStorage
  useEffect(() => {
    localStorage.setItem('atelie_clients', JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem('atelie_orders', JSON.stringify(orders));
  }, [orders]);

  useEffect(() => {
    localStorage.setItem('atelie_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('atelie_inventory', JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem('atelie_matrices', JSON.stringify(matrices));
  }, [matrices]);

  // --- HANDLERS CONTROLLERS ---
  const handleAddClient = (client: Client) => {
    setClients([client, ...clients]);
  };

  const handleUpdateClient = (updated: Client) => {
    setClients(clients.map(c => c.id === updated.id ? updated : c));
  };

  const handleAddOrder = (order: Order) => {
    setOrders([order, ...orders]);
  };

  const handleUpdateOrder = (updatedOrder: Order) => {
    setOrders(orders.map(o => o.id === updatedOrder.id ? updatedOrder : o));
  };

  const handleDeleteOrder = (id: number) => {
    setOrders(orders.filter(o => o.id !== id));
  };

  const handleAddExpense = (expense: Expense) => {
    setExpenses([expense, ...expenses]);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Deseja realmente remover esta despesa lançada?')) {
      setExpenses(expenses.filter(e => e.id !== id));
    }
  };

  const handleAddStockItem = (item: InventoryItem) => {
    setInventory([item, ...inventory]);
  };

  const handleUpdateStockQty = (id: string, newQty: number) => {
    setInventory(inventory.map(item => {
      if (item.id === id) {
        return {
          ...item,
          quantity: newQty,
          lastUpdated: todayDate
        };
      }
      return item;
    }));
  };

  const handleAddMatrix = (matrix: ArtMatrix) => {
    setMatrices([matrix, ...matrices]);
  };

  // Helper trigger to focus from dashboard list to order details sheet
  const handleNavigateToOrderFromDashboard = (order: Order) => {
    setSelectedOrderLink(order);
    setActiveTab('orders');
  };

  const handleClearSelectedOrderLink = () => {
    setSelectedOrderLink(null);
  };

  // Sidebar Tabs Config
  const navigationTabs = [
    { id: 'dashboard', label: 'Painel Geral', icon: LayoutDashboard },
    { id: 'clients', label: 'Clientes', icon: Users },
    { id: 'orders', label: 'Fila de Pedidos', icon: ShoppingBag },
    { id: 'calculator', label: 'Calculadora de Preço', icon: Calculator },
    { id: 'expenses', label: 'Controle de Despesas', icon: DollarSign },
    { id: 'stock', label: 'Controle de Estoque', icon: Package },
    { id: 'agenda', label: 'Agenda & Prazos', icon: Calendar },
    { id: 'gallery', label: 'Artes & Matrizes', icon: FolderOpen },
    { id: 'reports', label: 'Relatórios', icon: BarChart },
  ];

  const activeTabTitle = navigationTabs.find(t => t.id === activeTab)?.label || 'Ateliê de Bordados';

  return (
    <div className="flex bg-[#0f172a] min-h-screen text-slate-200 font-sans" id="atelie_root">
      
      {/* 1. SIDEBAR DE NAVIGACAO - COMPUTADOR */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#1e293b] border-r border-slate-700 text-white shrink-0 sticky top-0 h-screen select-none" id="desktop_sidebar">
        
        {/* Logo Brand */}
        <div className="p-5 border-b border-slate-700 flex items-center gap-2.5">
          <div className="p-1 px-2.5 bg-indigo-650 bg-indigo-600 rounded-lg flex items-center justify-center font-extrabold text-white tracking-wider text-sm">
            🧶 M
          </div>
          <div className="text-left leading-tight">
            <h1 className="text-sm font-black tracking-wide text-white">BordadoPro</h1>
            <span className="text-3xs font-semibold text-slate-400">Ambiente de Operações</span>
          </div>
        </div>

        {/* Links do Menu */}
        <nav className="flex-1 p-3.5 space-y-1.5 overflow-y-auto">
          {navigationTabs.map(tab => {
            const IconComponent = tab.icon;
            const active = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-200 cursor-pointer ${
                  active 
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <IconComponent className={`h-4.5 w-4.5 ${active ? 'text-white' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Rodapé do Ateliê */}
        <div className="p-4 border-t border-slate-800 text-center text-4xs text-slate-500 space-y-1">
          <p className="font-bold flex items-center justify-center gap-1">
            <Heart className="h-3 w-3 text-indigo-500 fill-indigo-500" /> BordadoGestão v2.5
          </p>
          <p>Operando em celular e computador</p>
        </div>
      </aside>

      {/* 2. ÁREA DE TRABALHO GERAL (MAIN LAYOUT) */}
      <div className="flex-1 flex flex-col min-w-0" id="main_working_canvas">
        
        {/* TOPBAR HEADER */}
        <header className="bg-[#1e293b]/50 backdrop-blur-md border-b border-slate-700 h-16 px-4 flex items-center justify-between sticky top-0 z-40 text-white" id="topbar_header">
          
          <div className="flex items-center gap-2">
            {/* Gatilho Menu Mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-300 hover:bg-slate-800 rounded-xl cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <h2 className="text-sm font-black text-white font-sans tracking-tight">
              {activeTabTitle}
            </h2>
          </div>

          {/* Data Simulação & Ateliê Status */}
          <div className="flex items-center gap-4 text-xs font-sans">
            <div className="hidden sm:flex items-center gap-2 text-slate-300 bg-slate-800 p-1.5 px-3 rounded-lg border border-slate-700 font-mono">
              <Clock className="h-3.5 w-3.5 text-indigo-400" />
              <span>Data de Referência: 20/05/2026</span>
            </div>

            <div className="flex items-center gap-1.5 text-2xs font-extrabold text-indigo-300 bg-indigo-950/50 border border-indigo-750 border-indigo-700/50 p-1 py-1 px-2.5 rounded-full select-none" id="atelier_active_badge">
              <span className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse shrink-0"></span>
              Ateliê Operando
            </div>
          </div>
        </header>

        {/* MOBILE SIDEBAR DRAW (overlay) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 lg:hidden flex" id="mobile_navbar_drawer">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="w-64 bg-[#1e293b] border-r border-slate-700 text-white h-full relative p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-4 font-sans">
                    <span className="font-extrabold text-sm text-indigo-400">BordadoPro</span>
                    <button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 text-slate-305 hover:text-white rounded-md cursor-pointer"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>

                  <nav className="space-y-1">
                    {navigationTabs.map(tab => {
                      const IconComponent = tab.icon;
                      const active = activeTab === tab.id;
                      
                      return (
                        <button
                          key={tab.id}
                          onClick={() => {
                            setActiveTab(tab.id);
                            setIsMobileMenuOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                            active ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'
                          }`}
                        >
                          <IconComponent className="h-4.5 w-4.5" />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="text-center text-4xs text-slate-500 py-3 border-t border-slate-800">
                  Gestão integrada de Ateliê de Bordados
                </div>
              </motion.div>
              
              {/* Tap backdrop to close */}
              <div className="flex-1 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)} />
            </div>
          )}
        </AnimatePresence>

        {/* TAB PORTÁTIL CONTAINER */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto max-w-7xl mx-auto w-full" id="tab_active_workspace">
          
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.18 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <DashboardTab 
                  clients={clients}
                  orders={orders}
                  expenses={expenses}
                  inventory={inventory}
                  onNavigateToTab={(id) => setActiveTab(id)}
                  onSelectOrder={handleNavigateToOrderFromDashboard}
                  todayDate={todayDate}
                />
              )}

              {activeTab === 'clients' && (
                <ClientsTab 
                  clients={clients}
                  orders={orders}
                  onAddClient={handleAddClient}
                  onUpdateClient={handleUpdateClient}
                />
              )}

              {activeTab === 'orders' && (
                <OrdersTab 
                  orders={orders}
                  clients={clients}
                  selectedOrderFromDashboard={selectedOrderLink}
                  onClearSelectedOrder={handleClearSelectedOrderLink}
                  onAddOrder={handleAddOrder}
                  onUpdateOrder={handleUpdateOrder}
                  onDeleteOrder={handleDeleteOrder}
                  todayDate={todayDate}
                />
              )}

              {activeTab === 'calculator' && (
                <CalculatorTab 
                  clients={clients}
                  onAddOrder={handleAddOrder}
                  onNavigateToTab={(id) => setActiveTab(id)}
                />
              )}

              {activeTab === 'expenses' && (
                <ExpensesTab 
                  expenses={expenses}
                  orders={orders}
                  onAddExpense={handleAddExpense}
                  onDeleteExpense={handleDeleteExpense}
                  todayDate={todayDate}
                />
              )}

              {activeTab === 'stock' && (
                <StockTab 
                  inventory={inventory}
                  onAddStockItem={handleAddStockItem}
                  onUpdateStockQty={handleUpdateStockQty}
                />
              )}

              {activeTab === 'agenda' && (
                <AgendaTab 
                  orders={orders}
                  onUpdateOrder={handleUpdateOrder}
                  todayDate={todayDate}
                />
              )}

              {activeTab === 'gallery' && (
                <GalleryTab 
                  matrices={matrices}
                  onAddMatrix={handleAddMatrix}
                />
              )}

              {activeTab === 'reports' && (
                <ReportsTab 
                  clients={clients}
                  orders={orders}
                  expenses={expenses}
                />
              )}
            </motion.div>
          </AnimatePresence>

        </main>
      </div>

    </div>
  );
}
