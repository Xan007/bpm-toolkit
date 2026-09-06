import React from 'react';
import { AppConfig } from '../../types';
import { Settings, X } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  config: AppConfig;
  isEs: boolean;
  onClose: () => void;
  onSetConfig: (config: AppConfig) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  config,
  isEs,
  onClose,
  onSetConfig,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
            <Settings className="w-4 h-4 text-slate-700" />
            {isEs ? 'Configuración de la Aplicación' : 'Application Settings'}
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 flex flex-col gap-4">
          {/* Idioma */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              {isEs ? 'Idioma' : 'Language'}
            </label>
            <select
              value={config.language}
              onChange={(e) =>
                onSetConfig({ ...config, language: e.target.value as 'es' | 'en' })
              }
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-900 focus:bg-white transition-all cursor-pointer"
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Tipo de Fuente */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              {isEs ? 'Tipografía (Fuente)' : 'Font Family'}
            </label>
            <select
              value={config.fontFamily}
              onChange={(e) => onSetConfig({ ...config, fontFamily: e.target.value })}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-slate-900 focus:bg-white transition-all cursor-pointer"
            >
              <option value="Arial">Arial</option>
              <option value="Calibri">Calibri</option>
              <option value="Segoe UI">Segoe UI</option>
              <option value="Helvetica">Helvetica</option>
              <option value="Inter">Inter</option>
              <option value="Roboto">Roboto</option>
            </select>
          </div>

          {/* Tamaño de Fuente */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700">
              {isEs ? 'Tamaño de Fuente en Diagramas' : 'Diagram Font Size'} ({config.fontSize || 12}px)
            </label>
            <input
              type="range"
              min="9"
              max="16"
              step="1"
              value={config.fontSize || 12}
              onChange={(e) =>
                onSetConfig({ ...config, fontSize: parseInt(e.target.value, 10) })
              }
              className="w-full accent-slate-900 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>9px</span>
              <span>12px</span>
              <span>16px</span>
            </div>
          </div>

          {/* Decimales en Portafolio */}
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-100">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-slate-700">
                {isEs ? 'Permitir Decimales en Portafolio' : 'Allow Decimals in Portfolio'}
              </span>
              <input
                type="checkbox"
                checked={config.allowDecimals || false}
                onChange={(e) =>
                  onSetConfig({ ...config, allowDecimals: e.target.checked })
                }
                className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
              />
            </label>

            {config.allowDecimals && (
              <div className="flex flex-col gap-1.5 pl-2">
                <label className="text-[11px] font-medium text-slate-600">
                  {isEs ? 'Paso de Incremento' : 'Step Increment'}
                </label>
                <select
                  value={config.decimalStep || 0.5}
                  onChange={(e) =>
                    onSetConfig({ ...config, decimalStep: parseFloat(e.target.value) })
                  }
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs text-slate-800 outline-none focus:border-slate-900 focus:bg-white transition-all cursor-pointer"
                >
                  <option value="0.1">0.1</option>
                  <option value="0.25">0.25</option>
                  <option value="0.5">0.5</option>
                  <option value="1">1.0</option>
                </select>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-medium hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
          >
            {isEs ? 'Listo' : 'Done'}
          </button>
        </div>
      </div>
    </div>
  );
};
