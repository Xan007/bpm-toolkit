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
    <div className="md:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
      <div className="pb-2.5 mb-3.5 border-b border-slate-100">
        <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
          {isEs ? 'Perfil de la Organización' : 'Organization Profile'}
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-slate-700 font-semibold mb-1 text-[11.5px]">
            {isEs ? 'Nombre de la Organización' : 'Company Name'}
          </label>
          <input
            type="text"
            value={company.name}
            onChange={(e) => onUpdateCompany({ ...company, name: e.target.value })}
            className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-md text-slate-800 text-xs outline-none focus:bg-white focus:border-slate-800 transition-all"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-semibold mb-1 text-[11.5px]">
            {isEs ? 'Sector o Industria' : 'Industry Sector'}
          </label>
          <input
            type="text"
            value={company.industry}
            onChange={(e) => onUpdateCompany({ ...company, industry: e.target.value })}
            className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-md text-slate-800 text-xs outline-none focus:bg-white focus:border-slate-800 transition-all"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-slate-700 font-semibold mb-1 text-[11.5px]">
            {isEs ? 'Descripción del Negocio / Alcance' : 'Business Description / Scope'}
          </label>
          <input
            type="text"
            value={company.description}
            onChange={(e) => onUpdateCompany({ ...company, description: e.target.value })}
            className="w-full px-3 py-1.5 bg-slate-50/50 border border-slate-200 rounded-md text-slate-800 text-xs outline-none focus:bg-white focus:border-slate-800 transition-all"
          />
        </div>
      </div>
    </div>
  );
};

