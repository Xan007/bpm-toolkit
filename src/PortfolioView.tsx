import React, { useMemo, useState, useEffect } from 'react';
import { BPMProcess, AppConfig, ProcessCategory } from './types';
import { getFeasibilityColor, generatePortfolioXML, escapeXml } from './drawio';
import {
  computeDispersedClusters,
  getLabelBoundingBox,
  resolveOptimalLabelPositions,
  computeFinalPlacedLabels,
  W,
  H,
  boxX,
  boxY,
  boxW,
  boxH,
  midX,
  midY,
  radius,
  padX,
  padY
} from './portfolioLayout';
import { Download, Eye, EyeOff, HelpCircle, ChevronDown, Table, Check, Copy } from 'lucide-react';
import { jsPDF } from 'jspdf';

interface PortfolioViewProps {
  processes: BPMProcess[];
  config: AppConfig;
  onAutoFit?: () => void;
  onToggleVisibility?: (id: string) => void;
  onUpdateProcess?: (id: string, updates: Partial<BPMProcess>) => void;
}

const RatingPills: React.FC<{
  label: string;
  value: number;
  lowText: string;
  highText: string;
  onChange: (val: number) => void;
}> = ({ label, value, lowText, highText, onChange }) => (
  <div className="flex items-center justify-between text-xs gap-1">
    <span className="text-[11px] font-medium text-slate-500 min-w-[65px]" title={`1: ${lowText} | 5: ${highText}`}>
      {label}:
    </span>
    <div className="flex items-center gap-0.5 bg-slate-100 p-0.5 rounded border border-slate-200/60" title={`1 = ${lowText}\n5 = ${highText}`}>
      {[1, 2, 3, 4, 5].map((num) => (
        <button
          key={num}
          type="button"
          onClick={() => onChange(num)}
          title={num === 1 ? `1: ${lowText}` : num === 5 ? `5: ${highText}` : `${num}`}
          className={`w-5 h-5 rounded text-[10px] font-bold transition-all cursor-pointer ${
            value === num
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
          }`}
        >
          {num}
        </button>
      ))}
    </div>
  </div>
);

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  processes,
  config,
  onToggleVisibility,
  onUpdateProcess,
}) => {
  const isEs = config.language === 'es';

  // Filtro de categoría rápida ('all' | 'management' | 'core' | 'support')
  const [selectedCategory, setSelectedCategory] = useState<ProcessCategory | 'all'>('all');
  const [selectedProcessId, setSelectedProcessId] = useState<string | null>(null);
  const [showScaleGuide, setShowScaleGuide] = useState(false);
  const [draggingProcessId, setDraggingProcessId] = useState<string | null>(null);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);
  const [copiedTable, setCopiedTable] = useState(false);
  const isDraggingRef = React.useRef(false);

  // Toggle de selección: si se vuelve a hacer clic sobre el mismo proceso, se deselecciona
  const handleSelectProcess = (id: string) => {
    setSelectedProcessId((prev) => (prev === id ? null : id));
  };

  // Manejadores de arrastre (Drag & Drop en la Matriz SVG)
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

    // Convertir coordenadas SVG (mouseX, mouseY) a Salud (1..5) e Importancia (1..5)
    const usableW = boxW - 2 * padX;
    const nx = (mouseX - (boxX + padX)) / usableW;
    const newHealth = Math.max(1, Math.min(5, Math.round(1 + nx * 4)));

    const usableH = boxH - 2 * padY;
    const ny = ((boxY + boxH - padY) - mouseY) / usableH;
    const newImp = Math.max(1, Math.min(5, Math.round(1 + ny * 4)));

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

    // Si solo hizo clic sin arrastrar, conmuta la selección
    if (!isDraggingRef.current) {
      handleSelectProcess(procId);
    }
  };

  // Auto-scroll al elemento seleccionado en la lista izquierda
  useEffect(() => {
    if (selectedProcessId) {
      const elem = document.getElementById(`proc-item-${selectedProcessId}`);
      if (elem) {
        elem.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }, [selectedProcessId]);

  // Procesos filtrados por categoría para la lista y la matriz
  const categoryFilteredProcesses = useMemo(() => {
    return processes.filter((p) => {
      return selectedCategory === 'all' || p.category === selectedCategory;
    });
  }, [processes, selectedCategory]);

  // Procesos que efectivamente se muestran en la matriz SVG (visibles + filtrados)
  const visibleProcesses = useMemo(() => {
    return categoryFilteredProcesses.filter((p) => p.visible !== false);
  }, [categoryFilteredProcesses]);

  // Coordenadas con dispersión y clusters para procesos que comparten (Health, Importance)
  const { coords, clusters } = useMemo(() => computeDispersedClusters(visibleProcesses), [visibleProcesses]);

  // Posiciones óptimas de etiquetas calculadas exhaustivamente sin colisiones
  const resolvedPositions = useMemo(() => {
    return resolveOptimalLabelPositions(visibleProcesses, coords, clusters);
  }, [visibleProcesses, coords, clusters]);

  // Etiquetas finales calculadas con precisión geométrica y soporte de líneas guía
  const placedLabels = useMemo(() => {
    return computeFinalPlacedLabels(visibleProcesses, coords, resolvedPositions);
  }, [visibleProcesses, coords, resolvedPositions]);

  // Detección de colisiones
  const conflicts = useMemo(() => {
    const set = new Set<number>();
    for (let i = 0; i < placedLabels.length; i++) {
      for (let j = 0; j < placedLabels.length; j++) {
        if (i === j) continue;
        const b1 = placedLabels[i].bbox;
        const b2 = placedLabels[j].bbox;

        const overlaps = !(
          b2.x > b1.x + b1.w + 2 ||
          b2.x + b2.w < b1.x - 2 ||
          b2.y > b1.y + b1.h + 2 ||
          b2.y + b2.h < b1.y - 2
        );
        if (overlaps) {
          set.add(i);
          set.add(j);
        }
      }
    }
    return set;
  }, [placedLabels]);

  // Generar SVG limpio sin ningún proceso seleccionado para descargas
  const getCleanSVGSource = (): string | null => {
    const svgElem = document.getElementById('portfolio-svg');
    if (!svgElem) return null;

    const clone = svgElem.cloneNode(true) as SVGElement;

    // Restaurar círculos seleccionados
    const selectedCircles = clone.querySelectorAll('circle[data-selected="true"]');
    selectedCircles.forEach((circle) => {
      const origR = circle.getAttribute('data-radius');
      if (origR) circle.setAttribute('r', origR);
      circle.setAttribute('stroke', '#262626');
      circle.setAttribute('stroke-width', '1.3');
      circle.removeAttribute('data-selected');
      circle.removeAttribute('data-radius');
    });

    // Restaurar textos seleccionados
    const selectedTexts = clone.querySelectorAll('text[data-selected="true"]');
    selectedTexts.forEach((text) => {
      text.setAttribute('fill', '#1a1a1a');
      text.setAttribute('font-weight', 'normal');
      text.removeAttribute('data-selected');
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(clone);
  };

  // Copiar tabla formateada (HTML + TSV) lista para pegar en Word, Google Docs o Excel
  const copyTableToClipboard = async () => {
    const procs = visibleProcesses.length > 0 ? visibleProcesses : processes;
    const thProcess = isEs ? 'Proceso' : 'Process';
    const thImportance = isEs ? 'Importancia' : 'Importance';
    const thHealth = isEs ? 'Salud' : 'Health';
    const thFeasibility = isEs ? 'Factibilidad' : 'Feasibility';

    // Tabla limpia sin estilos de fondo ni colores decorativos, respetando la tipografía de la configuración y tamaño fijo 10pt
    const htmlTable = `<table style="font-family: ${config.fontFamily}; font-size: 10pt; border-collapse: collapse; width: 100%;">
  <thead>
    <tr>
      <th style="border: 1px solid #000000; padding: 4px 8px; text-align: left; font-size: 10pt;">${thProcess}</th>
      <th style="border: 1px solid #000000; padding: 4px 8px; text-align: center; font-size: 10pt;">${thImportance}</th>
      <th style="border: 1px solid #000000; padding: 4px 8px; text-align: center; font-size: 10pt;">${thHealth}</th>
      <th style="border: 1px solid #000000; padding: 4px 8px; text-align: center; font-size: 10pt;">${thFeasibility}</th>
    </tr>
  </thead>
  <tbody>
    ${procs.map((p) => `
      <tr>
        <td style="border: 1px solid #000000; padding: 4px 8px; font-size: 10pt;">${escapeXml(p.name)}</td>
        <td style="border: 1px solid #000000; padding: 4px 8px; text-align: center; font-size: 10pt;">${p.importance}</td>
        <td style="border: 1px solid #000000; padding: 4px 8px; text-align: center; font-size: 10pt;">${p.health}</td>
        <td style="border: 1px solid #000000; padding: 4px 8px; text-align: center; font-size: 10pt;">${p.feasibility}</td>
      </tr>
    `).join('')}
  </tbody>
</table>`.trim();

    // Texto plano delimitado por tabulaciones (TSV) como fallback universal
    const plainTextTable = [
      `${thProcess}\t${thImportance}\t${thHealth}\t${thFeasibility}`,
      ...procs.map((p) => `${p.name}\t${p.importance}\t${p.health}\t${p.feasibility}`)
    ].join('\n');

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

  const downloadDrawio = () => {
    const xml = generatePortfolioXML(visibleProcesses, config);
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `portafolio_procesos_${config.language}.drawio`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = () => {
    const source = getCleanSVGSource();
    if (!source) return;
    const img = new Image();
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        const a = document.createElement('a');
        a.download = `portafolio_procesos_${config.language}.png`;
        a.href = canvas.toDataURL('image/png');
        a.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const downloadSVG = () => {
    const source = getCleanSVGSource();
    if (!source) return;
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const a = document.createElement('a');
    a.download = `portafolio_procesos_${config.language}.svg`;
    a.href = URL.createObjectURL(blob);
    a.click();
  };

  const downloadJPEG = () => {
    const source = getCleanSVGSource();
    if (!source) return;
    const img = new Image();
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        const a = document.createElement('a');
        a.download = `portafolio_procesos_${config.language}.jpg`;
        a.href = canvas.toDataURL('image/jpeg', 0.95);
        a.click();
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  const downloadPDF = () => {
    const source = getCleanSVGSource();
    if (!source) return;
    const img = new Image();
    const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = W * 2;
      canvas.height = H * 2;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(2, 2);
        ctx.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/png');

        const orientation = W >= H ? 'landscape' : 'portrait';
        const pdf = new jsPDF({
          orientation: orientation,
          unit: 'px',
          format: [W + 40, H + 40],
        });

        pdf.addImage(dataUrl, 'PNG', 20, 20, W, H);
        pdf.save(`portafolio_procesos_${config.language}.pdf`);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      {/* COLUMNA IZQUIERDA: MEDIDAS DE DESEMPEÑO Y CONTROLES */}
      <div className="lg:col-span-4 flex flex-col gap-3 bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
          {/* Cabecera: Título Limpio + Filtros por Categoría */}
          <div className="flex flex-col gap-2.5 pb-3 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-semibold text-slate-900">
                  {isEs ? 'Medidas de desempeño' : 'Performance Metrics'}
                </h3>
                {/* Botón Flotante No Invasivo con Guía de Escala */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowScaleGuide(!showScaleGuide)}
                    onMouseEnter={() => setShowScaleGuide(true)}
                    onMouseLeave={() => setShowScaleGuide(false)}
                    className="p-0.5 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                    title={isEs ? 'Ver guía de escala (1-5)' : 'View scale guide (1-5)'}
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
                        <span>1 = {isEs ? 'Saludable' : 'Healthy'}</span> | <span>5 = {isEs ? 'Problemas graves' : 'Severe issues'}</span>
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

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyTableToClipboard}
                className={`flex items-center gap-1.5 px-2 py-1 rounded text-[11px] font-medium transition-all cursor-pointer border ${
                  copiedTable
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
                }`}
                title={isEs ? 'Copiar tabla formateada para Word, Google Docs o Excel' : 'Copy formatted table for Word, Google Docs or Excel'}
              >
                {copiedTable ? <Check className="w-3 h-3 text-emerald-600" /> : <Table className="w-3 h-3 text-slate-500" />}
                <span>{copiedTable ? (isEs ? '¡Copiado!' : 'Copied!') : (isEs ? 'Copiar tabla' : 'Copy table')}</span>
              </button>
              <span className="text-[11px] font-medium text-slate-500">
                {visibleProcesses.length} {isEs ? 'visibles' : 'visible'}
              </span>
            </div>
          </div>

          {/* Filtros por Categoría */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs font-medium">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`flex-1 py-1 text-center rounded transition-colors cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isEs ? 'Todos' : 'All'} ({processes.filter((p) => p.visible !== false).length})
            </button>
            <button
              onClick={() => setSelectedCategory('management')}
              className={`flex-1 py-1 text-center rounded transition-colors cursor-pointer ${
                selectedCategory === 'management'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isEs ? 'Gestión' : 'Mgmt'}
            </button>
            <button
              onClick={() => setSelectedCategory('core')}
              className={`flex-1 py-1 text-center rounded transition-colors cursor-pointer ${
                selectedCategory === 'core'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isEs ? 'Clave' : 'Core'}
            </button>
            <button
              onClick={() => setSelectedCategory('support')}
              className={`flex-1 py-1 text-center rounded transition-colors cursor-pointer ${
                selectedCategory === 'support'
                  ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {isEs ? 'Soporte' : 'Supp'}
            </button>
          </div>
        </div>

        {/* Lista Unificada de Procesos (Scrollable) */}
        <div className="flex flex-col gap-2.5 max-h-[560px] overflow-y-auto pr-1">
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
                {/* Nombre + Toggle Visibilidad + Badge Categoría */}
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
                            ? isVisible
                              ? 'Ocultar en la matriz'
                              : 'Mostrar en la matriz'
                            : isVisible
                            ? 'Hide on matrix'
                            : 'Show on matrix'
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
                      ? isEs
                        ? 'Gestión'
                        : 'Mgmt'
                      : proc.category === 'core'
                      ? isEs
                        ? 'Clave'
                        : 'Core'
                      : isEs
                      ? 'Soporte'
                      : 'Supp'}
                  </span>
                </div>

                {/* Selectores de Medidas 1-5 (1-Clic) */}
                {onUpdateProcess && isVisible && (
                  <div
                    className="flex flex-col gap-1.5 pt-1.5 border-t border-slate-100"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <RatingPills
                      label={isEs ? 'Salud' : 'Health'}
                      value={proc.health}
                      lowText={isEs ? 'Saludable' : 'Healthy'}
                      highText={isEs ? 'Problemas graves' : 'Severe issues'}
                      onChange={(num) => onUpdateProcess(proc.id, { health: num })}
                    />
                    <RatingPills
                      label={isEs ? 'Importancia' : 'Importance'}
                      value={proc.importance}
                      lowText={isEs ? 'Muy baja' : 'Very low'}
                      highText={isEs ? 'Muy alta' : 'Very high'}
                      onChange={(num) => onUpdateProcess(proc.id, { importance: num })}
                    />
                    <RatingPills
                      label={isEs ? 'Factibilidad' : 'Feasibility'}
                      value={proc.feasibility}
                      lowText={isEs ? 'Muy difícil intervenir' : 'Very hard'}
                      highText={isEs ? 'Altamente factible' : 'Highly feasible'}
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
      <div className="lg:col-span-8 flex flex-col gap-3">
        {/* Barra Superior con Exportaciones */}
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-2.5 shadow-2xs">
          <span className="text-xs font-semibold text-slate-900">
            {isEs ? 'Matriz 2x2 de Portafolio' : '2x2 Portfolio Matrix'}
          </span>

          {/* Menú Desplegable Único de Descarga */}
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
                  onClick={downloadDrawio}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="font-medium text-slate-800">Draw.io</span>
                  <span className="text-[10px] text-slate-400 font-mono">.drawio</span>
                </button>
                <button
                  onClick={downloadPNG}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="font-medium text-slate-800">PNG</span>
                  <span className="text-[10px] text-slate-400 font-mono">.png</span>
                </button>
                <button
                  onClick={downloadSVG}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="font-medium text-slate-800">SVG</span>
                  <span className="text-[10px] text-slate-400 font-mono">.svg</span>
                </button>
                <button
                  onClick={downloadJPEG}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="font-medium text-slate-800">JPEG</span>
                  <span className="text-[10px] text-slate-400 font-mono">.jpg</span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={downloadPDF}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer text-slate-800 font-medium"
                >
                  <span>PDF</span>
                  <span className="text-[10px] text-slate-400 font-mono">.pdf</span>
                </button>
                <div className="my-1 border-t border-slate-100" />
                <button
                  onClick={copyTableToClipboard}
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span className="font-medium text-slate-800 flex items-center gap-1.5">
                    {copiedTable ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Table className="w-3.5 h-3.5 text-slate-500" />}
                    <span>{isEs ? 'Copiar Tabla (Word/Docs)' : 'Copy Table (Word/Docs)'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{copiedTable ? (isEs ? '¡Listo!' : 'Done!') : '.table'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Lienzo SVG de la Matriz */}
        <div className="flex justify-center items-center bg-white border border-slate-200 rounded-lg p-5 shadow-2xs overflow-x-auto">
          <svg
            id="portfolio-svg"
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${W} ${H}`}
            width={W}
            height={H}
            className="bg-white select-none block max-w-full h-auto"
            style={{ fontFamily: config.fontFamily }}
          >
            <rect width={W} height={H} fill="#ffffff" />
            <rect x={boxX} y={boxY} width={boxW} height={boxH} fill="none" stroke="#333333" strokeWidth="1.4" />
            <line x1={boxX} y1={midY} x2={boxX + boxW} y2={midY} stroke="#333333" strokeWidth="1.2" opacity="0.3" />
            <line x1={midX} y1={boxY} x2={midX} y2={boxY + boxH} stroke="#333333" strokeWidth="1.2" opacity="0.3" />

            {/* Eje Y (Importance) */}
            <text
              x={-midY}
              y={boxX - 18}
              transform="rotate(-90)"
              textAnchor="middle"
              fill="#222222"
              fontSize="16"
              fontWeight="normal"
            >
              {isEs ? 'Importancia' : 'Importance'}
            </text>
            <text x={boxX - 8} y={boxY + 12} textAnchor="end" fill="#222222" fontSize="14">
              {isEs ? 'Alta' : 'High'}
            </text>
            <text x={boxX - 8} y={boxY + boxH - 2} textAnchor="end" fill="#222222" fontSize="14">
              {isEs ? 'Baja' : 'Low'}
            </text>

            {/* Eje X (Health) */}
            <text x={midX} y={boxY + boxH + 28} textAnchor="middle" fill="#222222" fontSize="16">
              {isEs ? 'Salud' : 'Health'}
            </text>
            <text x={boxX + 6} y={boxY + boxH + 26} textAnchor="start" fill="#222222" fontSize="14">
              {isEs ? 'Deficiente' : 'Poor'}
            </text>
            <text x={boxX + boxW - 6} y={boxY + boxH + 26} textAnchor="end" fill="#222222" fontSize="14">
              {isEs ? 'Bueno' : 'Good'}
            </text>

            {/* Leyenda Factibilidad */}
            <g transform="translate(950, 40)">
              <text x="0" y="16" fill="#222222" fontSize="16" fontWeight="normal">
                {isEs ? 'Factibilidad' : 'Feasibility'}
              </text>

              <circle cx="14" cy="58" r={radius} fill={getFeasibilityColor(1.0)} stroke="#262626" strokeWidth="1.3" />
              <text x="38" y="63" fill="#222222" fontSize="14.5">{isEs ? 'Baja' : 'Low'}</text>

              <circle cx="14" cy="116" r={radius} fill={getFeasibilityColor(3.0)} stroke="#262626" strokeWidth="1.3" />
              <text x="38" y="121" fill="#222222" fontSize="14.5">{isEs ? 'Media' : 'Medium'}</text>

              <circle cx="14" cy="174" r={radius} fill={getFeasibilityColor(5.0)} stroke="#262626" strokeWidth="1.3" />
              <text x="38" y="179" fill="#222222" fontSize="14.5">{isEs ? 'Alta' : 'High'}</text>
            </g>

            {/* Capa de Conexión / Cápsulas para Procesos en la Misma Coordenada (Clusters) */}
            <g id="clusters-layer">
              {clusters.map((cluster) => {
                const clusterR = coords[cluster.indices[0]]?.r || radius;
                const pad = 3;
                const x = cluster.minX - clusterR - pad;
                const y = cluster.minY - clusterR - pad;
                const w = cluster.maxX - cluster.minX + (clusterR + pad) * 2;
                const h = cluster.maxY - cluster.minY + (clusterR + pad) * 2;
                const rx = clusterR + pad;

                return (
                  <g key={cluster.key} className="pointer-events-none">
                    {/* Cápsula de fondo sutil que abraza ordenadamente el grupo */}
                    <rect
                      x={x.toFixed(1)}
                      y={y.toFixed(1)}
                      width={w.toFixed(1)}
                      height={h.toFixed(1)}
                      rx={rx.toFixed(1)}
                      ry={rx.toFixed(1)}
                      fill="#f8fafc"
                      stroke="#cbd5e1"
                      strokeWidth="1.1"
                      strokeDasharray="4 3"
                      opacity="0.85"
                    />
                  </g>
                );
              })}
            </g>

            {/* Nodos de Procesos Visibles */}
            <g id="processes-layer">
              {visibleProcesses.map((proc, idx) => {
                const { cx, cy, r: procRadius } = coords[idx];
                const col = getFeasibilityColor(proc.feasibility);
                const isSelected = selectedProcessId === proc.id;
                const label = placedLabels[idx] || {
                  tx: cx,
                  ty: cy - procRadius - 6,
                  anchor: 'middle' as const,
                  lines: [proc.name],
                  bbox: { x: cx, y: cy, w: 50, h: 20 },
                };
                const lineH = 13.5;

                return (
                  <g
                    key={proc.id}
                    onPointerDown={(e) => handlePointerDown(e, proc.id)}
                    onPointerMove={(e) => handlePointerMove(e, proc.id)}
                    onPointerUp={(e) => handlePointerUp(e, proc.id)}
                    className={`group cursor-grab active:cursor-grabbing select-none ${
                      draggingProcessId === proc.id ? 'opacity-80' : ''
                    }`}
                  >
                    {/* Línea guía (Leader line) punteada si la etiqueta requirió desplazamiento seguro */}
                    {label.leaderLine && (
                      <line
                        x1={label.leaderLine.x1.toFixed(1)}
                        y1={label.leaderLine.y1.toFixed(1)}
                        x2={label.leaderLine.x2.toFixed(1)}
                        y2={label.leaderLine.y2.toFixed(1)}
                        stroke="#94a3b8"
                        strokeWidth="1.1"
                        strokeDasharray="3 2"
                        className="pointer-events-none"
                      />
                    )}

                    <circle
                      data-selected={isSelected ? 'true' : undefined}
                      data-radius={procRadius.toString()}
                      cx={cx.toFixed(1)}
                      cy={cy.toFixed(1)}
                      r={isSelected ? procRadius + 2 : procRadius}
                      fill={col}
                      stroke={isSelected ? '#000000' : '#262626'}
                      strokeWidth={isSelected ? '2.8' : '1.3'}
                      className="transition-all"
                    />
                    <text
                      data-selected={isSelected ? 'true' : undefined}
                      x={label.tx.toFixed(1)}
                      y={label.ty.toFixed(1)}
                      textAnchor={label.anchor}
                      fontSize={config.fontSize - 1.5}
                      fill={isSelected ? '#000000' : '#1a1a1a'}
                      fontWeight={isSelected ? '700' : 'normal'}
                      style={{ lineHeight: 1.15 }}
                    >
                      {label.lines.map((ln, lIdx) => (
                        <tspan key={lIdx} x={label.tx.toFixed(1)} dy={lIdx === 0 ? 0 : lineH}>
                          {escapeXml(ln)}
                        </tspan>
                      ))}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>
      </div>
    </div>
  );
};

export default PortfolioView;


