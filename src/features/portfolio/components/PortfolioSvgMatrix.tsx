import React from 'react';
import { BPMProcess, AppConfig } from '../../../types';
import { getFeasibilityColor, escapeXml } from '../../../drawio';
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
} from '../../../portfolioLayout';

interface PortfolioSvgMatrixProps {
  visibleProcesses: BPMProcess[];
  config: AppConfig;
  coords: Array<{ cx: number; cy: number; r: number }>;
  clusters: any[];
  placedLabels: any[];
  selectedProcessId: string | null;
  draggingProcessId: string | null;
  isEs: boolean;
  onPointerDown: (e: React.PointerEvent, procId: string) => void;
  onPointerMove: (e: React.PointerEvent, procId: string) => void;
  onPointerUp: (e: React.PointerEvent, procId: string) => void;
}

export const PortfolioSvgMatrix: React.FC<PortfolioSvgMatrixProps> = ({
  visibleProcesses,
  config,
  coords,
  clusters,
  placedLabels,
  selectedProcessId,
  draggingProcessId,
  isEs,
  onPointerDown,
  onPointerMove,
  onPointerUp,
}) => {
  return (
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

      {/* Capa de Clusters */}
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
              onPointerDown={(e) => onPointerDown(e, proc.id)}
              onPointerMove={(e) => onPointerMove(e, proc.id)}
              onPointerUp={(e) => onPointerUp(e, proc.id)}
              className={`group cursor-grab active:cursor-grabbing select-none ${
                draggingProcessId === proc.id ? 'opacity-80' : ''
              }`}
            >
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
                {label.lines.map((ln: string, lIdx: number) => (
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
  );
};
