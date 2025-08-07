# Sistema completo de e-commerce com autenticação e integração WhatsApp para o teste técnico da STG Soluções Digitais


## 🚀 Tecnologias utilizadas

- **Next.js**
- **React**
- **TailwindCSS**
- **PostgreSQL** (via Supabase)
- **Supabase** (auth + banco de dados + API)
- **Vercel** (deploy automático)

---

## 🧠 IA utilizada

Este projeto foi desenvolvido com auxílio da **IA ChatGPT (GPT-4o)** para:
- Solução de erros e conflitos de configuração.
- Geração de estilos personalizados (neobrutalism).
- Refatoração de código para boas práticas.
---

## ⚙️ Como rodar localmente

1. Clone o repositório:
    ```bash
        git clone https://github.com/nemolucas/stg-catalog-challenge

2. Instale as dependências:
    ```bash
        npm install

3. 🔐 Configurar Supabase
    - Crie um projeto no Supabase

    - Copie a URL do projeto e a chave anon do Supabase

    - Cole no .env.local assim:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
    NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx

4. ▶️ Rodando o projeto
    ```bash
        npm run dev

5. Acesse em http://localhost:3000

## ✅ Checklist de funcionalidades
✅ Autenticação via Supabase

✅ CRUD de produtos no carrinho de compras

✅ Estilização com TailwindCSS

✅ Estética neobrutalista aplicada (bordas, contornos, fundo)

✅ Deploy contínuo com Vercel

✅ Proteção de rotas (Um usuário autenticado não consegue ir para a página de login nem registro)

✅ Finalização de pedido com mensagem para o Whatsapp

# 🔗 Links Úteis
- [Projeto no Vercel](https://stg-catalog-challenge-theta.vercel.app)
- [Supabase](https://supabase.com)



## ✍️ Autor
Desenvolvido por [Lucas Nunes Ribeiro](https://github.com/nemolucas)