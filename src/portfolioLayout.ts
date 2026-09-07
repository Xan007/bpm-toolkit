import { BPMProcess, LabelPosition } from './types';

export const W = 1100;
export const H = 580;
export const boxX = 75;
export const boxY = 40;
export const boxW = 800;
export const boxH = 480;
export const midX = boxX + boxW / 2;
export const midY = boxY + boxH / 2;
export const radius = 15;
export const padX = 58;
export const padY = 52;

// Coordenadas de la sub-cuadrícula
export const subX1 = boxX + padX + 0.25 * (boxW - 2 * padX);
export const subX2 = boxX + padX + 0.75 * (boxW - 2 * padX);
export const subY1 = boxY + boxH - padY - 0.25 * (boxH - 2 * padY);
export const subY2 = boxY + boxH - padY - 0.75 * (boxH - 2 * padY);

export interface ProcessCluster {
  key: string;
  indices: number[];
  baseCx: number;
  baseCy: number;
  count: number;
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface DispersedResult {
  coords: { cx: number; cy: number; r: number }[];
  clusters: ProcessCluster[];
}

export interface PlacedLabel {
  tx: number;
  ty: number;
  anchor: 'start' | 'middle' | 'end';
  lines: string[];
  bbox: { x: number; y: number; w: number; h: number };
  leaderLine?: { x1: number; y1: number; x2: number; y2: number };
}

// 1. Calcula coordenadas con distribución orbital/geométrica adaptativa según cantidad de procesos
export function computeDispersedClusters(processes: BPMProcess[]): DispersedResult {
  const groups = new Map<string, number[]>();

  processes.forEach((p, idx) => {
    const key = `${p.health.toFixed(1)}_${p.importance.toFixed(1)}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(idx);
  });

  const coords = new Array<{ cx: number; cy: number; r: number }>(processes.length);
  const clusters: ProcessCluster[] = [];

  groups.forEach((indices, key) => {
    const p0 = processes[indices[0]];
    const nx = Math.max(0, Math.min(1, (5.0 - p0.health) / 4.0));
    const baseCx = boxX + padX + nx * (boxW - 2 * padX);

    const ny = Math.max(0, Math.min(1, (p0.importance - 1.0) / 4.0));
    const baseCy = boxY + boxH - padY - ny * (boxH - 2 * padY);

    const count = indices.length;

    if (count === 1) {
      coords[indices[0]] = { cx: baseCx, cy: baseCy, r: radius };
    } else {
      let minX = Infinity;
      let maxX = -Infinity;
      let minY = Infinity;
      let maxY = -Infinity;

      // Radio adaptable según cantidad de procesos en el mismo punto
      const adaptiveR = count === 2 ? 13.5 : count === 3 ? 12 : count === 4 ? 11 : 10;

      if (count === 2) {
        // Separación horizontal simétrica
        const spacing = adaptiveR * 2 + 10;
        indices.forEach((procIdx, i) => {
          const rawCx = baseCx + (i === 0 ? -spacing / 2 : spacing / 2);
          const cx = Math.max(boxX + adaptiveR + 4, Math.min(boxX + boxW - adaptiveR - 4, rawCx));
          const cy = baseCy;
          coords[procIdx] = { cx, cy, r: adaptiveR };
          minX = Math.min(minX, cx);
          maxX = Math.max(maxX, cx);
          minY = Math.min(minY, cy);
          maxY = Math.max(maxY, cy);
        });
      } else if (count === 3) {
        // Dispersión triangular holgada
        const dist = adaptiveR * 2.1;
        const angles = [-Math.PI / 2, (5 * Math.PI) / 6, Math.PI / 6]; // Top, Bottom-Left, Bottom-Right
        indices.forEach((procIdx, i) => {
          const angle = angles[i % 3];
          const rawCx = baseCx + dist * Math.cos(angle);
          const rawCy = baseCy + dist * Math.sin(angle);
          const cx = Math.max(boxX + adaptiveR + 4, Math.min(boxX + boxW - adaptiveR - 4, rawCx));
          const cy = Math.max(boxY + adaptiveR + 4, Math.min(boxY + boxH - adaptiveR - 4, rawCy));
          coords[procIdx] = { cx, cy, r: adaptiveR };
          minX = Math.min(minX, cx);
          maxX = Math.max(maxX, cx);
          minY = Math.min(minY, cy);
          maxY = Math.max(maxY, cy);
        });
      } else if (count === 4) {
        // Dispersión en cruz / rombo o cuadrante simétrico espaciado
        const dist = adaptiveR * 2.3;
        const angles = [-Math.PI * 0.75, -Math.PI * 0.25, Math.PI * 0.75, Math.PI * 0.25];
        indices.forEach((procIdx, i) => {
          const angle = angles[i % 4];
          const rawCx = baseCx + dist * Math.cos(angle);
          const rawCy = baseCy + dist * Math.sin(angle);
          const cx = Math.max(boxX + adaptiveR + 4, Math.min(boxX + boxW - adaptiveR - 4, rawCx));
          const cy = Math.max(boxY + adaptiveR + 4, Math.min(boxY + boxH - adaptiveR - 4, rawCy));
          coords[procIdx] = { cx, cy, r: adaptiveR };
          minX = Math.min(minX, cx);
          maxX = Math.max(maxX, cx);
          minY = Math.min(minY, cy);
          maxY = Math.max(maxY, cy);
        });
      } else {
        // 5 o más procesos: Anillo circular orbital
        const dist = adaptiveR * 2.6;
        indices.forEach((procIdx, i) => {
          const angle = (2 * Math.PI * i) / count - Math.PI / 2;
          const rawCx = baseCx + dist * Math.cos(angle);
          const rawCy = baseCy + dist * Math.sin(angle);
          const cx = Math.max(boxX + adaptiveR + 4, Math.min(boxX + boxW - adaptiveR - 4, rawCx));
          const cy = Math.max(boxY + adaptiveR + 4, Math.min(boxY + boxH - adaptiveR - 4, rawCy));
          coords[procIdx] = { cx, cy, r: adaptiveR };
          minX = Math.min(minX, cx);
          maxX = Math.max(maxX, cx);
          minY = Math.min(minY, cy);
          maxY = Math.max(maxY, cy);
        });
      }

      clusters.push({
        key,
        indices,
        baseCx,
        baseCy,
        count,
        minX,
        maxX,
        minY,
        maxY
      });
    }
  });

  return { coords, clusters };
}

export function computeDispersedCoordinates(processes: BPMProcess[]): { cx: number; cy: number; r: number }[] {
  return computeDispersedClusters(processes).coords;
}

// División inteligente de texto balanceada
export function wrapProcessName(name: string): string[] {
  const trimmed = name.trim();
  if (!trimmed) return [''];

  const words = trimmed.split(/\s+/);
  if (words.length <= 1) return [trimmed];

  // Si mide hasta 20 caracteres, 1 sola línea
  if (trimmed.length <= 20) return [trimmed];

  if (words.length === 2) return words;

  // Para 3 o más palabras, balancear en 2 líneas
  const mid = Math.ceil(words.length / 2);
  const part1 = words.slice(0, mid).join(' ');
  const part2 = words.slice(mid).join(' ');

  if (part1.length > 22 || part2.length > 22) {
    const third = Math.ceil(words.length / 3);
    const l1 = words.slice(0, third).join(' ');
    const l2 = words.slice(third, third * 2).join(' ');
    const l3 = words.slice(third * 2).join(' ');
    return [l1, l2, l3].filter(Boolean);
  }

  return [part1, part2];
}

export function getLabelBoundingBox(
  name: string,
  cx: number,
  cy: number,
  pos: LabelPosition,
  r: number = radius
): { lines: string[]; bbox: { x: number; y: number; w: number; h: number } } {
  const lines = wrapProcessName(name);
  const maxChars = Math.max(...lines.map(l => l.length));
  const w = maxChars * 6.8 + 6;
  const h = lines.length * 13.5 + 2;

  let rx = cx;
  let ry = cy;

  if (pos === 'left') {
    rx = cx - r - 7 - w;
    ry = cy - h / 2;
  } else if (pos === 'right') {
    rx = cx + r + 7;
    ry = cy - h / 2;
  } else if (pos === 'top') {
    rx = cx - w / 2;
    ry = cy - r - 7 - h;
  } else {
    // bottom
    rx = cx - w / 2;
    ry = cy + r + 6;
  }

  return { lines, bbox: { x: rx, y: ry, w, h } };
}

// Algoritmo avanzado de colocación de etiquetas (8 candidatos + offset dinámico)
export function getPlacedLabel(
  name: string,
  cx: number,
  cy: number,
  pos: LabelPosition,
  r: number = radius,
  extraDistance: number = 0
): PlacedLabel {
  const lines = wrapProcessName(name);
  const maxChars = Math.max(...lines.map(l => l.length));
  const w = maxChars * 6.8 + 6;
  const lineH = 13.5;
  const h = lines.length * lineH + 2;

  let rx = cx;
  let ry = cy;
  let tx = cx;
  let ty = cy;
  let anchor: 'start' | 'middle' | 'end' = 'middle';
  const gap = 7 + extraDistance;

  if (pos === 'left') {
    rx = cx - r - gap - w;
    ry = cy - h / 2;
    tx = cx - r - gap;
    anchor = 'end';
    ty = cy - ((lines.length - 1) * lineH) / 2 + 4;
  } else if (pos === 'right') {
    rx = cx + r + gap;
    ry = cy - h / 2;
    tx = cx + r + gap;
    anchor = 'start';
    ty = cy - ((lines.length - 1) * lineH) / 2 + 4;
  } else if (pos === 'top') {
    rx = cx - w / 2;
    ry = cy - r - gap - h;
    tx = cx;
    anchor = 'middle';
    ty = cy - r - gap - (lines.length - 1) * lineH;
  } else {
    // bottom
    rx = cx - w / 2;
    ry = cy + r + gap;
    tx = cx;
    anchor = 'middle';
    ty = cy + r + gap + 12;
  }

  let leaderLine: { x1: number; y1: number; x2: number; y2: number } | undefined = undefined;
  if (extraDistance > 6) {
    if (pos === 'left') {
      leaderLine = { x1: cx - r - 2, y1: cy, x2: rx + w + 2, y2: cy };
    } else if (pos === 'right') {
      leaderLine = { x1: cx + r + 2, y1: cy, x2: rx - 2, y2: cy };
    } else if (pos === 'top') {
      leaderLine = { x1: cx, y1: cy - r - 2, x2: cx, y2: ry + h + 2 };
    } else if (pos === 'bottom') {
      leaderLine = { x1: cx, y1: cy + r + 2, x2: cx, y2: ry - 2 };
    }
  }

  return {
    tx,
    ty,
    anchor,
    lines,
    bbox: { x: rx, y: ry, w, h },
    leaderLine
  };
}

// 2. Algoritmo exhaustivo y riguroso para resolver colisiones de etiquetas contra círculos y otros textos
export function resolveOptimalLabelPositions(
  processes: BPMProcess[],
  coords: { cx: number; cy: number; r: number }[],
  clusters: ProcessCluster[] = []
): LabelPosition[] {
  const candidates: LabelPosition[] = ['left', 'right', 'top', 'bottom'];
  const n = processes.length;
  if (n === 0) return [];

  // 1. Asignación inicial con sesgo radial natural para clusters
  const positions: LabelPosition[] = processes.map((p, idx) => {
    const cluster = clusters.find(c => c.indices.includes(idx));
    if (cluster && cluster.count > 1) {
      const c = coords[idx];
      const dx = c.cx - cluster.baseCx;
      const dy = c.cy - cluster.baseCy;

      if (cluster.count === 2) {
        return dx < 0 ? 'left' : 'right';
      }
      if (cluster.count === 3) {
        if (dy < -4) return 'top';
        return dx < 0 ? 'left' : 'right';
      }
      if (cluster.count >= 4) {
        if (dx < 0 && dy < 0) return 'left';
        if (dx >= 0 && dy < 0) return 'right';
        if (dx < 0 && dy >= 0) return 'left';
        return 'right';
      }
    }
    return p.labelPosition || 'left';
  });

  // Función de evaluación rigurosa de penalizaciones
  const evaluatePenalty = (idx: number, pos: LabelPosition, currentPositions: LabelPosition[]): number => {
    const proc = processes[idx];
    const { cx, cy, r } = coords[idx];
    const { bbox } = getLabelBoundingBox(proc.name, cx, cy, pos, r);
    let pen = 0;

    // A. Límites del marco 2x2 (penaliza fuertemente desbordarse de la matriz)
    if (bbox.x < boxX - 4) pen += (boxX - 4 - bbox.x) * 30 + 500;
    if (bbox.x + bbox.w > boxX + boxW + 4) pen += (bbox.x + bbox.w - (boxX + boxW + 4)) * 30 + 500;
    if (bbox.y < boxY - 4) pen += (boxY - 4 - bbox.y) * 30 + 500;
    if (bbox.y + bbox.h > boxY + boxH + 4) pen += (bbox.y + bbox.h - (boxY + boxH + 4)) * 30 + 500;

    // B. Colisión con círculos/burbujas de CUALQUIER proceso (incluso cercanos)
    coords.forEach((otherCoord, oIdx) => {
      if (oIdx === idx) return;
      const clX = Math.max(bbox.x, Math.min(otherCoord.cx, bbox.x + bbox.w));
      const clY = Math.max(bbox.y, Math.min(otherCoord.cy, bbox.y + bbox.h));
      const distSq = (otherCoord.cx - clX) ** 2 + (otherCoord.cy - clY) ** 2;
      const minDist = otherCoord.r + 5; // Margen de seguridad de 5px
      if (distSq < minDist ** 2) {
        const penetration = minDist - Math.sqrt(Math.max(0, distSq));
        pen += 2000 + penetration * 150; // Penalización crítica: no puede tapar círculos
      }
    });

    // C. Colisión con otras etiquetas asignadas (con margen de seguridad)
    processes.forEach((otherProc, oIdx) => {
      if (oIdx === idx) return;
      const otherCoord = coords[oIdx];
      const otherBbox = getLabelBoundingBox(
        otherProc.name,
        otherCoord.cx,
        otherCoord.cy,
        currentPositions[oIdx],
        otherCoord.r
      ).bbox;

      const pad = 4;
      const overlapX = Math.max(0, Math.min(bbox.x + bbox.w + pad, otherBbox.x + otherBbox.w + pad) - Math.max(bbox.x - pad, otherBbox.x - pad));
      const overlapY = Math.max(0, Math.min(bbox.y + bbox.h + pad, otherBbox.y + otherBbox.h + pad) - Math.max(bbox.y - pad, otherBbox.y - pad));

      if (overlapX > 0 && overlapY > 0) {
        pen += 4000 + overlapX * overlapY * 20; // Penalización máxima: no pueden cruzarse textos
      }
    });

    return pen;
  };

  // 2. Optimización conjunta exhaustiva para cada cluster
  clusters.forEach((cluster) => {
    if (cluster.count >= 2 && cluster.count <= 4) {
      const idxs = cluster.indices;
      let bestCombo: LabelPosition[] = [];
      let minComboPen = Infinity;

      // Probar todas las combinaciones posibles dentro del cluster
      const generateCombos = (depth: number, currentCombo: LabelPosition[]) => {
        if (depth === idxs.length) {
          // Evaluar penalización total del combo
          const tempPositions = [...positions];
          idxs.forEach((id, i) => { tempPositions[id] = currentCombo[i]; });

          let totalPen = 0;
          idxs.forEach((id) => {
            totalPen += evaluatePenalty(id, tempPositions[id], tempPositions);
          });

          if (totalPen < minComboPen) {
            minComboPen = totalPen;
            bestCombo = [...currentCombo];
          }
          return;
        }

        for (const cand of candidates) {
          generateCombos(depth + 1, [...currentCombo, cand]);
        }
      };

      generateCombos(0, []);
      idxs.forEach((id, i) => {
        positions[id] = bestCombo[i];
      });
    }
  });

  // 3. Relajación iterativa global multi-pasada para resolver vecinos entre clusters
  for (let pass = 0; pass < 10; pass++) {
    let changed = false;
    for (let i = 0; i < n; i++) {
      let bestCandidate = positions[i];
      let minPenalty = evaluatePenalty(i, bestCandidate, positions);

      if (minPenalty > 0) {
        for (const cand of candidates) {
          if (cand === positions[i]) continue;
          const p = evaluatePenalty(i, cand, positions);
          if (p < minPenalty) {
            minPenalty = p;
            bestCandidate = cand;
            changed = true;
          }
        }
        positions[i] = bestCandidate;
      }
    }
    if (!changed) break;
  }

  return positions;
}

// 3. Calcula la disposición final exacta de etiquetas con resolución de empuje/líneas de guía si hay densidad extrema
export function computeFinalPlacedLabels(
  processes: BPMProcess[],
  coords: { cx: number; cy: number; r: number }[],
  positions: LabelPosition[]
): PlacedLabel[] {
  const placed: PlacedLabel[] = [];

  for (let i = 0; i < processes.length; i++) {
    const p = processes[i];
    const c = coords[i];
    const pos = positions[i] || 'left';

    let extraOffset = 0;
    let label = getPlacedLabel(p.name, c.cx, c.cy, pos, c.r, extraOffset);

    // Si aún con la mejor posición colisiona con una etiqueta previa ya colocada, desplazar suavemente con línea guía
    for (let attempt = 0; attempt < 4; attempt++) {
      let hasOverlap = false;
      for (let j = 0; j < placed.length; j++) {
        const other = placed[j];
        const pad = 3;
        const ox = Math.max(0, Math.min(label.bbox.x + label.bbox.w + pad, other.bbox.x + other.bbox.w + pad) - Math.max(label.bbox.x - pad, other.bbox.x - pad));
        const oy = Math.max(0, Math.min(label.bbox.y + label.bbox.h + pad, other.bbox.y + other.bbox.h + pad) - Math.max(label.bbox.y - pad, other.bbox.y - pad));
        if (ox > 0 && oy > 0) {
          hasOverlap = true;
          break;
        }
      }

      if (!hasOverlap) break;
      extraOffset += 14;
      label = getPlacedLabel(p.name, c.cx, c.cy, pos, c.r, extraOffset);
    }

    placed.push(label);
  }

  return placed;
}

export function autoOptimizeLabelPositions(processes: BPMProcess[]): BPMProcess[] {
  const { coords, clusters } = computeDispersedClusters(processes);
  const optimalPositions = resolveOptimalLabelPositions(processes, coords, clusters);

  return processes.map((p, idx) => ({
    ...p,
    labelPosition: optimalPositions[idx]
  }));
}
