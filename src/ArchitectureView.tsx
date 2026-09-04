import React, { useMemo, useState, useEffect } from 'react';
import { BPMProcess, AppConfig } from './types';
import { generateArchitectureXML, escapeXml, updateArchitectureXMLNames, updateArchitectureSVGNames } from './drawio';
import { DrawioEmbed } from './DrawioEmbed';
import { Download, Edit3, X, Check, RotateCcw, ChevronDown, Info } from 'lucide-react';
import { toast } from 'react-toastify';
import { jsPDF } from 'jspdf';

interface ArchitectureViewProps {
  processes: BPMProcess[];
  config: AppConfig;
  coreGroupsOrder?: string[];
}

function wrapText(text: string, maxLineLen: number = 16): string[] {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/);
  if (words.length <= 1) return [trimmed];

  const lines: string[] = [];
  let currentLine = words[0];

  for (let i = 1; i < words.length; i++) {
    const word = words[i];
    if ((currentLine + ' ' + word).length <= maxLineLen) {
      currentLine += ' ' + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }
  lines.push(currentLine);
  return lines;
}

export const ArchitectureView: React.FC<ArchitectureViewProps> = ({
  processes,
  config,
  coreGroupsOrder = [],
}) => {
  const isEs = config.language === 'es';
  const defaultGroupName = isEs ? 'Línea Principal' : 'Main Line';

  const STORAGE_KEY_XML = `bpm_arch_custom_xml_${config.language}`;
  const STORAGE_KEY_SVG = `bpm_arch_custom_svg_${config.language}`;
  const STORAGE_KEY_META = `bpm_arch_custom_meta_${config.language}`;

  const [customXml, setCustomXml] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_XML);
  });
  const [customSvg, setCustomSvg] = useState<string | null>(() => {
    return localStorage.getItem(STORAGE_KEY_SVG);
  });
  const [customMeta, setCustomMeta] = useState<{ processIds: string[] } | null>(() => {
    const saved = localStorage.getItem(STORAGE_KEY_META);
    return saved ? JSON.parse(saved) : null;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isDownloadOpen, setIsDownloadOpen] = useState(false);

  // Detectar si la lista de procesos cambió en cantidad respecto a las figuras del diagrama personalizado
  const hasStructuralChanges = useMemo(() => {
    if (!customXml) return false;
    
    // Si tenemos customMeta grabado
    if (customMeta && customMeta.processIds) {
      const currentIds = processes.map((p) => p.id);
      if (currentIds.length !== customMeta.processIds.length) return true;
      if (currentIds.some((id) => !customMeta.processIds.includes(id))) return true;
    }

    // Análisis directo del XML personalizado: contar nodos de procesos
    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(customXml, 'application/xml');
      const cells = Array.from(doc.querySelectorAll('mxCell'));
      
      const mgmtCount = cells.filter((c) => {
        const style = c.getAttribute('style') || '';
        return style.includes('shape=offPageConnector') && !style.includes('direction=west');
      }).length;

      const coreCount = cells.filter((c) => {
        const style = c.getAttribute('style') || '';
        return style.includes('shape=mxgraph.arrows2.arrow');
      }).length;

      const suppCount = cells.filter((c) => {
        const style = c.getAttribute('style') || '';
        return style.includes('shape=offPageConnector') && style.includes('direction=west');
      }).length;

      const currentMgmt = processes.filter((p) => p.category === 'management').length;
      const currentCore = processes.filter((p) => p.category === 'core').length;
      const currentSupp = processes.filter((p) => p.category === 'support').length;

      if (mgmtCount !== currentMgmt || coreCount !== currentCore || suppCount !== currentSupp) {
        return true;
      }
    } catch {
      // Fallback
    }

    return false;
  }, [customXml, customMeta, processes]);

  const autoXml = useMemo(() => {
    return generateArchitectureXML(processes, config, coreGroupsOrder);
  }, [processes, config, coreGroupsOrder]);

  // Si el usuario editó previamente el XML, actualizamos ÚNICAMENTE los nombres de los procesos sin alterar nada más
  const activeXml = useMemo(() => {
    if (!customXml) return autoXml;
    return updateArchitectureXMLNames(customXml, processes);
  }, [customXml, processes, autoXml]);

  const activeSvg = useMemo(() => {
    if (!customSvg) return null;
    return updateArchitectureSVGNames(customSvg, processes);
  }, [customSvg, processes]);

  useEffect(() => {
    if (customXml) {
      localStorage.setItem(STORAGE_KEY_XML, customXml);
    } else {
      localStorage.removeItem(STORAGE_KEY_XML);
    }
  }, [customXml, STORAGE_KEY_XML]);

  useEffect(() => {
    if (customSvg) {
      localStorage.setItem(STORAGE_KEY_SVG, customSvg);
    } else {
      localStorage.removeItem(STORAGE_KEY_SVG);
    }
  }, [customSvg, STORAGE_KEY_SVG]);

  useEffect(() => {
    if (customMeta) {
      localStorage.setItem(STORAGE_KEY_META, JSON.stringify(customMeta));
    } else {
      localStorage.removeItem(STORAGE_KEY_META);
    }
  }, [customMeta, STORAGE_KEY_META]);

  const handleSaveFromEditor = (newXml: string, newSvg: string) => {
    setCustomXml(newXml);
    setCustomSvg(newSvg);
    setCustomMeta({ processIds: processes.map((p) => p.id) });
    setIsEditing(false);
    toast.success(isEs ? '¡Arquitectura guardada con éxito!' : 'Architecture saved successfully!');
  };

  const handleResetToAuto = () => {
    setCustomXml(null);
    setCustomSvg(null);
    setCustomMeta(null);
    toast.info(isEs ? 'Diagrama restaurado al diseño automático' : 'Diagram restored to auto layout');
  };

  const mgmt = useMemo(
    () => processes.filter((p) => p.category === 'management'),
    [processes]
  );
  const core = useMemo(
    () => processes.filter((p) => p.category === 'core'),
    [processes]
  );
  const supp = useMemo(
    () => processes.filter((p) => p.category === 'support'),
    [processes]
  );

  const groupsMap = useMemo(() => {
    const map = new Map<string, BPMProcess[]>();

    if (coreGroupsOrder && coreGroupsOrder.length > 0) {
      coreGroupsOrder.forEach((g) => map.set(g, []));
    }

    core.forEach((p) => {
      const gName = p.groupName && p.groupName.trim() ? p.groupName.trim() : defaultGroupName;
      if (!map.has(gName)) {
        map.set(gName, []);
      }
      map.get(gName)!.push(p);
    });

    Array.from(map.keys()).forEach((gName) => {
      const procs = map.get(gName)!;
      if (procs.length === 0) {
        map.delete(gName);
      }
    });

    map.forEach((procsInG, gName) => {
      procsInG.sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));
      map.set(gName, procsInG);
    });
    return map;
  }, [core, coreGroupsOrder, defaultGroupName]);

  const hasMulti = groupsMap.size > 1;
  const minW = 400;
  const mgmtW = Math.max(1, mgmt.length) * 160 + Math.max(0, mgmt.length - 1) * 16 + 80;
  let maxCoreW = 0;
  groupsMap.forEach((procs) => {
    const count = Math.max(1, procs.length);
    const leftLabelW = hasMulti ? 150 : 0;
    const startX = hasMulti ? leftLabelW : 24;
    const w = startX + count * 160 + Math.max(0, count - 1) * 24 + 80;
    if (w > maxCoreW) maxCoreW = w;
  });
  const suppW = Math.max(1, supp.length) * 145 + Math.max(0, supp.length - 1) * 14 + 80;
  const W = Math.max(minW, mgmtW, maxCoreW, suppW);
  const outerX = 30;
  const outerY = 30;
  const outerW = W - 60;
  const numGroups = Math.max(1, groupsMap.size);
  const rowH_mgmt = 114;
  const coreRowH = 75;
  const rowH_core = 36 + numGroups * coreRowH;
  const rowH_supp = 114;
  const totalH = rowH_mgmt + rowH_core + rowH_supp;
  const svgH = outerY * 2 + totalH;

  const getArchitectureSVGSource = (): { source: string; width: number; height: number } | null => {
    if (activeSvg) {
      const container = document.getElementById('architecture-svg-preview-container');
      const svgElem = container?.querySelector('svg');

      let targetW = W;
      let targetH = svgH;

      if (svgElem) {
        // Parsear dimensiones reales del viewBox o del BoundingBox renderizado
        const viewBox = svgElem.getAttribute('viewBox');
        if (viewBox) {
          const parts = viewBox.trim().split(/[\s,]+/).map(Number);
          if (parts.length === 4 && parts[2] > 0 && parts[3] > 0) {
            targetW = parts[2];
            targetH = parts[3];
          }
        } else {
          const bbox = svgElem.getBBox ? svgElem.getBBox() : null;
          if (bbox && bbox.width > 0 && bbox.height > 0) {
            targetW = Math.ceil(bbox.x + bbox.width + 20);
            targetH = Math.ceil(bbox.y + bbox.height + 20);
          } else {
            const wAttr = parseFloat(svgElem.getAttribute('width') || '');
            const hAttr = parseFloat(svgElem.getAttribute('height') || '');
            if (!isNaN(wAttr) && wAttr > 0) targetW = wAttr;
            if (!isNaN(hAttr) && hAttr > 0) targetH = hAttr;
          }
        }
      }

      let cleanSource = activeSvg.trim();

      // Asegurar namespace XML obligatorio
      if (!cleanSource.includes('xmlns="http://www.w3.org/2000/svg"')) {
        cleanSource = cleanSource.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
      }

      // Reemplazar o asegurar atributos explícitos de width, height y viewBox
      const hasViewBox = cleanSource.includes('viewBox=');
      if (!hasViewBox) {
        cleanSource = cleanSource.replace('<svg', `<svg viewBox="0 0 ${targetW} ${targetH}"`);
      }

      cleanSource = cleanSource.replace(/width="[^"]*"/, `width="${targetW}"`);
      cleanSource = cleanSource.replace(/height="[^"]*"/, `height="${targetH}"`);

      // Inyectar o actualizar el bloque <style> dentro del SVG para forzar que los div de foreignObject y textos mantengan el tamaño exacto de 11px y la tipografía
      const embeddedStyles = `<style>
        svg { font-family: ${config.fontFamily || 'Arial, sans-serif'}; }
        div, span, p, text { font-family: ${config.fontFamily || 'Arial, sans-serif'} !important; }
        foreignObject div { font-size: 11px !important; line-height: 1.2 !important; }
      </style>`;

      if (cleanSource.includes('<style')) {
        cleanSource = cleanSource.replace(/<style[^>]*>[\s\S]*?<\/style>/i, embeddedStyles);
      } else {
        cleanSource = cleanSource.replace(/(<svg[^>]*>)/i, `$1${embeddedStyles}`);
      }

      return { source: cleanSource, width: targetW, height: targetH };
    }

    const svgElem = document.getElementById('architecture-svg-preview');
    if (!svgElem) return null;
    const serializer = new XMLSerializer();
    let src = serializer.serializeToString(svgElem);

    const embeddedStyles = `<style>
      svg { font-family: ${config.fontFamily || 'Arial, sans-serif'}; }
      div, span, text { font-family: ${config.fontFamily || 'Arial, sans-serif'} !important; }
    </style>`;

    if (src.includes('<style')) {
      src = src.replace(/<style[^>]*>[\s\S]*?<\/style>/i, embeddedStyles);
    } else {
      src = src.replace(/(<svg[^>]*>)/i, `$1${embeddedStyles}`);
    }

    return {
      source: src,
      width: W,
      height: svgH,
    };
  };

  const createRasterBlob = async (
    data: { source: string; width: number; height: number },
    format: 'image/png' | 'image/jpeg'
  ): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const encodedSvg = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(data.source);

      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          // Escala 2x para resolución HD sin alterar la proporción original
          const scale = 2;
          canvas.width = data.width * scale;
          canvas.height = data.height * scale;
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }
          if (format === 'image/jpeg') {
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
          }
          ctx.scale(scale, scale);
          ctx.drawImage(img, 0, 0, data.width, data.height);
          resolve(canvas.toDataURL(format, format === 'image/jpeg' ? 0.95 : undefined));
        } catch (err) {
          reject(err);
        }
      };

      img.onerror = (err) => {
        reject(err);
      };

      img.src = encodedSvg;
    });
  };

  const downloadSVG = () => {
    const data = getArchitectureSVGSource();
    if (!data) return;
    const blob = new Blob([data.source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.download = `arquitectura_procesos_${config.language}.svg`;
    a.href = url;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPNG = async () => {
    const data = getArchitectureSVGSource();
    if (!data) return;
    try {
      const dataUrl = await createRasterBlob(data, 'image/png');
      const a = document.createElement('a');
      a.download = `arquitectura_procesos_${config.language}.png`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error('Error generating PNG:', err);
    }
  };

  const downloadJPEG = async () => {
    const data = getArchitectureSVGSource();
    if (!data) return;
    try {
      const dataUrl = await createRasterBlob(data, 'image/jpeg');
      const a = document.createElement('a');
      a.download = `arquitectura_procesos_${config.language}.jpg`;
      a.href = dataUrl;
      a.click();
    } catch (err) {
      console.error('Error generating JPEG:', err);
    }
  };

  const downloadPDF = async () => {
    const data = getArchitectureSVGSource();
    if (!data) return;
    try {
      const dataUrl = await createRasterBlob(data, 'image/png');
      const orientation = data.width >= data.height ? 'landscape' : 'portrait';
      const pdf = new jsPDF({
        orientation: orientation,
        unit: 'px',
        format: [data.width + 40, data.height + 40],
      });

      pdf.addImage(dataUrl, 'PNG', 20, 20, data.width, data.height);
      pdf.save(`arquitectura_procesos_${config.language}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
    }
  };

  const downloadDrawio = () => {
    const blob = new Blob([activeXml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `arquitectura_procesos_${config.language}.drawio`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-[9999] bg-white w-screen h-screen">
        <DrawioEmbed
          xml={activeXml}
          title={`arquitectura_procesos_${config.language}`}
          onClose={() => setIsEditing(false)}
          onSave={(savedXml, savedSvg) => {
            handleSaveFromEditor(savedXml, savedSvg);
            setIsEditing(false);
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Aviso informativo elegante alineado con la paleta de la aplicación */}
      {hasStructuralChanges && (
        <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-3 text-xs text-slate-800 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="font-semibold text-slate-900">
                {isEs ? 'Se detectaron cambios en el inventario de procesos' : 'Process inventory changes detected'}
              </span>
              <p className="text-slate-500 leading-relaxed">
                {isEs
                  ? 'Tu diagrama personalizado conserva su diseño original y actualiza los nombres automáticamente. Para agregar o quitar figuras según los nuevos procesos, puedes abrir el Editor o restablecer al diseño automático.'
                  : 'Your custom diagram preserves its layout and syncs process names automatically. To add or remove shapes for new processes, open the Editor or restore auto layout.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-4">
            <button
              onClick={handleResetToAuto}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors cursor-pointer"
            >
              {isEs ? 'Diseño automático' : 'Auto layout'}
            </button>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer shadow-2xs"
            >
              {isEs ? 'Abrir Editor' : 'Open Editor'}
            </button>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-2.5 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-slate-700">
            {isEs ? 'Diagrama de Arquitectura' : 'Architecture Diagram'}
          </span>
          {customXml && (
            <span className="text-[10px] bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded font-medium">
              {isEs ? 'Personalizado' : 'Custom'}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {customXml && (
            <button
              onClick={handleResetToAuto}
              title={isEs ? 'Restablecer al diseño automático' : 'Restore auto layout'}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer shadow-2xs"
          >
            <Edit3 className="w-3.5 h-3.5" />
            {isEs ? 'Editar' : 'Edit'}
          </button>

          <div className="relative">
            <button
              onClick={() => setIsDownloadOpen(!isDownloadOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-md transition-colors cursor-pointer"
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
                  className="w-full px-3 py-2 text-left hover:bg-slate-50 flex items-center justify-between transition-colors cursor-pointer text-blue-600 font-medium"
                >
                  <span>PDF</span>
                  <span className="text-[10px] text-blue-400 font-mono">.pdf</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="bg-white border border-slate-200 rounded-lg p-6 shadow-2xs w-full flex justify-center items-center overflow-x-auto"
        style={{ colorScheme: 'light' }}
      >
        {activeSvg ? (
          <div
            id="architecture-svg-preview-container"
            className="w-full flex justify-center overflow-visible [&>svg]:max-w-full [&>svg]:h-auto [&>svg]:overflow-visible [&>svg]:block [&_div]:text-[11px] [&_div]:leading-tight"
            style={{ colorScheme: 'light', fontFamily: config.fontFamily }}
            dangerouslySetInnerHTML={{ __html: activeSvg }}
          />
        ) : (
          <div className="w-full flex justify-center">
            <svg
              id="architecture-svg-preview"
              xmlns="http://www.w3.org/2000/svg"
              viewBox={`0 0 ${W} ${svgH}`}
              width={W}
              height={svgH}
              style={{ maxWidth: '100%', height: 'auto', fontFamily: config.fontFamily }}
              className="bg-white select-none block"
            >
              <rect width={W} height={svgH} fill="#ffffff" />

              {/* Fondo Gris para Management */}
              <rect
                x={outerX}
                y={outerY}
                width={outerW}
                height={rowH_mgmt}
                fill="#d6d6d6"
                stroke="#333333"
                strokeWidth="1.6"
              />
              <text x={outerX + 6} y={outerY + 20} fill="#111111" fontSize="12" fontWeight="bold">
                {isEs ? 'Procesos de gestión' : 'Management Processes'}
              </text>

              {/* Fondo Blanco para Core */}
              <rect
                x={outerX}
                y={outerY + rowH_mgmt}
                width={outerW}
                height={rowH_core}
                fill="#ffffff"
                stroke="#333333"
                strokeWidth="1.6"
              />
              <text
                x={outerX + 6}
                y={outerY + rowH_mgmt + 20}
                fill="#111111"
                fontSize="12"
                fontWeight="bold"
              >
                {isEs ? 'Procesos principales' : 'Core Processes'}
              </text>

              {/* Fondo Gris para Support */}
              <rect
                x={outerX}
                y={outerY + rowH_mgmt + rowH_core}
                width={outerW}
                height={rowH_supp}
                fill="#d6d6d6"
                stroke="#333333"
                strokeWidth="1.6"
              />
              <text
                x={outerX + 6}
                y={outerY + rowH_mgmt + rowH_core + 20}
                fill="#111111"
                fontSize="12"
                fontWeight="bold"
              >
                {isEs ? 'Procesos de apoyo' : 'Support Processes'}
              </text>

              {/* Procesos Management (CENTRADOS) */}
              {(() => {
                const count = Math.max(1, mgmt.length);
                const cardW = 160;
                const gap = 16;
                const totalWidth = count * cardW + (count - 1) * gap;
                const startX = outerX + (outerW - totalWidth) / 2;
                const y = outerY + 32;
                const h = 70;
                const vCut = 14;
                const lineH = 13;
                const fontSize = Math.min(config.fontSize - 1.5, 11);

                return mgmt.map((proc, idx) => {
                  const x = startX + idx * (cardW + gap);
                  const pts = `${x},${y} ${x + cardW},${y} ${x + cardW},${y + h - vCut} ${
                    x + cardW / 2
                  },${y + h} ${x},${y + h - vCut}`;
                  const lines = wrapText(proc.name, 18);
                  const startTextY = y + 26 - ((lines.length - 1) * lineH) / 2;

                  return (
                    <g key={proc.id}>
                      <polygon points={pts} fill="#ffffff" stroke="#333333" strokeWidth="1.3" />
                      <text
                        x={x + cardW / 2}
                        y={startTextY}
                        textAnchor="middle"
                        fontSize={fontSize}
                        fill="#111111"
                        fontWeight="500"
                      >
                        {lines.map((l, li) => (
                          <tspan key={li} x={x + cardW / 2} dy={li === 0 ? 0 : lineH}>
                            {escapeXml(l)}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  );
                });
              })()}

              {/* Procesos Core (ALINEADOS POR COLUMNA Y CONECTADOS EN ORDEN SECUENCIAL) */}
              {Array.from(groupsMap.entries()).map(([gName, procs], gIdx) => {
                const startY = outerY + rowH_mgmt + 32 + gIdx * coreRowH;
                const leftLabelW = hasMulti ? 150 : 0;
                const gap = 24;
                const chevW = 160;
                const chevH = 54;
                const arrowCut = 30;
                const startX = outerX + (hasMulti ? leftLabelW : 24);
                const lineH = 13;
                const fontSize = Math.min(config.fontSize - 1.5, 11);

                return (
                  <g key={gName}>
                    {hasMulti && (
                      <text
                        x={outerX + 16}
                        y={startY + chevH / 2 + 4}
                        fill="#111111"
                        fontSize="11"
                        fontWeight="bold"
                        textAnchor="start"
                      >
                        {escapeXml(gName)}
                      </text>
                    )}

                    {procs.map((proc, pIdx) => {
                      const x = startX + pIdx * (chevW + gap);
                      const y = startY + 8;
                      const pts = `${x},${y} ${x + chevW - arrowCut},${y} ${
                        x + chevW
                      },${y + chevH / 2} ${x + chevW - arrowCut},${y + chevH} ${x},${
                        y + chevH
                      } ${x + arrowCut},${y + chevH / 2}`;

                      const lines = wrapText(proc.name, 16);
                      const startTextY = y + 31 - ((lines.length - 1) * lineH) / 2;

                      let lineRender = null;
                      if (pIdx < procs.length - 1) {
                        const nextX = startX + (pIdx + 1) * (chevW + gap);
                        lineRender = (
                          <line
                            x1={x + chevW}
                            y1={y + chevH / 2}
                            x2={nextX + arrowCut}
                            y2={y + chevH / 2}
                            stroke="#333333"
                            strokeWidth="1.4"
                          />
                        );
                      }

                      return (
                        <g key={proc.id}>
                          {lineRender}
                          <polygon points={pts} fill="#ffffff" stroke="#333333" strokeWidth="1.4" />
                          <text
                            x={x + chevW / 2 + 2}
                            y={startTextY}
                            textAnchor="middle"
                            fontSize={fontSize}
                            fill="#111111"
                            fontWeight="500"
                          >
                            {lines.map((l, li) => (
                              <tspan key={li} x={x + chevW / 2 + 2} dy={li === 0 ? 0 : lineH}>
                                {escapeXml(l)}
                              </tspan>
                            ))}
                          </text>
                        </g>
                      );
                    })}
                  </g>
                );
              })}

              {/* Procesos Support (CENTRADOS) */}
              {(() => {
                const count = Math.max(1, supp.length);
                const cardW = 145;
                const gap = 16;
                const totalWidth = count * cardW + (count - 1) * gap;
                const startX = outerX + (outerW - totalWidth) / 2;
                const y = outerY + rowH_mgmt + rowH_core + 32;
                const h = 70;
                const roofH = 14;
                const lineH = 13;
                const fontSize = Math.min(config.fontSize - 1.5, 11);

                return supp.map((proc, idx) => {
                  const x = startX + idx * (cardW + gap);
                  const pts = `${x + cardW / 2},${y} ${x + cardW},${y + roofH} ${
                    x + cardW
                  },${y + h} ${x},${y + h} ${x},${y + roofH}`;
                  const lines = wrapText(proc.name, 16);
                  const startTextY = y + 40 - ((lines.length - 1) * lineH) / 2;

                  return (
                    <g key={proc.id}>
                      <polygon points={pts} fill="#ffffff" stroke="#333333" strokeWidth="1.3" />
                      <text
                        x={x + cardW / 2}
                        y={startTextY}
                        textAnchor="middle"
                        fontSize={fontSize}
                        fill="#111111"
                        fontWeight="500"
                      >
                        {lines.map((l, li) => (
                          <tspan key={li} x={x + cardW / 2} dy={li === 0 ? 0 : lineH}>
                            {escapeXml(l)}
                          </tspan>
                        ))}
                      </text>
                    </g>
                  );
                });
              })()}
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};
