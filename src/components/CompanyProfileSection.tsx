import React from 'react';
import { CompanyProfile } from '../types';
import { Building2, Briefcase, FileText } from 'lucide-react';

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
      <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              {isEs ? 'Perfil de la Organización' : 'Organization Profile'}
            </h2>
            <p className="text-[11px] text-slate-400">
              {isEs
                ? 'Información contextual para la documentación.'
                : 'Contextual info for documentation and reporting.'}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 text-xs">
        <div>
          <label className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1.5 text-[11.5px]">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{isEs ? 'Nombre de la Organización' : 'Company Name'}</span>
          </label>
          <input
            type="text"
            placeholder={isEs ? 'Ej. Higher Education Academy' : 'e.g. Higher Education Academy'}
            value={company.name}
            onChange={(e) => onUpdateCompany({ ...company, name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-800 text-xs placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"
          />
        </div>

        <div>
          <label className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1.5 text-[11.5px]">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span>{isEs ? 'Sector o Industria' : 'Industry Sector'}</span>
          </label>
          <input
            type="text"
            placeholder={isEs ? 'Ej. Educación Superior, Logística...' : 'e.g. Higher Education, Logistics...'}
            value={company.industry}
            onChange={(e) => onUpdateCompany({ ...company, industry: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-800 text-xs placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-center gap-1.5 text-slate-700 font-semibold mb-1.5 text-[11.5px]">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>{isEs ? 'Descripción del Negocio / Alcance' : 'Business Description / Scope'}</span>
          </label>
          <input
            type="text"
            placeholder={isEs ? 'Resumen general de las operaciones o misión...' : 'Brief overview of operations or mission...'}
            value={company.description}
            onChange={(e) => onUpdateCompany({ ...company, description: e.target.value })}
            className="w-full px-3 py-2 bg-slate-50/50 border border-slate-200 rounded-lg text-slate-800 text-xs placeholder:text-slate-400 outline-none focus:bg-white focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-all"
          />
        </div>
      </div>
    </div>
  );
};
