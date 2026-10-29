import { useMemo } from 'react';
import { INFRASTRUCTURE_LEXICON, LexiconEntry } from '../data/lexicon';
import { 
  Database, 
  Lightbulb, 
  FileText, 
  Layers, 
  Sparkles, 
  PlusCircle, 
  HelpCircle,
  TrendingUp
} from 'lucide-react';

interface KeywordAnalyzerProps {
  inputText: string;
  language: string;
  onInjectTags: (tags: string[]) => void;
}

export default function KeywordAnalyzer({ inputText, language, onInjectTags }: KeywordAnalyzerProps) {
  // Real-time keyword scanning
  const matchedEntries = useMemo(() => {
    if (!inputText.trim()) return [];
    
    const normalizedInput = inputText.toLowerCase();
    return INFRASTRUCTURE_LEXICON.filter(entry => 
      normalizedInput.includes(entry.keyword)
    );
  }, [inputText]);

  // Compute final score of coherence
  const coherenceScore = useMemo(() => {
    if (matchedEntries.length === 0) return 0;
    const sum = matchedEntries.reduce((acc, entry) => acc + entry.scoreWeight, 0);
    const avg = sum / matchedEntries.length;
    // Map to scale based on total matches
    return Math.min(100, Math.round(avg * 10 + (matchedEntries.length * 5)));
  }, [matchedEntries]);

  // Translate labels
  const labels: Record<string, any> = {
    pt: {
      title: "Analisador Multilíngue de Palavras-Chave",
      sub: "Detecção léxica com base no contexto inicial do problema",
      coherence: "Coerência do Contexto",
      activeMatches: "Correspondências Ativas no Banco",
      noMatches: "Aguardando entrada técnica com palavras-chave...",
      injectBtn: "Injetar tags no prompt",
      matchesFound: "Tags recomendadas detectadas!"
    },
    en: {
      title: "Multilingual Keyword Analyzer",
      sub: "Lexical detection based on initial problem context",
      coherence: "Context Coherence",
      activeMatches: "Active Matches in Database",
      noMatches: "Waiting for technical keyword input...",
      injectBtn: "Inject tags into prompt",
      matchesFound: "Recommended tags detected!"
    },
    es: {
      title: "Analizador de Palabras Clave",
      sub: "Detección léxica basada en el contexto inicial",
      coherence: "Coherencia del Contexto",
      activeMatches: "Coincidencias Activas en la Base",
      noMatches: "Esperando entrada técnica con palabras clave...",
      injectBtn: "Inyectar etiquetas al prompt",
      matchesFound: "¡Etiquetas recomendadas detectadas!"
    },
    fr: {
      title: "Analyseur de Mots-Clés",
      sub: "Détection lexicale basée sur le contexte initial",
      coherence: "Cohérence du Contexte",
      activeMatches: "Correspondances Actives dans la Base",
      noMatches: "En attente de mots-clés techniques...",
      injectBtn: "Injecter des tags au prompt",
      matchesFound: "Tags recommandés détectés!"
    },
    de: {
      title: "Keyword-Analysator",
      sub: "Lexikalische Erkennung basierend auf dem Kontext",
      coherence: "Kontext-Kohärenz",
      activeMatches: "Aktive Übereinstimmungen",
      noMatches: "Warte auf technische Keyword-Eingaben...",
      injectBtn: "Tags in Prompt einfügen",
      matchesFound: "Empfohlene Tags erkannt!"
    },
    ja: {
      title: "多言語キーワード解析エンジン",
      sub: "初期文脈に基づいたシステムキーワードの検出と照合",
      coherence: "文脈整合性スコア",
      activeMatches: "検出されたデータベース用語",
      noMatches: "技術用語の入力を待機中...",
      injectBtn: "タグをプロンプトに注入",
      matchesFound: "推奨タグが検出されました！"
    }
  };

  const t = labels[language] || labels.en;

  // Gather all unique tags from matched entries to inject in bulk
  const allSuggestedTags = useMemo(() => {
    const tags = new Set<string>();
    matchedEntries.forEach(entry => {
      entry.injectTags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags);
  }, [matchedEntries]);

  return (
    <div id="keyword-analyzer-widget" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between h-[340px]">
      
      <div>
        <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
          <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase font-mono flex items-center gap-1.5">
            <Database size={16} className="text-emerald-400" />
            {t.title}
          </h3>
          <span className="text-[10px] text-emerald-400 font-mono bg-emerald-950/40 border border-emerald-900/40 px-2 py-0.5 rounded">
            100+ Lexicon Terms
          </span>
        </div>
        <p className="text-[11px] text-slate-400 font-mono leading-normal mb-3">
          {t.sub}
        </p>

        {/* Real-time calculated context coherence bar */}
        <div className="bg-slate-950 border border-slate-850 p-3 rounded-lg mb-4">
          <div className="flex items-center justify-between text-xs font-mono mb-1.5">
            <span className="text-slate-400 flex items-center gap-1">
              <TrendingUp size={14} className="text-emerald-400" />
              {t.coherence}
            </span>
            <span className={`font-bold ${coherenceScore > 50 ? 'text-emerald-400' : 'text-slate-500'}`}>
              {coherenceScore}%
            </span>
          </div>
          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-gradient-to-r from-indigo-500 via-emerald-400 to-emerald-500 h-full transition-all duration-500"
              style={{ width: `${coherenceScore}%` }}
            />
          </div>
        </div>

        {/* Scanned matching results container */}
        <div className="overflow-y-auto max-h-[120px] space-y-2 pr-1 h-[120px]">
          {matchedEntries.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-slate-600 py-4">
              <HelpCircle size={20} className="stroke-1 mb-1.5" />
              <p className="text-[11px] font-mono leading-relaxed">{t.noMatches}</p>
            </div>
          ) : (
            matchedEntries.map((entry, idx) => (
              <div 
                key={idx} 
                className="bg-slate-950 border border-slate-850/60 p-2.5 rounded-lg text-xs font-mono flex flex-col gap-1"
              >
                <div className="flex items-center justify-between">
                  <span className="text-emerald-400 font-semibold text-[11px]">{entry.label}</span>
                  <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-slate-900 border border-slate-800 text-slate-500">
                    {entry.category}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal">
                  {entry.description[language] || entry.description.en}
                </p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {entry.injectTags.map((tag, tIdx) => (
                    <span 
                      key={tIdx} 
                      className="text-[9px] text-indigo-400 font-mono bg-indigo-950/30 border border-indigo-900/30 px-1 py-0.2 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inject helper action button */}
      {matchedEntries.length > 0 && (
        <button
          type="button"
          onClick={() => onInjectTags(allSuggestedTags)}
          className="w-full text-center py-2 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-500/20 text-emerald-400 hover:text-emerald-300 font-mono text-[11px] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
        >
          <PlusCircle size={13} />
          {t.injectBtn} ({allSuggestedTags.length} tags)
        </button>
      )}

    </div>
  );
}
