import { useState, useEffect, useRef } from 'react';
import { 
  Terminal, 
  Cpu, 
  Activity, 
  Database, 
  Network, 
  Server, 
  AlertTriangle, 
  Check, 
  RotateCcw, 
  Send, 
  Sparkles, 
  CheckCircle, 
  Copy,
  Info,
  Globe,
  Mic,
  MicOff,
  Radio,
  Volume2,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  FastForward,
  Gauge,
  Tag,
  CheckCheck,
  Download,
  FileJson
} from 'lucide-react';
import PipelineVisualizer from './components/PipelineVisualizer';
import AgentNode from './components/AgentNode';
import MemoryPanel from './components/MemoryPanel';
import LearningPanel from './components/LearningPanel';
import { PredictiveAnalysis } from './components/PredictiveAnalysis';
import Studio4D from './components/Studio4D';
import KeywordAnalyzer from './components/KeywordAnalyzer';
import IntegrationsPanel from './components/IntegrationsPanel';
import { ToastContainer, ToastItem } from './components/ToastNotification';
import { SolutionComparison } from './components/SolutionComparison';
import TimelineTrendView from './components/TimelineTrendView';
import { AudienceSimulator } from './components/AudienceSimulator';
import { AudienceTestSuite } from './components/AudienceTestSuite';
import { TRANSLATIONS } from './data/translations';
import { AgentThought, PipelineStage, SavedCase, SimulationResult, FeedbackRecord, PipelineSpeed } from './types';

// Preset critical system problems for users to quickly trigger
const PRESETS = [
  "Inconsistência de concorrência de saldo no banco PostgreSQL durante testes de estresse",
  "Picos intermitentes de latência na comunicação RabbitMQ entre nós do microsserviço de pagamento",
  "Vazamento de memória (OOM Heap) no loop de eventos do microsserviço de autenticação",
  "Gargalo de I/O em VM Proxmox por excesso de escrita síncrona de logs não rotacionados"
];

// Default stages of S.I.M.A. Nucleus Pipeline
const PIPELINE_STAGES: PipelineStage[] = [
  { id: 'input', label: 'Entrada', description: 'Leitura do problema', status: 'waiting' },
  { id: 'classification', label: 'Classificação', description: 'Urgência & Natureza', status: 'waiting' },
  { id: 'division', label: 'Divisão de Tarefas', description: 'Quebra modular', status: 'waiting' },
  { id: 'dispatch', label: 'Envio a Agentes', description: 'Canais individuais', status: 'waiting' },
  { id: 'validation', label: 'Consenso/Broker', description: 'Kafka & Validação', status: 'waiting' },
  { id: 'storage', label: 'Armazenamento', description: 'Indexação no Qdrant', status: 'waiting' },
  { id: 'response', label: 'Decisão Final', description: 'Remediação na VM', status: 'waiting' }
];

const CALIBRATION_TAGS = [
  "Alta Precisão",
  "Otimização Eficaz",
  "Identificação Raiz",
  "Redução de Latência",
  "Ajustar Memória",
  "Refinar PostgreSQL",
  "Calibração Causal"
];

export default function App() {
  const [problemInput, setProblemInput] = useState<string>('');
  const [language, setLanguage] = useState<string>('pt');
  const [loading, setLoading] = useState<boolean>(false);
  const [history, setHistory] = useState<SavedCase[]>([]);
  const [feedbackLogs, setFeedbackLogs] = useState<FeedbackRecord[]>([]);
  const [currentStageIdx, setCurrentStageIdx] = useState<number>(0);
  const [activeAgentId, setActiveAgentId] = useState<string | null>('logico');
  const [simulationActive, setSimulationActive] = useState<boolean>(false);
  const [pipelineSpeed, setPipelineSpeed] = useState<PipelineSpeed>('normal');
  const [activeMainView, setActiveMainView] = useState<'console' | 'audiences' | 'testsuite' | 'timeline' | 'predictive'>('console');

  // Solution Feedback Form States
  const [rating, setRating] = useState<'positive' | 'negative' | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [feedbackNote, setFeedbackNote] = useState<string>('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);
  const [jsonExported, setJsonExported] = useState<boolean>(false);
  
  // Microphone / Speech Recognition States
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [interimSpeech, setInterimSpeech] = useState<string>('');
  const [speechError, setSpeechError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  // Skip and timer references
  const skipFlagRef = useRef<boolean>(false);
  const stageIntervalRef = useRef<any>(null);
  const completeTimeoutRef = useRef<any>(null);
  const pendingDataRef = useRef<SimulationResult | null>(null);

  const t = TRANSLATIONS[language] || TRANSLATIONS.pt;

  // Simulated logs that output onto the terminal panel sequentially
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "[SIMA-KERNEL] Sistema Inteligente Modular Adaptativo inicializado com sucesso.",
    "[SIMA-KERNEL] Conectado ao Host Proxmox VE (Ubuntu Server 22.04 LTS). IP: 192.168.1.100",
    "[SIMA-KERNEL] Banco PostgreSQL local online na porta 5432.",
    "[SIMA-KERNEL] Banco Vetorial Qdrant online na porta 6333 (4096 dimensões de alta fidelidade).",
    "[SIMA-KERNEL] Barramento RabbitMQ / Apache Kafka pronto para distribuição inter-agentes.",
    "[SIMA-KERNEL] Sandbox em espera. Digite um problema acima ou selecione um preset para iniciar a simulação."
  ]);

  // Current simulation result state (starts with a prefilled complete model)
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>({
    problem: "Gargalo de I/O por estouro no pool de conexões do PostgreSQL",
    category: "Banco de Dados & I/O",
    urgency: "Crítica",
    vm_environment: "Proxmox VM 104 (8 vCPUs, 16GB RAM)",
    tasks: [
      "Profilamento de conexões ociosas mantidas abertas pela query de checkout",
      "Criação de índices remotos de similaridade vetorial no Qdrant",
      "Redimensionamento do max_connections no postgresql.conf"
    ],
    agents: {
      logico: { thought: "Análise Lógica: A premissa de que mais conexões resolvem concorrência é falsa. Há um limite físico de threads de CPU de contenção na máquina virtual hospedeira." },
      matematico: { thought: "Modelo Quantitativo: Frequência f=750 ops/s no pico. Conexões ideais calculadas: N = (2 * vCPU) + spindledisks = (2*8) + 1 = 17 conexões. Pool atual está sobredimensionado em 300." },
      causal: { thought: "Raiz Causal: Vazamento do pool de conexões causado pelo encerramento forçado de threads clientes JWT de autenticação sem invocar fechamento na session pool." },
      estrategico: { thought: "Rota de Mitigação: Reduzir max_connections no PostgreSQL.conf na VM para 150; ativar pgbouncer em modo de pooling transacional para absorver o buffer." },
      memoria: { thought: "Similaridade Histórica (Qdrant): Correlacionado com falha de estouro de descritor na Black Friday anterior. Grau de consistência estocástica: 92%." },
      social: { thought: "Impacto no Trabalho: O time de suporte relata ansiedade frente aos alarmes de downtime falso-positivo. Recomendada integração automática de alarmes SIMA no Slack." }
    },
    consensus: "Consenso unificado: O pool de conexões PostgreSQL está vazando conexões ativas devido a requisições JWT mal terminadas. Bloquear concorrência em excesso mitigará riscos imediatos.",
    final_solution: "Configurar o PgBouncer na VM com pool_mode = transaction; Definir idle_in_transaction_session_timeout = 10s no postgresql.conf para matar automaticamente conexões órfãs.",
    metrics: {
      efficiency_gain: 88,
      success_rate: 94,
      redundancy_reduction: 75
    },
    timestamp: new Date().toISOString()
  });

  // Default agent stats in state, synced as users solve new problems
  const [agents, setAgents] = useState<AgentThought[]>([
    { id: 'logico', name: 'Agente Lógico', role: 'Valida Coerência Semântica', avatar: 'binary', color: 'border-blue-500', thought: 'Análise Lógica: A premissa de que mais conexões resolvem concorrência é falsa. Há um limite físico de threads de CPU de contenção na máquina virtual hospedeira.', status: 'completed' },
    { id: 'matematico', name: 'Agente Matemático', role: 'Testa Modelos Métricos', avatar: 'cpu', color: 'border-yellow-500', thought: 'Modelo Quantitativo: Frequência f=750 ops/s no pico. Conexões ideais calculadas: N = (2 * vCPU) + spindledisks = 17 conexões.', status: 'completed' },
    { id: 'causal', name: 'Agente Causal', role: 'Busca Raiz do Problema', avatar: 'alert', color: 'border-red-500', thought: 'Raiz Causal: Vazamento do pool de conexões causado pelo encerramento forçado de threads clientes JWT de autenticação sem invocar fechamento.', status: 'completed' },
    { id: 'estrategico', name: 'Agente Estratégico', role: 'Escolhe Caminhos', avatar: 'activity', color: 'border-green-500', thought: 'Rota de Mitigação: Reduzir max_connections no PostgreSQL.conf na VM para 150; ativar pgbouncer em modo de pooling transacional.', status: 'completed' },
    { id: 'memoria', name: 'Agente Memória', role: 'Compara Problemas Antigos', avatar: 'archive', color: 'border-indigo-500', thought: 'Similaridade Histórica (Qdrant): Correlacionado com falha de estouro de descritor na Black Friday anterior. Grau de consistência estocástica: 92%.', status: 'completed' },
    { id: 'social', name: 'Agente Social', role: 'Interpreta Contexto Humano', avatar: 'users', color: 'border-purple-500', thought: 'Impacto no Trabalho: O time de suporte relata ansiedade frente aos alarmes de downtime falso-positivo. Recomendada integração com Slack.', status: 'completed' }
  ]);

  const consoleEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll console logs to end
  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [consoleLogs]);

  // Load PostgreSQL structure history list on start
  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch (e) {
      console.warn("Falha ao recuperar histórico. Rodando offline.", e);
    }
  };

  // Load feedback logs on start
  const fetchFeedbacks = async () => {
    try {
      const res = await fetch("/api/feedback");
      if (res.ok) {
        const data = await res.json();
        setFeedbackLogs(data);
      }
    } catch (e) {
      console.warn("Falha ao recuperar feedbacks.", e);
    }
  };

  useEffect(() => {
    fetchHistory();
    fetchFeedbacks();
  }, []);

  // Temporary Toast Notifications State (Top Right Notification System)
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = (
    type: 'info' | 'success' | 'warning' | 'critical',
    title: string,
    message: string,
    duration = 4500
  ) => {
    const id = 'toast_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const newToast: ToastItem = {
      id,
      type,
      title,
      message,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    };
    setToasts(prev => [...prev.slice(-3), newToast]);
    if (duration > 0) {
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, duration);
    }
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // Write individual log line helper
  const addLog = (text: string) => {
    setConsoleLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${text}`]);
  };

  // Helper to finalize simulation immediately
  const finalizeSimulation = (data: SimulationResult) => {
    if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
    if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);

    setCurrentStageIdx(6);
    setSimulationResult(data);

    // Sync generated agent feedback models
    setAgents([
      { id: 'logico', name: 'Agente Lógico', role: 'Valida Coerência Semântica', avatar: 'binary', color: 'border-blue-500', thought: data.agents.logico.thought, status: 'consensus' },
      { id: 'matematico', name: 'Agente Matemático', role: 'Testa Modelos Métricos', avatar: 'cpu', color: 'border-yellow-500', thought: data.agents.matematico.thought, status: 'consensus' },
      { id: 'causal', name: 'Agente Causal', role: 'Busca Raiz do Problema', avatar: 'alert', color: 'border-red-500', thought: data.agents.causal.thought, status: 'consensus' },
      { id: 'estrategico', name: 'Agente Estratégico', role: 'Escolhe Caminhos', avatar: 'activity', color: 'border-green-500', thought: data.agents.estrategico.thought, status: 'consensus' },
      { id: 'memoria', name: 'Agente Memória', role: 'Compara Problemas Antigos', avatar: 'archive', color: 'border-indigo-500', thought: data.agents.memoria.thought, status: 'consensus' },
      { id: 'social', name: 'Agente Social', role: 'Interpreta Contexto Humano', avatar: 'users', color: 'border-purple-500', thought: data.agents.social.thought, status: 'consensus' }
    ]);

    addLog(`[SIMA-CORE] Solução gerada com sucesso.`);
    addLog(`[VM-APPLIED] Medida recomendada escrita na partição PostgreSQL estruturada.`);
    addLog(`[SIMA-CORE] Fluxo adaptativo concluído. Operando em regime de consenso.`);
    
    // Trigger success toast notification
    addToast('success', 'Solução Consolidada com Sucesso', 'Parecer consensual dos 6 agentes concluído e gravado no PostgreSQL.');

    // Reset feedback evaluation form for newly solved case
    setRating(null);
    setSelectedTags([]);
    setFeedbackNote('');
    setFeedbackSubmitted(false);

    setLoading(false);
    setSimulationActive(false);
    fetchHistory();
  };

  // Instant Skip Pipeline handler
  const handleSkipSimulation = () => {
    skipFlagRef.current = true;
    addLog(`[SIMA-CORE] ⏩ Aceleração acionada: pulando visualização da simulação.`);
    addToast('warning', 'Aceleração Acionada', 'Pulando visualização e consolidando a solução imediatamente.');
    
    if (pendingDataRef.current) {
      finalizeSimulation(pendingDataRef.current);
    } else {
      // Data still fetching from API, advance visually to stage 6 while waiting for response
      setCurrentStageIdx(6);
      addLog(`[SIMA-CORE] Aguardando retorno final do pipeline neural acelerado...`);
    }
  };

  // Run S.I.M.A. Cognitive Solver simulation
  const handleSolve = async (targetText: string) => {
    const queryText = targetText || problemInput;
    if (!queryText.trim()) return;

    if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
    if (completeTimeoutRef.current) clearTimeout(completeTimeoutRef.current);

    skipFlagRef.current = false;
    pendingDataRef.current = null;

    setLoading(true);
    setSimulationActive(true);
    setCurrentStageIdx(0);
    setActiveAgentId('logico');
    
    // Set all agents state to idle/processing
    setAgents(prev => prev.map(a => ({ ...a, status: 'processing', thought: 'Processando fluxo cognitivo...' })));

    setConsoleLogs([
      `[SIMA-CORE] INICIALIZANDO SOLUCIONADOR COGNITIVO modular para falha reportada!`,
      `[SIMA-CORE] Entrada recebida: "${queryText}"`,
      `[SIMA-CORE] Velocidade de execução: ${pipelineSpeed.toUpperCase()}`,
      `[SIMA-CORE] Enviando payload via IPC para núcleo inteligente...`
    ]);

    addToast('info', 'Pipeline S.I.M.A. Iniciado', `Inicializando núcleos cognitivos para: "${queryText.slice(0, 38)}..."`);

    // Calculate stage interval and final timeout based on pipelineSpeed
    let stepDelay = 600;
    let totalDelay = 3800;

    if (pipelineSpeed === 'instant') {
      stepDelay = 0;
      totalDelay = 0;
    } else if (pipelineSpeed === 'ultra') {
      stepDelay = 75;
      totalDelay = 450;
    } else if (pipelineSpeed === 'fast') {
      stepDelay = 220;
      totalDelay = 1400;
    }

    // Stage intervals simulation matching selected speed
    let stage = 0;
    if (stepDelay > 0) {
      stageIntervalRef.current = setInterval(() => {
        if (skipFlagRef.current) {
          clearInterval(stageIntervalRef.current);
          return;
        }

        stage += 1;
        if (stage < PIPELINE_STAGES.length) {
          setCurrentStageIdx(stage);
          
          switch (stage) {
            case 1:
              addLog(`[CLASSE-AI] Analisando padrão lexical e metadados de urgência do problema...`);
              break;
            case 2:
              addLog(`[DIVISOR-AI] Criando planos estruturais. Subdividindo em tarefas menores...`);
              break;
            case 3:
              addLog(`[AGENT-BROADCAST] Despachando threads IPC assíncronas para os 6 Agentes Especializados...`);
              setActiveAgentId('causal');
              addToast('warning', 'Etapa Crítica: Despacho para 6 Agentes', 'Threads IPC assíncronas despachadas para especialistas cognitivos.');
              break;
            case 4:
              addLog(`[MESSAGE-BUS] Barramento de mensageria ativo comercializando consensos parciais.`);
              addLog(`[KAFKA/RABBITMQ] Redistribuição concluída! Sincronia de consenso cruzada.`);
              setActiveAgentId('matematico');
              addToast('info', 'Etapa Crítica: Barramento Inter-Agentes', 'Consenso cruzado e negociação de planos em andamento.');
              break;
            case 5:
              addLog(`[LEARNING] Computando métricas de feedback ambiental e eficiências térmicas...`);
              addLog(`[QDRANT-VECTOR-DB] Gravando vetor de embeddings em coleção 'sima_failures'...`);
              setActiveAgentId('memoria');
              addToast('info', 'Indexação Vetorial Qdrant', 'Gravando embeddings de 4096-D no espaço latente da coleção sima_failures.');
              break;
            case 6:
              addLog(`[POSTGRESQL-DB] Registrando solução aprovada permanentemente na tabela de logs estruturados...`);
              break;
          }
        } else {
          clearInterval(stageIntervalRef.current);
        }
      }, stepDelay);
    } else {
      setCurrentStageIdx(6);
    }

    try {
      // Call custom full-stack backend
      const res = await fetch("/api/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problem: queryText, lang: language })
      });

      if (!res.ok) {
        throw new Error(await res.text() || "Resposta de erro do servidor");
      }

      const data: SimulationResult = await res.json();
      pendingDataRef.current = data;

      // If user hit skip or speed is instant, finalize immediately
      if (skipFlagRef.current || pipelineSpeed === 'instant') {
        finalizeSimulation(data);
      } else {
        completeTimeoutRef.current = setTimeout(() => {
          finalizeSimulation(data);
        }, totalDelay);
      }

    } catch (err: any) {
      if (stageIntervalRef.current) clearInterval(stageIntervalRef.current);
      setLoading(false);
      setSimulationActive(false);
      addLog(`[CRITICAL-ERROR] Falha de comunicação de API de IA: ${err.message}`);
      addToast('critical', 'Falha no Pipeline', `Erro de comunicação na simulação: ${err.message}`);
      
      // fallback to offline processing
      setAgents(prev => prev.map(a => ({ ...a, status: 'idle', thought: 'Falha na IA. Em espera.' })));
    }
  };

  // Submit operator evaluation feedback to /api/feedback
  const handleFeedbackSubmit = async () => {
    if (!simulationResult || !rating || isSubmittingFeedback) return;

    setIsSubmittingFeedback(true);
    const caseId = simulationResult.timestamp ? `case-${new Date(simulationResult.timestamp).getTime().toString(36).toUpperCase()}` : `case-${Date.now()}`;

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId,
          problem: simulationResult.problem,
          rating,
          tags: selectedTags,
          note: feedbackNote,
          category: simulationResult.category,
          efficiency: simulationResult.metrics.efficiency_gain
        })
      });

      if (res.ok) {
        setFeedbackSubmitted(true);
        addLog(`[SIMA-LEARNING] ✅ Avaliação do caso ${caseId} registrada: ${rating === 'positive' ? '👍 APROVADA' : '👎 REQUER AJUSTE'}. Metadados sincronizados.`);
        addToast('success', 'Avaliação Registrada', `Feedback de validação para o caso ${caseId} sincronizado com sucesso.`);
        fetchFeedbacks();
      } else {
        addLog(`[SIMA-LEARNING] Erro ao registrar avaliação.`);
        addToast('warning', 'Aviso de Feedback', 'Não foi possível persistir a avaliação neste momento.');
      }
    } catch (e: any) {
      addLog(`[SIMA-LEARNING] Erro de rede ao registrar avaliação: ${e.message}`);
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  // Toggle tag helper for feedback
  const handleToggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  // Export resolved case metadata and agent thoughts to formatted .json file
  const handleExportJson = () => {
    if (!simulationResult) return;

    const caseId = simulationResult.timestamp 
      ? `case-${new Date(simulationResult.timestamp).getTime().toString(36).toUpperCase()}` 
      : `case-${Date.now().toString(36).toUpperCase()}`;

    const exportPayload = {
      system: "S.I.M.A. (Sistema Inteligente Modular Adaptativo)",
      version: "2.5.0-autonomous",
      exported_at: new Date().toISOString(),
      case_metadata: {
        case_id: caseId,
        timestamp: simulationResult.timestamp || new Date().toISOString(),
        reported_problem: simulationResult.problem,
        category: simulationResult.category,
        urgency: simulationResult.urgency,
        vm_target_environment: simulationResult.vm_environment,
        task_modular_breakdown: simulationResult.tasks,
        performance_metrics: {
          efficiency_gain_pct: simulationResult.metrics.efficiency_gain,
          solution_success_rate_pct: simulationResult.metrics.success_rate,
          redundancy_reduction_pct: simulationResult.metrics.redundancy_reduction
        }
      },
      agents_cognitive_analysis: {
        logico: {
          name: "Agente Lógico",
          role: "Valida Coerência Semântica",
          thought: simulationResult.agents.logico?.thought || ""
        },
        matematico: {
          name: "Agente Matemático",
          role: "Testa Modelos Métricos",
          thought: simulationResult.agents.matematico?.thought || ""
        },
        causal: {
          name: "Agente Causal",
          role: "Busca Raiz do Problema",
          thought: simulationResult.agents.causal?.thought || ""
        },
        estrategico: {
          name: "Agente Estratégico",
          role: "Escolhe Caminhos e Orquestra",
          thought: simulationResult.agents.estrategico?.thought || ""
        },
        memoria: {
          name: "Agente Memória",
          role: "Compara Problemas Antigos e Vetores",
          thought: simulationResult.agents.memoria?.thought || ""
        },
        social: {
          name: "Agente Social",
          role: "Interpreta Contexto Humano e Operacional",
          thought: simulationResult.agents.social?.thought || ""
        }
      },
      consensus_synthesis: {
        consensus_opinion: simulationResult.consensus,
        consensus_status: "Consolidado e Validado via Barramento Inter-Agentes"
      },
      remediation_plan: {
        executable_action: simulationResult.final_solution,
        persistence_target: "Partição Estruturada PostgreSQL / Coleção Qdrant 'sima_failures'"
      },
      operator_evaluation: rating ? {
        rating,
        tags: selectedTags,
        note: feedbackNote || null,
        submitted: feedbackSubmitted
      } : null
    };

    const dataBlob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
    const downloadUrl = URL.createObjectURL(dataBlob);
    const downloadAnchor = document.createElement("a");
    downloadAnchor.href = downloadUrl;
    downloadAnchor.download = `sima-${caseId.toLowerCase()}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    URL.revokeObjectURL(downloadUrl);

    setJsonExported(true);
    setTimeout(() => setJsonExported(false), 2500);

    addLog(`[SIMA-EXPORT] 💾 Metadados do caso e pensamentos dos 6 agentes exportados como JSON formatado.`);
    addToast('success', 'Exportação JSON Concluída', `Metadados e pensamentos salvos com sucesso em ${downloadAnchor.download}`);
  };

  // Re-simulate from list history click
  const handleSelectSavedCase = (problemText: string) => {
    setProblemInput(problemText);
    setActiveMainView('console');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    handleSolve(problemText);
  };

  // Re-simulate from audience simulator
  const handleSimulateFromAudience = (problemText: string) => {
    setProblemInput(problemText);
    setActiveMainView('console');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    addToast('info', 'Caso Carregado no Solver', `Iniciando análise modular completa para: "${problemText.slice(0, 36)}..."`);
    handleSolve(problemText);
  };

  // Clear PostgreSQL state histories completely
  const handleClearHistory = async () => {
    try {
      const res = await fetch("/api/clear", { method: "POST" });
      if (res.ok) {
        addLog(`[DATABASE] Comando de flush_all recebido. Histórico estruturado e feedbacks limpos.`);
        fetchHistory();
        fetchFeedbacks();
      }
    } catch {
      addLog(`[DATABASE] Erro ao limpar histórico.`);
    }
  };

  // Preset click loader helper
  const handleSelectPreset = (preset: string) => {
    setProblemInput(preset);
    addLog(`[SIMA-UI] Carregado preset de falha: "${preset}"`);
  };

  // Voice Recording Toggle using Web Speech Recognition
  const toggleVoiceRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsRecording(false);
      setInterimSpeech('');
      addLog(`[VOICE-MIC] Gravação finalizada pelo operador.`);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechError(t.micUnsupported);
      addLog(`[VOICE-MIC] Aviso: Web Speech API indisponível neste navegador.`);
      setTimeout(() => setSpeechError(null), 5000);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      const langMap: Record<string, string> = {
        pt: 'pt-BR',
        en: 'en-US',
        es: 'es-ES',
        fr: 'fr-FR',
        de: 'de-DE',
        ja: 'ja-JP'
      };
      recognition.lang = langMap[language] || 'pt-BR';
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
        setSpeechError(null);
        setInterimSpeech('');
        addLog(`[VOICE-MIC] Microfone ativado (${recognition.lang}). Fale o sintoma da VM...`);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let finalChunk = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalChunk += transcript;
          } else {
            interim += transcript;
          }
        }

        if (finalChunk) {
          setProblemInput(prev => {
            const trimmed = prev.trim();
            return trimmed ? `${trimmed} ${finalChunk.trim()}` : finalChunk.trim();
          });
          setInterimSpeech('');
          addLog(`[VOICE-MIC] Transcrição capturada: "${finalChunk.trim()}"`);
        } else {
          setInterimSpeech(interim);
        }
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setSpeechError(t.micPermission);
          addLog(`[VOICE-MIC] Acesso ao microfone negado.`);
        } else if (event.error !== 'no-speech') {
          setSpeechError(`Erro no microfone: ${event.error}`);
          addLog(`[VOICE-MIC] Status: ${event.error}`);
        }
        setIsRecording(false);
        setInterimSpeech('');
      };

      recognition.onend = () => {
        setIsRecording(false);
        setInterimSpeech('');
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err: any) {
      setSpeechError(err.message || 'Erro ao inicializar microfone.');
      setIsRecording(false);
      addLog(`[VOICE-MIC] Falha de inicialização: ${err.message}`);
    }
  };

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    };
  }, []);

  return (
    <div id="cognitive-core-body" className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Temporary Toast Notifications in the Top Right Corner */}
      <ToastContainer toasts={toasts} onDismiss={removeToast} />

      {/* Top Navigation Status Header following 3-Zone Contract */}
      <header className="border-b border-slate-900 bg-slate-950/90 backdrop-blur sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-6">
          {/* Zone 1: Single text element wordmark */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setActiveMainView('console')}
              className="text-left group cursor-pointer flex items-center gap-2"
            >
              <span className="bg-indigo-600 text-white font-mono font-bold text-[10px] px-1.5 py-0.5 rounded shadow shadow-indigo-500/30">
                S.I.M.A.
              </span>
              <span className="text-sm sm:text-base font-bold tracking-tight text-slate-100 font-mono group-hover:text-indigo-300 transition-colors whitespace-nowrap">
                Sistema Inteligente Modular
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveMainView('console')}
              className={`py-1 transition-colors cursor-pointer whitespace-nowrap ${
                activeMainView === 'console'
                  ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Console de Agentes
            </button>
            <button
              type="button"
              onClick={() => setActiveMainView('audiences')}
              className={`py-1 transition-colors cursor-pointer whitespace-nowrap ${
                activeMainView === 'audiences'
                  ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Simulador de Públicos
            </button>
            <button
              type="button"
              onClick={() => setActiveMainView('testsuite')}
              className={`py-1 transition-colors cursor-pointer whitespace-nowrap ${
                activeMainView === 'testsuite'
                  ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Suite de Testes
            </button>
            <button
              type="button"
              onClick={() => setActiveMainView('timeline')}
              className={`py-1 transition-colors cursor-pointer whitespace-nowrap ${
                activeMainView === 'timeline'
                  ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Linha do Tempo
            </button>
            <button
              type="button"
              onClick={() => setActiveMainView('predictive')}
              className={`py-1 transition-colors cursor-pointer whitespace-nowrap ${
                activeMainView === 'predictive'
                  ? 'text-indigo-400 font-semibold border-b-2 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Preditivo Qdrant
            </button>
          </nav>

          {/* Zone 3: Actions + Telemetry */}
          <div className="flex items-center gap-3">
            {/* Language Selection Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800/80 px-2.5 py-1.5 rounded-lg text-xs font-mono">
              <Globe className="text-indigo-400 shrink-0" size={13} />
              <select
                value={language}
                onChange={(e) => {
                  setLanguage(e.target.value);
                  addLog(`[LANG] Idioma alterado para: ${e.target.value.toUpperCase()}`);
                }}
                className="bg-transparent text-slate-300 font-mono text-xs focus:outline-none cursor-pointer"
              >
                <option value="pt" className="bg-slate-900 text-slate-100">PT</option>
                <option value="en" className="bg-slate-900 text-slate-100">EN</option>
                <option value="es" className="bg-slate-900 text-slate-100">ES</option>
                <option value="fr" className="bg-slate-900 text-slate-100">FR</option>
                <option value="de" className="bg-slate-900 text-slate-100">DE</option>
                <option value="ja" className="bg-slate-900 text-slate-100">JA</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveMainView('console');
                setProblemInput('');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg transition-colors whitespace-nowrap shadow-sm cursor-pointer"
            >
              Nova Simulação
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-Bar */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto pt-2.5 mt-2 border-t border-slate-900/80 text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveMainView('console')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeMainView === 'console' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Console
          </button>
          <button
            type="button"
            onClick={() => setActiveMainView('audiences')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeMainView === 'audiences' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Públicos & Versões
          </button>
          <button
            type="button"
            onClick={() => setActiveMainView('testsuite')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeMainView === 'testsuite' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Suite de Testes
          </button>
          <button
            type="button"
            onClick={() => setActiveMainView('timeline')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeMainView === 'timeline' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Linha do Tempo
          </button>
          <button
            type="button"
            onClick={() => setActiveMainView('predictive')}
            className={`px-2.5 py-1 rounded transition-colors whitespace-nowrap cursor-pointer ${
              activeMainView === 'predictive' ? 'bg-indigo-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Preditivo Qdrant
          </button>
        </div>
      </header>

      {/* Main Sandbox Grid Dashboard layout */}
      {activeMainView === 'console' && (
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Input Control, Presets and Simulation outputs (7cols) */}
        <section className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Diagnostic Control Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex items-center gap-2 mb-3">
              <Activity className="text-indigo-400" size={18} />
              <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase font-mono">
                {t.diagnosticTitle}
              </h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-normal font-mono mb-4">
              {t.diagnosticDesc}
            </p>

            {/* Presets List selectors */}
            <div className="mb-4">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">
                {t.presetTitle}
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    disabled={loading}
                    className="text-[11px] font-mono text-slate-300 bg-slate-950 border border-slate-800 hover:border-slate-700 hover:text-white px-2.5 py-1 rounded transition-all text-left truncate max-w-xs block cursor-pointer"
                    title={preset}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Main problem text input field area with Voice Dictation */}
            <form onSubmit={(e) => { e.preventDefault(); handleSolve(''); }} className="space-y-3">
              <div className="relative">
                <textarea
                  placeholder={t.placeholderText}
                  value={problemInput}
                  onChange={(e) => setProblemInput(e.target.value)}
                  disabled={loading}
                  rows={4}
                  className={`w-full bg-slate-950 border text-slate-200 placeholder-slate-600 rounded-lg p-3 pr-10 text-xs font-mono focus:outline-none transition-all resize-none leading-relaxed ${
                    isRecording 
                      ? 'border-red-500/80 ring-1 ring-red-500/50 shadow-md shadow-red-500/10' 
                      : 'border-slate-800 focus:border-indigo-600'
                  }`}
                />

                {/* Quick Mic Icon in corner of textarea */}
                <button
                  type="button"
                  onClick={toggleVoiceRecording}
                  disabled={loading}
                  title={isRecording ? t.micStop : t.micDictate}
                  className={`absolute right-2.5 top-2.5 p-1.5 rounded-md transition-all cursor-pointer ${
                    isRecording 
                      ? 'bg-red-500 text-white animate-pulse shadow-md shadow-red-500/30' 
                      : 'bg-slate-900/80 text-slate-400 hover:text-indigo-300 hover:bg-slate-800 border border-slate-800/80'
                  }`}
                >
                  {isRecording ? <MicOff size={13} /> : <Mic size={13} />}
                </button>
              </div>

              {/* Active Voice Recording Status Bar & Audio Equalizer Indicator */}
              {isRecording && (
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-red-950/30 border border-red-900/60 rounded-lg text-xs font-mono text-red-300 animate-fadeIn">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5 h-3">
                      <span className="w-1 h-3 bg-red-400 rounded-full animate-bounce"></span>
                      <span className="w-1 h-4 bg-red-400 rounded-full animate-bounce [animation-delay:150ms]"></span>
                      <span className="w-1 h-2 bg-red-400 rounded-full animate-bounce [animation-delay:300ms]"></span>
                      <span className="w-1 h-4 bg-red-400 rounded-full animate-bounce [animation-delay:75ms]"></span>
                    </div>
                    <span className="font-semibold text-red-200 text-[11px]">{t.micListening}</span>
                  </div>
                  {interimSpeech && (
                    <div className="text-[11px] text-red-300/80 italic truncate max-w-xs">
                      "{interimSpeech}..."
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    className="px-2 py-0.5 bg-red-800/60 hover:bg-red-700 text-white rounded text-[10px] font-semibold transition-all cursor-pointer"
                  >
                    {t.micStop}
                  </button>
                </div>
              )}

              {/* Speech Error / Permission Warning Banner */}
              {speechError && (
                <div className="flex items-center justify-between gap-2 px-3 py-2 bg-amber-950/40 border border-amber-900/60 rounded-lg text-xs font-mono text-amber-300 animate-fadeIn">
                  <div className="flex items-center gap-1.5">
                    <AlertTriangle size={13} className="text-amber-400 shrink-0" />
                    <span className="text-[11px]">{speechError}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSpeechError(null)}
                    className="text-amber-400 hover:text-amber-200 text-xs px-1 cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              )}

              <div className="flex justify-between items-center gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {language === 'pt' ? 'Pronto para simulação' : 'Ready to simulate'}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Microphone dictation toggle button */}
                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    disabled={loading}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg font-mono transition-all flex items-center gap-1.5 cursor-pointer ${
                      isRecording
                        ? 'bg-red-600 text-white hover:bg-red-500 border border-red-500 shadow-md shadow-red-500/20 animate-pulse'
                        : 'text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/50'
                    }`}
                  >
                    {isRecording ? (
                      <>
                        <MicOff size={13} />
                        {t.micStop}
                      </>
                    ) : (
                      <>
                        <Mic size={13} className="text-indigo-400" />
                        {t.micDictate}
                      </>
                    )}
                  </button>

                  {problemInput && (
                    <button
                      type="button"
                      onClick={() => setProblemInput('')}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-slate-200 hover:bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-lg font-mono transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      {t.btnClean}
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={loading || !problemInput.trim()}
                    className={`px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed rounded-lg font-mono flex items-center gap-1.5 transition-all shadow-md active:scale-95 cursor-pointer ${
                      loading ? 'animate-pulse' : 'hover:shadow-indigo-500/20'
                    }`}
                  >
                    {loading ? (
                      <>
                        <span className="animate-spin text-white">⚙</span>
                        {t.btnSimulating}
                      </>
                    ) : (
                      <>
                        <Sparkles size={14} className="text-white animate-pulse" />
                        {t.btnSimulate}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>

          {/* Keyword and Lexicon Context Analyzer */}
          <KeywordAnalyzer 
            inputText={problemInput} 
            onInjectTags={(tags) => {
              const tagStr = tags.join(' ');
              setProblemInput(prev => {
                const trimmed = prev.trim();
                return trimmed ? `${trimmed}\n${tagStr}` : tagStr;
              });
              addLog(`[UI-LEXICON] Tags de contexto cognitivo injetadas: ${tagStr}`);
            }}
            language={language}
          />

          {/* Core Pipeline progression visualization */}
          <PipelineVisualizer 
            currentStageIdx={currentStageIdx} 
            stages={PIPELINE_STAGES} 
            isSimulating={simulationActive}
            onSkip={handleSkipSimulation}
            speed={pipelineSpeed}
            onSpeedChange={setPipelineSpeed}
            language={language}
          />

          {/* Live Output Terminal Console Logs */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-inner relative overflow-hidden flex-1 min-h-[160px] max-h-[180px] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-2">
              <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-mono uppercase tracking-widest">
                <Terminal size={12} />
                SIMA Core Terminal Output Log
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></span>
            </div>
            
            <div className="flex-1 overflow-y-auto font-mono text-[11px] text-slate-400 space-y-1.5 leading-relaxed pr-1 h-28">
              {consoleLogs.map((log, index) => (
                <div 
                  key={index} 
                  className={`border-l pl-2 py-0.5 ${
                    log.includes('[CRITICAL-ERROR]') 
                      ? 'text-red-400 border-red-500 bg-red-950/10' 
                      : log.includes('[SIMA-CORE]') 
                        ? 'text-slate-200 border-indigo-500' 
                        : 'text-slate-400 border-slate-800'
                  }`}
                >
                  {log}
                </div>
              ))}
              <div ref={consoleEndRef} />
            </div>
          </div>

          {/* Solved Diagnostic Solution Box resulting from simulation */}
          {simulationResult && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden space-y-4">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                <div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle className="text-emerald-400" size={16} />
                    <h4 className="text-sm font-semibold text-slate-200 font-mono uppercase tracking-wider">
                      Parecer Consolidado do Núcleo Central
                    </h4>
                  </div>
                  <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                    ID CASO: {simulationResult.timestamp ? new Date(simulationResult.timestamp).getTime().toString(36).toUpperCase() : 'SIM_LOCAL'}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400">
                    VM: {simulationResult.vm_environment}
                  </span>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded border font-semibold ${
                    simulationResult.urgency === 'Crítica'
                      ? 'bg-red-950/40 text-red-400 border-red-900/60'
                      : 'bg-indigo-950/40 text-indigo-400 border-indigo-900/60'
                  }`}>
                    {simulationResult.urgency}
                  </span>

                  {/* Export Case Metadata & Agent Thoughts JSON Button */}
                  <button
                    type="button"
                    id="btn-export-case-json"
                    onClick={handleExportJson}
                    title={t.exportJsonDesc}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all cursor-pointer shadow-sm ${
                      jsonExported
                        ? 'bg-emerald-950/80 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500/50'
                        : 'bg-slate-950 hover:bg-slate-850 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {jsonExported ? (
                      <>
                        <Check size={13} className="text-emerald-400" />
                        <span className="text-emerald-300">JSON Exportado!</span>
                      </>
                    ) : (
                      <>
                        <FileJson size={13} className="text-indigo-400" />
                        <span>{t.exportJson}</span>
                        <Download size={11} className="text-slate-400" />
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Comparative View: Current Opinion vs Qdrant Reference History */}
              <SolutionComparison 
                simulationResult={simulationResult}
                historyList={history}
                language={language}
                onSelectHistoricalCase={handleSelectSavedCase}
                onCopySuccess={(msg) => addToast('info', 'Área de Transferência', msg)}
              />

              {/* Operator Evaluation / Feedback System Section */}
              <div id="solution-feedback-section" className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 font-mono">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800/60 pb-2">
                  <div className="flex items-center gap-1.5">
                    <ThumbsUp size={14} className="text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                      {t.evalTitle}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-500">
                    {t.evalHelp}
                  </span>
                </div>

                {feedbackSubmitted ? (
                  <div className="p-3 bg-emerald-950/30 border border-emerald-800/50 rounded-lg flex items-center justify-between text-xs text-emerald-300">
                    <div className="flex items-center gap-2">
                      <CheckCheck size={16} className="text-emerald-400" />
                      <span>{t.evalSuccessMsg}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setFeedbackSubmitted(false)}
                      className="text-[10px] text-emerald-400 hover:text-emerald-200 underline cursor-pointer"
                    >
                      Editar avaliação
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Thumbs up / down rating selector */}
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        id="btn-feedback-positive"
                        onClick={() => setRating('positive')}
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          rating === 'positive'
                            ? 'bg-emerald-950/60 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-950/40 ring-1 ring-emerald-500/50'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                        }`}
                      >
                        <ThumbsUp size={14} className={rating === 'positive' ? 'text-emerald-400 animate-bounce' : ''} />
                        <span>{t.evalThumbUp}</span>
                      </button>

                      <button
                        type="button"
                        id="btn-feedback-negative"
                        onClick={() => setRating('negative')}
                        className={`flex-1 py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                          rating === 'negative'
                            ? 'bg-amber-950/60 border-amber-500 text-amber-300 shadow-md shadow-amber-950/40 ring-1 ring-amber-500/50'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-850'
                        }`}
                      >
                        <ThumbsDown size={14} className={rating === 'negative' ? 'text-amber-400 animate-bounce' : ''} />
                        <span>{t.evalThumbDown}</span>
                      </button>
                    </div>

                    {/* Calibration Tags */}
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-widest block mb-1.5">
                        {t.evalTagsLabel}
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {CALIBRATION_TAGS.map((tag) => {
                          const isSelected = selectedTags.includes(tag);
                          return (
                            <button
                              key={tag}
                              type="button"
                              onClick={() => handleToggleTag(tag)}
                              className={`px-2 py-1 rounded text-[10px] font-mono border transition-all flex items-center gap-1 cursor-pointer ${
                                isSelected
                                  ? 'bg-indigo-900/50 border-indigo-500 text-indigo-200 shadow-sm'
                                  : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-300'
                              }`}
                            >
                              <Tag size={9} />
                              {tag}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Technical observation notes */}
                    <div>
                      <textarea
                        value={feedbackNote}
                        onChange={(e) => setFeedbackNote(e.target.value)}
                        placeholder={t.evalNotePlaceholder}
                        rows={2}
                        maxLength={280}
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-600 resize-none font-mono"
                      />
                    </div>

                    {/* Submit evaluation action */}
                    <div className="flex justify-end">
                      <button
                        type="button"
                        id="btn-submit-feedback"
                        disabled={!rating || isSubmittingFeedback}
                        onClick={handleFeedbackSubmit}
                        className="px-4 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                      >
                        {isSubmittingFeedback ? (
                          <>
                            <span className="animate-spin">⚙</span>
                            <span>Enviando...</span>
                          </>
                        ) : (
                          <>
                            <Send size={12} />
                            <span>{t.evalSubmit}</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </section>

        {/* RIGHT COLUMN: Interactive Agent Cards connected to Message Bus, Memory state & Learning stats (5cols) */}
        <section className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Interactive 4D Cognitive Projection Studio */}
          <Studio4D language={language} />

          {/* Neural Sync & Google Link integration controls */}
          <IntegrationsPanel 
            language={language}
            onAddLog={(msg) => addLog(`[INTEGRATION] ${msg}`)}
            userEmail="gabrielrasalles@gmail.com"
            savedCasesCount={history.length}
          />

          {/* Agent grid cards network flow and thought logger */}
          <AgentNode 
            agentsData={agents} 
            activeAgentId={activeAgentId} 
            onSelectAgent={setActiveAgentId} 
            isLoading={loading}
            busActive={loading} // Message Bus shimmers when loader is generating consensus
          />

          {/* Dual memory database dashboard visualizers */}
          <MemoryPanel 
            historyList={history} 
            onClearHistory={handleClearHistory} 
            isLoading={loading}
            onSelectSavedCase={handleSelectSavedCase}
            language={language}
          />

          {/* S.I.M.A. Learning system success indexes */}
          <LearningPanel 
            efficiency={simulationResult ? simulationResult.metrics.efficiency_gain : 75}
            successRate={simulationResult ? simulationResult.metrics.success_rate : 80}
            redundancy={simulationResult ? simulationResult.metrics.redundancy_reduction : 68}
            category={simulationResult ? simulationResult.category : "Infraestrutura Geral"}
            feedbackLogs={feedbackLogs}
            language={language}
          />

          {/* S.I.M.A. Preemptive Failure Predictive Analysis using Qdrant Vector Data */}
          <PredictiveAnalysis 
            historyList={history}
            onSelectProblem={handleSelectSavedCase}
            language={language}
          />

        </section>
      </main>
      )}

      {/* Audience Simulator & Multi-Persona Validation View */}
      {activeMainView === 'audiences' && (
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6">
          <AudienceSimulator 
            onSimulateInMainCore={handleSimulateFromAudience}
            onAddLog={addLog}
            language={language}
          />
        </main>
      )}

      {/* Automated Multi-Audience Test Suite & Readiness Benchmark */}
      {activeMainView === 'testsuite' && (
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6">
          <AudienceTestSuite 
            onAddLog={addLog}
            language={language}
          />
        </main>
      )}

      {/* Timeline Trend View */}
      {activeMainView === 'timeline' && (
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6">
          <TimelineTrendView 
            historyList={history}
            onSelectSavedCase={handleSelectSavedCase}
            language={language}
          />
        </main>
      )}

      {/* Expanded Qdrant Vector Predictive View */}
      {activeMainView === 'predictive' && (
        <main className="flex-1 w-full max-w-7xl mx-auto px-6 py-6 flex flex-col gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden">
            <div className="border-b border-slate-800/80 pb-4 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-indigo-400 font-mono text-xs font-semibold">MOTOR VETORIAL QDRANT</span>
                <span className="text-slate-600 text-xs">·</span>
                <span className="text-slate-400 text-xs font-mono">Espaço Métrico 4096 Dimensões</span>
              </div>
              <h2 className="text-xl font-bold text-slate-100 mt-1">Análise Preditiva de Falhas por Proximidade de Vetor</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                Mapeamento estocástico de risco de novos incidentes correlacionando clusters históricos da base vetorial do Qdrant com telemetria em tempo real.
              </p>
            </div>
            <PredictiveAnalysis 
              historyList={history}
              onSelectProblem={handleSelectSavedCase}
              language={language}
            />
          </div>
        </main>
      )}

      {/* Humble Footer info */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-5 text-center text-slate-600 text-xs font-mono">
        <p>© 2026 S.I.M.A. — Sistema Inteligente Modular Adaptativo. Licenciado sob Apache-2.0.</p>
        <p className="mt-1 text-[10px] text-slate-600/80">
          Infraestrutura autônoma orquestrada em container seguro. IA baseada em modelos Gemini.
        </p>
      </footer>

    </div>
  );
}
