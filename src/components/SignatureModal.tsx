
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

  // Function to download the signature as an SVG
  const downloadSignature = () => {
    if (!signatureRef.current) return;
    
    // Get the SVG content
    const signatureDiv = signatureRef.current;
    const svgElements = signatureDiv.querySelectorAll('svg');
    
    if (svgElements.length === 0) return;
    
    // Create a container SVG to hold all the letter SVGs
    const containerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    containerSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    
    // Calculate the total width needed for all letters
    let totalWidth = 0;
    let maxHeight = 0;
    
    // First pass to calculate dimensions
    svgElements.forEach((svg) => {
      const rect = svg.getBoundingClientRect();
      totalWidth += rect.width;
      maxHeight = Math.max(maxHeight, rect.height);
    });
    
    // Add some padding
    containerSvg.setAttribute('width', (totalWidth + 10).toString());
    containerSvg.setAttribute('height', (maxHeight + 10).toString());
    
    // Add white background
    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('width', '100%');
    background.setAttribute('height', '100%');
    background.setAttribute('fill', '#ffffff');
    containerSvg.appendChild(background);
    
    // Clone and add each SVG element to the container
    let offsetX = 5; // Start with a bit of padding
    svgElements.forEach((svg) => {
      // Deep clone the SVG element
      const svgClone = svg.cloneNode(true) as SVGSVGElement;
      const pathElement = svgClone.querySelector('path');
      
      if (pathElement) {
        // Reset the animation properties to make sure path is fully drawn
        pathElement.style.strokeDasharray = 'none';
        pathElement.style.strokeDashoffset = '0';
        
        // Get computed styles of the original path for accurate rendering
        const computedStyle = window.getComputedStyle(svg.querySelector('path')!);
        pathElement.setAttribute('stroke', computedStyle.stroke);
        pathElement.setAttribute('stroke-width', computedStyle.strokeWidth);
        pathElement.setAttribute('fill', 'none'); // Ensure no fill
      }
      
      // Create a group to position each letter
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.setAttribute('transform', `translate(${offsetX}, 5)`);
      
      // Add SVG content to group
      while (svgClone.firstChild) {
        group.appendChild(svgClone.firstChild);
      }
      
      containerSvg.appendChild(group);
      offsetX += svg.getBoundingClientRect().width;
    });
    
    // Serialize the SVG to a string
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(containerSvg);
    
    // Create a Blob and download link
    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.download = 'signature.svg';
    link.href = url;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
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
                  <p>Download signature as SVG</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </div>
      
      {/* Hidden letter bank for SVG templates - now invisible */}
      <div className="hidden invisible">
        <LetterBank />
      </div>
    </div>
  );
};

export default SignatureModal;
