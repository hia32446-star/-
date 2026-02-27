import React from 'react';
import { LightningIcon } from './Icons';

interface GeneratorControlProps {
  onGenerate: () => void;
  disabled: boolean;
  pairCount: number;
}

const GeneratorControl: React.FC<GeneratorControlProps> = ({ onGenerate, disabled, pairCount }) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-20">
        {/* Gradient fade at top of sticky footer */}
        <div className="h-12 bg-gradient-to-b from-transparent to-[#0B0E14] pointer-events-none" />
        
        <div className="bg-[#0B0E14] px-4 pb-6 pt-2">
            <div className="glass-panel rounded-2xl p-5 border border-slate-700 shadow-[0_-5px_20px_rgba(0,0,0,0.5)]">
                <button
                    onClick={onGenerate}
                    disabled={disabled || pairCount === 0}
                    className={`w-full group relative overflow-hidden py-4 rounded-xl flex items-center justify-center space-x-2 transition-all duration-300 ${
                        disabled || pairCount === 0
                        ? 'bg-slate-800 cursor-not-allowed opacity-50'
                        : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] hover:bg-[100%_0] animate-gradient shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] active:scale-[0.98]'
                    }`}
                >
                    <LightningIcon className={`w-6 h-6 ${disabled ? 'text-slate-500' : 'text-white animate-pulse'}`} />
                    <span className={`text-lg font-bold uppercase tracking-wider ${disabled ? 'text-slate-500' : 'text-white'}`}>
                        {pairCount === 0 ? 'Select Pairs' : 'Generate Signal'}
                    </span>
                    
                    {/* Shine effect */}
                    {!disabled && (
                         <div className="absolute inset-0 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                    )}
                </button>

                <div className="flex justify-between items-center mt-4 px-2">
                    <div className="flex items-center space-x-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">System Active</span>
                    </div>
                    
                    <div className="flex items-center space-x-1.5">
                         <span className="text-[10px] font-bold text-slate-500">UTC+6 Timezone</span>
                    </div>

                    <div className="flex items-center space-x-2">
                        <input type="checkbox" defaultChecked className="w-4 h-4 rounded border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-slate-800" />
                        <span className="text-[10px] font-bold text-slate-300">M1 Expiry</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-center space-x-6 mt-4 pb-2">
                <a href="#" className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">Documentation</a>
                <a href="#" className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">Support</a>
                <a href="#" className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors">Telegram</a>
            </div>
        </div>
    </div>
  );
};

export default GeneratorControl;