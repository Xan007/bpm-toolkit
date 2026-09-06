import React, { useState } from 'react';
import { BPMProcess } from '../../types';
import { ProcessCard } from '../ProcessCard';
import { Plus, FolderPlus, Check, X, Trash2, Edit2 } from 'lucide-react';
import { Droppable } from '@hello-pangea/dnd';

interface CoreCategoryColumnProps {
  coreProcesses: BPMProcess[];
  looseCoreProcesses: BPMProcess[];
  coreGroupsOrder: string[];
  isEs: boolean;
  isAddingGroup: boolean;
  newGroupName: string;
  editingCardId: string | null;
  editName: string;
  isDraggingAny?: boolean;
  onSetIsAddingGroup: (val: boolean) => void;
  onSetNewGroupName: (val: string) => void;
  onAddNewGroup: (e: React.FormEvent) => void;
  onRenameGroup?: (oldName: string, newName: string) => void;
  onOpenCreateModal: (cat: 'core', groupName?: string) => void;
  onOpenDeleteGroupModal: (groupName: string) => void;
  onSetEditName: (val: string) => void;
  onStartInlineEdit: (proc: BPMProcess) => void;
  onSaveInlineEdit: (id: string) => void;
  onCancelInlineEdit: () => void;
  onDeleteTarget: (proc: BPMProcess | null) => void;
}

export const CoreCategoryColumn: React.FC<CoreCategoryColumnProps> = ({
  coreProcesses,
  looseCoreProcesses,
  coreGroupsOrder,
  isEs,
  isAddingGroup,
  newGroupName,
  editingCardId,
  editName,
  isDraggingAny = false,
  onSetIsAddingGroup,
  onSetNewGroupName,
  onAddNewGroup,
  onRenameGroup,
  onOpenCreateModal,
  onOpenDeleteGroupModal,
  onSetEditName,
  onStartInlineEdit,
  onSaveInlineEdit,
  onCancelInlineEdit,
  onDeleteTarget,
}) => {
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupNameVal, setEditGroupNameVal] = useState<string>('');

  const handleStartRename = (groupName: string) => {
    setEditingGroupId(groupName);
    setEditGroupNameVal(groupName);
  };

  const handleSaveRename = (oldName: string) => {
    if (onRenameGroup && editGroupNameVal.trim() && editGroupNameVal.trim() !== oldName) {
      onRenameGroup(oldName, editGroupNameVal.trim());
    }
    setEditingGroupId(null);
  };

  const handleCancelRename = () => {
    setEditingGroupId(null);
  };

  const hasGroups = coreGroupsOrder.length > 0;
  const hasLoose = looseCoreProcesses.length > 0;

  return (
    <div className="bg-slate-100/70 border border-slate-200 rounded-lg p-3.5 flex flex-col gap-3 min-h-[420px]">
      <div className="flex items-center justify-between px-1">
        <div className="font-semibold text-xs text-slate-900">
          {isEs ? 'Procesos Clave' : 'Core Processes'}
          <span className="ml-1.5 text-[11px] font-normal text-slate-500">
            ({coreProcesses.length})
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onSetIsAddingGroup(true)}
            className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer flex items-center gap-1 text-[11px] font-medium"
            title={isEs ? 'Añadir subgrupo o cadena' : 'Add group or chain'}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>{isEs ? 'Grupo' : 'Group'}</span>
          </button>
          <button
            onClick={() => onOpenCreateModal('core')}
            className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
            title={isEs ? 'Añadir Proceso Clave' : 'Add Core Process'}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Formulario rápido para crear subgrupo */}
      {isAddingGroup && (
        <form
          onSubmit={onAddNewGroup}
          className="bg-white p-2 border border-slate-300 rounded flex items-center gap-1.5 text-xs shadow-2xs"
        >
          <input
            type="text"
            placeholder={isEs ? 'Nombre del nuevo grupo...' : 'New group name...'}
            value={newGroupName}
            onChange={(e) => onSetNewGroupName(e.target.value)}
            autoFocus
            className="flex-1 px-2 py-1 border border-slate-200 rounded outline-none"
          />
          <button type="submit" className="p-1 bg-slate-900 text-white rounded cursor-pointer">
            <Check className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onSetIsAddingGroup(false)}
            className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </form>
      )}

      {/* Subgrupos y Procesos Sueltos */}
      <div className="flex flex-col gap-3 flex-1">
        {/* CASO 1: NO HAY GRUPOS CREADOS (comportamiento idéntico a Gestión / Soporte) */}
        {!hasGroups && (
          <Droppable droppableId="cat:core-loose">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex flex-col gap-2 flex-1 rounded-md p-1 transition-colors ${
                  snapshot.isDraggingOver ? 'bg-slate-200/50' : ''
                }`}
              >
                {looseCoreProcesses.map((proc, idx) => (
                  <ProcessCard
                    key={proc.id}
                    proc={proc}
                    index={idx}
                    isEs={isEs}
                    editingCardId={editingCardId}
                    editName={editName}
                    onSetEditName={onSetEditName}
                    onStartInlineEdit={onStartInlineEdit}
                    onSaveInlineEdit={onSaveInlineEdit}
                    onCancelInlineEdit={onCancelInlineEdit}
                    onDelete={onDeleteTarget}
                  />
                ))}
                {provided.placeholder}

                {looseCoreProcesses.length === 0 && !snapshot.isDraggingOver && (
                  <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded">
                    {isEs ? 'Arrastra o añade un proceso aquí' : 'Drag or add a process here'}
                  </div>
                )}
              </div>
            )}
          </Droppable>
        )}

        {/* CASO 2: SÍ HAY GRUPOS CREADOS */}
        {hasGroups && (
          <Droppable droppableId="cat:core-loose">
            {(provided, snapshot) => {
              const isDraggingOver = snapshot.isDraggingOver;

              // Si NO hay procesos sueltos y el usuario NO está arrastrando nada, colapsar completamente a 0
              if (!hasLoose && !isDraggingAny) {
                return (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="h-0 min-h-0 p-0 m-0 overflow-hidden border-0"
                  >
                    {provided.placeholder}
                  </div>
                );
              }

              return (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col gap-2 rounded-md transition-all duration-150 ${
                    hasLoose
                      ? `p-1 ${isDraggingOver ? 'bg-slate-200/60 ring-1 ring-slate-400' : ''}`
                      : `p-2.5 border-2 border-dashed ${
                          isDraggingOver
                            ? 'bg-slate-300/80 border-slate-600 ring-2 ring-slate-900/10 shadow-inner'
                            : 'bg-slate-200/40 border-slate-300 text-slate-500'
                        } min-h-[48px] flex items-center justify-center`
                  }`}
                >
                  {!hasLoose && (
                    <span className="text-[11px] font-medium text-slate-600 select-none">
                      {isEs ? 'Soltar aquí para dejar sin grupo' : 'Drop here to ungroup'}
                    </span>
                  )}

                  {looseCoreProcesses.map((proc, idx) => (
                    <ProcessCard
                      key={proc.id}
                      proc={proc}
                      index={idx}
                      isEs={isEs}
                      editingCardId={editingCardId}
                      editName={editName}
                      onSetEditName={onSetEditName}
                      onStartInlineEdit={onStartInlineEdit}
                      onSaveInlineEdit={onSaveInlineEdit}
                      onCancelInlineEdit={onCancelInlineEdit}
                      onDelete={onDeleteTarget}
                    />
                  ))}
                  {provided.placeholder}
                </div>
              );
            }}
          </Droppable>
        )}

        {/* Grupos Core */}
        {coreGroupsOrder.map((groupName) => {
          const procsInGroup = coreProcesses.filter((p) => p.groupName === groupName);
          const isRenaming = editingGroupId === groupName;

          return (
            <div
              key={groupName}
              className="rounded-md p-2.5 transition-colors border flex flex-col gap-2 bg-slate-200/40 border-slate-200/80"
            >
              <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60">
                {isRenaming ? (
                  <div className="flex items-center gap-1.5 flex-1 mr-2">
                    <input
                      type="text"
                      value={editGroupNameVal}
                      onChange={(e) => setEditGroupNameVal(e.target.value)}
                      placeholder={isEs ? 'Nombre del grupo' : 'Group name'}
                      autoFocus
                      className="flex-1 px-1.5 py-0.5 border border-slate-300 rounded font-semibold text-[11px] text-slate-800 bg-white outline-none focus:border-slate-800"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveRename(groupName);
                        if (e.key === 'Escape') handleCancelRename();
                      }}
                    />
                    <button
                      onClick={() => handleSaveRename(groupName)}
                      className="p-1 bg-slate-900 text-white rounded cursor-pointer hover:bg-slate-800"
                      title={isEs ? 'Guardar' : 'Save'}
                    >
                      <Check className="w-3 h-3" />
                    </button>
                    <button
                      onClick={handleCancelRename}
                      className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
                      title={isEs ? 'Cancelar' : 'Cancel'}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <span
                    onDoubleClick={() => handleStartRename(groupName)}
                    className="font-semibold text-[11px] text-slate-700 tracking-tight cursor-default"
                    title={isEs ? 'Doble clic para editar' : 'Double click to edit'}
                  >
                    {groupName}
                  </span>
                )}

                {!isRenaming && (
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartRename(groupName)}
                      className="p-0.5 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                      title={isEs ? 'Editar nombre del grupo' : 'Edit group name'}
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => onOpenCreateModal('core', groupName)}
                      className="p-0.5 text-slate-400 hover:text-slate-700 rounded transition-colors cursor-pointer"
                      title={
                        isEs
                          ? 'Añadir proceso (crear o mover existente)'
                          : 'Add process (create or move existing)'
                      }
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onOpenDeleteGroupModal(groupName)}
                      className="p-0.5 text-slate-400 hover:text-red-600 rounded transition-colors cursor-pointer"
                      title={isEs ? 'Eliminar grupo' : 'Delete group'}
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              <Droppable droppableId={`core:group:${groupName}`}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex flex-col gap-2 min-h-[32px] rounded p-1 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-slate-300/40' : ''
                    }`}
                  >
                    {procsInGroup.map((proc, idx) => (
                      <ProcessCard
                        key={proc.id}
                        proc={proc}
                        index={idx}
                        isEs={isEs}
                        editingCardId={editingCardId}
                        editName={editName}
                        onSetEditName={onSetEditName}
                        onStartInlineEdit={onStartInlineEdit}
                        onSaveInlineEdit={onSaveInlineEdit}
                        onCancelInlineEdit={onCancelInlineEdit}
                        onDelete={onDeleteTarget}
                      />
                    ))}
                    {provided.placeholder}

                    {procsInGroup.length === 0 && !snapshot.isDraggingOver && (
                      <div className="text-center py-5 px-3 text-xs text-slate-400 border border-dashed border-slate-300 rounded flex flex-col items-center gap-2 bg-slate-50/50">
                        <span>{isEs ? 'Línea de negocio vacía' : 'Empty business line'}</span>
                        <button
                          onClick={() => onOpenCreateModal('core', groupName)}
                          className="px-2.5 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-medium text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>{isEs ? 'Añadir Proceso' : 'Add Process'}</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Droppable>
            </div>
          );
        })}
      </div>
    </div>
  );
};
