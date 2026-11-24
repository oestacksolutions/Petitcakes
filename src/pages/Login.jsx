import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (authError) {
      setError('Correo o contraseña incorrectos');
      return;
    }
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-blush/50 flex items-center justify-center px-4">
      <div className="bg-white border border-borderSoft rounded-2xl p-8 w-full max-w-md shadow-sm">
        <h1 className="font-serif text-3xl text-cocoa text-center">Panel Administrador</h1>
        <p className="text-xs text-cocoaLight text-center mt-1 mb-6">Petitcake's by Erika Carabajal</p>

        {error && <p className="text-xs text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            required
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-cream border border-borderSoft rounded-lg p-3 text-sm focus:outline-none focus:border-roseSoft"
          />
          <input
            type="password"
            required
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-cream border border-borderSoft rounded-lg p-3 text-sm focus:outline-none focus:border-roseSoft"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-roseSoft hover:bg-roseHover text-white text-xs uppercase tracking-widest rounded-lg transition"
          >
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
}
