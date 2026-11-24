import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import Navbar from '../components/Navbar';
import LaminasSection from '../components/LaminasSection';
import TortasSection from '../components/TortasSection';
import Footer from '../components/Footer';
import CartDrawer from '../components/CartDrawer';
import FlowerAccent from '../components/FlowerAccent';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [laminas, setLaminas] = useState([]);
  const [tortas, setTortas] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      const { data: cats } = await supabase
        .from('categories')
        .select('*')
        .eq('active', true)
        .order('name');

      const activeCatIds = (cats || []).map((c) => c.id);

      const { data: lams } = activeCatIds.length
        ? await supabase
            .from('laminas')
            .select('*, categories(name)')
            .eq('active', true)
            .in('category_id', activeCatIds)
            .order('created_at', { ascending: false })
        : { data: [] };

      const { data: tors } = await supabase
        .from('tortas')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false });

      setCategories(cats || []);
      setLaminas(lams || []);
      setTortas(tors || []);
    };

    loadData();
  }, []);

  return (
    <div className="min-h-screen flex flex-col justify-between relative overflow-x-hidden">
      <Navbar />
      <CartDrawer />

      <section className="relative py-16 px-4 text-center bg-blush/40 border-b border-borderSoft overflow-hidden">
        <FlowerAccent className="w-40 h-40 opacity-[0.08] absolute -top-6 -left-6" />
        <FlowerAccent className="w-32 h-32 opacity-[0.08] absolute -bottom-6 right-4 rotate-12" />

        <p className="text-xs uppercase tracking-[0.25em] text-roseSoft mb-2">
          Pastelería & Láminas Comestibles
        </p>
        <h1 className="font-serif text-5xl md:text-6xl text-cocoa">
          Petitcake's
        </h1>
        <p className="font-serif italic text-xl text-cocoaLight mt-1">
          by Erika Carabajal
        </p>
      </section>

      <main className="flex-1">
        <LaminasSection categories={categories} laminas={laminas} />
        <TortasSection tortas={tortas} />
      </main>

      <Footer />
    </div>
  );
}
