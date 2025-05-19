
import React from 'react';
import { useSignature } from '@/hooks/useSignature';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LetterBank from './LetterBank';
import { FileText } from "lucide-react";

const SignatureModal: React.FC = () => {
  const {
    signatureText,
    isActive,
    signatureRef,
    handleInputChange,
    handleKeyDown
  } = useSignature();

  return (
    <div className={`modal ${isActive ? 'active' : ''} fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-stretch gap-6 w-[400px] p-6 rounded-xl overflow-hidden transition-all duration-400 ease-in-out shadow-lg bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border border-slate-200 dark:border-slate-700`}>
      <div className="field-wrapper relative flex flex-col gap-2">
        <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span>Digital Signature</span>
        </h2>
        
        <Input
          autoComplete="off"
          name="hidden"
          className="field text-lg h-12 rounded-lg bg-slate-50 dark:bg-slate-900 border-slate-300 dark:border-slate-600 px-4"
          maxLength={256}
          placeholder="Type your name"
          type="text"
          id="First-name"
          required
          value={signatureText}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        
        <Button 
          className="sign absolute right-2 top-[4.5rem] transform -translate-y-1/2 h-9 flex gap-2 items-center bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white px-4 py-0 rounded-md font-mono text-xs uppercase tracking-wide transition-opacity opacity-60 hover:opacity-100"
        >
          <svg width="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="stroke-current">
            <path d="M7.72421 4.666H5.13421C4.86052 4.66592 4.59342 4.75007 4.3692 4.90703C4.14498 5.06398 3.97449 5.28614 3.88088 5.54333L1.37421 12.438C1.28555 12.6813 1.34621 12.954 1.52888 13.1373L1.72421 13.3327L6.00555 9.05133C6.00488 9.034 6.00022 9.01667 6.00022 8.99933C6.00022 8.80155 6.05886 8.60821 6.16875 8.44376C6.27863 8.27932 6.43481 8.15114 6.61753 8.07546C6.80026 7.99977 7.00132 7.97996 7.19531 8.01855C7.38929 8.05713 7.56747 8.15238 7.70732 8.29223C7.84717 8.43208 7.94241 8.61026 7.981 8.80424C8.01959 8.99823 7.99978 9.19929 7.92409 9.38202C7.84841 9.56474 7.72023 9.72092 7.55579 9.8308C7.39134 9.94069 7.198 9.99933 7.00022 9.99933C6.98288 9.99933 6.96555 9.99467 6.94822 9.994L2.66688 14.2753L2.86221 14.4707C2.95185 14.5605 3.06534 14.6228 3.18927 14.6503C3.31319 14.6777 3.44238 14.669 3.56155 14.6253L10.4562 12.118C10.7134 12.0244 10.9356 11.8539 11.0925 11.6297C11.2495 11.4055 11.3336 11.1384 11.3335 10.8647V8.27467L12.6662 6.94267L9.05688 3.33333L7.72421 4.666Z" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
          </svg>
          Sign
        </Button>
      </div>

      <div className={`signature-container bg-slate-50 dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-700 transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-50'}`}>
        <div className={`signed-by font-mono text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wide pb-1 ${isActive ? 'opacity-100' : 'opacity-60'}`}>
          Signature Preview
        </div>
        <div ref={signatureRef} className="signature-main flex min-h-[60px] flex-wrap justify-start py-2"></div>
      </div>
      
      {/* Hidden letter bank for SVG templates */}
      <LetterBank />
    </div>
  );
};

export default SignatureModal;
