import { useState } from 'react';
import { 
  CheckCircle,
  TrendingUp, 
  Settings, 
  TrendingDown, 
  Gauge,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Sparkles,
  Tag
} from 'lucide-react';
import { FeedbackRecord } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface LearningPanelProps {
  efficiency: number;
  successRate: number;
  redundancy: number; // Redundancy reduction rate
  category: string;
  feedbackLogs?: FeedbackRecord[];
  language?: string;
}

export default function LearningPanel({ 
  efficiency, 
  successRate, 
  redundancy,
  category,
  feedbackLogs = [],
  language = 'pt'
}: LearningPanelProps) {
  const [activeTab, setActiveTab] = useState<'rules' | 'feedbacks'>('rules');
  const t = TRANSLATIONS[language] || TRANSLATIONS.pt;

  // Fetch contextual guidelines based on solved category
  const getSimulatedStrategies = (cat: string) => {
    switch (cat.toLowerCase()) {
      case 'banco de dados & i/o':
      case 'banco de dados':
        return [
          { rule: "RE-BALANCING_POOL", desc: "Ajuste dinâmico de cota máxima do POOL do Postgres para evitar travamento", status: "Aplicado" },
          { rule: "CACHE-WARMING_VETORIAL", desc: "Indexação preventiva no banco de vetores Qdrant baseada em consultas quentes", status: "Aplicado" },
          { rule: "SWAP-ALLOC_TUNING", desc: "Aumento de swaps compartilhados em VMs para mitigar picos de escrita de transação", status: "Auditado" }
        ];
      case 'vazamento de memória':
      case 'memória / heap':
        return [
          { rule: "JWT_LEAK_PREVENTION", desc: "Detecção e coleta agressiva de referências circulares de escopos JWT", status: "Aplicado" },
          { rule: "HEAVY-LOAD_SWAP", desc: "Ativação automática de swap de memória de contêineres LXC em Proxmox", status: "Aplicado" },
          { rule: "THREAD-POOL_CAP", desc: "Imposição de CAP no teto de threads assíncronas concorrentes de scraping", status: "Auditado" }
        ];
      case 'rede / latência':
      case 'rede / performance':
        return [
          { rule: "BROTLI-ZIP_COMPRESSION", desc: "Compactação automática Brotli de nível 6 nos arquivos estáticos", status: "Aplicado" },
          { rule: "CDN-ROUTING_HEALTH", desc: "Monitoramento de batimento de rede com desvio de rotas geográficas instáveis", status: "Aplicado" },
          { rule: "FAILSAFE_TIMEOUT", desc: "Redução de limite de fallback no barramento Kafka e descarte rápido de pacotes órfãos", status: "Auditado" }
        ];
      default:
        return [
          { rule: "AUTO-TUNING_RESOURCES", desc: "Ajuste flutuante de recursos da VM conforme o feedback de eficiência gerado", status: "Aplicado" },
          { rule: "CONSENSUS_REDISTRIB", desc: "Otimização de tempo limite de redistribuição de consenso inter-agentes", status: "Aplicado" },
          { rule: "KAFKA_RATE_LIMITER", desc: "Configuração preventiva do throttle de comunicação do broker", status: "Auditado" }
        ];
    }
  };

  const adaptiveRules = getSimulatedStrategies(category);

  // Compute approval rate
  const positiveCount = feedbackLogs.filter(f => f.rating === 'positive').length;
  const totalFeedbacks = feedbackLogs.length;
  const approvalRate = totalFeedbacks > 0 ? Math.round((positiveCount / totalFeedbacks) * 100) : 95;

  return (
    <div id="learning-metrics-dashboard" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between min-h-[520px]">
      
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase font-mono flex items-center gap-1.5">
            <Gauge size={16} className="text-emerald-400" />
            {t.learningTitle}
          </h3>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded flex items-center gap-1">
            <Sparkles size={11} />
            {t.evalSatisfactionRate || 'Aprovação'}: {approvalRate}%
          </span>
        </div>

        <p className="text-[11px] text-slate-400 leading-normal font-mono mb-5">
          {t.learningDesc}
        </p>

        {/* Circular / Segmented Progress Indicators Grid */}
        <div className="grid grid-cols-3 gap-3 mb-5">
          
          {/* Efficiency Metric */}
          <div className="bg-slate-950 border border-slate-800/60 p-3 rounded-lg flex flex-col items-center justify-center text-center relative group">
            <span className="text-[9px] text-slate-500 font-mono tracking-tight mb-2">{t.learningEfficiency}</span>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" stroke="#1e293b" strokeWidth="3" fill="transparent" />
                <circle 
                  cx="28" cy="28" r="22" 
                  stroke="#3b82f6" strokeWidth="4" fill="transparent" 
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 * (1 - efficiency / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-xs font-bold font-mono text-blue-400">{efficiency}%</span>
            </div>
            <div className="text-[9px] text-emerald-400 font-mono mt-2 flex items-center gap-0.5">
              <TrendingUp size={10} />
              {positiveCount} Avaliações
            </div>
          </div>

          {/* Redundancy metric */}
          <div className="bg-slate-950 border border-slate-800/60 p-3 rounded-lg flex flex-col items-center justify-center text-center relative group">
            <span className="text-[9px] text-slate-500 font-mono tracking-tight mb-2">{t.learningRedundancy}</span>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" stroke="#1e293b" strokeWidth="3" fill="transparent" />
                <circle 
                  cx="28" cy="28" r="22" 
                  stroke="#8b5cf6" strokeWidth="4" fill="transparent" 
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 * (1 - redundancy / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-xs font-bold font-mono text-purple-400">-{redundancy}%</span>
            </div>
            <div className="text-[9px] text-purple-400 font-mono mt-2 flex items-center gap-0.5">
              <TrendingDown size={10} />
              Fator Reduzido
            </div>
          </div>

          {/* Success rate metric */}
          <div className="bg-slate-950 border border-slate-800/60 p-3 rounded-lg flex flex-col items-center justify-center text-center relative group">
            <span className="text-[9px] text-slate-500 font-mono tracking-tight mb-2">{t.learningSuccessRate}</span>
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="22" stroke="#1e293b" strokeWidth="3" fill="transparent" />
                <circle 
                  cx="28" cy="28" r="22" 
                  stroke="#10b981" strokeWidth="4" fill="transparent" 
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 * (1 - successRate / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <span className="absolute text-xs font-bold font-mono text-emerald-400">{successRate}%</span>
            </div>
            <div className="text-[9px] text-slate-400 font-mono mt-2 flex items-center gap-0.5">
              <CheckCircle size={10} className="text-emerald-400" />
              Consolidada
            </div>
          </div>

        </div>
      </div>

      {/* Sub-tab Navigation */}
      <div className="flex-1 flex flex-col pt-2 border-t border-slate-800/60 overflow-hidden">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
            <button
              id="tab-learning-rules"
              type="button"
              onClick={() => setActiveTab('rules')}
              aria-pressed={activeTab === 'rules'}
              className={`px-2.5 py-1 text-[10px] font-mono rounded transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'rules'
                  ? 'bg-indigo-900/60 text-indigo-200 border border-indigo-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings size={11} />
              {t.learningRules}
            </button>
            <button
              id="tab-learning-feedbacks"
              type="button"
              onClick={() => setActiveTab('feedbacks')}
              aria-pressed={activeTab === 'feedbacks'}
              className={`px-2.5 py-1 text-[10px] font-mono rounded transition-all flex items-center gap-1 cursor-pointer ${
                activeTab === 'feedbacks'
                  ? 'bg-emerald-900/60 text-emerald-200 border border-emerald-700/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ThumbsUp size={11} />
              {t.evalLogsTitle || 'Log Avaliações'} ({feedbackLogs.length})
            </button>
          </div>
        </div>
        
        {/* Tab 1: Adaptive rules */}
        {activeTab === 'rules' ? (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[160px]">
            {adaptiveRules.map((rule, idx) => (
              <div key={idx} className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-[11px] tracking-wide text-indigo-400">
                    {rule.rule}
                  </span>
                  <span className={`text-[9px] font-semibold px-1 rounded ${
                    rule.status === 'Aplicado' 
                      ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/60' 
                      : 'bg-blue-950/50 text-blue-400 border border-blue-900/60'
                  }`}>
                    {rule.status}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {rule.desc}
                </p>
              </div>
            ))}
          </div>
        ) : (
          /* Tab 2: Feedback and calibration log */
          <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[160px]">
            {feedbackLogs.length === 0 ? (
              <div className="text-center py-6 text-slate-500 text-xs font-mono">
                Nenhuma avaliação registrada ainda. Avalie uma solução para retroalimentar o aprendizado.
              </div>
            ) : (
              feedbackLogs.map((fb) => (
                <div key={fb.id} className="p-2 bg-slate-950 border border-slate-800/80 rounded-lg text-xs font-mono space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {fb.rating === 'positive' ? (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/50 text-emerald-400 border border-emerald-800/40 text-[10px]">
                          <ThumbsUp size={10} /> Aprovada
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-amber-950/50 text-amber-400 border border-amber-800/40 text-[10px]">
                          <ThumbsDown size={10} /> Requer Ajuste
                        </span>
                      )}
                      <span className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {fb.caseId}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500">
                      {new Date(fb.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-300 line-clamp-1">
                    "{fb.problem}"
                  </p>

                  {fb.note && (
                    <p className="text-[10px] text-slate-400 italic flex items-center gap-1">
                      <MessageSquare size={9} className="text-slate-500 flex-shrink-0" />
                      {fb.note}
                    </p>
                  )}

                  {fb.tags && fb.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {fb.tags.map((tag, tIdx) => (
                        <span key={tIdx} className="text-[8px] bg-slate-900 border border-slate-800 px-1 py-0.5 rounded text-slate-400 flex items-center gap-0.5">
                          <Tag size={7} /> {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>

    </div>
  );
}

