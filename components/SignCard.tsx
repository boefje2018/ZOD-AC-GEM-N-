
import React from 'react';
import { SignData } from '../types';

interface SignCardProps {
  sign: SignData;
  onClick: (sign: SignData) => void;
}

const SignCard: React.FC<SignCardProps> = ({ sign, onClick }) => {
  return (
    <button
      onClick={() => onClick(sign)}
      className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 transition-all duration-300 hover:bg-white/10 hover:border-purple-500/50 hover:-translate-y-1 text-left flex flex-col items-center"
    >
      <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">
        {sign.symbol}
      </div>
      <h3 className="text-xl font-cinzel font-bold text-white mb-1">{sign.nameTr}</h3>
      <p className="text-xs text-slate-400 font-medium mb-3">{sign.dateRange}</p>
      <div className="flex flex-wrap justify-center gap-1">
        {sign.traits.map((trait, idx) => (
          <span key={idx} className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">
            {trait}
          </span>
        ))}
      </div>
      <div className="absolute top-3 right-3 text-[10px] text-slate-500 uppercase tracking-tighter">
        {sign.element}
      </div>
    </button>
  );
};

export default SignCard;
