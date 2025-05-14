// src/components/WeglotLoader.tsx

declare global {
    interface Window {
      Weglot: {
        initialize(options: { api_key: string }): void;
        options?: Record<string, unknown>;
      };
    }
  }
  
  'use client';
  
  import { useEffect, useState } from 'react';
  import Script from 'next/script';
  
  export default function WeglotLoader() {
    const [host, setHost] = useState('');
  
    useEffect(() => {
      setHost(window.location.host);
    }, []);
  
    const isEn = host.startsWith('en.');
  
    return (
      <Script
        src="https://cdn.weglot.com/weglot.min.js"
        strategy="afterInteractive"
        onLoad={() => {
          if (typeof window.Weglot !== 'undefined') {
            if (isEn) {
              window.Weglot.options = {
                ...window.Weglot.options,
                language: 'en',
              };
            }
            window.Weglot.initialize({
              api_key: 'wg_69286db837a9e6437be697681a5d2bd63',
            });
          }
        }}
      />
    );
  }
  