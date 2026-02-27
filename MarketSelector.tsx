import React from 'react';
import { MarketType } from '../types';
import { GlobeIcon, MoonIcon, SunIcon } from './Icons';

interface MarketSelectorProps {
  selectedMarket: MarketType;
  onSelect: (type: MarketType) => void;
}

const MarketSelector: React.FC<MarketSelectorProps> = ({ selectedMarket, onSelect }) => {
  return (
    <div className="glass-panel rounded-2xl p-4 mx-4 mb-4 border border-slate-700/50 shadow-lg">
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-1.5 bg-blue-500/20 rounded-lg">
          <GlobeIcon className="w-5 h-5 text-blue-400" />
        </div>
        <h2 className="text-sm font-bold text-slate-300 tracking-wider uppercase">Market Type</h2>
      </div>

      <div className="flex flex-col space-y-3">
        <button
          onClick={() => onSelect('OTC')}
          className={`relative group overflow-hidden flex items-center justify-center space-x-3 py-4 px-6 rounded-xl border transition-all duration-300 ${
            selectedMarket === 'OTC'
              ? 'bg-slate-800 border-yellow-500/50 shadow-[0_0_20px_rgba(234,179,8,0.15)]'
              : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
          }`}
        >
          {selectedMarket === 'OTC' && (
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-500/10 to-transparent opacity-50" />
          )}
          <MoonIcon className={`w-6 h-6 ${selectedMarket === 'OTC' ? 'text-yellow-400 fill-yellow-400/20' : 'text-slate-400'}`} />
          <span className={`text-lg font-bold ${selectedMarket === 'OTC' ? 'text-white' : 'text-slate-400'}`}>OTC Market</span>
        </button>

        <button
          onClick={() => onSelect('REAL')}
          className={`relative group overflow-hidden flex items-center justify-center space-x-3 py-4 px-6 rounded-xl border transition-all duration-300 ${
            selectedMarket === 'REAL'
              ? 'bg-slate-800 border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.15)]'
              : 'bg-slate-800/40 border-slate-700 hover:bg-slate-800'
          }`}
        >
           {selectedMarket === 'REAL' && (
             <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/10 to-transparent opacity-50" />
          )}
          <SunIcon className={`w-6 h-6 ${selectedMarket === 'REAL' ? 'text-orange-400 fill-orange-400/20' : 'text-slate-400'}`} />
          <span className={`text-lg font-bold ${selectedMarket === 'REAL' ? 'text-white' : 'text-slate-400'}`}>Real Market</span>
        </button>
      </div>
    </div>
  );
};

export default MarketSelector;