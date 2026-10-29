import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

// Default cases inside PostgreSQL state storage
const DEFAULT_CASES = [
  {
    id: "case-1",
    problem: "Queda na performance do banco de dados na Black Friday",
    category: "Banco de Dados & I/O",
    urgency: "Crítica",
    final_solution: "Implementada réplica de leitura na VM Secundária de contingência, ativação de cache Redis para tabelas quentes e otimização do connection pool do PostgreSQL limitando leaks.",
    timestamp: new Date().toISOString()
  },
  {
    id: "case-2",
    problem: "Estouro de heap de memória (Out-Of-Memory) no cluster de recomendação",
    category: "Vazamento de Memória",
    urgency: "Alta",
    final_solution: "Corrigida referência circular de escopo na chamada de sessão do JWT. Descoberto pelo Agente Causal através do tracer de heap da JVM.",
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: "case-3",
    problem: "Instabilidade de latência nos endpoints CDN de entrega de mídia",
    category: "Rede / Performance",
    urgency: "Média",
    final_solution: "Habilitada compressão Brotli e CDN proxy reverso descentralizado no Nginx. Agente Matemático calculou ganho de 45% de throughput.",
    timestamp: new Date(Date.now() - 7200000).toISOString()
  }
];

let history = [...DEFAULT_CASES];

// System learning and operator feedback records
const DEFAULT_FEEDBACKS = [
  {
    id: "fb-1",
    caseId: "case-1",
    problem: "Queda na performance do banco de dados na Black Friday",
    rating: "positive",
    tags: ["Alta Precisão", "Otimização Eficaz"],
    note: "Réplica de leitura aliviou 72% do gargalo do pool no Proxmox.",
    category: "Banco de Dados & I/O",
    efficiency: 92,
    timestamp: new Date(Date.now() - 1800000).toISOString()
  },
  {
    id: "fb-2",
    caseId: "case-2",
    problem: "Estouro de heap de memória (Out-Of-Memory) no cluster de recomendação",
    rating: "positive",
    tags: ["Identificação Raiz", "Redução de Heap"],
    note: "Diagnóstico causal do vazamento de JWT foi impecável.",
    category: "Vazamento de Memória",
    efficiency: 96,
    timestamp: new Date(Date.now() - 5400000).toISOString()
  }
];

let feedbacks = [...DEFAULT_FEEDBACKS];

let aiClient: GoogleGenAI | null = null;
function getAiClient() {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY is missing in your environment. Please configure it in your Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    category: { type: Type.STRING, description: "Categoria do problema (ex: Performance, Segurança, Banco de Dados, Rede, etc.)" },
    urgency: { type: Type.STRING, description: "Nível de urgência: Baixa, Média, Alta ou Crítica" },
    vm_environment: { type: Type.STRING, description: "Ambiente virtualizado de destino (ex: Proxmox LXC, Ubuntu Server VM, Docker Host, etc.)" },
    tasks: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Divisão lógica do problema em exatas 3 a 5 sub-tarefas específicas executadas"
    },
    agents: {
      type: Type.OBJECT,
      properties: {
        logico: {
          type: Type.OBJECT,
          properties: {
            thought: { type: Type.STRING, description: "Análise do Agente Lógico avaliando a coerência conceitual e eliminando hipóteses contraditórias" }
          },
          required: ["thought"]
        },
        matematico: {
          type: Type.OBJECT,
          properties: {
            thought: { type: Type.STRING, description: "Análise do Agente Matemático oferecendo modelos formais de latência, consumo, memória ou benchmarks" }
          },
          required: ["thought"]
        },
        causal: {
          type: Type.OBJECT,
          properties: {
            thought: { type: Type.STRING, description: "Análise do Agente Causal investigando a raiz do problema e relacionando causas colaterais" }
          },
          required: ["thought"]
        },
        estrategico: {
          type: Type.OBJECT,
          properties: {
            thought: { type: Type.STRING, description: "Análise do Agente Estratégico propondo o plano tático mais rápido e escalável para solução" }
          },
          required: ["thought"]
        },
        memoria: {
          type: Type.OBJECT,
          properties: {
            thought: { type: Type.STRING, description: "Análise do Agente Memória buscando similaridades no Qdrant contra falhas conhecidas antigas" }
          },
          required: ["thought"]
        },
        social: {
          type: Type.OBJECT,
          properties: {
            thought: { type: Type.STRING, description: "Análise do Agente Social avaliando o impacto da instabilidade nos times de engenharia e usuários finais" }
          },
          required: ["thought"]
        }
      },
      required: ["logico", "matematico", "causal", "estrategico", "memoria", "social"]
    },
    consensus: { type: Type.STRING, description: "Consenso formal acordado após a redistribuição de mensagens entre os agentes" },
    final_solution: { type: Type.STRING, description: "Solução prática de remediamento contínuo e preventivo a ser escrita no banco Postgres" },
    metrics: {
      type: Type.OBJECT,
      properties: {
        efficiency_gain: { type: Type.NUMBER, description: "Ganho estimado de eficiência percentual (de 50 a 100)" },
        success_rate: { type: Type.NUMBER, description: "Taxa de sucesso geral estimada para esta resposta (de 60 a 100)" },
        redundancy_reduction: { type: Type.NUMBER, description: "Redução percentual obtida na redundância operacional (de 40 a 95)" }
      },
      required: ["efficiency_gain", "success_rate", "redundancy_reduction"]
    }
  },
  required: ["category", "urgency", "vm_environment", "tasks", "agents", "consensus", "final_solution", "metrics"]
};

async function start() {
  const app = express();
  const portArgIndex = process.argv.indexOf("--port");
  const portArg = portArgIndex !== -1 && process.argv[portArgIndex + 1] ? Number(process.argv[portArgIndex + 1]) : null;
  const PORT = Number(process.env.PORT) || portArg || 3000;

  const hostArgIndex = process.argv.indexOf("--host");
  const hostArg = hostArgIndex !== -1 && process.argv[hostArgIndex + 1] ? process.argv[hostArgIndex + 1] : null;
  const HOST = process.env.HOST || hostArg || "0.0.0.0";

  app.use(express.json());

  // API Route: fetch case history
  app.get("/api/history", (req, res) => {
    res.json(history);
  });

  // API Route: solve a problem using the cognitive agents framework with Gemini API
  app.post("/api/solve", async (req, res): Promise<any> => {
    try {
      const { problem, lang = "pt" } = req.body;
      if (!problem || typeof problem !== "string" || problem.trim().length === 0) {
        return res.status(400).json({ error: "O campo 'problem' é obrigatório e precisa ser texto." });
      }

      // Quick offline/fallback generator if GEMINI_API_KEY is missing
      if (!process.env.GEMINI_API_KEY) {
        console.warn("GEMINI_API_KEY non-existent. Mocking simulation response dynamically.");
        
        // Define fallback messages per language
        const fallbackMessages: Record<string, any> = {
          pt: {
            category: "Sistema Geral / Configuração",
            urgency: "Média",
            vm_environment: "Ubuntu Server 22.04 LTS",
            tasks: [
              "Analisar o log de eventos do Kernel na VM",
              "Verificar as cotas de memória RAM de todos os microsserviços",
              "Testar redundância paralela usando o fluxo de consenso"
            ],
            logical: `[Simulação Offline] Coerência lógica validada com sucesso. Não foram detectadas premissas contraditórias na descrição da falha de "${problem}".`,
            math: `[Simulação Offline] Análise quantitativa: Estimativa de carga residual peak de 1.45x acima do limiar padrão. Sugerida aplicação da fórmula de Little.`,
            causal: `[Simulação Offline] Identificou que o problema de "${problem}" está atrelado ao atraso na propagação das mensagens do Barramento Broker.`,
            strategic: `[Simulação Offline] Recomenda escalar horizontalmente o número de instâncias de agentes para processamento de filas e contingência.`,
            memory: `[Simulação Offline] Pesquisa vetorial Qdrant retornou 85% de vizinhança na similaridade do vetor de estados com falhas de I/O em banco.`,
            social: `[Simulação Offline] Mitigar insatisfação interna do squad de infra. Planejar janela programada para deploy da correção.`,
            consensus: `Consenso estabelecido entre todos os agentes especialistas para mitigação do problema de "${problem}".`,
            solution: `[Offline Sandbox] Implementado filtro protetivo contra rajadas de rede e otimização dos descritores de arquivos na máquina de hospedagem.`
          },
          en: {
            category: "General System / Configuration",
            urgency: "Medium",
            vm_environment: "Ubuntu Server 22.04 LTS",
            tasks: [
              "Analyze Kernel event log on the target Virtual Machine",
              "Verify RAM memory quotas of all active microservices",
              "Test parallel redundancy utilizing the consensus engine"
            ],
            logical: `[Offline Simulation] Logical coherence successfully validated. No contradictory premises detected for "${problem}".`,
            math: `[Offline Simulation] Quantitative analysis: Peak residual load estimated at 1.45x above default. Little's law suggested.`,
            causal: `[Offline Simulation] Identified that the issue of "${problem}" is linked to message delay on the message bus broker.`,
            strategic: `[Offline Simulation] Recommends scaling out horizontal consumer worker counts for queues and buffer protection.`,
            memory: `[Offline Simulation] Qdrant similarity vector search returned 85% proximity weight to previous PostgreSQL database failure cases.`,
            social: `[Offline Simulation] Mitigate stress within the developer squad. Schedule targeted maintenance window for rapid fix hotpatch.`,
            consensus: `Unified consensus established among all cognitive specialist agents to mitigate "${problem}".`,
            solution: `[Offline Sandbox] Implemented protection filters against packet bursts and configured file descriptors on the host machine.`
          }
        };

        const f = fallbackMessages[lang] || fallbackMessages.en;

        const mockResult = {
          problem,
          category: f.category,
          urgency: f.urgency,
          vm_environment: f.vm_environment,
          tasks: f.tasks,
          agents: {
            logico: { thought: f.logical },
            matematico: { thought: f.math },
            causal: { thought: f.causal },
            estrategico: { thought: f.strategic },
            memoria: { thought: f.memory },
            social: { thought: f.social }
          },
          consensus: f.consensus,
          final_solution: f.solution,
          metrics: {
            efficiency_gain: 85,
            success_rate: 90,
            redundancy_reduction: 75
          },
          timestamp: new Date().toISOString()
        };

        // Append to local history list
        const newCase = {
          id: `case-${Date.now()}`,
          problem: mockResult.problem,
          category: mockResult.category,
          urgency: mockResult.urgency,
          final_solution: mockResult.final_solution,
          timestamp: mockResult.timestamp
        };
        history.unshift(newCase);

        return res.json(mockResult);
      }

      const ai = getAiClient();
      
      // Dynamic language targeting based on language code selected on frontend
      const targetLanguages: Record<string, string> = {
        pt: "português (pt-BR)",
        en: "inglês (en-US)",
        es: "espanhol (es-ES)",
        fr: "francês (fr-FR)",
        de: "alemão (de-DE)",
        ja: "japonês (ja-JP)"
      };
      const langName = targetLanguages[lang] || "português (pt-BR)";

      const prompt = `Você é o NÚCLEO CENTRAL do 'Sistema Inteligente Modular Adaptativo'.
Receba a descrição do seguinte problema enfrentado no ecossistema:
"${problem}"

Seu dever é coordenar os 6 agentes especializados descritos abaixo:
1. Agente Lógico: valida a coerência racional e premissas sem contradições da falha.
2. Agente Matemático: formula estimativas, coeficientes, limites de processos ou benchmarks práticos.
3. Agente Causal: foca em achar a raiz física e correlacionar causas ocultas de falha.
4. Agente Estratégico: mapeia os caminhos alternativos e sugere o melhor trade-off.
5. Agente Memória: compara com erros passados usando bancos PostgreSQL e depósitos Qdrant.
6. Agente Social: aborda os impactos humanos (pressão na equipe, percepção do cliente).

Crie uma resposta técnica de altíssima qualidade contendo a análise única de cada um deles no idioma: ${langName}.
Formule uma solução contínua de remediamento e os respectivos ganhos. Responda estritamente seguindo o esquema JSON requisitado.`;

      const aiResponse = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema,
          temperature: 0.15,
        }
      });

      const responseText = aiResponse.text?.trim() || "{}";
      const resultObj = JSON.parse(responseText);

      // Populate problem and timestamp to result
      const fullResult = {
        problem,
        ...resultObj,
        timestamp: new Date().toISOString()
      };

      // Append to PostgreSQL-like simulated state table
      const newCase = {
        id: `case-${Date.now()}`,
        problem: fullResult.problem,
        category: fullResult.category,
        urgency: fullResult.urgency,
        final_solution: fullResult.final_solution,
        timestamp: fullResult.timestamp
      };
      history.unshift(newCase);

      res.json(fullResult);
    } catch (e: any) {
      console.error("Erro na rota de solução:", e);
      res.status(500).json({ error: e?.message || "Erro desconhecido ao simular no Núcleo de IA." });
    }
  });

  // API Route: fetch feedback history
  app.get("/api/feedback", (req, res) => {
    res.json(feedbacks);
  });

  // API Route: register operator evaluation feedback into learning log
  app.post("/api/feedback", (req, res): any => {
    try {
      const { caseId, problem, rating, tags = [], note = "", category = "Geral", efficiency = 85 } = req.body;
      
      if (!rating || (rating !== "positive" && rating !== "negative")) {
        return res.status(400).json({ error: "Campo 'rating' deve ser 'positive' ou 'negative'." });
      }

      const newFeedback = {
        id: `fb-${Date.now()}`,
        caseId: caseId || `case-gen-${Date.now()}`,
        problem: problem || "Instabilidade não especificada",
        rating,
        tags: Array.isArray(tags) ? tags : [],
        note: typeof note === 'string' ? note.slice(0, 280) : "",
        category: category || "Infraestrutura Geral",
        efficiency: Number(efficiency) || 85,
        timestamp: new Date().toISOString()
      };

      feedbacks.unshift(newFeedback);
      if (feedbacks.length > 50) feedbacks.pop();

      console.log(`[SIMA-LEARNING] Nova avaliação registrada: ${rating.toUpperCase()} para caso ${newFeedback.caseId}`);
      res.json({ success: true, feedback: newFeedback, totalFeedbacks: feedbacks.length });
    } catch (err: any) {
      console.error("Erro ao registrar feedback:", err);
      res.status(500).json({ error: "Falha ao registrar feedback no log de aprendizado." });
    }
  });

  // API Route: Reset case history
  app.post("/api/clear", (req, res) => {
    history = [...DEFAULT_CASES];
    feedbacks = [...DEFAULT_FEEDBACKS];
    res.json({ success: true, history, feedbacks });
  });

  // Serve static UI assets or delegate to Vite in Development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR === 'true' ? false : undefined,
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[Simulador] Servidor rodando com sucesso no endereço http://${HOST}:${PORT}`);
  });
}

start().catch(err => {
  console.error("Falta de ignição no servidor:", err);
});
