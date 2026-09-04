import React from 'react';
import { CompanyProfile } from '../types';

interface CompanyProfileSectionProps {
  company: CompanyProfile;
  onUpdateCompany: (company: CompanyProfile) => void;
  isEs: boolean;
}

export const CompanyProfileSection: React.FC<CompanyProfileSectionProps> = ({
  company,
  onUpdateCompany,
  isEs,
}) => {
  return (
    <div className="md:col-span-2 bg-white border border-slate-200 rounded-lg p-3 shadow-2xs flex flex-col justify-center">
      <div className="flex items-center justify-between pb-1.5 mb-2 border-b border-slate-100">
        <h2 className="text-[11px] font-bold text-slate-900 uppercase tracking-wider">
          {isEs ? 'Perfil de la Organización' : 'Organization Profile'}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
        <div>
          <label className="block text-slate-600 font-medium mb-1 text-[11px]">
            {isEs ? 'Nombre' : 'Name'}
          </label>
          <input
            type="text"
            value={company.name}
            onChange={(e) => onUpdateCompany({ ...company, name: e.target.value })}
            placeholder={isEs ? 'Ej: LogiTech S.A.' : 'e.g. Acme Corp'}
            className="w-full px-2.5 py-1 bg-slate-50/60 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:bg-white focus:border-slate-800 transition-all"
          />
        </div>

        <div>
          <label className="block text-slate-600 font-medium mb-1 text-[11px]">
            {isEs ? 'Sector / Industria' : 'Industry'}
          </label>
          <input
            type="text"
            value={company.industry}
            onChange={(e) => onUpdateCompany({ ...company, industry: e.target.value })}
            placeholder={isEs ? 'Ej: Retail / Logística' : 'e.g. Retail'}
            className="w-full px-2.5 py-1 bg-slate-50/60 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:bg-white focus:border-slate-800 transition-all"
          />
        </div>

        <div>
          <label className="block text-slate-600 font-medium mb-1 text-[11px]">
            {isEs ? 'Descripción / Alcance' : 'Description'}
          </label>
          <input
            type="text"
            value={company.description}
            onChange={(e) => onUpdateCompany({ ...company, description: e.target.value })}
            placeholder={isEs ? 'Alcance del negocio...' : 'Business scope...'}
            className="w-full px-2.5 py-1 bg-slate-50/60 border border-slate-200 rounded text-slate-800 text-xs outline-none focus:bg-white focus:border-slate-800 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

