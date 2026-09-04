import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BPMProcess, AppConfig, ProcessProfileData, ProcessCategory } from './types';
import { escapeXml } from './drawio';
import { jsPDF } from 'jspdf';
import {
  Copy,
  Check,
  Download,
  Search,
  ChevronDown,
  HelpCircle,
  X,
  BookOpen,
} from 'lucide-react';
import { toast } from 'react-toastify';

interface ProcessProfileViewProps {
  processes: BPMProcess[];
  config: AppConfig;
  onUpdateProcess?: (id: string, updates: Partial<BPMProcess>) => void;
}

interface HelpContent {
  title: string;
  concept: string;
  guidelines: string[];
  example: string;
}

const STORAGE_KEY_SAVED_OWNERS = 'bpm_custom_process_owners';

export const ProcessProfileView: React.FC<ProcessProfileViewProps> = ({
  processes,
  config,
  onUpdateProcess,
}) => {
  const isEs = config.language === 'es';

  // Filtros para la selección de procesos
  const [selectedCategory, setSelectedCategory] = useState<ProcessCategory | 'all'>('all');
  const [searchProcess, setSearchProcess] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Proceso seleccionado
  const [selectedProcessId, setSelectedProcessId] = useState<string>(() => {
    return processes.length > 0 ? processes[0].id : '';
  });

  const [copiedTable, setCopiedTable] = useState(false);
  const [activeHelpModal, setActiveHelpModal] = useState<HelpContent | null>(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lista de dueños de procesos guardados históricamente para autocompletar
  const [savedOwners, setSavedOwners] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_SAVED_OWNERS);
      const defaults = [
        'Chief Executive Officer (CEO)',
        'Chief Financial Officer (CFO)',
        'Chief Operating Officer (COO)',
        'Chief Technology Officer (CTO)',
        'Procurement Director',
        'Sales & Marketing Director',
        'Human Resources Director',
        'Quality Assurance Manager',
      ];
      if (saved) {
        const parsed = JSON.parse(saved);
        return Array.from(new Set([...defaults, ...parsed]));
      }
      return defaults;
    } catch {
      return [];
    }
  });

  // Guardar nuevo owner si no existe en la lista
  const saveOwnerIfNew = (ownerName: string) => {
    const trimmed = ownerName.trim();
    if (!trimmed) return;
    if (!savedOwners.includes(trimmed)) {
      const updated = [trimmed, ...savedOwners];
      setSavedOwners(updated);
      try {
        localStorage.setItem(STORAGE_KEY_SAVED_OWNERS, JSON.stringify(updated));
      } catch (_) {}
    }
  };

  // Filtrado de procesos
  const filteredProcesses = useMemo(() => {
    return processes.filter((p) => {
      const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
      const matchesSearch =
        !searchProcess.trim() ||
        p.name.toLowerCase().includes(searchProcess.toLowerCase()) ||
        (p.groupName && p.groupName.toLowerCase().includes(searchProcess.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [processes, selectedCategory, searchProcess]);

  // Si el proceso seleccionado no está dentro de la lista actual, ajustar
  useEffect(() => {
    if (processes.length > 0 && !processes.some((p) => p.id === selectedProcessId)) {
      setSelectedProcessId(processes[0].id);
    }
  }, [processes, selectedProcessId]);

  // Proceso actualmente seleccionado
  const currentProcess = useMemo(() => {
    return processes.find((p) => p.id === selectedProcessId) || processes[0] || null;
  }, [processes, selectedProcessId]);

  const profile: ProcessProfileData = currentProcess?.profile || {};

  const handleProfileChange = (field: keyof ProcessProfileData, value: string) => {
    if (!currentProcess || !onUpdateProcess) return;
    const updatedProfile: ProcessProfileData = {
      ...profile,
      [field]: value,
    };
    onUpdateProcess(currentProcess.id, { profile: updatedProfile });
  };

  // Contenidos de ayuda exhaustivos y rigurosamente fundamentados en el Capítulo 2
  const HELP_DICTIONARY: Record<string, HelpContent> = useMemo(() => {
    if (isEs) {
      return {
        processOwner: {
          title: 'Responsable del Proceso (Process Owner)',
          concept: 'El Process Owner es la persona o rol directivo responsable del diseño integral, supervisión del rendimiento y mejora continua del proceso de punta a punta (end-to-end).',
          guidelines: [
            'Supervisa el logro de los objetivos estratégicos y operativos del proceso en términos de rentabilidad, cumplimiento y rendición de cuentas.',
            'Tiene la autoridad para tomar decisiones sobre cambios en la estructura del proceso, asignación de recursos y resolución de cuellos de botella.',
            'Evalúa periódicamente la factibilidad técnica y organizacional de las iniciativas de mejora.'
          ],
          example: 'Chief Financial Officer (CFO) para el proceso Procure-to-Pay, o Director de Operaciones Académicas para Programación de Cursos.'
        },
        vision: {
          title: 'Visión / Objetivo del Proceso',
          concept: 'Declaración de alto nivel que define el propósito del proceso y cómo se alinea con la estrategia y la propuesta de valor de la organización.',
          guidelines: [
            'Debe describir el estado deseado o propósito que el proceso debe garantizar de manera continua.',
            'Establece las expectativas centrales de calidad, costo y oportunidad esperadas por la dirección.',
            'Sirve de guía para formular los objetivos específicos de desempeño y los límites de intervención.'
          ],
          example: 'El objetivo del proceso de adquisiciones es asegurar que toda la gama de productos y servicios externos esté disponible a tiempo y con el nivel de calidad requerido.'
        },
        customer: {
          title: 'Cliente del Proceso (Customer)',
          concept: 'El destinatario que recibe o se beneficia directamente del resultado o valor entregado por el proceso.',
          guidelines: [
            'En procesos Core/Principales suele ser el cliente externo del mercado (ej. comprador, estudiante, usuario).',
            'En procesos de Soporte o Gestión es comúnmente un cliente interno (ej. la unidad solicitante, otra área operativa).',
            'Identificar claramente al cliente permite definir con precisión sus criterios de satisfacción.'
          ],
          example: 'Unidad solicitante / Departamento de obras en Procure-to-Pay; Estudiante en Proceso de Matrícula.'
        },
        customerExpectation: {
          title: 'Expectativa del Cliente',
          concept: 'Los requisitos, estándares y condiciones que el cliente espera percibir respecto a la entrega del producto o servicio.',
          guidelines: [
            'Se relaciona directamente con la calidad externa del proceso y los acuerdos de nivel de servicio (SLAs).',
            'Abarca dimensiones clave como puntualidad en la entrega, costo económico, exactitud y completitud del servicio.',
            'Determina los criterios contra los cuales se medirá la satisfacción del cliente.'
          ],
          example: 'Provisión oportuna, económica y completa de los insumos requeridos.'
        },
        outcome: {
          title: 'Resultado del Proceso (Outcome)',
          concept: 'El estado final positivo o producto tangible/intangible generado tras completar la ejecución del proceso.',
          guidelines: [
            'Suele formularse conceptualmente como "sustantivo + participio pasado" (ej. productos entregados, solicitud aprobada).',
            'Representa el valor concreto que justifica la existencia y ejecución del proceso.',
            'Debe ser observable e individualmente verificable para cada caso ejecutado.'
          ],
          example: 'Productos entregados o servicios prestados a conformidad para la unidad solicitante.'
        },
        trigger: {
          title: 'Disparador del Proceso (Trigger)',
          concept: 'El evento inicial o la condición que genera una nueva instancia del proceso e inicia su primera actividad.',
          guidelines: [
            'Marca el límite de entrada del proceso en el tiempo.',
            'Corresponde a la identificación de una necesidad, la llegada de una solicitud o una señal del entorno.',
            'Debe existir una relación 1:1 entre el evento disparador y las actividades que se ejecutan dentro del alcance del proceso.'
          ],
          example: 'Se identifica una necesidad de compra / Solicitud de adquisición radicada.'
        },
        firstLastActivity: {
          title: 'Primera y Última Actividad (Límites del Proceso)',
          concept: 'Definen con exactitud las fronteras operativas donde inicia y concluye el alcance del proceso.',
          guidelines: [
            'Primera Actividad: La primera acción o tarea que se ejecuta inmediatamente después de que ocurre el disparador.',
            'Última Actividad: La acción final que concreta el resultado y da por cerrado el caso.',
            'Establecer estos límites evita solapamientos o vacíos de responsabilidad entre procesos adyacentes.'
          ],
          example: 'Primera actividad: Radicar Solicitud. Última actividad: Crear y emitir Orden de Compra.'
        },
        interfaces: {
          title: 'Interfaces Entrantes y Salientes',
          concept: 'Los puntos de contacto y transferencia de información, insumos o resultados entre este proceso y otros procesos de la arquitectura.',
          guidelines: [
            'Interfaces Entrantes (Inbound): Procesos precedentes o proveedores que alimentan o condicionan el inicio de este proceso.',
            'Interfaces Salientes (Outbound): Procesos sucesores o receptores que toman la salida de este proceso como insumo para sus operaciones.',
            'Garantizan la coherencia de la cadena de valor de punta a punta (end-to-end).'
          ],
          example: 'Inbound: Plan-to-Procure (Planificación). Outbound: Construct-to-Complete (Ejecución de obra).'
        },
        requiredResources: {
          title: 'Recursos Requeridos (Humanos, Información, Entorno)',
          concept: 'Conjunto de capacidades, personal, información y tecnología indispensables para ejecutar el proceso.',
          guidelines: [
            'Recursos Humanos: Roles, cargos o perfiles de los participantes directos involucrados en la ejecución.',
            'Información y Conocimiento: Guías de procedimiento, políticas, catálogos de servicios, bases de datos o contratos marco requeridos.',
            'Entorno e Infraestructura: Sistemas de información (ERP, CRM), herramientas tecnológicas, software o infraestructura física utilizada.'
          ],
          example: 'Humanos: Ingeniero de sitio, Asistente, Jefe de obras. Info: Guías de compras, evaluación de proveedores. Entorno: Sistema ERP de adquisiciones.'
        },
        performanceMeasures: {
          title: 'Medidas de Desempeño del Proceso (KPIs)',
          concept: 'Indicadores cuantitativos utilizados para medir la eficiencia y eficacia del proceso a lo largo de las dimensiones de tiempo, costo, calidad y flexibilidad.',
          guidelines: [
            'Tiempo (Time): Tiempo de ciclo promedio, tiempo de procesamiento o cumplimiento de plazos.',
            'Costo (Cost): Costo operativo por caso, costos laborales o costos de desperdicio.',
            'Calidad (Quality): Tasa de errores, porcentaje de casos reprocesados, índice de satisfacción del cliente.',
            'Flexibilidad (Flexibility): Capacidad de adaptarse a cambios en el volumen de demanda o variantes en los casos.'
          ],
          example: 'Cycle Time (Tiempo de ciclo promedio)\nOperational Costs (Costo por orden emitida)\nError Rate (Tasa de órdenes rechazadas)'
        }
      };
    } else {
      return {
        processOwner: {
          title: 'Process Owner',
          concept: 'The individual or executive role responsible for the end-to-end design, overall performance monitoring, and continuous improvement of the process.',
          guidelines: [
            'Oversees profitability, regulatory compliance, and strategic alignment of the process.',
            'Has the authority to enact structural process changes, allocate resources, and address systemic bottlenecks.',
            'Evaluates the feasibility of proposed process redesign and improvement initiatives.'
          ],
          example: 'Chief Financial Officer (CFO) for Procure-to-Pay, or Director of Academic Operations for Course Scheduling.'
        },
        vision: {
          title: 'Process Vision & Objective',
          concept: 'A high-level strategic statement defining the fundamental purpose of the process and its value proposition.',
          guidelines: [
            'Describes the desirable operational state that the process continuously secures.',
            'Establishes key expectations of quality, cost efficiency, and timeliness set by executive leadership.',
            'Serves as the foundation for defining concrete performance measures and improvement targets.'
          ],
          example: 'The objective of the procurement process is to secure that the entire range of external products and services becomes available on time and is at the required level of quality.'
        },
        customer: {
          title: 'Customer of Process',
          concept: 'The recipient or beneficiary who directly receives the outcome or value generated by the process.',
          guidelines: [
            'In Core processes, this is typically an external market customer (e.g. buyer, student, passenger).',
            'In Support or Management processes, this is commonly an internal department or requesting unit.',
            'Clearly identifying the customer establishes the baseline for customer satisfaction metrics.'
          ],
          example: 'Requesting unit / Site department in Procure-to-Pay; Student in Course Enrollment.'
        },
        customerExpectation: {
          title: 'Expectation of Customer',
          concept: 'The specific criteria, conditions, and quality standards that the customer expects from the process output.',
          guidelines: [
            'Directly correlates with external process quality and service level agreements (SLAs).',
            'Encompasses dimensions such as delivery speed, economic cost, accuracy, and service completeness.',
            'Determines the threshold for evaluating customer satisfaction.'
          ],
          example: 'Timely, economic, and complete provision of requested goods or services.'
        },
        outcome: {
          title: 'Process Outcome',
          concept: 'The tangible product or positive final state generated once the process has completed execution.',
          guidelines: [
            'Typically expressed as "noun + past participle" (e.g. delivered products, approved request).',
            'Represents the essential value that justifies executing the process.',
            'Must be individually observable and verifiable for each completed case.'
          ],
          example: 'Delivered products or provided services for the requested unit.'
        },
        trigger: {
          title: 'Process Trigger',
          concept: 'The initiating event or condition that instantiates a new process case and starts the first activity.',
          guidelines: [
            'Defines the temporal entry boundary of the process.',
            'Corresponds to a recognized need, incoming request, or system alert.',
            'Must have a clear 1:1 relationship with the activities in the process scope.'
          ],
          example: 'Need is identified / Purchase request received.'
        },
        firstLastActivity: {
          title: 'First and Last Activity (Process Boundaries)',
          concept: 'Defines the operational entry and exit boundaries of the process workflow.',
          guidelines: [
            'First Activity: The initial operational task executed immediately following the trigger.',
            'Last Activity: The final task that materializes the outcome and closes the case.',
            'Precise boundary definition prevents gaps and overlapping responsibilities between adjoining processes.'
          ],
          example: 'First activity: Submit Request. Last activity: Create Purchase Order.'
        },
        interfaces: {
          title: 'Inbound & Outbound Interfaces',
          concept: 'Touchpoints and handover linkages connecting this process to other processes in the process architecture.',
          guidelines: [
            'Inbound Interfaces: Preceding processes or external suppliers feeding inputs or prerequisites.',
            'Outbound Interfaces: Succeeding processes or recipients that consume the output of this process.',
            'Ensures end-to-end alignment across the entire value chain.'
          ],
          example: 'Inbound: Plan-to-Procure (Planning). Outbound: Construct-to-Complete (Construction execution).'
        },
        requiredResources: {
          title: 'Required Resources (Human, Information, Environment)',
          concept: 'The combination of human roles, informational assets, and technological infrastructure necessary to run the process.',
          guidelines: [
            'Human Resources: Roles, positions, or actors executing the process tasks.',
            'Information & Know-how: Operating guidelines, compliance policies, framework contracts, or catalog data.',
            'Work Environment & Infrastructure: Software systems (ERP, CRM), hardware tools, or physical facilities.'
          ],
          example: 'Human: Site Engineer, Clerk, Works Engineer. Info: Procurement guidelines, supplier ratings. Environment: ERP procurement system.'
        },
        performanceMeasures: {
          title: 'Process Performance Measures (KPIs)',
          concept: 'Quantitative indicators measuring process efficiency and effectiveness across time, cost, quality, and flexibility dimensions.',
          guidelines: [
            'Time: Average cycle time, processing time, deadline compliance rate.',
            'Cost: Operational cost per case, labor costs, waste/rework costs.',
            'Quality: Error rate, customer satisfaction rating (NPS, churn rate), first-time-right percentage.',
            'Flexibility: Ability to handle case variations, workload surges, or changing partner demands.'
          ],
          example: 'Cycle Time\nOperational Costs\nError Rate'
        }
      };
    }
  }, [isEs]);

  // Componente interactivo para el ícono (?)
  const HelpTooltipButton: React.FC<{ helpKey: string; tooltipText: string }> = ({ helpKey, tooltipText }) => {
    const [hover, setHover] = useState(false);
    const data = HELP_DICTIONARY[helpKey];

    return (
      <div className="relative inline-flex items-center ml-1">
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (data) setActiveHelpModal(data);
          }}
          onMouseEnter={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          className="text-slate-400 hover:text-slate-900 p-0.5 rounded cursor-pointer transition-colors"
          title={isEs ? 'Clic para ver explicación detallada del libro' : 'Click to view detailed textbook guide'}
        >
          <HelpCircle className="w-3.5 h-3.5" />
        </button>

        {hover && (
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-1.5 z-50 w-64 bg-slate-900 text-white text-[11px] p-2.5 rounded-lg shadow-xl leading-relaxed pointer-events-none animate-in fade-in duration-100">
            {tooltipText}
            <div className="mt-1 text-[10px] text-slate-300 font-medium border-t border-slate-700 pt-1">
              {isEs ? '💡 Haz clic para ver guía detallada y ejemplos' : '💡 Click to view detailed guide & examples'}
            </div>
          </div>
        )}
      </div>
    );
  };

  // Construcción del HTML de la tabla formateada estándar
  const buildProfileHtmlTable = (proc: BPMProcess, fontSizePt: number = 10): string => {
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

  // Generar texto plano delimitado (TSV)
  const buildProfilePlainText = (proc: BPMProcess): string => {
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

  // Copiar tabla limpia al portapapeles (HTML + TSV 10pt)
  const copyTableToClipboard = async () => {
    if (!currentProcess) return;
    const htmlTable = buildProfileHtmlTable(currentProcess, 10);
    const plainText = buildProfilePlainText(currentProcess);

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([htmlTable], { type: 'text/html' });
        const blobText = new Blob([plainText], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      setCopiedTable(true);
      toast.success(isEs ? '¡Tabla copiada al portapapeles!' : 'Table copied to clipboard!');
      setTimeout(() => setCopiedTable(false), 2500);
    } catch {
      await navigator.clipboard.writeText(plainText);
      setCopiedTable(true);
      toast.success(isEs ? '¡Tabla copiada al portapapeles!' : 'Table copied to clipboard!');
      setTimeout(() => setCopiedTable(false), 2500);
    }
  };

  // Descarga directa en PDF con jsPDF
  const downloadProfilePDF = () => {
    if (!currentProcess) return;
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'letter',
    });

    const container = document.getElementById('process-profile-table-container');
    if (!container) return;

    pdf.html(container, {
      callback: function (doc) {
        const safeName = currentProcess.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
        doc.save(`perfil_proceso_${safeName}_${config.language}.pdf`);
      },
      x: 36,
      y: 36,
      width: 540,
      windowWidth: 720,
    });
  };

  if (!currentProcess) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-8 text-center text-slate-500 text-xs">
        <p>
          {isEs
            ? 'No hay procesos en el inventario. Agrega procesos en la primera pestaña.'
            : 'No processes found in inventory. Add processes in the first tab.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Barra Superior de Controles y Selección */}
      <div className="flex flex-wrap items-center justify-between bg-white border border-slate-200 rounded-lg px-4 py-2.5 shadow-2xs gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-900">
            {isEs ? 'Perfil de Proceso' : 'Process Profile'}
          </span>
          <span className="text-[11px] font-medium text-slate-400">
            ({currentProcess.name})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Botón Copiar Tabla */}
          <button
            onClick={copyTableToClipboard}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
              copiedTable
                ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
            }`}
            title={isEs ? 'Copiar tabla formateada para Word o Docs' : 'Copy formatted table for Word or Docs'}
          >
            {copiedTable ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span>{copiedTable ? (isEs ? '¡Copiado!' : 'Copied!') : (isEs ? 'Copiar Tabla' : 'Copy Table')}</span>
          </button>

          {/* Botón Descargar PDF */}
          <button
            onClick={downloadProfilePDF}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* COLUMNA IZQUIERDA: SELECTOR Y FORMULARIO DE EDICIÓN */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* Selector y Buscador de Procesos con Filtro de Categoría */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col gap-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-900">
                {isEs ? 'Seleccionar Proceso' : 'Select Process'}
              </span>
              <span className="text-[11px] font-medium text-slate-400">
                {filteredProcesses.length} {isEs ? 'disponibles' : 'available'}
              </span>
            </div>

            {/* Pestañas de Categoría */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-md text-xs font-medium">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`flex-1 py-1 text-center rounded transition-colors cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isEs ? 'Todos' : 'All'}
              </button>
              <button
                onClick={() => setSelectedCategory('management')}
                className={`flex-1 py-1 text-center rounded transition-colors cursor-pointer ${
                  selectedCategory === 'management'
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {isEs ? 'Gestión' : 'Management'}
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
                {isEs ? 'Soporte' : 'Support'}
              </button>
            </div>

            {/* Dropdown Interactivo con apertura/cierre directo */}
            <div className="relative" ref={dropdownRef}>
              <div
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="w-full flex items-center justify-between px-3 py-2 text-xs bg-slate-50 hover:bg-slate-100/70 border border-slate-200 rounded-md cursor-pointer transition-colors"
              >
                <span className="font-semibold text-slate-800 truncate">
                  {currentProcess.name}
                </span>
                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </div>

              {/* Panel Desplegable que se abre y filtra en tiempo real */}
              {isDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 z-50 bg-white border border-slate-200 rounded-lg shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 flex flex-col">
                  {/* Buscador dentro del menú desplegable */}
                  <div className="p-2 border-b border-slate-100 bg-slate-50">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        autoFocus
                        value={searchProcess}
                        onChange={(e) => setSearchProcess(e.target.value)}
                        placeholder={isEs ? 'Buscar proceso por nombre...' : 'Search process by name...'}
                        className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-md outline-none focus:border-slate-800 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Lista de resultados filtrados */}
                  <div className="max-h-56 overflow-y-auto p-1 flex flex-col gap-0.5">
                    {filteredProcesses.length === 0 ? (
                      <div className="p-3 text-center text-xs text-slate-400">
                        {isEs ? 'No se encontraron procesos' : 'No processes found'}
                      </div>
                    ) : (
                      filteredProcesses.map((p) => {
                        const isSelected = p.id === currentProcess.id;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              setSelectedProcessId(p.id);
                              setIsDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded text-xs transition-colors cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'bg-slate-900 text-white font-semibold'
                                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                            }`}
                          >
                            <span className="truncate">{p.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 shrink-0 ml-2" />}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Formulario de Campos */}
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col gap-3.5 text-xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-900">
                {isEs ? 'Información del Perfil' : 'Profile Information'}
              </span>
            </div>

            {/* Nombre y Responsable (Combobox) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center text-slate-700 font-medium mb-1 text-[11px]">
                  <span>{isEs ? 'Nombre del Proceso:' : 'Process Name:'}</span>
                </label>
                <input
                  type="text"
                  value={currentProcess.name}
                  disabled
                  className="w-full px-2.5 py-1.5 bg-slate-100 border border-slate-200 rounded text-slate-700 text-xs font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="flex items-center text-slate-700 font-medium mb-1 text-[11px]">
                  <span>{isEs ? 'Responsable del Proceso:' : 'Process Owner:'}</span>
                  <HelpTooltipButton
                    helpKey="processOwner"
                    tooltipText={
                      isEs
                        ? 'La persona o rol directivo responsable del diseño, supervisión del rendimiento y mejora continua del proceso.'
                        : 'The individual or executive role responsible for the design, end-to-end performance, and continuous improvement of the process.'
                    }
                  />
                </label>
                <div className="relative">
                  <input
                    type="text"
                    list="process-owners-list"
                    value={profile.processOwner || ''}
                    onChange={(e) => handleProfileChange('processOwner', e.target.value)}
                    onBlur={(e) => saveOwnerIfNew(e.target.value)}
                    placeholder=""
                    className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
                  />
                  <datalist id="process-owners-list">
                    {savedOwners.map((owner, idx) => (
                      <option key={idx} value={owner} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>

            {/* Visión del Proceso */}
            <div>
              <label className="flex items-center text-slate-700 font-medium mb-1 text-[11px]">
                <span>{isEs ? 'Visión / Objetivo del Proceso:' : 'Vision / Objective:'}</span>
                <HelpTooltipButton
                  helpKey="vision"
                  tooltipText={
                    isEs
                      ? 'Declaración concisa del propósito estratégico del proceso y cómo aporta valor a la organización.'
                      : 'Concise statement of the strategic purpose of the process and how it delivers value to the organization.'
                  }
                />
              </label>
              <textarea
                rows={2}
                value={profile.vision || ''}
                onChange={(e) => handleProfileChange('vision', e.target.value)}
                placeholder=""
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800 leading-relaxed"
              />
            </div>

            {/* Cliente y Expectativa */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center text-slate-700 font-medium mb-1 text-[11px]">
                  <span>{isEs ? 'Cliente del Proceso:' : 'Customer of Process:'}</span>
                  <HelpTooltipButton
                    helpKey="customer"
                    tooltipText={
                      isEs
                        ? 'Quién recibe el resultado final del proceso (cliente externo o unidad interna solicitante).'
                        : 'Who receives the outcome of the process (external customer or internal department).'
                    }
                  />
                </label>
                <input
                  type="text"
                  value={profile.customer || ''}
                  onChange={(e) => handleProfileChange('customer', e.target.value)}
                  placeholder=""
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
                />
              </div>
              <div>
                <label className="flex items-center text-slate-700 font-medium mb-1 text-[11px]">
                  <span>{isEs ? 'Expectativa del Cliente:' : 'Expectation of Customer:'}</span>
                  <HelpTooltipButton
                    helpKey="customerExpectation"
                    tooltipText={
                      isEs
                        ? 'Qué espera el cliente en términos de calidad, oportunidad de entrega, precio y nivel de servicio (SLAs).'
                        : 'What the customer expects regarding quality, delivery speed, price, and service standards.'
                    }
                  />
                </label>
                <input
                  type="text"
                  value={profile.customerExpectation || ''}
                  onChange={(e) => handleProfileChange('customerExpectation', e.target.value)}
                  placeholder=""
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
                />
              </div>
            </div>

            {/* Resultado y Disparador */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center text-slate-700 font-medium mb-1 text-[11px]">
                  <span>{isEs ? 'Resultado:' : 'Outcome:'}</span>
                  <HelpTooltipButton
                    helpKey="outcome"
                    tooltipText={
                      isEs
                        ? 'El producto o estado final positivo que se genera tras completar la ejecución del proceso (sustantivo + participio pasado).'
                        : 'The tangible output or positive final state generated when the process finishes.'
                    }
                  />
                </label>
                <input
                  type="text"
                  value={profile.outcome || ''}
                  onChange={(e) => handleProfileChange('outcome', e.target.value)}
                  placeholder=""
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
                />
              </div>
              <div>
                <label className="flex items-center text-slate-700 font-medium mb-1 text-[11px]">
                  <span>{isEs ? 'Disparador:' : 'Trigger:'}</span>
                  <HelpTooltipButton
                    helpKey="trigger"
                    tooltipText={
                      isEs
                        ? 'El evento o necesidad que inicia la primera actividad del proceso (relación 1:1 con las actividades).'
                        : 'The event or need that initiates the first activity of the process.'
                    }
                  />
                </label>
                <input
                  type="text"
                  value={profile.trigger || ''}
                  onChange={(e) => handleProfileChange('trigger', e.target.value)}
                  placeholder=""
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
                />
              </div>
            </div>

            {/* Primera y Última Actividad */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center text-slate-700 font-medium mb-1 text-[11px]">
                  <span>{isEs ? 'Primera Actividad:' : 'First Activity:'}</span>
                  <HelpTooltipButton
                    helpKey="firstLastActivity"
                    tooltipText={
                      isEs
                        ? 'La actividad inicial que marca el punto de inicio de la secuencia del flujo de trabajo.'
                        : 'The starting step that marks the beginning of the workflow.'
                    }
                  />
                </label>
                <input
                  type="text"
                  value={profile.firstActivity || ''}
                  onChange={(e) => handleProfileChange('firstActivity', e.target.value)}
                  placeholder=""
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
                />
              </div>
              <div>
                <label className="flex items-center text-slate-700 font-medium mb-1 text-[11px]">
                  <span>{isEs ? 'Última Actividad:' : 'Last Activity:'}</span>
                  <HelpTooltipButton
                    helpKey="firstLastActivity"
                    tooltipText={
                      isEs
                        ? 'La actividad de cierre con la cual concluye el flujo de ejecución del proceso.'
                        : 'The final step that closes the process execution.'
                    }
                  />
                </label>
                <input
                  type="text"
                  value={profile.lastActivity || ''}
                  onChange={(e) => handleProfileChange('lastActivity', e.target.value)}
                  placeholder=""
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
                />
              </div>
            </div>

            {/* Interfaces Inbound y Outbound */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="flex items-center text-slate-700 font-medium mb-1 text-[11px]">
                  <span>{isEs ? 'Interfaces Entrantes:' : 'Interfaces Inbound:'}</span>
                  <HelpTooltipButton
                    helpKey="interfaces"
                    tooltipText={
                      isEs
                        ? 'Procesos anteriores o fuentes externas que entregan insumos o disparan este proceso.'
                        : 'Preceding processes or external systems that deliver inputs or triggers to this process.'
                    }
                  />
                </label>
                <input
                  type="text"
                  value={profile.interfacesInbound || ''}
                  onChange={(e) => handleProfileChange('interfacesInbound', e.target.value)}
                  placeholder=""
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
                />
              </div>
              <div>
                <label className="flex items-center text-slate-700 font-medium mb-1 text-[11px]">
                  <span>{isEs ? 'Interfaces Salientes:' : 'Interfaces Outbound:'}</span>
                  <HelpTooltipButton
                    helpKey="interfaces"
                    tooltipText={
                      isEs
                        ? 'Procesos posteriores o destinatarios a los cuales este proceso entrega sus salidas.'
                        : 'Subsequent processes or recipients to which this process sends its outputs.'
                    }
                  />
                </label>
                <input
                  type="text"
                  value={profile.interfacesOutbound || ''}
                  onChange={(e) => handleProfileChange('interfacesOutbound', e.target.value)}
                  placeholder=""
                  className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
                />
              </div>
            </div>

            {/* Recursos Requeridos */}
            <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-md">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-800 flex items-center">
                  <span>{isEs ? 'Recursos Requeridos:' : 'Required Resources:'}</span>
                  <HelpTooltipButton
                    helpKey="requiredResources"
                    tooltipText={
                      isEs
                        ? 'Elementos humanos, técnicos, documentales y físicos indispensables para ejecutar el proceso.'
                        : 'All human, technical, informational, and physical assets necessary to run the process.'
                    }
                  />
                </span>
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1 text-[10.5px]">
                  {isEs ? 'Recursos Humanos:' : 'Human Resources:'}
                </label>
                <input
                  type="text"
                  value={profile.requiredResourcesHuman || ''}
                  onChange={(e) => handleProfileChange('requiredResourcesHuman', e.target.value)}
                  placeholder=""
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1 text-[10.5px]">
                  {isEs ? 'Información, Documentos y Conocimiento:' : 'Information, Documents and Know-how:'}
                </label>
                <input
                  type="text"
                  value={profile.requiredResourcesInfo || ''}
                  onChange={(e) => handleProfileChange('requiredResourcesInfo', e.target.value)}
                  placeholder=""
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
                />
              </div>
              <div>
                <label className="block text-slate-600 font-medium mb-1 text-[10.5px]">
                  {isEs ? 'Entorno de trabajo, Materiales e Infraestructura:' : 'Work Environment, Materials and Infrastructure:'}
                </label>
                <input
                  type="text"
                  value={profile.requiredResourcesEnv || ''}
                  onChange={(e) => handleProfileChange('requiredResourcesEnv', e.target.value)}
                  placeholder=""
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
                />
              </div>
            </div>

            {/* Medidas de Desempeño */}
            <div>
              <label className="flex items-center text-slate-700 font-medium mb-1 text-[11px]">
                <span>{isEs ? 'Medidas de Desempeño del Proceso:' : 'Process Performance Measures:'}</span>
                <HelpTooltipButton
                  helpKey="performanceMeasures"
                  tooltipText={
                    isEs
                      ? 'Indicadores clave cuantitativos de tiempo, costo, calidad y flexibilidad. Puedes ingresar uno por línea.'
                      : 'Key quantitative metrics used to evaluate process performance across time, cost, quality, and flexibility.'
                  }
                />
              </label>
              <textarea
                rows={3}
                value={profile.performanceMeasures || ''}
                onChange={(e) => handleProfileChange('performanceMeasures', e.target.value)}
                placeholder=""
                className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
              />
            </div>
          </div>
        </div>

        {/* COLUMNA DERECHA: PREVISUALIZACIÓN DE LA TABLA FORMAL */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-900">
                {isEs ? 'Previsualización de la Tabla' : 'Table Preview'}
              </span>
            </div>

            {/* Contenedor renderizado */}
            <div
              id="process-profile-table-container"
              className="w-full bg-white p-2 rounded overflow-x-auto shadow-2xs"
              style={{ fontFamily: config.fontFamily }}
              dangerouslySetInnerHTML={{ __html: buildProfileHtmlTable(currentProcess, 10) }}
            />
          </div>
        </div>
      </div>

      {/* MODAL DE AYUDA RIGUROSA FUNDAMENTADA EN EL CAPÍTULO 2 */}
      {activeHelpModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-100">
            <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  {activeHelpModal.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveHelpModal(null)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto flex flex-col gap-4 text-xs text-slate-700 leading-relaxed">
              {/* Concepto Teórico */}
              <div>
                <span className="font-semibold text-slate-900 block mb-1">
                  {isEs ? 'Concepto y Fundamento:' : 'Theoretical Concept:'}
                </span>
                <p className="text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                  {activeHelpModal.concept}
                </p>
              </div>

              {/* Directrices y Reglas */}
              <div>
                <span className="font-semibold text-slate-900 block mb-1">
                  {isEs ? 'Criterios de Identificación y Diligenciamiento:' : 'Identification & Completion Guidelines:'}
                </span>
                <ul className="list-disc pl-5 space-y-1.5 text-slate-600">
                  {activeHelpModal.guidelines.map((g, idx) => (
                    <li key={idx}>{g}</li>
                  ))}
                </ul>
              </div>

              {/* Ejemplo Real del Libro */}
              <div>
                <span className="font-semibold text-slate-900 block mb-1">
                  {isEs ? 'Ejemplo de Referencia:' : 'Reference Example:'}
                </span>
                <div className="bg-blue-50/70 border border-blue-100 p-2.5 rounded-lg text-slate-800 font-medium">
                  {activeHelpModal.example}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setActiveHelpModal(null)}
                className="px-4 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer"
              >
                {isEs ? 'Entendido' : 'Got it'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};