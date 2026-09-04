export interface HelpContent {
  title: string;
  concept: string;
  guidelines: string[];
  example: string;
}

export const getHelpDictionary = (isEs: boolean): Record<string, HelpContent> => {
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
  }

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
};
