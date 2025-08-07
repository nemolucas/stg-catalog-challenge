'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';
import Link from 'next/link';

interface CartItem {
  id: string;
  quantity: number;
  products: {
    id: string;
    name: string;
    price: number;
  }; 
}

export default function CartPage() {
  const [user, setUser] = useState<User | null>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');

  useEffect(() => {
      const fetchCart = async () => {
        setLoading(true);
        const { data: sessionData } = await supabase.auth.getUser();
        const currentUser = sessionData?.user;

        if (!currentUser) {
          setLoading(false);
          return;
        }

        setUser(currentUser);

        const { data: items, error } = await supabase
          .from('cart_items')
          .select(`
            id,
            quantity,
            products (
              id,
              name,
              price
            )
          `)
          .eq('user_id', currentUser.id)
          .returns<CartItem[]>(); 

        if (error) {
          console.error('Erro ao buscar o carrinho:', error);
          setCartItems([]);
        } else {
          const validItems = items?.filter(item => item.products !== null) || [];
          setCartItems(validItems);
        }

        setLoading(false);
      };
    

    fetchCart();
  }, []);

  const calculateTotal = () => {
    return cartItems.reduce((sum, item) => {
      return sum + item.quantity * item.products.price;
    }, 0);
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      await removeItem(itemId);
      return;
    }

    const { error } = await supabase
      .from('cart_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId);

    if (!error) {
      setCartItems(prev =>
        prev.map(item =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    }
  };

  const removeItem = async (itemId: string) => {
    const { error } = await supabase
      .from('cart_items')
      .delete()
      .eq('id', itemId);

    if (!error) {
      setCartItems(prev => prev.filter(item => item.id !== itemId));
    }
  };

  if (loading) return <p className="p-4">Carregando...</p>;

  if (!user) {
    return (
      <div className="p-4">
        <h1 className="text-xl font-bold">Carrinho</h1>
        <p>
          Você precisa <Link href="/login" className="text-blue-600 underline">fazer login</Link> para ver seu carrinho.
        </p>
      </div>
    );
  }

return (
  <div className="p-6 bg-gray-100 min-h-screen">
    <h1 className="text-3xl font-bold mb-6 text-black border-b-4 border-teal-700 pb-2">
      Seu Carrinho
    </h1>

    {cartItems.length === 0 ? (
      <p className="text-black">Seu carrinho está vazio.</p>
    ) : (
      <ul className="space-y-6">
        {cartItems.map((item) => (
          <li
            key={item.id}
            className="relative bg-white border-4 border-teal-700 rounded-none shadow-[6px_6px_0_rgba(0,128,128,1)] p-6 text-black"
          >
            <button
              className="absolute top-3 right-3 text-red-600 hover:text-red-800 text-2xl font-bold cursor-pointer"
              onClick={() => removeItem(item.id)}
              aria-label="Remover item"
            >
              ✖
            </button>

            <h2 className="text-xl font-semibold mb-2">{item.products.name}</h2>
            <p>Quantidade: {item.quantity}</p>
            <p>Preço unitário: R$ {item.products.price.toFixed(2)}</p>
            <p className="font-bold mt-2">
              Subtotal: R$ {(item.quantity * item.products.price).toFixed(2)}
            </p>

            <div className="mt-4 flex justify-end items-center space-x-3">
              <button
                className="bg-teal-700 border-4 border-teal-900 text-white px-3 py-1 rounded-none shadow-[4px_4px_0_rgba(0,100,100,1)] hover:bg-teal-800 transition cursor-pointer"
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
              >
                ➖
              </button>
              <span className="font-mono text-lg">{item.quantity}</span>
              <button
                className="bg-teal-700 border-4 border-teal-900 text-white px-3 py-1 rounded-none shadow-[4px_4px_0_rgba(0,100,100,1)] hover:bg-teal-800 transition cursor-pointer"
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
              >
                ➕
              </button>
            </div>
          </li>
        ))}
      </ul>
    )}

    {cartItems.length > 0 && (
      <div className="mt-8">
        <div className="flex justify-between items-center mb-6 border-t-4 border-teal-700 pt-4">
          <span className="text-2xl font-bold text-black">
            Total: R$ {calculateTotal().toFixed(2)}
          </span>
          <button
            className="bg-green-700 border-4 border-green-900 text-white px-6 py-3 rounded-none shadow-[6px_6px_0_rgba(0,80,0,1)] hover:bg-green-800 transition cursor-pointer"
            onClick={() => setShowOrderForm(true)}
          >
            Fazer pedido
          </button>
        </div>

        {showOrderForm && (
          <div className="bg-white border-4 border-black p-6 rounded-none shadow-[6px_6px_0_rgba(0,0,0,1)] space-y-6 text-black">
            <div>
              <label className="block font-bold mb-2" htmlFor="customerName">
                Seu nome:
              </label>
              <input
                id="customerName"
                type="text"
                className="w-full p-3 border-4 border-teal-700 rounded-none bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 text-black font-mono"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
              />
            </div>

            <div>
              <label className="block font-bold mb-2" htmlFor="whatsappNumber">
                Número do WhatsApp (com DDD):
              </label>
              <input
                id="whatsappNumber"
                type="tel"
                placeholder="Ex: 81999999999"
                className="w-full p-3 border-4 border-teal-700 rounded-none bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 text-black font-mono"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
              />
            </div>

            <button
              disabled={!customerName || !whatsappNumber}
              onClick={() => {
                const orderLines = cartItems
                  .map(
                    (item) =>
                      `- ${item.products.name} - Qtd: ${item.quantity} - R$ ${(
                        item.products.price * item.quantity
                      ).toFixed(2)}`
                  )
                  .join('%0A')

                const message =
                  `👤 Cliente: ${customerName}` +
                  `📧 Email: ${user?.email || ''}` +
                  `📦 PRODUTOS: ${orderLines}` +
                  `💰 TOTAL: R$ ${calculateTotal().toFixed(2)}` +
                  `---Pedido via STG Catalog`

                const encodedMessage = encodeURIComponent(message)
                const whatsappLink = `https://wa.me/55${whatsappNumber}?text=${encodedMessage}`

                window.open(whatsappLink, '_blank')
              }}
              className={`w-full bg-blue-700 border-4 border-blue-900 text-white py-3 rounded-none shadow-[6px_6px_0_rgba(0,0,150,1)] transition ${
                customerName && whatsappNumber
                  ? 'hover:bg-blue-800 cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
            >
              Finalizar pedido
            </button>
          </div>
        )}
      </div>
    )}
  </div>
  );
}
