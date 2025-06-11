// src/types/globals.d.ts

declare global {
    interface Window {
      Weglot: {
        initialize(options: { api_key: string }): void;
        options?: Record<string, unknown>;
      };
    }
  }
  
  export {};
  
