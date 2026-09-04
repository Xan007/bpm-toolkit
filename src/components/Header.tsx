import React from 'react';
import { AppConfig, CompanyProfile } from '../types';
import { Building2, Grid2X2, Layers, FileText, Settings } from 'lucide-react';

interface HeaderProps {
  company: CompanyProfile;
  config: AppConfig;
  activeTab: 'inventory' | 'portfolio' | 'architecture' | 'profile';
  isEs: boolean;
  onSetActiveTab: (tab: 'inventory' | 'portfolio' | 'architecture' | 'profile') => void;
  onSetConfig: (config: AppConfig) => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  company,
  config,
  activeTab,
  isEs,
  onSetActiveTab,
  onSetConfig,
  onOpenSettings,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7 rounded bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
          BPM
        </div>
        <div>
          <div className="font-semibold text-sm tracking-tight text-slate-900">BPM Tools</div>
        </div>
      </div>

      {/* Pestañas de Navegación */}
      <nav className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-medium">
        <button
          onClick={() => onSetActiveTab('inventory')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeTab === 'inventory' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          {isEs ? 'Procesos' : 'Processes'}
        </button>
        <button
          onClick={() => onSetActiveTab('portfolio')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeTab === 'portfolio' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Grid2X2 className="w-3.5 h-3.5" />
          {isEs ? 'Portafolio de Procesos' : 'Process Portfolio'}
        </button>
        <button
          onClick={() => onSetActiveTab('architecture')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeTab === 'architecture' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          {isEs ? 'Arquitectura de Procesos' : 'Process Architecture'}
        </button>
        <button
          onClick={() => onSetActiveTab('profile')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors cursor-pointer ${
            activeTab === 'profile' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          {isEs ? 'Perfil de Proceso' : 'Process Profile'}
        </button>
      </nav>

      {/* Botón Configuración (Tuerca) */}
      <div className="flex items-center gap-2">
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

