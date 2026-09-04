import React from 'react';
import { BPMProcess } from '../types';
import { GripVertical, Edit2, Trash2, Check } from 'lucide-react';
import { Draggable } from '@hello-pangea/dnd';

interface ProcessCardProps {
  proc: BPMProcess;
  index: number;
  isEs: boolean;
  editingCardId: string | null;
  editName: string;
  onSetEditName: (val: string) => void;
  onStartInlineEdit: (proc: BPMProcess) => void;
  onSaveInlineEdit: (id: string) => void;
  onCancelInlineEdit: () => void;
  onDelete: (proc: BPMProcess) => void;
}

export const ProcessCard: React.FC<ProcessCardProps> = ({
  proc,
  index,
  isEs,
  editingCardId,
  editName,
  onSetEditName,
  onStartInlineEdit,
  onSaveInlineEdit,
  onCancelInlineEdit,
  onDelete,
}) => {
  const isEditing = editingCardId === proc.id;

  return (
    <Draggable draggableId={proc.id} index={index} isDragDisabled={isEditing}>
      {(provided, snapshot) => {
        const style: React.CSSProperties = {
          ...provided.draggableProps.style,
          cursor: isEditing ? 'default' : 'grab',
        };

        // Hacer la caída/drop más rápida y ágil (snappy drop animation)
        if (snapshot.isDropAnimating && snapshot.dropAnimation) {
          const { duration, curve } = snapshot.dropAnimation;
          style.transition = `all ${Math.min(duration, 0.15)}s ${curve || 'cubic-bezier(0.2, 0, 0, 1)'}`;
        }

        return (
          <div
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`bg-white border rounded-md p-2.5 shadow-2xs hover:border-slate-300 transition-shadow select-none group relative ${
              snapshot.isDragging
                ? 'shadow-lg border-slate-400 rotate-1 scale-[1.02] z-50 ring-2 ring-slate-900/10'
                : 'border-slate-200'
            }`}
            style={style}
          >
            {isEditing ? (
              /* Modo Edición en la Tarjeta */
              <div
                className="flex items-center gap-1.5 text-xs cursor-default"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => onSetEditName(e.target.value)}
                  placeholder={isEs ? 'Nombre del proceso' : 'Process name'}
                  autoFocus
                  className="flex-1 px-2 py-1 border border-slate-300 rounded font-medium text-slate-900 outline-none focus:border-slate-800"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') onSaveInlineEdit(proc.id);
                    if (e.key === 'Escape') onCancelInlineEdit();
                  }}
                />
                <button
                  onClick={() => onSaveInlineEdit(proc.id)}
                  className="p-1.5 bg-slate-900 text-white rounded cursor-pointer hover:bg-slate-800"
                  title={isEs ? 'Guardar' : 'Save'}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={onCancelInlineEdit}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded cursor-pointer"
                  title={isEs ? 'Cancelar' : 'Cancel'}
                >
                  ✕
                </button>
              </div>
            ) : (
              /* Modo Normal */
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-1 min-w-0">
                  <span
                    className="text-slate-400 group-hover:text-slate-700 p-0.5 shrink-0"
                    title={isEs ? 'Arrastrar para mover o reordenar' : 'Drag to move or reorder'}
                  >
                    <GripVertical className="w-3.5 h-3.5" />
                  </span>
                  <span className="font-medium text-xs text-slate-900 leading-tight truncate">
                    {proc.name}
                  </span>
                </div>

                <div
                  className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  onMouseDown={(e) => e.stopPropagation()}
                >
                  <button
                    onClick={() => onStartInlineEdit(proc)}
                    className="p-1 text-slate-400 hover:text-slate-800 rounded hover:bg-slate-100 cursor-pointer"
                    title={isEs ? 'Editar nombre' : 'Edit name'}
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => onDelete(proc)}
                    className="p-1 text-slate-400 hover:text-red-600 rounded hover:bg-red-50 cursor-pointer"
                    title={isEs ? 'Eliminar' : 'Delete'}
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      }}
    </Draggable>
  );
};
