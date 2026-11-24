import { useEffect, useRef, useState } from 'react';
import { X, Share2, Download, Check } from 'lucide-react';
import { downloadQrPdf } from '../lib/qrPdf';

const QR_SRC = '/images/petitcakes-qr.png';
const SITE_URL = 'https://petitcakes.oestack.com';

export default function QrModal({ isOpen, onClose }) {
  const qrImgRef = useRef(null);
  const [copied, setCopied] = useState(false);
  const [savingPdf, setSavingPdf] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Petitcake's by Erika Carabajal",
          text: "Mirá el catálogo de Petitcake's by Erika Carabajal:",
          url: SITE_URL,
        });
        return;
      } catch {
        // Si el usuario cancela o falla navigator.share, copiamos el enlace
      }
    }

    try {
      await navigator.clipboard.writeText(SITE_URL);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  const handleSavePdf = async () => {
    try {
      setSavingPdf(true);
      await downloadQrPdf(qrImgRef.current);
    } finally {
      setSavingPdf(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-cocoa/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Código QR de Petitcake's"
    >
      <div
        className="relative bg-white border border-borderSoft rounded-3xl max-w-sm w-full p-6 shadow-xl text-center"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar código QR"
          className="absolute top-4 right-4 w-8 h-8 rounded-full text-cocoaLight hover:text-cocoa hover:bg-cream flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        <p className="text-[11px] uppercase tracking-[0.2em] text-roseSoft font-medium">
          Escaneá o compartí
        </p>
        <h3 className="font-serif text-3xl text-cocoa mt-1">Petitcake's</h3>
        <p className="text-xs text-cocoaLight mt-0.5 mb-5">
          by Erika Carabajal
        </p>

        <div className="bg-white border border-roseSoft/40 rounded-2xl p-4 mx-auto w-60 h-60 flex items-center justify-center shadow-xs">
          <img
            ref={qrImgRef}
            src={QR_SRC}
            alt="Código QR de Petitcake's"
            className="w-full h-full object-contain"
          />
        </div>

        <p className="text-xs text-cocoaLight mt-4 mb-5">
          {SITE_URL}
        </p>

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="py-2.5 px-3 bg-roseSoft hover:bg-roseHover text-white text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            <span>{copied ? 'Copiado' : 'Compartir'}</span>
          </button>

          <button
            type="button"
            onClick={handleSavePdf}
            disabled={savingPdf}
            className="py-2.5 px-3 bg-white hover:bg-cream disabled:opacity-60 text-cocoa border border-borderSoft text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition"
          >
            <Download className="w-4 h-4" />
            <span>{savingPdf ? 'Guardando...' : 'Guardar QR'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}