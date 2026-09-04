export interface APQCItem {
  id: string;
  code: string;
  nameEn: string;
  nameEs: string;
  category: 'management' | 'core' | 'support';
  level: 1 | 2;
  parentId?: string;
}

export const APQC_ITEMS: APQCItem[] = [
  // 1.0 Develop Vision and Strategy (Management)
  { id: '1.0', code: '1.0', nameEn: 'Develop Vision and Strategy', nameEs: 'Desarrollar la Visión y Estrategia', category: 'management', level: 1 },
  { id: '1.1', code: '1.1', nameEn: 'Define the business concept and long-term vision', nameEs: 'Definir el concepto de negocio y visión a largo plazo', category: 'management', level: 2, parentId: '1.0' },
  { id: '1.2', code: '1.2', nameEn: 'Develop business strategy', nameEs: 'Desarrollar la estrategia de negocio', category: 'management', level: 2, parentId: '1.0' },
  { id: '1.3', code: '1.3', nameEn: 'Execute and measure strategic initiatives', nameEs: 'Ejecutar y medir iniciativas estratégicas', category: 'management', level: 2, parentId: '1.0' },

  // 2.0 Develop and Manage Products and Services (Core)
  { id: '2.0', code: '2.0', nameEn: 'Develop and Manage Products and Services', nameEs: 'Desarrollar y Gestionar Productos y Servicios', category: 'core', level: 1 },
  { id: '2.1', code: '2.1', nameEn: 'Govern and manage product and service development program', nameEs: 'Gobernar y gestionar el programa de desarrollo de productos y servicios', category: 'core', level: 2, parentId: '2.0' },
  { id: '2.2', code: '2.2', nameEn: 'Generate and define new product and service ideas', nameEs: 'Generar y definir nuevas ideas de productos y servicios', category: 'core', level: 2, parentId: '2.0' },
  { id: '2.3', code: '2.3', nameEn: 'Develop products and services', nameEs: 'Desarrollar productos y servicios', category: 'core', level: 2, parentId: '2.0' },

  // 3.0 Market and Sell Products and Services (Core)
  { id: '3.0', code: '3.0', nameEn: 'Market and Sell Products and Services', nameEs: 'Comercializar y Vender Productos y Servicios', category: 'core', level: 1 },
  { id: '3.1', code: '3.1', nameEn: 'Understand markets, customers, and capabilities', nameEs: 'Comprender los mercados, clientes y capacidades', category: 'core', level: 2, parentId: '3.0' },
  { id: '3.2', code: '3.2', nameEn: 'Develop marketing strategy', nameEs: 'Desarrollar la estrategia de marketing', category: 'core', level: 2, parentId: '3.0' },
  { id: '3.3', code: '3.3', nameEn: 'Develop and manage marketing plans', nameEs: 'Desarrollar y gestionar planes de marketing', category: 'core', level: 2, parentId: '3.0' },
  { id: '3.4', code: '3.4', nameEn: 'Develop sales strategy', nameEs: 'Desarrollar la estrategia de ventas', category: 'core', level: 2, parentId: '3.0' },
  { id: '3.5', code: '3.5', nameEn: 'Develop and manage sales plans', nameEs: 'Desarrollar y gestionar planes de ventas', category: 'core', level: 2, parentId: '3.0' },

  // 4.0 Deliver Physical Products (Core)
  { id: '4.0', code: '4.0', nameEn: 'Deliver Physical Products', nameEs: 'Entregar Productos Físicos', category: 'core', level: 1 },
  { id: '4.1', code: '4.1', nameEn: 'Plan for and align supply chain resources', nameEs: 'Planificar y alinear los recursos de la cadena de suministro', category: 'core', level: 2, parentId: '4.0' },
  { id: '4.2', code: '4.2', nameEn: 'Procure materials and services', nameEs: 'Adquirir materiales y servicios (Procure-to-Pay)', category: 'core', level: 2, parentId: '4.0' },
  { id: '4.3', code: '4.3', nameEn: 'Produce, manufacture, and deliver product', nameEs: 'Producir, fabricar y entregar el producto', category: 'core', level: 2, parentId: '4.0' },
  { id: '4.4', code: '4.4', nameEn: 'Manage logistics and warehousing', nameEs: 'Gestionar la logística y el almacenamiento', category: 'core', level: 2, parentId: '4.0' },

  // 5.0 Deliver Services (Core)
  { id: '5.0', code: '5.0', nameEn: 'Deliver Services', nameEs: 'Prestar Servicios', category: 'core', level: 1 },
  { id: '5.1', code: '5.1', nameEn: 'Establish service delivery governance and strategies', nameEs: 'Establecer la gobernanza y estrategias de prestación de servicios', category: 'core', level: 2, parentId: '5.0' },
  { id: '5.2', code: '5.2', nameEn: 'Manage service delivery resources', nameEs: 'Gestionar los recursos de prestación de servicios', category: 'core', level: 2, parentId: '5.0' },
  { id: '5.3', code: '5.3', nameEn: 'Deliver service to customer', nameEs: 'Prestar el servicio al cliente', category: 'core', level: 2, parentId: '5.0' },

  // 6.0 Manage Customer Service (Core)
  { id: '6.0', code: '6.0', nameEn: 'Manage Customer Service', nameEs: 'Gestionar el Servicio al Cliente', category: 'core', level: 1 },
  { id: '6.1', code: '6.1', nameEn: 'Develop customer care and customer service strategy', nameEs: 'Desarrollar la estrategia de atención y servicio al cliente', category: 'core', level: 2, parentId: '6.0' },
  { id: '6.2', code: '6.2', nameEn: 'Plan and manage customer service contacts', nameEs: 'Planificar y gestionar los contactos de atención al cliente', category: 'core', level: 2, parentId: '6.0' },
  { id: '6.3', code: '6.3', nameEn: 'Service products after sales', nameEs: 'Atención y servicio de posventa', category: 'core', level: 2, parentId: '6.0' },
  { id: '6.4', code: '6.4', nameEn: 'Manage product recalls and regulatory audits', nameEs: 'Gestionar retiros de productos y auditorías regulatorias', category: 'core', level: 2, parentId: '6.0' },
  { id: '6.5', code: '6.5', nameEn: 'Evaluate customer service operations and customer satisfaction', nameEs: 'Evaluar operaciones de atención y satisfacción del cliente', category: 'core', level: 2, parentId: '6.0' },

  // 7.0 Develop and Manage Human Capital (Support)
  { id: '7.0', code: '7.0', nameEn: 'Develop and Manage Human Capital', nameEs: 'Desarrollar y Gestionar el Capital Humano', category: 'support', level: 1 },
  { id: '7.1', code: '7.1', nameEn: 'Develop and manage human resources planning, policies, and strategies', nameEs: 'Desarrollar y gestionar la planificación, políticas y estrategias de RRHH', category: 'support', level: 2, parentId: '7.0' },
  { id: '7.2', code: '7.2', nameEn: 'Recruit, source, and select employees', nameEs: 'Reclutar, buscar y seleccionar empleados', category: 'support', level: 2, parentId: '7.0' },
  { id: '7.3', code: '7.3', nameEn: 'Develop and counsel employees', nameEs: 'Desarrollar y capacitar a los empleados', category: 'support', level: 2, parentId: '7.0' },
  { id: '7.4', code: '7.4', nameEn: 'Manage employee relations', nameEs: 'Gestionar las relaciones laborales', category: 'support', level: 2, parentId: '7.0' },
  { id: '7.5', code: '7.5', nameEn: 'Reward and retain employees', nameEs: 'Recompensar y retener a los empleados', category: 'support', level: 2, parentId: '7.0' },
  { id: '7.6', code: '7.6', nameEn: 'Redeploy and retire employees', nameEs: 'Reubicar y desvincular empleados', category: 'support', level: 2, parentId: '7.0' },
  { id: '7.7', code: '7.7', nameEn: 'Manage employee information and analytics', nameEs: 'Gestionar la información y analítica de empleados', category: 'support', level: 2, parentId: '7.0' },
  { id: '7.8', code: '7.8', nameEn: 'Manage employee communication', nameEs: 'Gestionar la comunicación interna', category: 'support', level: 2, parentId: '7.0' },
  { id: '7.9', code: '7.9', nameEn: 'Deliver employee communications', nameEs: 'Entregar comunicaciones a empleados', category: 'support', level: 2, parentId: '7.0' },

  // 8.0 Manage Information Technology (IT) (Support)
  { id: '8.0', code: '8.0', nameEn: 'Manage Information Technology (IT)', nameEs: 'Gestionar Tecnologías de la Información (TI)', category: 'support', level: 1 },
  { id: '8.1', code: '8.1', nameEn: 'Manage the business of information technology', nameEs: 'Gestionar el negocio de las tecnologías de la información', category: 'support', level: 2, parentId: '8.0' },
  { id: '8.2', code: '8.2', nameEn: 'Develop and manage IT customer relationships', nameEs: 'Desarrollar y gestionar relaciones con usuarios de TI', category: 'support', level: 2, parentId: '8.0' },
  { id: '8.3', code: '8.3', nameEn: 'Develop and implement security, privacy, and data protection controls', nameEs: 'Desarrollar e implementar controles de seguridad, privacidad y datos', category: 'support', level: 2, parentId: '8.0' },
  { id: '8.4', code: '8.4', nameEn: 'Manage enterprise information', nameEs: 'Gestionar la información empresarial', category: 'support', level: 2, parentId: '8.0' },
  { id: '8.5', code: '8.5', nameEn: 'Develop and maintain information technology solutions', nameEs: 'Desarrollar y mantener soluciones de software y TI', category: 'support', level: 2, parentId: '8.0' },
  { id: '8.6', code: '8.6', nameEn: 'Deploy information technology solutions', nameEs: 'Desplegar soluciones de tecnología de la información', category: 'support', level: 2, parentId: '8.0' },
  { id: '8.7', code: '8.7', nameEn: 'Deliver and support information technology services', nameEs: 'Prestar y dar soporte a los servicios de TI', category: 'support', level: 2, parentId: '8.0' },

  // 9.0 Manage Financial Resources (Support)
  { id: '9.0', code: '9.0', nameEn: 'Manage Financial Resources', nameEs: 'Gestionar Recursos Financieros', category: 'support', level: 1 },
  { id: '9.1', code: '9.1', nameEn: 'Perform planning and management accounting', nameEs: 'Realizar la planificación y contabilidad de gestión', category: 'support', level: 2, parentId: '9.0' },
  { id: '9.2', code: '9.2', nameEn: 'Perform revenue accounting', nameEs: 'Realizar la contabilidad de ingresos', category: 'support', level: 2, parentId: '9.0' },
  { id: '9.3', code: '9.3', nameEn: 'Perform general accounting and reporting', nameEs: 'Realizar contabilidad general y reportes financieros', category: 'support', level: 2, parentId: '9.0' },
  { id: '9.4', code: '9.4', nameEn: 'Manage fixed-asset project accounting', nameEs: 'Gestionar contabilidad de activos fijos y proyectos', category: 'support', level: 2, parentId: '9.0' },
  { id: '9.5', code: '9.5', nameEn: 'Process payroll', nameEs: 'Procesar la nómina', category: 'support', level: 2, parentId: '9.0' },
  { id: '9.6', code: '9.6', nameEn: 'Process accounts payable and expense reimbursements', nameEs: 'Procesar cuentas por pagar y reembolsos de gastos', category: 'support', level: 2, parentId: '9.0' },
  { id: '9.7', code: '9.7', nameEn: 'Manage treasury operations', nameEs: 'Gestionar operaciones de tesorería', category: 'support', level: 2, parentId: '9.0' },
  { id: '9.8', code: '9.8', nameEn: 'Manage internal controls', nameEs: 'Gestionar el control interno', category: 'support', level: 2, parentId: '9.0' },
  { id: '9.9', code: '9.9', nameEn: 'Manage taxes', nameEs: 'Gestionar impuestos', category: 'support', level: 2, parentId: '9.0' },
  { id: '9.10', code: '9.10', nameEn: 'Manage international funds/consolidation', nameEs: 'Gestionar fondos internacionales y consolidación', category: 'support', level: 2, parentId: '9.0' },
  { id: '9.11', code: '9.11', nameEn: 'Perform global trade services', nameEs: 'Prestar servicios de comercio global', category: 'support', level: 2, parentId: '9.0' },

  // 10.0 Acquire, Construct, and Manage Assets (Support)
  { id: '10.0', code: '10.0', nameEn: 'Acquire, Construct, and Manage Assets', nameEs: 'Adquirir, Construir y Gestionar Activos', category: 'support', level: 1 },
  { id: '10.1', code: '10.1', nameEn: 'Plan and acquire assets', nameEs: 'Planificar y adquirir activos', category: 'support', level: 2, parentId: '10.0' },
  { id: '10.2', code: '10.2', nameEn: 'Design and construct productive assets', nameEs: 'Diseñar y construir activos productivos', category: 'support', level: 2, parentId: '10.0' },
  { id: '10.3', code: '10.3', nameEn: 'Maintain productive assets', nameEs: 'Mantener activos productivos', category: 'support', level: 2, parentId: '10.0' },
  { id: '10.4', code: '10.4', nameEn: 'Dispose of assets', nameEs: 'Dar de baja o disponer de activos', category: 'support', level: 2, parentId: '10.0' },

  // 11.0 Manage Enterprise Risk, Compliance, Remediation and Resiliency (Support)
  { id: '11.0', code: '11.0', nameEn: 'Manage Enterprise Risk, Compliance, Remediation and Resiliency', nameEs: 'Gestionar Riesgos, Cumplimiento, Remediación y Resiliencia', category: 'support', level: 1 },
  { id: '11.1', code: '11.1', nameEn: 'Manage enterprise risk', nameEs: 'Gestionar el riesgo empresarial', category: 'support', level: 2, parentId: '11.0' },
  { id: '11.2', code: '11.2', nameEn: 'Manage compliance', nameEs: 'Gestionar el cumplimiento regulatorio', category: 'support', level: 2, parentId: '11.0' },
  { id: '11.3', code: '11.3', nameEn: 'Manage remediation efforts', nameEs: 'Gestionar esfuerzos de remediación', category: 'support', level: 2, parentId: '11.0' },
  { id: '11.4', code: '11.4', nameEn: 'Manage business resiliency', nameEs: 'Gestionar la resiliencia y continuidad del negocio', category: 'support', level: 2, parentId: '11.0' },

  // 12.0 Manage External Relationships (Support)
  { id: '12.0', code: '12.0', nameEn: 'Manage External Relationships', nameEs: 'Gestionar Relaciones Externas', category: 'support', level: 1 },
  { id: '12.1', code: '12.1', nameEn: 'Build investor relationships', nameEs: 'Construir relaciones con inversionistas', category: 'support', level: 2, parentId: '12.0' },
  { id: '12.2', code: '12.2', nameEn: 'Manage government and industry relationships', nameEs: 'Gestionar relaciones con gobierno e industria', category: 'support', level: 2, parentId: '12.0' },
  { id: '12.3', code: '12.3', nameEn: 'Manage relations with board of directors', nameEs: 'Gestionar relaciones con la junta directiva', category: 'support', level: 2, parentId: '12.0' },
  { id: '12.4', code: '12.4', nameEn: 'Manage legal and ethical issues', nameEs: 'Gestionar asuntos legales y éticos', category: 'support', level: 2, parentId: '12.0' },
  { id: '12.5', code: '12.5', nameEn: 'Manage public relations program', nameEs: 'Gestionar programa de relaciones públicas', category: 'support', level: 2, parentId: '12.0' },

  // 13.0 Develop and Manage Business Capabilities (Management)
  { id: '13.0', code: '13.0', nameEn: 'Develop and Manage Business Capabilities', nameEs: 'Desarrollar y Gestionar Capacidades de Negocio', category: 'management', level: 1 },
  { id: '13.1', code: '13.1', nameEn: 'Manage business processes', nameEs: 'Gestionar procesos de negocio (BPM)', category: 'management', level: 2, parentId: '13.0' },
  { id: '13.2', code: '13.2', nameEn: 'Manage portfolio, program, and project', nameEs: 'Gestionar portafolio, programas y proyectos', category: 'management', level: 2, parentId: '13.0' },
  { id: '13.3', code: '13.3', nameEn: 'Manage quality', nameEs: 'Gestionar la calidad', category: 'management', level: 2, parentId: '13.0' },
  { id: '13.4', code: '13.4', nameEn: 'Manage change', nameEs: 'Gestionar el cambio organizacional', category: 'management', level: 2, parentId: '13.0' },
  { id: '13.5', code: '13.5', nameEn: 'Develop and manage enterprise-wide knowledge management (KM) capability', nameEs: 'Desarrollar y gestionar la gestión del conocimiento (KM)', category: 'management', level: 2, parentId: '13.0' },
  { id: '13.6', code: '13.6', nameEn: 'Measure and benchmark', nameEs: 'Medir y realizar benchmarking', category: 'management', level: 2, parentId: '13.0' },
  { id: '13.7', code: '13.7', nameEn: 'Manage environmental health and safety (EHS)', nameEs: 'Gestionar salud, seguridad y medio ambiente (EHS)', category: 'management', level: 2, parentId: '13.0' },
];
