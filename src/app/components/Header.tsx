'use client'

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsLoggedIn(!!session?.user);
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setIsLoggedIn(!!session?.user);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-100 shadow-md">
      <h1 className="text-xl font-bold cursor-pointer" onClick={() => router.push('/')}>
        Catálogo
      </h1>
      <div className="flex items-center gap-4">
        {isLoggedIn ? (
          <>
            <button onClick={() => router.push('/cart')} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Carrinho
            </button>
            <button onClick={handleLogout} className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded">
              Sair
            </button>
          </>
        ) : (
          <button onClick={() => router.push('/login')} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded">
            Entrar
          </button>
        )}
      </div>
    </header>
  );
}
