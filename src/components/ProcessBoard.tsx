import React, { useState, useRef, useEffect } from 'react';
import { BPMProcess, ProcessCategory } from '../types';
import { Plus, Sparkles, ChevronDown, Check } from 'lucide-react';
import { EXAMPLES } from '../examples';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import { SimpleCategoryColumn } from './board/SimpleCategoryColumn';
import { CoreCategoryColumn } from './board/CoreCategoryColumn';

interface ProcessBoardProps {
  processes: BPMProcess[];
  coreGroupsOrder: string[];
  isEs: boolean;

  onOpenCreateModal: (presetCategory?: ProcessCategory, presetGroup?: string) => void;
  onOpenDeleteGroupModal: (groupName: string) => void;
  onSetAssigningToGroup: (groupName: string | null) => void;
  onSetDeleteTarget: (proc: BPMProcess | null) => void;

  isAddingGroup: boolean;
  newGroupName: string;
  onSetIsAddingGroup: (val: boolean) => void;
  onSetNewGroupName: (val: string) => void;
  onAddNewGroup: (e: React.FormEvent) => void;

  editingCardId: string | null;
  editName: string;
  onSetEditName: (val: string) => void;
  onStartInlineEdit: (proc: BPMProcess) => void;
  onSaveInlineEdit: (id: string) => void;
  onCancelInlineEdit: () => void;

  onDragEnd: (result: DropResult) => void;
  onLoadExample?: (exampleId: string) => void;
}

export const ProcessBoard: React.FC<ProcessBoardProps> = ({
  processes,
  coreGroupsOrder,
  isEs,

  onOpenCreateModal,
  onOpenDeleteGroupModal,
  onSetAssigningToGroup,
  onSetDeleteTarget,

  isAddingGroup,
  newGroupName,
  onSetIsAddingGroup,
  onSetNewGroupName,
  onAddNewGroup,

  editingCardId,
  editName,
  onSetEditName,
  onStartInlineEdit,
  onSaveInlineEdit,
  onCancelInlineEdit,

  onDragEnd,
  onLoadExample,
}) => {
  const [isExamplesOpen, setIsExamplesOpen] = useState(false);
  const examplesMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (examplesMenuRef.current && !examplesMenuRef.current.contains(e.target as Node)) {
        setIsExamplesOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const mgmtProcesses = processes
    .filter((p) => p.category === 'management')
    .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));

  const coreProcesses = processes
    .filter((p) => p.category === 'core')
    .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));

  const suppProcesses = processes
    .filter((p) => p.category === 'support')
    .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));

  const looseCoreProcesses = coreProcesses.filter((p) => !p.groupName);

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              {isEs ? 'Tablero de Procesos' : 'Process Board'} ({processes.length})
            </h3>
            <p className="text-[11px] text-slate-400">
              {isEs
                ? 'Arrastra cualquier tarjeta para moverla o reordenarla. Haz clic en el lápiz para editar el nombre.'
                : 'Drag any card to move or reorder. Click the pencil icon to edit name.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Dropdown de Ejemplos Simplificado */}
            {onLoadExample && (
              <div className="relative" ref={examplesMenuRef}>
                <button
                  type="button"
                  onClick={() => setIsExamplesOpen(!isExamplesOpen)}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-medium px-3 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
                >
                  <span>{isEs ? 'Ejemplos' : 'Examples'}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {isExamplesOpen && (
                  <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                    {EXAMPLES.map((ex) => (
                      <button
                        key={ex.id}
                        type="button"
                        onClick={() => {
                          onLoadExample(ex.id);
                          setIsExamplesOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <span className="font-medium text-slate-800">{ex.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {ex.processes.length} {isEs ? 'proc.' : 'procs.'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => onOpenCreateModal()}
              className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-md transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              {isEs ? 'Nuevo Proceso' : 'New Process'}
            </button>
          </div>
        </div>

        {/* 3 Columnas Kanban */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* 1. Columna Gestión */}
          <SimpleCategoryColumn
            title={isEs ? 'Procesos de Gestión' : 'Management Processes'}
            category="management"
            processes={mgmtProcesses}
            isEs={isEs}
            editingCardId={editingCardId}
            editName={editName}
            onSetEditName={onSetEditName}
            onStartInlineEdit={onStartInlineEdit}
            onSaveInlineEdit={onSaveInlineEdit}
            onCancelInlineEdit={onCancelInlineEdit}
            onDeleteTarget={onSetDeleteTarget}
            onOpenCreateModal={(cat) => onOpenCreateModal(cat)}
          />

          {/* 2. Columna Clave (Core) */}
          <CoreCategoryColumn
            coreProcesses={coreProcesses}
            looseCoreProcesses={looseCoreProcesses}
            coreGroupsOrder={coreGroupsOrder}
            isEs={isEs}
            isAddingGroup={isAddingGroup}
            newGroupName={newGroupName}
            editingCardId={editingCardId}
            editName={editName}
            onSetIsAddingGroup={onSetIsAddingGroup}
            onSetNewGroupName={onSetNewGroupName}
            onAddNewGroup={onAddNewGroup}
            onOpenCreateModal={(cat, group) => onOpenCreateModal(cat, group)}
            onSetAssigningToGroup={onSetAssigningToGroup}
            onOpenDeleteGroupModal={onOpenDeleteGroupModal}
            onSetEditName={onSetEditName}
            onStartInlineEdit={onStartInlineEdit}
            onSaveInlineEdit={onSaveInlineEdit}
            onCancelInlineEdit={onCancelInlineEdit}
            onDeleteTarget={onSetDeleteTarget}
          />

          {/* 3. Columna Soporte */}
          <SimpleCategoryColumn
            title={isEs ? 'Procesos de Soporte' : 'Support Processes'}
            category="support"
            processes={suppProcesses}
            isEs={isEs}
            editingCardId={editingCardId}
            editName={editName}
            onSetEditName={onSetEditName}
            onStartInlineEdit={onStartInlineEdit}
            onSaveInlineEdit={onSaveInlineEdit}
            onCancelInlineEdit={onCancelInlineEdit}
            onDeleteTarget={onSetDeleteTarget}
            onOpenCreateModal={(cat) => onOpenCreateModal(cat)}
          />
        </div>
      </div>
    </DragDropContext>
  );
};
