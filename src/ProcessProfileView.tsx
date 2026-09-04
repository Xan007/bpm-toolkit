import React, { useState, useMemo, useEffect, useRef } from 'react';
import { BPMProcess, AppConfig, ProcessProfileData, ProcessCategory } from './types';
import { Download, Check, Copy, ChevronDown } from 'lucide-react';
import { toast } from 'react-toastify';
import { getHelpDictionary, HelpContent } from './features/process-profile/helpDictionary';
import {
  buildProfileHtmlTable,
  buildProfilePlainText,
  exportProfileToPdf,
  exportMultipleProfilesToPdf,
} from './features/process-profile/profileExport';
import { ProfileHelpModal } from './features/process-profile/components/ProfileHelpModal';
import { ProcessSelectorDropdown } from './features/process-profile/components/ProcessSelectorDropdown';
import { ProcessProfileForm } from './features/process-profile/components/ProcessProfileForm';

interface ProcessProfileViewProps {
  processes: BPMProcess[];
  config: AppConfig;
  onUpdateProcess?: (id: string, updates: Partial<BPMProcess>) => void;
}

const STORAGE_KEY_SAVED_OWNERS = 'bpm_custom_process_owners';

export const ProcessProfileView: React.FC<ProcessProfileViewProps> = ({
  processes,
  config,
  onUpdateProcess,
}) => {
  const isEs = config.language === 'es';

  const [selectedCategory, setSelectedCategory] = useState<ProcessCategory | 'all'>('all');
  const [searchProcess, setSearchProcess] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCopyMenuOpen, setIsCopyMenuOpen] = useState(false);
  const [isPdfMenuOpen, setIsPdfMenuOpen] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const copyMenuRef = useRef<HTMLDivElement>(null);
  const pdfMenuRef = useRef<HTMLDivElement>(null);

  const [selectedProcessId, setSelectedProcessId] = useState<string>(() => {
    return processes.length > 0 ? processes[0].id : '';
  });

  const [copiedTable, setCopiedTable] = useState(false);
  const [activeHelpModal, setActiveHelpModal] = useState<HelpContent | null>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (copyMenuRef.current && !copyMenuRef.current.contains(e.target as Node)) {
        setIsCopyMenuOpen(false);
      }
      if (pdfMenuRef.current && !pdfMenuRef.current.contains(e.target as Node)) {
        setIsPdfMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  useEffect(() => {
    if (processes.length > 0 && !processes.some((p) => p.id === selectedProcessId)) {
      setSelectedProcessId(processes[0].id);
    }
  }, [processes, selectedProcessId]);

  const currentProcess = useMemo(() => {
    return processes.find((p) => p.id === selectedProcessId) || processes[0] || null;
  }, [processes, selectedProcessId]);

  // Obtenemos todos los procesos que tengan al menos algún dato en su ficha de perfil
  const processesWithProfile = useMemo(() => {
    return processes.filter((p) => {
      const prof = p.profile || p.profileEn;
      if (!prof) return false;
      return Object.values(prof).some((val) => typeof val === 'string' && val.trim().length > 0);
    });
  }, [processes]);

  // Obtenemos el perfil del proceso activo
  const profile: ProcessProfileData = useMemo(() => {
    if (!currentProcess) return {};
    if (!isEs && currentProcess.profileEn) {
      return { ...(currentProcess.profile || {}), ...currentProcess.profileEn };
    }
    return currentProcess.profile || currentProcess.profileEn || {};
  }, [currentProcess, isEs]);

  const handleProfileChange = (field: keyof ProcessProfileData, value: string) => {
    if (!currentProcess || !onUpdateProcess) return;

    const currentBase = currentProcess.profile || {};
    const updatedProfile: ProcessProfileData = {
      ...currentBase,
      [field]: value,
    };

    const updates: Partial<BPMProcess> = {
      profile: updatedProfile,
    };

    if (currentProcess.profileEn || !isEs) {
      updates.profileEn = {
        ...(currentProcess.profileEn || currentBase),
        [field]: value,
      };
    }

    onUpdateProcess(currentProcess.id, updates);
  };

  const helpDictionary = useMemo(() => getHelpDictionary(isEs), [isEs]);

  const copySingleTableToClipboard = async () => {
    if (!currentProcess) return;
    setIsCopyMenuOpen(false);
    const htmlTable = buildProfileHtmlTable(currentProcess, config, 10);
    const plainText = buildProfilePlainText(currentProcess, isEs);

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

  const copyAllTablesToClipboard = async () => {
    setIsCopyMenuOpen(false);
    const listToCopy = processesWithProfile.length > 0 ? processesWithProfile : processes;
    if (listToCopy.length === 0) return;

    const combinedHtml = listToCopy
      .map((proc) => buildProfileHtmlTable(proc, config, 10))
      .join('<br/><br/>');
    const combinedPlain = listToCopy
      .map((proc) => buildProfilePlainText(proc, isEs))
      .join('\n\n========================================\n\n');

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const blobHtml = new Blob([combinedHtml], { type: 'text/html' });
        const blobText = new Blob([combinedPlain], { type: 'text/plain' });
        await navigator.clipboard.write([
          new ClipboardItem({
            'text/html': blobHtml,
            'text/plain': blobText,
          }),
        ]);
      } else {
        await navigator.clipboard.writeText(combinedPlain);
      }
      setCopiedTable(true);
      toast.success(
        isEs
          ? `¡${listToCopy.length} tablas copiadas al portapapeles!`
          : `Copied ${listToCopy.length} tables to clipboard!`
      );
      setTimeout(() => setCopiedTable(false), 2500);
    } catch {
      await navigator.clipboard.writeText(combinedPlain);
      setCopiedTable(true);
      toast.success(
        isEs
          ? `¡${listToCopy.length} tablas copiadas al portapapeles!`
          : `Copied ${listToCopy.length} tables to clipboard!`
      );
      setTimeout(() => setCopiedTable(false), 2500);
    }
  };

  const downloadSingleProfilePDF = async () => {
    if (!currentProcess) return;
    setIsPdfMenuOpen(false);
    setIsGeneratingPdf(true);
    try {
      await exportProfileToPdf(currentProcess, config);
      toast.success(isEs ? '¡PDF generado exitosamente!' : 'PDF generated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(isEs ? 'Error al generar PDF' : 'Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const downloadAllProfilesPDF = async () => {
    setIsPdfMenuOpen(false);
    const listToExport = processesWithProfile.length > 0 ? processesWithProfile : processes;
    if (listToExport.length === 0) return;

    setIsGeneratingPdf(true);
    toast.info(
      isEs
        ? `Generando PDF con ${listToExport.length} perfiles...`
        : `Generating PDF for ${listToExport.length} profiles...`
    );
    try {
      await exportMultipleProfilesToPdf(listToExport, config);
      toast.success(isEs ? '¡PDF generado exitosamente!' : 'PDF generated successfully!');
    } catch (err) {
      console.error(err);
      toast.error(isEs ? 'Error al generar PDF' : 'Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
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
      {/* Barra Superior Unificada: Selector de proceso a la izquierda y acciones de exportación a la derecha */}
      <div className="flex flex-wrap items-center justify-between bg-white border border-slate-200 rounded-lg px-3.5 py-2 shadow-2xs gap-3">
        <div className="flex items-center gap-3">
          <ProcessSelectorDropdown
            processes={processes}
            filteredProcesses={filteredProcesses}
            currentProcess={currentProcess}
            selectedCategory={selectedCategory}
            searchProcess={searchProcess}
            isDropdownOpen={isDropdownOpen}
            isEs={isEs}
            onSelectCategory={setSelectedCategory}
            onSearchChange={setSearchProcess}
            onToggleDropdown={() => setIsDropdownOpen((prev) => !prev)}
            onCloseDropdown={() => setIsDropdownOpen(false)}
            onSelectProcess={setSelectedProcessId}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Desplegable Copiar Tabla */}
          <div className="relative" ref={copyMenuRef}>
            <button
              onClick={() => setIsCopyMenuOpen((prev) => !prev)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer border ${
                copiedTable
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 shadow-2xs'
              }`}
            >
              {copiedTable ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
              <span>{copiedTable ? (isEs ? '¡Copiado!' : 'Copied!') : (isEs ? 'Copiar Tabla' : 'Copy Table')}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isCopyMenuOpen && (
              <div className="absolute right-0 mt-1 w-56 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-30 text-xs">
                <button
                  onClick={copySingleTableToClipboard}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer"
                >
                  <span>{isEs ? 'Proceso actual' : 'Current process'}</span>
                </button>
                <button
                  onClick={copyAllTablesToClipboard}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center justify-between border-t border-slate-100 cursor-pointer"
                >
                  <span>{isEs ? 'Todos los perfiles completos' : 'All completed profiles'}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    {processesWithProfile.length}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Desplegable Descargar PDF */}
          <div className="relative" ref={pdfMenuRef}>
            <button
              disabled={isGeneratingPdf}
              onClick={() => setIsPdfMenuOpen((prev) => !prev)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-md transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPdf ? (isEs ? 'Generando...' : 'Generating...') : 'PDF'}</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isPdfMenuOpen && (
              <div className="absolute right-0 mt-1 w-64 bg-white border border-slate-200 rounded-md shadow-lg py-1 z-30 text-xs">
                <button
                  onClick={downloadSingleProfilePDF}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center justify-between cursor-pointer"
                >
                  <span>{isEs ? 'Descargar proceso actual' : 'Download current process'}</span>
                </button>
                <button
                  onClick={downloadAllProfilesPDF}
                  className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700 flex items-center justify-between border-t border-slate-100 cursor-pointer"
                >
                  <span>{isEs ? 'Descargar todos (un PDF, 1 pág/proceso)' : 'Download all (single PDF, 1 pg/process)'}</span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                    {processesWithProfile.length}
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Formulario a la izquierda y Previsualización a la derecha alineados a la misma altura */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* COLUMNA IZQUIERDA: FORMULARIO */}
        <div className="lg:col-span-6">
          <ProcessProfileForm
            currentProcess={currentProcess}
            profile={profile}
            savedOwners={savedOwners}
            isEs={isEs}
            helpDict={helpDictionary}
            onProfileChange={handleProfileChange}
            onSaveOwnerIfNew={saveOwnerIfNew}
            onOpenHelpModal={setActiveHelpModal}
          />
        </div>

        {/* COLUMNA DERECHA: PREVISUALIZACIÓN */}
        <div className="lg:col-span-6">
          <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-2xs">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
              <span className="text-xs font-semibold text-slate-900">
                {isEs ? 'Previsualización de la Tabla' : 'Table Preview'}
              </span>
            </div>

            <div
              id="process-profile-table-container"
              className="w-full bg-white p-2 rounded overflow-x-auto shadow-2xs"
              style={{ fontFamily: config.fontFamily }}
              dangerouslySetInnerHTML={{ __html: buildProfileHtmlTable(currentProcess, config, 10) }}
            />
          </div>
        </div>
      </div>

      {/* MODAL DE AYUDA */}
      <ProfileHelpModal
        helpData={activeHelpModal}
        isEs={isEs}
        onClose={() => setActiveHelpModal(null)}
      />
    </div>
  );
};
