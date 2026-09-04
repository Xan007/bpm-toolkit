export type ProcessCategory = 'management' | 'core' | 'support';
export type LabelPosition = 'left' | 'right' | 'top' | 'bottom' | 'auto';

export interface ProcessProfileData {
  vision?: string;
  processOwner?: string;
  customer?: string;
  customerExpectation?: string;
  outcome?: string;
  trigger?: string;
  firstActivity?: string;
  lastActivity?: string;
  interfacesInbound?: string;
  interfacesOutbound?: string;
  requiredResourcesHuman?: string;
  requiredResourcesInfo?: string;
  requiredResourcesEnv?: string;
  performanceMeasures?: string;
  apqcCode?: string; // Código APQC e.g. "4.2"
}

export interface BPMProcess {
  id: string;
  name: string;
  description?: string;
  category: ProcessCategory;
  groupName?: string;     // Subgrupo / Cadena dentro de la columna (ej. "Línea 1", "Línea 2")
  sequenceOrder?: number;
  health: number;         // 1 a 5
  importance: number;     // 1 a 5
  feasibility: number;    // 1 a 5
  labelPosition: LabelPosition;
  visible?: boolean;      // Visibilidad en el Portafolio (por defecto true)
  profile?: ProcessProfileData;
}

export interface CompanyProfile {
  name: string;
  industry: string;
  description: string;
}

export interface AppConfig {
  language: 'es' | 'en';
  allowDecimals: boolean;
  fontFamily: string;
  fontSize: number;
}
