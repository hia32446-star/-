
import { calculateAllIndicators, IndicatorSet } from './modules/IndicatorModule';
import { checkVolatilityFilter } from './modules/FilterModule';
import { evaluateTrendStrategy, evaluateReversalStrategy } from './modules/StrategyModule';
import { calculateEMA } from './technicalAnalysis'; // Keep for M5 simulation locally or move to module

export const formatTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export const formatShortTime = (date: Date): string => {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
  });
};

export interface AnalysisResult {
  values: Record<string, string>;
  direction: 'CALL' | 'PUT';
  confidence: number;
}

// Resamples M1 data into M5 data for Macro Trend Analysis
const resampleToM5 = (c: number[], h: number[], l: number[], o: number[]) => {
   const m5c = [], m5h = [], m5l = [], m5o = [];
   // We group by 5 to simulate M5 candles
   for (let i = c.length; i >= 5; i -= 5) {
       const chunkC = c.slice(i-5, i);
       const chunkH = h.slice(i-5, i);
       const chunkL = l.slice(i-5, i);
       const chunkO = o.slice(i-5, i);
       
       m5c.unshift(chunkC[4]); // Close of last
       m5o.unshift(chunkO[0]); // Open of first
       m5h.unshift(Math.max(...chunkH));
       m5l.unshift(Math.min(...chunkL));
   }
   return { c: m5c, h: m5h, l: m5l, o: m5o };
};

/**
 * NEUROTRADEX ULTRA-ACCURACY ENGINE V12.0 (MODULAR ARCHITECTURE)
 */
export const generateAnalysis = (
  closes: number[], 
  highs: number[] = [], 
  lows: number[] = [], 
  opens: number[] = [], 
  volumes: number[] = []
): AnalysisResult => {
  // Data Sanitization
  const len = closes.length;
  if (len < 60) {
    return {
      direction: 'CALL',
      confidence: 0,
      values: { STATUS: 'CALIBRATING', ERROR: 'Need >60 candles' }
    };
  }

  // 1. Calculate All Indicators
  const indicators = calculateAllIndicators({ closes, highs, lows, opens, volumes });

  // 2. Macro Trend Analysis (M5 Simulation)
  const m5 = resampleToM5(closes, highs.length ? highs : closes, lows.length ? lows : closes, opens.length ? opens : closes);
  const m5Ema20 = calculateEMA(m5.c, 20);
  const m5Ema50 = calculateEMA(m5.c, 50);
  
  let macroTrend = 'NEUTRAL';
  let isMacroBull = false;
  let isMacroBear = false;

  if (m5.c.length > 50) {
      if (m5.c[m5.c.length-1] > m5Ema20 && m5Ema20 > m5Ema50) { 
          macroTrend = 'BULL'; isMacroBull = true; 
      }
      else if (m5.c[m5.c.length-1] < m5Ema20 && m5Ema20 < m5Ema50) { 
          macroTrend = 'BEAR'; isMacroBear = true; 
      }
  }

  // 3. Strategy Evaluation
  const trendCall = evaluateTrendStrategy(indicators, 'CALL');
  const trendPut = evaluateTrendStrategy(indicators, 'PUT');
  const revCall = evaluateReversalStrategy(indicators, 'CALL');
  const revPut = evaluateReversalStrategy(indicators, 'PUT');

  // Boost Trend Scores with Macro Trend
  if (isMacroBull) trendCall.score += 20;
  if (isMacroBear) trendPut.score += 20;

  // 4. Select Best Strategy
  let bestDirection: 'CALL' | 'PUT' = 'CALL';
  let bestScore = 0;
  let bestLog: string[] = [];
  let strategyType = 'TREND';

  const maxCall = Math.max(trendCall.score, revCall.score);
  const maxPut = Math.max(trendPut.score, revPut.score);

  if (maxCall > maxPut) {
      bestDirection = 'CALL';
      bestScore = maxCall;
      if (trendCall.score > revCall.score) {
          bestLog = trendCall.log;
          strategyType = 'TREND';
      } else {
          bestLog = revCall.log;
          strategyType = 'REVERSAL';
      }
  } else {
      bestDirection = 'PUT';
      bestScore = maxPut;
      if (trendPut.score > revPut.score) {
          bestLog = trendPut.log;
          strategyType = 'TREND';
      } else {
          bestLog = revPut.log;
          strategyType = 'REVERSAL';
      }
  }

  // 5. Apply Filters
  const volFilter = checkVolatilityFilter(indicators);
  let confidence = bestScore;
  let mtgAdvice = "SAFE";

  if (!volFilter.passed) {
      confidence *= 0.5; // Heavy penalty
      mtgAdvice = volFilter.reason || "CAUTION";
  }

  // Normalize Confidence (0-100)
  // Base scores can go up to ~100-120. 
  confidence = Math.min(Math.max(confidence, 40), 99);

  // Pattern Name for UI
  let patternName = 'NEUTRAL';
  if (indicators.patterns.isMorningStar) patternName = 'M-STAR';
  else if (indicators.patterns.isEveningStar) patternName = 'E-STAR';
  else if (indicators.patterns.isThreeSoldiers) patternName = '3-SOLDIERS';
  else if (indicators.patterns.isThreeCrows) patternName = '3-CROWS';
  else if (indicators.patterns.isHammer) patternName = 'HAMMER';
  else if (indicators.patterns.isShootingStar) patternName = 'S-STAR';
  else if (indicators.patterns.isEngulfing) patternName = 'ENGULFING';

  const reason = bestLog.slice(0, 3).join(' + ') || "Neural Confluence";

  return {
    direction: bestDirection,
    confidence: parseFloat(confidence.toFixed(1)),
    values: {
      RSI: indicators.rsi.toFixed(1),
      MFI: indicators.mfi.toFixed(1),
      CCI: indicators.cci.toFixed(0),
      OSC: `RSI:${indicators.rsi.toFixed(0)} CCI:${indicators.cci.toFixed(0)}`,
      TREND: `M5:${macroTrend}`,
      VOL: ((indicators.atr / indicators.price) * 10000).toFixed(0) + ' bps',
      PATTERN: patternName,
      REASON: reason,
      MTG: mtgAdvice,
      STRATEGY: strategyType,
      SCORE_TREND: (strategyType === 'TREND' ? bestScore : 0).toFixed(0),
      SCORE_MOMENTUM: (strategyType === 'REVERSAL' ? bestScore : 0).toFixed(0),
      SCORE_PATTERN: '0', // Simplified for now
      SCORE_SUPPORT: '0'
    }
  };
};

export const getRandomValue = (type: string): string => {
  switch (type) {
    case 'RSI': return (30 + Math.random() * 40).toFixed(1);
    case 'OSC': return "SCANNING";
    case 'PATTERN': return Math.random() > 0.8 ? "DOJI" : "NONE";
    case 'TREND': return Math.random() > 0.5 ? 'BULLISH' : 'BEARISH';
    case 'VOL': return (Math.floor(Math.random() * 30) + 10) + ' bps';
    default: return '---';
  }
};
