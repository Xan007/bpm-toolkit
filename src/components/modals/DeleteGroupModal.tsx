import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface DeleteGroupModalProps {
  groupName: string | null;
  isEs: boolean;
  onDeleteAll: () => void;
  onDeleteGroupOnly: () => void;
  onCancel: () => void;
}

export const DeleteGroupModal: React.FC<DeleteGroupModalProps> = ({
  groupName,
  isEs,
  onDeleteAll,
  onDeleteGroupOnly,
  onCancel,
}) => {
  if (!groupName) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-sm w-full p-5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {isEs ? 'Eliminar Grupo' : 'Delete Group'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEs
                ? `Vas a eliminar el grupo "${groupName}". ¿Qué deseas hacer con sus procesos?`
                : `You are deleting the group "${groupName}". What should happen to its processes?`}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 mt-4">
          <button
            onClick={onDeleteAll}
            className="w-full px-3 py-2 rounded bg-red-600 hover:bg-red-700 text-white text-xs font-medium cursor-pointer text-left"
          >
            {isEs ? 'Eliminar grupo y todos sus procesos' : 'Delete group and all its processes'}
          </button>
          <button
            onClick={onDeleteGroupOnly}
            className="w-full px-3 py-2 rounded border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-medium cursor-pointer text-left"
          >
            {isEs ? 'Eliminar grupo y mantener procesos sueltos' : 'Delete group but keep processes (ungrouped)'}
          </button>
          <button
            onClick={onCancel}
            className="w-full mt-2 px-3 py-1.5 rounded text-slate-500 hover:bg-slate-100 text-xs font-medium cursor-pointer text-center"
          >
            {isEs ? 'Cancelar' : 'Cancel'}
          </button>
        </div>
      </div>
    </div>
  );
};
