import React from 'react';
import { BPMProcess } from '../../types';
import { X } from 'lucide-react';

interface AssignProcessModalProps {
  assigningToGroup: string | null;
  coreProcesses: BPMProcess[];
  isEs: boolean;
  onAssignProcessToGroup: (processId: string, groupName: string) => void;
  onClose: () => void;
}

export const AssignProcessModal: React.FC<AssignProcessModalProps> = ({
  assigningToGroup,
  coreProcesses,
  isEs,
  onAssignProcessToGroup,
  onClose,
}) => {
  if (!assigningToGroup) return null;

  const availableProcesses = coreProcesses.filter(p => p.groupName !== assigningToGroup);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {isEs ? `Asignar Proceso a "${assigningToGroup}"` : `Assign Process to "${assigningToGroup}"`}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {isEs
                ? 'Selecciona un proceso existente de la columna Core para moverlo a esta línea.'
                : 'Select an existing Core process to move into this line.'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-3 flex flex-col gap-1.5">
          {availableProcesses.length === 0 ? (
            <div className="text-center py-6 text-xs text-slate-400">
              {isEs
                ? 'No hay otros procesos disponibles en Core para asignar.'
                : 'No other Core processes available to assign.'}
            </div>
          ) : (
            availableProcesses.map(proc => (
              <button
                key={proc.id}
                onClick={() => onAssignProcessToGroup(proc.id, assigningToGroup)}
                className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:border-slate-900 hover:bg-slate-50 text-left transition-all group cursor-pointer"
              >
                <div>
                  <div className="text-xs font-medium text-slate-900">{proc.name}</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    {proc.groupName
                      ? `${isEs ? 'Grupo actual' : 'Current group'}: ${proc.groupName}`
                      : (isEs ? 'Proceso suelto (sin grupo)' : 'Loose process (no group)')}
                  </div>
                </div>
                <span className="text-xs text-slate-900 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  {isEs ? 'Mover aquí →' : 'Move here →'}
                </span>
              </button>
            ))
          )}
        </div>

        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-medium cursor-pointer"
          >
            {isEs ? 'Cerrar' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
