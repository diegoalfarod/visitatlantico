// src/hooks/useVirtualKeyboard.ts
// Hook opcional para funcionalidad avanzada del teclado virtual

import { useState, useEffect, useCallback } from 'react';

interface VirtualKeyboardState {
  isOpen: boolean;
  keyboardHeight: number;
  viewportHeight: number;
  safeAreaBottom: number;
}

export function useVirtualKeyboard() {
  const [keyboardState, setKeyboardState] = useState<VirtualKeyboardState>({
    isOpen: false,
    keyboardHeight: 0,
    viewportHeight: typeof window !== 'undefined' ? window.innerHeight : 0,
    safeAreaBottom: 0,
  });

  const getSafeAreaBottom = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    
    const computedStyle = getComputedStyle(document.documentElement);
    const safeArea = computedStyle.getPropertyValue('--safe-area-bottom');
    return parseInt(safeArea) || 0;
  }, []);

  const updateKeyboardState = useCallback(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      return;
    }

    const keyboardHeight = window.innerHeight - window.visualViewport.height;
    const isOpen = keyboardHeight > 50; // Threshold of 50px

    setKeyboardState({
      isOpen,
      keyboardHeight: isOpen ? keyboardHeight : 0,
      viewportHeight: window.visualViewport.height,
      safeAreaBottom: getSafeAreaBottom(),
    });
  }, [getSafeAreaBottom]);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) {
      console.warn('Visual Viewport API not supported');
      return;
    }

    // Initial state
    updateKeyboardState();

    // Event listeners
    const handleViewportChange = () => {
      updateKeyboardState();
    };

    // Custom event listener
    const handleCustomKeyboardEvent = (event: Event) => {
      const customEvent = event as CustomEvent;
      setKeyboardState(prev => ({
        ...prev,
        isOpen: customEvent.detail.isOpen,
        keyboardHeight: customEvent.detail.keyboardHeight,
      }));
    };

    // iOS specific handling
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    
    if (isIOS) {
      // Additional iOS-specific listeners
      const handleFocusIn = () => {
        setTimeout(updateKeyboardState, 300);
      };
      
      const handleFocusOut = () => {
        setTimeout(updateKeyboardState, 300);
      };

      window.addEventListener('focusin', handleFocusIn);
      window.addEventListener('focusout', handleFocusOut);
      
      // Cleanup iOS listeners
      return () => {
        window.removeEventListener('focusin', handleFocusIn);
        window.removeEventListener('focusout', handleFocusOut);
      };
    }

    window.visualViewport.addEventListener('resize', handleViewportChange);
    window.visualViewport.addEventListener('scroll', handleViewportChange);
    window.addEventListener('virtual-keyboard', handleCustomKeyboardEvent);

    return () => {
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleViewportChange);
        window.visualViewport.removeEventListener('scroll', handleViewportChange);
      }
      window.removeEventListener('virtual-keyboard', handleCustomKeyboardEvent);
    };
  }, [updateKeyboardState]);

  // Métodos útiles
  const getInputPadding = useCallback(() => {
    if (keyboardState.isOpen) {
      return 8; // Padding mínimo cuando el teclado está abierto
    }
    return keyboardState.safeAreaBottom || 0;
  }, [keyboardState]);

  const getContainerHeight = useCallback(() => {
    if (keyboardState.isOpen) {
      return keyboardState.viewportHeight;
    }
    return '100vh';
  }, [keyboardState]);

  const scrollToBottom = useCallback((element: HTMLElement | null) => {
    if (!element) return;
    
    setTimeout(() => {
      element.scrollTop = element.scrollHeight;
    }, 100);
  }, []);

  return {
    ...keyboardState,
    getInputPadding,
    getContainerHeight,
    scrollToBottom,
  };
}

// Ejemplo de uso:
/*
function ChatComponent() {
  const { 
    isOpen, 
    keyboardHeight, 
    viewportHeight,
    getInputPadding,
    getContainerHeight 
  } = useVirtualKeyboard();

  return (
    <div
      style={{
        height: getContainerHeight(),
        paddingBottom: getInputPadding(),
      }}
    >
      {isOpen && <p>Teclado abierto: {keyboardHeight}px</p>}
    </div>
  );
}
*/