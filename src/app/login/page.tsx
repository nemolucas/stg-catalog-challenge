'use client'

import { useState } from 'react';
import { supabase } from '../../../lib/supabase';
import { useRouter} from 'next/navigation';

export default function LoginPage() {
    const router = useRouter()
        const [email, setEmail] = useState('')
        const [password, setPassword] = useState('')
        const [message, setMessage] = useState('')

        const handleLogin = async (e: React.FormEvent) => {
            e.preventDefault()

            if (!email || !password) {
                setMessage('Preencha todos os campos.')
                return
            }

            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            })

            if (error) {
                setMessage(error.message)
            }
                else {setMessage ('Login realizado com sucesso.')
                    router.push('/')
                }
            

        }
                const handleRedirect = () => {
                setTimeout(() => {
                router.push('/register');
                }, 1000);
            };

        return (
            <form onSubmit={handleLogin}>
                <h1>Login</h1>
                    <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}/>
                    <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)}/>
                    <button type="submit">Entrar</button>
                    
                    <button onClick={handleRedirect}>Ir para Registro</button>
                    <p>{message}</p>
            </form>
            )
}