import { CompanyProfile, BPMProcess } from './types';

export interface PredefinedExample {
  id: string;
  name: string;
  description: string;
  company: CompanyProfile;
  processes: BPMProcess[];
}

export const EXAMPLES: PredefinedExample[] = [
  {
    id: 'portfolio-university',
    name: 'Educación Superior',
    description: 'Institución académica dedicada a la formación universitaria, docencia e investigación.',
    company: {
      name: 'Higher Education Academy',
      industry: 'Educación Superior',
      description: 'Institución académica dedicada a la formación universitaria, docencia e investigación.'
    },
    processes: [
      { id: '1', name: 'Schedule Courses', category: 'core', groupName: 'Operaciones Académicas', health: 2, importance: 5, feasibility: 3, labelPosition: 'left', visible: true },
      { id: '2', name: 'Manage Student Services', category: 'core', groupName: 'Operaciones Académicas', health: 3, importance: 4, feasibility: 3, labelPosition: 'left', visible: true },
      { id: '3', name: 'Develop and Manage Study Programs', category: 'management', health: 4, importance: 4, feasibility: 3, labelPosition: 'left', visible: true },
      { id: '4', name: 'Market Study Programs', category: 'management', health: 4, importance: 4, feasibility: 4, labelPosition: 'bottom', visible: true },
      { id: '5', name: 'Deliver Courses', category: 'core', groupName: 'Operaciones Académicas', health: 5, importance: 3, feasibility: 1, labelPosition: 'bottom', visible: true },
      { id: '6', name: 'Manage Facilities', category: 'support', health: 2, importance: 2, feasibility: 4, labelPosition: 'bottom', visible: true },
    ]
  },
  {
    id: 'dumas-sencillo',
    name: 'Retail y Distribución',
    description: 'Cadena de valor estándar de manufactura y ventas comerciales.',
    company: {
      name: 'Global Retail & Logistics Corp',
      industry: 'Comercio y Manufactura',
      description: 'Empresa de desarrollo, venta y entrega de bienes comerciales.'
    },
    processes: [
      { id: 'm1', name: 'Define, Operationalize, and Track Strategy', category: 'management', health: 4, importance: 5, feasibility: 4, labelPosition: 'top', visible: true },
      { id: 'm2', name: 'Sales, Franchise, and Partner Management', category: 'management', health: 3, importance: 4, feasibility: 3, labelPosition: 'right', visible: true },
      { id: 'c1', name: 'Innovate', category: 'core', groupName: 'Cadena Principal', sequenceOrder: 1, health: 3, importance: 5, feasibility: 3, labelPosition: 'left', visible: true },
      { id: 'c2', name: 'Sell', category: 'core', groupName: 'Cadena Principal', sequenceOrder: 2, health: 4, importance: 5, feasibility: 4, labelPosition: 'top', visible: true },
      { id: 'c3', name: 'Deliver', category: 'core', groupName: 'Cadena Principal', sequenceOrder: 3, health: 5, importance: 4, feasibility: 2, labelPosition: 'right', visible: true },
      { id: 's1', name: 'Attract, Develop, and Retain Workforce', category: 'support', health: 3, importance: 3, feasibility: 4, labelPosition: 'bottom', visible: true },
      { id: 's2', name: 'Workplace and Infrastructure Provision', category: 'support', health: 2, importance: 3, feasibility: 5, labelPosition: 'bottom', visible: true },
      {
        id: 's3',
        name: 'Procure to Pay',
        category: 'support',
        health: 4,
        importance: 4,
        feasibility: 3,
        labelPosition: 'bottom',
        visible: true,
        profile: {
          apqcCode: '4.2',
          vision: 'The objective of the procurement process is to secure that the entire range of external products and services becomes available on time and is at the required level of quality.',
          processOwner: 'Chief Financial Officer (CFO)',
          customer: 'Requesting unit',
          customerExpectation: 'Timely, economic and complete provision',
          outcome: 'Delivered products or provided services for the requested unit',
          trigger: 'Need is identified',
          firstActivity: 'Submit Request',
          lastActivity: 'Create Purchase Order',
          interfacesInbound: 'Plan-to-Procure',
          interfacesOutbound: 'Construct-to-Complete',
          requiredResourcesHuman: 'Site Engineer, Clerk, Works Engineer',
          requiredResourcesInfo: 'procurement guidelines, supplier rating, framework contract',
          requiredResourcesEnv: 'Procurement information system',
          performanceMeasures: 'Cycle Time\nOperational Costs\nError Rate'
        }
      },
      { id: 's4', name: 'Corporate Finance and Operational Compliance', category: 'support', health: 4, importance: 4, feasibility: 2, labelPosition: 'bottom', visible: true },
      { id: 's5', name: 'Shareholder and Stakeholder Management', category: 'support', health: 3, importance: 3, feasibility: 4, labelPosition: 'bottom', visible: true },
    ]
  },
  {
    id: 'dumas-medio',
    name: 'Ingeniería y Consultoría',
    description: 'Operación con grupos en Core: Contract Acquisition y Contract Execution.',
    company: {
      name: 'Engineering & Services Partner',
      industry: 'Servicios Profesionales de Ingeniería',
      description: 'Consultoría e ingeniería por contratos públicos y privados.'
    },
    processes: [
      { id: 'mm1', name: 'Develop Vision and Strategy', category: 'management', health: 4, importance: 5, feasibility: 4, labelPosition: 'top', visible: true },
      { id: 'mm2', name: 'Develop and Manage Services', category: 'management', health: 3, importance: 4, feasibility: 3, labelPosition: 'top', visible: true },
      { id: 'mm3', name: 'Manage Business Capabilities', category: 'management', health: 3, importance: 3, feasibility: 4, labelPosition: 'top', visible: true },
      { id: 'mm4', name: 'Market and Sell Services', category: 'management', health: 4, importance: 5, feasibility: 3, labelPosition: 'top', visible: true },
      { id: 'ca1', name: 'Demand-to-Selection', category: 'core', groupName: 'Contract Acquisition', sequenceOrder: 1, health: 3, importance: 4, feasibility: 3, labelPosition: 'left', visible: true },
      { id: 'ca2', name: 'Selection-to-Bid', category: 'core', groupName: 'Contract Acquisition', sequenceOrder: 2, health: 4, importance: 4, feasibility: 4, labelPosition: 'top', visible: true },
      { id: 'ca3', name: 'Approval-to-Contract', category: 'core', groupName: 'Contract Acquisition', sequenceOrder: 3, health: 4, importance: 5, feasibility: 2, labelPosition: 'right', visible: true },
      { id: 'ce1', name: 'Contract-to-Plan', category: 'core', groupName: 'Contract Execution', sequenceOrder: 1, health: 3, importance: 4, feasibility: 4, labelPosition: 'left', visible: true },
      { id: 'ce2', name: 'Plan-to-Completion', category: 'core', groupName: 'Contract Execution', sequenceOrder: 2, health: 4, importance: 5, feasibility: 3, labelPosition: 'top', visible: true },
      { id: 'ce3', name: 'Completion-to-Expiry', category: 'core', groupName: 'Contract Execution', sequenceOrder: 3, health: 5, importance: 3, feasibility: 3, labelPosition: 'right', visible: true },
      { id: 'sm1', name: 'Manage Human Capital', category: 'support', health: 3, importance: 3, feasibility: 4, labelPosition: 'bottom', visible: true },
      { id: 'sm2', name: 'Manage IT', category: 'support', health: 4, importance: 4, feasibility: 4, labelPosition: 'bottom', visible: true },
      { id: 'sm3', name: 'Manage Financial Resources', category: 'support', health: 4, importance: 5, feasibility: 3, labelPosition: 'bottom', visible: true },
      { id: 'sm4', name: 'Manage Assets', category: 'support', health: 2, importance: 2, feasibility: 5, labelPosition: 'bottom', visible: true },
      { id: 'sm5', name: 'Manage Risk and Compliance', category: 'support', health: 4, importance: 4, feasibility: 2, labelPosition: 'bottom', visible: true },
      { id: 'sm6', name: 'Manage External Relationships', category: 'support', health: 3, importance: 3, feasibility: 3, labelPosition: 'bottom', visible: true },
    ]
  },
  {
    id: 'dumas-multiple',
    name: 'Operador de Transporte Masivo',
    description: 'Operaciones múltiples integradas: Clientes, Vehículos, Transporte e Infraestructura.',
    company: {
      name: 'Metropolitan Public Transport Authority',
      industry: 'Transporte Público y Movilidad',
      description: 'Gestión integral del transporte público de trenes y autobuses.'
    },
    processes: [
      { id: 'mu1', name: 'Manage Enterprise', category: 'management', health: 4, importance: 5, feasibility: 4, labelPosition: 'top', visible: true },
      { id: 'mu2', name: 'Communicate in and out', category: 'management', health: 3, importance: 3, feasibility: 4, labelPosition: 'top', visible: true },
      { id: 'mu3', name: 'Manage Processes', category: 'management', health: 4, importance: 4, feasibility: 3, labelPosition: 'top', visible: true },
      { id: 'mu4', name: 'Manage Quality', category: 'management', health: 4, importance: 4, feasibility: 3, labelPosition: 'top', visible: true },
      { id: 'mu5', name: 'Manage Risks and Opportunities', category: 'management', health: 4, importance: 5, feasibility: 2, labelPosition: 'top', visible: true },
      { id: 'mu6', name: 'Manage Innovation', category: 'management', health: 3, importance: 4, feasibility: 4, labelPosition: 'top', visible: true },
      { id: 'crm1', name: 'Contact Customer', category: 'core', groupName: 'Manage Customer Relationship', sequenceOrder: 1, health: 3, importance: 4, feasibility: 4, labelPosition: 'left', visible: true },
      { id: 'crm2', name: 'Manage Sales', category: 'core', groupName: 'Manage Customer Relationship', sequenceOrder: 2, health: 4, importance: 4, feasibility: 3, labelPosition: 'top', visible: true },
      { id: 'crm3', name: 'Foster Relationship', category: 'core', groupName: 'Manage Customer Relationship', sequenceOrder: 4, health: 4, importance: 4, feasibility: 4, labelPosition: 'right', visible: true },
      { id: 'veh1', name: 'Plan and Buy Vehicles', category: 'core', groupName: 'Operate Vehicles', sequenceOrder: 1, health: 3, importance: 5, feasibility: 2, labelPosition: 'left', visible: true },
      { id: 'veh2', name: 'Maintain Vehicles', category: 'core', groupName: 'Operate Vehicles', sequenceOrder: 2, health: 4, importance: 5, feasibility: 3, labelPosition: 'top', visible: true },
      { id: 'veh3', name: 'Check Vehicles', category: 'core', groupName: 'Operate Vehicles', sequenceOrder: 4, health: 5, importance: 5, feasibility: 4, labelPosition: 'right', visible: true },
      { id: 'tra1', name: 'Plan Customer Transport', category: 'core', groupName: 'Transport Customer', sequenceOrder: 1, health: 4, importance: 5, feasibility: 3, labelPosition: 'left', visible: true },
      { id: 'tra2', name: 'Transport Customer', category: 'core', groupName: 'Transport Customer', sequenceOrder: 3, health: 5, importance: 5, feasibility: 3, labelPosition: 'top', visible: true },
      { id: 'tra3', name: 'Evaluate Transport', category: 'core', groupName: 'Transport Customer', sequenceOrder: 4, health: 4, importance: 4, feasibility: 4, labelPosition: 'right', visible: true },
      { id: 'inf1', name: 'Plan Infrastructure', category: 'core', groupName: 'Provide Infrastructure', sequenceOrder: 1, health: 3, importance: 4, feasibility: 3, labelPosition: 'left', visible: true },
      { id: 'inf2', name: 'Build Infrastructure', category: 'core', groupName: 'Provide Infrastructure', sequenceOrder: 2, health: 4, importance: 5, feasibility: 4, labelPosition: 'top', visible: true },
      { id: 'inf3', name: 'Maintain Infrastructure', category: 'core', groupName: 'Provide Infrastructure', sequenceOrder: 3, health: 5, importance: 5, feasibility: 3, labelPosition: 'top', visible: true },
      { id: 'inf4', name: 'Evaluate Infrastructure', category: 'core', groupName: 'Provide Infrastructure', sequenceOrder: 4, health: 4, importance: 4, feasibility: 4, labelPosition: 'right', visible: true },
      { id: 'sup1', name: 'Manage Personnel', category: 'support', health: 3, importance: 4, feasibility: 4, labelPosition: 'bottom', visible: true },
      { id: 'sup2', name: 'Manage Financials', category: 'support', health: 4, importance: 5, feasibility: 3, labelPosition: 'bottom', visible: true },
      { id: 'sup3', name: 'Manage Information', category: 'support', health: 3, importance: 4, feasibility: 3, labelPosition: 'bottom', visible: true },
      { id: 'sup4', name: 'Manage Materials', category: 'support', health: 4, importance: 3, feasibility: 4, labelPosition: 'bottom', visible: true },
      { id: 'sup5', name: 'Manage Disruptions', category: 'support', health: 3, importance: 5, feasibility: 2, labelPosition: 'bottom', visible: true },
      { id: 'sup6', name: 'Provide Winter Service', category: 'support', health: 3, importance: 4, feasibility: 3, labelPosition: 'bottom', visible: true },
    ]
  }
];
