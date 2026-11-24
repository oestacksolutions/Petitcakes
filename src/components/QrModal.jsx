import { useEffect, useRef, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { X, Share2, Download, Check } from 'lucide-react';

export default function QrModal({ isOpen, onClose }) {
  const [copied, setCopied] = useState(false);
  const qrWrapperRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const siteUrl = window.location.origin;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Petitcake's by Erika Carabajal",
          text: "Mirá el catálogo de láminas comestibles y tortas artesanales de Petitcake's:",
          url: siteUrl,
        });
        return;
      } catch {
        return;
      }
    }

    await navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const canvas = qrWrapperRef.current?.querySelector('canvas');
    if (!canvas) return;
    const pngUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = pngUrl;
    link.download = 'petitcakes-qr.png';
    link.click();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa/40 backdrop-blur-xs px-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Código QR de Petitcake's"
        className="bg-cream border border-borderSoft rounded-2xl p-6 w-full max-w-sm text-center shadow-xl relative"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar (Escape)"
          className="absolute top-4 right-4 text-cocoaLight hover:text-cocoa transition"
        >
          <X className="w-5 h-5" />
        </button>

        <span className="text-[11px] uppercase tracking-[0.2em] text-roseSoft">
          Escaneá o compartí
        </span>
        <h3 className="font-serif text-2xl text-cocoa mt-1">Petitcake's</h3>
        <p className="text-xs text-cocoaLight mb-5">by Erika Carabajal</p>

        <div
          ref={qrWrapperRef}
          className="inline-block bg-white p-4 rounded-2xl border border-borderSoft shadow-xs"
        >
          <QRCodeCanvas
            value={siteUrl}
            size={200}
            bgColor="#FFFFFF"
            fgColor="#4A3F35"
            level="M"
          />
        </div>

        <p className="text-[11px] text-cocoaLight mt-3 truncate px-2">{siteUrl}</p>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-roseSoft hover:bg-roseHover text-white text-xs uppercase tracking-wider rounded-lg transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied ? 'Copiado' : 'Compartir'}
          </button>

          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-white border border-borderSoft hover:border-roseSoft text-cocoa text-xs uppercase tracking-wider rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Guardar QR
          </button>
        </div>
      </div>
    </div>
  );
}
