import { useState, useRef, useEffect, MouseEvent } from 'react';
import { 
  motion, 
  AnimatePresence 
} from 'motion/react';
import { 
  ShieldAlert, 
  Activity, 
  Binary, 
  Cpu, 
  KeyRound, 
  Archive, 
  Users, 
  MessageSquare,
  Network,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Zap,
  Terminal,
  Copy,
  Check,
  Radio,
  BrainCircuit,
  ArrowRightLeft,
  Workflow
} from 'lucide-react';
import { AgentThought } from '../types';

interface AgentNodeProps {
  agentsData: AgentThought[];
  activeAgentId: string | null;
  onSelectAgent: (id: string) => void;
  isLoading: boolean;
  busActive: boolean; // Tells if the RabbitMQ/Kafka message bus is routing messages
}

// Specialization metadata for enhanced telemetry display
const AGENT_METADATA: Record<string, { subsystem: string; tensorWeight: string; defaultConfidence: number }> = {
  logico: { subsystem: 'VM_RULE_ENGINE', tensorWeight: '0.96 Alpha', defaultConfidence: 97 },
  matematico: { subsystem: 'RESOURCE_CALCULUS', tensorWeight: '0.92 Beta', defaultConfidence: 95 },
  causal: { subsystem: 'FAULT_ROOT_ANALYSIS', tensorWeight: '0.94 Gamma', defaultConfidence: 98 },
  estrategico: { subsystem: 'REMEDIATION_PLANNER', tensorWeight: '0.89 Delta', defaultConfidence: 94 },
  memoria: { subsystem: 'QDRANT_VECTOR_CACHE', tensorWeight: '0.91 Epsilon', defaultConfidence: 96 },
  social: { subsystem: 'CONSENSUS_ARBITER', tensorWeight: '0.95 Zeta', defaultConfidence: 99 }
};

// Inter-agent message bus topology links (Kafka topics / RabbitMQ exchanges)
const BUS_TOPOLOGY: { from: string; to: string; topic: string; direction: 'bilateral' | 'unilateral' }[] = [
  { from: 'logico', to: 'matematico', topic: 'bus.deduction.constraints', direction: 'bilateral' },
  { from: 'logico', to: 'causal', topic: 'bus.logic.rootcause', direction: 'bilateral' },
  { from: 'causal', to: 'estrategico', topic: 'bus.fault.mitigation_plan', direction: 'bilateral' },
  { from: 'estrategico', to: 'memoria', topic: 'bus.remediation.vector_lookup', direction: 'bilateral' },
  { from: 'memoria', to: 'social', topic: 'bus.qdrant.consensus_arbitration', direction: 'bilateral' },
  { from: 'matematico', to: 'estrategico', topic: 'bus.resources.feasibility', direction: 'bilateral' },
];

export default function AgentNode({ 
  agentsData, 
  activeAgentId, 
  onSelectAgent, 
  isLoading,
  busActive 
}: AgentNodeProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [manualBusPreview, setManualBusPreview] = useState<boolean>(false);
  
  // Container & card positions for pixel-perfect dynamic SVG data flow
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const [cardPositions, setCardPositions] = useState<Record<string, { x: number; y: number; width: number; height: number; left: number; right: number; top: number; bottom: number }>>({});

  const isBusTransmitting = busActive || isLoading || manualBusPreview;

  // Dynamically measure cards coordinates relative to container
  useEffect(() => {
    const measureCards = () => {
      if (!containerRef.current) return;
      const cRect = containerRef.current.getBoundingClientRect();
      setContainerDimensions({ width: cRect.width, height: cRect.height });

      const elements = containerRef.current.querySelectorAll<HTMLElement>('[data-agent-card]');
      const posMap: Record<string, { x: number; y: number; width: number; height: number; left: number; right: number; top: number; bottom: number }> = {};

      elements.forEach((el) => {
        const id = el.getAttribute('data-agent-card');
        if (!id) return;
        const r = el.getBoundingClientRect();
        const left = r.left - cRect.left;
        const top = r.top - cRect.top;
        posMap[id] = {
          x: left + r.width / 2,
          y: top + r.height / 2,
          width: r.width,
          height: r.height,
          left,
          right: left + r.width,
          top,
          bottom: top + r.height,
        };
      });

      setCardPositions(posMap);
    };

    measureCards();

    // Use ResizeObserver for instant responsive re-alignment
    let observer: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      observer = new ResizeObserver(() => {
        measureCards();
      });
      observer.observe(containerRef.current);
    }

    window.addEventListener('resize', measureCards);
    const t1 = setTimeout(measureCards, 60);
    const t2 = setTimeout(measureCards, 320);

    return () => {
      window.removeEventListener('resize', measureCards);
      observer?.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [agentsData, activeAgentId]);

  // Map icon names from metadata
  const getAgentIcon = (id: string, colorClass: string) => {
    switch (id) {
      case 'logico': return <Binary className={colorClass} size={18} />;
      case 'matematico': return <Cpu className={colorClass} size={18} />;
      case 'causal': return <ShieldAlert className={colorClass} size={18} />;
      case 'estrategico': return <Activity className={colorClass} size={18} />;
      case 'memoria': return <Archive className={colorClass} size={18} />;
      case 'social': return <Users className={colorClass} size={18} />;
      default: return <KeyRound className={colorClass} size={18} />;
    }
  };

  const handleCopyThought = (e: MouseEvent, id: string, thought: string) => {
    e.stopPropagation();
    if (!thought) return;
    navigator.clipboard.writeText(thought);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCardClick = (id: string) => {
    // If clicking the currently active agent, collapse it; otherwise expand the new one
    if (activeAgentId === id) {
      onSelectAgent('');
    } else {
      onSelectAgent(id);
    }
  };

  // Helper to generate smooth SVG path between two cards
  const generateBusPath = (fromId: string, toId: string) => {
    const a = cardPositions[fromId];
    const b = cardPositions[toId];
    if (!a || !b) return null;

    // Horizontal connection (left col to right col in 2-column view)
    if (Math.abs(a.y - b.y) < 70 && Math.abs(a.x - b.x) > 80) {
      const isALeft = a.x < b.x;
      const x1 = isALeft ? a.right - 2 : a.left + 2;
      const y1 = a.y;
      const x2 = isALeft ? b.left + 2 : b.right - 2;
      const y2 = b.y;
      const midX = (x1 + x2) / 2;
      return {
        d: `M ${x1} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${x2} ${y2}`,
        x1, y1, x2, y2,
        midX, midY: (y1 + y2) / 2
      };
    }

    // Vertical connection (same column)
    if (Math.abs(a.x - b.x) < 80) {
      const isATop = a.y < b.y;
      const x1 = a.x;
      const y1 = isATop ? a.bottom - 2 : a.top + 2;
      const x2 = b.x;
      const y2 = isATop ? b.top + 2 : b.bottom - 2;
      const midY = (y1 + y2) / 2;
      return {
        d: `M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`,
        x1, y1, x2, y2,
        midX: (x1 + x2) / 2, midY
      };
    }

    // Diagonal / Cross-column connection
    const x1 = a.x < b.x ? a.right - 4 : a.left + 4;
    const y1 = a.y;
    const x2 = a.x < b.x ? b.left + 4 : b.right - 4;
    const y2 = b.y;
    const cx1 = x1 + (x2 - x1) * 0.4;
    const cy1 = y1 + (y2 - y1) * 0.1;
    const cx2 = x1 + (x2 - x1) * 0.6;
    const cy2 = y2 - (y2 - y1) * 0.1;
    return {
      d: `M ${x1} ${y1} C ${cx1} ${cy1}, ${cx2} ${cy2}, ${x2} ${y2}`,
      x1, y1, x2, y2,
      midX: (x1 + x2) / 2, midY: (y1 + y2) / 2
    };
  };

  return (
    <div id="agents-panel" className="flex flex-col gap-4">
      
      {/* Scoped keyframes for fluid, GPU-accelerated SVG data flow */}
      <style>{`
        @keyframes busFlowForward {
          from { stroke-dashoffset: 44; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes busFlowReverse {
          from { stroke-dashoffset: 0; }
          to { stroke-dashoffset: 44; }
        }
        @keyframes busPulseBeam {
          0%, 100% { opacity: 0.75; }
          50% { opacity: 1; }
        }
        .animate-bus-flow {
          animation: busFlowForward 1.3s linear infinite;
        }
        .animate-bus-flow-rev {
          animation: busFlowReverse 1.7s linear infinite;
        }
        .animate-bus-pulse {
          animation: busPulseBeam 2s ease-in-out infinite;
        }
      `}</style>

      {/* Broker Message Bus (Kafka / RabbitMQ Simulation) Visualizer */}
      <motion.div 
        layout
        className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Network className={`text-indigo-400 ${isBusTransmitting ? 'animate-pulse' : ''}`} size={18} />
            <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase font-mono flex items-center gap-1.5">
              Barramento de Mensagens (RabbitMQ / Apache Kafka)
              {isBusTransmitting && (
                <span className="text-[10px] text-cyan-400 font-normal lowercase tracking-normal">
                  (partições ativas)
                </span>
              )}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            {/* Interactive Toggle to simulate or preview data flow bus */}
            <button
              type="button"
              onClick={() => setManualBusPreview(!manualBusPreview)}
              className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border flex items-center gap-1.5 transition-all cursor-pointer ${
                manualBusPreview
                  ? 'bg-indigo-950/70 text-indigo-300 border-indigo-500/70 shadow-sm shadow-indigo-500/30'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
              }`}
              title="Alternar modo de simulação visual do fluxo no barramento"
            >
              <ArrowRightLeft size={10} className={manualBusPreview ? 'animate-spin' : ''} />
              <span>{manualBusPreview ? 'Fluxo Forçado ON' : 'Testar Barramento'}</span>
            </button>

            <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border flex items-center gap-1.5 ${
              isBusTransmitting 
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60 animate-pulse' 
                : 'bg-slate-950 text-slate-500 border-slate-800'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${isBusTransmitting ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
              {isBusTransmitting ? 'Transmissão Ativa' : 'Standby'}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-400 mb-2.5 font-mono leading-relaxed flex flex-wrap items-center justify-between gap-1">
          <div>
            Fluxo: <span className="text-indigo-300">Agentes</span> → <span className="text-blue-300">Núcleo Central</span> → <span className="text-cyan-300">Redistribuição Inter-Nós</span> → <span className="text-emerald-400">Consenso Adaptativo</span>.
          </div>
          {isBusTransmitting && (
            <div className="flex items-center gap-3 text-[10px] text-cyan-300/90 font-mono bg-slate-950/80 px-2 py-0.5 rounded border border-slate-800">
              <span className="flex items-center gap-1">
                <Activity size={10} className="text-emerald-400 animate-pulse" />
                <span>1,420 msg/s</span>
              </span>
              <span className="text-slate-600">|</span>
              <span className="text-indigo-300">Latência: 0.24ms</span>
              <span className="text-slate-600">|</span>
              <span className="text-emerald-400 font-semibold">ACK: 99.98%</span>
            </div>
          )}
        </div>

        {/* Animated flow dots representation */}
        <div className="h-2 bg-slate-950 rounded-full relative overflow-hidden flex items-center border border-slate-800">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-500 rounded-full"
            animate={{
              width: isBusTransmitting ? '100%' : '14%',
              opacity: isBusTransmitting ? [0.75, 1, 0.75] : 0.5
            }}
            transition={{
              duration: isBusTransmitting ? 1.4 : 0.5,
              repeat: isBusTransmitting ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>

      {/* Grid of Specialized Agents with Dynamic SVG Data Flow Connector Overlay */}
      <div className="relative" ref={containerRef}>
        
        {/* Dynamic SVG Data Bus Stream Interconnect Overlay */}
        <svg 
          className="absolute inset-0 w-full h-full pointer-events-none z-10 overflow-visible"
          style={{ minHeight: '100%' }}
        >
          <defs>
            {/* High-tech cyberpunk & enterprise gradients */}
            <linearGradient id="busGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
              <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="busGradIndigo" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#8b5cf6" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.9" />
            </linearGradient>

            <filter id="busGlow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="3.2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="packetGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="4.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Render inter-agent bus conduits */}
          {BUS_TOPOLOGY.map((link, idx) => {
            const pathInfo = generateBusPath(link.from, link.to);
            if (!pathInfo) return null;

            return (
              <g key={`bus-link-${link.from}-${link.to}-${idx}`}>
                {/* Passive underlying structural bus line */}
                <path
                  d={pathInfo.d}
                  fill="none"
                  stroke={isBusTransmitting ? '#1e293b' : '#0f172a'}
                  strokeWidth="2"
                  strokeOpacity={isBusTransmitting ? 0.8 : 0.4}
                />

                {/* Active Data Flow Line with Moving Dashes when Bus is Active */}
                {isBusTransmitting && (
                  <>
                    {/* Glowing background halo path */}
                    <path
                      d={pathInfo.d}
                      fill="none"
                      stroke="url(#busGradCyan)"
                      strokeWidth="3.5"
                      strokeOpacity="0.28"
                      filter="url(#busGlow)"
                    />

                    {/* Animated moving dashed packet carrier */}
                    <path
                      d={pathInfo.d}
                      fill="none"
                      stroke="url(#busGradCyan)"
                      strokeWidth="1.75"
                      strokeDasharray="5 7"
                      className="animate-bus-flow"
                      filter="url(#busGlow)"
                    />

                    {/* High-speed luminescent packet moving forward along path */}
                    <circle r="3.5" fill="#38bdf8" filter="url(#packetGlow)">
                      <animateMotion
                        dur={`${1.6 + (idx % 3) * 0.4}s`}
                        repeatCount="indefinite"
                        path={pathInfo.d}
                      />
                    </circle>

                    {/* Return acknowledgement packet streaming in opposite or staggered phase */}
                    <circle r="2.5" fill="#34d399" filter="url(#packetGlow)">
                      <animateMotion
                        dur={`${2.1 + (idx % 2) * 0.5}s`}
                        repeatCount="indefinite"
                        begin={`${0.5 + (idx * 0.35) % 1.2}s`}
                        path={pathInfo.d}
                      />
                    </circle>

                    {/* Connection port pins at anchors */}
                    <circle cx={pathInfo.x1} cy={pathInfo.y1} r="3" fill="#06b6d4" filter="url(#busGlow)" />
                    <circle cx={pathInfo.x2} cy={pathInfo.y2} r="3" fill="#10b981" filter="url(#busGlow)" />
                  </>
                )}
              </g>
            );
          })}

          {/* Central Message Bus Nexus Hub Marker in Center of Grid (when enough space) */}
          {containerDimensions.width > 340 && containerDimensions.height > 220 && (
            <g transform={`translate(${containerDimensions.width / 2}, ${containerDimensions.height / 2})`}>
              {/* Outer pulsing ring */}
              {isBusTransmitting && (
                <circle 
                  r="22" 
                  fill="none" 
                  stroke="#06b6d4" 
                  strokeWidth="1" 
                  strokeOpacity="0.4"
                  strokeDasharray="3 3"
                  className="animate-spin"
                  style={{ animationDuration: '8s' }}
                />
              )}
              {/* Core central broker bead */}
              <circle 
                r={isBusTransmitting ? "11" : "8"} 
                fill="#090d16" 
                stroke={isBusTransmitting ? "#38bdf8" : "#334155"} 
                strokeWidth="1.5"
                filter={isBusTransmitting ? "url(#busGlow)" : undefined}
              />
              <circle 
                r={isBusTransmitting ? "4.5" : "3"} 
                fill={isBusTransmitting ? "#22d3ee" : "#475569"} 
                className={isBusTransmitting ? "animate-ping" : ""}
              />
            </g>
          )}
        </svg>

        {/* 6 Specialized Agent Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 relative z-0">
          {agentsData.map((agent) => {
            const isSelected = activeAgentId === agent.id;
            const isProcessing = agent.status === 'processing';
            const meta = AGENT_METADATA[agent.id] || { subsystem: 'CORE_LOGIC', tensorWeight: '0.90 Alpha', defaultConfidence: 95 };
            
            let cardBorderClass = 'border-slate-800 hover:border-slate-700 bg-slate-900/60';
            let statusBadgeClass = 'bg-slate-950 text-slate-500 border-slate-800';
            let statusText = 'Em espera';
            let statusIndicatorColor = 'bg-slate-700';

            if (isProcessing) {
              cardBorderClass = 'border-blue-500/80 bg-blue-950/30 shadow-lg shadow-blue-500/20 ring-1 ring-blue-500/40';
              statusBadgeClass = 'bg-blue-950/70 text-blue-300 border-blue-500/60 shadow-sm shadow-blue-500/20';
              statusText = 'Processando Etapa';
              statusIndicatorColor = 'bg-blue-400 animate-ping';
            } else if (agent.status === 'completed' || agent.status === 'consensus') {
              cardBorderClass = 'border-emerald-700/60 bg-emerald-950/10 hover:border-emerald-600/80';
              statusBadgeClass = 'bg-emerald-950/50 text-emerald-300 border-emerald-800/80';
              statusText = agent.status === 'consensus' ? 'Consenso' : 'Analizado';
              statusIndicatorColor = 'bg-emerald-400';
            }

            if (isSelected) {
              cardBorderClass = 'border-indigo-500 bg-slate-900/95 ring-2 ring-indigo-500/40 shadow-xl shadow-indigo-950/50';
            }

            return (
              <motion.div
                key={agent.id}
                data-agent-card={agent.id}
                layout
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ 
                  opacity: 1, 
                  scale: isProcessing ? [1, 1.018, 1] : 1,
                  borderColor: isProcessing
                    ? ['rgba(59, 130, 246, 0.7)', 'rgba(99, 102, 241, 0.95)', 'rgba(59, 130, 246, 0.7)']
                    : undefined
                }}
                transition={{
                  layout: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                  opacity: { duration: 0.25 },
                  scale: isProcessing 
                    ? { repeat: Infinity, duration: 1.8, ease: "easeInOut" } 
                    : { duration: 0.2 },
                  borderColor: isProcessing 
                    ? { repeat: Infinity, duration: 1.8, ease: "easeInOut" } 
                    : { duration: 0.2 }
                }}
                onClick={() => handleCardClick(agent.id)}
                className={`text-left p-3.5 rounded-xl border transition-colors relative group flex flex-col justify-between cursor-pointer overflow-hidden ${cardBorderClass} ${
                  isSelected ? 'sm:col-span-2' : 'sm:col-span-1'
                }`}
              >
                {/* Subtle Pulsing Halo when Actively Processing a Thought Step */}
                {isProcessing && (
                  <motion.div
                    className="absolute inset-0 rounded-xl pointer-events-none"
                    animate={{
                      boxShadow: [
                        '0 0 0 0px rgba(59, 130, 246, 0.2), inset 0 0 8px rgba(59, 130, 246, 0.1)',
                        '0 0 0 4px rgba(99, 102, 241, 0.45), inset 0 0 20px rgba(99, 102, 241, 0.25)',
                        '0 0 0 0px rgba(59, 130, 246, 0.2), inset 0 0 8px rgba(59, 130, 246, 0.1)'
                      ],
                      opacity: [0.6, 1, 0.6]
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 1.8,
                      ease: "easeInOut"
                    }}
                  />
                )}

                {/* Shimmering thought step progress line at bottom of processing card */}
                {isProcessing && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-blue-950/80 overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-transparent via-cyan-400 to-indigo-500 w-1/2"
                      animate={{
                        x: ['-100%', '200%']
                      }}
                      transition={{
                        repeat: Infinity,
                        duration: 1.4,
                        ease: "easeInOut"
                      }}
                    />
                  </div>
                )}

                {/* Background ambient glow on active/hover */}
              <div className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl transition-all pointer-events-none ${
                isSelected 
                  ? 'bg-indigo-500/15' 
                  : isProcessing 
                  ? 'bg-blue-500/25 animate-pulse' 
                  : 'bg-slate-800/10 group-hover:bg-slate-800/20'
              }`} />

              {/* Top Header Row of Card */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <motion.div 
                      layout="position"
                      animate={isProcessing ? { scale: [1, 1.08, 1] } : { scale: 1 }}
                      transition={isProcessing ? { repeat: Infinity, duration: 1.8, ease: "easeInOut" } : { duration: 0.2 }}
                      className={`p-2 rounded-lg transition-colors relative ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : isProcessing 
                          ? 'bg-blue-950/80 text-blue-300 border border-blue-500/80 shadow-md shadow-blue-500/25' 
                          : agent.status === 'completed' || agent.status === 'consensus'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {getAgentIcon(agent.id, '')}
                      {isProcessing && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
                        </span>
                      )}
                    </motion.div>

                    <div>
                      <motion.h4 
                        layout="position"
                        className="text-xs font-bold text-slate-200 font-mono tracking-tight flex items-center gap-1.5"
                      >
                        {agent.name}
                        {isSelected && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-indigo-950 text-indigo-300 border border-indigo-700/80 rounded font-normal">
                            ATIVO
                          </span>
                        )}
                      </motion.h4>
                      <motion.p 
                        layout="position"
                        className="text-[10px] text-slate-400 font-mono mt-0.5 leading-none"
                      >
                        {agent.role}
                      </motion.p>
                    </div>
                  </div>

                  {/* Status Badge & Expand Toggle Icon */}
                  <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded border flex items-center gap-1.5 ${statusBadgeClass}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${statusIndicatorColor}`}></span>
                      {statusText}
                    </span>

                    <motion.div
                      animate={{ rotate: isSelected ? 180 : 0 }}
                      transition={{ duration: 0.25 }}
                      className="text-slate-500 group-hover:text-slate-300 p-0.5"
                    >
                      <ChevronDown size={14} />
                    </motion.div>
                  </div>
                </div>

                {/* Collapsed Brief Thought Preview */}
                {!isSelected && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-2.5 text-[10px] text-slate-500 line-clamp-1 italic font-mono flex items-center gap-1.5 border-t border-slate-800/60 pt-2 w-full"
                  >
                    <MessageSquare size={11} className="text-indigo-400 shrink-0" />
                    <span className="truncate">
                      {agent.thought ? agent.thought : 'Sem telemetria pendente. Clique para expandir.'}
                    </span>
                  </motion.div>
                )}

                {/* Bus Link I/O Port Terminal on Card */}
                <div className="flex items-center justify-between text-[9px] font-mono border-t border-slate-800/70 pt-2 mt-2.5 text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full transition-all ${
                      isBusTransmitting 
                        ? 'bg-cyan-400 shadow-[0_0_8px_#22d3ee] animate-ping' 
                        : 'bg-slate-700'
                    }`} />
                    <span className={isBusTransmitting ? 'text-cyan-300 font-semibold flex items-center gap-1' : 'text-slate-500'}>
                      <Radio size={9} className={isBusTransmitting ? 'text-cyan-400 animate-pulse' : 'text-slate-600'} />
                      {isBusTransmitting ? 'BUS: TX/RX ATIVO' : 'BUS: STANDBY'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[8px] font-mono">
                    <span className="text-slate-500">CANAL: #{agent.id.toUpperCase().slice(0, 3)}</span>
                    <span className={isBusTransmitting ? 'text-emerald-400 font-bold' : 'text-slate-600'}>
                      {isBusTransmitting ? 'ONLINE' : 'IDLE'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Framer Motion EXPANDED Content: Deep Active Thought Process & Diagnostics */}
              <AnimatePresence initial={false}>
                {isSelected && (
                  <motion.div
                    key={`expanded-${agent.id}`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ 
                      opacity: 1, 
                      height: 'auto',
                      transition: {
                        height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.25, delay: 0.08 }
                      }
                    }}
                    exit={{ 
                      opacity: 0, 
                      height: 0,
                      transition: {
                        height: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
                        opacity: { duration: 0.15 }
                      }
                    }}
                    className="overflow-hidden w-full pt-3"
                  >
                    {/* Expanded Detail Box */}
                    <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3.5 space-y-3 font-mono">
                      
                      {/* Thought Process Header with Channel & Confidence Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2 text-[10px]">
                        <div className="flex items-center gap-2 text-indigo-400">
                          <BrainCircuit size={13} className="text-indigo-400 animate-pulse" />
                          <span className="font-semibold uppercase tracking-wider">
                            Linha de Pensamento Neural
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-500 text-[9px]">
                            Alvo: <strong className="text-slate-300">{meta.subsystem}</strong>
                          </span>
                          <span className="text-slate-500 text-[9px]">
                            Tensor: <strong className="text-cyan-400">{meta.tensorWeight}</strong>
                          </span>
                          <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            <Zap size={10} className="text-amber-400" />
                            <span className="text-slate-400 text-[9px]">Confiança:</span>
                            <span className="text-emerald-400 font-bold text-[9px]">{meta.defaultConfidence}%</span>
                          </div>
                        </div>
                      </div>

                      {/* Full Thought Stream Body */}
                      <div className="relative">
                        <div className="text-xs text-slate-200 leading-relaxed font-mono bg-slate-900/60 rounded-md p-3 border-l-2 border-indigo-500 max-h-56 overflow-y-auto whitespace-pre-wrap">
                          {agent.thought ? (
                            <div>
                              <div className="text-[9px] text-slate-500 mb-1.5 flex items-center justify-between">
                                <span>[PROXMOX-NEURAL-FEED] CANAL_{agent.id.toUpperCase()}:</span>
                                <span>SINCRONIZADO</span>
                              </div>
                              {agent.thought}
                            </div>
                          ) : (
                            <div className="text-slate-500 py-1 italic flex items-center gap-2">
                              <Radio size={13} className="text-slate-600 animate-pulse" />
                              <span>Aguardando execução da simulação para materializar a linha de raciocínio deste agente...</span>
                            </div>
                          )}
                        </div>

                        {/* Quick Copy Thought Button */}
                        {agent.thought && (
                          <button
                            type="button"
                            onClick={(e) => handleCopyThought(e, agent.id, agent.thought)}
                            className="absolute top-2 right-2 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded text-[10px] flex items-center gap-1 transition-all cursor-pointer shadow border border-slate-700/80"
                            title="Copiar Parecer do Agente"
                          >
                            {copiedId === agent.id ? (
                              <>
                                <Check size={11} className="text-emerald-400" />
                                <span className="text-emerald-400">Copiado</span>
                              </>
                            ) : (
                              <>
                                <Copy size={11} />
                                <span>Copiar</span>
                              </>
                            )}
                          </button>
                        )}
                      </div>

                      {/* Bottom Micro Status Bar */}
                      <div className="flex items-center justify-between text-[9px] text-slate-500 pt-1">
                        <div className="flex items-center gap-1.5">
                          <Terminal size={10} className="text-slate-600" />
                          <span>Status do Processo: {agent.status.toUpperCase()}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectAgent('');
                          }}
                          className="text-indigo-400 hover:text-indigo-300 font-semibold cursor-pointer flex items-center gap-0.5"
                        >
                          Recolher Card <ChevronUp size={10} />
                        </button>
                      </div>

                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
        </div>
      </div>

      {/* Persistent Detailed Terminal Console for Active Agent */}
      <AnimatePresence>
        {activeAgentId && (() => {
          const selectedAgent = agentsData.find(a => a.id === activeAgentId);
          if (!selectedAgent) return null;

          return (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.3 }}
              className="bg-slate-950 border border-indigo-900/60 rounded-xl p-4 shadow-xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-3 text-[10px] text-indigo-400 font-mono select-none flex items-center gap-1">
                <Sparkles size={11} className="text-indigo-400" />
                TERMINAL SECUNDÁRIO // {selectedAgent.id.toUpperCase()}_AGENT
              </div>

              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-widest font-mono mb-2 flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${
                  selectedAgent.status === 'idle' ? 'bg-slate-600' : selectedAgent.status === 'processing' ? 'bg-blue-500 animate-ping' : 'bg-emerald-500'
                }`}></span>
                Inspeção Neural Dedicada — {selectedAgent.name} ({selectedAgent.role})
              </h4>

              <div className="text-xs border-l-2 border-indigo-500 pl-3.5 py-1 text-slate-300 font-mono leading-relaxed whitespace-pre-wrap max-h-40 overflow-y-auto">
                {selectedAgent.thought ? (
                  <div>
                    <div className="text-[10px] text-slate-500 mb-1">
                      [PROXMOX-AGENT-SESSION] SECURE_COMMS_ESTABLISHED ({new Date().toLocaleTimeString()}):
                    </div>
                    {selectedAgent.thought}
                  </div>
                ) : (
                  <span className="text-slate-500 select-none">
                    Aguardando submissão de problema para inicializar o fluxo neural do {selectedAgent.name}.
                  </span>
                )}
              </div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
