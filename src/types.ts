export type OrderStatus = 'budget' | 'approved' | 'production' | 'embroidery' | 'finished' | 'delivered';

export interface Client {
  id: string;
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  cpfCnpj: string;
  observations: string;
  createdAt: string;
}

export interface Order {
  id: number; // sequential, e.g. 1001
  clientId: string;
  clientName: string;
  date: string;
  deliveryDate: string;
  status: OrderStatus;
  product: string;
  quantity: number;
  embroiderySize: string;
  photoUrl?: string;
  fabricType: string;
  personalizedName: string;
  colorsUsed: string[];
  totalValue: number;
  paymentMethod: string;
  depositPaid: number;
  remainingValue: number; // totalValue - depositPaid
  observations: string;
}

export interface Expense {
  id: string;
  description: string;
  value: number;
  date: string;
  category: 'Linhas' | 'Tecidos' | 'Entretelas' | 'Agulhas' | 'Manutenção' | 'Energia' | 'Água/Internet' | 'Mão de Obra' | 'Embalagem' | 'Transporte' | 'Outros';
  observations?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'Linhas' | 'Tecidos' | 'Entretelas' | 'Agulhas' | 'Embalagens' | 'Aviamentos' | 'Outros';
  quantity: number;
  unit: string; // e.g. "cones", "metros", "rolos", "unidades"
  minQuantity: number;
  observations?: string;
  lastUpdated: string;
}

export interface ArtMatrix {
  id: string;
  name: string;
  category: 'Infantil' | 'Casamento' | 'Uniformes' | 'Empresarial' | 'Bebês' | 'Datas comemorativas' | 'Geral';
  formats: string[]; // e.g. ["DST", "PES", "EXP"]
  photoUrl?: string;
  notes?: string;
  pointsCount?: number;
  createdAt: string;
}

export interface DashboardStats {
  ordersInProgress: number;
  lateOrders: number;
  deliveriesToday: number;
  monthlyRevenue: number;
  estimatedProfit: number;
  monthlyExpenses: number;
  lowStockItemsCount: number;
}
