import { useState, MouseEvent } from 'react';
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
  BrainCircuit
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

export default function AgentNode({ 
  agentsData, 
  activeAgentId, 
  onSelectAgent, 
  isLoading,
  busActive 
}: AgentNodeProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);

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

  return (
    <div id="agents-panel" className="flex flex-col gap-4">
      
      {/* Broker Message Bus (Kafka / RabbitMQ Simulation) Visualizer */}
      <motion.div 
        layout
        className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-lg overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Network className="text-indigo-400 animate-pulse" size={18} />
            <h4 className="text-xs font-semibold text-slate-300 tracking-wider uppercase font-mono">
              Barramento de Mensagens (RabbitMQ / Apache Kafka)
            </h4>
          </div>
          <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border flex items-center gap-1.5 ${
            busActive 
              ? 'bg-emerald-950/40 text-emerald-400 border-emerald-900/60 animate-pulse' 
              : 'bg-slate-950 text-slate-500 border-slate-800'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full ${busActive ? 'bg-emerald-400' : 'bg-slate-600'}`}></span>
            {busActive ? 'Transmissão Ativa' : 'Standby'}
          </span>
        </div>

        <div className="text-xs text-slate-400 mb-2 font-mono leading-relaxed">
          Fluxo: <span className="text-indigo-300">Agentes</span> → <span className="text-blue-300">Núcleo Central</span> → <span className="text-indigo-300">Redistribuição</span> → <span className="text-emerald-400">Consenso Adaptativo</span>.
        </div>

        {/* Animated flow dots representation */}
        <div className="h-2 bg-slate-950 rounded-full relative overflow-hidden flex items-center border border-slate-800">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 rounded-full"
            animate={{
              width: busActive ? '100%' : '12%',
              opacity: busActive ? [0.7, 1, 0.7] : 0.6
            }}
            transition={{
              duration: busActive ? 1.5 : 0.5,
              repeat: busActive ? Infinity : 0,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>

      {/* Grid of Specialized Agents with Framer Motion Layout Expand/Collapse */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {agentsData.map((agent) => {
          const isSelected = activeAgentId === agent.id;
          const meta = AGENT_METADATA[agent.id] || { subsystem: 'CORE_LOGIC', tensorWeight: '0.90 Alpha', defaultConfidence: 95 };
          
          let cardBorderClass = 'border-slate-800 hover:border-slate-700 bg-slate-900/60';
          let statusBadgeClass = 'bg-slate-950 text-slate-500 border-slate-800';
          let statusText = 'Em espera';
          let statusIndicatorColor = 'bg-slate-700';

          if (agent.status === 'processing') {
            cardBorderClass = 'border-blue-500/80 bg-blue-950/20 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/30';
            statusBadgeClass = 'bg-blue-950/60 text-blue-300 border-blue-800';
            statusText = 'Raciocinando';
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
              layout
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                layout: { duration: 0.32, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 0.25 }
              }}
              onClick={() => handleCardClick(agent.id)}
              className={`text-left p-3.5 rounded-xl border transition-colors relative group flex flex-col justify-between cursor-pointer overflow-hidden ${cardBorderClass} ${
                isSelected ? 'sm:col-span-2' : 'sm:col-span-1'
              }`}
            >
              {/* Background ambient glow on active/hover */}
              <div className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl transition-all pointer-events-none ${
                isSelected 
                  ? 'bg-indigo-500/15' 
                  : agent.status === 'processing' 
                  ? 'bg-blue-500/10' 
                  : 'bg-slate-800/10 group-hover:bg-slate-800/20'
              }`} />

              {/* Top Header Row of Card */}
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <motion.div 
                      layout="position"
                      className={`p-2 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                          : agent.status === 'processing' 
                          ? 'bg-blue-950/70 text-blue-400 border border-blue-800' 
                          : agent.status === 'completed' || agent.status === 'consensus'
                          ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                          : 'bg-slate-950 text-slate-400 border border-slate-800'
                      }`}
                    >
                      {getAgentIcon(agent.id, '')}
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
