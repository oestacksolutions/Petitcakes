import { useEffect, useMemo, useState } from 'react';
import { useCart } from '../context/useCart';
import ImageLightboxModal from './ImageLightboxModal';

const normalizeText = (str) =>
  String(str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLowerCase();

const hasAccents = (str) => /[áéíóúüñÁÉÍÓÚÜÑ]/.test(String(str || ''));

export default function LaminasSection({ categories, laminas }) {
  const { addItem } = useCart();
  const [selectedSlug, setSelectedSlug] = useState('');
  const [customDesc, setCustomDesc] = useState('');
  const [customSize, setCustomSize] = useState('');
  const [previewImage, setPreviewImage] = useState(null);

  // Unificar categorías equivalentes (ej: "Futbol" + "Fútbol") en una sola pestaña
  const groupedCategories = useMemo(() => {
    const map = new Map();

    for (const cat of categories || []) {
      const slug = normalizeText(cat.name);
      if (!slug) continue;

      if (!map.has(slug)) {
        map.set(slug, {
          slug,
          name: cat.name,
          ids: [String(cat.id)],
        });
      } else {
        const existing = map.get(slug);
        existing.ids.push(String(cat.id));
        if (!hasAccents(existing.name) && hasAccents(cat.name)) {
          existing.name = cat.name;
        }
      }
    }

    return Array.from(map.values());
  }, [categories]);

  useEffect(() => {
    if (!groupedCategories.length) {
      setSelectedSlug('');
      return;
    }
    const exists = groupedCategories.some((c) => c.slug === selectedSlug);
    if (!exists) {
      setSelectedSlug(groupedCategories[0].slug);
    }
  }, [groupedCategories, selectedSlug]);

  const activeGroup = useMemo(
    () => groupedCategories.find((c) => c.slug === selectedSlug) || null,
    [groupedCategories, selectedSlug]
  );

  const filteredLaminas = useMemo(() => {
    if (!activeGroup) return [];
    const seen = new Set();
    return (laminas || []).filter((lam) => {
      if (!activeGroup.ids.includes(String(lam.category_id))) return false;
      const key = `${normalizeText(lam.title)}::${String(lam.image_url || '').trim()}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [laminas, activeGroup]);

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customDesc.trim() || !customSize.trim()) return;

    addItem({
      cartId: `custom-${Date.now()}`,
      title: 'Lámina Personalizada',
      description: customDesc.trim(),
      size: customSize.trim(),
      price: 4500,
      quantity: 1,
      isCustom: true,
    });

    setCustomDesc('');
    setCustomSize('');
  };

  const openLaminaPreview = (lam, categoryLabel) => {
    setPreviewImage({
      src: lam.image_url,
      title: lam.title,
      subtitle: categoryLabel,
      price: lam.price,
    });
  };

  return (
    <section id="laminas" className="py-16 px-4 max-w-6xl mx-auto">
      <div className="text-center mb-10">
        <span className="text-xs uppercase tracking-[0.2em] text-roseSoft font-medium">
          Catálogo
        </span>
        <h2 className="font-serif text-4xl text-cocoa mt-2">Láminas Comestibles</h2>
        <div className="w-16 h-[1px] bg-roseSoft/50 mx-auto mt-4"></div>
      </div>

      <div className="flex flex-wrap justify-center gap-2 mb-10">
        {groupedCategories.map((cat) => (
          <button
            key={cat.slug}
            type="button"
            onClick={() => setSelectedSlug(cat.slug)}
            className={`px-4 py-2 rounded-full text-xs uppercase tracking-wider border transition ${
              selectedSlug === cat.slug
                ? 'bg-roseSoft text-white border-roseSoft'
                : 'bg-white text-cocoa border-borderSoft hover:border-roseSoft'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-14">
        {filteredLaminas.map((lam) => {
          const categoryLabel = activeGroup?.name || lam.categories?.name || 'Lámina';
          return (
            <article
              key={lam.id}
              className="bg-white border border-borderSoft rounded-2xl p-4 shadow-sm flex flex-col justify-between transition hover:border-roseSoft/60"
            >
              <div>
                <button
                  type="button"
                  onClick={() => openLaminaPreview(lam, categoryLabel)}
                  aria-label={`Ver ${lam.title} completa`}
                  className="block w-full aspect-square overflow-hidden rounded-xl bg-cream mb-3 cursor-zoom-in group"
                >
                  <img
                    src={lam.image_url}
                    alt={lam.title}
                    className="w-full h-full object-cover transition duration-300 group-hover:scale-[1.02]"
                  />
                </button>
                <p className="text-[11px] uppercase tracking-wider text-roseSoft">
                  {categoryLabel}
                </p>
                <h3
                  onClick={() => openLaminaPreview(lam, categoryLabel)}
                  className="font-serif text-xl text-cocoa mt-0.5 leading-snug cursor-pointer hover:text-roseSoft transition"
                >
                  {lam.title}
                </h3>
              </div>

              <div className="mt-4 pt-3 border-t border-borderSoft flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-cocoa">${lam.price}</span>
                <button
                  type="button"
                  onClick={() =>
                    addItem({
                      cartId: `lam-${lam.id}`,
                      id: lam.id,
                      title: lam.title,
                      categoryName: categoryLabel,
                      price: lam.price,
                      quantity: 1,
                      isCustom: false,
                    })
                  }
                  className="px-3 py-1.5 bg-roseSoft hover:bg-roseHover text-white text-[11px] uppercase tracking-wider rounded-lg transition"
                >
                  Agregar
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <div className="bg-white border border-borderSoft rounded-2xl p-6 md:p-8 max-w-2xl mx-auto shadow-sm">
        <h3 className="font-serif text-2xl text-cocoa text-center mb-4">
          ¿Buscás una lámina personalizada?
        </h3>
        <form onSubmit={handleAddCustom} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
              Descripción del diseño
            </label>
            <textarea
              required
              rows="2"
              value={customDesc}
              onChange={(e) => setCustomDesc(e.target.value)}
              placeholder="Ej: Temática infantil con nombre, edad o imagen que vas a enviar por WhatsApp..."
              className="w-full bg-cream border border-borderSoft rounded-lg p-3 text-sm text-cocoa"
            />
          </div>

          <div>
            <label className="block text-xs uppercase tracking-wider text-cocoa mb-1">
              Medida (ancho x alto en cm)
            </label>
            <input
              type="text"
              required
              value={customSize}
              onChange={(e) => setCustomSize(e.target.value)}
              placeholder="Ej: 20 x 28 cm o 20 cm diámetro"
              className="w-full bg-cream border border-borderSoft rounded-lg p-2.5 text-sm text-cocoa"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-roseSoft hover:bg-roseHover text-white text-sm tracking-wider uppercase rounded-lg transition"
          >
            Agregar lámina personalizada al pedido
          </button>
        </form>
      </div>

      <ImageLightboxModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />
    </section>
  );
}