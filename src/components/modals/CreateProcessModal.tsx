import React from 'react';
import { ProcessCategory } from '../../types';
import { X } from 'lucide-react';

interface CreateProcessModalProps {
  isOpen: boolean;
  isEs: boolean;
  formName: string;
  formCategory: ProcessCategory;
  formGroup: string;
  formHealth: number;
  formImp: number;
  formFeas: number;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onSetFormName: (val: string) => void;
  onSetFormCategory: (cat: ProcessCategory) => void;
  onSetFormGroup: (val: string) => void;
  onSetFormHealth: (val: number) => void;
  onSetFormImp: (val: number) => void;
  onSetFormFeas: (val: number) => void;
}

export const CreateProcessModal: React.FC<CreateProcessModalProps> = ({
  isOpen,
  isEs,
  formName,
  formCategory,
  formGroup,
  formHealth,
  formImp,
  formFeas,
  onClose,
  onSubmit,
  onSetFormName,
  onSetFormCategory,
  onSetFormGroup,
  onSetFormHealth,
  onSetFormImp,
  onSetFormFeas,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-lg border border-slate-200 shadow-xl max-w-md w-full p-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <h3 className="text-sm font-semibold text-slate-900">
            {isEs ? 'Añadir Proceso' : 'Add Process'}
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5 text-xs">
          <div>
            <label className="block text-slate-600 font-medium mb-1">
              {isEs ? 'Nombre del Proceso' : 'Process Name'}
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Deliver Courses, Procure Materials..."
              value={formName}
              onChange={(e) => onSetFormName(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-slate-200 rounded outline-none focus:border-slate-800 text-slate-900"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                {isEs ? 'Tipo de Proceso' : 'Process Type'}
              </label>
              <select
                value={formCategory}
                onChange={(e) => onSetFormCategory(e.target.value as ProcessCategory)}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded outline-none cursor-pointer bg-white"
              >
                <option value="management">{isEs ? 'Gestión' : 'Management'}</option>
                <option value="core">{isEs ? 'Clave' : 'Core'}</option>
                <option value="support">{isEs ? 'Soporte' : 'Support'}</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">
                {isEs ? 'Grupo / Cadena' : 'Group / Chain'} <span className="font-normal text-slate-400">(Core)</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Contract Acquisition..."
                value={formGroup}
                onChange={(e) => onSetFormGroup(e.target.value)}
                disabled={formCategory !== 'core'}
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded outline-none disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded">
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                {isEs ? 'Salud (1-5)' : 'Health (1-5)'}
              </label>
              <input
                type="number"
                min="1"
                max="5"
                step="1"
                value={formHealth}
                onChange={(e) => onSetFormHealth(parseInt(e.target.value, 10) || 1)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded outline-none text-center font-semibold mb-1"
              />
              <span className="block text-[9.5px] text-slate-500 leading-tight text-center">
                {isEs ? '1: Saludable\n5: Prob. graves' : '1: Healthy\n5: Severe issues'}
              </span>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                {isEs ? 'Importancia (1-5)' : 'Importance (1-5)'}
              </label>
              <input
                type="number"
                min="1"
                max="5"
                step="1"
                value={formImp}
                onChange={(e) => onSetFormImp(parseInt(e.target.value, 10) || 1)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded outline-none text-center font-semibold mb-1"
              />
              <span className="block text-[9.5px] text-slate-500 leading-tight text-center">
                {isEs ? '1: Muy baja\n5: Muy alta' : '1: Very low\n5: Very high'}
              </span>
            </div>
            <div>
              <label className="block text-slate-600 font-medium mb-1">
                {isEs ? 'Factibilidad (1-5)' : 'Feasibility (1-5)'}
              </label>
              <input
                type="number"
                min="1"
                max="5"
                step="1"
                value={formFeas}
                onChange={(e) => onSetFormFeas(parseInt(e.target.value, 10) || 1)}
                className="w-full px-2 py-1 bg-white border border-slate-300 rounded outline-none text-center font-semibold mb-1"
              />
              <span className="block text-[9.5px] text-slate-500 leading-tight text-center">
                {isEs ? '1: Muy difícil\n5: Muy factible' : '1: Very hard\n5: Highly feasible'}
              </span>
            </div>
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
              className="px-4 py-1.5 rounded bg-slate-900 hover:bg-slate-800 text-white font-medium cursor-pointer"
            >
              {isEs ? 'Guardar' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
