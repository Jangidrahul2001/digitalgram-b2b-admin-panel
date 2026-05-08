import React from 'react';
import { cn } from "@/lib/utils";

const MechanicalToggle = ({ defaultChecked, checked, onChange, className }) => {
  return (
    <label className={cn("relative inline-block w-[60px] h-[28px] cursor-pointer", className)}>
      <input
        type="checkbox"
        defaultChecked={defaultChecked}
        checked={checked}
        onChange={onChange}
        className="sr-only peer"
      />

      {/* 1. Main Slider Container (Clipping Layer) */}
      <div className="absolute inset-0 bg-slate-200 rounded-full transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] border border-black/5 overflow-hidden shadow-[inset_2px_2px_5px_rgba(0,0,0,0.05),inset_-2px_-2px_5px_rgba(255,255,255,0.8)] peer-checked:bg-green-400 peer-checked:shadow-[inset_1px_1px_4px_rgba(0,0,0,0.05)]">
        {/* Glow - Moves based on peer check state of the parent sibling */}
        <div className="absolute left-[-10px] top-[-10px] w-[30px] h-[30px] bg-emerald-500 blur-[12px] opacity-0 transition-all duration-500 peer-checked:opacity-20 peer-checked:left-[30px] peer-checked:duration-700"></div>

        {/* Rail shadow backdrop */}
        <div className="absolute top-1/2 left-[8px] w-[35px] h-[1px] -translate-y-1/2 bg-black/10 shadow-[0_3px_0_rgba(0,0,0,0.03),0_-3px_0_rgba(0,0,0,0.03)] transition-all duration-500"></div>
      </div>

      {/* 2. The Thumb - Sibling of peer for top-level peer selector access */}
      <div className="absolute top-1/2 left-[4px] -translate-y-1/2 w-[20px] h-[20px] bg-white rounded-full border border-black/10 shadow-[1px_1px_4px_rgba(0,0,0,0.1)] transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] flex items-center justify-center z-10 peer-checked:left-[36px] hover:shadow-[2px_3px_8px_rgba(0,0,0,0.15)] active:scale-95">
        {/* Indicator Dot - Inherits peer state implicitly via the parent thumb class if we use group tags, but peer-checked works here too */}
        <div className="w-[4px] h-[4px] rounded-full bg-slate-500 transition-all duration-500 peer-checked:bg-emerald-500 peer-checked:shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
      </div>

      {/* 3. Highlight/Shine Layer for the Thumb */}
      <div className="absolute top-1/2 left-[4px] -translate-y-1/2 w-[20px] h-[20px] rounded-full pointer-events-none z-20 border border-white/80 opacity-50 transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] peer-checked:left-[36px]"></div>
    </label>
  );
};

export default MechanicalToggle;
