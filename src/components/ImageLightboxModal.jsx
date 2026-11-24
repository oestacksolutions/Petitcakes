import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function ImageLightboxModal({ image, onClose }) {
  useEffect(() => {
    if (!image) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [image, onClose]);

  if (!image) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-cocoa/80 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={image.title || 'Vista completa'}
    >
      <div
        className="relative bg-white border border-borderSoft rounded-2xl max-w-2xl w-full p-4 sm:p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar vista previa"
          className="absolute top-3 right-3 w-9 h-9 rounded-full bg-cream border border-borderSoft text-cocoa hover:border-roseSoft hover:text-roseSoft flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="bg-cream rounded-xl flex items-center justify-center overflow-hidden p-2">
          <img
            src={image.src}
            alt={image.title || 'Imagen ampliada'}
            className="max-h-[70vh] w-auto max-w-full object-contain rounded-lg"
          />
        </div>

        {(image.title || image.subtitle || image.price != null) && (
          <div className="mt-4 flex items-center justify-between gap-4 px-1">
            <div>
              {image.subtitle && (
                <p className="text-[11px] uppercase tracking-wider text-roseSoft">
                  {image.subtitle}
                </p>
              )}
              {image.title && (
                <h3 className="font-serif text-xl text-cocoa">{image.title}</h3>
              )}
            </div>
            {image.price != null && (
              <span className="text-base font-medium text-cocoa">${image.price}</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}