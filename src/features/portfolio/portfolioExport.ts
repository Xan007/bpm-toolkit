import { BPMProcess, AppConfig } from '../../types';
import { generatePortfolioXML, escapeXml } from '../../drawio';
import { jsPDF } from 'jspdf';
import { W, H } from '../../portfolioLayout';

export const getCleanSVGSource = (): string | null => {
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

export const exportPortfolioDrawio = (processes: BPMProcess[], config: AppConfig) => {
  const xml = generatePortfolioXML(processes, config);
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `portafolio_procesos_${config.language}.drawio`;
  a.click();
  URL.revokeObjectURL(url);
};

export const exportPortfolioPNG = (language: string) => {
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
      a.download = `portafolio_procesos_${language}.png`;
      a.href = canvas.toDataURL('image/png');
      a.click();
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
};

export const exportPortfolioSVG = (language: string) => {
  const source = getCleanSVGSource();
  if (!source) return;
  const blob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
  const a = document.createElement('a');
  a.download = `portafolio_procesos_${language}.svg`;
  a.href = URL.createObjectURL(blob);
  a.click();
};

export const exportPortfolioJPEG = (language: string) => {
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
      a.download = `portafolio_procesos_${language}.jpg`;
      a.href = canvas.toDataURL('image/jpeg', 0.95);
      a.click();
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
};

export const exportPortfolioPDF = (language: string) => {
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
      pdf.save(`portafolio_procesos_${language}.pdf`);
    }
    URL.revokeObjectURL(url);
  };
  img.src = url;
};

export const buildPortfolioTableHtml = (
  procs: BPMProcess[],
  config: AppConfig,
  isEs: boolean
): string => {
  const thProcess = isEs ? 'Proceso' : 'Process';
  const thImportance = isEs ? 'Importancia' : 'Importance';
  const thHealth = isEs ? 'Salud' : 'Health';
  const thFeasibility = isEs ? 'Factibilidad' : 'Feasibility';

  return `<table style="font-family: ${config.fontFamily}; font-size: 10pt; border-collapse: collapse; width: 100%;">
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
};

export const buildPortfolioTablePlainText = (
  procs: BPMProcess[],
  isEs: boolean
): string => {
  const thProcess = isEs ? 'Proceso' : 'Process';
  const thImportance = isEs ? 'Importancia' : 'Importance';
  const thHealth = isEs ? 'Salud' : 'Health';
  const thFeasibility = isEs ? 'Factibilidad' : 'Feasibility';

  return [
    `${thProcess}\t${thImportance}\t${thHealth}\t${thFeasibility}`,
    ...procs.map((p) => `${p.name}\t${p.importance}\t${p.health}\t${p.feasibility}`)
  ].join('\n');
};
