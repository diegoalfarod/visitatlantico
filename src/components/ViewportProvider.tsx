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

    // Función para detectar si es iOS
    const isIOS = () => {
      return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
    };

    // Función para manejar el viewport en iOS
    const handleIOSViewport = () => {
      if (!isIOS()) return;

      // Prevenir el bounce/elastic scroll en iOS
      document.body.addEventListener('touchmove', (e) => {
        const target = e.target as HTMLElement;
        const isScrollable = target.closest('.overflow-y-auto, .overflow-y-scroll, .scrollable');
        
        if (!isScrollable) {
          e.preventDefault();
        }
      }, { passive: false });
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
          
          // Disparar evento personalizado
          window.dispatchEvent(new CustomEvent('virtual-keyboard', {
            detail: { 
              isOpen: isKeyboardOpen,
              keyboardHeight: isKeyboardOpen ? heightDiff : 0
            }
          }));

          // Agregar clase al body
          if (isKeyboardOpen) {
            document.body.classList.add('keyboard-open');
          } else {
            document.body.classList.remove('keyboard-open');
          }
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

    // Prevenir zoom en inputs
    const preventZoom = () => {
      const inputs = document.querySelectorAll('input, textarea, select');
      
      inputs.forEach((input) => {
        input.addEventListener('focus', (e) => {
          const target = e.target as HTMLElement;
          // Aplicar font-size 16px temporalmente para prevenir zoom
          target.style.fontSize = '16px';
        });

        input.addEventListener('blur', (e) => {
          const target = e.target as HTMLElement;
          // Restaurar font-size original
          target.style.fontSize = '';
        });
      });
    };

    // Inicializar todo
    updateViewportHeight();
    handleIOSViewport();
    const cleanupKeyboard = handleVirtualKeyboard();
    preventZoom();

    // Event listeners
    window.addEventListener('resize', updateViewportHeight);
    window.addEventListener('orientationchange', updateViewportHeight);

    // Observer para nuevos inputs dinámicos
    const observer = new MutationObserver(() => {
      preventZoom();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Cleanup
    return () => {
      window.removeEventListener('resize', updateViewportHeight);
      window.removeEventListener('orientationchange', updateViewportHeight);
      observer.disconnect();
      if (cleanupKeyboard) cleanupKeyboard();
    };
  }, []);

  return <>{children}</>;
}