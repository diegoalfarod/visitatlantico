export class OfflineManager {
    private static isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
    private static listeners: ((online: boolean) => void)[] = [];
  
    static init() {
      if (typeof window === 'undefined') return;
  
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notifyListeners(true);
      });
  
      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notifyListeners(false);
      });
    }
  
    static getStatus(): boolean {
      return this.isOnline;
    }
  
    static addListener(callback: (online: boolean) => void) {
      this.listeners.push(callback);
      return () => {
        this.listeners = this.listeners.filter(cb => cb !== callback);
      };
    }
  
    private static notifyListeners(online: boolean) {
      this.listeners.forEach(cb => cb(online));
    }
  
    // Registrar Service Worker para funcionalidad offline
    static async registerServiceWorker() {
      if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
        try {
          await navigator.serviceWorker.register('/sw.js');
          console.log('Service Worker registrado');
        } catch (error) {
          console.error('Error registrando Service Worker:', error);
        }
      }
    }
  }
  