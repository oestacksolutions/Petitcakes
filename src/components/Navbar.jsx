import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, QrCode } from 'lucide-react';
import { useCart } from '../context/useCart';
import QrModal from './QrModal';

export default function Navbar() {
  const { cart, setIsOpen } = useCart();
  const [qrOpen, setQrOpen] = useState(false);
  const count = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <>
      <header className="sticky top-0 z-40 bg-cream/90 backdrop-blur border-b border-borderSoft">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <a href="/" className="font-serif text-2xl font-semibold text-cocoa tracking-wide">
            Petitcake's <span className="text-sm font-normal italic text-roseSoft">by Erika Carabajal</span>
          </a>

          <nav className="hidden md:flex items-center gap-6 text-xs uppercase tracking-widest text-cocoa">
            <a href="#laminas" className="hover:text-roseSoft transition">Láminas Comestibles</a>
            <a href="#tortas" className="hover:text-roseSoft transition">Tortas</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setQrOpen(true)}
              className="flex items-center gap-1.5 text-xs uppercase tracking-wider px-3 py-1.5 border border-borderSoft rounded-full text-cocoa hover:border-roseSoft hover:text-roseSoft transition"
              aria-label="Mostrar código QR"
            >
              <QrCode className="w-3.5 h-3.5" />
              <span>QR</span>
            </button>

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-cocoa hover:text-roseSoft transition"
              aria-label="Ver carrito"
            >
              <ShoppingBag className="w-5 h-5" />
              {count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-roseSoft text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </button>

            <Link
              to="/login"
              className="text-xs uppercase tracking-wider px-3.5 py-1.5 border border-borderSoft rounded-full text-cocoaLight hover:border-roseSoft hover:text-roseSoft transition"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <QrModal isOpen={qrOpen} onClose={() => setQrOpen(false)} />
    </>
  );
}