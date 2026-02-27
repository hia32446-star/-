
import React, { useState, useMemo } from 'react';
import { CheckIcon, TrashIcon, ChartIcon, LightningIcon, GlobeIcon, ClockIcon } from './Icons';
import { PairMetrics } from '../types';

interface PairSelectorProps {
  pairs: string[];
  selectedPairs: string[];
  onTogglePair: (pair: string) => void;
  onSelectAll: () => void;
  onClearAll: () => void;
  minConfidence: number;
  setMinConfidence: (val: number) => void;
  pairMetrics?: Record<string, PairMetrics>;
  onStartMarketScan?: () => void;
  isScanningMarket?: boolean;
}

const PairSelector: React.FC<PairSelectorProps> = ({ 
  pairs, 
  selectedPairs, 
  onTogglePair, 
  onSelectAll, 
  onClearAll,
  minConfidence,
  setMinConfidence,
  pairMetrics = {},
  onStartMarketScan,
  isScanningMarket = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [adxThreshold, setAdxThreshold] = useState(0); // 0 = All, 25 = Strong, 40 = Ultra
  
  // Updated defaults for Basis Points (bps)
  const [minVolatility, setMinVolatility] = useState(0); 
  const [maxVolatility, setMaxVolatility] = useState(200);

  const filteredPairs = useMemo(() => {
    return pairs.filter(p => {
      const matchesSearch = p.toLowerCase().includes(searchTerm.toLowerCase());
      const metrics = pairMetrics[p];
      
      if (!metrics) return matchesSearch;

      const matchesConfidence = metrics.confidence >= minConfidence;
      const matchesAdx = metrics.adx >= adxThreshold;
      
      // Calculate Volatility in Basis Points (bps)
      // Standard definition: 1 bps = 0.01% = 0.0001
      // If bbWidth is 0.0020 (0.2%), then bps = 0.0020 * 10000 = 20 bps
      const volBps = metrics.bbWidth * 10000;
      
      const matchesVolatility = volBps >= minVolatility && volBps <= maxVolatility;

      return matchesSearch && matchesConfidence && matchesAdx && matchesVolatility;
    });
  }, [pairs, searchTerm, pairMetrics, minConfidence, adxThreshold, minVolatility, maxVolatility]);

  return (
    <div className="glass-panel rounded-2xl p-4 mx-4 mb-24 border border-slate-700/50 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-500/20 rounded-lg">
            <ChartIcon className="w-5 h-5 text-emerald-400" />
          </div>
          <h2 className="text-sm font-bold text-slate-300 tracking-wider uppercase italic">Market Intel</h2>
        </div>
        <button 
          onClick={onStartMarketScan}
          disabled={isScanningMarket}
          className={`flex items-center space-x-2 px-3 py-1 rounded-full border text-[9px] font-black uppercase tracking-widest transition-all ${
            isScanningMarket 
            ? 'bg-neuro-accent/20 border-neuro-accent text-neuro-accent animate-pulse' 
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-neuro-accent hover:text-white'
          }`}
        >
          {isScanningMarket ? <ClockIcon className="w-3 h-3" /> : <GlobeIcon className="w-3 h-3" />}
          <span>{isScanningMarket ? 'Neural Scanning...' : 'Live Scan'}</span>
        </button>
      </div>

      {/* Advanced Technical Filters */}
      <div className="space-y-4 mb-5 p-3 bg-neuro-bg/40 rounded-xl border border-slate-700/30">
        <div className="grid grid-cols-1 gap-4">
          {/* Confidence Slider */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                    <LightningIcon className="w-3 h-3 text-indigo-400" />
                    <label className="text-[9px] font-black uppercase text-indigo-300 tracking-widest">Confidence Floor</label>
                </div>
                <span className="text-[10px] font-black text-white font-mono">{minConfidence}%</span>
            </div>
            <input 
                type="range" min="70" max="99" step="1" value={minConfidence}
                onChange={(e) => setMinConfidence(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-neuro-accent"
            />
          </div>

          {/* ADX Filter */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
                <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">ADX (Trend Strength)</label>
                <span className="text-[9px] font-black text-neuro-accent">{adxThreshold}+</span>
            </div>
            <input 
                type="range" min="0" max="50" step="5" value={adxThreshold}
                onChange={(e) => setAdxThreshold(parseInt(e.target.value))}
                className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
            />
          </div>

          {/* Volatility Range (BPS) */}
          <div className="grid grid-cols-2 gap-4">
             <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Min Vol (bps)</label>
                  <span className="text-[9px] font-black text-purple-400">{minVolatility}</span>
              </div>
              <input 
                  type="range" min="0" max="200" step="5" value={minVolatility}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val <= maxVolatility) setMinVolatility(val);
                  }}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                  <label className="text-[9px] font-black uppercase text-slate-500 tracking-widest">Max Vol (bps)</label>
                  <span className="text-[9px] font-black text-purple-400">{maxVolatility}</span>
              </div>
              <input 
                  type="range" min="0" max="200" step="5" value={maxVolatility}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= minVolatility) setMaxVolatility(val);
                  }}
                  className="w-full h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="relative pt-2">
            <input 
                type="text" 
                placeholder="Neural Filter: Asset Name..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-2 px-4 text-[10px] font-black text-slate-200 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all placeholder:text-slate-600 uppercase"
            />
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <button 
          onClick={onSelectAll}
          className="flex-1 py-2 px-4 rounded-lg bg-neuro-accent/10 border border-neuro-accent/20 hover:bg-neuro-accent/20 transition-all text-neuro-accent text-[10px] font-black uppercase tracking-tighter"
        >
          Select Visible
        </button>
        <button 
          onClick={onClearAll}
          className="flex-1 py-2 px-4 rounded-lg bg-red-500/5 border border-red-500/20 hover:bg-red-500/10 transition-all text-red-400 text-[10px] font-black uppercase tracking-tighter"
        >
          Reset Selection
        </button>
      </div>

      <div className="grid grid-cols-2 gap-2 max-h-[300px] overflow-y-auto pr-1">
        {filteredPairs.length > 0 ? filteredPairs.map((pair) => {
          const isSelected = selectedPairs.includes(pair);
          const metrics = pairMetrics[pair];
          
          return (
            <button
              key={pair}
              onClick={() => onTogglePair(pair)}
              className={`p-3 rounded-xl text-left transition-all duration-200 border relative overflow-hidden group ${
                isSelected 
                  ? 'bg-gradient-to-br from-indigo-900/40 to-blue-900/40 border-neuro-accent/50 shadow-lg shadow-neuro-accent/10' 
                  : 'bg-slate-800/40 border-slate-700/50 hover:border-slate-500'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-[10px] font-black tracking-tight uppercase ${isSelected ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>
                  {pair.replace('-OTCq', '')}
                </span>
                {isSelected && <CheckIcon className="w-3 h-3 text-neuro-accent animate-pulse" />}
              </div>

              {metrics ? (
                <div className="flex space-x-2 mt-2">
                   <div className="flex flex-col">
                      <span className="text-[7px] text-slate-500 font-bold uppercase">ADX</span>
                      <span className={`text-[9px] font-black ${metrics.adx > 30 ? 'text-neuro-success' : 'text-neuro-accent'}`}>{Math.round(metrics.adx)}</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[7px] text-slate-500 font-bold uppercase">WIN%</span>
                      <span className="text-[9px] font-black text-neuro-gold">{metrics.confidence}%</span>
                   </div>
                   <div className="flex flex-col ml-auto">
                      <span className="text-[7px] text-slate-500 font-bold uppercase text-right">VOL (bps)</span>
                      {/* Display in BPS: bbWidth * 10000 */}
                      <span className="text-[9px] font-black text-purple-400 text-right">{(metrics.bbWidth * 10000).toFixed(0)}</span>
                   </div>
                </div>
              ) : (
                <div className="mt-2 h-5 flex items-center">
                   <div className="w-full h-[2px] bg-slate-800 rounded-full"></div>
                </div>
              )}

              {isSelected && (
                  <div className="absolute top-0 right-0 w-8 h-8 bg-neuro-accent/5 rotate-45 translate-x-4 -translate-y-4" />
              )}
            </button>
          );
        }) : (
            <div className="col-span-2 py-12 text-center border border-dashed border-slate-800 rounded-2xl bg-neuro-card/20">
                <LightningIcon className="w-6 h-6 text-slate-700 mx-auto mb-2 opacity-50" />
                <p className="text-[10px] text-slate-600 font-black uppercase italic tracking-widest">No Matches Found</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default PairSelector;
