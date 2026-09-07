import { BPMProcess, AppConfig } from './types';
import {
  W,
  H,
  boxX,
  boxY,
  boxW,
  boxH,
  midX,
  midY,
  radius,
  computeDispersedClusters,
  resolveOptimalLabelPositions,
  computeFinalPlacedLabels
} from './portfolioLayout';

export function escapeXml(unsafe: string) {
  return unsafe.replace(/[<>&'"]/g, function (c) {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
    return c;
  });
}

// ==========================================
// PORTFOLIO GENERATION
// ==========================================
export function getFeasibilityColor(val: number): string {
  const t = Math.max(0, Math.min(1, (val - 1.0) / 4.0));
  const c = Math.round(34 + t * (226 - 34));
  return `rgb(${c}, ${c}, ${c})`;
}

export function rgbToHex(rgbStr: string): string {
  const m = rgbStr.match(/\d+/g);
  if (!m) return '#808080';
  const r = parseInt(m[0]).toString(16).padStart(2, '0');
  const g = parseInt(m[1]).toString(16).padStart(2, '0');
  const b = parseInt(m[2]).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`.toUpperCase();
}

export function generatePortfolioXML(processes: BPMProcess[], config: AppConfig): string {
  const isEs = config.language === 'es';
  const labels = {
    importance: isEs ? 'Importancia' : 'Importance',
    high: isEs ? 'Alta' : 'High',
    low: isEs ? 'Baja' : 'Low',
    health: isEs ? 'Salud' : 'Health',
    poor: isEs ? 'Deficiente' : 'Poor',
    good: isEs ? 'Bueno' : 'Good',
    feasibility: isEs ? 'Factibilidad' : 'Feasibility',
    medium: isEs ? 'Media' : 'Medium',
  };

  const { coords, clusters } = computeDispersedClusters(processes);
  const resolvedPositions = resolveOptimalLabelPositions(processes, coords, clusters);
  const placedLabels = computeFinalPlacedLabels(processes, coords, resolvedPositions);

  let cid = 2;

  // 1. Marco exterior y líneas centrales principales
  let cells = `
    <mxCell id="0" />
    <mxCell id="1" parent="0" />

    <!-- Marco Exterior Matriz 2x2 -->
    <mxCell id="${cid++}" value="" style="rounded=0;whiteSpace=wrap;html=1;fillColor=none;strokeColor=#333333;strokeWidth=1.4;" vertex="1" parent="1">
      <mxGeometry x="${boxX}" y="${boxY}" width="${boxW}" height="${boxH}" as="geometry" />
    </mxCell>

    <!-- Eje Central Horizontal -->
    <mxCell id="${cid++}" value="" style="endArrow=none;html=1;strokeColor=#333333;strokeWidth=1.2;opacity=30;" edge="1" parent="1">
      <mxGeometry relative="1" as="geometry"><mxPoint x="${boxX}" y="${midY}" as="sourcePoint" /><mxPoint x="${boxX + boxW}" y="${midY}" as="targetPoint" /></mxGeometry>
    </mxCell>

    <!-- Eje Central Vertical -->
    <mxCell id="${cid++}" value="" style="endArrow=none;html=1;strokeColor=#333333;strokeWidth=1.2;opacity=30;" edge="1" parent="1">
      <mxGeometry relative="1" as="geometry"><mxPoint x="${midX}" y="${boxY}" as="sourcePoint" /><mxPoint x="${midX}" y="${boxY + boxH}" as="targetPoint" /></mxGeometry>
    </mxCell>

    <!-- Título Eje Y (Importancia) -->
    <mxCell id="${cid++}" value="${labels.importance}" style="text;html=1;fontColor=#222222;align=center;verticalAlign=middle;rotation=-90;fontSize=16;fontFamily=${config.fontFamily};" vertex="1" parent="1">
      <mxGeometry x="${boxX - 48}" y="${midY - 14}" width="80" height="28" as="geometry" />
    </mxCell>

    <!-- Escalas Eje Y -->
    <mxCell id="${cid++}" value="${labels.high}" style="text;html=1;fontColor=#222222;align=right;verticalAlign=middle;fontSize=14;fontFamily=${config.fontFamily};" vertex="1" parent="1">
      <mxGeometry x="${boxX - 52}" y="${boxY + 2}" width="44" height="24" as="geometry" />
    </mxCell>
    <mxCell id="${cid++}" value="${labels.low}" style="text;html=1;fontColor=#222222;align=right;verticalAlign=middle;fontSize=14;fontFamily=${config.fontFamily};" vertex="1" parent="1">
      <mxGeometry x="${boxX - 52}" y="${boxY + boxH - 24}" width="44" height="24" as="geometry" />
    </mxCell>

    <!-- Título Eje X (Salud) -->
    <mxCell id="${cid++}" value="${labels.health}" style="text;html=1;fontColor=#222222;align=center;verticalAlign=middle;fontSize=16;fontFamily=${config.fontFamily};" vertex="1" parent="1">
      <mxGeometry x="${midX - 50}" y="${boxY + boxH + 16}" width="100" height="28" as="geometry" />
    </mxCell>

    <!-- Escalas Eje X -->
    <mxCell id="${cid++}" value="${labels.good}" style="text;html=1;fontColor=#222222;align=left;verticalAlign=top;fontSize=14;fontFamily=${config.fontFamily};" vertex="1" parent="1">
      <mxGeometry x="${boxX + 4}" y="${boxY + boxH + 14}" width="60" height="24" as="geometry" />
    </mxCell>
    <mxCell id="${cid++}" value="${labels.poor}" style="text;html=1;fontColor=#222222;align=right;verticalAlign=top;fontSize=14;fontFamily=${config.fontFamily};" vertex="1" parent="1">
      <mxGeometry x="${boxX + boxW - 64}" y="${boxY + boxH + 14}" width="60" height="24" as="geometry" />
    </mxCell>

    <!-- Leyenda de Factibilidad -->
    <mxCell id="${cid++}" value="${labels.feasibility}" style="text;html=1;fontColor=#222222;align=left;verticalAlign=middle;fontSize=16;fontFamily=${config.fontFamily};fontStyle=0;" vertex="1" parent="1">
      <mxGeometry x="950" y="40" width="120" height="26" as="geometry" />
    </mxCell>

    <!-- Leyenda: Baja -->
    <mxCell id="${cid++}" value="" style="ellipse;whiteSpace=wrap;html=1;fillColor=${rgbToHex(getFeasibilityColor(1.0))};strokeColor=#262626;strokeWidth=1.3;" vertex="1" parent="1">
      <mxGeometry x="950" y="84" width="${radius * 2}" height="${radius * 2}" as="geometry" />
    </mxCell>
    <mxCell id="${cid++}" value="${labels.low}" style="text;html=1;fontColor=#222222;align=left;verticalAlign=middle;fontSize=14.5;fontFamily=${config.fontFamily};" vertex="1" parent="1">
      <mxGeometry x="988" y="87" width="60" height="24" as="geometry" />
    </mxCell>

    <!-- Leyenda: Media -->
    <mxCell id="${cid++}" value="" style="ellipse;whiteSpace=wrap;html=1;fillColor=${rgbToHex(getFeasibilityColor(3.0))};strokeColor=#262626;strokeWidth=1.3;" vertex="1" parent="1">
      <mxGeometry x="950" y="142" width="${radius * 2}" height="${radius * 2}" as="geometry" />
    </mxCell>
    <mxCell id="${cid++}" value="${labels.medium}" style="text;html=1;fontColor=#222222;align=left;verticalAlign=middle;fontSize=14.5;fontFamily=${config.fontFamily};" vertex="1" parent="1">
      <mxGeometry x="988" y="145" width="60" height="24" as="geometry" />
    </mxCell>

    <!-- Leyenda: Alta -->
    <mxCell id="${cid++}" value="" style="ellipse;whiteSpace=wrap;html=1;fillColor=${rgbToHex(getFeasibilityColor(5.0))};strokeColor=#262626;strokeWidth=1.3;" vertex="1" parent="1">
      <mxGeometry x="950" y="200" width="${radius * 2}" height="${radius * 2}" as="geometry" />
    </mxCell>
    <mxCell id="${cid++}" value="${labels.high}" style="text;html=1;fontColor=#222222;align=left;verticalAlign=middle;fontSize=14.5;fontFamily=${config.fontFamily};" vertex="1" parent="1">
      <mxGeometry x="988" y="203" width="60" height="24" as="geometry" />
    </mxCell>
  `;

  // 2. Cápsulas para clusters de procesos en las mismas coordenadas
  clusters.forEach((cluster) => {
    const clusterR = coords[cluster.indices[0]]?.r || radius;
    const pad = 3;
    const x = cluster.minX - clusterR - pad;
    const y = cluster.minY - clusterR - pad;
    const w = cluster.maxX - cluster.minX + (clusterR + pad) * 2;
    const h = cluster.maxY - cluster.minY + (clusterR + pad) * 2;
    const rx = clusterR + pad;

    cells += `
      <mxCell id="${cid++}" value="" style="rounded=1;arcSize=50;whiteSpace=wrap;html=1;fillColor=#F8FAFC;strokeColor=#CBD5E1;strokeWidth=1.1;dashed=1;dashPattern=4 3;opacity=85;" vertex="1" parent="1">
        <mxGeometry x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" as="geometry" />
      </mxCell>
    `;
  });

  // 3. Burbujas y Etiquetas con correspondencia matemática idéntica
  processes.forEach((p, idx) => {
    const coord = coords[idx];
    const procR = coord.r;
    const px = coord.cx - procR;
    const py = coord.cy - procR;
    const fillHex = rgbToHex(getFeasibilityColor(p.feasibility));
    const label = placedLabels[idx];

    // Burbuja del proceso
    const circleId = cid++;
    cells += `
      <mxCell id="${circleId}" value="" style="ellipse;whiteSpace=wrap;html=1;fillColor=${fillHex};strokeColor=#262626;strokeWidth=1.3;" vertex="1" parent="1">
        <mxGeometry x="${px.toFixed(1)}" y="${py.toFixed(1)}" width="${(procR * 2).toFixed(1)}" height="${(procR * 2).toFixed(1)}" as="geometry" />
      </mxCell>
    `;

    // Línea guía si la etiqueta fue desplazada por densidad
    if (label.leaderLine) {
      cells += `
        <mxCell id="${cid++}" value="" style="endArrow=none;html=1;strokeColor=#94A3B8;strokeWidth=1.1;dashed=1;dashPattern=3 2;" edge="1" parent="1">
          <mxGeometry relative="1" as="geometry"><mxPoint x="${label.leaderLine.x1.toFixed(1)}" y="${label.leaderLine.y1.toFixed(1)}" as="sourcePoint" /><mxPoint x="${label.leaderLine.x2.toFixed(1)}" y="${label.leaderLine.y2.toFixed(1)}" as="targetPoint" /></mxGeometry>
        </mxCell>
      `;
    }

    // Texto de la etiqueta (con alineación y posición idéntica)
    const alignStyle = label.anchor === 'end' ? 'right' : label.anchor === 'start' ? 'left' : 'center';
    const textFormatted = label.lines.map(l => escapeXml(l)).join('&lt;br&gt;');

    cells += `
      <mxCell id="${cid++}" value="${textFormatted}" style="text;html=1;fontColor=#1A1A1A;align=${alignStyle};verticalAlign=middle;whiteSpace=wrap;rounded=0;fontSize=11.5;fontFamily=${config.fontFamily};lineHeight=1.15;" vertex="1" parent="1">
        <mxGeometry x="${label.bbox.x.toFixed(1)}" y="${label.bbox.y.toFixed(1)}" width="${label.bbox.w.toFixed(1)}" height="${label.bbox.h.toFixed(1)}" as="geometry" />
      </mxCell>
    `;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net" agent="BPM Tools" type="device">
  <diagram id="bpm_portfolio" name="Process Portfolio">
    <mxGraphModel background="#ffffff" dx="1200" dy="900" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>${cells}</root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

// ==========================================
// ARCHITECTURE GENERATION
// ==========================================
export function generateArchitectureXML(
  processes: BPMProcess[],
  config: AppConfig,
  coreGroupsOrder?: string[]
): string {
  const isEs = config.language === 'es';
  const defaultGroupName = isEs ? 'Operaciones Principales' : 'Core Operations';

  const mgmt = processes
    .filter(p => p.category === 'management')
    .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));

  const core = processes
    .filter(p => p.category === 'core')
    .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));

  const supp = processes
    .filter(p => p.category === 'support')
    .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));

  const linesMap = new Map<string, BPMProcess[]>();

  // Determine group order
  const definedGroups = coreGroupsOrder && coreGroupsOrder.length > 0 ? coreGroupsOrder : [];
  const groupsInCore = Array.from(
    new Set(core.map(p => p.groupName || defaultGroupName))
  );

  const allGroupNames: string[] = [];
  definedGroups.forEach(g => {
    if (!allGroupNames.includes(g)) allGroupNames.push(g);
  });
  groupsInCore.forEach(g => {
    if (!allGroupNames.includes(g)) allGroupNames.push(g);
  });
  if (allGroupNames.length === 0) {
    allGroupNames.push(defaultGroupName);
  }

  allGroupNames.forEach(gName => {
    const procsInG = core
      .filter(p => (p.groupName || defaultGroupName) === gName)
      .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0));
    linesMap.set(gName, procsInG);
  });

  const hasMulti = linesMap.size > 1;
  const numLines = Math.max(1, linesMap.size);

  const minW = 400;
  const mgmtW = Math.max(1, mgmt.length) * 160 + Math.max(0, mgmt.length - 1) * 16 + 80;
  
  let maxCoreW = 0;
  linesMap.forEach((procs) => {
    const count = Math.max(1, procs.length);
    const leftLabelW = hasMulti ? 150 : 0;
    const startX = hasMulti ? leftLabelW : 24;
    const w = startX + count * 160 + Math.max(0, count - 1) * 24 + 40;
    if (w > maxCoreW) maxCoreW = w;
  });

  const suppW = Math.max(1, supp.length) * 145 + Math.max(0, supp.length - 1) * 14 + 80;
  const containerW = Math.max(minW, mgmtW, maxCoreW, suppW) - 40;

  const h_mgmt = 114;
  const coreRowH = 75;
  const h_core = 36 + numLines * coreRowH;
  const h_supp = 114;

  let cid = 2;
  let cells = `
    <mxCell id="0" />
    <mxCell id="1" parent="0" />

    <!-- 1. CONTENEDOR SWIMLANE: PROCESOS DE GESTION -->
    <mxCell id="${cid++}" value="" style="swimlane;startSize=0;swimlaneFillColor=#D6D6D7;fontFamily=${config.fontFamily};swimlaneLine=0;strokeColor=#333334;strokeWidth=1.6;" vertex="1" parent="1">
      <mxGeometry x="110" y="113" width="${containerW}" height="${h_mgmt}" as="geometry" />
    </mxCell>
  `;
  const mgmtContainerId = cid - 1;

  cells += `
    <mxCell id="${cid++}" value="${isEs ? 'Procesos de gestión' : 'Management Processes'}" style="text;html=1;fontColor=#333334;whiteSpace=wrap;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;rounded=0;fontFamily=${config.fontFamily};fontStyle=1;fontSize=12;" vertex="1" parent="${mgmtContainerId}">
      <mxGeometry x="6" y="4" width="200" height="22" as="geometry" />
    </mxCell>
  `;

  const countMgmt = Math.max(1, mgmt.length);
  const mgmtCardW = 160;
  const mgmtGap = 16;
  const totalMgmtW = countMgmt * mgmtCardW + (countMgmt - 1) * mgmtGap;
  const startMgmtX = (containerW - totalMgmtW) / 2;

  mgmt.forEach((p, idx) => {
    const gx = startMgmtX + idx * (mgmtCardW + mgmtGap);
    const gy = 32;
    const gh = 70;

    // Forma unificada (símbolo + texto en un solo objeto)
    cells += `
      <mxCell id="${cid++}" value="${escapeXml(p.name)}" style="shape=offPageConnector;whiteSpace=wrap;html=1;fontFamily=${config.fontFamily};fontSize=11;fontColor=#333334;align=center;verticalAlign=middle;fillColor=#FFFFFE;strokeColor=#333334;strokeWidth=1.3;spacingBottom=12;" vertex="1" parent="${mgmtContainerId}">
        <mxGeometry x="${gx}" y="${gy}" width="${mgmtCardW}" height="${gh}" as="geometry" />
      </mxCell>
    `;
  });

  // 2. CONTENEDOR SWIMLANE: PROCESOS PRINCIPALES (CORE)
  const coreY = 113 + h_mgmt;
  cells += `
    <mxCell id="${cid++}" value="" style="swimlane;startSize=0;fontFamily=${config.fontFamily};swimlaneLine=0;fillColor=#FFFFFE;strokeColor=#333334;strokeWidth=1.6;" vertex="1" parent="1">
      <mxGeometry x="110" y="${coreY}" width="${containerW}" height="${h_core}" as="geometry" />
    </mxCell>
  `;
  const coreContainerId = cid - 1;

  cells += `
    <mxCell id="${cid++}" value="${isEs ? 'Procesos principales' : 'Core Processes'}" style="text;html=1;fontColor=#333334;whiteSpace=wrap;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;rounded=0;fontFamily=${config.fontFamily};fontStyle=1;fontSize=12;" vertex="1" parent="${coreContainerId}">
      <mxGeometry x="6" y="4" width="200" height="22" as="geometry" />
    </mxCell>
  `;

  let lineIdx = 0;
  linesMap.forEach((procs, lobName) => {
    const startY = 32 + lineIdx * coreRowH;
    const leftLabelW = hasMulti ? 150 : 0;

    if (hasMulti) {
      cells += `
        <mxCell id="${cid++}" value="${escapeXml(lobName)}" style="text;html=1;fontColor=#333334;whiteSpace=wrap;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;rounded=0;fontFamily=${config.fontFamily};fontStyle=1;fontSize=11;" vertex="1" parent="${coreContainerId}">
          <mxGeometry x="16" y="${startY + 20}" width="125" height="30" as="geometry" />
        </mxCell>
      `;
    }

    const chevW = 160;
    const chevGap = 24;
    const startX = hasMulti ? leftLabelW : 24;
    const chevH = 54;
    const yOffset = startY + 8;

    const shapeIds: number[] = [];

    procs.forEach((p, pIdx) => {
      const gx = startX + pIdx * (chevW + chevGap);
      const gy = yOffset;
      const shapeId = cid++;
      shapeIds.push(shapeId);

      // Forma unificada de Chevrón (símbolo + texto en un solo objeto indivisible)
      cells += `
        <mxCell id="${shapeId}" value="${escapeXml(p.name)}" style="html=1;shadow=0;dashed=0;align=center;verticalAlign=middle;shape=mxgraph.arrows2.arrow;dy=0;dx=30;notch=30;fontFamily=${config.fontFamily};fontSize=11;fontColor=#333334;fillColor=#FFFFFE;strokeColor=#333334;strokeWidth=1.4;whiteSpace=wrap;spacingLeft=32;spacingRight=32;spacingTop=2;spacingBottom=2;" vertex="1" parent="${coreContainerId}">
          <mxGeometry x="${gx}" y="${gy}" width="${chevW}" height="${chevH}" as="geometry" />
        </mxCell>
      `;
    });

    // Edges conectando directamente los IDs de los chevrons en orden secuencial
    procs.forEach((p, pIdx) => {
      if (pIdx < procs.length - 1) {
        cells += `
          <mxCell id="${cid++}" value="" style="edgeStyle=orthogonalEdgeStyle;rounded=0;orthogonalLoop=1;jettySize=auto;html=1;endArrow=none;endFill=0;strokeColor=#333334;strokeWidth=1.4;entryX=0;entryY=0.5;entryDx=30;entryDy=0;entryPerimeter=0;exitX=1;exitY=0.5;exitDx=0;exitDy=0;exitPerimeter=0;" edge="1" parent="${coreContainerId}" source="${shapeIds[pIdx]}" target="${shapeIds[pIdx + 1]}">
            <mxGeometry relative="1" as="geometry" />
          </mxCell>
        `;
      }
    });

    lineIdx++;
  });

  // 3. CONTENEDOR SWIMLANE: PROCESOS DE APOYO (SUPPORT)
  const suppY = coreY + h_core;
  cells += `
    <mxCell id="${cid++}" value="" style="swimlane;startSize=0;fillStyle=solid;swimlaneFillColor=#D6D6D7;fontFamily=${config.fontFamily};swimlaneLine=0;strokeColor=#333334;strokeWidth=1.6;" vertex="1" parent="1">
      <mxGeometry x="110" y="${suppY}" width="${containerW}" height="${h_supp}" as="geometry" />
    </mxCell>
  `;
  const suppContainerId = cid - 1;

  cells += `
    <mxCell id="${cid++}" value="${isEs ? 'Procesos de apoyo' : 'Support Processes'}" style="text;html=1;fontColor=#333334;whiteSpace=wrap;strokeColor=none;fillColor=none;align=left;verticalAlign=middle;rounded=0;fontFamily=${config.fontFamily};fontStyle=1;fontSize=12;" vertex="1" parent="${suppContainerId}">
      <mxGeometry x="6" y="4" width="200" height="22" as="geometry" />
    </mxCell>
  `;

  const countSupp = Math.max(1, supp.length);
  const suppCardW = 145;
  const suppGap = 16;
  const totalSuppW = countSupp * suppCardW + (countSupp - 1) * suppGap;
  const startSuppX = (containerW - totalSuppW) / 2;

  supp.forEach((p, idx) => {
    const gx = startSuppX + idx * (suppCardW + suppGap);
    const gy = 32;
    const gh = 70;

    // Forma unificada (símbolo + texto en un solo objeto apuntando hacia arriba)
    cells += `
      <mxCell id="${cid++}" value="${escapeXml(p.name)}" style="shape=offPageConnector;direction=west;whiteSpace=wrap;html=1;fontFamily=${config.fontFamily};fontSize=11;fontColor=#333334;align=center;verticalAlign=middle;fillColor=#FFFFFE;strokeColor=#333334;strokeWidth=1.3;spacingBottom=12;" vertex="1" parent="${suppContainerId}">
        <mxGeometry x="${gx}" y="${gy}" width="${suppCardW}" height="${gh}" as="geometry" />
      </mxCell>
    `;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<mxfile host="app.diagrams.net">
  <diagram name="Arquitectura de Procesos" id="bpm_architecture">
    <mxGraphModel background="#ffffff" grid="0" page="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" pageScale="1" pageWidth="1169" pageHeight="827" math="0" shadow="0">
      <root>${cells}</root>
    </mxGraphModel>
  </diagram>
</mxfile>`;
}

/**
 * Actualiza ÚNICAMENTE los nombres/textos de los procesos en un XML personalizado de Draw.io,
 * preservando intactas todas las posiciones, dimensiones, colores y conexiones personalizadas por el usuario.
 */
export function updateArchitectureXMLNames(
  customXml: string,
  processes: BPMProcess[]
): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(customXml, 'application/xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) return customXml;

    const procsByCategory = {
      management: processes.filter((p) => p.category === 'management'),
      core: processes
        .filter((p) => p.category === 'core')
        .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0)),
      support: processes.filter((p) => p.category === 'support'),
    };

    const cells = Array.from(doc.querySelectorAll('mxCell'));

    // 1. Identificar Management (shape=offPageConnector sin direction=west)
    const mgmtCells = cells.filter((c) => {
      const style = c.getAttribute('style') || '';
      return style.includes('shape=offPageConnector') && !style.includes('direction=west');
    });
    mgmtCells.forEach((cell, idx) => {
      if (idx < procsByCategory.management.length) {
        cell.setAttribute('value', procsByCategory.management[idx].name);
      }
    });

    // 2. Identificar Core (shape=mxgraph.arrows2.arrow)
    const coreCells = cells.filter((c) => {
      const style = c.getAttribute('style') || '';
      return style.includes('shape=mxgraph.arrows2.arrow');
    });
    coreCells.forEach((cell, idx) => {
      if (idx < procsByCategory.core.length) {
        cell.setAttribute('value', procsByCategory.core[idx].name);
      }
    });

    // 3. Identificar Support (shape=offPageConnector con direction=west)
    const suppCells = cells.filter((c) => {
      const style = c.getAttribute('style') || '';
      return style.includes('shape=offPageConnector') && style.includes('direction=west');
    });
    suppCells.forEach((cell, idx) => {
      if (idx < procsByCategory.support.length) {
        cell.setAttribute('value', procsByCategory.support[idx].name);
      }
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  } catch (err) {
    console.error('Error updating names in architecture XML:', err);
    return customXml;
  }
}

/**
 * Actualiza ÚNICAMENTE los textos de los procesos en un SVG personalizado de Draw.io,
 * manteniendo el layout y los estilos visuales editados.
 */
export function updateArchitectureSVGNames(
  customSvg: string,
  processes: BPMProcess[]
): string {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(customSvg, 'image/svg+xml');
    const parserError = doc.querySelector('parsererror');
    if (parserError) return customSvg;

    const procsByCategory = {
      management: processes.filter((p) => p.category === 'management'),
      core: processes
        .filter((p) => p.category === 'core')
        .sort((a, b) => (a.sequenceOrder || 0) - (b.sequenceOrder || 0)),
      support: processes.filter((p) => p.category === 'support'),
    };

    // Draw.io renderiza textos como <text> o dentro de <foreignObject> <div/span>
    // Buscamos contenedores de texto que pertenezcan a los nodos del diagrama
    // Agrupamos por posiciones Y para distinguir Management (arriba), Core (medio) y Support (abajo)
    const textContainers: { elem: Element; y: number; text: string }[] = [];

    // 1. Textos en foreignObject
    doc.querySelectorAll('foreignObject').forEach((fo) => {
      const y = parseFloat(fo.getAttribute('y') || '0');
      const innerDiv = fo.querySelector('div') || fo;
      const text = innerDiv.textContent?.trim() || '';
      if (text && !text.includes('Procesos de') && !text.includes('Processes') && !text.includes('Procesos principales')) {
        textContainers.push({ elem: innerDiv, y, text });
      }
    });

    // 2. Textos estándar <text>
    doc.querySelectorAll('text').forEach((txt) => {
      const y = parseFloat(txt.getAttribute('y') || '0');
      const text = txt.textContent?.trim() || '';
      if (text && !text.includes('Procesos de') && !text.includes('Processes') && !text.includes('Procesos principales')) {
        // Evitar duplicados si ya está en foreignObject
        if (!txt.closest('foreignObject')) {
          textContainers.push({ elem: txt, y, text });
        }
      }
    });

    // Ordenar por coordenada Y vertical (Management -> Core -> Support)
    textContainers.sort((a, b) => a.y - b.y);

    // Mapear por categorías según la cantidad esperada
    const totalMgmt = procsByCategory.management.length;
    const totalCore = procsByCategory.core.length;
    const totalSupp = procsByCategory.support.length;

    let mgmtIdx = 0;
    let coreIdx = 0;
    let suppIdx = 0;

    textContainers.forEach((item) => {
      if (mgmtIdx < totalMgmt) {
        item.elem.textContent = procsByCategory.management[mgmtIdx].name;
        mgmtIdx++;
      } else if (coreIdx < totalCore) {
        item.elem.textContent = procsByCategory.core[coreIdx].name;
        coreIdx++;
      } else if (suppIdx < totalSupp) {
        item.elem.textContent = procsByCategory.support[suppIdx].name;
        suppIdx++;
      }
    });

    const serializer = new XMLSerializer();
    return serializer.serializeToString(doc);
  } catch (err) {
    return customSvg;
  }
}
