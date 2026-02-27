
export const OTC_PAIRS = [
  "AUDCAD_otc", "AUDJPY_otc", "AUDNZD_otc", "AUDUSD_otc", "BRLUSD_otc",
  "CADCHF_otc", "CADJPY_otc", "CHFJPY_otc", "EURAUD_otc", "EURCAD_otc",
  "EURCHF_otc", "EURGBP_otc", "EURJPY_otc", "EURNZD_otc", "EURSGD_otc",
  "EURUSD_otc", "GBPAUD_otc", "GBPCAD_otc", "GBPCHF_otc", "GBPJPY_otc",
  "GBPUSD_otc", "NZDUSD_otc", "USDARS_otc", "USDBDT_otc", "USDCAD_otc",
  "USDCHF_otc", "USDEGP_otc", "USDGBP_otc", "USDIDR_otc", "USDINR_otc",
  "USDJPY_otc", "USDMXN_otc", "USDNGN_otc", "USDPKR_otc", "USDTRY_otc",
  "USDZAR_otc", "USDPHP_otc", "BTCUSD_otc", "BCHUSD_otc", "ARBUSD_otc",
  "ZECUSD_otc", "ATOUSD_otc", "AXSUSD_otc", "XAUUSD_otc", "XAGUSD_otc",
  "USCrude_otc", "UKBrent_otc", "FLOUSD_otc", "AXP_otc", "PFE_otc",
  "INTC_otc", "JNJ_otc", "MCD_otc", "FB_otc", "BA_otc", "MSFT_otc"
];

export const REAL_PAIRS = [
  "EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD",
  "USD/CAD", "USD/CHF", "NZD/USD", "EUR/JPY",
  "GBP/JPY", "EUR/GBP", "AUD/JPY", "XAU/USD",
  "BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT"
];

export const ANALYSIS_STEPS = [
  { id: 1, label: "Market Data Uplink", duration: 300 },
  { id: 2, label: "Smart Trend Analysis", duration: 500, hasValue: true, type: 'TREND' },
  { id: 3, label: "Oscillator Matrix (RSI/CCI/Stoch)", duration: 400, hasValue: true, type: 'OSC' },
  { id: 4, label: "Volatility & MTG Calc", duration: 600, hasValue: true, type: 'VOL' },
  { id: 5, label: "Pattern Recognition", duration: 400, hasValue: true, type: 'PATTERN' },
  { id: 6, label: "Sureshot Logic Verification", duration: 300 },
];
