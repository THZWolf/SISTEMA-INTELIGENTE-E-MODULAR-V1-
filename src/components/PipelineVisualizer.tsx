import React from 'react';
import { 
  FileText, 
  Tag, 
  GitFork, 
  Send, 
  ShieldCheck, 
  Database, 
  Flag,
  ArrowRight,
  FastForward,
  Zap,
  Gauge
} from 'lucide-react';
import { PipelineStage, PipelineSpeed } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface PipelineVisualizerProps {
  currentStageIdx: number;
  stages: PipelineStage[];
  isSimulating?: boolean;
  onSkip?: () => void;
  speed?: PipelineSpeed;
  onSpeedChange?: (speed: PipelineSpeed) => void;
  language?: string;
}

export default function PipelineVisualizer({ 
  currentStageIdx, 
  stages,
  isSimulating = false,
  onSkip,
  speed = 'normal',
  onSpeedChange,
  language = 'pt'
}: PipelineVisualizerProps) {
  const t = TRANSLATIONS[language] || TRANSLATIONS.pt;
  
  const getIcon = (id: string, colorClass: string) => {
    switch (id) {
      case 'input': return <FileText className={colorClass} size={18} />;
      case 'classification': return <Tag className={colorClass} size={18} />;
      case 'division': return <GitFork className={colorClass} size={18} />;
      case 'dispatch': return <Send className={colorClass} size={18} />;
      case 'validation': return <ShieldCheck className={colorClass} size={18} />;
      case 'storage': return <Database className={colorClass} size={18} />;
      case 'response': return <Flag className={colorClass} size={18} />;
      default: return <FileText className={colorClass} size={18} />;
    }
  };

  const speedOptions: { value: PipelineSpeed; label: string; short: string }[] = [
    { value: 'normal', label: t.speedNormal || '1x Normal', short: '1x' },
    { value: 'fast', label: t.speedFast || '2x Rápido', short: '2x' },
    { value: 'ultra', label: t.speedUltra || '5x Ultra', short: '5x' },
    { value: 'instant', label: t.speedInstant || 'Instantâneo', short: '⚡ 0s' }
  ];

  return (
    <div id="pipeline-visualizer" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${isSimulating ? 'bg-emerald-500 animate-ping' : 'bg-emerald-500'}`}></span>
          <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase font-mono">
            {t.pipelineTitle}
          </h3>
          <span className="text-xs text-slate-400 font-mono bg-slate-950 px-2 py-0.5 rounded border border-slate-800 ml-1">
            {t.pipelineStep} {Math.min(currentStageIdx + 1, stages.length)} / {stages.length}
          </span>
        </div>

        {/* Speed Controls & Skip Button */}
        <div className="flex items-center gap-2">
          {/* Speed Selector */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5">
            <span className="text-[10px] text-slate-500 font-mono px-1.5 flex items-center gap-1 hidden sm:flex">
              <Gauge size={11} /> {t.speedLabel}:
            </span>
            {speedOptions.map((opt) => (
              <button
                key={opt.value}
                id={`speed-btn-${opt.value}`}
                type="button"
                onClick={() => onSpeedChange && onSpeedChange(opt.value)}
                className={`px-2 py-1 text-[11px] font-mono font-medium rounded transition-all ${
                  speed === opt.value
                    ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
                title={opt.label}
              >
                {opt.short}
              </button>
            ))}
          </div>

          {/* Skip Button during simulation */}
          {isSimulating && onSkip && (
            <button
              id="pipeline-skip-button"
              type="button"
              onClick={onSkip}
              className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:border-amber-500/60 rounded-lg text-xs font-mono font-medium transition-all shadow-sm active:scale-95 animate-pulse"
              title={t.skipPipeline || 'Pular Visualização'}
            >
              <FastForward size={14} />
              <span className="hidden xs:inline">{t.skipPipeline || 'Pular'}</span>
              <Zap size={12} className="text-amber-400" />
            </button>
          )}
        </div>
      </div>

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-2 overflow-x-auto pb-2">
        {stages.map((stage, idx) => {
          const isActive = idx === currentStageIdx;
          const isCompleted = idx < currentStageIdx;

          let bgCircleClass = 'bg-slate-950 border-slate-800 text-slate-500';
          let textColorClass = 'text-slate-400';
          let iconColorClass = 'text-slate-500';

          if (isActive) {
            bgCircleClass = 'bg-blue-950/40 border-blue-500 text-blue-400 ring-2 ring-blue-500/20';
            textColorClass = 'text-blue-200 font-medium';
            iconColorClass = 'text-blue-400 animate-pulse';
          } else if (isCompleted) {
            bgCircleClass = 'bg-emerald-950/30 border-emerald-600 text-emerald-400';
            textColorClass = 'text-slate-300';
            iconColorClass = 'text-emerald-400';
          }

          return (
            <React.Fragment key={stage.id}>
              {/* Stage Card */}
              <div 
                id={`pipeline-stage-${stage.id}`}
                className={`flex flex-row md:flex-col items-center gap-3 md:gap-2 p-2.5 md:p-3 rounded-lg border flex-1 min-w-[140px] text-left md:text-center transition-all duration-300 ${
                  isActive 
                    ? 'bg-blue-950/20 border-blue-800/60 shadow-md shadow-blue-500/5 scale-[1.02]' 
                    : isCompleted 
                      ? 'bg-emerald-950/5 border-emerald-950/40' 
                      : 'bg-slate-950/50 border-transparent'
                }`}
              >
                {/* Stage Icon Circle */}
                <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center transition-all ${bgCircleClass}`}>
                  {getIcon(stage.id, iconColorClass)}
                </div>

                {/* Labels */}
                <div className="flex-1 md:flex-initial">
                  <div className={`text-xs ${textColorClass} tracking-wide font-mono`}>
                    {stage.label}
                  </div>
                  <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                    {stage.description}
                  </div>
                </div>
              </div>

              {/* Connector Arrow */}
              {idx < stages.length - 1 && (
                <div className="hidden md:flex items-center text-slate-700 mx-1">
                  <ArrowRight 
                    size={14} 
                    className={`${isCompleted ? 'text-emerald-600/70' : isActive ? 'text-blue-500/50' : 'text-slate-800'}`} 
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

