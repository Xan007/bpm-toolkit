import React from 'react';
import { BPMProcess, ProcessProfileData } from '../../../types';
import { HelpContent } from '../helpDictionary';
import { HelpTooltipButton } from './HelpTooltipButton';

interface ProcessProfileFormProps {
  currentProcess: BPMProcess;
  profile: ProcessProfileData;
  savedOwners: string[];
  isEs: boolean;
  helpDict: Record<string, HelpContent>;
  onProfileChange: (field: keyof ProcessProfileData, value: string) => void;
  onSaveOwnerIfNew: (owner: string) => void;
  onOpenHelpModal: (data: HelpContent) => void;
}

export const ProcessProfileForm: React.FC<ProcessProfileFormProps> = ({
  currentProcess,
  profile,
  savedOwners,
  isEs,
  helpDict,
  onProfileChange,
  onSaveOwnerIfNew,
  onOpenHelpModal,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs flex flex-col gap-3.5 text-xs">
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <span className="text-xs font-semibold text-slate-900">
          {isEs ? 'Datos del Perfil' : 'Profile Fields'}
        </span>
      </div>

      {/* Nombre y Dueño */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-slate-700 font-medium mb-1 text-xs">
            {isEs ? 'Nombre del Proceso:' : 'Process Name:'}
          </label>
          <input
            type="text"
            value={currentProcess.name}
            disabled
            className="w-full px-2.5 py-1.5 bg-slate-100/80 border border-slate-200 rounded text-slate-600 text-xs cursor-not-allowed"
          />
        </div>

        <div>
          <label className="flex items-center text-slate-700 font-medium mb-1 text-xs">
            <span>{isEs ? 'Responsable del Proceso:' : 'Process Owner:'}</span>
            <HelpTooltipButton
              helpKey="processOwner"
              tooltipText={
                isEs
                  ? 'Rol directivo responsable del diseño, rendimiento y mejora continua del proceso.'
                  : 'Executive role responsible for end-to-end performance and governance of the process.'
              }
              helpData={helpDict.processOwner}
              isEs={isEs}
              onOpenModal={onOpenHelpModal}
            />
          </label>
          <input
            type="text"
            list="process-owners-list"
            value={profile.processOwner || ''}
            onChange={(e) => onProfileChange('processOwner', e.target.value)}
            onBlur={(e) => onSaveOwnerIfNew(e.target.value)}
            placeholder={isEs ? 'Ej: CFO, Director de Operaciones...' : 'e.g. CFO, Operations Director...'}
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
          />
          <datalist id="process-owners-list">
            {savedOwners.map((owner, idx) => (
              <option key={idx} value={owner} />
            ))}
          </datalist>
        </div>
      </div>

      {/* Visión / Objetivo */}
      <div>
        <label className="flex items-center text-slate-700 font-medium mb-1 text-xs">
          <span>{isEs ? 'Visión / Objetivo del Proceso:' : 'Process Vision & Objective:'}</span>
          <HelpTooltipButton
            helpKey="vision"
            tooltipText={
              isEs
                ? 'Propósito central del proceso que asegura los niveles de calidad, costo y oportunidad requeridos.'
                : 'Core purpose of the process ensuring expected quality, cost efficiency, and timeliness.'
            }
            helpData={helpDict.vision}
            isEs={isEs}
            onOpenModal={onOpenHelpModal}
          />
        </label>
        <textarea
          rows={2}
          value={profile.vision || ''}
          onChange={(e) => onProfileChange('vision', e.target.value)}
          placeholder={isEs ? 'Describe el propósito y valor central...' : 'Describe core purpose and value...'}
          className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
        />
      </div>

      {/* Cliente y Expectativa */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="flex items-center text-slate-700 font-medium mb-1 text-xs">
            <span>{isEs ? 'Cliente del Proceso:' : 'Customer of Process:'}</span>
            <HelpTooltipButton
              helpKey="customer"
              tooltipText={
                isEs
                  ? 'Destinatario que recibe el valor generado (interno o externo).'
                  : 'Recipient or beneficiary who directly receives the outcome (internal or external).'
              }
              helpData={helpDict.customer}
              isEs={isEs}
              onOpenModal={onOpenHelpModal}
            />
          </label>
          <input
            type="text"
            value={profile.customer || ''}
            onChange={(e) => onProfileChange('customer', e.target.value)}
            placeholder=""
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
          />
        </div>

        <div>
          <label className="flex items-center text-slate-700 font-medium mb-1 text-xs">
            <span>{isEs ? 'Expectativa del Cliente:' : 'Expectation of Customer:'}</span>
            <HelpTooltipButton
              helpKey="customerExpectation"
              tooltipText={
                isEs
                  ? 'Requisitos y condiciones que el cliente espera percibir (calidad externa, puntualidad, costo).'
                  : 'Conditions and requirements the customer expects regarding delivery and quality.'
              }
              helpData={helpDict.customerExpectation}
              isEs={isEs}
              onOpenModal={onOpenHelpModal}
            />
          </label>
          <input
            type="text"
            value={profile.customerExpectation || ''}
            onChange={(e) => onProfileChange('customerExpectation', e.target.value)}
            placeholder=""
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
          />
        </div>
      </div>

      {/* Resultado y Disparador */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="flex items-center text-slate-700 font-medium mb-1 text-xs">
            <span>{isEs ? 'Resultado (Outcome):' : 'Outcome:'}</span>
            <HelpTooltipButton
              helpKey="outcome"
              tooltipText={
                isEs
                  ? 'Estado final positivo o producto concreto tras la ejecución ("sustantivo + participio").'
                  : 'Positive final state or deliverable created after execution ("noun + past participle").'
              }
              helpData={helpDict.outcome}
              isEs={isEs}
              onOpenModal={onOpenHelpModal}
            />
          </label>
          <input
            type="text"
            value={profile.outcome || ''}
            onChange={(e) => onProfileChange('outcome', e.target.value)}
            placeholder=""
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
          />
        </div>

        <div>
          <label className="flex items-center text-slate-700 font-medium mb-1 text-xs">
            <span>{isEs ? 'Disparador (Trigger):' : 'Trigger:'}</span>
            <HelpTooltipButton
              helpKey="trigger"
              tooltipText={
                isEs
                  ? 'Evento inicial que inicia la primera actividad del proceso.'
                  : 'Initiating event or condition that instantiates a new process case.'
              }
              helpData={helpDict.trigger}
              isEs={isEs}
              onOpenModal={onOpenHelpModal}
            />
          </label>
          <input
            type="text"
            value={profile.trigger || ''}
            onChange={(e) => onProfileChange('trigger', e.target.value)}
            placeholder=""
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
          />
        </div>
      </div>

      {/* Límites: Primera y Última Actividad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="flex items-center text-slate-700 font-medium mb-1 text-xs">
            <span>{isEs ? 'Primera Actividad:' : 'First Activity:'}</span>
            <HelpTooltipButton
              helpKey="firstLastActivity"
              tooltipText={
                isEs
                  ? 'Acción inicial que marca la frontera de entrada del proceso.'
                  : 'First operational task executed after trigger fires.'
              }
              helpData={helpDict.firstLastActivity}
              isEs={isEs}
              onOpenModal={onOpenHelpModal}
            />
          </label>
          <input
            type="text"
            value={profile.firstActivity || ''}
            onChange={(e) => onProfileChange('firstActivity', e.target.value)}
            placeholder=""
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
          />
        </div>

        <div>
          <label className="flex items-center text-slate-700 font-medium mb-1 text-xs">
            <span>{isEs ? 'Última Actividad:' : 'Last Activity:'}</span>
            <HelpTooltipButton
              helpKey="firstLastActivity"
              tooltipText={
                isEs
                  ? 'Acción de cierre que materializa el resultado y concluye el caso.'
                  : 'Final action that produces the outcome and closes the case.'
              }
              helpData={helpDict.firstLastActivity}
              isEs={isEs}
              onOpenModal={onOpenHelpModal}
            />
          </label>
          <input
            type="text"
            value={profile.lastActivity || ''}
            onChange={(e) => onProfileChange('lastActivity', e.target.value)}
            placeholder=""
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
          />
        </div>
      </div>

      {/* Interfaces Inbound y Outbound */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="flex items-center text-slate-700 font-medium mb-1 text-xs">
            <span>{isEs ? 'Interfaces Entrantes:' : 'Interfaces Inbound:'}</span>
            <HelpTooltipButton
              helpKey="interfaces"
              tooltipText={
                isEs
                  ? 'Procesos anteriores o fuentes externas que entregan insumos o disparan este proceso.'
                  : 'Preceding processes or external systems delivering inputs or prerequisites.'
              }
              helpData={helpDict.interfaces}
              isEs={isEs}
              onOpenModal={onOpenHelpModal}
            />
          </label>
          <input
            type="text"
            value={profile.interfacesInbound || ''}
            onChange={(e) => onProfileChange('interfacesInbound', e.target.value)}
            placeholder=""
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
          />
        </div>
        <div>
          <label className="flex items-center text-slate-700 font-medium mb-1 text-xs">
            <span>{isEs ? 'Interfaces Salientes:' : 'Interfaces Outbound:'}</span>
            <HelpTooltipButton
              helpKey="interfaces"
              tooltipText={
                isEs
                  ? 'Procesos posteriores o destinatarios a los cuales este proceso entrega sus salidas.'
                  : 'Subsequent processes or recipients to which this process sends its outputs.'
              }
              helpData={helpDict.interfaces}
              isEs={isEs}
              onOpenModal={onOpenHelpModal}
            />
          </label>
          <input
            type="text"
            value={profile.interfacesOutbound || ''}
            onChange={(e) => onProfileChange('interfacesOutbound', e.target.value)}
            placeholder=""
            className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
          />
        </div>
      </div>

      {/* Recursos Requeridos */}
      <div className="flex flex-col gap-2 p-3 bg-slate-50 border border-slate-200 rounded-md">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800 flex items-center">
            <span>{isEs ? 'Recursos Requeridos:' : 'Required Resources:'}</span>
            <HelpTooltipButton
              helpKey="requiredResources"
              tooltipText={
                isEs
                  ? 'Elementos humanos, técnicos, documentales y físicos indispensables para ejecutar el proceso.'
                  : 'All human, technical, informational, and physical assets necessary to run the process.'
              }
              helpData={helpDict.requiredResources}
              isEs={isEs}
              onOpenModal={onOpenHelpModal}
            />
          </span>
        </div>
        <div>
          <label className="block text-slate-600 font-medium mb-1 text-xs">
            {isEs ? 'Recursos Humanos:' : 'Human Resources:'}
          </label>
          <input
            type="text"
            value={profile.requiredResourcesHuman || ''}
            onChange={(e) => onProfileChange('requiredResourcesHuman', e.target.value)}
            placeholder=""
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
          />
        </div>
        <div>
          <label className="block text-slate-600 font-medium mb-1 text-xs">
            {isEs ? 'Información, Documentos y Conocimiento:' : 'Information, Documents and Know-how:'}
          </label>
          <input
            type="text"
            value={profile.requiredResourcesInfo || ''}
            onChange={(e) => onProfileChange('requiredResourcesInfo', e.target.value)}
            placeholder=""
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
          />
        </div>
        <div>
          <label className="block text-slate-600 font-medium mb-1 text-xs">
            {isEs ? 'Entorno de trabajo, Materiales e Infraestructura:' : 'Work Environment, Materials and Infrastructure:'}
          </label>
          <input
            type="text"
            value={profile.requiredResourcesEnv || ''}
            onChange={(e) => onProfileChange('requiredResourcesEnv', e.target.value)}
            placeholder=""
            className="w-full px-2.5 py-1.5 bg-white border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
          />
        </div>
      </div>

      {/* Medidas de Desempeño */}
      <div>
        <label className="flex items-center text-slate-700 font-medium mb-1 text-xs">
          <span>{isEs ? 'Medidas de Desempeño del Proceso:' : 'Process Performance Measures:'}</span>
          <HelpTooltipButton
            helpKey="performanceMeasures"
            tooltipText={
              isEs
                ? 'Indicadores cuantitativos clave de tiempo, costo, calidad y flexibilidad. Ingresa uno por línea.'
                : 'Key quantitative metrics used to evaluate performance across time, cost, quality, and flexibility.'
            }
            helpData={helpDict.performanceMeasures}
            isEs={isEs}
            onOpenModal={onOpenHelpModal}
          />
        </label>
        <textarea
          rows={3}
          value={profile.performanceMeasures || ''}
          onChange={(e) => onProfileChange('performanceMeasures', e.target.value)}
          placeholder=""
          className="w-full px-2.5 py-1.5 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:border-slate-800"
        />
      </div>
    </div>
  );
};
