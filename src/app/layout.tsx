import './globals.css'
import { ReactNode } from 'react'
import Header from './components/Header' // esse é client, tudo certo importar aqui

export const metadata = {
  title: 'Catálogo de Produtos',
  description: 'Projeto com Supabase + Next.js',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <Header />
        <main className="p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
