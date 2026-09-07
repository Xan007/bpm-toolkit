import React, { useMemo, useState, useEffect } from 'react';
import { BPMProcess, AppConfig, ProcessCategory } from './types';
import {
  computeDispersedClusters,
  resolveOptimalLabelPositions,
  computeFinalPlacedLabels,
  W,
  H,
  boxX,
  boxY,
  boxW,
  boxH,
  padX,
  padY
} from './portfolioLayout';
import { Download, Eye, EyeOff, HelpCircle, ChevronDown, Check, Copy, Move } from 'lucide-react';
import { RatingPills } from './features/portfolio/components/RatingPills';
import { PortfolioSvgMatrix } from './features/portfolio/components/PortfolioSvgMatrix';
import {
  exportPortfolioDrawio,
  exportPortfolioPNG,
  exportPortfolioSVG,
  exportPortfolioJPEG,
  exportPortfolioPDF,
  buildPortfolioTableHtml,
  buildPortfolioTablePlainText,
} from './features/portfolio/portfolioExport';

interface PortfolioViewProps {
  processes: BPMProcess[];
  config: AppConfig;
  onAutoFit?: () => void;
  onToggleVisibility?: (id: string) => void;
  onUpdateProcess?: (id: string, updates: Partial<BPMProcess>) => void;
  onSetConfig?: (config: AppConfig) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  processes,
  config,
  onToggleVisibility,
  onUpdateProcess,
  onSetConfig,
}) => {
  const isEs = config.language === 'es';
  const allowDecimals = config.allowDecimals ?? false;
  const decimalStep = config.decimalStep || (allowDecimals ? 0.5 : 1);

  const [selectedCategory, setSelectedCategory] = useState<ProcessCategory | 'all'>('all');
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [showScaleGuide, setShowScaleGuide] = useState(false);
  const [draggingProcessId, setDraggingProcessId] = useState<string | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);
  const isDraggingRef = React.useRef(false);

  const handleSelectProcess = (id: string) => {
    setSelectedProcessId((prev) => (prev === id ? null : id));
  };

  const handlePointerDown = (e: React.PointerEvent, procId: string) => {
    e.stopPropagation();
    setDraggingProcessId(procId);
    isDraggingRef.current = false;
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch (_) {}
  };

  const handlePointerMove = (e: React.PointerEvent, procId: string) => {
    if (draggingProcessId !== procId || !onUpdateProcess) return;
    isDraggingRef.current = true;

    const svgElem = document.getElementById('portfolio-svg');
    if (!svgElem) return;

    const rect = svgElem.getBoundingClientRect();
    const scaleX = W / rect.width;
    const scaleY = H / rect.height;
    const mouseX = (e.clientX - rect.left) * scaleX;
    const mouseY = (e.clientY - rect.top) * scaleY;

    const usableW = boxW - 2 * padX;
    const nx = (mouseX - (boxX + padX)) / usableW;
    const rawHealth = 1 + nx * 4;

    const usableH = boxH - 2 * padY;
    const ny = ((boxY + boxH - padY) - mouseY) / usableH;
    const rawImp = 1 + ny * 4;

    const snapValue = (val: number, step: number) => {
      const clamped = Math.max(1, Math.min(5, val));
      if (!allowDecimals || step === 1) {
        return Math.round(clamped);
      }
      return Math.round(clamped / step) * step;
    };

    const newHealth = parseFloat(snapValue(rawHealth, decimalStep).toFixed(2));
    const newImp = parseFloat(snapValue(rawImp, decimalStep).toFixed(2));

    const currentProc = processes.find((p) => p.id === procId);
    if (currentProc && (currentProc.health !== newHealth || currentProc.importance !== newImp)) {
      onUpdateProcess(procId, { health: newHealth, importance: newImp });
    }
  };

  const handlePointerUp = (e: React.PointerEvent, procId: string) => {
    e.stopPropagation();
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
    setDraggingProcessId(null);

    if (!isDraggingRef.current) {
      handleSelectProcess(procId);
    }
  };

  useEffect(() => {
    if (selectedProcessId) {
      const elem = document.getElementById(`proc-item-${selectedProcessId}`);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedProcessId]);

  const categoryFilteredProcesses = useMemo(() => {
    return processes.filter((p) => {
      return selectedCategory === 'all' || p.category === selectedCategory;
    });
  }, [processes, selectedCategory]);

  const visibleProcesses = useMemo(() => {
    return categoryFilteredProcesses.filter((p) => p.visible !== false);
  }, [categoryFilteredProcesses]);

  const { coords, clusters } = useMemo(() => computeDispersedClusters(visibleProcesses), [visibleProcesses]);

  const resolvedPositions = useMemo(() => {
    return resolveOptimalLabelPositions(visibleProcesses, coords, clusters);
  }, [visibleProcesses, coords, clusters]);

  const placedLabels = useMemo(() => {
    return computeFinalPlacedLabels(visibleProcesses, coords, resolvedPositions);
  }, [visibleProcesses, coords, resolvedPositions]);

  const copyTableToClipboard = async () => {
    const procs = visibleProcesses.length > 0 ? visibleProcesses : processes;
    const htmlTable = buildPortfolioTableHtml(procs, config, isEs);
    const plainTextTable = buildPortfolioTablePlainText(procs, isEs);

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([htmlTable], { type: 'text/html' });
        const blobText = new Blob([plainTextTable], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plainTextTable);
      }
      setCopiedTable(true);
      setTimeout(() => setCopiedTable(false), 2500);
    } catch {
      await navigator.clipboard.writeText(plainTextTable);
      setCopiedTable(true);
      setTimeout(() => setCopiedTable(false), 2500);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Barra Superior Unificada: Filtros/Título a la izquierda y acciones globales a la derecha */}
      <div className="flex flex-wrap items-center justify-between bg-white border border-slate-200 rounded-lg px-3.5 py-2 shadow-2xs gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-900">
            {isEs ? 'Portafolio de Procesos' : 'Process Portfolio'}
          </span>
          
          {/* Filtros por Categoría compactos en barra superior */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md text-xs font-medium border border-slate-200/70">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 text-center rounded transition-colors cursor-pointer text-xs ${
                selectedCategory === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isEs ? 'Todos' : 'All'} ({processes.filter((p) => p.visible !== false).length})
            </button>
            <button
              onClick={() => setSelectedCategory('management')}
              className={`px-2.5 py-1 text-center rounded transition-colors cursor-pointer text-xs ${
                selectedCategory === 'management'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isEs ? 'Gestión' : 'Management'}
            </button>
            <button
              onClick={() => setSelectedCategory('core')}
              className={`px-2.5 py-1 text-center rounded transition-colors cursor-pointer text-xs ${
                selectedCategory === 'core'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isEs ? 'Clave' : 'Core'}
            </button>
            <button
              onClick={() => setSelectedCategory('support')}
              className={`px-2.5 py-1 text-center rounded transition-colors cursor-pointer text-xs ${
                selectedCategory === 'support'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isEs ? 'Soporte' : 'Support'}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Selector de Decimales / Incremento */}
          {onSetConfig && (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-md text-xs">
              <label className="text-[11px] font-medium text-slate-600 cursor-pointer flex items-center gap-1.5">
                <input
                  type="checkbox"
                  checked={allowDecimals}
                  onChange={(e) =>
                    onSetConfig({
                      ...config,
                      allowDecimals: e.target.checked,
                      decimalStep: e.target.checked ? config.decimalStep || 0.5 : 1,
                    })
                  }
                  className="rounded text-slate-900 accent-slate-900 cursor-pointer"
                />
                <span>{isEs ? 'Decimales' : 'Decimals'}</span>
              </label>

              {allowDecimals && (
                <select
                  value={decimalStep}
                  onChange={(e) =>
                    onSetConfig({
                      ...config,
                      decimalStep: parseFloat(e.target.value),
                    })
                  }
                  className="bg-white border border-slate-200 rounded px-1.5 py-0.5 text-[11px] font-mono text-slate-800 outline-none cursor-pointer"
                  title={isEs ? 'Paso de incremento' : 'Step increment'}
                >
                  <option value="0.1">0.1</option>
                  <option value="0.25">0.25</option>
                  <option value="0.5">0.5</option>
                  <option value="1">1.0</option>
                </select>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={copyTableToClipboard}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
              copiedTable
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
            }`}
          >
            {copiedTable ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedTable ? (isEs ? '¡Copiado!' : 'Copied!') : (isEs ? 'Copiar Tabla' : 'Copy Table')}</span>
          </button>

          <div className="relative">
            <button
              onClick={() => setIsDownloadOpen(!isDownloadOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isEs ? 'Descargar' : 'Download'}</span>
              <ChevronDown className="w-3.5 h-3.5 opacity-70" />
            </button>

            {isDownloadOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-50 w-44 bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-xs text-slate-700 animate-in fade-in zoom-in-95 duration-100"
                onClick={() => setIsDownloadOpen(false)}
              >
                <button
                  onClick={() => exportPortfolioDrawio(visibleProcesses, config)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="font-medium text-slate-800">Draw.io</span>
                  <span className="text-[10px] text-slate-400 font-mono">.drawio</span>
                </button>
                <button
                  onClick={() => exportPortfolioPNG(config.language)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="font-medium text-slate-800">PNG</span>
                  <span className="text-[10px] text-slate-400 font-mono">.png</span>
                </button>
                <button
                  onClick={() => exportPortfolioSVG(config.language)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="font-medium text-slate-800">SVG</span>
                  <span className="text-[10px] text-slate-400 font-mono">.svg</span>
                </button>
                <button
                  onClick={() => exportPortfolioJPEG(config.language)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="font-medium text-slate-800">JPEG</span>
                  <span className="text-[10px] text-slate-400 font-mono">.jpg</span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={() => exportPortfolioPDF(config.language)}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer text-slate-800 font-medium"
                >
                  <span>PDF</span>
                  <span className="text-[10px] text-slate-400 font-mono">.pdf</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* COLUMNA IZQUIERDA: MEDIDAS DE DESEMPEÑO Y LISTA */}
        <div className="lg:col-span-4 xl:col-span-4 flex flex-col gap-3 bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-semibold text-slate-900">
                {isEs ? 'Medidas de Desempeño' : 'Performance Metrics'}
              </h3>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowScaleGuide(!showScaleGuide)}
                  onMouseEnter={() => setShowScaleGuide(true)}
                  onMouseLeave={() => setShowScaleGuide(false)}
                  className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <HelpCircle className="w-3.5 h-3.5" />
                </button>

                {showScaleGuide && (
                  <div className="absolute left-0 top-full mt-1 z-40 w-64 bg-slate-900 text-white rounded-lg p-3 shadow-xl text-[11px] flex flex-col gap-1.5 animate-in fade-in zoom-in-95 duration-100 pointer-events-none">
                    <div className="font-semibold text-xs border-b border-slate-700 pb-1 text-slate-200">
                      {isEs ? 'Guía de Escalas (1 a 5)' : 'Scale Guide (1 to 5)'}
                    </div>
                    <div className="flex flex-col gap-1 text-[10.5px] text-slate-300">
                      <div>
                        <strong className="text-slate-100">{isEs ? 'Importancia:' : 'Importance:'}</strong>{' '}
                        <span>1 = {isEs ? 'Muy baja' : 'Very low'}</span> | <span>5 = {isEs ? 'Muy alta' : 'Very high'}</span>
                      </div>
                      <div>
                        <strong className="text-slate-100">{isEs ? 'Salud:' : 'Health:'}</strong>{' '}
                        <span>1 = {isEs ? 'Saludable (Bueno)' : 'Healthy (Good)'}</span> | <span>5 = {isEs ? 'Deficiente (Problemas graves)' : 'Poor (Severe issues)'}</span>
                      </div>
                      <div>
                        <strong className="text-slate-100">{isEs ? 'Factibilidad:' : 'Feasibility:'}</strong>{' '}
                        <span>1 = {isEs ? 'Muy difícil' : 'Very hard'}</span> | <span>5 = {isEs ? 'Altamente factible' : 'Highly feasible'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <span className="text-xs font-medium text-slate-400">
              {visibleProcesses.length} {isEs ? 'visibles' : 'visible'}
            </span>
          </div>

          {/* Lista de Procesos */}
          <div className="flex flex-col gap-2 max-h-[560px] overflow-y-auto pr-1">
            {categoryFilteredProcesses.map((proc) => {
              const isVisible = proc.visible !== false;
              const isSelected = selectedProcessId === proc.id;

              return (
                <div
                  key={proc.id}
                  id={`proc-item-${proc.id}`}
                  onClick={() => handleSelectProcess(proc.id)}
                  className={`p-2.5 rounded-lg border text-xs flex flex-col gap-2 transition-all cursor-pointer ${
                    !isVisible
                      ? 'bg-slate-50/60 border-slate-200 opacity-60'
                      : isSelected
                      ? 'border-slate-900 bg-slate-100/80 ring-1 ring-slate-900/20 shadow-2xs font-medium'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      {onToggleVisibility && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleVisibility(proc.id);
                          }}
                          className={`p-1 rounded cursor-pointer transition-colors ${
                            isVisible
                              ? 'text-slate-700 hover:bg-slate-100'
                              : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
                          }`}
                          title={
                            isEs
                              ? isVisible ? 'Ocultar en la matriz' : 'Mostrar en la matriz'
                              : isVisible ? 'Hide on matrix' : 'Show on matrix'
                          }
                        >
                          {isVisible ? (
                            <Eye className="w-3.5 h-3.5 text-slate-800" />
                          ) : (
                            <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </button>
                      )}
                      <span
                        className={`font-semibold truncate text-xs ${
                          isVisible ? 'text-slate-900' : 'text-slate-400 line-through'
                        }`}
                        title={proc.name}
                      >
                        {proc.name}
                      </span>
                    </div>

                    <span className="text-[9px] uppercase font-bold text-slate-400 shrink-0 bg-slate-100 px-1.5 py-0.5 rounded">
                      {proc.category === 'management'
                        ? isEs ? 'Gestión' : 'Management'
                        : proc.category === 'core'
                        ? isEs ? 'Clave' : 'Core'
                        : isEs ? 'Soporte' : 'Support'}
                    </span>
                  </div>

                  {onUpdateProcess && isVisible && (
                    <div
                      className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-100"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <RatingPills
                        label={isEs ? 'Salud' : 'Health'}
                        value={proc.health}
                        lowText={isEs ? 'Saludable' : 'Healthy'}
                        highText={isEs ? 'Deficiente' : 'Poor'}
                        allowDecimals={allowDecimals}
                        step={decimalStep}
                        onChange={(num) => onUpdateProcess(proc.id, { health: num })}
                      />
                      <RatingPills
                        label={isEs ? 'Importancia' : 'Importance'}
                        value={proc.importance}
                        lowText={isEs ? 'Muy baja' : 'Very low'}
                        highText={isEs ? 'Muy alta' : 'Very high'}
                        allowDecimals={allowDecimals}
                        step={decimalStep}
                        onChange={(num) => onUpdateProcess(proc.id, { importance: num })}
                      />
                      <RatingPills
                        label={isEs ? 'Factibilidad' : 'Feasibility'}
                        value={proc.feasibility}
                        lowText={isEs ? 'Muy difícil intervenir' : 'Very hard'}
                        highText={isEs ? 'Altamente factible' : 'Highly feasible'}
                        allowDecimals={allowDecimals}
                        step={decimalStep}
                        onChange={(num) => onUpdateProcess(proc.id, { feasibility: num })}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* COLUMNA DERECHA: VISUALIZACIÓN MATRIZ 2x2 */}
        <div className="lg:col-span-8 xl:col-span-8 flex flex-col gap-3">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between pb-2 mb-3 border-b border-slate-100 gap-2">
              <span className="text-xs font-semibold text-slate-900">
                {isEs ? 'Matriz 2x2 de Portafolio' : '2x2 Portfolio Matrix'}
              </span>
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500 bg-slate-50 border border-slate-200/80 px-2.5 py-1 rounded-md">
                <Move className="w-3 h-3 text-slate-600" />
                <span>
                  {isEs
                    ? 'Tip: Puedes arrastrar los círculos directamente en la matriz para actualizar su salud e importancia.'
                    : 'Tip: You can drag circles directly on the matrix to update health and importance.'}
                </span>
              </div>
            </div>

            <div className="flex justify-center items-center overflow-x-auto">
              <PortfolioSvgMatrix
                visibleProcesses={visibleProcesses}
                config={config}
                coords={coords}
                clusters={clusters}
                placedLabels={placedLabels}
                selectedProcessId={selectedProcessId}
                draggingProcessId={draggingProcessId}
                isEs={isEs}
                onPointerDown={handlePointerDown}
                onPointerMove={handlePointerMove}
                onPointerUp={handlePointerUp}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;
