import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function QrModal({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-cocoa/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Código QR de Petitcake's"
    >
      <div
        className="relative bg-cream border border-borderSoft rounded-2xl max-w-sm w-full p-5 sm:p-6 shadow-xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar código QR"
          className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white border border-borderSoft text-cocoa hover:border-roseSoft hover:text-roseSoft flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        <p className="text-[11px] uppercase tracking-[0.2em] text-roseSoft font-medium">
          Escaneá y pedí
        </p>
        <h3 className="font-serif text-2xl text-cocoa mt-1">Petitcake's</h3>
        <p className="font-serif italic text-sm text-cocoaLight mb-4">
          by Erika Carabajal
        </p>

        <div className="bg-white border border-roseSoft/40 rounded-2xl p-4 inline-block shadow-xs">
          <img
            src="/images/petitcakes-qr-card.png"
            alt="Código QR de Petitcake's by Erika Carabajal"
            className="w-60 h-60 object-contain rounded-xl mx-auto"
          />
        </div>

        <p className="text-xs text-cocoaLight mt-4">
          petitcakes.oestack.com
        </p>
      </div>
    </div>
  );
}