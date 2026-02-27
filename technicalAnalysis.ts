
export const calculateRSI = (prices: number[], periods: number = 14): number => {
  if (prices.length < periods + 1) return 50;
  let gains = 0;
  let losses = 0;
  for (let i = 0; i < periods; i++) {
    const diff = prices[prices.length - 1 - i] - prices[prices.length - 2 - i];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }
  if (losses === 0) return 100;
  const rs = gains / losses;
  return 100 - 100 / (1 + rs);
};

export const calculateEMA = (prices: number[], periods: number): number => {
  if (prices.length < periods) return prices[prices.length - 1];
  const k = 2 / (periods + 1);
  let ema = prices[0];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
  }
  return ema;
};

// Returns the entire array of EMA values, not just the last one
export const calculateEMASeries = (prices: number[], periods: number): number[] => {
  if (prices.length === 0) return [];
  const k = 2 / (periods + 1);
  let ema = prices[0];
  const emaSeries = [ema];
  for (let i = 1; i < prices.length; i++) {
    ema = prices[i] * k + ema * (1 - k);
    emaSeries.push(ema);
  }
  return emaSeries;
};

// Triple Exponential Moving Average - Very fast, low lag
export const calculateTEMA = (prices: number[], periods: number): number => {
  if (prices.length < periods * 3) return prices[prices.length - 1];
  
  const ema1 = calculateEMASeries(prices, periods);
  const ema2 = calculateEMASeries(ema1, periods);
  const ema3 = calculateEMASeries(ema2, periods);

  const lastIndex = prices.length - 1;
  // TEMA = 3*EMA1 - 3*EMA2 + EMA3
  // We need the last value of each series that aligns with the current price
  // The arrays are same length, so last index works
  const e1 = ema1[lastIndex];
  const e2 = ema2[lastIndex];
  const e3 = ema3[lastIndex];

  return 3 * e1 - 3 * e2 + e3;
};

export const calculatePivotPoints = (high: number, low: number, close: number) => {
    const pp = (high + low + close) / 3;
    const r1 = 2 * pp - low;
    const s1 = 2 * pp - high;
    const r2 = pp + (high - low);
    const s2 = pp - (high - low);
    const r3 = high + 2 * (pp - low);
    const s3 = low - 2 * (high - pp);
    return { pp, r1, s1, r2, s2, r3, s3 };
};

export const calculateMACD = (prices: number[]) => {
  const ema12 = calculateEMA(prices, 12);
  const ema26 = calculateEMA(prices, 26);
  const macdLine = ema12 - ema26;
  const signalLine = macdLine * 0.92; 
  return {
    macd: macdLine,
    signal: signalLine,
    histogram: macdLine - signalLine
  };
};

export const calculateBollingerBands = (prices: number[], periods: number = 20, stdDev: number = 2) => {
  const slice = prices.slice(-periods);
  const mean = slice.reduce((a, b) => a + b, 0) / periods;
  const variance = slice.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / periods;
  const sd = Math.sqrt(variance);
  return {
    upper: mean + stdDev * sd,
    middle: mean,
    lower: mean - stdDev * sd
  };
};

export const calculateADX = (highs: number[], lows: number[], closes: number[], periods: number = 14): number => {
  let trSum = 0;
  for (let i = 1; i < Math.min(closes.length, periods); i++) {
    const hl = highs[highs.length - i] - lows[lows.length - i];
    const hc = Math.abs(highs[highs.length - i] - closes[closes.length - i - 1]);
    const lc = Math.abs(lows[lows.length - i] - closes[closes.length - i - 1]);
    trSum += Math.max(hl, hc, lc);
  }
  const atr = trSum / periods;
  const currentPrice = closes[closes.length - 1];
  return Math.min((atr / (currentPrice * 0.0005)) * 10, 100); 
};

export const calculateFibonacciLevels = (prices: number[], periods: number = 50) => {
  const slice = prices.slice(-periods);
  const high = Math.max(...slice);
  const low = Math.min(...slice);
  const diff = high - low;
  return {
    high,
    low,
    level618: high - (diff * 0.618),
    level382: high - (diff * 0.382),
    level500: high - (diff * 0.5)
  };
};

export const calculateWilliamsR = (highs: number[], lows: number[], closes: number[], periods: number = 14): number => {
  const hSlice = highs.slice(-periods);
  const lSlice = lows.slice(-periods);
  const highestHigh = Math.max(...hSlice);
  const lowestLow = Math.min(...lSlice);
  const close = closes[closes.length - 1];
  return ((highestHigh - close) / (highestHigh - lowestLow || 1)) * -100;
};

export const calculateLinearRegressionSlope = (prices: number[]): number => {
  const n = prices.length;
  if (n < 2) return 0;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += prices[i];
    sumXY += i * prices[i];
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  return slope;
};

export const calculateStochastic = (closes: number[], highs: number[], lows: number[], period: number = 14, smoothK: number = 3): { k: number, d: number } => {
  const hSlice = highs.slice(-period);
  const lSlice = lows.slice(-period);
  const highestHigh = Math.max(...hSlice);
  const lowestLow = Math.min(...lSlice);
  const currentClose = closes[closes.length - 1];
  
  const rawK = ((currentClose - lowestLow) / (highestHigh - lowestLow || 1)) * 100;
  return { k: rawK, d: rawK }; 
};

export const calculateCCI = (highs: number[], lows: number[], closes: number[], period: number = 20): number => {
  if (closes.length < period) return 0;
  
  let tps = [];
  for(let i=0; i<period; i++) {
     const idx = closes.length - 1 - i;
     tps.push((highs[idx] + lows[idx] + closes[idx]) / 3);
  }
  const avgTp = tps.reduce((a,b) => a+b, 0) / period;
  const meanDev = tps.reduce((a,b) => a + Math.abs(b - avgTp), 0) / period;
  
  const currentTp = (highs[highs.length-1] + lows[lows.length-1] + closes[closes.length-1]) / 3;
  return (currentTp - avgTp) / (0.015 * meanDev || 1);
};

export const calculateATR = (highs: number[], lows: number[], closes: number[], period: number = 14): number => {
    let trSum = 0;
    for (let i = 1; i <= period; i++) {
        const idx = closes.length - i;
        if (idx < 1) break;
        const hl = highs[idx] - lows[idx];
        const hc = Math.abs(highs[idx] - closes[idx - 1]);
        const lc = Math.abs(lows[idx] - closes[idx - 1]);
        trSum += Math.max(hl, hc, lc);
    }
    return trSum / period;
};

export const calculateMFI = (highs: number[], lows: number[], closes: number[], volumes: number[], period: number = 14): number => {
  if (volumes.length < period) return 50;
  let posFlow = 0;
  let negFlow = 0;
  
  for (let i = 0; i < period; i++) {
    const idx = closes.length - 1 - i;
    const prevIdx = idx - 1;
    if (prevIdx < 0) break;
    
    const tp = (highs[idx] + lows[idx] + closes[idx]) / 3;
    const prevTp = (highs[prevIdx] + lows[prevIdx] + closes[prevIdx]) / 3;
    const rawMoneyFlow = tp * volumes[idx];
    
    if (tp > prevTp) posFlow += rawMoneyFlow;
    else if (tp < prevTp) negFlow += rawMoneyFlow;
  }
  
  if (negFlow === 0) return 100;
  const moneyRatio = posFlow / negFlow;
  return 100 - (100 / (1 + moneyRatio));
};

export const calculateAwesomeOscillator = (highs: number[], lows: number[]) => {
  const midpoints = highs.map((h, i) => (h + lows[i]) / 2);
  const sma5 = calculateEMA(midpoints, 5); 
  const sma34 = calculateEMA(midpoints, 34);
  return sma5 - sma34;
};

export const calculateIchimoku = (highs: number[], lows: number[]) => {
  const h9 = Math.max(...highs.slice(-9));
  const l9 = Math.min(...lows.slice(-9));
  const tenkan = (h9 + l9) / 2;

  const h26 = Math.max(...highs.slice(-26));
  const l26 = Math.min(...lows.slice(-26));
  const kijun = (h26 + l26) / 2;
  
  return { tenkan, kijun };
};

export const detectCandlePatterns = (open: number, high: number, low: number, close: number, prevOpen: number, prevClose: number) => {
    const isBull = close > open;
    const isPrevBull = prevClose > prevOpen;
    const body = Math.abs(close - open);
    const wickTop = high - Math.max(open, close);
    const wickBot = Math.min(open, close) - low;
    
    return {
        isHammer: wickBot > body * 2 && wickTop < body * 0.5,
        isShootingStar: wickTop > body * 2 && wickBot < body * 0.5,
        isEngulfing: isBull !== isPrevBull && Math.abs(close - open) > Math.abs(prevClose - prevOpen) && ((isBull && close > prevOpen && open < prevClose) || (!isBull && close < prevOpen && open > prevClose)),
        isDoji: body < (high - low) * 0.1,
        isMarubozu: body > (high - low) * 0.8
    };
};

export const calculateParabolicSAR = (highs: number[], lows: number[], accelerationFactor: number = 0.02, maxAcceleration: number = 0.2) => {
  let sar = lows[0];
  let isRising = true;
  let ep = highs[0]; // Extreme Point
  let af = accelerationFactor;

  const sarSeries = [sar];

  for (let i = 1; i < highs.length; i++) {
    const prevSar = sar;
    
    // Calculate new SAR
    sar = prevSar + af * (ep - prevSar);

    // Check for reversal
    if (isRising) {
      if (lows[i] < sar) {
        isRising = false;
        sar = ep;
        ep = lows[i];
        af = accelerationFactor;
      } else {
        if (highs[i] > ep) {
          ep = highs[i];
          af = Math.min(af + accelerationFactor, maxAcceleration);
        }
        // SAR cannot be higher than the previous two lows
        if (i > 1) sar = Math.min(sar, lows[i - 1], lows[i - 2]);
      }
    } else {
      if (highs[i] > sar) {
        isRising = true;
        sar = ep;
        ep = highs[i];
        af = accelerationFactor;
      } else {
        if (lows[i] < ep) {
          ep = lows[i];
          af = Math.min(af + accelerationFactor, maxAcceleration);
        }
        // SAR cannot be lower than the previous two highs
        if (i > 1) sar = Math.max(sar, highs[i - 1], highs[i - 2]);
      }
    }
    sarSeries.push(sar);
  }
  return { sar: sarSeries[sarSeries.length - 1], isRising };
};

export const calculateVortex = (highs: number[], lows: number[], closes: number[], period: number = 14) => {
  if (highs.length < period + 1) return { plusVI: 0, minusVI: 0 };

  let trSum = 0;
  let vmPlusSum = 0;
  let vmMinusSum = 0;

  for (let i = 1; i <= period; i++) {
    const idx = highs.length - i;
    const prevIdx = idx - 1;
    
    const hl = Math.abs(highs[idx] - lows[idx]);
    const hc = Math.abs(highs[idx] - closes[prevIdx]);
    const lc = Math.abs(lows[idx] - closes[prevIdx]);
    const tr = Math.max(hl, hc, lc);
    
    const vmPlus = Math.abs(highs[idx] - lows[prevIdx]);
    const vmMinus = Math.abs(lows[idx] - highs[prevIdx]);

    trSum += tr;
    vmPlusSum += vmPlus;
    vmMinusSum += vmMinus;
  }

  return {
    plusVI: trSum === 0 ? 0 : vmPlusSum / trSum,
    minusVI: trSum === 0 ? 0 : vmMinusSum / trSum
  };
};

export const calculateSuperTrend = (highs: number[], lows: number[], closes: number[], period: number = 10, multiplier: number = 3) => {
  const atr = calculateATR(highs, lows, closes, period);
  const basicUpper = (highs[highs.length - 1] + lows[lows.length - 1]) / 2 + multiplier * atr;
  const basicLower = (highs[highs.length - 1] + lows[lows.length - 1]) / 2 - multiplier * atr;
  
  // Simplified for last candle only as full series requires state
  // This is an approximation for the current candle
  return {
    upper: basicUpper,
    lower: basicLower,
    trend: closes[closes.length - 1] > basicUpper ? 'BULL' : closes[closes.length - 1] < basicLower ? 'BEAR' : 'NEUTRAL'
  };
};

export const calculateKeltnerChannels = (highs: number[], lows: number[], closes: number[], period: number = 20, multiplier: number = 2) => {
  const ema = calculateEMA(closes, period);
  const atr = calculateATR(highs, lows, closes, 10); // Standard ATR period for Keltner is often 10
  
  return {
    upper: ema + multiplier * atr,
    middle: ema,
    lower: ema - multiplier * atr
  };
};
export const detectAdvancedCandlePatterns = (
    opens: number[], highs: number[], lows: number[], closes: number[]
) => {
    const i = closes.length - 1;
    // Basic single candle check
    const single = detectCandlePatterns(opens[i], highs[i], lows[i], closes[i], opens[i-1], closes[i-1]);
    
    if (i < 2) return { ...single, isMorningStar: false, isEveningStar: false, isThreeSoldiers: false, isThreeCrows: false };

    const O = opens, H = highs, L = lows, C = closes;
    const body = (idx: number) => Math.abs(C[idx] - O[idx]);
    const isBull = (idx: number) => C[idx] > O[idx];
    const isBear = (idx: number) => C[idx] < O[idx];

    // Morning Star
    const isMorningStar = isBear(i-2) && 
                          body(i-2) > (H[i-2]-L[i-2])*0.6 && // Big bear
                          body(i-1) < body(i-2)*0.4 && // Small middle
                          isBull(i) && C[i] > (O[i-2] + C[i-2])/2; // Bull closes > 50% of first

    // Evening Star
    const isEveningStar = isBull(i-2) &&
                          body(i-2) > (H[i-2]-L[i-2])*0.6 &&
                          body(i-1) < body(i-2)*0.4 &&
                          isBear(i) && C[i] < (O[i-2] + C[i-2])/2;

    // Three White Soldiers (Strong Bull Trend)
    const isThreeSoldiers = isBull(i-2) && isBull(i-1) && isBull(i) &&
                            C[i] > C[i-1] && C[i-1] > C[i-2] &&
                            O[i] > O[i-1] && O[i-1] > O[i-2] &&
                            body(i) > (H[i]-L[i])*0.6; // Strong finish

    // Three Black Crows (Strong Bear Trend)
    const isThreeCrows = isBear(i-2) && isBear(i-1) && isBear(i) &&
                         C[i] < C[i-1] && C[i-1] < C[i-2] &&
                         O[i] < O[i-1] && O[i-1] < O[i-2] &&
                         body(i) > (H[i]-L[i])*0.6;

    return {
        ...single,
        isMorningStar,
        isEveningStar,
        isThreeSoldiers,
        isThreeCrows
    };
};
