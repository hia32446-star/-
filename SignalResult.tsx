
import React, { useState } from 'react';
import { SignalResult as SignalResultType } from '../types';
import { ClockIcon, ChartIcon, LightningIcon, CopyIcon, GlobeIcon, CheckIcon } from './Icons';

interface SignalResultProps {
  result: SignalResultType;
  onClose: () => void;
}

const SignalResult: React.FC<SignalResultProps> = ({ result, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const isCall = result.direction === 'CALL';
  const isLive = result.dataSource === 'LIVE';

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFormat = (type: 'standard' | 'pro' | 'compact') => {
    const dirEmoji = isCall ? '🔼' : '🔽';
    const trend = result.analysisValues?.TREND?.replace('M5:', '') || 'NEUTRAL';
    
    switch (type) {
      case 'pro':
        return `╔══════════════════╗\n          💠 𝗡𝗲𝘂𝗿𝗼𝗧𝗿𝗮𝗱𝗲𝗫 💠\n╚══════════════════╝\n📊 𝗣𝗔𝗜𝗥   ➜ ${result.pair}\n⏰ 𝗧𝗜𝗠𝗘   ➜ ${result.timestamp}\n⌛ 𝗘𝗫𝗣    ➜ 1 MIN\n══════════════════\n🎯 𝗦𝗜𝗚𝗡𝗔𝗟 ➜ ${result.direction} ${dirEmoji}\n📈 𝗧𝗥𝗘𝗡𝗗  ➜ ${trend}\n🧠 𝗔𝗖𝗖    ➜ ${result.confidence}%\n══════════════════\n⚡ 𝗘𝗡𝗧𝗥𝗬  ➜ ${result.entryTime}\n🔥 𝗦𝗧𝗔𝗧𝗨𝗦 ➜ WAIT ENTRY`;
      case 'compact':
        return `NEURO [${result.protocol}]: ${result.pair} | ${result.direction} @ ${result.entryTime}`;
      default:
        return `${result.pair} | ${result.direction} | M1 | ${result.entryTime} | 𝗡𝗲𝘂𝗿𝗼𝗧𝗿𝗮𝗱𝗲𝗫`;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-boss-bg/95 backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300">
      <div className="w-full max-w-sm hud-border bg-boss-card rounded-3xl p-0 shadow-[0_0_50px_rgba(0,243,255,0.1)] overflow-hidden">
        <div className="p-6 relative">
            <div className="flex justify-between items-start mb-6 border-b border-boss-accent/20 pb-4">
                 <div>
                    <h2 className="font-display text-2xl font-black text-white italic tracking-tighter">NEURO SIGNAL</h2>
                    <div className="flex items-center space-x-2 mt-1">
                        <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center space-x-1 ${
                            result.protocol === 'ELITE' ? 'bg-boss-accent/20 text-boss-accent border border-boss-accent/30' : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                            <LightningIcon className="w-2 h-2" />
                            <span>{result.protocol} PROTOCOL</span>
                        </div>
                    </div>
                 </div>
                 <div className="text-right">
                    <p className="text-[8px] text-slate-500 font-black uppercase tracking-widest">PROBABILITY</p>
                    <p className="text-2xl font-black text-boss-accent font-mono leading-none">{result.confidence}%</p>
                 </div>
            </div>

            <div className="space-y-4">
                <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl">
                   <div className="flex justify-between items-center mb-1">
                       <p className="text-[8px] font-black text-boss-accent uppercase tracking-widest">Neuro Analysis Log:</p>
                       {result.analysisValues?.STRATEGY && (
                           <span className="text-[8px] font-black text-white bg-white/10 px-1.5 py-0.5 rounded uppercase">{result.analysisValues.STRATEGY} MODE</span>
                       )}
                   </div>
                   <p className="text-[10px] text-slate-300 italic leading-relaxed">
                      "{result.analysisValues?.REASON || 'Signal generated with high confluence across neural indicators.'}"
                   </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-800/20 rounded-xl p-3 border border-white/5">
                        <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Asset Pair</p>
                        <p className="text-sm font-black text-white">{result.pair}</p>
                    </div>
                    <div className="bg-slate-800/20 rounded-xl p-3 border border-white/5">
                        <p className="text-[8px] text-slate-500 font-bold uppercase mb-1">Entry (M1)</p>
                        <p className="text-sm font-black text-white font-mono">{result.entryTime}</p>
                    </div>
                </div>

                 <div className={`rounded-2xl p-6 flex flex-col items-center justify-center border-2 transition-all duration-700 ${
                     isCall 
                     ? 'bg-boss-success/5 border-boss-success shadow-[0_0_30px_rgba(0,255,65,0.2)]' 
                     : 'bg-boss-danger/5 border-boss-danger shadow-[0_0_30px_rgba(255,0,60,0.2)]'
                 }`}>
                     <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${isCall ? 'bg-boss-success shadow-[0_0_20px_#00FF41]' : 'bg-boss-danger shadow-[0_0_20px_#FF003C]'}`}>
                        {isCall ? (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                        ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 text-black" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                        )}
                     </div>
                     <p className={`text-4xl font-black italic tracking-tighter ${isCall ? 'text-boss-success' : 'text-boss-danger'}`}>
                        {result.direction}
                     </p>
                 </div>
            </div>

            <div className="mt-8 space-y-3">
                <button 
                  onClick={() => copyToClipboard(getFormat('pro'), 'btn-pro')}
                  className={`w-full py-4 relative group overflow-hidden bg-boss-accent text-black rounded-xl font-black uppercase text-xs tracking-widest hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center space-x-2 shadow-[0_0_15px_rgba(0,243,255,0.4)]`}
                >
                    {copiedId === 'btn-pro' ? <CheckIcon className="w-5 h-5" /> : <LightningIcon className="w-5 h-5" />}
                    <span>{copiedId === 'btn-pro' ? 'COPIED TO TERMINAL' : 'ELITE NEURO FORMAT'}</span>
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => copyToClipboard(getFormat('standard'), 'btn-std')}
                      className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                        {copiedId === 'btn-std' ? 'COPIED' : 'STANDARD'}
                    </button>
                    <button 
                      onClick={() => copyToClipboard(getFormat('compact'), 'btn-comp')}
                      className="py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                    >
                        {copiedId === 'btn-comp' ? 'COPIED' : 'COMPACT'}
                    </button>
                </div>
                
                <button onClick={onClose} className="w-full pt-4 text-[9px] font-black text-slate-600 hover:text-white transition-colors uppercase tracking-[0.3em]">
                    Return to Commander
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SignalResult;
