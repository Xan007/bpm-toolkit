import { BPMProcess, AppConfig } from '../../types';
import { escapeXml } from '../../drawio';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

export const buildProfileHtmlTable = (
  proc: BPMProcess,
  config: AppConfig,
  fontSizePt: number = 10.5
): string => {
  const isEs = config.language === 'es';
  const prof = (!isEs && proc.profileEn)
    ? { ...(proc.profile || {}), ...proc.profileEn }
    : (proc.profile || proc.profileEn || {});
  const font = config.fontFamily || 'Arial, Calibri, sans-serif';

  const lblName = isEs ? 'Nombre del Proceso' : 'Name of Process';
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
  const lblInfo = isEs ? 'Información, documentos y conocimiento' : 'Information, documents, know-how';
  const lblEnv = isEs ? 'Entorno de trabajo, materiales e infraestructura' : 'Work environment, materials, infrastructure';
  const lblMeasures = isEs ? 'Medidas de Desempeño del Proceso' : 'Process Performance Measures';

  const renderSimpleText = (text?: string) => {
    if (!text || !text.trim()) return '';
    return escapeXml(text.trim());
  };

  const renderBullets = (text?: string) => {
    if (!text || !text.trim()) return '';
    const items = text.split('\n').map((t) => t.trim()).filter(Boolean);
    if (items.length === 0) return '';
    return items.map((it) => `• &nbsp;${escapeXml(it)}`).join('<br />');
  };

  const renderResourcesBlock = () => {
    const lines: string[] = [];
    if (prof.requiredResourcesHuman && prof.requiredResourcesHuman.trim()) {
      lines.push(`• &nbsp;<strong>${lblHuman}:</strong><br />&nbsp;&nbsp;&nbsp;${escapeXml(prof.requiredResourcesHuman.trim()).replace(/\n/g, '<br />&nbsp;&nbsp;&nbsp;')}`);
    }
    if (prof.requiredResourcesInfo && prof.requiredResourcesInfo.trim()) {
      lines.push(`• &nbsp;<strong>${lblInfo}:</strong><br />&nbsp;&nbsp;&nbsp;${escapeXml(prof.requiredResourcesInfo.trim()).replace(/\n/g, '<br />&nbsp;&nbsp;&nbsp;')}`);
    }
    if (prof.requiredResourcesEnv && prof.requiredResourcesEnv.trim()) {
      lines.push(`• &nbsp;<strong>${lblEnv}:</strong><br />&nbsp;&nbsp;&nbsp;${escapeXml(prof.requiredResourcesEnv.trim()).replace(/\n/g, '<br />&nbsp;&nbsp;&nbsp;')}`);
    }
    return lines.join('<br />');
  };

  return `
<table style="font-family: ${font}; font-size: ${fontSizePt}pt; border-collapse: collapse; width: 100%; border: 1.5px solid #000000; color: #000000; background-color: #ffffff;">
  <tbody>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 5px 8px; vertical-align: top; line-height: 1.35;">
        <strong>${lblName}:</strong> ${escapeXml(proc.name)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 5px 8px; vertical-align: top; line-height: 1.35;">
        <strong>${lblVision}:</strong> ${renderSimpleText(prof.vision)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 5px 8px; vertical-align: top; line-height: 1.35;">
        <strong>${lblOwner}:</strong> ${renderSimpleText(prof.processOwner)}
      </td>
    </tr>
    <tr>
      <td style="width: 50%; border: 1px solid #000000; padding: 5px 8px; vertical-align: top; line-height: 1.35;">
        <strong>${lblCustomer}:</strong><br />
        ${renderBullets(prof.customer)}
      </td>
      <td style="width: 50%; border: 1px solid #000000; padding: 5px 8px; vertical-align: top; line-height: 1.35;">
        <strong>${lblExpectation}:</strong><br />
        ${renderBullets(prof.customerExpectation)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 5px 8px; vertical-align: top; line-height: 1.35;">
        <strong>${lblOutcome}:</strong> ${renderSimpleText(prof.outcome)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 5px 8px; vertical-align: top; line-height: 1.35;">
        <strong>${lblTrigger}:</strong> ${renderSimpleText(prof.trigger)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 5px 8px; vertical-align: top; line-height: 1.35;">
        <strong>${lblFirstAct}:</strong> ${renderSimpleText(prof.firstActivity)}<br />
        <span style="color: #000000; font-size: 8pt; letter-spacing: 1px;">.....</span><br />
        <strong>${lblLastAct}:</strong> ${renderSimpleText(prof.lastActivity)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 5px 8px; vertical-align: top; line-height: 1.35;">
        <strong>${lblInbound}:</strong> ${renderSimpleText(prof.interfacesInbound)}<br />
        <strong>${lblOutbound}:</strong> ${renderSimpleText(prof.interfacesOutbound)}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 5px 8px; vertical-align: top; line-height: 1.35;">
        <strong>${lblResources}:</strong><br />
        ${renderResourcesBlock()}
      </td>
    </tr>
    <tr>
      <td colspan="2" style="border: 1px solid #000000; padding: 5px 8px; vertical-align: top; line-height: 1.35;">
        <strong>${lblMeasures}:</strong><br />
        ${renderBullets(prof.performanceMeasures)}
      </td>
    </tr>
  </tbody>
</table>`.trim();
};

export const buildProfilePlainText = (proc: BPMProcess, isEs: boolean): string => {
  const prof = (!isEs && proc.profileEn)
    ? { ...(proc.profile || {}), ...proc.profileEn }
    : (proc.profile || proc.profileEn || {});
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

export const exportProfileToPdf = async (proc: BPMProcess, config: AppConfig) => {
  const language = config.language;

  // Create temporary container element to render table in DOM for html2canvas / jsPDF
  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'fixed';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  tempDiv.style.width = '780px';
  tempDiv.style.boxSizing = 'border-box';
  tempDiv.style.backgroundColor = '#ffffff';
  tempDiv.style.padding = '24px';
  tempDiv.innerHTML = buildProfileHtmlTable(proc, config, 10);
  document.body.appendChild(tempDiv);

  try {
    const canvas = await html2canvas(tempDiv, {
      scale: 2.5,
      useCORS: true,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    });

    const pdfPageWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    const margin = 36; // 0.5 inch margins
    const printableWidth = pdfPageWidth - margin * 2;
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    const printableHeight = (imgHeight * printableWidth) / imgWidth;

    pdf.addImage(imgData, 'PNG', margin, margin, printableWidth, Math.min(printableHeight, pdfPageHeight - margin * 2));

    const safeName = proc.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
    pdf.save(`perfil_proceso_${safeName}_${language}.pdf`);
  } catch (err) {
    console.error('Error generating PDF:', err);
  } finally {
    if (document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
  }
};

export const exportMultipleProfilesToPdf = async (
  processes: BPMProcess[],
  config: AppConfig
) => {
  if (processes.length === 0) return;
  const isEs = config.language === 'es';

  const tempDiv = document.createElement('div');
  tempDiv.style.position = 'fixed';
  tempDiv.style.left = '-9999px';
  tempDiv.style.top = '0';
  tempDiv.style.width = '780px';
  tempDiv.style.boxSizing = 'border-box';
  tempDiv.style.backgroundColor = '#ffffff';
  tempDiv.style.padding = '24px';
  document.body.appendChild(tempDiv);

  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter',
  });

  try {
    const pdfPageWidth = pdf.internal.pageSize.getWidth();
    const pdfPageHeight = pdf.internal.pageSize.getHeight();
    const margin = 36;
    const printableWidth = pdfPageWidth - margin * 2;

    for (let i = 0; i < processes.length; i++) {
      const proc = processes[i];
      tempDiv.innerHTML = buildProfileHtmlTable(proc, config, 10);

      const canvas = await html2canvas(tempDiv, {
        scale: 2.5,
        useCORS: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const printableHeight = (imgHeight * printableWidth) / imgWidth;

      if (i > 0) {
        pdf.addPage();
      }

      pdf.addImage(imgData, 'PNG', margin, margin, printableWidth, Math.min(printableHeight, pdfPageHeight - margin * 2));
    }

    const fileName = isEs ? `perfiles_de_proceso_completos_${config.language}.pdf` : `all_process_profiles_${config.language}.pdf`;
    pdf.save(fileName);
  } catch (err) {
    console.error('Error generating multi-profile PDF:', err);
  } finally {
    if (document.body.contains(tempDiv)) {
      document.body.removeChild(tempDiv);
    }
  }
};

