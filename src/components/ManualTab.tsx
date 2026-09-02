import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Search, 
  Printer, 
  CheckCircle2, 
  Users, 
  ShoppingBag, 
  Calculator, 
  DollarSign, 
  Package, 
  Calendar, 
  FolderOpen, 
  BarChart3, 
  Database, 
  Smartphone, 
  MessageCircle, 
  ChevronRight, 
  Lightbulb, 
  Layers, 
  FileText,
  HelpCircle,
  Clock,
  ArrowUpRight,
  Zap,
  ShieldCheck,
  Check
} from 'lucide-react';
import { ANDREIA_LOGO_URL } from '../assets/logo';

interface ManualTabProps {
  onNavigateToTab?: (tabId: string) => void;
}

export default function ManualTab({ onNavigateToTab }: ManualTabProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSection, setActiveSection] = useState<string>('todos');

  const manualSections = [
    {
      id: 'introducao',
      title: '1. Visão Geral & Boas-Vindas',
      icon: Sparkles,
      color: 'indigo',
      summary: 'Apresentação do sistema, salvamento automático em nuvem e funcionamento multiplataforma.',
      content: [
        {
          subTitle: 'Bem-vinda ao Sistema Andreia Bordados',
          text: 'Este aplicativo foi especialmente desenvolvido sob medida para a gestão completa e profissional do ateliê de bordados computadorizados. Ele integra o controle de clientes, pedidos, cálculo preciso de preços de bordado, estoque, despesas, agenda de entregas e catálogo de matrizes.'
        },
        {
          subTitle: 'Banco de Dados em Nuvem (Firestore)',
          text: 'Toda e qualquer movimentação realizada no sistema (um cliente cadastrado, um pedido atualizado, uma despesa lançada ou um cone de linha adicionado) é salva automaticamente no banco de dados em nuvem. Não é necessário clicar em botões como "Salvar Tudo" — o sistema grava instantaneamente em segundo plano.'
        },
        {
          subTitle: 'Uso no Computador e no Celular',
          text: 'Você pode utilizar o sistema confortavelmente tanto no computador do ateliê quanto no smartphone via navegador web. Os dados permanecem sempre sincronizados entre todos os aparelhos conectados.'
        }
      ]
    },
    {
      id: 'clientes',
      title: '2. Gestão de Clientes',
      icon: Users,
      color: 'blue',
      summary: 'Como cadastrar clientes, consultar histórico de compras e iniciar contato no WhatsApp.',
      content: [
        {
          subTitle: 'Cadastrar um Novo Cliente',
          text: 'Acesse o menu "Clientes" na barra lateral e clique no botão "+ Novo Cliente". Preencha o Nome Completo, Telefone/WhatsApp (com DDD), E-mail, Endereço e CPF/CNPJ (opcionais).'
        },
        {
          subTitle: 'Atendimento Rápido via WhatsApp',
          text: 'No cartão de qualquer cliente cadastrado, clique no ícone verde do WhatsApp. O sistema abre diretamente a conversa no WhatsApp com uma mensagem inicial de cordialidade pronta para envio.'
        },
        {
          subTitle: 'Histórico Completo de Pedidos',
          text: 'Ao clicar sobre um cliente, você visualiza instantaneamente o valor total já gasto por ele no ateliê e todos os pedidos anteriores já confeccionados.'
        }
      ]
    },
    {
      id: 'pedidos',
      title: '3. Fila de Pedidos & Impressão',
      icon: ShoppingBag,
      color: 'rose',
      summary: 'Como criar pedidos, acompanhar as etapas de produção e imprimir orçamentos limpos.',
      content: [
        {
          subTitle: 'Como Criar um Pedido ou Orçamento',
          text: 'No menu "Fila de Pedidos", clique em "+ Novo Pedido". Selecione o cliente cadastrado, informe a peça (ex: Toalha de Banho, Jaleco, Boné), quantidade, tamanho da matriz em centímetros, tecido base, texto ou nome personalizado e o prazo de entrega prometido.'
        },
        {
          subTitle: 'Etapas do Fluxo de Produção',
          text: 'Mantenha o status do pedido atualizado conforme a confecção avança: Orçamento ➔ Aprovado ➔ Produção ➔ Bordando ➔ Pronto ➔ Entregue. O sistema calcula automaticamente o tempo restante para o prazo.'
        },
        {
          subTitle: 'Controle de Sinal e Pagamentos',
          text: 'Registre o valor total combinado, o valor pago como sinal/entrada e o saldo restante. Quando o cliente quitar o saldo na entrega, basta atualizar o campo correspondente.'
        },
        {
          subTitle: 'Imprimir Pedido ou Orçamento com a Logo Oficial',
          text: 'Abra os detalhes do pedido e clique em "Imprimir Pedido". Uma folha profissional em formato A4 é gerada com a logo oficial de Andreia Bordados, dados do cliente, especificações técnicas, resumo financeiro e linha de assinatura para aceite. Todos os botões e menus da tela somem automaticamente na impressão.'
        }
      ]
    },
    {
      id: 'calculadora',
      title: '4. Calculadora de Preço de Bordado',
      icon: Calculator,
      color: 'emerald',
      summary: 'Como calcular preços justos e lucrativos com base em pontos, linha, tempo e margem.',
      content: [
        {
          subTitle: 'Como Funciona a Precificação Científica',
          text: 'Bordados computadorizados exigem cálculo preciso para não gerar prejuízo. A calculadora considera: 1) Quantidade de pontos da matriz (ex: 15.000 pontos); 2) Velocidade média da máquina (ex: 600 a 800 ppm); 3) Metros de linha superior e bobina consumidos; 4) Custo de entretela, plástico hidrossolúvel e energia elétrica; 5) Hora da artesã/bordadeira; 6) Margem de lucro desejada.'
        },
        {
          subTitle: 'Transformar Cálculo em Pedido Instantâneo',
          text: 'Após calcular o valor de um bordado na calculadora, você pode clicar em "Gerar Pedido a Partir do Cálculo" para transferir os valores e especificações diretamente para a fila de pedidos sem precisar redigitar nada.'
        },
        {
          subTitle: 'Gerar Orçamento Oficial para o Cliente',
          text: 'Clique no botão "Gerar Orçamento com Logo" na calculadora para visualizar e imprimir a proposta formal de orçamento com validade de 10 dias para enviar aos seus clientes.'
        }
      ]
    },
    {
      id: 'despesas',
      title: '5. Controle de Despesas & Financeiro',
      icon: DollarSign,
      color: 'amber',
      summary: 'Registro de custos operacionais, insumos, manutenção de máquinas e lucro líquido.',
      content: [
        {
          subTitle: 'Lançar Gastos do Ateliê',
          text: 'No menu "Controle de Despesas", clique em "+ Nova Despesa". Informe a descrição (ex: Cones de Linha Lumina, Agulhas Schmetz, Manutenção Preventiva da Máquina, Conta de Luz), a categoria, o valor e a data do pagamento.'
        },
        {
          subTitle: 'Acompanhamento do Lucro Real',
          text: 'O sistema cruza automaticamente o faturamento bruto recebido dos pedidos com as despesas cadastradas no mês, exibindo o Lucro Líquido Real e a Margem Operacional do ateliê.'
        }
      ]
    },
    {
      id: 'estoque',
      title: '6. Controle de Estoque de Insumos',
      icon: Package,
      color: 'purple',
      summary: 'Controle de cones de linhas, entretelas, tecidos e alertas de reposição.',
      content: [
        {
          subTitle: 'Monitorar Fios e Materiais',
          text: 'Cadastre os materiais que você utiliza com frequência (ex: Cones de Linha 120D/2 4000m, Entretela Rasga Fácil 40g, Termocolante, Toalhas Döhler). Defina a quantidade atual e a quantidade mínima de segurança.'
        },
        {
          subTitle: 'Alerta de Estoque Baixo',
          text: 'Sempre que um insumo atinge uma quantidade igual ou inferior ao mínimo de segurança estipulado, o sistema sinaliza com um destaque visual de atenção para que você compre antes que falte na produção.'
        },
        {
          subTitle: 'Ajuste Rápido de Saldo',
          text: 'Utilize os botões de soma (+) e subtração (-) nos cartões de estoque para atualizar rapidamente as quantidades consumidas ou repostas no dia a dia.'
        }
      ]
    },
    {
      id: 'agenda',
      title: '7. Agenda & Prazos de Entrega',
      icon: Calendar,
      color: 'indigo',
      summary: 'Visão cronológica dos compromissos para nunca atrasar uma encomenda.',
      content: [
        {
          subTitle: 'Visão Semanal e Mensal de Entregas',
          text: 'No menu "Agenda & Prazos", acompanhe todos os pedidos organizados pela data prometida de entrega. Os pedidos urgentes ou com prazo do dia ganham destaque visual prioritário.'
        },
        {
          subTitle: 'Mudança Ágil de Status',
          text: 'Na própria agenda você pode avançar o status da peça assim que terminar de bordar ou quando o cliente retirar a encomenda no ateliê.'
        }
      ]
    },
    {
      id: 'matrizes',
      title: '8. Catálogo de Artes & Matrizes',
      icon: FolderOpen,
      color: 'teal',
      summary: 'Organização de matrizes digitais, contagem de pontos, formatos e tags.',
      content: [
        {
          subTitle: 'Cadastrar Matrizes Digitais',
          text: 'No menu "Artes & Matrizes", cadastre seus arquivos de matrizes de bordado (formatos PES, JEF, DST, EXP, etc.). Informe o nome da arte (ex: Safari Baby, Logo Empresa, Brasão Floral), a quantidade de pontos, as dimensões (largura x altura em cm) e a quantidade de cores.'
        },
        {
          subTitle: 'Busca Rápida por Tema ou Formato',
          text: 'Utilize a barra de pesquisa da galeria para encontrar rapidamente matrizes por nome, categoria (Infantil, Religioso, Corporativo, Florais) ou formato de arquivo.'
        }
      ]
    },
    {
      id: 'relatorios',
      title: '9. Relatórios & Desempenho',
      icon: BarChart3,
      color: 'cyan',
      summary: 'Gráficos gerenciais, faturamento por período e ranking de melhores clientes.',
      content: [
        {
          subTitle: 'Análise de Desempenho do Ateliê',
          text: 'No menu "Relatórios", consulte gráficos dinâmicos de faturamento, volume de peças produzidas por mês, distribuição de pedidos por status e os clientes com maior volume de compras.'
        },
        {
          subTitle: 'Tomada de Decisões Estratégicas',
          text: 'Descubra quais produtos são mais procurados (ex: toalhinhas escolares no início do ano, jalecos ou enxovais de bebê) para planejar compras de estoque com antecedência e melhores preços.'
        }
      ]
    }
  ];

  const quickTips = [
    {
      title: 'Dica de Precificação',
      desc: 'Nunca cobre apenas no "olhômetro". Sempre utilize a Calculadora de Preço para garantir que os custos de energia, agulha, linha e seu tempo estejam 100% cobertos com lucro justo.'
    },
    {
      title: 'Comprovante do Pedido',
      desc: 'Sempre que fechar um pedido com sinal, imprima ou salve em PDF a Ficha do Pedido e envie a foto/arquivo ao cliente pelo WhatsApp para evitar dúvidas sobre o nome grafado ou cores.'
    },
    {
      title: 'Segurança das Matrizes',
      desc: 'Mantenha as contagens de pontos anotadas no Catálogo de Matrizes. Isso acelera o orçamento no balcão em menos de 1 minuto.'
    },
    {
      title: 'Manutenção da Máquina',
      desc: 'Registre as revisões e trocas de agulhas e óleo no menu de Despesas para ter controle do histórico de manutenção do equipamento.'
    }
  ];

  const filteredSections = manualSections.filter(section => {
    if (activeSection !== 'todos' && section.id !== activeSection) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    const matchesTitle = section.title.toLowerCase().includes(query);
    const matchesSummary = section.summary.toLowerCase().includes(query);
    const matchesContent = section.content.some(c => 
      c.subTitle.toLowerCase().includes(query) || c.text.toLowerCase().includes(query)
    );
    return matchesTitle || matchesSummary || matchesContent;
  });

  const handlePrintManual = () => {
    window.print();
  };

  return (
    <div className="space-y-6 pb-12" id="manual_container">
      
      {/* CABEÇALHO DO MANUAL */}
      <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-sm relative overflow-hidden border border-indigo-700/50 print:bg-white print:text-slate-900 print:border-none print:p-0">
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shrink-0 print:border-slate-300 print:bg-slate-50">
              <img 
                src={ANDREIA_LOGO_URL} 
                alt="Andreia Bordados Logo" 
                className="h-12 w-12 rounded-xl object-cover shadow-sm"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 bg-rose-500 text-white font-bold text-3xs uppercase tracking-wider rounded-md print:bg-slate-100 print:text-slate-800 print:border print:border-slate-300">
                  Guia Oficial
                </span>
                <span className="text-3xs font-medium text-indigo-200 print:text-slate-500">Versão 2.5 • Edição Completa</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-1 print:text-slate-900">
                Manual de Instruções do Sistema
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200 mt-1 max-w-2xl print:text-slate-600">
                Guia passo a passo para utilizar todos os recursos do ateliê Andreia Bordados: pedidos, clientes, precificação, impressão, estoque, despesas e agenda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 print:hidden">
            <button
              onClick={handlePrintManual}
              className="px-4 py-2.5 bg-white hover:bg-slate-100 text-indigo-950 font-black text-xs rounded-xl transition flex items-center gap-2 shadow-xs cursor-pointer active:scale-95"
              title="Imprimir ou Salvar Manual em PDF"
            >
              <Printer className="h-4 w-4 text-indigo-700" />
              Imprimir / PDF
            </button>
          </div>
        </div>

        {/* Efeito sutil de fundo decorativo */}
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none print:hidden"></div>
      </div>

      {/* BARRA DE PESQUISA E FILTROS RÁPIDOS */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3 print:hidden">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pesquisar por assunto no manual (ex: Como imprimir, Calcular preço, WhatsApp, Estoque)..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 transition"
            />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="px-3 py-2 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 rounded-xl cursor-pointer"
            >
              Limpar busca
            </button>
          )}
        </div>

        {/* Filtros de Seção */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
          <button
            onClick={() => setActiveSection('todos')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer ${
              activeSection === 'todos' 
                ? 'bg-indigo-600 text-white shadow-2xs' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos os Tópicos
          </button>
          {manualSections.map(sec => (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold shrink-0 transition cursor-pointer ${
                activeSection === sec.id 
                  ? 'bg-indigo-600 text-white shadow-2xs' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec.title.split('.')[1]?.trim() || sec.title}
            </button>
          ))}
        </div>
      </div>

      {/* DESTAQUES & DICAS RÁPIDAS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:hidden">
        {quickTips.map((tip, idx) => (
          <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-700">
              <Lightbulb className="h-4 w-4 text-amber-500 shrink-0" />
              <h2 className="text-xs font-bold text-slate-900">{tip.title}</h2>
            </div>
            <p className="text-2xs text-slate-600 leading-relaxed">
              {tip.desc}
            </p>
          </div>
        ))}
      </div>

      {/* CORPO DO MANUAL (SEÇÕES DETALHADAS) */}
      <div className="space-y-6 printable-sheet" id="printable_manual_content">
        {filteredSections.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
            <HelpCircle className="h-10 w-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">Nenhum tópico encontrado para "{searchQuery}"</p>
            <p className="text-xs text-slate-400">Tente buscar por termos como "preço", "pedido", "cliente", "impressão" ou "estoque".</p>
            <button
              onClick={() => { setSearchQuery(''); setActiveSection('todos'); }}
              className="mt-2 px-4 py-2 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-xl hover:bg-indigo-100 transition cursor-pointer"
            >
              Exibir Manual Completo
            </button>
          </div>
        ) : (
          filteredSections.map((section) => {
            const IconComponent = section.icon;

            return (
              <div 
                key={section.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden print-card print-avoid-break"
                id={`manual_section_${section.id}`}
              >
                {/* Título da Seção */}
                <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 rounded-xl text-indigo-700 border border-indigo-100">
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm sm:text-base font-black text-slate-900">
                        {section.title}
                      </h2>
                      <p className="text-2xs text-slate-500 font-medium">
                        {section.summary}
                      </p>
                    </div>
                  </div>

                  {onNavigateToTab && section.id !== 'introducao' && (
                    <button
                      onClick={() => onNavigateToTab(section.id === 'matrizes' ? 'gallery' : section.id)}
                      className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-slate-100 text-indigo-700 font-bold text-2xs rounded-lg border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs print:hidden"
                    >
                      <span>Ir para o Módulo</span>
                      <ArrowUpRight className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>

                {/* Conteúdo Explicativo Passo a Passo */}
                <div className="p-5 sm:p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {section.content.map((item, cIdx) => (
                      <div 
                        key={cIdx} 
                        className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-2 print:border-slate-300 print:bg-white"
                      >
                        <div className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                          <h3 className="text-xs font-bold text-slate-900 leading-snug">
                            {item.subTitle}
                          </h3>
                        </div>
                        <p className="text-2xs text-slate-600 leading-relaxed pl-6">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* GUIA RESUMIDO DE ATALHOS E BOAS PRÁTICAS */}
      <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-6 sm:p-8 space-y-4 print:bg-slate-50 print:text-slate-900 print:border print:border-slate-300 print:p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-rose-500/20 rounded-xl border border-rose-400/30 text-rose-300">
            <Zap className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-black text-white print:text-slate-900">
              Fluxo Diário Recomendado para o Ateliê
            </h2>
            <p className="text-2xs text-slate-300 print:text-slate-600">
              Passo a passo sugerido para rotina de atendimento e produção no ateliê.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
          <div className="p-3.5 bg-white/10 rounded-xl border border-white/15 space-y-1.5 print:bg-white print:border-slate-200">
            <div className="text-rose-400 font-mono text-3xs font-black uppercase">Passo 1 • Balcão</div>
            <p className="text-xs font-bold text-white print:text-slate-900">Cadastro & Orçamento</p>
            <p className="text-3xs text-slate-300 print:text-slate-600">
              Cadastre o cliente e calcule os pontos na Calculadora gerando o orçamento formal com 50% de sinal.
            </p>
          </div>

          <div className="p-3.5 bg-white/10 rounded-xl border border-white/15 space-y-1.5 print:bg-white print:border-slate-200">
            <div className="text-amber-400 font-mono text-3xs font-black uppercase">Passo 2 • Programação</div>
            <p className="text-xs font-bold text-white print:text-slate-900">Ficha & Materiais</p>
            <p className="text-3xs text-slate-300 print:text-slate-600">
              Imprima a Ficha do Pedido e separe as cores de linhas e entretela indicadas na ficha técnica.
            </p>
          </div>

          <div className="p-3.5 bg-white/10 rounded-xl border border-white/15 space-y-1.5 print:bg-white print:border-slate-200">
            <div className="text-indigo-400 font-mono text-3xs font-black uppercase">Passo 3 • Confecção</div>
            <p className="text-xs font-bold text-white print:text-slate-900">Bordado & Acabamento</p>
            <p className="text-3xs text-slate-300 print:text-slate-600">
              Avance o status para "Bordando" e realize o corte de fios e limpeza com acabamento fino.
            </p>
          </div>

          <div className="p-3.5 bg-white/10 rounded-xl border border-white/15 space-y-1.5 print:bg-white print:border-slate-200">
            <div className="text-emerald-400 font-mono text-3xs font-black uppercase">Passo 4 • Entrega</div>
            <p className="text-xs font-bold text-white print:text-slate-900">Aviso & Quitação</p>
            <p className="text-3xs text-slate-300 print:text-slate-600">
              Avise o cliente no WhatsApp com 1 clique, receba o saldo restante e marque o pedido como "Entregue".
            </p>
          </div>
        </div>
      </div>

      {/* RODAPÉ DO MANUAL COM CONTATO DO ATELIÊ */}
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 print:border-none print:bg-transparent">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          <span className="font-bold text-slate-700">Sistema Andreia Bordados Personalizados</span>
        </div>
        <p className="text-3xs">
          Banco de Dados em Nuvem Ativo • Sincronização em Tempo Real • Suporte Integrado
        </p>
      </div>

    </div>
  );
}
