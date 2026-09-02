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
  Heart,
  Cloud,
  CheckCircle,
  Database
} from 'lucide-react';
import { collection, onSnapshot } from 'firebase/firestore';

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

// Firestore DB Service
import {
  db,
  COLLECTIONS,
  seedInitialDataIfEmpty,
  saveClient,
  removeClient,
  saveOrder,
  removeOrder,
  saveExpense,
  removeExpense,
  saveInventoryItem,
  removeInventoryItem,
  saveMatrix,
  removeMatrix
} from './services/firebaseService';

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

import { ANDREIA_LOGO_URL } from './assets/logo';

export default function App() {
  const todayDate = "2026-05-20"; // Standard simulated local time context from metadata

  // --- PERSISTÊNCIA EM BANCO DE DADOS FIRESTORE & LOCAL BACKUP ---
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

  const [isCloudSynced, setIsCloudSynced] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedOrderLink, setSelectedOrderLink] = useState<Order | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Inicialização e sincronização em tempo real com Firestore
  useEffect(() => {
    // 1. Inicializa o banco se estiver vazio
    seedInitialDataIfEmpty();

    // 2. Assinantes em tempo real (Realtime Listeners)
    const unsubClients = onSnapshot(collection(db, COLLECTIONS.CLIENTS), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(doc => doc.data() as Client);
        setClients(list);
        localStorage.setItem('atelie_clients', JSON.stringify(list));
      }
      setIsCloudSynced(true);
    }, (err) => {
      console.error('Erro na sincronização de clientes:', err);
    });

    const unsubOrders = onSnapshot(collection(db, COLLECTIONS.ORDERS), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(doc => doc.data() as Order);
        setOrders(list);
        localStorage.setItem('atelie_orders', JSON.stringify(list));
      }
      setIsCloudSynced(true);
    }, (err) => {
      console.error('Erro na sincronização de pedidos:', err);
    });

    const unsubExpenses = onSnapshot(collection(db, COLLECTIONS.EXPENSES), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(doc => doc.data() as Expense);
        setExpenses(list);
        localStorage.setItem('atelie_expenses', JSON.stringify(list));
      }
      setIsCloudSynced(true);
    }, (err) => {
      console.error('Erro na sincronização de despesas:', err);
    });

    const unsubInventory = onSnapshot(collection(db, COLLECTIONS.INVENTORY), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(doc => doc.data() as InventoryItem);
        setInventory(list);
        localStorage.setItem('atelie_inventory', JSON.stringify(list));
      }
      setIsCloudSynced(true);
    }, (err) => {
      console.error('Erro na sincronização de estoque:', err);
    });

    const unsubMatrices = onSnapshot(collection(db, COLLECTIONS.MATRICES), (snapshot) => {
      if (!snapshot.empty) {
        const list = snapshot.docs.map(doc => doc.data() as ArtMatrix);
        setMatrices(list);
        localStorage.setItem('atelie_matrices', JSON.stringify(list));
      }
      setIsCloudSynced(true);
    }, (err) => {
      console.error('Erro na sincronização de matrizes:', err);
    });

    return () => {
      unsubClients();
      unsubOrders();
      unsubExpenses();
      unsubInventory();
      unsubMatrices();
    };
  }, []);

  // --- HANDLERS COM GRAVAÇÃO DIRETA NO BANCO DE DADOS ---
  const handleAddClient = async (client: Client) => {
    setIsCloudSynced(false);
    setClients(prev => [client, ...prev]);
    try {
      await saveClient(client);
      setIsCloudSynced(true);
    } catch (e) {
      console.error('Erro ao salvar cliente no banco:', e);
    }
  };

  const handleUpdateClient = async (updated: Client) => {
    setIsCloudSynced(false);
    setClients(prev => prev.map(c => c.id === updated.id ? updated : c));
    try {
      await saveClient(updated);
      setIsCloudSynced(true);
    } catch (e) {
      console.error('Erro ao atualizar cliente no banco:', e);
    }
  };

  const handleDeleteClient = async (id: string) => {
    setIsCloudSynced(false);
    setClients(prev => prev.filter(c => c.id !== id));
    try {
      await removeClient(id);
      setIsCloudSynced(true);
    } catch (e) {
      console.error('Erro ao remover cliente no banco:', e);
    }
  };

  const handleAddOrder = async (order: Order) => {
    setIsCloudSynced(false);
    setOrders(prev => [order, ...prev]);
    try {
      await saveOrder(order);
      setIsCloudSynced(true);
    } catch (e) {
      console.error('Erro ao salvar pedido no banco:', e);
    }
  };

  const handleUpdateOrder = async (updatedOrder: Order) => {
    setIsCloudSynced(false);
    setOrders(prev => prev.map(o => o.id === updatedOrder.id ? updatedOrder : o));
    try {
      await saveOrder(updatedOrder);
      setIsCloudSynced(true);
    } catch (e) {
      console.error('Erro ao atualizar pedido no banco:', e);
    }
  };

  const handleDeleteOrder = async (id: number) => {
    setIsCloudSynced(false);
    setOrders(prev => prev.filter(o => o.id !== id));
    try {
      await removeOrder(id);
      setIsCloudSynced(true);
    } catch (e) {
      console.error('Erro ao excluir pedido no banco:', e);
    }
  };

  const handleAddExpense = async (expense: Expense) => {
    setIsCloudSynced(false);
    setExpenses(prev => [expense, ...prev]);
    try {
      await saveExpense(expense);
      setIsCloudSynced(true);
    } catch (e) {
      console.error('Erro ao salvar despesa no banco:', e);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (confirm('Deseja realmente remover esta despesa lançada?')) {
      setIsCloudSynced(false);
      setExpenses(prev => prev.filter(e => e.id !== id));
      try {
        await removeExpense(id);
        setIsCloudSynced(true);
      } catch (e) {
        console.error('Erro ao excluir despesa no banco:', e);
      }
    }
  };

  const handleAddStockItem = async (item: InventoryItem) => {
    setIsCloudSynced(false);
    setInventory(prev => [item, ...prev]);
    try {
      await saveInventoryItem(item);
      setIsCloudSynced(true);
    } catch (e) {
      console.error('Erro ao adicionar item de estoque no banco:', e);
    }
  };

  const handleUpdateStockQty = async (id: string, newQty: number) => {
    setIsCloudSynced(false);
    const existing = inventory.find(item => item.id === id);
    if (existing) {
      const updatedItem = {
        ...existing,
        quantity: newQty,
        lastUpdated: todayDate
      };
      setInventory(prev => prev.map(item => item.id === id ? updatedItem : item));
      try {
        await saveInventoryItem(updatedItem);
        setIsCloudSynced(true);
      } catch (e) {
        console.error('Erro ao atualizar quantidade no estoque:', e);
      }
    }
  };

  const handleAddMatrix = async (matrix: ArtMatrix) => {
    setIsCloudSynced(false);
    setMatrices(prev => [matrix, ...prev]);
    try {
      await saveMatrix(matrix);
      setIsCloudSynced(true);
    } catch (e) {
      console.error('Erro ao salvar matriz no banco:', e);
    }
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

  const activeTabTitle = navigationTabs.find(t => t.id === activeTab)?.label || 'Andreia Bordados';

  return (
    <div className="flex bg-slate-50 min-h-screen text-slate-800 font-sans" id="atelie_root">
      
      {/* 1. SIDEBAR DE NAVEGAÇÃO - COMPUTADOR */}
      <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-200 text-slate-700 shrink-0 sticky top-0 h-screen select-none shadow-xs" id="desktop_sidebar">
        
        {/* Logo Brand */}
        <div className="p-4 border-b border-slate-100 flex items-center gap-3">
          <div className="relative shrink-0">
            <img 
              src={ANDREIA_LOGO_URL} 
              alt="Andreia Bordados" 
              className="h-11 w-11 rounded-full object-cover border-2 border-rose-100 shadow-xs ring-2 ring-indigo-50"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="text-left leading-tight min-w-0">
            <h1 className="text-sm font-black tracking-tight text-slate-900 truncate">Andreia Bordados</h1>
            <span className="text-3xs font-semibold text-rose-700 block">Bordados Personalizados</span>
          </div>
        </div>

        {/* Links do Menu */}
        <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
          {navigationTabs.map(tab => {
            const IconComponent = tab.icon;
            const active = activeTab === tab.id;
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition duration-150 cursor-pointer ${
                  active 
                    ? 'bg-indigo-50 text-indigo-700 shadow-xs border border-indigo-100/80' 
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                }`}
              >
                <IconComponent className={`h-4.5 w-4.5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Rodapé do Ateliê */}
        <div className="p-4 border-t border-slate-100 text-center text-4xs text-slate-400 space-y-2 bg-slate-50/50">
          <div className="flex items-center justify-center gap-1.5 text-3xs font-bold text-slate-600">
            <Database className="h-3.5 w-3.5 text-indigo-600" />
            <span>Banco de Dados Ativo</span>
          </div>
          <div className="flex items-center justify-center gap-1.5 text-4xs text-emerald-600 font-semibold">
            <Cloud className="h-3.5 w-3.5 text-emerald-500" />
            <span>Nuvem Firestore Conectada</span>
          </div>
          <p className="font-bold flex items-center justify-center gap-1 text-slate-500 pt-1">
            <Heart className="h-3 w-3 text-indigo-500 fill-indigo-500" /> Andreia Bordados v2.5
          </p>
        </div>
      </aside>

      {/* 2. ÁREA DE TRABALHO GERAL (MAIN LAYOUT) */}
      <div className="flex-1 flex flex-col min-w-0" id="main_working_canvas">
        
        {/* TOPBAR HEADER */}
        <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 h-16 px-4 flex items-center justify-between sticky top-0 z-40 text-slate-800 shadow-xs" id="topbar_header">
          
          <div className="flex items-center gap-2">
            {/* Gatilho Menu Mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <h2 className="text-sm font-black text-slate-900 font-sans tracking-tight">
              {activeTabTitle}
            </h2>
          </div>

          {/* Status do Banco & Ateliê */}
          <div className="flex items-center gap-2.5 sm:gap-3 text-xs font-sans">
            <div className="hidden sm:flex items-center gap-1.5 text-slate-700 bg-slate-100/90 py-1 px-2.5 rounded-lg border border-slate-200 text-3xs font-semibold">
              <Database className="h-3.5 w-3.5 text-indigo-600" />
              <span>Nuvem Conectada</span>
            </div>

            <div className="flex items-center gap-1.5 text-2xs font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200/80 p-1 py-1 px-2.5 rounded-full select-none shadow-2xs" id="atelier_active_badge">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              {isCloudSynced ? 'Salvo no Banco' : 'Salvando...'}
            </div>
          </div>
        </header>

        {/* MOBILE SIDEBAR DRAW (overlay) */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 lg:hidden flex" id="mobile_navbar_drawer">
              <motion.div 
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'tween', duration: 0.25 }}
                className="w-64 bg-white border-r border-slate-200 text-slate-800 h-full relative p-4 flex flex-col justify-between shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4 font-sans">
                    <div className="flex items-center gap-2.5">
                      <img 
                        src={ANDREIA_LOGO_URL} 
                        alt="Andreia Bordados" 
                        className="h-9 w-9 rounded-full object-cover border border-rose-200 shadow-2xs"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="font-extrabold text-sm text-slate-900 block leading-tight">Andreia Bordados</span>
                        <span className="text-4xs font-medium text-rose-700">Personalizados</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md cursor-pointer"
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
                            active 
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100 font-bold' 
                              : 'text-slate-600 hover:bg-slate-100'
                          }`}
                        >
                          <IconComponent className={`h-4.5 w-4.5 ${active ? 'text-indigo-600' : 'text-slate-400'}`} />
                          {tab.label}
                        </button>
                      );
                    })}
                  </nav>
                </div>

                <div className="text-center text-4xs text-slate-400 py-3 border-t border-slate-100">
                  Gestão integrada - Andreia Bordados
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
                  onDeleteClient={handleDeleteClient}
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
