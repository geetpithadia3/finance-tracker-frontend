
import { useEffect } from 'react';

const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const useResizeObserverFix = () => {
  useEffect(() => {
    const fixResizeObserverLoopError = debounce(() => {
    //   const resizeObserverError = new Event("error");
    //   resizeObserverError.error = new Error("ResizeObserver loop completed with undelivered notifications.");
    //   window.dispatchEvent(resizeObserverError);
    }, 100);

    window.addEventListener('error', (e) => {
      if (e.message === 'ResizeObserver loop limit exceeded' || e.message.includes('ResizeObserver loop completed with undelivered notifications')) {
        fixResizeObserverLoopError();
      }
    });

    return () => {
      window.removeEventListener('error', fixResizeObserverLoopError);
    };
  }, []);
};