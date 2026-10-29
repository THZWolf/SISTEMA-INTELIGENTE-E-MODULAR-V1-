export interface LexiconEntry {
  keyword: string; // The primary token match (lowercased)
  label: string; // User-facing key term name
  category: "Database" | "Memory" | "Network" | "OS/Virtualization" | "Security" | "Broker";
  scoreWeight: number; // Cognitive score weight (1-10)
  description: Record<string, string>; // Translated description of the keyword meaning
  injectTags: string[]; // Enriched contextual tags to feed the model
}

export const INFRASTRUCTURE_LEXICON: LexiconEntry[] = [
  {
    keyword: "postgresql",
    label: "PostgreSQL Database Engine",
    category: "Database",
    scoreWeight: 9,
    description: {
      pt: "Banco de dados relacional acid-compliant. Monitorado via pg_stat_activity.",
      en: "Acid-compliant relational database. Monitored via pg_stat_activity.",
      es: "Base de datos relacional compatible con ACID. Monitoreada vía pg_stat_activity.",
      fr: "Base de données relationnelle conforme ACID. Surveillée via pg_stat_activity.",
      de: "ACID-konforme relationale Datenbank. Überwacht via pg_stat_activity.",
      ja: "ACID準拠リレーショナルDB。pg_stat_activityを通じて監視。"
    },
    injectTags: ["#postgresql", "#pg_pool", "#max_connections", "#concurrencia"]
  },
  {
    keyword: "postgres",
    label: "PostgreSQL Database Engine",
    category: "Database",
    scoreWeight: 9,
    description: {
      pt: "Banco de dados relacional acid-compliant. Monitorado via pg_stat_activity.",
      en: "Acid-compliant relational database. Monitored via pg_stat_activity.",
      es: "Base de datos relacional compatible con ACID. Monitoreada vía pg_stat_activity.",
      fr: "Base de données relationnelle conforme ACID. Surveillée via pg_stat_activity.",
      de: "ACID-konforme relationale Datenbank. Überwacht via pg_stat_activity.",
      ja: "ACID準拠リレーショナルDB。pg_stat_activityを通じて監視。"
    },
    injectTags: ["#postgresql", "#pg_pool", "#max_connections"]
  },
  {
    keyword: "out of memory",
    label: "Java/Node OutOfMemory (OOM)",
    category: "Memory",
    scoreWeight: 10,
    description: {
      pt: "Estouro de pilha ou heap física de alocação de memória RAM na VM hospedeira.",
      en: "Piles or physical heap allocation overflow of RAM in host Virtual Machine.",
      es: "Desbordamiento de pila o heap de asignación de RAM en la máquina virtual host.",
      fr: "Surcharge de pile ou de tas d'allocation physique de RAM dans la VM hôte.",
      de: "Stapel- oder Heap-Zuweisungsüberlauf von RAM im Host-System.",
      ja: "ホスト仮想マシンにおけるRAM割り当てヒープ/スタックの枯渇エラー。"
    },
    injectTags: ["#heap_oom", "#garbage_collector", "#leak_reference", "#process_limits"]
  },
  {
    keyword: "oom",
    label: "Kernel Out-Of-Memory Killer",
    category: "Memory",
    scoreWeight: 10,
    description: {
      pt: "Intervenção drástica do Kernel do Linux desativando processos para poupar o host.",
      en: "Drastic Linux Kernel intervention killing processes to save the host.",
      es: "Intervención drástica del kernel de Linux matando procesos para salvar el host.",
      fr: "Intervention drastique du noyau Linux tuant des processus pour sauver l'hôte.",
      de: "Drastischer Linux-Kernel-Eingriff zum Beenden von Prozessen zum Schutz des Hosts.",
      ja: "ホスト防衛のためにプロセスを強制終了するLinuxカーネルのOOMキラー機構。"
    },
    injectTags: ["#oom_killer", "#sysctl_vm", "#swap_allocation", "#cgroups"]
  },
  {
    keyword: "vazamento",
    label: "Memory Leak Pattern",
    category: "Memory",
    scoreWeight: 8,
    description: {
      pt: "Acúmulo progressivo de RAM não liberada por threads órfãs.",
      en: "Progressive accumulation of unreleased RAM by orphan threads.",
      es: "Acumulación progresiva de RAM no liberada por hilos huérfanos.",
      fr: "Accumulation progressive de RAM non libérée par des threads orphelins.",
      de: "Schrittweise Anhäufung nicht freigegebener RAM-Ressourcen durch verwaiste Threads.",
      ja: "孤立スレッドにより解放されないRAM領域が累積していく障害パターン。"
    },
    injectTags: ["#memory_leak", "#heap_profiling", "#gc_cycles"]
  },
  {
    keyword: "leak",
    label: "Memory Leak Pattern",
    category: "Memory",
    scoreWeight: 8,
    description: {
      pt: "Acúmulo progressivo de RAM não liberada por threads órfãs.",
      en: "Progressive accumulation of unreleased RAM by orphan threads.",
      es: "Acumulación progresiva de RAM no liberada por hilos huérfanos.",
      fr: "Accumulation progressive de RAM non libérée par des threads orphelins.",
      de: "Schrittweise Anhäufung nicht freigegebener RAM-Ressourcen durch verwaiste Threads.",
      ja: "孤立スレッドにより解放されないRAM領域が累積していく障害パターン。"
    },
    injectTags: ["#memory_leak", "#heap_profiling", "#gc_cycles"]
  },
  {
    keyword: "rabbitmq",
    label: "RabbitMQ Message Broker",
    category: "Broker",
    scoreWeight: 9,
    description: {
      pt: "Barramento AMQP de mensageria assíncrona concorrente com gerenciamento de filas Erlang.",
      en: "AMQP concurrent asynchronous messaging broker powered by Erlang queue management.",
      es: "Broker AMQP de mensajería asíncrona concurrente con colas Erlang.",
      fr: "Broker de messages asynchrones AMQP concurrent avec gestion des files d'attente Erlang.",
      de: "AMQP-kompatibler asynchroner Message Broker mit Erlang-Warteschlangenverwaltung.",
      ja: "Erlangキュー管理を採用した、堅牢なAMQP仕様非同期メッセージングミドルウェア。"
    },
    injectTags: ["#rabbitmq", "#amqp_queue", "#broker_heartbeat", "#channel_flow"]
  },
  {
    keyword: "kafka",
    label: "Apache Kafka Event Bus",
    category: "Broker",
    scoreWeight: 9,
    description: {
      pt: "Barramento de eventos distribuído de alta vazão baseado em append-only logs.",
      en: "Distributed high-throughput event streaming bus based on append-only logs.",
      es: "Distribuidor de transmisión de eventos de alta capacidad basado en registros append-only.",
      fr: "Flux d'événements distribué à haut débit basé sur des journaux d'ajout uniquement.",
      de: "Verteilter Event-Streaming-Bus mit hohem Durchsatz basierend auf Append-Only-Logs.",
      ja: "アペンドオンリーログを採用した、超高スループット型分散イベントストリーミング。"
    },
    injectTags: ["#kafka_partitions", "#zookeeper_kraft", "#offset_commit", "#consumer_lag"]
  },
  {
    keyword: "proxmox",
    label: "Proxmox Virtual Environment",
    category: "OS/Virtualization",
    scoreWeight: 9,
    description: {
      pt: "Hipervisor de código aberto baseado em KVM e contêineres LXC.",
      en: "Open-source hypervisor based on KVM and LXC micro-containers.",
      es: "Hipervisor de código abierto basado en KVM y contenedores LXC.",
      fr: "Hyperviseur open source basé sur KVM et conteneurs LXC.",
      de: "Open-Source-Hypervisor basierend auf KVM und LXC-Containern.",
      ja: "KVMおよびLXCコンテナ技術を軸にしたオープンソース型仮想化ハイパーバイザ。"
    },
    injectTags: ["#proxmox_ve", "#lxc_limit", "#kvm_io", "#host_ballooning"]
  },
  {
    keyword: "lxc",
    label: "LXC Linux Containers",
    category: "OS/Virtualization",
    scoreWeight: 8,
    description: {
      pt: "Contêineres de sistema leves compartilhando o mesmo Kernel do host.",
      en: "Lightweight system-level containers sharing the host Linux Kernel.",
      es: "Contenedores de sistema ligeros que comparten el mismo kernel del host.",
      fr: "Conteneurs système légers partageant le même noyau que l'hôte.",
      de: "Leichte Systemcontainer, die denselben Kernel wie das Host-System nutzen.",
      ja: "ホストカーネルを直接共有する、軽量かつ高集積なLinuxシステムコンテナ機構。"
    },
    injectTags: ["#lxc_cgroups", "#kernel_namespaces", "#subvolume_quota"]
  },
  {
    keyword: "brotli",
    label: "Brotli Compression Protocol",
    category: "Network",
    scoreWeight: 7,
    description: {
      pt: "Algoritmo de compressão genérico de alta performance otimizado para a web.",
      en: "High-performance generic compression algorithm optimized for static assets on web.",
      es: "Algoritmo de compresión genérico de alto rendimiento optimizado para la web.",
      fr: "Algorithme de compression générique haute performance optimisé pour le web.",
      de: "Generischer Hochleistungs-Komprimierungsalgorithmus, optimiert für das Web.",
      ja: "静的アセット転送速度向上のためにウェブ最適化された高性能圧縮アルゴリズム。"
    },
    injectTags: ["#brotli_level", "#nginx_gzip", "#static_throughput"]
  },
  {
    keyword: "cdn",
    label: "Content Delivery Network",
    category: "Network",
    scoreWeight: 8,
    description: {
      pt: "Rede descentralizada de servidores geográficos aproximando dados estáticos dos usuários.",
      en: "Decentralized network of edge geographical servers to shorten latency for static files.",
      es: "Red descentralizada de servidores geográficos que acerca los datos estáticos a los usuarios.",
      fr: "Réseau décentralisé de serveurs géographiques rapprochant les données statiques des utilisateurs.",
      de: "Dezentrales Netzwerk geografischer Edge-Server zur Reduzierung der statischen Latenz.",
      ja: "地理的エッジサーバー分散配置によりアセット配信遅延を極小化するネットワーク。"
    },
    injectTags: ["#edge_cache", "#ssl_termination", "#dns_anycast", "#anycast_routing"]
  },
  {
    keyword: "swap",
    label: "Virtual Swap Memory Area",
    category: "Memory",
    scoreWeight: 8,
    description: {
      pt: "Área de paginação secundária no disco rígido ativada quando a RAM esgota.",
      en: "Secondary paging area on hard disk invoked when physical RAM is completely saturated.",
      es: "Área de paginación secundaria en disco duro que se activa cuando la RAM se agota.",
      fr: "Zone de pagination secondaire sur disque dur activée lorsque la RAM est saturée.",
      de: "Sekundärer Auslagerungsbereich auf der Festplatte, wenn der physische RAM erschöpft ist.",
      ja: "物理RAM枯渇時、ディスク領域に退避ページを展開する仮想メモリ管理手法。"
    },
    injectTags: ["#swappiness", "#vm_overcommit", "#disk_paging"]
  },
  {
    keyword: "jwt",
    label: "JSON Web Token Structure",
    category: "Security",
    scoreWeight: 7,
    description: {
      pt: "Tokens auto-contidos criptografados para autenticação stateless de microsserviços.",
      en: "Stateless encrypted self-contained tokens used for microservice security context.",
      es: "Tokens autocontenidos encriptados para autenticación stateless de microservicios.",
      fr: "Jetons chiffrés autonomes pour l'authentification sans état des microservices.",
      de: "Verschlüsselte, eigenständige Token für die zustandslose Authentifizierung.",
      ja: "ステートレスな認証・認可のために設計された、暗号署名付きJSON構造体。"
    },
    injectTags: ["#jwt_signature", "#stateless_session", "#token_expiration", "#hmac_verification"]
  },
  {
    keyword: "gargalo",
    label: "I/O Bottleneck Pattern",
    category: "OS/Virtualization",
    scoreWeight: 8,
    description: {
      pt: "Saturação de leitura/escrita no canal de barramento de barreira de disco da VM.",
      en: "Read/write saturation in the VM disk boundary bus channel.",
      es: "Saturación de lectura/escritura en el canal de bus del disco de la VM.",
      fr: "Saturation de lecture/écriture dans le canal bus du disque de la VM.",
      de: "Lese-/Schreibsättigung im Festplatten-Buskanal der virtuellen Maschine.",
      ja: "仮想マシンのディスクバスに対する読み込み・書き込み限界（飽和状態）の発生。"
    },
    injectTags: ["#io_wait", "#fio_benchmark", "#disk_iop_cap"]
  },
  {
    keyword: "latency",
    label: "Network Latency Peak",
    category: "Network",
    scoreWeight: 9,
    description: {
      pt: "Picos de atraso no tempo de ida e volta (RTT) de pacotes TCP/UDP.",
      en: "Delay peaks in round-trip time (RTT) of TCP/UDP networking packets.",
      es: "Picos de retraso en el tiempo de ida y vuelta (RTT) de paquetes TCP/UDP.",
      fr: "Pics de retard dans le temps aller-retour (RTT) des paquets TCP/UDP.",
      de: "Verzögerungsspitzen in der Round-Trip-Time (RTT) von TCP/UDP-Netzwerkpaketen.",
      ja: "TCP/UDPパケット往復遅延時間（RTT）の一時的・継続的な増大現象。"
    },
    injectTags: ["#latency_rtt", "#tcp_tuning", "#packet_loss_retrans", "#iperf3"]
  },
  {
    keyword: "latencia",
    label: "Network Latency Peak",
    category: "Network",
    scoreWeight: 9,
    description: {
      pt: "Picos de atraso no tempo de ida e volta (RTT) de pacotes TCP/UDP.",
      en: "Delay peaks in round-trip time (RTT) of TCP/UDP networking packets.",
      es: "Picos de retraso en el tiempo de ida y vuelta (RTT) de paquetes TCP/UDP.",
      fr: "Pics de retard dans le temps aller-retour (RTT) des paquets TCP/UDP.",
      de: "Verzögerungsspitzen in der Round-Trip-Time (RTT) von TCP/UDP-Netzwerkpaketen.",
      ja: "TCP/UDPパケット往復遅延時間（RTT）の一時的・継続的な増大現象。"
    },
    injectTags: ["#latency_rtt", "#tcp_tuning", "#packet_loss_retrans"]
  }
];
