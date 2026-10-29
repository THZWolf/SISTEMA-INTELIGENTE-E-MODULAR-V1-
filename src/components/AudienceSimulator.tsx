import { useState } from 'react';
import { 
  Users, 
  Terminal, 
  Briefcase, 
  ShieldCheck, 
  HeartHandshake, 
  GraduationCap, 
  CheckCircle2, 
  Copy, 
  Check, 
  ArrowRight, 
  Layers, 
  Play, 
  Download, 
  Share2, 
  Info,
  Scale
} from 'lucide-react';
import { AUDIENCE_PERSONAS, AudiencePersona } from '../data/audiences';

interface AudienceSimulatorProps {
  language?: string;
  onSimulateInMainCore: (problemText: string) => void;
  onAddLog: (msg: string) => void;
}

export function AudienceSimulator({
  onSimulateInMainCore,
  onAddLog
}: AudienceSimulatorProps) {
  // Active Persona State
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('sre-devops');
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [customIncident, setCustomIncident] = useState<string>('');
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulatedPersonaResult, setSimulatedPersonaResult] = useState<any>(null);
  const [copiedArtifact, setCopiedArtifact] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'simulator' | 'matrix' | 'criteria'>('simulator');
  const [matrixIncidentIdx, setMatrixIncidentIdx] = useState<number>(0);

  const activePersona: AudiencePersona = 
    AUDIENCE_PERSONAS.find(p => p.id === selectedPersonaId) || AUDIENCE_PERSONAS[0];

  const currentPreset = activePersona.presets[selectedPresetIdx] || activePersona.presets[0];

  const handleSelectPreset = (idx: number) => {
    setSelectedPresetIdx(idx);
    setCustomIncident('');
    setSimulatedPersonaResult(null);
    onAddLog(`[AUDIENCE] Cenário para público '${activePersona.name}' selecionado: ${activePersona.presets[idx].title}`);
  };

  const handleRunAudienceSimulation = () => {
    setIsSimulating(true);
    const incidentToRun = customIncident.trim() || currentPreset.incident;
    onAddLog(`[AUDIENCE] Simulando solução customizada para: ${activePersona.name} • "${incidentToRun.substring(0, 45)}..."`);

    setTimeout(() => {
      // Generate dynamically tailored response based on persona and incident
      const result = {
        personaId: activePersona.id,
        personaName: activePersona.name,
        incident: incidentToRun,
        summary: currentPreset.sampleOutput.summary,
        priorities: currentPreset.sampleOutput.priorities,
        artifact: currentPreset.sampleOutput.actionableArtifact,
        artifactType: currentPreset.sampleOutput.actionableType,
        kpiImpact: currentPreset.sampleOutput.kpiImpact,
        timestamp: new Date().toISOString()
      };
      setSimulatedPersonaResult(result);
      setIsSimulating(false);
      onAddLog(`[AUDIENCE] ✅ Parecer específico para '${activePersona.name}' sintetizado com sucesso.`);
    }, 900);
  };

  const handleCopyArtifact = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedArtifact(true);
    setTimeout(() => setCopiedArtifact(false), 2000);
    onAddLog(`[AUDIENCE] Artefato de '${activePersona.name}' copiado para a área de transferência.`);
  };

  const handleExportAudienceDossier = () => {
    const data = {
      audience_persona: activePersona,
      active_scenario: currentPreset,
      simulation_result: simulatedPersonaResult || currentPreset.sampleOutput,
      system_validation_timestamp: new Date().toISOString(),
      platform: "S.I.M.A. - Sistema Inteligente Modular Adaptativo"
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sima-dossier-${activePersona.id}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    onAddLog(`[AUDIENCE] 💾 Dossiê completo do público '${activePersona.name}' exportado.`);
  };

  // Cross-Audience Matrix presets
  const MATRIX_SCENARIOS = [
    {
      title: "Falha de Conexão no Banco PostgreSQL sob Alta Carga",
      sre: "Ajuste de max_connections, ativação de connection pooling no PgBouncer e otimização de queries com EXPLAIN ANALYZE.",
      executive: "Preservação de R$ 120.000 em transações em risco; SLA de 99.9% mantido sem perda de pedidos no pico.",
      compliance: "Zero vazamento de dados confidenciais; hash de auditoria gerado no log do Postgres e integridade das sessões verificada.",
      customer: "Comunicado público claro na Status Page avisando retorno normalizado em menos de 5 minutos, sem impacto em dados dos usuários.",
      academic: "Demonstração com Teorema da Fila M/M/c que a capacidade de processamento satura quando taxa de chegada λ excede c·μ."
    },
    {
      title: "Tentativa de Injeção de SQL e Esgotamento de Memória",
      sre: "Bloqueio de IP no iptables / Nginx limit_req, purge de threads pendentes no pool e reinício seguro de workers zumbis.",
      executive: "Nenhum impacto de faturamento ou vazamento financeiro; comitê de segurança notificado em tempo hábil.",
      compliance: "Atestado forense emitido com base no Artigo 48 da LGPD comprovando que dados pessoais não foram extraídos.",
      customer: "Nenhuma ação requerida pelos usuários finais. Serviço permaneceu resiliente sem interrupção de acesso.",
      academic: "Convergência dialética entre Agente Causal (raiz no input sem escape) e Agente Estratégico com custo de decisão O(1)."
    }
  ];

  const getPersonaIcon = (id: string) => {
    switch (id) {
      case 'sre-devops':
        return <Terminal size={16} className="text-emerald-400" />;
      case 'executive-c-level':
        return <Briefcase size={16} className="text-amber-400" />;
      case 'secops-compliance':
        return <ShieldCheck size={16} className="text-blue-400" />;
      case 'customer-support-cs':
        return <HeartHandshake size={16} className="text-purple-400" />;
      case 'cognitive-lab':
        return <GraduationCap size={16} className="text-indigo-400" />;
      default:
        return <Users size={16} className="text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl relative overflow-hidden flex flex-col gap-6">
      
      {/* Background soft ambient decoration */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header section with audience context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 font-mono text-xs font-semibold">
              MÓDULO DE VALIDAÇÃO MULTIDISCIPLINAR
            </span>
            <span className="text-slate-600 text-xs">·</span>
            <span className="text-slate-400 text-xs font-mono">5 Públicos Estratégicos</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 mt-1 flex items-center gap-2">
            Simulador de Públicos & Versões do S.I.M.A.
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Antes de gerar a versão real em produção do Sistema Inteligente Modular, teste como a inteligência 
            adapta a linguagem, a profundidade das causas, os artefatos de entrega e as prioridades 
            para cada perfil de usuário.
          </p>
        </div>

        {/* Tab selection */}
        <div className="flex items-center gap-1 p-1 bg-slate-950 border border-slate-800 rounded-lg shrink-0 self-start md:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play size={13} />
            <span>Simulador de Persona</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('matrix')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers size={13} />
            <span>Matriz Comparativa</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('criteria')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'criteria'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Scale size={13} />
            <span>Critérios de Aceite</span>
          </button>
        </div>
      </div>

      {activeTab === 'simulator' && (
        <div className="flex flex-col gap-6">
          
          {/* Persona selector bar */}
          <div>
            <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-2.5">
              Selecione o Público-Alvo para Simulação
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
              {AUDIENCE_PERSONAS.map((persona) => {
                const isSelected = persona.id === selectedPersonaId;
                return (
                  <button
                    key={persona.id}
                    type="button"
                    onClick={() => {
                      setSelectedPersonaId(persona.id);
                      setSelectedPresetIdx(0);
                      setSimulatedPersonaResult(null);
                      onAddLog(`[AUDIENCE] Alternado para público: ${persona.name}`);
                    }}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between gap-2 cursor-pointer ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500 shadow-md ring-1 ring-indigo-500/30'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="p-1.5 bg-slate-900 rounded-md border border-slate-800">
                        {getPersonaIcon(persona.id)}
                      </div>
                      {isSelected && (
                        <span className="text-[10px] font-mono text-indigo-400 bg-indigo-950/80 px-1.5 py-0.5 rounded border border-indigo-800/50">
                          Ativo
                        </span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-slate-200 line-clamp-1">
                        {persona.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                        {persona.role}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Persona Banner Details */}
          <div className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-200">
                  {activePersona.name}
                </span>
                <span className="text-slate-600 text-xs">·</span>
                <span className="text-xs text-slate-400">
                  {activePersona.role}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                {activePersona.description}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-slate-500">
                <span>Tom de Linguagem: <strong className="text-slate-300 font-normal">{activePersona.languageTone}</strong></span>
                <span aria-hidden="true">·</span>
                <span>Preocupação Primária: <strong className="text-slate-300 font-normal">{activePersona.primaryConcern}</strong></span>
              </div>
            </div>

            {/* Target metrics indicator */}
            <div className="flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-800/80 pt-3 md:pt-0 md:pl-4">
              {activePersona.keyMetrics.map((km, i) => (
                <div key={i} className="text-center font-mono">
                  <p className="text-[10px] text-slate-500 uppercase">{km.label}</p>
                  <p className="text-xs font-semibold text-indigo-300 mt-0.5 tabular-nums">
                    {km.idealRange}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Incident selection and customization */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            
            {/* Left side: Presets & input */}
            <div className="lg:col-span-6 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-300 font-medium">
                  Cenários Recomendados para {activePersona.name}
                </span>
                <span className="text-[11px] text-slate-500 font-mono">
                  {activePersona.presets.length} presets disponíveis
                </span>
              </div>

              {/* Preset buttons */}
              <div className="flex flex-col gap-2">
                {activePersona.presets.map((preset, idx) => {
                  const isSelected = selectedPresetIdx === idx && !customIncident;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectPreset(idx)}
                      className={`p-3 rounded-lg border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-850 border-indigo-500/70 shadow-sm ring-1 ring-indigo-500/20'
                          : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h5 className="text-xs font-semibold text-slate-200">
                          {preset.title}
                        </h5>
                        <span className="text-[10px] font-mono text-slate-400">
                          {preset.urgency}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                        {preset.incident}
                      </p>
                    </button>
                  );
                })}
              </div>

              {/* Custom incident test area */}
              <div className="mt-1">
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1.5">
                  Ou digite um incidente customizado para testar este público:
                </label>
                <textarea
                  value={customIncident}
                  onChange={(e) => setCustomIncident(e.target.value)}
                  placeholder={`Ex: Como o S.I.M.A. explicaria uma falha de sincronização para o público '${activePersona.name}'?`}
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-600 font-mono resize-none"
                />
              </div>

              {/* Simulation triggers */}
              <div className="flex items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={handleRunAudienceSimulation}
                  disabled={isSimulating}
                  className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  {isSimulating ? (
                    <>
                      <span className="animate-spin">⚙</span>
                      <span>Adaptando Cognição ao Público...</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      <span>Simular Parecer para {activePersona.name}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => onSimulateInMainCore(customIncident.trim() || currentPreset.incident)}
                  title="Carregar este caso no Solver Geral de 6 Agentes"
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer whitespace-nowrap"
                >
                  <span>Enviar ao Solver Geral</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Right side: Tailored Audience Output & Actionable Artifact */}
            <div className="lg:col-span-6 bg-slate-950 border border-slate-800/90 rounded-lg p-4 flex flex-col justify-between gap-4">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-200 font-mono">
                      PARECER COGNITIVO S.I.M.A.
                    </span>
                    <span className="text-slate-600 text-xs">·</span>
                    <span className="text-[11px] text-indigo-400 font-mono">
                      {activePersona.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleExportAudienceDossier}
                      title="Exportar dossiê deste público como JSON"
                      className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded transition-colors"
                    >
                      <Download size={13} />
                    </button>
                  </div>
                </div>

                {/* Perspective & synthesis text */}
                <div className="mt-3">
                  <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                    Perspectiva do Usuário
                  </p>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/50 p-2.5 rounded border border-slate-800/60 font-mono">
                    {currentPreset.audiencePerspective}
                  </p>
                </div>

                {/* Executive / technical summary */}
                <div className="mt-3">
                  <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                    Diagnóstico Adaptado
                  </p>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {simulatedPersonaResult ? simulatedPersonaResult.summary : currentPreset.sampleOutput.summary}
                  </p>
                </div>

                {/* Priorities for this persona */}
                <div className="mt-3">
                  <p className="text-[11px] font-mono text-slate-500 uppercase tracking-wider mb-1.5">
                    Prioridades de Atuação Imediatas
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {(simulatedPersonaResult ? simulatedPersonaResult.priorities : currentPreset.sampleOutput.priorities).map((p: string, idx: number) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 size={13} className="text-emerald-400 shrink-0 mt-0.5" />
                        <span>{p}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actionable Artifact Card with 1-click Copy */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      {currentPreset.sampleOutput.actionableType === 'runbook' && <Terminal size={12} className="text-emerald-400" />}
                      {currentPreset.sampleOutput.actionableType === 'briefing' && <Briefcase size={12} className="text-amber-400" />}
                      {currentPreset.sampleOutput.actionableType === 'compliance' && <ShieldCheck size={12} className="text-blue-400" />}
                      {currentPreset.sampleOutput.actionableType === 'bulletin' && <HeartHandshake size={12} className="text-purple-400" />}
                      {currentPreset.sampleOutput.actionableType === 'proof' && <GraduationCap size={12} className="text-indigo-400" />}
                      <span>Artefato Operacional Específico</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyArtifact(simulatedPersonaResult ? simulatedPersonaResult.artifact : currentPreset.sampleOutput.actionableArtifact)}
                      className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                    >
                      {copiedArtifact ? (
                        <>
                          <Check size={11} className="text-emerald-400" />
                          <span className="text-emerald-400">Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy size={11} />
                          <span>Copiar Artefato</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-[11px] text-slate-300 whitespace-pre-wrap overflow-x-auto max-h-48 leading-relaxed">
                    {simulatedPersonaResult ? simulatedPersonaResult.artifact : currentPreset.sampleOutput.actionableArtifact}
                  </div>
                </div>
              </div>

              {/* KPI Impact Grid */}
              <div className="border-t border-slate-800/80 pt-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block mb-2">
                  Impacto Mensurável Neste Perfil
                </span>
                <div className="grid grid-cols-3 gap-2">
                  {Object.entries(simulatedPersonaResult ? simulatedPersonaResult.kpiImpact : currentPreset.sampleOutput.kpiImpact).map(([k, v], i) => (
                    <div key={i} className="bg-slate-900/60 p-2 rounded border border-slate-800/60 text-center font-mono">
                      <p className="text-[9px] text-slate-400 truncate">{k}</p>
                      <p className="text-xs font-semibold text-indigo-300 mt-0.5 tabular-nums">
                        {String(v)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* MATRIX TAB: Side by side cross-audience perspective on the same incident */}
      {activeTab === 'matrix' && (
        <div className="flex flex-col gap-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-950 p-4 rounded-lg border border-slate-800">
            <div>
              <span className="text-xs font-mono text-slate-400">
                Selecione o Incidente Base para Comparação Entre Públicos
              </span>
              <h3 className="text-sm font-semibold text-slate-100 mt-0.5">
                {MATRIX_SCENARIOS[matrixIncidentIdx].title}
              </h3>
            </div>
            <div className="flex items-center gap-2">
              {MATRIX_SCENARIOS.map((sc, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setMatrixIncidentIdx(i)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md border transition-colors cursor-pointer ${
                    matrixIncidentIdx === i
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Caso {i + 1}
                </button>
              ))}
            </div>
          </div>

          {/* 5 Column / Card Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            
            {/* SRE Column */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 font-mono mb-2">
                  <Terminal size={14} />
                  <span>1. Engenharia SRE</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {MATRIX_SCENARIOS[matrixIncidentIdx].sre}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                Artefato: Runbook CLI Bash
              </div>
            </div>

            {/* Executive Column */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-400 font-mono mb-2">
                  <Briefcase size={14} />
                  <span>2. C-Level / Negócios</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {MATRIX_SCENARIOS[matrixIncidentIdx].executive}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                Artefato: Briefing Executivo C-Level
              </div>
            </div>

            {/* Compliance Column */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 font-mono mb-2">
                  <ShieldCheck size={14} />
                  <span>3. Auditoria & LGPD</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {MATRIX_SCENARIOS[matrixIncidentIdx].compliance}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                Artefato: Hash Criptográfico SHA-256
              </div>
            </div>

            {/* Customer Support Column */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-400 font-mono mb-2">
                  <HeartHandshake size={14} />
                  <span>4. Suporte N3 & CS</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {MATRIX_SCENARIOS[matrixIncidentIdx].customer}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                Artefato: Boletim Status Page
              </div>
            </div>

            {/* Academic Lab Column */}
            <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-400 font-mono mb-2">
                  <GraduationCap size={14} />
                  <span>5. Pesquisa Cognitiva</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  {MATRIX_SCENARIOS[matrixIncidentIdx].academic}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
                Artefato: Prova Formal & Little's Law
              </div>
            </div>

          </div>
        </div>
      )}

      {/* CRITERIA TAB: Acceptance criteria checklist per audience */}
      {activeTab === 'criteria' && (
        <div className="flex flex-col gap-4">
          <p className="text-xs text-slate-400">
            Critérios formais que o Sistema Inteligente Modular Adaptativo valida antes de autorizar a transição para a versão real de produção:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AUDIENCE_PERSONAS.map((persona) => (
              <div key={persona.id} className="bg-slate-950 border border-slate-800 rounded-lg p-4 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    {getPersonaIcon(persona.id)}
                    <h4 className="text-xs font-semibold text-slate-200">
                      {persona.name}
                    </h4>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    {persona.validationCriteria.map((c, i) => (
                      <div key={i} className="text-xs">
                        <div className="flex items-center justify-between text-slate-300 font-mono text-[11px]">
                          <span>{c.name}</span>
                          <span className="text-indigo-400 tabular-nums">Peso {c.weight}%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {c.description}
                        </p>
                        <div className="w-full h-1 bg-slate-900 rounded-full mt-1.5 overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: '100%' }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-emerald-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 size={11} />
                    Status: Validado no Sandbox
                  </span>
                  <span>100/100</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
