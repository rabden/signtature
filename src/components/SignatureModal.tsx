
import React, { useRef } from 'react';
import { useSignature } from '@/hooks/useSignature';
import { Input } from '@/components/ui/input';
import LetterBank from './LetterBank';
import { FileText, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const SignatureModal: React.FC = () => {
  const {
    signatureText,
    isActive,
    signatureRef,
    handleInputChange,
    handleKeyDown
  } = useSignature();

  // Function to download the signature as an image
  const downloadSignature = () => {
    if (!signatureRef.current) return;
    
    // Create a canvas element
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const signatureDiv = signatureRef.current;
    
    // Set canvas dimensions
    canvas.width = signatureDiv.offsetWidth;
    canvas.height = signatureDiv.offsetHeight;
    
    // Draw white background
    if (ctx) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Convert the SVG content to an image
      const svgData = new XMLSerializer().serializeToString(signatureDiv);
      const img = new Image();
      
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        
        // Create download link
        const link = document.createElement('a');
        link.download = 'signature.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      };
      
      img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
    }
  };

  return (
    <div className={`modal ${isActive ? 'active' : ''} fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-stretch gap-6 w-[400px] p-6 rounded-2xl overflow-hidden transition-all duration-400 ease-in-out shadow-lg bg-white/20 dark:bg-slate-800/20 backdrop-blur-lg border border-white/30 dark:border-slate-700/30`}>
      <div className="field-wrapper relative flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span>Digital Signature</span>
        </h2>
        
        <Input
          autoComplete="off"
          name="hidden"
          className="field text-lg h-14 rounded-xl bg-white/30 dark:bg-slate-900/30 border-white/30 dark:border-slate-600/30 px-5 focus:border-white/50 dark:focus:border-slate-500/50 placeholder:text-slate-500/70 dark:placeholder:text-slate-400/50"
          maxLength={256}
          placeholder="Type your name"
          type="text"
          id="First-name"
          required
          value={signatureText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className={`signature-container relative bg-transparent rounded-xl p-4 transition-all duration-300 group ${isActive ? 'opacity-100' : 'opacity-50'}`}>
        <div className={`signed-by font-mono text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide pb-1 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
          Signature Preview
        </div>
        
        <div className="relative">
          <div ref={signatureRef} className="signature-main flex min-h-[60px] flex-wrap justify-start py-2"></div>
          
          {isActive && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button 
                    onClick={downloadSignature} 
                    className="download-btn absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-white/30 dark:bg-slate-700/30 hover:bg-white/50 dark:hover:bg-slate-600/50"
                    aria-label="Download signature"
                  >
                    <Download className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download signature</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {/* Hidden letter bank for SVG templates */}
      <LetterBank />
    </div>
  );
};

export default SignatureModal;
