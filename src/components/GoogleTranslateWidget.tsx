// src/components/GoogleTranslateWidget.tsx
'use client';

import { useEffect } from 'react';

export default function GoogleTranslateWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
    document.body.appendChild(script);

    // @ts-expect-error google namespace injected by external script
    window.googleTranslateElementInit = () => {
      // @ts-expect-error translate namespace injected by external script
      new window.google.translate.TranslateElement(
        { pageLanguage: 'es', includedLanguages: 'en' },
        'google_translate_element'
      );
    };
  }, []);

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
