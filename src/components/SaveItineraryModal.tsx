"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
import { 
  X, 
  Copy, 
  Download, 
  Share2, 
  Mail, 
  Check,
  Loader2,
  WifiOff,
  Sparkles
} from 'lucide-react';
import { SavedItinerary, Stop } from '@/types/itinerary';
import { ItineraryStorage } from '@/utils/itinerary-storage';
import { OfflineManager } from '@/utils/offline-manager';

interface SaveItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: number;
  answers: {
    motivos?: string[];
    otros?: boolean;
    email?: string;
  };
  itinerary: Stop[];
  locationData: {
    lat: number;
    lng: number;
    address?: string;
  } | null;
}

export default function SaveItineraryModal({
  isOpen,
  onClose,
  days,
  answers,
  itinerary,
  locationData
}: SaveItineraryModalProps) {
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedData, setSavedData] = useState<SavedItinerary | null>(null);
  const [copied, setCopied] = useState(false);
  const [isOnline, setIsOnline] = useState(OfflineManager.getStatus());
  const [customTitle, setCustomTitle] = useState('');
  const [wantsEmail, setWantsEmail] = useState(false);
  const [userEmail, setUserEmail] = useState(answers.email || '');

  useEffect(() => {
    const unsubscribe = OfflineManager.addListener(setIsOnline);
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (isOpen && !customTitle) {
      const generatedTitle = ItineraryStorage.generateTitle(answers, days);
      setCustomTitle(generatedTitle);
    }
  }, [isOpen, answers, days]);

  const handleSave = async () => {
    if (saving || saved) return;

    setSaving(true);
    setError(null);

    try {
      const shortId = ItineraryStorage.generateShortId();
      const now = new Date();
      const expiresAt = wantsEmail && userEmail ? null : new Date(
        now.getTime() + (180 * 24 * 60 * 60 * 1000) // 6 meses
      ).toISOString();

      const savedItinerary: SavedItinerary = {
        id: `itinerary_${Date.now()}`,
        shortId,
        title: customTitle || ItineraryStorage.generateTitle(answers, days),
        days,
        stops: itinerary,
        profile: {
          ...answers,
          email: wantsEmail ? userEmail : undefined
        },
        location: locationData || undefined,
        createdAt: now.toISOString(),
        expiresAt: expiresAt || undefined,
        views: 0,
        isOffline: !isOnline
      };

      // Guardar localmente siempre
      ItineraryStorage.saveLocal(savedItinerary);

      // Intentar guardar en Firebase si está online
      if (isOnline) {
        try {
          const response = await fetch('/api/itinerary/save', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(savedItinerary)
          });

          if (!response.ok) {
            console.warn('No se pudo guardar en el servidor, pero está guardado localmente');
          }
        } catch (error) {
          console.warn('Error al guardar en servidor:', error);
        }
      }

      setSavedData(savedItinerary);
      setSaved(true);
    } catch (error) {
      console.error('Error guardando:', error);
      setError('Error al guardar el itinerario. Por favor intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const handleCopyLink = async () => {
    if (!savedData) return;

    const url = `${window.location.origin}/itinerary/${savedData.shortId}`;
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Error copiando:', error);
    }
  };

  const handleShare = async () => {
    if (!savedData) return;

    const url = `${window.location.origin}/itinerary/${savedData.shortId}`;
    const text = `¡Mira mi itinerario de ${days} día${days > 1 ? 's' : ''} por el Atlántico!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: savedData.title,
          text,
          url
        });
      } catch (error) {
        console.error('Error compartiendo:', error);
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownloadQR = () => {
    if (!savedData) return;

    const svg = document.querySelector('#qr-code svg') as SVGElement;
    if (!svg) return;

    // Convertir SVG a canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();
    
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      
      // Descargar como PNG
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `itinerario-${savedData.shortId}.png`;
      a.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(data);
  };

  const shareUrl = savedData ? `${window.location.origin}/itinerary/${savedData.shortId}` : '';

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">
                {saved ? '¡Itinerario Guardado!' : 'Guardar Itinerario'}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Estado offline */}
            {!isOnline && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-center gap-2">
                <WifiOff className="w-4 h-4 text-amber-600" />
                <p className="text-sm text-amber-800">
                  Sin conexión - Se guardará localmente y sincronizará cuando vuelvas a estar online
                </p>
              </div>
            )}

            {!saved ? (
              <div className="space-y-4">
                {/* Título personalizable */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del itinerario
                  </label>
                  <input
                    type="text"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                    placeholder="Mi aventura por el Atlántico..."
                  />
                </div>

                {/* Opción de email */}
                <div className="space-y-3">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={wantsEmail}
                      onChange={(e) => setWantsEmail(e.target.checked)}
                      className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                    />
                    <span className="text-sm">
                      Guardar permanentemente con mi email (opcional)
                    </span>
                  </label>

                  {wantsEmail && (
                    <input
                      type="email"
                      value={userEmail}
                      onChange={(e) => setUserEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="tu@email.com"
                    />
                  )}
                </div>

                {/* Info sobre duración */}
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-800">
                    {wantsEmail && userEmail ? (
                      <>
                        <strong>Guardado permanente:</strong> Tu itinerario se guardará 
                        permanentemente y podrás acceder a él en cualquier momento.
                      </>
                    ) : (
                      <>
                        <strong>Guardado temporal:</strong> Tu itinerario se guardará por 
                        6 meses. Puedes agregar tu email para guardarlo permanentemente.
                      </>
                    )}
                  </p>
                </div>

                {/* Botón guardar */}
                <button
                  onClick={handleSave}
                  disabled={saving || (wantsEmail && !userEmail)}
                  className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-3 rounded-full font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      Guardar Itinerario
                    </>
                  )}
                </button>

                {error && (
                  <p className="text-sm text-red-600 text-center">{error}</p>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Success message */}
                <div className="flex items-center gap-3 text-green-600 bg-green-50 p-4 rounded-lg">
                  <Check className="w-6 h-6" />
                  <div>
                    <p className="font-semibold">¡Guardado exitosamente!</p>
                    <p className="text-sm text-green-700">
                      Código: <strong>{savedData?.shortId}</strong>
                    </p>
                  </div>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center gap-4">
                  <div id="qr-code" className="p-4 bg-white rounded-lg shadow-md">
                    <QRCode
                      value={shareUrl}
                      size={200}
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                  <button
                    onClick={handleDownloadQR}
                    className="text-sm text-gray-600 hover:text-gray-800 flex items-center gap-1"
                  >
                    <Download className="w-4 h-4" />
                    Descargar QR
                  </button>
                </div>

                {/* Share options */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 bg-transparent text-sm"
                    />
                    <button
                      onClick={handleCopyLink}
                      className="p-2 hover:bg-gray-200 rounded transition"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  <button
                    onClick={handleShare}
                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    Compartir Itinerario
                  </button>
                </div>

                {/* Info adicional */}
                <div className="text-sm text-gray-600 space-y-1">
                  <p>✓ Acceso sin crear cuenta</p>
                  <p>✓ Disponible offline una vez cargado</p>
                  <p>✓ {savedData?.expiresAt ? 'Válido por 6 meses' : 'Guardado permanentemente'}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}