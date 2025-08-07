'use client';

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
    <header className="bg-white border-b-4 border-black shadow-[4px_4px_0_rgba(0,0,0,1)]">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <h1
          className="text-2xl font-semibold text-gray-800 cursor-pointer hover:text-gray-600 transition"
          onClick={() => router.push('/')}
        >
          STG Catalog
        </h1>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <>
              <button
                onClick={() => router.push('/cart')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Carrinho
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-xl transition cursor-pointer"
              >
                Sair
              </button>
            </>
          ) : (
            <button
              onClick={() => router.push('/login')}
              className="bg-green-600 hover:bg-green-700 text-white font-medium px-4 py-2 rounded-xl transition cursor-pointer"
            >
              Entrar
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
