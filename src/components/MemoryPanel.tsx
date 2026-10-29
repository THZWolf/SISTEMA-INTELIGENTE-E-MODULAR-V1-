import { useState, useMemo } from 'react';
import { 
  Database, 
  Layers, 
  Trash2, 
  Search, 
  Clock, 
  TrendingUp,
  Filter,
  Calendar,
  ArrowUpDown,
  X,
  AlertCircle
} from 'lucide-react';
import { SavedCase } from '../types';
import TimelineTrendView from './TimelineTrendView';

interface MemoryPanelProps {
  historyList: SavedCase[];
  onClearHistory: () => void;
  isLoading: boolean;
  onSelectSavedCase: (problemText: string) => void;
  language?: string;
}

export default function MemoryPanel({ 
  historyList, 
  onClearHistory, 
  isLoading,
  onSelectSavedCase,
  language = 'pt'
}: MemoryPanelProps) {
  const [activeTab, setActiveTab] = useState<'postgres' | 'timeline' | 'qdrant'>('timeline');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDateFilter, setSelectedDateFilter] = useState<'all' | 'today' | '24h' | '7d'>('all');
  const [selectedUrgency, setSelectedUrgency] = useState('all');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Translations dictionary for MemoryPanel
  const labels: Record<string, any> = {
    pt: {
      pgTab: "PostgreSQL (Estrutural)",
      timelineTab: "Linha do Tempo (Tendência)",
      qdTab: "Qdrant (Vetorial)",
      clear: "Limpar Tudo",
      searchPlaceholder: "Buscar por sintoma, solução, categoria ou ID...",
      emptyHistory: "Nenhum histórico estruturado encontrado.",
      noResultsFiltered: "Nenhum caso corresponde aos filtros selecionados.",
      resimulate: "Re-simular →",
      vectorParams: "Parâmetros de Embedding Vetorial",
      statusOnline: "ONLINE // 4096 dimensões",
      vectorDesc: "Os problemas são vetorizados em embeddings densos de alta fidelidade e depositados no Qdrant para evitar a re-resolução de causas comuns. Erros próximos indicam similaridade de falha arquitetônica.",
      indicesTitle: "Índices de Vizinhança (Qdrant Payloads)",
      filterCategory: "Tipo de Falha",
      allCategories: "Todas as Categorias",
      filterDate: "Data de Resolução",
      dateAll: "Todas as Datas",
      dateToday: "Hoje",
      date24h: "Últimas 24h",
      date7d: "Últimos 7 dias",
      filterUrgency: "Gravidade",
      urgencyAll: "Todas Gravidades",
      urgencyCritical: "Crítica",
      urgencyHigh: "Alta",
      urgencyNormal: "Normal / Média",
      sortNewest: "Mais Recentes",
      sortOldest: "Mais Antigos",
      showing: "Exibindo",
      of: "de",
      cases: "casos resolvidos",
      clearFilters: "Limpar Filtros"
    },
    en: {
      pgTab: "PostgreSQL (Structural)",
      timelineTab: "Timeline (Trend)",
      qdTab: "Qdrant (Vector)",
      clear: "Clear All",
      searchPlaceholder: "Search by symptom, solution, category or ID...",
      emptyHistory: "No structured history logs found.",
      noResultsFiltered: "No cases match the selected filters.",
      resimulate: "Re-simulate →",
      vectorParams: "Vector Embedding Parameters",
      statusOnline: "ONLINE // 4096 dimensions",
      vectorDesc: "Problems are vectorized into high-fidelity dense embeddings and deposited in Qdrant to avoid re-resolving common failures. Close errors indicate architectural failure similarity.",
      indicesTitle: "Neighborhood Indexes (Qdrant Payloads)",
      filterCategory: "Failure Type",
      allCategories: "All Categories",
      filterDate: "Resolution Date",
      dateAll: "All Dates",
      dateToday: "Today",
      date24h: "Last 24h",
      date7d: "Last 7 days",
      filterUrgency: "Urgency",
      urgencyAll: "All Urgencies",
      urgencyCritical: "Critical",
      urgencyHigh: "High",
      urgencyNormal: "Normal / Medium",
      sortNewest: "Newest First",
      sortOldest: "Oldest First",
      showing: "Showing",
      of: "of",
      cases: "resolved cases",
      clearFilters: "Clear Filters"
    },
    es: {
      pgTab: "PostgreSQL (Estructural)",
      timelineTab: "Línea de Tiempo (Tendencia)",
      qdTab: "Qdrant (Vectorial)",
      clear: "Limpiar Todo",
      searchPlaceholder: "Buscar por síntoma, solución, categoría o ID...",
      emptyHistory: "No se encontraron historiales estructurados.",
      noResultsFiltered: "Ningún caso coincide con los filtros seleccionados.",
      resimulate: "Re-simular →",
      vectorParams: "Parámetros de Embedding Vectorial",
      statusOnline: "ONLINE // 4096 dimensiones",
      vectorDesc: "Los problemas se vectorizan en embeddings densos de alta fidelidad y se guardan en Qdrant para evitar resolver de nuevo fallos comunes.",
      indicesTitle: "Índices de Vecindad (Qdrant Payloads)",
      filterCategory: "Tipo de Fallo",
      allCategories: "Todas las Categorías",
      filterDate: "Fecha de Resolución",
      dateAll: "Todas las Fechas",
      dateToday: "Hoy",
      date24h: "Últimas 24h",
      date7d: "Últimos 7 días",
      filterUrgency: "Gravedad",
      urgencyAll: "Todas las Gravedades",
      urgencyCritical: "Crítica",
      urgencyHigh: "Alta",
      urgencyNormal: "Normal / Media",
      sortNewest: "Más Recientes",
      sortOldest: "Más Antiguos",
      showing: "Mostrando",
      of: "de",
      cases: "casos resueltos",
      clearFilters: "Limpiar Filtros"
    },
    fr: {
      pgTab: "PostgreSQL (Structurel)",
      timelineTab: "Chronologie (Tendance)",
      qdTab: "Qdrant (Vectoriel)",
      clear: "Tout Effacer",
      searchPlaceholder: "Rechercher par symptôme, solution, catégorie ou ID...",
      emptyHistory: "Aucun historique structuré trouvé.",
      noResultsFiltered: "Aucun cas ne correspond aux filtres sélectionnés.",
      resimulate: "Ré-simuler →",
      vectorParams: "Paramètres de l'Embedding Vectoriel",
      statusOnline: "ONLINE // 4096 dimensions",
      vectorDesc: "Les problèmes sont vectorisés en embeddings denses et déposés dans Qdrant pour éviter de résoudre à nouveau des pannes courantes.",
      indicesTitle: "Index de Voisinage (Qdrant Payloads)",
      filterCategory: "Type de Panne",
      allCategories: "Toutes les Catégories",
      filterDate: "Date de Résolution",
      dateAll: "Toutes les Dates",
      dateToday: "Aujourd'hui",
      date24h: "Dernières 24h",
      date7d: "7 derniers jours",
      filterUrgency: "Gravité",
      urgencyAll: "Toutes Gravités",
      urgencyCritical: "Critique",
      urgencyHigh: "Élevée",
      urgencyNormal: "Normale / Moyenne",
      sortNewest: "Plus Récents",
      sortOldest: "Plus Anciens",
      showing: "Affichage de",
      of: "sur",
      cases: "cas résolus",
      clearFilters: "Effacer les Filtres"
    },
    de: {
      pgTab: "PostgreSQL (Strukturell)",
      timelineTab: "Zeitachse (Trend)",
      qdTab: "Qdrant (Vektor)",
      clear: "Alles Löschen",
      searchPlaceholder: "Nach Symptom, Lösung, Kategorie oder ID suchen...",
      emptyHistory: "Keine strukturierten Verlaufsprotokolle gefunden.",
      noResultsFiltered: "Keine Fälle entsprechen den ausgewählten Filtern.",
      resimulate: "Neu simulieren →",
      vectorParams: "Vektor-Embedding-Parameter",
      statusOnline: "ONLINE // 4096 Dimensionen",
      vectorDesc: "Probleme werden in hochpräzise dichte Einbettungen vektorisiert und in Qdrant hinterlegt, um eine erneute Behebung bekannter Fehler zu vermeiden.",
      indicesTitle: "Nachbarschaftsindizes (Qdrant Payloads)",
      filterCategory: "Fehlertyp",
      allCategories: "Alle Kategorien",
      filterDate: "Lösungsdatum",
      dateAll: "Alle Daten",
      dateToday: "Heute",
      date24h: "Letzte 24 Std.",
      date7d: "Letzte 7 Tage",
      filterUrgency: "Dringlichkeit",
      urgencyAll: "Alle Schweregrade",
      urgencyCritical: "Kritisch",
      urgencyHigh: "Hoch",
      urgencyNormal: "Normal / Mittel",
      sortNewest: "Neueste zuerst",
      sortOldest: "Älteste zuerst",
      showing: "Anzeige von",
      of: "von",
      cases: "gelösten Fällen",
      clearFilters: "Filter zurücksetzen"
    },
    ja: {
      pgTab: "PostgreSQL (構造履歴)",
      timelineTab: "タイムライン (傾向)",
      qdTab: "Qdrant (ベクトル)",
      clear: "すべてクリア",
      searchPlaceholder: "症状、解決策、カテゴリまたはIDで検索...",
      emptyHistory: "ログ履歴は見つかりませんでした。",
      noResultsFiltered: "選択したフィルタに一致するケースはありません。",
      resimulate: "再シミュレーション →",
      vectorParams: "ベクトル埋め込みパラメータ",
      statusOnline: "ONLINE // 4096次元",
      vectorDesc: "問題は高精度な高密度埋め込みベクトルに変換され、一般的な障害の再発生を防ぐためにQdrantに保存されます。",
      indicesTitle: "近傍ベクトルインデックス (Qdrant Payloads)",
      filterCategory: "障害種別",
      allCategories: "すべてのカテゴリ",
      filterDate: "解決日時",
      dateAll: "すべての日時",
      dateToday: "本日",
      date24h: "過去24時間",
      date7d: "過去7日間",
      filterUrgency: "緊急度",
      urgencyAll: "すべての緊急度",
      urgencyCritical: "重大",
      urgencyHigh: "高",
      urgencyNormal: "中 / 通常",
      sortNewest: "新しい順",
      sortOldest: "古い順",
      showing: "表示中:",
      of: "/",
      cases: "件の解決済みケース",
      clearFilters: "フィルタをリセット"
    }
  };

  const t = labels[language] || labels.pt;

  // Extract unique categories dynamically from historyList
  const dynamicCategories = useMemo(() => {
    const cats = new Set<string>();
    historyList.forEach(item => {
      if (item.category && item.category.trim()) {
        cats.add(item.category.trim());
      }
    });
    return Array.from(cats);
  }, [historyList]);

  // Combined search, category, urgency and date filter
  const filteredHistory = useMemo(() => {
    const now = Date.now();
    return historyList
      .filter(item => {
        // Text Search
        if (searchTerm.trim()) {
          const s = searchTerm.toLowerCase();
          const matchProblem = item.problem?.toLowerCase().includes(s);
          const matchCategory = item.category?.toLowerCase().includes(s);
          const matchSolution = item.final_solution?.toLowerCase().includes(s);
          const matchId = item.id?.toLowerCase().includes(s);
          if (!matchProblem && !matchCategory && !matchSolution && !matchId) {
            return false;
          }
        }

        // Category Filter
        if (selectedCategory !== 'all') {
          if (item.category?.toLowerCase() !== selectedCategory.toLowerCase()) {
            return false;
          }
        }

        // Urgency Filter
        if (selectedUrgency !== 'all') {
          if (selectedUrgency === 'critical') {
            const isCrit = item.urgency === 'Crítica' || item.urgency === 'Critical';
            if (!isCrit) return false;
          } else if (selectedUrgency === 'high') {
            const isHigh = item.urgency === 'Alta' || item.urgency === 'High';
            if (!isHigh) return false;
          } else if (selectedUrgency === 'normal') {
            const isNormal = item.urgency !== 'Crítica' && item.urgency !== 'Critical' && item.urgency !== 'Alta' && item.urgency !== 'High';
            if (!isNormal) return false;
          }
        }

        // Resolution Date Filter
        if (selectedDateFilter !== 'all') {
          const itemTime = new Date(item.timestamp).getTime();
          if (selectedDateFilter === 'today') {
            const isToday = new Date(item.timestamp).toDateString() === new Date().toDateString();
            if (!isToday) return false;
          } else if (selectedDateFilter === '24h') {
            if (now - itemTime > 24 * 60 * 60 * 1000) return false;
          } else if (selectedDateFilter === '7d') {
            if (now - itemTime > 7 * 24 * 60 * 60 * 1000) return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
      });
  }, [historyList, searchTerm, selectedCategory, selectedUrgency, selectedDateFilter, sortOrder]);

  const hasActiveFilters = searchTerm.trim() !== '' || selectedCategory !== 'all' || selectedDateFilter !== 'all' || selectedUrgency !== 'all';

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedDateFilter('all');
    setSelectedUrgency('all');
    setSortOrder('desc');
  };

  // Simulated static Qdrant Vector coordinates for 2D embedding space scatter visualization
  const vectorCollections = [
    { label: "Black Friday I/O bottleneck", x: 34, y: 78, category: "Banco de Dados", score: "0.94 Match" },
    { label: "OOM Heap stack leak", x: 82, y: 21, category: "Vazamento Memória", score: "0.89 Match" },
    { label: "Estouro de timeout de rede CDN", x: 15, y: -45, category: "Latência/Rede", score: "0.82 Match" },
    { label: "CPU spikes em loop assíncrono", x: -65, y: 12, category: "Performance Kernels", score: "0.78 Match" },
    { label: "Falta de swap no Host Proxmox", x: -20, y: -58, category: "Máquina Virtual", score: "0.71 Match" },
    { label: "Erro de assinatura SSL expirada", x: 92, y: -72, category: "Segurança", score: "0.68 Match" },
  ];

  return (
    <div id="memory-state-engine" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col h-[540px]">
      
      {/* Tab select and general info */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-3.5 mb-3.5 gap-2">
        <div className="flex flex-wrap gap-1.5">
          {/* Timeline & Trend Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('timeline')}
            aria-pressed={activeTab === 'timeline'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'timeline'
                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-800/60 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <TrendingUp size={14} className="text-emerald-400" />
            {t.timelineTab}
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          {/* PostgreSQL Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('postgres')}
            aria-pressed={activeTab === 'postgres'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'postgres'
                ? 'bg-blue-950/40 text-blue-400 border border-blue-800/60 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Database size={14} />
            {t.pgTab}
            {historyList.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 bg-blue-900/60 text-blue-300 text-[10px] rounded-full font-mono">
                {historyList.length}
              </span>
            )}
          </button>
          
          {/* Qdrant Vector Tab */}
          <button
            type="button"
            onClick={() => setActiveTab('qdrant')}
            aria-pressed={activeTab === 'qdrant'}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'qdrant'
                ? 'bg-indigo-950/40 text-indigo-400 border border-indigo-800/65 shadow-inner'
                : 'text-slate-400 hover:text-slate-200 border border-transparent'
            }`}
          >
            <Layers size={14} />
            {t.qdTab}
          </button>
        </div>

        {activeTab === 'postgres' && historyList.length > 0 && (
          <button
            type="button"
            onClick={onClearHistory}
            disabled={isLoading}
            aria-label={t.clear}
            className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 transition-all font-mono hover:bg-red-950/20 px-2 py-1 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 size={12} />
            {t.clear}
          </button>
        )}
      </div>

      {/* Tab Contents */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'timeline' ? (
          /* Timeline & Evolution Trend Graph */
          <TimelineTrendView 
            historyList={historyList}
            onSelectSavedCase={onSelectSavedCase}
            language={language}
          />
        ) : activeTab === 'postgres' ? (
          /* PostgreSQL Relational history log list */
          <div className="flex flex-col h-full overflow-hidden">
            
            {/* Search Input Bar with Clear Button */}
            <div className="relative mb-2 flex-shrink-0">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Search size={14} />
              </span>
              <input
                id="memory-search-input"
                name="memorySearch"
                type="text"
                aria-label={t.searchPlaceholder}
                placeholder={t.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-8 py-1.5 bg-slate-950 border border-slate-800 text-slate-200 rounded-lg text-xs font-mono focus:outline-none focus:border-indigo-600 transition-colors placeholder-slate-600"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm('')}
                  aria-label="Limpar termo de busca"
                  className="absolute inset-y-0 right-0 flex items-center pr-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Filter Bar: Category, Date, Urgency, Sort Order */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mb-2.5 flex-shrink-0 font-mono text-[11px]">
              {/* Category (Failure Type) Filter */}
              <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-md px-2 py-1">
                <Filter size={11} className="text-indigo-400 mr-1.5 flex-shrink-0" />
                <select
                  id="filter-category-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  aria-label={t.filterCategory}
                  className="bg-transparent text-slate-300 text-[11px] font-mono focus:outline-none w-full cursor-pointer truncate"
                >
                  <option value="all" className="bg-slate-900 text-slate-200">{t.allCategories}</option>
                  {dynamicCategories.map(cat => (
                    <option key={cat} value={cat} className="bg-slate-900 text-slate-200">{cat}</option>
                  ))}
                </select>
              </div>

              {/* Resolution Date Filter */}
              <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-md px-2 py-1">
                <Calendar size={11} className="text-cyan-400 mr-1.5 flex-shrink-0" />
                <select
                  id="filter-date-select"
                  value={selectedDateFilter}
                  onChange={(e) => setSelectedDateFilter(e.target.value as any)}
                  aria-label={t.filterDate}
                  className="bg-transparent text-slate-300 text-[11px] font-mono focus:outline-none w-full cursor-pointer truncate"
                >
                  <option value="all" className="bg-slate-900 text-slate-200">{t.dateAll}</option>
                  <option value="today" className="bg-slate-900 text-slate-200">{t.dateToday}</option>
                  <option value="24h" className="bg-slate-900 text-slate-200">{t.date24h}</option>
                  <option value="7d" className="bg-slate-900 text-slate-200">{t.date7d}</option>
                </select>
              </div>

              {/* Urgency / Severity Filter */}
              <div className="relative flex items-center bg-slate-950 border border-slate-800 rounded-md px-2 py-1">
                <AlertCircle size={11} className="text-amber-400 mr-1.5 flex-shrink-0" />
                <select
                  id="filter-urgency-select"
                  value={selectedUrgency}
                  onChange={(e) => setSelectedUrgency(e.target.value)}
                  aria-label={t.filterUrgency}
                  className="bg-transparent text-slate-300 text-[11px] font-mono focus:outline-none w-full cursor-pointer truncate"
                >
                  <option value="all" className="bg-slate-900 text-slate-200">{t.urgencyAll}</option>
                  <option value="critical" className="bg-slate-900 text-slate-200">{t.urgencyCritical}</option>
                  <option value="high" className="bg-slate-900 text-slate-200">{t.urgencyHigh}</option>
                  <option value="normal" className="bg-slate-900 text-slate-200">{t.urgencyNormal}</option>
                </select>
              </div>

              {/* Sort Order (Newest / Oldest) */}
              <button
                type="button"
                onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
                aria-label={`Ordenar por data: ${sortOrder === 'desc' ? t.sortNewest : t.sortOldest}`}
                className="flex items-center justify-between bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 rounded-md px-2 py-1 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-1.5 truncate">
                  <ArrowUpDown size={11} className="text-emerald-400 flex-shrink-0" />
                  <span className="truncate">{sortOrder === 'desc' ? t.sortNewest : t.sortOldest}</span>
                </div>
              </button>
            </div>

            {/* Results Count & Filter Reset Bar */}
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 px-1 mb-2 flex-shrink-0">
              <span>
                {t.showing} <strong className="text-slate-300">{filteredHistory.length}</strong> {t.of} <strong className="text-slate-300">{historyList.length}</strong> {t.cases}
              </span>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <X size={10} />
                  <span>{t.clearFilters}</span>
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredHistory.length === 0 ? (
                <div className="h-44 flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-2 text-center p-4">
                  <Database size={24} className="text-slate-700" />
                  <span>{hasActiveFilters ? t.noResultsFiltered : t.emptyHistory}</span>
                  {hasActiveFilters && (
                    <button
                      type="button"
                      onClick={handleResetFilters}
                      className="mt-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono transition-colors cursor-pointer"
                    >
                      {t.clearFilters}
                    </button>
                  )}
                </div>
              ) : (
                filteredHistory.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-3 bg-slate-950 rounded-lg border border-slate-800/60 hover:border-slate-700/60 transition-all group relative flex flex-col justify-between"
                  >
                    <div className="absolute top-2 right-2 text-[9px] text-slate-500 font-mono flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      <span className="text-slate-600 hidden sm:inline">
                        • {new Date(item.timestamp).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <span className={`text-[8px] uppercase tracking-wider font-semibold font-mono px-1.5 py-0.5 rounded ${
                        item.urgency === 'Crítica' || item.urgency === 'Critical'
                          ? 'bg-red-950/40 text-red-400 border border-red-900/40' 
                          : item.urgency === 'Alta' || item.urgency === 'High'
                            ? 'bg-amber-950/40 text-amber-400 border border-amber-900/40'
                            : 'bg-indigo-950/40 text-indigo-400 border border-indigo-900/40'
                      }`}>
                        {item.urgency}
                      </span>
                      
                      <span className="text-[10px] text-indigo-400 font-mono ml-2">
                        {item.category}
                      </span>

                      <h5 className="text-xs font-semibold text-slate-200 mt-2 font-mono line-clamp-1">
                        {item.problem}
                      </h5>

                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {item.final_solution}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-900 flex justify-between items-center">
                      <span className="text-[9px] text-slate-500 font-mono">
                        ID: {item.id}
                      </span>
                      
                      <button 
                        type="button"
                        onClick={() => onSelectSavedCase(item.problem)}
                        aria-label={`${t.resimulate}: ${item.problem}`}
                        className="text-[9px] text-blue-400 hover:text-blue-300 font-mono tracking-tight flex items-center gap-0.5 cursor-pointer"
                      >
                        {t.resimulate}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          /* Qdrant Vector Cloud Scatter Simulator */
          <div className="flex flex-col h-full overflow-hidden">
            <div className="bg-slate-950 border border-slate-800/60 rounded-lg p-3 mb-4 flex-shrink-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-widest">
                  {t.vectorParams}
                </span>
                <span className="text-[9px] font-mono text-emerald-500">
                  {t.statusOnline}
                </span>
              </div>
              <div className="text-[11px] text-slate-400 leading-normal font-mono">
                {t.vectorDesc}
              </div>
            </div>

            {/* Scatter layout design using SVG and raw tags */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg h-44 relative mb-4 p-2 flex items-center justify-center overflow-hidden flex-shrink-0">
              {/* Reference Grid lines */}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 pointer-events-none opacity-20">
                <div className="border-r border-slate-800"></div>
                <div className="border-r border-slate-800"></div>
                <div className="border-r border-slate-800"></div>
                <div className="border-b border-slate-800 col-span-4"></div>
                <div className="border-b border-slate-800 col-span-4 flex-1"></div>
                <div className="border-b border-slate-800 col-span-4 flex-1"></div>
              </div>

              {/* Central axis lines */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-indigo-500/20 pointer-events-none"></div>
              <div className="absolute top-1/2 left-0 right-0 h-px bg-indigo-500/20 pointer-events-none"></div>

              {/* Simulated active query circle when simulation solves */}
              <div className="absolute w-24 h-24 rounded-full border border-indigo-500/10 bg-indigo-500/5 animate-pulse top-8 left-1/3"></div>

              {/* Scatter Points */}
              {vectorCollections.map((pt, i) => {
                // translate coordinate ratios to scatter box percentages
                const leftPos = `${50 + pt.x / 2.3}%`;
                const topPos = `${50 - pt.y / 2.3}%`;

                return (
                  <div
                    key={i}
                    className="absolute cursor-help group/point"
                    style={{ left: leftPos, top: topPos }}
                  >
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-30"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-indigo-500 hover:bg-emerald-500 transition-colors border border-slate-900 shadow"></span>
                    </span>
                    
                    {/* Tiny hover metadata tooltip card */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-white text-[9px] font-mono w-44 shadow-xl pointer-events-none opacity-0 group-hover/point:opacity-100 transition-opacity z-20">
                      <div className="font-semibold text-slate-100 truncate">{pt.label}</div>
                      <div className="text-slate-400 mt-1 flex justify-between">
                        <span>Coord: [{pt.x}, {pt.y}]</span>
                        <span className="text-indigo-400 font-semibold">{pt.score}</span>
                      </div>
                      <div className="text-emerald-400 mt-0.5 italic">{pt.category}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* List of active database index structures */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              <div className="text-[10px] font-mono text-slate-400 uppercase tracking-widest mb-1 select-none">
                {t.indicesTitle}
              </div>
              {vectorCollections.slice(0, 4).map((col, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs font-mono p-2 rounded bg-slate-950 border border-slate-800/40 hover:border-indigo-900/40 transition-all">
                  <div className="flex items-center gap-2 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    <span className="text-slate-300 truncate">{col.label}</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 font-semibold flex-shrink-0 ml-1">
                    {col.score}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
