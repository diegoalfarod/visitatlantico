"use client";

import { ReactNode, useEffect } from "react";

interface ViewportProviderProps {
  children: ReactNode;
}

export function ViewportProvider({ children }: ViewportProviderProps) {
  useEffect(() => {
    // Función para actualizar la altura del viewport
    const updateViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Función para manejar el teclado virtual
    const handleVirtualKeyboard = () => {
      if (!window.visualViewport) return;

      let lastHeight = window.visualViewport.height;

      const handleViewportChange = () => {
        const currentHeight = window.visualViewport!.height;
        const heightDiff = lastHeight - currentHeight;

        // Si la diferencia es mayor a 100px, probablemente sea el teclado
        if (Math.abs(heightDiff) > 100) {
          const isKeyboardOpen = heightDiff > 0;
          
          // Disparar evento personalizado para que otros componentes puedan reaccionar
          window.dispatchEvent(new CustomEvent('virtual-keyboard', {
            detail: { 
              isOpen: isKeyboardOpen,
              keyboardHeight: isKeyboardOpen ? heightDiff : 0
            }
          }));
        }

        lastHeight = currentHeight;
      };

      window.visualViewport.addEventListener('resize', handleViewportChange);
      window.visualViewport.addEventListener('scroll', handleViewportChange);

      return () => {
        if (window.visualViewport) {
          window.visualViewport.removeEventListener('resize', handleViewportChange);
          window.visualViewport.removeEventListener('scroll', handleViewportChange);
        }
      };
    };

    // Prevenir zoom SOLO en inputs cuando tienen focus
    const preventZoomOnFocus = () => {
      const handleFocus = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          // Solo aplicar el hack del font-size si estamos en el chat
          if (target.closest('.chat-container')) {
            target.style.fontSize = '16px';
          }
        }
      };

      const handleBlur = (e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') {
          if (target.closest('.chat-container')) {
            target.style.fontSize = '';
          }
        }
      };

      document.addEventListener('focusin', handleFocus);
      document.addEventListener('focusout', handleBlur);

      return () => {
        document.removeEventListener('focusin', handleFocus);
        document.removeEventListener('focusout', handleBlur);
      };
    };

    // Inicializar todo
    updateViewportHeight();
    const cleanupKeyboard = handleVirtualKeyboard();
    const cleanupZoom = preventZoomOnFocus();

    // Event listeners
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
      if (cleanupKeyboard) cleanupKeyboard();
      if (cleanupZoom) cleanupZoom();
    };
  }, []);

  return <>{children}</>;
}