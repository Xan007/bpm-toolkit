import React, { useState } from 'react';
import { HelpContent } from '../helpDictionary';
import { HelpCircle } from 'lucide-react';

interface HelpTooltipButtonProps {
  helpKey: string;
  tooltipText: string;
  helpData?: HelpContent;
  isEs: boolean;
  onOpenModal: (data: HelpContent) => void;
}

export const HelpTooltipButton: React.FC<HelpTooltipButtonProps> = ({
  tooltipText,
  helpData,
  isEs,
  onOpenModal,
}) => {
  const [hover, setHover] = useState(false);

  return (
    <div className="relative inline-flex items-center ml-1">
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          if (helpData) onOpenModal(helpData);
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        className="text-slate-400 hover:text-slate-900 p-0.5 rounded cursor-pointer transition-colors"
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
