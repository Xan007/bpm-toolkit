import React from 'react';
import { EXAMPLES } from '../examples';

interface LoadExampleSectionProps {
  onLoadExample: (exampleId: string) => void;
  isEs: boolean;
}

export const LoadExampleSection: React.FC<LoadExampleSectionProps> = ({
  onLoadExample,
  isEs,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-2xs flex flex-col justify-center">
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
        <h3 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
          {isEs ? 'Plantillas Rápidas' : 'Quick Templates'}
        </h3>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-2 gap-1.5">
        {EXAMPLES.map((ex) => (
          <button
            key={ex.id}
            onClick={() => onLoadExample(ex.id)}
            className="flex items-center justify-between px-2.5 py-1.5 bg-slate-50/70 hover:bg-slate-900 hover:text-white border border-slate-200/80 hover:border-slate-900 rounded transition-all duration-150 cursor-pointer text-left group"
            title={`${ex.name} - ${ex.company.industry}`}
          >
            <span className="text-[11.5px] font-medium text-slate-800 group-hover:text-white truncate">
              {ex.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

