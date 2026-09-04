import React, { useEffect, useRef, useState } from 'react';

interface DrawioEmbedProps {
  xml: string;
  title: string;
  onSave?: (savedXml: string, savedSvg: string) => void;
  onClose?: () => void;
}

export const DrawioEmbed: React.FC<DrawioEmbedProps> = ({ xml, title, onSave, onClose }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const pendingSaveXml = useRef<string | null>(null);

  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (!e.data || typeof e.data !== 'string') return;
      
      try {
        const msg = JSON.parse(e.data);
        if (msg.event === 'init') {
          setIsLoaded(true);
          // Inyectamos nuestro XML al iframe
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ action: 'load', xml: xml, title: title }),
            '*'
          );
        } else if (msg.event === 'exit') {
          if (onClose) {
            onClose();
          }
        } else if (msg.event === 'save') {
          // Solicitamos exportación SVG a Draw.io para tener la vista previa exacta
          pendingSaveXml.current = msg.xml;
          iframeRef.current?.contentWindow?.postMessage(
            JSON.stringify({ 
              action: 'export', 
              format: 'xmlsvg', 
              xml: msg.xml, 
              bg: '#ffffff',
              border: 15,
              scale: 1,
              dark: 0,
              'svg-theme': 'light',
              unformatted: 1,
              appearance: 'light'
            }),
            '*'
          );
        } else if (msg.event === 'export') {
          if (pendingSaveXml.current && msg.data) {
            let svgContent = '';
            if (msg.data.includes('base64,')) {
              // Properly decode base64 UTF-8 string to preserve accents (tildes)
              svgContent = decodeURIComponent(escape(atob(msg.data.split('base64,')[1])));
            } else {
              svgContent = decodeURIComponent(msg.data.substring(msg.data.indexOf(',') + 1));
            }
            
            // Forzar a que el SVG exportado no aplique el modo oscuro del sistema
            svgContent = svgContent.replace(/prefers-color-scheme:\s*dark/gi, 'prefers-color-scheme: dummy');
            
            // Neutralizar el nuevo soporte de Draw.io versión 26+ para color-scheme nativo
            svgContent = svgContent.replace(/color-scheme:\s*light\s+dark/gi, 'color-scheme: light');
            svgContent = svgContent.replace(/color-scheme:\s*dark/gi, 'color-scheme: light');
            
            // Limpiar cualquier filter: invert() inyectado directamente (típico de Draw.io)
            svgContent = svgContent.replace(/filter:\s*invert\([^)]*\)\s*(?:hue-rotate\([^)]*\))?/gi, 'filter: none');
            if (onSave) {
              onSave(pendingSaveXml.current, svgContent);
            }
            pendingSaveXml.current = null;
          }
        }
      } catch (err) {
        // Ignorar mensajes parse error
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [xml, title, onSave, isLoaded]);

  useEffect(() => {
    if (isLoaded) {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ action: 'load', xml: xml, title: title }),
        '*'
      );
    }
  }, [xml, title, isLoaded]);

  // Parámetros para modo ultra limpio: sin panel de formas (sidebar=0), modo claro forzado (ui=kennedy no tiene dark mode, dark=0)
  const embedUrl = "https://embed.diagrams.net/?embed=1&ui=kennedy&spin=1&proto=json&libraries=0&format=0&sidebar=0&dark=0";

  return (
    <div className="w-full h-full relative border border-slate-200 rounded-lg overflow-hidden shadow-2xs flex-1 flex flex-col">
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 z-10">
          <div className="text-slate-500 font-medium text-sm animate-pulse">Cargando editor de Draw.io...</div>
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={embedUrl}
        className="w-full h-full border-none bg-white block flex-1"
        title="Draw.io Editor"
      />
    </div>
  );
};
