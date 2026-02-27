
export type MarketType = 'OTC' | 'REAL';
export type AnalysisProtocol = 'ELITE' | 'STABLE' | 'LITE';

export interface SignalResult {
  pair: string;
  timestamp: string;
  expiry: string;
  direction: 'CALL' | 'PUT';
  entryTime: string;
  confidence: number;
  analysisValues?: Record<string, string>;
  dataSource: 'LIVE' | 'AI_ENGINE';
  protocol: AnalysisProtocol;
}

export interface AnalysisStep {
  id: number;
  label: string;
  duration: number;
  hasValue?: boolean;
  type?: string;
}

export interface PairMetrics {
  adx: number;
  bbWidth: number;
  rsi: number;
  confidence: number;
  lastUpdated: number;
}

export interface AnalysisState {
  currentStepIndex: number;
  completedSteps: number[];
  values: Record<string, string>;
  currentPair?: string;
  scanProgress?: number;
  protocol?: AnalysisProtocol;
}

export interface MarketApiResponse {
  symbol: string;
  price: number;
  history?: number[];
  timestamp?: number;
}
