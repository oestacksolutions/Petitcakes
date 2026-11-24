import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminPanel() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('laminas');
  const [categories, setCategories] = useState([]);
  const [laminas, setLaminas] = useState([]);
  const [tortas, setTortas] = useState([]);
  const [reloadKey, setReloadKey] = useState(0);
  const [saving, setSaving] = useState(false);

  // Crear categoría + modal editar categoría
  const [catName, setCatName] = useState('');
  const [editingCat, setEditingCat] = useState(null);
  const [editCatName, setEditCatName] = useState('');

  // Crear lámina + modal editar lámina
  const [lamForm, setLamForm] = useState({ title: '', category_id: '', price: 4500, file: null });
  const [editingLam, setEditingLam] = useState(null);
  const [editLamForm, setEditLamForm] = useState({ title: '', category_id: '', price: 4500, file: null });

  // Crear torta + modal editar torta
  const [tortaForm, setTortaForm] = useState({ title: '', description: '', file: null });
  const [editingTorta, setEditingTorta] = useState(null);
  const [editTortaForm, setEditTortaForm] = useState({ title: '', description: '', file: null });

  const hasOpenModal = Boolean(editingCat || editingLam || editingTorta);

  const closeAllModals = () => {
    if (saving) return;
    setEditingCat(null);
    setEditingLam(null);
    setEditingTorta(null);
  };

  useEffect(() => {
    if (!hasOpenModal) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') closeAllModals();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login');
        return;
      }

      const [catsRes, lamsRes, torsRes] = await Promise.all([
        supabase.from('categories').select('*').order('created_at', { ascending: false }),
        supabase.from('laminas').select('*, categories(name)').order('created_at', { ascending: false }),
        supabase.from('tortas').select('*').order('created_at', { ascending: false })
      ]);

      if (cancelled) return;
      setCategories(catsRes.data || []);
      setLaminas(lamsRes.data || []);
      setTortas(torsRes.data || []);
    };

    init();
    return () => { cancelled = true; };
  }, [navigate, reloadKey]);

  const refresh = () => setReloadKey((k) => k + 1);

  const uploadImage = async (file, folder) => {
    const ext = file.name.split('.').pop();
    const filePath = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from('petitcakes').upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from('petitcakes').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const deleteStorageImage = async (publicUrl) => {
    if (!publicUrl || !publicUrl.includes('/storage/v1/object/public/petitcakes/')) return;
    const path = publicUrl.split('/storage/v1/object/public/petitcakes/')[1];
    if (path) {
      await supabase.storage.from('petitcakes').remove([decodeURIComponent(path)]);
    }
  };

  // --- CATEGORÍAS ---
  const createCategory = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      await supabase.from('categories').insert([{ name: catName.trim() }]);
      setCatName('');
      refresh();
    } finally {
      setSaving(false);
    }
  };

  const openEditCategory = (cat) => {
    setEditingCat(cat);
    setEditCatName(cat.name);
  };

  const updateCategory = async (e) => {
    e.preventDefault();
    if (saving || !editingCat) return;
    setSaving(true);
    try {
      await supabase.from('categories').update({ name: editCatName.trim() }).eq('id', editingCat.id);
      setEditingCat(null);
      refresh();
    } finally {
      setSaving(false);
    }
  };

  const toggleCategory = async (cat) => {
    await supabase.from('categories').update({ active: !cat.active }).eq('id', cat.id);
    refresh();
  };

  const deleteCategory = async (cat) => {
    if (!window.confirm(`¿Eliminar la categoría "${cat.name}" y todas sus láminas asociadas?`)) return;
    await supabase.from('categories').delete().eq('id', cat.id);
    refresh();
  };

  // --- LÁMINAS ---
  const createLamina = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const image_url = lamForm.file ? await uploadImage(lamForm.file, 'laminas') : null;
      await supabase.from('laminas').insert([{
        title: lamForm.title.trim(),
        category_id: lamForm.category_id,
        price: Number(lamForm.price),
        image_url
      }]);
      setLamForm({ title: '', category_id: '', price: 4500, file: null });
      e.target.reset();
      refresh();
    } catch (err) {
      console.error(err);
      alert('No se pudo subir la lámina. Revisá la consola o los permisos del bucket petitcakes.');
    } finally {
      setSaving(false);
    }
  };

  const openEditLamina = (lam) => {
    setEditingLam(lam);
    setEditLamForm({
      title: lam.title,
      category_id: lam.category_id,
      price: lam.price ?? 4500,
      file: null
    });
  };

  const updateLamina = async (e) => {
    e.preventDefault();
    if (saving || !editingLam) return;
    setSaving(true);
    try {
      let image_url = editingLam.image_url;
      if (editLamForm.file) {
        if (editingLam.image_url) await deleteStorageImage(editingLam.image_url);
        image_url = await uploadImage(editLamForm.file, 'laminas');
      }

      await supabase.from('laminas').update({
        title: editLamForm.title.trim(),
        category_id: editLamForm.category_id,
        price: Number(editLamForm.price),
        image_url
      }).eq('id', editingLam.id);

      setEditingLam(null);
      refresh();
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar la lámina.');
    } finally {
      setSaving(false);
    }
  };

  const toggleLamina = async (lam) => {
    await supabase.from('laminas').update({ active: !lam.active }).eq('id', lam.id);
    refresh();
  };

  const deleteLamina = async (lam) => {
    if (!window.confirm(`¿Eliminar definitivamente la lámina "${lam.title}"?`)) return;
    await deleteStorageImage(lam.image_url);
    await supabase.from('laminas').delete().eq('id', lam.id);
    refresh();
  };

  // --- TORTAS ---
  const createTorta = async (e) => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const image_url = tortaForm.file ? await uploadImage(tortaForm.file, 'tortas') : null;
      await supabase.from('tortas').insert([{
        title: tortaForm.title.trim(),
        description: tortaForm.description.trim(),
        image_url
      }]);
      setTortaForm({ title: '', description: '', file: null });
      e.target.reset();
      refresh();
    } catch (err) {
      console.error(err);
      alert('No se pudo guardar la torta. Revisá la consola o los permisos del bucket petitcakes.');
    } finally {
      setSaving(false);
    }
  };

  const openEditTorta = (t) => {
    setEditingTorta(t);
    setEditTortaForm({
      title: t.title,
      description: t.description || '',
      file: null
    });
  };

  const updateTorta = async (e) => {
    e.preventDefault();
    if (saving || !editingTorta) return;
    setSaving(true);
    try {
      let image_url = editingTorta.image_url;
      if (editTortaForm.file) {
        if (editingTorta.image_url) await deleteStorageImage(editingTorta.image_url);
        image_url = await uploadImage(editTortaForm.file, 'tortas');
      }

      await supabase.from('tortas').update({
        title: editTortaForm.title.trim(),
        description: editTortaForm.description.trim(),
        image_url
      }).eq('id', editingTorta.id);

      setEditingTorta(null);
      refresh();
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar la torta.');
    } finally {
      setSaving(false);
    }
  };

  const toggleTorta = async (t) => {
    await supabase.from('tortas').update({ active: !t.active }).eq('id', t.id);
    refresh();
  };

  const deleteTorta = async (t) => {
    if (!window.confirm(`¿Eliminar definitivamente la torta "${t.title}"?`)) return;
    await deleteStorageImage(t.image_url);
    await supabase.from('tortas').delete().eq('id', t.id);
    refresh();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-cream p-4 md:p-8 max-w-6xl mx-auto">
      <div className="flex flex-wrap justify-between items-center border-b border-borderSoft pb-4 mb-6 gap-4">
        <h1 className="font-serif text-3xl text-cocoa">Administración · Petitcake's</h1>
        <div className="flex gap-3">
          <button type="button" onClick={() => navigate('/')} className="text-xs px-4 py-2 border border-borderSoft rounded-lg">
            Ver Web
          </button>
          <button type="button" onClick={handleLogout} className="text-xs px-4 py-2 bg-cocoa text-white rounded-lg">
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-8">
        {['laminas', 'categorias', 'tortas'].map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-xs uppercase tracking-wider border ${
              tab === t ? 'bg-roseSoft text-white border-roseSoft' : 'bg-white text-cocoa border-borderSoft'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'categorias' && (
        <div className="space-y-6">
          <form onSubmit={createCategory} className="flex gap-3 max-w-md">
            <input
              type="text"
              required
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              placeholder="Nueva categoría (ej: Fútbol)"
              className="flex-1 bg-white border border-borderSoft rounded-lg px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-roseSoft text-white text-xs uppercase rounded-lg disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Crear'}
            </button>
          </form>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat.id} className="bg-white p-4 rounded-xl border border-borderSoft flex justify-between items-center gap-2">
                <span className={!cat.active ? 'line-through text-cocoaLight' : 'font-medium'}>{cat.name}</span>
                <div className="flex gap-2.5 text-xs">
                  <button type="button" onClick={() => openEditCategory(cat)} className="text-roseSoft hover:underline">
                    Editar
                  </button>
                  <button type="button" onClick={() => toggleCategory(cat)} className="text-cocoaLight underline">
                    {cat.active ? 'Desactivar' : 'Activar'}
                  </button>
                  <button type="button" onClick={() => deleteCategory(cat)} className="text-red-500 hover:underline">
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'laminas' && (
        <div className="space-y-8">
          <form onSubmit={createLamina} className="bg-white p-6 rounded-2xl border border-borderSoft grid md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs mb-1">Título</label>
              <input
                type="text"
                required
                value={lamForm.title}
                onChange={(e) => setLamForm({ ...lamForm, title: e.target.value })}
                className="w-full border border-borderSoft rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Categoría</label>
              <select
                required
                value={lamForm.category_id}
                onChange={(e) => setLamForm({ ...lamForm, category_id: e.target.value })}
                className="w-full border border-borderSoft rounded-lg p-2 text-sm bg-white"
              >
                <option value="">Seleccionar...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs mb-1">Precio ($)</label>
              <input
                type="number"
                required
                value={lamForm.price}
                onChange={(e) => setLamForm({ ...lamForm, price: e.target.value })}
                className="w-full border border-borderSoft rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Imagen</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setLamForm({ ...lamForm, file: e.target.files[0] })}
                className="w-full text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="md:col-span-4 py-2.5 bg-roseSoft text-white text-xs uppercase tracking-wider rounded-lg disabled:opacity-50"
            >
              {saving ? 'Subiendo...' : 'Subir Lámina'}
            </button>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {laminas.map((lam) => (
              <div key={lam.id} className={`bg-white border border-borderSoft rounded-xl overflow-hidden ${!lam.active && 'opacity-50'}`}>
                <img src={lam.image_url} alt={lam.title} className="w-full aspect-square object-cover" />
                <div className="p-3">
                  <p className="text-xs text-roseSoft">{lam.categories?.name}</p>
                  <h4 className="font-serif text-lg">{lam.title}</h4>
                  <p className="text-xs text-cocoaLight mb-3">${lam.price}</p>
                  <div className="flex flex-wrap justify-between gap-2 text-xs border-t border-borderSoft pt-2">
                    <button type="button" onClick={() => openEditLamina(lam)} className="text-roseSoft hover:underline">
                      Editar
                    </button>
                    <button type="button" onClick={() => toggleLamina(lam)} className="text-cocoaLight underline">
                      {lam.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button type="button" onClick={() => deleteLamina(lam)} className="text-red-500 hover:underline">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'tortas' && (
        <div className="space-y-8">
          <form onSubmit={createTorta} className="bg-white p-6 rounded-2xl border border-borderSoft grid md:grid-cols-3 gap-4 items-end">
            <div>
              <label className="block text-xs mb-1">Título de la torta</label>
              <input
                type="text"
                required
                value={tortaForm.title}
                onChange={(e) => setTortaForm({ ...tortaForm, title: e.target.value })}
                className="w-full border border-borderSoft rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Descripción breve</label>
              <input
                type="text"
                value={tortaForm.description}
                onChange={(e) => setTortaForm({ ...tortaForm, description: e.target.value })}
                className="w-full border border-borderSoft rounded-lg p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs mb-1">Foto</label>
              <input
                type="file"
                accept="image/*"
                required
                onChange={(e) => setTortaForm({ ...tortaForm, file: e.target.files[0] })}
                className="w-full text-xs"
              />
            </div>
            <button
              type="submit"
              disabled={saving}
              className="md:col-span-3 py-2.5 bg-roseSoft text-white text-xs uppercase tracking-wider rounded-lg disabled:opacity-50"
            >
              {saving ? 'Subiendo...' : 'Agregar Torta a Galería'}
            </button>
          </form>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tortas.map((t) => (
              <div key={t.id} className={`bg-white border border-borderSoft rounded-xl overflow-hidden ${!t.active && 'opacity-50'}`}>
                <img src={t.image_url} alt={t.title} className="w-full aspect-square object-cover" />
                <div className="p-3">
                  <h4 className="font-serif text-lg">{t.title}</h4>
                  <p className="text-xs text-cocoaLight mb-3 truncate">{t.description}</p>
                  <div className="flex flex-wrap justify-between gap-2 text-xs border-t border-borderSoft pt-2">
                    <button type="button" onClick={() => openEditTorta(t)} className="text-roseSoft hover:underline">
                      Editar
                    </button>
                    <button type="button" onClick={() => toggleTorta(t)} className="text-cocoaLight underline">
                      {t.active ? 'Desactivar' : 'Activar'}
                    </button>
                    <button type="button" onClick={() => deleteTorta(t)} className="text-red-500 hover:underline">
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL EDITAR LÁMINA */}
      {editingLam && (
        <div
          onClick={closeAllModals}
          className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa/40 backdrop-blur-xs px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Editar lámina"
            className="bg-cream border border-borderSoft rounded-2xl p-6 w-full max-w-md shadow-xl relative"
          >
            <button
              type="button"
              onClick={closeAllModals}
              aria-label="Cerrar modal"
              className="absolute top-4 right-4 text-cocoaLight hover:text-cocoa"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl text-cocoa mb-4">Editar Lámina</h3>

            {editingLam.image_url && (
              <img
                src={editingLam.image_url}
                alt={editingLam.title}
                className="w-24 h-24 object-cover rounded-xl border border-borderSoft mb-4"
              />
            )}

            <form onSubmit={updateLamina} className="space-y-3">
              <div>
                <label className="block text-xs mb-1">Título</label>
                <input
                  type="text"
                  required
                  value={editLamForm.title}
                  onChange={(e) => setEditLamForm({ ...editLamForm, title: e.target.value })}
                  className="w-full bg-white border border-borderSoft rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs mb-1">Categoría</label>
                <select
                  required
                  value={editLamForm.category_id}
                  onChange={(e) => setEditLamForm({ ...editLamForm, category_id: e.target.value })}
                  className="w-full bg-white border border-borderSoft rounded-lg p-2 text-sm"
                >
                  <option value="">Seleccionar...</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs mb-1">Precio ($)</label>
                <input
                  type="number"
                  required
                  value={editLamForm.price}
                  onChange={(e) => setEditLamForm({ ...editLamForm, price: e.target.value })}
                  className="w-full bg-white border border-borderSoft rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs mb-1">Reemplazar imagen (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditLamForm({ ...editLamForm, file: e.target.files[0] })}
                  className="w-full text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="px-4 py-2 text-xs border border-borderSoft rounded-lg bg-white text-cocoa"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs uppercase tracking-wider bg-roseSoft text-white rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR TORTA */}
      {editingTorta && (
        <div
          onClick={closeAllModals}
          className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa/40 backdrop-blur-xs px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Editar torta"
            className="bg-cream border border-borderSoft rounded-2xl p-6 w-full max-w-md shadow-xl relative"
          >
            <button
              type="button"
              onClick={closeAllModals}
              aria-label="Cerrar modal"
              className="absolute top-4 right-4 text-cocoaLight hover:text-cocoa"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl text-cocoa mb-4">Editar Torta</h3>

            {editingTorta.image_url && (
              <img
                src={editingTorta.image_url}
                alt={editingTorta.title}
                className="w-24 h-24 object-cover rounded-xl border border-borderSoft mb-4"
              />
            )}

            <form onSubmit={updateTorta} className="space-y-3">
              <div>
                <label className="block text-xs mb-1">Título de la torta</label>
                <input
                  type="text"
                  required
                  value={editTortaForm.title}
                  onChange={(e) => setEditTortaForm({ ...editTortaForm, title: e.target.value })}
                  className="w-full bg-white border border-borderSoft rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs mb-1">Descripción breve</label>
                <input
                  type="text"
                  value={editTortaForm.description}
                  onChange={(e) => setEditTortaForm({ ...editTortaForm, description: e.target.value })}
                  className="w-full bg-white border border-borderSoft rounded-lg p-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs mb-1">Reemplazar foto (opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setEditTortaForm({ ...editTortaForm, file: e.target.files[0] })}
                  className="w-full text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="px-4 py-2 text-xs border border-borderSoft rounded-lg bg-white text-cocoa"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs uppercase tracking-wider bg-roseSoft text-white rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL EDITAR CATEGORÍA */}
      {editingCat && (
        <div
          onClick={closeAllModals}
          className="fixed inset-0 z-50 flex items-center justify-center bg-cocoa/40 backdrop-blur-xs px-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Editar categoría"
            className="bg-cream border border-borderSoft rounded-2xl p-6 w-full max-w-sm shadow-xl relative"
          >
            <button
              type="button"
              onClick={closeAllModals}
              aria-label="Cerrar modal"
              className="absolute top-4 right-4 text-cocoaLight hover:text-cocoa"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-serif text-2xl text-cocoa mb-4">Editar Categoría</h3>

            <form onSubmit={updateCategory} className="space-y-3">
              <div>
                <label className="block text-xs mb-1">Nombre</label>
                <input
                  type="text"
                  required
                  value={editCatName}
                  onChange={(e) => setEditCatName(e.target.value)}
                  className="w-full bg-white border border-borderSoft rounded-lg p-2 text-sm"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeAllModals}
                  className="px-4 py-2 text-xs border border-borderSoft rounded-lg bg-white text-cocoa"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 text-xs uppercase tracking-wider bg-roseSoft text-white rounded-lg disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
