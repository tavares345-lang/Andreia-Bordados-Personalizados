import { Client, Order, Expense, InventoryItem, ArtMatrix } from './types';

export const defaultClients: Client[] = [
  {
    id: 'c1',
    name: 'Ana Lívia de Souza',
    phone: '(11) 98765-4321',
    whatsapp: '11987654321',
    email: 'analivia.souza@email.com',
    address: 'Rua das Flores, 123, Bairro Jardim, São Paulo - SP',
    cpfCnpj: '123.456.789-00',
    observations: 'Cliente assídua. Prefere tons neutros e delicados para enxovais de bebês.',
    createdAt: '2026-04-10'
  },
  {
    id: 'c2',
    name: 'Roberto Carlos Marcondes',
    phone: '(21) 97123-4567',
    whatsapp: '21971234567',
    email: 'roberto.construcoes@gmail.com',
    address: 'Av. Paulista, 1500, Bela Vista, São Paulo - SP',
    cpfCnpj: '12.345.678/0001-99',
    observations: 'Pedidos corporativos frequentes (uniformes). Exige alta fidelidade de cor com a logomarca.',
    createdAt: '2026-04-15'
  },
  {
    id: 'c3',
    name: 'Mariana Azevedo Melo',
    phone: '(31) 99888-7766',
    whatsapp: '31998887766',
    email: 'mari.azevedo@outlook.com',
    address: 'Rua Alvarenga, 45, Lourdes, Belo Horizonte - MG',
    cpfCnpj: '456.789.123-11',
    observations: 'Noiva. Pedindo roupões para madrinhas, toalhinhas e lembrancinhas de casamento.',
    createdAt: '2026-05-01'
  },
  {
    id: 'c4',
    name: 'Clínica Sorriso Feliz (Dra. Juliana)',
    phone: '(11) 94567-8901',
    whatsapp: '11945678901',
    email: 'recepcao@sorrisofeliz.com.br',
    address: 'Rua Itapeva, 240, Cj 51, Bela Vista, São Paulo - SP',
    cpfCnpj: '98.765.432/0001-08',
    observations: 'Juliana é muito detalhista. Pedidos de jalecos com nome e logomarca da odontologia.',
    createdAt: '2026-05-05'
  },
  {
    id: 'c5',
    name: 'Fernanda Lima Gusmão',
    phone: '(19) 99245-1212',
    whatsapp: '19992451212',
    email: 'fernada.gusmao@gmail.com',
    address: 'Alameda das Palmeiras, 902, Campinas - SP',
    cpfCnpj: '321.654.987-88',
    observations: 'Gosta de bordados em estilo aquarela e ponto cruz na máquina.',
    createdAt: '2026-05-12'
  }
];

export const defaultOrders: Order[] = [
  {
    id: 1001,
    clientId: 'c1',
    clientName: 'Ana Lívia de Souza',
    date: '2026-05-15',
    deliveryDate: '2026-05-20', // Hoje segundo ADD_METADATA
    status: 'finished',
    product: 'Kit Enxoval de Bebê (3 peças: Manta, Toalha de Banho e babador)',
    quantity: 1,
    embroiderySize: '18x13 cm e 10x10 cm',
    fabricType: 'Fralda Dupla de Algodão e Plush',
    personalizedName: 'Arthur',
    colorsUsed: ['Azul Bebê (Ricamare 3020)', 'Cinza Claro (Ricamare 3120)', 'Dourado (Metálica 4001)'],
    totalValue: 180.00,
    paymentMethod: 'Pix',
    depositPaid: 90.00,
    remainingValue: 90.00,
    observations: 'Bordar o ursinho com coroa em dourado metálico. Nome Arthur em fonte cursiva clássica.',
    photoUrl: 'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 1002,
    clientId: 'c2',
    clientName: 'Roberto Carlos Marcondes',
    date: '2026-05-10',
    deliveryDate: '2026-05-25',
    status: 'production',
    product: 'Polo Piquet com Logomarca no Peito',
    quantity: 15,
    embroiderySize: '9x5 cm',
    fabricType: 'Malha Piquet PA (Algodão/Poliéster)',
    personalizedName: 'Logotipo RCM Construções',
    colorsUsed: ['Verde Bandeira (Ricamare 3045)', 'Amarelo Ouro (Ricamare 3008)', 'Preto (Ricamare 3000)'],
    totalValue: 525.00,
    paymentMethod: 'Pix',
    depositPaid: 262.50,
    remainingValue: 262.50,
    observations: 'Entretela rasgável de 80g para dar boa sustentação ao logotipo sem repuxar a malha.',
    photoUrl: 'https://images.unsplash.com/photo-1581655353564-df123a1eb820?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 1003,
    clientId: 'c3',
    clientName: 'Mariana Azevedo Melo',
    date: '2026-05-14',
    deliveryDate: '2026-05-22',
    status: 'embroidery',
    product: 'Roupões de Cetim com Bordado nas Costas (Noiva + 5 Madrinhas)',
    quantity: 6,
    embroiderySize: '24x15 cm',
    fabricType: 'Cetim com Elastano',
    personalizedName: 'Noiva Mariana / Madrinha',
    colorsUsed: ['Rose Gold Metalizado (Gutterman 502)', 'Branco Pérola (Ricamare 3002)'],
    totalValue: 360.00,
    paymentMethod: 'Cartão de Crédito',
    depositPaid: 180.00,
    remainingValue: 180.00,
    observations: 'Utilizar entretela hidrossolúvel por cima do cetim para evitar que as fibras saiam e dar acabamento perfeito nos fios.',
    photoUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 1004,
    clientId: 'c4',
    clientName: 'Clínica Sorriso Feliz (Dra. Juliana)',
    date: '2026-05-18',
    deliveryDate: '2026-05-29',
    status: 'approved',
    product: 'Jalecos Femininos de Gabardine Importado',
    quantity: 3,
    embroiderySize: '12x8 cm (Bolso)',
    fabricType: 'Gabardine de Microfibra',
    personalizedName: 'Dra. Juliana / Dra. Patricia',
    colorsUsed: ['Azul Escuro (Madrigal 4010)', 'Prateado Metálico (Ricamare 3200)'],
    totalValue: 240.00,
    paymentMethod: 'Pix',
    depositPaid: 120.00,
    remainingValue: 120.00,
    observations: 'Bordar bolso esquerdo com especial atenção à centralização. Uma letra bem desenhada cursiva.',
    photoUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 1005,
    clientId: 'c5',
    clientName: 'Fernanda Lima Gusmão',
    date: '2026-05-02',
    deliveryDate: '2026-05-12', // Atrasado e entregue fora do prazo ou pendente? Vamos simular pendente e atrasado
    status: 'production',
    product: 'Jogo de Toalhas de Lavabo Floral',
    quantity: 2,
    embroiderySize: '15x10 cm',
    fabricType: 'Toalhas Felpudas Lavabos Buddemeyer',
    personalizedName: 'Visitas / F & L',
    colorsUsed: ['Verde Oliva (Ricamare 3125)', 'Rosa Antigo (Ricamare 3080)', 'Vinho (Ricamare 3012)'],
    totalValue: 110.00,
    paymentMethod: 'Dinheiro',
    depositPaid: 0.00,
    remainingValue: 110.00,
    observations: 'ATENÇÃO AO PRAZO DE ENTREGA ATRASADO! Cliente aprovou a arte atrasado.',
    photoUrl: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=400'
  },
  {
    id: 1006,
    clientId: 'c1',
    clientName: 'Ana Lívia de Souza',
    date: '2026-05-19',
    deliveryDate: '2026-05-28',
    status: 'budget',
    product: 'Porta Maternidade Bastidor Bordado',
    quantity: 1,
    embroiderySize: '20x20 cm',
    fabricType: 'Linho Puro Cru',
    personalizedName: 'Bem-vindo Arthur',
    colorsUsed: ['Verde Floresta (Ricamare 3050)', 'Champagne (Ricamare 3004)', 'Marrom Claro'],
    totalValue: 120.00,
    paymentMethod: 'Pix',
    depositPaid: 0.00,
    remainingValue: 120.00,
    observations: 'Orçamento enviado por WhatsApp. Aguardando aprovação do layout final e pagamento do sinal de 50%.',
    photoUrl: 'https://images.unsplash.com/photo-1563170351-be82bc888bb4?auto=format&fit=crop&q=80&w=400'
  }
];

export const defaultExpenses: Expense[] = [
  {
    id: 'e1',
    description: 'Compra de 10 Cones de Linha Ricamare sortidos',
    value: 85.00,
    date: '2026-05-02',
    category: 'Linhas',
    observations: 'Adquirido na loja Armarinho Fernando (Rosa pastel, Azul Marinho, Amarelo Ouro, Ouro Velho...)'
  },
  {
    id: 'e2',
    description: 'Manutenção periódica da Máquina Brother BP2150L',
    value: 250.00,
    date: '2026-05-04',
    category: 'Manutenção',
    observations: 'Lubrificação geral, regulagem da tensão do fio da bobina e limpeza interna.'
  },
  {
    id: 'e3',
    description: 'Rolo de Entretela Rasgável 80g (50 metros)',
    value: 65.00,
    date: '2026-05-06',
    category: 'Entretelas',
    observations: 'Distribuidora Fios e Artes.'
  },
  {
    id: 'e4',
    description: 'Fatura de Energia Elétrica Residencial/Ateliê',
    value: 120.00,
    date: '2026-05-10',
    category: 'Energia',
    observations: 'Proporcional estimado de uso das 2 máquinas de bordar ligadas 6h por dia.'
  },
  {
    id: 'e5',
    description: 'Internet Fibra Óptica 300MB - Mensalidade',
    value: 45.00,
    date: '2026-05-11',
    category: 'Água/Internet',
    observations: 'Calculado 1/3 do valor total da casa dedicada para o ateliê.'
  },
  {
    id: 'e6',
    description: '100 Caixas de papel Kraft com visor para embalar e entregar bordados',
    value: 110.00,
    date: '2026-05-14',
    category: 'Embalagem',
    observations: 'Tamanho 25x25x5 cm. Excelente apresentação.'
  },
  {
    id: 'e7',
    description: 'Pacote de Agulhas Organ DBxK5 (tamanho 75/11 - c/ 10 un)',
    value: 32.00,
    date: '2026-05-16',
    category: 'Agulhas',
    observations: 'Agulha especial para bordado em alta rotação.'
  }
];

export const defaultInventory: InventoryItem[] = [
  {
    id: 'i1',
    name: 'Linha Ricamare Poliéster - Branco 3002',
    category: 'Linhas',
    quantity: 3,
    unit: 'Cones (4000m)',
    minQuantity: 2,
    observations: 'Cor de alto giro. Sempre monitorar.',
    lastUpdated: '2026-05-19'
  },
  {
    id: 'i2',
    name: 'Linha Ricamare Poliéster - Preto 3000',
    category: 'Linhas',
    quantity: 1,
    unit: 'Cones (4000m)',
    minQuantity: 2,
    observations: 'Alerta! Apenas 1 cone disponível!',
    lastUpdated: '2026-05-18'
  },
  {
    id: 'i3',
    name: 'Entretela Rasguito Fácil Dupla Face 80g',
    category: 'Entretelas',
    quantity: 40,
    unit: 'Metros',
    minQuantity: 15,
    observations: 'Estoque confortável.',
    lastUpdated: '2026-05-14'
  },
  {
    id: 'i4',
    name: 'Agulhas Organ DBxK5 Caboclo 75/11',
    category: 'Agulhas',
    quantity: 8,
    unit: 'Unidades',
    minQuantity: 10,
    observations: 'Alerta de estoque baixo. Necessita compra.',
    lastUpdated: '2026-05-16'
  },
  {
    id: 'i5',
    name: 'Caixas de Kraft com Visor Acetato 25x25',
    category: 'Embalagens',
    quantity: 92,
    unit: 'Unidades',
    minQuantity: 20,
    observations: 'Estoque novo recém-registrado.',
    lastUpdated: '2026-05-14'
  },
  {
    id: 'i6',
    name: 'Entretela Hidrossolúvel Importada (Plástico Solúvel)',
    category: 'Entretelas',
    quantity: 6,
    unit: 'Metros',
    minQuantity: 5,
    observations: 'Usada para acabamento fino em toalhas felpudas e tecidos delicados.',
    lastUpdated: '2026-05-12'
  },
  {
    id: 'i7',
    name: 'Tecido Linho Puro Cor Off-White',
    category: 'Tecidos',
    quantity: 12,
    unit: 'Metros',
    minQuantity: 10,
    observations: 'Comprado na loja Tecidos do Sul para confecção de bastidores porta-maternidade.',
    lastUpdated: '2026-05-02'
  },
  {
    id: 'i8',
    name: 'Linha Lumina Metálica - Dourado Rich Gold',
    category: 'Linhas',
    quantity: 2,
    unit: 'Passadores/Cones',
    minQuantity: 1,
    observations: 'Luminosa, ideal para coroas, brasões e noivinhas.',
    lastUpdated: '2026-05-19'
  }
];

export const defaultMatrices: ArtMatrix[] = [
  {
    id: 'm1',
    name: 'Ursinho Clássico com Realeza & Raminhos',
    category: 'Infantil',
    formats: ['PES', 'DST', 'EXP', 'JEFF'],
    notes: 'Matriz excelente para enxoval de menino ou menina. Pontos leves e sem corte excessivo de fio.',
    pointsCount: 12400,
    photoUrl: '🧸',
    createdAt: '2026-03-10'
  },
  {
    id: 'm2',
    name: 'Brasão Imperial de Casamento - Monograma',
    category: 'Casamento',
    formats: ['PES', 'DST', 'EXP'],
    notes: 'Design floral clássico com espaço centralizado editável para incluir as iniciais do casal.',
    pointsCount: 18500,
    photoUrl: '💍',
    createdAt: '2026-04-05'
  },
  {
    id: 'm3',
    name: 'Floral Aquarela - Jogo de Toalha',
    category: 'Geral',
    formats: ['DST', 'PES', 'HUS'],
    notes: 'Bordado super charmoso simulando traço manual e preenchimento leve. Ideal para lavabo.',
    pointsCount: 14200,
    photoUrl: '🌸',
    createdAt: '2026-04-12'
  },
  {
    id: 'm4',
    name: 'Logotipo Padrão Odontologia (Ramo de Trigo + Dente)',
    category: 'Empresarial',
    formats: ['PES', 'DST'],
    notes: 'Exige bordar com agulha fina 70/10 e velocidade reduzida para as folhas do ramo ficarem limpas.',
    pointsCount: 9800,
    photoUrl: '🦷',
    createdAt: '2026-05-01'
  },
  {
    id: 'm5',
    name: 'Coração Ramos Boho Minimalista',
    category: 'Bebês',
    formats: ['PES', 'DST', 'EXP', 'JEFF', 'XXX'],
    notes: 'Design queridinho de mamães. Combina perfeitamente com fontes sem serifa.',
    pointsCount: 6500,
    photoUrl: '🤍',
    createdAt: '2026-05-10'
  },
  {
    id: 'm6',
    name: 'Símbolo do Papai Noel Cute de Natal',
    category: 'Datas comemorativas',
    formats: ['PES', 'DST'],
    notes: 'Com ponto ponto de aplique de carapinha branca para um aspecto tridimensional.',
    pointsCount: 15300,
    photoUrl: '🎅',
    createdAt: '2026-05-15'
  }
];
