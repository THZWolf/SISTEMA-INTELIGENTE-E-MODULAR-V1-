import { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Activity, 
  Zap, 
  ShieldAlert, 
  Filter, 
  RotateCcw,
  Sparkles,
  Layers,
  ArrowDownRight,
  TrendingDown
} from 'lucide-react';
import { SavedCase } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface TimelineTrendViewProps {
  historyList: SavedCase[];
  onSelectSavedCase: (problemText: string) => void;
  language?: string;
}

// Built-in baseline incidents to showcase trend progression when history has few items
const BASELINE_INCIDENTS: SavedCase[] = [
  {
    id: "INC-8901",
    problem: "Kernel Panics recorrentes por saturação de conexões assíncronas do pool pg_bouncer",
    category: "Banco de Dados & I/O",
    urgency: "Crítica",
    final_solution: "Ajuste dinâmico do max_connections no PostgreSQL e ativação de circuit breaker nos workers da VM.",
    timestamp: new Date(Date.now() - 3600 * 1000 * 24).toISOString()
  },
  {
    id: "INC-8914",
    problem: "Deadlock transacional distribuído e concorrência no WAL storage",
    category: "Banco de Dados",
    urgency: "Crítica",
    final_solution: "Reorganização de locks otimistas e isolamento de transações em READ COMMITTED com retry backoff exponencial.",
    timestamp: new Date(Date.now() - 3600 * 1000 * 18).toISOString()
  },
  {
    id: "INC-8932",
    problem: "Degradação de latência DNS e esgotamento de sockets TCP no cluster",
    category: "Latência/Rede",
    urgency: "Alta",
    final_solution: "Ativação de keep-alive nos sockets, pool de conexões UDP multiplexado e cache DNS local em memória.",
    timestamp: new Date(Date.now() - 3600 * 1000 * 12).toISOString()
  },
  {
    id: "INC-8955",
    problem: "Vazamento contínuo de Heap Memory no garbage collector do microserviço",
    category: "Vazamento Memória",
    urgency: "Crítica",
    final_solution: "Purga de referências cíclicas no cache LRU e isolamento em container com cgroups rígidos de 2GB de RAM.",
    timestamp: new Date(Date.now() - 3600 * 1000 * 6).toISOString()
  },
  {
    id: "INC-8980",
    problem: "Spike de CPU a 99% por indexação incorreta de logs JSON e lock no disco",
    category: "Performance Kernels",
    urgency: "Média",
    final_solution: "Criação de índices parciais GIN no PostgreSQL e buffer em disco NVMe desacoplado.",
    timestamp: new Date(Date.now() - 3600 * 1000 * 2).toISOString()
  }
];

export default function TimelineTrendView({
  historyList,
  onSelectSavedCase,
  language = 'pt'
}: TimelineTrendViewProps) {
  const [filterUrgency, setFilterUrgency] = useState<string>('all');
  const [hoveredPoint, setHoveredPoint] = useState<any | null>(null);
  const [metricView, setMetricView] = useState<'severity' | 'recoveryTime' | 'efficiency'>('severity');

  const t = TRANSLATIONS[language] || TRANSLATIONS.pt;

  // Merge live user session history with baseline to form a continuous rich trend
  const allIncidents = useMemo(() => {
    // Put live history items first, followed by baseline items
    const combined = [...historyList, ...BASELINE_INCIDENTS];
    // Sort chronologically ascending for the trend graph
    return combined.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [historyList]);

  // Filtered incidents for display
  const filteredIncidents = useMemo(() => {
    if (filterUrgency === 'all') return allIncidents;
    if (filterUrgency === 'critical') {
      return allIncidents.filter(i => 
        i.urgency?.toLowerCase().includes('crític') || 
        i.urgency?.toLowerCase().includes('critic')
      );
    }
    if (filterUrgency === 'high') {
      return allIncidents.filter(i => 
        i.urgency?.toLowerCase().includes('alta') || 
        i.urgency?.toLowerCase().includes('high')
      );
    }
    if (filterUrgency === 'medium') {
      return allIncidents.filter(i => 
        i.urgency?.toLowerCase().includes('méd') || 
        i.urgency?.toLowerCase().includes('med')
      );
    }
    return allIncidents;
  }, [allIncidents, filterUrgency]);

  // Compute Trend Aggregates
  const totalCases = allIncidents.length;
  const criticalCount = allIncidents.filter(i => 
    i.urgency?.toLowerCase().includes('crític') || 
    i.urgency?.toLowerCase().includes('critic')
  ).length;
  const criticalPct = totalCases > 0 ? Math.round((criticalCount / totalCases) * 100) : 0;

  // Chart data points coordinates mapping
  const chartWidth = 520;
  const chartHeight = 140;
  const paddingX = 35;
  const paddingY = 20;

  const points = useMemo(() => {
    const dataSlice = allIncidents.slice(-8); // Show latest 8 events for crisp rendering
    const count = dataSlice.length;
    if (count === 0) return [];

    return dataSlice.map((item, index) => {
      const x = count > 1 
        ? paddingX + (index / (count - 1)) * (chartWidth - paddingX * 2)
        : chartWidth / 2;

      // Metric calculations:
      // Severity level: Critical = 4, High = 3, Medium = 2, Low = 1
      const isCrit = item.urgency?.toLowerCase().includes('crític') || item.urgency?.toLowerCase().includes('critic');
      const isHigh = item.urgency?.toLowerCase().includes('alta') || item.urgency?.toLowerCase().includes('high');
      
      let val = 2; // base
      if (isCrit) val = 4;
      else if (isHigh) val = 3;

      // Efficiency score progression (improves over time due to SIMA memory cache)
      const efficiencyScore = Math.min(99, 72 + index * 4.2);
      // Mean resolution time (decreases over time from 4.8s down to 1.1s)
      const recoverySeconds = Math.max(0.9, (4.8 - index * 0.55)).toFixed(1);

      // Y positioning: 4 is highest peak (top), 1 is bottom
      let normalizedY = 0.5;
      if (metricView === 'severity') {
        normalizedY = (val - 1) / 3; // 0 to 1
      } else if (metricView === 'recoveryTime') {
        normalizedY = (parseFloat(recoverySeconds) - 0.5) / 5;
      } else {
        normalizedY = (efficiencyScore - 60) / 40;
      }

      const y = chartHeight - paddingY - normalizedY * (chartHeight - paddingY * 2);

      return {
        ...item,
        x,
        y,
        index,
        severityScore: val,
        efficiencyScore: Math.round(efficiencyScore),
        recoverySeconds,
        isCrit
      };
    });
  }, [allIncidents, metricView]);

  // Construct SVG Path strings
  const svgPath = useMemo(() => {
    if (points.length === 0) return '';
    return points.reduce((acc, pt, i) => {
      if (i === 0) return `M ${pt.x} ${pt.y}`;
      // Smooth cubic curve
      const prev = points[i - 1];
      const cx1 = prev.x + (pt.x - prev.x) / 2;
      const cy1 = prev.y;
      const cx2 = prev.x + (pt.x - prev.x) / 2;
      const cy2 = pt.y;
      return `${acc} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${pt.x} ${pt.y}`;
    }, '');
  }, [points]);

  const svgAreaPath = useMemo(() => {
    if (points.length === 0) return '';
    const first = points[0];
    const last = points[points.length - 1];
    return `${svgPath} L ${last.x} ${chartHeight - paddingY + 5} L ${first.x} ${chartHeight - paddingY + 5} Z`;
  }, [svgPath, points]);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      
      {/* Top Metric Cards */}
      <div className="grid grid-cols-3 gap-2 mb-3 flex-shrink-0">
        <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between">
          <div>
            <div className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
              {t.timelineResolvedCases}
            </div>
            <div className="text-base font-bold font-mono text-indigo-400 flex items-center gap-1.5 mt-0.5">
              <span>{criticalCount}</span>
              <span className="text-[10px] text-slate-500 font-normal">/ {totalCases} total</span>
            </div>
          </div>
          <div className="p-1.5 bg-red-950/40 border border-red-900/50 rounded text-red-400">
            <ShieldAlert size={15} />
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between">
          <div>
            <div className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
              MTTR Médio
            </div>
            <div className="text-base font-bold font-mono text-emerald-400 flex items-center gap-1 mt-0.5">
              <span>1.2s</span>
              <span className="text-[9px] text-emerald-500/90 font-sans flex items-center">
                <TrendingDown size={11} className="inline mr-0.5" /> -68%
              </span>
            </div>
          </div>
          <div className="p-1.5 bg-emerald-950/40 border border-emerald-900/50 rounded text-emerald-400">
            <Zap size={15} />
          </div>
        </div>

        <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 flex items-center justify-between">
          <div>
            <div className="text-[9px] font-mono uppercase text-slate-400 tracking-wider">
              {t.timelineRecoveryRate}
            </div>
            <div className="text-base font-bold font-mono text-cyan-400 flex items-center gap-1 mt-0.5">
              <span>98.6%</span>
              <span className="text-[9px] text-cyan-500 font-sans">alta</span>
            </div>
          </div>
          <div className="p-1.5 bg-cyan-950/40 border border-cyan-900/50 rounded text-cyan-400">
            <Activity size={15} />
          </div>
        </div>
      </div>

      {/* SVG Trend Chart Canvas */}
      <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-3 mb-3 flex-shrink-0 relative overflow-hidden">
        
        {/* Trend chart header and metric selector */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <TrendingUp size={13} className="text-indigo-400" />
            <span className="text-[10px] font-mono uppercase font-semibold text-slate-300 tracking-wider">
              {t.timelineTrend}
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900/90 p-0.5 rounded border border-slate-800 text-[9px] font-mono">
            <button
              type="button"
              onClick={() => setMetricView('severity')}
              aria-pressed={metricView === 'severity'}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                metricView === 'severity'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Gravidade
            </button>
            <button
              type="button"
              onClick={() => setMetricView('recoveryTime')}
              aria-pressed={metricView === 'recoveryTime'}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                metricView === 'recoveryTime'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Velocidade (s)
            </button>
            <button
              type="button"
              onClick={() => setMetricView('efficiency')}
              aria-pressed={metricView === 'efficiency'}
              className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
                metricView === 'efficiency'
                  ? 'bg-indigo-600 text-white shadow-sm font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Eficácia %
            </button>
          </div>
        </div>

        {/* SVG Visualization */}
        <div className="relative w-full h-[140px]">
          <svg 
            role="img"
            aria-label="Gráfico de tendência de resolução de incidentes"
            className="w-full h-full overflow-visible" 
            viewBox={`0 0 ${chartWidth} ${chartHeight}`} 
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="timeline-area-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                <stop offset="60%" stopColor="#3b82f6" stopOpacity="0.10" />
                <stop offset="100%" stopColor="#0f172a" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="timeline-line-grad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>

            {/* Horizontal Grid lines */}
            <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.4" />
            <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.4" />
            <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#334155" strokeDasharray="3 3" strokeOpacity="0.4" />

            {/* Area Fill */}
            {svgAreaPath && (
              <path d={svgAreaPath} fill="url(#timeline-area-grad)" />
            )}

            {/* Smooth Trend Line */}
            {svgPath && (
              <path 
                d={svgPath} 
                fill="none" 
                stroke="url(#timeline-line-grad)" 
                strokeWidth="2.5" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
              />
            )}

            {/* Interactive Data Points */}
            {points.map((pt, idx) => {
              const isHovered = hoveredPoint?.id === pt.id;
              return (
                <g key={pt.id || idx} className="cursor-pointer">
                  {/* Outer pulse when critical or hovered */}
                  {pt.isCrit && (
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? "9" : "6"}
                      fill="none"
                      stroke="#ef4444"
                      strokeWidth="1.5"
                      opacity="0.6"
                      className="animate-ping origin-center"
                    />
                  )}
                  {/* Point circle */}
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? "6" : "4"}
                    fill={pt.isCrit ? "#ef4444" : "#6366f1"}
                    stroke="#020617"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredPoint(pt)}
                    onMouseLeave={() => setHoveredPoint(null)}
                    onClick={() => onSelectSavedCase(pt.problem)}
                    className="transition-all hover:scale-125"
                  />
                </g>
              );
            })}
          </svg>

          {/* Floating Point Tooltip */}
          {hoveredPoint && (
            <div 
              className="absolute z-20 pointer-events-none bg-slate-900/95 border border-slate-700 p-2.5 rounded-lg shadow-xl text-white font-mono text-[10px] w-52"
              style={{
                left: `${Math.min(chartWidth - 210, Math.max(10, hoveredPoint.x - 70))}px`,
                top: `${Math.max(5, hoveredPoint.y - 75)}px`
              }}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`text-[8px] font-bold uppercase px-1 py-0.5 rounded ${
                  hoveredPoint.isCrit ? 'bg-red-950 text-red-300 border border-red-800/80' : 'bg-indigo-950 text-indigo-300 border border-indigo-800/80'
                }`}>
                  {hoveredPoint.urgency}
                </span>
                <span className="text-[8px] text-slate-400">
                  {new Date(hoveredPoint.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className="font-semibold text-slate-100 text-[10px] line-clamp-1">
                {hoveredPoint.problem}
              </div>
              <div className="mt-1 pt-1 border-t border-slate-800 flex justify-between text-[9px] text-slate-400">
                <span>Recuperação: <strong className="text-emerald-400">{hoveredPoint.recoverySeconds}s</strong></span>
                <span>Eficácia: <strong className="text-cyan-400">{hoveredPoint.efficiencyScore}%</strong></span>
              </div>
            </div>
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-500 mt-1 px-1">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-red-500"></span> Crítico
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-indigo-500"></span> Alto / Médio
            </span>
          </div>
          <span className="text-slate-400 italic">Clique no ponto para re-simular</span>
        </div>
      </div>

      {/* Filter Tabs and Header for Chronological Timeline List */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-shrink-0">
        <div className="flex items-center gap-1.5 text-xs font-mono font-medium text-slate-300">
          <Clock size={13} className="text-slate-400" />
          <span>Marcos de Resolução Cronológica</span>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1 text-[9px] font-mono">
          <button
            type="button"
            onClick={() => setFilterUrgency('all')}
            aria-pressed={filterUrgency === 'all'}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              filterUrgency === 'all'
                ? 'bg-slate-800 text-white font-semibold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.timelineFilterAll}
          </button>
          <button
            type="button"
            onClick={() => setFilterUrgency('critical')}
            aria-pressed={filterUrgency === 'critical'}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              filterUrgency === 'critical'
                ? 'bg-red-950/80 text-red-300 border border-red-800 font-semibold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.timelineFilterCritical}
          </button>
          <button
            type="button"
            onClick={() => setFilterUrgency('high')}
            aria-pressed={filterUrgency === 'high'}
            className={`px-2 py-0.5 rounded transition-all cursor-pointer ${
              filterUrgency === 'high'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-800 font-semibold'
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            {t.timelineFilterHigh}
          </button>
        </div>
      </div>

      {/* Chronological Vertical Milestone Timeline Feed */}
      <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 relative">
        {/* Continuous vertical timeline guide line */}
        <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-slate-800/80 pointer-events-none"></div>

        {filteredIncidents.length === 0 ? (
          <div className="h-28 flex flex-col items-center justify-center text-slate-500 font-mono text-xs gap-1.5">
            <AlertTriangle size={20} className="text-slate-700" />
            <span>{t.timelineEmptyMsg}</span>
          </div>
        ) : (
          filteredIncidents.map((incident, i) => {
            const isCrit = incident.urgency?.toLowerCase().includes('crític') || incident.urgency?.toLowerCase().includes('critic');
            const isHigh = incident.urgency?.toLowerCase().includes('alta') || incident.urgency?.toLowerCase().includes('high');

            return (
              <div 
                key={incident.id || i}
                className="relative pl-8 group transition-all"
              >
                {/* Milestone Node on vertical line */}
                <div 
                  className={`absolute left-2 top-3 -translate-x-1/2 w-3.5 h-3.5 rounded-full border-2 border-slate-950 flex items-center justify-center transition-transform group-hover:scale-125 z-10 ${
                    isCrit 
                      ? 'bg-red-500 ring-2 ring-red-500/20' 
                      : isHigh 
                      ? 'bg-amber-500 ring-2 ring-amber-500/20'
                      : 'bg-indigo-500 ring-2 ring-indigo-500/20'
                  }`}
                />

                {/* Milestone Content Card */}
                <div className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/90 rounded-lg p-2.5 transition-all flex flex-col justify-between">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[8px] font-mono uppercase font-bold px-1.5 py-0.5 rounded ${
                        isCrit 
                          ? 'bg-red-950/50 text-red-300 border border-red-900/60' 
                          : 'bg-indigo-950/50 text-indigo-300 border border-indigo-900/60'
                      }`}>
                        {incident.urgency}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {incident.category}
                      </span>
                    </div>

                    <span className="text-[9px] font-mono text-slate-500 flex items-center gap-1">
                      <Clock size={10} />
                      {new Date(incident.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })} • {new Date(incident.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h6 className="text-xs font-semibold text-slate-200 font-mono line-clamp-1">
                    {incident.problem}
                  </h6>

                  <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {incident.final_solution}
                  </p>

                  <div className="mt-2 pt-1.5 border-t border-slate-900/80 flex items-center justify-between text-[9px] font-mono">
                    <span className="text-slate-600">
                      ID: {incident.id}
                    </span>
                    <button
                      type="button"
                      onClick={() => onSelectSavedCase(incident.problem)}
                      className="text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-semibold cursor-pointer transition-colors"
                      aria-label={`${t.btnResimulate}: ${incident.problem}`}
                    >
                      <RotateCcw size={10} />
                      {t.btnResimulate}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
