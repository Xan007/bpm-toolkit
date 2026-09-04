import React from 'react';
import { EXAMPLES } from '../examples';
import { Sparkles, ArrowRight } from 'lucide-react';

interface LoadExampleSectionProps {
  onLoadExample: (exampleId: string) => void;
  isEs: boolean;
}

export const LoadExampleSection: React.FC<LoadExampleSectionProps> = ({
  onLoadExample,
  isEs,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-2 pb-3 mb-3 border-b border-slate-100">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {isEs ? 'Cargar Plantilla' : 'Load Template'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isEs ? 'Ejemplos de referencia predefinidos.' : 'Ready-to-use reference examples.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-1.5">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              onClick={() => onLoadExample(ex.id)}
              className="group flex items-center justify-between px-3 py-2 bg-slate-50/70 hover:bg-slate-900 hover:text-white border border-slate-200/80 hover:border-slate-900 rounded-lg transition-all duration-150 cursor-pointer text-left"
            >
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-slate-800 group-hover:text-white transition-colors">
                  {ex.name}
                </span>
                <span className="text-[10.5px] text-slate-400 group-hover:text-slate-300 line-clamp-1 transition-colors">
                  {ex.company.industry}
                </span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-white group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
