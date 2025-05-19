
import { useState, useEffect, useRef } from 'react';

interface SignatureSettings {
  letterSpacing: Record<string, { margin: string }>;
  letterPaths: Record<string, { array: number }>;
}

export const useSignature = () => {
  const [signatureText, setSignatureText] = useState('');
  const [isActive, setIsActive] = useState(false);
  const signatureRef = useRef<HTMLDivElement>(null);
  
  // Create SVG path for a letter
  const createLetterElement = (letter: string, animate: boolean): HTMLDivElement | null => {
    if (letter === ' ') {
      const space = document.createElement('div');
      space.style.minWidth = '12px';
      return space;
    }

    const alphabet = 'abcdefghijklmnopqrstuvwxyz';
    const index = alphabet.indexOf(letter.toLowerCase());
    
    if (index === -1) return null;
    
    // Get the SVG element from letter bank (would need to be implemented differently)
    const letterBank = document.querySelector('.letter-bank');
    if (!letterBank) return null;
    
    const isUpperCase = letter === letter.toUpperCase();
    const selector = isUpperCase 
      ? `.up.${letter.toLowerCase()}`
      : `.lo.${letter.toLowerCase()}`;
    
    const template = letterBank.querySelector(selector);
    if (!template) return null;
    
    const letterElement = document.createElement('div');
    letterElement.innerHTML = template.innerHTML;
    letterElement.classList.add(isUpperCase ? 'up' : 'lo');
    letterElement.classList.add(letter.toLowerCase());
    
    if (animate) {
      setTimeout(() => {
        const path = letterElement.querySelector('svg path');
        if (path) {
          // Cast to SVGPathElement
          (path as SVGPathElement).style.strokeDashoffset = '0';
        }
      }, 50);
    } else {
      const path = letterElement.querySelector('svg path');
      if (path) {
        // Cast to SVGPathElement
        (path as SVGPathElement).style.strokeDashoffset = '0';
      }
    }
    
    return letterElement;
  };

  // Handle text input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSignatureText(value);
    
    if (!value) {
      setIsActive(false);
    } else {
      setIsActive(true);
    }
    
    if (signatureRef.current) {
      signatureRef.current.innerHTML = '';
      const letters = value.split('');
      letters.forEach(letter => drawLetter(letter, false));
    }
  };

  // Handle keydown for special handling of backspace and letter drawing
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if ((e.code === `Key${e.key.toUpperCase()}`) || (e.code === 'Space')) {
      drawLetter(e.key, true);
    } else if (e.code === 'Backspace') {
      setTimeout(() => {
        if (signatureRef.current) {
          signatureRef.current.innerHTML = '';
          const letters = (e.target as HTMLInputElement).value.split('');
          letters.forEach(letter => drawLetter(letter, false));
        }
      }, 50);
    }
  };

  // Draw a letter in the signature area
  const drawLetter = (letter: string, animate: boolean) => {
    if (!signatureRef.current) return;
    
    const letterElement = createLetterElement(letter, animate);
    if (letterElement) {
      signatureRef.current.appendChild(letterElement);
    }
  };

  return {
    signatureText,
    isActive,
    signatureRef,
    handleInputChange,
    handleKeyDown
  };
};
