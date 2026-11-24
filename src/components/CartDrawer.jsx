import { useEffect, useState } from 'react';
import { X, Trash2 } from 'lucide-react';
import { useCart } from '../context/useCart';

export default function CartDrawer() {
  const { cart, removeItem, total, sendWhatsAppOrder, isOpen, setIsOpen } = useCart();
  const [clientName, setClientName] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, setIsOpen]);

  if (!isOpen) return null;

  return (
    <div
      onClick={() => setIsOpen(false)}
      className="fixed inset-0 z-50 flex justify-end bg-cocoa/30 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="Carrito de láminas comestibles"
        className="w-full max-w-md bg-cream h-full flex flex-col justify-between border-l border-borderSoft shadow-xl"
      >
        <div className="p-5 border-b border-borderSoft flex items-center justify-between">
          <h3 className="font-serif text-2xl text-cocoa">Tu Pedido de Láminas</h3>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Cerrar carrito (Escape)"
            className="text-cocoaLight hover:text-cocoa"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {cart.length === 0 ? (
            <p className="text-sm text-cocoaLight text-center py-10">Aún no agregaste láminas a tu pedido.</p>
          ) : (
            cart.map((item) => (
              <div key={item.cartId} className="bg-white p-3.5 rounded-xl border border-borderSoft flex justify-between gap-3">
                <div>
                  <p className="font-serif text-lg text-cocoa leading-tight">
                    {item.title} <span className="text-xs font-sans text-roseSoft">x{item.quantity}</span>
                  </p>
                  {item.isCustom ? (
                    <p className="text-xs text-cocoaLight mt-1">
                      {item.description} · <strong>{item.size} cm</strong>
                    </p>
                  ) : (
                    <p className="text-xs text-cocoaLight">{item.categoryName}</p>
                  )}
                  <p className="text-sm font-medium text-cocoa mt-1">${item.price * item.quantity}</p>
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.cartId)}
                  aria-label={`Quitar ${item.title}`}
                  className="text-cocoaLight hover:text-roseSoft self-start"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 border-t border-borderSoft bg-blush/50 space-y-3">
            <input
              type="text"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              placeholder="Tu nombre (opcional)"
              className="w-full bg-white border border-borderSoft rounded-lg px-3 py-2 text-sm"
            />
            <div className="flex justify-between text-base font-medium text-cocoa">
              <span>Total estimado:</span>
              <span>${total}</span>
            </div>
            <button
              type="button"
              onClick={() => sendWhatsAppOrder(clientName)}
              className="w-full py-3 bg-roseSoft hover:bg-roseHover text-white text-xs uppercase tracking-widest rounded-lg transition"
            >
              Hacer pedido por WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
