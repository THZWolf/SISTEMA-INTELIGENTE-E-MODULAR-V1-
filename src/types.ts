export interface AgentThought {
  id: string;
  name: string;
  role: string;
  avatar: string; // Tailwind icon name or category
  color: string; // Tailind class border/text color
  thought: string;
  status: 'idle' | 'processing' | 'completed' | 'consensus';
}

export interface PipelineStage {
  id: string;
  label: string;
  description: string;
  status: 'waiting' | 'active' | 'completed';
}

export interface SimulationResult {
  problem: string;
  category: string;
  urgency: string;
  vm_environment: string;
  tasks: string[];
  agents: {
    logico: { thought: string };
    matematico: { thought: string };
    causal: { thought: string };
    estrategico: { thought: string };
    memoria: { thought: string };
    social: { thought: string };
  };
  consensus: string;
  final_solution: string;
  metrics: {
    efficiency_gain: number;
    success_rate: number;
    redundancy_reduction: number;
  };
  timestamp: string;
}

export interface SavedCase {
  id: string;
  problem: string;
  category: string;
  urgency: string;
  final_solution: string;
  timestamp: string;
}

export interface FeedbackRecord {
  id: string;
  caseId: string;
  problem: string;
  rating: 'positive' | 'negative';
  tags: string[];
  note?: string;
  category: string;
  efficiency: number;
  timestamp: string;
}

export type PipelineSpeed = 'normal' | 'fast' | 'ultra' | 'instant';

export interface PredictiveAnomaly {
  id: string;
  component: string;
  category: 'database' | 'network' | 'memory' | 'compute' | 'storage';
  predictedFailure: string;
  probability: number; // percentage 0-100
  timeHorizon: string; // e.g. "6h - 12h"
  vectorDistance: number; // cosine distance in Qdrant embedding space
  matchedHistoricalCluster: string;
  preemptiveAction: string;
  severity: 'high' | 'critical' | 'medium';
}

export interface InfrastructureVectorTrend {
  overallRiskScore: number;
  entropyTrend: 'stable' | 'increasing' | 'degrading';
  projectedMtbfHours: number;
  activeAnomaliesCount: number;
  anomalies: PredictiveAnomaly[];
}

