// hooks/useClickOutside.js
import { useEffect } from 'react';

export const useClickOutside = (refs, isOpen, onClose) => {
  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedOutside = refs.every(
        ref => ref.current && !ref.current.contains(event.target)
      );
      
      if (isOpen && clickedOutside) {
        onClose();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [refs, isOpen, onClose]);
};
