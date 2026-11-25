import { openInstagramProfile } from '../lib/socialLinks';

const INSTAGRAM_USER = 'petitcakes.erikacarabajal';

export default function Footer() {
  const phoneDisplay = import.meta.env.VITE_WA_DISPLAY || '11 XXXX-XXXX';
  const phoneWa = import.meta.env.VITE_WA_PHONE || '54911XXXXXXXX';

  return (
    <footer className="bg-cream border-t border-borderSoft py-12 px-6 text-center text-cocoa">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
        {/* Izquierda: Marca con "by Erika Carabajal" en rosado delicado */}
        <div className="md:text-left">
          <h2 className="font-serif text-2xl tracking-wide text-cocoa">
            Petitcake&apos;s{' '}
            <span className="italic text-[#DE76A8] font-normal">
              by Erika Carabajal
            </span>
          </h2>
        </div>

        {/* Centro: Contactos */}
        <div className="flex flex-col items-center gap-2 text-sm">
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

        {/* Derecha: Dirección y abajo "Diseñado y desarrollado por Oestack" */}
        <div className="md:text-right flex flex-col items-center md:items-end gap-2.5">
          <p className="text-xs tracking-widest uppercase text-cocoaLight leading-relaxed">
            Rafael Castillo, La Matanza, Buenos Aires, Argentina
          </p>

          <a
            href="https://oestack.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-xs tracking-wide text-[#DE76A8]/85 hover:text-[#DE76A8] transition-colors duration-200 underline-offset-4 hover:underline"
          >
            Diseñado y desarrollado por Oestack
          </a>
        </div>
      </div>
    </footer>
  );
}