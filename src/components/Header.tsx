import React, { useState, useRef, useEffect } from 'react';
import { AppConfig, CompanyProfile } from '../types';
import { Building2, Grid2X2, Layers, FileText, Settings, ChevronDown } from 'lucide-react';
import { EXAMPLES } from '../examples';

interface HeaderProps {
  company: CompanyProfile;
  config: AppConfig;
  activeTab: 'inventory' | 'portfolio' | 'architecture' | 'profile';
  isEs: boolean;
  onSetActiveTab: (tab: 'inventory' | 'portfolio' | 'architecture' | 'profile') => void;
  onSetConfig: (config: AppConfig) => void;
  onOpenSettings: () => void;
  onLoadExample?: (exampleId: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  config,
  activeTab,
  isEs,
  onSetActiveTab,
  onSetConfig,
  onOpenSettings,
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

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-3 sm:px-6 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-2.5">
      <div className="flex items-center gap-2.5 sm:gap-3 shrink-0">
        <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
          BPM
        </div>
        <div>
          <div className="font-semibold text-sm tracking-tight text-slate-900">BPM Tools</div>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium overflow-x-auto max-w-full">
        <button
          onClick={() => onSetActiveTab('inventory')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
            activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>{isEs ? 'Procesos' : 'Processes'}</span>
        </button>
        <button
          onClick={() => onSetActiveTab('portfolio')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
            activeTab === 'portfolio' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Grid2X2 className="w-3.5 h-3.5" />
          <span>{isEs ? 'Portafolio' : 'Portfolio'}</span>
        </button>
        <button
          onClick={() => onSetActiveTab('architecture')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
            activeTab === 'architecture' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>{isEs ? 'Arquitectura' : 'Architecture'}</span>
        </button>
        <button
          onClick={() => onSetActiveTab('profile')}
          className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md transition-colors cursor-pointer shrink-0 ${
            activeTab === 'profile' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{isEs ? 'Perfil' : 'Profile'}</span>
        </button>
      </nav>

      {/* Acciones Derecha: Ejemplos y Configuración */}
      <div className="flex items-center gap-2">
        {onLoadExample && (
          <div className="relative" ref={examplesMenuRef}>
            <button
              type="button"
              onClick={() => setIsExamplesOpen(!isExamplesOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-xs font-medium cursor-pointer"
              title={isEs ? 'Cargar dataset de ejemplo' : 'Load example dataset'}
            >
              <span>{isEs ? 'Ejemplos' : 'Examples'}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isExamplesOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-56 bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100">
                <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                  {isEs ? 'Plantillas / Ejemplos' : 'Templates / Examples'}
                </div>
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
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors text-xs font-medium cursor-pointer"
          title={isEs ? 'Configuración' : 'Settings'}
        >
          <Settings className="w-4 h-4 text-slate-600" />
          <span className="hidden sm:inline">{isEs ? 'Configuración' : 'Settings'}</span>
        </button>
      </div>
    </header>
  );
};

