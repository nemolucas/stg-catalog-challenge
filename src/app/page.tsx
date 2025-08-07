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
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [showModal, setShowModal] = useState(false);
  const [modalProduct, setModalProduct] = useState<Product | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkLoginStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setIsLoggedIn(true);
        setUserId(user.id);
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

  const uniqueCategories = ['Todos', ...Array.from(new Set(products.map(p => p.category)))];

  const handleAddToCart = async (productId: string) => {
    if (!userId) return;

    const { data: existing } = await supabase
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (existing) {
      await supabase
        .from('cart_items')
        .update({ quantity: existing.quantity + 1 })
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

  const openProductModal = (product: Product) => {
    setModalProduct(product);
  };

  const closeProductModal = () => {
    setModalProduct(null);
  };

  if (checkingLogin) {
    return <p className="p-4 text-center text-gray-600">Verificando login...</p>;
  }

  return (
    <main className="p-6 bg-gray-100 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <h1 className="text-3xl font-semibold text-black tracking-tight font-sans">
        Catálogo de Produtos
      </h1>

      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="border-4 border-black rounded-none p-2 bg-white text-black shadow-[4px_4px_0_rgba(0,0,0,1)]"
      >
        {uniqueCategories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>

      {error && <p className="text-red-600 mb-4">{error}</p>}

      <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
       {products
  .filter((product) =>
    selectedCategory === 'Todos' ? true : product.category === selectedCategory
  )
  .map((product) => (

      <li
        key={product.id}
        className="bg-white border-4 border-black rounded-none shadow-[6px_6px_0_rgba(0,0,0,1)] cursor-pointer flex flex-col p-4"
        onClick={() => openProductModal(product)}
      >
        <img
          src={product.image_url}
          alt={product.name}
          className="w-full h-48 object-cover rounded-none mb-3 border-4 border-black"
        />
        <h2 className="font-semibold text-lg text-gray-900">{product.name}</h2>
        <p className="text-sm text-gray-500 mb-1">{product.category}</p>
        <p className="text-teal-600 font-bold text-lg mb-4">
          R$ {Number(product.price).toFixed(2)}
        </p>

        <button
          className="mt-auto bg-teal-600 text-white py-2 rounded hover:bg-teal-700 transition"
          onClick={(e) => {
            e.stopPropagation();
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
        <div className="fixed bottom-4 right-4 bg-teal-600 text-white px-4 py-2 rounded shadow-lg animate-fade-in-out z-50">
          ✅ Item adicionado ao carrinho!
        </div>
      )}

    {modalProduct && (
      <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
        <div className="relative bg-white p-6 rounded-md w-11/12 max-w-lg text-black shadow-xl overflow-hidden pointer-events-auto">
          <button
            className="absolute top-2 right-2 text-red-600 text-2xl font-bold hover:text-red-800 z-20"
            onClick={closeProductModal}
          >
            ✖
          </button>

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundSize: '100% 100%',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              opacity: 0.1,
            }}
          />

          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">{modalProduct.name}</h2>
            <p className="text-sm text-gray-700 italic mb-2">{modalProduct.category}</p>
            <p className="text-lg font-semibold text-teal-700 mb-4">
              R$ {modalProduct.price.toFixed(2)}
            </p>
            <p className="text-gray-800">{modalProduct.description}</p>
          </div>
        </div>
      </div>
    )}
    </main>
  );
}
