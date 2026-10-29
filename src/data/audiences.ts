export interface AudiencePersona {
  id: string;
  name: string;
  role: string;
  category: 'technical' | 'executive' | 'compliance' | 'customer' | 'academic';
  description: string;
  primaryConcern: string;
  languageTone: string;
  keyMetrics: { label: string; unit: string; idealRange: string }[];
  presets: {
    title: string;
    incident: string;
    category: string;
    urgency: 'Crítica' | 'Alta' | 'Média';
    audiencePerspective: string;
    sampleOutput: {
      summary: string;
      priorities: string[];
      actionableArtifact: string;
      actionableType: 'runbook' | 'briefing' | 'compliance' | 'bulletin' | 'proof';
      kpiImpact: Record<string, string | number>;
    };
  }[];
  validationCriteria: {
    name: string;
    weight: number;
    description: string;
  }[];
}

export const AUDIENCE_PERSONAS: AudiencePersona[] = [
  {
    id: 'sre-devops',
    name: 'Engenharia & SRE / DevOps',
    role: 'Site Reliability Engineer & Arquiteto de Nuvem',
    category: 'technical',
    description: 'Foco estrito em estabilidade operacional, contenção de falhas, métricas de baixo nível (I/O, CPU, sockets, JVM heap) e runbooks executáveis.',
    primaryConcern: 'MTTR mínimo, isolamento de contenção e automação de remediação sem indisponibilidade em cascata.',
    languageTone: 'Técnico preciso, terminal CLI, flags de configuração e modelos matemáticos de filas.',
    keyMetrics: [
      { label: 'MTTR Estimado', unit: 'min', idealRange: '< 15 min' },
      { label: 'Redução de Contenção de I/O', unit: '%', idealRange: '> 70%' },
      { label: 'Sobrecarga de CPU no Patch', unit: '%', idealRange: '< 5%' }
    ],
    presets: [
      {
        title: 'Estouro de Heap no Cluster de Cache Redis',
        incident: 'Vazamento contínuo de memória RAM no Redis 7.2 gerando desalocação de chaves sem expiração e degradação de p99 para 850ms.',
        category: 'Vazamento de Memória',
        urgency: 'Crítica',
        audiencePerspective: 'O SRE necessita de comandos exatos para purgar chaves órfãs, isolar cgroups no Linux e reconfigurar a política maxmemory-policy sem reiniciar o nó mestre.',
        sampleOutput: {
          summary: 'Detecção de 14.800 chaves de sessão com TTL infinito geradas por falha no middleware de logout. Mitigação requer rotação de memória volátil e ajuste de eviction policy.',
          priorities: [
            'Aplicar política maxmemory-policy allkeys-lru imediatamente',
            'Executar script de varredura assíncrona com SCAN e UNLINK (evitar DEL bloqueante)',
            'Isolar container com limite cgroup de 4GB para evitar OOM killer no host Proxmox'
          ],
          actionableArtifact: `# Runbook de Remediação SRE / Terminal Bash
redis-cli -h 127.0.0.1 -p 6379 CONFIG SET maxmemory-policy allkeys-lru
redis-cli -h 127.0.0.1 -p 6379 CONFIG SET maxmemory 3800mb
redis-cli --eval /opt/sima/scripts/purge_session_leaks.lua , session:* 1000
echo "[OK] Eviction LRU ativa. p99 normalizado para 4.2ms."`,
          actionableType: 'runbook',
          kpiImpact: { 'MTTR (min)': '8.5', 'Throughput Preservado': '99.4%', 'OOM Prevenido': '100%' }
        }
      },
      {
        title: 'Saturação de Descritores de Arquivo (FD Limit) no Nginx Ingress',
        incident: 'Rajada de conexões HTTP/2 síncronas esgotando worker_rlimit_nofile no gateway de entrada e descartando pacotes SYN.',
        category: 'Rede / Performance',
        urgency: 'Crítica',
        audiencePerspective: 'O time de redes precisa recalcular o buffer de sockets TCP, ajustar o ulimit no kernel e configurar keepalive connection pool.',
        sampleOutput: {
          summary: 'Esgotamento dos 65.536 descritores disponíveis por conexão TCP pendente em estado TIME_WAIT. Requer ativação de tcp_tw_reuse no sysctl.',
          priorities: [
            'Ajustar worker_rlimit_nofile para 131.072 no nginx.conf',
            'Habilitar net.ipv4.tcp_tw_reuse = 1 no /etc/sysctl.d/99-network.conf',
            'Aumentar pool de upstream keepalive de 32 para 256 conexões'
          ],
          actionableArtifact: `# Sysctl Kernel Patch
sysctl -w net.ipv4.tcp_tw_reuse=1
sysctl -w net.core.somaxconn=4096
nginx -t && nginx -s reload
ss -s | grep -i tcp`,
          actionableType: 'runbook',
          kpiImpact: { 'MTTR (min)': '4.2', 'Conexões Salvas/s': '12.400', 'SYN Drops': '0' }
        }
      }
    ],
    validationCriteria: [
      { name: 'Reprodutibilidade do Runbook', weight: 35, description: 'Comandos CLI válidos e idempotentes' },
      { name: 'Precisão da Causa Raiz', weight: 35, description: 'Identificação exata do subsistema comprometido' },
      { name: 'Métricas de Performance', weight: 30, description: 'Ausência de overhead adicional de CPU/RAM' }
    ]
  },
  {
    id: 'executive-c-level',
    name: 'Gestão Executiva & Incident Commanders',
    role: 'CTO, VP de Engenharia & Diretor de Operações',
    category: 'executive',
    description: 'Visão macroestratégica, impacto financeiro por minuto de downtime, risco de SLA contratual, plano de ação e comunicação com investidores.',
    primaryConcern: 'Proteger faturamento, preservar reputação da marca e garantir cumprimento das metas de disponibilidade acordadas (99.95%+).',
    languageTone: 'Executivo conciso, orientado a decisões de negócio, riscos de receita e alocação de recursos.',
    keyMetrics: [
      { label: 'Exposição Financeira Evitada', unit: 'R$', idealRange: 'R$ 50k - 500k' },
      { label: 'Risco de Churn de Clientes', unit: '%', idealRange: '< 1%' },
      { label: 'Consumo do Budget de SLA', unit: '%', idealRange: '< 5%' }
    ],
    presets: [
      {
        title: 'Queda na Finalização de Checkout na Black Friday',
        incident: 'Indisponibilidade parcial no microserviço de autorização bancária gerando abandono de carrinho de 42% no pico de vendas.',
        category: 'Financeiro / Negócios',
        urgency: 'Crítica',
        audiencePerspective: 'O C-Level requer relatório imediato de impacto em receita (R$/minuto), acionamento de gateway secundário de contingência e alinhamento com diretoria comercial.',
        sampleOutput: {
          summary: 'Gargalo no provedor bancário principal causou lentidão de 14 minutos. O S.I.M.A. orquestrou chaveamento automático para gateway secundário via fallback inteligente.',
          priorities: [
            'Autorizar rota alternativa de pagamentos no gateway redundante Adyen/Stripe',
            'Manter comitê de crise executivo a cada 30 minutos até estabilização do volume',
            'Disparar e-mail de recuperação de carrinho com cupom de compensação de 5%'
          ],
          actionableArtifact: `RELATÓRIO EXECUTIVO DE INCIDENTE (C-LEVEL BRIEFING)
Data/Hora: ${new Date().toLocaleDateString()}
Severidade: P1 (Crítica) — Duração da Degradação: 14 min
Impacto Estimado de Receita Salva: R$ 340.000,00
Ação Imediata: Redirecionamento de tráfego para adquirente redundante concluído com sucesso.
Próximos Passos: Notificação formal aos clientes Platinum e auditoria de contrato SLA com adquirente padrão.`,
          actionableType: 'briefing',
          kpiImpact: { 'Receita Preservada': 'R$ 340k', 'SLA Preservado': '99.98%', 'Tempo de Resposta C-Level': '3 min' }
        }
      },
      {
        title: 'Indisponibilidade do Portal B2B de Faturamento Corporativo',
        incident: 'Travamento de rotina de conciliação de final de mês impedindo emissão de 3.200 faturas de clientes corporativos.',
        category: 'Operações B2B',
        urgency: 'Alta',
        audiencePerspective: 'Foco na proteção de fluxo de caixa da empresa, prevenção de multas por atraso e transparência com clientes estratégicos.',
        sampleOutput: {
          summary: 'Deadlock no cálculo de impostos de notas em lote. Solução desbloqueou processamento particionado em 4 instâncias paralelas.',
          priorities: [
            'Executar conciliação em lote particionada fora do horário de expediente comercial',
            'Enviar aviso prévio e cordial aos diretores financeiros das contas corporativas',
            'Garantir que nenhum cliente sofra interrupção de serviço por atraso na fatura'
          ],
          actionableArtifact: `SUMÁRIO PARA O CONSELHO DIRETOR
- Ocorrência: Represamento de emissão fiscal decorrente de concorrência em lock distribuído.
- Decisão: Particionamento paralelo de workers com isolamento de transações.
- Risco Residual de Caixa: 0% (todas as faturas emitidas dentro da janela legal).
- Responsável: Gestão Unificada de Incidentes S.I.M.A.`,
          actionableType: 'briefing',
          kpiImpact: { 'Faturamento Garantido': 'R$ 1.8M', 'Risco Jurídico': 'Baixo', 'Satisfação B2B': '98%' }
        }
      }
    ],
    validationCriteria: [
      { name: 'Clareza de Impacto Financeiro', weight: 40, description: 'Estimativas claras de perda vs economia' },
      { name: 'Acionabilidade Estratégica', weight: 35, description: 'Decisões claras para executivos sem ruído técnico' },
      { name: 'Preservação de SLAs', weight: 25, description: 'Mitigação de multas e quebras contratuais' }
    ]
  },
  {
    id: 'secops-compliance',
    name: 'Segurança, Auditoria & Compliance (SecOps / LGPD)',
    role: 'CISO, DPO (Data Protection Officer) & Auditor de Segurança',
    category: 'compliance',
    description: 'Análise de raio de explosão (blast radius), conformidade com LGPD/GDPR/ISO 27001, rastreabilidade de integridade criptográfica e auditoria forense.',
    primaryConcern: 'Evitar vazamento de dados confidenciais, garantir integridade dos logs com hash e assegurar conformidade legal.',
    languageTone: 'Formal, estrito, foco em vetores de ataque, matriz CVE, custódia e regulamentações.',
    keyMetrics: [
      { label: 'Raio de Explosão de Dados', unit: 'registros', idealRange: '0 vazamentos' },
      { label: 'Conformidade Regulatória LGPD', unit: '%', idealRange: '100%' },
      { label: 'Score CVSS Mitigado', unit: 'pts', idealRange: 'Redução de 9.0 para < 2.0' }
    ],
    presets: [
      {
        title: 'Tentativa de Injeção SQL e Extração de Tokens JWT',
        incident: 'Tráfego malicioso originado de botnet tentando explorar endpoint desprotegido de reset de credenciais com queries concatenadas.',
        category: 'Segurança & Ameaças',
        urgency: 'Crítica',
        audiencePerspective: 'O auditor necessita do hash imutável da evidência, bloqueio WAF em camada 7 e relatório de não vazamento para o comitê LGPD.',
        sampleOutput: {
          summary: 'Tentativa de extração bloqueada pelo filtro de sanitização. Nenhuma credencial foi exposta. 412 IPs da botnet colocados em quarentena no WAF.',
          priorities: [
            'Adicionar regras de bloqueio de assinaturas SQLi no Cloudflare / WAF',
            'Revogar e rotacionar todos os secrets de assinatura de JWT emitidos nas últimas 2 horas',
            'Gerar relatório forense assinado com hash SHA-256 para arquivamento regulatório'
          ],
          actionableArtifact: `ATESTADO DE AUDITORIA FORENSE E COMPLIANCE
Identificador do Evento: SEC-LGPD-2026-9812
Vetor de Ameaça: OWASP A03:2021-Injection (SQLi Attempt)
Registros Acessados: 0 (Zero dados pessoais comprometidos)
Hash de Integridade do Log (SHA-256):
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
Conformidade LGPD Art. 48: Não há necessidade de comunicação à ANPD por ausência de risco real.`,
          actionableType: 'compliance',
          kpiImpact: { 'Dados Comprometidos': '0', 'IPs Bloqueados': '412', 'Conformidade LGPD': '100%' }
        }
      },
      {
        title: 'Exposição de Credencial Interna em Repositório de CI/CD',
        incident: 'Commit em pipeline automatizado incluiu chave de acesso de leitura a bucket S3 corporativo.',
        category: 'Gestão de Identidades',
        urgency: 'Alta',
        audiencePerspective: 'Exige revogação relâmpago de permissões IAM, varredura de acessos no CloudTrail e relatório de conformidade ISO 27001.',
        sampleOutput: {
          summary: 'Chave revogada em 1m20s. Registros do CloudTrail confirmam ausência de download de arquivos no período de exposição.',
          priorities: [
            'Revogar token exposto imediatamente na AWS IAM Console',
            'Ativar escaneamento obrigatório de secrets pré-commit com git-secrets',
            'Registrar conformidade no sistema de controle de mudanças ISO 27001'
          ],
          actionableArtifact: `COMPLIANCE ATTESTATION - ISO 27001 / SOC 2
Ação de Mitigação: Revogação e invalidação síncrona da credencial AWS_ACCESS_KEY_ID=AKIA***.
Análise de Logs: CloudTrail EventID=77a892b1 - 0 objetos lidos.
Status: Resolvido sem não-conformidade grave.`,
          actionableType: 'compliance',
          kpiImpact: { 'Tempo de Revogação': '80 seg', 'Arquivos Afetados': '0', 'Audit Compliance': '100%' }
        }
      }
    ],
    validationCriteria: [
      { name: 'Cadeia de Custódia & Hash', weight: 40, description: 'Integridade criptográfica de dados e logs' },
      { name: 'Avaliação de Impacto Regulatório', weight: 35, description: 'Conformidade com LGPD/GDPR' },
      { name: 'Contenção do Raio de Ameaça', weight: 25, description: 'Isolamento de credenciais e acessos' }
    ]
  },
  {
    id: 'customer-support-cs',
    name: 'Suporte Técnico N3 & Customer Success',
    role: 'Líder de Atendimento ao Cliente, CS Manager & Helpdesk N3',
    category: 'customer',
    description: 'Orientação empática, redução de volume de tickets de reclamação, comunicados claros para Status Page pública e scripts para gerentes de conta.',
    primaryConcern: 'Acalmar clientes impactados, evitar cancelamentos, fornecer previsões honestas e equipar o time de suporte com respostas prontas.',
    languageTone: 'Empático, transparente, didático, desprovido de jargões técnicos herméticos.',
    keyMetrics: [
      { label: 'Queda Prevista no Volume de Tickets', unit: '%', idealRange: '> 60%' },
      { label: 'Índice de Sentimento dos Clientes (CSAT)', unit: 'pts', idealRange: '> 4.5 / 5.0' },
      { label: 'Retenção de Contas VIP Afetadas', unit: '%', idealRange: '100%' }
    ],
    presets: [
      {
        title: 'Instabilidade Intermitente no Aplicativo Móvel',
        incident: 'Usuários enfrentando tela branca e lentidão de sincronização após deploy da versão 3.4 do aplicativo iOS/Android.',
        category: 'Experiência do Usuário',
        urgency: 'Alta',
        audiencePerspective: 'O suporte necessita de um texto transparente para redes sociais e status page, além de um script de suporte de 1 minuto para acalmar chamados.',
        sampleOutput: {
          summary: 'Problema localizado no cache de sessão mobile. Rollback do bundle realizado. Disponibilizado script amigável para envio aos clientes.',
          priorities: [
            'Publicar atualização de status na página de saúde do sistema',
            'Distribuir mensagem padrão no chat de suporte para desarmar frustração',
            'Instruir usuários a realizar logoff/login simples para forçar atualização do cache'
          ],
          actionableArtifact: `BOLETIM PÚBLICO PARA STATUS PAGE & SUPORTE:
Título: Instabilidade temporária no aplicativo móvel já solucionada
Olá! Identificamos que alguns usuários tiveram dificuldades para acessar suas contas nesta manhã.
Nossa equipe técnica já atuou e o serviço foi 100% restabelecido.
💡 Dica rápida: Caso ainda veja tela de espera, basta fechar e reabrir o app para continuar aproveitando normalmente.
Agradecemos imensamente pela sua paciência e parceria!`,
          actionableType: 'bulletin',
          kpiImpact: { 'Tempo de Publicação': '2 min', 'Tickets Evitados': '1.850', 'Satisfação CSAT': '4.8/5' }
        }
      },
      {
        title: 'Atraso na Geração de Relatórios Mensais para Contas Enterprise',
        incident: 'Fila de renderização de PDF congestionada por demanda concentrada no primeiro dia útil do mês.',
        category: 'Atendimento B2B',
        urgency: 'Média',
        audiencePerspective: 'Os gerentes de contas VIP necessitam de mensagem personalizada para antecipar-se à reclamação dos diretores clientes.',
        sampleOutput: {
          summary: 'Capacidade de renderização triplicada. Relatórios pendentes sendo entregues diretamente nos e-mails corporativos.',
          priorities: [
            'Enviar aviso proativo aos clientes do plano Enterprise com prazo estimado',
            'Oferecer extensão de cota de relatórios como cortesia de relacionamento',
            'Priorizar na fila os clientes que possuem faturamento mais urgente'
          ],
          actionableArtifact: `MENSAGEM DE RELACIONAMENTO PROATIVO (GERENTES DE CONTA VIP)
Prezado(a) [Nome do Cliente],
Gostaria de informar que estamos finalizando uma otimização no sistema de geração de relatórios para acelerar suas consultas de fechamento.
Seu relatório já está sendo processado com prioridade máxima e estará disponível em seu e-mail em até 20 minutos.
Como cortesia pelo inconveniente, liberamos 2 meses de consultas avançadas adicionais para sua equipe.
Qualquer dúvida, conte diretamente comigo!`,
          actionableType: 'bulletin',
          kpiImpact: { 'Contas VIP Salvas': '100%', 'NPS do Suporte': '+18 pts', 'Satisfação': 'Alta' }
        }
      }
    ],
    validationCriteria: [
      { name: 'Empatia e Tom de Voz', weight: 40, description: 'Comunicação acolhedora e sem tecnicismos confusos' },
      { name: 'Redução de Atrito / Tickets', weight: 35, description: 'Instruções diretas que evitam reaberturas de chamados' },
      { name: 'Agilidade de Publicação', weight: 25, description: 'Velocidade no envio de status transparente' }
    ]
  },
  {
    id: 'cognitive-lab',
    name: 'Pesquisa Acadêmica & Laboratório de IA Cognitiva',
    role: 'Pesquisador em Sistemas Multiagente & Cientista de Dados',
    category: 'academic',
    description: 'Análise formal da dialética emergente dos 6 agentes, entropia da distribuição de crenças, modelos formais de filas (Little) e consistência epistêmica.',
    primaryConcern: 'Validar rigor lógico formal, ausência de alucinações heurísticas e propriedades de convergência assintótica do consenso.',
    languageTone: 'Acadêmico rigoroso, equações formais, teoremas de grafos e métricas de entropia informacional.',
    keyMetrics: [
      { label: 'Entropia de Consenso (H)', unit: 'nats', idealRange: '< 0.35 nats' },
      { label: 'Rodadas Dialéticas de Convergência', unit: 'ciclos', idealRange: '1 a 3 rodadas' },
      { label: 'Grau de Coerência Epistêmica', unit: '%', idealRange: '> 95%' }
    ],
    presets: [
      {
        title: 'Conflito de Heurísticas entre Agente Causal e Estratégico',
        incident: 'Divergência entre diagnóstico determinístico de saturação de threads vs sugestão estocástica de roteamento adaptativo com penalidade.',
        category: 'Teoria da Decisão Multiagente',
        urgency: 'Alta',
        audiencePerspective: 'O cientista necessita analisar o grafo de mensagens no barramento, a matriz de transição de crenças bayesianas e a demonstração de estabilidade de Lyapunov.',
        sampleOutput: {
          summary: 'A convergência foi alcançada através de uma função de utilidade conjunta ponderada. O Agente Matemático atuou como mediador formal com a Lei de Little (L = λW).',
          priorities: [
            'Calcular a divergência de Kullback-Leibler entre as distribuições a priori e a posteriori',
            'Comprovar a consistência formal do modelo com lógica de primeira ordem',
            'Submeter vetor de estados resultante para indexação estocástica no Qdrant'
          ],
          actionableArtifact: `PROVA DE CONVERGÊNCIA COGNITIVA & FORMULAÇÃO MATEMÁTICA
Teorema 1 (Consenso sob Contenção de Recursos):
Seja L(t) o backlog na fila e λ(t) a taxa média de requisições de entrada.
Pela Lei de Little: E[L] = λ · E[W].
A minimização da entropia epistêmica H(A) é dada por:
H(A) = - ∑ P(a_i) · ln(P(a_i)) = 0.21 nats (Consenso Forte).
Conclusão Dialética: O Agente Causal restringe o espaço de busca, permitindo que o Agente Estratégico selecione o ótimo de Pareto em tempo polinomial O(n log n).`,
          actionableType: 'proof',
          kpiImpact: { 'Entropia Residual': '0.21 nats', 'Convergência': '1.8 rodadas', 'Consistência Lógica': '99.8%' }
        }
      },
      {
        title: 'Resiliência a Heurísticas Ruidosas sob Observabilidade Parcial',
        incident: 'Simulação de falha estocástica induzida com 30% de perda de telemetria nos nós periféricos.',
        category: 'Robustez de Aprendizado',
        urgency: 'Média',
        audiencePerspective: 'Avaliação de filtros bayesianos e capacidade do Agente Memória de recuperar casos similares no Qdrant com ruído gaussiano.',
        sampleOutput: {
          summary: 'Mesmo com perda de 30% dos sinais vitais, a correlação de cosseno no banco vetorial identificou o cluster anômalo com 91.4% de fidelidade.',
          priorities: [
            'Aplicar interpolação estocástica com cadeias de Markov de tempo contínuo',
            'Validar distância euclidiana contra base histórica de falhas catalogadas',
            'Documentar robustez do arcabouço para publicação em periódico especializado'
          ],
          actionableArtifact: `AVALIAÇÃO DE ROBUSTEZ ESTOCÁSTICA
Similaridade Cosseno no Embedding Space: 0.9142 (Margem de confiança: 98%)
Invariante de Bellman satisfeita para todas as transições de estado.
Filtro de Kalman estendido eliminou ruído residual sem divergência de gradiente.`,
          actionableType: 'proof',
          kpiImpact: { 'Fidelidade sob Ruído': '91.4%', 'Erro Quadrático Médio': '0.024', 'Rigor Formal': 'Comprovado' }
        }
      }
    ],
    validationCriteria: [
      { name: 'Rigor Matemático & Formal', weight: 40, description: 'Equações coerentes e teoremas aplicáveis' },
      { name: 'Convergência Dialética', weight: 35, description: 'Resolução demonstrada de conflitos entre agentes' },
      { name: 'Precisão Epistêmica', weight: 25, description: 'Sem alucinações e com rastreabilidade formal' }
    ]
  }
];

export interface BenchmarkTestCase {
  id: string;
  name: string;
  category: string;
  testedAudience: string;
  description: string;
  complexity: 'Standard' | 'Elevada' | 'Crítica';
  expectedArtifact: string;
}

export const BENCHMARK_TEST_SUITE: BenchmarkTestCase[] = [
  {
    id: 'TC-01',
    name: 'Validação de Runbook Executável SRE',
    category: 'Infraestrutura',
    testedAudience: 'Engenharia & SRE',
    description: 'Verifica se comandos de terminal gerados são sintaticamente válidos e livres de comandos destrutivos (ex: rm -rf /).',
    complexity: 'Standard',
    expectedArtifact: 'Script Bash / CLI com flags seguras'
  },
  {
    id: 'TC-02',
    name: 'Cálculo de Impacto Financeiro C-Level',
    category: 'Negócios',
    testedAudience: 'Gestão Executiva',
    description: 'Valida estimativa de perda de receita por minuto e geração de briefing executivo pronto para envio ao conselho.',
    complexity: 'Elevada',
    expectedArtifact: 'Briefing executivo com R$ e SLA'
  },
  {
    id: 'TC-03',
    name: 'Auditoria de Hash e LGPD SecOps',
    category: 'Segurança',
    testedAudience: 'Auditoria & Compliance',
    description: 'Garante cálculo de hash SHA-256 da cadeia de custódia e avaliação do artigo 48 da LGPD.',
    complexity: 'Crítica',
    expectedArtifact: 'Atestado forense criptográfico'
  },
  {
    id: 'TC-04',
    name: 'Comunicação Empática para Status Page',
    category: 'Atendimento',
    testedAudience: 'Suporte N3 & CS',
    description: 'Avalia ausência de jargão hermético e clareza das instruções para desarmar tickets de suporte.',
    complexity: 'Standard',
    expectedArtifact: 'Boletim público e script para gerentes'
  },
  {
    id: 'TC-05',
    name: 'Consistência Dialética e Lei de Little',
    category: 'Cognitivo',
    testedAudience: 'Pesquisa Acadêmica',
    description: 'Demonstra convergência dos 6 agentes e cálculo de limites teóricos de contenção de filas.',
    complexity: 'Elevada',
    expectedArtifact: 'Formulação matemática e prova formal'
  }
];
