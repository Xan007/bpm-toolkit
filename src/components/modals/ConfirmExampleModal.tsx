import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ConfirmExampleModalProps {
  isOpen: boolean;
  exampleName: string;
  processCount: number;
  isEs: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const ConfirmExampleModal: React.FC<ConfirmExampleModalProps> = ({
  isOpen,
  exampleName,
  processCount,
  isEs,
  onCancel,
  onConfirm,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-sm w-full p-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-start gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 border border-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
            <AlertCircle className="w-4 h-4 text-slate-700" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {isEs ? 'Cargar Ejemplo' : 'Load Example'}
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              {isEs
                ? `Cargar el ejemplo "${exampleName}" reemplazará los ${processCount} procesos y la configuración actual de tu espacio de trabajo. ¿Deseas continuar?`
                : `Loading the "${exampleName}" example will replace your current ${processCount} processes and workspace configuration. Do you want to continue?`}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
          <button
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium transition-colors cursor-pointer"
          >
            {isEs ? 'Cancelar' : 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className="px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition-colors cursor-pointer shadow-2xs"
          >
            {isEs ? 'Cargar y Reemplazar' : 'Load & Replace'}
          </button>
        </div>
      </div>
    </div>
  );
};
