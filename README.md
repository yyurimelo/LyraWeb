# 💬 Chat Virtual

O Lyra Chat é um projeto desenvolvido com **Vite** no frontend e **.NET 8** no backend, aplicando boas práticas de organização, arquitetura escalável e ferramentas modernas para gerenciamento de estados, rotas e requisições.

## 🚀 Tecnologias Utilizadas

### Frontend

- ⚡ **Vite** — Build rápido e leve com Hot Module Replacement
- 🧭 **TanStack Router** — Roteamento moderno baseado em hooks com type-safety
- 🔄 **TanStack Query** — Gerenciamento de dados assíncronos (queries e mutations) com cache automático
- 🌐 **Axios** — Cliente HTTP para consumo da API
- 🎨 **shadcn/ui** — Componentes acessíveis e estilizados com Tailwind CSS
- 📝 **React Hook Form** — Manipulação de formulários performática
- ✅ **Zod** — Validação de dados com tipagem segura
- 🌍 **react-i18next** — Internacionalização com suporte a múltiplos idiomas
- 🎨 **next-themes** — Gerenciamento de temas (light/dark) com persistência
- 🔐 **Google OAuth** — Autenticação via Google
- ⚡ **SignalR** — Comunicação em tempo real

### Backend

- ⚙️ **.NET 8 com C#** — API robusta e performática
- 🗄️ **Entity Framework Core** — ORM para acesso a dados e mapeamento objeto-relacional
- 🐘 **Neon PostgreSQL** — Banco de dados PostgreSQL gerenciado e escalável
- 📦 **Supabase Storage** — Bucket para armazenamento de arquivos e mídias
- ⚡ **SignalR** — Comunicação em tempo real entre servidor e clientes
- 🏗️ **DDD (Domain-Driven Design)** — Arquitetura orientada ao domínio com separação de responsabilidades

## 🛠️ Boas Práticas

### Frontend
- ✅ **Organização de pastas clara** para escalabilidade
- ✅ **Componentização** para reaproveitamento e manutenção
- ✅ **Consumo de API centralizado** com Axios
- ✅ **Roteamento declarativo** com TanStack Router
- ✅ **Gerenciamento de dados assíncronos** com TanStack Query
- ✅ **UI acessível e consistente** com shadcn/ui
- ✅ **Formulários performáticos** com React Hook Form
- ✅ **Validação confiável** com Zod
- ✅ **Internacionalização** com react-i18next
- ✅ **Comunicação em tempo real** com SignalR
- ✅ **Autenticação OAuth** com Google

### Backend
- ✅ **Arquitetura DDD** com separação de camadas (Domain, Application, Infrastructure)
- ✅ **Entity Framework Core** para acesso a dados com migrations
- ✅ **Injeção de dependências** para baixo acoplamento
- ✅ **PostgreSQL com Neon** para banco de dados escalável
- ✅ **Supabase Storage** para armazenamento de arquivos
- ✅ **SignalR** para comunicação em tempo real
- ✅ **Clean Architecture** com separação de responsabilidades