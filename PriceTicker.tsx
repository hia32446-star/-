
import React, { useEffect, useState, useMemo } from 'react';
import { LightningIcon } from './Icons';
import { marketStream } from '../utils/marketStream';

interface PriceTickerProps {
  activePairs: string[];
}

const PriceTicker: React.FC<PriceTickerProps> = ({ activePairs }) => {
  const [prices, setPrices] = useState<Record<string, { price: number; change: number }>>({});
  const [currentIndex, setCurrentIndex] = useState(0);

  // Default pairs if none selected
  const tickerPairs = useMemo(() => 
    activePairs.length > 0 ? activePairs : ['EURUSD_otc', 'GBPUSD_otc', 'XAUUSD_otc', 'BTCUSD_otc'], 
  [activePairs]);

  // Sync active pairs with the robust MarketStreamService
  useEffect(() => {
    marketStream.updateActivePairs(tickerPairs);
  }, [tickerPairs]);

  // Subscribe to stream updates
  useEffect(() => {
    const handleData = (data: { pair: string; price: number; change: number }) => {
       setPrices(prev => ({ ...prev, [data.pair]: data }));
    };
    
    // 'ALL' wildcard subscription
    marketStream.subscribe('ALL', handleData);
    
    return () => {
      marketStream.unsubscribe('ALL', handleData);
    };
  }, []);

  // Animation / Cycling logic
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % tickerPairs.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [tickerPairs.length]);

  const currentPair = tickerPairs[currentIndex];
  const currentData = prices[currentPair];
  const isPositive = currentData ? currentData.change >= 0 : true;

  const formatPair = (p: string) => p ? p.replace('_otc', '').replace('_', '/') : '';

  return (
    <div className="w-full bg-[#05070A]/95 backdrop-blur-md border-b border-boss-accent/20 h-10 flex items-center overflow-hidden relative z-50 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
      {/* Label Section */}
      <div className="absolute left-0 top-0 bottom-0 px-4 bg-boss-accent/10 border-r border-boss-accent/20 flex items-center z-20">
        <LightningIcon className="w-3 h-3 text-boss-accent mr-2 animate-pulse" />
        <span className="text-[9px] font-black uppercase tracking-widest text-boss-accent hidden sm:inline">NEURO LIVE</span>
        <span className="text-[9px] font-black uppercase tracking-widest text-boss-accent sm:hidden">LIVE</span>
      </div>
      
      {/* Ticker Display */}
      <div className="flex-1 flex items-center justify-center relative px-20">
        {currentData ? (
           <div key={currentPair} className="flex items-center space-x-2 sm:space-x-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <span className="text-[11px] sm:text-[12px] font-black text-white tracking-tight uppercase font-display">
                {formatPair(currentPair)}
             </span>
             <span className={`text-[11px] sm:text-[12px] font-mono font-bold ${isPositive ? 'text-boss-success' : 'text-boss-danger'}`}>
                {currentData.price.toFixed(5)}
             </span>
             <span className={`text-[9px] font-black px-1.5 py-0.5 rounded flex items-center ${isPositive ? 'bg-boss-success/10 text-boss-success' : 'bg-boss-danger/10 text-boss-danger'}`}>
                {isPositive ? '▲' : '▼'} {Math.abs(currentData.change).toFixed(3)}%
             </span>
           </div>
        ) : (
           <div className="flex items-center space-x-2 animate-pulse opacity-50">
              <span className="text-[10px] font-bold text-slate-500 uppercase">
                Waiting for Tick...
              </span>
           </div>
        )}
      </div>

      {/* Cycling Indicators */}
      <div className="absolute right-0 top-0 bottom-0 px-4 flex items-center pointer-events-none z-20 bg-gradient-to-l from-[#05070A] to-transparent pl-8">
          <div className="flex space-x-1">
             {[0, 1, 2].map((offset) => (
                <div 
                  key={offset}
                  className={`w-1 h-1 rounded-full transition-all duration-300 ${currentIndex % 3 === offset ? 'bg-boss-accent scale-125' : 'bg-slate-700'}`} 
                />
             ))}
          </div>
      </div>
    </div>
  );
};

export default PriceTicker;
