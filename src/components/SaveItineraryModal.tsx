// src/components/SaveItineraryModal.tsx
"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Save, 
  Share2, 
  Copy, 
  Check, 
  X, 
  Loader2, 
  Wifi, 
  WifiOff,
  QrCode,
  Mail,
  Clock,
  Eye
} from 'lucide-react';
import { useItineraryStorage } from '@/utils/itinerary-storage';
import QRCode from 'qrcode';
import type { Stop } from '@/components/ItineraryStopCard';

interface SaveItineraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  days: number;
  answers: any;
  itinerary: Stop[];
  locationData?: any;
}

export default function SaveItineraryModal({
  isOpen,
  onClose,
  days,
  answers,
  itinerary,
  locationData
}: SaveItineraryModalProps) {
  const { saveItinerary, saving, error, isOnline } = useItineraryStorage();
  const [shareUrl, setShareUrl] = useState('');
  const [shortId, setShortId] = useState('');
  const [copied, setCopied] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [savedSuccessfully, setSavedSuccessfully] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const handleSave = async () => {
    try {
      const result = await saveItinerary(days, answers, itinerary, locationData);
      setShareUrl(result.shareUrl);
      setShortId(result.shortId);
      setSavedSuccessfully(true);
      
      // Generar código QR
      const qr = await QRCode.toDataURL(result.shareUrl, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCodeUrl(qr);
      
      // Guardar en el historial del navegador
      if (typeof window !== 'undefined') {
        window.history.replaceState(
          { itinerary: true },
          '',
          `/itinerary/${result.shortId}`
        );
      }
    } catch (err) {
      console.error('Error guardando:', err);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Error copiando:', err);
    }
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Mi itinerario en Atlántico',
          text: `Mira mi plan de viaje de ${days} día${days > 1 ? 's' : ''} por el Atlántico`,
          url: shareUrl
        });
      } catch (err) {
        console.error('Error compartiendo:', err);
      }
    }
  };

  const handleSendEmail = async () => {
    if (!answers.email) return;
    
    setSendingEmail(true);
    try {
      // Aquí implementarías el envío de email con tu API
      const response = await fetch('/api/send-itinerary-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: answers.email,
          itineraryUrl: shareUrl,
          shortId,
          days
        })
      });
      
      if (response.ok) {
        alert('¡Email enviado exitosamente!');
      }
    } catch (err) {
      console.error('Error enviando email:', err);
    } finally {
      setSendingEmail(false);
    }
  };

  useEffect(() => {
    if (isOpen && !savedSuccessfully) {
      handleSave();
    }
  }, [isOpen]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setSavedSuccessfully(false);
      setShareUrl('');
      setShortId('');
      setQrCodeUrl('');
      setCopied(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">
                {savedSuccessfully ? '¡Itinerario Guardado!' : 'Guardando Itinerario...'}
              </h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Estado de conexión */}
            <div className={`flex items-center gap-2 mb-4 text-sm ${
              isOnline ? 'text-green-600' : 'text-amber-600'
            }`}>
              {isOnline ? (
                <>
                  <Wifi className="w-4 h-4" />
                  <span>Guardado en la nube</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4" />
                  <span>Guardado localmente (se sincronizará cuando vuelva la conexión)</span>
                </>
              )}
            </div>

            {/* Contenido */}
            {saving ? (
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 text-red-600 animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Guardando tu aventura...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <X className="w-6 h-6 text-red-600" />
                </div>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reintentar
                </button>
              </div>
            ) : savedSuccessfully && (
              <div className="space-y-6">
                {/* Código QR */}
                {qrCodeUrl && (
                  <div className="text-center">
                    <img src={qrCodeUrl} alt="QR Code" className="mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Escanea para acceder desde cualquier dispositivo
                    </p>
                  </div>
                )}

                {/* URL para compartir */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Link de tu itinerario:
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={shareUrl}
                      readOnly
                      className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg text-sm"
                    />
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleCopyLink}
                      className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      {copied ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </motion.button>
                  </div>
                </div>

                {/* Características */}
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Check className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Acceso sin cuenta</p>
                      <p className="text-sm text-gray-600">
                        No necesitas crear una cuenta para ver tu itinerario
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <WifiOff className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Disponible offline</p>
                      <p className="text-sm text-gray-600">
                        Una vez cargado, funciona sin conexión a internet
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Clock className="w-4 h-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Guardado por {answers.email ? 'tiempo ilimitado' : '6 meses'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {answers.email 
                          ? 'Tu itinerario se guardará permanentemente'
                          : 'Los itinerarios anónimos se eliminan después de 6 meses'
                        }
                      </p>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="space-y-3">
                  {navigator.share && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={handleShareNative}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                    >
                      <Share2 className="w-5 h-5" />
                      Compartir itinerario
                    </motion.button>
                  )}
                  
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.open(shareUrl, '_blank')}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                  >
                    <Eye className="w-5 h-5" />
                    Ver itinerario
                  </motion.button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}