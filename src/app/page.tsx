'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

 interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  category: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingLogin, setCheckingLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
  const checkLoginStatus = async () => {
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      setIsLoggedIn(true);
      setUserId(user.id); // <-- ESSENCIAL
    } else {
      setIsLoggedIn(false);
      setUserId(null);
    }

    setCheckingLogin(false);
  };

  checkLoginStatus();
}, []);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        setError(error.message);
      } else {
        setProducts(data as Product[]);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = async (productId: string) => {
    if (!userId) return;

      const { data: existing, error } = await supabase
        .from('cart_items')
        .select('*')
        .eq('user_id', userId)
        .eq('product_id', productId)
        .single();

        if (existing) {
          await supabase
            .from('cart_items')
            .update({ quantity: existing.quantity +1 })
            .eq('id', existing.id);
        } else {
            await supabase.from('cart_items').insert([
              {
                user_id: userId,
                product_id: productId,
                quantity: 1,
              },
            ]);
          }

        setShowModal(true);
        setTimeout(() => setShowModal(false), 2500);
  };

    if (checkingLogin) {
      return <p className="p-4">Verificando login...</p>;
    }

  return (
    <main className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Catálogo</h1>
        <div className="space-x-2">

        </div>
      </div>

      {error && <p className="text-red-500 mb-4">Erro: {error}</p>}

      <ul className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <li key={product.id} className="border p-2 rounded shadow">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-32 object-cover mb-2 rounded"
            />
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-500">{product.category}</p>
            <p className="text-green-600 font-bold">
              R$ {Number(product.price).toFixed(2)}
            </p>

            <button
              className="mt-2 bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 transition"
              onClick={() => {
                if (!isLoggedIn) {
                  router.push('/login');
                } else {
                  handleAddToCart(product.id);
                }
              }}
            >
              🛒 Adicionar ao carrinho
            </button>
          </li>
        ))}
      </ul>

              {showModal && (
        <div className="fixed bottom-4 right-4 bg-black text-white px-4 py-2 rounded shadow-lg animate-fade-in-out z-50">
          ✅ Item adicionado ao carrinho!
        </div>
      )}
    </main>
  )}

