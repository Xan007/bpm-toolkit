import React, { useRef, useEffect } from 'react';
import { BPMProcess, ProcessCategory } from '../../../types';
import { ChevronDown, Search } from 'lucide-react';

interface ProcessSelectorDropdownProps {
  processes: BPMProcess[];
  filteredProcesses: BPMProcess[];
  currentProcess: BPMProcess;
  selectedCategory: ProcessCategory | 'all';
  searchProcess: string;
  isDropdownOpen: boolean;
  isEs: boolean;
  onSelectCategory: (cat: ProcessCategory | 'all') => void;
  onSearchChange: (val: string) => void;
  onToggleDropdown: () => void;
  onCloseDropdown: () => void;
  onSelectProcess: (id: string) => void;
}

export const ProcessSelectorDropdown: React.FC<ProcessSelectorDropdownProps> = ({
  filteredProcesses,
  currentProcess,
  selectedCategory,
  searchProcess,
  isDropdownOpen,
  isEs,
  onSelectCategory,
  onSearchChange,
  onToggleDropdown,
  onCloseDropdown,
  onSelectProcess,
}) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onCloseDropdown();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onCloseDropdown]);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Pestañas de Categoría */}
      <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-xs font-medium border border-slate-200/70">
        {(['all', 'management', 'core', 'support'] as const).map((cat) => {
          const label =
            cat === 'all'
              ? isEs ? 'Todos' : 'All'
              : cat === 'management'
              ? isEs ? 'Gestión' : 'Management'
              : cat === 'core'
              ? isEs ? 'Clave' : 'Core'
              : isEs ? 'Soporte' : 'Support';
          return (
            <button
              key={cat}
              onClick={() => onSelectCategory(cat)}
              className={`px-2.5 py-1 text-center rounded transition-colors cursor-pointer text-xs ${
                selectedCategory === cat
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Dropdown Interactivo */}
      <div className="relative min-w-[240px] max-w-[320px]" ref={dropdownRef}>
        <div
          onClick={onToggleDropdown}
          className="w-full flex items-center justify-between px-3 py-1.5 text-xs bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-md cursor-pointer transition-colors gap-2"
        >
          <span className="font-semibold text-slate-800 truncate">
            {currentProcess.name}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
              isDropdownOpen ? 'rotate-180' : ''
            }`}
          />
        </div>

        {isDropdownOpen && (
          <div className="absolute left-0 right-0 top-full mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden flex flex-col max-h-72 w-80">
            <div className="p-2 border-b border-slate-100 bg-slate-50/50">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchProcess}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder={isEs ? 'Buscar por nombre o grupo...' : 'Search by name or group...'}
                  className="w-full pl-8 pr-3 py-1 bg-white border border-slate-200 rounded text-xs outline-none focus:border-slate-800"
                  autoFocus
                />
              </div>
            </div>

            <div className="overflow-y-auto p-1 divide-y divide-slate-100">
              {filteredProcesses.length === 0 ? (
                <div className="p-3 text-center text-xs text-slate-400">
                  {isEs ? 'No se encontraron procesos' : 'No processes match filter'}
                </div>
              ) : (
                filteredProcesses.map((proc) => {
                  const isSelected = proc.id === currentProcess.id;
                  return (
                    <button
                      key={proc.id}
                      onClick={() => {
                        onSelectProcess(proc.id);
                        onCloseDropdown();
                      }}
                      className={`w-full flex flex-col items-start px-3 py-1.5 text-left rounded-md transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-slate-900 text-white font-medium'
                          : 'hover:bg-slate-100 text-slate-800'
                      }`}
                    >
                      <span className="text-xs truncate w-full">{proc.name}</span>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span
                          className={`text-[10px] ${
                            isSelected ? 'text-slate-300' : 'text-slate-400'
                          }`}
                        >
                          {proc.category === 'management'
                            ? isEs ? 'Gestión' : 'Management'
                            : proc.category === 'core'
                            ? isEs ? 'Clave' : 'Core'
                            : isEs ? 'Soporte' : 'Support'}
                        </span>
                        {proc.groupName && (
                          <span
                            className={`text-[10px] ${
                              isSelected ? 'text-slate-300' : 'text-slate-400'
                            }`}
                          >
                            • {proc.groupName}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
