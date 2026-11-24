import { openInstagramProfile } from '../lib/socialLinks';

const INSTAGRAM_USER = 'petitcakes.erikacarabajal';

export default function Footer() {
  const phoneDisplay = import.meta.env.VITE_WA_DISPLAY || '11 XXXX-XXXX';
  const phoneWa = import.meta.env.VITE_WA_PHONE || '54911XXXXXXXX';

  return (
    <footer className="bg-cream border-t border-borderSoft py-12 px-4 text-center text-cocoa">
      <div className="max-w-4xl mx-auto space-y-3">
        <h2 className="font-serif text-2xl tracking-wide">
          Petitcake's by Erika Carabajal
        </h2>
        <p className="text-xs tracking-widest uppercase text-cocoaLight">
          Rafael Castillo, La Matanza, Buenos Aires, Argentina
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm">
          <a
            href={`https://wa.me/${phoneWa}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cocoa hover:text-roseSoft transition border-b border-transparent hover:border-roseSoft pb-0.5"
          >
            WhatsApp: {phoneDisplay}
          </a>

          <a
            href={`https://www.instagram.com/${INSTAGRAM_USER}/`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => openInstagramProfile(e, INSTAGRAM_USER)}
            className="text-cocoa hover:text-roseSoft transition border-b border-transparent hover:border-roseSoft pb-0.5"
          >
            @{INSTAGRAM_USER}
          </a>

          <a
            href="https://www.facebook.com/PetitCakedeErikaCarabajal/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cocoa hover:text-roseSoft transition border-b border-transparent hover:border-roseSoft pb-0.5"
          >
            fb: PetitCakes
          </a>
        </div>
      </div>
    </footer>
  );
}