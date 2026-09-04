import React from 'react';
import { BPMProcess, ProcessCategory } from '../types';
import { ProcessCard } from './ProcessCard';
import { Plus, FolderPlus, Check, X, Link2, Trash2 } from 'lucide-react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';

interface ProcessBoardProps {
  processes: BPMProcess[];
  coreGroupsOrder: string[];
  isEs: boolean;
  
  // Modals & triggers
  onOpenCreateModal: (presetCategory?: ProcessCategory, presetGroup?: string) => void;
  onOpenDeleteGroupModal: (groupName: string) => void;
  onSetAssigningToGroup: (groupName: string | null) => void;
  onSetDeleteTarget: (proc: BPMProcess | null) => void;

  // New group state & handlers
  isAddingGroup: boolean;
  newGroupName: string;
  onSetIsAddingGroup: (val: boolean) => void;
  onSetNewGroupName: (val: string) => void;
  onAddNewGroup: (e: React.FormEvent) => void;

  // Inline editing state & handlers
  editingCardId: string | null;
  editName: string;
  onSetEditName: (val: string) => void;
  onStartInlineEdit: (proc: BPMProcess) => void;
  onSaveInlineEdit: (id: string) => void;
  onCancelInlineEdit: () => void;

  // Drag and drop from @hello-pangea/dnd
  onDragEnd: (result: DropResult) => void;
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
}) => {
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

          <button
            onClick={() => onOpenCreateModal()}
            className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium px-3.5 py-1.5 rounded transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            {isEs ? 'Nuevo Proceso' : 'New Process'}
          </button>
        </div>

        {/* 3 Columnas Kanban */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-start">
          {/* 1. Columna Gestión */}
          <div className="bg-slate-100/70 border border-slate-200 rounded-lg p-3.5 flex flex-col gap-3 min-h-[420px]">
            <div className="flex items-center justify-between px-1">
              <div className="font-semibold text-xs text-slate-900">
                {isEs ? 'Procesos de Gestión' : 'Management Processes'}
                <span className="ml-1.5 text-[11px] font-normal text-slate-500">
                  ({mgmtProcesses.length})
                </span>
              </div>
              <button
                onClick={() => onOpenCreateModal('management')}
                className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                title={isEs ? 'Añadir Proceso de Gestión' : 'Add Management Process'}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <Droppable droppableId="cat:management">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col gap-2 flex-1 rounded-md p-1 transition-colors ${
                    snapshot.isDraggingOver ? 'bg-slate-200/50' : ''
                  }`}
                >
                  {mgmtProcesses.map((proc, idx) => (
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
                      onDelete={onSetDeleteTarget}
                    />
                  ))}
                  {provided.placeholder}

                  {mgmtProcesses.length === 0 && !snapshot.isDraggingOver && (
                    <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded">
                      {isEs ? 'Arrastra o añade un proceso aquí' : 'Drag or add a process here'}
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>

          {/* 2. Columna Clave (Core) */}
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
              {/* Procesos Sueltos */}
              <Droppable droppableId="cat:core-loose">
                {(provided, snapshot) => {
                  const hasLoose = looseCoreProcesses.length > 0;
                  const isDraggingOver = snapshot.isDraggingOver;

                  // Si no hay procesos sueltos y no se está arrastrando sobre ella, no ocupa espacio
                  if (!hasLoose && !isDraggingOver) {
                    return (
                      <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="hidden"
                      >
                        {provided.placeholder}
                      </div>
                    );
                  }

                  return (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`flex flex-col gap-2 rounded-md p-1 mb-1 transition-colors ${
                        isDraggingOver ? 'bg-slate-200/60 min-h-[48px] border-2 border-dashed border-slate-300' : ''
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
                          onDelete={onSetDeleteTarget}
                        />
                      ))}
                      {provided.placeholder}
                    </div>
                  );
                }}
              </Droppable>

              {/* Grupos Core */}
              {coreGroupsOrder.map((groupName) => {
                const procsInGroup = coreProcesses.filter((p) => p.groupName === groupName);

                return (
                  <div
                    key={groupName}
                    className="rounded-md p-2.5 transition-colors border flex flex-col gap-2 bg-slate-200/40 border-slate-200/80"
                  >
                    <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/60 group">
                      <span className="font-semibold text-[11px] text-slate-700 tracking-tight">
                        {groupName}
                      </span>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSetAssigningToGroup(groupName)}
                          className="text-[10px] text-slate-500 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer"
                          title={
                            isEs
                              ? 'Asignar/referenciar proceso existente'
                              : 'Assign existing process'
                          }
                        >
                          <Link2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => onOpenCreateModal('core', groupName)}
                          className="text-[10px] text-slate-500 hover:text-slate-900 flex items-center gap-0.5 cursor-pointer"
                          title={
                            isEs
                              ? 'Crear nuevo proceso en esta línea'
                              : 'Create new process in this line'
                          }
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onOpenDeleteGroupModal(groupName)}
                          className="text-[10px] text-slate-400 hover:text-red-600 flex items-center gap-0.5 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity"
                          title={isEs ? 'Eliminar línea de negocio' : 'Delete business line'}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
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
                              onDelete={onSetDeleteTarget}
                            />
                          ))}
                          {provided.placeholder}

                          {procsInGroup.length === 0 && !snapshot.isDraggingOver && (
                            <div className="text-center py-5 px-3 text-xs text-slate-400 border border-dashed border-slate-300 rounded flex flex-col items-center gap-2 bg-slate-50/50">
                              <span>{isEs ? 'Línea de negocio vacía' : 'Empty business line'}</span>
                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => onSetAssigningToGroup(groupName)}
                                  className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-medium text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                  <Link2 className="w-3 h-3" />
                                  <span>{isEs ? 'Asignar Proceso' : 'Assign Process'}</span>
                                </button>
                                <button
                                  onClick={() => onOpenCreateModal('core', groupName)}
                                  className="px-2 py-1 bg-white border border-slate-200 hover:bg-slate-100 rounded text-[11px] font-medium text-slate-700 flex items-center gap-1 shadow-2xs cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>{isEs ? 'Crear Nuevo' : 'Create New'}</span>
                                </button>
                              </div>
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

          {/* 3. Columna Soporte */}
          <div className="bg-slate-100/70 border border-slate-200 rounded-lg p-3.5 flex flex-col gap-3 min-h-[420px]">
            <div className="flex items-center justify-between px-1">
              <div className="font-semibold text-xs text-slate-900">
                {isEs ? 'Procesos de Soporte' : 'Support Processes'}
                <span className="ml-1.5 text-[11px] font-normal text-slate-500">
                  ({suppProcesses.length})
                </span>
              </div>
              <button
                onClick={() => onOpenCreateModal('support')}
                className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
                title={isEs ? 'Añadir Proceso de Soporte' : 'Add Support Process'}
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>

            <Droppable droppableId="cat:support">
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex flex-col gap-2 flex-1 rounded-md p-1 transition-colors ${
                    snapshot.isDraggingOver ? 'bg-slate-200/50' : ''
                  }`}
                >
                  {suppProcesses.map((proc, idx) => (
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
                      onDelete={onSetDeleteTarget}
                    />
                  ))}
                  {provided.placeholder}

                  {suppProcesses.length === 0 && !snapshot.isDraggingOver && (
                    <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded">
                      {isEs ? 'Arrastra o añade un proceso aquí' : 'Drag or add a process here'}
                    </div>
                  )}
                </div>
              )}
            </Droppable>
          </div>
        </div>
      </div>
    </DragDropContext>
  );
};
