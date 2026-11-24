import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import FlowerAccent from './FlowerAccent';
import ImageLightboxModal from './ImageLightboxModal';

export default function TortasSection({ tortas }) {
  const [selectedId, setSelectedId] = useState(null);
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  const currentIndex = Math.max(
    0,
    tortas.findIndex((t) => t.id === selectedId)
  );
  const selectedTorta = tortas[currentIndex] || null;

  const goPrev = () => {
    if (tortas.length <= 1) return;
    const prevIdx = (currentIndex - 1 + tortas.length) % tortas.length;
    setSelectedId(tortas[prevIdx].id);
  };

  const goNext = () => {
    if (tortas.length <= 1) return;
    const nextIdx = (currentIndex + 1) % tortas.length;
    setSelectedId(tortas[nextIdx].id);
  };

  useEffect(() => {
    if (tortas.length <= 1) return;
    const onKeyDown = (e) => {
      if (previewImage) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const handleSendWhatsApp = (e) => {
    e.preventDefault();
    const phone = import.meta.env.VITE_WA_PHONE || '5491157403377';
    let msg = `Hola Erika! Me gustaría consultar/pedir una *Torta* en Petitcake's:\n\n`;
    if (selectedTorta) msg += `• *Referencia visual:* ${selectedTorta.title}\n`;
    msg += `• *Descripción del pedido:* ${description}\n`;
    msg += `• *Medida / Porciones:* ${size}\n`;

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const openTortaPreview = (torta) => {
    setPreviewImage({
      src: torta.image_url,
      title: torta.title,
      subtitle: torta.description || 'Pastelería Artesanal',
    });
  };

  return (
    <section id="tortas" className="relative py-16 px-4 bg-blush/50 border-t border-borderSoft">
      <FlowerAccent className="w-36 h-36 opacity-[0.07] absolute top-4 right-4 rotate-45" />

      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10">
          <span className="text-xs uppercase tracking-[0.2em] text-roseSoft font-medium">
            Pastelería Artesanal
          </span>
          <h2 className="font-serif text-4xl text-cocoa mt-2">Nuestras Tortas</h2>
          <div className="w-16 h-[1px] bg-roseSoft/50 mx-auto mt-4"></div>
        </div>

        {selectedTorta && (
          <div className="mb-12">
            <div className="max-w-2xl mx-auto bg-white border border-borderSoft rounded-2xl p-6 md:p-8 shadow-sm relative">
              <div className="aspect-[4/3] overflow-hidden rounded-xl bg-cream relative">
                <button
                  type="button"
                  onClick={() => openTortaPreview(selectedTorta)}
                  aria-label={`Ver ${selectedTorta.title} completa`}
                  className="block w-full h-full cursor-zoom-in group"
                >
                  <img
                    src={selectedTorta.image_url}
                    alt={selectedTorta.title}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                </button>

                {tortas.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={goPrev}
                      aria-label="Torta anterior"
                      className="absolute left-3 top-1/2 -translate-y-1/2 bg-cream/90 hover:bg-white text-cocoa p-2 rounded-full border border-borderSoft shadow-xs transition z-10"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={goNext}
                      aria-label="Torta siguiente"
                      className="absolute right-3 top-1/2 -translate-y-1/2 bg-cream/90 hover:bg-white text-cocoa p-2 rounded-full border border-borderSoft shadow-xs transition z-10"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
              <div className="pt-4 text-center">
                <h3
                  onClick={() => openTortaPreview(selectedTorta)}
                  className="font-serif text-2xl text-cocoa cursor-pointer hover:text-roseSoft transition"
                >
                  {selectedTorta.title}
                </h3>
                {selectedTorta.description && (
                  <p className="text-xs text-cocoaLight mt-1">{selectedTorta.description}</p>
                )}
              </div>
            </div>

            <div className="flex gap-3 overflow-x-auto py-4 px-2 justify-start md:justify-center mt-4">
              {tortas.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  aria-label={`Ver ${t.title}`}
                  className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition ${
                    selectedTorta.id === t.id
                      ? 'border-roseSoft scale-105'
                      : 'border-transparent opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={t.image_url} alt={t.title} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-white border border-borderSoft rounded-2xl p-6 md:p-8 max-w-2xl mx-auto shadow-sm">
          <h3 className="font-serif text-2xl text-cocoa text-center mb-4">
            Pedí tu torta personalizada
          </h3>
          <form onSubmit={handleSendWhatsApp} className="space-y-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
                Descripción (sabores, relleno, temática, fecha)
              </label>
              <textarea
                required
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Bizcochuelo de vainilla con dulce de leche y crema Oreo..."
                className="w-full bg-cream border border-borderSoft rounded-lg p-3 text-sm text-cocoa"
              />
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
                Medida aproximada (diámetro en cm, peso o cantidad de personas)
              </label>
              <input
                type="text"
                required
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="Ej: 20 cm de diámetro / Para 25 personas"
                className="w-full bg-cream border border-borderSoft rounded-lg p-2.5 text-sm text-cocoa"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-roseSoft hover:bg-roseHover text-white text-sm tracking-wider uppercase rounded-lg transition"
            >
              Enviar consulta por WhatsApp
            </button>
          </form>
        </div>
      </div>

      <ImageLightboxModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </section>
  );
}