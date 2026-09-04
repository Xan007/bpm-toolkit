import React from 'react';
import { BPMProcess } from '../../types';
import { AlertTriangle } from 'lucide-react';

interface DeleteProcessModalProps {
  target: BPMProcess | null;
  isEs: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteProcessModal: React.FC<DeleteProcessModalProps> = ({
  target,
  isEs,
  onCancel,
  onConfirm,
}) => {
  if (!target) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {isEs ? 'Confirmar Eliminación' : 'Confirm Delete'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEs
                ? `¿Deseas eliminar el proceso "${target.name}"?`
                : `Are you sure you want to delete "${target.name}"?`}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 mt-4">
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
          >
            {isEs ? 'Cancelar' : 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            className="px-3 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium cursor-pointer"
          >
            {isEs ? 'Eliminar Proceso' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};
