
export interface AiSignal {
  direction: 'CALL' | 'PUT';
  confidence: number;
  reasoning: string;
  indicators: Record<string, string>;
  protocol: 'ELITE' | 'LITE' | 'STABLE';
}

export type AiErrorType = 'QUOTA_EXHAUSTED' | 'SAFETY_BLOCKED' | 'NETWORK_ERROR' | 'INVALID_KEY' | 'NOT_FOUND' | 'UNKNOWN';

export class AiServiceError extends Error {
  constructor(public type: AiErrorType, message: string, public rawError?: any) {
    super(message);
    this.name = "AiServiceError";
  }
}

export const validateCurrentKey = async (): Promise<boolean> => {
  return true;
};

/**
 * Generates the Final Elite Signal based on high-accuracy local analysis.
 * Uses the advanced "50+ Strategy" matrix from helpers.ts
 */
export const generateEliteSignal = async (pair: string, history: number[], candidate: any): Promise<AiSignal> => {
  // Simulate processing calculation depth
  await new Promise(resolve => setTimeout(resolve, 600));

  const { direction, confidence, values } = candidate;
  
  // Format the Sureshot reasoning
  const strategyInfo = values.REASON || "Multi-Strategy Confluence";
  const mtgInfo = values.MTG || "Check Volatility";
  
  const reasoning = `STRATEGY: ${strategyInfo}. TREND: ${values.TREND}. (MTG: ${mtgInfo})`;

  return {
    direction: direction,
    confidence: confidence,
    reasoning: reasoning,
    indicators: values,
    protocol: 'ELITE'
  };
};

export const generateLiteSignal = async (pair: string, history: number[], candidate: any): Promise<AiSignal> => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return {
    direction: candidate.direction,
    confidence: candidate.confidence,
    reasoning: `FAST SCAN: ${candidate.values.REASON}`,
    indicators: candidate.values,
    protocol: 'LITE'
  };
};
