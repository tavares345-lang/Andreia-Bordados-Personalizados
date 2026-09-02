import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  onSnapshot,
  writeBatch
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Client, Order, Expense, InventoryItem, ArtMatrix } from '../types';
import { 
  defaultClients, 
  defaultOrders, 
  defaultExpenses, 
  defaultInventory, 
  defaultMatrices 
} from '../defaultData';

// Inicialização segura do Firebase
const app = initializeApp(firebaseConfig);

// Usar o ID do banco de dados configurado no projeto
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId || undefined);

// Coleções
export const COLLECTIONS = {
  CLIENTS: 'clients',
  ORDERS: 'orders',
  EXPENSES: 'expenses',
  INVENTORY: 'inventory',
  MATRICES: 'matrices'
};

// Função de inicialização de dados (se o banco estiver vazio pela primeira vez)
export async function seedInitialDataIfEmpty() {
  try {
    const clientsRef = collection(db, COLLECTIONS.CLIENTS);
    const snap = await getDocs(clientsRef);

    if (snap.empty) {
      console.log('🌱 Inicializando banco de dados Firestore com dados padrão...');
      const batch = writeBatch(db);

      // Clientes
      defaultClients.forEach((client) => {
        const docRef = doc(db, COLLECTIONS.CLIENTS, client.id);
        batch.set(docRef, client);
      });

      // Pedidos
      defaultOrders.forEach((order) => {
        const docRef = doc(db, COLLECTIONS.ORDERS, String(order.id));
        batch.set(docRef, order);
      });

      // Despesas
      defaultExpenses.forEach((exp) => {
        const docRef = doc(db, COLLECTIONS.EXPENSES, exp.id);
        batch.set(docRef, exp);
      });

      // Estoque
      defaultInventory.forEach((item) => {
        const docRef = doc(db, COLLECTIONS.INVENTORY, item.id);
        batch.set(docRef, item);
      });

      // Matrizes
      defaultMatrices.forEach((mat) => {
        const docRef = doc(db, COLLECTIONS.MATRICES, mat.id);
        batch.set(docRef, mat);
      });

      await batch.commit();
      console.log('✅ Banco de dados inicializado com sucesso!');
    }
  } catch (error) {
    console.error('Erro ao verificar/inicializar dados no Firestore:', error);
  }
}

// Operações de Clientes
export async function saveClient(client: Client) {
  const docRef = doc(db, COLLECTIONS.CLIENTS, client.id);
  await setDoc(docRef, client, { merge: true });
}

export async function removeClient(clientId: string) {
  const docRef = doc(db, COLLECTIONS.CLIENTS, clientId);
  await deleteDoc(docRef);
}

// Operações de Pedidos
export async function saveOrder(order: Order) {
  const docRef = doc(db, COLLECTIONS.ORDERS, String(order.id));
  await setDoc(docRef, order, { merge: true });
}

export async function removeOrder(orderId: number | string) {
  const docRef = doc(db, COLLECTIONS.ORDERS, String(orderId));
  await deleteDoc(docRef);
}

// Operações de Despesas
export async function saveExpense(expense: Expense) {
  const docRef = doc(db, COLLECTIONS.EXPENSES, expense.id);
  await setDoc(docRef, expense, { merge: true });
}

export async function removeExpense(expenseId: string) {
  const docRef = doc(db, COLLECTIONS.EXPENSES, expenseId);
  await deleteDoc(docRef);
}

// Operações de Estoque
export async function saveInventoryItem(item: InventoryItem) {
  const docRef = doc(db, COLLECTIONS.INVENTORY, item.id);
  await setDoc(docRef, item, { merge: true });
}

export async function removeInventoryItem(itemId: string) {
  const docRef = doc(db, COLLECTIONS.INVENTORY, itemId);
  await deleteDoc(docRef);
}

// Operações de Matrizes
export async function saveMatrix(matrix: ArtMatrix) {
  const docRef = doc(db, COLLECTIONS.MATRICES, matrix.id);
  await setDoc(docRef, matrix, { merge: true });
}

export async function removeMatrix(matrixId: string) {
  const docRef = doc(db, COLLECTIONS.MATRICES, matrixId);
  await deleteDoc(docRef);
}
