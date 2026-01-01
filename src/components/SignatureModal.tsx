import React, { useState } from 'react';
import { useSignature } from '@/hooks/useSignature';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import LetterBank from './LetterBank';
import { FileText, Download } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ImageFormat = 'svg' | 'png' | 'jpg' | 'webp';

const SignatureModal: React.FC = () => {
  const {
    signatureText,
    isActive,
    signatureRef,
    handleInputChange,
    handleKeyDown
  } = useSignature();

  const [isDownloading, setIsDownloading] = useState(false);

  // Create the container SVG from the signature
  const createContainerSvg = (): SVGSVGElement | null => {
    if (!signatureRef.current) return null;

    const signatureDiv = signatureRef.current;
    const svgElements = signatureDiv.querySelectorAll('svg');
    if (svgElements.length === 0) return null;

    const containerSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    containerSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

    let totalWidth = 0;
    let maxHeight = 0;

    svgElements.forEach((svg) => {
      const rect = svg.getBoundingClientRect();
      totalWidth += rect.width;
      maxHeight = Math.max(maxHeight, rect.height);
    });

    containerSvg.setAttribute('width', totalWidth.toString());
    containerSvg.setAttribute('height', maxHeight.toString());

    let offsetX = 0;

    svgElements.forEach(svg => {
      const svgClone = svg.cloneNode(true) as SVGSVGElement;
      const pathElement = svgClone.querySelector('path');

      const letterParent = svg.parentElement;
      if (!letterParent) return;

      const classNames = letterParent.className.split(' ');

      if (pathElement) {
        pathElement.style.strokeDasharray = 'none';
        pathElement.style.strokeDashoffset = '0';
        const computedStyle = window.getComputedStyle(svg.querySelector('path')!);
        pathElement.setAttribute('stroke', computedStyle.stroke);
        pathElement.setAttribute('stroke-width', computedStyle.strokeWidth);
        pathElement.setAttribute('fill', 'none');
      }

      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      let marginLeft = 0;
      let marginRight = 0;

      const computedStyle = window.getComputedStyle(letterParent);
      const margin = computedStyle.margin;
      if (margin) {
        const marginValues = margin.split(' ');
        if (marginValues.length === 4) {
          marginRight = parseFloat(marginValues[1]);
          marginLeft = parseFloat(marginValues[3]);
        }
      }

      offsetX += marginLeft;
      group.setAttribute('transform', `translate(${offsetX}, 0)`);

      while (svgClone.firstChild) {
        group.appendChild(svgClone.firstChild);
      }
      containerSvg.appendChild(group);

      offsetX += svg.getBoundingClientRect().width + marginRight;
    });

    return containerSvg;
  };

  // Download as SVG
  const downloadAsSvg = () => {
    const containerSvg = createContainerSvg();
    if (!containerSvg) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(containerSvg);

    const blob = new Blob([svgString], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = 'signature.svg';
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Download as raster format (PNG, JPG, WebP)
  const downloadAsRaster = async (format: 'png' | 'jpg' | 'webp') => {
    const containerSvg = createContainerSvg();
    if (!containerSvg) return;

    setIsDownloading(true);

    try {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(containerSvg);

      // Higher resolution (4x for crisp output)
      const scale = 4;
      const width = parseInt(containerSvg.getAttribute('width') || '0') * scale;
      const height = parseInt(containerSvg.getAttribute('height') || '0') * scale;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Only fill white background for JPG (no transparency support)
      // PNG and WebP stay transparent
      if (format === 'jpg') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, width, height);
      }

      const img = new Image();
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          ctx.drawImage(img, 0, 0, width, height);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });

      const mimeType = format === 'jpg' ? 'image/jpeg' : `image/${format}`;
      const extension = format === 'jpg' ? 'jpg' : format;

      canvas.toBlob((blob) => {
        if (!blob) return;
        const downloadUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.download = `signature.${extension}`;
        link.href = downloadUrl;
        link.click();
        URL.revokeObjectURL(downloadUrl);
      }, mimeType, 0.95);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle download based on format
  const handleDownload = (format: ImageFormat) => {
    if (format === 'svg') {
      downloadAsSvg();
    } else {
      downloadAsRaster(format);
    }
  };

  const formatOptions: { format: ImageFormat; label: string }[] = [
    { format: 'png', label: 'PNG' },
    { format: 'jpg', label: 'JPG' },
    { format: 'svg', label: 'SVG' },
    { format: 'webp', label: 'WebP' },
  ];

  return (
    <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-stretch gap-6 w-[400px] p-6 rounded-2xl">
      <div className="field-wrapper relative flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span>Digital Signature</span>
        </h2>
        
        <Input
          autoComplete="off"
          name="hidden"
          maxLength={256}
          placeholder="Type your name"
          type="text"
          id="First-name"
          required
          value={signatureText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="field text-lg h-14 rounded-full bg-white/15 dark:bg-slate-900/30 border-white/30 dark:border-slate-600/30 px-5 focus:border-white/50 dark:focus:border-slate-500/50 placeholder:text-slate-500/70 dark:placeholder:text-slate-400/50"
        />
      </div>

      <div className={`signature-container relative bg-transparent rounded-xl p-4 transition-all duration-300 group ${isActive ? 'opacity-100' : 'opacity-50'}`}>
        <div className={`signed-by font-mono text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide pb-1 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
          Signature Preview
        </div>
        
        <div className="relative">
          <div ref={signatureRef} className="signature-main flex min-h-[60px] flex-wrap justify-start py-2"></div>
          
          {/* Desktop hover download button with dropdown */}
          {isActive && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="download-btn hidden sm:block absolute top-0 right-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-full bg-white/30 dark:bg-slate-700/30 hover:bg-white/50 dark:hover:bg-slate-600/50"
                  aria-label="Download signature"
                  disabled={isDownloading}
                >
                  <Download className="h-4 w-4 text-slate-700 dark:text-slate-300" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[100px]">
                {formatOptions.map(({ format, label }) => (
                  <DropdownMenuItem
                    key={format}
                    onClick={() => handleDownload(format)}
                    className="cursor-pointer"
                  >
                    {label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
      
      {/* Mobile download button with dropdown */}
      {isActive && (
        <div className="sm:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="secondary"
                className="w-full justify-center rounded-full bg-white/15 dark:bg-slate-900/30 border-white/30 dark:border-slate-600/30"
                disabled={isDownloading}
              >
                <Download className="h-4 w-4 mr-2" />
                Download Signature
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="min-w-[150px]">
              {formatOptions.map(({ format, label }) => (
                <DropdownMenuItem
                  key={format}
                  onClick={() => handleDownload(format)}
                  className="cursor-pointer"
                >
                  Download as {label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
      
      {/* Hidden letter bank for SVG templates */}
      <div className="hidden invisible">
        <LetterBank />
      </div>
    </div>
  );
};

export default SignatureModal;