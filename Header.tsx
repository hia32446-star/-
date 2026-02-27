
import React, { useEffect, useState } from 'react';
import { UserIcon, LightningIcon, ClockIcon, GlobeIcon } from './Icons';
import { formatTime } from '../utils/helpers';

interface HeaderProps {
  keyStatus: string;
  onManageKey: () => void;
}

const Header: React.FC<HeaderProps> = ({ keyStatus, onManageKey }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex flex-col items-center space-y-4 pt-4">
      <div className="relative text-center w-full">
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-48 bg-boss-accent/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <div className="inline-block px-4 py-1 mb-2 border border-boss-accent/30 rounded-full bg-boss-accent/5">
           <span className="text-[10px] font-black tracking-[0.3em] text-boss-accent uppercase">Command Center V2.5</span>
        </div>
        
        <h1 className="font-display text-4xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          𝗡𝗲𝘂𝗿𝗼<span className="text-boss-accent italic">𝗧𝗿𝗮𝗱𝗲𝗫</span>
        </h1>
        
        <div className="flex items-center justify-center space-x-2 mt-2">
           <div className="h-[1px] w-8 bg-boss-accent/50"></div>
           <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest italic">
             Elite High-Frequency Trading Architecture
           </p>
           <div className="h-[1px] w-8 bg-boss-accent/50"></div>
        </div>
      </div>

      <div className="w-full grid grid-cols-2 gap-2 px-2 mt-4">
        {/* Connection HUD */}
        <div 
          className="hud-border bg-boss-card/40 p-2 flex items-center space-x-3 transition-all"
        >
          <div className="w-8 h-8 rounded bg-boss-accent/10 flex items-center justify-center border border-boss-accent/20">
            <GlobeIcon className="w-4 h-4 text-boss-accent" />
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">System Link</span>
            <span className="text-[10px] font-black text-boss-accent">ONLINE</span>
          </div>
        </div>

        {/* Status HUD */}
        <div className="hud-border bg-boss-card/40 p-2 flex items-center space-x-3">
          <div className="w-8 h-8 rounded bg-boss-success/10 flex items-center justify-center border border-boss-success/20">
            <div className="w-1.5 h-1.5 rounded-full bg-boss-success animate-ping"></div>
          </div>
          <div className="flex flex-col">
            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-tighter">Signal Core</span>
            <span className="text-[10px] font-black text-boss-success">ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Clock HUD */}
      <div className="w-full px-2">
         <div className="hud-border bg-boss-card/80 p-2 flex items-center justify-between">
            <div className="flex items-center space-x-2">
               <ClockIcon className="w-3 h-3 text-slate-500" />
               <span className="text-[10px] text-slate-400 font-bold">TERMINAL TIME</span>
            </div>
            <span className="text-sm font-black text-boss-accent font-mono tracking-wider">
               {formatTime(currentTime)} <span className="text-[10px] opacity-50">UTC+6</span>
            </span>
         </div>
      </div>
    </div>
  );
};

export default Header;
