import React from 'react';
import { HelpContent } from '../helpDictionary';
import { BookOpen, X } from 'lucide-react';

interface ProfileHelpModalProps {
  helpData: HelpContent | null;
  isEs: boolean;
  onClose: () => void;
}

export const ProfileHelpModal: React.FC<ProfileHelpModalProps> = ({
  helpData,
  isEs,
  onClose,
}) => {
  if (!helpData) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-slate-700" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {helpData.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs text-slate-700 leading-relaxed">
          {/* Concepto Teórico */}
          <div>
            <span className="font-semibold text-slate-900 block mb-1">
              {isEs ? 'Concepto y Fundamento:' : 'Theoretical Concept:'}
            </span>
            <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              {helpData.concept}
            </p>
          </div>

          {/* Directrices y Reglas */}
          <div>
            <span className="font-semibold text-slate-900 block mb-1">
              {isEs ? 'Criterios de Identificación y Diligenciamiento:' : 'Identification & Completion Guidelines:'}
            </span>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
              {helpData.guidelines.map((g, idx) => (
                <li key={idx}>{g}</li>
              ))}
            </ul>
          </div>

          {/* Ejemplo Real del Libro */}
          <div>
            <span className="font-semibold text-slate-900 block mb-1">
              {isEs ? 'Ejemplo de Referencia:' : 'Reference Example:'}
            </span>
            <div className="bg-blue-50/70 border border-blue-100 p-2.5 rounded-lg text-slate-800 font-medium">
              {helpData.example}
            </div>
          </div>
        </div>

        <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
          >
            {isEs ? 'Entendido' : 'Got it'}
          </button>
        </div>
      </div>
    </div>
  );
};
