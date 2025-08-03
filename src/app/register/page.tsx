'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../../lib/supabase'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter() // ✅ Declaração do router

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação simples
    if (!email || !password) {
      setMessage('Preencha todos os campos.')
      return
    }

    // Chama a API do Supabase
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('Cadastro realizado. Confirme seu e-mail. Redirecionando para login...')

      // Espera 2 segundos e vai para o login
      setTimeout(() => {
        router.push('/login')
      }, 2000)
    }
  }

  return (
    <form onSubmit={handleRegister}>
      <h1>Registro</h1>

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Registrar</button>

      {message && <p>{message}</p>}
    </form>
  )
}

