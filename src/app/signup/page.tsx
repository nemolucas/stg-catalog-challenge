'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [checkingSession, setCheckingSession] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        router.replace('/') 
      } else {
        setCheckingSession(false)
      }
    }
    checkSession()
  }, [router])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email || !password) {
      setMessage('Preencha todos os campos.')
      return
    }

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Cadastro realizado. Confirme seu e-mail. Redirecionando para login...')
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <p>Verificando sessão...</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleRegister}
      className="max-w-md mx-auto mt-20 bg-white border-4 border-black shadow-[6px_6px_0_#000] p-6 rounded-lg space-y-4"
    >
      <h1 className="text-2xl font-bold text-center text-black">Registro</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-2 border-2 border-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-black"
      />

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition cursor-pointer"
      >
        Cadastrar
      </button>

      {message && (
        <p className="text-sm text-center text-zinc-700 animate-fade-in-out">
          {message}
        </p>
      )}
    </form>
  )
}
