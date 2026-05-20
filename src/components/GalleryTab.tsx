import React, { useState } from 'react';
import { ArtMatrix } from '../types';
import { 
  Plus, 
  Search, 
  Tag, 
  Download, 
  FileText, 
  ExternalLink,
  X, 
  Check, 
  FolderOpen,
  Sparkles,
  Layers,
  UploadCloud,
  ImageIcon
} from 'lucide-react';

interface GalleryTabProps {
  matrices: ArtMatrix[];
  onAddMatrix: (matrix: ArtMatrix) => void;
}

export default function GalleryTab({ matrices, onAddMatrix }: GalleryTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);

  // New item States
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<ArtMatrix['category']>('Infantil');
  const [formFormats, setFormFormats] = useState<string[]>(['PES', 'DST']);
  const [formNotes, setFormNotes] = useState('');
  const [formPoints, setFormPoints] = useState(10000);
  const [formUnicodeLogo, setFormUnicodeLogo] = useState('🧵');

  const [formError, setFormError] = useState('');

  const categories: ArtMatrix['category'][] = [
    'Infantil', 'Casamento', 'Uniformes', 'Empresarial', 'Bebês', 'Datas comemorativas', 'Geral'
  ];

  const availableFormats = ['PES', 'DST', 'EXP', 'JEFF', 'HUS', 'XXX'];

  const filteredMatrices = matrices.filter(m => {
    const matchesSearch = 
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (m.notes || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = categoryFilter === 'all' || m.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const handleToggleFormat = (fmt: string) => {
    if (formFormats.includes(fmt)) {
      setFormFormats(formFormats.filter(f => f !== fmt));
    } else {
      setFormFormats([...formFormats, fmt]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError('O nome do desenho ou matriz é obrigatório.');
      return;
    }
    if (formFormats.length === 0) {
      setFormError('Selecione pelo menos um formato de máquina (Ex: PES, DST).');
      return;
    }

    const icons = ['🧸', '💍', '🌸', '🦷', '🤍', '🎅', '🦉', '👶', '🏢', '👕', '👑', '🦋', '🎈', '🎨'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    const newMatrix: ArtMatrix = {
      id: 'm_' + Date.now(),
      name: formName,
      category: formCategory,
      formats: formFormats,
      photoUrl: randomIcon,
      pointsCount: Number(formPoints),
      notes: formNotes,
      createdAt: new Date().toISOString().split('T')[0]
    };

    onAddMatrix(newMatrix);
    setIsFormOpen(false);

    // Reset
    setFormName('');
    setFormNotes('');
    setFormFormats(['PES', 'DST']);
    setFormError('');
  };

  const handleSimulateDownload = (matrix: ArtMatrix, format: string) => {
    alert(`Transferindo arquivo compilado "${matrix.name}.${format.toLowerCase()}" direto para o Pen Drive da máquina de Bordar Brother/Janome!`);
  };

  return (
    <div className="space-y-6 text-left animate-fade-in" id="gallery_tab">
      
      {/* Banner Superior da Galeria */}
      <div className="p-5 bg-white border border-gray-100 rounded-2xl shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-1">
          <h2 className="text-base font-extrabold text-indigo-950 flex items-center gap-1.5 font-sans">
            <FolderOpen className="h-5 w-5 text-indigo-600" /> Catálogo de Arquivos e Matrizes de Bordado
          </h2>
          <p className="text-2xs text-gray-400">Armazene desenhos validados em formato técnico para poupar tempo de digitalização no dia a dia</p>
        </div>

        {/* Categoria Actions e Novo Desenho */}
        <div className="shrink-0 flex items-center gap-2">
          {/* Caixa de Busca */}
          <div className="relative shrink-0 w-full sm:w-48">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-gray-400" />
            <input 
              type="text" 
              placeholder="Buscar matriz..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-xs text-indigo-950 border border-gray-200 rounded-lg w-full focus:border-indigo-400 focus:outline-hidden"
            />
          </div>

          <button
            onClick={() => setIsFormOpen(true)}
            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-xs whitespace-nowrap"
          >
            <Plus className="h-4 w-4" /> Cadastrar Desenho
          </button>
        </div>
      </div>

      {/* Tabs Filtro Categorias da Galeria */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setCategoryFilter('all')}
          className={`px-3 py-1 text-2xs font-semibold rounded-md ${
            categoryFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-500'
          }`}
        >
          Ver Todas ({matrices.length})
        </button>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-2.5 py-1 text-2xs font-semibold rounded-md ${
              categoryFilter === cat ? 'bg-indigo-600 text-white' : 'bg-white hover:bg-slate-50 border border-slate-100 text-slate-400'
            }`}
          >
            {cat} ({matrices.filter(m => m.category === cat).length})
          </button>
        ))}
      </div>

      {/* Grid de Cartões de Matriz Estilizados */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" id="matrices_cards_grid">
        {filteredMatrices.length === 0 ? (
          <div className="py-20 text-center text-gray-400 text-xs italic col-span-full bg-white border border-gray-100 rounded-2xl">
            Nenhuma matriz cadastrada nessa categoria ainda.
          </div>
        ) : (
          filteredMatrices.map((matrix) => {
            return (
              <div 
                key={matrix.id}
                className="bg-white border border-slate-100 hover:border-indigo-150 rounded-2xl p-4 flex flex-col justify-between shadow-xs hover:shadow-xs group transition"
              >
                {/* Visual Preview Box */}
                <div className="h-32 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center relative overflow-hidden group-hover:bg-indigo-50/20 transition duration-300">
                  <span className="text-4xl filter drop-shadow-md select-none group-hover:scale-110 transition duration-300">
                    {matrix.photoUrl || '🧵'}
                  </span>
                  
                  {/* Category overlay */}
                  <span className="absolute left-2 top-2 px-1.5 py-0.5 rounded-sm bg-indigo-50 text-indigo-805 text-4xs font-extrabold font-mono border border-indigo-100">
                    {matrix.category}
                  </span>

                  {/* Points count overlay */}
                  {matrix.pointsCount && (
                    <span className="absolute right-2 bottom-2 px-1.5 py-0.5 rounded-sm bg-slate-800/90 text-white text-4xs font-mono font-bold">
                      {matrix.pointsCount.toLocaleString()} pts
                    </span>
                  )}
                </div>

                {/* Conteúdo Informativo */}
                <div className="space-y-1.5 text-left mt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-gray-850 group-hover:text-indigo-650 transition truncate" title={matrix.name}>{matrix.name}</h4>
                    <p className="text-3xs text-gray-400 h-9 line-clamp-2 mt-1 leading-normal italic" title={matrix.notes}>
                      {matrix.notes ? `"${matrix.notes}"` : 'Sem anotações complementares de matriz.'}
                    </p>
                  </div>

                  {/* Formatos e Baixar para Pen drive */}
                  <div className="pt-3 border-t border-dashed border-gray-100 mt-2 space-y-1.5">
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className="text-4xs text-gray-410 font-bold uppercase font-mono mr-1">Formatos:</span>
                      {matrix.formats.map(f => (
                        <button
                          key={f}
                          onClick={() => handleSimulateDownload(matrix, f)}
                          className="px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 text-4xs font-extrabold font-mono transition cursor-pointer"
                          title={`Baixar formato .${f}`}
                        >
                          .{f}
                        </button>
                      ))}
                    </div>

                    <p className="text-4xs text-gray-400">Adicionado em: {matrix.createdAt ? matrix.createdAt.split('-').reverse().join('/') : 'Recentemente'}</p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* DIALOG CADASTRO DE DESENHO OU FORMATO MATRIZ */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in" id="matrix_upload_modal">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-xl text-left max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-3 border-b border-gray-100 mb-4 animate-fade-in">
              <h3 className="font-extrabold text-base text-gray-800">Homologar Nova Matriz</h3>
              <button onClick={() => setIsFormOpen(false)} className="p-1 text-gray-400 hover:text-gray-600 rounded-md cursor-pointer">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl">
                  {formError}
                </div>
              )}

              {/* Nome do Desenho */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Título do Desenho / Personagem *</label>
                <input 
                  type="text" 
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ex: Ursinho Puff Segurando Balão"
                  className="w-full p-2 text-sm border border-gray-200 rounded-lg font-medium shadow-3xs"
                  required
                />
              </div>

              {/* Grid Categoria & Pontos */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600">Categoria Geral</label>
                  <select 
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ArtMatrix['category'])}
                    className="w-full p-2 border border-gray-200 bg-white rounded-lg text-xs"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-600 font-sans">Contagem de Pontos</label>
                  <input 
                    type="number" 
                    min={100}
                    step={100}
                    value={formPoints}
                    onChange={(e) => setFormPoints(Number(e.target.value))}
                    className="w-full p-2 border border-gray-200 rounded-lg text-xs font-mono"
                  />
                </div>
              </div>

              {/* Formatos de Arquivo Compatíveis */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600 block mb-1">Formatos de Máquina Disponíveis *</label>
                <div className="flex flex-wrap gap-1.5">
                  {availableFormats.map(fmt => {
                    const active = formFormats.includes(fmt);
                    return (
                      <button
                        type="button"
                        key={fmt}
                        onClick={() => handleToggleFormat(fmt)}
                        className={`px-3 py-1 text-2xs font-bold rounded-md border transition cursor-pointer ${
                          active 
                            ? 'bg-amber-100/80 border-amber-300 text-amber-900 font-black' 
                            : 'bg-white border-gray-250 text-gray-500 hover:border-gray-350 shadow-3xs'
                        }`}
                      >
                        .{fmt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Simulação de Drag & Drop Arquivo de Bordado */}
              <div className="border border-dashed border-gray-250 hover:border-indigo-400 bg-slate-50/40 p-4 rounded-xl text-center space-y-1.5 group cursor-pointer transition">
                <UploadCloud className="h-7 w-7 text-gray-300 group-hover:text-indigo-500 mx-auto transition" />
                <p className="text-xs font-semibold text-gray-600">Carregar arquivo .DST, .PES, .EXP</p>
                <p className="text-3xs text-gray-400">Arraste os arquivos de matriz gerados no Wilcom/Embird para armazenar o backup na nuvem do Ateliê.</p>
              </div>

              {/* Anotações complementares/Dicas de Produção */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-gray-600">Anotações / Dicas de Costura (Opcional)</label>
                <textarea 
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={2}
                  placeholder="Ex: Exige agulha grossa de ponta redonda. Se usar em plush, adicione plástico solubilizado por cima."
                  className="w-full p-2 text-xs border border-gray-200 rounded-lg resize-none"
                />
              </div>

              {/* Ações de Cadastro */}
              <div className="flex justify-end gap-2 pt-3 border-t border-gray-150">
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg cursor-pointer shadow-3xs"
                >
                  Confirmar Backup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
