import React from 'react';
import { BPMProcess } from '../../types';
import { ProcessCard } from '../ProcessCard';
import { Plus } from 'lucide-react';
import { Droppable } from '@hello-pangea/dnd';

interface SimpleCategoryColumnProps {
  title: string;
  category: 'management' | 'support';
  processes: BPMProcess[];
  isEs: boolean;
  editingCardId: string | null;
  editName: string;
  onSetEditName: (val: string) => void;
  onStartInlineEdit: (proc: BPMProcess) => void;
  onSaveInlineEdit: (id: string) => void;
  onCancelInlineEdit: () => void;
  onDeleteTarget: (proc: BPMProcess | null) => void;
  onOpenCreateModal: (cat: 'management' | 'support') => void;
}

export const SimpleCategoryColumn: React.FC<SimpleCategoryColumnProps> = ({
  title,
  category,
  processes,
  isEs,
  editingCardId,
  editName,
  onSetEditName,
  onStartInlineEdit,
  onSaveInlineEdit,
  onCancelInlineEdit,
  onDeleteTarget,
  onOpenCreateModal,
}) => {
  return (
    <div className="bg-slate-100/70 border border-slate-200 rounded-lg p-3.5 flex flex-col gap-3 min-h-[420px]">
      <div className="flex items-center justify-between px-1">
        <div className="font-semibold text-xs text-slate-900">
          {title}
          <span className="ml-1.5 text-[11px] font-normal text-slate-500">
            ({processes.length})
          </span>
        </div>
        <button
          onClick={() => onOpenCreateModal(category)}
          className="p-1 hover:bg-slate-200 rounded text-slate-600 cursor-pointer"
          title={isEs ? `Añadir ${title}` : `Add ${title}`}
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <Droppable droppableId={`cat:${category}`}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex flex-col gap-2 flex-1 rounded-md p-1 transition-colors ${
              snapshot.isDraggingOver ? 'bg-slate-200/50' : ''
            }`}
          >
            {processes.map((proc, idx) => (
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

            {processes.length === 0 && !snapshot.isDraggingOver && (
              <div className="text-center py-10 text-xs text-slate-400 border border-dashed border-slate-200 rounded">
                {isEs ? 'Arrastra o añade un proceso aquí' : 'Drag or add a process here'}
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
};
