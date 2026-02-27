
import React, { useEffect, useState } from 'react';
import { ANALYSIS_STEPS } from '../constants';
import { AnalysisState } from '../types';
import { CheckIcon, LightningIcon, GlobeIcon } from './Icons';
import { getRandomValue } from '../utils/helpers';

interface AnalysisModalProps {
  onComplete: () => void;
  realTimeValues?: Record<string, string>;
  currentPair?: string;
  progress?: number;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ 
  onComplete, 
  realTimeValues, 
  currentPair, 
  progress = 0 
}) => {
  const [state, setState] = useState<AnalysisState>({
    currentStepIndex: 0,
    completedSteps: [],
    values: {}
  });

  useEffect(() => {
    let step = 0;
    const processSteps = () => {
      if (step >= ANALYSIS_STEPS.length) {
        if (progress >= 100) {
            onComplete();
        }
        return;
      }
      
      const currentStep = ANALYSIS_STEPS[step];
      setState(prev => ({
        ...prev,
        currentStepIndex: step,
        completedSteps: [...prev.completedSteps, currentStep.id],
        values: {
          ...prev.values,
          [currentStep.id]: realTimeValues?.[currentStep.type || ''] || getRandomValue(currentStep.type || '')
        }
      }));
      step++;
      setTimeout(processSteps, currentStep.duration);
    };

    const timer = setTimeout(processSteps, 100);
    return () => clearTimeout(timer);
  }, [realTimeValues, onComplete, progress]);

  const isAiValidating = progress > 80 && progress < 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-[#0B0E14] rounded-3xl p-6 shadow-2xl border border-indigo-500/30 relative overflow-hidden">
        {/* Cyberpunk Grid Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:20px_20px]"></div>

        <div className="flex flex-col items-center mb-6 relative z-10">
          <div className="relative w-24 h-24 mb-4 flex items-center justify-center">
            <div className="absolute inset-0 border-[1px] border-indigo-500/20 rounded-full"></div>
            <div className={`absolute inset-0 border-t-2 border-indigo-500 rounded-full animate-spin ${isAiValidating ? 'duration-500' : 'duration-1000'}`}></div>
            <div className="absolute inset-4 border-[1px] border-purple-500/20 rounded-full"></div>
            <div className="absolute inset-4 border-b-2 border-purple-500 rounded-full animate-spin-slow"></div>
            
            <LightningIcon className={`w-10 h-10 text-indigo-400 ${isAiValidating ? 'animate-bounce' : 'animate-pulse'}`} />
          </div>
          
          <h2 className="text-xl font-black text-white mb-1 italic tracking-tighter uppercase">
            {isAiValidating ? 'AI Deep Validation' : 'Elite Signal Engine'}
          </h2>
          <div className="flex items-center space-x-2 text-indigo-400/80 font-mono text-[10px] font-black uppercase tracking-widest bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
            <span className={`w-2 h-2 rounded-full animate-ping ${isAiValidating ? 'bg-neuro-accent' : 'bg-indigo-500'}`}></span>
            <span className="truncate max-w-[180px]">{currentPair || 'SYNCING...'}</span>
          </div>
        </div>

        <div className="space-y-2.5 relative z-10">
            {ANALYSIS_STEPS.map((step, index) => {
                const isActive = index === state.currentStepIndex;
                const isCompleted = state.completedSteps.includes(step.id);
                const value = realTimeValues?.[step.type || ''] || state.values[step.id];

                return (
                    <div 
                        key={step.id} 
                        className={`flex items-center justify-between p-3 rounded-xl border transition-all duration-150 ${
                            isActive 
                            ? 'bg-indigo-500/10 border-indigo-500/50 scale-[1.02]' 
                            : isCompleted 
                                ? 'bg-emerald-500/5 border-emerald-500/10 opacity-70' 
                                : 'bg-slate-800/10 border-transparent opacity-30'
                        }`}
                    >
                        <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center border-2 ${
                                isCompleted ? 'bg-emerald-500 border-emerald-500' : 
                                isActive ? 'border-indigo-500' : 'border-slate-700'
                            }`}>
                                {isCompleted && <CheckIcon className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-tight ${isCompleted ? 'text-emerald-400' : isActive ? 'text-indigo-300' : 'text-slate-600'}`}>
                                {step.label}
                            </span>
                        </div>
                        {value && (
                            <span className="text-[10px] font-black font-mono text-indigo-400 bg-indigo-500/5 px-2 py-0.5 rounded border border-indigo-500/10">
                                {value}
                            </span>
                        )}
                    </div>
                );
            })}
        </div>

        {/* Neural Map Progress Bar */}
        <div className="mt-8 space-y-1.5">
            <div className="flex justify-between items-center text-[9px] font-black text-indigo-400 uppercase tracking-widest">
                <span>{isAiValidating ? 'Bypassing Rate Limits' : 'Confluence Loading'}</span>
                <span>{Math.round(progress)}%</span>
            </div>
            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                <div 
                    className={`h-full transition-all duration-300 ease-linear shadow-[0_0_10px_rgba(99,102,241,0.5)] ${isAiValidating ? 'bg-gradient-to-r from-neuro-accent to-neuro-success animate-pulse' : 'bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500'}`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
        
        {isAiValidating && (
          <div className="mt-4 text-center">
             <p className="text-[8px] text-neuro-accent font-black animate-pulse tracking-tighter uppercase">
               Optimizing Neural Bandwidth... Please hold for Prime Entry.
             </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisModal;
