import { BPMProcess, AppConfig } from '../../types';
import { escapeXml } from '../../drawio';
import { jsPDF } from 'jspdf';

export const buildProfileHtmlTable = (
  proc: BPMProcess,
  config: AppConfig,
  fontSizePt: number = 10
): string => {
  const isEs = config.language === 'es';
  const prof = proc.profile || {};
  const font = config.fontFamily || 'Arial, sans-serif';

  const lblName = isEs ? 'Nombre del Proceso' : 'Process Name';
  const lblVision = isEs ? 'Visión' : 'Vision';
  const lblOwner = isEs ? 'Responsable del Proceso' : 'Process Owner';
  const lblCustomer = isEs ? 'Cliente del proceso' : 'Customer of process';
  const lblExpectation = isEs ? 'Expectativa del cliente' : 'Expectation of customer';
  const lblOutcome = isEs ? 'Resultado' : 'Outcome';
  const lblTrigger = isEs ? 'Disparador' : 'Trigger';
  const lblFirstAct = isEs ? 'Primera actividad' : 'First activity';
  const lblLastAct = isEs ? 'Última actividad' : 'Last activity';
  const lblInbound = isEs ? 'Interfaces entrantes' : 'Interfaces inbound';
  const lblOutbound = isEs ? 'Interfaces salientes' : 'Interfaces outbound';
  const lblResources = isEs ? 'Recursos requeridos' : 'Required resources';
  const lblHuman = isEs ? 'Recursos humanos' : 'Human resources';
  const lblInfo = isEs ? 'Información, documentos y conocimiento' : 'Information, documents and know-how';
  const lblEnv = isEs ? 'Entorno de trabajo, materiales e infraestructura' : 'Work environment, materials and infrastructure';
  const lblMeasures = isEs ? 'Medidas de Desempeño del Proceso' : 'Process Performance Measures';

  const renderCellContent = (text?: string) => {
    if (!text || !text.trim()) return '&nbsp;';
    const items = text.split('\n').map((t) => t.trim()).filter(Boolean);
    if (items.length <= 1) return escapeXml(text);
    return `<ul style="margin: 0; padding-left: 18px;">${items
      .map((it) => `<li style="margin-bottom: 2px;">${escapeXml(it)}</li>`)
      .join('')}</ul>`;
  };

  const hasHuman = Boolean(prof.requiredResourcesHuman && prof.requiredResourcesHuman.trim());
  const hasInfo = Boolean(prof.requiredResourcesInfo && prof.requiredResourcesInfo.trim());
  const hasEnv = Boolean(prof.requiredResourcesEnv && prof.requiredResourcesEnv.trim());
  const hasAnyResource = hasHuman || hasInfo || hasEnv;

  return `
<table style="font-family: ${font}; font-size: ${fontSizePt}pt; border-collapse: collapse; width: 100%; border: 1.5px solid #000000; color: #000000; background-color: #ffffff;">
  <tbody>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 6px 10px; font-size: ${fontSizePt}pt; line-height: 1.4;">
        <strong>${lblName}:</strong> ${escapeXml(proc.name)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 6px 10px; font-size: ${fontSizePt}pt; line-height: 1.4;">
        <strong>${lblVision}:</strong> ${renderCellContent(prof.vision)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 6px 10px; font-size: ${fontSizePt}pt; line-height: 1.4;">
        <strong>${lblOwner}:</strong> ${renderCellContent(prof.processOwner)}
      </td>
    </tr>
    <tr>
      <td style="width: 50%; border: 1px solid #000000; padding: 6px 10px; font-size: ${fontSizePt}pt; vertical-align: top; line-height: 1.4;">
        <strong>${lblCustomer}:</strong><br />
        ${renderCellContent(prof.customer)}
      </td>
      <td style="width: 50%; border: 1px solid #000000; padding: 6px 10px; font-size: ${fontSizePt}pt; vertical-align: top; line-height: 1.4;">
        <strong>${lblExpectation}:</strong><br />
        ${renderCellContent(prof.customerExpectation)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 6px 10px; font-size: ${fontSizePt}pt; line-height: 1.4;">
        <strong>${lblOutcome}:</strong> ${renderCellContent(prof.outcome)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 6px 10px; font-size: ${fontSizePt}pt; line-height: 1.4;">
        <strong>${lblTrigger}:</strong> ${renderCellContent(prof.trigger)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 6px 10px; font-size: ${fontSizePt}pt; line-height: 1.4;">
        <strong>${lblFirstAct}:</strong> ${renderCellContent(prof.firstActivity)}<br />
        <span style="color: #666666; font-size: 8pt; letter-spacing: 2px;">.....</span><br />
        <strong>${lblLastAct}:</strong> ${renderCellContent(prof.lastActivity)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 6px 10px; font-size: ${fontSizePt}pt; line-height: 1.4;">
        <strong>${lblInbound}:</strong> ${renderCellContent(prof.interfacesInbound)}<br />
        <strong>${lblOutbound}:</strong> ${renderCellContent(prof.interfacesOutbound)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 6px 10px; font-size: ${fontSizePt}pt; vertical-align: top; line-height: 1.4;">
        <strong>${lblResources}:</strong>
        ${
          hasAnyResource
            ? `<ul style="margin: 4px 0 0 0; padding-left: 18px;">
                ${hasHuman ? `<li style="margin-bottom: 3px;"><strong>${lblHuman}:</strong> ${renderCellContent(prof.requiredResourcesHuman)}</li>` : ''}
                ${hasInfo ? `<li style="margin-bottom: 3px;"><strong>${lblInfo}:</strong> ${renderCellContent(prof.requiredResourcesInfo)}</li>` : ''}
                ${hasEnv ? `<li style="margin-bottom: 3px;"><strong>${lblEnv}:</strong> ${renderCellContent(prof.requiredResourcesEnv)}</li>` : ''}
              </ul>`
            : '&nbsp;'
        }
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 6px 10px; font-size: ${fontSizePt}pt; vertical-align: top; line-height: 1.4;">
        <strong>${lblMeasures}:</strong><br />
        ${renderCellContent(prof.performanceMeasures)}
      </td>
    </tr>
  </tbody>
</table>`.trim();
};

export const buildProfilePlainText = (proc: BPMProcess, isEs: boolean): string => {
  const prof = proc.profile || {};
  const lblName = isEs ? 'Nombre del Proceso' : 'Process Name';
  const lblVision = isEs ? 'Visión' : 'Vision';
  const lblOwner = isEs ? 'Responsable del Proceso' : 'Process Owner';
  const lblCustomer = isEs ? 'Cliente del proceso' : 'Customer of process';
  const lblExpectation = isEs ? 'Expectativa del cliente' : 'Expectation of customer';
  const lblOutcome = isEs ? 'Resultado' : 'Outcome';
  const lblTrigger = isEs ? 'Disparador' : 'Trigger';
  const lblFirstAct = isEs ? 'Primera actividad' : 'First activity';
  const lblLastAct = isEs ? 'Última actividad' : 'Last activity';
  const lblInbound = isEs ? 'Interfaces entrantes' : 'Interfaces inbound';
  const lblOutbound = isEs ? 'Interfaces salientes' : 'Interfaces outbound';
  const lblResources = isEs ? 'Recursos requeridos' : 'Required resources';
  const lblMeasures = isEs ? 'Medidas de Desempeño' : 'Performance Measures';

  return [
    `${lblName}:\t${proc.name}`,
    `${lblVision}:\t${prof.vision || ''}`,
    `${lblOwner}:\t${prof.processOwner || ''}`,
    `${lblCustomer}:\t${prof.customer || ''}\t${lblExpectation}:\t${prof.customerExpectation || ''}`,
    `${lblOutcome}:\t${prof.outcome || ''}`,
    `${lblTrigger}:\t${prof.trigger || ''}`,
    `${lblFirstAct}:\t${prof.firstActivity || ''}\n${lblLastAct}:\t${prof.lastActivity || ''}`,
    `${lblInbound}:\t${prof.interfacesInbound || ''}\n${lblOutbound}:\t${prof.interfacesOutbound || ''}`,
    `${lblResources}:\tHumano: ${prof.requiredResourcesHuman || ''} | Info: ${prof.requiredResourcesInfo || ''} | Entorno: ${prof.requiredResourcesEnv || ''}`,
    `${lblMeasures}:\t${(prof.performanceMeasures || '').replace(/\n/g, ', ')}`,
  ].join('\n');
};

export const exportProfileToPdf = (proc: BPMProcess, language: string) => {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  const container = document.getElementById('process-profile-table-container');
  if (!container) return;

  pdf.html(container, {
    callback: function (doc) {
      const safeName = proc.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      doc.save(`perfil_proceso_${safeName}_${language}.pdf`);
    },
    x: 36,
    y: 36,
    width: 540,
    windowWidth: 720,
  });
};
