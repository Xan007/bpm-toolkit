import React, { useState } from 'react';
import { BPMProcess, ProcessCategory } from '../../types';
import { X, Plus, Link2, ListPlus } from 'lucide-react';

interface CreateProcessModalProps {
  isOpen: boolean;
  isEs: boolean;
  formName: string;
  formCategory: ProcessCategory;
  formGroup: string;
  availableGroups?: string[];
  allProcesses?: BPMProcess[];
  formHealth?: number;
  formImp?: number;
  formFeas?: number;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onBulkSubmit?: (names: string[]) => void;
  onAssignProcess?: (processId: string, groupName: string) => void;
  onSetFormName: (val: string) => void;
  onSetFormCategory: (cat: ProcessCategory) => void;
  onSetFormGroup: (val: string) => void;
  onSetFormHealth?: (val: number) => void;
  onSetFormImp?: (val: number) => void;
  onSetFormFeas?: (val: number) => void;
}

export const CreateProcessModal: React.FC<CreateProcessModalProps> = ({
  isOpen,
  isEs,
  formName,
  formCategory,
  formGroup,
  availableGroups = [],
  allProcesses = [],
  onClose,
  onSubmit,
  onBulkSubmit,
  onAssignProcess,
  onSetFormName,
  onSetFormCategory,
  onSetFormGroup,
}) => {
  const [tabMode, setTabMode] = useState<'create' | 'assign'>('create');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState('');

  if (!isOpen) return null;

  const isPresetToGroup = !!formGroup && formCategory === 'core';
  const showGroupSelect = formCategory === 'core' && availableGroups.length > 0 && !isPresetToGroup;
  const canAssign = formCategory === 'core' && !!formGroup && onAssignProcess;
  const assignableProcesses = allProcesses.filter(
    (p) => p.category === 'core' && p.groupName !== formGroup
  );

  const parsedBulkProcesses = bulkText
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBulkMode) {
      if (parsedBulkProcesses.length === 0) return;
      if (onBulkSubmit) {
        onBulkSubmit(parsedBulkProcesses);
        setBulkText('');
        setIsBulkMode(false);
      }
    } else {
      onSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {formGroup
                ? (isEs ? `Añadir a "${formGroup}"` : `Add to "${formGroup}"`)
                : (isEs ? 'Añadir Proceso' : 'Add Process')}
            </h3>
            {formGroup && (
              <p className="text-[11px] text-slate-400 mt-0.5">
                {isEs ? 'Crea un nuevo proceso o mueve uno existente a este grupo.' : 'Create a new process or move an existing one here.'}
              </p>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setIsBulkMode(!isBulkMode)}
              className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                isBulkMode
                  ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:text-slate-900'
              }`}
              title={isEs ? 'Crear múltiples procesos desde un texto (un proceso por línea)' : 'Create multiple processes from text (one per line)'}
            >
              <ListPlus className="w-3.5 h-3.5" />
              <span>{isEs ? 'Desde texto' : 'From text'}</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Pestañas de modo (si se abrió desde un grupo específico) */}
        {canAssign && (
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md mb-3 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTabMode('create')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded transition-all cursor-pointer ${
                tabMode === 'create'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{isEs ? 'Crear Nuevo' : 'Create New'}</span>
            </button>
            <button
              type="button"
              onClick={() => setTabMode('assign')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded transition-all cursor-pointer ${
                tabMode === 'assign'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>{isEs ? 'Mover Existente' : 'Move Existing'}</span>
              {assignableProcesses.length > 0 && (
                <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded-full font-mono">
                  {assignableProcesses.length}
                </span>
              )}
            </button>
          </div>
        )}

        {/* MODO ASIGNAR / MOVER EXISTENTE */}
        {canAssign && tabMode === 'assign' ? (
          <div className="flex flex-col gap-2 flex-1 overflow-y-auto min-h-[160px]">
            {assignableProcesses.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                {isEs
                  ? 'No hay otros procesos disponibles en Core para asignar a este grupo.'
                  : 'No other Core processes available to move to this group.'}
              </div>
            ) : (
              <div className="flex flex-col gap-1.5 py-1">
                {assignableProcesses.map((proc) => (
                  <button
                    key={proc.id}
                    type="button"
                    onClick={() => {
                      onAssignProcess(proc.id, formGroup);
                      onClose();
                    }}
                    className="flex items-center justify-between p-2.5 rounded-md border border-slate-200 hover:border-slate-900 hover:bg-slate-50 text-left transition-all group cursor-pointer"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-900">{proc.name}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {proc.groupName
                          ? `${isEs ? 'Grupo actual' : 'Current group'}: ${proc.groupName}`
                          : (isEs ? 'Sin grupo' : 'No group')}
                      </div>
                    </div>
                    <span className="text-xs text-slate-900 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {isEs ? 'Mover aquí' : 'Move here'}
                    </span>
                  </button>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t border-slate-100 mt-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-medium text-xs"
              >
                {isEs ? 'Cancelar' : 'Cancel'}
              </button>
            </div>
          </div>
        ) : (
          /* MODO CREAR NUEVO */
          <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
            {isBulkMode ? (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-slate-600 font-medium">
                    {isEs ? 'Párrafo o Lista de Procesos' : 'Paragraph or Process List'}
                  </label>
                  <span className="text-[10.5px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {parsedBulkProcesses.length} {isEs ? 'detectados' : 'detected'}
                  </span>
                </div>
                <textarea
                  rows={6}
                  value={bulkText}
                  onChange={(e) => setBulkText(e.target.value)}
                  placeholder={
                    isEs
                      ? 'Pega aquí el texto. Cada línea o salto se creará como un proceso:\nRecepción de Solicitudes\nVerificación de Requisitos\nAprobación y Notificación'
                      : 'Paste text here. Each line break will become a process:\nRequest Reception\nRequirements Verification\nApproval and Notification'
                  }
                  autoFocus
                  className="w-full px-2.5 py-2 border border-slate-200 rounded outline-none focus:border-slate-800 text-slate-900 text-xs font-sans leading-relaxed resize-y"
                />
                <p className="text-[10.5px] text-slate-400 mt-1">
                  {isEs
                    ? 'Detecta automáticamente cada salto de línea como un proceso individual.'
                    : 'Automatically detects each line break as an individual process.'}
                </p>
              </div>
            ) : (
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  {isEs ? 'Nombre del Proceso' : 'Process Name'}
                </label>
                <input
                  type="text"
                  required
                  placeholder={isEs ? 'Ej. Entrega de Cursos, Adquisiciones...' : 'e.g. Deliver Courses, Procure Materials...'}
                  value={formName}
                  onChange={(e) => onSetFormName(e.target.value)}
                  autoFocus
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded outline-none focus:border-slate-800 text-slate-900"
                />
              </div>
            )}

            <div className={showGroupSelect ? "grid grid-cols-2 gap-3" : "w-full"}>
              <div>
                <label className="block text-slate-600 font-medium mb-1">
                  {isEs ? 'Tipo de Proceso' : 'Process Type'}
                </label>
                <select
                  value={formCategory}
                  disabled={isPresetToGroup}
                  onChange={(e) => {
                    const newCat = e.target.value as ProcessCategory;
                    onSetFormCategory(newCat);
                    if (newCat !== 'core') {
                      onSetFormGroup('');
                    }
                  }}
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded outline-none cursor-pointer bg-white text-slate-800 disabled:bg-slate-50 disabled:text-slate-500"
                >
                  <option value="management">{isEs ? 'Gestión' : 'Management'}</option>
                  <option value="core">{isEs ? 'Clave' : 'Core'}</option>
                  <option value="support">{isEs ? 'Soporte' : 'Support'}</option>
                </select>
              </div>

              {showGroupSelect && (
                <div>
                  <label className="block text-slate-600 font-medium mb-1">
                    {isEs ? 'Grupo / Cadena' : 'Group / Chain'}
                  </label>
                  <select
                    value={formGroup}
                    onChange={(e) => onSetFormGroup(e.target.value)}
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded outline-none cursor-pointer bg-white text-slate-800"
                  >
                    <option value="">{isEs ? 'Sin grupo' : 'No group'}</option>
                    {availableGroups.map((grp) => (
                      <option key={grp} value={grp}>
                        {grp}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer font-medium"
              >
                {isEs ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                type="submit"
                disabled={isBulkMode && parsedBulkProcesses.length === 0}
                className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium cursor-pointer shadow-2xs disabled:opacity-50"
              >
                {isBulkMode
                  ? (isEs
                      ? parsedBulkProcesses.length > 1
                        ? `Crear ${parsedBulkProcesses.length} Procesos`
                        : 'Crear Proceso'
                      : parsedBulkProcesses.length > 1
                      ? `Create ${parsedBulkProcesses.length} Processes`
                      : 'Create Process')
                  : (isEs ? 'Guardar' : 'Save')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
