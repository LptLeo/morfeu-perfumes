# Elixir n°7 — Landing Page + Admin Panel

> **Decants de perfumes árabes, contratipos e importados** — Landing page pública + painel administrativo completo.

---

## 📦 Stack

| Camada | Tecnologia |
|--------|------------|
| **Framework** | React 18 + TypeScript (strict) |
| **Build** | Vite 5 |
| **Estilos** | SCSS Modules + CSS Variables (design tokens) |
| **Backend / DB** | Firebase (Firestore + Auth) |
| **Deploy** | Firebase Hosting (recomendado) / qualquer static hosting |
| **Roteamento** | History API custom (sem react-router) |

---

## 🚀 Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env.local
# editar .env.local com credenciais do Firebase

# 3. Rodar dev server
npm run dev
```

### Variáveis de ambiente (` .env.local`)

```bash
# Firebase Web App (credenciais públicas)
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef

# Admin emails (allowlist para login no painel)
VITE_ADMIN_EMAILS=admin1@exemplo.com,admin2@exemplo.com
```

> ⚠️ **Segurança**: A `apiKey` do Firebase é pública por design. A proteção dos dados é feita **exclusivamente pelas Firestore Security Rules**. Segredos reais **nunca** usam prefixo `VITE_*`.

---

## 📁 Estrutura do Projeto

```
src/
├── admin/                 # Painel administrativo (rotas /admin/*)
│   ├── pages/             # Telas do admin
│   │   ├── AdminDashboard.tsx
│   │   ├── AdminProducts.tsx
│   │   ├── AdminTexts.tsx
│   │   ├── LoginPage.tsx
│   │   └── ProductForm.tsx
│   ├── productsService.ts # CRUD produtos (Firestore)
│   ├── textsService.ts    # CRUD textos do site (Firestore)
│   ├── auth.ts            # Firebase Auth + allowlist
│   ├── router.ts          # History API router
│   └── AdminApp.tsx       # Shell + route guards
├── components/            # Componentes da landing
│   ├── Catalog/           # Catálogo + filtros + cards
│   ├── Hero/              # Seção hero
│   ├── WhyDecants/        # Benefícios
│   ├── HowItWorks/        # Passos + trust items
│   ├── Testimonials/      # Depoimentos
│   ├── Faq/               # Perguntas frequentes
│   ├── CtaFinal/          # Call-to-action final
│   ├── Footer/            # Rodapé
│   ├── Header/            # Cabeçalho
│   ├── FloatingWhatsApp/  # Botão flutuante WhatsApp
│   └── ui/                # Componentes base (Button, SectionHeading)
├── context/
│   └── SiteTextsContext.tsx  # Provider + real-time listener
├── lib/
│   ├── firebase.ts        # Inicialização Firebase (lazy)
│   └── productsRepository.ts # Read-only products (landing)
├── types/
│   └── store.ts           # Types compartilhados (Product, StoreData, etc)
├── utils/
│   └── whatsapp.ts        # buildWhatsAppUrl, buildProductMessage
├── data/
│   └── storeData.json     # Fallback estático (seed)
├── styles/
│   ├── _variables.scss    # Design tokens (cores, spacing, radius)
│   ├── _mixins.scss       # Mixins SCSS
│   └── global.scss        # Reset + variáveis CSS globais
├── App.tsx                # Landing page composition
├── main.tsx               # Entry point
└── vite-env.d.ts          # Tipos Vite
```

---

## 🎯 Arquitetura Resumida

### Landing Page (Público)

1. **App.tsx** compõe as seções em ordem: `Header → Hero → WhyDecants → Catalog → HowItWorks → Testimonials → Faq → CtaFinal → Footer → FloatingWhatsApp`
2. **SiteTextsProvider** (context) carrega textos do Firestore em tempo real (`onSnapshot`)
3. **Catalog** busca produtos do Firestore via `productsRepository.listProducts()`
4. **ProductCard** permite seleção múltipla de tamanhos e gera link WhatsApp personalizado

### Admin Panel (`/admin/*`)

1. **AdminApp** = shell com **guarda de rota assíncrona** baseada em `onAuthStateChanged`
2. **Autenticação**: Firebase Auth (email/senha + Google) + allowlist `VITE_ADMIN_EMAILS`
3. **Autorização real**: Firestore Security Rules (`isAdmin()`)
4. **Roteamento**: `router.ts` (History API) — leve, sem dependências
5. **CRUD Produtos**: `productsService.ts` (create/read/update/delete + import)
6. **CRUD Textos**: `textsService.ts` (single doc `site_texts/content` + real-time)

---

## 🔐 Segurança

| Camada | Responsabilidade |
|--------|------------------|
| **Frontend (UX)** | `VITE_ADMIN_EMAILS` — rejeita rápido contas fora da lista |
| **Backend (Real)** | `firestore.rules` — `isAdmin()` valida `request.auth.token.email` |
| **Escrita** | Requer `request.auth != null && request.auth.token.email_verified == true` |
| **Leitura pública** | Produtos e textos: `allow read: if true` |

---

## 📚 Documentação Adicional

| Documento | Descrição |
|-----------|-----------|
| [DATA_MODELS.md](DATA_MODELS.md) | Tipos TypeScript, interfaces Firestore, exemplos de JSON |
| [ADMIN_PANEL.md](ADMIN_PANEL.md) | Guia completo do painel: rotas, autenticação, CRUD, validações |
| [WHATSAPP_INTEGRATION.md](WHATSAPP_INTEGRATION.md) | Geração de URLs/mensagens, personalização, testes |
| [DEVELOPMENT.md](DEVELOPMENT.md) | Comandos, linting, debugging, adicionando seções/componentes |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Build, Firebase Hosting, variáveis de produção, troubleshooting |

---

## 🧪 Testes Manuais Rápidos

```bash
# Build de produção
npm run build

# Preview local do build
npm run preview

# Verificar tipos (TypeScript strict)
npx tsc --noEmit
```

---

## 📄 Licença

Proprietário — Elixir n°7. Uso interno apenas.