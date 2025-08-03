'use client';

import { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*');

      if (error) {
        setError(error.message);
      } else {
        setProducts(data);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-bold mb-4">Catálogo</h1>

      {error && <p>Erro: {error}</p>}

      <ul className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <li key={product.id} className="border p-2">
            <img
              src={product.image_url}
              alt={product.name}
              className="w-full h-32 object-cover mb-2"
            />
            <h2 className="font-semibold">{product.name}</h2>
            <p className="text-sm text-gray-500">{product.category}</p>
            <p className="text-green-600 font-bold">
              R$ {Number(product.price).toFixed(2)}
            </p>
          </li>
        ))}
      </ul>

      <button
        className="mt-6 bg-blue-600 text-white px-4 py-2 rounded"
        onClick={() => router.push('/login')}
      >
        Ir para Login
      </button>
    </main>
  );
}
