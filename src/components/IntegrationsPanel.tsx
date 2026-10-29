import { useState } from 'react';
import { 
  Chrome, 
  Github, 
  Smartphone, 
  CheckCircle, 
  RefreshCw, 
  Cpu, 
  Database,
  GitBranch,
  Terminal,
  LogOut,
  ChevronRight
} from 'lucide-react';

interface IntegrationsPanelProps {
  language: string;
  userEmail: string;
  onAddLog: (logText: string) => void;
  savedCasesCount: number;
}

export default function IntegrationsPanel({ language, userEmail, onAddLog, savedCasesCount }: IntegrationsPanelProps) {
  // Google neural link state
  const [googleUser, setGoogleUser] = useState<{
    linked: boolean;
    name: string;
    email: string;
    neuralFrequency: string;
  } | null>(null);
  
  const [googleLoading, setGoogleLoading] = useState<boolean>(false);

  // Flutter client state
  const [flutterSynced, setFlutterSynced] = useState<boolean>(true);
  const [flutterLatency, setFlutterLatency] = useState<number>(12);

  // GitHub backup state
  const [githubRepo, setGithubRepo] = useState<string>('gabrielrasalles/sima-cognitive-logs');
  const [gitLoading, setGitLoading] = useState<boolean>(false);
  const [lastCommitSha, setLastCommitSha] = useState<string | null>(null);
  const [gitLogs, setGitLogs] = useState<string[]>([]);

  // Simulation handlers
  const handleGoogleLink = () => {
    setGoogleLoading(true);
    onAddLog("Iniciando fluxo de autenticação neural Google Account...");
    
    setTimeout(() => {
      setGoogleUser({
        linked: true,
        name: userEmail ? userEmail.split('@')[0].toUpperCase() : "GABRIEL SALLES",
        email: userEmail || "gabrielrasalles@gmail.com",
        neuralFrequency: "98.7 MHz (Sincronizado)"
      });
      setGoogleLoading(false);
      onAddLog("Google Neural Login concluído com sucesso. Perfil associado: " + (userEmail || "gabrielrasalles@gmail.com"));
    }, 1800);
  };

  const handleGoogleLogout = () => {
    setGoogleUser(null);
    onAddLog("Canal Google Neural desconectado.");
  };

  const handleGithubBackup = () => {
    if (savedCasesCount === 0) {
      onAddLog("GitHub Sync cancelado: Nenhum caso salvo no PostgreSQL para arquivar.");
      return;
    }

    setGitLoading(true);
    setGitLogs([
      "Initializing Git client session...",
      "Resolving remote origin to: github.com/" + githubRepo,
      "Packaging " + savedCasesCount + " PostgreSQL relational case-logs..."
    ]);

    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (step === 1) {
        setGitLogs(prev => [...prev, "git add db/schema.ts src/data/case_logs.json"]);
      } else if (step === 2) {
        const sha = Math.random().toString(16).substring(2, 9);
        setLastCommitSha(sha);
        setGitLogs(prev => [...prev, `git commit -m "feat: archive SIMA cognitive cases [SHA: ${sha}]"`]);
      } else if (step === 3) {
        setGitLogs(prev => [...prev, "git push origin main --force"]);
      } else if (step === 4) {
        setGitLogs(prev => [...prev, "Branch main synchronized with GitHub repository."]);
        clearInterval(interval);
        setGitLoading(false);
        onAddLog(`[GITHUB] Caso sincronizado com repositório remoto gabrielrasalles/sima-cognitive-logs. SHA: ${lastCommitSha || 'a4e921b'}`);
      }
    }, 600);
  };

  // Translations dictionary
  const labels: Record<string, any> = {
    pt: {
      title: "Integrações Neurais e Sincronizações",
      sub: "Google Neural Login, App Flutter Integrado e Armazenamento no GitHub.",
      googleTitle: "Link Neural do Google",
      googleDesc: "Faça login com sua conta do Google de forma criptografada para carregar suas instabilidades de VM salvas.",
      googleBtn: "Vincular Google Neural ID",
      flutterTitle: "Cliente Flutter Ativo",
      flutterDesc: "Dispositivo móvel conectado via Dart Socket IPC compartilhando o buffer de logs cognitivos da VM.",
      flutterLatencyLabel: "Latência de IPC",
      githubTitle: "Backup para GitHub",
      githubDesc: "Submeta o histórico do PostgreSQL diretamente para sua branch Git.",
      githubPlaceholder: "Repositório de Backup GitHub",
      githubBtn: "Comitar no GitHub",
      gitTerminal: "Terminal Git Remoto"
    },
    en: {
      title: "Neural Integrations & Synchronization",
      sub: "Google Neural Login, companion Flutter app, and secure GitHub backups.",
      googleTitle: "Google Neural Link",
      googleDesc: "Login with your Google account via encrypted link to load saved custom virtual machine parameters.",
      googleBtn: "Link Google Neural ID",
      flutterTitle: "Active Flutter Client",
      flutterDesc: "Companion device connected via Dart Socket IPC sharing the cognitive memory buffer.",
      flutterLatencyLabel: "IPC Latency",
      githubTitle: "GitHub Storage Backup",
      githubDesc: "Submit localized PostgreSQL history logs directly to your secure Git branch.",
      githubPlaceholder: "GitHub Backup Repository",
      githubBtn: "Commit to GitHub",
      gitTerminal: "Remote Git Terminal"
    },
    es: {
      title: "Integraciones Neurales y Sincronización",
      sub: "Google Neural Login, aplicación Flutter compañera y almacenamiento en GitHub.",
      googleTitle: "Vínculo Neural de Google",
      googleDesc: "Inicie sesión con su cuenta de Google de forma encriptada para sincronizar sus históricos.",
      googleBtn: "Vincular Google Neural ID",
      flutterTitle: "Cliente Flutter Activo",
      flutterDesc: "Dispositivo móvil conectado vía Dart Socket IPC compartiendo el buffer cognitivo.",
      flutterLatencyLabel: "Latencia IPC",
      githubTitle: "Respaldo en GitHub",
      githubDesc: "Suba el historial de PostgreSQL directamente a su rama de Git.",
      githubPlaceholder: "Repositorio de Respaldo GitHub",
      githubBtn: "Hacer Commit en GitHub",
      gitTerminal: "Terminal Git Remota"
    },
    fr: {
      title: "Intégrations Neurales & Synchronisations",
      sub: "Google Neural Login, application compagnon Flutter et stockage sécurisé sur GitHub.",
      googleTitle: "Lien Neural Google",
      googleDesc: "Connectez-vous avec votre compte Google de manière sécurisée pour synchroniser vos historiques de VM.",
      googleBtn: "Associer Google Neural ID",
      flutterTitle: "Client Flutter Actif",
      flutterDesc: "Appareil mobile connecté via Dart Socket IPC partageant le buffer cognitivo-mémoriel.",
      flutterLatencyLabel: "Latence IPC",
      githubTitle: "Sauvegarde sur GitHub",
      githubDesc: "Envoyez l'historique de PostgreSQL directement sur votre branche Git.",
      githubPlaceholder: "Dépôt de Sauvegarde GitHub",
      githubBtn: "Valider sur GitHub",
      gitTerminal: "Terminal Git Distant"
    },
    de: {
      title: "Neurale Integrationen & Synchrons",
      sub: "Google Neural Login, begleitende Flutter-App und sichere GitHub-Backups.",
      googleTitle: "Google Neural Link",
      googleDesc: "Melden Sie sich sicher mit Ihrem Google-Konto an, um gespeicherte VM-Parameter zu laden.",
      googleBtn: "Google Neural ID verknüpfen",
      flutterTitle: "Aktiver Flutter-Client",
      flutterDesc: "Gekoppeltes Mobilgerät über Dart Socket IPC, das den kognitiven Puffer teilt.",
      flutterLatencyLabel: "IPC-Latenz",
      githubTitle: "GitHub-Speicher-Backup",
      githubDesc: "Senden Sie PostgreSQL-Verlaufsprotokolle direkt an Ihre Git-Branch.",
      githubPlaceholder: "GitHub-Backup-Repository",
      githubBtn: "Auf GitHub committen",
      gitTerminal: "Remote Git-Terminal"
    },
    ja: {
      title: "外部インテグレーション・同期システム",
      sub: "Googleニューラルログイン、コンパニオンFlutterアプリ、GitHubバックアップ機能。",
      googleTitle: "Google ニューラル認証",
      googleDesc: "暗号化されたニューラル認証リンク経由でGoogleアカウントと連携し、永続履歴を復元します。",
      googleBtn: "Google ニューラルIDを紐付け",
      flutterTitle: "Flutter クライアント同期中",
      flutterDesc: "Dart Socket IPCを介して接続され、VM側のコグニティブメモリバッファを常時共有します。",
      flutterLatencyLabel: "同期レイテンシ",
      githubTitle: "GitHub リポジトリバックアップ",
      githubDesc: "PostgreSQLに記録されたインシデント履歴をGitブランチへコミット・転送します。",
      githubPlaceholder: "GitHubバックアップリポジトリ",
      githubBtn: "GitHubへコミット",
      gitTerminal: "リモートGitターミナル"
    }
  };

  const t = labels[language] || labels.en;

  return (
    <div id="neural-integrations" className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-lg space-y-5">
      
      {/* Title block */}
      <div className="border-b border-slate-800 pb-3">
        <h3 className="text-sm font-semibold text-slate-200 tracking-wider uppercase font-mono flex items-center gap-1.5">
          <Smartphone size={16} className="text-indigo-400" />
          {t.title}
        </h3>
        <p className="text-[11px] text-slate-400 font-mono mt-1 leading-normal">
          {t.sub}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Module 1: Google Neural Link Login */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg flex flex-col justify-between h-[230px]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
              <Chrome size={14} className="text-red-400" />
              <span>{t.googleTitle}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono leading-normal">
              {t.googleDesc}
            </p>
          </div>

          <div className="pt-2">
            {googleUser ? (
              <div className="bg-slate-900 border border-emerald-900/40 p-2.5 rounded-md flex flex-col gap-1.5 text-[10px] font-mono">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <CheckCircle size={12} />
                  <span>{t.googleLinked}</span>
                </div>
                <div className="space-y-0.5 text-slate-400">
                  <p className="text-slate-200 truncate font-semibold">{googleUser.name}</p>
                  <p className="truncate">{googleUser.email}</p>
                  <p className="text-[9px] text-indigo-400 font-bold">{googleUser.neuralFrequency}</p>
                </div>
                <button 
                  type="button"
                  onClick={handleGoogleLogout}
                  className="mt-1.5 text-left text-red-400 flex items-center gap-1 hover:text-red-300 transition-colors cursor-pointer"
                >
                  <LogOut size={10} />
                  <span>Desconectar</span>
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleGoogleLink}
                disabled={googleLoading}
                aria-label={t.googleBtn}
                className="w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 font-mono text-[11px] rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {googleLoading ? (
                  <>
                    <RefreshCw size={12} className="animate-spin text-slate-400" />
                    <span>Conectando...</span>
                  </>
                ) : (
                  <>
                    <Chrome size={12} className="text-red-400" />
                    <span>{t.googleBtn}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Module 2: Flutter Companion Client */}
        <div className="bg-slate-950 border border-slate-855 p-4 rounded-lg flex flex-col justify-between h-[230px]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
              <Smartphone size={14} className="text-sky-400 animate-pulse" />
              <span>{t.flutterTitle}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono leading-normal">
              {t.flutterDesc}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <div className="bg-slate-900 border border-slate-800 p-2.5 rounded-md text-[10px] font-mono space-y-1">
              <div className="flex justify-between items-center text-slate-400">
                <span>Versão SDK:</span>
                <span className="text-sky-400 font-bold">Flutter 3.22 (Dart 3.4)</span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>Conexão:</span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active IPC
                </span>
              </div>
              <div className="flex justify-between items-center text-slate-400">
                <span>{t.flutterLatencyLabel}:</span>
                <span className="text-slate-300 font-semibold">{flutterLatency} ms</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setFlutterSynced(!flutterSynced);
                setFlutterLatency(flutterSynced ? 0 : Math.floor(Math.random() * 8) + 8);
              }}
              aria-label={flutterSynced ? "Sincronizado" : "Sincronizar App"}
              aria-pressed={flutterSynced}
              className={`w-full py-2 border font-mono text-[11px] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                flutterSynced 
                  ? 'bg-sky-950/30 border-sky-900 text-sky-400 hover:bg-sky-950/50' 
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-850'
              }`}
            >
              <Smartphone size={12} />
              <span>{flutterSynced ? "Sincronizado" : "Sincronizar App"}</span>
            </button>
          </div>
        </div>

        {/* Module 3: GitHub Storage sync */}
        <div className="bg-slate-950 border border-slate-850 p-4 rounded-lg flex flex-col justify-between h-[230px]">
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-slate-300">
              <Github size={14} className="text-slate-400" />
              <span>{t.githubTitle}</span>
            </div>
            <p className="text-[10px] text-slate-400 font-mono leading-normal">
              {t.githubDesc}
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <input 
              id="github-repo-input"
              name="githubRepo"
              type="text" 
              value={githubRepo}
              onChange={(e) => setGithubRepo(e.target.value)}
              placeholder={t.githubPlaceholder}
              aria-label={t.githubPlaceholder}
              className="w-full bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-300 p-2 rounded focus:outline-none focus:border-indigo-600"
            />

            <button
              type="button"
              onClick={handleGithubBackup}
              disabled={gitLoading || savedCasesCount === 0}
              aria-label={t.githubBtn}
              className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-850 disabled:text-slate-500 disabled:border-slate-850 disabled:cursor-not-allowed text-white font-mono text-[11px] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
            >
              {gitLoading ? (
                <>
                  <RefreshCw size={12} className="animate-spin" />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <Github size={12} />
                  <span>{t.githubBtn}</span>
                </>
              )}
            </button>
          </div>
        </div>

      </div>

      {/* Embedded Git terminal simulation console if backup is loading or has results */}
      {(gitLoading || lastCommitSha) && (
        <div className="bg-slate-950 border border-slate-850/80 rounded-lg p-3 font-mono text-[10px] text-slate-400 space-y-1">
          <div className="flex items-center justify-between border-b border-slate-900 pb-1.5 mb-1.5">
            <div className="flex items-center gap-1 text-slate-500">
              <Terminal size={12} />
              <span className="uppercase text-[9px] tracking-widest">{t.gitTerminal}</span>
            </div>
            {lastCommitSha && (
              <span className="text-[9px] text-emerald-400 bg-emerald-950/40 border border-emerald-900/40 px-1.5 py-0.5 rounded font-bold">
                COMMIT: {lastCommitSha}
              </span>
            )}
          </div>
          <div className="max-h-[75px] overflow-y-auto space-y-0.5">
            {gitLogs.map((log, idx) => (
              <div key={idx} className="flex items-start gap-1">
                <ChevronRight size={10} className="text-indigo-400 mt-0.5 flex-shrink-0" />
                <span className={log.startsWith('git') ? 'text-slate-200' : 'text-slate-400'}>{log}</span>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
