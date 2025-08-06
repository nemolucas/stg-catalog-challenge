'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
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
  const [user, setUser] = useState<any>(null);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const router = useRouter();

  useEffect(() => {
    const fetchCart = async () => {
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
        .eq('user_id', currentUser.id);

      if (error) {
        console.error('Erro ao buscar o carrinho:', error);
      } else {
        setCartItems(items || []);
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
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Seu Carrinho</h1>

      {cartItems.length === 0 ? (
        <p>Seu carrinho está vazio.</p>
      ) : (
        <ul className="space-y-4">
          {cartItems.map((item) => (
            <li key={item.id} className="border p-4 rounded-md shadow-sm relative bg-black text-white">
              {}
              <button
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xl"
                onClick={() => removeItem(item.id)}
              >
                ✖
              </button>

              {}
              <h2 className="text-lg font-semibold">{item.products.name}</h2>
              <p>Quantidade: {item.quantity}</p>
              <p>Preço unitário: R$ {item.products.price.toFixed(2)}</p>
              <p className="font-bold">Subtotal: R$ {(item.quantity * item.products.price).toFixed(2)}</p>

              <div className="mt-3 flex justify-end items-center space-x-2">
                <button
                  className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                >
                  ➖
                </button>
                <span>{item.quantity}</span>
                <button
                  className="bg-gray-700 text-white px-2 py-1 rounded hover:bg-gray-600"
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
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <span className="text-xl font-bold">
          Total: R$ {calculateTotal().toFixed(2)}
        </span>
        <button
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
          onClick={() => setShowOrderForm(true)}
        >
          Fazer pedido
        </button>
      </div>

    {showOrderForm && (
      <div className="bg-gray-100 p-4 rounded-md shadow-inner space-y-4 text-black">
        <div>
          <label className="block font-medium mb-1">Seu nome:</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
          />
        </div>

        <div>
          <label className="block font-medium mb-1">Número do WhatsApp (com DDD):</label>
          <input
            type="tel"
            className="w-full p-2 border rounded"
            placeholder="Ex: 81999999999"
            value={whatsappNumber}
            onChange={(e) => setWhatsappNumber(e.target.value)}
          />
        </div>

      <button
        className={`w-full bg-blue-600 text-white px-4 py-2 rounded transition ${
          customerName && whatsappNumber ? 'hover:bg-blue-700' : 'opacity-50 cursor-not-allowed'
        }`}
        disabled={!customerName || !whatsappNumber}
        onClick={() => {
          const orderLines = cartItems.map((item) =>
            `- ${item.products.name} - Qtd: ${item.quantity} - R$ ${(item.products.price * item.quantity).toFixed(2)}`
          ).join('%0A');

          const message =
            `👤 Cliente: ${customerName}` +
            `📧 Email: ${user?.email}` +
            `📦 PRODUTOS: ${orderLines}` +
            `💰 TOTAL: R$ ${calculateTotal().toFixed(2)}` +
            `---Pedido via STG Catalog`;

          const encodedMessage = encodeURIComponent(message);
          const whatsappLink = `https://wa.me/55${whatsappNumber}?text=${encodedMessage}`;
          
          window.open(whatsappLink, '_blank');
        }}
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
