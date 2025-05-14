// src/components/GoogleTranslateWidget.tsx
'use client';

import { useEffect } from 'react';

export default function GoogleTranslateWidget() {
  useEffect(() => {
    // Crea el script del widget de Google Translate
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    // Callback global que inicializa el widget
    // @ts-ignore
    window.googleTranslateElementInit = () => {
      // @ts-ignore
      new window.google.translate.TranslateElement(
        { pageLanguage: 'es', includedLanguages: 'en' },
        'google_translate_element'
      );
    };
  }, []);

  // Contenedor donde Google inyecta el widget
  return (
    <div
      id="google_translate_element"
      style={{
        position: 'fixed',
        top: 10,
        right: 10,
        zIndex: 1000,
        background: 'white',
        padding: '4px 8px',
        borderRadius: '4px',
      }}
    />
  );
}
