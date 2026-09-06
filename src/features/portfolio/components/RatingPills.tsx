import React from 'react';

interface RatingPillsProps {
  label: string;
  value: number;
  lowText: string;
  highText: string;
  allowDecimals?: boolean;
  step?: number;
  onChange: (val: number) => void;
}

export const RatingPills: React.FC<RatingPillsProps> = ({
  label,
  value,
  lowText,
  highText,
  allowDecimals = false,
  step = 0.5,
  onChange,
}) => {
  const displayVal = Number.isInteger(value) ? value.toString() : value.toFixed(step === 0.1 ? 1 : 1);

  return (
    <div className="flex items-center justify-between text-xs gap-1">
      <div className="flex items-center gap-1.5 min-w-[65px]">
        <span
          className="text-[11px] font-medium text-slate-500"
          title={`1: ${lowText} | 5: ${highText}`}
        >
          {label}:
        </span>
        {allowDecimals && (
          <span className="text-[10px] font-mono font-bold text-slate-800 bg-slate-100 px-1 py-0.2 rounded border border-slate-200">
            {displayVal}
          </span>
        )}
      </div>

      {allowDecimals ? (
        <div className="flex items-center gap-1">
          <input
            type="range"
            min="1"
            max="5"
            step={step}
            value={value}
            onChange={(e) => onChange(parseFloat(e.target.value))}
            className="w-24 accent-slate-900 cursor-pointer h-1.5 bg-slate-200 rounded-lg"
            title={`${displayVal} (1: ${lowText} | 5: ${highText})`}
          />
          <input
            type="number"
            min="1"
            max="5"
            step={step}
            value={value}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              if (!isNaN(val)) {
                onChange(Math.max(1, Math.min(5, val)));
              }
            }}
            className="w-11 text-[11px] font-mono font-semibold text-center border border-slate-200 rounded bg-slate-50 px-0.5 py-0.5 outline-none focus:bg-white focus:border-slate-800"
          />
        </div>
      ) : (
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
      )}
    </div>
  );
};
