import React from 'react';

interface RatingPillsProps {
  label: string;
  value: number;
  lowText: string;
  highText: string;
  onChange: (val: number) => void;
}

export const RatingPills: React.FC<RatingPillsProps> = ({
  label,
  value,
  lowText,
  highText,
  onChange,
}) => (
  <div className="flex items-center justify-between text-xs gap-1">
    <span
      className="text-[11px] font-medium text-slate-500 min-w-[65px]"
      title={`1: ${lowText} | 5: ${highText}`}
    >
      {label}:
    </span>
    <div
      className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded border border-slate-200/60"
      title={`1 = ${lowText}\n5 = ${highText}`}
    >
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onChange(num)}
          title={num === 1 ? `1: ${lowText}` : num === 5 ? `5: ${highText}` : `${num}`}
          className={`w-5 h-5 rounded text-[10px] font-bold transition-all cursor-pointer ${
            value === num
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          {num}
        </button>
      ))}
    </div>
  </div>
);
